import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
export function readJson<T>(path: string, fallback: T): T { return existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) as T : fallback }
export function writeJson(path: string, data: unknown) {
  mkdirSync(dirname(path), { recursive: true })
  const temporary = `${path}.tmp`
  writeFileSync(temporary, JSON.stringify(data, null, 2), { encoding: 'utf8', mode: 0o600 })
  renameSync(temporary, path)
}
