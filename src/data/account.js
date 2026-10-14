// Mock account returned by the /webhook/account endpoint while n8n is not connected.
import { makeOGM } from '../lib/ogm.js';
export const MOCK_ACCOUNT = {
  user: { name: 'An Vermeulen', email: 'an@vermeulen.be', role: 'Team owner' },
  subscription: {
    plan: 'Team licence', status: 'expiring', seats: 5, renewsAt: '2026-11-01', daysLeft: 18,
    price: 129,
  },
  billing: {
    company: 'Vermeulen BV', vat: 'BE0412345678', vatStatus: 'valid', po: 'PO-2026-118',
    address: 'Kerkstraat 12, 9000 Gent', country: 'BE', invoiceEmail: 'boekhouding@vermeulen.be',
  },
  members: [
    { email: 'an@vermeulen.be', name: 'An Vermeulen', status: 'active' },
    { email: 'pieter@vermeulen.be', name: 'Pieter Claes', status: 'active' },
    { email: 'sara@vermeulen.be', name: 'Sara Wouters', status: 'invited' },
  ],
  invoices: [
    { no: '2026-0098', date: '2026-01-05', amount: 780.45, status: 'paid', ogm: makeOGM('20260098') },
    { no: '2026-0124', date: '2026-03-14', amount: 156.09, status: 'paid', ogm: makeOGM('20260124') },
    { no: '2026-0136', date: '2026-10-01', amount: 156.09, status: 'open', ogm: makeOGM('20260136') },
  ],
  progress: [
    { slug: 'n8n-automation', title: 'Automating admin with n8n', pct: 62 },
    { slug: 'gdpr-small-business', title: 'GDPR for small businesses', pct: 100 },
    { slug: 'excel-power-query', title: 'Power Query without fear', pct: 18 },
  ],
};
