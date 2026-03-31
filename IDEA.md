# ogrid

A pixel-level resizable dashboard grid for React. Zero config. Full control.

## Philosophy

- Zero config works great out of the box
- Every single thing is overridable
- One source of truth — styling lives in one place only
- Fail fast — throw instant errors in dev on violations
- Target latest only — no backwards compatibility
- Bundle everything — user installs one package
- Opinionated about minimal DOM — enforce it, not just recommend it
- Opinionated about Tailwind v4 — the styling language of the grid

## Stack

| Layer            | Tool                                | Why                                                                    |
| ---------------- | ----------------------------------- | ---------------------------------------------------------------------- |
| Layout           | Flexbox `flex-wrap: wrap` + `gap`   | Native flow, wrap, gap between items — no coordinate math              |
| Snap             | Resize event handler rounding       | `Math.round(w / snap) * snap` — works with any layout system           |
| Height           | Auto (DOM flow)                     | Content-driven, no explicit `h` needed                                 |
| Drag reorder     | @dnd-kit                            | Collision detection, accessibility, keyboard support, sortable lists   |
| Width resize     | re-resizable                        | Battle-tested resize handles, touch support, direction locking         |
| Styling          | Tailwind v4                         | Arbitrary values (`p-[13px]`), full CSS power, dark mode built-in      |
| Class merging    | tailwind-merge via `cn()`           | Dev panel edits merge with existing classes, custom classes preserved  |
| Animations       | CSS transitions + @dnd-kit built-in | Items shift smoothly on reorder and resize, no animation library       |
| Grid-Panel state | Plain JS store (Zustand-like)       | Created by `createGrid()`, bridged to React via `useSyncExternalStore` |

Not using:

- **react-grid-layout** — requires explicit heights, fights auto-sizing, uses absolute positioning
- **react-rnd** — freeform canvas, not flow layout
- **CSS grid `repeat(auto-fill, Npx)`** — gap applies between every column track, not between items. With fine-grained columns (e.g. 160 × 8px), `column-gap: 16px` adds 159 × 16px = 2544px of gaps. Flexbox gap only applies between items.

## Consumer DX

### Zero config

```tsx
import { createGrid } from 'ogrid'

const { Grid, Panel, reset } = createGrid()

const Dashboard = () => (
  <>
    <Grid
      items={{
        kpi: <KpiCard />,
        chart: <Chart />,
        table: <Table />
      }}
    />
    <Panel />
  </>
)
// reset() — clears store to initial state (for testing)
```

No config prop, no width, no height, no coordinates. Items flow left-to-right, wrap when full, height fits content. Dev mode activates automatically in `NODE_ENV === 'development'`.

Components inside items (`<KpiCard />`, `<Chart />`, etc.) can use any React features — `useState`, `useEffect`, `useQuery`, context, refs, everything. The grid does not restrict what runs inside widgets.

### After visual tuning

User resizes widgets in the browser, clicks copy, pastes into `config` prop. One copy, one paste:

```tsx
<Grid
  items={{
    kpi: <KpiCard />,
    chart: <Chart />,
    table: <Table />
  }}
  config={{
    gap: 16,
    snap: 8,
    layout: [
      { key: 'chart', w: 640 },
      { key: 'kpi', w: 320, className: 'pt-3 rounded-lg bg-muted' },
      { key: 'table', w: 960, h: 400, className: 'border border-border/50' }
    ]
  }}
/>
```

### Layout object per widget

```ts
// Each entry in config.layout array
type WidgetLayoutEntry<K extends string> = {
  key: K // must match an items key
  w?: number | 'auto' // omitted = full width, number = exact px, 'auto' = content width
  h?: number // omitted = content height, number = height cap in px (scrolls when exceeded)
  hidden?: boolean // hide widget without removing from layout
  className?: string // Tailwind classes (banned classes rejected at compile time via BannedClass)
}
```

- `w` omitted = fills available space (alone on row = full width, sharing row = equal split). `w: 640` = exact 640px, horizontal scroll if content wider. `w: 'auto'` = content width.
- `h` omitted = content height (auto). `h: 300` = capped at 300px, vertical scroll if content taller. `h` is intentionally short (not `maxH` or `height`) to keep the config clean — it acts as `max-height` under the hood, documented here and in JSDoc.
- No `x`, `y` — flexbox flow handles positioning from array order
- Array order in `layout` = display order. Items with layout entries display first (in array order), then items without layout entries (in `items` key order). Array order is bulletproof across JS, JSON, databases, and ORMs.
- `className` accepts any non-banned Tailwind class — full power for interior styling
- `hidden` is a typed field, not a Tailwind class (the class `hidden` is banned)
- Overflow behavior:
  - No `w` + no `h` → `overflow: visible` (tooltips/dropdowns never clipped)
  - `w: number` → `overflow-x: auto` (browser shows scrollbar only when needed)
  - `w: 'auto'` → `overflow: visible` (content determines width, capped by `max-width: 100%`)
  - `h` set → `overflow-y: auto` (scrollbar only when content exceeds cap)
  - Both `w: number` + `h` → both axes auto-scroll independently
- Four fields. No redundancy. No two ways to express the same thing.

### Grid props

```tsx
<Grid
  items={{...}}                    // required — what to render
  config={{...}}                   // optional — one paste from copy button
  id="dashboard"                   // optional — localStorage key (omit = no persistence)
  onConfigChange={setConfig}       // optional — called on any user change (resize, drag, style)
  dragHandle=".my-handle"          // optional — CSS selector for drag handle
  resizeHandle={<MyHandle />}      // optional — custom resize handle element
  className="p-4 bg-muted"        // optional — Tailwind classes on the flex container
/>
```

- `config` — single object from copy button. Contains gap, snap, layout. See GridConfig type below.
- `id` — unique identifier for localStorage persistence. If omitted, localStorage is disabled. Multiple grids need distinct IDs.
- `onConfigChange` — called only from user actions (resize stop, drag stop, dev panel edit). Never from internal normalization or prop changes. Receives the full `GridConfig` object. Use for backend persistence, undo/redo, analytics, etc. This prevents infinite loops in controlled mode.
- `dragHandle` — CSS selector for the drag handle within each item. Default: built-in grip icon at top-right, visible on hover.
- `resizeHandle` — custom React element for the width resize handle (right edge only — no height resize). Default: thin vertical bar, visible on hover.
- `className` — Tailwind classes on the flex container div.

### Controlled vs uncontrolled

- **Uncontrolled** (default): `config` prop sets initial defaults. User interactions update internal state. localStorage overrides `config` if `id` is provided.
- **Controlled**: pass `config` + `onConfigChange`. The grid always reflects `config`. User interactions call `onConfigChange` — the consumer updates `config` in response. localStorage is ignored when `onConfigChange` is provided.
- Reset button: in uncontrolled mode, clears localStorage and reverts to `config` prop. In controlled mode, calls `onConfigChange` with the original `config` prop value.

### GridConfig type

