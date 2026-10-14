import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MorphBlob } from '../components/Blobs.jsx';
import { Hook, Spinner } from '../components/ui.jsx';
import { getOrder, MOCK, mockMarkPaid } from '../lib/api.js';
import { eur } from '../lib/vat.js';
import { openInvoice } from '../lib/invoice.js';

export default function OrderStatus() {
  const { id } = useParams();
  const [o, setO] = useState(null);
  const [err, setErr] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = () => getOrder(id).then((x) => alive && setO(x)).catch((e) => alive && setErr(e.message));
    load();
    // The page polls while payment is pending; the bank-matching workflow changes the status.
    const t = setInterval(load, 15000);
    return () => { alive = false; clearInterval(t); };
  }, [id]);

  if (err) return <div className="page"><div className="wrap"><h1 className="h-2">{err}</h1><Link to="/order" className="link">New order</Link></div></div>;
  if (!o) return <div className="page"><div className="wrap"><Spinner /></div></div>;

  const paid = o.status === 'paid';
  const steps = [
    { t: 'Order received', d: new Date(o.createdAt).toLocaleString('nl-BE'), s: 'done' },
    { t: `Invoice ${o.invoiceNo} sent to ${o.email}`, d: 'PDF with the structured reference', s: 'done' },
    { t: paid ? 'Payment received' : 'Waiting for your transfer', d: paid ? 'Matched automatically with your structured reference' : 'We check the bank every morning. Usually the same day.', s: paid ? 'done' : 'now' },
    { t: 'Account ready', d: paid ? 'Check your inbox for the link to set your password' : 'Created automatically after payment', s: paid ? 'done' : '' },
  ];

  const copy = () => { navigator.clipboard?.writeText(o.ogm); setCopied(true); setTimeout(() => setCopied(false), 1500); };

  return (
    <div className="page">
      <MorphBlob size={520} style={{ position: 'absolute', right: -180, top: 40, zIndex: 0 }} />
      <div className="wrap" style={{ position: 'relative' }}>
        <div className="stack" style={{ marginBottom: 40, maxWidth: 760 }}>
          <div className="label">Order {o.id}</div>
          <h1 className="h-1">{paid ? <>You're in. <span className="serif">Start learning.</span></> : <>Thanks! One step <span className="serif">left.</span></>}</h1>
          <p className="lead">{paid ? 'We received your payment. Your account was created automatically.' : `Transfer ${eur(o.total)} with the reference below. No need to send us proof of payment.`}</p>
        </div>

        <div className="grid-2" style={{ alignItems: 'start' }}>
          <div className="card stack" style={{ background: 'rgba(255,255,255,.92)' }}>
            {!paid ? (
              <>
                <div className="label">Pay by bank transfer</div>
                <div className="sum-row" style={{ borderColor: 'var(--line)' }}><span className="dim">Amount</span><b>{eur(o.total)}</b></div>
                <div className="sum-row" style={{ borderColor: 'var(--line)' }}><span className="dim">IBAN</span><span className="mono">{o.iban}</span></div>
                <div className="sum-row" style={{ borderColor: 'var(--line)' }}><span className="dim">BIC</span><span className="mono">{o.bic}</span></div>
                <div className="sum-row" style={{ borderColor: 'var(--line)' }}><span className="dim">Beneficiary</span><span>LoopCasts BV</span></div>
                <div className="label" style={{ marginTop: 12 }}>Structured reference (required)</div>
                <div className="row">
                  <span className="ogm">{o.ogm}</span>
                  <button className="btn btn-ghost btn-sm" onClick={copy}>{copied ? 'Copied' : 'Copy'}</button>
                </div>
                <p className="hint">With this reference your payment is matched automatically, so you get access the same day instead of after a manual check.</p>
              </>
            ) : (
              <>
                <div className="label">Next steps</div>
                <p>We sent a link to <b>{o.email}</b> to set your password. The link works for 24 hours.</p>
                <div className="row">
                  <Link className="btn btn-ink" to="/reset-password?token=welcome-demo&welcome=1">Set my password</Link>
                  <Link className="btn btn-ghost" to="/courses">Browse courses</Link>
                </div>
              </>
            )}
            <hr className="divider" style={{ margin: '12px 0' }} />
            <div className="row">
              <button className="btn btn-ghost btn-sm" onClick={() => openInvoice(o)}>Download invoice PDF</button>
              <span className="hint">{o.vatLabel}{!o.vatChecked && ' · VAT number not checked yet'}</span>
            </div>
            <Hook name="orderStatus" note="polled every 15 s" />
          </div>

          <div className="card">
            <div className="label" style={{ marginBottom: 20 }}>Status</div>
            <ol className="timeline">
              {steps.map((s) => (
                <li key={s.t} className={s.s}>
                  <span className="tdot">{s.s === 'done' ? '✓' : ''}</span>
                  <div><b>{s.t}</b><div className="hint">{s.d}</div></div>
                </li>
              ))}
            </ol>
            {MOCK && !paid && (
              <div className="notice accent" style={{ flexDirection: 'column' }}>
                <span><b>Demo:</b> in production the daily bank-matching workflow marks this order as paid.</span>
                <button className="btn btn-accent btn-sm" onClick={() => setO(mockMarkPaid(o.id))}>Simulate bank payment</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
