/** biome-ignore-all lint/style/noNonNullAssertion: DOM test assertions */
/** biome-ignore-all lint/style/noProcessEnv: test env setup */
/* eslint-disable @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-unnecessary-condition, @typescript-eslint/no-unused-vars */
/* oxlint-disable unicorn/consistent-function-scoping, react-perf/jsx-no-new-object-as-prop */
import { cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { createGrid } from '../index'
const W = () => <span>widget</span>,
  allText = () => document.body.textContent ?? ''
afterEach(() => {
  cleanup()
  process.env.NODE_ENV = undefined
})
describe('Panel visibility', () => {
  it('renders null when NODE_ENV is not development', () => {
    process.env.NODE_ENV = 'production'
    const { Grid, Panel } = createGrid(),
      { container } = render(
        <div>
          <Grid items={{ a: <W /> }} />
          <Panel />
        </div>
      ),
      panelRoot = container.querySelector('.flex.flex-col.gap-3')
    expect(panelRoot).toBeNull()
  })
  it('renders controls when NODE_ENV === development', () => {
    process.env.NODE_ENV = 'development'
    const { Grid, Panel } = createGrid()
    render(
      <div>
        <Grid items={{ a: <W /> }} />
        <Panel />
      </div>
    )
    expect(allText()).toContain('ogrid')
  })
})
describe('Panel widget list', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'development'
  })
  it('shows all widget keys', () => {
    const { Grid, Panel } = createGrid()
    render(
      <div>
        <Grid items={{ alpha: <W />, beta: <W />, gamma: <W /> }} />
        <Panel />
      </div>
    )
    const text = allText()
    expect(text).toContain('alpha')
    expect(text).toContain('beta')
    expect(text).toContain('gamma')
  })
  it('shows container width indicator', () => {
    const { Grid, Panel } = createGrid()
    render(
      <div>
        <Grid items={{ a: <W /> }} />
        <Panel />
      </div>
    )
    expect(allText()).toContain('px')
  })
})
describe('Panel grid controls', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'development'
  })
  it('has gap number input', () => {
    const { Grid, Panel } = createGrid()
    render(
      <div>
        <Grid items={{ a: <W /> }} />
        <Panel />
      </div>
    )
    const labels = document.querySelectorAll('label'),
      gapLabel = [...labels].find(l => l.textContent?.includes('gap'))
    expect(gapLabel).not.toBeUndefined()
    const input = gapLabel?.querySelector('input[type="number"]')
    expect(input).not.toBeNull()
  })
  it('has snap number input', () => {
    const { Grid, Panel } = createGrid()
    render(
      <div>
        <Grid items={{ a: <W /> }} />
        <Panel />
      </div>
    )
    const labels = document.querySelectorAll('label'),
      snapLabel = [...labels].find(l => l.textContent?.includes('snap'))
    expect(snapLabel).not.toBeUndefined()
    const input = snapLabel?.querySelector('input[type="number"]')
    expect(input).not.toBeNull()
  })
  it('has copy button', () => {
    const { Grid, Panel } = createGrid()
    render(
      <div>
        <Grid items={{ a: <W /> }} />
        <Panel />
      </div>
    )
    const buttons = document.querySelectorAll('button'),
      copyBtn = [...buttons].find(b => b.textContent === 'copy')
    expect(copyBtn).not.toBeUndefined()
  })
  it('has reset button', () => {
    const { Grid, Panel } = createGrid()
    render(
      <div>
        <Grid items={{ a: <W /> }} />
        <Panel />
      </div>
    )
    const buttons = document.querySelectorAll('button'),
      resetBtn = [...buttons].find(b => b.textContent === 'reset')
    expect(resetBtn).not.toBeUndefined()
  })
})
describe('Panel debug toggles', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'development'
  })
  it('shows debug border toggle', () => {
    const { Grid, Panel } = createGrid()
    render(
      <div>
        <Grid items={{ a: <W /> }} />
        <Panel />
      </div>
    )
    const labels = document.querySelectorAll('label'),
      borderLabel = [...labels].find(l => l.textContent?.includes('borders'))
    expect(borderLabel).not.toBeUndefined()
    const checkbox = borderLabel?.querySelector('input[type="checkbox"]')
    expect(checkbox).not.toBeNull()
  })
  it('shows debug background toggle', () => {
    const { Grid, Panel } = createGrid()
    render(
      <div>
        <Grid items={{ a: <W /> }} />
        <Panel />
      </div>
    )
    const labels = document.querySelectorAll('label'),
      bgLabel = [...labels].find(l => l.textContent?.includes('backgrounds'))
    expect(bgLabel).not.toBeUndefined()
    const checkbox = bgLabel?.querySelector('input[type="checkbox"]')
    expect(checkbox).not.toBeNull()
  })
})
describe('Panel selected widget controls', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'development'
  })
  it('shows w, h, hidden, and visual controls when a widget is selected', () => {
    const { Grid, Panel } = createGrid()
    render(
      <div>
        <Grid items={{ myWidget: <W /> }} />
        <Panel />
      </div>
    )
    const widgetBtn = [...document.querySelectorAll('button')].find(b => b.textContent?.includes('myWidget'))
    expect(widgetBtn).not.toBeUndefined()
    fireEvent.click(widgetBtn!)
    const text = allText()
    expect(text).toContain('myWidget')
    const labels = document.querySelectorAll('label'),
      wLabel = [...labels].find(l => {
        const span = l.querySelector('span')
        return span?.textContent === 'w'
      })
    expect(wLabel).not.toBeUndefined()
    const hLabel = [...labels].find(l => {
      const span = l.querySelector('span')
      return span?.textContent === 'h'
    })
    expect(hLabel).not.toBeUndefined()
    const hiddenLabel = [...labels].find(l => l.textContent?.includes('hidden'))
    expect(hiddenLabel).not.toBeUndefined()
    expect(text).toContain('padding')
  })
})
describe('Panel render prop (children)', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'development'
  })
  it('receives correct props', () => {
    const { Grid, Panel } = createGrid()
    let receivedProps: null | Record<string, unknown> = null
    render(
      <div>
        <Grid items={{ x: <W />, y: <W /> }} />
        <Panel>
          {props => {
            receivedProps = props as unknown as Record<string, unknown>
            return <div data-testid='custom'>custom panel</div>
          }}
        </Panel>
      </div>
    )
    expect(receivedProps).not.toBeNull()
    expect(receivedProps!.widgets).toEqual(['x', 'y'])
    expect(receivedProps!.selectedWidget).toBeNull()
    expect(typeof receivedProps!.onCopy).toBe('function')
    expect(typeof receivedProps!.onReset).toBe('function')
    expect(typeof receivedProps!.onGridChange).toBe('function')
    expect(typeof receivedProps!.onWidgetChange).toBe('function')
    expect(receivedProps!.gridConfig).toBeDefined()
    expect(allText()).toContain('custom panel')
  })
})
describe('Panel renderWidgetControl', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'development'
  })
  it('uses custom widget control renderer', () => {
    const { Grid, Panel } = createGrid()
    render(
      <div>
        <Grid items={{ a: <W /> }} />
        <Panel renderWidgetControl={(key, _layout, _onChange) => <div data-testid='custom-wc'>custom-{key}</div>} />
      </div>
    )
    const widgetBtn = [...document.querySelectorAll('button')].find(b => b.textContent?.includes('a'))
    fireEvent.click(widgetBtn!)
    expect(allText()).toContain('custom-a')
  })
})
describe('Panel renderGridControl', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'development'
  })
  it('uses custom grid control renderer', () => {
    const { Grid, Panel } = createGrid()
    render(
      <div>
        <Grid items={{ a: <W /> }} />
        <Panel renderGridControl={(_config, _onChange) => <div>custom-grid-ctrl</div>} />
      </div>
    )
    expect(allText()).toContain('custom-grid-ctrl')
    const labels = document.querySelectorAll('label'),
      gapLabel = [...labels].find(l => l.textContent?.includes('gap'))
    expect(gapLabel).toBeUndefined()
  })
})
describe('Panel renderCopyButton', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'development'
  })
  it('uses custom copy button renderer', () => {
    const { Grid, Panel } = createGrid()
    render(
      <div>
        <Grid items={{ a: <W /> }} />
        <Panel renderCopyButton={_onCopy => <button type='button'>export</button>} />
      </div>
    )
    const buttons = document.querySelectorAll('button'),
      exportBtn = [...buttons].find(b => b.textContent === 'export')
    expect(exportBtn).not.toBeUndefined()
    const copyBtn = [...buttons].find(b => b.textContent === 'copy')
    expect(copyBtn).toBeUndefined()
  })
})
describe('Panel custom layout indicator', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'development'
  })
  it('shows diamond indicator for widgets with custom layout', () => {
    const { Grid, Panel } = createGrid()
    render(
      <div>
        <Grid config={{ layout: [{ key: 'styled', w: 300 }] }} items={{ plain: <W />, styled: <W /> }} />
        <Panel />
      </div>
    )
    const buttons = document.querySelectorAll('button'),
      styledBtn = [...buttons].find(b => b.textContent?.includes('styled'))
    expect(styledBtn?.textContent).toContain('◆')
    const plainBtn = [...buttons].find(b => b.textContent?.includes('plain'))
    expect(plainBtn?.textContent).not.toContain('◆')
  })
})
describe('Panel hide/show toggle', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'development'
  })
  it('shows hide/show toggle for each widget', () => {
    const { Grid, Panel } = createGrid()
    render(
      <div>
        <Grid items={{ a: <W />, b: <W /> }} />
        <Panel />
      </div>
    )
    const toggleButtons = [...document.querySelectorAll('button')].filter(b => b.title === 'Hide' || b.title === 'Show')
    expect(toggleButtons.length).toBe(2)
  })
  it('shows circle indicator for visible widgets and empty circle for hidden', () => {
    const { Grid, Panel } = createGrid()
    render(
      <div>
        <Grid config={{ layout: [{ hidden: true, key: 'a' }] }} items={{ a: <W />, b: <W /> }} />
        <Panel />
      </div>
    )
    const showBtn = [...document.querySelectorAll('button')].find(b => b.title === 'Show')
    expect(showBtn?.textContent).toContain('○')
    const hideBtn = [...document.querySelectorAll('button')].find(b => b.title === 'Hide')
    expect(hideBtn?.textContent).toContain('●')
  })
})
