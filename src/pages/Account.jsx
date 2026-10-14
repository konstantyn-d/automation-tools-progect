import { useEffect, useState } from 'react';
import { Link, NavLink, Route, Routes } from 'react-router-dom';
import { MorphBlob } from '../components/Blobs.jsx';
import { Field, Hook, Spinner } from '../components/ui.jsx';
import { checkVat, getAccount, renewSubscription, updateBilling, updateSeats } from '../lib/api.js';
import { useAuth } from '../lib/auth.jsx';
import { openInvoice } from '../lib/invoice.js';
import { eur } from '../lib/vat.js';

export default function Account() {
  const { user, signOut } = useAuth();
  const [acc, setAcc] = useState(null);
  useEffect(() => { getAccount().then(setAcc); }, []);

  return (
    <div className="page">
      <div className="wrap">
        <div className="between" style={{ marginBottom: 40 }}>
          <div className="stack" style={{ gap: 8 }}>
            <div className="label">My account</div>
            <h1 className="h-1">Hi {user.name?.split(' ')[0] || 'there'}<span className="accent">.</span></h1>
          </div>
          <button className="link" onClick={signOut}>Log out</button>
        </div>
        <div className="acc">
          <nav className="acc-nav">
            <NavLink end to="/account">Overview</NavLink>
            <NavLink to="/account/invoices">Invoices</NavLink>
            <NavLink to="/account/billing">Billing details</NavLink>
            <NavLink to="/account/team">Team seats</NavLink>
            <NavLink to="/account/subscription">Subscription</NavLink>
          </nav>
          <div>
            {!acc ? <Spinner /> : (
              <Routes>
                <Route index element={<Overview acc={acc} />} />
                <Route path="invoices" element={<Invoices acc={acc} />} />
                <Route path="billing" element={<Billing acc={acc} onSaved={setAcc} />} />
                <Route path="team" element={<Team acc={acc} onSaved={setAcc} />} />
                <Route path="subscription" element={<Subscription acc={acc} onSaved={setAcc} />} />
              </Routes>
            )}
            <div style={{ marginTop: 24 }}><Hook name="account" note="loads all account data" /></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SubBanner({ acc }) {
  const s = acc.subscription;
  if (s.status !== 'expiring') return null;
  return (
    <div className="card card-ink" style={{ overflow: 'hidden' }}>
      <MorphBlob size={260} color="var(--accent)" style={{ position: 'absolute', right: -60, top: -80 }} />
      <div className="stack" style={{ position: 'relative', maxWidth: 520 }}>
        <div className="label">Renewal</div>
        <h3 className="h-2">Your {s.plan.toLowerCase()} ends in {s.daysLeft} days.</h3>
        <p className="dim">Renew now and keep all {s.seats} seats. You get the invoice right away.</p>
        <Link to="/account/subscription" className="btn btn-accent" style={{ alignSelf: 'flex-start' }}>Renew in one click</Link>
      </div>
    </div>
  );
}

function Overview({ acc }) {
  return (
    <div className="stack">
      <SubBanner acc={acc} />
      <div className="grid-2">
        <div className="card stack">
          <div className="label">Continue learning</div>
          {acc.progress.map((p) => (
            <Link key={p.slug} to={`/courses/${p.slug}`} style={{ textDecoration: 'none' }} className="stack">
              <div className="between" style={{ alignItems: 'center', flexWrap: 'nowrap' }}><b>{p.title}</b><span className="mono dim">{p.pct}%</span></div>
              <div className="bar" style={{ marginTop: 6 }}><i style={{ width: `${p.pct}%` }} /></div>
            </Link>
          ))}
        </div>
        <div className="card stack">
          <div className="label">At a glance</div>
          <div className="sum-row" style={{ borderColor: 'var(--line)' }}><span className="dim">Plan</span><span>{acc.subscription.plan}</span></div>
          <div className="sum-row" style={{ borderColor: 'var(--line)' }}><span className="dim">Seats used</span><span>{acc.members.length} / {acc.subscription.seats}</span></div>
          <div className="sum-row" style={{ borderColor: 'var(--line)' }}><span className="dim">Open invoices</span><span>{acc.invoices.filter((i) => i.status === 'open').length}</span></div>
          <div className="sum-row" style={{ borderColor: 'var(--line)' }}><span className="dim">Ends on</span><span>{acc.subscription.renewsAt}</span></div>
        </div>
      </div>
    </div>
  );
}

function Invoices({ acc }) {
  const pdf = (inv) => openInvoice({
    invoiceNo: inv.no, createdAt: inv.date, company: acc.billing.company, name: acc.user.name, email: acc.billing.invoiceEmail,
    po: acc.billing.po, plan: acc.subscription.plan, seats: 1, gross: +(inv.amount / 1.21).toFixed(2), discount: 0,
    vatLabel: 'BE VAT 21%', vat: +(inv.amount - inv.amount / 1.21).toFixed(2), total: inv.amount,
    iban: 'BE68 5390 0754 7034', bic: 'KREDBEBB', ogm: inv.ogm,
  });
  return (
    <div className="card">
      <div className="between" style={{ marginBottom: 12 }}>
        <h2 className="h-3">Invoices</h2>
        <span className="hint">Copies are always here, no need to email us.</span>
      </div>
      <table className="tbl">
        <thead><tr><th>Number</th><th>Date</th><th className="hide-sm">Reference</th><th>Amount</th><th>Status</th><th /></tr></thead>
        <tbody>
          {acc.invoices.map((i) => (
            <tr key={i.no}>
              <td className="mono">{i.no}</td>
              <td>{i.date}</td>
              <td className="mono hide-sm" style={{ fontSize: 13 }}>{i.ogm}</td>
              <td>{eur(i.amount)}</td>
              <td><span className={`chip ${i.status === 'open' ? 'chip-accent' : ''}`}>{i.status}</span></td>
              <td><button className="btn btn-ghost btn-sm" onClick={() => pdf(i)}>PDF</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Billing({ acc, onSaved }) {
  const [b, setB] = useState(acc.billing);
  const [vat, setVat] = useState({ status: acc.billing.vatStatus });
  const [state, setState] = useState('idle');
  const set = (k) => (e) => setB({ ...b, [k]: e.target.value });
  const save = async (e) => {
    e.preventDefault();
    setState('saving');
    onSaved(await updateBilling({ ...b, vatStatus: vat.status }));
    setState('saved');
  };
  return (
    <form className="card stack" onSubmit={save}>
      <h2 className="h-3">Billing details</h2>
      <p className="hint">Changes apply to the next invoice. Need a corrected invoice? Ask support, we issue a credit note.</p>
      <div className="form-grid">
        <Field label="Company"><input className="input" value={b.company} onChange={set('company')} /></Field>
        <Field label="Invoice email"><input className="input" type="email" value={b.invoiceEmail} onChange={set('invoiceEmail')} /></Field>
        <Field label="VAT number" error={vat.status === 'invalid' ? 'Not valid in VIES.' : null} hint={vat.status === 'valid' ? 'Valid in VIES.' : null}>
          <input className="input" value={b.vat} onChange={(e) => { set('vat')(e); setVat({}); }} onBlur={async () => setVat(await checkVat(b.vat))} />
        </Field>
        <Field label="PO number"><input className="input" value={b.po} onChange={set('po')} /></Field>
        <Field label="Address" className="full"><input className="input" value={b.address} onChange={set('address')} /></Field>
      </div>
      <div className="row">
        <button className="btn btn-ink" disabled={state === 'saving' || vat.status === 'invalid'}>{state === 'saving' ? <Spinner /> : 'Save'}</button>
        {state === 'saved' && <span className="hint">Saved.</span>}
      </div>
      <Hook name="billingUpdate" />
    </form>
  );
}

function Team({ acc, onSaved }) {
  const [members, setMembers] = useState(acc.members);
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const free = acc.subscription.seats - members.length;
  const persist = async (next) => {
    setMembers(next); setSaving(true);
    onSaved(await updateSeats(next));
    setSaving(false);
  };
  return (
    <div className="card stack">
      <div className="between"><h2 className="h-3">Team seats</h2><span className="chip">{members.length} / {acc.subscription.seats} used</span></div>
      <table className="tbl">
        <tbody>
          {members.map((m) => (
            <tr key={m.email}>
              <td><b>{m.name || '—'}</b><div className="hint">{m.email}</div></td>
              <td><span className={`chip ${m.status === 'invited' ? 'chip-accent' : ''}`}>{m.status}</span></td>
              <td style={{ textAlign: 'right' }}>
                {m.email !== acc.user.email && <button className="link" onClick={() => persist(members.filter((x) => x.email !== m.email))}>Remove</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <form className="row" style={{ flexWrap: 'nowrap' }} onSubmit={(e) => { e.preventDefault(); if (email && free > 0) { persist([...members, { email, name: '', status: 'invited' }]); setEmail(''); } }}>
        <input className="input" type="email" placeholder="colleague@company.be" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button className="btn btn-ink btn-sm" disabled={free <= 0 || saving}>{saving ? <Spinner /> : 'Invite'}</button>
      </form>
      <p className="hint">{free > 0 ? `${free} free seat${free === 1 ? '' : 's'}. Invited people get an email to set their password.` : 'All seats used. Add seats when you renew.'}</p>
      <Hook name="seatsUpdate" note="invite email, deactivate removed users" />
    </div>
  );
}

function Subscription({ acc, onSaved }) {
  const s = acc.subscription;
  const [busy, setBusy] = useState(false);
  const renew = async () => { setBusy(true); onSaved(await renewSubscription()); setBusy(false); };
  return (
    <div className="stack">
      <div className="card stack">
        <div className="between"><h2 className="h-3">{s.plan}</h2><span className={`chip ${s.status === 'expiring' ? 'chip-accent' : 'on'}`}>{s.status}</span></div>
        <div className="sum-row" style={{ borderColor: 'var(--line)' }}><span className="dim">Seats</span><span>{s.seats}</span></div>
        <div className="sum-row" style={{ borderColor: 'var(--line)' }}><span className="dim">Price</span><span>{eur(s.price)} / year for {s.seats} seats excl. VAT</span></div>
        <div className="sum-row" style={{ borderColor: 'var(--line)' }}><span className="dim">{s.status === 'active' ? 'Renews on' : 'Ends on'}</span><span>{s.renewsAt}</span></div>
        {s.status === 'expiring' ? (
          <button className="btn-mega" onClick={renew} disabled={busy} style={{ alignSelf: 'flex-start' }}>
            {busy ? 'Renewing…' : `Renew for ${eur(s.price * 1.21)}`}<span className="arrow">{busy ? <Spinner /> : '↻'}</span>
          </button>
        ) : (
          <div className="notice ink">Renewed. Your new invoice is under Invoices and in your inbox.</div>
        )}
        <p className="hint">Reminders go out 30 and 7 days before the end. If the period ends without payment, access is paused automatically, your progress is kept.</p>
        <Hook name="renew" note="new invoice + structured reference" />
      </div>
    </div>
  );
}
