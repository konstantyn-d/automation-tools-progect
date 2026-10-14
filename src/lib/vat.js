// VAT rules from the to-be model. n8n decides; this mirrors the rule for the live preview only.
// BE: 21% always. EU company with a VIES-valid number: 0% reverse charge.
// EU private customer: 21% (simplified for the course project). Outside the EU: 0%.
export const EU = ['AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI', 'FR', 'GR', 'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK'];

export const COUNTRIES = [
  ['BE', 'Belgium'], ['NL', 'Netherlands'], ['FR', 'France'], ['DE', 'Germany'],
  ['LU', 'Luxembourg'], ['ES', 'Spain'], ['IT', 'Italy'], ['PL', 'Poland'],
  ['GB', 'United Kingdom'], ['CH', 'Switzerland'], ['US', 'United States'], ['NO', 'Norway'],
];

export function vatRule({ country, isCompany, vatValid }) {
  if (country === 'BE') return { rate: 0.21, label: 'BE VAT 21%' };
  if (EU.includes(country)) {
    if (isCompany && vatValid) return { rate: 0, label: 'VAT reverse charged (art. 196 VAT Directive)' };
    return { rate: 0.21, label: 'VAT 21%' };
  }
  return { rate: 0, label: 'Outside the EU, no VAT' };
}

export const eur = (n) =>
  new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR' }).format(n);
