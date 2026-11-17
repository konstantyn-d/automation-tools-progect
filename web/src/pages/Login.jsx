import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Wordmark } from '../components/Nav.jsx'
import { DEMO_MEMBER } from '../data/member.js'
import { useSession } from '../lib/session.jsx'
import '../styles/order.css'
import '../styles/account.css'

// Sign in. There are no real accounts yet, so every e-mail and password is accepted
// and opens the sample member (see lib/session.jsx).
export default function Login() {
  const { member, signIn } = useSession()
  const navigate = useNavigate()
  const { state } = useLocation()
  const [mode, setMode] = useState('signin') // signin | reset | reset-sent
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (member) return <Navigate to={state?.next || '/account'} replace />

  const validEmail = /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(email.trim())

  function submit(event) {
    event.preventDefault()
    if (!validEmail) return setError('This does not look like an e-mail address')
    if (mode === 'reset') {
      setError('')
      return setMode('reset-sent')
    }
    if (!password) return setError('Fill in your password')
    const address = email.trim().toLowerCase()
    if (address === DEMO_MEMBER.email) signIn()
    else {
      const first = address.split('@')[0].split(/[._-]/)[0]
      signIn({ email: address, firstName: first.charAt(0).toUpperCase() + first.slice(1), lastName: '' })
    }
    return navigate(state?.next || '/account', { replace: true })
  }

  return (
    <main className="login">
      <form className="login__card" onSubmit={submit} noValidate>
        <Wordmark />
        <h1>{mode === 'signin' ? 'Sign in' : 'Choose a new password'}</h1>

        {mode === 'reset-sent' ? (
          <>
            <p>
              If {email.trim()} has an account, a link to choose a new password is on its way. It works for
              one hour.
            </p>
            <button type="button" className="key key--light" onClick={() => setMode('signin')}>
              Back to sign in
            </button>
          </>
        ) : (
          <>
            {mode === 'reset' && <p>Fill in your e-mail address and we send you a link. We never send passwords.</p>}
            <label className={`field ${error && !validEmail ? 'field--error' : ''}`}>
              <span className="field__label">E-mail</span>
              <input id="login-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            {mode === 'signin' && (
              <label className={`field ${error && validEmail ? 'field--error' : ''}`}>
                <span className="field__label">Password</span>
                <input id="login-password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </label>
            )}
            {error && <span className="field__error" role="alert">{error}</span>}
            <button className="key key--dark">
              {mode === 'signin' ? 'Sign in' : 'Send me the link'} <span className="arrow">→</span>
            </button>
            <button type="button" className="login__link" onClick={() => { setError(''); setMode(mode === 'signin' ? 'reset' : 'signin') }}>
              {mode === 'signin' ? 'Forgot your password?' : 'Back to sign in'}
            </button>
          </>
        )}

        {mode === 'signin' && (
          <div className="login__demo">
            <p>Accounts are not connected yet. Any e-mail and password open a sample member.</p>
            <button
              type="button"
              className="key key--light key--sm"
              onClick={() => { setEmail(DEMO_MEMBER.email); setPassword('demo-password'); setError('') }}
            >
              Fill in the sample member
            </button>
          </div>
        )}
      </form>
      <p className="login__below">
        No account yet? You get one with your first order. <Link to="/" state={{ scrollTo: 'pricing' }}>See the prices</Link>
      </p>
    </main>
  )
}
