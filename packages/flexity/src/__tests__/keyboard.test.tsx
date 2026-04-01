/** biome-ignore-all lint/style/noNonNullAssertion: DOM test assertions */
/** biome-ignore-all lint/style/noProcessEnv: test env setup */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* oxlint-disable unicorn/consistent-function-scoping, react-perf/jsx-no-new-object-as-prop */
import { cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { createGrid } from '../index'
const W = () => <span>widget</span>,
  getItem = (key: string): HTMLElement => {
    const found = document.querySelector(`[data-flexity-key="${key}"]`)
    if (!found) throw new Error(`Item ${key} not found`)
    return found as HTMLElement
  }
beforeEach(() => {
  process.env.NODE_ENV = 'development'
})
afterEach(() => {
  cleanup()
  process.env.NODE_ENV = undefined
})
describe('keyboard resize interaction', () => {
  it('ArrowRight on resize handle increases width by snap', () => {
    const { Grid } = createGrid()
    render(<Grid config={{ layout: [{ key: 'a', w: 200 }], snap: 10 }} items={{ a: <W /> }} />)
    const separator = document.querySelector('[aria-label="Resize a"]')!
    fireEvent.keyDown(separator, { key: 'ArrowRight' })
    expect(getItem('a').style.width).toBe('210px')
  })
  it('ArrowLeft on resize handle decreases width by snap', () => {
    const { Grid } = createGrid()
    render(<Grid config={{ layout: [{ key: 'a', w: 200 }], snap: 10 }} items={{ a: <W /> }} />)
    const separator = document.querySelector('[aria-label="Resize a"]')!
    fireEvent.keyDown(separator, { key: 'ArrowLeft' })
    expect(getItem('a').style.width).toBe('190px')
  })
  it('Shift+ArrowRight increases width by 5x snap', () => {
    const { Grid } = createGrid()
    render(<Grid config={{ layout: [{ key: 'a', w: 200 }], snap: 10 }} items={{ a: <W /> }} />)
    const separator = document.querySelector('[aria-label="Resize a"]')!
    fireEvent.keyDown(separator, { key: 'ArrowRight', shiftKey: true })
    expect(getItem('a').style.width).toBe('250px')
  })
  it('Shift+ArrowLeft decreases width by 5x snap', () => {
    const { Grid } = createGrid()
    render(<Grid config={{ layout: [{ key: 'a', w: 200 }], snap: 10 }} items={{ a: <W /> }} />)
    const separator = document.querySelector('[aria-label="Resize a"]')!
    fireEvent.keyDown(separator, { key: 'ArrowLeft', shiftKey: true })
    expect(getItem('a').style.width).toBe('150px')
  })
  it('minimum width clamps to snap value', () => {
    const { Grid } = createGrid()
    render(<Grid config={{ layout: [{ key: 'a', w: 20 }], snap: 10 }} items={{ a: <W /> }} />)
    const separator = document.querySelector('[aria-label="Resize a"]')!
    fireEvent.keyDown(separator, { key: 'ArrowLeft' })
    expect(getItem('a').style.width).toBe('10px')
    fireEvent.keyDown(separator, { key: 'ArrowLeft' })
    expect(getItem('a').style.width).toBe('10px')
  })
})
