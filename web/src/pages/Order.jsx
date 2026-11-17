import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { PLANS } from '../data/site.js'
import { COURSES, TOPICS, findCourse } from '../data/courses.js'
import { COUNTRIES, EU_COUNTRIES, calculateVat, euro, looksLikeVatNumber } from '../lib/vat.js'
import { useSession } from '../lib/session.jsx'
import { useAdmin } from '../lib/adminStore.jsx'
import '../styles/order.css'

// Where the order goes. Empty = demo mode: the form validates and shows the result, nothing is sent.
const WEBHOOK_URL = import.meta.env.VITE_ORDER_WEBHOOK_URL || ''

const EMPTY = {
  product: 'yearly',
  course: COURSES[0].slug,
  firstName: '',
  lastName: '',
  email: '',
  customerType: 'private',
  company: '',
  vatNumber: '',
  street: '',
  postalCode: '',
  city: '',
  country: 'BE',
  poNumber: '',
  discountCode: '',
  newsletter: false,
  terms: false,
  website: '', // honeypot: people never see this field, simple bots fill it in
}

// Returns an object { fieldName: 'message' } with everything that is still wrong.
function validate(v) {
  const errors = {}
  const isCompany = v.customerType === 'company'
  if (!v.firstName.trim()) errors.firstName = 'Please fill in your first name'
  if (!v.lastName.trim()) errors.lastName = 'Please fill in your last name'
  if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(v.email.trim())) errors.email = 'This does not look like an e-mail address'
  if (isCompany) {
    if (!v.company.trim()) errors.company = 'We need the company name for the invoice'
    if (!v.street.trim()) errors.street = 'We need the address for the invoice'
    if (!v.postalCode.trim()) errors.postalCode = 'Postal code is missing'
    if (!v.city.trim()) errors.city = 'City is missing'
    if (EU_COUNTRIES.includes(v.country) && !looksLikeVatNumber(v.vatNumber)) {
      errors.vatNumber = 'Fill in the VAT number with its country code, for example BE0456789123'
    }
  }
  if (!v.terms) errors.terms = 'Please accept the terms to order'
  return errors
}

function Field({ label, name, values, errors, onChange, optional, ...input }) {
  const error = errors[name]
  return (
    <label className={`field ${error ? 'field--error' : ''}`}>
      <span className="field__label">
        {label} {optional && <em>optional</em>}
      </span>
      <input
        name={name}
        value={values[name]}
        onChange={(e) => onChange(name, e.target.value)}
        aria-invalid={Boolean(error)}
        {...input}
      />
      {error && <span className="field__error">{error}</span>}
    </label>
  )
}