```ts
// WidgetLayoutEntry defined above in "Layout object per widget" section

interface GridConfig<K extends string> {
  gap?: number // space between items in px (default: 0, must be >= 0)
  snap?: number // resize step in px (default: 1, must be >= 1)
  layout?: WidgetLayoutEntry<K>[] // per-widget sizing, styling — array order = display order
}
```

`gap` and `snap` are grid-level. `layout` is per-widget as an ordered array. All optional — omit anything and defaults apply. `snap` must be >= 1, `gap` must be >= 0 (both throw in dev if invalid). If `snap` doesn’t divide evenly into `w`, the rendered width is the snapped value (`Math.round(w / snap) * snap`). Config stores the snapped value after user resize. Empty `items` (`{}`) renders an empty flex container — no error.

### Default width

When `w` is omitted from layout:

- If the item is alone on its row, it takes full width
- If multiple items on the same row omit `w`, they share remaining space equally (via `flex: 1 1 0%`)
- Once the user resizes, `w` is set and persisted

### Controlled mode example

```tsx
const { Grid, Panel } = createGrid()

const Dashboard = () => {
  const [config, setConfig] = useState<GridConfig<'kpi' | 'chart'>>()

  return (
    <Grid
      items={{ kpi: <KpiCard />, chart: <Chart /> }}
      config={config}
      onConfigChange={setConfig}
    />
  )
}
```

`onConfigChange` fires only from user actions (resize stop, drag stop, dev panel edit). Never from internal normalization. No infinite loops.

### Multiple grids example

```tsx
const dashboard = createGrid()
const sidebar = createGrid()

const Page = () => (
  <>
    <dashboard.Grid items={{ kpi: <KpiCard /> }} id="main" />
    <aside>
      <sidebar.Grid items={{ nav: <Nav /> }} id="side" />
    </aside>
    <dashboard.Panel />
  </>
)
```

Each `createGrid()` call creates an isolated instance. Panels only control their own grid.

### createGrid factory

```tsx
import { createGrid } from 'ogrid'

const { Grid, Panel } = createGrid()
```

- `createGrid()` creates a plain JS store (Zustand-like) and returns typed components bound to it
- `Grid` and `Panel` share state via closure over the store — no Provider wrapper needed
- Components are stable references — no unmount/remount risk
- Multiple grids = multiple `createGrid()` calls
- Called at module level (outside components), not inside render
- Must be in a `'use client'` file (frameworks with RSC like Next.js App Router)
- Takes no arguments — all config via `<Grid>` props (keeps copy/paste in one place)
- Store persists for app lifetime (module-level). No cleanup needed — dashboards are typically long-lived. For SPAs with many route-level grids, the memory cost is negligible (store is a small JS object per grid)
- For testing: `createGrid()` returns a `reset()` function that clears the store to initial state. Useful in test `beforeEach`/`afterEach`. In controlled mode, `reset()` calls `onConfigChange` with the initial config (consumer is the source of truth — the library notifies, the consumer decides). In uncontrolled mode, it clears localStorage and reverts to `config` prop defaults.

## Type Safety

### Grid props — layout keys constrained to item keys

```ts
function Grid<K extends string>(props: {
  items: Record<K, AllowedContent>
  config?: GridConfig<K>
  id?: string
  onConfigChange?: (config: GridConfig<K>) => void
  dragHandle?: string
  resizeHandle?: ReactElement
  className?: string
  strict?: boolean // default false. Controls DOM and class check enforcement only (console.error vs throw). Config validation errors (snap, gap, w, keys) always throw regardless.
}): ReactElement
```

TypeScript infers `K` from `items`, then `config.layout[].key` autocompletes and typos are type errors. Layout entries are optional — items without entries auto-size.

### Banned classes in layout.className blocked at compile time

```ts
const BANNED_PREFIXES = [
  // Sizing (use layout.w and layout.h)
  'w-',
  'h-',
  'size-',
  'min-w-',
  'max-w-',
  'min-h-',
  'max-h-',
  // Position (grid controls placement)
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
  // Float
  'float-',
  'clear-',
  // Grid placement
  'order-',
  'col-span',
  'col-start',
  'col-end',
  'row-span',
  'row-start',
  'row-end',
  // Flex sizing (flex-col, flex-row, flex-wrap are allowed)
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
  // Margin (grid controls spacing via gap prop, use padding for inner spacing)
  'm-',
  'mx-',
  'my-',
  'mt-',
  'mr-',
  'mb-',
  'ml-',
  'ms-',
  'me-',
  // Overflow (grid controls overflow based on w and h)
  'overflow-',
  // Transform (conflicts with drag)
  'translate-',
  '-translate-',
  'scale-',
  'rotate-',
  'skew-',
  'transform',
  // Visibility (use layout.hidden)
  'hidden',
  // Resize (conflicts with resize handles)
  'resize',
  // box-sizing NOT banned — grid enforces box-border internally
  'aspect-',
  'isolate',
  'isolation-'
  // 'container' banned via exact-match at runtime only (not prefix-based, not compile-time)
  // because prefix 'container' would also catch 'container-type-*' which is allowed
  // NOTE: 'container' will pass compile-time checks but throw at runtime in dev
] as const

type BannedPrefix = (typeof BANNED_PREFIXES)[number]

// A class token can appear after: start, space, or colon (variant prefix)
// It can be prefixed with: nothing, ! (important), - (negative), or !- (both)
type Mod = '' | '!' | '-' | '!-'
type Sep = '' | ' ' | ':'
type Before = `${Sep}${Mod}` | `${string}${Sep}${Mod}`

// Intersection ensures ONE banned prefix match makes the whole string `never`
// When C is generic `string` (inference failed), fall back to string (allow anything, rely on runtime)
type BannedClass<S extends string> = string extends S
  ? string
  : S extends { [K in BannedPrefix]: `${Before}${K}${string}` }[BannedPrefix]
    ? never
    : S
```

The `string extends S` check: when TypeScript widens `S` to `string` (inference failed), `BannedClass` returns `string` (allows anything). When `S` is a literal like `'pt-3 w-full'`, it checks against banned prefixes. Banned prefixes are matched at class token boundaries only (start of string, after space, after colon) — not as substrings within a class name. `bg-gradient-to-r` does not match banned prefix `t-` because `to-r` appears after a hyphen, not after a separator. Runtime regex check uses the same word-boundary logic.

