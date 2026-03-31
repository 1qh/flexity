/* eslint-disable @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars */
import { describe, expect, it } from 'bun:test'
import type { AllowedContent, BannedClass, GridConfig, WidgetLayoutEntry } from '../types'
const MyComponent = () => <span>hello</span>
describe('type safety', () => {
  it('BannedClass rejects banned prefix strings at type level', () => {
    const allowed: BannedClass<'pt-3 rounded-lg bg-muted'> = 'pt-3 rounded-lg bg-muted'
    expect(allowed).toBe('pt-3 rounded-lg bg-muted')
    // @ts-expect-error — w-full is a banned class
    const _banned: BannedClass<'w-full'> = 'w-full',
      // @ts-expect-error — absolute is banned
      _banned2: BannedClass<'absolute top-0'> = 'absolute top-0',
      // @ts-expect-error — m-4 is banned
      _banned3: BannedClass<'m-4 pt-3'> = 'm-4 pt-3',
      // @ts-expect-error — overflow-hidden is banned
      _banned4: BannedClass<'overflow-hidden'> = 'overflow-hidden',
      // @ts-expect-error — hidden is banned
      _banned5: BannedClass<'hidden'> = 'hidden',
      // @ts-expect-error — sm:w-full variant prefix banned
      _banned6: BannedClass<'sm:w-full'> = 'sm:w-full',
      // @ts-expect-error — !w-full important modifier banned
      _banned7: BannedClass<'!w-full'> = '!w-full',
      // @ts-expect-error — -m-4 negative modifier banned
      _banned8: BannedClass<'-m-4'> = '-m-4'
    expect(true).toBe(true)
  })
  it('BannedClass allows valid classes', () => {
    const a: BannedClass<'pt-3 pb-6 border border-border/50'> = 'pt-3 pb-6 border border-border/50',
      b: BannedClass<'flex gap-2 items-center'> = 'flex gap-2 items-center',
      c: BannedClass<'relative z-10'> = 'relative z-10',
      d: BannedClass<'shadow-lg rounded-xl bg-muted'> = 'shadow-lg rounded-xl bg-muted',
      e: BannedClass<'opacity-50 blur-sm'> = 'opacity-50 blur-sm',
      f: BannedClass<'grid grid-cols-2 gap-4'> = 'grid grid-cols-2 gap-4'
    expect(a).toBeTruthy()
    expect(b).toBeTruthy()
    expect(c).toBeTruthy()
    expect(d).toBeTruthy()
    expect(e).toBeTruthy()
    expect(f).toBeTruthy()
  })
  it('BannedClass falls back to string for generic string type', () => {
    const dynamicClass = 'w-full',
      result: BannedClass<string> = dynamicClass
    expect(result).toBe('w-full')
  })
  it('GridConfig layout keys match items', () => {
    const config: GridConfig<'chart' | 'kpi'> = {
      gap: 16,
      layout: [
        { key: 'kpi', w: 320 },
        { key: 'chart', w: 640 }
      ]
    }
    expect(config.layout).toHaveLength(2)
    // @ts-expect-error — 'invalid' is not a valid key
    const _bad: GridConfig<'chart' | 'kpi'> = {
      layout: [{ key: 'invalid' }]
    }
  })
  it('WidgetLayoutEntry key is constrained', () => {
    const entry: WidgetLayoutEntry<'a' | 'b'> = { key: 'a', w: 320 }
    expect(entry.key).toBe('a')
    // @ts-expect-error — 'c' is not valid
    const _bad: WidgetLayoutEntry<'a' | 'b'> = { key: 'c' }
  })
  it('AllowedContent accepts valid types', () => {
    const _str: AllowedContent = 'hello',
      _num: AllowedContent = 42,
      _nul: AllowedContent = null,
      _undef: AllowedContent = undefined,
      _bool: AllowedContent = false,
      _component: AllowedContent = <MyComponent />,
      _fragment: AllowedContent = <MyComponent />
    expect(true).toBe(true)
  })
  it('AllowedContent rejects intrinsic elements', () => {
    // @ts-expect-error — <div> is an intrinsic element
    const _div: AllowedContent = <div>text</div>,
      // @ts-expect-error — <span> is an intrinsic element
      _span: AllowedContent = <span>text</span>,
      // @ts-expect-error — <hr /> is an intrinsic element (void)
      _hr: AllowedContent = <hr />,
      // @ts-expect-error — <canvas /> is an intrinsic element (void)
      _canvas: AllowedContent = <canvas />,
      // @ts-expect-error — <section> is an intrinsic element
      _section: AllowedContent = <section>text</section>
    expect(true).toBe(true)
  })
  it('WidgetLayoutEntry w accepts number, auto, or undefined', () => {
    const a: WidgetLayoutEntry = { key: 'a', w: 320 },
      b: WidgetLayoutEntry = { key: 'b', w: 'auto' },
      c: WidgetLayoutEntry = { key: 'c' }
    expect(a.w).toBe(320)
    expect(b.w).toBe('auto')
    expect(c.w).toBeUndefined()
  })
  it('GridConfig all fields optional', () => {
    const empty: GridConfig = {},
      gapOnly: GridConfig = { gap: 16 },
      snapOnly: GridConfig = { snap: 8 },
      layoutOnly: GridConfig = { layout: [] }
    expect(empty).toBeTruthy()
    expect(gapOnly.gap).toBe(16)
    expect(snapOnly.snap).toBe(8)
    expect(layoutOnly.layout).toEqual([])
  })
})
