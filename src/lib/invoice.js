import { eur } from './vat.js';

// Mock only: opens a printable invoice ("Save as PDF").
// In production n8n renders the PDF from the invoice template and stores it;
// the site links to that file.
export function openInvoice(o) {
  const w = window.open('', '_blank');
  if (!w) return;
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Invoice ${esc(o.invoiceNo)}</title>
  <style>
    body{font-family:system-ui,sans-serif;max-width:720px;margin:48px auto;padding:0 24px;color:#0a0a0a}
    h1{font-size:40px;letter-spacing:-.03em;margin:0 0 4px} .dim{color:#6f6f6a}
    table{width:100%;border-collapse:collapse;margin:32px 0} td,th{padding:10px 0;border-bottom:1px solid #e6e6e1;text-align:left}
    td:last-child,th:last-child{text-align:right} .tot td{font-weight:700;font-size:20px;border:0}
    .ogm{font-family:monospace;font-size:22px;border:1px dashed #0a0a0a;padding:12px 16px;display:inline-block;border-radius:10px}
    .row{display:flex;justify-content:space-between;gap:24px}
  </style></head><body>
  <div class="row"><div><h1>Invoice</h1><div class="dim">No. ${esc(o.invoiceNo)} · ${new Date(o.createdAt).toLocaleDateString('nl-BE')}</div></div>
  <div style="text-align:right"><b>LoopCasts BV</b><br><span class="dim">Gent, Belgium<br>BE 0700.000.000</span></div></div>
  <p style="margin-top:32px"><b>Billed to</b><br>${o.company ? esc(o.company) + '<br>' : ''}${esc(o.name)}<br>${esc(o.email)}${o.po ? '<br>PO ' + esc(o.po) : ''}</p>
  <table><tr><th>Description</th><th>Amount</th></tr>
  <tr><td>${esc(o.plan)}${o.seats > 1 ? ' × ' + o.seats + ' seats' : ''}</td><td>${eur(o.gross)}</td></tr>
  ${o.discount ? `<tr><td>Discount</td><td>− ${eur(o.discount)}</td></tr>` : ''}
  <tr><td>${esc(o.vatLabel)}</td><td>${eur(o.vat)}</td></tr>
  <tr class="tot"><td>Total</td><td>${eur(o.total)}</td></tr></table>
  <p>Please transfer to <b>${esc(o.iban)}</b> (${esc(o.bic)}) within 14 days with this reference:</p>
  <div class="ogm">${esc(o.ogm)}</div>
  <p class="dim" style="margin-top:48px;font-size:12px">Mock invoice generated in the browser. The real PDF is created by the n8n invoice workflow.</p>
  <script>setTimeout(()=>print(),300)</script></body></html>`);
  w.document.close();
}