```tsx
// type error — banned classes detected
config={{ layout: [{ key: 'kpi', className: 'pt-3 w-[320px]' }] }}    // sizing
config={{ layout: [{ key: 'kpi', className: 'absolute top-0' }] }}      // positioning
config={{ layout: [{ key: 'kpi', className: 'm-4 pt-3' }] }}           // margin
config={{ layout: [{ key: 'kpi', className: 'overflow-hidden' }] }}     // overflow
config={{ layout: [{ key: 'kpi', className: 'sm:w-full' }] }}           // variant prefix
config={{ layout: [{ key: 'kpi', className: '!w-full' }] }}             // important modifier
config={{ layout: [{ key: 'kpi', className: '-m-4' }] }}                // negative value

// compiles
config={{ layout: [{ key: 'kpi', className: 'shadow-lg rounded-xl bg-muted' }] }}
config={{ layout: [{ key: 'kpi', className: 'pt-3 pb-6 border border-border/50' }] }}
config={{ layout: [{ key: 'kpi', className: 'flex gap-2 items-center' }] }}
config={{ layout: [{ key: 'kpi', className: 'relative z-10' }] }}             // interior positioning OK
config={{ layout: [{ key: 'kpi', className: 'grid grid-cols-2 gap-4' }] }}    // interior grid OK
config={{ layout: [{ key: 'kpi', className: 'opacity-50 blur-sm' }] }}
```

Banned categories:

- Sizing: `w-*`, `h-*`, `size-*`, `min-w-*`, `max-w-*`, `min-h-*`, `max-h-*`
- Position: `absolute`, `fixed`, `sticky`, `top-*`, `right-*`, `bottom-*`, `left-*`, `start-*`, `end-*`, `inset-*` (but NOT `relative` or `static` — `relative` is needed for interior positioning, `static` is the CSS default and harmless)
- Float: `float-*`, `clear-*`
- Grid placement: `col-span*`, `col-start*`, `col-end*`, `row-span*`, `row-start*`, `row-end*`, `order-*`
- Flex sizing: `shrink`, `grow`, `basis-*`, `flex-1`, `flex-auto`, `flex-none`, `flex-initial`, `flex-[*]`, `flex-grow*`, `flex-shrink*`, `flex-basis*` (all flex sizing variants including arbitrary values)
- Margin: `m-*`, `mx-*`, `my-*`, `mt-*`, `mr-*`, `mb-*`, `ml-*`, `ms-*`, `me-*` (grid controls spacing via `gap`, use padding)
- Overflow: `overflow-*`, `overflow-x-*`, `overflow-y-*` (grid controls overflow based on `w` and `h`)
- Transform: `transform`, `translate-*`, `scale-*`, `rotate-*`, `skew-*` (conflicts with drag)
- Visibility: `hidden` (use layout `hidden` field. `visible`/`invisible`/`collapse` are allowed — they control CSS visibility without affecting layout flow)
- Resize: `resize`, `resize-x`, `resize-y` (conflicts with resize handles)
- Box model: grid enforces `box-border` internally on every wrapper — `w` always means outer dimension. `box-*` classes are not banned but overridden by the grid.
- Aspect ratio: `aspect-*` (banned on the grid wrapper — would conflict with auto-height and create ambiguity if combined with `h`. Consumers who need aspect ratio should handle it inside their component, not on the wrapper.)
- Container: `container` (Tailwind’s max-width utility — banned via exact-match at runtime. `container-type-*` for CSS containment is allowed)
- Isolation: `isolate`, `isolation-*`
- All of the above with variant prefixes (`sm:`, `hover:`, `dark:`, etc.), important (`!`), and negative (`-`) modifiers

Allowed (styles wrapper interior):

- Position: `relative` (positioning context for children), `static` (CSS default, undo `relative`)
- Z-index: `z-*` (needed for dropdowns, tooltips inside widgets)
- Display: `flex`, `inline-flex`, `grid`, `inline-grid`, `block`, `inline-block`, `inline`, `table`, `contents`, `flow-root`, `list-item`
- Flex direction/wrap: `flex-col`, `flex-row`, `flex-col-reverse`, `flex-row-reverse`, `flex-wrap`, `flex-nowrap`, `flex-wrap-reverse`
- Grid template: `grid-cols-*`, `grid-rows-*`, `auto-cols-*`, `auto-rows-*`, `grid-flow-*`
- Alignment: `items-*`, `justify-*`, `content-*`, `place-*`, `self-*`, `justify-items-*`, `justify-self-*`
- Gap: `gap-*`, `gap-x-*`, `gap-y-*` (interior gap between widget’s children)
- Child spacing: `space-x-*`, `space-y-*`
- Padding: `p-*`, `px-*`, `py-*`, `pt-*`, `pr-*`, `pb-*`, `pl-*`, `ps-*`, `pe-*`
- Border width/style/color/radius: `border`, `border-2`, `border-t-*`, `border-solid`, `border-dashed`, `rounded-*`, `border-{color}`, `divide-*`
- Typography: all (`font-*`, `text-*`, `tracking-*`, `leading-*`, `truncate`, etc.)
- Colors: all (`text-{color}`, `bg-{color}`, `accent-*`, `caret-*`)
- Background: all (`bg-gradient-*`, `from-*`, `via-*`, `to-*`, `bg-cover`, etc.)
- Shadows: `shadow-*`
- Opacity: `opacity-*`
- Outline/ring: `outline-*`, `ring-*`
- Filters: `blur-*`, `brightness-*`, `contrast-*`, `grayscale-*`, `backdrop-*`, etc.
- Transitions: `transition-*`, `duration-*`, `ease-*`, `delay-*`, `animate-*`
- Cursor: `cursor-*`
- Pointer events: `pointer-events-*`, `select-*`, `touch-*`
- Container queries: `container-type-*` (CSS containment for `@container` queries — NOT the Tailwind `container` class which is banned)
- Scroll: `scroll-*`, `snap-*`
- Visibility: `visible`, `invisible`, `collapse` (CSS visibility, not display)
- Box decoration: `box-decoration-clone`, `box-decoration-slice` (visual, not box model)
- SVG: `fill-*`, `stroke-*`
- Screen reader: `sr-only`, `not-sr-only`

### Intrinsic elements blocked at compile time

```ts
type AllowedContent =
  | boolean
  | null
  | number
  | string
  | undefined
  | ReactElement<unknown, JSXElementConstructor<any>>
  | ReactElement<unknown, typeof Fragment>
```

`JSXElementConstructor` excludes intrinsic elements. `<div>`, `<span>`, `<hr />`, etc. cause type errors — even leaf/void elements. If a consumer needs a bare HTML element as a widget, wrap it in a component. Fragments and `null` (for conditional rendering) are allowed.

```tsx
// type error — intrinsic elements, even leaf/void ones
items={{ kpi: <div>text</div> }}
items={{ kpi: <hr /> }}
items={{ kpi: <canvas /> }}

// compiles
items={{ kpi: <KpiCard /> }}
items={{ kpi: 'hello' }}
items={{ kpi: <><A /><B /></> }}
items={{ kpi: showKpi ? <KpiCard /> : null }}  // conditional rendering OK
items={{ kpi: showKpi && <KpiCard /> }}        // also OK — false is AllowedContent
```

Note: the runtime DOM check allows leaf elements rendered BY components. The type check is stricter — it blocks intrinsic elements as direct items. Both layers are intentionally strict at different boundaries.

### Copy output is directly pasteable

Copy button writes the `config` object to clipboard as a JavaScript object literal (not JSON — unquoted keys). Consumer pastes it directly into the `config` prop. One copy, one paste. TypeScript validates immediately.

