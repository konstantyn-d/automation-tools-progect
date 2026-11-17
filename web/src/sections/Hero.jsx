import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import HeroScene from './HeroScene.jsx'
import { PlayIcon } from '../components/icons.jsx'
import { useMediaQuery } from '../lib/useMediaQuery.js'
import '../styles/hero.css'

const NOTICES = [
  { tone: 'blue', text: 'Lesson 1 watched', meta: 'n8n basics' },
  { tone: 'yellow', text: 'First workflow built', meta: 'daily report' },
  { tone: 'green', text: 'Course finished', meta: '12 of 12' },
  { tone: 'blue', text: 'New lesson out', meta: 'every Tuesday' },
]

// Small notices above the machine: what learners are doing. A new one pops in every 2.2 seconds,
// the three most recent stay visible.
function Notices() {
  const [count, setCount] = useState(1)
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setCount(NOTICES.length)
      return
    }
    const id = setInterval(() => setCount((c) => c + 1), 2200)
    return () => clearInterval(id)
  }, [])

  const visible = []
  for (let i = Math.max(0, count - 3); i < count; i += 1) visible.push({ ...NOTICES[i % NOTICES.length], key: i })

  return (
    <ul className="notices" aria-hidden="true">
      {visible.map((n) => (
        <li key={n.key} className="notice">
          <span className={`notice__dot notice__dot--${n.tone}`} />
          <span className="notice__text">{n.text}</span>
          <span className="notice__meta">{n.meta}</span>
        </li>
      ))}
    </ul>
  )
}

export default function Hero({ onNav }) {
  const compact = useMediaQuery('(max-width: 760px)')
  const ref = useRef(null)

  // While you scroll away, the scene moves slower than the page and the copy lifts and fades.
  // The CSS reads the scroll position from the --sy variable.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const y = Math.min(window.scrollY, window.innerHeight)
        ref.current?.style.setProperty('--sy', y.toFixed(0))
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <header className="hero" id="top" ref={ref}>
      <HeroScene compact={compact} />
      <div className="hero__scrim" />
      <div className="hero__copy">
        <p className="hero__eyebrow">Video courses on automation · Ghent, since 2019</p>
        <h1 className="hero__title">Learn to automate the work nobody wants to do</h1>
        <p className="hero__support">
          Short, practical video courses on n8n, APIs, webhooks and AI agents. Watch, build along and
          have something working by the end of every lesson.
        </p>
        <div className="hero__actions">
          <Link className="key key--light" to="/courses">
            Browse all 60 courses <span className="arrow">→</span>
          </Link>
          <Link className="key key--glass" to="/courses/n8n-basics/1">
            <PlayIcon size={1.5} /> Watch a free lesson
          </Link>
        </div>
        <p className="hero__fine">60 courses · two new lessons every week · from €15 a month</p>
      </div>
      <Notices />
    </header>
  )
}
