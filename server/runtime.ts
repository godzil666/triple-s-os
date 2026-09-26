import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { randomBytes } from 'node:crypto'
import { createApplication } from './application.ts'
const directory = resolve(process.env.SSS_DATA_DIR ?? '.local/server')
const apiPort = Number(process.env.SSS_API_PORT ?? 8787)
const webPort = Number(process.env.SSS_WEB_PORT ?? 5173)
if (!Number.isInteger(apiPort) || !Number.isInteger(webPort)) throw new Error('INVALID_PORT')
const app = createApplication({ directory, allowedOrigins: [`http://127.0.0.1:${webPort}`, `http://localhost:${webPort}`] })
if (!app.accounts.list().length) {
  const credentials = [
    { username: 'owner', role: 'owner' as const },
    { username: 'admin', role: 'admin' as const, assignedHotspotIds: ['hotspot-site-demo-cisaat'] },
    { username: 'mitra.cisaat', role: 'partner' as const, partnerId: 'demo-cisaat' },
  ].map(account => ({ ...account, password: randomBytes(18).toString('base64url') }))
  for (const account of credentials) app.accounts.create(account)
  mkdirSync(directory, { recursive: true })
  const path = join(directory, 'INITIAL_ACCOUNTS.md')
  if (!existsSync(path)) writeFileSync(path, '# Akun lokal Triple S OS\n\nFile ini berisi password awal acak. Jangan masukkan ke Git atau bagikan ke customer. Akses hanya di laptop ini. Owner dapat mengubah password lewat halaman Akun staf; file ini tidak otomatis diperbarui setelah password berubah.\n\n| Username | Password awal | Peran |\n|---|---|---|\n' + credentials.map(a => `| ${a.username} | ${a.password} | ${a.role} |`).join('\n') + '\n', { mode: 0o600 })
  console.log(`Akun awal dibuat. Buka file lokal: ${path}`)
}
app.server.listen(apiPort, '127.0.0.1', () => console.log(`API lokal: http://127.0.0.1:${apiPort}`))
app.server.on('error', error => { console.error(error.message); process.exit(1) })
for (const event of ['SIGINT','SIGTERM'] as const) process.on(event, () => app.server.close(() => process.exit(0)))
