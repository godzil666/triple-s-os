import type { DemoState } from '../src/domain/models.ts'
import type { StaffUser } from '../src/auth/types.ts'
import { maskWhatsapp } from '../src/domain/selectors.ts'
import type { Partner, Order } from '../src/domain/models.ts'
export const publicPartner=(partner:Partner):Partner=>{const {defaultRatePercent: _rate,...view}=partner;return view}
export const partnerOrder=(order:Order):Order=>({...order,customerWhatsapp:maskWhatsapp(order.customerWhatsapp),token:'',checkoutKey:undefined})

export function projectState(state: DemoState, user: StaffUser | null): DemoState {
  const copy = structuredClone(state)
  if (user?.role === 'owner' || user?.role === 'admin') return copy
  copy.partners = copy.partners.map(publicPartner)
  copy.persistenceNotice = null
  const partnerId = user?.role === 'partner' ? user.partnerId : null
  const own = (item: { partnerId: string }) => partnerId !== null && item.partnerId === partnerId
  copy.orders = copy.orders.filter(own).map(partnerOrder)
  const orderIds = new Set(copy.orders.map(o => o.id))
  copy.payments = copy.payments.filter(p => orderIds.has(p.orderId))
  copy.vouchers = copy.vouchers.filter(own)
  copy.offlineBatches = copy.offlineBatches.filter(own)
  copy.sessions = copy.sessions.filter(own)
  copy.commissions = copy.commissions.filter(own)
  copy.notifications = copy.notifications.filter(n => orderIds.has(n.orderId))
  copy.auditEvents = []
  copy.partnerPackages = copy.partnerPackages.filter(own)
  copy.monitoring = copy.monitoring.filter(m => partnerId !== null && copy.sites.some(s => s.id === m.siteId && s.partnerId === partnerId))
  copy.sites = copy.sites.map(s => own(s) ? s : { ...s, mockAvailability: 'unknown' })
  copy.context = { partnerId: partnerId ?? copy.partners[0].id, siteId: copy.sites.find(s => s.partnerId === (partnerId ?? copy.partners[0].id))!.id, deviceId: 'device-demo-1' }
  copy.scenarios = { payment: 'pending', provisioning: 'pending', notification: 'failed' }
  return copy
}

export function authorizeService(user: StaffUser, service: string, method: string, args: unknown[]) {
  const key = `${service}.${method}`
  const adminOperations = new Set(['management.savePartner','management.savePackage','management.saveOffer','management.allocate','orders.create','orders.list','payments.settle','vouchers.issue','vouchers.list','notifications.send','monitoring.poll','partners.list','partners.setActive','partners.updateOffer','partners.updatePackage','commissions.list'])
  const ownerOperations = new Set([...adminOperations,'vouchers.login','vouchers.logout','monitoring.setSite','demo.advance','demo.setContext','demo.configure','demo.reset'])
  if (user.role === 'owner' && ownerOperations.has(key)) return
  if (user.role === 'admin' && adminOperations.has(key)) return
  if (user.role === 'partner' && ['orders.list','vouchers.list','commissions.list'].includes(key)) {
    if (args[0] !== undefined && args[0] !== user.partnerId) throw new Error('FORBIDDEN')
    args[0] = user.partnerId
    return
  }
  throw new Error('FORBIDDEN')
}


