// EU VIES VAT number check (official REST API, free, no key).
// https://ec.europa.eu/taxation_customs/vies/#/technical-information
const VIES_URL = 'https://ec.europa.eu/taxation_customs/vies/rest-api/check-vat-number';

export const normaliseVat = (raw) => String(raw ?? '').replace(/[\s.\-]/g, '').toUpperCase();

export async function checkVat(raw, { timeoutMs = 8000 } = {}) {
  const vat = normaliseVat(raw);
  const m = vat.match(/^([A-Z]{2})([0-9A-Z]{2,13})$/);
  if (!m) return { status: 'invalid', vat, message: 'This does not look like an EU VAT number (e.g. BE0123456789).' };
  // Greece uses EL in VIES
  const countryCode = m[1] === 'GR' ? 'EL' : m[1];

  try {
    const res = await fetch(VIES_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ countryCode, vatNumber: m[2] }),
      signal: AbortSignal.timeout(timeoutMs),
    });
    const data = await res.json().catch(() => ({}));
    // VIES answers 200 with an error code when a member state service is down
    if (!res.ok || data.actionSucceed === false || data.errorWrappers) {
      return { status: 'unavailable', vat, message: 'VIES did not answer. Your order is kept and our team checks the number.' };
    }
    const clean = (s) => (s && s !== '---' ? s.trim() : null);
    return data.valid
      ? { status: 'valid', vat, name: clean(data.name), address: clean(data.address), checkedAt: data.requestDate }
      : { status: 'invalid', vat, message: 'VIES says this VAT number is not valid.' };
  } catch {
    return { status: 'unavailable', vat, message: 'VIES did not answer. Your order is kept and our team checks the number.' };
  }
}
