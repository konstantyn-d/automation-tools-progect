import { Link } from 'react-router-dom'
import CourseArt from './CourseArt.jsx'
import { topicLabel } from '../data/courses.js'
import { highlight } from '../lib/search.jsx'

// A course in the catalogue grid: the same small book as on the home page, a bit more compact.
export default function CourseTile({ course, query = '', lesson = null, isNew = false, owned = false, index = 0 }) {
  return (
    <Link to={`/courses/${course.slug}`} className="tile" style={{ '--i': Math.min(index, 11) }}>
      <div className="tile__art">
        <CourseArt name={course.art} tone={course.tone} />
        {isNew && <i className="tile__badge">New</i>}
      </div>
      <div className="tile__body">
        <span className="tile__topic">
          {topicLabel(course.topic)} · {course.level}
        </span>
        <h3>{highlight(course.title, query)}</h3>
        {lesson && (
          <p className="tile__hit">
            <span className="mono">Lesson {lesson.nr}</span> {highlight(lesson.title, query)}
          </p>
        )}
        <footer>
          <span>
            {course.videos} lessons · {course.duration}
          </span>
          <span className={`tile__price ${owned ? 'is-owned' : ''}`}>{owned ? 'In your account' : '€39'}</span>
        </footer>
      </div>
    </Link>
  )
}
