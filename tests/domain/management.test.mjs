import {test} from 'node:test'
import assert from 'node:assert/strict'
import {createDemoStore} from '../../src/domain/store.ts'
import {createMockServices} from '../../src/services/mock.ts'
import {createManagementService} from '../../src/services/management.ts'
const profile={name:'Mitra Tambahan',area:'Sukabumi',note:'Data fiktif',ssid:'SSS-DEMO-TAMBAHAN',active:true,ratePercent:25}
test('management updates future offers while paid snapshots and old voucher activation survive archive/deactivation',async()=>{
 const store=createDemoStore(),s=createMockServices(store),m=createManagementService(store,'admin-test')
 const old=await s.orders.create({partnerId:'demo-cisaat',packageId:'regular-3h',customerName:'Demo',customerWhatsapp:'+6281234567890',channel:'qris'})
 await s.payments.settle(old.id,'paid');const v=await s.vouchers.issue(old.id,'issued')
 const pkg=store.getSnapshot().packages[0];await m.savePackage(pkg.id,{...pkg,priceRp:9000,durationSeconds:14400})
 await m.savePartner('demo-cisaat',{...profile,ssid:'SSS-DEMO-CISAAT',active:false,ratePercent:30})
 assert.equal(store.getSnapshot().orders.find(o=>o.id===old.id).amountRp,5000)
 assert.equal(store.getSnapshot().commissions.find(c=>c.orderId===old.id).amountRp,1000)
 await assert.rejects(s.orders.create({partnerId:'demo-cisaat',packageId:pkg.id,customerName:'Demo',customerWhatsapp:'+6281234567890',channel:'qris'}))
 await m.savePackage(pkg.id,{...pkg,priceRp:9000,archived:true})
 assert.ok(await s.vouchers.login({voucherId:v.id,siteId:v.siteId,deviceId:'device-demo-old'}))
 assert.ok(store.getSnapshot().auditEvents.some(e=>e.detail.includes('admin-test')))
})
test('new partner/package and unique atomic batches survive persistence; invalid input and collisions roll back',async()=>{
 let saved=null;const storage={getItem:()=>saved,setItem:(_,v)=>saved=v};const store=createDemoStore(storage),m=createManagementService(store,'owner-test')
 const p=await m.savePartner(null,profile);assert.equal(store.getSnapshot().partners.length,51)
 const pkg=await m.savePackage(null,{name:'Reguler baru',kind:'regular',durationSeconds:7200,maxConcurrentDevices:1,speedMbps:10,archived:false,priceRp:6000})
 assert.equal(store.getSnapshot().partnerPackages.find(o=>o.partnerId===p.id&&o.packageId===pkg.id).commissionRatePercent,25)
 const input={partnerId:p.id,packageId:pkg.id,quantity:3,wholesaleUnitRp:3000,exampleRetailUnitRp:6000,stockPaymentReference:''}
 const batch=await m.allocate(input);assert.equal(batch.stockPaymentReference,null)
 const vouchers=store.getSnapshot().vouchers;assert.equal(new Set(vouchers.map(v=>v.code)).size,vouchers.length)
 const before=store.getSnapshot();await assert.rejects(m.allocate({...input,quantity:-1}));assert.deepEqual(store.getSnapshot(),before)
 const collision=createManagementService(store,'admin',()=>vouchers[0].code);await assert.rejects(collision.allocate(input),/DUPLICATE_CODE/);assert.deepEqual(store.getSnapshot(),before)
 await assert.rejects(m.savePartner(null,{...profile,ratePercent:101}));await assert.rejects(m.savePackage(null,{...pkg,priceRp:-1}))
 const restored=createDemoStore(storage);assert.equal(restored.getSnapshot().partners.length,51);assert.equal(restored.getSnapshot().offlineBatches.at(-1).id,batch.id)
})
