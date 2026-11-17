import { seeded } from '../lib/random.js'
import { calculateVat } from '../lib/vat.js'
import { invoiceNumber, structuredReference } from '../lib/invoice.js'
import { COURSES, findCourse } from './courses.js'
import { PLANS } from './site.js'

// Sample data for the admin panel. There is no database yet, so this file
// builds a believable month of LoopCasts: customers, orders, invoices, bank lines,
// members and support mails. Everything is dated relative to today, so the panel
// always looks current. Later the same shapes come from the database.

const DAY = 86400000
export const PRICE = Object.fromEntries(PLANS.map((p) => [p.id, p.price]))
export const PRODUCT_NAME = {
  yearly: 'Yearly subscription',
  monthly: 'Monthly subscription',
  team: 'Team licence (5 seats)',
  single: 'Single course',
}
export const PAYMENT_DAYS = 14

const iso = (date) => new Date(date).toISOString()
const isoDay = (date) => iso(date).slice(0, 10)

export function productLabel(order) {
  if (order.product === 'single') return `Single course: ${findCourse(order.course)?.title || order.course}`
  return PRODUCT_NAME[order.product]
}

// --- customers -----------------------------------------------------------------------------

const PEOPLE = [
  ['Hanne Willems', 'BE', 'nl'], ['Tom Peeters', 'BE', 'nl'], ['Elise Jacobs', 'BE', 'nl'],
  ['Arne De Clercq', 'BE', 'nl'], ['Julie Mertens', 'BE', 'nl'], ['Thomas Dubois', 'BE', 'fr'],
  ['Camille Lambert', 'BE', 'fr'], ['Noah Wouters', 'BE', 'nl'], ['Fien Goossens', 'BE', 'nl'],
  ['Bram Hermans', 'BE', 'nl'], ['Lars de Jong', 'NL', 'nl'], ['Sanne Bakker', 'NL', 'nl'],
  ['Daan Visser', 'NL', 'nl'], ['Emma Smit', 'NL', 'nl'], ['Léa Moreau', 'FR', 'fr'],
  ['Lukas Becker', 'DE', 'en'], ['Marta Kowalska', 'PL', 'en'], ['Giulia Romano', 'IT', 'en'],
  ['Pablo Ortega', 'ES', 'en'], ['Aoife Byrne', 'IE', 'en'], ['Ben Carter', 'GB', 'en'],
  ['Mila Claes', 'BE', 'nl'], ['Robbe Maes', 'BE', 'nl'], ['Nina Vos', 'NL', 'nl'],
  ['Kobe Lemmens', 'BE', 'nl'], ['Sarah Janssens', 'BE', 'nl'], ['Victor Lefèvre', 'BE', 'fr'],
  ['Jana Novak', 'SI', 'en'], ['Oskar Lind', 'SE', 'en'], ['Ruben Aerts', 'BE', 'nl'],
]

const COMPANIES = [
  ['Pieter Vandamme', 'De Vries Analytics', 'NL', 'NL859301245B01', 'nl'],
  ['Lien Dewulf', 'Studio Noord BV', 'BE', 'BE0712345634', 'nl'],
  ['Wim Segers', 'Datawerk BV', 'BE', 'BE0634112980', 'nl'],
  ['Clara Hoffmann', 'Brightlane GmbH', 'DE', 'DE298374615', 'en'],
  ['Marco Ferro', 'Ferro Logistics NV', 'BE', 'BE0476902113', 'en'],
  ['Inge Smets', 'Kantoor Smets', 'BE', 'BE0599871230', 'nl'],
]

const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]+/g, '.').replace(/^\.|\.$/g, '')

