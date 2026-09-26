import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync, mkdirSync, rmdirSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { createApplication } from '../../server/application.ts'
import { createFixture } from '../../src/domain/fixtures.ts'

async function setup(t) {
  const directory=mkdtempSync(join(tmpdir(),'sss-customer-'))
  const app=createApplication({directory,allowedOrigins:['http://test.local']})
  app.accounts.create({username:'owner',password:'Testing-Password-2468',role:'owner',partnerId:null})
  await new Promise(resolve=>app.server.listen(0,'127.0.0.1',resolve))
  t.after(async()=>{await new Promise(resolve=>app.server.close(resolve));rmSync(directory,{recursive:true,force:true})})
  const base=`http://127.0.0.1:${app.server.address().port}`
  const client=()=>{
    const cookies=new Map();let csrf=''
    const request=async(path,data)=>{
      const response=await fetch(base+path,{method:data===undefined?'GET':'POST',headers:{origin:'http://test.local','content-type':'application/json',cookie:[...cookies].map(([k,v])=>`${k}=${v}`).join('; ')},body:data===undefined?undefined:JSON.stringify(data)})
      for(const c of response.headers.getSetCookie()){const [k,v]=c.split(';')[0].split('=');cookies.set(k,v)}
      const body=await response.json();if(body.csrfToken)csrf=body.csrfToken
      return {status:response.status,body}
    }
    request.login=async()=>request('/api/auth/login',{username:'owner',password:'Testing-Password-2468'})
    request.control=(service,method,args)=>fetch(base+'/api/service',{method:'POST',headers:{origin:'http://test.local','content-type':'application/json',cookie:[...cookies].map(([k,v])=>`${k}=${v}`).join('; '),'x-csrf-token':csrf},body:JSON.stringify({service,method,args})}).then(async response=>({status:response.status,body:await response.json()}))
    return request
  }
  return {app,client,directory}
}
async function draft(c,kind='regular') {
  const catalog=await c('/api/customer/catalog/demo-cisaat')
  assert.equal(catalog.status,200)
  const offer=catalog.body.offers.find(o=>o.package.kind===kind)
  return {partnerId:'demo-cisaat',packageId:offer.package.id,quote:offer.quote,customerName:'  Pelanggan   Demo  ',customerWhatsapp:'0812-3456-7890',channel:'qris',requestKey:randomUUID()}
}

