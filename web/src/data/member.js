// The demo member. Until real accounts exist, signing in gives you this history,
// so the account pages can be designed and shown with believable content.
export const DEMO_MEMBER = {
  firstName: 'Hanne',
  lastName: 'Willems',
  email: 'hanne@example.com',
  plan: 'yearly',
  course: null,
  since: '2026-03-14',
  endDate: '2027-03-14',
  // lesson numbers that were watched, per course
  progress: {
    'n8n-basics': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    'webhooks-from-zero': [1, 2, 3, 4, 5],
    'ai-agents-with-n8n': [1, 2],
  },
  invoices: [
    { number: '2026-0143', date: '2026-03-14', product: 'Yearly subscription', excl: 149, vat: 31.29, total: 180.29, reference: '+++143/2026/00187+++', status: 'paid' },
    { number: '2025-0098', date: '2025-03-12', product: 'Yearly subscription', excl: 149, vat: 31.29, total: 180.29, reference: '+++098/2025/00264+++', status: 'paid' },
    { number: '2025-0021', date: '2025-01-20', product: 'Single course: n8n basics', excl: 39, vat: 8.19, total: 47.19, reference: '+++021/2025/00073+++', status: 'paid' },
  ],
}

export const ADMIN_ORDERS = [
  { id: 'O-1187', customer: 'Hanne Willems', product: 'Yearly subscription', total: 180.29, state: 'access', when: '09:41' },
  { id: 'O-1186', customer: 'De Vries Analytics', product: 'Team licence', total: 599.0, state: 'waiting', when: '09:12' },
  { id: 'O-1185', customer: 'Jesse Claes', product: 'Single course', total: 47.19, state: 'access', when: 'yesterday' },
  { id: 'O-1184', customer: 'Studio Noord BV', product: 'Yearly subscription', total: 149.0, state: 'review', when: 'yesterday' },
  { id: 'O-1183', customer: 'Amira Haddad', product: 'Monthly subscription', total: 18.15, state: 'access', when: 'Friday' },
]
