import { describe, expect, it } from 'vitest'
import { validateClassName, validateConfig } from '../validation'

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
    expect(() =>
      validateConfig({ layout: [{ key: 'a' }, { key: 'a' }] }),
    ).toThrow("Duplicate key 'a'")
  })

  it('throws on w <= 0', () => {
    expect(() => validateConfig({ layout: [{ key: 'a', w: 0 }] })).toThrow('w must be > 0')
    expect(() => validateConfig({ layout: [{ key: 'a', w: -5 }] })).toThrow('w must be > 0')
  })

  it('allows w: auto', () => {
    expect(() => validateConfig({ layout: [{ key: 'a', w: 'auto' }] })).not.toThrow()
  })

  it('allows valid config', () => {
    expect(() =>
      validateConfig({
        gap: 16,
        snap: 8,
        layout: [{ key: 'chart', w: 640 }, { key: 'kpi', w: 320 }],
      }),
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
    const errors: string[] = []
    const originalError = console.error
    console.error = (msg: string) => errors.push(msg)
    validateClassName('test', 'w-full', false)
    console.error = originalError
    expect(errors.length).toBe(1)
    expect(errors[0]).toContain('w-')
  })

  it('reports banned height classes', () => {
    const errors: string[] = []
    const originalError = console.error
    console.error = (msg: string) => errors.push(msg)
    validateClassName('test', 'h-64', false)
    console.error = originalError
    expect(errors.length).toBe(1)
  })

  it('reports banned margin classes', () => {
    const errors: string[] = []
    const originalError = console.error
    console.error = (msg: string) => errors.push(msg)
    validateClassName('test', 'm-4', false)
    console.error = originalError
    expect(errors.length).toBe(1)
  })

  it('reports banned overflow classes', () => {
    const errors: string[] = []
    const originalError = console.error
    console.error = (msg: string) => errors.push(msg)
    validateClassName('test', 'overflow-hidden', false)
    console.error = originalError
    expect(errors.length).toBe(1)
  })

  it('reports banned position classes', () => {
    const errors: string[] = []
    const originalError = console.error
    console.error = (msg: string) => errors.push(msg)
    validateClassName('test', 'absolute top-0', false)
    console.error = originalError
    expect(errors.length).toBe(1)
  })

  it('reports banned transform classes', () => {
    const errors: string[] = []
    const originalError = console.error
    console.error = (msg: string) => errors.push(msg)
    validateClassName('test', 'translate-x-4', false)
    console.error = originalError
    expect(errors.length).toBe(1)
  })

  it('reports banned classes with variant prefixes', () => {
    const errors: string[] = []
    const originalError = console.error
    console.error = (msg: string) => errors.push(msg)
    validateClassName('test', 'sm:w-full', false)
    console.error = originalError
    expect(errors.length).toBe(1)
  })

  it('reports banned classes with important modifier', () => {
    const errors: string[] = []
    const originalError = console.error
    console.error = (msg: string) => errors.push(msg)
    validateClassName('test', '!w-full', false)
    console.error = originalError
    expect(errors.length).toBe(1)
  })

  it('reports banned classes with negative modifier', () => {
    const errors: string[] = []
    const originalError = console.error
    console.error = (msg: string) => errors.push(msg)
    validateClassName('test', '-m-4', false)
    console.error = originalError
    expect(errors.length).toBe(1)
  })

  it('reports container exact match', () => {
    const errors: string[] = []
    const originalError = console.error
    console.error = (msg: string) => errors.push(msg)
    validateClassName('test', 'container', false)
    console.error = originalError
    expect(errors.length).toBe(1)
    expect(errors[0]).toContain('container')
  })

  it('throws when strict is true', () => {
    expect(() => validateClassName('test', 'w-full', true)).toThrow()
  })

  it('allows valid Tailwind classes', () => {
    const errors: string[] = []
    const originalError = console.error
    console.error = (msg: string) => errors.push(msg)
    validateClassName('test', 'pt-3 rounded-lg bg-muted shadow-lg', false)
    validateClassName('test', 'flex gap-2 items-center', false)
    validateClassName('test', 'relative z-10', false)
    validateClassName('test', 'border border-border/50', false)
    validateClassName('test', 'opacity-50 blur-sm', false)
    console.error = originalError
    expect(errors.length).toBe(0)
  })

  it('allows flex direction classes', () => {
    const errors: string[] = []
    const originalError = console.error
    console.error = (msg: string) => errors.push(msg)
    validateClassName('test', 'flex-col flex-row flex-wrap', false)
    console.error = originalError
    expect(errors.length).toBe(0)
  })

  it('bans flex sizing classes', () => {
    const errors: string[] = []
    const originalError = console.error
    console.error = (msg: string) => errors.push(msg)
    validateClassName('test', 'flex-1', false)
    console.error = originalError
    expect(errors.length).toBe(1)
  })

  it('bans hidden', () => {
    const errors: string[] = []
    const originalError = console.error
    console.error = (msg: string) => errors.push(msg)
    validateClassName('test', 'hidden', false)
    console.error = originalError
    expect(errors.length).toBe(1)
  })

  it('allows container-type-* classes', () => {
    const errors: string[] = []
    const originalError = console.error
    console.error = (msg: string) => errors.push(msg)
    validateClassName('test', 'container-type-inline-size', false)
    console.error = originalError
    expect(errors.length).toBe(0)
  })
})
