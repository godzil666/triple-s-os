import { createManagementService } from './management.ts'
import type { DemoState, Order } from '../domain/models.ts'
import type { DemoStore } from '../domain/store.ts'
import type { Services } from './contracts.ts'
import { expireSessions } from '../domain/store.ts'
import { defaultHotspotId, makeVoucher } from '../domain/fixtures.ts'
import { checkLowStock, upsertAlert } from '../domain/operations.ts'

function requireValue<T>(value: T | undefined, code = 'NOT_FOUND'): T { if (value === undefined) throw new Error(code); return value }
function invalid(condition: boolean) { if (condition) throw new Error('INVALID_INPUT') }
function id(state: DemoState, prefix: string) { return `${prefix}-${++state.sequence}` }
function audit(state: DemoState, action: string, entityId: string, detail = 'Simulasi lokal') {
  state.auditEvents.push({ id: id(state, 'audit'), at: state.clockNow, action, entityId, detail })
}
function getOrder(s: DemoState, orderId: string) { return requireValue(s.orders.find(o => o.id === orderId), 'ORDER_NOT_FOUND') }
function makeCommission(s: DemoState, order: Order) {
  if (s.commissions.some(c => c.orderId === order.id)) return
  const rate = order.rateSnapshot
  s.commissions.push({ id: id(s, 'commission'), orderId: order.id, partnerId: order.partnerId, ratePercent: rate.ratePercent, basisRp: rate.basisRp, amountRp: Math.round(rate.basisRp * rate.ratePercent / 100), basis: rate.basis, rounding: rate.rounding, createdAt: s.clockNow, assumptionLabel: rate.assumptionLabel })
}
function validateDevice(deviceId: string) { if (!/^device-demo-[\w-]{1,40}$/.test(deviceId)) throw new Error('MOCK_DEVICE_REQUIRED') }

