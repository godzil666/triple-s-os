import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { createApplication } from '../../server/application.ts'

test('invalid persisted state refuses startup and preserves the original file', t => {
  const directory = mkdtempSync(join(tmpdir(), 'sss-invalid-state-'))
  t.after(() => rmSync(directory, { recursive: true, force: true }))
  const path = join(directory, 'demo-state.json')
  const invalid = JSON.stringify(JSON.stringify({ version: 999, data: {} }))
  writeFileSync(path, invalid)
  assert.throws(() => createApplication({ directory, allowedOrigins: ['http://test.local'] }), /DEMO_STATE_INVALID/)
  assert.equal(readFileSync(path, 'utf8'), invalid)
})

async function setup(t) {
  const directory = mkdtempSync(join(tmpdir(), 'sss-auth-'))
  const app = createApplication({ directory, allowedOrigins: ['http://test.local'] })
  for (const [username, role, partnerId] of [['owner','owner',null],['admin','admin',null],['mitra','partner','demo-cisaat']]) app.accounts.create({ username, password: 'Testing-Password-2468', role, partnerId })
  await new Promise(resolve => app.server.listen(0, '127.0.0.1', resolve))
  t.after(async () => { await new Promise(resolve => app.server.close(resolve)); rmSync(directory, {recursive:true,force:true}) })
  const base = `http://127.0.0.1:${app.server.address().port}`
  function client() {
    const cookies = new Map(); let csrf = ''
    return {
      async request(path, data, extras={}) {
        const response = await fetch(base + path, { method: data === undefined ? 'GET' : 'POST', headers: { 'content-type':'application/json', origin:'http://test.local', cookie:[...cookies].map(([k,v])=>`${k}=${v}`).join('; '), 'x-csrf-token':csrf, ...extras }, body:data===undefined?undefined:JSON.stringify(data) })
        for (const raw of response.headers.getSetCookie()) { const [key,value] = raw.split(';')[0].split('='); cookies.set(key,value) }
        const body = await response.json()
        if (body.csrfToken) csrf=body.csrfToken
        return { status:response.status, body, headers:response.headers }
      },
      async login(username) { return this.request('/api/auth/login',{username,password:'Testing-Password-2468'}) },
    }
  }
  return { app, client }
}

test('anonymous API never returns private fixtures, and spoofed role/partner cannot grant access', async t => {
  const { client } = await setup(t); const c=client()
  const publicState=await c.request('/api/state')
  assert.equal(publicState.status,200)
  assert.equal(publicState.body.orders.length,0)
  assert.equal(publicState.body.vouchers.length,0)
  assert.equal(publicState.body.commissions.length,0)
  assert.equal((await c.request('/api/accounts')).status,401)
  assert.equal((await c.request('/api/service',{service:'vouchers',method:'list',args:[],role:'owner'})).status,401)
})

test('staff sessions are HttpOnly and revoked by logout; wrong password is rejected', async t => {
  const { client }=await setup(t); const c=client()
  assert.equal((await c.request('/api/auth/login',{username:'owner',password:'wrong'})).status,401)
  const login=await c.login('owner')
  assert.equal(login.status,200)
  assert.match(login.headers.getSetCookie().join(' '),/HttpOnly/)
  assert.match(login.headers.getSetCookie().join(' '),/SameSite=Strict/)
  assert.equal((await c.request('/api/auth/session')).body.user.role,'owner')
  assert.equal((await c.request('/api/auth/logout',{})).status,200)
  assert.equal((await c.request('/api/accounts')).status,401)
})

test('partner projection and object queries stay scoped even with forged arguments', async t => {
  const { client,app }=await setup(t); const c=client(); await c.login('mitra')
  const state=(await c.request('/api/state')).body
  assert.ok(state.orders.every(o=>o.partnerId==='demo-cisaat'))
  assert.ok(state.orders.every(o=>o.token==='' && !o.checkoutKey && o.customerWhatsapp==='Nomor demo disamarkan'))
  const listed=(await c.request('/api/service',{service:'orders',method:'list',args:[]})).body.result
  assert.ok(listed.length>0 && listed.every(o=>o.partnerId==='demo-cisaat' && o.token==='' && o.customerWhatsapp==='Nomor demo disamarkan'))
  assert.ok(state.vouchers.every(v=>v.partnerId==='demo-cisaat'))
  assert.equal((await c.request('/api/service',{service:'orders',method:'list',args:['demo-cibadak']})).status,403)
  const foreign=app.store.getSnapshot().vouchers.find(v=>v.partnerId==='demo-cibadak')
  assert.equal((await c.request('/api/service',{service:'vouchers',method:'login',args:[{voucherId:foreign.id,siteId:foreign.siteId,deviceId:'device-demo-1'}]})).status,403)
  assert.equal((await c.request('/api/service',{service:'demo',method:'setContext',args:[{partnerId:'demo-cibadak'}]})).status,403)
  assert.equal((await c.request('/api/accounts')).status,403)
})

