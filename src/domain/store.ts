import type { DemoState } from './models.ts'
import { createFixture, defaultHotspotId } from './fixtures.ts'

export const STORAGE_KEY = 'triple-s-os:synthetic-demo'
export const SCHEMA_VERSION = 2
export interface StorageAdapter { getItem(key: string): string | null; setItem(key: string, value: string): void }
export interface DemoStore { getSnapshot(): DemoState; subscribe(listener: () => void): () => void; transact<T>(change: (draft: DemoState) => T): T; reset(confirmed: boolean): void }

function freeze<T>(value: T): T {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value) }
  return value
}

// Corruption detection only, not a signature or protection against deliberate editing.
function checksum(text: string): string {
  let hash = 2166136261
  for (let i = 0; i < text.length; i++) hash = Math.imul(hash ^ text.charCodeAt(i), 16777619)
  return (hash >>> 0).toString(16)
}

/** Upgrade only the local V1 demo envelope; preserve its orders, credentials and timer fields. */
function migrateV1(value: unknown): DemoState {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Incompatible storage')
  const state = structuredClone(value) as DemoState
  if (!Array.isArray(state.partners) || !Array.isArray(state.sites) || !Array.isArray(state.packages) || !Array.isArray(state.vouchers)) throw new Error('Incompatible storage')
  state.providers = state.partners.map(partner => ({ id: `provider-${partner.id}`, partnerId: partner.id, name: `Provider ${partner.name}`, fictional: true }))
  state.sites = state.sites.map(site => ({ ...site, providerId: `provider-${site.partnerId}` }))
  state.hotspots = state.sites.map(site => ({ id: defaultHotspotId(site.id), siteId: site.id, name: `Hotspot ${state.partners.find(partner => partner.id === site.partnerId)?.name ?? site.id}`, ssid: site.ssid, active: true }))
  const cisaat = state.sites.find(site => site.partnerId === 'demo-cisaat')
  if (cisaat) state.hotspots.push({ id: `${defaultHotspotId(cisaat.id)}-2`, siteId: cisaat.id, name: 'Hotspot Cisaat 2', ssid: 'SSS-DEMO-CISAAT-2', active: true })
  for (const order of state.orders) order.hotspotId = defaultHotspotId(order.siteId)
  for (const payment of state.payments) payment.merchant = 'PT_SSS'
  for (const voucher of state.vouchers) voucher.hotspotId = defaultHotspotId(voucher.siteId)
  for (const batch of state.offlineBatches) batch.hotspotId = defaultHotspotId(batch.siteId)
  for (const session of state.sessions) session.hotspotId = defaultHotspotId(session.siteId)
  state.inventoryPools = state.hotspots.flatMap(hotspot => state.packages.map(pkg => ({ id: `pool-${hotspot.id}-${pkg.id}`, hotspotId: hotspot.id, packageId: pkg.id, available: hotspot.id === defaultHotspotId(cisaat?.id ?? '') && pkg.id === 'regular-3h' ? 8 : 20, lowThreshold: 10 })))
  for (const voucher of state.vouchers.filter(v => v.orderId)) {
    const order = state.orders.find(item => item.id === voucher.orderId)
    const pool = state.inventoryPools.find(item => item.hotspotId === voucher.hotspotId && item.packageId === order?.packageSnapshot.id)
    if (pool) pool.available = Math.max(0, pool.available - 1)
  }
  state.telemetry = state.hotspots.map(hotspot => {
    const monitor = state.monitoring.find(item => item.siteId === hotspot.siteId)
    const secondary = hotspot.id.endsWith('-cisaat-2')
    return { hotspotId: hotspot.id, status: secondary ? 'degraded' : monitor?.status ?? 'unknown', users: secondary ? 3 : 2, latencyMs: secondary ? 145 : 24, usage: { gaming: 4, social: 3, streaming: 2, other: 1 }, observedAt: monitor?.observedAt ?? state.clockNow, pollFailed: monitor?.pollFailed ?? false, source: 'demo' } as DemoState['telemetry'][number]
  })
  const lowPool = cisaat && state.inventoryPools.find(pool => pool.hotspotId === defaultHotspotId(cisaat.id) && pool.packageId === 'regular-3h')
  state.alerts = lowPool && lowPool.available < lowPool.lowThreshold ? [{ id: 'seed-alert-low-stock-cisaat', type: 'low_stock', hotspotId: lowPool.hotspotId, packageId: lowPool.packageId, orderId: null, severity: 'warning', status: 'open', createdAt: state.clockNow, updatedAt: state.clockNow, message: 'Stok contoh Reguler 3 jam di Hotspot Cisaat di bawah ambang 10.' }] : []
  state.incidents = []
  return state
}

