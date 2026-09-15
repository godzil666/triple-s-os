import { test, expect } from '@playwright/test'
import { loginAs } from './helpers/auth'

test('hero uses local video, plays silently, pauses and resumes', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/')
  const video = page.locator('video')
  await expect(video).toHaveAttribute('src', '/media/hero-sss-desktop.mp4')
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.currentTime), { timeout: 15000 }).toBeGreaterThan(0)
  expect(await video.evaluate((element: HTMLVideoElement) => element.muted && element.loop && element.playsInline)).toBe(true)
  await page.getByRole('button', { name: 'Jeda video hero' }).click()
  expect(await video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true)
  await expect(page.getByRole('button', { name: 'Putar video hero' })).toBeVisible()
  await page.getByRole('button', { name: 'Putar video hero' }).click()
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(false)
  await page.locator('#pilih-mitra').evaluate(element => element.scrollIntoView({ block: 'start' }))
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true)
  await page.evaluate(() => window.scrollTo(0, 0))
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(false)
})

test('mobile uses lightweight source and SVG logo is present in header and footer', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await page.goto('/')
  await expect(page.locator('video')).toHaveAttribute('src', '/media/hero-sss-mobile.mp4')
  const logos = page.locator('img[src="/brand/triple-s-logo.svg"]')
  await expect(logos).toHaveCount(2)
  for (const logo of await logos.all()) expect(await logo.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth === 1199 && getComputedStyle(element).objectFit === 'contain')).toBe(true)
  await expect(page.getByRole('heading', { name: 'Hubungi kami Placeholder' })).toBeVisible()
  await expect(page.getByText('Nomor layanan belum diisi', { exact: true })).toBeVisible()
  await expect(page.locator('a[href^="tel:"], a[href^="mailto:"], a[href*="wa.me"]')).toHaveCount(0)
})

test('reduced motion keeps the poster and does not request video', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const videos: string[] = []
  page.on('request', request => { if (request.url().endsWith('.mp4')) videos.push(request.url()) })
  await page.goto('/')
  await expect(page.locator('.hero-poster')).toBeVisible()
  await expect(page.locator('video')).not.toHaveAttribute('src')
  await expect(page.getByText('Tampilan statis · preferensi perangkat')).toBeVisible()
  expect(videos).toEqual([])
  await page.screenshot({ path: 'docs/verification/glass/reduced-motion.png' })
})

test('failed media keeps readable hero and partner CTA', async ({ page }) => {
  await page.route('**/*.mp4', route => route.abort())
  await page.goto('/')
  await expect(page.getByText('Video tidak tersedia · gambar ditampilkan')).toBeVisible({ timeout: 15000 })
  await expect(page.getByRole('heading', { name: /Koneksi baik/ })).toBeVisible()
  await expect(page.locator('.hero-poster')).toBeVisible()
  await page.getByRole('link', { name: 'Temukan mitra Anda', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Mau terhubung di mana?' })).toBeInViewport()
})

test('glass styles have an opaque reduced-transparency fallback', async ({ page }) => {
  await loginAs(page, 'admin')
  const session = await page.context().newCDPSession(page)
  await session.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-transparency', value: 'reduce' }] })
  await page.goto('/admin')
  expect(await page.locator('.placeholder-card').evaluate(element => getComputedStyle(element).backdropFilter)).toBe('none')
  expect(await page.locator('.placeholder-card').evaluate(element => getComputedStyle(element).backgroundColor)).toBe('rgb(248, 252, 255)')
  await expect(page.getByRole('heading', { name: 'Ringkasan operasional', exact: true })).toBeVisible()
})
