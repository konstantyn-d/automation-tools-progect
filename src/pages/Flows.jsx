import { Link } from 'react-router-dom';
import { PageHead } from '../components/ui.jsx';
import { WEBHOOKS } from '../lib/api.js';

// u = user on the site, a = automation in n8n, h = a person on the LoopCasts team
const FLOWS = [
  {
    id: 'order', title: 'Visitor → order → payment pending → access', try: '/order',
    nodes: [
      ['u', 'Browses catalog', '/courses, free lesson'],
      ['u', 'Fills order form', '/order: plan, details'],
      ['a', 'VAT check', 'VIES, live while typing', 'vatCheck'],
      ['u', 'Places order', 'promo code, terms'],
      ['a', 'Order + invoice', 'next number, VAT rule, PDF, email with +++ reference', 'orderCreate'],
      ['u', 'Payment pending page', '/order/:id, pays by transfer'],
      ['a', 'Bank matching', 'daily, by reference then amount + name'],
      ['h', 'Unsure matches', 'only these go to a person'],
      ['a', 'Account created', 'set-password link by email'],
      ['u', 'Starts learning', '/reset-password → /account'],
    ],
  },
  {
    id: 'reset', title: 'Password reset', try: '/forgot-password',
    nodes: [
      ['u', 'Forgot password', '/forgot-password'],
      ['a', 'Reset email', 'one-time token, 1 h, same answer for any address', 'resetRequest'],
      ['u', 'Opens link', '/reset-password?token='],
      ['a', 'Save password', 'bcrypt, token burned', 'resetConfirm'],
      ['u', 'Logs in', '/login'],
    ],
  },
  {
    id: 'support', title: 'Support request', try: '/support',
    nodes: [
      ['u', 'Self-service first', 'reset, invoices, order status'],
      ['u', 'Sends support form', '/support'],
      ['a', 'Ticket + AI triage', 'topic, language, order data, draft answer', 'supportCreate'],
      ['h', 'Approves or edits', 'refunds always decided by a person'],
      ['a', 'Reply sent', 'from the ticket, SLA tracked'],
    ],
  },
  {
    id: 'newsletter', title: 'Newsletter double opt-in', try: '/newsletter/confirm?token=demo',
    nodes: [
      ['u', 'Subscribes', 'footer form + consent'],
      ['a', 'Confirmation mail', 'via mailing service', 'newsletterSubscribe'],
      ['u', 'Clicks link', '/newsletter/confirm'],
      ['a', 'Added to list', 'consent stored', 'newsletterConfirm'],
      ['u', 'Unsubscribes any time', '/newsletter/unsubscribe', 'newsletterUnsubscribe'],
    ],
  },
  {
    id: 'renew', title: 'Renewal and team seats', try: '/account/subscription',
    nodes: [
      ['a', 'Reminder', '30 and 7 days before end'],
      ['u', 'Renews in one click', '/account/subscription', 'renew'],
      ['a', 'New invoice', 'same chain as an order'],
      ['u', 'Manages seats', '/account/team', 'seatsUpdate'],
      ['a', 'Auto-pause', 'no payment → access paused, progress kept'],
    ],
  },
];

const KIND = { u: 'User', a: 'n8n', h: 'Team' };

export default function Flows() {
  return (
    <div className="page">
      <div className="wrap">
        <PageHead label="For the team" title={<>User <span className="serif">flows.</span></>}>
          <p className="lead">Where the visitor goes, what is automated and where a person stays in the loop. Dashed nodes are n8n webhooks or scheduled workflows.</p>
          <div className="row">
            <span className="flow-node" style={{ flex: 'none', padding: '8px 14px' }}>User on the site</span>
            <span className="flow-node auto" style={{ flex: 'none', padding: '8px 14px' }}>Automation (n8n)</span>
            <span className="flow-node human" style={{ flex: 'none', padding: '8px 14px' }}>Person on the team</span>
          </div>
        </PageHead>

        {FLOWS.map((f) => (
          <section key={f.id} style={{ marginBottom: 56 }}>
            <div className="between" style={{ marginBottom: 16 }}>
              <h2 className="h-2">{f.title}</h2>
              <Link to={f.try} className="link">Try it</Link>
            </div>
            <div className="flow">
              {f.nodes.map(([k, t, d, hook], i) => (
                <span key={t} style={{ display: 'contents' }}>
                  {i > 0 && <span className="flow-arrow">→</span>}
                  <div className={`flow-node ${k === 'a' ? 'auto' : k === 'h' ? 'human' : ''}`}>
                    <div className="label" style={{ color: k === 'a' ? 'var(--accent)' : k === 'h' ? '#9a9a95' : undefined }}>{KIND[k]}</div>
                    <b style={{ display: 'block', margin: '6px 0 4px' }}>{t}</b>
                    <span style={{ fontSize: 13, opacity: 0.7 }}>{d}</span>
                    {hook && <div className="mono" style={{ fontSize: 10.5, marginTop: 8, color: 'var(--accent)' }}>{WEBHOOKS[hook]}</div>}
                  </div>
                </span>
              ))}
            </div>
          </section>
        ))}

        <section className="card">
          <h2 className="h-3" style={{ marginBottom: 12 }}>Webhook map</h2>
          <p className="hint">All calls go through <span className="mono">src/lib/api.js</span>. Set <span className="mono">VITE_N8N_BASE_URL</span> in <span className="mono">.env</span> to switch from mock data to n8n.</p>
          <table className="tbl">
            <thead><tr><th>Name</th><th>Path</th></tr></thead>
            <tbody>{Object.entries(WEBHOOKS).map(([k, v]) => <tr key={k}><td className="mono">{k}</td><td className="mono">{v}</td></tr>)}</tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
