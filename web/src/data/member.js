import { structuredReference } from '../lib/invoice.js'

// The demo member. Until real accounts exist, signing in gives you this history,
// so the account pages can be designed and shown with believable content.
export const DEMO_MEMBER = {
  firstName: 'Hanne',
  lastName: 'Willems',
  email: 'hanne@example.com',
  role: 'member',
  plan: 'yearly',
  courses: [], // courses bought one by one
  since: '2026-03-14',
  endDate: '2027-03-14',
  // lesson numbers that were watched, per course
  progress: {
    'n8n-basics': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    'webhooks-from-zero': [1, 2, 3, 4, 5],
    'ai-agents-with-n8n': [1, 2],
  },
  invoices: [
    { number: '2026-0143', date: '2026-03-14', product: 'Yearly subscription', excl: 149, vat: 31.29, total: 180.29, reference: structuredReference(2026, 143), status: 'paid' },
    { number: '2025-0098', date: '2025-03-12', product: 'Yearly subscription', excl: 149, vat: 31.29, total: 180.29, reference: structuredReference(2025, 98), status: 'paid' },
    { number: '2025-0021', date: '2025-01-20', product: 'Single course: n8n basics', excl: 39, vat: 8.19, total: 47.19, reference: structuredReference(2025, 21), status: 'paid' },
  ],
}

// Signing in as staff (demo) gives this person.
export const DEMO_STAFF = {
  role: 'staff',
  firstName: 'An',
  lastName: 'Vermeulen',
  email: 'an@loopcasts.example',
  plan: null,
  endDate: null,
  courses: [],
  progress: {},
  invoices: [],
}
