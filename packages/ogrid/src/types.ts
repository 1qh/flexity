import type { JSXElementConstructor, ReactElement } from 'react'
const BANNED_PREFIXES = [
  'w-',
  'h-',
  'size-',
  'min-w-',
  'max-w-',
  'min-h-',
  'max-h-',
  'absolute',
  'fixed',
  'sticky',
  'top-',
  'right-',
  'bottom-',
  'left-',
  'start-',
  'end-',
  'inset-',
  'float-',
  'clear-',
  'order-',
  'col-span',
  'col-start',
  'col-end',
  'row-span',
  'row-start',
  'row-end',
  'shrink',
  'grow',
  'basis-',
  'flex-1',
  'flex-2',
  'flex-3',
  'flex-4',
  'flex-5',
  'flex-6',
  'flex-7',
  'flex-8',
  'flex-9',
  'flex-auto',
  'flex-none',
  'flex-initial',
  'flex-[',
  'flex-grow',
  'flex-shrink',
  'flex-basis',
  'm-',
  'mx-',
  'my-',
  'mt-',
  'mr-',
  'mb-',
  'ml-',
  'ms-',
  'me-',
  'overflow-',
  'translate-',
  '-translate-',
  'scale-',
  'rotate-',
  'skew-',
  'transform',
  'hidden',
  'resize',
  'aspect-',
  'isolate',
  'isolation-'
] as const
type AllowedContent =
  | boolean
  | Iterable<AllowedContent>
  | null
  | number
  | ReactElement<unknown, JSXElementConstructor<unknown>>
  | string
  | undefined
type BannedClass<S extends string> = string extends S
  ? string
  : S extends { [K in BannedPrefix]: `${Before}${K}${string}` }[BannedPrefix]
    ? never
    : S
type BannedPrefix = (typeof BANNED_PREFIXES)[number]
// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
type Before = `${Sep}${Mod}` | `${string}${Sep}${Mod}`
interface GridConfig<K extends string = string> {
  gap?: number
  layout?: WidgetLayoutEntry<K>[]
  snap?: number
}
interface GridProps<K extends string = string> {
  className?: string
  config?: GridConfig<K>
  dragHandle?: string
  id?: string
  items: Record<K, AllowedContent>
  onConfigChange?: (config: GridConfig<K>) => void
  resizeHandle?: ReactElement
  strict?: boolean
}
type Mod = '!' | '!-' | '' | '-'
interface PanelProps<K extends string = string> {
  children?: (props: PanelRenderProps<K>) => null | ReactElement
  renderCopyButton?: (onCopy: () => void) => null | ReactElement
  renderGridControl?: (config: GridConfig<K>, onChange: (config: Partial<GridConfig<K>>) => void) => null | ReactElement
  renderWidgetControl?: (
    key: K,
    layout: WidgetLayoutEntry<K>,
    onChange: (entry: Partial<WidgetLayoutEntry<K>>) => void
  ) => null | ReactElement
}
interface PanelRenderProps<K extends string = string> {
  gridConfig: GridConfig<K>
  onCopy: () => void
  onGridChange: (config: Partial<GridConfig<K>>) => void
  onReset: () => void
  onWidgetChange: (key: K, entry: Partial<WidgetLayoutEntry<K>>) => void
  selectedWidget: K | null
  widgets: K[]
}
type Sep = '' | ' ' | ':'
interface WidgetLayoutEntry<K extends string = string> {
  className?: BannedClass<string>
  h?: number
  hidden?: boolean
  key: K
  w?: 'auto' | number
}
export { BANNED_PREFIXES }
export type { AllowedContent, BannedClass, GridConfig, GridProps, PanelProps, PanelRenderProps, WidgetLayoutEntry }
