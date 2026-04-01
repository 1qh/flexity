import { describe, expect, it, spyOn } from 'bun:test'
import { validateClassName, validateConfig } from '../validation'
const noop = () => undefined
describe('validateConfig', () => {
  it('throws on snap < 1', () => {
    expect(() => validateConfig({ snap: 0 })).toThrow('snap must be >= 1')
    expect(() => validateConfig({ snap: -1 })).toThrow('snap must be >= 1')
  })
  it('throws on gap < 0', () => {
    expect(() => validateConfig({ gap: -1 })).toThrow('gap must be >= 0')
    expect(() => validateConfig({ gap: -10 })).toThrow('gap must be >= 0')
  })
  it('allows gap = 0', () => {
    expect(() => validateConfig({ gap: 0 })).not.toThrow()
  })
  it('allows snap = 1', () => {
    expect(() => validateConfig({ snap: 1 })).not.toThrow()
  })
  it('throws on empty key', () => {
    expect(() => validateConfig({ layout: [{ key: '' }] })).toThrow('non-empty string')
  })
  it('throws on duplicate layout keys', () => {
    expect(() => validateConfig({ layout: [{ key: 'a' }, { key: 'a' }] })).toThrow("Duplicate key 'a'")
  })
  it('throws on w <= 0', () => {
    expect(() => validateConfig({ layout: [{ key: 'a', w: 0 }] })).toThrow('w must be > 0')
    expect(() => validateConfig({ layout: [{ key: 'a', w: -5 }] })).toThrow('w must be > 0')
  })
  it('throws on fractional w that snaps to 0', () => {
    expect(() => validateConfig({ layout: [{ key: 'a', w: 0.4 }], snap: 1 })).toThrow('snaps to 0')
    expect(() => validateConfig({ layout: [{ key: 'a', w: 4 }], snap: 10 })).toThrow('snaps to 0')
  })
  it('allows fractional w that snaps to positive', () => {
    expect(() => validateConfig({ layout: [{ key: 'a', w: 0.6 }], snap: 1 })).not.toThrow()
    expect(() => validateConfig({ layout: [{ key: 'a', w: 5 }], snap: 8 })).not.toThrow()
  })
  it('allows w: auto', () => {
    expect(() => validateConfig({ layout: [{ key: 'a', w: 'auto' }] })).not.toThrow()
  })
  it('allows valid config', () => {
    expect(() =>
      validateConfig({
        gap: 16,
        layout: [
          { key: 'chart', w: 640 },
          { key: 'kpi', w: 320 }
        ],
        snap: 8
      })
    ).not.toThrow()
  })
  it('allows empty layout', () => {
    expect(() => validateConfig({ layout: [] })).not.toThrow()
  })
  it('allows config with no layout', () => {
    expect(() => validateConfig({})).not.toThrow()
  })
})
describe('validateClassName', () => {
  it('reports banned width classes', () => {
    const spy = spyOn(console, 'error').mockImplementation(noop)
    validateClassName('test', 'w-full', false)
    expect(spy).toHaveBeenCalledTimes(1)
    spy.mockRestore()
  })
  it('reports banned height classes', () => {
    const spy = spyOn(console, 'error').mockImplementation(noop)
    validateClassName('test', 'h-64', false)
    expect(spy).toHaveBeenCalledTimes(1)
    spy.mockRestore()
  })
  it('reports banned margin classes', () => {
    const spy = spyOn(console, 'error').mockImplementation(noop)
    validateClassName('test', 'm-4', false)
    expect(spy).toHaveBeenCalledTimes(1)
    spy.mockRestore()
  })
  it('reports banned overflow classes', () => {
    const spy = spyOn(console, 'error').mockImplementation(noop)
    validateClassName('test', 'overflow-hidden', false)
    expect(spy).toHaveBeenCalledTimes(1)
    spy.mockRestore()
  })
  it('reports banned position classes', () => {
    const spy = spyOn(console, 'error').mockImplementation(noop)
    validateClassName('test', 'absolute top-0', false)
    expect(spy).toHaveBeenCalledTimes(1)
    spy.mockRestore()
  })
  it('reports banned transform classes', () => {
    const spy = spyOn(console, 'error').mockImplementation(noop)
    validateClassName('test', 'translate-x-4', false)
    expect(spy).toHaveBeenCalledTimes(1)
    spy.mockRestore()
  })
  it('reports banned classes with variant prefixes', () => {
    const spy = spyOn(console, 'error').mockImplementation(noop)
    validateClassName('test', 'sm:w-full', false)
    expect(spy).toHaveBeenCalledTimes(1)
    spy.mockRestore()
  })
  it('reports banned classes with important modifier', () => {
    const spy = spyOn(console, 'error').mockImplementation(noop)
    validateClassName('test', '!w-full', false)
    expect(spy).toHaveBeenCalledTimes(1)
    spy.mockRestore()
  })
  it('reports banned classes with negative modifier', () => {
    const spy = spyOn(console, 'error').mockImplementation(noop)
    validateClassName('test', '-m-4', false)
    expect(spy).toHaveBeenCalledTimes(1)
    spy.mockRestore()
  })
  it('reports container exact match', () => {
    const spy = spyOn(console, 'error').mockImplementation(noop)
    validateClassName('test', 'container', false)
    expect(spy).toHaveBeenCalledTimes(1)
    spy.mockRestore()
  })
  it('throws when strict is true', () => {
    expect(() => validateClassName('test', 'w-full', true)).toThrow()
  })
  it('allows valid Tailwind classes', () => {
    const spy = spyOn(console, 'error').mockImplementation(noop)
    validateClassName('test', 'pt-3 rounded-lg bg-muted shadow-lg', false)
    validateClassName('test', 'flex gap-2 items-center', false)
    validateClassName('test', 'relative z-10', false)
    validateClassName('test', 'border border-border/50', false)
    validateClassName('test', 'opacity-50 blur-sm', false)
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })
  it('allows flex direction classes', () => {
    const spy = spyOn(console, 'error').mockImplementation(noop)
    validateClassName('test', 'flex-col flex-row flex-wrap', false)
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })
  it('bans flex sizing classes', () => {
    const spy = spyOn(console, 'error').mockImplementation(noop)
    validateClassName('test', 'flex-1', false)
    expect(spy).toHaveBeenCalledTimes(1)
    spy.mockRestore()
  })
  it('bans hidden', () => {
    const spy = spyOn(console, 'error').mockImplementation(noop)
    validateClassName('test', 'hidden', false)
    expect(spy).toHaveBeenCalledTimes(1)
    spy.mockRestore()
  })
  it('allows container-type-* classes', () => {
    const spy = spyOn(console, 'error').mockImplementation(noop)
    validateClassName('test', 'container-type-inline-size', false)
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })
  it('bans combined variant sm:!-m-4', () => {
    const spy = spyOn(console, 'error').mockImplementation(noop)
    validateClassName('test', 'sm:!-m-4', false)
    expect(spy).toHaveBeenCalledTimes(1)
    spy.mockRestore()
  })
  it('bans flex-auto flex-none flex-initial', () => {
    const spy = spyOn(console, 'error').mockImplementation(noop)
    validateClassName('test', 'flex-auto', false)
    expect(spy).toHaveBeenCalledTimes(1)
    spy.mockRestore()
    const spy2 = spyOn(console, 'error').mockImplementation(noop)
    validateClassName('test', 'flex-none', false)
    expect(spy2).toHaveBeenCalledTimes(1)
    spy2.mockRestore()
  })
  it('bans aspect-* classes', () => {
    const spy = spyOn(console, 'error').mockImplementation(noop)
    validateClassName('test', 'aspect-video', false)
    expect(spy).toHaveBeenCalledTimes(1)
    spy.mockRestore()
  })
  it('bans resize classes', () => {
    const spy = spyOn(console, 'error').mockImplementation(noop)
    validateClassName('test', 'resize', false)
    expect(spy).toHaveBeenCalledTimes(1)
    spy.mockRestore()
  })
  it('bans size-* classes', () => {
    const spy = spyOn(console, 'error').mockImplementation(noop)
    validateClassName('test', 'size-4', false)
    expect(spy).toHaveBeenCalledTimes(1)
    spy.mockRestore()
  })
  it('allows grid interior classes', () => {
    const spy = spyOn(console, 'error').mockImplementation(noop)
    validateClassName('test', 'grid grid-cols-2 gap-4', false)
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })
  it('allows padding classes', () => {
    const spy = spyOn(console, 'error').mockImplementation(noop)
    validateClassName('test', 'p-4 px-6 py-2 pt-3 pb-8 pl-1 pr-2', false)
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })
})
