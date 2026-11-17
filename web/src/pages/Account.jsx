import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import CourseArt from '../components/CourseArt.jsx'
import { PlayIcon } from '../components/icons.jsx'
import { PLANS } from '../data/site.js'
import { DEMO_STAFF } from '../data/member.js'
import { COURSES } from '../data/courses.js'
import CourseTile from '../components/CourseTile.jsx'
import { hasCourse, hasSubscription, useSession } from '../lib/session.jsx'
import { euro } from '../lib/vat.js'
import '../styles/course.css'
import '../styles/catalog.css'
import '../styles/account.css'

const DATE = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
const formatDate = (iso) => DATE.format(new Date(iso))

function CourseRow({ course, watched }) {
  const next = course.lessons.find((l) => !watched.includes(l.nr))
  const done = !next
  return (
    <li className="mycourse">
      <Link to={`/courses/${course.slug}`} className="mycourse__art" aria-label={course.title}>
        <CourseArt name={course.art} tone={course.tone} />
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
  const { member, signIn, signOut } = useSession()
  const navigate = useNavigate()
  const [resetSent, setResetSent] = useState(false)

  if (!member) return <Navigate to="/login" replace />
  if (member.role === 'staff') return <Navigate to="/admin" replace />

  const plan = PLANS.find((p) => p.id === member.plan)
  const subscribed = hasSubscription(member)
  const mine = COURSES.filter((c) => hasCourse(member, c))
  const started = mine.filter((c) => (member.progress[c.slug] || []).length > 0)
  const bought = COURSES.filter((c) => member.courses?.includes(c.slug) && !started.includes(c))
  // suggestions: unstarted courses in the topics this person already watches, then the most watched
  const topics = new Set(started.map((c) => c.topic))
  const suggestions = COURSES.filter((c) => !(member.progress[c.slug] || []).length && !bought.includes(c))
    .sort((a, b) => topics.has(b.topic) - topics.has(a.topic) || b.students - a.students)
    .slice(0, 4)

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
            {bought.length > 0 && (
              <section>
                <h2 className="course__h">Your courses</h2>
                <ul className="mycourses">
                  {bought.map((c) => <CourseRow key={c.slug} course={c} watched={[]} />)}
                </ul>
              </section>
            )}
            {started.length === 0 && bought.length === 0 && (
              <section className="account__empty">
                <h2 className="course__h">Nothing here yet</h2>
                <p>Every course starts with a free lesson. Pick one and it shows up here with your progress.</p>
              </section>
            )}
            <section>
              <div className="course__more-head">
                <h2 className="course__h">
                  {subscribed ? 'Something new to start' : 'Courses you could add'}
                  {!subscribed && <span className="soft">€39 each, or all of them with a subscription</span>}
                </h2>
                <Link to="/courses" className="back">
                  All {COURSES.length} courses <span aria-hidden="true">→</span>
                </Link>
              </div>
              <div className="tiles tiles--four">
                {suggestions.map((c, i) => (
                  <CourseTile key={c.slug} course={c} owned={hasCourse(member, c)} index={i} />
                ))}
              </div>
            </section>
          </div>

          <aside className="account__side">
            <section className="card">
              {subscribed ? (
                <>
                  <span className="eyebrow">Your subscription</span>
                  <strong className="card__title">{plan.name}</strong>
                  <span className="card__big">{formatDate(member.endDate)}</span>
                  <p>End date. We remind you 30 and 7 days before, nothing renews by itself.</p>
                  <Link to={`/order?product=${member.plan}`} className="key key--light key--sm">
                    Renew now
                  </Link>
                </>
              ) : (
                <>
                  <span className="eyebrow">No subscription</span>
                  <strong className="card__title">
                    {member.courses?.length ? `${member.courses.length} course${member.courses.length > 1 ? 's' : ''} bought separately` : 'Free lessons only'}
                  </strong>
                  <p>A subscription opens all {COURSES.length} courses, plus two new lessons every week.</p>
                  <Link to="/order?product=yearly" className="key key--dark key--sm">
                    Get everything · €149 a year
                  </Link>
                </>
              )}
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

            {/* TEMPORARY: until staff accounts exist, this opens the admin panel as someone from the office. */}
            <section className="card card--demo">
              <span className="eyebrow">Demo only</span>
              <p>See what the LoopCasts office sees: orders, invoices, payments and support.</p>
              <button className="key key--light key--sm" onClick={() => { signIn(DEMO_STAFF); navigate('/admin') }}>
                Open the admin panel
              </button>
            </section>
          </aside>
        </div>
      </div>
    </main>
  )
}