test('admin cannot create owners or reset account security; owner can provision and revoke a partner', async t => {
  const { client }=await setup(t); const admin=client(); const owner=client(); await admin.login('admin'); await owner.login('owner')
  assert.equal((await admin.request('/api/accounts',{username:'new-owner',password:'New-Password-2468',role:'owner'})).status,403)
  const created=await owner.request('/api/accounts',{username:'new-mitra',password:'New-Password-2468',role:'partner',partnerId:'demo-cibadak'})
  assert.equal(created.status,201)
  assert.equal(JSON.stringify(created.body).includes('passwordHash'),false)
  const partner=client(); assert.equal((await partner.request('/api/auth/login',{username:'new-mitra',password:'New-Password-2468'})).status,200)
  await owner.request(`/api/accounts/${created.body.id}`,{active:false})
  assert.equal((await partner.request('/api/service',{service:'orders',method:'list',args:[]})).status,401)
  assert.equal((await admin.request('/api/accounts/'+created.body.id,{active:true})).status,403)
})

test('mutations reject cross-origin and missing CSRF; login throttles repeated failures', async t => {
  const { client }=await setup(t); const c=client(); await c.login('owner')
  assert.equal((await c.request('/api/auth/logout',{}, {'x-csrf-token':''})).status,403)
  assert.equal((await c.request('/api/auth/logout',{}, {origin:'https://evil.example'})).status,403)
  const attacker=client(); let result
  for(let i=0;i<7;i++) result=await attacker.request('/api/auth/login',{username:'nonexistent',password:'wrong'})
  assert.equal(result.status,429)
})

test('one-code offline portal activates only its site, preserves expiry and never grants staff access', async t => {
  const { client,app }=await setup(t); const customer=client()
  const voucher=app.store.getSnapshot().vouchers.find(v=>v.batchId&&v.partnerId==='demo-cisaat')
  assert.equal((await customer.request('/api/hotspot/login',{siteId:'site-demo-cibadak',code:voucher.code})).status,400)
  assert.equal(app.store.getSnapshot().vouchers.find(v=>v.id===voucher.id).firstActivatedAt,null)
  const logged=await customer.request('/api/hotspot/login',{siteId:voucher.siteId,code:voucher.code})
  assert.equal(logged.status,200)
  assert.equal(logged.body.voucher.status,'active')
  const expiry=logged.body.voucher.expiresAt
  await app.services.demo.advance(3600_000)
  assert.equal((await customer.request('/api/hotspot/login',{siteId:voucher.siteId,code:voucher.code})).body.voucher.expiresAt,expiry)
  assert.equal((await customer.request('/api/accounts')).status,401)
  assert.equal((await client().request('/api/hotspot/login',{siteId:voucher.siteId,code:voucher.code})).body.error,'DEVICE_BOUND')
  const status=await customer.request('/api/hotspot/session')
  assert.equal(status.body.voucher.id,voucher.id)
  assert.equal((await customer.request('/api/hotspot/logout',{})).status,200)
  assert.equal((await customer.request('/api/hotspot/session')).body.voucher,null)
  await app.services.demo.advance(2*3600_000)
  assert.equal((await customer.request('/api/hotspot/login',{siteId:voucher.siteId,code:voucher.code})).body.error,'VOUCHER_EXPIRED')
})

test('the shared WiFi portal accepts an issued paid online voucher and keeps site binding', async t => {
  const { client } = await setup(t); const customer = client()
  const catalog = await customer.request('/api/customer/catalog/demo-cisaat')
  const offer = catalog.body.offers.find(item => item.package.id === 'regular-3h')
  const checkout = await customer.request('/api/customer/checkout', {
    partnerId: 'demo-cisaat', packageId: 'regular-3h', quote: offer.quote,
    customerName: 'Pelanggan Portal', customerWhatsapp: '081234567890',
    channel: 'qris', requestKey: randomUUID(),
  })
  const path = `/api/customer/orders/${checkout.body.order.token}`
  await customer.request(`${path}/pay`, { status: 'paid', provisioning: 'issued', notification: 'sent' })
  const detail = await customer.request(path)
  assert.match(detail.body.voucher.code, /^DEMO-/)
  assert.equal((await customer.request('/api/hotspot/login', { siteId: 'site-demo-cibadak', code: detail.body.voucher.code })).body.error, 'WRONG_SITE')
  const logged = await customer.request('/api/hotspot/login', { siteId: 'site-demo-cisaat', code: detail.body.voucher.code })
  assert.equal(logged.status, 200)
  assert.equal(logged.body.voucher.id, detail.body.voucher.id)
  assert.equal(logged.body.voucher.status, 'active')
})