function buildCustomers() {
  const people = PEOPLE.map(([name, country, lang], i) => ({
    id: `C-${String(i + 1).padStart(3, '0')}`,
    name,
    email: `${slug(name)}@example.com`,
    company: null,
    vatNumber: null,
    country,
    lang,
  }))
  const companies = COMPANIES.map(([name, company, country, vatNumber, lang], i) => ({
    id: `C-${String(PEOPLE.length + i + 1).padStart(3, '0')}`,
    name,
    email: `${slug(name.split(' ')[0])}@${slug(company).replace(/\.(bv|nv|gmbh)$/, '').replace(/\./g, '')}.example`,
    company,
    vatNumber,
    country,
    lang,
  }))
  return [...people, ...companies]
}

// --- orders and invoices -------------------------------------------------------------------

function pick(rand, list) {
  return list[Math.floor(rand() * list.length)]
}

export function priceFor(product, customer) {
  const excl = PRICE[product]
  const v = calculateVat({ priceExcl: excl, country: customer.country, isCompany: !!customer.company, vatNumber: customer.vatNumber })
  return { excl, vat: v.vat, total: v.total, vatNote: v.note }
}

export function makeInvoice({ seq, year, order, customer, date }) {
  return {
    number: invoiceNumber(year, seq),
    seq,
    year,
    date: isoDay(date),
    due: isoDay(new Date(date).getTime() + PAYMENT_DAYS * DAY),
    customerId: customer.id,
    orderId: order.id,
    product: productLabel(order),
    excl: order.excl,
    vat: order.vat,
    total: order.total,
    vatNote: order.vatNote,
    reference: structuredReference(year, seq),
    status: 'open',
    paidAt: null,
    reminders: 0,
  }
}

function buildOrders(customers, now) {
  const rand = seeded(20261117)
  const people = customers.filter((c) => !c.company)
  const companies = customers.filter((c) => c.company)
  const year = now.getFullYear()

  // 40 order moments over the last 35 days, oldest first
  const moments = Array.from({ length: 40 }, () => now.getTime() - rand() * 35 * DAY).sort((a, b) => a - b)
  const popular = [...COURSES].sort((a, b) => b.students - a.students).slice(0, 24)

  const orders = []
  const invoices = []
  let seq = 106

  moments.forEach((t, i) => {
    const r = rand()
    let product = r < 0.4 ? 'yearly' : r < 0.65 ? 'monthly' : r < 0.9 ? 'single' : 'team'
    const customer = product === 'team' || rand() < 0.12 ? pick(rand, companies) : pick(rand, people)
    if (product === 'team' && !customer.company) product = 'yearly'
    const order = {
      id: `O-${1150 + i}`,
      at: iso(t),
      customerId: customer.id,
      product,
      course: product === 'single' ? pick(rand, popular).slug : null,
      ...priceFor(product, customer),
      status: 'access',
      invoice: null,
      issue: null,
      source: 'Website',
    }
    const ageDays = (now.getTime() - t) / DAY
    if (ageDays < 3) order.status = 'waiting'
    orders.push(order)
  })

  // the exceptions a person has to look at
  const review = orders[orders.length - 4]
  review.customerId = companies[3].id // Brightlane GmbH
  Object.assign(review, { product: 'team', course: null, ...priceFor('team', companies[3]) })
  review.status = 'review'
  review.issue = 'VAT number DE298374615 was not found in the EU VIES register. Reverse charge cannot be applied until it is checked.'

  const failed = orders[orders.length - 7]
  failed.status = 'failed'
  failed.issue = 'Invoice e-mail could not be sent: mail server timed out 3 times (SMTP 421).'

  const overdue = orders.find((o) => (now.getTime() - new Date(o.at).getTime()) / DAY > 18 && o.product !== 'team')
  overdue.status = 'waiting'

  for (const order of orders) {
    if (order.status === 'review') continue
    const customer = customers.find((c) => c.id === order.customerId)
    const invoice = makeInvoice({ seq: seq++, year, order, customer, date: order.at })
    order.invoice = invoice.number
    if (order.status === 'access') {
      invoice.status = 'paid'
      invoice.paidAt = iso(new Date(order.at).getTime() + (0.2 + rand() * 2.2) * DAY)
    }
    if (order === overdue) invoice.reminders = 1
    invoices.push(invoice)
  }
  return { orders, invoices, nextSeq: seq }
}

