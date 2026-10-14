import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BlobField } from '../components/Blobs.jsx';
import { Field, Hook, PageHead, Spinner } from '../components/ui.jsx';
import { createSupport } from '../lib/api.js';
import { useAuth } from '../lib/auth.jsx';

// Self-service first: these three topics were ~53% of all support mail in the dataset.
const SELF = [
  { q: 'I forgot my password', a: 'Reset it yourself in 1 minute.', to: '/forgot-password', cta: 'Reset password' },
  { q: 'I paid, where is my access?', a: 'Your order page shows the payment status live.', to: '/account', cta: 'My account' },
  { q: 'I need a copy of my invoice / add a PO', a: 'All invoices and billing details are in your account.', to: '/account/invoices', cta: 'Invoices' },
];

const TOPICS = [
  ['access', 'Login or access'],
  ['invoice', 'Invoice, VAT or PO'],
  ['payment', 'Payment'],
  ['content', 'Question about a lesson'],
  ['idea', 'Course idea'],
  ['refund', 'Cancellation or refund'],
  ['other', 'Something else'],
];

export default function Support() {
  const [params] = useSearchParams();
  const { user } = useAuth();
  const [f, setF] = useState({ email: user?.email || '', topic: params.get('topic') || 'access', ref: '', message: '', lang: 'EN' });
  const [state, setState] = useState({ loading: false, ticket: null, error: '' });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setState({ loading: true });
    try { setState({ ticket: await createSupport(f) }); } catch (err) { setState({ error: err.message }); }
  };

  return (
    <div className="page">
      <BlobField blobs={[{ x: '84%', y: '4%', size: 220, duration: 13 }, { x: '76%', y: '14%', size: 140, duration: 10, delay: -5, dx1: 80 }]} />
      <div className="wrap" style={{ position: 'relative' }}>
        <PageHead label="Support" title={<>How can we <span className="serif">help?</span></>}>
          <p className="lead">Most answers are one click away. For everything else, send the form and you get a ticket number. We reply within one business day.</p>
        </PageHead>

        <div className="grid-3" style={{ marginBottom: 56 }}>
          {SELF.map((s) => (
            <Link key={s.q} to={s.to} className="card card-hover stack" style={{ textDecoration: 'none' }}>
              <h3 className="h-3">{s.q}</h3>
              <p className="dim" style={{ margin: 0 }}>{s.a}</p>
              <span className="link" style={{ alignSelf: 'flex-start' }}>{s.cta}</span>
            </Link>
          ))}
        </div>

        <div className="grid-2" style={{ gridTemplateColumns: '1.4fr 1fr', alignItems: 'start' }}>
          {state.ticket ? (
            <div className="card card-ink stack">
              <div className="label">Ticket {state.ticket.ticketId}</div>
              <h2 className="h-2">Got it. We reply within {state.ticket.sla}.</h2>
              <p className="dim">A confirmation with your ticket number is in your inbox. Reply to that email to add details, it stays in the same ticket.</p>
              <span className="chip" style={{ alignSelf: 'flex-start', background: 'transparent', color: '#fff', borderColor: '#444' }}>Sorted as: {state.ticket.category}</span>
            </div>
          ) : (
            <form className="card stack" onSubmit={submit}>
              <div className="form-grid">
                <Field label="Email"><input className="input" type="email" required value={f.email} onChange={set('email')} /></Field>
                <Field label="Topic">
                  <select className="select" value={f.topic} onChange={set('topic')}>{TOPICS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
                </Field>
                <Field label="Order or invoice number (optional)" className="full"><input className="input" value={f.ref} onChange={set('ref')} placeholder="2026-0137 or ORD-…" /></Field>
                <Field label="Message" className="full" hint="English or Dutch, both fine.">
                  <textarea className="textarea" required value={f.message} onChange={set('message')} />
                </Field>
              </div>
              {f.topic === 'refund' && <div className="notice">Cancellations and refunds are always decided by a person on our team.</div>}
              {state.error && <div className="notice accent">{state.error}</div>}
              <button className="btn btn-ink" disabled={state.loading} style={{ alignSelf: 'flex-start' }}>{state.loading ? <Spinner /> : 'Send'}</button>
              <Hook name="supportCreate" note="AI triage → draft → human approves" />
            </form>
          )}

          <aside className="card card-soft stack">
            <div className="label">What happens next</div>
            <ol className="timeline">
              <li className="done"><span className="tdot">1</span><div><b>Ticket created</b><div className="hint">You get a number, nothing gets lost in a mailbox.</div></div></li>
              <li className="done"><span className="tdot">2</span><div><b>Sorted automatically</b><div className="hint">An AI assistant reads the message, picks the topic and prepares a draft answer with your order data.</div></div></li>
              <li className="now"><span className="tdot">3</span><div><b>A person checks and sends</b><div className="hint">Nothing goes out without a human on our team approving it.</div></div></li>
            </ol>
            <p className="hint">We only share what is needed with the AI service (no payment data) and it runs under a data processing agreement.</p>
          </aside>
        </div>
      </div>
    </div>
  );
}
