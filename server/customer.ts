import { publicPartner } from './authorization.ts'
import { createHash } from 'node:crypto'
import type { DemoStore } from '../src/domain/store.ts'
import type { Services } from '../src/services/contracts.ts'
import type { Catalog, CustomerDetail } from '../src/services/customer-contracts.ts'
import { normalizeCustomer } from '../src/domain/customer.ts'

const hash = (text: string) => createHash('sha256').update(text).digest('hex')
const select = <T extends string>(value: unknown, choices: readonly T[]): T => {
  if (typeof value !== 'string' || !choices.includes(value as T)) throw new Error('INVALID_SCENARIO')
  return value as T
}
export function createCustomerService(store: DemoStore, services: Services) {
  function catalog(partnerId: string): Catalog {
    const state=store.getSnapshot(), site=state.sites.find(s=>s.partnerId===partnerId)
    const hotspot=state.hotspots.find(h=>h.siteId===site?.id)
    if(!hotspot)throw new Error('NOT_FOUND')
    return catalogByHotspot(hotspot.id)
  }
  function catalogByHotspot(hotspotId: string): Catalog {
    const state=store.getSnapshot(), hotspot=state.hotspots.find(h=>h.id===hotspotId), site=state.sites.find(s=>s.id===hotspot?.siteId)
    const partner=state.partners.find(p=>p.id===site?.partnerId), provider=state.providers.find(p=>p.id===site?.providerId)
    if(!hotspot||!site||!partner||!provider)throw new Error('NOT_FOUND')
    return {partner:publicPartner(partner),provider,site:{id:site.id,ssid:site.ssid,partnerId:partner.id,providerId:provider.id},hotspot,offers:partner.active&&hotspot.active?state.partnerPackages.filter(o=>o.partnerId===partner.id&&o.available).flatMap(o=>{
      const pkg=state.packages.find(p=>p.id===o.packageId&&!p.archived)
      const pool=state.inventoryPools.find(p=>p.hotspotId===hotspotId&&p.packageId===o.packageId)
      return pkg&&pool&&pool.available>0?[{package:pkg,priceRp:o.priceRp,quote:hash(JSON.stringify([hotspotId,pkg,o.priceRp]))}]:[]
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
    const site=state.sites.find(s=>s.id===order.siteId)!,hotspot=state.hotspots.find(h=>h.id===order.hotspotId)!,provider=state.providers.find(p=>p.id===site.providerId)!
    const publicVoucher=voucher?(({deviceBinding:_binding,batchId:_batch,...view})=>view)(voucher):null
    return {order:publicOrder,partner:publicPartner(state.partners.find(p=>p.id===order.partnerId)!),provider,site:{id:site.id,ssid:site.ssid,partnerId:site.partnerId,providerId:site.providerId},hotspot,payment:state.payments.find(p=>p.orderId===order.id)!,voucher:publicVoucher,notification:state.notifications.filter(n=>n.orderId===order.id).at(-1)??null,clockNow:state.clockNow,connected:sessions.some(s=>s.deviceId===deviceId),activeDevices:sessions.length}
  }
  return {
    catalog, catalogByHotspot, detail,
    async checkout(data: Record<string,unknown>, deviceId: string) {
      const contact=normalizeCustomer(data.customerName,data.customerWhatsapp)
      if(typeof data.requestKey!=='string'||!/^[a-f0-9-]{36}$/.test(data.requestKey)||typeof data.partnerId!=='string'||typeof data.packageId!=='string')throw new Error('INVALID_INPUT')
      const channel=select(data.channel,['qris','ewallet'] as const)
      const checkoutKey=hash(`${deviceId}:${data.requestKey}`)
      if(!store.getSnapshot().orders.some(o=>o.checkoutKey===checkoutKey)) {
        const selected=typeof data.hotspotId==='string'?catalogByHotspot(data.hotspotId):catalog(data.partnerId)
        if(selected.partner.id!==data.partnerId)throw new Error('NOT_FOUND')
        const offer=selected.offers.find(o=>o.package.id===data.packageId)
        if(!offer)throw new Error('PACKAGE_UNAVAILABLE')
        if(offer.quote!==data.quote)throw new Error('QUOTE_CHANGED')
      }
      const order=await services.orders.create({partnerId:data.partnerId,hotspotId:typeof data.hotspotId==='string'?data.hotspotId:undefined,packageId:data.packageId,...contact,channel,checkoutKey})
      return detail(order.token,deviceId)
    },
  }
}

