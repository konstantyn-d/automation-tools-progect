import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSession } from '../lib/session.jsx'
import { DEMO_MEMBER, DEMO_STAFF } from '../data/member.js'
import '../styles/demo.css'

// TEMPORARY. There are no real accounts yet, so this switch lets you look at the site
// as a visitor, a paying member or someone from the office. Remove it once login is real.
const KEY = 'loopcasts.demoSwitch'

function readHidden() {
  try {
    return localStorage.getItem(KEY) === 'hidden'
  } catch {
    return false
  }
}

export default function DemoSwitch() {
  const { member, signIn, signOut } = useSession()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [hidden, setHidden] = useState(readHidden)
  const role = member?.role === 'staff' ? 'staff' : member ? 'member' : 'visitor'

  const toggle = (value) => {
    setHidden(value)
    try {
      localStorage.setItem(KEY, value ? 'hidden' : 'shown')
    } catch {
      // fine: it just will not be remembered
    }
  }

  const choose = (next) => {
    if (next === role) return
    if (next === 'visitor') {
      signOut()
      if (pathname.startsWith('/admin') || pathname === '/account') navigate('/')
    } else if (next === 'member') {
      signIn(DEMO_MEMBER)
      if (pathname.startsWith('/admin')) navigate('/account')
    } else {
      signIn(DEMO_STAFF)
      navigate('/admin')
    }
  }

  if (hidden) {
    return (
      <button className="demo demo--mini" onClick={() => toggle(false)} aria-label="Show the demo switch">
        Demo
      </button>
    )
  }

  return (
    <div className="demo" role="group" aria-label="Demo: look at the site as">
      <span className="demo__label">Demo · view as</span>
      <div className="demo__options">
        {[
          ['visitor', 'Visitor'],
          ['member', 'Member'],
          ['staff', 'Staff'],
        ].map(([id, label]) => (
          <button key={id} className={role === id ? 'is-on' : ''} aria-pressed={role === id} onClick={() => choose(id)}>
            {label}
          </button>
        ))}
      </div>
      <button className="demo__hide" onClick={() => toggle(true)} aria-label="Hide the demo switch">
        ×
      </button>
    </div>
  )
}
