import { Link, useNavigate } from 'react-router'
import { useAuth } from '../auth/AuthContext'
import { homeForRole } from '../auth/RequireRole'
import { useState } from 'react'

export function RoleSwitcher() {
  const {user,logout} = useAuth()
  const [error,setError]=useState('');const [busy,setBusy]=useState(false)
  const navigate = useNavigate()
  return <nav className="staff-navigation" aria-label="Akses staf">{user ? <><span>{user.username} · {user.role === 'partner' ? 'Mitra' : user.role === 'owner' ? 'Owner' : 'Admin'}</span><Link to={homeForRole(user.role)}>Dashboard saya</Link><button disabled={busy} onClick={async()=>{setBusy(true);setError('');try{await logout();navigate('/login')}catch{setError('Logout belum berhasil. Periksa koneksi ke backend, lalu coba lagi.')}finally{setBusy(false)}}}>Keluar</button>{error&&<span role="alert">{error}</span>}</> : <Link to="/login">Login staf</Link>}</nav>
}
