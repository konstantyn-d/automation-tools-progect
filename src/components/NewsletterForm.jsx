import { useState } from 'react';
import { subscribeNewsletter } from '../lib/api.js';
import { Hook, Spinner } from './ui.jsx';

// Double opt-in: this only sends a confirmation mail. The address is added to the
// mailing service when the person clicks the link (/newsletter/confirm?token=...).
export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState('idle');

  const submit = async (e) => {
    e.preventDefault();
    setState('loading');
    try { await subscribeNewsletter(email); setState('sent'); } catch { setState('error'); }
  };

  if (state === 'sent') {
    return (
      <div className="notice ink">
        <span>Almost there. We sent a confirmation link to <b>{email}</b>. You are only subscribed after you click it.</span>
      </div>
    );
  }
  return (
    <form onSubmit={submit} className="stack">
      <div className="search-big" style={{ padding: '6px 6px 6px 20px' }}>
        <input type="email" required placeholder="you@company.be" value={email} onChange={(e) => setEmail(e.target.value)} style={{ fontSize: 16 }} aria-label="Email" />
        <button className="btn btn-ink btn-sm" disabled={!consent || state === 'loading'}>
          {state === 'loading' ? <Spinner /> : 'Subscribe'}
        </button>
      </div>
      <label className="row hint" style={{ gap: 8, flexWrap: 'nowrap', alignItems: 'flex-start' }}>
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <span>I agree to receive the weekly newsletter. Every mail has an unsubscribe link.</span>
      </label>
      {state === 'error' && <small className="hint err">Something went wrong. Try again.</small>}
      <Hook name="newsletterSubscribe" note="double opt-in" />
    </form>
  );
}
