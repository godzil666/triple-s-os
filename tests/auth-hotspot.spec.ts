import { test, expect } from '@playwright/test'
import { credentials, loginAs, resetDemo, testOrigin } from './helpers/auth'
const evidence=process.env.EVIDENCE_DIR??'docs/verification/auth-hotspot'
test.setTimeout(90_000)

test('customer direct dashboard URLs require login; dev files and private API are not public',async({page})=>{
  for(const route of ['/owner','/owner/akun','/admin','/mitra-dashboard/stok']) {
    await page.goto(route);await expect(page).toHaveURL(/\/login\?next=/);await expect(page.getByRole('heading',{name:'Login staf',exact:true})).toBeVisible()
  }
  const state=await (await page.request.get('/api/state')).json()
  expect(state.vouchers).toEqual([]);expect(state.orders).toEqual([]);expect(state.offlineBatches).toEqual([])
  expect((await page.request.get('/api/accounts')).status()).toBe(401)
  for(const path of ['/.local/server/INITIAL_ACCOUNTS.md','/.local/server/accounts.json','/server/accounts.ts','/src/domain/fixtures.ts','/src/services/mock.ts']) expect((await page.request.get(path)).status()).toBe(403)
  await expect(page.getByRole('button',{name:'Kontrol demo',exact:true})).toHaveCount(0)
})

test('staff login form, protected owner view and logout work by keyboard',async({page})=>{
  await page.goto('/login'); const account=credentials()
  await page.getByLabel('Username',{exact:true}).fill(account.username);await page.getByLabel('Password',{exact:true}).fill(account.password)
  await page.getByRole('button',{name:'Masuk ke dashboard'}).focus();await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/owner$/);await expect(page.getByRole('heading',{name:'Ringkasan owner',exact:true})).toBeVisible()
  await page.getByRole('button',{name:'Keluar',exact:true}).click();await expect(page).toHaveURL(/\/login$/)
  await page.goto('/owner/akun');await expect(page).toHaveURL(/\/login\?next=/)
})

test('failed logout keeps the staff session visible until the server confirms revocation',async({page})=>{
  await loginAs(page);await page.goto('/owner')
  await page.route('**/api/auth/logout',route=>route.abort())
  await page.getByRole('button',{name:'Keluar',exact:true}).click()
  await expect(page.getByRole('alert')).toContainText('Logout belum berhasil')
  await expect(page.getByRole('link',{name:'Dashboard saya'})).toBeVisible()
  await page.unroute('**/api/auth/logout')
  await page.getByRole('button',{name:'Keluar',exact:true}).click();await expect(page).toHaveURL(/\/login$/)
})

test('partner cannot switch site or open owner; admin cannot manage owner accounts',async({page})=>{
  await loginAs(page,'mitra.cisaat');await page.goto('/mitra-dashboard/stok')
  await expect(page.getByRole('heading',{name:'Stok voucher offline'})).toBeVisible()
  await expect(page.getByLabel('Filter mitra stok')).toHaveCount(0)
  await expect(page.getByRole('button',{name:'Kontrol demo'})).toHaveCount(0)
  const state=await(await page.request.get('/api/state')).json();expect(state.vouchers.every((v:{partnerId:string})=>v.partnerId==='demo-cisaat')).toBe(true)
  await page.goto('/owner/akun');await expect(page.getByRole('heading',{name:'Akses tidak tersedia'})).toBeVisible()
  await loginAs(page,'admin');await page.goto('/admin');await expect(page.getByRole('heading',{name:'Operasi hotspot tugas saya'})).toBeVisible()
  await page.goto('/owner/akun');await expect(page.getByRole('heading',{name:'Akses tidak tersedia'})).toBeVisible()
  expect((await page.request.get('/api/accounts')).status()).toBe(403)
})

