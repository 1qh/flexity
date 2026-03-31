import { describe, expect, it } from 'bun:test'
import { formatConfigForCopy } from '../panel'
describe('formatConfigForCopy', () => {
  it('generates empty config for defaults', () => {
    const result = formatConfigForCopy({}, [])
    expect(result).toBe('{\n}')
  })
  it('includes gap when non-zero', () => {
    const result = formatConfigForCopy({ gap: 16 }, [])
    expect(result).toContain('gap: 16')
  })
  it('omits gap when zero', () => {
    const result = formatConfigForCopy({ gap: 0 }, [])
    expect(result).not.toContain('gap')
  })
  it('includes snap when non-default', () => {
    const result = formatConfigForCopy({ snap: 8 }, [])
    expect(result).toContain('snap: 8')
  })
  it('omits snap when 1', () => {
    const result = formatConfigForCopy({ snap: 1 }, [])
    expect(result).not.toContain('snap')
  })
  it('formats layout entries with w', () => {
    const result = formatConfigForCopy({ layout: [{ key: 'chart', w: 640 }] }, ['chart'])
    expect(result).toContain("key: 'chart'")
    expect(result).toContain('w: 640')
  })
  it('formats w: auto with quotes', () => {
    const result = formatConfigForCopy({ layout: [{ key: 'a', w: 'auto' }] }, ['a'])
    expect(result).toContain("w: 'auto'")
  })
  it('includes h when set', () => {
    const result = formatConfigForCopy({ layout: [{ h: 400, key: 'a' }] }, ['a'])
    expect(result).toContain('h: 400')
  })
  it('includes hidden when true', () => {
    const result = formatConfigForCopy({ layout: [{ hidden: true, key: 'a' }] }, ['a'])
    expect(result).toContain('hidden: true')
  })
  it('includes className when set', () => {
    const result = formatConfigForCopy({ layout: [{ className: 'pt-3 rounded-lg', key: 'a' }] }, ['a'])
    expect(result).toContain("className: 'pt-3 rounded-lg'")
  })
  it('filters layout entries not in itemKeys', () => {
    const result = formatConfigForCopy(
      {
        layout: [
          { key: 'a', w: 100 },
          { key: 'b', w: 200 }
        ]
      },
      ['a']
    )
    expect(result).toContain("key: 'a'")
    expect(result).not.toContain("key: 'b'")
  })
  it('generates pasteable JS object literal', () => {
    const result = formatConfigForCopy(
      {
        gap: 16,
        layout: [
          { key: 'chart', w: 640 },
          { className: 'pt-3 rounded-lg bg-muted', key: 'kpi', w: 320 }
        ],
        snap: 8
      },
      ['chart', 'kpi']
    )
    expect(result).toContain('{')
    expect(result).toContain('}')
    expect(result).toContain('layout: [')
    expect(result).not.toContain('"')
  })
})
