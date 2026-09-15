import type { DemoState } from './models.ts'
import { createFixture } from './fixtures.ts'

export const STORAGE_KEY = 'triple-s-os:synthetic-demo'
export const SCHEMA_VERSION = 1
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

function sameShape(value: unknown, sample: unknown): boolean {
  if (sample === null) return value === null || typeof value === 'string'
  if (Array.isArray(sample)) return Array.isArray(value) && value.length < 100_000 && value.every(v => sameShape(v, sample[0]))
  if (typeof sample === 'object') return !!value && typeof value === 'object' && !Array.isArray(value) && Object.entries(sample as object).every(([key, child]) => sameShape((value as Record<string, unknown>)[key], child))
  return typeof value === typeof sample && (typeof value !== 'number' || Number.isFinite(value))
}

function validState(value: unknown): value is DemoState {
  const shape = createFixture()
  shape.notifications[0].error = null
  shape.vouchers[0].batchId = null
  if (!sameShape(value, shape)) return false
  const s = value as DemoState
  const idsUnique = (items: { id: string }[]) => new Set(items.map(i => i.id)).size === items.length
  const exists = (items: { id: string }[], id: string) => items.some(i => i.id === id)
  const iso = (date: string | null) => date === null || (Number.isFinite(Date.parse(date)) && new Date(date).toISOString() === date)
  const uint = (n: number) => Number.isSafeInteger(n) && n >= 0
  const siteMatches = (item: { partnerId: string; siteId: string }) => s.sites.some(site => site.id === item.siteId && site.partnerId === item.partnerId)
  if (!s.synthetic || !iso(s.clockNow) || !uint(s.sequence) || !uint(s.revision)) return false
  if (![s.partners, s.sites, s.packages, s.orders, s.payments, s.vouchers, s.offlineBatches, s.sessions, s.commissions, s.notifications, s.auditEvents].every(idsUnique)) return false
  if (s.partners.length < 1 || s.partners.length > 10000 || !s.partners.every(p => p.fictional) || !s.sites.every(site => exists(s.partners, site.partnerId) && ['online', 'offline', 'unknown'].includes(site.mockAvailability))) return false
  if (!exists(s.partners, s.context.partnerId) || !exists(s.sites, s.context.siteId) || !/^device-demo-[\w-]+$/.test(s.context.deviceId)) return false
  if (!s.packages.every(p => ['regular', 'monthly'].includes(p.kind) && uint(p.durationSeconds) && p.durationSeconds > 0 && [1, 2, 4].includes(p.maxConcurrentDevices))) return false
  if (!s.partnerPackages.every(p => exists(s.partners, p.partnerId) && exists(s.packages, p.packageId) && uint(p.priceRp) && p.commissionRatePercent >= 0 && p.commissionRatePercent <= 100)) return false
  if (!s.orders.every(o => siteMatches(o) && uint(o.amountRp) && o.amountRp === o.rateSnapshot.basisRp && ['pending', 'issued', 'failed'].includes(o.provisioningStatus) && iso(o.createdAt))) return false
  if (new Set(s.payments.map(p => p.orderId)).size !== s.payments.length || !s.payments.every(p => exists(s.orders, p.orderId) && ['pending', 'paid', 'failed', 'expired'].includes(p.status) && iso(p.paidAt))) return false
  if (!s.orders.every(o => s.payments.some(p => p.orderId === o.id))) return false
  if (new Set(s.commissions.map(c => c.orderId)).size !== s.commissions.length || !s.commissions.every(c => {
    const o = s.orders.find(o => o.id === c.orderId)
    return o && c.partnerId === o.partnerId && c.basisRp === o.amountRp && c.ratePercent === o.rateSnapshot.ratePercent && c.amountRp === Math.round(c.basisRp * c.ratePercent / 100) && s.payments.some(p => p.orderId === o.id && p.status === 'paid')
  })) return false
  if (!s.payments.filter(p => p.status === 'paid').every(p => s.commissions.some(c => c.orderId === p.orderId))) return false
  if (!s.offlineBatches.every(b => siteMatches(b) && uint(b.quantity) && uint(b.wholesaleUnitRp) && uint(b.exampleRetailUnitRp))) return false
  if (new Set(s.vouchers.map(v=>v.code)).size !== s.vouchers.length) return false
  if (!s.vouchers.every(v => siteMatches(v) && (v.orderId === null) !== (v.batchId === null) && ['unused', 'active', 'expired'].includes(v.status) && iso(v.firstActivatedAt) && iso(v.expiresAt)
    && (v.status === 'unused' ? v.firstActivatedAt === null && v.expiresAt === null : v.firstActivatedAt !== null && v.expiresAt !== null && Date.parse(v.expiresAt) === Date.parse(v.firstActivatedAt) + v.durationSeconds * 1000)
    && (v.orderId ? s.orders.some(o => o.id === v.orderId && o.siteId === v.siteId && o.provisioningStatus === 'issued') && s.payments.some(p => p.orderId === v.orderId && p.status === 'paid') : exists(s.offlineBatches, v.batchId!)))) return false
  const issued = s.vouchers.filter(v => v.orderId !== null)
  if (new Set(issued.map(v => v.orderId)).size !== issued.length) return false
  if (!s.sessions.every(session => siteMatches(session) && s.vouchers.some(v => v.id === session.voucherId && v.siteId === session.siteId) && iso(session.startedAt) && iso(session.lastSeenAt) && iso(session.endedAt))) return false
  if (!s.monitoring.every(m => exists(s.sites, m.siteId) && iso(m.observedAt) && ['online', 'offline', 'unknown'].includes(m.status))) return false
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
        if (envelope.version !== SCHEMA_VERSION || envelope.checksum !== checksum(JSON.stringify(envelope.data)) || !validState(envelope.data)) throw new Error('Incompatible storage')
        state = envelope.data
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

