// Belgian structured payment reference (OGM / "gestructureerde mededeling").
// Format +++123/4567/89012+++ : 10 digits + 2 check digits (base mod 97, 0 becomes 97).
// The real number comes from n8n (derived from the invoice number); this mirrors the rule.
export function makeOGM(base) {
  const digits = String(base).replace(/\D/g, '').padStart(10, '0').slice(-10);
  let check = Number(BigInt(digits) % 97n);
  if (check === 0) check = 97;
  const all = digits + String(check).padStart(2, '0');
  return `+++${all.slice(0, 3)}/${all.slice(3, 7)}/${all.slice(7)}+++`;
}

export function isValidOGM(ogm) {
  const d = String(ogm).replace(/\D/g, '');
  if (d.length !== 12) return false;
  return makeOGM(d.slice(0, 10)) === ogm;
}
