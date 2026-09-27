import test from 'node:test'
import assert from 'node:assert/strict'
import { basename } from 'node:path'
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
