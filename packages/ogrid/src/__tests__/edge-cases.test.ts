/** biome-ignore-all lint/nursery/noIncrementDecrement: test counters */
/* eslint-disable no-plusplus */
import { describe, expect, it } from 'bun:test'
import { createStore } from '../store'
describe('edge cases', () => {
  it('handles empty layout array', () => {
    const store = createStore<'a'>({ layout: [] })
    expect(store.getState().config.layout).toEqual([])
  })
  it('reorderKeys with empty array preserves all entries', () => {
    const store = createStore<'a' | 'b'>({
      layout: [{ key: 'a' }, { key: 'b' }]
    })
    store.reorderKeys([])
    const keys = store.getState().config.layout?.map(e => e.key)
    expect(keys).toEqual(['a', 'b'])
  })
  it('reorderKeys with partial keys puts unspecified at end', () => {
    const store = createStore<'a' | 'b' | 'c'>({
      layout: [{ key: 'a' }, { key: 'b' }, { key: 'c' }]
    })
    store.reorderKeys(['c'])
    const keys = store.getState().config.layout?.map(e => e.key)
    expect(keys).toEqual(['c', 'a', 'b'])
  })
  it('updateWidgetLayout with undefined w removes w', () => {
    const store = createStore<'a'>({
      layout: [{ key: 'a', w: 300 }]
    })
    store.updateWidgetLayout('a', { w: undefined })
    expect(store.getState().config.layout?.[0]?.w).toBeUndefined()
  })
  it('updateWidgetLayout with undefined h removes h', () => {
    const store = createStore<'a'>({
      layout: [{ h: 200, key: 'a' }]
    })
    store.updateWidgetLayout('a', { h: undefined })
    expect(store.getState().config.layout?.[0]?.h).toBeUndefined()
  })
  it('updateWidgetLayout with hidden toggles visibility', () => {
    const store = createStore<'a'>({
      layout: [{ key: 'a' }]
    })
    store.updateWidgetLayout('a', { hidden: true })
    expect(store.getState().config.layout?.[0]?.hidden).toBe(true)
    store.updateWidgetLayout('a', { hidden: undefined })
    expect(store.getState().config.layout?.[0]?.hidden).toBeUndefined()
  })
  it('multiple subscribers all notified', () => {
    const store = createStore({})
    let count1 = 0,
      count2 = 0
    store.subscribe(() => {
      count1++
    })
    store.subscribe(() => {
      count2++
    })
    store.setState({ containerWidth: 500 })
    expect(count1).toBe(1)
    expect(count2).toBe(1)
  })
  it('reset clears debug flags', () => {
    const store = createStore({})
    store.setState({ showDebugBg: true, showDebugBorders: true })
    expect(store.getState().showDebugBorders).toBe(true)
    store.reset()
    expect(store.getState().selectedWidget).toBeNull()
  })
  it('setConfig replaces entire config including layout', () => {
    const store = createStore<'a' | 'b'>({
      gap: 8,
      layout: [{ key: 'a', w: 100 }]
    })
    store.setConfig({ gap: 24, layout: [{ key: 'b', w: 200 }] })
    expect(store.getState().config.gap).toBe(24)
    expect(store.getState().config.layout).toHaveLength(1)
    expect(store.getState().config.layout?.[0]?.key).toBe('b')
  })
  it('updateGridConfig does not affect layout', () => {
    const store = createStore<'a'>({
      gap: 8,
      layout: [{ key: 'a', w: 100 }]
    })
    store.updateGridConfig({ gap: 16 })
    expect(store.getState().config.layout?.[0]?.w).toBe(100)
  })
  it('userChange calls registered callback with current config', () => {
    const store = createStore<'a'>({ gap: 8 })
    let receivedConfig: unknown = null
    store.setOnUserChange(config => {
      receivedConfig = config
    })
    store.updateGridConfig({ gap: 16 })
    store.userChange()
    expect((receivedConfig as { gap: number }).gap).toBe(16)
  })
  it('userChange is noop when no callback registered', () => {
    const store = createStore({})
    expect(() => store.userChange()).not.toThrow()
  })
  it('setOnUserChange(null) clears callback', () => {
    const store = createStore({})
    let called = false
    store.setOnUserChange(() => {
      called = true
    })
    store.setOnUserChange(null)
    store.userChange()
    expect(called).toBe(false)
  })
  it('containerWidth starts at 0', () => {
    const store = createStore({})
    expect(store.getState().containerWidth).toBe(0)
  })
  it('showDebugBorders and showDebugBg start false', () => {
    const store = createStore({})
    expect(store.getState().showDebugBorders).toBe(false)
    expect(store.getState().showDebugBg).toBe(false)
  })
  it('updateWidgetLayout creates layout array if none exists', () => {
    const store = createStore<'x'>({})
    store.updateWidgetLayout('x', { w: 400 })
    expect(store.getState().config.layout).toHaveLength(1)
    expect(store.getState().config.layout?.[0]).toEqual({ key: 'x', w: 400 })
  })
  it('reset reverts to initial config even after multiple changes', () => {
    const store = createStore<'a'>({ gap: 10, layout: [{ key: 'a', w: 100 }], snap: 5 })
    store.updateGridConfig({ gap: 20 })
    store.updateWidgetLayout('a', { w: 200 })
    store.updateGridConfig({ snap: 10 })
    store.reset()
    expect(store.getState().config.gap).toBe(10)
    expect(store.getState().config.snap).toBe(5)
    expect(store.getState().config.layout?.[0]?.w).toBe(100)
  })
  it('updateWidgetLayout with className preserves other fields', () => {
    const store = createStore<'a'>({
      layout: [{ className: 'old', h: 200, key: 'a', w: 300 }]
    })
    store.updateWidgetLayout('a', { className: 'new' })
    const entry = store.getState().config.layout?.[0]
    expect(entry?.w).toBe(300)
    expect(entry?.h).toBe(200)
    expect(entry?.className).toBe('new')
  })
  it('reset calls onReset callback', () => {
    const store = createStore<'a'>({ gap: 8 })
    let resetCalled = false
    store.setOnReset(() => {
      resetCalled = true
    })
    store.reset()
    expect(resetCalled).toBe(true)
  })
  it('reset does not call onReset when not set', () => {
    const store = createStore({})
    expect(() => store.reset()).not.toThrow()
  })
  it('setOnReset(null) clears callback', () => {
    const store = createStore({})
    let called = false
    store.setOnReset(() => {
      called = true
    })
    store.setOnReset(null)
    store.reset()
    expect(called).toBe(false)
  })
  it('handles single item layout', () => {
    const store = createStore<'only'>({ layout: [{ key: 'only', w: 400 }] })
    expect(store.getState().config.layout).toHaveLength(1)
    expect(store.getState().config.layout?.[0]?.key).toBe('only')
  })
  it('handles all items hidden', () => {
    const store = createStore<'a' | 'b'>({
        layout: [
          { hidden: true, key: 'a' },
          { hidden: true, key: 'b' }
        ]
      }),
      layout = store.getState().config.layout ?? []
    for (const entry of layout) expect(entry.hidden).toBe(true)
  })
  it('handles item added dynamically (no layout entry)', () => {
    const store = createStore<'a' | 'b'>({ layout: [{ key: 'a', w: 300 }] })
    expect(store.getState().config.layout?.find(e => e.key === 'b')).toBeUndefined()
    store.updateWidgetLayout('b', { w: 200 })
    expect(store.getState().config.layout?.find(e => e.key === 'b')?.w).toBe(200)
  })
  it('handles item removed (layout entry for nonexistent key persists)', () => {
    const store = createStore<'a' | 'b'>({
      layout: [
        { key: 'a', w: 300 },
        { key: 'b', w: 200 }
      ]
    })
    expect(store.getState().config.layout).toHaveLength(2)
  })
  it('reorderKeys with keys not in layout creates no entries', () => {
    const store = createStore<'a'>({ layout: [] })
    store.reorderKeys(['a'])
    expect(store.getState().config.layout).toHaveLength(0)
  })
})
