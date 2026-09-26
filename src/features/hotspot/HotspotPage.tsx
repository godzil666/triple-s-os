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
import { QrScanner } from './QrScanner'
type VoucherView = Pick<Voucher,'id'|'siteId'|'hotspotId'|'status'|'kind'|'durationSeconds'|'maxConcurrentDevices'|'firstActivatedAt'|'expiresAt'>
interface HotspotSession { voucher: (VoucherView & {credentialType:'single_code'|'username_password'}) | null; clockNow: string; connected: boolean }
const date = (value: string) => new Intl.DateTimeFormat('id-ID',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Jakarta'}).format(new Date(value))
const errors: Record<string,string> = {
  INVALID_VOUCHER:'Kode voucher tidak dikenali. Periksa kode pada detail pembelian atau voucher dari mitra, lalu coba lagi.',
  WRONG_SITE:'Voucher ini untuk mitra lain. Pilih mitra dan SSID yang tercantum pada voucher Anda.',
  WRONG_HOTSPOT:'Voucher ini berlaku di hotspot lain pada lokasi yang sama. Pilih hotspot yang tercantum pada voucher Anda.',
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
  const {state}=useDemoContext(); const {siteId,hotspotId}=useParams(); const navigate=useNavigate()
  const [chosen,setChosen]=useState(''); const [credentialType,setCredentialType]=useState<'single_code'|'username_password'>('single_code'); const [code,setCode]=useState(''); const [username,setUsername]=useState(''); const [password,setPassword]=useState(''); const [busy,setBusy]=useState(false); const [message,setMessage]=useState('')
  const [session,setSession]=useState<HotspotSession | null>(null)
  const hotspot=state.hotspots.find(h=>h.id===(hotspotId??state.hotspots.find(item=>item.siteId===siteId)?.id)); const site=state.sites.find(s=>s.id===hotspot?.siteId); const partner=state.partners.find(p=>p.id===site?.partnerId); const provider=state.providers.find(p=>p.id===site?.providerId)
  useEffect(()=>{
    let active=true
    const refresh=async()=>{try{const result=await apiRequest<HotspotSession>('/api/hotspot/session');if(active)setSession(result.voucher?.hotspotId===hotspot?.id?result:null)}catch{if(active)setMessage('Layanan lokal belum tersedia. Coba lagi setelah backend berjalan.')}}
    if(hotspot?.id)void refresh()
    const interval=window.setInterval(()=>{if(hotspot?.id&&document.visibilityState==='visible')void refresh()},5000)
    return()=>{active=false;clearInterval(interval)}
  },[hotspot?.id])
  const voucher=session?.voucher
  const remaining=voucher?.expiresAt&&session?Math.max(0,Math.ceil((Date.parse(voucher.expiresAt)-Date.parse(session.clockNow))/60000)):null
  return <div className="login-surface"><VideoBackdrop /><div className="hotspot-page page-container"><div className="hotspot-heading"><p className="eyebrow">VOUCHER ONLINE & OFFLINE</p><h1>Masuk WiFi<br />dengan voucher Anda.</h1><p>Beli online atau di mitra, gunakan kode voucher Anda di sini.</p></div><Card className="hotspot-card">
    {!siteId&&!hotspotId ? <><div className="hotspot-symbol"><Wifi size={28} aria-hidden="true" /></div><h2>Pilih hotspot WiFi</h2><p>Cocokkan mitra dan hotspot dengan voucher atau jaringan yang dipilih di pengaturan WiFi Anda.</p><Select label="Mitra, provider, dan hotspot tujuan" value={chosen} onChange={e=>setChosen(e.target.value)}><option value="">Pilih hotspot secara manual</option>{state.hotspots.map(h=>{const location=state.sites.find(s=>s.id===h.siteId);return <option key={h.id} value={h.id}>{state.partners.find(p=>p.id===location?.partnerId)?.name} · {h.name} · {h.ssid}</option>})}</Select><Button disabled={!chosen} onClick={()=>navigate(`/wifi/hotspot/${chosen}/login`)}>Lanjut ke login voucher</Button></> : !site||!hotspot ? <><h2>Hotspot belum ditemukan</h2><p>Alamat ini tidak menunjuk ke hotspot WiFi demo yang tersedia.</p><Link className="button button--primary" to="/wifi">Pilih hotspot WiFi</Link></> : <>
      <div className="hotspot-site"><span className="hotspot-symbol"><Wifi size={25} aria-hidden="true" /></span><div><p>{partner?.name} · {provider?.name}</p><h2>{hotspot.name}</h2><span>{hotspot.ssid} · SSID tujuan · konteks simulasi</span></div></div>
      {message&&<p className="hotspot-message" role="alert">{message}</p>}
      {voucher&&<div className="hotspot-status" role="status"><strong>{voucher.status==='expired'?'Voucher kedaluwarsa':session?.connected?'Sesi simulasi aktif':'Sesi tidak tersambung'}</strong><dl><div><dt>Mulai pertama</dt><dd>{voucher.firstActivatedAt?`${date(voucher.firstActivatedAt)} WIB`:'Belum dimulai'}</dd></div><div><dt>Berakhir</dt><dd>{voucher.expiresAt?`${date(voucher.expiresAt)} WIB`:'Belum dimulai'}</dd></div><div><dt>Sisa waktu demo</dt><dd>{remaining===null?'Belum dimulai':`${remaining} menit`}</dd></div><div><dt>Batas perangkat</dt><dd>{voucher.maxConcurrentDevices}</dd></div></dl><p>Waktu memakai clock demo manual. Membuka ulang halaman tidak memperpanjang masa berlaku.</p></div>}
      {!session?.connected&&<form onSubmit={async e=>{e.preventDefault();setBusy(true);setMessage('');try{setSession(await apiRequest<HotspotSession>('/api/hotspot/login',{siteId:site.id,hotspotId:hotspot.id,...(credentialType==='single_code'?{code}:{username,password})}));setCode('');setUsername('');setPassword('')}catch(err){setMessage(errors[(err as Error).message]??'Login belum berhasil. Periksa layanan lokal dan coba lagi.')}finally{setBusy(false)}}}>
        <Select label="Cara masuk" value={credentialType} onChange={e=>setCredentialType(e.target.value as typeof credentialType)}><option value="single_code">Voucher · satu kode atau QR</option><option value="username_password">Member · username dan password</option></Select>
        {credentialType==='single_code'?<><Input label="Kode voucher" placeholder="Masukkan kode voucher Anda" value={code} onChange={e=>setCode(e.target.value)} autoComplete="off" autoCapitalize="characters" spellCheck={false} maxLength={160} required leading={<Ticket size={19} />} hint="Kode dari pembelian online atau mitra. Durasi dimulai setelah login pertama berhasil." /><QrScanner onCode={setCode}/></>:<><Input label="Username member" autoComplete="username" value={username} onChange={e=>setUsername(e.target.value)} maxLength={120} required hint="Gunakan username persis seperti yang diberikan mitra."/><Input label="Password member" type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} maxLength={160} required hint="Password hanya dikirim ke simulator lokal."/></>}
        <Button type="submit" loading={busy}>Masuk dengan voucher</Button></form>}
      {session?.connected&&<Button variant="secondary" loading={busy} onClick={async()=>{setBusy(true);try{await apiRequest('/api/hotspot/logout',{});setSession(null);setMessage('Sesi dihentikan. Masa berlaku voucher tetap berjalan pada clock demo.')}catch{setMessage('Logout belum berhasil. Coba lagi.')}finally{setBusy(false)}}}>Keluar dari sesi WiFi</Button>}
      <div className="flow-actions"><Link className="button button--secondary" to={`/mitra/${encodeURIComponent(partner!.id)}/paket?hotspot=${encodeURIComponent(hotspot.id)}`}>Beli voucher untuk hotspot ini</Link><Link className="hotspot-back" to="/wifi">Pilih hotspot lain</Link></div>
    </>}
    <div className="hotspot-demo-note"><strong>Portal WiFi simulasi</strong><p>Aplikasi tidak membaca SSID/MAC, mengganti jaringan, atau membuka akses internet perangkat. Pilih WiFi melalui pengaturan perangkat. Popup otomatis memerlukan integrasi captive portal router yang belum dilakukan.</p></div>
  </Card></div></div>
}
