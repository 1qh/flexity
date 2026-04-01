/** biome-ignore-all lint/style/noNonNullAssertion: DOM test assertions */
/** biome-ignore-all lint/style/noProcessEnv: test env setup */
/** biome-ignore-all lint/performance/noAwaitInLoops: sequential tick awaits for Suspense */
/** biome-ignore-all lint/correctness/useUniqueElementIds: test isolation */
/* eslint-disable @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unused-vars, no-await-in-loop, react/prop-types, react/display-name, @eslint-react/no-missing-component-display-name */
/* oxlint-disable unicorn/consistent-function-scoping, react-perf/jsx-no-new-object-as-prop, react-perf/jsx-no-jsx-as-prop, promise/param-names, no-await-in-loop, react/display-name */
import { cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, spyOn } from 'bun:test'
import { lazy, memo, Suspense } from 'react'
import { createGrid } from '../index'
const noop = () => undefined,
  tick = async () =>
    new Promise(r => {
      setTimeout(r, 50)
    }),
  el = (selector: string) => document.querySelector(selector)!,
  els = (selector: string) => document.querySelectorAll(selector)
afterEach(cleanup)
describe('DOM validation — memo/forwardRef/lazy/Suspense', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'development'
  })
  afterEach(() => {
    process.env.NODE_ENV = undefined
  })
  it('warns on memo() wrapped component with bare root', async () => {
    const spy = spyOn(console, 'error').mockImplementation(noop),
      { Grid } = createGrid(),
      Bad = memo(() => (
        <div>
          <span>a</span>
          <span>b</span>
        </div>
      ))
    render(<Grid items={{ bad: <Bad /> }} />)
    await tick()
    expect(spy.mock.calls.some(c => String(c[0]).includes('fragment'))).toBe(true)
    spy.mockRestore()
  })
  it('warns on forwardRef() wrapped component with bare root', async () => {
    const spy = spyOn(console, 'error').mockImplementation(noop),
      { Grid } = createGrid(),
      Bad = ({ ref: _ref, ..._props }) => (
        <div>
          <span>a</span>
          <span>b</span>
        </div>
      )
    render(<Grid items={{ bad: <Bad /> }} />)
    await tick()
    expect(spy.mock.calls.some(c => String(c[0]).includes('fragment'))).toBe(true)
    spy.mockRestore()
  })
  it('warns on lazy() loaded component with bare root', async () => {
    const spy = spyOn(console, 'error').mockImplementation(noop),
      { Grid } = createGrid(),
      Inner = () => (
        <div>
          <span>a</span>
          <span>b</span>
        </div>
      ),
      Bad = lazy(
        async () =>
          new Promise<{ default: typeof Inner }>(resolve => {
            resolve({ default: Inner })
          })
      )
    render(
      <Suspense fallback={<span>loading</span>}>
        <Grid items={{ bad: <Bad /> }} />
      </Suspense>
    )
    for (let i = 0; i < 10; i += 1) await tick()
    expect(spy.mock.calls.some(c => String(c[0]).includes('fragment'))).toBe(true)
    spy.mockRestore()
  })
  it('warns on component that renders single-child wrapper internally', async () => {
    const spy = spyOn(console, 'error').mockImplementation(noop),
      { Grid } = createGrid(),
      Wrapper = () => (
        <div className='p-4'>
          <span>only child</span>
        </div>
      )
    render(<Grid items={{ bad: <Wrapper /> }} />)
    await tick()
    expect(spy.mock.calls.some(c => String(c[0]).includes('single child'))).toBe(true)
    spy.mockRestore()
  })
  it('does not warn on component with internal bare wrappers', async () => {
    const spy = spyOn(console, 'error').mockImplementation(noop),
      { Grid } = createGrid(),
      Good = () => (
        <div className='flex'>
          <div>
            <span>icon</span>
          </div>
          <span>text</span>
        </div>
      )
    render(<Grid items={{ good: <Good /> }} />)
    await tick()
    expect(spy.mock.calls.some(c => String(c[0]).includes('[ogrid]'))).toBe(false)
    spy.mockRestore()
  })
})
describe('fragments as items', () => {
  it('renders fragment items', () => {
    const { Grid } = createGrid(),
      A = () => <span>a</span>,
      B = () => <span>b</span>
    render(
      <Grid
        items={{
          frag: (
            <>
              <A />
              <B />
            </>
          )
        }}
      />
    )
    expect(els('.ogrid-item').length).toBe(1)
    expect(document.body.textContent).toContain('a')
    expect(document.body.textContent).toContain('b')
  })
})
describe('onConfigChange callback', () => {
  it('fires on resize stop', () => {
    const { Grid } = createGrid(),
      W = () => <span>w</span>,
      configs: unknown[] = [],
      onChange = (c: unknown) => {
        configs.push(c)
      }
    render(<Grid config={{ layout: [{ key: 'a', w: 300 }] }} items={{ a: <W /> }} onConfigChange={onChange} />)
    expect(configs.length).toBe(0)
  })
  it('does not fire from internal normalization', () => {
    const { Grid } = createGrid(),
      W = () => <span>w</span>,
      configs: unknown[] = [],
      onChange = (c: unknown) => {
        configs.push(c)
      }
    render(<Grid config={{ gap: 16 }} items={{ a: <W /> }} onConfigChange={onChange} />)
    expect(configs.length).toBe(0)
  })
})
describe('controlled vs uncontrolled', () => {
  beforeEach(() => localStorage.clear())
  it('controlled: ignores localStorage even with id', () => {
    localStorage.setItem('ogrid-test', JSON.stringify({ gap: 99 }))
    const { Grid } = createGrid(),
      W = () => <span>w</span>
    render(<Grid config={{ gap: 16 }} id='test' items={{ a: <W /> }} onConfigChange={noop} />)
    const grid = document.querySelector('.ogrid')!
    expect(grid.style.gap).toBe('16px')
  })
  it('uncontrolled with id: loads from localStorage', async () => {
    localStorage.setItem('ogrid-ctrl', JSON.stringify({ gap: 42 }))
    const { Grid } = createGrid(),
      W = () => <span>w</span>
    render(<Grid config={{ gap: 8 }} id='ctrl' items={{ a: <W /> }} />)
    await tick()
    const grid = document.querySelector('.ogrid')!
    expect(grid.style.gap).toBe('42px')
  })
  it('uncontrolled without id: uses config prop', () => {
    const { Grid } = createGrid(),
      W = () => <span>w</span>
    render(<Grid config={{ gap: 20 }} items={{ a: <W /> }} />)
    const grid = document.querySelector('.ogrid')!
    expect(grid.style.gap).toBe('20px')
  })
})
describe('localStorage persistence', () => {
  beforeEach(() => localStorage.clear())
  it('saves to localStorage with ogrid- prefix on user change', () => {
    const { Grid } = createGrid(),
      W = () => <span>w</span>
    render(<Grid config={{ gap: 16 }} id='persist' items={{ a: <W /> }} />)
    expect(localStorage.getItem('ogrid-persist')).toBeNull()
  })
})
describe('reset behavior', () => {
  beforeEach(() => localStorage.clear())
  it('controlled: reset calls onConfigChange with initial config', () => {
    const { Grid, reset } = createGrid(),
      W = () => <span>w</span>,
      configs: unknown[] = [],
      initialConfig = { gap: 16 }
    render(
      <Grid
        config={initialConfig}
        items={{ a: <W /> }}
        onConfigChange={c => {
          configs.push(c)
        }}
      />
    )
    reset()
    expect(configs.length).toBe(1)
    expect((configs[0] as { gap: number }).gap).toBe(16)
  })
  it('uncontrolled: reset clears localStorage', () => {
    localStorage.setItem('ogrid-resettest', JSON.stringify({ gap: 99 }))
    const { Grid, reset } = createGrid(),
      W = () => <span>w</span>
    render(<Grid config={{ gap: 16 }} id='resettest' items={{ a: <W /> }} />)
    reset()
    expect(localStorage.getItem('ogrid-resettest')).toBeNull()
  })
})
describe('string/number items with handles', () => {
  it('string item has drag handle', () => {
    const { Grid } = createGrid()
    render(<Grid items={{ txt: 'hello' }} />)
    expect(document.querySelector('.ogrid-item svg')).not.toBeNull()
  })
  it('number item has drag handle', () => {
    const { Grid } = createGrid()
    render(<Grid items={{ num: 42 }} />)
    expect(document.querySelector('.ogrid-item svg')).not.toBeNull()
  })
  it('string item has resize handle', () => {
    const { Grid } = createGrid()
    render(<Grid items={{ txt: 'hello' }} />)
    expect(document.querySelector('[role="separator"]')).not.toBeNull()
  })
})
describe('single item', () => {
  it('renders one item filling full width', () => {
    const { Grid } = createGrid(),
      W = () => <span>w</span>
    render(<Grid items={{ only: <W /> }} />)
    const item = el('[data-ogrid-key="only"]')
    expect(item.style.flex).toBe('1 1 0%')
  })
})
describe('all items hidden', () => {
  it('renders no visible items', () => {
    const { Grid } = createGrid(),
      W = () => <span>w</span>
    render(
      <Grid
        config={{
          layout: [
            { hidden: true, key: 'a' },
            { hidden: true, key: 'b' }
          ]
        }}
        items={{ a: <W />, b: <W /> }}
      />
    )
    const items = els('.ogrid-item')
    for (const item of items) expect((item as HTMLElement).style.display).toBe('none')
  })
})
describe('hidden items in dev mode', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'development'
  })
  afterEach(() => {
    process.env.NODE_ENV = undefined
  })
  it('renders hidden items with reduced opacity and label', async () => {
    const spy = spyOn(console, 'error').mockImplementation(noop),
      { Grid } = createGrid(),
      W = () => <span>w</span>
    render(<Grid config={{ layout: [{ hidden: true, key: 'a' }] }} items={{ a: <W /> }} />)
    await tick()
    const item = el('[data-ogrid-key="a"]')
    expect(item.style.opacity).toBe('0.4')
    expect(item.style.display).not.toBe('none')
    expect(item.textContent).toContain('hidden')
    spy.mockRestore()
  })
})
describe('w: auto overflow', () => {
  it('does not set overflow-x: auto for w: auto', () => {
    const { Grid } = createGrid(),
      W = () => <span>w</span>
    render(<Grid config={{ layout: [{ key: 'a', w: 'auto' }] }} items={{ a: <W /> }} />)
    const item = el('[data-ogrid-key="a"]')
    expect(item.style.overflowX).toBe('')
  })
})
describe('both w and h set', () => {
  it('sets both overflow axes', () => {
    const { Grid } = createGrid(),
      W = () => <span>w</span>
    render(<Grid config={{ layout: [{ h: 200, key: 'a', w: 400 }] }} items={{ a: <W /> }} />)
    const item = el('[data-ogrid-key="a"]')
    expect(item.style.overflowX).toBe('auto')
    expect(item.style.overflowY).toBe('auto')
  })
})
describe('copy output format', () => {
  it('formatConfigForCopy generates JS object literal', async () => {
    const { formatConfigForCopy } = await import('../panel'),
      result = formatConfigForCopy(
        {
          gap: 16,
          layout: [
            { className: 'pt-3 bg-muted', key: 'kpi', w: 320 },
            { h: 400, key: 'table', w: 960 }
          ],
          snap: 8
        },
        ['kpi', 'table']
      )
    expect(result).toContain('{')
    expect(result).toContain('}')
    expect(result).toContain('gap: 16')
    expect(result).toContain('snap: 8')
    expect(result).toContain("key: 'kpi'")
    expect(result).toContain('w: 320')
    expect(result).toContain("className: 'pt-3 bg-muted'")
    expect(result).toContain('h: 400')
    expect(result).not.toContain('"')
  })
})
