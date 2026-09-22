import {test} from 'node:test'
import assert from 'node:assert/strict'
import {createDemoStore} from '../../src/domain/store.ts'
import {createMockServices} from '../../src/services/mock.ts'
import {selectPartnerOrders, maskWhatsapp, monitoringStatus, selectSummary} from '../../src/domain/selectors.ts'
test('partner filters use WIB boundaries and shared paid commission; unrelated partner totals remain unchanged',async()=>{
 const store=createDemoStore(),services=createMockServices(store)
 const other=selectSummary(store.getSnapshot(),'demo-cibadak')
 const before=selectSummary(store.getSnapshot(),'demo-cisaat')
 const order=await services.orders.create({partnerId:'demo-cisaat',packageId:'regular-3h',customerName:'Demo',customerWhatsapp:'+6281234567890',channel:'qris'})
 await services.payments.settle(order.id,'paid');await services.payments.settle(order.id,'paid')
 assert.equal(selectSummary(store.getSnapshot(),'demo-cisaat').paidOrders,before.paidOrders+1)
 assert.equal(selectSummary(store.getSnapshot(),'demo-cisaat').onlineCommissionRp,before.onlineCommissionRp+1000)
 assert.deepEqual(selectSummary(store.getSnapshot(),'demo-cibadak'),other)
 store.transact(s=>{s.orders.find(o=>o.id===order.id).createdAt='2026-09-10T17:00:00.000Z'})
 assert.ok(selectPartnerOrders(store.getSnapshot(),'demo-cisaat',{from:'2026-09-11',to:'2026-09-11',status:'paid'}).some(o=>o.id===order.id))
 assert.ok(!selectPartnerOrders(store.getSnapshot(),'demo-cisaat',{to:'2026-09-10'}).some(o=>o.id===order.id))
 assert.ok(!selectPartnerOrders(store.getSnapshot(),'demo-cibadak',{}).some(o=>o.id===order.id))
 assert.equal(maskWhatsapp('+6281234567890'),'+628••••••7890')
 await services.monitoring.setSite('site-demo-cisaat','offline');assert.equal(monitoringStatus(store.getSnapshot(),'site-demo-cisaat'),'offline')
 await services.demo.advance(301000);assert.equal(monitoringStatus(store.getSnapshot(),'site-demo-cisaat'),'unknown')
})
