import Reveal from '../components/Reveal.jsx'
import CourseCover from '../components/CourseCover.jsx'
import { Link } from 'react-router-dom'
import { COURSES, TOPICS } from '../data/courses.js'
import '../styles/courses.css'
import '../styles/catalog.css'

export default function Courses() {
  return (
    <section className="courses" id="courses">
      <div className="courses__grid-bg" aria-hidden="true" />
      <div className="container">
        <Reveal className="courses__head">
          <p className="eyebrow">Most watched</p>
          <h2 className="h-section">
            Pick a course. <span className="soft">The first lesson is always free.</span>
          </h2>
          <p className="lede">
            Each course is a row of short videos that build one thing from start to finish. These six
            are where most people start.
          </p>
        </Reveal>

        <div className="covers">
          {COURSES.slice(0, 6).map((course, i) => (
            <Reveal key={course.slug} className="cover-mount" delay={(i % 3) * 90}>
              <CourseCover course={course} />
            </Reveal>
          ))}
        </div>

        <Reveal className="courses__more">
          <Link to="/courses" className="key key--dark">
            Browse all {COURSES.length} courses <span className="arrow">→</span>
          </Link>
          <div className="courses__topics">
            <span>Or start from a topic</span>
            {TOPICS.map((t) => (
              <Link key={t.id} to={`/courses?topic=${t.id}`} className="topic-chip">
                {t.label} <span>{COURSES.filter((c) => c.topic === t.id).length}</span>
              </Link>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
