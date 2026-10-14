import { useState } from 'react';
import { BlobField } from '../components/Blobs.jsx';
import CourseCard from '../components/CourseCard.jsx';
import { PageHead } from '../components/ui.jsx';
import { COURSES, TAGS } from '../data/catalog.js';

const LEVELS = ['All levels', 'Beginner', 'Intermediate', 'Advanced'];

export default function Courses() {
  const [tag, setTag] = useState('All');
  const [level, setLevel] = useState('All levels');
  const list = COURSES.filter((c) => (tag === 'All' || c.tag === tag) && (level === 'All levels' || c.level === level));

  return (
    <div className="page">
      <BlobField blobs={[
        { x: '82%', y: '-6%', size: 260, duration: 15 },
        { x: '90%', y: '8%', size: 160, duration: 11, delay: -4, dx1: -70, dy1: 40 },
      ]} />
      <div className="wrap" style={{ position: 'relative' }}>
        <PageHead label="Catalog" title={<>All <span className="serif">courses</span></>}>
          <p className="lead">One catalog, one source of truth. Course pages, lesson pages and durations are generated from the same data.</p>
        </PageHead>
        <div className="between" style={{ marginBottom: 32 }}>
          <div className="row">
            {TAGS.map((t) => <button key={t} className={`chip ${tag === t ? 'on' : ''}`} onClick={() => setTag(t)}>{t}</button>)}
          </div>
          <select className="select" style={{ width: 200 }} value={level} onChange={(e) => setLevel(e.target.value)} aria-label="Level">
            {LEVELS.map((l) => <option key={l}>{l}</option>)}
          </select>
        </div>
        <div className="grid-3">
          {list.map((c, i) => <CourseCard key={c.slug} course={c} i={i} />)}
        </div>
        {list.length === 0 && <p className="dim">No courses match these filters.</p>}
      </div>
    </div>
  );
}
