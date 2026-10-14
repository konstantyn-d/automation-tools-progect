import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Arrow } from '../components/Blobs.jsx';
import { Field, Hook, PageHead, Spinner } from '../components/ui.jsx';
import { PLANS } from '../data/catalog.js';
import { checkPromo, checkVat, createOrder, priceOrder } from '../lib/api.js';
import { COUNTRIES, EU, eur } from '../lib/vat.js';
import { PlanCard } from './Pricing.jsx';

const STEPS = ['Plan', 'Your details', 'Review'];

export default function Order() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [planId, setPlanId] = useState(PLANS.some((p) => p.id === params.get('plan')) ? params.get('plan') : 'yearly');
  const [seats, setSeats] = useState(5);
  const [f, setF] = useState({ isCompany: planId === 'team', name: '', email: '', company: '', country: 'BE', vat: '', po: '', address: '' });
  const [vatRes, setVatRes] = useState(null);
  const [vatLoading, setVatLoading] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promo, setPromo] = useState(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [terms, setTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { scrollTo({ top: 0, behavior: 'smooth' }); }, [step]);

  const plan = PLANS.find((p) => p.id === planId);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const vatStatus = f.isCompany && EU.includes(f.country) ? vatRes?.status : undefined;
  const price = useMemo(
    () => priceOrder({ planId, seats, promo, country: f.country, isCompany: f.isCompany, vatStatus }),
    [planId, seats, promo, f.country, f.isCompany, vatStatus],
  );

  const runVat = async () => {
    if (!f.vat) return;
    setVatLoading(true);
    try { setVatRes(await checkVat(f.vat)); } catch { setVatRes({ status: 'unavailable', message: 'VIES did not answer.' }); }
    setVatLoading(false);
  };
  const runPromo = async () => {
    if (!promoCode) return;
    setPromoLoading(true);
    try { setPromo(await checkPromo(promoCode, planId)); } catch { setPromo({ valid: false, message: 'Could not check the code.' }); }
    setPromoLoading(false);
  };

  const needsVat = f.isCompany && EU.includes(f.country);
  const detailsOk = f.name && /\S+@\S+\.\S+/.test(f.email) && f.address
    && (!f.isCompany || f.company)
    && (!needsVat || (vatRes && vatRes.status !== 'invalid'));

  const submit = async () => {
    setSubmitting(true); setError('');
    try {
      const o = await createOrder({ planId, seats, promo, ...f, vatStatus: vatRes?.status });
      nav(`/order/${o.id}`);
    } catch (e) {
      setError(e.message || 'The order could not be saved. Nothing was charged. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <div className="wrap">
        <PageHead label="Order" title={<>Order in <span className="serif">two minutes.</span></>} />
        <div className="progress-steps">
          {STEPS.map((s, i) => (
            <span key={s} style={{ display: 'contents' }}>
              {i > 0 && <span className="sep" />}
              <span className={`ps ${i <= step ? 'on' : ''}`}><i>{i + 1}</i>{s}</span>
            </span>
          ))}
        </div>

        <div className="grid-2" style={{ gridTemplateColumns: '1.5fr 1fr', alignItems: 'start' }}>
          <div className="stack">
            {step === 0 && (
              <>
                <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                  {PLANS.map((p) => (
                    <PlanCard key={p.id} plan={p} selected={planId === p.id}
                      onSelect={() => { setPlanId(p.id); if (p.id === 'team') setF({ ...f, isCompany: true }); }} />
                  ))}
                </div>
                {plan.perSeat && (
                  <Field label="Number of seats" hint={`Minimum ${plan.minSeats}. You can add or remove people later in your account.`}>
                    <input className="input" type="number" min={plan.minSeats} value={seats} onChange={(e) => setSeats(e.target.value)} style={{ maxWidth: 160 }} />
                  </Field>
                )}
                <div><button className="btn btn-ink" onClick={() => setStep(1)}>Continue <Arrow /></button></div>
              </>
            )}

            {step === 1 && (
              <>
                <div className="toggle" role="group" aria-label="Customer type">
                  <button className={!f.isCompany ? 'on' : ''} onClick={() => setF({ ...f, isCompany: false })} disabled={plan.id === 'team'}>Private person</button>
                  <button className={f.isCompany ? 'on' : ''} onClick={() => setF({ ...f, isCompany: true })}>Company</button>
                </div>
                <div className="form-grid">
                  <Field label="Full name"><input className="input" value={f.name} onChange={set('name')} autoComplete="name" /></Field>
                  <Field label="Email" hint="Invoice and login link go here."><input className="input" type="email" value={f.email} onChange={set('email')} autoComplete="email" /></Field>
                  {f.isCompany && <Field label="Company name"><input className="input" value={f.company} onChange={set('company')} autoComplete="organization" /></Field>}
                  <Field label="Country">
                    <select className="select" value={f.country} onChange={(e) => { set('country')(e); setVatRes(null); }}>
                      {COUNTRIES.map(([c, n]) => <option key={c} value={c}>{n}</option>)}
                    </select>
                  </Field>
                  <Field label="Billing address" className="full"><input className="input" value={f.address} onChange={set('address')} autoComplete="street-address" placeholder="Street, number, postcode, city" /></Field>
                  {f.isCompany && (
                    <div className="full stack" style={{ gap: 8 }}>
                      <Field label="VAT number"
                        error={vatRes?.status === 'invalid' ? vatRes.message : null}
                        hint={needsVat ? 'Checked live in the EU VIES database. Try XX123 to see what happens when VIES is down.' : 'Not needed outside the EU.'}>
                        <div className="row" style={{ flexWrap: 'nowrap' }}>
                          <input className={`input ${vatRes?.status === 'invalid' ? 'bad' : ''}`} value={f.vat} placeholder="BE0123456789"
                            onChange={(e) => { set('vat')(e); setVatRes(null); }} onBlur={runVat} />
                          <button type="button" className="btn btn-ghost btn-sm" onClick={runVat} disabled={!f.vat || vatLoading}>{vatLoading ? <Spinner /> : 'Check'}</button>
                        </div>
                      </Field>
                      {vatRes?.status === 'valid' && <div className="notice"><span className="badge-dot" style={{ marginTop: 7 }} />Valid in VIES: <b>{vatRes.name}</b></div>}
                      {vatRes?.status === 'unavailable' && <div className="notice accent">{vatRes.message}</div>}
                      <Hook name="vatCheck" note="VIES API" />
                    </div>
                  )}
                  {f.isCompany && <Field label="PO number (optional)" hint="Printed on every invoice." className="full"><input className="input" value={f.po} onChange={set('po')} /></Field>}
                </div>
                <div className="row">
                  <button className="btn btn-ghost" onClick={() => setStep(0)}>Back</button>
                  <button className="btn btn-ink" onClick={() => setStep(2)} disabled={!detailsOk}>Continue <Arrow /></button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="card stack">
                  <div className="label">Billed to</div>
                  <div>{f.isCompany ? <><b>{f.company}</b> · {f.vat || 'no VAT number'}<br /></> : null}{f.name} · {f.email}<br /><span className="dim">{f.address}, {f.country}</span>{f.po && <><br />PO {f.po}</>}</div>
                  <button className="link" style={{ alignSelf: 'flex-start' }} onClick={() => setStep(1)}>Edit</button>
                </div>
                <Field label="Promo code" error={promo && !promo.valid ? promo.message : null} hint={promo?.valid ? `${promo.label} applied.` : 'Try LOOP10.'}>
                  <div className="row" style={{ flexWrap: 'nowrap' }}>
                    <input className="input" value={promoCode} onChange={(e) => { setPromoCode(e.target.value); setPromo(null); }} style={{ textTransform: 'uppercase' }} />
                    <button type="button" className="btn btn-ghost btn-sm" onClick={runPromo} disabled={!promoCode || promoLoading}>{promoLoading ? <Spinner /> : 'Apply'}</button>
                  </div>
                </Field>
                <Hook name="promoCheck" />
                <label className="row" style={{ flexWrap: 'nowrap', alignItems: 'flex-start', gap: 10 }}>
                  <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
                  <span className="hint">I accept the terms and the privacy policy. I pay by bank transfer within 14 days using the structured reference on the invoice.</span>
                </label>
                {error && <div className="notice accent">{error}</div>}
                <div className="row">
                  <button className="btn btn-ghost" onClick={() => setStep(1)}>Back</button>
                  <button className="btn-mega" onClick={submit} disabled={!terms || submitting}>
                    {submitting ? 'Creating your invoice…' : `Place order · ${eur(price.total)}`}
                    <span className="arrow">{submitting ? <Spinner /> : <Arrow />}</span>
                  </button>
                </div>
                <Hook name="orderCreate" note="saves order, invoice number, PDF, email" />
              </>
            )}
          </div>

          <aside className="card card-ink summary">
            <div className="label" style={{ marginBottom: 12 }}>Summary</div>
            <h3 className="h-3" style={{ marginBottom: 16 }}>{plan.name}{plan.perSeat ? ` × ${price.seats}` : ''}</h3>
            <div className="sum-row"><span>Subtotal</span><span>{eur(price.gross)}</span></div>
            {price.discount > 0 && <div className="sum-row"><span>Promo {promo.code}</span><span>− {eur(price.discount)}</span></div>}
            <div className="sum-row"><span>{price.vatLabel}</span><span>{eur(price.vat)}</span></div>
            <div className="between" style={{ marginTop: 18, alignItems: 'baseline' }}>
              <span className="label">Total</span><span className="sum-total">{eur(price.total)}</span>
            </div>
            <p className="dim" style={{ fontSize: 13, marginTop: 18 }}>
              Next: you get a PDF invoice by email right away. Pay by transfer with the structured reference and your account opens the same day we receive the payment.
            </p>
            <p className="dim" style={{ fontSize: 12 }}>Already a customer? <Link to="/login" style={{ color: '#fff' }}>Log in</Link></p>
          </aside>
        </div>
      </div>
    </div>
  );
}
