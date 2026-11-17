import { useEffect, useMemo, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import CourseTile from '../components/CourseTile.jsx'
import { COURSES, LEVELS, TOPICS } from '../data/courses.js'
import { matchCourse } from '../lib/search.jsx'
import { hasCourse, useSession } from '../lib/session.jsx'
import '../styles/courses.css'
import '../styles/catalog.css'

const SORTS = [
  { id: 'popular', label: 'Most watched' },
  { id: 'new', label: 'Newest' },
  { id: 'short', label: 'Shortest first' },
  { id: 'az', label: 'A to Z' },
]

// The four most recently added courses get a "New" label.
const NEWEST = new Set([...COURSES].sort((a, b) => b.added.localeCompare(a.added)).slice(0, 4).map((c) => c.slug))

const SUGGESTIONS = ['webhook', 'invoice', 'Docker', 'AI', 'SQL', 'Python']

export default function Catalog() {
  const [params, setParams] = useSearchParams()
  const { member } = useSession()
  const searchRef = useRef(null)

  const query = params.get('q') || ''
  const topic = params.get('topic') || ''
  const level = params.get('level') || ''
  const sort = params.get('sort') || 'popular'

  // Filters live in the address, so a filtered list can be shared or bookmarked.
  const update = (changes) => {
    const next = new URLSearchParams(params)
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value)
      else next.delete(key)
    }
    setParams(next, { replace: true })
  }

  // "/" jumps to the search field, as on most sites with search.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Courses that match the search, before topic and level are applied (used for the counts).
  const searched = useMemo(
    () =>
      COURSES.map((course) => ({ course, hit: matchCourse(course, query) })).filter((r) => r.hit !== null),
    [query],
  )

  const results = useMemo(() => {
    const list = searched.filter(({ course }) => (!topic || course.topic === topic) && (!level || course.level === level))
    const by = {
      popular: (a, b) => b.course.students - a.course.students,
      new: (a, b) => b.course.added.localeCompare(a.course.added),
      short: (a, b) => a.course.seconds - b.course.seconds,
      az: (a, b) => a.course.title.localeCompare(b.course.title),
    }[sort]
    return [...list].sort((a, b) => (query ? b.hit.score - a.hit.score : 0) || by(a, b))
  }, [searched, topic, level, sort, query])

  const countFor = (id) => searched.filter(({ course }) => course.topic === id && (!level || course.level === level)).length
  const filtered = query || topic || level

  return (
    <main className="catalog">
      <div className="courses__grid-bg" aria-hidden="true" />
      <div className="container catalog__inner">
        <header className="catalog__head">
          <p className="eyebrow">Catalogue</p>
          <h1 className="h-section">
            All {COURSES.length} courses. <span className="soft">Lesson 1 of each one is free to watch.</span>
          </h1>
        </header>

        <div className="finder">
          <label className="finder__search">
            <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
              <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
              <path d="M10.5 10.5 14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <span className="sr-only">Search courses</span>
            <input
              id="catalog-search"
              ref={searchRef}
              type="search"
              placeholder="Search courses, lessons or teachers"
              value={query}
              onChange={(e) => update({ q: e.target.value })}
              autoComplete="off"
            />
            {query ? (
              <button className="finder__clear" onClick={() => update({ q: '' })} aria-label="Clear search">
                ×
              </button>
            ) : (
              <kbd>/</kbd>
            )}
          </label>

          <div className="finder__topics" role="group" aria-label="Topic">
            <button className={`topic-chip ${!topic ? 'is-on' : ''}`} onClick={() => update({ topic: '' })}>
              All topics <span>{searched.filter(({ course }) => !level || course.level === level).length}</span>
            </button>
            {TOPICS.map((t) => {
              const n = countFor(t.id)
              return (
                <button
                  key={t.id}
                  className={`topic-chip ${topic === t.id ? 'is-on' : ''}`}
                  onClick={() => update({ topic: topic === t.id ? '' : t.id })}
                  disabled={n === 0 && topic !== t.id}
                >
                  {t.label} <span>{n}</span>
                </button>
              )
            })}
          </div>

          <div className="finder__row">
            <div className="segmented" role="radiogroup" aria-label="Level">
              {['', ...LEVELS].map((l) => (
                <button
                  key={l || 'all'}
                  type="button"
                  role="radio"
                  aria-checked={level === l}
                  className={level === l ? 'is-on' : ''}
                  onClick={() => update({ level: l })}
                >
                  {l || 'All levels'}
                </button>
              ))}
            </div>
            <label className="finder__sort">
              <span>Sort</span>
              <select id="catalog-sort" value={sort} onChange={(e) => update({ sort: e.target.value === 'popular' ? '' : e.target.value })}>
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="catalog__status" aria-live="polite">
          <span>
            {results.length} {results.length === 1 ? 'course' : 'courses'}
            {query && (
              <>
                {' '}for <strong>“{query}”</strong>
              </>
            )}
          </span>
          {filtered && (
            <button className="catalog__reset" onClick={() => setParams(new URLSearchParams(), { replace: true })}>
              Clear all filters
            </button>
          )}
        </div>

        {results.length > 0 ? (
          // the key makes the grid play its entrance again when the filters change
          <div className="tiles" key={`${query}|${topic}|${level}|${sort}`}>
            {results.map(({ course, hit }, i) => (
              <CourseTile
                key={course.slug}
                course={course}
                query={query}
                lesson={hit.lesson}
                isNew={NEWEST.has(course.slug)}
                owned={hasCourse(member, course)}
                index={i}
              />
            ))}
          </div>
        ) : (
          <div className="catalog__empty">
            <svg className="pixel" viewBox="0 0 16 12" width="96" height="72" aria-hidden="true">
              <path fill="#d7d5cf" d="M2 1h7v1h1v1h1v4h-1v1H9v1H2V8H1V7H0V3h1V2h1z" />
              <path fill="#f5f5f2" d="M3 3h5v1h1v2H8v1H3V6H2V4h1z" />
              <path fill="#8e8c8b" d="M10 9h2v1h1v1h1v1h-2v-1h-1v-1h-1z" />
            </svg>
            <h2>Nothing found{query && ` for “${query}”`}</h2>
            <p>Try a shorter word, or one of these:</p>
            <div className="catalog__suggest">
              {SUGGESTIONS.map((s) => (
                <button key={s} className="topic-chip" onClick={() => setParams(new URLSearchParams({ q: s }), { replace: true })}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <aside className="catalog__offer">
          <div>
            <strong>Want all of them?</strong>
            <p>A subscription opens every course, and the two new lessons that come out each week.</p>
          </div>
          <Link to="/order?product=monthly" className="key key--dark">
            From €15 a month <span className="arrow">→</span>
          </Link>
        </aside>
      </div>
    </main>
  )
}