test('customer offline voucher flow survives refresh and wrong-site failure without exposing staff controls',async({page,browser})=>{
  await loginAs(page);await resetDemo(page)
  const state=await(await page.request.get('/api/state')).json()
  const voucher=state.vouchers.find((v:{batchId:string;partnerId:string})=>v.batchId&&v.partnerId==='demo-cisaat')
  const context=await browser.newContext({baseURL:testOrigin,viewport:{width:1440,height:960}});const customer=await context.newPage()
  try {
    await customer.goto('/wifi/site-demo-cibadak/login');await customer.getByLabel('Kode voucher',{exact:true}).fill(voucher.code);await customer.getByRole('button',{name:'Masuk dengan voucher'}).click()
    await expect(customer.getByRole('alert')).toContainText('mitra lain')
    await customer.goto('/wifi/site-demo-cisaat/login');await expect(customer.getByRole('heading',{name:'Hotspot Mitra Cisaat'})).toBeVisible()
    await customer.getByLabel('Kode voucher',{exact:true}).fill(voucher.code);await customer.getByRole('button',{name:'Masuk dengan voucher'}).click()
    await expect(customer.getByRole('status')).toContainText('Sesi simulasi aktif')
    const expiry=await customer.locator('.hotspot-status dd').nth(1).textContent()
    await customer.reload();await expect(customer.getByRole('status')).toContainText('Sesi simulasi aktif');await expect(customer.locator('.hotspot-status dd').nth(1)).toHaveText(expiry!)
    expect((await customer.request.get('/api/accounts')).status()).toBe(401)
    await expect(customer.getByRole('button',{name:'Kontrol demo'})).toHaveCount(0)
    await customer.screenshot({path:`${evidence}/portal-active-1440.png`,fullPage:true})
    await customer.getByRole('button',{name:'Keluar dari sesi WiFi'}).click();await expect(customer.getByLabel('Kode voucher')).toBeVisible()
  } finally {await context.close()}
})

test('offline username/password voucher accepts matching credentials and activates on its first login',async({page})=>{
  await page.goto('/wifi/site-demo-cisaat/login');await page.getByLabel('Cara masuk').selectOption('username_password')
  await page.getByLabel('Username member').fill('wrong-user');await page.getByLabel('Password member').fill('offline-demo-pass');await page.getByRole('button',{name:'Masuk dengan voucher'}).click();await expect(page.getByRole('alert')).toContainText('tidak dikenali')
  await page.getByLabel('Username member').fill('offline-demo-user');await page.getByLabel('Password member').fill('offline-demo-pass');await page.getByRole('button',{name:'Masuk dengan voucher'}).click();await expect(page.getByRole('status')).toContainText('Sesi simulasi aktif');await expect(page.locator('.hotspot-status dd').nth(0)).not.toHaveText('Belum dimulai')
})

test('owner creates a scoped partner account and disabling it revokes the active browser session',async({page,browser})=>{
  await loginAs(page);await page.goto('/owner/akun')
  const username=`review.${Date.now()}`;const password='Local-test-password-2468'
  await page.getByLabel('Username baru').fill(username);await page.getByLabel('Password awal').fill(password)
  await page.getByLabel('Mitra pemilik akun').selectOption('demo-cibadak');await page.getByRole('button',{name:'Buat akun staf'}).click()
  await expect(page.getByRole('status')).toContainText('Perubahan akun disimpan')
  const context=await browser.newContext({baseURL:testOrigin});const partner=await context.newPage()
  try {
    await partner.goto('/login');await partner.getByLabel('Username',{exact:true}).fill(username);await partner.getByLabel('Password',{exact:true}).fill(password);await partner.getByRole('button',{name:'Masuk ke dashboard'}).click()
    await expect(partner).toHaveURL(/\/mitra-dashboard$/)
    const state=await(await partner.request.get('/api/state')).json();expect(state.vouchers.length).toBeGreaterThan(0);expect(state.vouchers.every((v:{partnerId:string})=>v.partnerId==='demo-cibadak')).toBe(true)
    await page.getByRole('button',{name:`Nonaktifkan ${username}`,exact:true}).click();await expect(page.getByRole('button',{name:`Aktifkan ${username}`,exact:true})).toBeVisible()
    await partner.reload();await expect(partner).toHaveURL(/\/login\?next=/)
  } finally {await context.close()}
})

for(const width of [360,768,1440]) test(`login and voucher portal fit ${width}px with keyboard and readable error`,async({page})=>{
  await page.setViewportSize({width,height:960})
  for(const [path,name] of [['/login','login'],['/wifi','choose-site'],['/wifi/site-demo-cisaat/login','portal']]) {
    await page.goto(path);await expect(page.locator('h1')).toBeVisible();await page.evaluate(()=>document.fonts.ready)
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
    await page.screenshot({path:`${evidence}/${name}-${width}.png`,fullPage:true})
  }
  await page.getByLabel('Kode voucher').fill('SALAH-KODE');await page.getByRole('button',{name:'Masuk dengan voucher'}).focus();await page.keyboard.press('Enter');await expect(page.getByRole('alert')).toContainText('tidak dikenali')
  await page.goto('/login');await expect(page.getByRole('heading',{name:'Login staf',exact:true})).toBeVisible();await page.keyboard.press('Tab');await expect(page.getByRole('link',{name:'Lewati ke konten utama'})).toBeFocused()
})
