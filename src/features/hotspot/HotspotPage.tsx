import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { Ticket, Wifi } from 'lucide-react'
import { useDemoContext } from '../../demo/DemoContext'
import { apiRequest } from '../../services/http'
import { Card } from '../../components/Card'
import { Input } from '../../components/Input'
import { Select } from '../../components/Select'
import { Button } from '../../components/Button'
import { VideoBackdrop } from '../../components/VideoBackdrop'
import type { Voucher } from '../../domain/models'
import './hotspot.css'
import { isProduction } from '../../config/runtime'
type VoucherView = Pick<Voucher,'id'|'siteId'|'status'|'kind'|'durationSeconds'|'maxConcurrentDevices'|'firstActivatedAt'|'expiresAt'>
interface HotspotSession { voucher: VoucherView | null; clockNow: string; connected: boolean }
const date = (value: string) => new Intl.DateTimeFormat('id-ID',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Jakarta'}).format(new Date(value))
const errors: Record<string,string> = {
  INVALID_VOUCHER:'Kode voucher tidak dikenali. Periksa kode pada detail pembelian atau voucher dari mitra, lalu coba lagi.',
  WRONG_SITE:'Voucher ini untuk mitra lain. Pilih mitra dan SSID yang tercantum pada voucher Anda.',
  DEVICE_BOUND:'Voucher reguler ini sudah terikat pada perangkat pertama. Gunakan browser/perangkat yang sama saat aktivasi awal.',
  SESSION_LIMIT:'Slot perangkat sedang penuh. Keluar dari salah satu sesi sebelum mencoba lagi.',
  SITE_UNAVAILABLE:'Situs demo sedang tidak tersedia. Hubungi mitra atau coba lagi setelah status dipulihkan.',
  VOUCHER_EXPIRED:'Masa berlaku voucher telah berakhir. Gunakan voucher lain untuk sesi baru.',
  RATE_LIMITED:'Terlalu banyak percobaan. Tunggu 15 menit sebelum mencoba kembali.',
}
export function HotspotPage() {
  if (isProduction) return <ProductionHotspotPage />
  return <DemoHotspotPage />
}
function ProductionHotspotPage() {
  return <div className="login-surface"><VideoBackdrop /><div className="hotspot-page page-container"><div className="hotspot-heading"><p className="eyebrow">PORTAL WIFI</p><h1>Login WiFi<br />belum tersedia.</h1><p>Portal ini akan aktif setelah hotspot pilot dan adaptor login PT. SSS dikonfigurasi.</p></div><Card className="hotspot-card"><div className="hotspot-symbol"><Wifi size={28} aria-hidden="true" /></div><h2>Integrasi hotspot diperlukan</h2><p>Browser tidak dapat memilih WiFi, membaca SSID/MAC, atau mengubah router. Hubungi admin untuk aktivasi titik pilot.</p><a className="button button--primary" href={import.meta.env.VITE_ADMIN_WHATSAPP_URL || 'https://wa.me/?text=Halo%20Admin%20SSS%2C%20saya%20ingin%20menanyakan%20pemasangan%20WiFi.'} target="_blank" rel="noreferrer">Hubungi admin SSS</a><Link className="hotspot-back" to="/">Kembali ke halaman utama</Link></Card></div></div>
}
function DemoHotspotPage() {
  const {state}=useDemoContext(); const {siteId}=useParams(); const navigate=useNavigate()
  const [chosen,setChosen]=useState(''); const [code,setCode]=useState(''); const [busy,setBusy]=useState(false); const [message,setMessage]=useState('')
  const [session,setSession]=useState<HotspotSession | null>(null)
  const site=state.sites.find(s=>s.id===siteId); const partner=state.partners.find(p=>p.id===site?.partnerId)
  useEffect(()=>{
    let active=true
    const refresh=async()=>{try{const result=await apiRequest<HotspotSession>('/api/hotspot/session');if(active)setSession(result.voucher?.siteId===siteId?result:null)}catch{if(active)setMessage('Layanan lokal belum tersedia. Coba lagi setelah backend berjalan.')}}
    if(siteId)void refresh()
    const interval=window.setInterval(()=>{if(siteId&&document.visibilityState==='visible')void refresh()},5000)
    return()=>{active=false;clearInterval(interval)}
  },[siteId])
  const voucher=session?.voucher
  const remaining=voucher?.expiresAt&&session?Math.max(0,Math.ceil((Date.parse(voucher.expiresAt)-Date.parse(session.clockNow))/60000)):null
  return <div className="login-surface"><VideoBackdrop /><div className="hotspot-page page-container"><div className="hotspot-heading"><p className="eyebrow">VOUCHER ONLINE & OFFLINE</p><h1>Masuk WiFi<br />dengan voucher Anda.</h1><p>Beli online atau di mitra, gunakan kode voucher Anda di sini.</p></div><Card className="hotspot-card">
    {!siteId ? <><div className="hotspot-symbol"><Wifi size={28} aria-hidden="true" /></div><h2>Pilih lokasi WiFi</h2><p>Cocokkan mitra dengan lokasi pada voucher dan jaringan yang dipilih di pengaturan WiFi Anda.</p><Select label="Mitra dan SSID tujuan" value={chosen} onChange={e=>setChosen(e.target.value)}><option value="">Pilih mitra secara manual</option>{state.sites.map(s=><option key={s.id} value={s.id}>{state.partners.find(p=>p.id===s.partnerId)?.name} · {s.ssid}</option>)}</Select><Button disabled={!chosen} onClick={()=>navigate(`/wifi/${chosen}/login`)}>Lanjut ke login voucher</Button></> : !site ? <><h2>Lokasi belum ditemukan</h2><p>Alamat ini tidak menunjuk ke lokasi WiFi demo yang tersedia.</p><Link className="button button--primary" to="/wifi">Pilih lokasi WiFi</Link></> : <>
      <div className="hotspot-site"><span className="hotspot-symbol"><Wifi size={25} aria-hidden="true" /></span><div><p>{partner?.name}</p><h2>{site.ssid}</h2><span>SSID tujuan · konteks simulasi</span></div></div>
      {message&&<p className="hotspot-message" role="alert">{message}</p>}
      {voucher&&<div className="hotspot-status" role="status"><strong>{voucher.status==='expired'?'Voucher kedaluwarsa':session?.connected?'Sesi simulasi aktif':'Sesi tidak tersambung'}</strong><dl><div><dt>Mulai pertama</dt><dd>{voucher.firstActivatedAt?`${date(voucher.firstActivatedAt)} WIB`:'Belum dimulai'}</dd></div><div><dt>Berakhir</dt><dd>{voucher.expiresAt?`${date(voucher.expiresAt)} WIB`:'Belum dimulai'}</dd></div><div><dt>Sisa waktu demo</dt><dd>{remaining===null?'Belum dimulai':`${remaining} menit`}</dd></div><div><dt>Batas perangkat</dt><dd>{voucher.maxConcurrentDevices}</dd></div></dl><p>Waktu memakai clock demo manual. Membuka ulang halaman tidak memperpanjang masa berlaku.</p></div>}
      {!session?.connected&&<form onSubmit={async e=>{e.preventDefault();setBusy(true);setMessage('');try{setSession(await apiRequest<HotspotSession>('/api/hotspot/login',{siteId:site.id,code}));setCode('')}catch(err){setMessage(errors[(err as Error).message]??'Login belum berhasil. Periksa layanan lokal dan coba lagi.')}finally{setBusy(false)}}}><Input label="Kode voucher" placeholder="Masukkan kode voucher Anda" value={code} onChange={e=>setCode(e.target.value)} autoComplete="off" autoCapitalize="characters" spellCheck={false} maxLength={160} required leading={<Ticket size={19} />} hint="Kode dari pembelian online atau mitra. Durasi dimulai setelah login pertama berhasil." /><Button type="submit" loading={busy}>Masuk dengan voucher</Button></form>}
      {session?.connected&&<Button variant="secondary" loading={busy} onClick={async()=>{setBusy(true);try{await apiRequest('/api/hotspot/logout',{});setSession(null);setMessage('Sesi dihentikan. Masa berlaku voucher tetap berjalan pada clock demo.')}catch{setMessage('Logout belum berhasil. Coba lagi.')}finally{setBusy(false)}}}>Keluar dari sesi WiFi</Button>}
      <Link className="hotspot-back" to="/wifi">Pilih mitra / SSID lain</Link>
    </>}
    <div className="hotspot-demo-note"><strong>Portal WiFi simulasi</strong><p>Aplikasi tidak membaca SSID/MAC, mengganti jaringan, atau membuka akses internet perangkat. Pilih WiFi melalui pengaturan perangkat. Popup otomatis memerlukan integrasi captive portal router yang belum dilakukan.</p></div>
  </Card></div></div>
}