/** All async contracts share one store. No network, browser identifiers, random callbacks or real providers. */
export function createMockServices(store: DemoStore, options: { orderToken?: () => string } = {}): Services {
  return {
    management: createManagementService(store),
    orders: {
      async list(partnerId) { return structuredClone(store.getSnapshot().orders.filter(o => !partnerId || o.partnerId === partnerId)) },
      async create(input) {
        return store.transact(s => {
          if (input.checkoutKey) {
            const previous = s.orders.find(o => o.checkoutKey === input.checkoutKey)
            if (previous) {
              if (previous.partnerId !== input.partnerId || previous.packageSnapshot.id !== input.packageId || previous.hotspotId !== (input.hotspotId ?? defaultHotspotId(previous.siteId)) || previous.customerName !== input.customerName.trim() || previous.customerWhatsapp !== input.customerWhatsapp || previous.channel !== input.channel) throw new Error('CHECKOUT_CONFLICT')
              return previous
            }
          }
          const partner = requireValue(s.partners.find(p => p.id === input.partnerId), 'PARTNER_NOT_FOUND')
          if (!partner.active) throw new Error('PARTNER_INACTIVE')
          const site = requireValue(s.sites.find(site => site.partnerId === partner.id), 'SITE_NOT_FOUND')
          const hotspotId = input.hotspotId ?? defaultHotspotId(site.id)
          const hotspot = requireValue(s.hotspots.find(h => h.id === hotspotId && h.siteId === site.id), 'HOTSPOT_NOT_FOUND')
          if (!hotspot.active) throw new Error('HOTSPOT_UNAVAILABLE')
          const pkg = requireValue(s.packages.find(p => p.id === input.packageId), 'PACKAGE_NOT_FOUND')
          const offer = requireValue(s.partnerPackages.find(p => p.partnerId === partner.id && p.packageId === pkg.id), 'PACKAGE_UNAVAILABLE')
          if (pkg.archived || !offer.available) throw new Error('PACKAGE_UNAVAILABLE')
          if (!s.inventoryPools.some(pool => pool.hotspotId === hotspotId && pool.packageId === pkg.id && pool.available > 0)) throw new Error('PACKAGE_UNAVAILABLE')
          invalid(!input.customerName.trim() || input.customerName.length > 80 || !/^(DEMO-WA-[\w-]{1,40}|\+628\d{8,11})$/.test(input.customerWhatsapp) || !['qris', 'ewallet'].includes(input.channel))
          const orderId = id(s, 'order')
          const order: Order = { id: orderId, token: `DEMO-${orderId}`, partnerId: partner.id, siteId: site.id, hotspotId, packageSnapshot: structuredClone(pkg), rateSnapshot: { ratePercent: offer.commissionRatePercent, basisRp: offer.priceRp, basis: 'gross-before-fees', rounding: 'nearest-rupiah', assumptionLabel: `Asumsi demo: ${offer.commissionRatePercent}% gross sebelum biaya, pembulatan rupiah terdekat.` }, customerName: input.customerName.trim(), customerWhatsapp: input.customerWhatsapp, amountRp: offer.priceRp, channel: input.channel, status: 'created', provisioningStatus: 'pending', createdAt: s.clockNow }
          s.orders.push(order)
          if (options.orderToken) order.token = options.orderToken()
          if (input.checkoutKey) order.checkoutKey = input.checkoutKey
          s.payments.push({ id: id(s, 'payment'), orderId, status: 'pending', paidAt: null, provider: 'mock', merchant: 'PT_SSS' })
          audit(s, 'order.created', orderId)
          return order
        })
      },
    },
    payments: {
      async settle(orderId, requestedStatus) {
        return store.transact(s => {
          const order = getOrder(s, orderId)
          const payment = requireValue(s.payments.find(p => p.orderId === orderId))
          const status = requestedStatus ?? s.scenarios.payment
          invalid(!['pending', 'paid', 'failed', 'expired'].includes(status))
          if (payment.status === 'paid') return payment
          // A later explicit success may reconcile mock failed/timeout; only paid is terminal.
          if (status === 'pending' && payment.status !== 'pending') return payment
          payment.status = status
          if (status === 'paid') {
            payment.paidAt = s.clockNow; order.status = 'confirmed'; makeCommission(s, order)
          }
          audit(s, `payment.${status}`, orderId)
          return payment
        })
      },
    },
    vouchers: {
      async list(partnerId) { return structuredClone(store.getSnapshot().vouchers.filter(v => !partnerId || v.partnerId === partnerId)) },
      async issue(orderId, requestedStatus) {
        return store.transact(s => {
          const order = getOrder(s, orderId)
          if (!s.payments.some(p => p.orderId === orderId && p.status === 'paid')) throw new Error('PAYMENT_NOT_PAID')
          const existing = s.vouchers.find(v => v.orderId === orderId)
          if (existing) return existing
          const status = requestedStatus ?? s.scenarios.provisioning
          invalid(!['pending', 'issued', 'failed'].includes(status))
          order.provisioningStatus = status
          audit(s, `provisioning.${order.provisioningStatus}`, orderId)
          if (order.provisioningStatus !== 'issued') return null
          const pool = requireValue(s.inventoryPools.find(pool => pool.hotspotId === order.hotspotId && pool.packageId === order.packageSnapshot.id), 'INVENTORY_NOT_FOUND')
          if (pool.available === 0) { order.provisioningStatus = 'failed'; checkLowStock(s,order.hotspotId,order.packageSnapshot.id); upsertAlert(s,{type:'allocation_failed',hotspotId:order.hotspotId,packageId:order.packageSnapshot.id,orderId,severity:'critical',message:`Penerbitan voucher pesanan ${orderId} gagal: stok habis.`}); audit(s, 'provisioning.out_of_stock', orderId); return null }
          pool.available--
          checkLowStock(s,order.hotspotId,order.packageSnapshot.id)
          const voucher = makeVoucher(id(s, 'voucher'), order.partnerId, order.siteId, order.packageSnapshot, orderId, null, order.hotspotId)
          s.vouchers.push(voucher)
          return voucher
        })
      },
      async login(input) {
        validateDevice(input.deviceId)
        return store.transact(s => {
          const voucher = requireValue(s.vouchers.find(v => v.id === input.voucherId), 'VOUCHER_NOT_FOUND')
          if (voucher.status === 'expired' || (voucher.expiresAt && Date.parse(voucher.expiresAt) <= Date.parse(s.clockNow))) throw new Error('VOUCHER_EXPIRED')
          if (voucher.siteId !== input.siteId) throw new Error('WRONG_SITE')
          const hotspotId = input.hotspotId ?? defaultHotspotId(input.siteId)
          if (voucher.hotspotId !== hotspotId) throw new Error('WRONG_HOTSPOT')
          const site = requireValue(s.sites.find(site => site.id === input.siteId), 'SITE_NOT_FOUND')
          const hotspot = requireValue(s.hotspots.find(h => h.id === hotspotId && h.siteId === site.id), 'HOTSPOT_NOT_FOUND')
          if (!hotspot.active) throw new Error('HOTSPOT_UNAVAILABLE')
          if (site.mockAvailability !== 'online') throw new Error('SITE_UNAVAILABLE')
          if (voucher.kind === 'regular' && voucher.deviceBinding && voucher.deviceBinding !== input.deviceId) throw new Error('DEVICE_BOUND')
          const sessions = s.sessions.filter(session => session.voucherId === voucher.id && session.endedAt === null)
          const existing = sessions.find(session => session.deviceId === input.deviceId)
          if (existing) { existing.lastSeenAt = s.clockNow; return existing }
          if (sessions.length >= voucher.maxConcurrentDevices) throw new Error('SESSION_LIMIT')
          if (voucher.firstActivatedAt === null) {
            voucher.firstActivatedAt = s.clockNow
            voucher.expiresAt = new Date(Date.parse(s.clockNow) + voucher.durationSeconds * 1000).toISOString()
            voucher.status = 'active'
            if (voucher.kind === 'regular') voucher.deviceBinding = input.deviceId
          }
          const session = { id: id(s, 'session'), voucherId: voucher.id, partnerId: voucher.partnerId, siteId: voucher.siteId, hotspotId, deviceId: input.deviceId, startedAt: s.clockNow, lastSeenAt: s.clockNow, endedAt: null, endReason: null }
          s.sessions.push(session)
          audit(s, 'voucher.login', voucher.id)
          return session
        })
      },
      async logout(sessionId) {
        store.transact(s => {
          const session = requireValue(s.sessions.find(session => session.id === sessionId), 'SESSION_NOT_FOUND')
          if (session.endedAt !== null) return
          session.endedAt = s.clockNow; session.endReason = 'logout'
          audit(s, 'voucher.logout', session.voucherId)
        })
      },
    },
    notifications: {
      async send(orderId, requestedStatus) {
        return store.transact(s => {
          getOrder(s, orderId)
          if (!s.vouchers.some(v => v.orderId === orderId)) throw new Error('VOUCHER_NOT_ISSUED')
          const status = requestedStatus ?? s.scenarios.notification
          invalid(!['sent', 'failed'].includes(status))
          const attempt = { id: id(s, 'notification'), orderId, status, attemptedAt: s.clockNow, provider: 'mock' as const, error: status === 'failed' ? 'Pengiriman mock gagal' : null }
          s.notifications.push(attempt); if(status==='failed')upsertAlert(s,{type:'delivery_failed',hotspotId:s.orders.find(o=>o.id===orderId)!.hotspotId,packageId:null,orderId,severity:'warning',message:`Notifikasi WhatsApp simulasi pesanan ${orderId} gagal; voucher tetap tersedia.`}); audit(s, `notification.${attempt.status}`, orderId)
          return attempt
        })
      },
    },
    monitoring: {
      async poll(siteId, fail = false) {
        return store.transact(s => {
          const site = requireValue(s.sites.find(site => site.id === siteId), 'SITE_NOT_FOUND')
          const old = s.monitoring.find(m => m.siteId === siteId)
          const snapshot = { siteId, status: fail ? 'unknown' as const : site.mockAvailability, observedAt: fail && old ? old.observedAt : s.clockNow, pollFailed: fail }
          s.monitoring = s.monitoring.filter(m => m.siteId !== siteId).concat(snapshot)
          audit(s, fail ? 'monitoring.failed' : 'monitoring.observed', siteId)
          return snapshot
        })
      },
      async setSite(siteId, status) {
        store.transact(s => {
          invalid(!['online', 'offline', 'unknown'].includes(status))
          requireValue(s.sites.find(site => site.id === siteId), 'SITE_NOT_FOUND').mockAvailability = status
          s.monitoring = s.monitoring.filter(m => m.siteId !== siteId).concat({ siteId, status, observedAt: s.clockNow, pollFailed: false })
          audit(s, `site.mock.${status}`, siteId)
        })
      },
    },
    partners: {
      async list() { return structuredClone(store.getSnapshot().partners) },
      async setActive(partnerId, active) { store.transact(s => { invalid(typeof active !== 'boolean'); requireValue(s.partners.find(p => p.id === partnerId)).active = active; audit(s, 'partner.availability', partnerId) }) },
      async updateOffer(partnerId, packageId, patch) {
        store.transact(s => {
          const offer = requireValue(s.partnerPackages.find(p => p.partnerId === partnerId && p.packageId === packageId))
          if (patch.priceRp !== undefined) { invalid(!Number.isSafeInteger(patch.priceRp) || patch.priceRp < 0 || patch.priceRp > 1_000_000_000); offer.priceRp = patch.priceRp }
          if (patch.commissionRatePercent !== undefined) { invalid(!Number.isFinite(patch.commissionRatePercent) || patch.commissionRatePercent < 0 || patch.commissionRatePercent > 100); offer.commissionRatePercent = patch.commissionRatePercent }
          if (patch.available !== undefined) { invalid(typeof patch.available !== 'boolean'); offer.available = patch.available }
          audit(s, 'offer.updated', `${partnerId}/${packageId}`)
        })
      },
      async updatePackage(packageId, patch) {
        store.transact(s => {
          const pkg = requireValue(s.packages.find(p => p.id === packageId))
          if (patch.durationSeconds !== undefined) { invalid(!Number.isSafeInteger(patch.durationSeconds) || patch.durationSeconds < 1 || patch.durationSeconds > 366 * 86400); pkg.durationSeconds = patch.durationSeconds }
          if (patch.archived !== undefined) { invalid(typeof patch.archived !== 'boolean'); pkg.archived = patch.archived }
          audit(s, 'package.updated', packageId)
        })
      },
    },
    commissions: { async list(partnerId) { return structuredClone(store.getSnapshot().commissions.filter(c => !partnerId || c.partnerId === partnerId)) } },
    demo: {
      async advance(milliseconds) {
        invalid(!Number.isSafeInteger(milliseconds) || milliseconds <= 0 || milliseconds > 366 * 86400_000)
        store.transact(s => { const next = Date.parse(s.clockNow) + milliseconds; invalid(!Number.isFinite(next) || next > Date.parse('2100-01-01T00:00:00.000Z')); s.clockNow = new Date(next).toISOString(); expireSessions(s); audit(s, 'clock.advanced', 'demo', `${milliseconds} ms; clock manual`) })
      },
      async setContext(patch) {
        store.transact(s => {
          if (patch.partnerId !== undefined) { requireValue(s.partners.find(p => p.id === patch.partnerId)); s.context.partnerId = patch.partnerId }
          if (patch.siteId !== undefined) { requireValue(s.sites.find(site => site.id === patch.siteId)); s.context.siteId = patch.siteId }
          if (patch.deviceId !== undefined) { validateDevice(patch.deviceId); s.context.deviceId = patch.deviceId }
        })
      },
      async configure(patch) {
        store.transact(s => {
          if (patch.payment !== undefined) { invalid(!['pending', 'paid', 'failed', 'expired'].includes(patch.payment)); s.scenarios.payment = patch.payment }
          if (patch.provisioning !== undefined) { invalid(!['pending', 'issued', 'failed'].includes(patch.provisioning)); s.scenarios.provisioning = patch.provisioning }
          if (patch.notification !== undefined) { invalid(!['sent', 'failed'].includes(patch.notification)); s.scenarios.notification = patch.notification }
        })
      },
      async reset(confirmed) { store.reset(confirmed) },
    },
  }
}

