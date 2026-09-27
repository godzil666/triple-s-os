import { copyFileSync, existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
export function readJson<T>(path: string, fallback: T): T { return existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) as T : fallback }
export function writeJson(path: string, data: unknown) {
  mkdirSync(dirname(path), { recursive: true })
  const temporary = `${path}.tmp`
  writeFileSync(temporary, JSON.stringify(data, null, 2), { encoding: 'utf8', mode: 0o600 })
  // Windows scanners can hold the target briefly after a write; keep the atomic rename.
  for (let attempt = 0; ; attempt++) {
    try { renameSync(temporary, path); return }
    catch (error) {
      const code = (error as NodeJS.ErrnoException).code
      if (attempt >= 4 || !['EBUSY','EPERM','EACCES'].includes(code ?? '')) throw error
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 25 * (attempt + 1))
    }
  }
}

export interface JsonFiles {
  read<T>(path: string, fallback: T): T
  write(path: string, data: unknown): void
  exists(path: string): boolean
  copy(from: string, to: string): void
}

export const localJsonFiles: JsonFiles = {
  read: readJson,
  write: writeJson,
  exists: existsSync,
  copy: (from, to) => { copyFileSync(from, to) },
}