```ts
// clipboard content — paste into config prop
{
  gap: 16,
  snap: 8,
  layout: [
    { key: 'chart', w: 640 },
    { key: 'kpi', w: 320, className: 'pt-3 rounded-lg bg-muted' },
    { key: 'table', w: 960, h: 400, className: 'border border-border/50' },
  ],
}
```

Keys that aren’t valid JS identifiers are quoted: `{ key: 'my-widget' }`, `{ key: '123' }`.

### Compile-time class validation caveat

The `BannedClass` template literal type works when TypeScript infers literal string types. When inference fails (TypeScript widens to `string`), `BannedClass` falls back to `string` (allows anything) and the runtime check catches violations instead. Both layers exist for defense in depth — the runtime check is the reliable safety net.

## Strict Rules and Prohibitions

Three enforcement layers: TypeScript (compile time), runtime DOM check (dev only), tests.

### Layer 1: TypeScript — compile time

Intrinsic elements as direct items are type errors:

```tsx
items={{ kpi: <div>anything</div> }}     // type error
items={{ kpi: <span>anything</span> }}   // type error
items={{ kpi: <section>anything</section> }} // type error
```

### Layer 2: Runtime DOM check — dev mode, after render

The grid inspects the **root element** of each item’s rendered content. Only the root — not recursive. Internal DOM structure of components is their own concern.

How it works: the grid wraps each item in a wrapper div (needed for width/overflow/resize anyway). After mount, it reads `wrapper.firstElementChild` to get the item’s root DOM element. If `firstElementChild` is null (string/number items produce text nodes only), the DOM check is skipped.

**Rule: root element with zero attributes and has children**

```tsx
// throws — bare div wrapping children, should be a fragment
const Bad = () => (
  <div>
    <A />
    <B />
  </div>
)
// fix
const Good = () => (
  <>
    <A />
    <B />
  </>
)

// fine — bare element with no children (leaf/void elements like canvas, br, hr, img, input)
const Ok = () => <canvas />
```

**Rule: root element with exactly one child element (regardless of attributes)**

```tsx
// throws — single-child wrapper, even with attributes. Move styling to layout.className.
const Bad = () => (
  <div className="p-4">
    <KpiCard />
  </div>
)
const Bad = () => (
  <article className="card">
    <Content />
  </article>
)
// fix
const Good = () => <KpiCard /> // className: 'p-4' goes in layout
const Good = () => <Content /> // className: 'card' goes in layout
```

**Rule: root element wrapping only text with no attributes**

```tsx
// throws — bare element wrapping text, pass text directly
const Bad = () => <div>hello</div>
// fix
items={{ kpi: 'hello' }}

// fine — element wrapping text WITH attributes (semantic purpose)
const Ok = () => <code className="font-mono">hello</code>
```

**Valid root patterns:**

```tsx
// element with attributes AND multiple children
const Ok = () => (
  <div className="flex gap-2">
    <A />
    <B />
  </div>
)

// leaf element (no children) — always valid regardless of attributes
const Ok = () => <canvas />
const Ok = () => <img src="..." alt="..." />

// interior DOM is NOT checked — components own their internal structure
const Ok = () => (
  <div className="flex">
    <div>
      <Icon />
    </div>{' '}
    {/* bare wrapper inside — not our concern */}
    <span>text</span>
  </div>
)
```

**Rule: no banned classes in layout.className**

All banned patterns are enforced at two layers:

1. Compile time — `BannedClass` template literal type rejects literal strings
2. Runtime (dev only) — regex check using `BANNED_PREFIXES` array catches dynamic values. Entries are regex-escaped before use (e.g., `flex-[` becomes `flex-\[`).

**Rule: no nested grids**

Grid wraps children in a React context. On mount, checks for ancestor Grid context. If found, throws.

### Layer 3: Tests

Every violation pattern has a test proving it throws. Every valid pattern has a test proving it doesn’t.

Test categories:

- **Type tests** — `tsd` or `@ts-expect-error` tests proving banned classes and intrinsic elements are type errors
- **Runtime DOM violation tests (root element only)** — render with violations: assert `console.error` fires by default, assert throws when `strict={true}`
  - Root bare `div` wrapping multiple children (zero attributes + has children)
  - Root element with attributes but single child element
  - Root bare element wrapping only text (zero attributes + text only)
  - Valid component that renders bare root DOM internally (wrapper component)
  - `memo()` wrapped component with bare root
  - `forwardRef()` wrapped component with bare root
  - `lazy()` loaded component with bare root
  - Component inside `Suspense` with bare fallback root
- **Runtime DOM valid tests (should NOT throw)**
  - Root element with attributes and multiple children
  - Root leaf element with no children (`canvas`, `img`, `hr`, `br`, `input`)
  - Root element wrapping text WITH attributes (`<code className="...">text</code>`)
  - Component with internal bare wrappers (not checked — interior is not our concern)
- **Runtime class violation tests** — assert banned class strings fire `console.error` by default, throw when `strict={true}`
  - Every banned prefix
  - With variant prefixes: `sm:`, `md:`, `lg:`, `hover:`, `focus:`, `dark:`, `group-hover:`
  - With `!` important modifier
  - With `-` negative modifier
  - Combined: `sm:!-m-4`
- **Valid pattern tests** — assert these do NOT throw
  - Components as items
  - Fragments as items
  - Strings and numbers as items
  - Components that render meaningful DOM (with attributes + multiple children)
  - All allowed Tailwind classes in layout.className (including `relative`, `z-*`)
  - Allowed classes with variant prefixes
- **Layout type tests** — assert layout keys autocomplete and mismatch errors
- **Behavior tests** — drag reorder, resize snap, auto-height, localStorage persistence, copy output format, onConfigChange callback, controlled vs uncontrolled mode
- **Nesting tests** — Grid inside Grid item throws
- **Input validation tests** — `snap: 0` throws, `snap: -1` throws, `gap: -1` throws, `w: 0` throws, empty key throws, duplicate layout keys throws
- **Edge cases** — empty items, single item, all items hidden, item added dynamically, item removed, `w: 0`, rapid resize, rapid drag, localStorage quota exceeded, string/number items with drag/resize handles

## Dev Panel

### Architecture

- Separate `<Panel />` component from `createGrid()`
- Connected to Grid via shared store (closure from `createGrid()`)
- User places it wherever — sidebar, drawer, floating, overlay
- Activates automatically in `NODE_ENV === 'development'`
- In production, Panel renders null (code is shipped but not executed — use separate import `ogrid/panel` for true tree-shaking if bundle size matters)

### Customization

Panel is headless — it provides the data and controls, consumer provides the UI:

```tsx
// Default: built-in panel UI
<Panel />

// Custom: render prop with full control
<Panel>
  {({ selectedWidget, widgets, gridConfig, onWidgetChange, onGridChange, onCopy, onReset }) => (
    // consumer's own UI
  )}
</Panel>

// Partial: override specific sections
<Panel
  renderWidgetControl={(key, layout, onChange) => <MyControl ... />}
  renderGridControl={(config, onChange) => <MyGridControl ... />}
  renderCopyButton={(onCopy) => <MyButton onClick={onCopy} />}
/>
```

