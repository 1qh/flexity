/** biome-ignore-all lint/nursery/noPlaywrightWaitForSelector: grid uses useEffect for config */
/** biome-ignore-all lint/nursery/noPlaywrightWaitForTimeout: async state updates need settling */
/** biome-ignore-all lint/performance/noAwaitInLoops: sequential DOM assertions */
/* eslint-disable no-await-in-loop, @typescript-eslint/consistent-type-imports */
/* oxlint-disable no-await-in-loop */
import { expect, test } from '@playwright/test'
const waitForGrid = async (page: import('@playwright/test').Page) => {
  await page.goto('/')
  await page.waitForSelector('.ogrid')
  await page.waitForTimeout(500)
}
test.describe('Grid rendering', () => {
  test('renders flex container with ogrid class', async ({ page }) => {
    await waitForGrid(page)
    const grid = page.locator('.ogrid')
    await expect(grid).toBeVisible()
    const display = await grid.evaluate(el => getComputedStyle(el).display)
    expect(display).toBe('flex')
    const flexWrap = await grid.evaluate(el => getComputedStyle(el).flexWrap)
    expect(flexWrap).toBe('wrap')
  })
  test('renders all 28 widget items', async ({ page }) => {
    await waitForGrid(page)
    await expect(page.locator('.ogrid-item')).toHaveCount(28)
  })
  test('each item has data-ogrid-key', async ({ page }) => {
    await waitForGrid(page)
    const items = page.locator('.ogrid-item'),
      count = await items.count()
    for (let i = 0; i < count; i += 1) {
      const key = await items.nth(i).getAttribute('data-ogrid-key')
      expect(key).toBeTruthy()
    }
  })
  test('items have box-sizing: border-box', async ({ page }) => {
    await waitForGrid(page)
    const boxSizing = await page
      .locator('.ogrid-item')
      .first()
      .evaluate(el => getComputedStyle(el).boxSizing)
    expect(boxSizing).toBe('border-box')
  })
  test('kpi widget has configured width', async ({ page }) => {
    await waitForGrid(page)
    const width = await page.locator('[data-ogrid-key="kpi"]').evaluate(el => el.getBoundingClientRect().width)
    expect(width).toBe(400)
  })
})
test.describe('drag reorder', () => {
  test('drag handle visible on hover', async ({ page }) => {
    await waitForGrid(page)
    const item = page.locator('[data-ogrid-key="kpi"]')
    await item.hover()
    await expect(item.locator('svg').first()).toBeVisible()
  })
  test('drag handle has proper ARIA attributes', async ({ page }) => {
    await waitForGrid(page)
    const item = page.locator('[data-ogrid-key="kpi"]')
    await item.hover()
    const handle = item.locator('[role="button"]').first()
    await expect(handle).toBeAttached()
    const desc = await handle.getAttribute('aria-roledescription')
    expect(desc).toBe('sortable')
  })
})
test.describe('resize', () => {
  test('resize handle visible on hover', async ({ page }) => {
    await waitForGrid(page)
    const item = page.locator('[data-ogrid-key="bar"]')
    await item.hover()
    await expect(item.locator('[role="separator"]')).toBeVisible()
  })
  test('resize changes width', async ({ page }) => {
    await waitForGrid(page)
    const item = page.locator('[data-ogrid-key="bar"]'),
      widthBefore = await item.evaluate(el => el.getBoundingClientRect().width)
    await item.hover()
    const handle = item.locator('[role="separator"]'),
      box = await handle.boundingBox()
    if (!box) return
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.down()
    await page.mouse.move(box.x + 80, box.y + box.height / 2, { steps: 5 })
    await page.mouse.up()
    await page.waitForTimeout(200)
    const widthAfter = await item.evaluate(el => el.getBoundingClientRect().width)
    expect(widthAfter).not.toBe(widthBefore)
  })
  test('resize snaps to snap value (8px)', async ({ page }) => {
    await waitForGrid(page)
    const item = page.locator('[data-ogrid-key="bar"]')
    await item.hover()
    const handle = item.locator('[role="separator"]'),
      box = await handle.boundingBox()
    if (!box) return
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.down()
    await page.mouse.move(box.x + 53, box.y + box.height / 2, { steps: 5 })
    await page.mouse.up()
    await page.waitForTimeout(200)
    const width = await item.evaluate(el => el.getBoundingClientRect().width)
    expect(width % 8).toBe(0)
  })
  test('keyboard ArrowRight increases width', async ({ page }) => {
    await waitForGrid(page)
    const item = page.locator('[data-ogrid-key="bar"]'),
      widthBefore = await item.evaluate(el => el.getBoundingClientRect().width)
    await item.hover()
    await item.locator('[role="separator"]').focus()
    await page.keyboard.press('ArrowRight')
    await page.waitForTimeout(200)
    const widthAfter = await item.evaluate(el => el.getBoundingClientRect().width)
    expect(widthAfter).toBeGreaterThan(widthBefore)
  })
  test('keyboard ArrowLeft decreases width', async ({ page }) => {
    await waitForGrid(page)
    const item = page.locator('[data-ogrid-key="bar"]'),
      widthBefore = await item.evaluate(el => el.getBoundingClientRect().width)
    await item.hover()
    await item.locator('[role="separator"]').focus()
    await page.keyboard.press('ArrowLeft')
    await page.waitForTimeout(200)
    const widthAfter = await item.evaluate(el => el.getBoundingClientRect().width)
    expect(widthAfter).toBeLessThan(widthBefore)
  })
  test('Shift+ArrowRight increases by 5x snap', async ({ page }) => {
    await waitForGrid(page)
    const item = page.locator('[data-ogrid-key="bar"]'),
      widthBefore = await item.evaluate(el => el.getBoundingClientRect().width)
    await item.hover()
    await item.locator('[role="separator"]').focus()
    await page.keyboard.press('Shift+ArrowRight')
    await page.waitForTimeout(200)
    const widthAfter = await item.evaluate(el => el.getBoundingClientRect().width)
    expect(widthAfter - widthBefore).toBeGreaterThanOrEqual(32)
  })
})
test.describe('panel', () => {
  test('panel shows ogrid header', async ({ page }) => {
    await waitForGrid(page)
    const text = await page.locator('body').textContent()
    expect(text).toContain('ogrid')
  })
  test('panel shows widget list', async ({ page }) => {
    await waitForGrid(page)
    const text = await page.locator('body').textContent()
    expect(text).toContain('widgets')
  })
  test('panel has copy and reset buttons', async ({ page }) => {
    await waitForGrid(page)
    await expect(page.getByRole('button', { name: 'copy' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'reset' })).toBeVisible()
  })
  test('panel has debug toggles', async ({ page }) => {
    await waitForGrid(page)
    const text = await page.locator('body').textContent()
    expect(text).toContain('borders')
    expect(text).toContain('backgrounds')
  })
  test('clicking widget in grid selects it', async ({ page }) => {
    await waitForGrid(page)
    await page.locator('[data-ogrid-key="bar"]').click()
    await page.waitForTimeout(200)
    const panelText = await page.locator('body').textContent()
    expect(panelText).toContain('bar')
  })
  test('debug borders toggle works', async ({ page }) => {
    await waitForGrid(page)
    const checkbox = page.getByText('borders').locator('..').locator('input[type="checkbox"]')
    await checkbox.check()
    const cls = await page.locator('.ogrid-item').first().getAttribute('class')
    expect(cls).toContain('border-foreground')
  })
  test('reset reverts resize', async ({ page }) => {
    await waitForGrid(page)
    const item = page.locator('[data-ogrid-key="bar"]'),
      widthBefore = await item.evaluate(el => el.getBoundingClientRect().width)
    await item.hover()
    const handle = item.locator('[role="separator"]'),
      box = await handle.boundingBox()
    if (!box) return
    await page.mouse.move(box.x, box.y + box.height / 2)
    await page.mouse.down()
    await page.mouse.move(box.x + 100, box.y + box.height / 2, { steps: 5 })
    await page.mouse.up()
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'reset' }).click()
    await page.waitForTimeout(300)
    const widthAfter = await item.evaluate(el => el.getBoundingClientRect().width)
    expect(widthAfter).toBe(widthBefore)
  })
})
test.describe('responsive', () => {
  test('items wrap on narrow viewport', async ({ page }) => {
    await page.setViewportSize({ height: 800, width: 500 })
    await waitForGrid(page)
    const first = await page.locator('.ogrid-item').first().boundingBox(),
      second = await page.locator('.ogrid-item').nth(1).boundingBox()
    if (!(first && second)) return
    expect(second.y).toBeGreaterThanOrEqual(first.y + first.height - 1)
  })
  test('wide items capped to container', async ({ page }) => {
    await page.setViewportSize({ height: 800, width: 400 })
    await waitForGrid(page)
    const containerWidth = await page.locator('.ogrid').evaluate(el => el.getBoundingClientRect().width),
      itemWidth = await page.locator('[data-ogrid-key="bar"]').evaluate(el => el.getBoundingClientRect().width)
    expect(itemWidth).toBeLessThanOrEqual(containerWidth)
  })
})
test.describe('overflow', () => {
  test('scroll widget has height and overflow-y', async ({ page }) => {
    await waitForGrid(page)
    const item = page.locator('[data-ogrid-key="scroll"]'),
      overflowY = await item.evaluate(el => getComputedStyle(el).overflowY)
    expect(overflowY).toBe('auto')
    const maxH = await item.evaluate(el => el.style.height)
    expect(maxH).toBe('350px')
  })
})
test.describe('accessibility', () => {
  test('drag handle has role=button', async ({ page }) => {
    await waitForGrid(page)
    await expect(page.locator('.ogrid-item [role="button"]').first()).toBeAttached()
  })
  test('resize handle has role=separator and aria-label', async ({ page }) => {
    await waitForGrid(page)
    const handle = page.locator('[role="separator"]').first()
    await expect(handle).toBeAttached()
    const label = await handle.getAttribute('aria-label')
    expect(label).toContain('Resize')
  })
  test('resize handle is keyboard focusable', async ({ page }) => {
    await waitForGrid(page)
    const item = page.locator('[data-ogrid-key="bar"]')
    await item.hover()
    const handle = item.locator('[role="separator"]')
    await handle.focus()
    const role = await page.evaluate(() => document.activeElement?.getAttribute('role'))
    expect(role).toBe('separator')
  })
})
test.describe('localStorage', () => {
  test('persists resize on reload', async ({ page }) => {
    await waitForGrid(page)
    const item = page.locator('[data-ogrid-key="bar"]')
    await item.hover()
    const handle = item.locator('[role="separator"]'),
      box = await handle.boundingBox()
    if (!box) return
    await page.mouse.move(box.x, box.y + box.height / 2)
    await page.mouse.down()
    await page.mouse.move(box.x + 80, box.y + box.height / 2, { steps: 5 })
    await page.mouse.up()
    await page.waitForTimeout(300)
    const widthAfterResize = await item.evaluate(el => el.getBoundingClientRect().width)
    await page.reload()
    await page.waitForSelector('.ogrid')
    await page.waitForTimeout(500)
    const widthAfterReload = await page.locator('[data-ogrid-key="bar"]').evaluate(el => el.getBoundingClientRect().width)
    expect(widthAfterReload).toBe(widthAfterResize)
  })
})
test.describe('all widgets render', () => {
  test('every widget is visible with content', async ({ page }) => {
    await waitForGrid(page)
    const keys = [
      'kpi',
      'stats',
      'sparkline',
      'bar',
      'line',
      'area',
      'pie',
      'radar',
      'radial',
      'table',
      'progress',
      'timeline',
      'badges',
      'avatars',
      'calendar',
      'datePicker',
      'tabs',
      'accordion',
      'form',
      'command',
      'toggles',
      'sliders',
      'checkboxes',
      'skeleton',
      'separator',
      'empty',
      'scroll',
      'prose'
    ]
    for (const key of keys) {
      const item = page.locator(`[data-ogrid-key="${key}"]`)
      await expect(item).toBeAttached()
      const height = await item.evaluate(el => el.getBoundingClientRect().height)
      expect(height).toBeGreaterThan(0)
    }
  })
})
test.describe('data table', () => {
  test('has filter, sort, pagination', async ({ page }) => {
    await waitForGrid(page)
    const table = page.locator('[data-ogrid-key="table"]')
    await expect(table.locator('input[placeholder="Filter..."]')).toBeVisible()
    await expect(table.getByRole('button', { name: 'Next' })).toBeVisible()
    const header = table.locator('th').first(),
      textBefore = await header.textContent()
    await header.click()
    const textAfter = await header.textContent()
    expect(textAfter).not.toBe(textBefore)
  })
  test('filter narrows results', async ({ page }) => {
    await waitForGrid(page)
    const table = page.locator('[data-ogrid-key="table"]')
    await table.locator('input[placeholder="Filter..."]').fill('Alice')
    await expect(table.locator('tbody tr')).toHaveCount(1)
  })
})
test.describe('visual', () => {
  test('full page screenshot', async ({ page }) => {
    await page.setViewportSize({ height: 1080, width: 1920 })
    await waitForGrid(page)
    await expect(page).toHaveScreenshot('full-page.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05
    })
  })
})