// --- bank ----------------------------------------------------------------------------------

const ibanFor = (customer) => {
  const n = [...customer.id].reduce((a, c) => a * 31 + c.charCodeAt(0), 7) % 1e10
  return `${customer.country === 'NL' ? 'NL' : 'BE'}${String(n % 89 + 10)} ${String(n).padStart(10, '0').replace(/(\d{4})/g, '$1 ').trim()}`
}

// Bank lines that were matched earlier, one per paid invoice.
function buildBankHistory(invoices, customers) {
  return invoices
    .filter((inv) => inv.status === 'paid')
    .map((inv, i) => {
      const customer = customers.find((c) => c.id === inv.customerId)
      return {
        id: `B-${String(500 + i)}`,
        date: inv.paidAt.slice(0, 10),
        amount: inv.total,
        name: (customer.company || customer.name).toUpperCase(),
        iban: ibanFor(customer),
        message: inv.reference,
        status: 'matched',
        invoice: inv.number,
        note: 'Structured reference and amount match.',
        by: 'auto',
      }
    })
}

// The "sample bank file": what today's export from the bank looks like.
// Built from the invoices that are open right now, so it always fits the data on screen.
export function sampleBankFile(state) {
  const open = state.invoices.filter((inv) => inv.status === 'open').sort((a, b) => a.date.localeCompare(b.date))
  const customer = (inv) => state.customers.find((c) => c.id === inv.customerId)
  const today = isoDay(Date.now())
  const lines = []
  open.forEach((inv, i) => {
    const c = customer(inv)
    if (i === 0) return // the oldest one stays unpaid: it needs a reminder
    if (i === 1) {
      // paid without VAT: partial payment
      lines.push({ date: today, amount: inv.excl, name: c.name.toUpperCase(), iban: ibanFor(c), message: inv.reference })
      return
    }
    if (i === 2) {
      // no reference at all, only a vague message
      lines.push({ date: today, amount: inv.total, name: (c.company || c.name).toUpperCase(), iban: ibanFor(c), message: 'loopcasts abonnement' })
      return
    }
    lines.push({ date: today, amount: inv.total, name: (c.company || c.name).toUpperCase(), iban: ibanFor(c), message: inv.reference })
  })
  const paid = state.invoices.filter((inv) => inv.status === 'paid')
  const twice = paid[paid.length - 1]
  if (twice) {
    const c = customer(twice)
    lines.push({ date: today, amount: twice.total, name: (c.company || c.name).toUpperCase(), iban: ibanFor(c), message: twice.reference })
  }
  lines.push({ date: today, amount: 12.4, name: 'GOOGLE IRELAND LTD', iban: 'IE29 AIBK 9311 5212 3456 78', message: 'REFUND WORKSPACE 10/2026' })
  return lines
}

export function bankFileCsv(lines) {
  const head = 'date;amount;name;iban;message'
  return [head, ...lines.map((l) => [l.date, l.amount.toFixed(2).replace('.', ','), l.name, l.iban, l.message].join(';'))].join('\n')
}

// --- members -------------------------------------------------------------------------------

