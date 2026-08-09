'use client';
import Link from 'next/link';
import AdminShell from '@/components/AdminShell';
import { useConfirm } from '@/components/Confirm';
import { useCourses, useAllStudents } from '@/lib/store';
import { totalLessons, fmt, parseDur, fmtLong } from '@/lib/data';

export default function AdminDashboard() {
  const courses = useCourses();
  const students = useAllStudents();
  const confirm = useConfirm();

  const all = courses.all;
  const live = all.filter(c => c.published !== false);
  const drafts = all.filter(c => c.published === false);
  const lessons = all.reduce((a, c) => a + totalLessons(c), 0);
  const runtime = all.reduce((a, c) =>
    a + c.sections.reduce((b, s) => b + s.lectures.reduce((d, l) => d + parseDur(l.dur), 0), 0), 0);
  const sales = students.reduce((a, s) => a.concat(s.courses.map(id => ({ email: s.email, id }))), []);
  const revenue = sales.reduce((a, s) => {
    const c = courses.get(s.id);
    return a + (c ? c.price : 0);
  }, 0);

  const cards = [
    { n: all.length, l: 'Courses', s: live.length + ' live · ' + drafts.length + ' draft' },
    { n: lessons, l: 'Lessons', s: fmtLong(runtime) + ' of content' },
    { n: students.length, l: 'Accounts', s: 'Across this device' },
    { n: fmt(revenue), l: 'Revenue booked', s: sales.length + ' enrolments' }
  ];

  return (
    <AdminShell title="Dashboard" action={<Link href="/admin/courses/new" className="btn btn-p btn-sm">New course</Link>}>
      <div className="g4" style={{ marginBottom: 32 }}>
        {cards.map(c => (
          <div className="panel stat-card" key={c.l}>
            <div className="n tnum">{c.n}</div>
            <div className="l">{c.l}</div>
            <div className="s">{c.s}</div>
          </div>
        ))}
      </div>

      <div className="panel" style={{ padding: 0, overflow: 'hidden', marginBottom: 32 }}>
        <div className="adm-ph">
          <h3>Courses</h3>
          <Link href="/admin/courses" className="btn btn-t" style={{ fontSize: 14 }}>Manage all →</Link>
        </div>
        <div style={{ padding: '0 24px 8px', overflowX: 'auto' }}>
          <table className="tb">
            <thead>
              <tr><th>Course</th><th>Status</th><th>Lessons</th><th>Price</th><th>Sold</th><th></th></tr>
            </thead>
            <tbody>
              {all.slice(0, 6).map(c => {
                const sold = sales.filter(s => s.id === c.id).length;
                return (
                  <tr key={c.id}>
                    <td>
                      <b style={{ fontWeight: 600 }}>{c.title}</b>
                      <div style={{ fontSize: 13, color: 'var(--muted)' }}>{c.instructor}</div>
                    </td>
                    <td>
                      <span className={'dot-s ' + (c.published === false ? 'draft' : 'live')} />
                      {c.published === false ? 'Draft' : 'Live'}
                    </td>
                    <td className="tnum">{totalLessons(c)}</td>
                    <td className="tnum">{c.price === 0 ? 'Free' : fmt(c.price)}</td>
                    <td className="tnum">{sold}</td>
                    <td style={{ textAlign: 'right' }}>
                      <Link href={'/admin/courses/' + c.id} className="btn btn-s btn-sm">Edit</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel" style={{ background: 'var(--surface)' }}>
        <p className="eyebrow">How this demo works</p>
        <h3 style={{ fontSize: 19, marginBottom: 12 }}>There is no server behind this panel</h3>
        <p style={{ color: 'var(--secondary)', fontSize: 15, maxWidth: '68ch', margin: 0 }}>
          Everything you create here is written to this browser&apos;s storage and read straight back by the
          public site. Publish a course and it appears in the catalogue immediately. Add a lesson with a video
          URL — or upload a file — and it plays in the course player. Swap <code className="mono">lib/store.js</code> for
          real API calls and the interface does not change.
        </p>
        <div className="btn-row" style={{ marginTop: 20 }}>
          <Link href="/admin/courses/new" className="btn btn-p btn-sm">Create a course</Link>
          <button className="btn btn-s btn-sm" onClick={async () => {
            const ok = await confirm({
              title: 'Reset the catalogue?',
              body: 'The six seed courses come back and anything you created here is removed.',
              confirmLabel: 'Reset catalogue', danger: true
            });
            if (ok) courses.resetToSeed();
          }}>Reset catalogue</button>
        </div>
      </div>
    </AdminShell>
  );
}
