// Belgian structured payment reference ("gestructureerde mededeling"): +++123/4567/89012+++
// Ten digits and two check digits: the check is the ten-digit number modulo 97 (97 when that is 0).
// We build the ten digits from the invoice: year (4) + sequence number (4) + 00.
export function structuredReference(year, sequence) {
  const base = `${year}${String(sequence).padStart(4, '0')}00`
  const check = Number(BigInt(base) % 97n) || 97
  const digits = base + String(check).padStart(2, '0')
  return `+++${digits.slice(0, 3)}/${digits.slice(3, 7)}/${digits.slice(7)}+++`
}

// Checks a reference the way a bank does. Accepts it with or without the +++ and slashes.
export function isValidReference(reference) {
  const digits = String(reference || '').replace(/\D/g, '')
  if (digits.length !== 12) return false
  const check = Number(BigInt(digits.slice(0, 10)) % 97n) || 97
  return check === Number(digits.slice(10))
}

export function invoiceNumber(year, sequence) {
  return `${year}-${String(sequence).padStart(4, '0')}`
}
