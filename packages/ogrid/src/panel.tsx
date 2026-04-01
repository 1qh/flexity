/** biome-ignore-all lint/nursery/useNamedCaptureGroup: simple regex patterns */
/** biome-ignore-all lint/performance/useTopLevelRegex: regex used in component scope */
/* oxlint-disable prefer-named-capture-group */
/* eslint-disable prefer-named-capture-group */
'use client'
import type { ChangeEvent, ReactElement } from 'react'
import { useState, useSyncExternalStore } from 'react'
import type { Store } from './store'
import type { GridConfig, PanelProps, WidgetLayoutEntry } from './types'
import { cn } from './cn'
import { isDev, validateClassName } from './validation'
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
  <label className='flex items-center gap-1 text-xs'>
    <span className='text-[9px] text-muted-foreground'>{label}</span>
    <input
      className='h-6 w-14 rounded border border-border bg-background px-1 text-xs'
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
    return cls.replace(re, '').replaceAll(/\s+/gu, ' ').trim()
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
interface WidgetDevPanelProps<K extends string> {
  layout: WidgetLayoutEntry<K>
  onChange: (updates: Partial<WidgetLayoutEntry<K>>) => void
  renderWidgetControl?: PanelProps<K>['renderWidgetControl']
  widgetKey: K
}
const WidgetDevPanelContent = <K extends string>({
  widgetKey,
  layout,
  onChange,
  renderWidgetControl
}: WidgetDevPanelProps<K>): ReactElement => {
  if (renderWidgetControl) return renderWidgetControl(widgetKey, layout, onChange) ?? <div />
  return (
    <div className='flex flex-col gap-2'>
      <span className='text-[9px] font-medium'>{widgetKey}</span>
      <div className='flex items-center gap-2'>
        <NumberInput
          label='w'
          min={1}
          onChange={v => onChange({ w: v } as Partial<WidgetLayoutEntry<K>>)}
          placeholder='auto'
          value={typeof layout.w === 'number' ? layout.w : undefined}
        />
        {layout.w === undefined ? null : (
          <button
            className='text-[9px] text-muted-foreground hover:text-foreground'
            onClick={() => onChange({ w: undefined } as Partial<WidgetLayoutEntry<K>>)}
            type='button'>
            ×
          </button>
        )}
      </div>
      <div className='flex items-center gap-2'>
        <NumberInput
          label='h'
          min={1}
          onChange={v => onChange({ h: v } as Partial<WidgetLayoutEntry<K>>)}
          placeholder='auto'
          value={layout.h}
        />
        {layout.h === undefined ? null : (
          <button
            className='text-[9px] text-muted-foreground hover:text-foreground'
            onClick={() => onChange({ h: undefined } as Partial<WidgetLayoutEntry<K>>)}
            type='button'>
            ×
          </button>
        )}
      </div>
      <label className='flex items-center gap-2 text-xs'>
        <input
          checked={layout.hidden ?? false}
          onChange={e =>
            onChange({
              hidden: e.target.checked || undefined
            } as Partial<WidgetLayoutEntry<K>>)
          }
          type='checkbox'
        />
        <span className='text-[9px]'>hidden</span>
      </label>
      <VisualControls
        className={layout.className ?? ''}
        onChange={v => onChange({ className: v || undefined } as Partial<WidgetLayoutEntry<K>>)}
      />
      <label className='flex flex-col gap-1 text-xs'>
        <span className='text-[9px] text-muted-foreground'>classes</span>
        <input
          className='h-6 w-full rounded border border-border bg-background px-1 text-[9px]'
          onChange={e =>
            onChange({
              className: e.target.value || undefined
            } as Partial<WidgetLayoutEntry<K>>)
          }
          placeholder='Tailwind classes'
          type='text'
          value={layout.className ?? ''}
        />
      </label>
    </div>
  )
}
interface CreatePanelComponentProps<K extends string> {
  store: Store<K>
}
const createPanelComponent = <K extends string>({ store }: CreatePanelComponentProps<K>) => {
  const PanelComponent = ({ children, renderGridControl, renderCopyButton }: PanelProps<K>): null | ReactElement => {
    const devMode = isDev(),
      state = useSyncExternalStore(store.subscribe, store.getState, store.getState),
      [copied, setCopied] = useState(false)
    if (!devMode) return null
    const { config, showDebugBorders, showDebugBg, containerWidth, itemKeys } = state,
      gap = config.gap ?? 0,
      snap = config.snap ?? 1,
      handleWidgetChange = (key: K, updates: Partial<WidgetLayoutEntry<K>>) => {
        if (updates.className) validateClassName(key, updates.className, false)
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
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      },
      handleReset = () => {
        store.reset()
      }
    if (children)
      return children({
        gridConfig: config,
        onCopy: handleCopy,
        onGridChange: handleGridChange,
        onReset: handleReset,
        onWidgetChange: handleWidgetChange,
        selectedWidget: state.selectedWidget,
        widgets: itemKeys
      })
    return (
      <div className='flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-primary/30 bg-primary/5 px-3 py-1.5'>
        {renderGridControl ? (
          renderGridControl(config, handleGridChange)
        ) : (
          <>
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
          </>
        )}
        <label className='flex items-center gap-1 text-[9px]'>
          <input
            checked={showDebugBorders}
            onChange={e => store.setState({ showDebugBorders: e.target.checked })}
            type='checkbox'
          />
          <span className='text-muted-foreground'>borders</span>
        </label>
        <label className='flex items-center gap-1 text-[9px]'>
          <input checked={showDebugBg} onChange={e => store.setState({ showDebugBg: e.target.checked })} type='checkbox' />
          <span className='text-muted-foreground'>bg</span>
        </label>
        <span className='text-[9px] text-muted-foreground'>{String(Math.round(containerWidth))}px</span>
        <div className='ml-auto flex items-center gap-1'>
          <button
            className='rounded bg-muted px-1.5 py-0.5 text-[9px] hover:bg-muted-foreground/20'
            onClick={handleReset}
            type='button'>
            reset
          </button>
          {renderCopyButton ? (
            renderCopyButton(handleCopy)
          ) : (
            <button
              className='rounded bg-primary px-1.5 py-0.5 text-[9px] text-primary-foreground hover:bg-primary/80'
              onClick={handleCopy}
              type='button'>
              {copied ? 'copied' : 'copy'}
            </button>
          )}
        </div>
      </div>
    )
  }
  PanelComponent.displayName = 'Panel'
  return PanelComponent
}
export { createPanelComponent, formatConfigForCopy, VisualControls, WidgetDevPanelContent }
