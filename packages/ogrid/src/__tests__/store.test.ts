import { describe, expect, it } from 'bun:test'
import { createStore } from '../store'

describe('createStore', () => {
  it('initializes with given config', () => {
    const store = createStore({ gap: 16, snap: 8 })
    expect(store.getState().config.gap).toBe(16)
    expect(store.getState().config.snap).toBe(8)
  })

  it('notifies listeners on setState', () => {
    const store = createStore({})
    let called = 0
    store.subscribe(() => { called++ })
    store.setState({ containerWidth: 100 })
    expect(called).toBe(1)
  })

  it('unsubscribe stops notifications', () => {
    const store = createStore({})
    let called = 0
    const unsub = store.subscribe(() => { called++ })
    store.setState({ containerWidth: 100 })
    expect(called).toBe(1)
    unsub()
    store.setState({ containerWidth: 200 })
    expect(called).toBe(1)
  })

  it('updateWidgetLayout adds new entry', () => {
    const store = createStore<'a' | 'b'>({})
    store.updateWidgetLayout('a', { w: 320 })
    const layout = store.getState().config.layout
    expect(layout).toHaveLength(1)
    expect(layout?.[0]?.key).toBe('a')
    expect(layout?.[0]?.w).toBe(320)
  })

  it('updateWidgetLayout updates existing entry', () => {
    const store = createStore<'a'>({ layout: [{ key: 'a', w: 100 }] })
    store.updateWidgetLayout('a', { w: 200 })
    expect(store.getState().config.layout?.[0]?.w).toBe(200)
  })

  it('updateGridConfig merges', () => {
    const store = createStore({ gap: 8, snap: 4 })
    store.updateGridConfig({ gap: 16 })
    expect(store.getState().config.gap).toBe(16)
    expect(store.getState().config.snap).toBe(4)
  })

  it('reorderKeys reorders layout', () => {
    const store = createStore<'a' | 'b' | 'c'>({
      layout: [{ key: 'a' }, { key: 'b' }, { key: 'c' }],
    })
    store.reorderKeys(['c', 'a', 'b'])
    const keys = store.getState().config.layout?.map((e) => e.key)
    expect(keys).toEqual(['c', 'a', 'b'])
  })

  it('reset reverts to initial config', () => {
    const store = createStore({ gap: 16 })
    store.updateGridConfig({ gap: 32 })
    expect(store.getState().config.gap).toBe(32)
    store.reset()
    expect(store.getState().config.gap).toBe(16)
    expect(store.getState().selectedWidget).toBeNull()
  })

  it('setConfig replaces config', () => {
    const store = createStore({ gap: 8 })
    store.setConfig({ gap: 24, snap: 4 })
    expect(store.getState().config.gap).toBe(24)
    expect(store.getState().config.snap).toBe(4)
  })

  it('preserves non-matching layout entries on reorder', () => {
    const store = createStore<'a' | 'b' | 'c'>({
      layout: [{ key: 'a' }, { key: 'b' }, { key: 'c' }],
    })
    store.reorderKeys(['b', 'a'])
    const keys = store.getState().config.layout?.map((e) => e.key)
    expect(keys).toEqual(['b', 'a', 'c'])
  })

  it('selectedWidget starts null', () => {
    const store = createStore({})
    expect(store.getState().selectedWidget).toBeNull()
  })

  it('setState updates selectedWidget', () => {
    const store = createStore<'x'>({})
    store.setState({ selectedWidget: 'x' })
    expect(store.getState().selectedWidget).toBe('x')
  })

  it('updateWidgetLayout preserves other fields', () => {
    const store = createStore<'a'>({
      layout: [{ key: 'a', w: 100, className: 'pt-3' }],
    })
    store.updateWidgetLayout('a', { h: 200 })
    const entry = store.getState().config.layout?.[0]
    expect(entry?.w).toBe(100)
    expect(entry?.h).toBe(200)
    expect(entry?.className).toBe('pt-3')
  })
})
