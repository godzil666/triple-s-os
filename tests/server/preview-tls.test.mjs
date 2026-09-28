import test from 'node:test'
import assert from 'node:assert/strict'
import { X509Certificate } from 'node:crypto'
import pg from 'pg'
import { previewPoolOptions } from '../../server/preview-persistence.ts'

test('preview Postgres uses the Supabase CA and keeps hostname verification even with URL SSL overrides', () => {
  const options = previewPoolOptions('postgresql://example:placeholder@pooler.supabase.com:6543/postgres?sslmode=no-verify&ssl=0')
  const client = new pg.Client(options)
  const certificate = new X509Certificate(options.ssl.ca)

  assert.equal(client.connectionParameters.ssl.rejectUnauthorized, true)
  assert.equal(client.connectionParameters.ssl.ca, options.ssl.ca)
  assert.equal(client.connectionParameters.host, 'pooler.supabase.com')
  assert.equal(new URL(options.connectionString).searchParams.has('sslmode'), false)
  assert.equal(certificate.ca, true)
  assert.match(certificate.subject, /CN=Supabase Root 2021 CA/)
})
