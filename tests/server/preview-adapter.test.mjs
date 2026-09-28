import test from 'node:test'
import assert from 'node:assert/strict'
import { basename } from 'node:path'
import { Readable } from 'node:stream'
import { createApplication } from '../../server/application.ts'

function documentFiles(documents) {
  const key = path => basename(path.replaceAll('\\', '/'))
  return {
    read: (path, fallback) => key(path) in documents ? structuredClone(documents[key(path)]) : fallback,
    write: (path, data) => { documents[key(path)] = structuredClone(data) },
    exists: path => key(path) in documents,
    copy: (from, to) => { documents[key(to)] = structuredClone(documents[key(from)]) },
  }
}

function instance(documents) {
  const runtimeState = {
    sessions: new Map(Object.entries(documents['staff-sessions'] ?? {})),
    limits: new Map(Object.entries(documents['rate-limits'] ?? {})),
  }
  const app = createApplication({ directory: 'preview', files: documentFiles(documents), allowedOrigins: ['https://preview.example'], secureCookies: true, runtimeState })
  return { app, runtimeState }
}

async function listen(server) {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  return `http://127.0.0.1:${server.address().port}`
}

test('serverless requests without a socket support checkout, staff login and voucher login', async () => {
  const { app } = instance({})
  app.accounts.create({ username: 'preview-owner', password: 'test-only-long-password', role: 'owner' })
  async function post(path, data) {
    const request = Readable.from([JSON.stringify(data)])
    Object.assign(request, { url: path, method: 'POST', headers: { origin: 'https://preview.example', 'content-type': 'application/json' } })
    let status, body
    const headers = new Map()
    await app.handleRequest(request, {
      setHeader: (key, value) => headers.set(key, value), getHeader: key => headers.get(key),
      writeHead: value => { status = value }, end: value => { body = JSON.parse(value) },
    })
    return { status, body }
  }
  const login = await post('/api/auth/login', { username: 'preview-owner', password: 'test-only-long-password' })
  assert.equal(login.status, 200)
  const state = app.store.getSnapshot()
  const hotspot = state.hotspots[0]
  const catalogRequest = Readable.from([])
  Object.assign(catalogRequest, { url: `/api/customer/hotspots/${hotspot.id}/catalog`, method: 'GET', headers: {} })
  let catalog
  await app.handleRequest(catalogRequest, { setHeader() {}, getHeader() {}, writeHead() {}, end: value => { catalog = JSON.parse(value) } })
  const offer = catalog.offers[0]
  const checkout = await post('/api/customer/checkout', { partnerId: catalog.partner.id, hotspotId: hotspot.id, packageId: offer.package.id, quote: offer.quote, customerName: 'QA Sintetis', customerWhatsapp: '081000000000', channel: 'qris', requestKey: '11111111-1111-4111-8111-111111111111' })
  assert.equal(checkout.status, 200)
  assert.ok(checkout.body.order.token)
  const voucher = state.vouchers.find(v => v.batchId && v.siteId === hotspot.siteId)
  assert.ok(voucher)
  const activation = await post('/api/hotspot/login', { siteId: hotspot.siteId, hotspotId: hotspot.id, code: voucher.code })
  assert.equal(activation.status, 200)
  assert.equal(activation.body.connected, true)
})

test('preview document adapter restores state, owner identity, and staff session across instances; reset is shared', async () => {
  const documents = {}
  const first = instance(documents)
  first.app.accounts.create({ username: 'preview-owner', password: 'test-only-long-password', role: 'owner' })
  const snapshot = first.app.store.getSnapshot()
  const partnerId = snapshot.partners[0].id
  const packageId = snapshot.partnerPackages.find(offer => offer.partnerId === partnerId && offer.available)?.packageId
  assert.ok(packageId)
  const order = await first.app.services.orders.create({ partnerId, packageId, customerName: 'Contoh', customerWhatsapp: 'DEMO-WA-preview', channel: 'qris', checkoutKey: 'preview-test-checkout' })
  await first.app.services.payments.settle(order.id, 'paid')
  await first.app.services.vouchers.issue(order.id, 'issued')
  const url = await listen(first.app.server)
  let cookie
  try {
    const response = await fetch(`${url}/api/auth/login`, { method: 'POST', headers: { Origin: 'https://preview.example', 'Content-Type': 'application/json' }, body: JSON.stringify({ username: 'preview-owner', password: 'test-only-long-password' }) })
    assert.equal(response.status, 200)
    cookie = response.headers.get('set-cookie')?.split(';')[0]
    assert.match(cookie, /^sss_staff=/)
    assert.match(response.headers.get('set-cookie'), /Secure/)
  } finally {
    await new Promise(resolve => first.app.server.close(resolve))
  }
  documents['staff-sessions'] = Object.fromEntries(first.runtimeState.sessions)
  documents['rate-limits'] = Object.fromEntries(first.runtimeState.limits)

  const second = instance(documents)
  assert.equal(second.app.accounts.list()[0].username, 'preview-owner')
  assert.equal(second.app.store.getSnapshot().vouchers.filter(v => v.orderId === order.id).length, 1)
  const secondUrl = await listen(second.app.server)
  try {
    const session = await fetch(`${secondUrl}/api/auth/session`, { headers: { Cookie: cookie } })
    assert.equal((await session.json()).user?.role, 'owner')
  } finally {
    await new Promise(resolve => second.app.server.close(resolve))
  }
  await second.app.services.demo.reset(true)
  const third = instance(documents)
  assert.equal(third.app.store.getSnapshot().orders.some(item => item.id === order.id), false)
  assert.equal(third.app.accounts.list()[0].username, 'preview-owner')
})
