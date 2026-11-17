import { useEffect, useState } from 'react'
import Reveal from '../components/Reveal.jsx'
import { Cloud, Fringe } from '../components/pixel.jsx'
import { useInView } from '../lib/useInView.js'
import '../styles/lesson.css'

const SEARCHES = [
  {
    query: 'retry setting',
    results: [
      ['n8n error handling', 'Lesson 3 · 04:12', '"…switch on Retry On Fail and set it to three tries…"'],
      ['Rate limits and retries', 'Lesson 2 · 01:47', '"…a retry without a pause just hits the limit again…"'],
      ['Monitoring your workflows', 'Lesson 5 · 09:30', '"…count the retries, they tell you what is about to break…"'],
    ],
  },
  {
    query: 'webhook signature',
    results: [
      ['Webhook security', 'Lesson 2 · 03:05', '"…never trust a webhook until you checked its signature…"'],
      ['Stripe webhooks', 'Lesson 4 · 06:48', '"…the signing secret lives in a credential, not in the node…"'],
      ['Webhooks from zero', 'Lesson 7 · 02:20', '"…anybody who knows the URL can call it, so…"'],
    ],
  },
]

const CHAPTERS = [
  ['00:00', 'Intro'],
  ['01:24', 'Why a node fails'],
  ['04:12', 'Retry On Fail'],
  ['07:50', 'Wait between tries'],
  ['10:05', 'When to give up'],
]

// Types the query letter by letter, shows the results, waits, then moves to the next query.
function useTypedSearch(active) {
  const [index, setIndex] = useState(0)
  const [typed, setTyped] = useState(0)
  const query = SEARCHES[index].query

  useEffect(() => {
    if (!active) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTyped(query.length)
      return
    }
    if (typed < query.length) {
      const id = setTimeout(() => setTyped((t) => t + 1), 90)
      return () => clearTimeout(id)
    }
    const id = setTimeout(() => {
      setIndex((i) => (i + 1) % SEARCHES.length)
      setTyped(0)
    }, 4200)
    return () => clearTimeout(id)
  }, [active, typed, query])

  return { text: query.slice(0, typed), done: typed >= query.length, results: SEARCHES[index].results }
}

export default function LessonBand() {
  const [ref, inView] = useInView({ threshold: 0.3 })
  const search = useTypedSearch(inView)

  return (
    <section className="band">
      <Fringe color="#1a6fd1" seed={21} height={40} className="band__fringe-top" />
      <div className="band__body">
        <svg className="band__clouds pixel" viewBox="0 0 480 120" preserveAspectRatio="xMidYMin slice" aria-hidden="true">
          <Cloud x={24} y={40} s={1.3} className="drift drift--a" />
          <Cloud x={400} y={28} s={1} className="drift drift--b" />
          <Cloud x={330} y={96} s={0.7} className="drift drift--c" />
          <Cloud x={110} y={104} s={0.6} className="drift drift--b" />
        </svg>

        <div className="container band__inner">
          <Reveal className="band__head">
            <h2 className="h-section">
              Find the exact minute. <span className="soft">Every lesson has chapters, a transcript and search.</span>
            </h2>
            <ul className="band__tabs">
              <li>Chapters with timestamps</li>
              <li>Search what was said</li>
              <li>Subtitles in English and Dutch</li>
            </ul>
          </Reveal>

          <Reveal className="player" delay={120}>
            <div ref={ref} className="player__grid">
              <div className="player__video">
                <div className="player__screen">
                  <span className="player__badge">Lesson 3 · Retry on fail</span>
                  <div className="player__nodes" aria-hidden="true">
                    <i /><b /><i /><b /><i className="hot" />
                  </div>
                  <span className="player__play" aria-hidden="true" />
                </div>
                <div className="player__bar">
                  <span className="player__progress" />
                  {[11, 33, 62, 80].map((p) => <span key={p} className="player__tick" style={{ left: `${p}%` }} />)}
                </div>
                <ol className="player__chapters">
                  {CHAPTERS.map(([t, label], i) => (
                    <li key={t} className={i === 2 ? 'is-current' : ''}>
                      <span className="mono">{t}</span>
                      {label}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="player__search">
                <div className="search-field">
                  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                    <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M10.5 10.5 14 14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                  <span>{search.text}</span>
                  <i className="caret" />
                </div>
                <ul className={`results ${search.done ? 'results--in' : ''}`}>
                  {search.results.map(([course, where, quote], i) => (
                    <li key={course} style={{ '--d': `${i * 90}ms` }}>
                      <div className="results__top">
                        <strong>{course}</strong>
                        <span className="mono">{where}</span>
                      </div>
                      <p>{quote}</p>
                    </li>
                  ))}
                </ul>
                <div className="transcript">
                  <span className="eyebrow">Transcript · 04:12</span>
                  <p>
                    So the node failed once. That does not mean the whole run is lost. Open the settings,
                    switch on <mark>Retry On Fail</mark> and give it three tries with a pause in between.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
        <Fringe color="#f5f5f2" seed={33} height={44} className="band__fringe-bottom" />
      </div>
    </section>
  )
}
