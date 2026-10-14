import { WEBHOOKS } from '../lib/api.js';

// Visible marker for every place where an n8n webhook plugs in.
// Hide all markers with the toggle in the bottom-left demo bar.
export function Hook({ name, note }) {
  return (
    <span className="hook" title={note || 'n8n webhook'}>
      <b>n8n</b> POST {WEBHOOKS[name] || name}{note ? ` · ${note}` : ''}
    </span>
  );
}

export function Field({ label, hint, error, children, className = '' }) {
  return (
    <label className={`field ${className}`}>
      <span>{label}</span>
      {children}
      {error ? <small className="hint err">{error}</small> : hint ? <small className="hint">{hint}</small> : null}
    </label>
  );
}

export const Spinner = () => <span className="spinner" aria-label="Loading" />;

export function PageHead({ label, title, children }) {
  return (
    <div className="stack" style={{ marginBottom: 48 }}>
      {label && <div className="label">{label}</div>}
      <h1 className="h-1">{title}</h1>
      {children}
    </div>
  );
}
