/** biome-ignore-all lint/style/noProcessEnv: env check */
/* eslint-disable no-console, @typescript-eslint/no-unsafe-member-access */
import type { GridConfig } from './types'
import { BANNED_PREFIXES } from './types'
const isDev = () => typeof process !== 'undefined' && process.env.NODE_ENV === 'development',
  escapeRegex = (s: string) => s.replaceAll(/[.*+?^${}()|[\]\\]/gu, '\\$&'),
  BANNED_REGEX = (() => {
    const prefixPatterns = BANNED_PREFIXES.map(p => escapeRegex(p)),
      pattern = `(?:^|\\s|:)(?:!?-?|!-?)(?:${prefixPatterns.join('|')})`
    return new RegExp(pattern, 'u')
  })(),
  CONTAINER_EXACT = /(?:^|\s)(?:[a-z-]+:)*(?:!?-?|!-?)container(?:\s|$)/u,
  report = (message: string, strict: boolean) => {
    if (strict) throw new Error(message)
    console.error(message)
  },
  VOID_ELEMENTS = new Set([
    'area',
    'base',
    'br',
    'canvas',
    'col',
    'embed',
    'hr',
    'img',
    'input',
    'link',
    'meta',
    'source',
    'track',
    'wbr'
  ]),
  validateRootElement = (key: string, root: HTMLElement, strict: boolean) => {
    const tag = root.tagName.toLowerCase(),
      hasAttributes = root.attributes.length > 0,
      childElements = root.children.length,
      hasTextContent = root.childNodes.length > 0 && childElements === 0
    if (VOID_ELEMENTS.has(tag) || (childElements === 0 && !hasTextContent)) return
    if (!hasAttributes && (childElements > 0 || hasTextContent)) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (hasTextContent && childElements === 0)
        report(
          `[ogrid] Item '${key}': root <${tag}> wraps only text with no attributes. Pass the text directly as a string.`,
          strict
        )
      else
        report(
          `[ogrid] Item '${key}': root <${tag}> has no attributes and has children. Use a fragment (<>...</>) instead.`,
          strict
        )
      return
    }
    if (childElements === 1)
      report(
        `[ogrid] Item '${key}': root <${tag}> wraps a single child. Remove the wrapper and pass content directly. Move styling to layout.className.`,
        strict
      )
  },
  validateConfig = <K extends string>(config: GridConfig<K>) => {
    if (config.snap !== undefined && config.snap < 1)
      throw new Error(`[ogrid] snap must be >= 1. Received: ${String(config.snap)}`)
    if (config.gap !== undefined && config.gap < 0)
      throw new Error(`[ogrid] gap must be >= 0. Received: ${String(config.gap)}`)
    if (config.layout) {
      const snap = config.snap ?? 1,
        seen = new Set<string>()
      for (const entry of config.layout) {
        if (entry.key === '') throw new Error('[ogrid] Item key must be a non-empty string. Found empty string key.')
        if (seen.has(entry.key))
          throw new Error(`[ogrid] Duplicate key '${entry.key}' in layout array. Each key must appear once.`)
        seen.add(entry.key)
        if (typeof entry.w === 'number') {
          const snapped = Math.round(entry.w / snap) * snap
          if (snapped <= 0)
            throw new Error(
              `[ogrid] Item '${entry.key}': w must be > 0 or 'auto'. Received: ${String(entry.w)} (snaps to ${String(snapped)})`
            )
        }
      }
    }
  },
  STRIP_MODIFIERS = /^[!-]*/u,
  getBannedReason = (matched: string): string => {
    const clean = matched.replace(STRIP_MODIFIERS, '')
    if (
      clean.startsWith('w-') ||
      clean.startsWith('h-') ||
      clean.startsWith('size-') ||
      clean.startsWith('min-w') ||
      clean.startsWith('max-w') ||
      clean.startsWith('min-h') ||
      clean.startsWith('max-h')
    )
      return 'Use layout.w or layout.h instead.'
    if (
      clean.startsWith('m-') ||
      clean.startsWith('mx-') ||
      clean.startsWith('my-') ||
      clean.startsWith('mt-') ||
      clean.startsWith('mr-') ||
      clean.startsWith('mb-') ||
      clean.startsWith('ml-') ||
      clean.startsWith('ms-') ||
      clean.startsWith('me-')
    )
      return 'Use config.gap for spacing between items, padding for inner spacing.'
    if (clean.startsWith('overflow')) return 'The grid controls overflow based on layout.w and layout.h.'
    if (
      ['absolute', 'fixed', 'sticky'].some(p => clean.startsWith(p)) ||
      clean.startsWith('top-') ||
      clean.startsWith('right-') ||
      clean.startsWith('bottom-') ||
      clean.startsWith('left-') ||
      clean.startsWith('inset-')
    )
      return 'The grid controls positioning.'
    if (
      clean.startsWith('translate') ||
      clean.startsWith('scale') ||
      clean.startsWith('rotate') ||
      clean.startsWith('skew') ||
      clean === 'transform'
    )
      return 'Transform classes conflict with drag.'
    if (clean === 'hidden') return 'Use layout.hidden instead.'
    if (clean === 'resize' || clean.startsWith('resize')) return 'Resize classes conflict with resize handles.'
    return 'This class is not allowed on the grid wrapper.'
  },
  validateClassName = (key: string, className: string, strict: boolean) => {
    if (BANNED_REGEX.test(className)) {
      const match = className.match(BANNED_REGEX),
        matched = match ? match[0].trim() : className,
        isVariant = matched.includes(':'),
        bare = matched.split(':').pop() ?? matched,
        reason = getBannedReason(bare),
        suffix = isVariant
          ? bare.startsWith('w-') ||
            bare.startsWith('h-') ||
            bare.startsWith('size-') ||
            bare.startsWith('min-') ||
            bare.startsWith('max-')
            ? ' Size classes are banned even with variant prefixes.'
            : ' This class is banned even with variant prefixes.'
          : ''
      report(`[ogrid] Item '${key}': '${matched}' is not allowed in layout.className. ${reason}${suffix}`, strict)
    }
    if (CONTAINER_EXACT.test(className))
      report(
        `[ogrid] Item '${key}': 'container' (Tailwind max-width utility) is not allowed in layout.className. container-type-* for CSS containment is allowed.`,
        strict
      )
  },
  validateDom = (key: string, wrapper: HTMLElement, strict: boolean) => {
    const root = wrapper.firstElementChild
    if (!root) return
    if (root instanceof HTMLElement && root.dataset.ogridHandle !== undefined) {
      const contentRoot = wrapper.querySelector('[data-ogrid-content]')?.firstElementChild
      if (!contentRoot) return
      validateRootElement(key, contentRoot as HTMLElement, strict)
      return
    }
    validateRootElement(key, root as HTMLElement, strict)
  },
  validateNoNestedGrid = (element: HTMLElement) => {
    let current = element.parentElement
    while (current) {
      if (current.classList.contains('ogrid')) {
        const itemKey = element.closest('[data-ogrid-key]')?.getAttribute('data-ogrid-key') ?? 'unknown'
        throw new Error(`[ogrid] Nested grids are not supported. Remove the inner <Grid> from item '${itemKey}'.`)
      }
      current = current.parentElement
    }
  }
export { isDev, report, validateClassName, validateConfig, validateDom, validateNoNestedGrid, validateRootElement }
