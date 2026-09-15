import { spawn } from 'node:child_process'
import { createServer, preview } from 'vite'
const isPreview = process.argv.includes('--preview')
const port = Number(process.env.SSS_WEB_PORT ?? (isPreview ? 4173 : 5173))
const api = spawn(process.execPath, ['server/runtime.ts'], { stdio: 'inherit', windowsHide: true, env: { ...process.env, SSS_WEB_PORT: String(port) } })
// Wait for password/bootstrap initialization before exposing the web app.
let ready=false
for(let attempt=0;attempt<150;attempt++) {
  if(api.exitCode!==null)throw new Error('Backend gagal dimulai; periksa port dan log.')
  try { const response=await fetch(`http://127.0.0.1:${process.env.SSS_API_PORT??8787}/api/health`); if(response.ok){ready=true;break} } catch { /* Boot is still in progress. */ }
  await new Promise(resolve=>setTimeout(resolve,200))
}
if(!ready){api.kill();throw new Error('Backend tidak siap dalam 30 detik.')}
let vite
try { vite = isPreview ? await preview({preview:{host:'127.0.0.1',port,strictPort:true}}) : await createServer({ server: { host: '127.0.0.1', port, strictPort: true } }); if(!isPreview) await vite.listen(); vite.printUrls() } catch (error) { api.kill(); throw error }
let closing = false
async function close(code=0) { if (closing) return; closing = true; api.kill(); if(isPreview) await new Promise(resolve=>vite.httpServer.close(resolve)); else await vite.close(); process.exit(code) }
api.on('exit', code => { if (!closing) { console.error(`Backend berhenti (${code}).`); void close(1) } })
process.on('SIGINT', ()=>void close()); process.on('SIGTERM', ()=>void close())