function sameShape(value: unknown, sample: unknown): boolean {
  if (sample === null) return value === null || typeof value === 'string' || (typeof value === 'number' && Number.isFinite(value))
  if (Array.isArray(sample)) return Array.isArray(value) && value.length < 100_000 && (sample.length === 0 || value.every(v => sameShape(v, sample[0])))
  if (typeof sample === 'object') return !!value && typeof value === 'object' && !Array.isArray(value) && Object.entries(sample as object).every(([key, child]) => sameShape((value as Record<string, unknown>)[key], child))
  return typeof value === typeof sample && (typeof value !== 'number' || Number.isFinite(value))
}

function validState(value: unknown): value is DemoState {
  const shape = createFixture()
  shape.notifications[0].error = null
  shape.vouchers[0].batchId = null
  shape.alerts[0].packageId = null
  shape.telemetry[0].latencyMs = null
  if (!sameShape(value, shape)) return false
  const s = value as DemoState
  const idsUnique = (items: { id: string }[]) => new Set(items.map(i => i.id)).size === items.length
  const exists = (items: { id: string }[], id: string) => items.some(i => i.id === id)
  const iso = (date: string | null) => date === null || (Number.isFinite(Date.parse(date)) && new Date(date).toISOString() === date)
  const uint = (n: number) => Number.isSafeInteger(n) && n >= 0
  const siteMatches = (item: { partnerId: string; siteId: string }) => s.sites.some(site => site.id === item.siteId && site.partnerId === item.partnerId)
  if (!s.synthetic || !iso(s.clockNow) || !uint(s.sequence) || !uint(s.revision)) return false
  if (![s.partners, s.providers, s.sites, s.hotspots, s.packages, s.inventoryPools, s.alerts, s.incidents, s.orders, s.payments, s.vouchers, s.offlineBatches, s.sessions, s.commissions, s.notifications, s.auditEvents].every(idsUnique)) return false
  if (s.partners.length < 1 || s.partners.length > 10000 || !s.partners.every(p => p.fictional)) return false
  if (new Set(s.providers.map(p => p.partnerId)).size !== s.providers.length || !s.providers.every(p => p.fictional && exists(s.partners, p.partnerId))) return false
  if (new Set(s.sites.map(site => site.providerId)).size !== s.sites.length || !s.sites.every(site => s.providers.some(p => p.id === site.providerId && p.partnerId === site.partnerId) && ['online', 'offline', 'unknown'].includes(site.mockAvailability))) return false
  if (!s.hotspots.every(h => s.sites.some(site => site.id === h.siteId) && typeof h.active === 'boolean' && typeof h.ssid === 'string' && h.ssid.length > 1)) return false
  if (!exists(s.partners, s.context.partnerId) || !exists(s.sites, s.context.siteId) || !/^device-demo-[\w-]+$/.test(s.context.deviceId)) return false
  if (!s.packages.every(p => ['regular', 'monthly'].includes(p.kind) && uint(p.durationSeconds) && p.durationSeconds > 0 && [1, 2, 4].includes(p.maxConcurrentDevices))) return false
  if (!s.partnerPackages.every(p => exists(s.partners, p.partnerId) && exists(s.packages, p.packageId) && uint(p.priceRp) && p.commissionRatePercent >= 0 && p.commissionRatePercent <= 100)) return false
  const hotspotMatches = (item: { siteId: string; hotspotId: string }) => s.hotspots.some(h => h.id === item.hotspotId && h.siteId === item.siteId)
  if (!s.orders.every(o => siteMatches(o) && hotspotMatches(o) && uint(o.amountRp) && o.amountRp === o.rateSnapshot.basisRp && ['pending', 'issued', 'failed'].includes(o.provisioningStatus) && iso(o.createdAt))) return false
  if (new Set(s.payments.map(p => p.orderId)).size !== s.payments.length || !s.payments.every(p => exists(s.orders, p.orderId) && p.merchant === 'PT_SSS' && ['pending', 'paid', 'failed', 'expired'].includes(p.status) && iso(p.paidAt))) return false
  if (!s.orders.every(o => s.payments.some(p => p.orderId === o.id))) return false
  if (new Set(s.commissions.map(c => c.orderId)).size !== s.commissions.length || !s.commissions.every(c => {
    const o = s.orders.find(o => o.id === c.orderId)
    return o && c.partnerId === o.partnerId && c.basisRp === o.amountRp && c.ratePercent === o.rateSnapshot.ratePercent && c.amountRp === Math.round(c.basisRp * c.ratePercent / 100) && s.payments.some(p => p.orderId === o.id && p.status === 'paid')
  })) return false
  if (!s.payments.filter(p => p.status === 'paid').every(p => s.commissions.some(c => c.orderId === p.orderId))) return false
  if (!s.offlineBatches.every(b => siteMatches(b) && hotspotMatches(b) && uint(b.quantity) && uint(b.wholesaleUnitRp) && uint(b.exampleRetailUnitRp))) return false
  if (new Set(s.vouchers.map(v=>v.code)).size !== s.vouchers.length) return false
  if (!s.vouchers.every(v => v.credential === undefined || (v.credential.type === 'single_code' && typeof v.credential.code === 'string' && v.credential.code.length > 0 && v.credential.code.length <= 160) || (v.credential.type === 'username_password' && typeof v.credential.username === 'string' && v.credential.username.length > 0 && v.credential.username.length <= 120 && typeof v.credential.password === 'string' && v.credential.password.length > 0 && v.credential.password.length <= 160))) return false
  const credentialIdentity=(v:DemoState['vouchers'][number])=>`${v.siteId}:${v.credential?.type==='username_password'?`username:${v.credential.username.toLocaleLowerCase('en-US')}`:`code:${v.credential?.type==='single_code'?v.credential.code:v.code}`}`
  if (new Set(s.vouchers.map(credentialIdentity)).size !== s.vouchers.length) return false
  if (!s.vouchers.every(v => siteMatches(v) && hotspotMatches(v) && (v.orderId === null) !== (v.batchId === null) && ['unused', 'active', 'expired'].includes(v.status) && iso(v.firstActivatedAt) && iso(v.expiresAt)
    && (v.status === 'unused' ? v.firstActivatedAt === null && v.expiresAt === null : v.firstActivatedAt !== null && v.expiresAt !== null && Date.parse(v.expiresAt) === Date.parse(v.firstActivatedAt) + v.durationSeconds * 1000)
    && (v.orderId ? s.orders.some(o => o.id === v.orderId && o.siteId === v.siteId && o.hotspotId === v.hotspotId && o.provisioningStatus === 'issued') && s.payments.some(p => p.orderId === v.orderId && p.status === 'paid') : s.offlineBatches.some(b => b.id === v.batchId && b.hotspotId === v.hotspotId)))) return false
  const issued = s.vouchers.filter(v => v.orderId !== null)
  if (new Set(issued.map(v => v.orderId)).size !== issued.length) return false
  if (!s.sessions.every(session => siteMatches(session) && hotspotMatches(session) && s.vouchers.some(v => v.id === session.voucherId && v.siteId === session.siteId && v.hotspotId === session.hotspotId) && iso(session.startedAt) && iso(session.lastSeenAt) && iso(session.endedAt))) return false
  if (!s.monitoring.every(m => exists(s.sites, m.siteId) && iso(m.observedAt) && ['online', 'offline', 'unknown'].includes(m.status))) return false
  if (new Set(s.inventoryPools.map(pool => `${pool.hotspotId}/${pool.packageId}`)).size !== s.inventoryPools.length || !s.inventoryPools.every(pool => exists(s.hotspots, pool.hotspotId) && exists(s.packages, pool.packageId) && uint(pool.available) && uint(pool.lowThreshold))) return false
  if (new Set(s.telemetry.map(t => t.hotspotId)).size !== s.telemetry.length || !s.telemetry.every(t => exists(s.hotspots, t.hotspotId) && ['online', 'degraded', 'offline', 'unknown'].includes(t.status) && uint(t.users) && (t.latencyMs === null || uint(t.latencyMs)) && Object.values(t.usage).every(uint) && iso(t.observedAt) && t.source === 'demo')) return false
  if (!s.alerts.every(a => exists(s.hotspots, a.hotspotId) && (!a.orderId || exists(s.orders, a.orderId)) && (!a.packageId || exists(s.packages, a.packageId)) && ['open', 'acknowledged', 'resolved'].includes(a.status) && iso(a.createdAt) && iso(a.updatedAt))) return false
  if (!s.incidents.every(i => s.alerts.some(a => a.id === i.alertId && a.hotspotId === i.hotspotId) && ['open', 'acknowledged', 'investigating', 'resolved'].includes(i.status) && iso(i.createdAt) && iso(i.updatedAt) && i.timeline.every(t => iso(t.at)))) return false
  return true
}