### What the panel controls

Per-widget (selected by clicking a widget):

- `w` — width in pixels (number input) with a reset-to-auto button
- `h` — height cap in pixels (number input) with a clear button (removes cap, reverts to auto-height)
- `hidden` — toggle
- Tailwind class editor — common properties have visual controls, custom classes preserved via `cn()`

No height resize handle — height is content-driven by design. Set `h` via the dev panel number input to cap it.

Visual controls for common Tailwind properties:

- Padding: pt, pb, pl, pr
- Layout: flex direction, gap, align, justify
- Visual: rounded, opacity, bg, border style/color, shadow
- Typography: font size, line height, letter spacing, text color
- Misc: hidden

Grid-level:

- `gap` — space between items
- `snap` — resize step size
- Grid background toggle (visualize item boundaries)
- High-contrast border toggle (debug widget boundaries)
- Reset button (uncontrolled: clears localStorage; controlled: calls onConfigChange with original config)
- Copy button (copies config object to clipboard)

### Widget item list

The dev panel shows a list of all widgets by key, including hidden ones. Users can:

- Click a widget in the list or in the grid to select it
- Toggle hidden on any widget from the list
- See which widgets have custom layout vs defaults

### Tailwind class merging

Dev panel builds a class string from visual controls. Merges with existing `className` in layout via `cn()` (tailwind-merge). Non-conflicting custom classes are preserved:

```
existing:   'pt-3 space-y-4 bg-gradient-to-r from-blue-500'
dev edits:  'pt-5 rounded-xl'
cn() output: 'pt-5 space-y-4 bg-gradient-to-r from-blue-500 rounded-xl'
```

pt-3 replaced by pt-5 (conflict resolved). Everything else kept. The merged result is re-validated against banned classes at runtime before being applied.

### Copy output

One click copies the full `config` object. Consumer pastes it into the `config` prop. One copy, one paste:

```ts
{
  gap: 16,
  snap: 8,
  layout: [
    { key: 'chart', w: 640 },
    { key: 'kpi', w: 320, className: 'pt-3 rounded-lg bg-muted' },
    { key: 'table', w: 960, h: 400, className: 'border border-border/50' },
  ],
}
```

Array order reflects the current drag order. `className` is the merged result of original config + dev panel edits (via `cn()`). All visual tuning merged into `className`. Properties at default values are omitted for clean output. Grid-level props (`gap`, `snap`) included only if changed from defaults.

## Behavior

### Sizing

- Width: `w` omitted = fills available space. `w: number` = exact pixels, capped by container width (`max-width: 100%` — responsive by default). `w: 'auto'` = content width, capped by container.
- Height: `h` omitted = content height (auto). `h: number` = `max-height: <h>px` — widget is shorter if content is shorter (it’s a cap, not exact height). Scrolls vertically when content exceeds cap.
- Overflow: `overflow: visible` when widget has no `w` (number) and no `h`. `overflow-x: auto` when `w` is a number (browser handles scrollbar visibility). `overflow-y: auto` when `h` is set. Both can coexist.
- Box sizing: grid enforces `box-sizing: border-box` on every wrapper. `w: 320` with `p-4 border-2` renders at exactly 320px outer width.

### Flow layout

- Flexbox container: `display: flex; flex-wrap: wrap; align-items: flex-start; gap: <gap>px`
- `w: number` → `width: <w>px; max-width: 100%; flex-shrink: 0; box-sizing: border-box; overflow-x: auto` (never wider than container — responsive by default)
- `w: 'auto'` → `width: fit-content; max-width: 100%; flex-shrink: 0`
- No `w` → `flex: 1 1 0%; min-width: 0` (if alone on row = full width, if sharing = equal split)
- `h: number` → `max-height: <h>px; overflow-y: auto`
- Items flow left-to-right, wrap to next row when they don’t fit
- No coordinate system, no compaction algorithm
- Drag reorder changes the item order, layout reflows automatically

### Width resize

- Resize handle on the right edge of each widget (via re-resizable)
- Snaps to the `snap` step size: `Math.round(w / snap) * snap`
- `snap` must be >= 1. Values < 1 throw in dev.
- Updates `w` in layout state
- Other items reflow in response (flexbox handles this)
- Minimum width: snap value (can’t resize below 1 snap unit). During resize, if snapping would produce 0, clamp to snap value instead.
- `w` values in config are validated after snapping: `Math.round(w / snap) * snap`. If result is 0, throws. Fractional `w` (e.g., `w: 0.4`) is snapped first, then validated.
- Resizing a `w: 'auto'` item converts it to a fixed pixel width. Starting width for snap is read from `getBoundingClientRect().width` at resize start.
- Resize reflow is instant — when resizing causes items to wrap to the next row, they jump (no animation). Drag reorder has smooth animations via @dnd-kit.
- No enter/exit animations — items appear and disappear instantly when added/removed from `items`. Consumers can add transitions inside their components if needed.

### Drag reorder

- Drag handle on each widget
- Default: small grip icon at top-right, visible on hover
- Customizable via `dragHandle` prop on Grid (CSS selector)
- @dnd-kit sortable handles reorder with smooth animations
- New order reflected in the `layout` key order
- Collision detection prevents impossible drops
- During drag: dragged item gets elevated z-index, placeholder shows drop position

### Resize handle

- Positioned at the right edge of each widget
- Default: thin vertical bar, visible on hover, cursor changes to `col-resize`
- Customizable via `resizeHandle` prop on Grid (ReactElement). re-resizable clones the element and forwards interaction props (drag state, direction). The consumer’s element receives these as props automatically.
- re-resizable handles all interaction (mouse, touch, pointer events)

### localStorage persistence

- User customizations (drag order, resize, style changes) persist in localStorage
- Key format: `ogrid-<id>` where `id` is the Grid’s `id` prop
- If `id` is not provided, localStorage is disabled — no persistence
- Uncontrolled mode: localStorage overrides `config` prop. Reset button clears localStorage.
- Controlled mode (`onConfigChange` provided): localStorage is ignored. `id` prop is ignored. All state comes from `config` prop.
- If both `id` and `onConfigChange` are provided, controlled mode wins — `id` is silently ignored (localStorage not used).
- localStorage `QuotaExceededError`: caught internally, logged as warning in dev, grid continues without persistence.

### Dynamic items

- Items can be added or removed at runtime (change the `items` prop)
- Added items: appear at the end of the flow, auto-sized, no layout entry needed
- Removed items: corresponding layout entry is ignored (not an error)
- Layout entries for non-existent items are silently ignored — no stale key cleanup needed
- Renamed keys: old localStorage/layout data is orphaned (not migrated automatically)
- First interaction with an auto-sized item (drag or resize): a layout entry is created for it. `onConfigChange` emits the full config including the new entry. Items go from implicit (no entry) to explicit (has entry) on first user interaction.
- `items` object keys are used as React `key` props on the wrapper divs. Stable keys ensure components preserve state across re-renders and drag reorder.

