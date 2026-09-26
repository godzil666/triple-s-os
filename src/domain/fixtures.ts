import type { DemoState, Package, Voucher } from './models.ts'
import { DEMO_CONFIG } from './config.ts'

export const defaultHotspotId = (siteId: string) => `hotspot-${siteId}`

/** Stable synthetic fixture. No random IDs, wall-clock timestamps, real contacts or router data. */
export function createFixture(): DemoState {
  const areas = ['Cisaat', 'Cibadak', 'Sukaraja', 'Cicurug', 'Parungkuda', 'Caringin']
  const initials = ['CS', 'CB', 'SK', 'CC', 'PK', 'CR']
  const partners = Array.from({ length: 50 }, (_, i) => ({
    id: i < 6 ? `demo-${areas[i].toLowerCase()}` : `demo-mitra-${String(i + 1).padStart(2, '0')}`,
    name: i < 6 ? `Mitra ${areas[i]}` : `Mitra Demo ${String(i + 1).padStart(2, '0')}`,
    area: areas[i % areas.length], note: `Sekitar pusat Kecamatan ${areas[i % areas.length]}`,
    initials: initials[i % initials.length], active: true, fictional: true as const,
  }))
  const providers = partners.map(p => ({ id: `provider-${p.id}`, partnerId: p.id, name: `Provider ${p.name}`, fictional: true as const }))
  const sites = partners.map(p => ({ id: `site-${p.id}`, partnerId: p.id, providerId: `provider-${p.id}`, ssid: `SSS-${p.id.toUpperCase()}`, mockAvailability: 'online' as const }))
  const hotspots = sites.map(site => ({ id: defaultHotspotId(site.id), siteId: site.id, name: `Hotspot ${partners.find(p => p.id === site.partnerId)!.name}`, ssid: site.ssid, active: true }))
  hotspots.push({ id: `${defaultHotspotId(sites[0].id)}-2`, siteId: sites[0].id, name: 'Hotspot Cisaat 2', ssid: 'SSS-DEMO-CISAAT-2', active: true })
  const packages: Package[] = [
    ['regular-3h', 'Reguler 3 jam', 'regular', 10800, 1],
    ['regular-5h', 'Reguler 5 jam', 'regular', 18000, 1],
    ['regular-day', 'Reguler 1 hari', 'regular', 86400, 1],
    ['monthly-2', 'Bulanan 2 perangkat', 'monthly', 2592000, 2],
    ['monthly-4', 'Bulanan 4 perangkat', 'monthly', 2592000, 4],
  ].map(([id, name, kind, durationSeconds, maxConcurrentDevices]) => ({ id: id as string, name: name as string, kind: kind as Package['kind'], durationSeconds: durationSeconds as number, maxConcurrentDevices: maxConcurrentDevices as number, speedMbps: 10, archived: false, assumptionLabel: DEMO_CONFIG.packageAssumption }))
  const prices = DEMO_CONFIG.examplePricesRp
  const state: DemoState = {
    synthetic: true, sequence: 1000, revision: 0, clockNow: DEMO_CONFIG.initialTime, persistenceNotice: null,
    context: { partnerId: partners[0].id, siteId: sites[0].id, deviceId: 'device-demo-1' },
    scenarios: { payment: 'paid', provisioning: 'issued', notification: 'sent' },
    partners, providers, sites, hotspots, packages,
    partnerPackages: partners.flatMap(p => packages.map((pkg, i) => ({ partnerId: p.id, packageId: pkg.id, priceRp: prices[i], commissionRatePercent: DEMO_CONFIG.commissionRatePercent, available: true }))),
    inventoryPools: hotspots.flatMap(hotspot => packages.map(pkg => ({ id: `pool-${hotspot.id}-${pkg.id}`, hotspotId: hotspot.id, packageId: pkg.id, available: hotspot.id === defaultHotspotId(sites[0].id) && pkg.id === 'regular-3h' ? 8 : 20, lowThreshold: 10 }))),
    telemetry: hotspots.map(hotspot => ({ hotspotId: hotspot.id, status: hotspot.id.endsWith('-2') ? 'degraded' as const : 'online' as const, users: hotspot.id.endsWith('-2') ? 3 : 2, latencyMs: hotspot.id.endsWith('-2') ? 145 : 24, usage: { gaming: 4, social: 3, streaming: 2, other: 1 }, observedAt: DEMO_CONFIG.initialTime, pollFailed: false, source: 'demo' as const })),
    alerts: [], incidents: [],
    orders: [], payments: [], vouchers: [], offlineBatches: [], sessions: [], commissions: [], notifications: [], auditEvents: [],
    monitoring: sites.map(site => ({ siteId: site.id, status: 'online', observedAt: DEMO_CONFIG.initialTime, pollFailed: false })),
  }
  // Allocation has no retail-sale ledger, no realized margin and no fabricated stock payment.
  for (const [i, partner] of partners.slice(0, 6).entries()) {
    const batchId = `seed-batch-${i + 1}`
    const siteId = `site-${partner.id}`
    state.offlineBatches.push({ id: batchId, partnerId: partner.id, siteId, hotspotId: defaultHotspotId(siteId), packageSnapshot: { ...packages[0] }, quantity: 5, wholesaleUnitRp: DEMO_CONFIG.offlineWholesaleUnitRp, exampleRetailUnitRp: prices[0], codeSource: 'generated-demo', stockPaymentReference: null, allocatedAt: state.clockNow, assumptionLabel: DEMO_CONFIG.offlineAssumption })
    for (let n = 1; n <= 5; n++) state.vouchers.push(makeVoucher(`seed-offline-${i + 1}-${n}`, partner.id, siteId, packages[0], null, batchId))
  }
  const usernamePasswordVoucher=state.vouchers.find(v=>v.id==='seed-offline-1-5')!
  usernamePasswordVoucher.credential={type:'username_password',username:'offline-demo-user',password:'offline-demo-pass'}
  // Representative lifecycle states, all internally reconciled with payment and commission.
  const statuses = ['pending', 'failed', 'expired', 'paid', 'paid', 'paid', 'paid', 'paid'] as const
  statuses.forEach((status, i) => {
    const partner = partners[i]
    const siteId = `site-${partner.id}`
    const pkg = packages[i === 7 ? 3 : 0]
    const amountRp = i === 7 ? 150000 : 5000
    const id = `seed-order-${i + 1}`
    const provisioningStatus = i === 3 ? 'pending' : i === 4 ? 'failed' : status === 'paid' ? 'issued' : 'pending'
    state.orders.push({ id, token: `DEMO-${id}`, partnerId: partner.id, siteId, hotspotId: defaultHotspotId(siteId), packageSnapshot: { ...pkg }, rateSnapshot: { ratePercent: 20, basisRp: amountRp, basis: 'gross-before-fees', rounding: 'nearest-rupiah', assumptionLabel: DEMO_CONFIG.rateAssumption }, customerName: `Pelanggan Sintetis ${i + 1}`, customerWhatsapp: `DEMO-WA-${String(i + 1).padStart(3, '0')}`, amountRp, channel: 'qris', status: status === 'paid' ? 'confirmed' : 'created', provisioningStatus, createdAt: state.clockNow })
    state.payments.push({ id: `seed-payment-${i + 1}`, orderId: id, status, paidAt: status === 'paid' ? state.clockNow : null, provider: 'mock', merchant: 'PT_SSS' })
    if (status === 'paid') state.commissions.push({ id: `seed-commission-${i + 1}`, orderId: id, partnerId: partner.id, ratePercent: 20, basisRp: amountRp, amountRp: i === 7 ? 30000 : 1000, basis: 'gross-before-fees', rounding: 'nearest-rupiah', createdAt: state.clockNow, assumptionLabel: DEMO_CONFIG.rateAssumption })
    if (provisioningStatus === 'issued') {
      const v = makeVoucher(`seed-voucher-${i + 1}`, partner.id, siteId, pkg, id, null)
      state.vouchers.push(v)
      state.inventoryPools.find(pool => pool.hotspotId === v.hotspotId && pool.packageId === pkg.id)!.available--
      state.notifications.push({ id: `seed-notification-${i + 1}`, orderId: id, status: i === 5 ? 'failed' : 'sent', attemptedAt: state.clockNow, provider: 'mock', error: i === 5 ? 'Pengiriman mock gagal' : null })
      if (i >= 6) {
        v.status = 'active'; v.firstActivatedAt = state.clockNow
        v.expiresAt = new Date(Date.parse(state.clockNow) + pkg.durationSeconds * 1000).toISOString()
        v.deviceBinding = pkg.kind === 'regular' ? 'device-demo-1' : null
        for (let d = 1; d <= (i === 7 ? 2 : 1); d++) state.sessions.push({ id: `seed-session-${i + 1}-${d}`, voucherId: v.id, partnerId: partner.id, siteId, hotspotId: v.hotspotId, deviceId: `device-demo-${d}`, startedAt: state.clockNow, lastSeenAt: state.clockNow, endedAt: null, endReason: null })
      }
    }
  })
  state.sites[48].mockAvailability = 'offline'; state.monitoring[48].status = 'offline'
  state.sites[49].mockAvailability = 'unknown'; state.monitoring[49].status = 'unknown'
  state.telemetry.find(t => t.hotspotId === defaultHotspotId(state.sites[48].id))!.status = 'offline'
  state.telemetry.find(t => t.hotspotId === defaultHotspotId(state.sites[49].id))!.status = 'unknown'
  state.alerts.push({ id: 'seed-alert-low-stock-cisaat', type: 'low_stock', hotspotId: defaultHotspotId(sites[0].id), packageId: packages[0].id, orderId: null, severity: 'warning', status: 'open', createdAt: state.clockNow, updatedAt: state.clockNow, message: 'Stok contoh Reguler 3 jam di Hotspot Cisaat di bawah ambang 10.' })
  state.alerts.push({ id: 'seed-alert-degraded-cisaat-2', type: 'hotspot_degraded', hotspotId: hotspots.at(-1)!.id, packageId: null, orderId: null, severity: 'warning', status: 'open', createdAt: state.clockNow, updatedAt: state.clockNow, message: 'Telemetri demo Hotspot Cisaat 2 menunjukkan jaringan menurun.' })
  state.auditEvents.push({ id: 'seed-audit-1', at: state.clockNow, action: 'fixture.created', entityId: 'demo', detail: '50 mitra fiktif; seluruh data sintetis.' })
  return state
}

export function makeVoucher(id: string, partnerId: string, siteId: string, pkg: Package, orderId: string | null, batchId: string | null, hotspotId = defaultHotspotId(siteId)): Voucher {
  return { id, code: `DEMO-${id.toUpperCase()}`, partnerId, siteId, hotspotId, orderId, batchId, kind: pkg.kind, durationSeconds: pkg.durationSeconds, maxConcurrentDevices: pkg.maxConcurrentDevices, status: 'unused', firstActivatedAt: null, expiresAt: null, deviceBinding: null }
}
