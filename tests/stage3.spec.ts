import { test, expect, type Page } from '@playwright/test'
import { loginAs, ownerController, testOrigin } from './helpers/auth'
const evidence=process.env.EVIDENCE_DIR??'docs/verification/stage3'
test.setTimeout(90_000)
async function buy(page:Page, monthly=false) {
  await page.goto('/mitra/demo-cisaat/paket')
  await page.getByRole('link',{name:monthly?'Pilih Bulanan · 2 perangkat':'Pilih Reguler · 3 jam',exact:true}).click()
  await page.getByLabel('Nama customer').fill('Pelanggan Demo')
  await page.getByLabel('Nomor WhatsApp').fill('0812-3456-7890')
  await page.getByRole('button',{name:'Review pesanan'}).click()
  await expect(page.getByText('+6281234567890',{exact:true})).toBeVisible()
  await page.getByRole('button',{name:'Buat pesanan simulasi'}).click()
  await expect(page).toHaveURL(/\/pesanan\/[a-f0-9]{64}$/)
  const token=page.url().split('/').at(-1)!,detail=await(await page.request.get(`/api/customer/orders/${token}`)).json()
  await expect(page.getByRole('button',{name:/Simulasikan pembayaran sukses|Jalankan hasil pembayaran/})).toHaveCount(0)
  return {token,orderId:detail.order.id}
}
async function complete(owner:Awaited<ReturnType<typeof ownerController>>,orderId:string,provisioning='issued',notification='sent'){
  await owner.call('payments','settle',[orderId,'paid']);await owner.call('vouchers','issue',[orderId,provisioning]);if(provisioning==='issued')await owner.call('notifications','send',[orderId,notification])
}
test('customer buys before arrival, survives refresh, activates later with voucher code, and keeps expiry',async({page,browser})=>{
  const owner=await ownerController(browser);await owner.call('demo','reset',[true]);await page.context().grantPermissions(['clipboard-read','clipboard-write']);await page.bringToFront();const {token,orderId}=await buy(page);const url=page.url()
  await expect(page.getByTestId('payment-status')).toHaveText('Menunggu pembayaran')
  await complete(owner,orderId);await page.getByRole('button',{name:'Perbarui status'}).click()
  await expect(page.getByText('Voucher siap digunakan',{exact:true})).toBeVisible()
  await expect(page.getByText('Belum aktif — durasi belum dimulai',{exact:true})).toBeVisible()
  await page.getByRole('button',{name:'Salin kredensial voucher',exact:true}).click();await expect(page.getByText(/^Disalin\./)).toBeVisible()
  await page.reload();await expect(page).toHaveURL(url)
  const code=(await page.getByTestId('voucher-code').textContent())!
  await page.goto('/wifi/hotspot/hotspot-site-demo-cisaat-2/login')
  await page.getByLabel('Kode voucher').fill(code)
  await page.getByRole('button',{name:'Masuk dengan voucher'}).click();await expect(page.getByRole('alert')).toContainText('hotspot lain')
  await page.goto('/wifi/hotspot/hotspot-site-demo-cisaat/login')
  await page.getByLabel('Kode voucher').fill(code)
  await page.getByRole('button',{name:'Masuk dengan voucher'}).click();await expect(page.getByText('Sesi simulasi aktif',{exact:false})).toBeVisible()
  await page.goto(`/voucher/${token}`)
  const expiry=await page.getByTestId('expires-at').textContent()
  await page.reload();await expect(page.getByTestId('expires-at')).toHaveText(expiry!)
  await page.screenshot({path:`${evidence}/voucher-active.png`,fullPage:true});await owner.close()
})
test('payment failed and timeout recover on same order; paid provisioning/WhatsApp failures never require repayment',async({page,browser})=>{
  const owner=await ownerController(browser);await owner.call('demo','reset',[true]);await page.context().grantPermissions(['clipboard-read','clipboard-write']);await page.bringToFront();const {token,orderId}=await buy(page),url=page.url()
  await owner.call('payments','settle',[orderId,'failed']);await page.getByRole('button',{name:'Perbarui status'}).click();await expect(page.getByTestId('payment-status')).toHaveText('Pembayaran gagal')
  await owner.call('payments','settle',[orderId,'expired']);await page.getByRole('button',{name:'Perbarui status'}).click();await expect(page.getByTestId('payment-status')).toHaveText('Pembayaran timeout')
  await complete(owner,orderId,'failed','failed');await page.getByRole('button',{name:'Perbarui status'}).click();await expect(page.getByText('Pembayaran diterima. Voucher perlu bantuan.',{exact:true})).toBeVisible()
  await page.screenshot({path:`${evidence}/paid-provisioning-failed.png`,fullPage:true})
  await owner.call('vouchers','issue',[orderId,'pending']);await page.getByRole('button',{name:'Perbarui status'}).click();await expect(page.getByText('Voucher sedang diproses',{exact:true})).toBeVisible()
  await owner.call('vouchers','issue',[orderId,'issued']);await owner.call('notifications','send',[orderId,'failed']);await page.getByRole('button',{name:'Perbarui status'}).click()
  await expect(page.getByText('WhatsApp simulasi gagal',{exact:true})).toBeVisible();await expect(page.getByTestId('voucher-code')).toBeVisible()
  await page.screenshot({path:`${evidence}/whatsapp-failed-voucher-retained.png`,fullPage:true})
  const code=await page.getByTestId('voucher-code').textContent()
  await owner.call('notifications','send',[orderId,'sent']);await page.getByRole('button',{name:'Perbarui status'}).click();await expect(page.getByText('WhatsApp simulasi terkirim',{exact:true})).toBeVisible();await expect(page.getByTestId('voucher-code')).toHaveText(code!);await expect(page).toHaveURL(url);await owner.close()
})
test('lost checkout response recovers the same order after refresh even when its offer is disabled',async({page,browser})=>{
  await page.goto('/mitra/demo-cisaat/paket');await page.getByRole('link',{name:'Pilih Reguler · 3 jam',exact:true}).click()
  await page.getByLabel('Nama customer').fill('Recovery Demo');await page.getByLabel('Nomor WhatsApp').fill('081234567890');await page.getByRole('button',{name:'Review pesanan'}).click()
  let savedToken=''
  await page.route('**/api/customer/checkout',async route=>{const response=await route.fetch();savedToken=(await response.json()).order.token;await route.abort()})
  await page.getByRole('button',{name:'Buat pesanan simulasi'}).click();await expect(page.getByRole('alert')).toContainText('Layanan lokal')
  const context=await browser.newContext({baseURL:testOrigin}),owner=await context.newPage();const auth=await loginAs(owner)
  const toggle=(available:boolean)=>owner.request.post('/api/service',{headers:{origin:testOrigin,'x-csrf-token':auth.csrfToken},data:{service:'partners',method:'updateOffer',args:['demo-cisaat','regular-3h',{available}]}})
  try {
    expect((await toggle(false)).status()).toBe(200)
    await page.unroute('**/api/customer/checkout');await page.reload();await page.getByRole('button',{name:'Buat pesanan simulasi'}).click()
    await expect(page).toHaveURL(new RegExp(`/pesanan/${savedToken}$`))
    const state=await(await owner.request.get('/api/state')).json();expect(state.orders.filter((o:{token:string})=>o.token===savedToken)).toHaveLength(1)
  }finally{await toggle(true);await context.close()}
})
test('regular device binding and monthly concurrency are enforced across customer browser profiles',async({page,browser})=>{
  test.setTimeout(180_000)
  const b=await browser.newContext({baseURL:testOrigin}),c=await browser.newContext({baseURL:testOrigin})
  const second=await b.newPage(),third=await c.newPage()
  const connect=async(p:Page,code:string)=>{await p.goto('/wifi/hotspot/hotspot-site-demo-cisaat/login');await p.getByLabel('Kode voucher').fill(code);await p.getByRole('button',{name:'Masuk dengan voucher',exact:true}).click()}
  const owner=await ownerController(browser);await owner.call('demo','reset',[true])
  try {
    const regular=await buy(page);await complete(owner,regular.orderId);await page.getByRole('button',{name:'Perbarui status'}).click();const regularCode=(await page.getByTestId('voucher-code').textContent())!;await connect(page,regularCode)
    await connect(second,regularCode);await expect(second.getByRole('alert')).toContainText('perangkat pertama')
    await page.goto('/wifi/hotspot/hotspot-site-demo-cisaat/login');await page.getByRole('button',{name:'Keluar dari sesi WiFi'}).click()
    const monthly=await buy(page,true);await complete(owner,monthly.orderId);await page.getByRole('button',{name:'Perbarui status'}).click();const monthlyCode=(await page.getByTestId('voucher-code').textContent())!;await connect(page,monthlyCode)
    await connect(second,monthlyCode);await expect(second.getByText('Sesi simulasi aktif',{exact:false})).toBeVisible()
    await connect(third,monthlyCode);await expect(third.getByRole('alert')).toContainText('Slot perangkat sedang penuh')
    await second.getByRole('button',{name:'Keluar dari sesi WiFi'}).click();await connect(third,monthlyCode);await expect(third.getByText('Sesi simulasi aktif',{exact:false})).toBeVisible()
  }finally{await b.close();await c.close();await owner.close()}
})
for(const width of [360,768,1440])test(`customer checkout fits ${width}px and validates contact using keyboard`,async({page,browser})=>{
  const owner=await ownerController(browser);await owner.call('demo','reset',[true]);await page.setViewportSize({width,height:960});await page.goto('/mitra/demo-cisaat/paket')
  await expect(page.locator('h1')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
  await page.screenshot({path:`${evidence}/packages-${width}.png`,fullPage:true})
  await page.getByRole('link',{name:'Pilih Reguler · 3 jam',exact:true}).click()
  if(width===768)await page.getByLabel('Metode pembayaran simulasi').selectOption('ewallet')
  await page.getByLabel('Nama customer').fill('Demo');await page.getByLabel('Nomor WhatsApp').fill('abc081234567890')
  await page.getByRole('button',{name:'Review pesanan'}).focus();await page.keyboard.press('Enter');await expect(page.getByRole('alert')).toContainText('WhatsApp')
  await page.getByLabel('Nomor WhatsApp').fill('081234567890');await page.getByRole('button',{name:'Review pesanan'}).click()
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:`${evidence}/review-${width}.png`,fullPage:true})
  await page.getByRole('button',{name:'Buat pesanan simulasi'}).click();await expect(page.getByTestId('payment-status')).toHaveText('Menunggu pembayaran')
  await expect(page.locator('.payment-illustration')).toContainText('Tidak dapat dipindai atau ditransaksikan')
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:`${evidence}/payment-${width}.png`,fullPage:true})
  const token=page.url().split('/').at(-1)!,detail=await(await page.request.get(`/api/customer/orders/${token}`)).json()
  await complete(owner,detail.order.id);await page.getByRole('button',{name:'Perbarui status'}).click();await expect(page.getByTestId('voucher-code')).toBeVisible();await owner.close()
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:`${evidence}/voucher-${width}.png`,fullPage:true})
})

