import { useMemo } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { Wordmark } from '../../components/Nav.jsx'
import { CheckIcon } from '../../components/icons.jsx'
import { Drawer, Empty, PageHead, SearchField, Status, Tabs, euro, longDate, shortDate, useParam } from '../../components/admin/ui.jsx'
import { useAdmin } from '../../lib/adminStore.jsx'
import { daysBetween, invoiceState } from '../../data/admin.js'
import { isValidReference } from '../../lib/invoice.js'

// Numbers must run without gaps and without doubles (Belgian rule for invoices).
function numberingCheck(invoices) {
  const byYear = {}
  for (const i of invoices) (byYear[i.year] ||= []).push(i.seq)
  const problems = []
  let first = null
  let last = null
  for (const [year, seqs] of Object.entries(byYear)) {
    const sorted = [...seqs].sort((a, b) => a - b)
    first = first || `${year}-${String(sorted[0]).padStart(4, '0')}`
    last = `${year}-${String(sorted[sorted.length - 1]).padStart(4, '0')}`
    for (let k = 1; k < sorted.length; k += 1) {
      if (sorted[k] === sorted[k - 1]) problems.push(`${year}-${sorted[k]} used twice`)
      else if (sorted[k] !== sorted[k - 1] + 1) problems.push(`gap after ${year}-${String(sorted[k - 1]).padStart(4, '0')}`)
    }
  }
  return { first, last, problems, bad: invoices.filter((i) => !isValidReference(i.reference)).length }
}

function Paper({ invoice, customer }) {
  return (
    <div className="paper">
      <div className="paper__top">
        <Wordmark />
        <div className="paper__us">
          LoopCasts BV<br />Korenmarkt 12, 9000 Gent<br />BE0789.456.123
        </div>
      </div>
      <div className="paper__meta">
        <div>
          <span className="eyebrow">Invoice</span>
          <b>{invoice.number}</b>
        </div>
        <div>
          <span className="eyebrow">Date</span>
          {longDate(invoice.date)}
        </div>
        <div>
          <span className="eyebrow">Due</span>
          {longDate(invoice.due)}
        </div>
      </div>
      <div className="paper__to">
        <span className="eyebrow">Billed to</span>
        {customer.company && <b>{customer.company}</b>}
        <span>{customer.name}</span>
        <span>{customer.email}</span>
        {customer.vatNumber && <span>VAT {customer.vatNumber}</span>}
      </div>
      <table className="paper__lines">
        <tbody>
          <tr><td>{invoice.product}</td><td className="num">{euro(invoice.excl)}</td></tr>
          <tr className="paper__sub"><td>{invoice.vatNote}</td><td className="num">{euro(invoice.vat)}</td></tr>
          <tr className="paper__total"><td>Total</td><td className="num">{euro(invoice.total)}</td></tr>
        </tbody>
      </table>
      <div className="paper__pay">
        <span className="eyebrow">Pay to BE68 5390 0754 7034 with reference</span>
        <b>{invoice.reference}</b>
      </div>
      {invoice.status === 'paid' && <span className="paper__stamp">Paid</span>}
    </div>
  )
}

