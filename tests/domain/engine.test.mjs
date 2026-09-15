import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createDemoStore, STORAGE_KEY } from '../../src/domain/store.ts'
import { createMockServices } from '../../src/services/mock.ts'
import { selectSummary, monitoringStatus } from '../../src/domain/selectors.ts'

const setup = (storage) => { const store = createDemoStore(storage); return { store, api: createMockServices(store) } }
const orderInput = (packageId = 'regular-3h') => ({ partnerId: 'demo-cisaat', packageId, customerName: 'Pelanggan Sintetis', customerWhatsapp: 'DEMO-WA-001', channel: 'qris' })
async function purchase(api, packageId) {
  const order = await api.orders.create(orderInput(packageId))
  await api.payments.settle(order.id, 'paid')
  return { order, voucher: await api.vouchers.issue(order.id) }
}
const login = (api, voucher, deviceId = 'device-demo-1', siteId = 'site-demo-cisaat') => api.vouchers.login({ voucherId: voucher.id, deviceId, siteId })

test('parallel duplicate callbacks issue only one voucher and one commission; late failure cannot undo paid', async () => {
  const { store, api } = setup()
  const order = await api.orders.create(orderInput())
  await Promise.all(Array.from({ length: 8 }, () => api.payments.settle(order.id, 'paid')))
  const vouchers = await Promise.all(Array.from({ length: 8 }, () => api.vouchers.issue(order.id)))
  await api.payments.settle(order.id, 'failed')
  const s = store.getSnapshot()
  assert.equal(s.payments.find(p => p.orderId === order.id).status, 'paid')
  assert.equal(new Set(vouchers.map(v => v.id)).size, 1)
  assert.equal(s.vouchers.filter(v => v.orderId === order.id).length, 1)
  assert.equal(s.commissions.filter(c => c.orderId === order.id).length, 1)
  assert.equal(s.commissions.find(c => c.orderId === order.id).amountRp, 1000)
})

test('purchase and paid/provisioning delay do not start a timer, notifications never issue extra vouchers', async () => {
  const { store, api } = setup()
  const order = await api.orders.create(orderInput())
  await assert.rejects(api.vouchers.issue(order.id), /PAYMENT_NOT_PAID/)
  await api.payments.settle(order.id, 'paid')
  await api.demo.configure({ provisioning: 'pending', notification: 'failed' })
  assert.equal(await api.vouchers.issue(order.id), null)
  assert.equal(store.getSnapshot().orders.find(o => o.id === order.id).provisioningStatus, 'pending')
  await api.demo.advance(24 * 3600_000)
  await api.demo.configure({ provisioning: 'issued' })
  const voucher = await api.vouchers.issue(order.id)
  assert.equal(voucher.status, 'unused')
  assert.equal(voucher.firstActivatedAt, null)
  assert.equal(voucher.expiresAt, null)
  await api.notifications.send(order.id)
  await api.demo.configure({ notification: 'sent' })
  await api.notifications.send(order.id)
  assert.equal(store.getSnapshot().vouchers.filter(v => v.orderId === order.id).length, 1)
  assert.deepEqual(store.getSnapshot().notifications.filter(n => n.orderId === order.id).map(n => n.status), ['failed', 'sent'])
})

test('wrong site, offline site and unknown site reject without activating voucher', async () => {
  const { store, api } = setup()
  const { voucher } = await purchase(api)
  await assert.rejects(login(api, voucher, undefined, 'site-demo-cibadak'), /WRONG_SITE/)
  await api.monitoring.setSite('site-demo-cisaat', 'offline')
  await assert.rejects(login(api, voucher), /SITE_UNAVAILABLE/)
  await api.monitoring.setSite('site-demo-cisaat', 'unknown')
  await assert.rejects(login(api, voucher), /SITE_UNAVAILABLE/)
  const v = store.getSnapshot().vouchers.find(v => v.id === voucher.id)
  assert.equal(v.firstActivatedAt, null)
  assert.equal(v.expiresAt, null)
})

