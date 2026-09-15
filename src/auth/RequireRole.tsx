import { Navigate, Outlet, useLocation, Link } from 'react-router'
import { useAuth } from './AuthContext'
import type { StaffRole } from './types'
import { Card } from '../components/Card'
export const homeForRole = (role: StaffRole) => role === 'owner' ? '/owner' : role === 'admin' ? '/admin' : '/mitra-dashboard'
export function RequireRole({ roles }: { roles: StaffRole[] }) {
  const { user, loading } = useAuth(); const location = useLocation()
  if (loading) return <p role="status">Memeriksa sesi…</p>
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />
  if (!roles.includes(user.role)) return <main id="main-content" className="page-container access-denied" tabIndex={-1}><Card><h1>Akses tidak tersedia</h1><p>Akun Anda tidak memiliki izin untuk halaman ini.</p><Link className="button button--primary" to={homeForRole(user.role)}>Ke dashboard saya</Link></Card></main>
  return <Outlet />
}
