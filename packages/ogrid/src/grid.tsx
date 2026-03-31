/** biome-ignore-all lint/a11y/noSvgWithoutTitle: decorative grip icon */
/** biome-ignore-all lint/a11y/noNoninteractiveElementInteractions: grid item click to select */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: handled by dnd-kit */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: grid wrapper */
/** biome-ignore-all lint/a11y/useSemanticElements: resize separator */
/** biome-ignore-all lint/a11y/useAriaPropsForRole: re-resizable handles aria */
/** biome-ignore-all lint/nursery/noInlineStyles: dynamic layout styles required */
/** biome-ignore-all lint/correctness/useExhaustiveDependencies: intentional dep control */
/* eslint-disable complexity, react-hooks/exhaustive-deps, @eslint-react/no-unnecessary-use-callback, @typescript-eslint/max-params */
'use client'
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Resizable } from 're-resizable'
import {
  createContext,
  type CSSProperties,
  memo,
  type ReactElement,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore
} from 'react'
import type { Store } from './store'
import type { AllowedContent, GridConfig, GridProps, WidgetLayoutEntry } from './types'
import { cn } from './cn'
import { loadConfig, saveConfig } from './storage'
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
      style={{ width: 20, height: 20 }}
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
const GridItemInner = memo(
  ({
    itemKey,
    content,
    layout,
    snap,
    strict,
    onSelect,
    onResizeStop,
    resizeHandle,
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
      if (!(devMode && wrapperRef.current)) return
      validateDom(itemKey, wrapperRef.current, strict)
    }, [itemKey, content, strict, devMode])
    useEffect(() => {
      if (!(devMode && userClassName)) return
      validateClassName(itemKey, userClassName, strict)
    }, [itemKey, userClassName, strict, devMode])
    const wrapperStyle: CSSProperties = {
      boxSizing: 'border-box',
      transform: CSS.Transform.toString(transform),
      transition: transition ?? undefined,
      zIndex: isDragging ? 50 : undefined,
      opacity: isDragging ? 0.5 : isHidden && devMode ? 0.4 : undefined
    }
    if (typeof w === 'number') {
      wrapperStyle.width = w
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
        onClick={e => {
          if (devMode) {
            e.stopPropagation()
            onSelect(itemKey)
          }
        }}
        ref={setNodeRef}
        style={wrapperStyle}>
        {devMode ? (
          <DefaultDragHandle
            attributes={attributes as Record<string, unknown>}
            listeners={listeners as Record<string, unknown>}
          />
        ) : null}
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
            size={{ width: '100%', height: 'auto' }}
            snap={{ x: Array.from({ length: 200 }, (_, i) => (i + 1) * snap) }}>
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
)
GridItemInner.displayName = 'GridItemInner'
interface CreateGridComponentProps<K extends string> {
  store: Store<K>
}
const createGridComponent = <K extends string>({ store }: CreateGridComponentProps<K>) => {
  const GridComponent = (props: GridProps<K>): ReactElement => {
    const { items, config: configProp, id, onConfigChange, resizeHandle, className, strict = false } = props,
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
        store.setState({ config: { ...configProp }, initialConfig: { ...configProp } })
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
      return () => store.setOnUserChange(null)
    }, [id, onConfigChange])
    const gap = state.config.gap ?? 0,
      snap = state.config.snap ?? 1,
      layout = state.config.layout ?? [],
      itemKeys = Object.keys(items) as K[],
      layoutKeyStr = layout.map(e => e.key).join(','),
      itemKeyStr = itemKeys.join(','),
      orderedKeys = useMemo(() => {
        const lKeys = layoutKeyStr.split(',').filter(Boolean),
          iKeys = itemKeyStr.split(',').filter(Boolean) as K[],
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
      containerStyle: CSSProperties = {
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        gap
      }
    return (
      <GridContext value>
        <div className={cn('ogrid', className)} ref={gridRef} style={containerStyle}>
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd} sensors={sensors}>
            <SortableContext items={orderedKeys} strategy={horizontalListSortingStrategy}>
              {orderedKeys.map(key => {
                const entry = layout.find(e => e.key === key)
                return (
                  <GridItemInner
                    content={items[key]}
                    devMode={devMode}
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