test('reconnect reuses session and original expiry; regular device binding survives logout', async () => {
  const { store, api } = setup()
  const { voucher } = await purchase(api)
  const first = await login(api, voucher)
  const started = store.getSnapshot().clockNow
  await api.demo.advance(3600_000)
  assert.equal((await login(api, voucher)).id, first.id)
  await api.vouchers.logout(first.id)
  await assert.rejects(login(api, voucher, 'device-demo-2'), /DEVICE_BOUND/)
  await login(api, voucher)
  const v = store.getSnapshot().vouchers.find(v => v.id === voucher.id)
  assert.equal(v.firstActivatedAt, started)
  assert.equal(v.expiresAt, new Date(Date.parse(started) + 3 * 3600_000).toISOString())
  await api.demo.advance(2 * 3600_000)
  await assert.rejects(login(api, voucher), /VOUCHER_EXPIRED/)
  assert.equal(store.getSnapshot().vouchers.find(v => v.id === voucher.id).status, 'expired')
  assert.equal(store.getSnapshot().sessions.filter(s => s.voucherId === voucher.id && s.endedAt === null).length, 0)
})

for (const [packageId, slots] of [['monthly-2', 2], ['monthly-4', 4]]) {
  test(`${packageId}: concurrent logins respect capacity; logout frees slot with a shared expiry`, async () => {
    const { store, api } = setup()
    const { voucher } = await purchase(api, packageId)
    const results = await Promise.allSettled(Array.from({ length: slots + 1 }, (_, i) => login(api, voucher, `device-demo-${i + 1}`)))
    assert.equal(results.filter(r => r.status === 'fulfilled').length, slots)
    assert.match(results.find(r => r.status === 'rejected').reason.message, /SESSION_LIMIT/)
    const expiry = store.getSnapshot().vouchers.find(v => v.id === voucher.id).expiresAt
    await api.demo.advance(3600_000)
    await api.vouchers.logout(results[0].value.id)
    await login(api, voucher, 'device-demo-99')
    assert.equal(store.getSnapshot().vouchers.find(v => v.id === voucher.id).expiresAt, expiry)
  })
}

test('historical price, duration and commission rate stay frozen after catalog changes', async () => {
  const { store, api } = setup()
  await api.partners.updateOffer('demo-cisaat', 'regular-3h', { priceRp: 5003 })
  const old = await api.orders.create(orderInput())
  await api.partners.updateOffer('demo-cisaat', 'regular-3h', { priceRp: 9000, commissionRatePercent: 30 })
  await api.partners.updatePackage('regular-3h', { durationSeconds: 7200 })
  await api.payments.settle(old.id, 'paid')
  const voucher = await api.vouchers.issue(old.id)
  assert.equal(voucher.durationSeconds, 10800)
  const entry = store.getSnapshot().commissions.find(c => c.orderId === old.id)
  assert.equal(entry.basisRp, 5003)
  assert.equal(entry.ratePercent, 20)
  assert.equal(entry.amountRp, 1001)
  const next = await api.orders.create(orderInput())
  assert.equal(next.amountRp, 9000)
  assert.equal(next.packageSnapshot.durationSeconds, 7200)
  assert.equal(next.rateSnapshot.ratePercent, 30)
})

test('failed/expired payments have no commission; explicit paid callback recovers a failed mock payment', async () => {
  const { store, api } = setup()
  for (const status of ['pending', 'failed', 'expired']) {
    const order = await api.orders.create(orderInput())
    await api.payments.settle(order.id, status)
    assert.equal(store.getSnapshot().commissions.filter(c => c.orderId === order.id).length, 0)
    await assert.rejects(api.vouchers.issue(order.id), /PAYMENT_NOT_PAID/)
    await api.payments.settle(order.id, 'paid')
    assert.equal(store.getSnapshot().commissions.filter(c => c.orderId === order.id).length, 1)
  }
})

test('catalog availability blocks new purchases but deactivation does not kill existing vouchers', async () => {
  const { api } = setup()
  const { voucher } = await purchase(api)
  await api.partners.setActive('demo-cisaat', false)
  await assert.rejects(api.orders.create(orderInput()), /PARTNER_INACTIVE/)
  await login(api, voucher)
  await api.partners.setActive('demo-cisaat', true)
  await api.partners.updateOffer('demo-cisaat', 'regular-3h', { available: false })
  await assert.rejects(api.orders.create(orderInput()), /PACKAGE_UNAVAILABLE/)
  await api.partners.updateOffer('demo-cisaat', 'regular-3h', { available: true })
  await api.partners.updatePackage('regular-3h', { archived: true })
  await assert.rejects(api.orders.create(orderInput()), /PACKAGE_UNAVAILABLE/)
})

