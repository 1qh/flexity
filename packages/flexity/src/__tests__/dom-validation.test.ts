/** biome-ignore-all lint/nursery/useImportsFirst: HTMLElement polyfill must run before validation import */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* oxlint-disable import/first */
import { describe, expect, it, spyOn } from 'bun:test'
if (globalThis.HTMLElement === undefined) {
  // eslint-disable-next-line @typescript-eslint/no-extraneous-class
  ;(globalThis as Record<string, unknown>).HTMLElement = class HtmlElementPolyfill {}
}
import { validateDom, validateNoNestedGrid, validateRootElement } from '../validation'
const noop = () => undefined,
  makeAttrs = (attrs: Record<string, string>) => {
    const entries = Object.entries(attrs)
    return {
      getNamedItem: (name: string) => {
        const v = attrs[name]
        return v === undefined ? null : { name, value: v }
      },
      length: entries.length
    }
  },
  el = (tag: string, opts: { attrs?: Record<string, string>; children?: unknown[]; text?: string } = {}): HTMLElement => {
    const { attrs = {}, children = [], text } = opts,
      childElements = children.filter((c): c is HTMLElement => typeof c === 'object' && c !== null),
      element: unknown = {
        attributes: makeAttrs(attrs),
        childNodes: { length: text && childElements.length === 0 ? 1 : childElements.length },
        children: { length: childElements.length },
        classList: {
          contains: (cls: string) => (attrs.class ?? '').split(' ').includes(cls)
        },
        closest: (selector: string) => {
          if (selector === '[data-flexity-key]' && attrs['data-flexity-key'] !== undefined) return element
          return null
        },
        dataset: attrs['data-flexity-handle'] === undefined ? {} : { flexityHandle: '' },
        firstElementChild: childElements[0] ?? null,
        getAttribute: (name: string) => attrs[name] ?? null,
        parentElement: null as unknown,
        querySelector: (selector: string) => {
          if (selector === '[data-flexity-content]')
            for (const child of childElements) {
              const childData = (child as { dataset?: Record<string, string> }).dataset
              if (childData?.flexityContent !== undefined) return child
            }
          return null
        },
        tagName: tag.toUpperCase()
      }
    for (const child of childElements) {
      ;(child as { parentElement: unknown }).parentElement = element
    }
    return element as HTMLElement
  }
describe('validateRootElement', () => {
  it('reports bare div wrapping children (no attributes)', () => {
    const root = el('div', { children: [el('span'), el('span')] }),
      spy = spyOn(console, 'error').mockImplementation(noop)
    validateRootElement('test', root, false)
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy.mock.calls[0][0]).toContain('fragment')
    spy.mockRestore()
  })
  it('throws bare div wrapping children in strict mode', () => {
    const root = el('div', { children: [el('span'), el('span')] })
    expect(() => validateRootElement('test', root, true)).toThrow('fragment')
  })
  it('reports single-child wrapper', () => {
    const root = el('div', { attrs: { class: 'p-4' }, children: [el('span')] }),
      spy = spyOn(console, 'error').mockImplementation(noop)
    validateRootElement('test', root, false)
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy.mock.calls[0][0]).toContain('single child')
    spy.mockRestore()
  })
  it('throws single-child wrapper in strict mode', () => {
    const root = el('div', { attrs: { class: 'p-4' }, children: [el('span')] })
    expect(() => validateRootElement('test', root, true)).toThrow('single child')
  })
  it('reports bare text wrapper (no attributes)', () => {
    const root = el('div', { text: 'hello' }),
      spy = spyOn(console, 'error').mockImplementation(noop)
    validateRootElement('test', root, false)
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy.mock.calls[0][0]).toContain('text')
    spy.mockRestore()
  })
  it('throws bare text wrapper in strict mode', () => {
    const root = el('div', { text: 'hello' })
    expect(() => validateRootElement('test', root, true)).toThrow('text')
  })
  it('allows element with attributes and multiple children', () => {
    const root = el('div', { attrs: { class: 'flex gap-2' }, children: [el('span'), el('span')] }),
      spy = spyOn(console, 'error').mockImplementation(noop)
    validateRootElement('test', root, false)
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })
  it('allows void/leaf elements', () => {
    const spy = spyOn(console, 'error').mockImplementation(noop)
    for (const tag of ['canvas', 'img', 'hr', 'br', 'input', 'area', 'embed', 'source', 'track', 'wbr'])
      validateRootElement('test', el(tag), false)
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })
  it('allows element wrapping text WITH attributes', () => {
    const root = el('code', { attrs: { class: 'font-mono' }, text: 'hello' }),
      spy = spyOn(console, 'error').mockImplementation(noop)
    validateRootElement('test', root, false)
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })
  it('allows element with no children and no text', () => {
    const root = el('div', { attrs: { class: 'empty-state' } }),
      spy = spyOn(console, 'error').mockImplementation(noop)
    validateRootElement('test', root, false)
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })
})
describe('validateDom', () => {
  it('skips when wrapper has no children', () => {
    const wrapper = el('div'),
      spy = spyOn(console, 'error').mockImplementation(noop)
    validateDom('test', wrapper, false)
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })
  it('checks root element of wrapper', () => {
    const root = el('div', { children: [el('span'), el('span')] }),
      wrapper = el('div', { children: [root] }),
      spy = spyOn(console, 'error').mockImplementation(noop)
    validateDom('test', wrapper, false)
    expect(spy).toHaveBeenCalledTimes(1)
    spy.mockRestore()
  })
})
describe('validateNoNestedGrid', () => {
  it('throws when parent has flexity class', () => {
    const parent = el('div', { attrs: { class: 'flexity' } }),
      child = el('div', { attrs: { 'data-flexity-key': 'inner' } })
    ;(child as { parentElement: unknown }).parentElement = parent
    ;(parent as { parentElement: unknown }).parentElement = null
    child.closest = (selector: string) => {
      if (selector === '[data-flexity-key]') return child
      return null
    }
    expect(() => validateNoNestedGrid(child)).toThrow('Nested grids')
  })
  it('does not throw when no ancestor has flexity class', () => {
    const parent = el('div', { attrs: { class: 'some-class' } }),
      child = el('div')
    ;(child as { parentElement: unknown }).parentElement = parent
    ;(parent as { parentElement: unknown }).parentElement = null
    expect(() => validateNoNestedGrid(child)).not.toThrow()
  })
})
