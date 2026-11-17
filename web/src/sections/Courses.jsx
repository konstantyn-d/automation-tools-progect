import Reveal from '../components/Reveal.jsx'
import CourseCover from '../components/CourseCover.jsx'
import { COURSES } from '../data/site.js'
import '../styles/courses.css'

export default function Courses() {
  return (
    <section className="courses" id="courses">
      <div className="courses__grid-bg" aria-hidden="true" />
      <div className="container">
        <Reveal className="courses__head">
          <p className="eyebrow">The courses</p>
          <h2 className="h-section">
            Pick a course. <span className="soft">The first lesson is always free.</span>
          </h2>
          <p className="lede">
            Each course is a row of short videos that build one thing from start to finish. Open one
            to see its lessons.
          </p>
        </Reveal>

        <div className="covers">
          {COURSES.map((course, i) => (
            <Reveal key={course.slug} className="cover-mount" delay={(i % 3) * 90}>
              <CourseCover course={course} />
            </Reveal>
          ))}
        </div>

        <Reveal className="courses__more">
          Six of our sixty courses are shown here. A subscription opens all of them.
        </Reveal>
      </div>
    </section>
  )
}
