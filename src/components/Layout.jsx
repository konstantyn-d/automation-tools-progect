import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth.jsx';
import { MOCK } from '../lib/api.js';
import { CursorBlob, GooDefs, MorphBlob } from './Blobs.jsx';
import NewsletterForm from './NewsletterForm.jsx';

export function Logo() {
  return (
    <Link to="/" className="logo" aria-label="LoopCasts home">
      <span className="logo-mark"><i /><i /></span>LoopCasts
    </Link>
  );
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { pathname } = useLocation();
  useEffect(() => {
    const on = () => setScrolled(scrollY > 20);
    on();
    addEventListener('scroll', on, { passive: true });
    return () => removeEventListener('scroll', on);
  }, []);
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className={`nav ${scrolled || pathname !== '/' ? 'scrolled' : ''}`}>
      <Logo />
      <nav className={`nav-links ${open ? 'open' : ''}`}>
        <NavLink to="/courses">Courses</NavLink>
        <NavLink to="/search">Search videos</NavLink>
        <NavLink to="/pricing">Pricing</NavLink>
        <NavLink to="/support">Support</NavLink>
        <NavLink to="/flows">User flows</NavLink>
      </nav>
      <div className="nav-right">
        {user
          ? <Link className="btn btn-ghost btn-sm hide-sm" to="/account">Account</Link>
          : <Link className="btn btn-ghost btn-sm hide-sm" to="/login">Log in</Link>}
        <Link className="btn btn-ink btn-sm" to="/order">Order</Link>
        <button className="burger" aria-label="Menu" onClick={() => setOpen(!open)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 8h16M4 16h16" /></svg>
        </button>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <MorphBlob size={520} style={{ position: 'absolute', right: -160, bottom: -220, opacity: 1 }} />
      <div className="wrap" style={{ position: 'relative' }}>
        <div className="footer-grid">
          <div className="stack" style={{ maxWidth: 420 }}>
            <div className="label">Newsletter · every Thursday</div>
            <p className="h-3">One new lesson and one tip a week. Unsubscribe with one click.</p>
            <NewsletterForm />
          </div>
          <div>
            <div className="label" style={{ marginBottom: 12 }}>Learn</div>
            <Link to="/courses">All courses</Link>
            <Link to="/search">Search in videos</Link>
            <Link to="/pricing">Pricing</Link>
            <Link to="/order?plan=team">Team licence</Link>
          </div>
          <div>
            <div className="label" style={{ marginBottom: 12 }}>Account</div>
            <Link to="/login">Log in</Link>
            <Link to="/forgot-password">Forgot password</Link>
            <Link to="/account/invoices">Invoices</Link>
            <Link to="/support">Support</Link>
          </div>
          <div>
            <div className="label" style={{ marginBottom: 12 }}>LoopCasts BV</div>
            <span className="dim" style={{ fontSize: 14 }}>Gent, Belgium<br />BE 0700.000.000<br />hello@loopcasts.be</span>
          </div>
        </div>
        <div className="footer-big">Loop<span className="serif" style={{ fontWeight: 400 }}>casts</span></div>
      </div>
    </footer>
  );
}

function MockBar() {
  const [hidden, setHidden] = useState(false);
  useEffect(() => { document.body.classList.toggle('hide-hooks', hidden); }, [hidden]);
  if (!MOCK) return null;
  return (
    <div className="mockbar">
      <span>Mock data · n8n not connected</span>
      <button onClick={() => setHidden(!hidden)}>{hidden ? 'Show' : 'Hide'} webhooks</button>
    </div>
  );
}

export default function Layout() {
  const { pathname } = useLocation();
  useEffect(() => { scrollTo(0, 0); }, [pathname]);
  return (
    <>
      <GooDefs />
      <CursorBlob />
      <Nav />
      <main><Outlet /></main>
      <Footer />
      <MockBar />
    </>
  );
}