### Hidden items

- `hidden: true` → `display: none` in production, item removed from flow
- In dev mode: hidden items render with reduced opacity and a “hidden” label, still visible and clickable
- The dev panel lists all items (including hidden ones) — user can toggle `hidden` from the panel
- Copy output: hidden items are included with `{ hidden: true }` plus any other non-default properties

### Wrapper DOM structure

Each item is wrapped in a single div by the grid:

```html
<div
  class="ogrid"
  style="display:flex; flex-wrap:wrap; align-items:flex-start; gap:16px"
>
  <div class="ogrid-item pt-3 rounded-lg bg-muted" style="width:320px">
    <!-- drag handle (default or custom) -->
    <!-- resize handle (default or custom) -->
    <!-- consumer's component -->
    <KpiCard />
  </div>
  <div class="ogrid-item" style="flex:1 1 0%">
    <Chart />
  </div>
</div>
```

The `className` from layout is applied to the `ogrid-item` div via `cn()`. The grid’s internal classes are merged first, consumer’s classes come last (consumer wins on conflicts).

### Primitive items

- `string` / `number` — rendered as text nodes inside the wrapper div. Drag handle and resize handle attach to the wrapper.
- `null` / `undefined` / `false` — render nothing. Wrapper div is still created but empty. Item takes no visual space (flex item with no content collapses). Useful for conditional rendering: `items={{ kpi: showKpi && <KpiCard /> }}`.
- `true` — treated same as `null` (React ignores booleans in render output).

## Error Messages

Every violation produces a clear, actionable message:

| Violation                       | Message                                                                                                                                |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Intrinsic element in items      | TypeScript type error (compile time only — no runtime check)                                                                           |
| Root wrapper with no attributes | `[ogrid] Item 'kpi': root <div> has no attributes and has children. Use a fragment (<>...</>) instead.`                                |
| Root single-child wrapper       | `[ogrid] Item 'kpi': root <div> wraps a single child. Remove the wrapper and pass content directly. Move styling to layout.className.` |
| Root bare text wrapper          | `[ogrid] Item 'kpi': root <div> wraps only text with no attributes. Pass the text directly as a string.`                               |
| Banned class in layout          | `[ogrid] Item 'kpi': 'w-[320px]' is not allowed in layout.className. Use layout.w instead.`                                            |
| Banned class (variant)          | `[ogrid] Item 'kpi': 'sm:w-full' is not allowed in layout.className. Size classes are banned even with variant prefixes.`              |
| Nested grid                     | `[ogrid] Nested grids are not supported. Remove the inner <Grid> from item 'main'.`                                                    |
| Invalid snap                    | `[ogrid] snap must be >= 1. Received: 0` (throws — invalid config, cannot proceed)                                                     |
| Invalid gap                     | `[ogrid] gap must be >= 0. Received: -10` (throws — invalid config, cannot proceed)                                                    |
| Zero width                      | `[ogrid] Item 'kpi': w must be > 0 or 'auto'. Received: 0` (throws — invalid config)                                                   |
| Empty key                       | `[ogrid] Item key must be a non-empty string. Found empty string key.` (throws — invalid config)                                       |
| Duplicate layout key            | `[ogrid] Duplicate key 'kpi' in layout array. Each key must appear once.` (throws — invalid config)                                    |

Config validation errors (snap, gap, w, keys) throw because the grid cannot function with invalid config. DOM and class violations use `console.error` because the grid can still render — they’re quality warnings, not fatal errors.

All errors are prefixed with `[ogrid]` for easy filtering. Runtime errors only in `NODE_ENV === 'development'`.

Violations in dev mode use `console.error` with the `[ogrid]` prefix — they do NOT throw. The grid still renders with the violating content visible. This allows iterative fixing without breaking the entire page. For strict enforcement (throw on violations), set `strict` prop on Grid.

## Responsive Behavior

- Items have pixel widths — on smaller containers, items wrap to the next row
- Flexbox `flex-wrap: wrap` handles this natively — no JS resize handler needed
- If a single item’s `w` exceeds the container width, it’s capped to container width via `max-width: 100%`
- Snapping reports the capped value, not the raw value
- No breakpoint system — pixel-level control is the point
- The dev panel shows a “container width” indicator so the user knows the available space
- RTL: flexbox respects `dir="rtl"` natively — items flow right-to-left

## Accessibility

- @dnd-kit provides keyboard navigation for drag reorder (arrow keys, Enter, Escape)
- re-resizable supports touch events for mobile resize
- Drag handles have proper ARIA attributes (`role="button"`, `aria-label`, `aria-roledescription="sortable"`)
- Tab order follows visual order (DOM order matches flex order)
- Screen reader announcements for drag start/end/reorder via @dnd-kit’s announcements API
- Keyboard resize: focus the resize handle, use left/right arrow keys to adjust width by `snap` increments, Shift+arrow for 5x snap. Custom-built on top of re-resizable (re-resizable does not support keyboard resize natively).

## SSR

- `createGrid()` must be called in a `'use client'` module — it creates a store that must not be shared across SSR requests
- `Grid` and `Panel` are client components internally
- Grid renders items with full-width default on first render (no `w` = `flex: 1 1 0%`)
- No hydration mismatch — localStorage is read in `useEffect`, not during initial render
- Drag, resize handles attach in `useEffect` (client only)
- Server render produces a valid static layout — items stack full-width, no interactivity

## Performance

- Designed for dashboards with tens of items (10–50 widgets)
- No virtualization — all items are in the DOM
- Each item adds: 1 wrapper div, 1 drag handle, 1 resize handle to the DOM
- For 100+ items, consider splitting into multiple grids or paginating
- Grid subscribes to the store via `useSyncExternalStore`. Item wrappers are NOT `React.memo`’d — React elements are new references every render, making `memo` on wrappers that receive JSX children ineffective. React’s own reconciliation handles diffing efficiently. Consumer components can optimize with `memo()` on their own components if needed.
- HMR: most bundlers (Vite, webpack) preserve module-level state through hot reloads. If state is lost on HMR, the grid re-initializes from `config` prop.

## Package Exports

```ts
// Main export
export { createGrid } from 'ogrid'

// Types (for consumers who need them)
export type {
  WidgetLayoutEntry,
  GridConfig,
  AllowedContent,
  BannedClass,
  GridProps,
  PanelProps,
  PanelRenderProps
} from 'ogrid'

// Panel is not exported standalone — it's bound to a store via createGrid()
// In production, Panel renders null. The code is shipped but not executed.
```

Single entry point for most consumers. `createGrid` is the only runtime export needed.

## Demo App

Single page, comprehensive stress test. Uses shadcn components from `lib/ui` (read-only, copied from `~/z/noboil/lib/ui` — never modify directly).

