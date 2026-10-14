import { Link } from 'react-router-dom';
import { fmtDuration } from '../data/catalog.js';
import { MorphBlob, Play } from './Blobs.jsx';

export default function CourseCard({ course, i = 0 }) {
  return (
    <Link to={`/courses/${course.slug}`} className="card card-hover course-card">
      <div className="course-thumb">
        <MorphBlob size={230} speed={0.004 + (i % 3) * 0.002} style={{ position: 'absolute', left: -30 + (i % 3) * 40, top: -40 }} />
        <span className="chip" style={{ position: 'absolute', left: 14, top: 14, zIndex: 2 }}>{course.tag}</span>
        <span className="play"><Play /></span>
      </div>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <span className="label">{course.level}</span>
        <span className="label">{course.lessonsCount} lessons · {fmtDuration(course.minutes)}</span>
      </div>
      <h3 className="h-3">{course.title}</h3>
      <p className="dim" style={{ margin: 0, fontSize: 15 }}>{course.summary}</p>
      <span className="label" style={{ marginTop: 'auto' }}>with {course.teacher}</span>
    </Link>
  );
}
