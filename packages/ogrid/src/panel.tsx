'use client'
import { type ChangeEvent, type ReactElement, useSyncExternalStore } from 'react'
import type { Store } from './store'
import type { GridConfig, PanelProps, WidgetLayoutEntry } from './types'
import { cn } from './cn'
import { isDev } from './validation'
const formatConfigForCopy = <K extends string>(config: GridConfig<K>, itemKeys: K[]): string => {
  const parts: string[] = ['{']
  if (config.gap !== undefined && config.gap !== 0) parts.push(`  gap: ${String(config.gap)},`)
  if (config.snap !== undefined && config.snap !== 1) parts.push(`  snap: ${String(config.snap)},`)
  const entries = (config.layout ?? []).filter(e => itemKeys.includes(e.key))
  if (entries.length > 0) {
    parts.push('  layout: [')
    for (const entry of entries) {
      const fields: string[] = [`key: '${entry.key}'`]
      if (entry.w !== undefined) fields.push(`w: ${entry.w === 'auto' ? "'auto'" : String(entry.w)}`)
      if (entry.h !== undefined) fields.push(`h: ${String(entry.h)}`)
      if (entry.hidden) fields.push('hidden: true')
      if (entry.className) fields.push(`className: '${entry.className}'`)
      parts.push(`    { ${fields.join(', ')} },`)
    }
    parts.push('  ],')
  }
  parts.push('}')
  return parts.join('\n')
}
interface NumberInputProps {
  label: string
  min?: number
  onChange: (value: number | undefined) => void
  placeholder?: string
  step?: number
  value: number | undefined
}
const NumberInput = ({ label, value, onChange, min = 0, step = 1, placeholder }: NumberInputProps) => (
  <label className='flex items-center gap-2 text-xs'>
    <span className='w-10 shrink-0 text-muted-foreground'>{label}</span>
    <input
      className='h-7 w-20 rounded border border-border bg-background px-2 text-xs'
      min={min}
      onChange={(e: ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value
        if (v === '') onChange(undefined)
        else {
          const n = Number(v)
          if (!Number.isNaN(n)) onChange(n)
        }
      }}
      placeholder={placeholder}
      step={step}
      type='number'
      value={value ?? ''}
    />
  </label>
)
interface CreatePanelComponentProps<K extends string> {
  getItemKeys: () => K[]
  store: Store<K>
}
const createPanelComponent = <K extends string>({ store, getItemKeys }: CreatePanelComponentProps<K>) => {
  const PanelComponent = ({ children, renderWidgetControl }: PanelProps<K>): null | ReactElement => {
    const devMode = isDev(),
      state = useSyncExternalStore(store.subscribe, store.getState, store.getState)
    if (!devMode) return null
    const { config, selectedWidget, showDebugBorders, showDebugBg, containerWidth } = state,
      itemKeys = getItemKeys(),
      layout = config.layout ?? [],
      gap = config.gap ?? 0,
      snap = config.snap ?? 1,
      getLayoutEntry = (key: K): WidgetLayoutEntry<K> => layout.find(e => e.key === key) ?? { key },
      handleWidgetChange = (key: K, updates: Partial<WidgetLayoutEntry<K>>) => {
        store.updateWidgetLayout(key, updates)
      },
      handleGridChange = (updates: Partial<GridConfig<K>>) => {
        store.updateGridConfig(updates)
      },
      handleCopy = () => {
        const text = formatConfigForCopy(store.getState().config, itemKeys)
        // oxlint-disable-next-line promise/prefer-await-to-then
        navigator.clipboard.writeText(text).catch(() => undefined)
      },
      handleReset = () => {
        store.reset()
      }
    if (children)
      return children({
        selectedWidget,
        widgets: itemKeys,
        gridConfig: config,
        onWidgetChange: handleWidgetChange,
        onGridChange: handleGridChange,
        onCopy: handleCopy,
        onReset: handleReset
      })
    const selected = selectedWidget ? getLayoutEntry(selectedWidget) : null
    return (
      <div className='flex flex-col gap-3 rounded-lg border border-border bg-background p-3 text-sm'>
        <div className='flex items-center justify-between'>
          <span className='font-medium'>ogrid</span>
          <span className='text-xs text-muted-foreground'>{String(Math.round(containerWidth))}px</span>
        </div>
        <div className='flex flex-col gap-2'>
          <NumberInput
            label='gap'
            onChange={v => handleGridChange({ gap: v ?? 0 })}
            placeholder='0'
            value={gap || undefined}
          />
          <NumberInput
            label='snap'
            min={1}
            onChange={v => handleGridChange({ snap: v ?? 1 })}
            placeholder='1'
            value={snap === 1 ? undefined : snap}
          />
        </div>
        <div className='h-px bg-border' />
        <div className='flex flex-col gap-1'>
          <span className='text-xs text-muted-foreground'>widgets</span>
          {itemKeys.map(key => {
            const entry = getLayoutEntry(key),
              isSelected = selectedWidget === key
            return (
              <button
                className={cn(
                  'flex items-center justify-between rounded px-2 py-1 text-left text-xs transition-colors hover:bg-muted',
                  isSelected && 'bg-muted ring-1 ring-primary',
                  entry.hidden && 'text-muted-foreground line-through'
                )}
                key={key}
                onClick={() => store.setState({ selectedWidget: key })}
                type='button'>
                <span>{key}</span>
                {entry.w !== undefined && (
                  <span className='text-muted-foreground'>{entry.w === 'auto' ? 'auto' : `${String(entry.w)}px`}</span>
                )}
              </button>
            )
          })}
        </div>
        {selected && selectedWidget ? (
          <>
            <div className='h-px bg-border' />
            <div className='flex flex-col gap-2'>
              <span className='text-xs font-medium'>{selectedWidget}</span>
              {renderWidgetControl ? (
                renderWidgetControl(selectedWidget, selected, updates => handleWidgetChange(selectedWidget, updates))
              ) : (
                <>
                  <div className='flex items-center gap-2'>
                    <NumberInput
                      label='w'
                      min={1}
                      onChange={v => handleWidgetChange(selectedWidget, { w: v })}
                      placeholder='auto'
                      value={typeof selected.w === 'number' ? selected.w : undefined}
                    />
                    {selected.w !== undefined && (
                      <button
                        className='text-xs text-muted-foreground hover:text-foreground'
                        onClick={() => handleWidgetChange(selectedWidget, { w: undefined })}
                        type='button'>
                        reset
                      </button>
                    )}
                  </div>
                  <div className='flex items-center gap-2'>
                    <NumberInput
                      label='h'
                      min={1}
                      onChange={v => handleWidgetChange(selectedWidget, { h: v })}
                      placeholder='auto'
                      value={selected.h}
                    />
                    {selected.h !== undefined && (
                      <button
                        className='text-xs text-muted-foreground hover:text-foreground'
                        onClick={() => handleWidgetChange(selectedWidget, { h: undefined })}
                        type='button'>
                        clear
                      </button>
                    )}
                  </div>
                  <label className='flex items-center gap-2 text-xs'>
                    <input
                      checked={selected.hidden ?? false}
                      onChange={e =>
                        handleWidgetChange(selectedWidget, {
                          hidden: e.target.checked || undefined
                        })
                      }
                      type='checkbox'
                    />
                    <span>hidden</span>
                  </label>
                  <label className='flex flex-col gap-1 text-xs'>
                    <span className='text-muted-foreground'>className</span>
                    <input
                      className='h-7 rounded border border-border bg-background px-2 text-xs'
                      onChange={e =>
                        handleWidgetChange(selectedWidget, {
                          className: e.target.value || undefined
                        })
                      }
                      placeholder='Tailwind classes'
                      type='text'
                      value={selected.className ?? ''}
                    />
                  </label>
                </>
              )}
            </div>
          </>
        ) : null}
        <div className='h-px bg-border' />
        <div className='flex flex-col gap-1'>
          <label className='flex items-center gap-2 text-xs'>
            <input
              checked={showDebugBorders}
              onChange={e => store.setState({ showDebugBorders: e.target.checked })}
              type='checkbox'
            />
            <span>borders</span>
          </label>
          <label className='flex items-center gap-2 text-xs'>
            <input
              checked={showDebugBg}
              onChange={e => store.setState({ showDebugBg: e.target.checked })}
              type='checkbox'
            />
            <span>backgrounds</span>
          </label>
        </div>
        <div className='flex gap-2'>
          <button
            className='flex-1 rounded border border-border px-3 py-1.5 text-xs transition-colors hover:bg-muted'
            onClick={handleCopy}
            type='button'>
            copy
          </button>
          <button
            className='flex-1 rounded border border-border px-3 py-1.5 text-xs transition-colors hover:bg-destructive hover:text-destructive-foreground'
            onClick={handleReset}
            type='button'>
            reset
          </button>
        </div>
      </div>
    )
  }
  PanelComponent.displayName = 'Panel'
  return PanelComponent
}
export { createPanelComponent }