### Chart widgets (all from shadcn/recharts, with legends, tooltips, hover, animations)

- Bar chart (vertical, horizontal, stacked, grouped)
- Line chart (multi-line, curved, with reference lines)
- Area chart (stacked, gradient fill)
- Pie chart (with labels, donut variant)
- Radar chart
- Radial chart (progress ring)
- Sparklines (inline mini charts)

### Data display widgets

- KPI cards (value, label, trend indicator, sparkline)
- Stats grid (multiple metrics in one widget)
- Table with sorting, pagination, sticky headers
- Data table with column visibility, filtering
- Progress bars (multiple variants)
- Badge groups
- Avatar stacks
- Calendar (month view with events)
- Timeline / activity feed

### Interactive widgets

- Tabs with content panels
- Accordion / collapsible sections
- Command palette / combobox
- Form with inputs, selects, switches, sliders
- Toggle group / segmented control
- Date picker / date range picker
- Skeleton loading states (toggle to simulate loading)

### Layout widgets

- Empty state (icon + message)
- Separator / divider
- Scroll area with long content
- Resizable text block (prose content)

Every widget is a separate component in the demo. Each is a valid ogrid item — no bare divs, no single-child wrappers. The demo page uses zero config initially, then the README shows the copy-paste workflow.

### Demo structure

```
apps/
  demo/
    src/
      app/
        page.tsx          # single page with <Grid items={...} />
      widgets/
        bar-chart.tsx
        line-chart.tsx
        area-chart.tsx
        pie-chart.tsx
        radar-chart.tsx
        radial-chart.tsx
        sparkline.tsx
        kpi-card.tsx
        stats-grid.tsx
        data-table.tsx
        progress-bars.tsx
        badges.tsx
        avatars.tsx
        calendar.tsx
        timeline.tsx
        tabs-panel.tsx
        accordion.tsx
        command.tsx
        form.tsx
        toggle-group.tsx
        date-picker.tsx
        skeleton.tsx
        empty-state.tsx
        scroll-content.tsx
        prose.tsx
    lib/
      ui/               # read-only, copied from ~/z/noboil/lib/ui
```

## Repo Structure

Monorepo (turborepo + bun), same structure as the monitor repo:

```
ogrid/
  packages/
    ogrid/          # the npm package
      src/
        index.ts        # entry point, exports createGrid + types
        grid.tsx        # Grid component
        panel.tsx       # Panel component (dev only)
        store.ts        # plain JS store (Zustand-like)
        types.ts        # WidgetLayoutEntry, AllowedContent, BannedClass, GridConfig
        validation.ts   # runtime DOM checks + class checks
        storage.ts      # localStorage persistence
        cn.ts           # tailwind-merge wrapper
      package.json
      tsconfig.json
  apps/
    demo/           # demo app showing usage
      src/
        app/
          page.tsx  # basic usage
  turbo.json
  package.json
```

## Implementation Guide

### Setup

1. Monorepo with turborepo + bun, same structure as `~/vb/monitor`
2. Copy `lib/ui` from `~/z/noboil/lib/ui` (read-only — never modify)
3. Adopt lintmax from `~/z/lintmax` — pre-commit hook: `bun clean && bun i && bun fix`
4. All deps use `latest` tag — no pinned versions, no lockfile in repo
5. `bun fix` must pass before every commit

### Build order

1. Types — `WidgetLayoutEntry`, `GridConfig`, `AllowedContent`, `BannedClass`, `BANNED_PREFIXES`
2. Store — `createGrid()` factory, plain JS store with `useSyncExternalStore` bridge
3. Grid component — flexbox container, wrapper divs, width modes, overflow, box-sizing
4. Resize — re-resizable integration, snap, keyboard resize
5. Drag reorder — @dnd-kit sortable, stable React keys, smooth animations
6. Validation — runtime DOM checks (root element), class checks (BANNED_PREFIXES + `container` exact match), `strict` prop
7. Persistence — localStorage (uncontrolled), `onConfigChange` (controlled), `reset()`
8. Panel — dev controls, widget list, visual Tailwind editors, `cn()` merging, copy button
9. Demo app — single page, 30+ widgets from shadcn (all chart types with legends/tooltips/hover, data tables, forms, calendars, interactive controls)
10. Tests — every category from the test plan below

### Verification

- `bun fix` passes
- `bun build` passes
- Demo runs and all widgets render, drag, resize
- All tests pass

## Linting

**lintmax** adopted from day one. Source at `~/z/lintmax`. Pre-commit hook runs `bun clean && bun i && bun fix`. All code must pass lintmax before commit. See `CLAUDE.md` for full linting rules, ignore syntax, and safe-to-ignore rules.

## Peer Dependencies

- react (latest)
- react-dom (latest)
- tailwindcss v4

## Bundled Dependencies (consumer doesn’t install)

- @dnd-kit/core
- @dnd-kit/sortable
- @dnd-kit/utilities
- re-resizable
- tailwind-merge

## Intentionally Opinionated (FAQ)

These decisions are **deliberate, thoroughly debated, and final**. They reflect the library’s philosophy: strictness over flexibility, one source of truth, minimal DOM, clean code. Reviewers and contributors: do not reopen these. They are not oversights — they are the product.

**Why ban intrinsic elements as items (`<div>`, `<hr />`, `<canvas />`)?** Forces consumers to use components. Even `const MyCanvas = () => <canvas />` is one line. The friction is intentional — it catches bare wrappers at the type level before they reach the DOM check. If your widget is a bare HTML element, wrapping it in a component is trivially easy and makes the grid’s ownership boundary explicit. The type system is stricter than the runtime check on purpose — the type layer blocks ALL intrinsic elements, the runtime layer only blocks wasteful patterns. Two intentionally different strictness levels at two different boundaries.

**Why throw on single-child root elements (even with attributes)?** If a component renders `<div className="p-4"><Content /></div>`, the `p-4` belongs in `layout.className`. The grid’s wrapper div provides the styling surface — consumers should not add their own. This forces one source of truth for widget styling. Yes, this means third-party components like shadcn’s `<Card>` will trigger a warning if used as a direct item. The consumer should either pass the Card’s content directly and style via `layout.className`, or accept the console.error. This is a feature, not a bug — it forces consumers to think about their component boundaries. ogrid is not for consumers who want to drop in arbitrary components without thought.

**Why is `h` named `h` instead of `maxH` or `maxHeight`?** `h` keeps the config clean when pasted into source code. It acts as `max-height` under the hood — widget is shorter if content is shorter, scrolls when content exceeds the cap. This is explicitly documented in JSDoc, in the type comments, and in this spec. Every mention of `h` in the documentation clarifies its `max-height` semantics. We chose brevity because the config is pasted frequently and must be scannable. Two extra characters (`maxH`) save zero confusion when the documentation is clear. Consumers read docs before using a library.

