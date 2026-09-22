import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { apiRequest, setCsrf } from '../services/http'
import type { AuthSession, StaffUser } from './types'
interface AuthValue { user: StaffUser | null; loading: boolean; error: string; login(username: string, password: string): Promise<StaffUser>; logout(): Promise<void>; refresh(): Promise<void> }
const Context = createContext<AuthValue | null>(null)
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,setUser] = useState<StaffUser | null>(null)
  const [loading,setLoading] = useState(true)
  const [error,setError] = useState('')
  const refresh = useCallback(async () => {
    try { const session = await apiRequest<AuthSession>('/api/auth/session'); setUser(session.user); setCsrf(session.csrfToken); setError('') }
    catch { setUser(null); setCsrf(''); setError('Backend lokal belum tersedia. Jalankan npm run dev, lalu coba lagi.') }
    finally { setLoading(false) }
  },[])
  useEffect(() => {
    void refresh()
    const timer = window.setInterval(() => { if (document.visibilityState === 'visible') void refresh() },60_000)
    const revoked = () => { setUser(null); setCsrf('') }
    window.addEventListener('sss:unauthorized',revoked)
    return () => { clearInterval(timer); window.removeEventListener('sss:unauthorized',revoked) }
  },[refresh])
  async function login(username: string,password: string) { const session = await apiRequest<AuthSession>('/api/auth/login',{username,password}); setCsrf(session.csrfToken); setUser(session.user); return session.user! }
  async function logout() { await apiRequest('/api/auth/logout',{}); setUser(null); setCsrf('') }
  return <Context.Provider value={{user,loading,error,login,logout,refresh}}>{children}</Context.Provider>
}
export function useAuth() { const value = useContext(Context); if (!value) throw new Error('AuthProvider required'); return value }
