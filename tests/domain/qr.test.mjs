import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseVoucherQr } from '../../src/features/hotspot/qr.ts'

test('QR decoder accepts only one voucher code, never an URL or embedded account data', () => {
  assert.equal(parseVoucherQr(' sss-demo-12345 '), 'SSS-DEMO-12345')
  assert.equal(parseVoucherQr('{"code":"SSS-DEMO-12345","password":"secret"}'), null)
  assert.equal(parseVoucherQr('https://example.com/?code=SSS-DEMO-12345'), null)
  assert.equal(parseVoucherQr('abc'), null)
})
