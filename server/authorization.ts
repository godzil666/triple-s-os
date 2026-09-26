import type { DemoState } from '../src/domain/models.ts'
import type { StaffUser } from '../src/auth/types.ts'
import { maskWhatsapp } from '../src/domain/selectors.ts'
import type { Partner, Order } from '../src/domain/models.ts'
export const publicPartner=(partner:Partner):Partner=>{const {defaultRatePercent: _rate,...view}=partner;return view}
export const partnerOrder=(order:Order):Order=>({...order,customerWhatsapp:maskWhatsapp(order.customerWhatsapp),token:'',checkoutKey:undefined})

export function projectState(state: DemoState, user: StaffUser | null): DemoState {
  const copy = structuredClone(state)
  if (user?.role === 'owner') return copy
  copy.partners = copy.partners.map(publicPartner)
  copy.persistenceNotice = null
  if (user?.role === 'admin') {
    const allowed = new Set(user.assignedHotspotIds)
    copy.hotspots = copy.hotspots.filter(h => allowed.has(h.id))
    const siteIds = new Set(copy.hotspots.map(h => h.siteId))
    copy.sites = copy.sites.filter(s => siteIds.has(s.id))
    const partnerIds = new Set(copy.sites.map(s => s.partnerId))
    copy.partners = copy.partners.filter(p => partnerIds.has(p.id))
    copy.providers = copy.providers.filter(p => partnerIds.has(p.partnerId))
    copy.orders = copy.orders.filter(o => allowed.has(o.hotspotId)).map(partnerOrder)
    const orderIds = new Set(copy.orders.map(o => o.id))
    copy.payments = copy.payments.filter(p => orderIds.has(p.orderId))
    copy.vouchers = copy.vouchers.filter(v => allowed.has(v.hotspotId)).map(v => ({ ...v, code: 'Kredensial disamarkan', credential: undefined }))
    copy.offlineBatches = copy.offlineBatches.filter(b => allowed.has(b.hotspotId))
    copy.sessions = copy.sessions.filter(s => allowed.has(s.hotspotId))
    copy.commissions = copy.commissions.filter(c => orderIds.has(c.orderId))
    copy.notifications = copy.notifications.filter(n => orderIds.has(n.orderId))
    copy.partnerPackages = copy.partnerPackages.filter(o => partnerIds.has(o.partnerId))
    copy.monitoring = copy.monitoring.filter(m => siteIds.has(m.siteId))
    copy.inventoryPools = copy.inventoryPools.filter(p => allowed.has(p.hotspotId))
    copy.telemetry = copy.telemetry.filter(t => allowed.has(t.hotspotId))
    copy.alerts = copy.alerts.filter(a => allowed.has(a.hotspotId))
    copy.incidents = copy.incidents.filter(i => allowed.has(i.hotspotId))
    copy.auditEvents = copy.auditEvents.filter(e => copy.alerts.some(a => a.id === e.entityId) || copy.incidents.some(i => i.id === e.entityId) || copy.orders.some(o => o.id === e.entityId))
    copy.context = { partnerId: copy.partners[0]?.id ?? state.context.partnerId, siteId: copy.sites[0]?.id ?? state.context.siteId, deviceId: 'device-demo-staff' }
    return copy
  }
  const partnerId = user?.role === 'partner' ? user.partnerId : null
  const own = (item: { partnerId: string }) => partnerId !== null && item.partnerId === partnerId
  if (partnerId) {
    copy.partners = copy.partners.filter(p => p.id === partnerId)
    copy.providers = copy.providers.filter(own)
    copy.sites = copy.sites.filter(own)
    const siteIds = new Set(copy.sites.map(s => s.id))
    copy.hotspots = copy.hotspots.filter(h => siteIds.has(h.siteId))
  }
  copy.orders = copy.orders.filter(own).map(partnerOrder)
  const orderIds = new Set(copy.orders.map(o => o.id))
  copy.payments = copy.payments.filter(p => orderIds.has(p.orderId))
  copy.vouchers = copy.vouchers.filter(own)
  if (partnerId) copy.vouchers = copy.vouchers.map(v => ({ ...v, code: 'Kredensial disamarkan', credential: undefined }))
  copy.offlineBatches = copy.offlineBatches.filter(own)
  copy.sessions = copy.sessions.filter(own)
  copy.commissions = copy.commissions.filter(own)
  copy.notifications = copy.notifications.filter(n => orderIds.has(n.orderId))
  copy.auditEvents = []
  copy.inventoryPools = partnerId ? copy.inventoryPools.filter(p => copy.hotspots.some(h => h.id === p.hotspotId && copy.sites.some(s => s.id === h.siteId && s.partnerId === partnerId))) : []
  copy.telemetry = partnerId ? copy.telemetry.filter(t => copy.hotspots.some(h => h.id === t.hotspotId && copy.sites.some(s => s.id === h.siteId && s.partnerId === partnerId))).map(t => ({ ...t, usage: { gaming: 0, social: 0, streaming: 0, other: 0 } })) : []
  copy.alerts = []
  copy.incidents = []
  copy.partnerPackages = copy.partnerPackages.filter(own)
  copy.monitoring = copy.monitoring.filter(m => partnerId !== null && copy.sites.some(s => s.id === m.siteId && s.partnerId === partnerId))
  copy.sites = copy.sites.map(s => own(s) ? s : { ...s, mockAvailability: 'unknown' })
  copy.context = { partnerId: partnerId ?? copy.partners[0].id, siteId: copy.sites.find(s => s.partnerId === (partnerId ?? copy.partners[0].id))!.id, deviceId: 'device-demo-1' }
  copy.scenarios = { payment: 'pending', provisioning: 'pending', notification: 'failed' }
  return copy
}

export function authorizeService(user: StaffUser, service: string, method: string, args: unknown[]) {
  const key = `${service}.${method}`
  const adminOperations = new Set(['orders.list','vouchers.list','commissions.list','payments.settle','vouchers.issue','notifications.send'])
  const ownerOperations = new Set([...adminOperations,'management.savePartner','management.savePackage','management.saveOffer','management.allocate','orders.create','monitoring.poll','partners.list','partners.setActive','partners.updateOffer','partners.updatePackage','vouchers.login','vouchers.logout','monitoring.setSite','demo.advance','demo.setContext','demo.configure','demo.reset'])
  if (user.role === 'owner' && ownerOperations.has(key)) return
  if (user.role === 'admin' && adminOperations.has(key)) return
  if (user.role === 'partner' && ['orders.list','vouchers.list','commissions.list'].includes(key)) {
    if (args[0] !== undefined && args[0] !== user.partnerId) throw new Error('FORBIDDEN')
    args[0] = user.partnerId
    return
  }
  throw new Error('FORBIDDEN')
}


