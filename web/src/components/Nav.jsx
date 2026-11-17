import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSession } from '../lib/session.jsx'
import '../styles/nav.css'

const LINKS = [
  { id: 'courses', label: 'Courses', to: '/courses' },
  { id: 'learn', label: 'How it works' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'faq', label: 'FAQ' },
]

export function Wordmark() {
  return (
    <span className="wordmark">
      <svg className="pixel" width="22" height="14" viewBox="0 0 11 7" aria-hidden="true">
        <path
          fill="currentColor"
          d="M1 0h3v1h1v1h1V1h1V0h3v1h1v5h-1v1H7V6H6V5H5v1H4v1H1V6H0V1h1zm1 2v3h2V4h1V3H4V2zm5 0v1H6v1h1v1h2V2z"
          fillRule="evenodd"
        />
      </svg>
      LoopCasts
    </span>
  )
}

export default function Nav({ onNav }) {
  const { pathname } = useLocation()
  const [solid, setSolid] = useState(pathname !== '/')
  const [open, setOpen] = useState(false)
  const { member } = useSession()

  // Over the illustrated hero the bar is transparent; after scrolling it turns into paper.
  useEffect(() => {
    if (pathname !== '/') {
      setSolid(true)
      return
    }
    const onScroll = () => setSolid(window.scrollY > window.innerHeight - 120)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [pathname])

  useEffect(() => setOpen(false), [pathname])

  const go = (id) => {
    setOpen(false)
    onNav(id)
  }

  return (
    <nav className={`nav ${solid ? 'nav--solid' : ''} ${open ? 'nav--open' : ''}`} aria-label="Main">
      <div className="nav__inner">
        <Link to="/" className="nav__brand" onClick={() => go('top')}>
          <Wordmark />
        </Link>

        <div className="nav__links">
          {LINKS.map((l) =>
            l.to ? (
              <Link key={l.id} to={l.to} className={`nav__link ${pathname.startsWith(l.to) ? 'is-active' : ''}`}>
                {l.label}
              </Link>
            ) : (
              <button key={l.id} className="nav__link" onClick={() => go(l.id)}>
                {l.label}
              </button>
            ),
          )}
        </div>

        <div className="nav__actions">
          {member ? (
            <Link to={member.role === 'staff' ? '/admin' : '/account'} className={`key key--sm ${solid ? 'key--dark' : 'key--light'}`}>
              {member.role === 'staff' ? 'Admin' : 'My courses'}
            </Link>
          ) : (
            <>
              <Link to="/login" className="nav__link nav__signin">
                Sign in
              </Link>
              <button className={`key key--sm ${solid ? 'key--dark' : 'key--light'}`} onClick={() => go('pricing')}>
                Get access
              </button>
            </>
          )}
          <button
            className="nav__burger"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      <div className="nav__sheet">
        {LINKS.map((l) =>
          l.to ? (
            <Link key={l.id} to={l.to}>
              {l.label}
            </Link>
          ) : (
            <button key={l.id} onClick={() => go(l.id)}>
              {l.label}
            </button>
          ),
        )}
        {member ? <Link to={member.role === 'staff' ? '/admin' : '/account'}>{member.role === 'staff' ? 'Admin' : 'My account'}</Link> : <Link to="/login">Sign in</Link>}
      </div>
    </nav>
  )
}
