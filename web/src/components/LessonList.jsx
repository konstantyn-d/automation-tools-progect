import { Link } from 'react-router-dom'
import { CheckIcon, LockIcon, PlayIcon } from './icons.jsx'
import { canWatch, useSession } from '../lib/session.jsx'

// The lessons of one course. Shows per lesson whether it is watched, free, open or locked.
export default function LessonList({ course, current }) {
  const { member } = useSession()
  const watched = member?.progress[course.slug] || []

  return (
    <ol className="lesson-list">
      {course.lessons.map((lesson) => {
        const open = canWatch(member, course, lesson)
        const done = watched.includes(lesson.nr)
        return (
          <li key={lesson.nr}>
            <Link
              to={`/courses/${course.slug}/${lesson.nr}`}
              className={`lesson-row ${current === lesson.nr ? 'is-current' : ''} ${open ? '' : 'is-locked'}`}
              aria-current={current === lesson.nr ? 'true' : undefined}
            >
              <span className="lesson-row__nr">{String(lesson.nr).padStart(2, '0')}</span>
              <span className="lesson-row__title">{lesson.title}</span>
              {lesson.free && !member ? <i className="chip chip--ok">Free</i> : <span />}
              <span className="lesson-row__time">{lesson.time}</span>
              <span className={`lesson-row__state ${done ? 'is-done' : ''}`}>
                {done ? <CheckIcon /> : open ? <PlayIcon size={1.5} /> : <LockIcon size={1.5} />}
                <span className="sr-only">{done ? 'Watched' : open ? 'Ready to watch' : 'Members only'}</span>
              </span>
            </Link>
          </li>
        )
      })}
    </ol>
  )
}
