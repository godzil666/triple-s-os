import { basename } from 'node:path'
import { readFileSync } from 'node:fs'
import { Pool } from 'pg'
import type { JsonFiles } from './files.ts'

type Documents = Record<string, unknown>

let pool: Pool | undefined

export function previewPoolOptions(connectionString: string) {
  const url = new URL(connectionString)
  // pg-connection-string lets URL SSL parameters replace the supplied ssl object.
  for (const key of ['sslmode', 'sslrootcert', 'sslcert', 'sslkey', 'ssl']) url.searchParams.delete(key)
  return {
    connectionString: url.toString(),
    max: 1,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 5_000,
    ssl: {
      ca: readFileSync(new URL('./certs/supabase-root-2021.crt', import.meta.url), 'utf8'),
      rejectUnauthorized: true,
    },
  }
}

function databasePool() {
  const connectionString = process.env.SSS_PREVIEW_DATABASE_URL
  if (process.env.APP_ENV !== 'client-preview' || !connectionString) throw new Error('CLIENT_PREVIEW_NOT_CONFIGURED')
  return pool ??= new Pool(previewPoolOptions(connectionString))
}

/** One locked aggregate preserves the existing versioned domain store across serverless instances. */
export async function withPreviewDocuments<T>(work: (files: JsonFiles, documents: Documents) => Promise<T>): Promise<T> {
  const client = await databasePool().connect()
  try {
    await client.query('BEGIN')
    const row = await client.query<{ payload: Documents }>("SELECT payload FROM client_preview.documents WHERE id = 'app' FOR UPDATE")
    if (row.rowCount !== 1) throw new Error('CLIENT_PREVIEW_SCHEMA_MISSING')
    const documents = structuredClone(row.rows[0].payload)
    const key = (path: string) => basename(path.replaceAll('\\', '/'))
    const files: JsonFiles = {
      read: <T>(path: string, fallback: T): T => key(path) in documents ? structuredClone(documents[key(path)] as T) : fallback,
      write: (path, data) => { documents[key(path)] = structuredClone(data) },
      exists: path => key(path) in documents,
      copy: (from, to) => { if (!(key(from) in documents)) throw new Error('CLIENT_PREVIEW_SOURCE_MISSING'); documents[key(to)] = structuredClone(documents[key(from)]) },
    }
    const result = await work(files, documents)
    await client.query("UPDATE client_preview.documents SET payload = $1::jsonb, updated_at = now() WHERE id = 'app'", [JSON.stringify(documents)])
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