test('single-store summary tracks online activity and paid amounts per partner, not offline stock allocation', async () => {
  const { store, api } = setup()
  const before = selectSummary(store.getSnapshot(), 'demo-cisaat')
  const otherBefore = selectSummary(store.getSnapshot(), 'demo-cibadak')
  const { voucher } = await purchase(api)
  const session = await login(api, voucher)
  const after = selectSummary(store.getSnapshot(), 'demo-cisaat')
  assert.equal(after.onlineDevices, before.onlineDevices + 1)
  assert.equal(after.onlineGrossRp, before.onlineGrossRp + 5000)
  assert.equal(after.onlineCommissionRp, before.onlineCommissionRp + 1000)
  assert.equal(after.offlinePotentialMarginRp, before.offlinePotentialMarginRp)
  assert.equal(after.offlineRealizedMarginRp, null)
  assert.deepEqual(selectSummary(store.getSnapshot(), 'demo-cibadak'), otherBefore)
  await api.vouchers.logout(session.id)
  assert.equal(selectSummary(store.getSnapshot(), 'demo-cisaat').onlineDevices, before.onlineDevices)
})

test('poll failure and stale observation report unknown, not offline', async () => {
  const { store, api } = setup()
  await api.monitoring.setSite('site-demo-cisaat', 'online')
  assert.equal(monitoringStatus(store.getSnapshot(), 'site-demo-cisaat'), 'online')
  await api.demo.advance(5 * 60_000 + 1)
  assert.equal(monitoringStatus(store.getSnapshot(), 'site-demo-cisaat'), 'unknown')
  await api.monitoring.poll('site-demo-cisaat', true)
  assert.equal(monitoringStatus(store.getSnapshot(), 'site-demo-cisaat'), 'unknown')
  await api.monitoring.poll('site-demo-cisaat')
  assert.equal(monitoringStatus(store.getSnapshot(), 'site-demo-cisaat'), 'online')
})

test('persisted activation survives reload; reset requires confirmation and preserves unrelated storage', async () => {
  const map = new Map([['other-app', 'keep']])
  const storage = { getItem: key => map.get(key) ?? null, setItem: (key, value) => map.set(key, value) }
  const { api } = setup(storage)
  const { voucher } = await purchase(api)
  await login(api, voucher)
  await api.demo.advance(3600_000)
  const restored = setup(storage)
  const expiry = restored.store.getSnapshot().vouchers.find(v => v.id === voucher.id).expiresAt
  await login(restored.api, voucher)
  assert.equal(restored.store.getSnapshot().vouchers.find(v => v.id === voucher.id).expiresAt, expiry)
  await assert.rejects(restored.api.demo.reset(false), /CONFIRMATION_REQUIRED/)
  assert.ok(restored.store.getSnapshot().vouchers.some(v => v.id === voucher.id))
  await restored.api.demo.reset(true)
  assert.equal(restored.store.getSnapshot().vouchers.some(v => v.id === voucher.id), false)
  assert.equal(map.get('other-app'), 'keep')
  assert.ok(map.has(STORAGE_KEY))
})

test('incompatible or corrupt storage is retained until confirmed reset; storage failure degrades to memory', async () => {
  for (const raw of ['{broken', JSON.stringify({ version: 999, data: {} }), JSON.stringify({ version: 1, data: { synthetic: true } })]) {
    const map = new Map([[STORAGE_KEY, raw]])
    const { store, api } = setup({ getItem: k => map.get(k) ?? null, setItem: (k, v) => map.set(k, v) })
    assert.match(store.getSnapshot().persistenceNotice, /reset/i)
    await api.orders.create(orderInput())
    assert.equal(map.get(STORAGE_KEY), raw)
    await api.demo.reset(true)
    assert.notEqual(map.get(STORAGE_KEY), raw)
  }
  const { store, api } = setup({ getItem: () => null, setItem: () => { throw new Error('quota') } })
  await api.orders.create(orderInput())
  assert.match(store.getSnapshot().persistenceNotice, /memori/i)
})

