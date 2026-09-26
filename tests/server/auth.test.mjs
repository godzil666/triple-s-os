import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { createApplication } from '../../server/application.ts'
import { createFixture } from '../../src/domain/fixtures.ts'

test('invalid persisted state refuses startup and preserves the original file', t => {
  const directory = mkdtempSync(join(tmpdir(), 'sss-invalid-state-'))
  t.after(() => rmSync(directory, { recursive: true, force: true }))
  const path = join(directory, 'demo-state.json')
  const invalid = JSON.stringify(JSON.stringify({ version: 999, data: {} }))
  writeFileSync(path, invalid)
  assert.throws(() => createApplication({ directory, allowedOrigins: ['http://test.local'] }), /DEMO_STATE_INVALID/)
  assert.equal(readFileSync(path, 'utf8'), invalid)
})

test('valid V1 server data gets one immutable backup before the first V2 write', t => {
  const directory=mkdtempSync(join(tmpdir(),'sss-v1-backup-'))
  t.after(()=>rmSync(directory,{recursive:true,force:true}))
  const legacy=createFixture()
  for(const key of ['providers','hotspots','inventoryPools','telemetry','alerts','incidents'])delete legacy[key]
  for(const item of legacy.sites)delete item.providerId
  for(const item of legacy.orders)delete item.hotspotId
  for(const item of legacy.payments)delete item.merchant
  for(const item of legacy.vouchers)delete item.hotspotId
  for(const item of legacy.offlineBatches)delete item.hotspotId
  for(const item of legacy.sessions)delete item.hotspotId
  const data=JSON.stringify(legacy);let hash=2166136261;for(let i=0;i<data.length;i++)hash=Math.imul(hash^data.charCodeAt(i),16777619)
  const raw=JSON.stringify({version:1,checksum:(hash>>>0).toString(16),data:legacy})
  const path=join(directory,'demo-state.json'),backup=join(directory,'demo-state.v1.backup.json')
  writeFileSync(path,JSON.stringify(raw))
  const app=createApplication({directory,allowedOrigins:['http://test.local']})
  assert.equal(readFileSync(backup,'utf8'),readFileSync(path,'utf8'))
  const activated=app.store.getSnapshot().vouchers.find(v=>v.id==='seed-voucher-7')
  app.store.transact(state=>{state.clockNow=new Date(Date.parse(state.clockNow)+60000).toISOString()})
  assert.equal(readFileSync(backup,'utf8'),JSON.stringify(raw))
  assert.equal(app.store.getSnapshot().vouchers.find(v=>v.id===activated.id).expiresAt,activated.expiresAt)
})