test('hotspot catalog binds an online order and credential; order token alone cannot activate it', async t => {
  const { app, client } = await setup(t)
  const customer = client(), owner = client()
  await owner.login()
  const hotspotId = 'hotspot-site-demo-cisaat-2'
  const catalog = await customer(`/api/customer/hotspots/${hotspotId}/catalog`)
  assert.equal(catalog.status, 200)
  assert.equal(catalog.body.hotspot.id, hotspotId)
  assert.equal(catalog.body.provider.partnerId, 'demo-cisaat')
  const offer = catalog.body.offers.find(item => item.package.id === 'regular-3h')
  const created = await customer('/api/customer/checkout', { partnerId: 'demo-cisaat', hotspotId, packageId: offer.package.id, quote: offer.quote, customerName: 'Customer Sintetis', customerWhatsapp: '081234567890', channel: 'qris', requestKey: randomUUID() })
  assert.equal(created.status, 200)
  assert.equal(created.body.order.hotspotId, hotspotId)
  assert.equal(created.body.payment.merchant, 'PT_SSS')
  assert.equal((await customer('/api/customer/checkout', { partnerId: 'demo-cibadak', hotspotId, packageId: offer.package.id, quote: offer.quote, customerName: 'Customer Sintetis', customerWhatsapp: '081234567890', channel: 'qris', requestKey: randomUUID() })).status, 404)
  await owner.control('payments', 'settle', [created.body.order.id, 'paid'])
  await owner.control('vouchers', 'issue', [created.body.order.id, 'issued'])
  const tokenPath = `/api/customer/orders/${created.body.order.token}`
  const direct = await customer(`${tokenPath}/connect`, { siteId: 'site-demo-cisaat', hotspotId })
  assert.equal(direct.status, 403)
  assert.equal(app.store.getSnapshot().vouchers.find(v => v.orderId === created.body.order.id).firstActivatedAt, null)
  const code = (await customer(tokenPath)).body.voucher.code
  const wrong = await customer('/api/hotspot/login', { siteId: 'site-demo-cisaat', hotspotId: 'hotspot-site-demo-cisaat', code })
  assert.equal(wrong.body.error, 'WRONG_HOTSPOT')
  const correct = await customer('/api/hotspot/login', { siteId: 'site-demo-cisaat', hotspotId, code })
  assert.equal(correct.status, 200)
  assert.ok(correct.body.voucher.firstActivatedAt)
})
test('guest checkout validates contact, rejects stale quote, and deduplicates concurrent retries through persisted store',async t=>{
  const {app,client,directory}=await setup(t);const c=client();const input=await draft(c)
  assert.equal((await c('/api/customer/checkout',{...input,customerWhatsapp:'abc081234567890'})).status,400)
  assert.equal((await c('/api/customer/checkout',{...input,quote:'stale'})).body.error,'QUOTE_CHANGED')
  const count=app.store.getSnapshot().orders.length
  const results=await Promise.all([c('/api/customer/checkout',input),c('/api/customer/checkout',input)])
  assert.ok(results.every(r=>r.status===200));assert.equal(results[0].body.order.token,results[1].body.order.token)
  const o=results[0].body.order;assert.match(o.token,/^[a-f0-9]{64}$/);assert.equal(o.customerWhatsapp,'+6281234567890');assert.equal(o.customerName,'Pelanggan Demo')
  assert.equal(app.store.getSnapshot().orders.length,count+1)
  assert.equal((await c('/api/customer/checkout',{...input,customerName:'Berbeda'})).body.error,'CHECKOUT_CONFLICT')
  const restored=createApplication({directory,allowedOrigins:['http://test.local']});assert.ok(restored.store.getSnapshot().orders.some(v=>v.token===o.token))
  const pub=(await c('/api/state')).body;assert.equal(pub.orders.length,0)
  assert.equal((await c('/api/customer/orders/DEMO-order-1')).status,404)
  assert.equal((await c('/api/customer/orders?whatsapp=081234567890')).status,404)
  assert.equal((await c('/api/accounts')).status,401)
})
test('a public customer order link cannot forge payment, provisioning, or notification outcomes',async t=>{
  const {app,client}=await setup(t);const guest=client();const created=(await guest('/api/customer/checkout',await draft(guest))).body
  const path=`/api/customer/orders/${created.order.token}`
  for(const action of ['pay','issue','notify']) assert.equal((await guest(`${path}/${action}`,{status:'paid',provisioning:'issued',notification:'sent'})).status,403)
  const state=app.store.getSnapshot()
  assert.equal(state.payments.find(p=>p.orderId===created.order.id).status,'pending')
  assert.equal(state.vouchers.some(v=>v.orderId===created.order.id),false)
  assert.equal(state.commissions.some(c=>c.orderId===created.order.id),false)
})
test('paid, provisioning and WhatsApp failures remain separate; arrival later starts timer once and rejects second regular device',async t=>{
  const {app,client}=await setup(t);const c=client(),owner=client();await owner.login();const created=(await c('/api/customer/checkout',await draft(c))).body;const path=`/api/customer/orders/${created.order.token}`
  await owner.control('payments','settle',[created.order.id,'paid']);await owner.control('vouchers','issue',[created.order.id,'failed']);let r=await c(path)
  assert.equal(r.body.payment.status,'paid');assert.equal(r.body.order.provisioningStatus,'failed');assert.equal(r.body.voucher,null)
  await owner.control('vouchers','issue',[created.order.id,'pending']);assert.equal((await c(path)).body.voucher,null)
  await owner.control('vouchers','issue',[created.order.id,'issued']);await owner.control('notifications','send',[created.order.id,'failed']);r=await c(path);assert.equal(r.body.voucher.status,'unused');assert.equal(r.body.notification.status,'failed')
  const vid=r.body.voucher.id;assert.equal(r.body.voucher.expiresAt,null)
  const code=r.body.voucher.code
  assert.equal((await c(`${path}/connect`,{siteId:'site-demo-cisaat'})).status,403)
  assert.equal((await c('/api/hotspot/login',{siteId:'site-demo-cibadak',code})).body.error,'WRONG_SITE')
  await app.services.demo.advance(86400000)
  r=await c('/api/hotspot/login',{siteId:'site-demo-cisaat',code});assert.equal(r.status,200);const expiry=r.body.voucher.expiresAt;assert.ok(expiry)
  await app.services.demo.advance(60000)
  assert.equal((await c('/api/hotspot/login',{siteId:'site-demo-cisaat',code})).body.voucher.expiresAt,expiry)
  assert.equal((await client()('/api/hotspot/login',{siteId:'site-demo-cisaat',code})).body.error,'DEVICE_BOUND')
  await owner.control('notifications','send',[created.order.id,'sent']);r=await c(path);assert.equal(r.body.voucher.id,vid);assert.equal(r.body.notification.status,'sent')
  await owner.control('payments','settle',[created.order.id,'paid']);await owner.control('vouchers','issue',[created.order.id,'issued'])
  assert.equal(app.store.getSnapshot().commissions.filter(v=>v.orderId===created.order.id).length,1)
  assert.equal(app.store.getSnapshot().vouchers.filter(v=>v.orderId===created.order.id).length,1)
})
test('monthly credential supports different mock devices, enforces slot limit, and frees a slot without restarting expiry',async t=>{
  const {client}=await setup(t);const a=client(),b=client(),c=client(),owner=client();await owner.login();const o=(await a('/api/customer/checkout',await draft(a,'monthly'))).body.order;const path=`/api/customer/orders/${o.token}`
  await owner.control('payments','settle',[o.id,'paid']);await owner.control('vouchers','issue',[o.id,'issued'])
  const code=(await a(path)).body.voucher.code,input={siteId:'site-demo-cisaat',code}
  const first=await a('/api/hotspot/login',input);assert.equal(first.status,200)
  assert.equal((await b('/api/hotspot/login',input)).status,200)
  assert.equal((await c('/api/hotspot/login',input)).body.error,'SESSION_LIMIT')
  await b('/api/hotspot/logout',{})
  assert.equal((await c('/api/hotspot/login',input)).body.voucher.expiresAt,first.body.voucher.expiresAt)
})

