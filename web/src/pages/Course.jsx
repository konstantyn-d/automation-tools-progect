import { Link, useParams } from 'react-router-dom'
import CourseArt from '../components/CourseArt.jsx'
import CourseCover from '../components/CourseCover.jsx'
import LessonList from '../components/LessonList.jsx'
import { CheckIcon, PlayIcon } from '../components/icons.jsx'
import ComingSoon from './ComingSoon.jsx'
import { COURSES, findCourse, topicLabel } from '../data/courses.js'
import { hasCourse, useSession } from '../lib/session.jsx'
import '../styles/courses.css'
import '../styles/course.css'

// One course: what it is about, what you learn, and every lesson in it.
export default function Course() {
  const { slug } = useParams()
  const { member } = useSession()
  const course = findCourse(slug)

  if (!course) {
    return <ComingSoon label="404" title="This course does not exist." text="The link may be old. All courses are on the home page." />
  }

  const owned = hasCourse(member, course)
  const watched = member?.progress[course.slug] || []
  const next = course.lessons.find((l) => !watched.includes(l.nr)) || course.lessons[0]
  // more from the same topic first, then the most watched
  const others = [...COURSES]
    .filter((c) => c.slug !== course.slug)
    .sort((a, b) => (b.topic === course.topic) - (a.topic === course.topic) || b.students - a.students)
    .slice(0, 3)

  return (
    <main className="course">
      <section className="container course__head">
        <div className="course__intro">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link to="/courses">All courses</Link>
            <span aria-hidden="true">/</span>
            <Link to={`/courses?topic=${course.topic}`}>{topicLabel(course.topic)}</Link>
          </nav>
          <p className="eyebrow">
            Course {course.nr} · {course.level}
          </p>
          <h1 className="h-section">{course.title}</h1>
          <p className="lede">{course.summary}</p>
          <ul className="course__meta">
            <li>{course.videos} lessons</li>
            <li>{course.duration}</li>
            <li>Taught by {course.teacher}</li>
            <li>English, subtitles EN and NL</li>
          </ul>

          {owned ? (
            <div className="course__owned">
              <div className="progress" aria-hidden="true">
                <b style={{ width: `${(watched.length / course.videos) * 100}%` }} />
              </div>
              <p>
                {watched.length} of {course.videos} lessons watched
              </p>
              <Link to={`/courses/${course.slug}/${next.nr}`} className="key key--dark">
                <PlayIcon size={1.5} /> {watched.length ? `Continue with lesson ${next.nr}` : 'Start the course'}
              </Link>
            </div>
          ) : (
            <div className="course__actions">
              <Link to={`/courses/${course.slug}/1`} className="key key--dark">
                <PlayIcon size={1.5} /> Watch lesson 1 for free
              </Link>
              <Link to={`/order?product=single&course=${course.slug}`} className="key key--light">
                Buy this course · €39
              </Link>
            </div>
          )}
        </div>

        <div className="course__cover cover-mount">
          <div className="cover cover--static">
            <CourseArt name={course.art} tone={course.tone} />
          </div>
        </div>
      </section>

      <section className="container course__body">
        <div className="course__main">
          <h2 className="course__h">After this course you can</h2>
          <ul className="outcomes">
            {course.outcomes.map((o) => (
              <li key={o}>
                <CheckIcon /> {o}
              </li>
            ))}
          </ul>

          <h2 className="course__h">
            Lessons <span className="soft">{course.videos} videos · {course.duration}</span>
          </h2>
          <LessonList course={course} />
        </div>

        {!owned && (
          <aside className="buybox">
            <span className="eyebrow">Two ways to watch</span>
            <div className="buybox__option">
              <div>
                <strong>Subscription</strong>
                <p>This course and the 59 others, plus two new lessons every week.</p>
              </div>
              <span className="buybox__price">
                €15<em>per month</em>
              </span>
            </div>
            <Link to="/order?product=monthly" className="key key--dark">
              Get a subscription <span className="arrow">→</span>
            </Link>
            <div className="buybox__option">
              <div>
                <strong>Only this course</strong>
                <p>Pay once. It stays in your account for good.</p>
              </div>
              <span className="buybox__price">
                €39<em>once</em>
              </span>
            </div>
            <Link to={`/order?product=single&course=${course.slug}`} className="key key--light">
              Buy this course
            </Link>
            <p className="buybox__fine">
              Prices without VAT. Already a member? <Link to="/login">Sign in</Link>
            </p>
          </aside>
        )}
      </section>

      <section className="container course__more">
        <div className="course__more-head">
          <h2 className="course__h">More in {topicLabel(course.topic)}</h2>
          <Link to={`/courses?topic=${course.topic}`} className="back">
            See all <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="covers">
          {others.map((c) => (
            <div key={c.slug} className="cover-mount">
              <CourseCover course={c} />
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