test('unknown or enumerated voucher identifiers do not disclose stock; hotspot sessions cannot be selected by URL', async t => {
  const { client }=await setup(t); const c=client()
  assert.equal((await c.request('/api/hotspot/session?voucherId=seed-offline-1-1')).body.voucher,null)
  const bad=await c.request('/api/hotspot/login',{siteId:'site-demo-cisaat',code:'GUESS'})
  assert.equal(bad.status,400)
  assert.equal(bad.body.error,'INVALID_VOUCHER')
  assert.equal((await c.request('/api/service',{service:'demo',method:'reset',args:[true]})).status,401)
})

test('staff session expires with wall-clock time, independently of demo time', async t => {
  const { client,app }=await setup(t); const c=client()
  let now=Date.now(); t.mock.method(Date,'now',()=>now)
  await c.login('owner')
  await app.services.demo.advance(31*86400_000)
  assert.equal((await c.request('/api/accounts')).status,200)
  now+=31*60_000
  assert.equal((await c.request('/api/accounts')).status,401)
})

test('password rotation revokes existing sessions, and cannot disable the last owner', async t => {
  const { client }=await setup(t);const c=client();const login=await c.login('owner')
  assert.equal((await c.request(`/api/accounts/${login.body.user.id}`,{active:false})).status,400)
  assert.equal((await c.request(`/api/accounts/${login.body.user.id}`,{password:'Rotated-Password-2468'})).status,200)
  assert.equal((await c.request('/api/accounts')).status,401)
  assert.equal((await c.request('/api/auth/login',{username:'owner',password:'Testing-Password-2468'})).status,401)
  assert.equal((await c.request('/api/auth/login',{username:'owner',password:'Rotated-Password-2468'})).status,200)
})


test('admin management records authenticated actor, preserves snapshot, and rejects partner mutation and stock relocation',async t=>{
 const {client,app}=await setup(t),admin=client(),partner=client();await admin.login('admin');await partner.login('mitra')
 const input={name:'Mitra Pengujian',area:'Sukabumi',ssid:'SSS-TEST-ADMIN',note:'Sintetis',active:true,ratePercent:25}
 const body={service:'management',method:'savePartner',args:[null,input]}
 assert.equal((await partner.request('/api/service',body)).status,403)
 const created=await admin.request('/api/service',body);assert.equal(created.status,200);assert.equal(created.body.state.partners.length,51)
 const p=created.body.result;assert.ok(created.body.state.auditEvents.at(-1).detail.startsWith('admin: admin'))
 const guest=client();const publicState=await guest.request('/api/state');assert.ok(publicState.body.partners.every(p=>p.defaultRatePercent===undefined))
 const catalog=await guest.request('/api/customer/catalog/'+p.id);assert.equal(catalog.status,200);assert.equal(catalog.body.partner.defaultRatePercent,undefined)
 assert.equal((await admin.request('/api/service',{service:'management',method:'savePartner',args:[p.id,{...input,ratePercent:101}]})).status,400)
 const stock={partnerId:p.id,packageId:'regular-3h',quantity:2,wholesaleUnitRp:3000,exampleRetailUnitRp:5000,stockPaymentReference:'',requestKey:'allocation-test-key'}
 const allocate=()=>admin.request('/api/service',{service:'management',method:'allocate',args:[stock]})
 const first=await allocate(),again=await allocate();assert.equal(first.status,200);assert.equal(again.body.result.id,first.body.result.id)
 assert.equal((await admin.request('/api/service',{service:'management',method:'allocate',args:[{...stock,partnerId:'demo-cibadak'}]})).status,400)
 assert.equal(app.store.getSnapshot().vouchers.filter(v=>v.batchId===first.body.result.id).length,2)
 assert.equal((await partner.request('/api/service',{service:'management',method:'allocate',args:[stock]})).status,403)
 assert.equal((await admin.request('/api/service',{service:'management',method:'moveBatch',args:[first.body.result.id,'demo-cibadak']})).status,403)
})