test('failed disk commit never acknowledges or publishes a checkout, and the same key succeeds after storage recovers',async t=>{
  const {app,client,directory}=await setup(t);const c=client();const input=await draft(c);const count=app.store.getSnapshot().orders.length
  const blocked=join(directory,'demo-state.json.tmp');mkdirSync(blocked)
  const response=await c('/api/customer/checkout',input)
  assert.equal(response.status,503);assert.equal(response.body.error,'PERSISTENCE_UNAVAILABLE')
  assert.equal(app.store.getSnapshot().orders.length,count)
  rmdirSync(blocked)
  const retried=await c('/api/customer/checkout',input);assert.equal(retried.status,200)
  assert.equal(app.store.getSnapshot().orders.length,count+1)
  const restored=createApplication({directory,allowedOrigins:['http://test.local']})
  assert.ok(restored.store.getSnapshot().orders.some(o=>o.token===retried.body.order.token))
})
test('backend reset publishes randomized inventory atomically, and failed reset preserves both active and disk state',async t=>{
  const {app,directory}=await setup(t)
  await app.services.demo.reset(true)
  const known=new Set(createFixture().vouchers.filter(v=>v.batchId).map(v=>v.code))
  assert.ok(app.store.getSnapshot().vouchers.filter(v=>v.batchId).every(v=>!known.has(v.code)))
  const before=app.store.getSnapshot(),path=join(directory,'demo-state.json'),disk=readFileSync(path,'utf8')
  mkdirSync(path+'.tmp')
  await assert.rejects(app.services.demo.reset(true),/PERSISTENCE_UNAVAILABLE/)
  assert.equal(app.store.getSnapshot(),before);assert.equal(readFileSync(path,'utf8'),disk)
})
