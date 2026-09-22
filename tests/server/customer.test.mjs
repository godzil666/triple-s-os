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
  await new Promise(resolve=>app.server.listen(0,'127.0.0.1',resolve))
  t.after(async()=>{await new Promise(resolve=>app.server.close(resolve));rmSync(directory,{recursive:true,force:true})})
  const base=`http://127.0.0.1:${app.server.address().port}`
  const client=()=>{
    const cookies=new Map()
    return async(path,data)=>{
      const response=await fetch(base+path,{method:data===undefined?'GET':'POST',headers:{origin:'http://test.local','content-type':'application/json',cookie:[...cookies].map(([k,v])=>`${k}=${v}`).join('; ')},body:data===undefined?undefined:JSON.stringify(data)})
      for(const c of response.headers.getSetCookie()){const [k,v]=c.split(';')[0].split('=');cookies.set(k,v)}
      return {status:response.status,body:await response.json()}
    }
  }
  return {app,client,directory}
}
async function draft(c,kind='regular') {
  const catalog=await c('/api/customer/catalog/demo-cisaat')
  assert.equal(catalog.status,200)
  const offer=catalog.body.offers.find(o=>o.package.kind===kind)
  return {partnerId:'demo-cisaat',packageId:offer.package.id,quote:offer.quote,customerName:'  Pelanggan   Demo  ',customerWhatsapp:'0812-3456-7890',channel:'qris',requestKey:randomUUID()}
}
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
test('paid, provisioning and WhatsApp failures remain separate; arrival later starts timer once and rejects second regular device',async t=>{
  const {app,client}=await setup(t);const c=client();const created=(await c('/api/customer/checkout',await draft(c))).body;const path=`/api/customer/orders/${created.order.token}`
  let r=await c(`${path}/pay`,{status:'paid',provisioning:'failed',notification:'failed'})
  assert.equal(r.body.payment.status,'paid');assert.equal(r.body.order.provisioningStatus,'failed');assert.equal(r.body.voucher,null)
  r=await c(`${path}/issue`,{status:'pending',notification:'failed'});assert.equal(r.body.voucher,null)
  r=await c(`${path}/issue`,{status:'issued',notification:'failed'});assert.equal(r.body.voucher.status,'unused');assert.equal(r.body.notification.status,'failed')
  const vid=r.body.voucher.id;assert.equal(r.body.voucher.expiresAt,null)
  assert.equal((await c(`${path}/connect`,{siteId:''})).body.error,'NETWORK_REQUIRED')
  assert.equal((await c(`${path}/connect`,{siteId:'site-demo-cibadak'})).body.error,'WRONG_SITE')
  await app.services.demo.advance(86400000)
  r=await c(`${path}/connect`,{siteId:'site-demo-cisaat'});assert.equal(r.status,200);const expiry=r.body.voucher.expiresAt;assert.ok(expiry)
  await app.services.demo.advance(60000)
  assert.equal((await c(`${path}/connect`,{siteId:'site-demo-cisaat'})).body.voucher.expiresAt,expiry)
  assert.equal((await client()(`${path}/connect`,{siteId:'site-demo-cisaat'})).body.error,'DEVICE_BOUND')
  r=await c(`${path}/notify`,{status:'sent'});assert.equal(r.body.voucher.id,vid);assert.equal(r.body.notification.status,'sent')
  await c(`${path}/pay`,{status:'paid',provisioning:'issued',notification:'sent'})
  assert.equal(app.store.getSnapshot().commissions.filter(v=>v.orderId===created.order.id).length,1)
  assert.equal(app.store.getSnapshot().vouchers.filter(v=>v.orderId===created.order.id).length,1)
})
test('monthly bearer detail supports different mock devices, enforces slot limit, and frees a slot without restarting expiry',async t=>{
  const {client}=await setup(t);const a=client(),b=client(),c=client();const o=(await a('/api/customer/checkout',await draft(a,'monthly'))).body.order;const path=`/api/customer/orders/${o.token}`
  await a(`${path}/pay`,{status:'paid',provisioning:'issued',notification:'sent'})
  const input={siteId:'site-demo-cisaat'}
  const first=await a(`${path}/connect`,input);assert.equal(first.status,200)
  assert.equal((await b(`${path}/connect`,input)).status,200)
  assert.equal((await c(`${path}/connect`,input)).body.error,'SESSION_LIMIT')
  await b(`${path}/disconnect`,{})
  assert.equal((await c(`${path}/connect`,input)).body.voucher.expiresAt,first.body.voucher.expiresAt)
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
