import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import CourseArt from '../components/CourseArt.jsx'
import { PlayIcon } from '../components/icons.jsx'
import { COURSES, PLANS } from '../data/site.js'
import { hasCourse, useSession } from '../lib/session.jsx'
import { euro } from '../lib/vat.js'
import '../styles/course.css'
import '../styles/account.css'

const DATE = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
const formatDate = (iso) => DATE.format(new Date(iso))

function CourseRow({ course, watched }) {
  const next = course.lessons.find((l) => !watched.includes(l.nr))
  const done = !next
  return (
    <li className="mycourse">
      <Link to={`/courses/${course.slug}`} className="mycourse__art" aria-label={course.title}>
        <CourseArt name={course.art} />
      </Link>
      <div className="mycourse__body">
        <Link to={`/courses/${course.slug}`} className="mycourse__title">{course.title}</Link>
        <div className="progress" aria-hidden="true">
          <b style={{ width: `${(watched.length / course.videos) * 100}%` }} />
        </div>
        <span className="mycourse__meta">
          {done ? 'Finished' : watched.length ? `${watched.length} of ${course.videos} lessons · next: ${next.title}` : `${course.videos} lessons · ${course.duration}`}
        </span>
      </div>
      <Link to={`/courses/${course.slug}/${(next || course.lessons[0]).nr}`} className={`key key--sm ${done ? 'key--light' : 'key--dark'}`}>
        {!done && <PlayIcon size={1.5} />} {done ? 'Watch again' : watched.length ? 'Continue' : 'Start'}
      </Link>
    </li>
  )
}

// The member's own page: courses and progress, subscription, invoices, profile.
export default function Account() {
  const { member, signOut } = useSession()
  const navigate = useNavigate()
  const [resetSent, setResetSent] = useState(false)

  if (!member) return <Navigate to="/login" replace />

  const plan = PLANS.find((p) => p.id === member.plan)
  const mine = COURSES.filter((c) => hasCourse(member, c))
  const locked = COURSES.filter((c) => !hasCourse(member, c))
  const started = mine.filter((c) => (member.progress[c.slug] || []).length > 0)
  const fresh = mine.filter((c) => !(member.progress[c.slug] || []).length)
  const lifetime = member.plan === 'single'

  return (
    <main className="account">
      <div className="container">
        <header className="account__head">
          <div>
            <p className="eyebrow">Your account</p>
            <h1 className="h-section">
              Welcome back, {member.firstName}. <span className="soft">Ready for the next lesson?</span>
            </h1>
          </div>
          <button className="key key--light key--sm" onClick={() => { signOut(); navigate('/') }}>
            Sign out
          </button>
        </header>

        <div className="account__grid">
          <div className="account__main">
            {started.length > 0 && (
              <section>
                <h2 className="course__h">Continue watching</h2>
                <ul className="mycourses">
                  {started.map((c) => <CourseRow key={c.slug} course={c} watched={member.progress[c.slug]} />)}
                </ul>
              </section>
            )}
            {fresh.length > 0 && (
              <section>
                <h2 className="course__h">{started.length ? 'Not started yet' : 'Your courses'}</h2>
                <ul className="mycourses">
                  {fresh.map((c) => <CourseRow key={c.slug} course={c} watched={[]} />)}
                </ul>
              </section>
            )}
            {locked.length > 0 && (
              <section>
                <h2 className="course__h">
                  Not in your account <span className="soft">a subscription opens all of them</span>
                </h2>
                <ul className="mycourses mycourses--locked">
                  {locked.map((c) => (
                    <li key={c.slug} className="mycourse">
                      <Link to={`/courses/${c.slug}`} className="mycourse__art" aria-label={c.title}><CourseArt name={c.art} /></Link>
                      <div className="mycourse__body">
                        <Link to={`/courses/${c.slug}`} className="mycourse__title">{c.title}</Link>
                        <span className="mycourse__meta">{c.videos} lessons · {c.duration} · first lesson free</span>
                      </div>
                      <Link to={`/courses/${c.slug}`} className="key key--sm key--light">View</Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <aside className="account__side">
            <section className="card">
              <span className="eyebrow">{lifetime ? 'Your purchase' : 'Your subscription'}</span>
              <strong className="card__title">{plan.name}</strong>
              {lifetime ? (
                <p>Paid once. This course stays in your account for good.</p>
              ) : (
                <>
                  <span className="card__big">{formatDate(member.endDate)}</span>
                  <p>End date. We remind you 30 and 7 days before, nothing renews by itself.</p>
                </>
              )}
              <Link to={`/order?product=${lifetime ? 'yearly' : member.plan}`} className="key key--light key--sm">
                {lifetime ? 'Get everything with a subscription' : 'Renew now'}
              </Link>
            </section>

            <section className="card">
              <span className="eyebrow">Invoices</span>
              {member.invoices.map((inv) => (
                <details key={inv.number} className="invoice">
                  <summary>
                    <span className="mono">{inv.number}</span>
                    <span>{formatDate(inv.date)}</span>
                    <span className="invoice__amount">{euro(inv.total)}</span>
                    <i className={`chip ${inv.status === 'paid' ? 'chip--ok' : 'chip--warn'}`}>{inv.status === 'paid' ? 'Paid' : 'Open'}</i>
                  </summary>
                  <dl>
                    <div><dt>{inv.product}</dt><dd>{euro(inv.excl)}</dd></div>
                    <div><dt>VAT</dt><dd>{euro(inv.vat)}</dd></div>
                    <div><dt>Total</dt><dd>{euro(inv.total)}</dd></div>
                    <div><dt>Payment reference</dt><dd className="mono">{inv.reference}</dd></div>
                  </dl>
                </details>
              ))}
            </section>

            <section className="card">
              <span className="eyebrow">Profile</span>
              <strong className="card__title">{member.firstName} {member.lastName}</strong>
              <p>{member.email}</p>
              {resetSent ? (
                <p className="card__ok" role="status">A link to choose a new password is on its way to {member.email}.</p>
              ) : (
                <button className="key key--light key--sm" onClick={() => setResetSent(true)}>Change my password</button>
              )}
            </section>
          </aside>
        </div>
      </div>
    </main>
  )
}
