/** biome-ignore-all lint/nursery/useNamedCaptureGroup: simple regex patterns */
/** biome-ignore-all lint/performance/useTopLevelRegex: regex used in component scope */
/* oxlint-disable prefer-named-capture-group */
/* eslint-disable prefer-named-capture-group */
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
interface SelectInputProps {
  label: string
  onChange: (value: string) => void
  options: readonly string[]
  value: string
}
const SelectInput = ({ label, value, onChange, options }: SelectInputProps) => (
    <label className='flex items-center gap-2 text-xs'>
      <span className='w-10 shrink-0 text-muted-foreground'>{label}</span>
      <select
        className='h-7 rounded border border-border bg-background px-1 text-xs'
        onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
        value={value}>
        <option value=''>—</option>
        {options.map(o => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  ),
  PADDING_RE = /\b(p[tblrxyse]?)-(\d+|\[\d+px\])/gu,
  ROUNDED_RE = /\b(rounded(?:-[a-z]+)?)/gu,
  OPACITY_RE = /\b(opacity-\d+)/gu,
  SHADOW_RE = /\b(shadow(?:-[a-z]+)?)/gu,
  BG_RE = /\b(bg-[a-z][\w/.-]*)/gu,
  BORDER_RE = /\b(border(?:-[a-z][\w/.-]*)?)/gu,
  FLEX_DIR_RE = /\b(flex-(?:col|row)(?:-reverse)?)/gu,
  GAP_RE = /\b(gap(?:-[xy])?-\d+|\bgap-\[\d+px\])/gu,
  ITEMS_RE = /\b(items-(?:start|end|center|baseline|stretch))/gu,
  JUSTIFY_RE = /\b(justify-(?:start|end|center|between|around|evenly|stretch))/gu,
  TEXT_SIZE_RE = /\b(text-(?:xs|sm|base|lg|xl|2xl|3xl))/gu,
  TEXT_COLOR_RE = /\b(text-(?:foreground|muted-foreground|primary|destructive|secondary-foreground))/gu,
  LEADING_RE = /\b(leading-(?:none|tight|snug|normal|relaxed|loose|\d+))/gu,
  TRACKING_RE = /\b(tracking-(?:tighter|tight|normal|wide|wider|widest))/gu,
  extractClass = (cls: string, re: RegExp): string => {
    re.lastIndex = 0
    const m = re.exec(cls)
    return m ? m[1] : ''
  },
  extractAllPadding = (cls: string): Record<string, string> => {
    PADDING_RE.lastIndex = 0
    const result: Record<string, string> = {}
    let m = PADDING_RE.exec(cls)
    while (m) {
      result[m[1]] = m[2]
      m = PADDING_RE.exec(cls)
    }
    return result
  },
  removeMatching = (cls: string, re: RegExp): string => {
    re.lastIndex = 0
    return cls.replace(re, '').replace(/\s+/gu, ' ').trim()
  },
  ROUNDED_OPTIONS = [
    'rounded-none',
    'rounded-sm',
    'rounded',
    'rounded-md',
    'rounded-lg',
    'rounded-xl',
    'rounded-2xl',
    'rounded-full'
  ] as const,
  SHADOW_OPTIONS = ['shadow-none', 'shadow-sm', 'shadow', 'shadow-md', 'shadow-lg', 'shadow-xl', 'shadow-2xl'] as const,
  OPACITY_OPTIONS = ['opacity-0', 'opacity-25', 'opacity-50', 'opacity-75', 'opacity-100'] as const,
  FLEX_DIR_OPTIONS = ['flex-row', 'flex-col', 'flex-row-reverse', 'flex-col-reverse'] as const,
  ITEMS_OPTIONS = ['items-start', 'items-end', 'items-center', 'items-baseline', 'items-stretch'] as const,
  JUSTIFY_OPTIONS = [
    'justify-start',
    'justify-end',
    'justify-center',
    'justify-between',
    'justify-around',
    'justify-evenly'
  ] as const,
  TEXT_SIZE_OPTIONS = ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl'] as const,
  TEXT_COLOR_OPTIONS = ['text-foreground', 'text-muted-foreground', 'text-primary', 'text-destructive'] as const,
  LEADING_OPTIONS = [
    'leading-none',
    'leading-tight',
    'leading-snug',
    'leading-normal',
    'leading-relaxed',
    'leading-loose'
  ] as const,
  TRACKING_OPTIONS = [
    'tracking-tighter',
    'tracking-tight',
    'tracking-normal',
    'tracking-wide',
    'tracking-wider',
    'tracking-widest'
  ] as const,
  BG_OPTIONS = [
    'bg-background',
    'bg-muted',
    'bg-muted/30',
    'bg-muted/50',
    'bg-primary',
    'bg-secondary',
    'bg-accent'
  ] as const,
  BORDER_OPTIONS = ['border', 'border-2', 'border-border', 'border-border/50', 'border-primary', 'border-dashed'] as const,
  PADDING_SIDES = ['pt', 'pb', 'pl', 'pr'] as const,
  PADDING_VALUES = ['0', '1', '2', '3', '4', '5', '6', '8'] as const,
  GAP_OPTIONS = ['gap-0', 'gap-1', 'gap-2', 'gap-3', 'gap-4', 'gap-6', 'gap-8'] as const
interface VisualControlsProps {
  className: string
  onChange: (cls: string) => void
}
const VisualControls = ({ className: cls, onChange }: VisualControlsProps) => {
  const padding = extractAllPadding(cls),
    rounded = extractClass(cls, ROUNDED_RE),
    shadow = extractClass(cls, SHADOW_RE),
    opacity = extractClass(cls, OPACITY_RE),
    flexDir = extractClass(cls, FLEX_DIR_RE),
    items = extractClass(cls, ITEMS_RE),
    justify = extractClass(cls, JUSTIFY_RE),
    gapVal = extractClass(cls, GAP_RE),
    textSize = extractClass(cls, TEXT_SIZE_RE),
    textColor = extractClass(cls, TEXT_COLOR_RE),
    leading = extractClass(cls, LEADING_RE),
    tracking = extractClass(cls, TRACKING_RE),
    bg = extractClass(cls, BG_RE),
    border = extractClass(cls, BORDER_RE),
    updateSelect = (re: RegExp, newVal: string) => {
      const cleaned = removeMatching(cls, re)
      onChange(cn(cleaned, newVal || undefined))
    },
    updatePadding = (side: string, val: string) => {
      const tokens = cls.split(/\s+/u),
        filtered = tokens.filter(t => !t.startsWith(`${side}-`) && t !== `${side}-0`).join(' ')
      onChange(cn(filtered, val ? `${side}-${val}` : undefined))
    }
  return (
    <div className='flex flex-col gap-2'>
      <span className='text-xs text-muted-foreground'>padding</span>
      <div className='grid grid-cols-2 gap-1'>
        {PADDING_SIDES.map(side => (
          <SelectInput
            key={side}
            label={side}
            onChange={v => updatePadding(side, v)}
            options={PADDING_VALUES}
            value={padding[side] ?? ''}
          />
        ))}
      </div>
      <span className='text-xs text-muted-foreground'>layout</span>
      <SelectInput label='dir' onChange={v => updateSelect(FLEX_DIR_RE, v)} options={FLEX_DIR_OPTIONS} value={flexDir} />
      <SelectInput label='gap' onChange={v => updateSelect(GAP_RE, v)} options={GAP_OPTIONS} value={gapVal} />
      <SelectInput label='align' onChange={v => updateSelect(ITEMS_RE, v)} options={ITEMS_OPTIONS} value={items} />
      <SelectInput label='just' onChange={v => updateSelect(JUSTIFY_RE, v)} options={JUSTIFY_OPTIONS} value={justify} />
      <span className='text-xs text-muted-foreground'>visual</span>
      <SelectInput label='round' onChange={v => updateSelect(ROUNDED_RE, v)} options={ROUNDED_OPTIONS} value={rounded} />
      <SelectInput label='bg' onChange={v => updateSelect(BG_RE, v)} options={BG_OPTIONS} value={bg} />
      <SelectInput label='bdr' onChange={v => updateSelect(BORDER_RE, v)} options={BORDER_OPTIONS} value={border} />
      <SelectInput label='shad' onChange={v => updateSelect(SHADOW_RE, v)} options={SHADOW_OPTIONS} value={shadow} />
      <SelectInput label='opac' onChange={v => updateSelect(OPACITY_RE, v)} options={OPACITY_OPTIONS} value={opacity} />
      <span className='text-xs text-muted-foreground'>typography</span>
      <SelectInput
        label='size'
        onChange={v => updateSelect(TEXT_SIZE_RE, v)}
        options={TEXT_SIZE_OPTIONS}
        value={textSize}
      />
      <SelectInput
        label='color'
        onChange={v => updateSelect(TEXT_COLOR_RE, v)}
        options={TEXT_COLOR_OPTIONS}
        value={textColor}
      />
      <SelectInput label='lead' onChange={v => updateSelect(LEADING_RE, v)} options={LEADING_OPTIONS} value={leading} />
      <SelectInput
        label='track'
        onChange={v => updateSelect(TRACKING_RE, v)}
        options={TRACKING_OPTIONS}
        value={tracking}
      />
    </div>
  )
}
interface CreatePanelComponentProps<K extends string> {
  getItemKeys: () => K[]
  store: Store<K>
}
const createPanelComponent = <K extends string>({ store, getItemKeys }: CreatePanelComponentProps<K>) => {
  const PanelComponent = ({
    children,
    renderWidgetControl,
    renderGridControl,
    renderCopyButton
  }: PanelProps<K>): null | ReactElement => {
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
        store.userChange()
      },
      handleGridChange = (updates: Partial<GridConfig<K>>) => {
        store.updateGridConfig(updates)
        store.userChange()
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
        {renderGridControl ? (
          renderGridControl(config, handleGridChange)
        ) : (
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
        )}
        <div className='h-px bg-border' />
        <div className='flex flex-col gap-1'>
          <span className='text-xs text-muted-foreground'>widgets</span>
          {itemKeys.map(key => {
            const entry = getLayoutEntry(key),
              isSelected = selectedWidget === key,
              hasCustomLayout =
                entry.w !== undefined || entry.h !== undefined || entry.className !== undefined || entry.hidden === true
            return (
              <div
                className={cn(
                  'flex items-center justify-between rounded px-2 py-1 text-xs transition-colors hover:bg-muted',
                  isSelected && 'bg-muted ring-1 ring-primary',
                  entry.hidden && 'text-muted-foreground line-through'
                )}
                key={key}>
                <button className='flex-1 text-left' onClick={() => store.setState({ selectedWidget: key })} type='button'>
                  {hasCustomLayout ? '◆ ' : ''}
                  {key}
                </button>
                <div className='flex items-center gap-1'>
                  {entry.w !== undefined && (
                    <span className='text-muted-foreground'>{entry.w === 'auto' ? 'auto' : `${String(entry.w)}px`}</span>
                  )}
                  <button
                    className='text-muted-foreground hover:text-foreground'
                    onClick={e => {
                      e.stopPropagation()
                      handleWidgetChange(key, { hidden: !entry.hidden || undefined })
                    }}
                    title={entry.hidden ? 'Show' : 'Hide'}
                    type='button'>
                    {entry.hidden ? '○' : '●'}
                  </button>
                </div>
              </div>
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
                  <VisualControls
                    className={selected.className ?? ''}
                    onChange={v => handleWidgetChange(selectedWidget, { className: v || undefined })}
                  />
                  <label className='flex flex-col gap-1 text-xs'>
                    <span className='text-muted-foreground'>custom classes</span>
                    <input
                      className='h-7 rounded border border-border bg-background px-2 text-xs'
                      onChange={e =>
                        handleWidgetChange(selectedWidget, {
                          className: e.target.value || undefined
                        })
                      }
                      placeholder='additional Tailwind classes'
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
          {renderCopyButton ? (
            renderCopyButton(handleCopy)
          ) : (
            <button
              className='flex-1 rounded border border-border px-3 py-1.5 text-xs transition-colors hover:bg-muted'
              onClick={handleCopy}
              type='button'>
              copy
            </button>
          )}
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
export { createPanelComponent, formatConfigForCopy }
