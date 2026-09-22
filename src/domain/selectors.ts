import type { DemoState, SiteStatus } from './models.ts'
import { DEMO_CONFIG } from './config.ts'

export const maskWhatsapp=(value:string)=>value.includes('••••••')?value:/^\+628\d+$/.test(value)?`${value.slice(0,4)}••••••${value.slice(-4)}`:'Nomor demo disamarkan'
export const wibDay=(iso:string)=>new Date(Date.parse(iso)+7*3600_000).toISOString().slice(0,10)
export function selectPartnerOrders(state:DemoState,partnerId:string,filter:{from?:string;to?:string;status?:string;packageId?:string}) {
  if(filter.from&&filter.to&&filter.from>filter.to)return []
  return state.orders.filter(o=>o.partnerId===partnerId&&(!filter.from||wibDay(o.createdAt)>=filter.from)&&(!filter.to||wibDay(o.createdAt)<=filter.to)&&(!filter.packageId||o.packageSnapshot.id===filter.packageId)&&(!filter.status||state.payments.some(p=>p.orderId===o.id&&p.status===filter.status))).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)||b.id.localeCompare(a.id))
}

export function monitoringStatus(state: DemoState, siteId: string): SiteStatus {
  const snapshot = state.monitoring.find(s => s.siteId === siteId)
  if (!snapshot || snapshot.pollFailed || Date.parse(state.clockNow) - Date.parse(snapshot.observedAt) > DEMO_CONFIG.monitoringStaleAfterMs) return 'unknown'
  return snapshot.status
}

export function selectSummary(state: DemoState, partnerId?: string) {
  const belongs = (item: { partnerId: string }) => !partnerId || item.partnerId === partnerId
  const orders = state.orders.filter(belongs)
  const paidOrders = orders.filter(o => state.payments.some(p => p.orderId === o.id && p.status === 'paid'))
  const batches = state.offlineBatches.filter(belongs)
  const sessions = state.sessions.filter(s => belongs(s) && s.endedAt === null && state.vouchers.some(v => v.id === s.voucherId && v.expiresAt !== null && Date.parse(v.expiresAt) > Date.parse(state.clockNow)))
  return {
    observedAt: state.clockNow,
    partnerCount: state.partners.filter(p => !partnerId || p.id === partnerId).length,
    onlineDevices: new Set(sessions.map(s => `${s.siteId}/${s.deviceId}`)).size,
    activeSessions: sessions.length,
    paidOrders: paidOrders.length,
    onlineGrossRp: paidOrders.reduce((sum, o) => sum + o.amountRp, 0),
    onlineCommissionRp: state.commissions.filter(belongs).reduce((sum, c) => sum + c.amountRp, 0),
    allocatedOfflineVouchers: batches.reduce((sum, b) => sum + b.quantity, 0),
    unusedOfflineVouchers: state.vouchers.filter(v => belongs(v) && v.batchId && v.status === 'unused').length,
    offlinePotentialMarginRp: batches.reduce((sum, b) => sum + (b.exampleRetailUnitRp - b.wholesaleUnitRp) * b.quantity, 0),
    offlineRealizedMarginRp: null,
    stockPaymentsReceivedRp: null,
    feesRp: null,
  }
}

/** Customer search uses every partner; the page keeps a six-card initial view. */
export function selectPresentationPartners(state: DemoState) {
  return state.partners.map(partner => ({ ...partner, ssid: state.sites.find(s => s.partnerId === partner.id)!.ssid }))
}

