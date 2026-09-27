import { expect, test } from '@playwright/test'

for (const width of [360, 390, 768, 1024, 1440]) {
  test(`Signal Run footer and arena fit at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    const launcher = page.locator('.site-footer').getByRole('button', { name: 'Signal Run' })
    await expect(launcher).toBeVisible()
    await launcher.click()
    const dialog = page.getByRole('dialog', { name: 'Signal Run.' })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Tutup Signal Run' })).toBeFocused()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.screenshot({ path: testInfo.outputPath(`open-${width}.png`) })
    const canvas = dialog.getByRole('button', { name: /Arena Signal Run/ })
    const bounds = await canvas.boundingBox()
    expect(bounds).not.toBeNull()
    expect(bounds!.x).toBeGreaterThanOrEqual(0)
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width + 1)
    await dialog.getByRole('button', { name: 'Mulai bermain' }).click()
    await expect(dialog.getByRole('button', { name: 'Lompat', exact: true })).toBeEnabled()
    await page.keyboard.press('Space')
    await canvas.dispatchEvent('pointerdown', { pointerType: 'touch' })
    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
    await expect(launcher).toBeFocused()
    await launcher.click()
    await expect(page.getByRole('dialog', { name: 'Signal Run.' }).getByRole('button', { name: 'Mulai bermain' })).toBeVisible()
  })
}

test('Signal Run scores, game over, replay, local best and no application API calls', async ({ page }, testInfo) => {
  test.setTimeout(90_000)
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  const apiCalls: string[] = []
  page.on('request', request => {
    const path = new URL(request.url()).pathname
    // The existing app polls its demo state independently every 10 seconds.
    if (path.startsWith('/api/') && path !== '/api/state' && path !== '/api/auth/me') apiCalls.push(request.url())
  })
  await page.locator('.site-footer').getByRole('button', { name: 'Signal Run' }).click()
  let dialog = page.getByRole('dialog', { name: 'Signal Run.' })
  await dialog.getByRole('button', { name: 'Mulai bermain' }).click()
  await expect(dialog.getByText('KONEKSI TERPUTUS')).toBeVisible({ timeout: 10_000 })
  await page.screenshot({ path: testInfo.outputPath('game-over-desktop.png') })
  const score = Number(await dialog.getByTestId('signal-score').textContent())
  expect(score).toBeGreaterThan(0)
  expect(await page.evaluate(() => localStorage.getItem('triple-s.signal-run.best-score'))).toBe(String(score))
  await dialog.getByRole('button', { name: 'Main lagi' }).click()
  await expect(dialog.getByTestId('signal-score')).toHaveText('00000')
  await dialog.getByRole('button', { name: 'Tutup Signal Run' }).click()
  await expect(dialog).toHaveCount(0)
  expect(apiCalls).toEqual([])
  await page.reload()
  await page.locator('.site-footer').getByRole('button', { name: 'Signal Run' }).click()
  dialog = page.getByRole('dialog', { name: 'Signal Run.' })
  await expect(dialog.getByTestId('signal-best')).toHaveText(String(score).padStart(5, '0'))
})

test('Signal Run handles malformed local high score and respects reduced motion', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('triple-s.signal-run.best-score', 'not-a-score'))
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.locator('.site-footer').getByRole('button', { name: 'Signal Run' }).click()
  const dialog = page.getByRole('dialog', { name: 'Signal Run.' })
  await expect(dialog.getByTestId('signal-best')).toHaveText('00000')
  await expect(dialog.getByRole('button', { name: 'Mulai bermain' })).toBeVisible()
})
