/** biome-ignore-all lint/suspicious/noEmptyBlockStatements: mock implementations */
/** biome-ignore-all lint/nursery/useExpect: expect calls are inside helper functions */
/** biome-ignore-all lint/suspicious/noMisplacedAssertion: expect calls inside test helpers */
/* eslint-disable @typescript-eslint/no-empty-function */
import { describe, expect, it, spyOn } from 'bun:test'
import { validateClassName } from '../validation'
const expectBanned = (cls: string) => {
    const spy = spyOn(console, 'error').mockImplementation(() => {})
    validateClassName('test', cls, false)
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  },
  expectAllowed = (cls: string) => {
    const spy = spyOn(console, 'error').mockImplementation(() => {})
    validateClassName('test', cls, false)
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  }
describe('validateClassName — every banned prefix', () => {
  const testCases: Record<string, string> = {
    '-translate-': '-translate-y-full',
    absolute: 'absolute',
    'aspect-': 'aspect-video',
    'basis-': 'basis-1/2',
    'bottom-': 'bottom-0',
    'clear-': 'clear-both',
    'col-end': 'col-end-3',
    'col-span': 'col-span-2',
    'col-start': 'col-start-1',
    'end-': 'end-0',
    fixed: 'fixed',
    'flex-1': 'flex-1',
    'flex-[': 'flex-[2_2_0%]',
    'flex-auto': 'flex-auto',
    'flex-basis': 'flex-basis-0',
    'flex-grow': 'flex-grow',
    'flex-initial': 'flex-initial',
    'flex-none': 'flex-none',
    'flex-shrink': 'flex-shrink',
    'float-': 'float-left',
    grow: 'grow',
    'h-': 'h-64',
    hidden: 'hidden',
    'inset-': 'inset-0',
    isolate: 'isolate',
    'isolation-': 'isolation-auto',
    'left-': 'left-0',
    'm-': 'm-4',
    'max-h-': 'max-h-96',
    'max-w-': 'max-w-sm',
    'mb-': 'mb-6',
    'me-': 'me-2',
    'min-h-': 'min-h-screen',
    'min-w-': 'min-w-0',
    'ml-': 'ml-8',
    'mr-': 'mr-2',
    'ms-': 'ms-4',
    'mt-': 'mt-4',
    'mx-': 'mx-auto',
    'my-': 'my-2',
    'order-': 'order-1',
    'overflow-': 'overflow-hidden',
    resize: 'resize',
    'right-': 'right-0',
    'rotate-': 'rotate-45',
    'row-end': 'row-end-3',
    'row-span': 'row-span-2',
    'row-start': 'row-start-1',
    'scale-': 'scale-50',
    shrink: 'shrink',
    'size-': 'size-4',
    'skew-': 'skew-x-12',
    'start-': 'start-0',
    sticky: 'sticky',
    'top-': 'top-0',
    transform: 'transform',
    'translate-': 'translate-x-4',
    'w-': 'w-full'
  }
  for (const [prefix, cls] of Object.entries(testCases))
    it(`bans '${prefix}' (${cls})`, () => {
      expectBanned(cls)
    })
})
describe('validateClassName — variant prefixes', () => {
  const variants = ['sm:', 'md:', 'lg:', 'xl:', 'hover:', 'focus:', 'dark:', 'group-hover:']
  for (const variant of variants)
    it(`bans ${variant}w-full`, () => {
      expectBanned(`${variant}w-full`)
    })
  it('bans chained variants like sm:hover:w-full', () => {
    expectBanned('sm:hover:w-full')
  })
})
describe('validateClassName — modifier combinations', () => {
  it('bans !w-full (important)', () => {
    expectBanned('!w-full')
  })
  it('bans -m-4 (negative)', () => {
    expectBanned('-m-4')
  })
  it('bans !-m-4 (important + negative)', () => {
    expectBanned('!-m-4')
  })
  it('bans sm:!-m-4 (variant + important + negative)', () => {
    expectBanned('sm:!-m-4')
  })
  it('bans -translate-y-full (negative transform)', () => {
    expectBanned('-translate-y-full')
  })
})
describe('validateClassName — container exact match', () => {
  it('bans exact container', () => {
    expectBanned('container')
  })
  it('bans container with other classes', () => {
    expectBanned('flex container gap-4')
  })
  it('bans container with variant prefix', () => {
    expectBanned('sm:container')
  })
  it('allows container-type-* (CSS containment)', () => {
    expectAllowed('container-type-inline-size')
  })
  it('allows container-type-normal', () => {
    expectAllowed('container-type-normal')
  })
})
describe('validateClassName — allowed classes', () => {
  it('allows padding classes', () => {
    expectAllowed('p-4 px-6 py-2 pt-3 pb-8 pl-1 pr-2 ps-4 pe-6')
  })
  it('allows border classes', () => {
    expectAllowed('border border-2 border-t border-border/50 border-dashed rounded-lg')
  })
  it('allows shadow classes', () => {
    expectAllowed('shadow shadow-lg shadow-xl shadow-2xl')
  })
  it('allows opacity classes', () => {
    expectAllowed('opacity-50 opacity-0 opacity-100')
  })
  it('allows flex direction/wrap classes', () => {
    expectAllowed('flex flex-col flex-row flex-col-reverse flex-row-reverse flex-wrap flex-nowrap flex-wrap-reverse')
  })
  it('allows grid interior classes', () => {
    expectAllowed('grid grid-cols-2 grid-rows-3 auto-cols-fr gap-4 gap-x-2 gap-y-4')
  })
  it('allows alignment classes', () => {
    expectAllowed('items-center items-start justify-between justify-center content-start place-items-center self-end')
  })
  it('allows relative and z-index', () => {
    expectAllowed('relative z-10 z-50')
  })
  it('allows static', () => {
    expectAllowed('static')
  })
  it('allows typography classes', () => {
    expectAllowed('text-sm font-bold text-foreground leading-tight tracking-wide truncate')
  })
  it('allows background classes', () => {
    expectAllowed('bg-muted bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500')
  })
  it('allows color classes', () => {
    expectAllowed('text-foreground text-muted-foreground text-primary bg-primary bg-muted')
  })
  it('allows filter classes', () => {
    expectAllowed('blur-sm brightness-75 contrast-125 grayscale backdrop-blur-sm')
  })
  it('allows transition classes', () => {
    expectAllowed('transition-all duration-300 ease-in-out delay-100 animate-spin')
  })
  it('allows cursor and pointer classes', () => {
    expectAllowed('cursor-pointer pointer-events-none select-none touch-none')
  })
  it('allows display classes', () => {
    expectAllowed('block inline-block inline-flex contents flow-root')
  })
  it('allows space classes', () => {
    expectAllowed('space-x-4 space-y-2')
  })
  it('allows divide classes', () => {
    expectAllowed('divide-y divide-x divide-border')
  })
  it('allows ring/outline classes', () => {
    expectAllowed('ring-2 ring-primary outline-none outline-offset-2')
  })
  it('allows visible/invisible/collapse', () => {
    expectAllowed('visible invisible collapse')
  })
  it('allows allowed classes with variant prefixes', () => {
    expectAllowed('sm:flex-col hover:bg-muted dark:text-foreground md:gap-4')
  })
  it('allows sr-only', () => {
    expectAllowed('sr-only not-sr-only')
  })
  it('allows SVG classes', () => {
    expectAllowed('fill-current stroke-2')
  })
})
describe('validateClassName — strict mode', () => {
  it('throws on banned class in strict mode', () => {
    expect(() => validateClassName('test', 'w-full', true)).toThrow()
  })
  it('throws on container in strict mode', () => {
    expect(() => validateClassName('test', 'container', true)).toThrow()
  })
  it('does not throw on allowed class in strict mode', () => {
    expect(() => validateClassName('test', 'pt-3 rounded-lg', true)).not.toThrow()
  })
})
describe('validateClassName — error messages', () => {
  it('includes item key in message', () => {
    const spy = spyOn(console, 'error').mockImplementation(() => {})
    validateClassName('myWidget', 'w-full', false)
    expect(spy.mock.calls[0][0]).toContain('myWidget')
    spy.mockRestore()
  })
  it('mentions layout.w for sizing classes', () => {
    const spy = spyOn(console, 'error').mockImplementation(() => {})
    validateClassName('test', 'w-full', false)
    expect(spy.mock.calls[0][0]).toContain('layout.w')
    spy.mockRestore()
  })
  it('mentions config.gap for margin classes', () => {
    const spy = spyOn(console, 'error').mockImplementation(() => {})
    validateClassName('test', 'm-4', false)
    expect(spy.mock.calls[0][0]).toContain('gap')
    spy.mockRestore()
  })
  it('mentions overflow for overflow classes', () => {
    const spy = spyOn(console, 'error').mockImplementation(() => {})
    validateClassName('test', 'overflow-hidden', false)
    expect(spy.mock.calls[0][0]).toContain('overflow')
    spy.mockRestore()
  })
  it('mentions drag for transform classes', () => {
    const spy = spyOn(console, 'error').mockImplementation(() => {})
    validateClassName('test', 'translate-x-4', false)
    expect(spy.mock.calls[0][0]).toContain('drag')
    spy.mockRestore()
  })
  it('mentions positioning for position classes', () => {
    const spy = spyOn(console, 'error').mockImplementation(() => {})
    validateClassName('test', 'absolute', false)
    expect(spy.mock.calls[0][0]).toContain('positioning')
    spy.mockRestore()
  })
  it('mentions variant prefix warning', () => {
    const spy = spyOn(console, 'error').mockImplementation(() => {})
    validateClassName('test', 'sm:w-full', false)
    expect(spy.mock.calls[0][0]).toContain('variant')
    spy.mockRestore()
  })
  it('mentions layout.hidden for hidden class', () => {
    const spy = spyOn(console, 'error').mockImplementation(() => {})
    validateClassName('test', 'hidden', false)
    expect(spy.mock.calls[0][0]).toContain('layout.hidden')
    spy.mockRestore()
  })
  it('mentions resize handles for resize class', () => {
    const spy = spyOn(console, 'error').mockImplementation(() => {})
    validateClassName('test', 'resize', false)
    expect(spy.mock.calls[0][0]).toContain('resize')
    spy.mockRestore()
  })
})
