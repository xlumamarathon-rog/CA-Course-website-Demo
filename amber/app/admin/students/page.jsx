'use client';
import AdminShell from '@/components/AdminShell';
import { useCourses, useAllStudents } from '@/lib/store';
import { fmt } from '@/lib/data';
import { useStored, KEYS } from '@/lib/storage';

export default function AdminStudents() {
  const courses = useCourses();
  const students = useAllStudents();
  const [progress] = useStored(KEYS.progress, {});

  return (
    <AdminShell title="Students">
      <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', padding: '16px 24px' }}>
          <table className="tb">
            <thead>
              <tr><th>Account</th><th>Role</th><th>Courses owned</th><th>Spend</th></tr>
            </thead>
            <tbody>
              {students.map(s => {
                const owned = s.courses.map(id => courses.get(id)).filter(Boolean);
                const spend = owned.reduce((a, c) => a + c.price, 0);
                return (
                  <tr key={s.email}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span className={'av' + (s.role === 'admin' ? ' ac' : '')}>
                          {s.name.split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase()}
                        </span>
                        <span>
                          <b style={{ fontWeight: 600, display: 'block' }}>{s.name}</b>
                          <span style={{ fontSize: 13, color: 'var(--muted)' }}>{s.email}</span>
                        </span>
                      </div>
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>{s.role}</td>
                    <td>
                      {owned.length === 0
                        ? <span style={{ color: 'var(--muted)' }}>None</span>
                        : owned.map(c => {
                            const p = progress[c.id];
                            const dc = p ? Object.keys(p.done || {}).length : 0;
                            return (
                              <div key={c.id} style={{ fontSize: 14, padding: '3px 0' }}>
                                {c.title}
                                {dc > 0 && <span style={{ color: 'var(--muted)' }}> · {dc} lessons done</span>}
                              </div>
                            );
                          })}
                    </td>
                    <td className="tnum">{fmt(spend)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 20 }}>
        Accounts appear here once they have signed in on this device. Progress is read from the same
        storage the course player writes to.
      </p>
    </AdminShell>
  );
}
