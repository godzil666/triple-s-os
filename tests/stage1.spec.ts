import { test, expect } from '@playwright/test'
import {loginAs,testOrigin} from './helpers/auth'

const captureDirectory = process.env.EVIDENCE_DIR ?? 'docs/verification/auth-hotspot'

const routes = [
  '/', '/mitra/demo-cisaat/paket', '/checkout', '/pesanan/demo-token', '/voucher/demo-token',
  '/mitra-dashboard', '/mitra-dashboard/stok', '/mitra-dashboard/penjualan', '/mitra-dashboard/penjualan/demo-order', '/mitra-dashboard/bagi-hasil', '/mitra-dashboard/pengguna',
  '/admin', '/admin/operasi', '/alamat-tidak-ada',
  '/owner', '/owner/akun', '/owner/stok', '/owner/operasi', '/wifi', '/wifi/site-demo-cisaat/login', '/wifi/hotspot/hotspot-site-demo-cisaat-2/login',
]

for (const width of [360, 768, 1440]) {
  test(`all routes render without page overflow at ${width}px`, async ({ page }) => {
    test.setTimeout(150_000) // Full route sweep plus media and dashboard captures per viewport.
    await loginAs(page)
    await page.setViewportSize({ width, height: 960 })
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    for (const route of routes) {
      await page.goto(route)
      await expect(page.locator('h1')).toBeVisible()
      await expect(page.locator('.demo-banner').getByText('— transaksi dan koneksi disimulasikan', { exact: false })).toBeVisible()
      await page.evaluate(() => document.fonts.ready)
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `overflow on ${route} at ${width}`).toBe(true)
      if (['/', '/mitra-dashboard', '/admin','/owner'].includes(route)) await page.screenshot({ path: `${captureDirectory}/${route === '/' ? 'customer' : route.slice(1)}-${width}.png`, fullPage: true })
    }
    expect(errors).toEqual([])
  })
}

test('manual partner search, area filter, empty recovery and selection', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('link', { name: /^Pilih Mitra / })).toHaveCount(6)
  await page.getByLabel('Cari mitra', { exact: true }).fill('SSS-DEMO-CISAAT')
  await expect(page.getByRole('link', { name: /^Pilih Mitra / })).toHaveCount(1)
  await page.getByLabel('Filter area').selectOption('Cibadak')
  await expect(page.getByRole('heading', { name: 'Mitra belum ditemukan' })).toBeVisible()
  await page.getByRole('button', { name: 'Hapus pencarian & filter' }).click()
  await expect(page.getByRole('link', { name: /^Pilih Mitra / })).toHaveCount(6)
  await page.getByLabel('Filter area').selectOption('Cisaat')
  await page.getByRole('link', { name: 'Pilih Mitra Cisaat', exact: true }).click()
  await expect(page).toHaveURL(/\/mitra\/demo-cisaat\/paket$/)
  await expect(page.getByRole('heading', { name: 'Pilihan paket · Mitra Cisaat', exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Pilih Reguler · 3 jam', exact: true })).toBeVisible()
  await expect(page.locator('input')).toHaveCount(0)
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Pilihan paket · Mitra Cisaat' })).toBeVisible()
})

test('keyboard skip link, visible focus, native dialog trap and Escape restoration', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /Koneksi baik/ })).toBeVisible()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Lewati ke konten utama' })).toBeFocused()
  expect(await page.locator(':focus').evaluate(element => getComputedStyle(element).outlineStyle)).toBe('solid')
  await page.screenshot({ path: `${captureDirectory}/keyboard-focus.png` })
  await page.keyboard.press('Enter')
  await expect(page.locator('#main-content')).toBeFocused()
  await page.getByRole('button', { name: 'Panduan', exact: true }).focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Tutup dialog' })).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(page.getByRole('button', { name: 'Saya mengerti' })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Tutup dialog' })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await expect(page.getByRole('button', { name: 'Panduan', exact: true })).toBeFocused()
  await page.getByRole('link', { name: 'Login staf', exact: true }).focus()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/login$/)
  await expect(page.locator('#main-content')).toBeFocused()
})

test('mobile menu, role navigation and partner context', async ({ page }) => {
  await loginAs(page)
  await page.setViewportSize({ width: 360, height: 800 })
  await page.goto('/mitra-dashboard')
  await expect(page.getByRole('navigation', { name: 'Navigasi mitra' })).not.toBeVisible()
  await page.getByRole('button', { name: 'Buka menu navigasi' }).click()
  await page.getByRole('link', { name: 'Stok voucher', exact: true }).click()
  await expect(page).toHaveURL(/\/mitra-dashboard\/stok$/)
  await expect(page.getByRole('navigation', { name: 'Navigasi mitra' })).not.toBeVisible()
  await page.getByLabel('Mitra demo', { exact: true }).selectOption('demo-cibadak')
  await expect(page.locator('.partner-context strong')).toHaveText('Mitra Cibadak')
  await page.goto('/admin')
  await expect(page.getByRole('heading', { name: 'Ringkasan tugas saya', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Buka menu navigasi' }).click()
  await page.getByRole('link', { name: 'Pusat operasi', exact: true }).click()
  await expect(page).toHaveURL(/\/admin\/operasi$/)
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /Koneksi baik/ })).toBeVisible()
})

test('customer and dashboard have no unlabeled fields or external requests', async ({ page }) => {
  await loginAs(page)
  const external: string[] = []
  page.on('request', request => { if (!request.url().startsWith(testOrigin) && !request.url().startsWith('data:')) external.push(request.url()) })
  for (const route of ['/', '/mitra-dashboard', '/admin']) {
    await page.goto(route)
    await page.evaluate(() => document.fonts.ready)
    const unlabeled = await page.locator('input, select').evaluateAll(elements => elements.filter(element => !(element as HTMLInputElement).labels?.length && !element.getAttribute('aria-label')).length)
    expect(unlabeled).toBe(0)
  }
  expect(external).toEqual([])
})
