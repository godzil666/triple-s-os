import {test,expect} from '@playwright/test'
import {loginAs,ownerController,resetDemo,testOrigin} from './helpers/auth'
const evidence=process.env.EVIDENCE_DIR??'docs/verification/stage4'
test.setTimeout(90_000)
test('customer purchase reaches only its partner, one commission, masked contact and scoped detail',async({page,browser})=>{
 await loginAs(page);await resetDemo(page);await loginAs(page,'mitra.cisaat');await page.goto('/mitra-dashboard')
 const before=await(await page.request.get('/api/state')).json();const count=before.payments.filter((p:{status:string})=>p.status==='paid').length
 const otherContext=await browser.newContext({baseURL:testOrigin}),buyer=await otherContext.newPage()
 try{
  await buyer.goto('/mitra/demo-cisaat/paket');await buyer.getByRole('link',{name:'Pilih Reguler · 3 jam',exact:true}).click()
  await buyer.getByLabel('Nama customer').fill('Pembelian Tahap Empat');await buyer.getByLabel('Nomor WhatsApp').fill('081234567890');await buyer.getByRole('button',{name:'Review pesanan'}).click();await buyer.getByRole('button',{name:'Buat pesanan simulasi'}).click();await expect(buyer).toHaveURL(/\/pesanan\/[a-f0-9]{64}$/)
  const token=buyer.url().split('/').at(-1)!;const detail=await(await buyer.request.get(`/api/customer/orders/${token}`)).json()
  const controller=await ownerController(browser);await controller.call('payments','settle',[detail.order.id,'paid']);await controller.call('vouchers','issue',[detail.order.id,'issued']);await controller.call('notifications','send',[detail.order.id,'sent']);await buyer.getByRole('button',{name:'Perbarui status'}).click();await expect(buyer.getByTestId('voucher-code')).toBeVisible({timeout:15000});await controller.close()
  await page.reload();await expect(page.getByTestId('Transaksi online paid')).toHaveText(String(count+1))
  const after=await(await page.request.get('/api/state')).json();expect(after.commissions.filter((c:{orderId:string})=>c.orderId===detail.order.id)).toHaveLength(1)
  const masked=after.orders.find((o:{id:string})=>o.id===detail.order.id);expect(masked.customerWhatsapp).toBe('+628••••••7890');expect(masked.token).toBe('')
  await page.goto(`/mitra-dashboard/penjualan/${detail.order.id}`);await expect(page.getByText('+6281234567890',{exact:false})).toHaveCount(0);await expect(page.getByText(/\+628••••••7890/)).toBeVisible()
  await loginAs(page);const auth=await(await page.request.get('/api/auth/session')).json();const mutate=(partnerId:string)=>page.request.post('/api/service',{headers:{origin:testOrigin,'x-csrf-token':auth.csrfToken},data:{service:'demo',method:'setContext',args:[{partnerId}]}})
  const state=await(await page.request.get('/api/state')).json();const other=state.orders.find((o:{partnerId:string})=>o.partnerId==='demo-cibadak')
  await mutate('demo-cibadak');await page.goto(`/mitra-dashboard/penjualan/${detail.order.id}`);await expect(page.getByRole('heading',{name:'Akses ditolak'})).toBeVisible()
  await loginAs(page,'mitra.cisaat');await page.goto(`/mitra-dashboard/penjualan/${other.id}`);await expect(page.getByRole('heading',{name:'Akses ditolak'})).toBeVisible()
 }finally{await otherContext.close()}
})
test('partner shows offline then stale unknown with observed time; dates filter in WIB',async({page})=>{
 await loginAs(page);await resetDemo(page);const auth=await(await page.request.get('/api/auth/session')).json()
 const call=async(service:string,method:string,args:unknown[])=>{const r=await page.request.post('/api/service',{headers:{origin:testOrigin,'x-csrf-token':auth.csrfToken},data:{service,method,args}});expect(r.status()).toBe(200)}
 const seed=(await(await page.request.get('/api/state')).json()).orders.find((o:{partnerId:string})=>o.partnerId==='demo-cisaat');await call('payments','settle',[seed.id,'paid']);
 await call('monitoring','setSite',['site-demo-cisaat','offline']);await page.goto('/mitra-dashboard');await expect(page.locator('.partner-site')).toContainText('offline');const observed=await page.getByTestId('observed-at').textContent()
 await call('demo','advance',[301000]);await page.reload();await expect(page.locator('.partner-site')).toContainText('unknown');await expect(page.getByTestId('observed-at')).toHaveText(observed!)
 await page.goto('/mitra-dashboard/penjualan');await page.getByLabel('Dari tanggal (WIB)').fill('2027-01-01');await expect(page.getByRole('heading',{name:'Tidak ada transaksi sesuai filter'})).toBeVisible()
 await page.getByRole('button',{name:'Hapus filter'}).click();await page.getByLabel('Status pembayaran').selectOption('paid');await expect(page.getByRole('table')).toBeVisible();await expect(page.getByRole('table').getByText('Pending',{exact:true})).toHaveCount(0)
})
for(const width of [360,768,1440])test(`partner pages fit ${width}px, stock read only and contact masked`,async({page})=>{
 await loginAs(page,'mitra.cisaat');await page.setViewportSize({width,height:960});const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message))
 for(const [route,title] of [['','Ringkasan mitra'],['/stok','Stok voucher offline'],['/penjualan','Penjualan online'],['/bagi-hasil','Bagi hasil online'],['/pengguna','Pengguna aktif']]){
  await page.goto(`/mitra-dashboard${route}`);await expect(page.getByRole('heading',{name:title,exact:true})).toBeVisible();await page.evaluate(()=>document.fonts.ready)
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
  await page.screenshot({path:`${evidence}/${route.slice(1)||'overview'}-${width}.png`,fullPage:true})
 }
 await page.goto('/mitra-dashboard/stok');await expect(page.getByRole('button',{name:/Beli stok|Cairkan|Tambah batch/})).toHaveCount(0)
 await page.getByLabel('Status voucher').selectOption('expired');await expect(page.getByText('unused',{exact:true})).toHaveCount(0)
 expect(errors).toEqual([])
})


test('failed monitoring refresh shows unknown and labels retained totals',async({page})=>{
 await loginAs(page);await resetDemo(page);await page.goto('/mitra-dashboard')
 await expect(page.locator('.partner-site')).toContainText('online')
 const count=await page.getByTestId('Transaksi online paid').textContent()
 await page.route('**/api/state',route=>route.abort())
 await expect(page.getByRole('alert')).toContainText('Pembaruan data gagal',{timeout:20000})
 await expect(page.locator('.partner-site')).toContainText('unknown')
 await expect(page.getByTestId('Transaksi online paid')).toHaveText(count!)
})