async function setup(t) {
  const directory = mkdtempSync(join(tmpdir(), 'sss-auth-'))
  const app = createApplication({ directory, allowedOrigins: ['http://test.local'] })
  for (const [username, role, partnerId] of [['owner','owner',null],['admin','admin',null],['mitra','partner','demo-cisaat']]) app.accounts.create({ username, password: 'Testing-Password-2468', role, partnerId, assignedHotspotIds: role === 'admin' ? ['hotspot-site-demo-cisaat'] : [] })
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

test('admin assignment filters state, list and recovery authority at the API boundary', async t => {
  const { app, client } = await setup(t)
  const owner = client(), staffA = client(), staffB = client(), partner = client()
  await owner.login('owner'); await staffA.login('admin'); await partner.login('mitra')
  const created = await owner.request('/api/accounts', { username: 'admin-b', password: 'Testing-Password-2468', role: 'admin', assignedHotspotIds: ['hotspot-site-demo-cibadak'] })
  assert.equal(created.status, 201)
  await staffB.login('admin-b')
  const order = await app.services.orders.create({ partnerId: 'demo-cisaat', hotspotId: 'hotspot-site-demo-cisaat', packageId: 'regular-3h', customerName: 'Scope Test', customerWhatsapp: '+6281234567890', channel: 'qris' })
  const a = (await staffA.request('/api/state')).body, b = (await staffB.request('/api/state')).body
  assert.ok(a.hotspots.every(h => h.id === 'hotspot-site-demo-cisaat'))
  assert.ok(b.hotspots.every(h => h.id === 'hotspot-site-demo-cibadak'))
  assert.ok(a.orders.some(o => o.id === order.id))
  assert.ok(!b.orders.some(o => o.id === order.id))
  assert.equal((await staffB.request('/api/service', { service: 'payments', method: 'settle', args: [order.id, 'paid'] })).status, 403)
  assert.equal((await staffB.request('/api/service', { service: 'orders', method: 'list', args: [] })).body.result.some(o => o.id === order.id), false)
  assert.equal((await partner.request('/api/service', { service: 'payments', method: 'settle', args: [order.id, 'paid'] })).status, 403)
  assert.equal((await owner.request('/api/accounts/' + created.body.id, { assignedHotspotIds: ['hotspot-site-demo-cisaat', 'hotspot-site-demo-cibadak'] })).status, 200)
  assert.equal((await staffB.request('/api/auth/session')).body.user, null)
  await staffB.login('admin-b')
  assert.equal((await staffB.request('/api/state')).body.hotspots.length, 2)
})

test('scoped operations support health, alerts, incident workflow, search and idempotent recovery', async t => {
  const { app, client } = await setup(t)
  const owner = client(), staff = client(), outsider = client(), partner = client()
  await owner.login('owner'); await staff.login('admin'); await partner.login('mitra')
  await owner.request('/api/accounts', { username: 'admin-outside', password: 'Testing-Password-2468', role: 'admin', assignedHotspotIds: ['hotspot-site-demo-cibadak'] })
  await outsider.login('admin-outside')
  const overview = await staff.request('/api/ops/overview')
  assert.equal(overview.status, 200)
  assert.equal(overview.body.source, 'DEMO TELEMETRY')
  assert.ok(overview.body.hotspots.every(h => h.id === 'hotspot-site-demo-cisaat'))
  assert.ok(overview.body.alerts.some(a => a.type === 'low_stock'))
  const alertId = overview.body.alerts.find(a => a.type === 'low_stock').id
  assert.equal((await outsider.request(`/api/ops/alerts/${alertId}/ack`, {})).status, 403)
  const incident = await staff.request('/api/ops/incidents', { alertId, assigneeId: null })
  assert.equal(incident.status, 200)
  assert.equal((await outsider.request(`/api/ops/incidents/${incident.body.id}`, { status: 'acknowledged' })).status, 403)
  assert.equal((await staff.request(`/api/ops/incidents/${incident.body.id}`, { status: 'resolved' })).body.error, 'INVALID_TRANSITION')
  for (const status of ['acknowledged','investigating','resolved']) assert.equal((await staff.request(`/api/ops/incidents/${incident.body.id}`, { status })).status, 200)
  const order = await app.services.orders.create({ partnerId:'demo-cisaat', hotspotId:'hotspot-site-demo-cisaat', packageId:'regular-3h', customerName:'Help Customer', customerWhatsapp:'+6281234567890', channel:'qris' })
  await app.services.payments.settle(order.id,'paid')
  await app.services.vouchers.issue(order.id,'failed')
  assert.ok((await staff.request('/api/ops/overview')).body.recovery.some(r=>r.orderId===order.id))
  assert.equal((await outsider.request(`/api/ops/recovery/${order.id}`, { action:'issue' })).status, 403)
  assert.equal((await staff.request(`/api/ops/recovery/${order.id}`, { action:'issue' })).status, 200)
  assert.equal((await staff.request(`/api/ops/recovery/${order.id}`, { action:'issue' })).status, 200)
  assert.equal(app.store.getSnapshot().vouchers.filter(v=>v.orderId===order.id).length,1)
  await app.services.notifications.send(order.id,'failed')
  assert.equal((await staff.request(`/api/ops/recovery/${order.id}`, { action:'delivery' })).status, 200)
  assert.equal((await staff.request(`/api/ops/recovery/${order.id}`, { action:'delivery' })).status, 200)
  assert.equal(app.store.getSnapshot().notifications.filter(n=>n.orderId===order.id&&n.status==='sent').length,1)
  const found = await staff.request('/api/ops/search?q=' + encodeURIComponent(order.id))
  assert.equal(found.status,200);assert.equal(found.body[0].orderId,order.id);assert.notEqual(found.body[0].customerWhatsapp,'+6281234567890')
  assert.equal((await outsider.request('/api/ops/search?q=' + encodeURIComponent(order.id))).body.length,0)
  assert.equal((await partner.request('/api/ops/overview')).status,403)
  const telemetry = await owner.request('/api/ops/telemetry',{hotspotId:'hotspot-site-demo-cisaat',status:'offline',users:0,latencyMs:null,usage:{gaming:0,social:0,streaming:0,other:0}})
  assert.equal(telemetry.status,200)
  assert.equal((await staff.request('/api/ops/overview')).body.hotspots[0].telemetry.status,'offline')
  assert.equal((await outsider.request('/api/ops/telemetry',{hotspotId:'hotspot-site-demo-cisaat',status:'online',users:1,latencyMs:1,usage:{gaming:1,social:0,streaming:0,other:0}})).status,403)
  const emptyOrder = await app.services.orders.create({ partnerId:'demo-cisaat', hotspotId:'hotspot-site-demo-cisaat', packageId:'regular-5h', customerName:'Stock Recovery', customerWhatsapp:'+6281234567890', channel:'qris' })
  await app.services.payments.settle(emptyOrder.id,'paid')
  const poolId='pool-hotspot-site-demo-cisaat-regular-5h'
  app.store.transact(s=>{s.inventoryPools.find(p=>p.id===poolId).available=0})
  assert.equal(await app.services.vouchers.issue(emptyOrder.id,'issued'),null)
  assert.ok(app.store.getSnapshot().alerts.some(a=>a.type==='allocation_failed'&&a.orderId===emptyOrder.id))
  assert.equal((await staff.request(`/api/ops/recovery/${emptyOrder.id}`,{action:'issue'})).body.error,'INVENTORY_EMPTY')
  assert.equal((await staff.request(`/api/ops/inventory/${poolId}/refill`,{quantity:10})).status,403)
  assert.equal((await owner.request(`/api/ops/inventory/${poolId}/refill`,{quantity:10})).status,200)
  assert.equal((await staff.request(`/api/ops/recovery/${emptyOrder.id}`,{action:'issue'})).status,200)
  assert.equal((await staff.request(`/api/ops/recovery/${emptyOrder.id}`,{action:'issue'})).status,200)
  assert.equal(app.store.getSnapshot().vouchers.filter(v=>v.orderId===emptyOrder.id).length,1)
  assert.equal(app.store.getSnapshot().inventoryPools.find(p=>p.id===poolId).available,9)
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
  assert.ok(state.vouchers.every(v=>v.code==='Kredensial disamarkan'&&!v.credential))
  const listedVouchers=(await c.request('/api/service',{service:'vouchers',method:'list',args:[]})).body.result
  assert.ok(listedVouchers.every(v=>v.code==='Kredensial disamarkan'&&!v.credential))
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

test('offline portal accepts a synthetic username/password credential and rejects an invalid password',async t=>{
  const {client,app}=await setup(t),customer=client(),voucher=app.store.getSnapshot().vouchers.find(v=>v.id==='seed-offline-1-5')
  assert.equal(voucher.credential.type,'username_password')
  assert.equal((await customer.request('/api/hotspot/login',{siteId:voucher.siteId,username:'offline-demo-user',password:'wrong'})).body.error,'INVALID_VOUCHER')
  const result=await customer.request('/api/hotspot/login',{siteId:voucher.siteId,username:'OFFLINE-DEMO-USER',password:'offline-demo-pass'})
  assert.equal(result.status,200);assert.equal(result.body.voucher.credentialType,'username_password');assert.equal(result.body.voucher.status,'active')
})

test('the shared WiFi portal accepts an issued paid online voucher and keeps site binding', async t => {
  const { client } = await setup(t); const customer = client(),owner=client(); await owner.login('owner')
  const catalog = await customer.request('/api/customer/catalog/demo-cisaat')
  const offer = catalog.body.offers.find(item => item.package.id === 'regular-3h')
  const checkout = await customer.request('/api/customer/checkout', {
    partnerId: 'demo-cisaat', packageId: 'regular-3h', quote: offer.quote,
    customerName: 'Pelanggan Portal', customerWhatsapp: '081234567890',
    channel: 'qris', requestKey: randomUUID(),
  })
  const path = `/api/customer/orders/${checkout.body.order.token}`
  for(const action of ['pay','issue','notify']) assert.equal((await customer.request(`${path}/${action}`,{status:'paid',provisioning:'issued',notification:'sent'})).status,403)
  assert.equal((await owner.request('/api/service',{service:'payments',method:'settle',args:[checkout.body.order.id,'paid']})).status,200)
  assert.equal((await owner.request('/api/service',{service:'vouchers',method:'issue',args:[checkout.body.order.id,'issued']})).status,200)
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


test('owner management records authenticated actor and admin cannot change global catalog or stock',async t=>{
 const {client,app}=await setup(t),admin=client(),owner=client(),partner=client();await admin.login('admin');await owner.login('owner');await partner.login('mitra')
 const input={name:'Mitra Pengujian',area:'Sukabumi',ssid:'SSS-TEST-ADMIN',note:'Sintetis',active:true,ratePercent:25}
 const body={service:'management',method:'savePartner',args:[null,input]}
 assert.equal((await partner.request('/api/service',body)).status,403)
 assert.equal((await admin.request('/api/service',body)).status,403)
 const created=await owner.request('/api/service',body);assert.equal(created.status,200);assert.equal(created.body.state.partners.length,51)
 const p=created.body.result;assert.ok(created.body.state.auditEvents.at(-1).detail.startsWith('owner: owner'))
 const guest=client();const publicState=await guest.request('/api/state');assert.ok(publicState.body.partners.every(p=>p.defaultRatePercent===undefined))
 const catalog=await guest.request('/api/customer/catalog/'+p.id);assert.equal(catalog.status,200);assert.equal(catalog.body.partner.defaultRatePercent,undefined)
 assert.equal((await owner.request('/api/service',{service:'management',method:'savePartner',args:[p.id,{...input,ratePercent:101}]})).status,400)
 const stock={partnerId:p.id,packageId:'regular-3h',quantity:2,wholesaleUnitRp:3000,exampleRetailUnitRp:5000,stockPaymentReference:'',requestKey:'allocation-test-key'}
 const allocate=()=>owner.request('/api/service',{service:'management',method:'allocate',args:[stock]})
 const first=await allocate(),again=await allocate();assert.equal(first.status,200);assert.equal(again.body.result.id,first.body.result.id)
 assert.equal((await owner.request('/api/service',{service:'management',method:'allocate',args:[{...stock,partnerId:'demo-cibadak'}]})).status,400)
 assert.equal(app.store.getSnapshot().vouchers.filter(v=>v.batchId===first.body.result.id).length,2)
 assert.equal((await partner.request('/api/service',{service:'management',method:'allocate',args:[stock]})).status,403)
 assert.equal((await admin.request('/api/service',{service:'management',method:'moveBatch',args:[first.body.result.id,'demo-cibadak']})).status,403)
})

