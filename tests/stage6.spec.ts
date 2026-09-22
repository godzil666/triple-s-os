import {test,expect} from '@playwright/test'
import {loginAs,resetDemo} from './helpers/auth'
test.setTimeout(90_000)
for (const width of [390,1024]) test(`stage 6 smoke ${width}px customer, partner, owner`, async ({page}) => {
  await page.setViewportSize({width,height:900}); const errors:string[]=[]; page.on('pageerror',e=>errors.push(e.message))
  await page.goto('/'); await expect(page.getByRole('heading',{name:'Mau terhubung di mana?'})).toBeVisible(); await page.getByLabel('Cari mitra').focus(); await page.keyboard.press('Tab'); await expect(page.getByLabel('Filter area')).toBeFocused()
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
  await loginAs(page,'mitra.cisaat'); await page.goto('/mitra-dashboard'); await expect(page.getByRole('heading',{name:'Ringkasan mitra'})).toBeVisible(); expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
  await page.goto('/owner'); await expect(page.getByRole('heading',{name:'Akses tidak tersedia'})).toBeVisible()
  await loginAs(page); await resetDemo(page); await page.goto('/owner'); await expect(page.getByRole('heading',{name:'Ringkasan owner'})).toBeVisible(); expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true); expect(errors).toEqual([])
})
