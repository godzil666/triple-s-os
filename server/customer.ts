import { publicPartner } from './authorization.ts'
import { createHash } from 'node:crypto'
import type { DemoStore } from '../src/domain/store.ts'
import type { Services } from '../src/services/contracts.ts'
import type { Catalog, CustomerDetail } from '../src/services/customer-contracts.ts'
import type { Order, PaymentStatus, ProvisioningStatus } from '../src/domain/models.ts'
import { normalizeCustomer } from '../src/domain/customer.ts'

const hash = (text: string) => createHash('sha256').update(text).digest('hex')
const select = <T extends string>(value: unknown, choices: readonly T[]): T => {
  if (typeof value !== 'string' || !choices.includes(value as T)) throw new Error('INVALID_SCENARIO')
  return value as T
}
export function createCustomerService(store: DemoStore, services: Services) {
  function catalog(partnerId: string): Catalog {
    const state=store.getSnapshot(), partner=state.partners.find(p=>p.id===partnerId), site=state.sites.find(s=>s.partnerId===partnerId)
    if(!partner||!site)throw new Error('NOT_FOUND')
    return {partner:publicPartner(partner),site:{id:site.id,ssid:site.ssid,partnerId},offers:partner.active?state.partnerPackages.filter(o=>o.partnerId===partnerId&&o.available).flatMap(o=>{
      const pkg=state.packages.find(p=>p.id===o.packageId&&!p.archived)
      return pkg?[{package:pkg,priceRp:o.priceRp,quote:hash(JSON.stringify([pkg,o.priceRp]))}]:[]
    }):[]}
  }
  function orderFor(token: string) {
    if(!/^[a-f0-9]{64}$/.test(token))throw new Error('NOT_FOUND')
    const order=store.getSnapshot().orders.find(o=>o.token===token)
    if(!order)throw new Error('NOT_FOUND')
    return order
  }
  function detail(token: string, deviceId: string): CustomerDetail {
    const order=orderFor(token),state=store.getSnapshot()
    const {rateSnapshot: _rate,checkoutKey: _key,...publicOrder}=order
    const voucher=state.vouchers.find(v=>v.orderId===order.id)
    const sessions=state.sessions.filter(s=>s.voucherId===voucher?.id&&s.endedAt===null)
    const site=state.sites.find(s=>s.id===order.siteId)!
    const publicVoucher=voucher?(({deviceBinding:_binding,batchId:_batch,...view})=>view)(voucher):null
    return {order:publicOrder,partner:publicPartner(state.partners.find(p=>p.id===order.partnerId)!),site:{id:site.id,ssid:site.ssid,partnerId:site.partnerId},payment:state.payments.find(p=>p.orderId===order.id)!,voucher:publicVoucher,notification:state.notifications.filter(n=>n.orderId===order.id).at(-1)??null,clockNow:state.clockNow,connected:sessions.some(s=>s.deviceId===deviceId),activeDevices:sessions.length}
  }
  async function provision(order: Order, status: ProvisioningStatus, notification: 'sent'|'failed') {
    const v=await services.vouchers.issue(order.id,status)
    if(v&&!store.getSnapshot().notifications.some(n=>n.orderId===order.id))await services.notifications.send(order.id,notification)
  }
  return {
    catalog, detail,
    async checkout(data: Record<string,unknown>, deviceId: string) {
      const contact=normalizeCustomer(data.customerName,data.customerWhatsapp)
      if(typeof data.requestKey!=='string'||!/^[a-f0-9-]{36}$/.test(data.requestKey)||typeof data.partnerId!=='string'||typeof data.packageId!=='string')throw new Error('INVALID_INPUT')
      const channel=select(data.channel,['qris','ewallet'] as const)
      const checkoutKey=hash(`${deviceId}:${data.requestKey}`)
      if(!store.getSnapshot().orders.some(o=>o.checkoutKey===checkoutKey)) {
        const offer=catalog(data.partnerId).offers.find(o=>o.package.id===data.packageId)
        if(!offer)throw new Error('PACKAGE_UNAVAILABLE')
        if(offer.quote!==data.quote)throw new Error('QUOTE_CHANGED')
      }
      const order=await services.orders.create({partnerId:data.partnerId,packageId:data.packageId,...contact,channel,checkoutKey})
      return detail(order.token,deviceId)
    },
    async action(token: string, action: string, data: Record<string,unknown>, deviceId: string) {
      const order=orderFor(token)
      switch(action) {
        case 'pay': {
          const status=select<PaymentStatus>(data.status,['pending','paid','failed','expired'])
          const provisioning=select<ProvisioningStatus>(data.provisioning,['pending','issued','failed'])
          const notification=select(data.notification,['sent','failed'] as const)
          const payment=await services.payments.settle(order.id,status)
          if(payment.status==='paid')await provision(order,provisioning,notification)
          break
        }
        case 'issue': await provision(order,select<ProvisioningStatus>(data.status,['pending','issued','failed']),select(data.notification,['sent','failed'] as const));break
        case 'notify': await services.notifications.send(order.id,select(data.status,['sent','failed'] as const));break
        case 'connect': {
          if(typeof data.siteId!=='string'||!data.siteId)throw new Error('NETWORK_REQUIRED')
          const voucher=store.getSnapshot().vouchers.find(v=>v.orderId===order.id)
          if(!voucher)throw new Error('VOUCHER_NOT_ISSUED')
          await services.vouchers.login({voucherId:voucher.id,siteId:data.siteId,deviceId});break
        }
        case 'disconnect': {
          const voucher=store.getSnapshot().vouchers.find(v=>v.orderId===order.id)
          const session=store.getSnapshot().sessions.find(s=>s.voucherId===voucher?.id&&s.deviceId===deviceId&&s.endedAt===null)
          if(session)await services.vouchers.logout(session.id);break
        }
        default: throw new Error('NOT_FOUND')
      }
      return detail(token,deviceId)
    },
  }
}

