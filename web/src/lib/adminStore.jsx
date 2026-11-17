import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { buildSampleData, makeInvoice, priceFor, productLabel, sampleBankFile, PAYMENT_DAYS } from '../data/admin.js'
import { matchPayment } from './matching.js'

// The admin panel's data. There is no database yet: the sample data lives in the browser
// (localStorage) and every button changes it here. Each action below is one thing
// n8n or the back end will do later, so the screens will not have to change.

const KEY = 'loopcasts.admin.v1'
const AdminContext = createContext(null)
const now = () => new Date().toISOString()

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY))
    if (saved?.version === 1) return saved
  } catch {
    // blocked storage: fall back to fresh sample data
  }
  return buildSampleData()
}

function save(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch {
    // the changes then last until the page is closed
  }
}

const log = (data, kind, text) => ({ ...data, activity: [{ at: now(), kind, text }, ...data.activity].slice(0, 40) })

// Gives access for a paid order: a new member, or an existing member gets more.
function giveAccess(data, order) {
  const customer = data.customers.find((c) => c.id === order.customerId)
  const members = [...data.members]
  let member = members.find((m) => m.customerId === customer.id)
  const start = new Date()
  const end = new Date(start)
  if (order.product === 'monthly') end.setMonth(end.getMonth() + 1)
  else end.setFullYear(end.getFullYear() + 1)
  if (!member) {
    member = {
      id: `M-${String(members.length + 1).padStart(3, '0')}`,
      customerId: customer.id,
      name: customer.name,
      email: customer.email,
      plan: null,
      start: start.toISOString().slice(0, 10),
      end: null,
      courses: [],
      seats: 1,
      access: 'open',
      lastSeen: null,
    }
    members.push(member)
  }
  const index = members.indexOf(member)
  members[index] =
    order.product === 'single'
      ? { ...member, access: 'open', courses: [...new Set([...member.courses, order.course])] }
      : { ...member, access: 'open', plan: order.product, seats: order.product === 'team' ? 5 : 1, end: end.toISOString().slice(0, 10) }
  return { ...data, members }
}

function payInvoice(data, number, bankLineId) {
  const invoice = data.invoices.find((i) => i.number === number)
  if (!invoice || invoice.status === 'paid') return data
  let next = {
    ...data,
    invoices: data.invoices.map((i) => (i.number === number ? { ...i, status: 'paid', paidAt: now(), bankLine: bankLineId } : i)),
    orders: data.orders.map((o) => (o.id === invoice.orderId ? { ...o, status: 'access', issue: null } : o)),
  }
  const order = next.orders.find((o) => o.id === invoice.orderId)
  if (order) next = giveAccess(next, order)
  return log(next, 'ok', `Payment matched to ${number}, access given`)
}

