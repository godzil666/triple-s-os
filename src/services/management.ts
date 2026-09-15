import type {DemoStore} from '../domain/store.ts'
import type {DemoState,Package,Partner,OfflineBatch} from '../domain/models.ts'
import {makeVoucher} from '../domain/fixtures.ts'
export interface PartnerInput {name:string;area:string;note:string;ssid:string;active:boolean;ratePercent:number}
export interface PackageInput {name:string;kind:Package['kind'];durationSeconds:number;maxConcurrentDevices:number;speedMbps:number;archived:boolean;priceRp:number}
export interface BatchInput {partnerId:string;packageId:string;quantity:number;wholesaleUnitRp:number;exampleRetailUnitRp:number;stockPaymentReference:string;requestKey?:string}
export interface ManagementService {
 savePartner(id:string|null,input:PartnerInput):Promise<Partner>;
 savePackage(id:string|null,input:PackageInput):Promise<Package>;
 saveOffer(partnerId:string,packageId:string,input:{priceRp:number;available:boolean}):Promise<void>;
 allocate(input:BatchInput):Promise<OfflineBatch>;
}
function check(ok:unknown){if(!ok)throw new Error('INVALID_INPUT')}
function text(value:unknown,max:number,min=1):string{check(typeof value==='string'&&value.trim().length>=min&&value.trim().length<=max);return (value as string).trim()}
function amount(n:number){check(Number.isSafeInteger(n)&&n>=0&&n<=1_000_000_000);return n}
function rate(n:number){check(Number.isFinite(n)&&n>=0&&n<=100);return n}
function find<T>(item:T|undefined):T{if(!item)throw new Error('NOT_FOUND');return item}
const id=(s:DemoState,prefix:string)=>`${prefix}-${++s.sequence}`
export function createManagementService(store:DemoStore,actor='Simulasi domain',code=()=>`SSS-${crypto.randomUUID().replaceAll('-','').toUpperCase()}`):ManagementService {
 const audit=(s:DemoState,action:string,entityId:string,detail:string)=>s.auditEvents.push({id:id(s,'audit'),at:s.clockNow,action,entityId,detail:`${actor} · ${detail}`})
 return {
  async savePartner(partnerId,input){return store.transact(s=>{
   check(input && typeof input === 'object');const name=text(input.name,80,2),area=text(input.area,80,2),note=text(input.note,200,0),ssid=text(input.ssid,32,2),ratePercent=rate(input.ratePercent);check(typeof input.active==='boolean')
   check(!s.sites.some(site=>site.partnerId!==partnerId&&site.ssid.toLowerCase()===ssid.toLowerCase()))
   let p=partnerId?find(s.partners.find(p=>p.id===partnerId)):undefined
   if(p){Object.assign(p,{name,area,note,active:input.active,defaultRatePercent:ratePercent});find(s.sites.find(site=>site.partnerId===p!.id)).ssid=ssid;for(const offer of s.partnerPackages.filter(o=>o.partnerId===p!.id))offer.commissionRatePercent=ratePercent}
   else {p={id:id(s,'demo-mitra'),name,area,note,active:input.active,initials:name.slice(0,2).toUpperCase(),fictional:true,defaultRatePercent:ratePercent};s.partners.push(p);s.sites.push({id:`site-${p.id}`,partnerId:p.id,ssid,mockAvailability:'unknown'});s.partnerPackages.push(...s.packages.map(pkg=>({partnerId:p!.id,packageId:pkg.id,priceRp:pkg.catalogPriceRp??s.partnerPackages.find(o=>o.packageId===pkg!.id)?.priceRp??0,commissionRatePercent:ratePercent,available:false})))}
   audit(s,partnerId?'partner.updated':'partner.created',p.id,`${name}; penjualan baru ${p.active?'aktif':'nonaktif'}; rate ${ratePercent}%; router dan voucher lama tetap`);return p
  })},
  async savePackage(packageId,input){return store.transact(s=>{
   check(input && typeof input === 'object');const name=text(input.name,80,2),priceRp=amount(input.priceRp);check(['regular','monthly'].includes(input.kind));check(Number.isSafeInteger(input.durationSeconds)&&input.durationSeconds>=60&&input.durationSeconds<=366*86400);check(Number.isFinite(input.speedMbps)&&input.speedMbps>0&&input.speedMbps<=10000);check(input.kind==='regular'?input.maxConcurrentDevices===1:[2,4].includes(input.maxConcurrentDevices));check(typeof input.archived==='boolean')
   const fields={name,kind:input.kind,durationSeconds:input.durationSeconds,maxConcurrentDevices:input.maxConcurrentDevices,speedMbps:input.speedMbps,archived:input.archived,catalogPriceRp:priceRp,assumptionLabel:'Paket, harga dan kecepatan contoh demo; durasi mulai login pertama.'}
   let pkg=packageId?find(s.packages.find(p=>p.id===packageId)):undefined
   if(pkg){Object.assign(pkg,fields);for(const offer of s.partnerPackages.filter(o=>o.packageId===pkg!.id))offer.priceRp=priceRp}
   else{pkg={id:id(s,'package'),...fields};s.packages.push(pkg);s.partnerPackages.push(...s.partners.map(p=>({partnerId:p.id,packageId:pkg!.id,priceRp,commissionRatePercent:p.defaultRatePercent??s.partnerPackages.find(o=>o.partnerId===p!.id)?.commissionRatePercent??20,available:false})))}
   audit(s,packageId?'package.updated':'package.created',pkg.id,`${name}; harga katalog ${priceRp} ke seluruh mitra; arsip ${pkg.archived}; riwayat tetap`);return pkg
  })},
  async saveOffer(partnerId,packageId,input){store.transact(s=>{
   const offer=find(s.partnerPackages.find(o=>o.partnerId===partnerId&&o.packageId===packageId));check(typeof input.available==='boolean');offer.priceRp=amount(input.priceRp);offer.available=input.available
   audit(s,'offer.updated',`${partnerId}/${packageId}`,`harga ${offer.priceRp}; tersedia ${offer.available}; penjualan baru saja`)
  })},
  async allocate(input){return store.transact(s=>{
   check(input&&typeof input==='object');const requestKey=input.requestKey===undefined?undefined:text(input.requestKey,80,8)
   const ref=text(input.stockPaymentReference,120,0)||null
   if(requestKey){const prior=s.offlineBatches.find(b=>b.requestKey===requestKey);if(prior){check(prior.partnerId===input.partnerId&&prior.packageSnapshot.id===input.packageId&&prior.quantity===input.quantity&&prior.wholesaleUnitRp===input.wholesaleUnitRp&&prior.exampleRetailUnitRp===input.exampleRetailUnitRp&&prior.stockPaymentReference===ref);return prior}}
   const p=find(s.partners.find(p=>p.id===input.partnerId)),site=find(s.sites.find(site=>site.partnerId===p!.id)),pkg=find(s.packages.find(pkg=>pkg.id===input.packageId));check(!pkg.archived);check(Number.isSafeInteger(input.quantity)&&input.quantity>0&&input.quantity<=500)
   const batch:OfflineBatch={id:id(s,'batch'),partnerId:p.id,siteId:site.id,packageSnapshot:structuredClone(pkg),quantity:input.quantity,wholesaleUnitRp:amount(input.wholesaleUnitRp),exampleRetailUnitRp:amount(input.exampleRetailUnitRp),stockPaymentReference:ref,codeSource:'generated-demo',allocatedAt:s.clockNow,assumptionLabel:'Alokasi sintetis, bukan bukti terjual atau pembayaran diterima.',...(requestKey?{requestKey}:{})}
   const used=new Set(s.vouchers.map(v=>v.code));for(let n=0;n<input.quantity;n++){const voucher=makeVoucher(id(s,'offline'),p.id,site.id,pkg,null,batch.id);voucher.code=code();if(used.has(voucher.code))throw new Error('DUPLICATE_CODE');used.add(voucher.code);s.vouchers.push(voucher)}
   s.offlineBatches.push(batch);audit(s,'stock.allocated',batch.id,`${p.id}; ${pkg.id}; ${batch.quantity} kode baru; referensi ${ref??'belum ada'}; pembayaran belum diverifikasi`);return batch
  })},
 }
}

