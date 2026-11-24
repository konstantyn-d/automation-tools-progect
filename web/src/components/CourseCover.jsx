import { Link } from 'react-router-dom'
import CourseArt from './CourseArt.jsx'

// A course drawn as a small book. Clicking it opens the course page.
export default function CourseCover({ course }) {
  return (
    <Link to={`/courses/${course.slug}`} className="cover">
      <header>
        <h3>{course.title}</h3>
        <span className="cover__level">{course.level}</span>
      </header>
      <CourseArt name={course.art} tone={course.tone} slug={course.slug} />
      <footer>
        <span>Course {course.nr}</span>
        <span>
          {course.videos} lessons · {course.duration}
        </span>
      </footer>
      <span className="cover__open">
        View course <span className="arrow">→</span>
      </span>
    </Link>
  )
}
