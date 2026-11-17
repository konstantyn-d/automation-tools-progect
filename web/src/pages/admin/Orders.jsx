import { useMemo } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { Drawer, Empty, Fields, PageHead, SearchField, Status, Tabs, euro, longDate, shortDate, timeAgo, useParam } from '../../components/admin/ui.jsx'
import { useAdmin } from '../../lib/adminStore.jsx'
import { productLabel } from '../../data/admin.js'
import { COUNTRIES } from '../../lib/vat.js'

const countryName = (code) => COUNTRIES.find((c) => c.code === code)?.name || code

// The five steps of one order, worked out from what we know about it.
function steps(order, invoice) {
  const paid = invoice?.status === 'paid'
  const s = (label, state, note) => ({ label, state, note })
  if (order.status === 'cancelled') {
    return [s('Order received', 'done', timeAgo(order.at)), s('Cancelled', 'error', 'Stopped by a person')]
  }
  return [
    s('Order received', 'done', `${timeAgo(order.at)} · ${order.source}`),
    order.status === 'review'
      ? s('Details checked', 'stop', 'Waiting for a person')
      : s('Details checked', 'done', `${order.vatNote}${order.approvedBy ? ` · checked by ${order.approvedBy}` : ''}`),
    order.status === 'review'
      ? s('Invoice sent', 'todo')
      : order.status === 'failed'
        ? s('Invoice sent', 'error', `Invoice ${order.invoice} made, e-mail failed`)
        : s('Invoice sent', 'done', `Invoice ${order.invoice}`),
    paid ? s('Payment matched', 'done', shortDate(invoice.paidAt)) : order.status === 'waiting' ? s('Payment matched', 'now', 'Waiting for the bank transfer') : s('Payment matched', 'todo'),
    order.status === 'access' ? s('Access given', 'done', 'Login sent') : s('Access given', 'todo'),
  ]
}

export default function Orders() {
  const { data, approveOrder, retryOrder, cancelOrder } = useAdmin()
  const { say } = useOutletContext()
  const [tab, setTab] = useParam('tab', 'all')
  const [q, setQ] = useParam('q')
  const [openId, setOpen] = useParam('open')

  const customer = (id) => data.customers.find((c) => c.id === id)
  const rows = useMemo(() => [...data.orders].sort((a, b) => b.at.localeCompare(a.at)), [data.orders])
  const inTab = (o, t) =>
    t === 'all' || (t === 'person' ? ['review', 'failed'].includes(o.status) : o.status === t)

  const query = q.trim().toLowerCase()
  const shown = rows.filter((o) => {
    if (!inTab(o, tab)) return false
    if (!query) return true
    const c = customer(o.customerId)
    return [o.id, o.invoice, c?.name, c?.email, c?.company, productLabel(o)].some((v) => v?.toLowerCase().includes(query))
  })

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'person', label: 'Needs a person' },
    { id: 'waiting', label: 'Waiting for payment' },
    { id: 'access', label: 'Access given' },
    { id: 'cancelled', label: 'Cancelled' },
  ].map((t) => ({ ...t, count: rows.filter((o) => inTab(o, t.id)).length }))

  const order = data.orders.find((o) => o.id === openId)
  const c = order && customer(order.customerId)
  const invoice = order && data.invoices.find((i) => i.number === order.invoice)
  const member = c && data.members.find((m) => m.customerId === c.id)

  let footer = null
  if (order?.status === 'review')
    footer = (
      <>
        <button className="key key--dark" onClick={() => { approveOrder(order.id); say(`${order.id}: invoice made and sent`) }}>
          VAT number is fine, send the invoice
        </button>
        <button className="key key--light" onClick={() => { cancelOrder(order.id); say(`${order.id} cancelled`) }}>
          Cancel order
        </button>
      </>
    )
  else if (order?.status === 'failed')
    footer = (
      <>
        <button className="key key--dark" onClick={() => { retryOrder(order.id); say(`Invoice for ${order.id} sent`) }}>
          Try sending the invoice again
        </button>
        <button className="key key--light" onClick={() => { cancelOrder(order.id); say(`${order.id} cancelled`) }}>
          Cancel order
        </button>
      </>
    )
  else if (order?.status === 'waiting')
    footer = (
      <>
        <Link className="key key--light" to={`/admin/invoices?open=${order.invoice}`}>Open invoice {order.invoice}</Link>
        <button className="key key--light" onClick={() => { cancelOrder(order.id); say(`${order.id} cancelled, invoice credited`) }}>
          Cancel order
        </button>
      </>
    )
  else if (order?.status === 'access' && member)
    footer = <Link className="key key--light" to={`/admin/members?open=${member.id}`}>Open member</Link>

  return (
    <div className="ad-page">
      <PageHead eyebrow="Orders" title="Every order, step by step." soft="Most of them never need you." />

      <div className="ad-tools">
        <Tabs tabs={tabs} value={tab} onChange={setTab} />
        <SearchField value={q} onChange={setQ} placeholder="Order, name, e-mail, invoice…" />
      </div>

      {shown.length === 0 ? (
        <Empty title="No orders here" text={query ? 'Nothing matches this search.' : 'Nothing in this group right now.'} />
      ) : (
        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr>
                <th>Order</th><th>Customer</th><th>Product</th><th className="num">Total</th><th>Status</th><th>When</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((o, i) => {
                const oc = customer(o.customerId)
                return (
                  <tr key={o.id} onClick={() => setOpen(o.id)} className={openId === o.id ? 'is-open' : ''} style={{ '--i': Math.min(i, 12) }}>
                    <td className="mono c-id"><button className="ad-rowlink" onClick={() => setOpen(o.id)}>{o.id}</button></td>
                    <td className="c-main">
                      <b>{oc.name}</b>
                      <small>{oc.company || oc.email}</small>
                    </td>
                    <td className="c-hide">{productLabel(o)}</td>
                    <td className="num c-amount">{euro(o.total)}</td>
                    <td className="c-status"><Status value={o.status} /></td>
                    <td className="ad-muted c-meta">{timeAgo(o.at)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <Drawer open={!!order} onClose={() => setOpen('')} eyebrow={order && `Order · ${longDate(order.at)}`} title={order ? `${order.id} · ${c.name}` : ''} footer={footer}>
        {order && (
          <>
            {order.issue && (
              <div className={`ad-issue ad-issue--${order.status === 'failed' ? 'error' : 'warn'}`}>
                <b>{order.status === 'failed' ? 'A step failed' : 'Stopped for a person'}</b>
                <p>{order.issue}</p>
              </div>
            )}
            <ol className="ad-steps">
              {steps(order, invoice).map((s, i) => (
                <li key={s.label} className={`ad-steps__item is-${s.state}`} style={{ '--i': i }}>
                  <span className="ad-steps__dot" />
                  <b>{s.label}</b>
                  {s.note && <small>{s.note}</small>}
                </li>
              ))}
            </ol>
            <h3 className="ad-sub">Product</h3>
            <Fields
              rows={[
                ['Product', productLabel(order)],
                ['Price excl. VAT', euro(order.excl)],
                ['VAT', `${euro(order.vat)} · ${order.vatNote}`],
                ['Total', <b key="t">{euro(order.total)}</b>],
              ]}
            />
            <h3 className="ad-sub">Customer</h3>
            <Fields
              rows={[
                ['Name', c.name],
                ['E-mail', c.email],
                c.company && ['Company', c.company],
                c.vatNumber && ['VAT number', <span key="v" className="mono-num">{c.vatNumber}</span>],
                ['Country', countryName(c.country)],
              ]}
            />
          </>
        )}
      </Drawer>
    </div>
  )
}
