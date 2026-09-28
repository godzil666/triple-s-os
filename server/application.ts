import { createManagementService } from '../src/services/management.ts'
import { createServer, type IncomingMessage } from 'node:http'
import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { join } from 'node:path'
import { createAccounts, publicUser, type AccountInput } from './accounts.ts'
import { localJsonFiles, type JsonFiles } from './files.ts'
import { authorizeService, projectState, partnerOrder } from './authorization.ts'
import { createDemoStore } from '../src/domain/store.ts'
import { createMockServices } from '../src/services/mock.ts'
import type { DemoState, Voucher } from '../src/domain/models.ts'
import { createCustomerService } from './customer.ts'
import { createOperations } from './operations.ts'
import type { HotspotHealth, UsageCounts } from '../src/domain/models.ts'

const token = () => randomBytes(32).toString('hex')
const digest = (value: string) => createHash('sha256').update(value).digest('hex')
export interface Session { userId: string; version: number; csrf: string; expiresAt: number; absoluteExpiry: number }
export interface PreviewRuntimeState { sessions: Map<string, Session>; limits: Map<string, { count: number; expiresAt: number }> }
interface Options { directory: string; allowedOrigins: string[]; secureCookies?: boolean; files?: JsonFiles; runtimeState?: PreviewRuntimeState }
const safeEqual = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b))

