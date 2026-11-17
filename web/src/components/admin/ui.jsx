import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CloseIcon, SearchIcon } from '../icons.jsx'
import { euro } from '../../lib/vat.js'

// Small building blocks shared by the admin screens.

export { euro }

export function shortDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  const sameYear = date.getFullYear() === new Date().getFullYear()
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', ...(sameYear ? {} : { year: 'numeric' }) })
}

export function longDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function timeAgo(value) {
  const minutes = Math.round((Date.now() - new Date(value)) / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} h ago`
  const days = Math.round(hours / 24)
  if (days < 7) return `${days} d ago`
  return shortDate(value)
}

// One status = one tone and one word. Colour is never the only signal: the word is always there.
const STATUS = {
  // orders
  access: ['ok', 'Access given'],
  waiting: ['info', 'Waiting for payment'],
  review: ['warn', 'Needs a person'],
  failed: ['error', 'Step failed'],
  cancelled: ['', 'Cancelled'],
  // invoices
  paid: ['ok', 'Paid'],
  open: ['info', 'Open'],
  overdue: ['error', 'Overdue'],
  credited: ['', 'Credited'],
  // bank lines
  matched: ['ok', 'Matched'],
  check: ['warn', 'To check'],
  unmatched: ['error', 'Not matched'],
  ignored: ['', 'Set aside'],
  new: ['', 'New'],
  // members
  active: ['ok', 'Active'],
  ending: ['warn', 'Ends soon'],
  closed: ['', 'Access closed'],
  'expired-open': ['error', 'Expired, still open'],
  // tickets
  sent: ['ok', 'Answered'],
  assigned: ['info', 'With a person'],
  phishing: ['error', 'Phishing'],
}

export function Status({ value, label }) {
  const [tone, word] = STATUS[value] || ['', value]
  return <i className={`chip ${tone ? `chip--${tone}` : ''}`}>{label || word}</i>
}

export function PageHead({ eyebrow, title, soft, children }) {
  return (
    <header className="ad-head">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="ad-head__title">
          {title} {soft && <span className="soft">{soft}</span>}
        </h1>
      </div>
      {children && <div className="ad-head__actions">{children}</div>}
    </header>
  )
}

// Tabs that filter a list. Lives in the URL (?tab=), so a filtered view can be shared.
export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="ad-tabs" role="tablist">
      {tabs.map((t) => (
        <button key={t.id} role="tab" aria-selected={value === t.id} className={value === t.id ? 'is-on' : ''} onClick={() => onChange(t.id)}>
          {t.label}
          {t.count !== undefined && <span>{t.count}</span>}
        </button>
      ))}
    </div>
  )
}

export function SearchField({ value, onChange, placeholder }) {
  return (
    <label className="ad-search">
      <SearchIcon size={2} />
      <span className="sr-only">Search</span>
      <input type="search" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </label>
  )
}

// One URL search parameter as state.
export function useParam(name, fallback = '') {
  const [params, setParams] = useSearchParams()
  const value = params.get(name) ?? fallback
  const set = (next) =>
    setParams(
      (p) => {
        const copy = new URLSearchParams(p)
        if (next === fallback || next === '' || next == null) copy.delete(name)
        else copy.set(name, next)
        return copy
      },
      { replace: true },
    )
  return [value, set]
}

// Side panel with the details of one item. ?open=ID opens it, Esc or the cross closes it.
export function Drawer({ open, onClose, title, eyebrow, children, footer }) {
  const panel = useRef(null)
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    panel.current?.focus()
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <div className={`drawer ${open ? 'is-open' : ''}`} aria-hidden={!open}>
      <div className="drawer__scrim" onClick={onClose} />
      <aside className="drawer__panel" role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} ref={panel}>
        {open && (
          <>
            <header className="drawer__head">
              <div>
                <p className="eyebrow">{eyebrow}</p>
                <h2>{title}</h2>
              </div>
              <button className="drawer__close" onClick={onClose} aria-label="Close">
                <CloseIcon size={2} />
              </button>
            </header>
            <div className="drawer__body">{children}</div>
            {footer && <footer className="drawer__foot">{footer}</footer>}
          </>
        )}
      </aside>
    </div>
  )
}

export function Fields({ rows }) {
  return (
    <dl className="ad-fields">
      {rows.filter(Boolean).map(([k, v]) => (
        <div key={k}>
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  )
}

export function Empty({ title, text }) {
  return (
    <div className="ad-empty">
      <svg className="pixel" width="40" height="32" viewBox="0 0 10 8" aria-hidden="true">
        <path fill="currentColor" d="M1 1h8v1H1zM0 2h1v5H0zM9 2h1v5H9zM1 7h8v1H1zM3 4h1v1H3zM6 4h1v1H6z" />
      </svg>
      <b>{title}</b>
      {text && <p>{text}</p>}
    </div>
  )
}

// A toast that says what just happened, bottom right.
export function Toast({ message }) {
  return (
    <div className={`ad-toast ${message ? 'is-on' : ''}`} role="status" aria-live="polite">
      {message}
    </div>
  )
}