export default function Invoices() {
  const { data, remind, resendInvoice } = useAdmin()
  const { say } = useOutletContext()
  const [tab, setTab] = useParam('tab', 'all')
  const [q, setQ] = useParam('q')
  const [openId, setOpen] = useParam('open')
  const now = new Date()

  const customer = (id) => data.customers.find((c) => c.id === id)
  const rows = useMemo(() => [...data.invoices].sort((a, b) => b.seq - a.seq), [data.invoices])
  const check = useMemo(() => numberingCheck(data.invoices), [data.invoices])
  const state = (i) => invoiceState(i, now)
  const inTab = (i, t) => t === 'all' || (t === 'open' ? ['open', 'overdue'].includes(state(i)) : state(i) === t)

  const query = q.trim().toLowerCase()
  const shown = rows.filter((i) => {
    if (!inTab(i, tab)) return false
    if (!query) return true
    const c = customer(i.customerId)
    return [i.number, i.reference, c?.name, c?.company, i.product].some((v) => v?.toLowerCase().includes(query))
  })
  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'open', label: 'Unpaid' },
    { id: 'overdue', label: 'Overdue' },
    { id: 'paid', label: 'Paid' },
    { id: 'credited', label: 'Credited' },
  ].map((t) => ({ ...t, count: rows.filter((i) => inTab(i, t.id)).length }))

  const invoice = data.invoices.find((i) => i.number === openId)
  const c = invoice && customer(invoice.customerId)
  const unpaid = invoice && ['open', 'overdue'].includes(state(invoice))

  return (
    <div className="ad-page">
      <PageHead eyebrow="Invoices" title="Numbered, sent and followed up." soft="Reminders go out by themselves after 14 days." />

      <div className={`ad-check ${check.problems.length || check.bad ? 'ad-check--bad' : ''}`}>
        <span className="ad-check__mark"><CheckIcon size={2} /></span>
        <div>
          <b>{check.problems.length ? `Numbering problem: ${check.problems.join(', ')}` : `Numbering ${check.first} to ${check.last}: no gaps, no doubles`}</b>
          <small>{check.bad ? `${check.bad} references fail the check digit` : `All ${data.invoices.length} payment references pass the mod-97 check`}</small>
        </div>
      </div>

      <div className="ad-tools">
        <Tabs tabs={tabs} value={tab} onChange={setTab} />
        <SearchField value={q} onChange={setQ} placeholder="Number, reference, name…" />
      </div>

      {shown.length === 0 ? (
        <Empty title="No invoices here" text={query ? 'Nothing matches this search.' : 'Nothing in this group right now.'} />
      ) : (
        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr><th>Invoice</th><th>Customer</th><th>Reference</th><th className="num">Total</th><th>Due</th><th>Status</th></tr>
            </thead>
            <tbody>
              {shown.map((i, n) => {
                const ic = customer(i.customerId)
                const s = state(i)
                return (
                  <tr key={i.number} onClick={() => setOpen(i.number)} className={openId === i.number ? 'is-open' : ''} style={{ '--i': Math.min(n, 12) }}>
                    <td className="mono c-id"><button className="ad-rowlink" onClick={() => setOpen(i.number)}>{i.number}</button></td>
                    <td className="c-main"><b>{ic.company || ic.name}</b><small>{i.product}</small></td>
                    <td className="mono c-hide">{i.reference}</td>
                    <td className="num c-amount">{euro(i.total)}</td>
                    <td className="ad-muted c-meta">
                      {s === 'paid' ? `paid ${shortDate(i.paidAt)}` : s === 'overdue' ? `${daysBetween(i.due, now)} days late` : shortDate(i.due)}
                    </td>
                    <td className="c-status"><Status value={s} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <Drawer
        open={!!invoice}
        onClose={() => setOpen('')}
        eyebrow={invoice && `Invoice · ${invoice.reminders ? `${invoice.reminders} reminder${invoice.reminders > 1 ? 's' : ''} sent` : 'no reminders'}`}
        title={invoice ? `${invoice.number} · ${euro(invoice.total)}` : ''}
        footer={
          invoice && (
            <>
              {unpaid && (
                <button className="key key--dark" onClick={() => { remind(invoice.number); say(`Reminder sent to ${c.email}`) }}>
                  Send a reminder
                </button>
              )}
              <button className="key key--light" onClick={() => { resendInvoice(invoice.number); say(`Invoice ${invoice.number} sent again`) }}>
                Send PDF again
              </button>
              <Link className="key key--light" to={`/admin/orders?open=${invoice.orderId}`}>Open order</Link>
            </>
          )
        }
      >
        {invoice && (
          <>
            {state(invoice) === 'overdue' && (
              <div className="ad-issue ad-issue--error">
                <b>{daysBetween(invoice.due, now)} days past the due date</b>
                <p>The first reminder went out automatically. A second one, or a call, is up to you.</p>
              </div>
            )}
            <Paper invoice={invoice} customer={c} />
          </>
        )}
      </Drawer>
    </div>
  )
}
