import { test, expect, type Page } from '@playwright/test'
import { loginAs } from './helpers/auth'

const evidence = process.env.EVIDENCE_DIR ?? 'docs/verification/editorial'
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
    const heroType = await page.locator('#welcome-title').evaluate(async heading => {
      await document.fonts.ready
      const accent = heading.querySelector('em')!
      const accentRect = accent.getBoundingClientRect()
      return { family: getComputedStyle(heading).fontFamily, italic: getComputedStyle(accent).fontStyle, accentRight: accentRect.right, accentLeft: accentRect.left, loaded: document.fonts.check('italic 54px "Bodoni Moda Variable"') }
    })
    expect(heroType.family).toContain('Bodoni Moda Variable')
    expect(heroType.italic).toBe('italic')
    expect(heroType.loaded).toBe(true)
    expect(heroType.accentLeft).toBeGreaterThanOrEqual(0)
    expect(heroType.accentRight).toBeLessThanOrEqual(width + 1)
    await expect(page.getByRole('link', { name: 'Hubungi admin SSS melalui WhatsApp' })).toHaveAttribute('href', /wa\.me/)
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

test('local typography pairs Inter body with Bricolage headings across customer and staff pages', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 })
  for (const route of ['/', '/login', '/wifi']) {
    await page.goto(route)
    await expect(page.locator('h1')).toBeVisible()
    const fonts = await page.evaluate(async () => {
      await document.fonts.ready
      const body = getComputedStyle(document.body).fontFamily
      const heading = getComputedStyle(document.querySelector('h1')!).fontFamily
      const wordmark = getComputedStyle(document.querySelector('.brand-wordmark')!).fontFamily
      const control = getComputedStyle(document.querySelector('button')!).fontFamily
      return { body, heading, wordmark, control, bodyLoaded: document.fonts.check('16px "Inter Variable"'), headingLoaded: document.fonts.check(`32px ${heading}`) }
    })
    expect(fonts.body).toContain('Inter Variable')
    expect(fonts.heading).toContain(route === '/' ? 'Bodoni Moda Variable' : 'Bricolage Grotesque Variable')
    expect(fonts.wordmark).toContain('Bodoni Moda Variable')
    expect(fonts.control).toContain('Inter Variable')
    expect(fonts.bodyLoaded).toBe(true)
    expect(fonts.headingLoaded).toBe(true)
  }
})

test('one dashboard entry, dark login navigation and attached footer', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 })
  await page.goto('/')
  const footer = page.locator('.site-footer')
  await expect(footer.getByRole('link', { name: 'Dashboard' })).toHaveCount(1)
  await expect(footer.getByRole('link', { name: /Portal mitra|Portal owner/ })).toHaveCount(0)
  await footer.getByRole('link', { name: 'Dashboard' }).click()
  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByRole('heading', { name: 'Login staf', exact: true })).toBeVisible()
  for (const route of ['/login', '/wifi']) {
    await page.goto(route)
    await expect(page.locator('.customer-shell--immersive .customer-header nav')).toBeVisible()
    await expect(page.locator('.site-footer')).toBeVisible()
    const colors = await page.evaluate(() => ({ shell: getComputedStyle(document.querySelector('.customer-shell')!).backgroundColor, header: getComputedStyle(document.querySelector('.customer-header')!).backgroundColor, nav: getComputedStyle(document.querySelector('.customer-header nav')!).backgroundColor, gap: document.querySelector('.site-footer')!.getBoundingClientRect().top - document.querySelector('main')!.getBoundingClientRect().bottom }))
    expect(colors.shell).toBe('rgb(12, 27, 34)')
    expect(colors.header).toBe(colors.shell)
    expect(colors.nav).not.toBe('rgb(255, 255, 255)')
    expect(Math.abs(colors.gap)).toBeLessThan(2)
    await page.screenshot({ path: `${evidence}/${route === '/login' ? 'staff-login' : 'wifi-login'}-390.png`, fullPage: true })
  }
})

test('admin overview links to assigned operations without owner controls', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 })
  await loginAs(page, 'admin')
  await page.goto('/admin')
  await expect(page.getByRole('heading', { name: 'Ringkasan tugas saya' })).toBeVisible()
  await expect(page.locator('.admin-overview-sites > div')).toHaveCount(1)
  await expect(page.getByRole('link', { name: 'Paket internet' })).toHaveCount(0)
  await page.screenshot({ path: `${evidence}/admin-overview-1440.png`, fullPage: true })
  await page.getByRole('link', { name: /Alert terbuka/ }).click()
  await expect(page).toHaveURL(/\/admin\/operasi#alerts$/)
  await expect(page.getByRole('heading', { name: 'Operasi hotspot tugas saya' })).toBeVisible()
  await expect(page.locator('#health ~ .operations-grid .card')).toHaveCount(1)
  await page.goto('/owner/paket')
  await expect(page.getByRole('heading', { name: 'Akses tidak tersedia' })).toBeVisible()
})
