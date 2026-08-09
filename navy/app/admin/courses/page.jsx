'use client';
import { useState } from 'react';
import Link from 'next/link';
import AdminShell from '@/components/AdminShell';
import { useConfirm } from '@/components/Confirm';
import { useCourses, useAllStudents } from '@/lib/store';
import { totalLessons, fmt } from '@/lib/data';

export default function AdminCourses() {
  const courses = useCourses();
  const students = useAllStudents();
  const [q, setQ] = useState('');
  const confirm = useConfirm();
  const [filter, setFilter] = useState('all');

  const soldCount = (id) => students.filter(s => s.courses.includes(id)).length;

  let list = courses.all;
  if (filter === 'live') list = list.filter(c => c.published !== false);
  if (filter === 'draft') list = list.filter(c => c.published === false);
  if (q.trim()) {
    const t = q.toLowerCase();
    list = list.filter(c => (c.title || '').toLowerCase().includes(t) || (c.instructor || '').toLowerCase().includes(t));
  }

  return (
    <AdminShell title="Courses" action={<Link href="/admin/courses/new" className="btn btn-p btn-sm">New course</Link>}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 }}>
        <div className="chips">
          {[['all', 'All ' + courses.all.length],
            ['live', 'Live ' + courses.all.filter(c => c.published !== false).length],
            ['draft', 'Drafts ' + courses.all.filter(c => c.published === false).length]].map(([id, label]) => (
            <button key={id} className={'chip' + (filter === id ? ' on' : '')} onClick={() => setFilter(id)}>{label}</button>
          ))}
        </div>
        <div className="field" style={{ margin: 0, maxWidth: 260 }}>
          <input placeholder="Search courses" value={q} onChange={e => setQ(e.target.value)} />
        </div>
      </div>

      <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', padding: '16px 24px' }}>
          <table className="tb">
            <thead>
              <tr><th>Course</th><th>Category</th><th>Status</th><th>Lessons</th><th>Price</th><th>Sold</th><th></th></tr>
            </thead>
            <tbody>
              {list.map(c => (
                <tr key={c.id}>
                  <td>
                    <b style={{ fontWeight: 600 }}>{c.title || 'Untitled'}</b>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }} className="mono">/course/{c.id}</div>
                  </td>
                  <td style={{ textTransform: 'capitalize' }}>{c.cat}</td>
                  <td>
                    <button className="statusbtn" onClick={() => courses.togglePublish(c.id)}
                      title="Click to publish or unpublish">
                      <span className={'dot-s ' + (c.published === false ? 'draft' : 'live')} />
                      {c.published === false ? 'Draft' : 'Live'}
                    </button>
                  </td>
                  <td className="tnum">{totalLessons(c)}</td>
                  <td className="tnum">{c.price === 0 ? 'Free' : fmt(c.price)}</td>
                  <td className="tnum">{soldCount(c.id)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <Link href={'/course/' + c.id} className="btn btn-t" style={{ fontSize: 13 }}>View</Link>
                      <Link href={'/admin/courses/' + c.id} className="btn btn-s btn-sm">Edit</Link>
                      <button className="btn btn-s btn-sm" style={{ color: 'var(--danger)' }}
                        onClick={async () => {
                          const ok = await confirm({
                            title: 'Delete this course?',
                            body: '“' + c.title + '” will be removed from the catalogue. This cannot be undone.',
                            confirmLabel: 'Delete course', danger: true
                          });
                          if (ok) courses.remove(c.id);
                        }}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr><td colSpan={7} style={{ padding: '32px 0', textAlign: 'center', color: 'var(--muted)' }}>
                  No courses match.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
