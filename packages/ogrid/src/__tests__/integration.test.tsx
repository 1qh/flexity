/** biome-ignore-all lint/style/noNonNullAssertion: DOM test assertions need non-null */
/** biome-ignore-all lint/style/noProcessEnv: test env setup */
/* eslint-disable @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-unsafe-member-access */
/* oxlint-disable unicorn/consistent-function-scoping, react-perf/jsx-no-new-object-as-prop, promise/param-names */
import { cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, spyOn } from 'bun:test'
import { createGrid } from '../index'
const noop = () => undefined,
  el = (selector: string) => document.querySelector(selector)!,
  els = (selector: string) => document.querySelectorAll(selector)
afterEach(cleanup)
describe('Grid rendering', () => {
  it('renders flex container with ogrid class', () => {
    const { Grid } = createGrid(),
      W = () => <span>hello</span>,
      { container } = render(<Grid items={{ a: <W /> }} />),
      grid = container.querySelector('.ogrid')!
    expect(grid).not.toBeNull()
    expect(grid.style.display).toBe('flex')
    expect(grid.style.flexWrap).toBe('wrap')
    expect(grid.style.alignItems).toBe('flex-start')
  })
  it('renders items with ogrid-item class and data-ogrid-key', () => {
    const { Grid } = createGrid(),
      A = () => <span>a</span>,
      B = () => <span>b</span>
    render(<Grid items={{ first: <A />, second: <B /> }} />)
    const items = els('.ogrid-item')
    expect(items.length).toBe(2)
    expect(el('[data-ogrid-key="first"]')).not.toBeNull()
    expect(el('[data-ogrid-key="second"]')).not.toBeNull()
  })
  it('renders empty items without error', () => {
    const { Grid } = createGrid(),
      { container } = render(<Grid items={{}} />),
      grid = container.querySelector('.ogrid')
    expect(grid).not.toBeNull()
    expect(els('.ogrid-item').length).toBe(0)
  })
  it('renders string items', () => {
    const { Grid } = createGrid()
    render(<Grid items={{ txt: 'hello world' }} />)
    expect(document.body.textContent).toContain('hello world')
  })
  it('renders number items', () => {
    const { Grid } = createGrid()
    render(<Grid items={{ num: 42 }} />)
    expect(document.body.textContent).toContain('42')
  })
  it('renders null/false items as empty wrappers', () => {
    const { Grid } = createGrid()
    render(<Grid items={{ empty: null, off: false }} />)
    expect(els('.ogrid-item').length).toBe(2)
  })
  it('applies gap from config', () => {
    const { Grid } = createGrid(),
      W = () => <span>w</span>,
      { container } = render(<Grid config={{ gap: 16 }} items={{ a: <W /> }} />)
    expect(container.querySelector('.ogrid')!.style.gap).toBe('16px')
  })
  it('applies className to flex container', () => {
    const { Grid } = createGrid(),
      W = () => <span>w</span>,
      { container } = render(<Grid className='p-4 bg-muted' items={{ a: <W /> }} />),
      grid = container.querySelector('.ogrid')
    expect(grid?.classList.contains('p-4')).toBe(true)
    expect(grid?.classList.contains('bg-muted')).toBe(true)
  })
})
describe('width modes', () => {
  it('w: number → width + maxWidth + overflowX', () => {
    const { Grid } = createGrid(),
      W = () => <span>w</span>
    render(<Grid config={{ layout: [{ key: 'a', w: 320 }] }} items={{ a: <W /> }} />)
    const item = el('[data-ogrid-key="a"]')
    expect(item.style.width).toBe('320px')
    expect(item.style.maxWidth).toBe('100%')
    expect(item.style.overflowX).toBe('auto')
  })
  it('w: auto → fit-content + maxWidth', () => {
    const { Grid } = createGrid(),
      W = () => <span>w</span>
    render(<Grid config={{ layout: [{ key: 'a', w: 'auto' }] }} items={{ a: <W /> }} />)
    const item = el('[data-ogrid-key="a"]')
    expect(item.style.width).toBe('fit-content')
    expect(item.style.maxWidth).toBe('100%')
  })
  it('no w → flex + overflow visible', () => {
    const { Grid } = createGrid(),
      W = () => <span>w</span>
    render(<Grid items={{ a: <W /> }} />)
    const item = el('[data-ogrid-key="a"]')
    expect(item.style.flex).toBe('1 1 0%')
    expect(item.style.overflow).toBe('visible')
  })
  it('snaps w to snap value', () => {
    const { Grid } = createGrid(),
      W = () => <span>w</span>
    render(<Grid config={{ layout: [{ key: 'a', w: 325 }], snap: 8 }} items={{ a: <W /> }} />)
    expect(el('[data-ogrid-key="a"]').style.width).toBe('328px')
  })
  it('h → maxHeight + overflowY', () => {
    const { Grid } = createGrid(),
      W = () => <span>w</span>
    render(<Grid config={{ layout: [{ h: 200, key: 'a' }] }} items={{ a: <W /> }} />)
    const item = el('[data-ogrid-key="a"]')
    expect(item.style.maxHeight).toBe('200px')
    expect(item.style.overflowY).toBe('auto')
  })
  it('enforces box-sizing: border-box', () => {
    const { Grid } = createGrid(),
      W = () => <span>w</span>
    render(<Grid items={{ a: <W />, b: <W /> }} />)
    for (const item of els('.ogrid-item')) expect((item as HTMLElement).style.boxSizing).toBe('border-box')
  })
})
describe('hidden items', () => {
  it('display:none in production', () => {
    const { Grid } = createGrid(),
      W = () => <span>w</span>
    render(<Grid config={{ layout: [{ hidden: true, key: 'a' }] }} items={{ a: <W /> }} />)
    expect(el('[data-ogrid-key="a"]').style.display).toBe('none')
  })
})
describe('layout ordering', () => {
  it('layout entries first, then remaining by items key order', () => {
    const { Grid } = createGrid(),
      A = () => <span>a</span>,
      B = () => <span>b</span>,
      C = () => <span>c</span>
    render(<Grid config={{ layout: [{ key: 'c' }, { key: 'a' }] }} items={{ a: <A />, b: <B />, c: <C /> }} />)
    const items = els('.ogrid-item')
    expect((items[0] as HTMLElement).dataset.ogridKey).toBe('c')
    expect((items[1] as HTMLElement).dataset.ogridKey).toBe('a')
    expect((items[2] as HTMLElement).dataset.ogridKey).toBe('b')
  })
})
describe('className on items', () => {
  it('applies layout className to wrapper', () => {
    const { Grid } = createGrid(),
      W = () => <span>w</span>
    render(<Grid config={{ layout: [{ className: 'pt-3 rounded-lg', key: 'a' }] }} items={{ a: <W /> }} />)
    const item = el('[data-ogrid-key="a"]')
    expect(item.classList.contains('pt-3')).toBe(true)
    expect(item.classList.contains('rounded-lg')).toBe(true)
  })
})
describe('drag handle', () => {
  it('renders default drag handle SVG', () => {
    const { Grid } = createGrid(),
      W = () => <span>w</span>
    render(<Grid items={{ a: <W /> }} />)
    expect(document.querySelector('.ogrid-item svg')).not.toBeNull()
  })
  it('hides default when dragHandle selector is set', () => {
    const { Grid } = createGrid(),
      W = () => <span className='my-handle'>drag</span>
    render(<Grid dragHandle='.my-handle' items={{ a: <W /> }} />)
    expect(document.querySelector('.ogrid-item > div > svg')).toBeNull()
  })
})
describe('resize handle', () => {
  it('has separator role and aria-label', () => {
    const { Grid } = createGrid(),
      W = () => <span>w</span>
    render(<Grid items={{ a: <W /> }} />)
    const sep = el('[role="separator"]')
    expect(sep).not.toBeNull()
    expect(sep.getAttribute('aria-label')).toContain('Resize')
  })
})
describe('config validation', () => {
  it('throws on snap < 1', () => {
    const { Grid } = createGrid(),
      W = () => <span>w</span>
    expect(() => render(<Grid config={{ snap: 0 }} items={{ a: <W /> }} />)).toThrow('snap must be >= 1')
  })
  it('throws on gap < 0', () => {
    const { Grid } = createGrid(),
      W = () => <span>w</span>
    expect(() => render(<Grid config={{ gap: -1 }} items={{ a: <W /> }} />)).toThrow('gap must be >= 0')
  })
  it('throws on duplicate layout keys', () => {
    const { Grid } = createGrid(),
      W = () => <span>w</span>
    expect(() => render(<Grid config={{ layout: [{ key: 'a' }, { key: 'a' }] }} items={{ a: <W /> }} />)).toThrow(
      'Duplicate key'
    )
  })
  it('throws on w: 0', () => {
    const { Grid } = createGrid(),
      W = () => <span>w</span>
    expect(() => render(<Grid config={{ layout: [{ key: 'a', w: 0 }] }} items={{ a: <W /> }} />)).toThrow('w must be > 0')
  })
})
describe('controlled mode', () => {
  it('reflects config prop changes on rerender', () => {
    const { Grid } = createGrid(),
      W = () => <span>w</span>,
      onChange = noop,
      { rerender } = render(
        <Grid config={{ layout: [{ key: 'a', w: 300 }] }} items={{ a: <W /> }} onConfigChange={onChange} />
      ),
      item = el('[data-ogrid-key="a"]')
    expect(item.style.width).toBe('300px')
    rerender(<Grid config={{ layout: [{ key: 'a', w: 500 }] }} items={{ a: <W /> }} onConfigChange={onChange} />)
    expect(item.style.width).toBe('500px')
  })
})
describe('localStorage', () => {
  beforeEach(() => localStorage.clear())
  it('does not persist without id', () => {
    const { Grid } = createGrid(),
      W = () => <span>w</span>
    render(<Grid items={{ a: <W /> }} />)
    expect(localStorage.length).toBe(0)
  })
})
describe('reset', () => {
  it('reverts store to initial config', () => {
    const { Grid, reset } = createGrid(),
      W = () => <span>w</span>
    render(<Grid config={{ gap: 16 }} items={{ a: <W /> }} />)
    expect(document.querySelector('.ogrid')!.style.gap).toBe('16px')
    reset()
  })
})
describe('multiple grids', () => {
  it('creates isolated instances', () => {
    const g1 = createGrid(),
      g2 = createGrid(),
      W = () => <span>w</span>
    render(
      <div>
        <g1.Grid config={{ gap: 8 }} items={{ a: <W /> }} />
        <g2.Grid config={{ gap: 24 }} items={{ b: <W /> }} />
      </div>
    )
    const grids = els('.ogrid')
    expect(grids.length).toBe(2)
    expect((grids[0] as HTMLElement).style.gap).toBe('8px')
    expect((grids[1] as HTMLElement).style.gap).toBe('24px')
  })
})
describe('dynamic items', () => {
  it('handles items added at runtime', () => {
    const { Grid } = createGrid(),
      W = () => <span>w</span>,
      { rerender } = render(<Grid items={{ a: <W /> }} />)
    expect(els('.ogrid-item').length).toBe(1)
    rerender(<Grid items={{ a: <W />, b: <W /> }} />)
    expect(els('.ogrid-item').length).toBe(2)
  })
  it('handles items removed at runtime', () => {
    const { Grid } = createGrid(),
      W = () => <span>w</span>,
      { rerender } = render(<Grid items={{ a: <W />, b: <W /> }} />)
    expect(els('.ogrid-item').length).toBe(2)
    rerender(<Grid items={{ a: <W /> }} />)
    expect(els('.ogrid-item').length).toBe(1)
  })
  it('silently ignores layout entries for missing items', () => {
    const { Grid } = createGrid(),
      W = () => <span>w</span>
    expect(() =>
      render(
        <Grid
          config={{
            layout: [
              { key: 'a', w: 300 },
              { key: 'gone', w: 500 }
            ]
          }}
          items={{ a: <W /> }}
        />
      )
    ).not.toThrow()
    expect(els('.ogrid-item').length).toBe(1)
  })
})
describe('DOM validation in dev', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'development'
  })
  afterEach(() => {
    process.env.NODE_ENV = undefined
  })
  it('warns on single-child wrapper root', async () => {
    const spy = spyOn(console, 'error').mockImplementation(noop),
      { Grid } = createGrid(),
      Bad = () => (
        <div className='p-4'>
          <span>child</span>
        </div>
      )
    render(<Grid items={{ bad: <Bad /> }} />)
    await new Promise(r => {
      setTimeout(r, 50)
    })
    expect(spy.mock.calls.some(c => String(c[0]).includes('single child'))).toBe(true)
    spy.mockRestore()
  })
  it('warns on bare div wrapper root', async () => {
    const spy = spyOn(console, 'error').mockImplementation(noop),
      { Grid } = createGrid(),
      Bad = () => (
        <div>
          <span>a</span>
          <span>b</span>
        </div>
      )
    render(<Grid items={{ bad: <Bad /> }} />)
    await new Promise(r => {
      setTimeout(r, 50)
    })
    expect(spy.mock.calls.some(c => String(c[0]).includes('fragment'))).toBe(true)
    spy.mockRestore()
  })
  it('does not warn on valid component root', async () => {
    const spy = spyOn(console, 'error').mockImplementation(noop),
      { Grid } = createGrid(),
      Good = () => (
        <div className='flex gap-2'>
          <span>a</span>
          <span>b</span>
        </div>
      )
    render(<Grid items={{ good: <Good /> }} />)
    await new Promise(r => {
      setTimeout(r, 50)
    })
    expect(spy.mock.calls.some(c => String(c[0]).includes('[ogrid]'))).toBe(false)
    spy.mockRestore()
  })
  it('warns on banned className', async () => {
    const spy = spyOn(console, 'error').mockImplementation(noop),
      { Grid } = createGrid(),
      W = () => <span>w</span>
    render(<Grid config={{ layout: [{ className: 'w-full', key: 'a' }] }} items={{ a: <W /> }} />)
    await new Promise(r => {
      setTimeout(r, 50)
    })
    expect(spy.mock.calls.some(c => String(c[0]).includes('not allowed'))).toBe(true)
    spy.mockRestore()
  })
})
describe('accessibility', () => {
  it('drag handle has ARIA button role', () => {
    const { Grid } = createGrid(),
      W = () => <span>w</span>
    render(<Grid items={{ a: <W /> }} />)
    expect(document.querySelector('.ogrid-item [role="button"]')).not.toBeNull()
  })
  it('resize handle has aria-label', () => {
    const { Grid } = createGrid(),
      W = () => <span>w</span>
    render(<Grid items={{ a: <W /> }} />)
    expect(el('[role="separator"]').getAttribute('aria-label')).toContain('Resize')
  })
})