export function expireSessions(state: DemoState) {
  for (const voucher of state.vouchers) {
    if (voucher.expiresAt && Date.parse(voucher.expiresAt) <= Date.parse(state.clockNow)) {
      voucher.status = 'expired'
      for (const session of state.sessions.filter(s => s.voucherId === voucher.id && s.endedAt === null)) {
        session.endedAt = voucher.expiresAt; session.endReason = 'expired'
      }
    }
  }
}

export function createDemoStore(storage?: StorageAdapter, options: { strictPersistence?: boolean; prepareFreshState?: (state: DemoState) => void } = {}): DemoStore {
  const freshState=()=>{const fresh=createFixture();options.prepareFreshState?.(fresh);return fresh}
  let state = freshState()
  let preserveUnreadable = false
  const listeners = new Set<() => void>()
  if (storage) {
    try {
      const raw = storage.getItem(STORAGE_KEY)
      if (raw !== null) {
        const envelope = JSON.parse(raw)
        if (![1, SCHEMA_VERSION].includes(envelope.version) || envelope.checksum !== checksum(JSON.stringify(envelope.data))) throw new Error('Incompatible storage')
        const candidate = envelope.version === 1 ? migrateV1(envelope.data) : envelope.data
        if (!validState(candidate)) throw new Error('Incompatible storage')
        state = candidate
        state.persistenceNotice = null
        expireSessions(state)
      }
    } catch {
      preserveUnreadable = true
      state.persistenceNotice = 'Data lokal tidak terbaca atau versi berbeda. Simulasi memakai memori; data lama dipertahankan sampai reset dikonfirmasi.'
    }
  } else state.persistenceNotice = 'Mode memori: persistensi lokal tidak tersedia.'
  state = freeze(state)

  function publish(next: DemoState) {
    if (storage && !preserveUnreadable) {
      try {
        next.persistenceNotice = null
        storage.setItem(STORAGE_KEY, JSON.stringify({ version: SCHEMA_VERSION, checksum: checksum(JSON.stringify(next)), data: next }))
      } catch {
        if(options.strictPersistence)throw new Error('PERSISTENCE_UNAVAILABLE')
        next.persistenceNotice = 'Penyimpanan lokal gagal. Perubahan hanya tersimpan di memori sampai penyimpanan berhasil.'
      }
    }
    state = freeze(next)
    listeners.forEach(listener => listener())
  }
  return {
    getSnapshot: () => state,
    subscribe: listener => { listeners.add(listener); return () => { listeners.delete(listener) } },
    transact: change => {
      const next = structuredClone(state)
      const result = change(next) // Synchronous atomic commit before any async service resolves.
      next.revision++
      publish(next)
      return result === undefined ? result : structuredClone(result)
    },
    reset: confirmed => {
      if (confirmed !== true) throw new Error('CONFIRMATION_REQUIRED')
      preserveUnreadable = false
      publish(freshState()) // Prepare inventory before the single persistent commit.
    },
  }
}

