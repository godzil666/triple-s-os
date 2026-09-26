/** The demo QR contains one voucher credential only; it never carries an order or account URL. */
export function parseVoucherQr(value: string): string | null {
  const code = value.trim().toUpperCase()
  return /^[A-Z0-9][A-Z0-9-]{5,159}$/.test(code) ? code : null
}
