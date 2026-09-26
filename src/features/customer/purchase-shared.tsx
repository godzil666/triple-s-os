import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { MapPin, Wifi } from 'lucide-react'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { customerService } from '../../services/customer-http'
import type { Catalog } from '../../services/customer-contracts'
import type { Package } from '../../domain/models'
import './purchase.css'
import { isDemoMode } from '../../config/runtime'

export const rupiah=(value:number)=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(value)
export const duration=(seconds:number)=>seconds>=86400?`${seconds/86400} hari`:`${seconds/3600} jam`
export const packageTitle=(pkg:Package)=>pkg.name.replace(/^(Reguler|Bulanan) /,'$1 · ')
export const jakarta=(date:string)=>new Intl.DateTimeFormat('id-ID',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Jakarta'}).format(new Date(date))+' WIB'
export const errorMessage=(error:unknown)=>({
  PERSISTENCE_UNAVAILABLE:'Pesanan/perubahan belum dapat disimpan ke disk. Periksa penyimpanan server lokal, lalu coba kembali dengan transaksi yang sama.',
  INVALID_NAME:'Nama customer perlu 2–80 karakter dan tidak boleh berisi tanda markup.',
  INVALID_WHATSAPP:'Periksa nomor WhatsApp Indonesia, misalnya 081234567890 atau +6281234567890.',
  INVALID_CONTACT:'Lengkapi nama dan nomor WhatsApp.',
  QUOTE_CHANGED:'Harga atau aturan paket berubah. Kembali ke pilihan paket dan review harga terbaru.',
  PACKAGE_UNAVAILABLE:'Paket sudah tidak tersedia untuk pembelian baru. Pilih paket lain.',
  CHECKOUT_CONFLICT:'Pesanan untuk percobaan ini sudah tersimpan dengan data berbeda. Buka pesanan yang ada atau pilih paket untuk pembelian baru.',
  NETWORK_REQUIRED:'Belum di WiFi tujuan. Pilih SSID melalui pengaturan WiFi perangkat, lalu pilih konteks jaringan mock yang sesuai di bawah.',
  WRONG_SITE:'Anda memilih WiFi mitra lain. Pilih SSID pada voucher melalui pengaturan WiFi perangkat, lalu sesuaikan konteks mock.',
  DEVICE_BOUND:'Voucher terkunci pada perangkat pertama. Gunakan profil browser/perangkat mock yang dipakai saat login awal.',
  SESSION_LIMIT:'Slot bulanan penuh. Keluar dari sesi pada salah satu perangkat sebelum menyambungkan perangkat ini.',
  SITE_UNAVAILABLE:'Titik WiFi simulasi sedang offline atau belum diketahui. Coba lagi setelah status dipulihkan; hubungi mitra bila diperlukan.',
  VOUCHER_EXPIRED:'Voucher sudah kedaluwarsa. Reconnect tidak memperpanjang masa berlaku.',
  PAYMENT_NOT_PAID:'Pembayaran belum berhasil. Periksa status pembayaran simulasi.',
  VOUCHER_NOT_ISSUED:'Voucher masih diproses. Pembayaran yang sudah diterima tidak perlu diulang.',
  RATE_LIMITED:'Terlalu banyak percobaan simulasi. Tunggu 15 menit sebelum mencoba lagi.',
  NOT_FOUND:'Tautan pesanan tidak ditemukan atau data demo sudah direset. Gunakan tautan yang disimpan setelah pembelian.',
}[error instanceof Error?error.message:'']??'Layanan lokal belum merespons. Coba lagi; gunakan pesanan yang sama agar tidak membeli dua kali.')

export function Flow({title,step,children}:{title:string;step:number;children:ReactNode}) {
  return <div className="page-container purchase-flow"><nav className="flow-steps" aria-label="Tahapan pembelian">{['Mitra','Paket','Data & review','Bayar & voucher'].map((s,i)=><span key={s} aria-current={i===step?'step':undefined}><b>{i+1}</b>{s}</span>)}</nav><p className="eyebrow">{isDemoMode ? 'VOUCHER WIFI · DEMO LOKAL' : 'VOUCHER WIFI'}</p><h1>{title}</h1>{children}</div>
}
export function Terms({pkg,partnerName}:{pkg:Package;partnerName:string}) {
  return <ul className="purchase-terms"><li>Hanya berlaku di satu lokasi: <strong>{partnerName}</strong>.</li><li>Durasi {duration(pkg.durationSeconds)} sejak login pertama berhasil; tetap berjalan saat logout.</li><li>{pkg.kind==='regular'?'Terkunci pada 1 perangkat pertama.':`Maksimal ${pkg.maxConcurrentDevices} perangkat online bersamaan, dengan waktu berakhir bersama.`}</li><li>Boleh dibeli sebelum tiba di lokasi.</li></ul>
}
export function Summary({catalog,pkg,price}:{catalog:Pick<Catalog,'partner'|'site'> & {hotspot?:Catalog['hotspot']};pkg:Package;price:number}) {
  return <Card className="purchase-summary"><p className="eyebrow">MITRA PILIHAN ANDA</p><h2><MapPin size={21} aria-hidden="true" />{catalog.partner.name}</h2><p className="flow-ssid"><Wifi size={17} aria-hidden="true" />{catalog.hotspot?.ssid??catalog.site.ssid}</p>{catalog.hotspot&&<p>Hotspot: {catalog.hotspot.name}</p>}<h3>{packageTitle(pkg)}</h3><p className="purchase-price">{rupiah(price)}</p><p>{pkg.speedMbps} Mbps · contoh kecepatan</p><Terms pkg={pkg} partnerName={catalog.partner.name}/><p className="assumption-note">{pkg.assumptionLabel}</p></Card>
}
export function useCatalog(id:string|undefined,hotspotId?:string) {
  const [catalog,setCatalog]=useState<Catalog|null>(null),[error,setError]=useState(''),[retry,setRetry]=useState(0)
  useEffect(()=>{let active=true;setCatalog(null);setError('');if(id||hotspotId)void (hotspotId?customerService.catalogByHotspot(hotspotId):customerService.catalog(id!)).then(v=>{if(active&&(!id||v.partner.id===id))setCatalog(v);else if(active)setError('Hotspot tidak cocok dengan mitra yang dipilih.')}).catch(e=>{if(active)setError(errorMessage(e))});return()=>{active=false}},[id,hotspotId,retry])
  return {catalog,error,retry:()=>setRetry(v=>v+1)}
}
export function LoadState({error,retry}:{error:string;retry:()=>void}) {
  return <Flow title={error?'Paket belum tersedia':'Memuat pilihan paket…'} step={1}><p role="status">{error||'Menyiapkan katalog mitra pilihan Anda.'}</p>{error&&<Button onClick={retry}>Coba lagi</Button>}<Link className="flow-back" to="/">Pilih nama mitra</Link></Flow>
}
export const draftKey='triple-s:checkout:v1'
export function startNewPurchase(){try{sessionStorage.removeItem(draftKey)}catch{/* Checkout will report unavailable persistence before submitting. */}}