export default function Order() {
  const [params] = useSearchParams()
  const [values, setValues] = useState(() => ({
    ...EMPTY,
    product: PLANS.some((p) => p.id === params.get('product')) ? params.get('product') : 'yearly',
    course: COURSES.some((c) => c.slug === params.get('course')) ? params.get('course') : COURSES[0].slug,
  }))
  const { member, signIn } = useSession()
  const { placeOrder, payFromSite } = useAdmin()
  const navigate = useNavigate()
  const [touched, setTouched] = useState(false)
  const [state, setState] = useState({ status: 'idle' }) // idle | sending | done | failed

  const set = (name, value) => setValues((v) => ({ ...v, [name]: value }))
  const plan = PLANS.find((p) => p.id === values.product)
  const isCompany = values.customerType === 'company'
  const errors = useMemo(() => validate(values), [values])
  const shown = touched ? errors : {}
  const vat = calculateVat({
    priceExcl: plan.price,
    country: values.country,
    isCompany,
    vatNumber: values.vatNumber,
  })

  async function submit(event) {
    event.preventDefault()
    setTouched(true)
    if (Object.keys(errors).length > 0) {
      document.querySelector('.field--error input, .check--error input')?.focus()
      return
    }
    if (values.website) return // a bot filled in the honeypot

    // This object is exactly what the n8n webhook will receive.
    const payload = {
      orderedAt: new Date().toISOString(),
      product: values.product,
      course: values.product === 'single' ? values.course : null,
      priceExcl: plan.price,
      customer: {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim().toLowerCase(),
        type: values.customerType,
        company: isCompany ? values.company.trim() : null,
        vatNumber: isCompany ? values.vatNumber.replace(/[\s.\-]/g, '').toUpperCase() : null,
        street: values.street.trim() || null,
        postalCode: values.postalCode.trim() || null,
        city: values.city.trim() || null,
        country: values.country,
      },
      poNumber: values.poNumber.trim() || null,
      discountCode: values.discountCode.trim().toUpperCase() || null,
      newsletter: values.newsletter,
    }

    setState({ status: 'sending' })
    try {
      if (WEBHOOK_URL) {
        const response = await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!response.ok) throw new Error(`The server answered ${response.status}`)
      } else {
        await new Promise((resolve) => setTimeout(resolve, 900))
      }
      // demo mode: the order goes into the admin panel's sample data, like n8n will do later
      const placed = WEBHOOK_URL ? null : placeOrder(payload, vat)
      setState({ status: 'done', payload, demo: !WEBHOOK_URL, totals: vat, invoice: placed?.invoice })
    } catch (error) {
      // Nothing fails silently: the customer is told, and can try again without retyping.
      setState({ status: 'failed', message: error.message })
    }
  }

  // Demo only: pretend the bank transfer arrived, so the rest of the site can be tried.
  // In the real flow n8n matches the payment and creates the account.
  function simulatePayment() {
    const { payload, totals } = state
    const today = new Date()
    const iso = (d) => d.toISOString().slice(0, 10)
    const placed = state.invoice
    const invoice = {
      number: placed.number,
      date: iso(today),
      product: payload.product === 'single' ? `Single course: ${findCourse(payload.course).title}` : plan.name,
      excl: plan.price,
      vat: totals.vat,
      total: totals.total,
      reference: placed.reference,
      status: 'paid',
    }
    payFromSite(placed.number)
    // the same person ordering again keeps their account and progress
    const same = member && member.email === payload.customer.email
    const base = same
      ? member
      : {
          role: 'member',
          firstName: payload.customer.firstName,
          lastName: payload.customer.lastName,
          email: payload.customer.email,
          plan: null,
          endDate: null,
          courses: [],
          since: iso(today),
          progress: {},
          invoices: [],
        }
    let next = { ...base, invoices: [invoice, ...base.invoices] }
    if (payload.product === 'single') {
      next = { ...next, courses: [...new Set([...(base.courses || []), payload.course])] }
    } else {
      const end = new Date(today)
      if (payload.product === 'monthly') end.setMonth(end.getMonth() + 1)
      else end.setFullYear(end.getFullYear() + 1)
      next = { ...next, plan: payload.product, endDate: iso(end) }
    }
    signIn(next)
    navigate(payload.product === 'single' ? `/courses/${payload.course}` : '/account')
  }

  if (state.status === 'done') {
    return (
      <main className="order">
        <div className="order__done">
          <p className="eyebrow">Order received</p>
          <h1 className="h-section">
            Thanks, {state.payload.customer.firstName}. <span className="soft">Your invoice is on its way.</span>
          </h1>
          <ol className="next">
            <li><b>01</b>We check your details and create invoice and payment reference.</li>
            <li><b>02</b>You get the invoice as a PDF at {state.payload.customer.email}.</li>
            <li><b>03</b>You pay by bank transfer and mention the reference.</li>
            <li><b>04</b>Your payment is matched and your login arrives by itself.</li>
          </ol>
          {state.invoice && (
            <div className="order__invoice">
              <span>Invoice <b>{state.invoice.number}</b> · {euro(state.invoice.total)}</span>
              <span>Reference <b className="mono-ref">{state.invoice.reference}</b></span>
            </div>
          )}
          {state.demo && (
            <details className="payload">
              <summary>Demo mode: nothing was sent. This is the data the webhook will receive.</summary>
              <pre>{JSON.stringify(state.payload, null, 2)}</pre>
            </details>
          )}
          <div className="order__after">
            {state.demo && (
              <button className="key key--dark" onClick={simulatePayment}>
                Demo: the payment arrived <span className="arrow">→</span>
              </button>
            )}
            <Link to="/" className="key key--light">
              Back to the site
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const fieldProps = { values, errors: shown, onChange: set }

  return (
    <main className="order">
      <div className="order__grid">
        <form className="order__form" onSubmit={submit} noValidate>
          <p className="eyebrow">Order</p>
          <h1 className="h-section">
            One form. <span className="soft">Everything your invoice needs.</span>
          </h1>

          <fieldset>
            <legend>What would you like?</legend>
            <div className="choices">
              {PLANS.map((p) => (
                <label key={p.id} className={`choice ${values.product === p.id ? 'choice--on' : ''}`}>
                  <input type="radio" name="product" checked={values.product === p.id} onChange={() => set('product', p.id)} />
                  <span className="choice__name">{p.name}</span>
                  <span className="choice__price">€{p.price}</span>
                  <span className="choice__unit">{p.unit}</span>
                </label>
              ))}
            </div>
            {values.product === 'single' && (
              <label className="field">
                <span className="field__label">Which course?</span>
                <select value={values.course} onChange={(e) => set('course', e.target.value)}>
                  {TOPICS.map((t) => (
                    <optgroup key={t.id} label={t.label}>
                      {COURSES.filter((c) => c.topic === t.id).map((c) => (
                        <option key={c.slug} value={c.slug}>{c.title}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </label>
            )}
          </fieldset>

          <fieldset>
            <legend>Who is ordering?</legend>
            <div className="segmented" role="radiogroup" aria-label="Customer type">
              {[['private', 'Private person'], ['company', 'Company']].map(([id, label]) => (
                <button
                  type="button"
                  key={id}
                  role="radio"
                  aria-checked={values.customerType === id}
                  className={values.customerType === id ? 'is-on' : ''}
                  onClick={() => set('customerType', id)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="field-row">
              <Field label="First name" name="firstName" autoComplete="given-name" {...fieldProps} />
              <Field label="Last name" name="lastName" autoComplete="family-name" {...fieldProps} />
            </div>
            <Field label="E-mail" name="email" type="email" autoComplete="email" {...fieldProps} />
            <label className="field">
              <span className="field__label">Country</span>
              <select value={values.country} onChange={(e) => set('country', e.target.value)}>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </label>
          </fieldset>

          {isCompany && (
            <fieldset className="fieldset--in">
              <legend>For the invoice</legend>
              <div className="field-row">
                <Field label="Company name" name="company" autoComplete="organization" {...fieldProps} />
                <Field label="VAT number" name="vatNumber" placeholder="BE0456789123" {...fieldProps} />
              </div>
              <Field label="Street and number" name="street" autoComplete="street-address" {...fieldProps} />
              <div className="field-row">
                <Field label="Postal code" name="postalCode" autoComplete="postal-code" {...fieldProps} />
                <Field label="City" name="city" autoComplete="address-level2" {...fieldProps} />
              </div>
              <Field label="PO number" name="poNumber" optional {...fieldProps} />
            </fieldset>
          )}

          <fieldset>
            <legend>Anything else?</legend>
            <Field label="Discount code" name="discountCode" optional {...fieldProps} />
            <input className="hp" tabIndex={-1} autoComplete="off" name="website" value={values.website} onChange={(e) => set('website', e.target.value)} aria-hidden="true" />
            <label className="check-row">
              <input type="checkbox" checked={values.newsletter} onChange={(e) => set('newsletter', e.target.checked)} />
              <span>Send me the weekly newsletter. One mail on Thursday, one click to unsubscribe.</span>
            </label>
            <label className={`check-row ${shown.terms ? 'check--error' : ''}`}>
              <input type="checkbox" checked={values.terms} onChange={(e) => set('terms', e.target.checked)} />
              <span>I agree with the terms and the privacy policy.</span>
            </label>
            {shown.terms && <span className="field__error">{shown.terms}</span>}
          </fieldset>

          {state.status === 'failed' && (
            <p className="order__failed" role="alert">
              Your order could not be sent ({state.message}). Nothing is lost: please try again in a
              moment, or mail orders@loopcasts.example.
            </p>
          )}

          <button className="key key--dark order__submit" disabled={state.status === 'sending'}>
            {state.status === 'sending' ? 'Sending…' : 'Place order'} <span className="arrow">→</span>
          </button>
        </form>

        <aside className="summary">
          <span className="eyebrow">Your order</span>
          <h2>{plan.name}</h2>
          {values.product === 'single' ? (
            <p className="summary__blurb">
              {findCourse(values.course).title}: {findCourse(values.course).videos} lessons, yours for good.
            </p>
          ) : (
            <p className="summary__blurb">{plan.blurb}</p>
          )}
          <dl>
            <div><dt>Price</dt><dd>{euro(plan.price)}</dd></div>
            <div><dt>{vat.note}</dt><dd>{euro(vat.vat)}</dd></div>
            <div className="summary__total"><dt>Total</dt><dd>{euro(vat.total)}</dd></div>
          </dl>
          <p className="summary__fine">
            You pay by bank transfer after you receive the invoice. Your login arrives when the payment is
            matched, usually within minutes of the bank file coming in.
          </p>
        </aside>
      </div>
    </main>
  )
}
