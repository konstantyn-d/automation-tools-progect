import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MorphBlob } from '../components/Blobs.jsx';
import { Hook, Spinner } from '../components/ui.jsx';
import { confirmNewsletter, unsubscribeNewsletter } from '../lib/api.js';

function Center({ children }) {
  return (
    <div className="page" style={{ display: 'grid', placeItems: 'center', textAlign: 'center' }}>
      <MorphBlob size={380} style={{ position: 'absolute', left: '50%', top: 80, transform: 'translateX(-50%)', opacity: 0.06 }} />
      <div className="wrap stack" style={{ maxWidth: 640, position: 'relative' }}>{children}</div>
    </div>
  );
}

// Reached from the link in the double opt-in email.
export function NewsletterConfirm() {
  const [params] = useSearchParams();
  const [state, setState] = useState('loading');
  useEffect(() => {
    confirmNewsletter(params.get('token') || 'demo').then(() => setState('ok')).catch(() => setState('error'));
  }, [params]);
  return (
    <Center>
      {state === 'loading' && <Spinner />}
      {state === 'ok' && <>
        <div className="label">Newsletter</div>
        <h1 className="h-1">You're <span className="serif">subscribed.</span></h1>
        <p className="lead" style={{ margin: '0 auto' }}>See you Thursday. Every mail has a one-click unsubscribe link at the bottom.</p>
        <Link to="/courses" className="btn btn-ink" style={{ alignSelf: 'center' }}>Browse courses</Link>
      </>}
      {state === 'error' && <h1 className="h-2">This link is no longer valid.</h1>}
      <Hook name="newsletterConfirm" />
    </Center>
  );
}

// Reached from the unsubscribe link in every newsletter. One click, no login.
export function Unsubscribe() {
  const [params] = useSearchParams();
  const [reason, setReason] = useState('');
  const [state, setState] = useState('idle');
  const go = async () => {
    setState('loading');
    await unsubscribeNewsletter(params.get('token') || 'demo', reason);
    setState('done');
  };
  return (
    <Center>
      <div className="label">Newsletter</div>
      {state === 'done' ? (
        <>
          <h1 className="h-1">You're <span className="serif">out.</span></h1>
          <p className="lead" style={{ margin: '0 auto' }}>You won't get the newsletter anymore. Invoices and account emails still arrive.</p>
        </>
      ) : (
        <>
          <h1 className="h-1">Unsubscribe?</h1>
          <select className="select" value={reason} onChange={(e) => setReason(e.target.value)} style={{ maxWidth: 360, margin: '0 auto' }} aria-label="Reason (optional)">
            <option value="">Reason (optional)</option>
            <option>Too many emails</option>
            <option>Not relevant anymore</option>
            <option>I never signed up</option>
          </select>
          <button className="btn btn-ink" onClick={go} disabled={state === 'loading'} style={{ alignSelf: 'center' }}>{state === 'loading' ? <Spinner /> : 'Unsubscribe'}</button>
        </>
      )}
      <Hook name="newsletterUnsubscribe" />
    </Center>
  );
}
