// VAT rules of LoopCasts (handbook chapter 1), written down once as code
// instead of worked out on a phone calculator for every invoice.
//
//  - Belgian customers: 21%
//  - private persons in another EU country: 21%
//  - companies in another EU country with a VAT number: 0%, "VAT reverse charged"
//  - outside the EU: 0%

export const EU_COUNTRIES = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE',
  'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
]

export const COUNTRIES = [
  { code: 'BE', name: 'Belgium' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'IE', name: 'Ireland' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'PT', name: 'Portugal' },
  { code: 'PL', name: 'Poland' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' },
  { code: 'OTHER', name: 'Other (outside EU)' },
]

// Format check only. The real check against the EU VIES service happens later in n8n.
export function looksLikeVatNumber(value) {
  const clean = String(value || '').replace(/[\s.\-]/g, '').toUpperCase()
  return /^[A-Z]{2}[A-Z0-9]{8,12}$/.test(clean)
}

export function calculateVat({ priceExcl, country, isCompany, vatNumber }) {
  const inEu = EU_COUNTRIES.includes(country)
  let rate = 0
  let note = 'Outside the EU: no Belgian VAT'

  if (country === 'BE') {
    rate = 0.21
    note = 'Belgian VAT 21%'
  } else if (inEu && isCompany && looksLikeVatNumber(vatNumber)) {
    rate = 0
    note = 'VAT reverse charged'
  } else if (inEu) {
    rate = 0.21
    note = 'VAT 21%'
  }

  const vat = Math.round(priceExcl * rate * 100) / 100
  return { rate, vat, total: Math.round((priceExcl + vat) * 100) / 100, note }
}

export function euro(amount) {
  return new Intl.NumberFormat('en-BE', { style: 'currency', currency: 'EUR' }).format(amount)
}
