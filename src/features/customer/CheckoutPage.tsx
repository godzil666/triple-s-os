import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { Card } from '../../components/Card'
import { Input } from '../../components/Input'
import { Select } from '../../components/Select'
import { Button } from '../../components/Button'
import { normalizeCustomer } from '../../domain/customer'
import { customerService } from '../../services/customer-http'
import type { Catalog, Offer } from '../../services/customer-contracts'
import { Flow, LoadState, Summary, draftKey, errorMessage, useCatalog } from './purchase-shared'
import { isProduction } from '../../config/runtime'
interface Draft { version:1; partnerId:string; packageId:string; name:string; whatsapp:string; channel:'qris'|'ewallet'; requestKey:string; phase:'details'|'review'; locked:boolean; token?:string; reviewed?:{catalog:Pick<Catalog,'partner'|'site'>;offer:Offer} }
function readDraft(partnerId:string,packageId:string):Draft {
  try{const d=JSON.parse(sessionStorage.getItem(draftKey)??'null');if(d?.version===1&&d.partnerId===partnerId&&d.packageId===packageId&&typeof d.requestKey==='string')return d}catch{/* Start an empty draft. */}
  return {version:1,partnerId,packageId,name:'',whatsapp:'',channel:'qris',requestKey:crypto.randomUUID(),phase:'details',locked:false}
}
export function CheckoutPage() {
  const [params]=useSearchParams(),partnerId=params.get('mitra')??'',packageId=params.get('paket')??''
  if (isProduction) return <Flow title="Pembelian online belum diaktifkan" step={2}><Card className="checkout-form"><h2>Layanan pembayaran sedang disiapkan</h2><p>Integrasi pembayaran terpusat PT. SSS dan penerbitan voucher belum dikonfigurasi pada lingkungan ini. Tidak ada transaksi yang dapat dibuat dari halaman ini.</p><a className="button button--primary" href={import.meta.env.VITE_ADMIN_WHATSAPP_URL || 'https://wa.me/?text=Halo%20Admin%20SSS%2C%20saya%20ingin%20menanyakan%20pembelian%20WiFi.'} target="_blank" rel="noreferrer">Hubungi admin SSS</a><Link className="flow-back" to={partnerId ? `/mitra/${encodeURIComponent(partnerId)}/paket` : '/'}>Kembali ke pilihan paket</Link></Card></Flow>
  return <CheckoutForm key={`${partnerId}:${packageId}`} partnerId={partnerId} packageId={packageId}/>
}
function CheckoutForm({partnerId,packageId}:{partnerId:string;packageId:string}) {
  const navigate=useNavigate(),{catalog:liveCatalog,error:catalogError,retry}=useCatalog(partnerId)
  const [draft,setDraft]=useState(()=>readDraft(partnerId,packageId)),[error,setError]=useState(''),[busy,setBusy]=useState(false)
  useEffect(()=>{try{sessionStorage.setItem(draftKey,JSON.stringify(draft))}catch{setError('Penyimpanan tab tidak tersedia. Aktifkan penyimpanan lokal sebelum membuat pesanan agar refresh dapat dipulihkan.')}},[draft])
  if(!partnerId||!packageId)return <Flow title="Pilih paket terlebih dahulu" step={2}><p>Nama mitra dan paket diperlukan sebelum checkout.</p><Link className="button button--primary" to="/">Pilih nama mitra</Link></Flow>
  if(draft.token)return <Flow title="Pesanan sudah tersimpan" step={2}><p>Gunakan pesanan yang sama setelah refresh, meskipun katalog berubah.</p><Link className="button button--primary" to={`/pesanan/${draft.token}`}>Lanjutkan pesanan tersimpan</Link></Flow>
  const catalog=(draft.phase==='review'?draft.reviewed?.catalog:null)??liveCatalog
  if(!catalog)return <LoadState error={catalogError} retry={retry}/>
  const offer=(draft.phase==='review'?draft.reviewed?.offer:null)??liveCatalog?.offers.find(o=>o.package.id===packageId)
  if(!offer)return <Flow title="Paket tidak tersedia" step={2}><p>Periksa kembali pilihan paket {catalog.partner.name}.</p><Link to={`/mitra/${partnerId}/paket`}>Kembali ke paket</Link></Flow>
  const review=()=>{try{const normalized=normalizeCustomer(draft.name,draft.whatsapp);setDraft({...draft,name:normalized.customerName,whatsapp:normalized.customerWhatsapp,phase:'review',reviewed:{catalog:{partner:catalog.partner,site:catalog.site},offer}});setError('')}catch(e){setError(errorMessage(e))}}
  const create=async()=>{
    if(busy)return
    setBusy(true);setError('')
    const locked={...draft,locked:true}
    try {
      sessionStorage.setItem(draftKey,JSON.stringify(locked));setDraft(locked)
      const result=await customerService.checkout({partnerId,packageId,quote:offer.quote,customerName:draft.name,customerWhatsapp:draft.whatsapp,channel:draft.channel,requestKey:draft.requestKey})
      const saved={...locked,token:result.order.token};setDraft(saved)
      try{sessionStorage.setItem(draftKey,JSON.stringify(saved))}catch{/* The earlier persisted request key recovers this same order. */}
      navigate(`/pesanan/${result.order.token}`,{replace:true})
    }catch(e){setError(errorMessage(e))}finally{setBusy(false)}
  }
  return <Flow title={draft.phase==='review'?'Review sebelum pembayaran':'Data pembelian Anda'} step={2}><p className="flow-lead">Pembelian di <strong>{catalog.partner.name}</strong>. Tanpa akun customer. Gunakan data contoh untuk demo ini.</p><div className="purchase-columns"><Card className="checkout-form">
    {error&&<div className="flow-error" role="alert"><p>{error}</p><Link to={`/mitra/${partnerId}/paket`}>Periksa pilihan paket</Link></div>}
    {draft.token?<><h2>Pesanan sudah tersimpan</h2><p>Gunakan pesanan yang sama setelah refresh.</p><Link className="button button--primary" to={`/pesanan/${draft.token}`}>Lanjutkan pesanan tersimpan</Link></>:draft.phase==='details'?<form onSubmit={e=>{e.preventDefault();review()}}><h2>Nama & WhatsApp</h2><Input label="Nama customer" value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})} autoComplete="name" minLength={2} maxLength={80} required/><Input label="Nomor WhatsApp" type="tel" inputMode="tel" autoComplete="tel" placeholder="0812 3456 7890" value={draft.whatsapp} onChange={e=>setDraft({...draft,whatsapp:e.target.value})} maxLength={40} required hint="Format Indonesia: 08…, 628…, atau +628…. Validasi format tidak membuktikan nomor terdaftar di WhatsApp."/><Select label="Metode pembayaran simulasi" value={draft.channel} onChange={e=>setDraft({...draft,channel:e.target.value as Draft['channel']})}><option value="qris">QRIS simulasi</option><option value="ewallet">E-wallet simulasi</option></Select><Button type="submit">Review pesanan</Button></form>:<><h2>Periksa data Anda</h2><dl className="purchase-data"><div><dt>Nama</dt><dd>{draft.name}</dd></div><div><dt>WhatsApp</dt><dd>{draft.whatsapp}</dd></div><div><dt>Metode</dt><dd>{draft.channel==='qris'?'QRIS':'E-wallet'} simulasi</dd></div></dl><p>Tidak ada uang yang ditagihkan dan tidak ada pesan WhatsApp sungguhan. Simpan tautan pesanan setelah melanjutkan.</p><div className="flow-actions"><Button loading={busy} onClick={()=>void create()}>Buat pesanan simulasi</Button>{!draft.locked&&<Button variant="secondary" onClick={()=>setDraft({...draft,phase:'details'})}>Ubah data</Button>}</div>{draft.locked&&<p>Percobaan ini memakai kunci yang sama. Coba kembali jika respons terputus; tidak perlu membuat pembelian baru.</p>}</>}
  </Card><Summary catalog={catalog} pkg={offer.package} price={offer.priceRp}/></div></Flow>
}
