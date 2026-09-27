import { expect, test } from '@playwright/test'

for (const width of [360, 390, 768, 1024, 1440]) {
  test(`hero decoder keeps its headline readable at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    const heading = page.getByRole('heading', { name: 'Koneksi baik, mulai dari sini.' })
    await expect(heading).toBeVisible()
    const cipher = heading.locator('.hero-decoder-cipher')
    const styles = await cipher.evaluate(element => ({
      animation: getComputedStyle(element, '::after').animationName,
      text: getComputedStyle(element, '::after').content,
      realWidth: element.previousElementSibling!.getBoundingClientRect().width,
      lineWidth: element.parentElement!.getBoundingClientRect().width,
    }))
    expect(styles.animation).toBe('hero-decoder-glyphs')
    expect(styles.text).not.toBe('none')
    expect(styles.realWidth).toBeGreaterThan(0)
    expect(styles.lineWidth).toBeGreaterThanOrEqual(styles.realWidth)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.screenshot({ path: testInfo.outputPath(`hero-decoder-${width}.png`) })
  })
}

test('reduced motion leaves the original serif headline visible without a cipher', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const line = page.locator('.hero-decoder-line')
  await expect(page.getByRole('heading', { name: 'Koneksi baik, mulai dari sini.' })).toBeVisible()
  const state = await line.evaluate(element => ({
    realOpacity: getComputedStyle(element.querySelector('.hero-decoder-real')!).opacity,
    cipherDisplay: getComputedStyle(element.querySelector('.hero-decoder-cipher')!).display,
    accentStyle: getComputedStyle(element.querySelector('em')!).fontStyle,
  }))
  expect(state).toEqual({ realOpacity: '1', cipherDisplay: 'none', accentStyle: 'italic' })
})

test('the decoded phase restores the original serif line', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 900 })
  await page.goto('/')
  const line = page.locator('.hero-decoder-line')
  await expect.poll(() => line.locator('.hero-decoder-real').evaluate(element => getComputedStyle(element).opacity), { timeout: 7000 }).toBe('1')
  await expect(line).toContainText('mulai dari sini.')
  await page.screenshot({ path: testInfo.outputPath('hero-decoded-390.png') })
})