**Why no responsive breakpoints?** Pixel-level control is the core value proposition. `max-width: 100%` on ALL items (including `w: number`) means they naturally cap to container width on small screens. Flexbox `flex-wrap: wrap` handles multi-column to single-column transitions automatically. A `w: 640` widget on a 320px screen becomes 320px — no config needed. Breakpoint-based layouts are a fundamentally different paradigm — consumers who need them should use CSS media queries inside their components or in `layout.className` with Tailwind responsive variants (e.g., `sm:flex-col`).

**Why require Tailwind v4?** The library is opinionated about its styling language. The banned-class system, dev panel visual controls, `cn()` merging, and the entire `className` workflow all depend on Tailwind conventions. Making Tailwind optional would require abstracting every styling feature, diluting the DX. This is a dashboard grid for Tailwind users. Non-Tailwind users should use a different library.

**Why is the `BannedClass` compile-time check best-effort?** Template literal types work for inline string literals but TypeScript widens computed strings to `string`. This is a known TypeScript limitation, not a bug in our design. We provide a runtime safety net that catches ALL violations regardless of how the string was constructed. The compile-time check is a bonus for the common case (copy-pasted inline config). The runtime check is the authoritative enforcement. Both layers together provide defense in depth. Yes, the template literal types may impact IDE performance for very long class strings — we accept this tradeoff and provide the `string extends S` fallback to gracefully degrade.

**Why ban all `overflow-*` classes?** The grid controls overflow based on `w` and `h`. The overflow behavior is deterministic: `overflow: visible` by default, `overflow-x: auto` when `w` is a number, `overflow-y: auto` when `h` is set. Allowing consumers to override this on the wrapper would create unpredictable interactions. Consumers who need different overflow behavior (e.g., `overflow-hidden` for clipping) should handle it inside their component with an inner div. Same pattern as `aspect-*` — interior concerns go inside the component, not on the grid wrapper.

**Why ban margins?** The grid controls spacing between items via `gap`. Margin on the wrapper would create inconsistent spacing that conflicts with the gap. Negative margins for bleed effects should be handled inside the component. Consumers should use `padding` for inner spacing on the wrapper via `layout.className`.

**Why is the single-child rule not recursive?** Checking every node in the subtree would produce false positives on third-party components, icon wrappers, and standard internal patterns. The root check catches the most common anti-pattern: a component that exists only to wrap a single child in a styled div. Interior structure is the component’s own concern — ogrid does not audit component internals beyond the root.

**Why no `minW` / `maxW` fields?** Width has three modes: fills available space (omit `w`), exact pixels (`w: number`), or content-driven (`w: 'auto'`). Adding min/max constraints creates combinatorial complexity (`w: 640, minW: 300, maxW: 800` — which wins?). Consumers who need min-width behavior should use the `w` field directly. Consumers who need max-width behavior get it for free via `max-width: 100%` (responsive capping). More complex constraints go inside the component.

**Why `config` and not `layout` as the prop name?** `config` contains `gap`, `snap`, and `layout`. The prop name reflects that it’s more than just layout — it’s the full grid configuration. Naming it `layout` would conflict with the `layout` field inside it. `config` is generic by design — it’s the one prop you paste from the copy button.

**Why `Panel` and not `DevPanel` or `DevTools`?** `Panel` is short and the import path (`createGrid`) already communicates the context. The Panel only renders in development mode — its dev-only nature is enforced by the library, not by the name. Adding “Dev” to the name is redundant when the component itself is dev-only by design.

**Why `w` and `h` instead of `width` and `height`?** The config is pasted into source code frequently. Brevity matters for scanability. `{ key: 'kpi', w: 320, h: 400, className: '...' }` vs `{ key: 'kpi', width: 320, height: 400, className: '...' }` — the short version is cleaner in arrays with many entries. The field names are documented everywhere with full explanations.

**Why `items` and not `widgets` or `children`?** `items` is the most generic correct term. `widgets` implies a specific UI pattern. `children` conflicts with React’s `children` prop. `items` works for any content — charts, tables, text, forms, media.

## Decisions

- **Flexbox over CSS grid**: CSS grid’s `gap` breaks with fine-grained columns. Flexbox gives pixel-level width, correct gap, smooth resize interaction. Snap is handled in JS. `align-items: flex-start` prevents empty space below short items.
- **Nested grids blocked**: Grid wraps children in a React context. On mount, checks for ancestor Grid context. If found, throws.
- **`createGrid()` factory over `useGrid()` hook**: Stable component references by design. No unmount/remount risk. No Provider wrapper needed. Called at module level. State shared via closure over a plain JS store.
- **`relative`, `static`, and `z-*` allowed**: `relative` creates a positioning context for interior children. `static` is the CSS default and harmless — needed to undo `relative`. `z-*` controls stacking of interior elements (dropdowns, tooltips). None affect the grid’s flex flow.
- **`overflow: visible` by default**: Tooltips, dropdowns, and popovers inside widgets are never clipped. `overflow-x: auto` only when `w` is a number. `overflow-y: auto` only when `h` is set.
- **`className` not `class`**: Follows React convention. Every React developer expects `className`.
- **`onConfigChange` callback**: Enables backend persistence, undo/redo, analytics. Makes controlled mode possible.
- **Tailwind v4 required**: The library is opinionated. Tailwind v4 is the styling language. The banned-class system, dev panel, and class merging all depend on it.
- **Layout as array, not object**: Array order is guaranteed everywhere (JS, JSON, databases, ORMs). Object key order is a JS engine convention, not a spec guarantee in all serialization contexts. Array makes display order a first-class, explicit concept.
- **`onConfigChange` fires only from user actions**: Never from internal normalization or prop changes. Prevents infinite loops in controlled mode. Standard React `onChange` semantics — “the user did something.”
- **`BannedClass` uses conditional check, not mapped type union**: `S extends { [K in BannedPrefix]: ... }[BannedPrefix] ? never : S` — a single `never` from any banned prefix rejects the whole string. The original mapped+indexed approach produced a union where `never` was absorbed.
- **`JSXElementConstructor<any>` in `AllowedContent`**: The only `any` in the codebase, isolated in `content.ts`. `JSXElementConstructor<any>` is React’s own pattern for “element created by any component constructor.” Alternatives (`never`, `unknown`) either require contravariance tricks that obscure intent or don’t cover all component types (exotic components like `memo`, `forwardRef`, `lazy`). Explicit intent wins over clever type tricks. The `any` is contained — it never leaks beyond the type parameter.
- **No `React.memo` on item wrappers**: React elements are new references every render. `memo` on a component that receives JSX children as props is ineffective — the children are always “new” objects, defeating shallow comparison. Removing `memo` is honest: no false impression of optimization, no hidden behavior. Consumers who need perf control can `memo()` their own components.
- **`reset()` calls `onConfigChange` in controlled mode**: Not a no-op. In controlled mode, the consumer is the source of truth. Silently doing nothing on `reset()` would violate fail-fast — the consumer calls a function and gets no feedback. Instead, `reset()` explicitly tells the consumer to revert by calling `onConfigChange(initialConfig)`. The consumer decides whether to act on it.
