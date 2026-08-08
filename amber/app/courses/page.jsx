'use client';
import { useState, useMemo } from 'react';
import CourseCard from '@/components/CourseCard';
import Footer from '@/components/Footer';
import { CATEGORIES } from '@/lib/data';
import { useCourses } from '@/lib/store';

const SORTS = [
  { id: 'popular', label: 'Most popular' },
  { id: 'rating', label: 'Highest rated' },
  { id: 'low', label: 'Price: low to high' },
  { id: 'high', label: 'Price: high to low' }
];

export default function CoursesPage() {
  const courses = useCourses();
  const CATALOGUE = courses.published;
  const [cat, setCat] = useState('all');
  const [sort, setSort] = useState('popular');
  const [q, setQ] = useState('');

  const list = useMemo(() => {
    let out = CATALOGUE.slice();
    if (cat !== 'all') out = out.filter(c => c.cat === cat);
    if (q.trim()) {
      const t = q.toLowerCase();
      out = out.filter(c =>
        (c.title || '').toLowerCase().includes(t) ||
        (c.instructor || '').toLowerCase().includes(t) ||
        (c.tag || '').toLowerCase().includes(t)
      );
    }
    if (sort === 'rating') out.sort((a, b) => b.rating - a.rating);
    else if (sort === 'low') out.sort((a, b) => a.price - b.price);
    else if (sort === 'high') out.sort((a, b) => b.price - a.price);
    else out.sort((a, b) => (b.learners || 0) - (a.learners || 0));
    return out;
  }, [cat, sort, q, CATALOGUE]);

  return (
    <>
      <section className="wrap" style={{ paddingTop: 48, paddingBottom: 24 }}>
        <p className="eyebrow">All courses</p>
        <h1 style={{ fontSize: 44, letterSpacing: '-.02em', marginBottom: 16 }}>Practical MasterClasses</h1>
        <p style={{ fontSize: 19, color: 'var(--secondary)', maxWidth: '58ch' }}>
          {CATALOGUE.length} courses. Every one built from real engagement work, with the templates included.
        </p>
      </section>

      <section className="wrap" style={{ paddingBottom: 32 }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="chips">
            {CATEGORIES.map(c => (
              <button key={c.id} className={'chip' + (cat === c.id ? ' on' : '')} onClick={() => setCat(c.id)}>
                {c.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="field" style={{ margin: 0, maxWidth: 240 }}>
              <input placeholder="Search courses" value={q} onChange={e => setQ(e.target.value)} aria-label="Search courses" />
            </div>
            <div className="field" style={{ margin: 0, maxWidth: 200 }}>
              <select value={sort} onChange={e => setSort(e.target.value)} aria-label="Sort by">
                {SORTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="wrap" style={{ paddingBottom: 96 }}>
        <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24 }}>
          Showing {list.length} of {CATALOGUE.length} courses
        </p>
        {list.length ? (
          <div className="g3">{list.map(c => <CourseCard key={c.id} course={c} />)}</div>
        ) : (
          <div className="emptyst">
            <h3 style={{ fontSize: 21, marginBottom: 12 }}>Nothing matches “{q}”</h3>
            <p style={{ color: 'var(--muted)', margin: 0 }}>Try a broader term, or clear the filters.</p>
            <button className="btn btn-s" style={{ marginTop: 24 }} onClick={() => { setQ(''); setCat('all'); }}>
              Clear filters
            </button>
          </div>
        )}
      </section>

      <Footer />
    </>
  );
}