function buildMembers(orders, customers, now) {
  const rand = seeded(9917)
  const members = []
  const add = (customer, fields) => {
    const existing = members.find((m) => m.customerId === customer.id)
    if (existing) {
      if (fields.course) existing.courses = [...new Set([...existing.courses, fields.course])]
      if (fields.plan) Object.assign(existing, { plan: fields.plan, end: fields.end })
      return
    }
    members.push({
      id: `M-${String(members.length + 1).padStart(3, '0')}`,
      customerId: customer.id,
      name: customer.name,
      email: customer.email,
      plan: fields.plan || null,
      start: fields.start,
      end: fields.end || null,
      courses: fields.course ? [fields.course] : [],
      seats: fields.plan === 'team' ? 5 : 1,
      access: 'open',
      lastSeen: iso(now.getTime() - rand() * 6 * DAY),
    })
  }

  // older members: some end soon, a few have already ended
  const older = customers.slice(4, 24)
  older.forEach((customer, i) => {
    const startDaysAgo = 40 + Math.floor(rand() * 320)
    const start = now.getTime() - startDaysAgo * DAY
    let plan = i % 4 === 0 ? 'monthly' : 'yearly'
    let end = plan === 'monthly' ? now.getTime() + (3 + rand() * 25) * DAY : start + 365 * DAY
    if (i === 3 || i === 11) end = now.getTime() + (4 + i) * DAY // ending soon
    if (i === 7 || i === 15 || i === 18) end = now.getTime() - (2 + i) * DAY // ended
    add(customer, { plan, start: isoDay(start), end: isoDay(end) })
  })

  for (const order of orders) {
    if (order.status !== 'access') continue
    const customer = customers.find((c) => c.id === order.customerId)
    const start = new Date(order.at)
    if (order.product === 'single') add(customer, { course: order.course, start: isoDay(start) })
    else {
      const end = new Date(start)
      if (order.product === 'monthly') end.setMonth(end.getMonth() + 1)
      else end.setFullYear(end.getFullYear() + 1)
      add(customer, { plan: order.product, start: isoDay(start), end: isoDay(end) })
    }
  }

  // the nightly check closes access the day after the end date
  for (const m of members) {
    if (m.end && new Date(m.end) < now && m.plan) m.access = 'closed'
  }
  return members
}

// --- support -------------------------------------------------------------------------------

