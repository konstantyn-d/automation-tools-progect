import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { BlobField } from '../components/Blobs.jsx';
import { Field, Hook, Spinner } from '../components/ui.jsx';
import { confirmReset, login, requestReset, signup } from '../lib/api.js';
import { useAuth } from '../lib/auth.jsx';

function Shell({ quote, children }) {
  return (
    <div className="auth">
      <div className="auth-art">
        <BlobField blobs={[
          { x: '18%', y: '12%', size: 340, duration: 15 },
          { x: '46%', y: '30%', size: 240, duration: 11, delay: -4, dx1: -90, dy1: 60 },
          { x: '26%', y: '48%', size: 180, duration: 13, delay: -7, dx1: 100, dy1: -40 },
          { x: '58%', y: '8%', size: 90, color: 'var(--accent)', duration: 9, dx1: -30, dy1: 80 },
        ]} />
        <p className="h-2" style={{ position: 'relative', maxWidth: 420 }}>{quote}</p>
      </div>
      <div className="auth-form"><div className="stack">{children}</div></div>
    </div>
  );
}

const pwOk = (p) => p.length >= 10;

export function Login() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [state, setState] = useState({ loading: false, error: '' });

  const submit = async (e) => {
    e.preventDefault();
    setState({ loading: true, error: '' });
    try {
      const { user } = await login(email, password);
      signIn(user);
      nav(params.get('next') || '/account');
    } catch (err) {
      setState({ loading: false, error: err.message });
    }
  };

  return (
    <Shell quote={<>Welcome <span className="serif">back.</span></>}>
      <h1 className="h-1">Log in</h1>
      <form onSubmit={submit} className="stack">
        <Field label="Email"><input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></Field>
        <Field label="Password"><input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" /></Field>
        {state.error && <div className="notice accent">{state.error}</div>}
        <button className="btn btn-ink btn-block" disabled={state.loading}>{state.loading ? <Spinner /> : 'Log in'}</button>
      </form>
      <div className="between"><Link to="/forgot-password" className="link">Forgot password?</Link><Link to="/signup" className="link">Create account</Link></div>
      <p className="hint">Demo: any email and a password of 6+ characters.</p>
      <Hook name="login" note="session cookie, bcrypt" />
    </Shell>
  );
}

export function Signup() {
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [state, setState] = useState({ loading: false, done: false, error: '' });
  const submit = async (e) => {
    e.preventDefault();
    setState({ loading: true });
    try { await signup(f); setState({ done: true }); } catch (err) { setState({ error: err.message }); }
  };
  if (state.done) {
    return (
      <Shell quote={<>Check your <span className="serif">inbox.</span></>}>
        <h1 className="h-2">Confirm your email</h1>
        <p>We sent a link to <b>{f.email}</b>. Click it to activate your free account. To unlock all courses, <Link to="/order" className="link">choose a plan</Link>.</p>
      </Shell>
    );
  }
  return (
    <Shell quote={<>Free lessons now, <span className="serif">everything</span> after you order.</>}>
      <h1 className="h-1">Create account</h1>
      <form onSubmit={submit} className="stack">
        <Field label="Name"><input className="input" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoComplete="name" /></Field>
        <Field label="Email"><input className="input" type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="email" /></Field>
        <Field label="Password" hint="At least 10 characters." error={f.password && !pwOk(f.password) ? 'Too short.' : null}>
          <input className="input" type="password" required value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} autoComplete="new-password" />
        </Field>
        {state.error && <div className="notice accent">{state.error}</div>}
        <button className="btn btn-ink btn-block" disabled={state.loading || !pwOk(f.password)}>{state.loading ? <Spinner /> : 'Create account'}</button>
      </form>
      <Link to="/login" className="link">I already have an account</Link>
      <Hook name="signup" note="email verification" />
    </Shell>
  );
}

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle');
  const submit = async (e) => {
    e.preventDefault();
    setState('loading');
    try { await requestReset(email); setState('sent'); } catch { setState('sent'); }
  };
  return (
    <Shell quote={<>No more “password pls” <span className="serif">emails.</span></>}>
      <h1 className="h-1">Reset password</h1>
      {state === 'sent' ? (
        <>
          <div className="notice ink">If an account exists for {email}, a reset link is on its way. The link works once and expires after 1 hour.</div>
          <p className="hint">Demo: open the link from the “email” → <Link to="/reset-password?token=demo-token" className="link">reset link</Link> or an <Link to="/reset-password?token=expired" className="link">expired link</Link>.</p>
        </>
      ) : (
        <form onSubmit={submit} className="stack">
          <p className="dim">Enter the email you used to order. We send you a one-time link.</p>
          <Field label="Email"><input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></Field>
          <button className="btn btn-ink btn-block" disabled={state === 'loading'}>{state === 'loading' ? <Spinner /> : 'Send reset link'}</button>
        </form>
      )}
      <Link to="/login" className="link">Back to log in</Link>
      <Hook name="resetRequest" note="token by email, same answer for any address" />
    </Shell>
  );
}

export function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const welcome = params.get('welcome');
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [state, setState] = useState({ loading: false, done: false, error: '' });
  const submit = async (e) => {
    e.preventDefault();
    setState({ loading: true });
    try { await confirmReset(token, p1); setState({ done: true }); } catch (err) { setState({ error: err.message }); }
  };
  return (
    <Shell quote={welcome ? <>Your account is <span className="serif">ready.</span></> : <>Pick something <span className="serif">strong.</span></>}>
      <h1 className="h-1">{welcome ? 'Set your password' : 'New password'}</h1>
      {state.done ? (
        <>
          <div className="notice ink">Password saved. You can log in now.</div>
          <Link to="/login" className="btn btn-ink">Log in</Link>
        </>
      ) : (
        <form onSubmit={submit} className="stack">
          <Field label="New password" hint="At least 10 characters." error={p1 && !pwOk(p1) ? 'Too short.' : null}>
            <input className="input" type="password" value={p1} onChange={(e) => setP1(e.target.value)} autoComplete="new-password" />
          </Field>
          <Field label="Repeat password" error={p2 && p1 !== p2 ? 'Passwords do not match.' : null}>
            <input className="input" type="password" value={p2} onChange={(e) => setP2(e.target.value)} autoComplete="new-password" />
          </Field>
          {state.error && <div className="notice accent"><span>{state.error} <Link to="/forgot-password" className="link">New link</Link></span></div>}
          <button className="btn btn-ink btn-block" disabled={state.loading || !pwOk(p1) || p1 !== p2}>{state.loading ? <Spinner /> : 'Save password'}</button>
        </form>
      )}
      <Hook name="resetConfirm" note="one-time token" />
    </Shell>
  );
}
