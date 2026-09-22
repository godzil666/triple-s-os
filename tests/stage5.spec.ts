import {test,expect} from '@playwright/test'
import {loginAs,resetDemo,testOrigin} from './helpers/auth'
const evidence=process.env.EVIDENCE_DIR??'docs/verification/stage5'
test.setTimeout(120000)
test('admin updates price and rate, customer buys, partner and owner retain historical commission',async({page,browser})=>{
 const pageErrors:string[]=[];page.on('pageerror',e=>pageErrors.push(e.message));await loginAs(page);await resetDemo(page);await loginAs(page,'admin');await page.goto('/admin/paket')
 await page.getByLabel('Harga katalog ke seluruh mitra (Rp)').fill('9000');await page.getByRole('button',{name:'Simpan paket',exact:true}).click();await expect(page.getByRole('status')).toContainText('Perubahan tersimpan')
 await page.goto('/admin/mitra/demo-cisaat');await page.getByLabel('Bagi hasil mitra (%)').fill('30');await page.getByRole('button',{name:'Simpan mitra',exact:true}).click();await expect(page.getByRole('status')).toContainText('Perubahan tersimpan')
 const context=await browser.newContext({baseURL:testOrigin}),buyer=await context.newPage()
 try{
  await buyer.goto('/mitra/demo-cisaat/paket');await buyer.getByRole('link',{name:'Pilih Reguler · 3 jam',exact:true}).click();await buyer.getByLabel('Nama customer').fill('Lintas Peran Tahap Lima');await buyer.getByLabel('Nomor WhatsApp').fill('081234567890');await buyer.getByRole('button',{name:'Review pesanan'}).click();await expect(buyer.getByText('Rp 9.000',{exact:false}).first()).toBeVisible();await buyer.getByRole('button',{name:'Buat pesanan simulasi'}).click();await buyer.getByRole('button',{name:'Simulasikan pembayaran sukses'}).click();await expect(buyer.getByTestId('voucher-code')).toBeVisible({timeout:15000})
  const token=buyer.url().split('/').at(-1),detail=await(await buyer.request.get(`/api/customer/orders/${token}`)).json();expect(detail.order.amountRp).toBe(9000)
  await loginAs(page,'mitra.cisaat');await page.goto(`/mitra-dashboard/penjualan/${detail.order.id}`);await expect(page.getByText('Rp 2.700',{exact:true})).toBeVisible();await page.goto('/admin');await expect(page.getByRole('heading',{name:'Akses tidak tersedia'})).toBeVisible()
  await loginAs(page,'admin');await page.goto('/admin/paket');await page.getByLabel('Harga katalog ke seluruh mitra (Rp)').fill('11000');await page.getByRole('button',{name:'Simpan paket',exact:true}).click();await expect(page.getByRole('status')).toContainText('Perubahan tersimpan')
  await page.goto('/admin/mitra/demo-cisaat');await page.getByLabel('Bagi hasil mitra (%)').fill('40');await page.getByRole('button',{name:'Simpan mitra',exact:true}).click();await expect(page.getByRole('status')).toContainText('Perubahan tersimpan')
  await loginAs(page);await page.goto(`/owner/transaksi/${detail.order.id}`);await expect(page.getByText('Rp 9.000',{exact:true})).toBeVisible();await expect(page.getByText('Rp 2.700',{exact:true})).toBeVisible();await expect(page.getByText(/30% \/ Rp/)).toBeVisible()
  await page.screenshot({path:`${evidence}/historical-transaction.png`,fullPage:true})
  await page.goto('/owner/aktivitas');await page.getByLabel('Cari aktivitas atau aktor').fill('admin: admin');await expect(page.getByRole('table')).toContainText('package.updated');await expect(page.getByRole('table')).toContainText('partner.updated');expect(pageErrors).toEqual([])
  for(const width of [360,768,1440]){await page.setViewportSize({width,height:960});await page.goto('/owner/mitra/demo-cisaat');await expect(page.getByLabel('Nama mitra',{exact:true})).toBeVisible();await page.screenshot({path:evidence+'/partner-form-full-'+width+'.png',fullPage:true})}
 }finally{await context.close()}
})
test('forms add partner and package, configure availability, allocate unique stock, and preserve through reload',async({page,browser})=>{
 await loginAs(page);await resetDemo(page);await page.goto('/owner');await expect(page.getByTestId('Jumlah titik')).toHaveText('50')
 await page.goto('/owner/mitra');await page.getByLabel('Nama mitra',{exact:true}).fill('Mitra Baru Tahap Lima');await page.getByLabel('Area mitra').fill('Sukabumi');await page.getByLabel('SSID sintetis').fill('SSS-DEMO-BARU');await page.getByLabel('Bagi hasil mitra (%)').fill('25');await page.getByRole('button',{name:'Tambah mitra',exact:true}).click();await expect(page).toHaveURL(/\/owner\/mitra\/demo-mitra-/);const partnerId=page.url().split('/').at(-1)!
 await page.getByLabel('Ketersediaan paket mitra').selectOption('true');await page.getByRole('button',{name:'Simpan penawaran mitra'}).click();await expect(page.getByRole('status')).toContainText('Perubahan tersimpan')
 await page.goto('/owner/paket');await page.getByLabel('Edit atau tambah paket').selectOption('');await page.getByLabel('Nama paket',{exact:true}).fill('Paket Uji Baru');await page.getByLabel('Harga katalog ke seluruh mitra (Rp)').fill('-1');await page.getByRole('button',{name:'Tambah paket',exact:true}).click();expect(await page.getByLabel('Harga katalog ke seluruh mitra (Rp)').evaluate((el:HTMLInputElement)=>el.validity.valid)).toBe(false)
 await page.getByLabel('Harga katalog ke seluruh mitra (Rp)').fill('6000');await page.getByRole('button',{name:'Tambah paket',exact:true}).click();await expect(page.getByRole('table')).toContainText('Paket Uji Baru')
 await page.goto('/owner/stok');await page.getByLabel('Mitra penerima batch').selectOption(partnerId);await page.getByLabel('Jumlah voucher').fill('3');await page.getByRole('button',{name:'Berikan batch sintetis'}).click();await expect(page.getByRole('status')).toContainText('Perubahan tersimpan');await page.getByLabel('Filter mitra stok').selectOption(partnerId);await expect(page.getByRole('table',{name:'Voucher offline milik mitra pilihan'}).locator('tbody tr')).toHaveCount(3)
 const state=await(await page.request.get('/api/state')).json(),codes=state.vouchers.map((v:{code:string})=>v.code);expect(new Set(codes).size).toBe(codes.length)
 await page.reload();await page.getByLabel('Filter mitra stok').selectOption(partnerId);await expect(page.getByRole('table',{name:'Voucher offline milik mitra pilihan'}).locator('tbody tr')).toHaveCount(3)
 const context=await browser.newContext({baseURL:testOrigin}),customer=await context.newPage();try{await customer.goto('/');await customer.getByLabel('Cari mitra',{exact:true}).fill('Mitra Baru Tahap Lima');await expect(customer.getByRole('link',{name:'Pilih Mitra Baru Tahap Lima',exact:true})).toBeVisible()}finally{await context.close()}
 await page.goto('/owner');await expect(page.getByTestId('Jumlah titik')).toHaveText('51');await page.getByLabel('Status titik').selectOption('unknown');await expect(page.getByRole('table')).toContainText('Mitra Baru Tahap Lima')
})
for(const width of [360,768,1440])test(`owner management fits ${width}px with keyboard and no overflow`,async({page})=>{
 await loginAs(page);await page.setViewportSize({width,height:960});const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message))
 for(const route of ['', '/mitra','/mitra/demo-cisaat','/paket','/stok','/transaksi','/aktivitas']){await page.goto(`/owner${route}`);await expect(page.locator('h1')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:`${evidence}/${route.replaceAll('/','-')||'overview'}-${width}.png`,fullPage:false})}
 await page.goto('/owner/mitra/demo-cisaat');await page.getByLabel('Nama mitra',{exact:true}).focus();await page.keyboard.press('Tab');await expect(page.getByLabel('Area mitra')).toBeFocused();expect(errors).toEqual([])
})


test('lost batch response recovers same allocation after refresh',async({page})=>{
 await loginAs(page);await resetDemo(page);await page.goto('/owner/stok');let key=''
 await page.route('**/api/service',async route=>{const data=route.request().postDataJSON();if(data.service==='management'&&data.method==='allocate'){key=data.args[0].requestKey;await route.fetch();await route.abort()}else await route.continue()})
 await page.getByRole('button',{name:'Berikan batch sintetis'}).click();await expect(page.getByRole('alert')).toBeVisible();await page.unroute('**/api/service');await page.reload();await expect(page.getByLabel('Jumlah voucher')).toBeDisabled();await page.getByRole('button',{name:'Pulihkan batch yang sama'}).click();await expect(page.getByRole('status')).toContainText('Perubahan tersimpan')
 const state=await(await page.request.get('/api/state')).json();expect(state.offlineBatches.filter((b:{requestKey?:string})=>b.requestKey===key)).toHaveLength(1);expect(state.offlineBatches).toHaveLength(7)
})