export function AdminStoreProvider({ children }) {
  const [data, setData] = useState(load)

  const update = useCallback((fn) => {
    setData((current) => {
      const next = fn(current)
      if (next !== current) save(next)
      return next
    })
  }, [])

  const actions = useMemo(
    () => ({
      reset: () => update(() => buildSampleData()),

      // --- orders
      approveOrder: (id) =>
        update((d) => {
          const order = d.orders.find((o) => o.id === id)
          if (!order || order.invoice) return d
          const customer = d.customers.find((c) => c.id === order.customerId)
          const year = new Date().getFullYear()
          const invoice = makeInvoice({ seq: d.nextSeq, year, order, customer, date: new Date() })
          return log(
            {
              ...d,
              nextSeq: d.nextSeq + 1,
              invoices: [...d.invoices, invoice],
              orders: d.orders.map((o) => (o.id === id ? { ...o, status: 'waiting', issue: null, invoice: invoice.number, approvedBy: 'An V.' } : o)),
            },
            'ok',
            `${id} checked by An V., invoice ${invoice.number} sent`,
          )
        }),
      retryOrder: (id) =>
        update((d) =>
          log(
            { ...d, orders: d.orders.map((o) => (o.id === id ? { ...o, status: 'waiting', issue: null } : o)) },
            'ok',
            `${id}: invoice e-mail sent on retry`,
          ),
        ),
      cancelOrder: (id) =>
        update((d) =>
          log(
            {
              ...d,
              orders: d.orders.map((o) => (o.id === id ? { ...o, status: 'cancelled', issue: null } : o)),
              invoices: d.invoices.map((i) => (i.orderId === id && i.status !== 'paid' ? { ...i, status: 'credited' } : i)),
            },
            'warn',
            `${id} cancelled, open invoice credited`,
          ),
        ),

      // --- invoices
      remind: (number) =>
        update((d) =>
          log(
            { ...d, invoices: d.invoices.map((i) => (i.number === number ? { ...i, reminders: i.reminders + 1, remindedAt: now() } : i)) },
            'info',
            `Reminder sent for ${number}`,
          ),
        ),
      resendInvoice: (number) => update((d) => log(d, 'info', `Invoice ${number} sent again`)),

      // --- bank
      importLines: (lines, source) =>
        update((d) => {
          const known = new Set(d.bank.map((l) => `${l.date}|${l.amount}|${l.message}|${l.name}`))
          let n = d.bank.length
          const fresh = lines
            .filter((l) => !known.has(`${l.date}|${l.amount}|${l.message}|${l.name}`))
            .map((l) => ({ ...l, id: `B-${500 + n++}`, status: 'new', invoice: null, note: '', by: null }))
          return log({ ...d, bank: [...fresh, ...d.bank] }, 'info', `${fresh.length} bank lines imported from ${source}`)
        }),
      sampleBankLines: () => sampleBankFile(data),
      // Matches one line. The screen calls it line by line, so you can watch it work.
      matchLine: (id) =>
        update((d) => {
          const line = d.bank.find((l) => l.id === id)
          if (!line || line.status !== 'new') return d
          const result = matchPayment(line, d.invoices, d.customers)
          let next = {
            ...d,
            bank: d.bank.map((l) => (l.id === id ? { ...l, status: result.status, invoice: result.invoice, note: result.note, rule: result.rule, by: 'auto' } : l)),
          }
          if (result.status === 'matched') next = payInvoice(next, result.invoice, id)
          return next
        }),
      assignLine: (id, number) =>
        update((d) => {
          const next = {
            ...d,
            bank: d.bank.map((l) => (l.id === id ? { ...l, status: 'matched', invoice: number, note: 'Matched by hand.', by: 'An V.' } : l)),
          }
          return payInvoice(next, number, id)
        }),
      ignoreLine: (id, reason) =>
        update((d) =>
          log(
            { ...d, bank: d.bank.map((l) => (l.id === id ? { ...l, status: 'ignored', note: reason || 'Not a customer payment.', by: 'An V.' } : l)) },
            'info',
            `Bank line ${id} set aside: ${reason || 'not a customer payment'}`,
          ),
        ),

      // --- members
      renewMember: (id) =>
        update((d) => {
          const members = d.members.map((m) => {
            if (m.id !== id) return m
            const from = new Date(Math.max(new Date(m.end || Date.now()), Date.now()))
            if (m.plan === 'monthly') from.setMonth(from.getMonth() + 1)
            else from.setFullYear(from.getFullYear() + 1)
            return { ...m, access: 'open', end: from.toISOString().slice(0, 10) }
          })
          const m = members.find((x) => x.id === id)
          return log({ ...d, members }, 'ok', `${m.name}: renewed until ${m.end}`)
        }),
      setAccess: (id, access) =>
        update((d) => {
          const m = d.members.find((x) => x.id === id)
          return log(
            { ...d, members: d.members.map((x) => (x.id === id ? { ...x, access } : x)) },
            access === 'open' ? 'ok' : 'warn',
            `${m.name}: access ${access === 'open' ? 'opened' : 'closed'} by An V.`,
          )
        }),
      sendPasswordLink: (id) => update((d) => log(d, 'info', `Password link sent to ${d.members.find((m) => m.id === id)?.email}`)),

      // --- support
      editDraft: (id, draft) => update((d) => ({ ...d, tickets: d.tickets.map((t) => (t.id === id ? { ...t, draft } : t)) })),
      sendReply: (id) =>
        update((d) => {
          const t = d.tickets.find((x) => x.id === id)
          return log(
            { ...d, tickets: d.tickets.map((x) => (x.id === id ? { ...x, status: 'sent', sentAt: now() } : x)) },
            'ok',
            `Reply to ${t.name} approved and sent`,
          )
        }),
      assignTicket: (id, person) =>
        update((d) => log({ ...d, tickets: d.tickets.map((x) => (x.id === id ? { ...x, status: 'assigned', assignee: person } : x)) }, 'info', `${id} given to ${person}`)),
      flagTicket: (id) =>
        update((d) => log({ ...d, tickets: d.tickets.map((x) => (x.id === id ? { ...x, status: 'phishing' } : x)) }, 'warn', `${id} marked as phishing, sender blocked`)),

      // --- from the public site (demo mode): the order appears here like a real one would
      placeOrder: (payload, totals) => {
        const d = data
        {
          const c = payload.customer
          let customer = d.customers.find((x) => x.email === c.email)
          const customers = [...d.customers]
          if (!customer) {
            customer = {
              id: `C-${String(customers.length + 1).padStart(3, '0')}`,
              name: `${c.firstName} ${c.lastName}`,
              email: c.email,
              company: c.company,
              vatNumber: c.vatNumber,
              country: c.country,
              lang: 'en',
            }
            customers.push(customer)
          }
          const order = {
            id: `O-${1150 + d.orders.length}`,
            at: now(),
            customerId: customer.id,
            product: payload.product,
            course: payload.course,
            ...priceFor(payload.product, customer),
            ...(totals ? { vat: totals.vat, total: totals.total, vatNote: totals.note } : {}),
            status: 'waiting',
            invoice: null,
            issue: null,
            source: 'Website',
          }
          const year = new Date().getFullYear()
          const invoice = makeInvoice({ seq: d.nextSeq, year, order, customer, date: new Date() })
          order.invoice = invoice.number
          const next = log(
            { ...d, customers, nextSeq: d.nextSeq + 1, orders: [...d.orders, order], invoices: [...d.invoices, invoice] },
            'order',
            `New order ${order.id} from ${customer.name}, invoice ${invoice.number} sent`,
          )
          update(() => next)
          return { order, invoice }
        }
      },
      // Demo: "the payment arrived" on the site = a bank line that matches by itself.
      payFromSite: (number) =>
        update((d) => {
          const invoice = d.invoices.find((i) => i.number === number)
          if (!invoice) return d
          const customer = d.customers.find((c) => c.id === invoice.customerId)
          const id = `B-${500 + d.bank.length}`
          const line = {
            id,
            date: now().slice(0, 10),
            amount: invoice.total,
            name: (customer.company || customer.name).toUpperCase(),
            iban: 'BE00 0000 0000 0000',
            message: invoice.reference,
            status: 'matched',
            invoice: number,
            note: 'Structured reference and amount match.',
            rule: 1,
            by: 'auto',
          }
          return payInvoice({ ...d, bank: [line, ...d.bank] }, number, id)
        }),
    }),
    [update, data],
  )

  const value = useMemo(() => ({ data, ...actions, paymentDays: PAYMENT_DAYS, productLabel }), [data, actions])
  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}

export function useAdmin() {
  return useContext(AdminContext)
}
