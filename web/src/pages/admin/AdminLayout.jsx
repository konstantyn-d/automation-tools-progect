import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Wordmark } from '../../components/Nav.jsx'
import { BankIcon, CartIcon, ChatIcon, DocIcon, GridIcon, PeopleIcon } from '../../components/icons.jsx'
import { Toast } from '../../components/admin/ui.jsx'
import { useAdmin } from '../../lib/adminStore.jsx'
import { useSession } from '../../lib/session.jsx'
import { DEMO_STAFF } from '../../data/member.js'
import { invoiceState, memberState } from '../../data/admin.js'
import '../../styles/admin.css'

// Frame of the admin panel: sidebar with the six screens and what waits in each.
export default function AdminLayout() {
  const { member, signIn, signOut } = useSession()
  const { data, reset } = useAdmin()
  const { pathname } = useLocation()
  const [toast, setToast] = useState('')
  const timer = useRef(null)

  const say = useCallback((message) => {
    setToast(message)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setToast(''), 2600)
  }, [])

  useEffect(() => () => clearTimeout(timer.current), [])
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  if (member?.role !== 'staff') {
    return (
      <main className="ad-gate">
        <div className="ad-gate__card">
          <Wordmark />
          <p className="eyebrow">Staff only</p>
          <h1>This part is for the LoopCasts team.</h1>
          <p>
            {member
              ? `You are signed in as ${member.firstName}, a member. Members do not see the admin panel.`
              : 'Sign in with a staff account to see orders, invoices, payments and support.'}
          </p>
          <div className="ad-gate__actions">
            <button className="key key--dark" onClick={() => signIn(DEMO_STAFF)}>
              Sign in as staff (demo)
            </button>
            <Link className="key key--light" to="/">
              Back to the site
            </Link>
          </div>
          <p className="ad-gate__fine">Demo: there are no real accounts yet, so this button signs you in as An Vermeulen from the office.</p>
        </div>
      </main>
    )
  }

  const today = new Date()
  const counts = {
    orders: data.orders.filter((o) => o.status === 'review' || o.status === 'failed').length,
    invoices: data.invoices.filter((i) => invoiceState(i, today) === 'overdue').length,
    payments: data.bank.filter((l) => ['new', 'check', 'unmatched'].includes(l.status)).length,
    members: data.members.filter((m) => memberState(m, today) === 'expired-open').length,
    support: data.tickets.filter((t) => t.status === 'waiting').length,
  }

  const LINKS = [
    { to: '/admin', label: 'Overview', icon: GridIcon, end: true },
    { to: '/admin/orders', label: 'Orders', icon: CartIcon, count: counts.orders },
    { to: '/admin/invoices', label: 'Invoices', icon: DocIcon, count: counts.invoices },
    { to: '/admin/payments', label: 'Payments', icon: BankIcon, count: counts.payments },
    { to: '/admin/members', label: 'Members', icon: PeopleIcon, count: counts.members },
    { to: '/admin/support', label: 'Support', icon: ChatIcon, count: counts.support },
  ]

  return (
    <div className="ad">
      <aside className="ad-side">
        <Link to="/admin" className="ad-side__brand">
          <Wordmark />
          <span className="ad-side__tag">Admin</span>
        </Link>
        <nav className="ad-side__nav" aria-label="Admin">
          {LINKS.map(({ to, label, icon: Icon, count, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `ad-side__link ${isActive ? 'is-active' : ''}`}>
              <Icon size={2} />
              {label}
              {count > 0 && <span className="ad-side__count">{count}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="ad-side__foot">
          <div className="ad-side__me">
            <span className="ad-side__avatar">{member.firstName[0]}{member.lastName[0]}</span>
            <span>
              <b>{member.firstName} {member.lastName}</b>
              <small>Office · staff</small>
            </span>
          </div>
          <Link to="/" className="ad-side__small">View the site ↗</Link>
          <button
            className="ad-side__small"
            onClick={() => {
              reset()
              say('Sample data is back to the start')
            }}
          >
            Reset sample data
          </button>
          <button className="ad-side__small" onClick={signOut}>Sign out</button>
        </div>
      </aside>

      <main className="ad-main">
        <div className="ad-sample">Sample data · no database yet · changes stay in this browser</div>
        <Outlet context={{ say }} />
      </main>
      <Toast message={toast} />
    </div>
  )
}
