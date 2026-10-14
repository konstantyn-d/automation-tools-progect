import { Link } from 'react-router-dom';
import { fmtDuration } from '../data/catalog.js';
import { MorphBlob, Play } from './Blobs.jsx';

export default function CourseCard({ course, i = 0 }) {
  return (
    <Link to={`/courses/${course.slug}`} className="card card-hover course-card">
      <div className="course-thumb">
        <MorphBlob size={230} speed={0.004 + (i % 3) * 0.002} style={{ position: 'absolute', left: -30 + (i % 3) * 40, top: -40 }} />
        {course.level && <span className="chip" style={{ position: 'absolute', left: 14, top: 14, zIndex: 2 }}>{course.level}</span>}
        <span className="play"><Play /></span>
      </div>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <span className="label">{course.video_count} lessons</span>
        <span className="label">{fmtDuration(course.duration_min)}</span>
      </div>
      <h3 className="h-3">{course.title}</h3>
      {course.summary && <p className="dim" style={{ margin: 0, fontSize: 15 }}>{course.summary}</p>}
      <span className="label" style={{ marginTop: 'auto' }}>
        {course.published_on ? `Since ${course.published_on.slice(0, 4)}` : ''}{course.sold ? ` · bought ${course.sold}× on its own` : ''}
      </span>
    </Link>
  );
}

export function Skeleton({ n = 3 }) {
  return Array.from({ length: n }).map((_, i) => (
    <div key={i} className="card course-card" style={{ opacity: 0.5 }}><div className="course-thumb" /></div>
  ));
}