function buildTickets(customers, invoices, now) {
  const ago = (hours) => iso(now.getTime() - hours * 3600000)
  const c = (i) => customers[i]
  const paidInvoice = invoices.filter((inv) => inv.status === 'paid').slice(-3)[0]
  const tickets = [
    {
      from: c(1), hours: 0.6, lang: 'en', category: 'Access', confidence: 0.93,
      subject: 'Paid but no login yet',
      body: `Hi, I paid my subscription yesterday evening (reference ${paidInvoice?.reference}) but I still have no login mail. Can you check? Thanks, Tom`,
      facts: [`Invoice ${paidInvoice?.number} is paid`, 'Account exists, password link was sent', 'Link was not opened yet'],
      draft: 'Hi Tom,\n\nYour payment arrived and your account is ready. We just sent the password link again to this address. It is valid for 24 hours. If it does not show up, please look in your spam folder.\n\nHappy watching,\nLoopCasts',
    },
    {
      from: c(10), hours: 1.4, lang: 'nl', category: 'Password', confidence: 0.97,
      subject: 'Wachtwoord vergeten',
      body: 'Hallo, ik kan niet meer inloggen. Ik ben mijn wachtwoord vergeten. Groeten, Lars',
      facts: ['Active yearly subscription', 'Language: Dutch'],
      draft: 'Dag Lars,\n\nGeen probleem. We hebben je net een link gestuurd om een nieuw wachtwoord te kiezen. De link blijft 24 uur geldig.\n\nVeel kijkplezier,\nLoopCasts',
    },
    {
      from: c(32), hours: 3, lang: 'en', category: 'Invoice', confidence: 0.88,
      subject: 'Invoice with our VAT number please',
      body: 'Hello, our accounting needs the invoice for the team licence with our VAT number BE0634112980 on it. Could you send a corrected copy? Kind regards, Wim (Datawerk BV)',
      facts: ['Customer is a company, VAT number BE0634112980 is valid', 'Latest invoice already shows the number'],
      draft: 'Hello Wim,\n\nThe invoice for your team licence already carries your VAT number BE0634112980. We attached the PDF again to this mail.\n\nKind regards,\nLoopCasts',
    },
    {
      from: c(14), hours: 5, lang: 'fr', category: 'Cancellation', confidence: 0.81,
      subject: 'Résiliation abonnement',
      body: "Bonjour, je voudrais arrêter mon abonnement mensuel à la fin du mois. Merci, Léa",
      facts: ['Monthly subscription, renews in 9 days', 'Cancel before renewal: no costs'],
      draft: "Bonjour Léa,\n\nC'est noté : votre abonnement mensuel s'arrêtera à la fin de la période en cours. Vous gardez l'accès jusqu'à cette date.\n\nBien à vous,\nLoopCasts",
    },
    {
      from: c(19), hours: 7, lang: 'en', category: 'Refund', confidence: 0.74, needsPerson: true,
      subject: 'Refund request',
      body: 'I bought the yearly plan by mistake, I wanted monthly. Can I get my money back? Aoife',
      facts: ['Yearly subscription bought 2 days ago', 'Refunds are decided by a person (handbook rule)'],
      draft: 'Hi Aoife,\n\nThanks for letting us know. A colleague will look at your request today and get back to you about the refund or a switch to monthly.\n\nKind regards,\nLoopCasts',
    },
    {
      from: { name: 'LoopCasts Billing', email: 'billing@loopcasts-payments.example' }, hours: 8, lang: 'en', category: 'Suspicious', confidence: 0.96, risk: 'Looks like phishing',
      subject: 'URGENT: invoice overdue, pay today',
      body: 'Dear customer, your invoice is overdue. Pay €1,240 today to the new account BE71 0961 2345 6769 to avoid suspension. Click here to confirm.',
      facts: ['Sender domain is not ours', 'Asks to pay a new bank account', 'No invoice of €1,240 exists'],
      draft: '',
    },
    {
      from: { name: 'Hanne Willems', email: 'hanne.w.backup@mailbox.example' }, hours: 11, lang: 'en', category: 'Account', confidence: 0.69, risk: 'Different e-mail address', needsPerson: true,
      subject: 'Send my password to my new address',
      body: 'Hi, this is Hanne Willems. I lost access to my mail. Please send my password to this address instead. Thanks!',
      facts: ['Sent from an address that is not on the account', 'We never send passwords by mail'],
      draft: 'Hello,\n\nFor your safety we never send passwords by e-mail and we can only send a reset link to the address on the account. If you lost access to that address, please reply with your invoice number and a colleague will help you.\n\nKind regards,\nLoopCasts',
    },
    {
      from: c(17), hours: 20, lang: 'en', category: 'Technical', confidence: 0.84,
      subject: 'Video stays black',
      body: 'Hello, lesson 4 of Webhooks from zero only shows a black screen. Sound works. I use Safari. Giulia',
      facts: ['Lesson 4 plays for other members today', 'Known fix: update Safari or try Chrome'],
      draft: 'Hi Giulia,\n\nSorry about that. A black screen with sound usually goes away after updating Safari or in another browser such as Chrome or Firefox. If it stays black, reply and we will look at it together.\n\nKind regards,\nLoopCasts',
    },
    {
      from: c(34), hours: 26, lang: 'en', category: 'Sales', confidence: 0.79,
      subject: 'More seats for our team?',
      body: 'We have the team licence for 5 people. Two more colleagues want to join. What would that cost? Marco, Ferro Logistics',
      facts: ['Team licence, 5 of 5 seats in use', 'Extra seat: €99 a year excl. VAT'],
      draft: 'Hi Marco,\n\nGood to hear. An extra seat costs €99 a year excl. VAT, for the rest of your current licence year we charge the part that is left. Shall we add two seats and send the invoice?\n\nKind regards,\nLoopCasts',
    },
    {
      from: c(16), hours: 30, lang: 'en', category: 'Course question', confidence: 0.86, needsPerson: true,
      subject: 'Question about lesson 7',
      body: 'In "Error handling that holds" lesson 7, why do you put the retry before the alert and not after? Marta',
      facts: ['Content question: goes to the teacher (Wout Claes)'],
      draft: 'Hi Marta,\n\nGood question. We passed it to Wout, who teaches the course. You will hear from him within two working days.\n\nKind regards,\nLoopCasts',
    },
    {
      from: c(2), hours: 50, lang: 'nl', category: 'Invoice', confidence: 0.95, status: 'sent',
      subject: 'Factuur kwijt',
      body: 'Kan ik mijn factuur nog eens krijgen? Elise',
      facts: ['Invoice found and attached'],
      draft: 'Dag Elise,\n\nJe factuur zit als PDF in de bijlage.\n\nGroeten,\nLoopCasts',
    },
    {
      from: c(6), hours: 70, lang: 'fr', category: 'Password', confidence: 0.98, status: 'sent',
      subject: 'Mot de passe',
      body: "Je n'arrive pas à me connecter. Camille",
      facts: ['Reset link sent'],
      draft: 'Bonjour Camille,\n\nNous venons de vous envoyer un lien pour choisir un nouveau mot de passe.\n\nBien à vous,\nLoopCasts',
    },
  ]
  return tickets.map((t, i) => ({
    id: `T-${String(240 + i)}`,
    name: t.from.name,
    email: t.from.email,
    customerId: t.from.id || null,
    subject: t.subject,
    body: t.body,
    received: ago(t.hours),
    lang: t.lang,
    category: t.category,
    confidence: t.confidence,
    facts: t.facts,
    draft: t.draft,
    risk: t.risk || null,
    needsPerson: !!t.needsPerson,
    status: t.status || (t.risk === 'Looks like phishing' ? 'waiting' : 'waiting'),
    assignee: null,
  }))
}