export function createApplication({ directory, allowedOrigins, secureCookies = false, files = localJsonFiles, runtimeState }: Options) {
  const accounts = createAccounts(directory, files)
  const statePath = join(directory, 'demo-state.json')
  const savedState = files.read<string | null>(statePath, null)
  const prepareFreshState=(state:DemoState)=>{for(const voucher of state.vouchers)if(voucher.batchId)voucher.code=`SSS-${randomBytes(10).toString('hex').toUpperCase()}`}
  const store = createDemoStore({ getItem: () => savedState, setItem: (_key, value) => files.write(statePath, value) }, { strictPersistence: true, prepareFreshState })
  if (savedState !== null && store.getSnapshot().persistenceNotice) {
    throw new Error('DEMO_STATE_INVALID: data server tidak valid. Startup dihentikan; file lama dipertahankan. Pulihkan backup atau arsipkan demo-state.json secara manual sebelum membuat demo baru.')
  }
  let legacy=false
  try { legacy=JSON.parse(savedState??'null')?.version===1 } catch { /* Invalid state is already rejected above. */ }
  const backupPath=join(directory,'demo-state.v1.backup.json')
  if(legacy&&!files.exists(backupPath)) files.copy(statePath,backupPath)
  if(savedState === null) store.transact(()=>{})
  if (store.getSnapshot().persistenceNotice) throw new Error('DEMO_STATE_WRITE_FAILED: data awal tidak dapat disimpan; periksa izin folder server.')
  const services = createMockServices(store, { orderToken: token })
  const customer = createCustomerService(store, services)
  const operations = createOperations(store, services, accounts)
  const sessions = runtimeState?.sessions ?? new Map<string, Session>()
  const limits = runtimeState?.limits ?? new Map<string, { count: number; expiresAt: number }>()
  const secretPath = join(directory, 'device-secret.json')
  const secret = files.read<string | null>(secretPath, null) ?? token()
  files.write(secretPath, secret)
  const hotspotPath = join(directory, 'hotspot-sessions.json')
  const hotspotSessions = files.read<Record<string, { voucherId: string; sessionId: string }>>(hotspotPath, {})
  const sign = (value: string) => createHmac('sha256', secret).update(value).digest('hex')
  function throttle(key: string, maximum: number) {
    const now = Date.now()
    for (const [k,v] of limits) if (v.expiresAt <= now) limits.delete(k)
    const limit = limits.get(key) ?? { count: 0, expiresAt: now + 15 * 60_000 }
    limit.count++; limits.set(key, limit)
    if (limit.count > maximum) throw new Error('RATE_LIMITED')
  }
  function voucherView(v: Voucher) {
    return { id: v.id, siteId: v.siteId, hotspotId: v.hotspotId, status: v.status, kind: v.kind, credentialType: v.credential?.type ?? 'single_code', durationSeconds: v.durationSeconds, maxConcurrentDevices: v.maxConcurrentDevices, firstActivatedAt: v.firstActivatedAt, expiresAt: v.expiresAt }
  }
  const handleRequest = async (request: IncomingMessage, response: import('node:http').ServerResponse) => {
    response.setHeader('Cache-Control', 'no-store')
    response.setHeader('X-Content-Type-Options', 'nosniff')
    response.setHeader('Referrer-Policy', 'no-referrer')
    response.setHeader('Content-Type', 'application/json; charset=utf-8')
    function send(status: number, body: unknown) { response.writeHead(status); response.end(JSON.stringify(body)) }
    function cookie(name: string, value: string, age: number) {
      const current = response.getHeader('Set-Cookie') as string[] | undefined
      response.setHeader('Set-Cookie', [...(current ?? []), `${name}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${age}${secureCookies ? '; Secure' : ''}`])
    }
    const cookies = Object.fromEntries((request.headers.cookie ?? '').split(';').map(v => v.trim().split('=')).filter(pair => pair.length === 2))
    const sessionKey = digest(cookies.sss_staff ?? '')
    let session = sessions.get(sessionKey)
    const account = session ? accounts.find(session.userId) : undefined
    if (session && (!account?.active || account.version !== session.version || session.expiresAt <= Date.now() || session.absoluteExpiry <= Date.now())) { sessions.delete(sessionKey); session = undefined }
    const user = session && account ? publicUser(account) : null
    if (session) session.expiresAt = Math.min(Date.now() + 30 * 60_000, session.absoluteExpiry)
    function requireStaff() { if (!user) throw new Error('UNAUTHENTICATED'); return user }
    function requireOwner() { if (requireStaff().role !== 'owner') throw new Error('FORBIDDEN') }
    function device() {
      const raw = cookies.sss_device ?? ''
      const parts = raw.split('.')
      let identity: string
      if (parts.length === 3 && /^\d+$/.test(parts[1]) && Date.now() - Number(parts[1]) < 365 * 86400_000 && Number(parts[1]) <= Date.now() && safeEqual(sign(`${parts[0]}.${parts[1]}`), parts[2])) identity = parts[0]
      else { identity = token(); const payload = `${identity}.${Date.now()}`; cookie('sss_device', `${payload}.${sign(payload)}`, 365 * 86400) }
      return `device-demo-${digest(identity).slice(0, 32)}`
    }
    try {
      const path = new URL(request.url ?? '/', 'http://localhost').pathname
      // Serverless requests need not expose a Node socket. Keep a conservative shared limit.
      const clientAddress = request.socket?.remoteAddress ?? 'serverless'
      if (!path.startsWith('/api/')) { send(404, { error: 'NOT_FOUND' }); return }
      if (request.method === 'OPTIONS') { send(403, { error: 'FORBIDDEN' }); return }
      const isPost = request.method === 'POST'
      if (isPost && (!allowedOrigins.includes(request.headers.origin ?? '') || !request.headers['content-type']?.startsWith('application/json'))) throw new Error('FORBIDDEN')
      if (!['GET','POST'].includes(request.method ?? '')) { send(405, { error: 'METHOD_NOT_ALLOWED' }); return }
      if (isPost && !path.startsWith('/api/customer/') && !['/api/auth/login','/api/hotspot/login','/api/hotspot/logout'].includes(path)) {
        requireStaff()
        if (!session || typeof request.headers['x-csrf-token'] !== 'string' || !safeEqual(session.csrf, request.headers['x-csrf-token'])) throw new Error('FORBIDDEN')
      }
      const data = isPost ? await readBody(request) : {}
      if (path.startsWith('/api/customer/')) {
        const deviceId=device()
        const catalogMatch=path.match(/^\/api\/customer\/catalog\/([^/]+)$/)
        if(catalogMatch&&!isPost){send(200,customer.catalog(catalogMatch[1]));return}
        const hotspotCatalogMatch=path.match(/^\/api\/customer\/hotspots\/([^/]+)\/catalog$/)
        if(hotspotCatalogMatch&&!isPost){send(200,customer.catalogByHotspot(hotspotCatalogMatch[1]));return}
        if(path==='/api/customer/checkout'&&isPost){throttle(`checkout:${clientAddress}`,100);send(200,await customer.checkout(data,deviceId));return}
        const orderMatch=path.match(/^\/api\/customer\/orders\/([^/]+)(?:\/([^/]+))?$/)
        if(orderMatch) {
          if(!isPost&&!orderMatch[2]){send(200,customer.detail(orderMatch[1],deviceId));return}
          if(isPost&&orderMatch[2])throw new Error('FORBIDDEN')
        }
        send(404,{error:'NOT_FOUND'});return
      }
      if (path === '/api/health' && !isPost) { send(200, { ok: true }); return }
      if (path === '/api/auth/session' && !isPost) { send(200, { user, csrfToken: session?.csrf ?? '' }); return }
      if (path === '/api/auth/login' && isPost) {
        throttle(`login:${clientAddress}`, 100)
        const username = typeof data.username === 'string' ? data.username.toLowerCase().trim() : ''
        throttle(`account:${username}`, 5)
        if (typeof data.password !== 'string' || data.password.length > 128 || !username || username.length > 80) throw new Error('INVALID_CREDENTIALS')
        const verified = accounts.verify(username, data.password)
        if (!verified) throw new Error('INVALID_CREDENTIALS')
        sessions.delete(sessionKey)
        limits.delete(`account:${username}`)
        for (const [key, value] of sessions) if (value.absoluteExpiry < Date.now()) sessions.delete(key)
        const raw = token(); const csrf = token()
        sessions.set(digest(raw), { userId: verified.id, version: verified.version, csrf, expiresAt: Date.now() + 30 * 60_000, absoluteExpiry: Date.now() + 8 * 3600_000 })
        cookie('sss_staff', raw, 8 * 3600)
        send(200, { user: publicUser(verified), csrfToken: csrf }); return
      }
      if (path === '/api/auth/logout' && isPost) { sessions.delete(sessionKey); cookie('sss_staff', '', 0); send(200, { ok: true }); return }
      if (path === '/api/state' && !isPost) { send(200, projectState(store.getSnapshot(), user)); return }
      if (path === '/api/ops/overview' && !isPost) { send(200, operations.overview(requireStaff())); return }
      if (path === '/api/ops/search' && !isPost) { send(200, operations.search(requireStaff(), new URL(request.url ?? '/', 'http://localhost').searchParams.get('q') ?? '')); return }
      if (path === '/api/ops/telemetry' && isPost) { send(200, operations.setTelemetry(requireStaff(), data as unknown as { hotspotId:string;status:HotspotHealth;users:number;latencyMs:number|null;usage:UsageCounts;pollFailed?:boolean })); return }
      const refillMatch=path.match(/^\/api\/ops\/inventory\/([^/]+)\/refill$/)
      if (refillMatch && isPost) { send(200, operations.refill(requireStaff(), refillMatch[1], data.quantity as number)); return }
      if (path === '/api/ops/incidents' && isPost) { send(200, operations.createIncident(requireStaff(), data.alertId as string, (data.assigneeId as string | null) ?? null)); return }
      const incidentMatch=path.match(/^\/api\/ops\/incidents\/([^/]+)$/)
      if (incidentMatch && isPost) { send(200, operations.transition(requireStaff(), incidentMatch[1], data.status as 'acknowledged'|'investigating'|'resolved')); return }
      const alertMatch=path.match(/^\/api\/ops\/alerts\/([^/]+)\/ack$/)
      if (alertMatch && isPost) { send(200, operations.acknowledge(requireStaff(), alertMatch[1])); return }
      const recoveryMatch=path.match(/^\/api\/ops\/recovery\/([^/]+)$/)
      if (recoveryMatch && isPost) { send(200, await operations.recover(requireStaff(), recoveryMatch[1], data.action as 'issue'|'delivery')); return }
      if (path === '/api/accounts') {
        requireOwner()
        if (!isPost) { send(200, accounts.list()); return }
        if (data.role === 'partner' && !store.getSnapshot().partners.some(p => p.id === data.partnerId)) throw new Error('PARTNER_REQUIRED')
        if (data.role === 'admin' && (!Array.isArray(data.assignedHotspotIds) || data.assignedHotspotIds.length === 0 || data.assignedHotspotIds.some(id => typeof id !== 'string' || !store.getSnapshot().hotspots.some(h => h.id === id)))) throw new Error('INVALID_ASSIGNMENT')
        const created = accounts.create(data as unknown as AccountInput)
        store.transact(s => { s.auditEvents.push({ id: `audit-${++s.sequence}`, at: s.clockNow, action: 'account.created', entityId: created.id, detail: `${user!.username}: ${created.role}`, actorId: user!.id, result: 'success' }) })
        send(201, created); return
      }
      if (path.startsWith('/api/accounts/') && isPost) {
        requireOwner()
        if (Object.keys(data).some(key => !['active','password','assignedHotspotIds'].includes(key))) throw new Error('INVALID_ACCOUNT')
        if (data.assignedHotspotIds !== undefined && (!Array.isArray(data.assignedHotspotIds) || data.assignedHotspotIds.some(id => typeof id !== 'string' || !store.getSnapshot().hotspots.some(h => h.id === id)))) throw new Error('INVALID_ASSIGNMENT')
        const updated=accounts.update(path.slice('/api/accounts/'.length), data, user!.id)
        store.transact(s => { s.auditEvents.push({ id: `audit-${++s.sequence}`, at: s.clockNow, action: data.assignedHotspotIds !== undefined ? 'account.assignment' : 'account.updated', entityId: updated.id, detail: `${user!.username}: ${updated.role}; ${updated.assignedHotspotIds.join(', ')}`, actorId: user!.id, result: 'success' }) })
        send(200,updated); return
      }
      if (path === '/api/service' && isPost) {
        const staff = requireStaff()
        const { service, method, args } = data
        if (typeof service !== 'string' || typeof method !== 'string' || !Array.isArray(args) || args.length > 4) throw new Error('INVALID_INPUT')
        authorizeService(staff, service, method, args)
        if (staff.role === 'admin' && ['payments.settle','vouchers.issue','notifications.send'].includes(`${service}.${method}`)) {
          const order = store.getSnapshot().orders.find(o => o.id === args[0])
          if (!order || !staff.assignedHotspotIds.includes(order.hotspotId)) throw new Error('FORBIDDEN')
        }
        const group = (service==='management'?createManagementService(store,staff.role + ': ' + staff.username):services[service as keyof typeof services]) as unknown as Record<string, (...args: unknown[]) => Promise<unknown>>
        let result = await group[method](...args)
        if (staff.role==='admin'&&service==='orders'&&method==='list') result=(result as import('../src/domain/models.ts').Order[]).filter(o=>staff.assignedHotspotIds.includes(o.hotspotId)).map(partnerOrder)
        if (staff.role==='admin'&&service==='vouchers'&&method==='list') result=(result as Voucher[]).filter(v=>staff.assignedHotspotIds.includes(v.hotspotId)).map(v=>({...v,code:'Kredensial disamarkan',credential:undefined}))
        if (staff.role==='admin'&&service==='commissions'&&method==='list') result=(result as import('../src/domain/models.ts').CommissionEntry[]).filter(c=>store.getSnapshot().orders.some(o=>o.id===c.orderId&&staff.assignedHotspotIds.includes(o.hotspotId)))
        if(staff.role==='partner'&&service==='orders'&&method==='list')result=(result as import('../src/domain/models.ts').Order[]).map(partnerOrder)
        if(staff.role==='partner'&&service==='vouchers'&&method==='list')result=(result as Voucher[]).map(v=>({...v,code:'Kredensial disamarkan',credential:undefined}))
        if(service === 'demo' && method === 'reset') { for(const key of Object.keys(hotspotSessions)) delete hotspotSessions[key]; files.write(hotspotPath,hotspotSessions) }
        send(200, { result: result ?? null, state: projectState(store.getSnapshot(), staff) }); return
      }
      if (path === '/api/hotspot/session' && !isPost) {
        const d = device(); const record = hotspotSessions[d]
        const v = record && store.getSnapshot().vouchers.find(v => v.id === record.voucherId)
        const connected = !!v && v.status === 'active' && store.getSnapshot().sessions.some(s=>s.id===record.sessionId && s.endedAt===null)
        send(200, { voucher: v ? voucherView(v) : null, clockNow: store.getSnapshot().clockNow, connected }); return
      }
      if (path === '/api/hotspot/login' && isPost) {
        throttle(`voucher:${clientAddress}`, 30)
        const d = device()
        if (typeof data.siteId !== 'string' && typeof data.hotspotId !== 'string') throw new Error('INVALID_VOUCHER')
        const code = typeof data.code === 'string' && data.code.length <= 160 ? data.code.trim().toUpperCase() : ''
        const username = typeof data.username === 'string' && data.username.length <= 120 ? data.username.trim().toLocaleLowerCase('en-US') : ''
        const password = typeof data.password === 'string' && data.password.length <= 160 ? data.password : ''
        if (!code && (!username || !password)) throw new Error('INVALID_VOUCHER')
        const state = store.getSnapshot()
        const v = state.vouchers.find(v => {
          const matches = code
            ? v.credential?.type !== 'username_password' && v.code === code
            : v.credential?.type === 'username_password' && v.credential.username.toLocaleLowerCase('en-US') === username && v.credential.password === password
          if (!matches) return false
          if (v.batchId !== null) return true
          if (v.orderId === null) return false
          const order = state.orders.find(item => item.id === v.orderId)
          return order?.provisioningStatus === 'issued' && state.payments.some(payment => payment.orderId === v.orderId && payment.status === 'paid')
        })
        if (!v) throw new Error('INVALID_VOUCHER')
        const requestedHotspot=typeof data.hotspotId==='string'?data.hotspotId:state.hotspots.find(h=>h.siteId===data.siteId)?.id
        const login = await services.vouchers.login({ voucherId: v.id, siteId: typeof data.siteId==='string'?data.siteId:state.hotspots.find(h=>h.id===requestedHotspot)?.siteId??'', hotspotId:requestedHotspot, deviceId: d })
        const previous = hotspotSessions[d]
        if (previous && previous.sessionId !== login.id) {
          const old = store.getSnapshot().sessions.find(s => s.id === previous.sessionId)
          if (old?.endedAt === null) await services.vouchers.logout(old.id)
        }
        hotspotSessions[d] = { voucherId: v.id, sessionId: login.id }; files.write(hotspotPath, hotspotSessions)
        send(200, { voucher: voucherView(store.getSnapshot().vouchers.find(item => item.id === v.id)!), clockNow: store.getSnapshot().clockNow, connected:true }); return
      }
      if (path === '/api/hotspot/logout' && isPost) {
        const d = device(); const record = hotspotSessions[d]
        if (record && store.getSnapshot().sessions.some(s => s.id === record.sessionId)) await services.vouchers.logout(record.sessionId)
        delete hotspotSessions[d]; files.write(hotspotPath, hotspotSessions)
        send(200, { ok: true }); return
      }
      send(404, { error: 'NOT_FOUND' })
    } catch (error) {
      const code = error instanceof Error ? error.message : 'INTERNAL_ERROR'
      const status = code === 'PERSISTENCE_UNAVAILABLE' ? 503 : code === 'NOT_FOUND' ? 404 : ['UNAUTHENTICATED','INVALID_CREDENTIALS'].includes(code) ? 401 : code === 'FORBIDDEN' ? 403 : code === 'RATE_LIMITED' ? 429 : /^[A-Z_]+$/.test(code) ? 400 : 500
      if (status === 500 && process.env.APP_ENV === 'client-preview') {
        console.error('CLIENT_PREVIEW_APP_FAILURE', error instanceof Error ? error.name : typeof error, error instanceof Error ? error.stack?.split('\n').slice(1, 4).join(' | ') : '')
      }
      if (status === 429) response.setHeader('Retry-After', '900')
      send(status, { error: status === 500 ? 'INTERNAL_ERROR' : code })
    }
  }
  const server = createServer(handleRequest)
  return { server, handleRequest, store, services, accounts, runtimeState: { sessions, limits } }
}

async function readBody(request: IncomingMessage): Promise<Record<string, unknown>> {
  let text = ''
  for await (const chunk of request) { text += chunk.toString(); if (Buffer.byteLength(text) > 16_384) throw new Error('BODY_TOO_LARGE') }
  try { const data = JSON.parse(text); if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error(); return data } catch { throw new Error('INVALID_JSON') }
}

