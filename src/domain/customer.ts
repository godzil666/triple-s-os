/** Format validation only; no lookup of WhatsApp registration or ownership. */
export function normalizeCustomer(name: unknown, whatsapp: unknown) {
  if (typeof name !== 'string' || typeof whatsapp !== 'string') throw new Error('INVALID_CONTACT')
  const customerName = name.trim().replace(/\s+/g, ' ')
  if (customerName.length < 2 || customerName.length > 80 || !/\p{L}/u.test(customerName) || /[<>\p{Cc}]/u.test(customerName)) throw new Error('INVALID_NAME')
  if (whatsapp.length > 40 || !/^\+?[\d\s().-]+$/.test(whatsapp.trim())) throw new Error('INVALID_WHATSAPP')
  let digits = whatsapp.replace(/[\s().-]/g, '')
  if (digits.startsWith('08')) digits = '+62' + digits.slice(1)
  else if (digits.startsWith('628')) digits = '+' + digits
  if (!/^\+628\d{8,11}$/.test(digits)) throw new Error('INVALID_WHATSAPP')
  return { customerName, customerWhatsapp: digits }
}