// --- activity ------------------------------------------------------------------------------

function buildActivity(orders, invoices, customers) {
  const name = (id) => customers.find((c) => c.id === id)?.name
  const events = []
  for (const o of orders.slice(-14)) {
    events.push({ at: o.at, kind: 'order', text: `New order ${o.id} from ${name(o.customerId)}` })
    if (o.status === 'review') events.push({ at: o.at, kind: 'warn', text: `${o.id} stopped: VAT number not found in VIES` })
    if (o.status === 'failed') events.push({ at: o.at, kind: 'error', text: `${o.id}: invoice e-mail failed after 3 tries` })
  }
  for (const inv of invoices.filter((i) => i.paidAt).slice(-10)) {
    events.push({ at: inv.paidAt, kind: 'ok', text: `Payment matched to ${inv.number}, access given` })
  }
  return events.sort((a, b) => b.at.localeCompare(a.at)).slice(0, 18)
}

// --- everything ----------------------------------------------------------------------------

export function buildSampleData(now = new Date()) {
  const customers = buildCustomers()
  const { orders, invoices, nextSeq } = buildOrders(customers, now)
  return {
    version: 1,
    createdAt: iso(now),
    customers,
    orders,
    invoices,
    nextSeq,
    bank: buildBankHistory(invoices, customers),
    members: buildMembers(orders, customers, now),
    tickets: buildTickets(customers, invoices, now),
    activity: buildActivity(orders, invoices, customers),
  }
}

// --- derived values used by several screens ------------------------------------------------

export function invoiceState(invoice, now = new Date()) {
  if (invoice.status === 'paid') return 'paid'
  if (invoice.status === 'credited') return 'credited'
  return new Date(invoice.due) < new Date(now.toDateString()) ? 'overdue' : 'open'
}

export function memberState(member, now = new Date()) {
  if (member.access === 'closed') return 'closed'
  if (!member.plan) return 'active' // single courses never end
  const days = (new Date(member.end) - now) / DAY
  if (days < 0) return 'expired-open'
  if (days <= 30) return 'ending'
  return 'active'
}

export function daysBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / DAY)
}
