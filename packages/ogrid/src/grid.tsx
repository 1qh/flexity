/** biome-ignore-all lint/a11y/noStaticElementInteractions: dev-only click handler on layout div */
/** biome-ignore-all lint/a11y/noNoninteractiveElementInteractions: dev-only click handler on layout div */
/** biome-ignore-all lint/a11y/noSvgWithoutTitle: decorative grip icon */
/** biome-ignore-all lint/a11y/useSemanticElements: resize separator */
/** biome-ignore-all lint/a11y/useAriaPropsForRole: re-resizable handles aria */
/** biome-ignore-all lint/nursery/noInlineStyles: dynamic layout styles required */
/** biome-ignore-all lint/correctness/useExhaustiveDependencies: intentional dep control */
/* eslint-disable complexity, react-hooks/exhaustive-deps, @eslint-react/no-unnecessary-use-callback, @typescript-eslint/max-params */
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
import { Resizable } from 're-resizable'
import { createContext, use, useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from 'react'
import type { Store } from './store'
import type { AllowedContent, GridConfig, GridProps, WidgetLayoutEntry } from './types'
import { cn } from './cn'
import { clearConfig, loadConfig, saveConfig } from './storage'
import { isDev, validateClassName, validateConfig, validateDom, validateNoNestedGrid } from './validation'
const GridContext = createContext(false),
  DefaultDragHandle = ({
    listeners,
    attributes
  }: {
    attributes: Record<string, unknown>
    listeners: Record<string, unknown>
  }) => (
    <div
      className='absolute right-1 top-1 z-10 flex cursor-grab items-center justify-center rounded opacity-0 transition-opacity hover:bg-muted group-hover/item:opacity-100'
      style={{ height: 20, width: 20 }}
      {...listeners}
      {...attributes}>
      <svg className='text-muted-foreground' fill='currentColor' height='10' viewBox='0 0 10 10' width='10'>
        <circle cx='3' cy='2' r='1' />
        <circle cx='7' cy='2' r='1' />
        <circle cx='3' cy='5' r='1' />
        <circle cx='7' cy='5' r='1' />
        <circle cx='3' cy='8' r='1' />
        <circle cx='7' cy='8' r='1' />
      </svg>
    </div>
  )
interface GridItemInnerProps {
  content: AllowedContent
  devMode: boolean
  dragHandle?: string
  itemKey: string
  layout: undefined | WidgetLayoutEntry
  onResizeStop: (key: string, width: number) => void
  onSelect: (key: string) => void
  resizeHandle?: ReactElement
  selected: boolean
  showDebugBg: boolean
  showDebugBorders: boolean
  snap: number
  strict: boolean
}
const GridItemInner = ({
  itemKey,
  content,
  layout,
  snap,
  strict,
  onSelect,
  onResizeStop,
  resizeHandle,
  dragHandle,
  selected,
  showDebugBorders,
  showDebugBg,
  devMode
}: GridItemInnerProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null),
    startWidthRef = useRef(0),
    { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id: itemKey
    }),
    w = layout?.w,
    h = layout?.h,
    isHidden = layout?.hidden === true,
    userClassName = layout?.className
  useEffect(() => {
    if (!(dragHandle && wrapperRef.current)) return
    const handle = wrapperRef.current.querySelector(dragHandle)
    if (!handle) return
    const controller = new AbortController()
    if (listeners)
      for (const [event, handler] of Object.entries(listeners))
        handle.addEventListener(event, handler as EventListener, { signal: controller.signal })
    for (const [attr, value] of Object.entries(attributes)) handle.setAttribute(attr, String(value))
    handle.setAttribute('style', `${handle.getAttribute('style') ?? ''}; cursor: grab;`)
    return () => controller.abort()
  }, [dragHandle, listeners, attributes, content])
  useEffect(() => {
    if (!(devMode && wrapperRef.current)) return
    validateDom(itemKey, wrapperRef.current, strict)
  }, [itemKey, content, strict, devMode])
  useEffect(() => {
    if (!(devMode && userClassName)) return
    validateClassName(itemKey, userClassName, strict)
  }, [itemKey, userClassName, strict, devMode])
  const wrapperStyle: CSSProperties = {
    boxSizing: 'border-box',
    opacity: isDragging ? 0.5 : isHidden && devMode ? 0.4 : undefined,
    transform: CSS.Transform.toString(transform),
    transition: transition ?? undefined,
    zIndex: isDragging ? 50 : undefined
  }
  if (typeof w === 'number') {
    wrapperStyle.width = Math.round(w / snap) * snap
    wrapperStyle.maxWidth = '100%'
    wrapperStyle.flexShrink = 0
    wrapperStyle.overflowX = 'auto'
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
    wrapperStyle.maxHeight = h
    wrapperStyle.overflowY = 'auto'
  }
  if (isHidden && !devMode) wrapperStyle.display = 'none'
  const handleResizeStart = () => {
      if (wrapperRef.current) startWidthRef.current = wrapperRef.current.getBoundingClientRect().width
    },
    handleResizeStop = (_e: unknown, _dir: unknown, _ref: unknown, d: { width: number }) => {
      const rawWidth = startWidthRef.current + d.width,
        snapped = Math.max(snap, Math.round(rawWidth / snap) * snap)
      onResizeStop(itemKey, snapped)
    },
    handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.target !== e.currentTarget) return
      const step = e.shiftKey ? snap * 5 : snap
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        const currentW = typeof w === 'number' ? w : (wrapperRef.current?.getBoundingClientRect().width ?? 200)
        onResizeStop(itemKey, Math.max(snap, Math.round((currentW + step) / snap) * snap))
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        const currentW = typeof w === 'number' ? w : (wrapperRef.current?.getBoundingClientRect().width ?? 200)
        onResizeStop(itemKey, Math.max(snap, Math.round((currentW - step) / snap) * snap))
      }
    },
    mergedClassName = cn(
      'ogrid-item group/item relative',
      showDebugBorders && 'border border-foreground',
      showDebugBg && 'bg-muted/30',
      selected && devMode && 'ring-2 ring-primary',
      isHidden && devMode && 'border-dashed',
      userClassName
    ),
    inner = (
      <div className='contents' data-ogrid-content='' ref={wrapperRef}>
        {content as React.ReactNode}
      </div>
    )
  return (
    <div
      className={mergedClassName}
      data-ogrid-key={itemKey}
      onClick={
        devMode
          ? e => {
              e.stopPropagation()
              onSelect(itemKey)
            }
          : undefined
      }
      onKeyDown={
        devMode
          ? e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                e.stopPropagation()
                onSelect(itemKey)
              }
            }
          : undefined
      }
      ref={setNodeRef}
      style={wrapperStyle}>
      {dragHandle ? null : (
        <DefaultDragHandle
          attributes={attributes as Record<string, unknown>}
          listeners={listeners as Record<string, unknown>}
        />
      )}
      {isHidden ? (
        inner
      ) : (
        <Resizable
          enable={{ right: true }}
          handleComponent={
            resizeHandle
              ? { right: resizeHandle }
              : {
                  right: (
                    <div
                      aria-label={`Resize ${itemKey}`}
                      className='flex h-full w-2 cursor-col-resize items-center justify-center opacity-0 transition-opacity group-hover/item:opacity-100'
                      onKeyDown={handleKeyDown}
                      role='separator'
                      tabIndex={0}>
                      <div className='h-8 w-0.5 rounded-full bg-border' />
                    </div>
                  )
                }
          }
          onResizeStart={handleResizeStart}
          onResizeStop={handleResizeStop}
          size={{ height: 'auto', width: '100%' }}
          snap={{ x: Array.from({ length: Math.ceil(10_000 / snap) }, (_, i) => (i + 1) * snap) }}>
          {inner}
        </Resizable>
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
    const { items, config: configProp, id, onConfigChange, dragHandle, resizeHandle, className, strict = false } = props,
      isNested = use(GridContext),
      gridRef = useRef<HTMLDivElement>(null),
      initializedRef = useRef(false),
      state = useSyncExternalStore(store.subscribe, store.getState, store.getState),
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
      handleSelect = useCallback((key: string) => {
        store.setState({ selectedWidget: key as K })
      }, []),
      handleResizeStop = useCallback((key: string, width: number) => {
        store.updateWidgetLayout(key as K, { w: width })
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
                    itemKey={key}
                    key={key}
                    layout={entry}
                    onResizeStop={handleResizeStop}
                    onSelect={handleSelect}
                    resizeHandle={resizeHandle}
                    selected={state.selectedWidget === key}
                    showDebugBg={state.showDebugBg}
                    showDebugBorders={state.showDebugBorders}
                    snap={snap}
                    strict={strict}
                  />
                )
              })}
            </SortableContext>
          </DndContext>
        </div>
      </GridContext>
    )
  }
  GridComponent.displayName = 'Grid'
  return GridComponent
}
export { createGridComponent, GridContext }
