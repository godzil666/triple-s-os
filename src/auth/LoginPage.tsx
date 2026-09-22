import { useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router'
import { ShieldCheck } from 'lucide-react'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { Card } from '../components/Card'
import { VideoBackdrop } from '../components/VideoBackdrop'
import { useAuth } from './AuthContext'
import { homeForRole } from './RequireRole'
import './auth.css'
export function LoginPage() {
  const { user, login } = useAuth(); const navigate = useNavigate(); const [params] = useSearchParams()
  const [username,setUsername] = useState(''); const [password,setPassword] = useState(''); const [error,setError] = useState(''); const [busy,setBusy] = useState(false)
  if (user) return <Navigate to={homeForRole(user.role)} replace />
  return <div className="auth-shell"><VideoBackdrop /><div className="auth-page page-container"><div className="auth-copy"><p className="eyebrow">RUANG KERJA TRIPLE S</p><h1>Masuk untuk<br />mengelola layanan.</h1><p>Akses khusus mitra, admin, dan owner. Hak akses mengikuti akun yang diberikan kepada Anda.</p><div className="auth-note"><ShieldCheck size={22} aria-hidden="true" /><span>Sesi staf terpisah dari login voucher WiFi customer.</span></div></div><Card className="auth-card"><h2>Login staf</h2><p>Gunakan username dan password akun lokal Anda.</p><form onSubmit={async e => {
    e.preventDefault(); setBusy(true); setError('')
    try { const staff = await login(username,password); const next = params.get('next'); const allowed = staff.role === 'owner' ? ['/owner','/admin','/mitra-dashboard'] : [homeForRole(staff.role)]; navigate(next && allowed.some(prefix => next === prefix || next.startsWith(prefix+'/')) && !next.includes('\\') ? next : homeForRole(staff.role),{replace:true}) }
    catch (err) { setError((err as Error).message === 'RATE_LIMITED' ? 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.' : 'Login belum berhasil. Periksa username/password atau ketersediaan backend lokal.') }
    finally { setBusy(false) }
  }}><Input label="Username" value={username} onChange={e=>setUsername(e.target.value)} autoComplete="username" required maxLength={80} /><Input label="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" required maxLength={128} />{error&&<p className="field-error" role="alert">{error}</p>}<Button type="submit" loading={busy}>Masuk ke dashboard</Button></form><small>Belum punya akun? Hubungi owner. Pendaftaran staf tidak tersedia untuk umum.</small></Card></div></div>
}
