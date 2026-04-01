import { describe, expect, it } from 'bun:test'
import { cn } from '../cn'
describe('cn', () => {
  it('merges class strings', () => {
    expect(cn('px-2', 'py-3')).toBe('px-2 py-3')
  })
  it('handles falsy values', () => {
    expect(cn('px-2', false, null, undefined, 'py-3')).toBe('px-2 py-3')
  })
  it('resolves Tailwind conflicts (last wins)', () => {
    expect(cn('pt-3', 'pt-5')).toBe('pt-5')
  })
  it('preserves non-conflicting classes', () => {
    const result = cn('pt-3 space-y-4 bg-gradient-to-r', 'pt-5 rounded-xl')
    expect(result).toContain('pt-5')
    expect(result).toContain('space-y-4')
    expect(result).toContain('rounded-xl')
    expect(result).not.toContain('pt-3')
  })
  it('returns empty string for no inputs', () => {
    expect(cn()).toBe('')
  })
  it('returns empty string for all falsy', () => {
    expect(cn(false, null, undefined)).toBe('')
  })
  it('handles single class', () => {
    expect(cn('flex')).toBe('flex')
  })
})
