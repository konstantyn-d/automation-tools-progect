import { useCallback, useMemo, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import LessonList from '../components/LessonList.jsx'
import Player, { toClock, toSeconds } from '../components/Player.jsx'
import { CheckIcon, LockIcon } from '../components/icons.jsx'
import ComingSoon from './ComingSoon.jsx'
import { findCourse } from '../data/site.js'
import { canWatch, useSession } from '../lib/session.jsx'
import '../styles/course.css'

// Every lesson has the same four chapters at fixed points. Real chapters come with the real videos.
function chaptersFor(lesson) {
  const d = toSeconds(lesson.time)
  return [
    { at: 0, label: 'What we are going to build' },
    { at: Math.round(d * 0.15), label: 'Step by step' },
    { at: Math.round(d * 0.7), label: 'Test it' },
    { at: Math.round(d * 0.9), label: 'Recap' },
  ]
}

// Shown instead of the player when the visitor has no access to this lesson.
function Paywall({ course }) {
  const { pathname } = useLocation()
  return (
    <div className="screen screen--locked">
      <div className="screen__stage">
        <span className="screen__nodes" aria-hidden="true">
          <i /><i /><i /><i />
        </span>
      </div>
      <div className="paywall">
        <span className="paywall__icon">
          <LockIcon size={3} />
        </span>
        <h2>This lesson is for members</h2>
        <p>
          Lesson 1 of every course is free. To watch the rest, take a subscription or buy this course on
          its own.
        </p>
        <div className="paywall__actions">
          <Link to="/order?product=monthly" className="key key--dark">
            Get access · from €15 a month
          </Link>
          <Link to={`/order?product=single&course=${course.slug}`} className="key key--light">
            Only this course · €39
          </Link>
        </div>
        <p className="paywall__fine">
          Already a member?{' '}
          <Link to="/login" state={{ next: pathname }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function Lesson() {
  const { slug, nr } = useParams()
  const { member, markWatched } = useSession()
  const [seek, setSeek] = useState(null)
  const course = findCourse(slug)
  const lesson = course?.lessons.find((l) => l.nr === Number(nr))
  const chapters = useMemo(() => (lesson ? chaptersFor(lesson) : []), [lesson])
  const onFinished = useCallback(() => markWatched(slug, Number(nr)), [markWatched, slug, nr])

  if (!course || !lesson) {
    return <ComingSoon label="404" title="This lesson does not exist." text="The link may be old. All courses are on the home page." />
  }

  const open = canWatch(member, course, lesson)
  const watched = (member?.progress[course.slug] || []).includes(lesson.nr)
  const prev = course.lessons[lesson.nr - 2]
  const next = course.lessons[lesson.nr]

  return (
    <main className="watch">
      <div className="container watch__grid">
        <div className="watch__main">
          <Link to={`/courses/${course.slug}`} className="back">
            <span aria-hidden="true">←</span> {course.title}
          </Link>

          {/* key: a new lesson starts with a fresh player */}
          {open ? (
            <Player key={`${slug}-${nr}`} lesson={lesson} chapters={chapters} seek={seek?.lesson === `${slug}-${nr}` ? seek : null} onFinished={onFinished} />
          ) : (
            <Paywall course={course} />
          )}

          <div className="watch__title">
            <div>
              <p className="eyebrow">
                Lesson {lesson.nr} of {course.videos}
                {lesson.free && ' · free'}
              </p>
              <h1>{lesson.title}</h1>
            </div>
            {watched && (
              <i className="chip chip--ok">
                <CheckIcon size={1.5} /> Watched
              </i>
            )}
          </div>

          <div className="watch__nav">
            {prev ? (
              <Link to={`/courses/${course.slug}/${prev.nr}`} className="key key--light key--sm">
                <span aria-hidden="true">←</span> Previous
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link to={`/courses/${course.slug}/${next.nr}`} className="key key--light key--sm">
                Next: {next.title} <span className="arrow">→</span>
              </Link>
            )}
          </div>

          <div className="watch__below">
            <section>
              <h2 className="course__h">Chapters</h2>
              <ol className="chapters">
                {chapters.map((c) => (
                  <li key={c.at}>
                    <button disabled={!open} onClick={() => setSeek({ to: c.at, lesson: `${slug}-${nr}`, id: Date.now() })}>
                      <span className="mono">{toClock(c.at)}</span>
                      {c.label}
                    </button>
                  </li>
                ))}
              </ol>
            </section>
            <section>
              <h2 className="course__h">Transcript</h2>
              {open ? (
                <p className="watch__transcript">
                  Welcome back. This lesson is about {lesson.title.charAt(0).toLowerCase() + lesson.title.slice(1)}.
                  We start from where the previous lesson stopped, so open that workflow if you want to build
                  along. Pause whenever you need to. At the end we test it together and look at what can go
                  wrong.
                </p>
              ) : (
                <p className="watch__transcript watch__transcript--locked">
                  Transcript, chapters and lesson files open together with the video.
                </p>
              )}
            </section>
          </div>
        </div>

        <aside className="watch__side">
          <span className="eyebrow">{course.title}</span>
          <LessonList course={course} current={lesson.nr} />
        </aside>
      </div>
    </main>
  )
}
