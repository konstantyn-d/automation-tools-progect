// All editable content of the landing page lives in src/data, not inside the components.

// Every course: what it is, what you can do afterwards, and its lessons.
// The first lesson of every course is free to watch.
export { COURSES, TOPICS, LEVELS, findCourse } from './courses.js'

export const PLANS = [
  {
    id: 'yearly',
    name: 'Yearly subscription',
    price: 149,
    unit: 'per year',
    featured: true,
    blurb: 'Everything we make, for a full year. The one most people pick.',
    includes: [
      'All 60 courses and every new lesson',
      'Two new videos every week',
      'Chapters, transcripts and search',
      'Invoice with your VAT and PO number',
    ],
  },
  { id: 'monthly', name: 'Monthly subscription', price: 15, unit: 'per month', blurb: 'Access to everything. Stop whenever you like.' },
  { id: 'team', name: 'Team licence', price: 599, unit: 'per year', blurb: 'Five seats. Swap colleagues in and out yourself.' },
  { id: 'single', name: 'Single course', price: 39, unit: 'once', blurb: 'Lifetime access to the one course you need.' },
]

export const FAQ = [
  {
    q: 'Can I try before I pay?',
    a: 'Yes. The first lesson of every course is free to watch, without an account. That is usually enough to know whether the teacher and the pace suit you.',
  },
  {
    q: 'Do I need to know how to program?',
    a: 'Not for the beginner courses. They start from zero and you build along in the browser. Intermediate and advanced courses say at the top what you should already know.',
  },
  {
    q: 'Subscription or a single course?',
    a: 'A subscription opens everything, including the two new lessons that appear every week. A single course is a one-time payment and stays yours.',
  },
  {
    q: 'How do I pay, and when do I get access?',
    a: 'You order, receive an invoice by e-mail and pay by bank transfer. As soon as your payment is in, your login arrives by e-mail.',
  },
  {
    q: 'Can I get an invoice with our VAT or PO number?',
    a: 'Yes. Fill them in when you order and they are on the invoice from the start. Every invoice stays available in your account.',
  },
  {
    q: 'Does my subscription renew by itself?',
    a: 'No. We remind you 30 and 7 days before the end date. If you do not renew, access simply stops on the end date.',
  },
  {
    q: 'How do team seats work?',
    a: 'A team licence has five seats. The person who ordered can invite colleagues and replace a seat when somebody leaves.',
  },
]

export const WORDS = ['WEBHOOK', 'CRON', 'N8N', 'AGENTS', 'API', 'JSON', 'RETRY', 'OAUTH', 'DOCKER', 'REGEX']
