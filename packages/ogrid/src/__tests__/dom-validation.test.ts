/** biome-ignore-all lint/suspicious/noEmptyBlockStatements: mock implementations */
/** biome-ignore-all lint/nursery/useImportsFirst: HTMLElement polyfill must run before validation import */
/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-extraneous-class */
import { describe, expect, it, spyOn } from 'bun:test'
if (typeof globalThis.HTMLElement === 'undefined') {
  ;(globalThis as Record<string, unknown>).HTMLElement = class HTMLElement {}
}
import { validateDom, validateNoNestedGrid, validateRootElement } from '../validation'
const makeAttrs = (attrs: Record<string, string>) => {
    const entries = Object.entries(attrs)
    return {
      length: entries.length,
      getNamedItem: (name: string) => {
        const v = attrs[name]
        return v === undefined ? null : { name, value: v }
      }
    }
  },
  el = (tag: string, attrs: Record<string, string> = {}, children: unknown[] = [], text?: string): HTMLElement => {
    const childElements = children.filter((c): c is HTMLElement => typeof c === 'object' && c !== null),
      element: unknown = {
        tagName: tag.toUpperCase(),
        attributes: makeAttrs(attrs),
        children: { length: childElements.length },
        childNodes: { length: text && childElements.length === 0 ? 1 : childElements.length },
        firstElementChild: childElements[0] ?? null,
        classList: {
          contains: (cls: string) => (attrs.class ?? '').split(' ').includes(cls)
        },
        parentElement: null as unknown,
        dataset: attrs['data-ogrid-handle'] === undefined ? {} : { ogridHandle: '' },
        getAttribute: (name: string) => attrs[name] ?? null,
        closest: (selector: string) => {
          if (selector === '[data-ogrid-key]' && attrs['data-ogrid-key'] !== undefined) return element
          return null
        },
        querySelector: (selector: string) => {
          if (selector === '[data-ogrid-content]')
            for (const child of childElements) {
              if ((child as { dataset?: Record<string, string> }).dataset?.ogridContent !== undefined) return child
              const found = (child as { getAttribute?: (n: string) => null | string }).getAttribute?.('data-ogrid-content')
              if (found !== null && found !== undefined) return child
            }
          return null
        }
      }
    for (const child of childElements) {
      ;(child as { parentElement: unknown }).parentElement = element
    }
    return element as HTMLElement
  }
describe('validateRootElement', () => {
  it('reports bare div wrapping children (no attributes)', () => {
    const root = el('div', {}, [el('span'), el('span')]),
      spy = spyOn(console, 'error').mockImplementation(() => {})
    validateRootElement('test', root, false)
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy.mock.calls[0][0]).toContain('fragment')
    spy.mockRestore()
  })
  it('throws bare div wrapping children in strict mode', () => {
    const root = el('div', {}, [el('span'), el('span')])
    expect(() => validateRootElement('test', root, true)).toThrow('fragment')
  })
  it('reports single-child wrapper', () => {
    const root = el('div', { class: 'p-4' }, [el('span')]),
      spy = spyOn(console, 'error').mockImplementation(() => {})
    validateRootElement('test', root, false)
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy.mock.calls[0][0]).toContain('single child')
    spy.mockRestore()
  })
  it('throws single-child wrapper in strict mode', () => {
    const root = el('div', { class: 'p-4' }, [el('span')])
    expect(() => validateRootElement('test', root, true)).toThrow('single child')
  })
  it('reports bare text wrapper (no attributes)', () => {
    const root = el('div', {}, [], 'hello'),
      spy = spyOn(console, 'error').mockImplementation(() => {})
    validateRootElement('test', root, false)
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy.mock.calls[0][0]).toContain('text')
    spy.mockRestore()
  })
  it('throws bare text wrapper in strict mode', () => {
    const root = el('div', {}, [], 'hello')
    expect(() => validateRootElement('test', root, true)).toThrow('text')
  })
  it('allows element with attributes and multiple children', () => {
    const root = el('div', { class: 'flex gap-2' }, [el('span'), el('span')]),
      spy = spyOn(console, 'error').mockImplementation(() => {})
    validateRootElement('test', root, false)
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })
  it('allows void/leaf elements', () => {
    const spy = spyOn(console, 'error').mockImplementation(() => {})
    for (const tag of ['canvas', 'img', 'hr', 'br', 'input', 'area', 'embed', 'source', 'track', 'wbr'])
      validateRootElement('test', el(tag), false)
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })
  it('allows element wrapping text WITH attributes', () => {
    const root = el('code', { class: 'font-mono' }, [], 'hello'),
      spy = spyOn(console, 'error').mockImplementation(() => {})
    validateRootElement('test', root, false)
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })
  it('allows element with no children and no text', () => {
    const root = el('div', { class: 'empty-state' }),
      spy = spyOn(console, 'error').mockImplementation(() => {})
    validateRootElement('test', root, false)
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })
})
describe('validateDom', () => {
  it('skips when wrapper has no children', () => {
    const wrapper = el('div'),
      spy = spyOn(console, 'error').mockImplementation(() => {})
    validateDom('test', wrapper, false)
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })
  it('checks root element of wrapper', () => {
    const root = el('div', {}, [el('span'), el('span')]),
      wrapper = el('div', {}, [root]),
      spy = spyOn(console, 'error').mockImplementation(() => {})
    validateDom('test', wrapper, false)
    expect(spy).toHaveBeenCalledTimes(1)
    spy.mockRestore()
  })
})
describe('validateNoNestedGrid', () => {
  it('throws when parent has ogrid class', () => {
    const parent = el('div', { class: 'ogrid' }),
      child = el('div', { 'data-ogrid-key': 'inner' })
    ;(child as { parentElement: unknown }).parentElement = parent
    ;(parent as { parentElement: unknown }).parentElement = null
    child.closest = (selector: string) => {
      if (selector === '[data-ogrid-key]') return child
      return null
    }
    expect(() => validateNoNestedGrid(child)).toThrow('Nested grids')
  })
  it('does not throw when no ancestor has ogrid class', () => {
    const parent = el('div', { class: 'some-class' }),
      child = el('div')
    ;(child as { parentElement: unknown }).parentElement = parent
    ;(parent as { parentElement: unknown }).parentElement = null
    expect(() => validateNoNestedGrid(child)).not.toThrow()
  })
})
