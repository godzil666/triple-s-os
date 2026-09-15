import { test, expect, type Page } from '@playwright/test'
import { loginAs } from './helpers/auth'

const evidence = 'docs/verification/editorial'
test.setTimeout(120_000)
async function fits(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
}

for (const width of [360, 390, 768, 1024, 1440]) {
  test(`editorial navigation and workspaces at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 960 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Koneksi baik, mulai dari sini.' })).toBeVisible()
    await fits(page)
    await page.screenshot({ path: `${evidence}/home-${width}.png`, fullPage: true })
    await page.getByRole('button', { name: 'Panduan', exact: true }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('button', { name: 'Panduan', exact: true })).toBeFocused()
    await page.getByRole('link', { name: 'Temukan mitra Anda', exact: true }).click()
    await page.getByLabel('Cari mitra', { exact: true }).fill('Tidak-ada-mitra-ini')
    await expect(page.getByRole('heading', { name: 'Mitra belum ditemukan' })).toBeVisible()
    await fits(page)
    await page.getByRole('button', { name: 'Hapus pencarian & filter' }).click()
    await page.getByLabel('Cari mitra', { exact: true }).focus()
    await page.keyboard.press('Tab')
    await expect(page.getByLabel('Filter area')).toBeFocused()
    await page.getByLabel('Filter area').selectOption('Parungkuda')
    await expect(page.getByRole('link', { name: 'Pilih Mitra Parungkuda', exact: true })).toBeVisible()
    await page.getByRole('link', { name: 'Pilih Mitra Parungkuda', exact: true }).click()
    await expect(page).toHaveURL(/\/mitra\/demo-parungkuda\/paket$/)
    await fits(page)
    await page.screenshot({ path: `${evidence}/packages-${width}.png`, fullPage: true })
    await page.goto('/wifi/site-demo-parungkuda/login')
    await expect(page.getByText('VOUCHER ONLINE & OFFLINE', { exact: true })).toBeVisible()
    await page.getByLabel('Kode voucher').fill('KODE-TIDAK-ADA')
    await page.getByRole('button', { name: 'Masuk dengan voucher', exact: true }).click()
    await expect(page.getByRole('alert')).toContainText('Kode voucher tidak dikenali')
    await fits(page)
    await page.screenshot({ path: `${evidence}/wifi-${width}.png`, fullPage: true })
    await loginAs(page)
    for (const route of ['/owner', '/owner/paket', '/owner/akun', '/admin']) {
      await page.goto(route)
      await expect(page.locator('h1')).toBeVisible()
      await fits(page)
    }
    await page.goto('/owner')
    await page.screenshot({ path: `${evidence}/owner-${width}.png`, fullPage: true })
    await loginAs(page, 'mitra.cisaat')
    await page.goto('/mitra-dashboard')
    await expect(page.getByRole('heading', { name: 'Ringkasan mitra' })).toBeVisible()
    await fits(page)
    await page.screenshot({ path: `${evidence}/partner-${width}.png`, fullPage: true })
    await page.goto('/owner')
    await expect(page.getByRole('heading', { name: 'Akses tidak tersedia' })).toBeVisible()
    expect(errors).toEqual([])
  })
}

for (const width of [390, 1440]) {
  test(`supplied video backdrop is present across login surfaces at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    const video = page.locator('video[src="/media/login-background.mp4"]')
    await page.goto('/login?next=%2Fowner')
    await expect(video).toBeVisible()
    await page.goto('/wifi/site-demo-parungkuda/login')
    await expect(video).toBeVisible()
    await loginAs(page)
    await page.goto('/owner')
    await expect(video).toBeVisible()
    await page.getByRole('button', { name: 'Keluar' }).click().catch(() => undefined)
    await loginAs(page, 'mitra.cisaat')
    await page.goto('/mitra-dashboard')
    await expect(video).toBeVisible()
  })
}

test('local typography uses Roboto Variable on the login surface', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 })
  await page.goto('/login')
  const fonts = await page.evaluate(() => ({ body: getComputedStyle(document.body).fontFamily, heading: getComputedStyle(document.querySelector('h1')!).fontFamily }))
  expect(fonts.body).toContain('Roboto Variable')
  expect(fonts.heading).toContain('Roboto Variable')
})
