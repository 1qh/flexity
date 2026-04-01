/** biome-ignore-all lint/a11y/noStaticElementInteractions: dev-only click handler on layout div */
/** biome-ignore-all lint/a11y/noNoninteractiveElementInteractions: dev-only click handler on layout div */
/** biome-ignore-all lint/a11y/noSvgWithoutTitle: decorative grip icon */
/** biome-ignore-all lint/a11y/useSemanticElements: resize separator */
/** biome-ignore-all lint/a11y/useAriaPropsForRole: resize handles */
/** biome-ignore-all lint/nursery/useGlobalThis: window event listeners */
/** biome-ignore-all lint/nursery/noInlineStyles: dynamic layout styles required */
/** biome-ignore-all lint/correctness/useExhaustiveDependencies: intentional dep control */
/* eslint-disable complexity, react-hooks/exhaustive-deps, @eslint-react/no-unnecessary-use-callback */
/* oxlint-disable react-perf/jsx-no-new-object-as-prop, react-perf/jsx-no-new-array-as-prop, jsx-a11y/no-static-element-interactions */
'use client'
import type { Announcements, DragEndEvent } from '@dnd-kit/core'
import type { CSSProperties, ReactElement } from 'react'
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import {
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { createContext, use, useCallback, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import type { Store } from './store'
import type { AllowedContent, GridConfig, GridProps, WidgetLayoutEntry } from './types'
import { cn } from './cn'
import { WidgetDevPanelContent } from './panel'
import { clearConfig, loadConfig, saveConfig } from './storage'
import { isDev, validateClassName, validateConfig, validateDom, validateNoNestedGrid } from './validation'
const GridContext = createContext(false)
interface GridItemInnerProps {
  content: AllowedContent
  devMode: boolean
  dragHandle?: string
  isDevPanelOpen: boolean
  itemKey: string
  layout: undefined | WidgetLayoutEntry
  onCssClick: (key: string, rect: DOMRect) => void
  onResizeStop: (key: string, updates: ResizeUpdates) => void
  showDebugBg: boolean
  showDebugRings: boolean
  snap: number
  strict: boolean
}
interface ResizeState {
  direction: 'e' | 's' | 'se'
  startH: number
  startW: number
  startX: number
  startY: number
}
interface ResizeUpdates {
  h?: number
  w?: number
}
const GridItemInner = ({
  itemKey,
  content,
  layout,
  snap,
  strict,
  onCssClick,
  onResizeStop,
  dragHandle,
  isDevPanelOpen,
  showDebugRings,
  showDebugBg,
  devMode
}: GridItemInnerProps) => {
  const contentRef = useRef<HTMLDivElement>(null),
    outerRef = useRef<HTMLDivElement>(null),
    [resizeState, setResizeState] = useState<null | ResizeState>(null),
    { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id: itemKey
    }),
    combinedRef = useCallback(
      (node: HTMLDivElement | null) => {
        setNodeRef(node)
        outerRef.current = node
      },
      [setNodeRef]
    ),
    w = layout?.w,
    h = layout?.h,
    isHidden = layout?.hidden === true,
    userClassName = layout?.className
  useEffect(() => {
    if (!(dragHandle && outerRef.current)) return
    const handle = outerRef.current.querySelector(dragHandle)
    if (!handle) return
    const controller = new AbortController(),
      originalStyle = handle.getAttribute('style') ?? ''
    if (listeners)
      for (const [event, handler] of Object.entries(listeners))
        handle.addEventListener(event, handler as EventListener, { signal: controller.signal })
    for (const [attr, value] of Object.entries(attributes)) handle.setAttribute(attr, String(value))
    handle.setAttribute('style', `${originalStyle}; cursor: grab;`)
    return () => {
      controller.abort()
      handle.setAttribute('style', originalStyle)
    }
  }, [dragHandle, listeners, attributes])
  useEffect(() => {
    if (!(devMode && contentRef.current)) return
    validateDom(itemKey, contentRef.current, strict)
  }, [itemKey, content, strict, devMode])
  useEffect(() => {
    if (!(devMode && userClassName)) return
    validateClassName(itemKey, userClassName, strict)
  }, [itemKey, userClassName, strict, devMode])
  useEffect(() => {
    if (!(resizeState && outerRef.current)) return
    const el = outerRef.current
    const measureMinH = () => {
      const saved = el.style.height
      el.style.height = 'auto'
      const natural = el.getBoundingClientRect().height
      el.style.height = saved
      return natural
    }
    const minH = measureMinH(),
      onMove = (e: PointerEvent) => {
        const dx = e.clientX - resizeState.startX,
          dy = e.clientY - resizeState.startY
        if (resizeState.direction === 'e' || resizeState.direction === 'se')
          el.style.width = `${resizeState.startW + dx}px`
        if (resizeState.direction === 's' || resizeState.direction === 'se')
          el.style.height = `${Math.max(minH, resizeState.startH + dy)}px`
      },
      onUp = () => {
        setResizeState(null)
        const rect = el.getBoundingClientRect(),
          updates: ResizeUpdates = {}
        if (resizeState.direction === 'e' || resizeState.direction === 'se')
          updates.w = Math.max(snap, Math.round(rect.width / snap) * snap)
        if (resizeState.direction === 's' || resizeState.direction === 'se')
          updates.h = Math.max(minH, Math.round(rect.height))
        if (updates.w !== undefined || updates.h !== undefined) onResizeStop(itemKey, updates)
      }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [resizeState])
  const handleResizePointerDown = (direction: 'e' | 's' | 'se') => (e: React.PointerEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const rect = outerRef.current?.getBoundingClientRect()
      if (!rect) return
      setResizeState({
        direction,
        startH: rect.height,
        startW: rect.width,
        startX: e.clientX,
        startY: e.clientY
      })
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    },
    handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.target !== e.currentTarget) return
      const step = e.shiftKey ? snap * 5 : snap
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        const currentW = typeof w === 'number' ? w : (outerRef.current?.getBoundingClientRect().width ?? 200)
        onResizeStop(itemKey, { w: Math.max(snap, Math.round((currentW + step) / snap) * snap) })
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        const currentW = typeof w === 'number' ? w : (outerRef.current?.getBoundingClientRect().width ?? 200)
        onResizeStop(itemKey, { w: Math.max(snap, Math.round((currentW - step) / snap) * snap) })
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        const currentH = typeof h === 'number' ? h : (outerRef.current?.getBoundingClientRect().height ?? 200)
        onResizeStop(itemKey, { h: Math.max(snap, currentH + step) })
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        const currentH = typeof h === 'number' ? h : (outerRef.current?.getBoundingClientRect().height ?? 200)
        onResizeStop(itemKey, { h: Math.max(snap, currentH - step) })
      }
    },
    sizeTransition = isDragging || resizeState ? '' : 'all 200ms ease',
    dndTransition = transition ?? '',
    combinedTransition = [dndTransition, sizeTransition].filter(Boolean).join(', ') || undefined,
    wrapperStyle: CSSProperties = {
      boxSizing: 'border-box',
      opacity: isDragging ? 0.5 : isHidden && devMode ? 0.4 : undefined,
      transform: CSS.Transform.toString(transform),
      transition: resizeState ? 'none' : combinedTransition,
      zIndex: isDragging ? 50 : undefined
    }
  if (typeof w === 'number') {
    wrapperStyle.width = Math.round(w / snap) * snap
    wrapperStyle.minWidth = 'min-content'
    wrapperStyle.maxWidth = '100%'
    wrapperStyle.flexShrink = 0
  } else if (w === 'auto') {
    wrapperStyle.width = 'fit-content'
    wrapperStyle.maxWidth = '100%'
    wrapperStyle.flexShrink = 0
  } else {
    wrapperStyle.flex = '1 1 0%'
    wrapperStyle.minWidth = 0
    wrapperStyle.overflow = 'visible'
  }
  if (typeof h === 'number') {
    wrapperStyle.height = h
    wrapperStyle.minHeight = 'min-content'
  }
  if (isHidden && !devMode) wrapperStyle.display = 'none'
  const mergedClassName = cn(
    'ogrid-item group/item relative hover:outline hover:outline-1 hover:outline-border',
    isHidden && devMode && 'border-dashed',
    userClassName,
    showDebugRings && 'outline outline-2 outline-foreground',
    showDebugBg && 'bg-muted/30'
  )
  return (
    <div className={mergedClassName} data-ogrid-key={itemKey} ref={combinedRef} style={wrapperStyle}>
      <div className='absolute right-1 top-1 z-10 flex items-center gap-0.5 opacity-0 transition-opacity group-hover/item:opacity-100'>
        {devMode ? (
          <button
            className={cn('rounded px-1 text-[9px] hover:bg-muted', isDevPanelOpen && 'text-primary')}
            onClick={e => {
              e.stopPropagation()
              onCssClick(itemKey, e.currentTarget.getBoundingClientRect())
            }}
            type='button'>
            css
          </button>
        ) : null}
        {dragHandle ? null : (
          <div
            className='flex cursor-grab items-center justify-center rounded hover:bg-muted'
            style={{ height: 20, width: 20 }}
            {...(listeners as Record<string, unknown>)}
            {...(attributes as Record<string, unknown>)}>
            <svg className='text-muted-foreground' fill='currentColor' height='10' viewBox='0 0 10 10' width='10'>
              <circle cx='3' cy='2' r='1' />
              <circle cx='7' cy='2' r='1' />
              <circle cx='3' cy='5' r='1' />
              <circle cx='7' cy='5' r='1' />
              <circle cx='3' cy='8' r='1' />
              <circle cx='7' cy='8' r='1' />
            </svg>
          </div>
        )}
      </div>
      <div className='h-full w-full' data-ogrid-content='' ref={contentRef}>
        {content as React.ReactNode}
      </div>
      {isHidden ? null : (
        <>
          <div
            aria-label={`Resize ${itemKey}`}
            className='absolute right-0 top-0 h-full w-2 cursor-col-resize'
            onKeyDown={handleKeyDown}
            onPointerDown={handleResizePointerDown('e')}
            role='separator'
            tabIndex={0}
          />
          <div
            aria-label={`Resize ${itemKey} height`}
            className='absolute bottom-0 left-0 w-full h-2 cursor-row-resize'
            onPointerDown={handleResizePointerDown('s')}
            role='separator'
            tabIndex={0}
          />
          <div
            className='absolute bottom-0 right-0 h-3 w-3 cursor-nwse-resize'
            onPointerDown={handleResizePointerDown('se')}
            tabIndex={-1}
          />
        </>
      )}
      {isHidden && devMode ? (
        <div className='absolute inset-0 flex items-center justify-center'>
          <span className='rounded bg-muted px-2 py-1 text-xs text-muted-foreground'>hidden</span>
        </div>
      ) : null}
    </div>
  )
}
interface CreateGridComponentProps<K extends string> {
  store: Store<K>
}
const createGridComponent = <K extends string>({ store }: CreateGridComponentProps<K>) => {
  const GridComponent = (props: GridProps<K>): ReactElement => {
    const { items, config: configProp, id, onConfigChange, dragHandle, className, strict = false } = props,
      isNested = use(GridContext),
      gridRef = useRef<HTMLDivElement>(null),
      initializedRef = useRef(false),
      state = useSyncExternalStore(store.subscribe, store.getState, store.getState),
      dndId = useId(),
      devMode = isDev(),
      sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
      )
    useEffect(() => {
      if (isNested && gridRef.current) validateNoNestedGrid(gridRef.current)
    }, [isNested])
    useEffect(() => {
      if (initializedRef.current) return
      initializedRef.current = true
      if (configProp) {
        validateConfig(configProp)
        store.setState({ initialConfig: { ...configProp } })
        if (!onConfigChange) store.setState({ config: { ...configProp } })
      }
      if (id && !onConfigChange) {
        const saved = loadConfig<K>(id)
        if (saved) store.setConfig(saved)
      }
    }, [])
    useEffect(() => {
      if (!gridRef.current) return
      const observer = new ResizeObserver(entries => {
        for (const entry of entries) store.setState({ containerWidth: entry.contentRect.width })
      })
      observer.observe(gridRef.current)
      return () => observer.disconnect()
    }, [])
    useEffect(() => {
      if (onConfigChange && configProp) {
        validateConfig(configProp)
        store.setConfig(configProp)
      }
    }, [configProp, onConfigChange])
    useEffect(() => {
      store.setOnUserChange((newConfig: GridConfig<K>) => {
        if (onConfigChange) onConfigChange(newConfig)
        else if (id) saveConfig(id, newConfig)
      })
      store.setOnReset(() => {
        if (onConfigChange && configProp) onConfigChange(configProp)
        else if (id) clearConfig(id)
      })
      return () => {
        store.setOnUserChange(null)
        store.setOnReset(null)
      }
    }, [id, onConfigChange, configProp])
    const itemKeys = Object.keys(items) as K[],
      itemKeyStr = itemKeys.join('\0')
    useEffect(() => {
      store.setState({ itemKeys })
    }, [itemKeyStr])
    const gap = state.config.gap ?? 0,
      snap = state.config.snap ?? 1,
      layout = state.config.layout ?? [],
      layoutKeyStr = layout.map(e => e.key).join('\0'),
      orderedKeys = useMemo(() => {
        const lKeys = layoutKeyStr.split('\0').filter(Boolean),
          iKeys = itemKeyStr.split('\0').filter(Boolean) as K[],
          result: K[] = []
        for (const key of lKeys) if (iKeys.includes(key as K)) result.push(key as K)
        for (const key of iKeys) if (!result.includes(key)) result.push(key)
        return result
      }, [layoutKeyStr, itemKeyStr]),
      handleCssClick = useCallback(
        (key: string, rect: DOMRect) => {
          store.setState({
            openDevPanel: state.openDevPanel?.key === key ? null : { key: key as K, x: rect.left, y: rect.bottom + 4 }
          })
        },
        [state.openDevPanel?.key]
      ),
      handleResizeStop = useCallback((key: string, updates: ResizeUpdates) => {
        store.updateWidgetLayout(key as K, updates)
        store.userChange()
      }, []),
      handleDragEnd = useCallback(
        (event: DragEndEvent) => {
          const { active, over } = event
          if (!over || active.id === over.id) return
          const oldIndex = orderedKeys.indexOf(active.id as K),
            newIndex = orderedKeys.indexOf(over.id as K)
          if (oldIndex === -1 || newIndex === -1) return
          const newOrder = [...orderedKeys],
            [removed] = newOrder.splice(oldIndex, 1)
          newOrder.splice(newIndex, 0, removed)
          store.reorderKeys(newOrder)
          store.userChange()
        },
        [orderedKeys]
      ),
      announcements: Announcements = {
        onDragCancel: ({ active }) => `Dragging cancelled. Widget ${String(active.id)} returned.`,
        onDragEnd: ({ active, over }) =>
          over ? `Widget ${String(active.id)} dropped on ${String(over.id)}.` : `Widget ${String(active.id)} dropped.`,
        onDragOver: ({ active, over }) =>
          over
            ? `Widget ${String(active.id)} over ${String(over.id)}.`
            : `Widget ${String(active.id)} is no longer over a drop target.`,
        onDragStart: ({ active }) => `Picked up widget ${String(active.id)}.`
      },
      containerStyle: CSSProperties = {
        alignItems: 'flex-start',
        display: 'flex',
        flexWrap: 'wrap',
        gap
      }
    return (
      <GridContext value>
        <div className={cn('ogrid', className)} ref={gridRef} style={containerStyle}>
          <DndContext
            accessibility={{ announcements }}
            collisionDetection={closestCenter}
            id={dndId}
            onDragEnd={handleDragEnd}
            sensors={sensors}>
            <SortableContext items={orderedKeys} strategy={horizontalListSortingStrategy}>
              {orderedKeys.map(key => {
                const entry = layout.find(e => e.key === key)
                return (
                  <GridItemInner
                    content={items[key]}
                    devMode={devMode}
                    dragHandle={dragHandle}
                    isDevPanelOpen={state.openDevPanel?.key === key}
                    itemKey={key}
                    key={key}
                    layout={entry}
                    onCssClick={handleCssClick}
                    onResizeStop={handleResizeStop}
                    showDebugBg={state.showDebugBg}
                    showDebugRings={state.showDebugRings}
                    snap={snap}
                    strict={strict}
                  />
                )
              })}
            </SortableContext>
          </DndContext>
        </div>
        {state.openDevPanel && devMode
          ? createPortal(
              <>
                <button
                  className='fixed inset-0 z-[9998] cursor-default bg-transparent'
                  onClick={() => store.setState({ openDevPanel: null })}
                  onKeyDown={e => {
                    if (e.key === 'Escape') store.setState({ openDevPanel: null })
                  }}
                  tabIndex={-1}
                  type='button'
                />
                <div
                  className='fixed z-[9999] w-48 max-h-[70vh] overflow-y-auto rounded-lg border border-border bg-background p-2 shadow-2xl'
                  style={{ left: state.openDevPanel.x, top: state.openDevPanel.y }}>
                  <WidgetDevPanelContent
                    layout={
                      layout.find(e => e.key === state.openDevPanel?.key) ?? {
                        key: state.openDevPanel.key
                      }
                    }
                    onChange={updates => {
                      const key = state.openDevPanel?.key
                      if (!key) return
                      if (updates.className) validateClassName(key, updates.className, false)
                      store.updateWidgetLayout(key, updates)
                      store.userChange()
                    }}
                    widgetKey={state.openDevPanel.key}
                  />
                </div>
              </>,
              document.body
            )
          : null}
      </GridContext>
    )
  }
  GridComponent.displayName = 'Grid'
  return GridComponent
}
export { createGridComponent, GridContext }
