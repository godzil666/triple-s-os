import type { StaffUser } from '../src/auth/types.ts'
import type { DemoState, HotspotHealth, UsageCounts } from '../src/domain/models.ts'
import type { DemoStore } from '../src/domain/store.ts'
import type { Services } from '../src/services/contracts.ts'
import { checkLowStock, effectiveTelemetry, upsertAlert } from '../src/domain/operations.ts'
import { maskWhatsapp } from '../src/domain/selectors.ts'
import type { createAccounts } from './accounts.ts'

type Accounts = ReturnType<typeof createAccounts>
const permitted = (user: StaffUser, hotspotId: string) => user.role === 'owner' || (user.role === 'admin' && user.assignedHotspotIds.includes(hotspotId))
function authorize(user: StaffUser, hotspotId: string) { if (!permitted(user, hotspotId)) throw new Error('FORBIDDEN') }
function audit(state: DemoState, user: StaffUser, action: string, entityId: string, detail: string) {
  state.auditEvents.push({ id: `audit-${++state.sequence}`, at: state.clockNow, action, entityId, detail, actorId: user.id, result: 'success' })
}
export function createOperations(store: DemoStore, services: Services, accounts: Accounts) {
  const accessible = (user: StaffUser) => {
    if (user.role === 'partner') throw new Error('FORBIDDEN')
    return store.getSnapshot().hotspots.filter(h => permitted(user, h.id))
  }
  function overview(user: StaffUser) {
    const state = store.getSnapshot(), ids = new Set(accessible(user).map(h => h.id))
    const hotspots = state.hotspots.filter(h => ids.has(h.id)).map(h => {
      const site=state.sites.find(s=>s.id===h.siteId)!,partner=state.partners.find(p=>p.id===site.partnerId)!,provider=state.providers.find(p=>p.id===site.providerId)!,telemetry=state.telemetry.find(t=>t.hotspotId===h.id)
      return { ...h, partner:{id:partner.id,name:partner.name}, provider:{id:provider.id,name:provider.name}, location:{id:site.id,ssid:site.ssid}, telemetry:telemetry?effectiveTelemetry(telemetry,state.clockNow):null, assignedStaff:accounts.list().filter(a=>a.role==='admin'&&a.assignedHotspotIds.includes(h.id)).map(a=>a.username) }
    })
    const inventory=state.inventoryPools.filter(p=>ids.has(p.hotspotId)).map(p=>({...p,packageName:state.packages.find(pkg=>pkg.id===p.packageId)?.name??p.packageId}))
    const alerts=state.alerts.filter(a=>ids.has(a.hotspotId)).reverse()
    const incidents=state.incidents.filter(i=>ids.has(i.hotspotId)).reverse()
    const recovery=state.orders.filter(o=>ids.has(o.hotspotId)&&state.payments.some(p=>p.orderId===o.id&&p.status==='paid')&&(o.provisioningStatus!=='issued'||state.notifications.filter(n=>n.orderId===o.id).at(-1)?.status==='failed')).map(o=>({orderId:o.id,hotspotId:o.hotspotId,provisioningStatus:o.provisioningStatus,notificationStatus:state.notifications.filter(n=>n.orderId===o.id).at(-1)?.status??'none',customerWhatsapp:maskWhatsapp(o.customerWhatsapp)}))
    const notifications=[...alerts.map(a=>({id:a.id,kind:'alert',hotspotId:a.hotspotId,message:a.message,at:a.updatedAt,status:a.status})),...incidents.map(i=>({id:i.id,kind:'incident',hotspotId:i.hotspotId,message:`Insiden ${i.id}: ${i.status}`,at:i.updatedAt,status:i.status}))].sort((a,b)=>b.at.localeCompare(a.at))
    return {hotspots,inventory,alerts,incidents,recovery,notifications,clockNow:state.clockNow,source:'DEMO TELEMETRY'}
  }
  function search(user: StaffUser, query: string) {
    const ids=new Set(accessible(user).map(h=>h.id)),q=query.trim().toLowerCase()
    if(q.length<2||q.length>100)throw new Error('INVALID_QUERY')
    const state=store.getSnapshot()
    return state.orders.filter(o=>ids.has(o.hotspotId)).filter(o=>{
      const partner=state.partners.find(p=>p.id===o.partnerId),provider=state.providers.find(p=>p.partnerId===o.partnerId),hotspot=state.hotspots.find(h=>h.id===o.hotspotId),voucher=state.vouchers.find(v=>v.orderId===o.id)
      return [o.id,o.customerWhatsapp,partner?.name,provider?.name,hotspot?.name,hotspot?.ssid,voucher?.id].some(value=>value?.toLowerCase().includes(q))
    }).slice(0,25).map(o=>{const payment=state.payments.find(p=>p.orderId===o.id),voucher=state.vouchers.find(v=>v.orderId===o.id),notification=state.notifications.filter(n=>n.orderId===o.id).at(-1);return {orderId:o.id,partnerId:o.partnerId,hotspotId:o.hotspotId,customerName:o.customerName,customerWhatsapp:maskWhatsapp(o.customerWhatsapp),paymentStatus:payment?.status,provisioningStatus:o.provisioningStatus,voucherStatus:voucher?.status??'not_issued',activationStatus:voucher?.firstActivatedAt?'started':'not_started',deliveryStatus:notification?.status??'none'}})
  }
  function setTelemetry(user: StaffUser, input: { hotspotId: string; status: HotspotHealth; users: number; latencyMs: number | null; usage: UsageCounts; pollFailed?: boolean }) {
    if(user.role!=='owner')throw new Error('FORBIDDEN')
    if(!store.getSnapshot().hotspots.some(h=>h.id===input.hotspotId)||!['online','degraded','offline','unknown'].includes(input.status)||!Number.isSafeInteger(input.users)||input.users<0||input.users>100000||!(input.latencyMs===null||(Number.isSafeInteger(input.latencyMs)&&input.latencyMs>=0&&input.latencyMs<=100000))||!input.usage||Object.values(input.usage).length!==4||Object.values(input.usage).some(n=>!Number.isSafeInteger(n)||n<0||n>100000))throw new Error('INVALID_TELEMETRY')
    return store.transact(s=>{
      const old=s.telemetry.find(t=>t.hotspotId===input.hotspotId)
      const snapshot={hotspotId:input.hotspotId,status:input.pollFailed?'unknown' as const:input.status,users:input.pollFailed?0:input.users,latencyMs:input.pollFailed?null:input.latencyMs,usage:input.pollFailed?{gaming:0,social:0,streaming:0,other:0}:input.usage,observedAt:input.pollFailed&&old?old.observedAt:s.clockNow,pollFailed:!!input.pollFailed,source:'demo' as const}
      s.telemetry=s.telemetry.filter(t=>t.hotspotId!==input.hotspotId).concat(snapshot)
      const type=input.status==='offline'?'hotspot_offline':input.status==='degraded'?'hotspot_degraded':input.latencyMs!==null&&input.latencyMs>200?'high_latency':null
      if(type&&!input.pollFailed)upsertAlert(s,{type,hotspotId:input.hotspotId,packageId:null,orderId:null,severity:type==='hotspot_offline'?'critical':'warning',message:`Telemetri demo ${input.status}; latensi ${input.latencyMs??'unknown'} ms.`})
      if(input.status==='online'&&!input.pollFailed)for(const a of s.alerts.filter(a=>a.hotspotId===input.hotspotId&&['hotspot_offline','hotspot_degraded','high_latency'].includes(a.type)&&a.status!=='resolved')){a.status='resolved';a.updatedAt=s.clockNow}
      audit(s,user,'telemetry.demo.updated',input.hotspotId,input.status)
      return snapshot
    })
  }
  function acknowledge(user: StaffUser, alertId: string) {
    const alert=store.getSnapshot().alerts.find(a=>a.id===alertId);if(!alert)throw new Error('NOT_FOUND');authorize(user,alert.hotspotId)
    return store.transact(s=>{const item=s.alerts.find(a=>a.id===alertId)!;if(item.status==='open'){item.status='acknowledged';item.updatedAt=s.clockNow;audit(s,user,'alert.acknowledged',item.id,item.type)}return item})
  }
  function refill(user: StaffUser, poolId: string, quantity: number) {
    if(user.role!=='owner')throw new Error('FORBIDDEN')
    if(!Number.isSafeInteger(quantity)||quantity<1||quantity>100)throw new Error('INVALID_QUANTITY')
    if(!store.getSnapshot().inventoryPools.some(pool=>pool.id===poolId))throw new Error('NOT_FOUND')
    return store.transact(s=>{const pool=s.inventoryPools.find(item=>item.id===poolId)!;pool.available+=quantity;checkLowStock(s,pool.hotspotId,pool.packageId);audit(s,user,'inventory.demo.refill',pool.id,`${quantity} stok sintetis`);return pool})
  }
  function createIncident(user: StaffUser, alertId: string, assigneeId: string | null) {
    const state=store.getSnapshot(),alert=state.alerts.find(a=>a.id===alertId);if(!alert)throw new Error('NOT_FOUND');authorize(user,alert.hotspotId)
    if(assigneeId){const assignee=accounts.find(assigneeId);if(!assignee?.active||assignee.role!=='admin'||!assignee.assignedHotspotIds.includes(alert.hotspotId))throw new Error('INVALID_ASSIGNMENT')}
    return store.transact(s=>{const existing=s.incidents.find(i=>i.alertId===alertId);if(existing)return existing;const incident={id:`incident-${++s.sequence}`,alertId,hotspotId:alert.hotspotId,assigneeId,status:'open' as const,createdAt:s.clockNow,updatedAt:s.clockNow,timeline:[{at:s.clockNow,actorId:user.id,action:'open'}]};s.incidents.push(incident);audit(s,user,'incident.opened',incident.id,alert.type);return incident})
  }
  function transition(user: StaffUser, incidentId: string, status: 'acknowledged'|'investigating'|'resolved') {
    const incident=store.getSnapshot().incidents.find(i=>i.id===incidentId);if(!incident)throw new Error('NOT_FOUND');authorize(user,incident.hotspotId)
    const next:{[key:string]:string}={open:'acknowledged',acknowledged:'investigating',investigating:'resolved'}
    if(next[incident.status]!==status)throw new Error('INVALID_TRANSITION')
    return store.transact(s=>{const item=s.incidents.find(i=>i.id===incidentId)!;item.status=status;item.updatedAt=s.clockNow;item.timeline.push({at:s.clockNow,actorId:user.id,action:status});if(status==='resolved'){const alert=s.alerts.find(a=>a.id===item.alertId);if(alert){alert.status='resolved';alert.updatedAt=s.clockNow}}audit(s,user,`incident.${status}`,incidentId,item.hotspotId);return item})
  }
  async function recover(user: StaffUser, orderId: string, action: 'issue'|'delivery') {
    const state=store.getSnapshot(),order=state.orders.find(o=>o.id===orderId);if(!order)throw new Error('NOT_FOUND');authorize(user,order.hotspotId)
    if(!state.payments.some(p=>p.orderId===orderId&&p.status==='paid'))throw new Error('PAYMENT_NOT_PAID')
    if(action==='issue')await services.vouchers.issue(orderId,'issued')
    else if(action==='delivery'){
      if(!state.vouchers.some(v=>v.orderId===orderId))throw new Error('VOUCHER_NOT_ISSUED')
      if(state.notifications.filter(n=>n.orderId===orderId).at(-1)?.status!=='sent')await services.notifications.send(orderId,'sent')
    } else throw new Error('INVALID_INPUT')
    const succeeded=action==='delivery'||store.getSnapshot().orders.find(o=>o.id===orderId)?.provisioningStatus==='issued'
    store.transact(s=>{s.auditEvents.push({id:`audit-${++s.sequence}`,at:s.clockNow,action:`recovery.${action}`,entityId:orderId,detail:succeeded?'Simulasi; idempotent':'Stok sintetis masih habis',actorId:user.id,result:succeeded?'success':'failed'})})
    if(!succeeded)throw new Error('INVENTORY_EMPTY')
    return {orderId,provisioningStatus:store.getSnapshot().orders.find(o=>o.id===orderId)?.provisioningStatus,deliveryStatus:store.getSnapshot().notifications.filter(n=>n.orderId===orderId).at(-1)?.status??'none'}
  }
  return {overview,search,setTelemetry,acknowledge,refill,createIncident,transition,recover}
}