test('invalid prices/rates/time/device identities cannot corrupt the store', async () => {
  const { store, api } = setup()
  const before = store.getSnapshot()
  await assert.rejects(api.partners.updateOffer('demo-cisaat', 'regular-3h', { priceRp: -1 }), /INVALID/)
  await assert.rejects(api.partners.updateOffer('demo-cisaat', 'regular-3h', { commissionRatePercent: 101 }), /INVALID/)
  await assert.rejects(api.demo.advance(-1), /INVALID/)
  assert.equal(store.getSnapshot(), before)
  const { voucher } = await purchase(api)
  await assert.rejects(login(api, voucher, 'real-device'), /MOCK_DEVICE_REQUIRED/)
})

test('offline activation changes usage, never invents a retail sale, commission, or received stock payment', async () => {
  const { store, api } = setup()
  const voucher = store.getSnapshot().vouchers.find(v => v.batchId && v.partnerId === 'demo-cisaat')
  const before = selectSummary(store.getSnapshot(), 'demo-cisaat')
  await login(api, voucher)
  const after = selectSummary(store.getSnapshot(), 'demo-cisaat')
  assert.equal(after.unusedOfflineVouchers, before.unusedOfflineVouchers - 1)
  assert.equal(after.onlineDevices, before.onlineDevices + 1)
  assert.equal(after.paidOrders, before.paidOrders)
  assert.equal(after.onlineCommissionRp, before.onlineCommissionRp)
  assert.equal(after.stockPaymentsReceivedRp, null)
  assert.equal(after.offlineRealizedMarginRp, null)
  await api.partners.updateOffer('demo-cisaat', 'regular-3h', { priceRp: 8000 })
  assert.equal(selectSummary(store.getSnapshot(), 'demo-cisaat').offlinePotentialMarginRp, before.offlinePotentialMarginRp)
})

test('failed provisioning can recover while keeping the original payment and commission', async () => {
  const { store, api } = setup()
  const order = await api.orders.create(orderInput())
  await api.payments.settle(order.id, 'paid')
  await api.demo.configure({ provisioning: 'failed' })
  assert.equal(await api.vouchers.issue(order.id), null)
  assert.equal(store.getSnapshot().orders.find(o => o.id === order.id).provisioningStatus, 'failed')
  assert.equal(store.getSnapshot().payments.find(p => p.orderId === order.id).status, 'paid')
  const commission = structuredClone(store.getSnapshot().commissions.find(c => c.orderId === order.id))
  await api.demo.configure({ provisioning: 'issued' })
  const voucher = await api.vouchers.issue(order.id)
  await api.demo.configure({ provisioning: 'failed' })
  assert.equal((await api.vouchers.issue(order.id)).id, voucher.id)
  assert.equal(store.getSnapshot().orders.find(o => o.id === order.id).provisioningStatus, 'issued')
  assert.deepEqual(store.getSnapshot().commissions.find(c => c.orderId === order.id), commission)
})

test('all fifty partners participate in filtered service queries and aggregates, with isolated price changes', async () => {
  const { store, api } = setup()
  const partners = await api.partners.list()
  assert.equal(partners.length, 50)
  const old = selectSummary(store.getSnapshot())
  for (const partner of partners) {
    await api.partners.updateOffer(partner.id, 'regular-3h', { priceRp: 6000 })
    const order = await api.orders.create({ ...orderInput(), partnerId: partner.id })
    await api.payments.settle(order.id, 'paid')
    const rows = await api.orders.list(partner.id)
    assert.ok(rows.every(o => o.partnerId === partner.id))
    assert.equal(rows.find(o => o.id === order.id).amountRp, 6000)
  }
  assert.equal(selectSummary(store.getSnapshot()).onlineGrossRp, old.onlineGrossRp + 300000)
  assert.equal(selectSummary(store.getSnapshot()).onlineCommissionRp, old.onlineCommissionRp + 60000)
})

test('consumer snapshots cannot mutate state; rejected calls roll back without emitting a changed store', async () => {
  const { store, api } = setup()
  let changes = 0
  const unsubscribe = store.subscribe(() => changes++)
  const snapshot = store.getSnapshot()
  assert.throws(() => { snapshot.partners[0].name = 'changed' }, TypeError)
  const list = await api.partners.list()
  list[0].name = 'changed'
  assert.equal(store.getSnapshot().partners[0].name, 'Mitra Cisaat')
  await assert.rejects(api.orders.create({ ...orderInput(), customerWhatsapp: '08123456789' }), /INVALID/)
  assert.equal(changes, 0)
  assert.equal(store.getSnapshot(), snapshot)
  await api.orders.create(orderInput())
  assert.equal(changes, 1)
  unsubscribe()
})
