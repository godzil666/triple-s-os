import test from 'node:test'
import assert from 'node:assert/strict'
import { previewOrigins } from '../../api/index.ts'

test('preview origins allow only exact configured HTTPS deployment and branch domains', () => {
  assert.deepEqual(previewOrigins({ VERCEL_URL: 'app-123.vercel.app', VERCEL_BRANCH_URL: 'app-git-preview.vercel.app', SSS_PUBLIC_ORIGIN: 'https://preview.example' }), ['https://preview.example', 'https://app-123.vercel.app', 'https://app-git-preview.vercel.app'])
  assert.deepEqual(previewOrigins({ VERCEL_URL: 'app.vercel.app', SSS_PUBLIC_ORIGIN: 'https://app.vercel.app' }), ['https://app.vercel.app'])
  for (const origin of ['http://preview.example', 'https://preview.example/path', 'https://preview.example?query=1', 'https://user:password@preview.example']) assert.throws(() => previewOrigins({ SSS_PUBLIC_ORIGIN: origin }))
  assert.throws(() => previewOrigins({}))
})
