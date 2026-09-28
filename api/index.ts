import type { IncomingMessage, ServerResponse } from 'node:http'
import { createApplication, type PreviewRuntimeState, type Session } from '../server/application.ts'
import { withPreviewDocuments } from '../server/preview-persistence.ts'
import type { AccountInput } from '../server/accounts.ts'

export const config = { maxDuration: 30 }

function previewOrigin() {
  const raw = process.env.SSS_PUBLIC_ORIGIN ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '')
  const parsed = new URL(raw)
  if (parsed.protocol !== 'https:' || parsed.pathname !== '/' || parsed.search || parsed.hash) throw new Error('CLIENT_PREVIEW_ORIGIN_INVALID')
  return parsed.origin
}

function bootstrapAccounts(app: ReturnType<typeof createApplication>) {
  if (app.accounts.list().length) return
  const raw = process.env.SSS_PREVIEW_BOOTSTRAP_ACCOUNTS
  if (!raw) throw new Error('CLIENT_PREVIEW_ACCOUNTS_MISSING')
  const inputs = JSON.parse(raw) as AccountInput[]
  if (!Array.isArray(inputs) || !inputs.some(input => input.role === 'owner')) throw new Error('CLIENT_PREVIEW_OWNER_MISSING')
  const state = app.store.getSnapshot()
  for (const input of inputs) {
    if (input.role === 'partner' && !state.partners.some(partner => partner.id === input.partnerId)) throw new Error('CLIENT_PREVIEW_PARTNER_INVALID')
    if (input.role === 'admin' && (!input.assignedHotspotIds?.length || input.assignedHotspotIds.some(id => !state.hotspots.some(hotspot => hotspot.id === id)))) throw new Error('CLIENT_PREVIEW_ASSIGNMENT_INVALID')
    app.accounts.create(input)
  }
}

function originalApiUrl(request: IncomingMessage) {
  const url = new URL(request.url ?? '/', 'https://preview.invalid')
  const path = url.searchParams.get('apiPath')
  if (!path || !/^[a-zA-Z0-9/._-]+$/.test(path) || path.includes('..')) throw new Error('CLIENT_PREVIEW_ROUTE_INVALID')
  url.searchParams.delete('apiPath')
  return `/api/${path}${url.search}`
}

export default async function handler(request: IncomingMessage, response: ServerResponse) {
  try {
    const url = originalApiUrl(request)
    const result = await withPreviewDocuments(async (files, documents) => {
      const runtimeState: PreviewRuntimeState = {
        sessions: new Map(Object.entries(documents['staff-sessions'] as Record<string, Session> ?? {})),
        limits: new Map(Object.entries(documents['rate-limits'] as Record<string, { count: number; expiresAt: number }> ?? {})),
      }
      const app = createApplication({ directory: 'preview', allowedOrigins: [previewOrigin()], secureCookies: true, files, runtimeState })
      bootstrapAccounts(app)
      request.url = url
      const headers = new Map<string, number | string | string[]>()
      let status = 200
      let body = ''
      const buffered = {
        setHeader(name: string, value: number | string | string[]) { headers.set(name.toLowerCase(), value); return buffered },
        getHeader(name: string) { return headers.get(name.toLowerCase()) },
        writeHead(value: number) { status = value; return buffered },
        end(value?: string) { body = value ?? ''; return buffered },
      } as unknown as ServerResponse
      await app.handleRequest(request, buffered)
      documents['staff-sessions'] = Object.fromEntries(runtimeState.sessions)
      documents['rate-limits'] = Object.fromEntries(runtimeState.limits)
      return { status, headers, body }
    })
    response.statusCode = result.status
    for (const [name, value] of result.headers) response.setHeader(name, value)
    response.end(result.body)
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    const rawCode = error && typeof error === 'object' && 'code' in error ? error.code : undefined
    const code = /^CLIENT_PREVIEW_[A-Z_]+$/.test(message) ? message
      : typeof rawCode === 'string' && /^[A-Z][A-Z0-9_]{0,63}$/.test(rawCode) ? rawCode
        : /certificate|\bssl\b|\btls\b/i.test(message) ? 'DATABASE_TLS'
          : /authentication|\bsasl\b|password/i.test(message) ? 'DATABASE_AUTH'
            : /timeout|connect|network|host/i.test(message) ? 'DATABASE_CONNECT'
              : /json|unexpected token/i.test(message) ? 'BOOTSTRAP_FORMAT'
                : error instanceof TypeError ? 'TYPE_ERROR' : 'UNCLASSIFIED'
    console.error('CLIENT_PREVIEW_API_FAILURE', code)
    response.statusCode = 503
    response.setHeader('Cache-Control', 'no-store')
    response.setHeader('Content-Type', 'application/json; charset=utf-8')
    response.end(JSON.stringify({ error: 'CLIENT_PREVIEW_UNAVAILABLE' }))
  }
}
