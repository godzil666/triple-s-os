import { expect, test } from '@playwright/test'

for (const width of [360, 390, 768, 1024, 1440]) {
  test(`Signal Run is playable inside the footer at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    const footer = page.locator('.site-footer')
    const game = footer.getByRole('region', { name: 'Signal Run' })
    await expect(game).toBeVisible()
    await expect(footer.getByRole('button', { name: 'Signal Run', exact: true })).toHaveCount(0)
    await expect(page.getByRole('dialog', { name: /Signal Run/ })).toHaveCount(0)
    await game.scrollIntoViewIfNeeded()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    const canvas = game.getByRole('button', { name: /Arena Signal Run/ })
    const bounds = await canvas.boundingBox()
    expect(bounds).not.toBeNull()
    expect(bounds!.x).toBeGreaterThanOrEqual(0)
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width + 1)
    await page.screenshot({ path: testInfo.outputPath(`footer-${width}.png`) })

    await game.getByRole('button', { name: 'Mulai bermain' }).click()
    await expect(canvas).toBeFocused()
    await expect(game.getByRole('button', { name: 'Lompat', exact: true })).toBeEnabled()
    await page.keyboard.press('Space')
    await canvas.dispatchEvent('pointerdown', { pointerType: 'touch' })
    await expect(footer.getByRole('link', { name: 'Dashboard' })).toBeVisible()
  })
}

test('Signal Run appears only on the home page and captive portal login routes', async ({ page }) => {
  for (const path of ['/', '/wifi', '/wifi/demo-cisaat/login', '/wifi/hotspot/example/login']) {
    await page.goto(path)
    await expect(page.locator('.site-footer').getByRole('region', { name: 'Signal Run' })).toBeVisible()
  }

  for (const path of ['/login', '/mitra/demo-cisaat/paket']) {
    await page.goto(path)
    await expect(page.locator('.site-footer').getByRole('region', { name: 'Signal Run' })).toHaveCount(0)
  }
})

test('Signal Run scores, game over, replay, local best and no application API calls', async ({ page }) => {
  test.setTimeout(90_000)
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  const apiCalls: string[] = []
  page.on('request', request => {
    const path = new URL(request.url()).pathname
    // The existing app polls its demo state independently every 10 seconds.
    if (path.startsWith('/api/') && path !== '/api/state' && path !== '/api/auth/me') apiCalls.push(request.url())
  })
  const game = page.locator('.site-footer').getByRole('region', { name: 'Signal Run' })
  await game.scrollIntoViewIfNeeded()
  await game.getByRole('button', { name: 'Mulai bermain' }).click()
  await expect(game.getByText('KONEKSI TERPUTUS')).toBeVisible({ timeout: 10_000 })
  const score = Number(await game.getByTestId('signal-score').textContent())
  expect(score).toBeGreaterThan(0)
  expect(await page.evaluate(() => localStorage.getItem('triple-s.signal-run.best-score'))).toBe(String(score))
  await game.getByRole('button', { name: 'Main lagi' }).click()
  await expect(game.getByTestId('signal-score')).toHaveText('00000')
  expect(apiCalls).toEqual([])
  await page.reload()
  const restored = page.locator('.site-footer').getByRole('region', { name: 'Signal Run' })
  await expect(restored.getByTestId('signal-best')).toHaveText(String(score).padStart(5, '0'))
})

test('Signal Run pauses when scrolled away, handles malformed score and respects reduced motion', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('triple-s.signal-run.best-score', 'not-a-score'))
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const game = page.locator('.site-footer').getByRole('region', { name: 'Signal Run' })
  await expect(game.getByTestId('signal-best')).toHaveText('00000')
  await game.scrollIntoViewIfNeeded()
  await game.getByRole('button', { name: 'Mulai bermain' }).click()
  await page.evaluate(() => window.scrollTo(0, 0))
  await expect(game.getByText('JEDA', { exact: true })).toBeVisible()
  await game.scrollIntoViewIfNeeded()
  await game.getByRole('button', { name: 'Lanjutkan' }).click()
  await expect(game.getByRole('button', { name: 'Lompat', exact: true })).toBeEnabled()
})
