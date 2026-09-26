import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createFixture } from '../../src/domain/fixtures.ts'
import { createDemoStore, SCHEMA_VERSION, STORAGE_KEY } from '../../src/domain/store.ts'
import { createMockServices } from '../../src/services/mock.ts'

const input = hotspotId => ({ partnerId: 'demo-cisaat', hotspotId, packageId: 'regular-3h', customerName: 'Pelanggan Sintetis', customerWhatsapp: 'DEMO-WA-001', channel: 'qris' })
const checksum = text => { let hash = 2166136261; for (let i = 0; i < text.length; i++) hash = Math.imul(hash ^ text.charCodeAt(i), 16777619); return (hash >>> 0).toString(16) }

test('one provider and location can contain two distinct Cisaat hotspots', () => {
  const state = createFixture()
  const provider = state.providers.find(p => p.partnerId === 'demo-cisaat')
  assert.ok(provider)
  const location = state.sites.find(s => s.providerId === provider.id)
  assert.ok(location)
  const hotspots = state.hotspots.filter(h => h.siteId === location.id)
  assert.equal(hotspots.length, 2)
  assert.notEqual(hotspots[0].ssid, hotspots[1].ssid)
  assert.equal(state.providers.filter(p => p.partnerId === 'demo-cisaat').length, 1)
})

test('an issued voucher is bound to the purchased hotspot, and inventory is consumed once', async () => {
  const store = createDemoStore(), services = createMockServices(store)
  const hotspotId = store.getSnapshot().hotspots.find(h => h.siteId === 'site-demo-cisaat').id
  const otherHotspotId = store.getSnapshot().hotspots.find(h => h.siteId === 'site-demo-cisaat' && h.id !== hotspotId).id
  const before = store.getSnapshot().inventoryPools.find(p => p.hotspotId === hotspotId && p.packageId === 'regular-3h').available
  const order = await services.orders.create(input(hotspotId))
  await services.payments.settle(order.id, 'paid')
  const voucher = await services.vouchers.issue(order.id, 'issued')
  assert.equal(order.hotspotId, hotspotId)
  assert.equal(voucher.hotspotId, hotspotId)
  assert.equal(store.getSnapshot().payments.find(p => p.orderId === order.id).merchant, 'PT_SSS')
  assert.equal(store.getSnapshot().inventoryPools.find(p => p.hotspotId === hotspotId && p.packageId === 'regular-3h').available, before - 1)
  assert.equal((await services.vouchers.issue(order.id, 'issued')).id, voucher.id)
  assert.equal(store.getSnapshot().inventoryPools.find(p => p.hotspotId === hotspotId && p.packageId === 'regular-3h').available, before - 1)
  await assert.rejects(() => services.vouchers.login({ voucherId: voucher.id, siteId: order.siteId, hotspotId: otherHotspotId, deviceId: 'device-demo-1' }), /WRONG_HOTSPOT/)
  assert.equal(store.getSnapshot().vouchers.find(v => v.id === voucher.id).firstActivatedAt, null)
  await services.vouchers.login({ voucherId: voucher.id, siteId: order.siteId, hotspotId, deviceId: 'device-demo-1' })
  const expiry = store.getSnapshot().vouchers.find(v => v.id === voucher.id).expiresAt
  await services.vouchers.login({ voucherId: voucher.id, siteId: order.siteId, hotspotId, deviceId: 'device-demo-1' })
  assert.equal(store.getSnapshot().vouchers.find(v => v.id === voucher.id).expiresAt, expiry)
})

test('version-one local demo state migrates without losing existing voucher activation', () => {
  assert.equal(SCHEMA_VERSION, 2)
  const legacy = createFixture()
  for (const key of ['providers', 'hotspots', 'inventoryPools', 'telemetry', 'alerts', 'incidents']) delete legacy[key]
  for (const site of legacy.sites) delete site.providerId
  for (const order of legacy.orders) delete order.hotspotId
  for (const payment of legacy.payments) delete payment.merchant
  for (const voucher of legacy.vouchers) delete voucher.hotspotId
  for (const batch of legacy.offlineBatches) delete batch.hotspotId
  for (const session of legacy.sessions) delete session.hotspotId
  const original = legacy.vouchers.find(v => v.id === 'seed-voucher-7')
  const raw = JSON.stringify({ version: 1, checksum: checksum(JSON.stringify(legacy)), data: legacy })
  const saved = new Map([[STORAGE_KEY, raw]])
  const store = createDemoStore({ getItem: key => saved.get(key) ?? null, setItem: (key, value) => saved.set(key, value) }, { strictPersistence: true })
  const migrated = store.getSnapshot()
  assert.equal(migrated.persistenceNotice, null)
  assert.equal(migrated.vouchers.find(v => v.id === original.id).expiresAt, original.expiresAt)
  assert.equal(migrated.vouchers.find(v => v.id === original.id).firstActivatedAt, original.firstActivatedAt)
  assert.equal(migrated.vouchers.find(v => v.id === original.id).hotspotId, `hotspot-${original.siteId}`)
  assert.equal(migrated.hotspots.some(h => h.id === `hotspot-${original.siteId}`), true)
})
