import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Pipeline from '../../components/Pipeline.jsx'
import { WarnIcon } from '../../components/icons.jsx'
import { PageHead, euro, timeAgo } from '../../components/admin/ui.jsx'
import { useAdmin } from '../../lib/adminStore.jsx'
import { useSession } from '../../lib/session.jsx'
import { invoiceState, memberState } from '../../data/admin.js'

const DAY = 86400000

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

// Revenue per day, last 14 days. One series, so no legend: the title names it.
function RevenueChart({ invoices }) {
  const [hover, setHover] = useState(null)
  const days = useMemo(() => {
    const start = new Date(new Date().toDateString()).getTime() - 13 * DAY
    return Array.from({ length: 14 }, (_, i) => {
      const from = start + i * DAY
      const paid = invoices.filter((inv) => inv.paidAt && new Date(inv.paidAt).getTime() >= from && new Date(inv.paidAt).getTime() < from + DAY)
      return { date: new Date(from), amount: paid.reduce((s, inv) => s + inv.excl, 0), count: paid.length }
    })
  }, [invoices])
  const max = Math.max(...days.map((d) => d.amount), 1)
  const top = Math.ceil(max / 200) * 200
  const total = days.reduce((s, d) => s + d.amount, 0)

  return (
    <section className="ad-card ad-chart">
      <header className="ad-card__head">
        <div>
          <h2>Revenue per day</h2>
          <p>Paid invoices, excl. VAT, last 14 days</p>
        </div>
        <b className="ad-chart__total">{euro(total)}</b>
      </header>
      <div className="ad-chart__plot" onMouseLeave={() => setHover(null)}>
        <div className="ad-chart__grid">
          <span style={{ bottom: '100%' }}>{euro(top).replace(/\.00$/, '')}</span>
          <span style={{ bottom: '50%' }}>{euro(top / 2).replace(/\.00$/, '')}</span>
          <span style={{ bottom: 0 }}>€0</span>
        </div>
        <div className="ad-chart__bars">
          {days.map((d, i) => (
            <button
              key={i}
              className={`ad-chart__col ${hover === i ? 'is-hover' : ''}`}
              onMouseEnter={() => setHover(i)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              aria-label={`${d.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}: ${euro(d.amount)}`}
            >
              <span className="ad-chart__bar" style={{ '--h': `${(d.amount / top) * 100}%`, '--i': i }} />
              <span className="ad-chart__day">{i % 2 === 1 || i === 13 ? d.date.getDate() : ''}</span>
              {hover === i && (
                <span className={`ad-chart__tip ${i > 10 ? 'is-left' : ''}`}>
                  <b>{euro(d.amount)}</b>
                  {d.date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })} · {d.count} paid
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function Overview() {
  const { data } = useAdmin()
  const { member } = useSession()
  const now = new Date()

  const k = useMemo(() => {
    const since = now.getTime() - 30 * DAY
    const recent = data.invoices.filter((i) => i.paidAt && new Date(i.paidAt).getTime() > since)
    const open = data.invoices.filter((i) => ['open', 'overdue'].includes(invoiceState(i, now)))
    return {
      revenue: recent.reduce((s, i) => s + i.excl, 0),
      orders: data.orders.filter((o) => new Date(o.at).getTime() > since).length,
      open: open.length,
      openAmount: open.reduce((s, i) => s + i.total, 0),
      overdue: open.filter((i) => invoiceState(i, now) === 'overdue').length,
      bank: data.bank.filter((l) => ['new', 'check', 'unmatched'].includes(l.status)).length,
      support: data.tickets.filter((t) => t.status === 'waiting').length,
      ending: data.members.filter((m) => memberState(m, now) === 'ending').length,
      members: data.members.filter((m) => m.access === 'open').length,
    }
  }, [data])

  // Everything a person has to decide, oldest problem first.
  const attention = useMemo(() => {
    const items = []
    for (const o of data.orders) {
      if (o.status === 'review') items.push({ tone: 'warn', to: `/admin/orders?open=${o.id}`, title: `${o.id} needs a check`, text: 'VAT number not found in VIES' })
      if (o.status === 'failed') items.push({ tone: 'error', to: `/admin/orders?open=${o.id}`, title: `${o.id}: a step failed`, text: 'Invoice e-mail did not go out' })
    }
    for (const i of data.invoices) {
      if (invoiceState(i, now) === 'overdue')
        items.push({ tone: 'error', to: `/admin/invoices?open=${i.number}`, title: `Invoice ${i.number} is overdue`, text: `${euro(i.total)} · ${i.reminders} reminder${i.reminders === 1 ? '' : 's'} sent` })
    }
    const bank = data.bank.filter((l) => ['check', 'unmatched'].includes(l.status))
    if (bank.length) items.push({ tone: 'warn', to: '/admin/payments?tab=todo', title: `${bank.length} bank line${bank.length === 1 ? '' : 's'} to check`, text: 'Matching could not decide by itself' })
    const fresh = data.bank.filter((l) => l.status === 'new')
    if (fresh.length) items.push({ tone: 'info', to: '/admin/payments', title: `${fresh.length} new bank lines`, text: 'Imported, not matched yet' })
    for (const t of data.tickets) {
      if (t.status === 'waiting' && (t.risk || t.needsPerson))
        items.push({ tone: t.risk ? 'error' : 'warn', to: `/admin/support?open=${t.id}`, title: t.subject, text: t.risk || 'A person has to answer this one' })
    }
    for (const m of data.members) {
      if (memberState(m, now) === 'expired-open') items.push({ tone: 'error', to: `/admin/members?open=${m.id}`, title: `${m.name}: expired, still open`, text: 'Close access or renew' })
    }
    return items
  }, [data])

  const kpis = [
    { label: 'Revenue, 30 days', value: euro(k.revenue), note: 'paid, excl. VAT', to: '/admin/invoices?tab=paid' },
    { label: 'Orders, 30 days', value: k.orders, note: `${k.members} members with access`, to: '/admin/orders' },
    { label: 'Open invoices', value: k.open, note: `${euro(k.openAmount)} · ${k.overdue} overdue`, to: '/admin/invoices?tab=open', tone: k.overdue ? 'error' : '' },
    { label: 'Bank lines to do', value: k.bank, note: k.bank ? 'waiting for matching or a person' : 'all matched', to: '/admin/payments', tone: k.bank ? 'warn' : '' },
    { label: 'Support waiting', value: k.support, note: 'drafts ready to approve', to: '/admin/support', tone: k.support ? 'info' : '' },
    { label: 'Ending in 30 days', value: k.ending, note: 'renewal mail goes out by itself', to: '/admin/members?tab=ending' },
  ]

  return (
    <div className="ad-page">
      <PageHead eyebrow={now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })} title={`${greeting()}, ${member.firstName}.`} soft={attention.length ? `${attention.length} things need you today.` : 'Nothing needs you today.'} />

      <div className="ad-kpis">
        {kpis.map((x, i) => (
          <Link key={x.label} to={x.to} className={`ad-kpi ${x.tone ? `ad-kpi--${x.tone}` : ''}`} style={{ '--i': i }}>
            <span className="eyebrow">{x.label}</span>
            <b>{x.value}</b>
            <small>{x.note}</small>
          </Link>
        ))}
      </div>

      <div className="ad-split">
        <section className="ad-card">
          <header className="ad-card__head">
            <div>
              <h2>Needs your attention</h2>
              <p>Everything else ran by itself</p>
            </div>
          </header>
          {attention.length === 0 ? (
            <p className="ad-calm">All clear. Orders, payments and access are running by themselves.</p>
          ) : (
            <ul className="ad-todo">
              {attention.map((a, i) => (
                <li key={i} style={{ '--i': i }}>
                  <Link to={a.to}>
                    <span className={`ad-todo__mark ad-todo__mark--${a.tone}`}>
                      <WarnIcon size={2} />
                    </span>
                    <span>
                      <b>{a.title}</b>
                      <small>{a.text}</small>
                    </span>
                    <span className="ad-todo__go">Open →</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <RevenueChart invoices={data.invoices} />
      </div>

      <section className="ad-block">
        <header className="ad-block__head">
          <h2>Test the order chain</h2>
          <p>Sends a test order through every step, like a real customer would. Switch on the failing mail server to see how an error is caught.</p>
        </header>
        <Pipeline />
      </section>

      <section className="ad-card">
        <header className="ad-card__head">
          <div>
            <h2>What happened</h2>
            <p>Latest events, newest first</p>
          </div>
        </header>
        <ol className="ad-feed">
          {data.activity.slice(0, 12).map((e, i) => (
            <li key={`${e.at}-${i}`} className={`ad-feed__item ad-feed__item--${e.kind}`}>
              <span className="ad-feed__dot" />
              <span>{e.text}</span>
              <time>{timeAgo(e.at)}</time>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
