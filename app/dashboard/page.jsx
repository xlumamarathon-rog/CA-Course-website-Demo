'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import Thumb from '@/components/Thumb';
import { totalLessons, flatLessons } from '@/lib/data';
import { useStored, KEYS, dumpAll, clearAll } from '@/lib/storage';
import { useCourses, useAuth, usePurchases } from '@/lib/store';

export default function Dashboard() {
  const courses = useCourses();
  const { user, ready: authReady } = useAuth();
  const { list: purchased } = usePurchases();
  const [progress] = useStored(KEYS.progress, {});
  const [notes] = useStored(KEYS.notes, {});
  const [showRaw, setShowRaw] = useState(false);
  const [raw, setRaw] = useState('');

  useEffect(() => { setRaw(JSON.stringify(dumpAll(), null, 2)); }, [purchased, progress, notes, showRaw]);

  const mine = purchased.map(id => courses.get(id)).filter(Boolean);

  return (
    <>
      {authReady && !user && (
        <section className="wrap" style={{ paddingTop: 80, paddingBottom: 96, maxWidth: 560 }}>
          <div className="panel" style={{ textAlign: 'center', padding: 48 }}>
            <span className="lockic">◎</span>
            <h1 style={{ fontSize: 26, letterSpacing: '-.02em', margin: '24px 0 12px' }}>Sign in to see your courses</h1>
            <p style={{ color: 'var(--secondary)', margin: '0 auto 28px', maxWidth: '38ch' }}>
              Your library, progress and notes are tied to the account you sign in with.
            </p>
            <Link href="/login?next=/dashboard" className="btn btn-p btn-lg">Sign in</Link>
          </div>
        </section>
      )}

      <section className="wrap" style={{ paddingTop: 48, paddingBottom: 40, display: user ? 'block' : 'none' }}>
        <p className="eyebrow">My learning</p>
        <h1 style={{ fontSize: 44, letterSpacing: '-.022em', marginBottom: 16 }}>
          {mine.length ? 'Pick up where you stopped' : 'Your library is empty'}
        </h1>
        <p style={{ fontSize: 19, color: 'var(--secondary)', maxWidth: '58ch' }}>
          Signed in as {user ? user.email : ''} — purchases, progress and notes are stored on this device.
        </p>
      </section>

      <section className="wrap" style={{ paddingBottom: 64, display: user ? 'block' : 'none' }}>
        {mine.length === 0 ? (
          <div className="emptyst">
            <h3 style={{ fontSize: 21, marginBottom: 12 }}>Nothing enrolled yet</h3>
            <p style={{ color: 'var(--muted)', maxWidth: '46ch', margin: '0 auto 24px' }}>
              Start with the free Placement Program, or browse the flagship masterclasses.
            </p>
            <div className="btn-row" style={{ justifyContent: 'center' }}>
              <Link href="/course/placement" className="btn btn-p">Start free program</Link>
              <Link href="/courses" className="btn btn-s">Browse courses</Link>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {mine.map(c => {
              const p = progress[c.id] || { done: {}, last: 0 };
              const total = totalLessons(c);
              const doneCount = Object.keys(p.done || {}).length;
              const pct = total ? Math.round((doneCount / total) * 100) : 0;
              const lessons = flatLessons(c);
              const nextLesson = lessons[Math.min(p.last || 0, lessons.length - 1)];
              const noteCount = (notes[c.id] || []).length;
              return (
                <div className="job" key={c.id} style={{ alignItems: 'stretch' }}>
                  <div style={{ width: 180, flex: 'none', borderRadius: 10, overflow: 'hidden' }}>
                    <Thumb title={c.title} small />
                  </div>
                  <div className="tx" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div className="t">{c.title}</div>
                    <div className="m">
                      {pct === 100 ? 'Completed' : 'Next: ' + (nextLesson ? nextLesson.lesson.title : 'Lesson 1')}
                      {noteCount > 0 && ' · ' + noteCount + ' note' + (noteCount > 1 ? 's' : '')}
                    </div>
                    <div style={{ marginTop: 12, maxWidth: 420 }}>
                      <div className="pbar"><i style={{ width: pct + '%' }} /></div>
                      <div className="tnum" style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6 }}>
                        {pct}% · {doneCount} of {total} lessons
                      </div>
                    </div>
                  </div>
                  <Link href={'/learn/' + c.id} className="btn btn-p">
                    {pct === 0 ? 'Start' : pct === 100 ? 'Revisit' : 'Resume'}
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* device storage inspector — proves persistence to the client */}
      <section className="wrap" style={{ paddingBottom: 96, display: user ? 'block' : 'none' }}>
        <div className="panel" style={{ background: 'var(--surface)' }}>
          <p className="eyebrow">Device storage</p>
          <h3 style={{ fontSize: 21, marginBottom: 12 }}>What this browser is remembering</h3>
          <p style={{ color: 'var(--secondary)', fontSize: 15, maxWidth: '64ch' }}>
            There is no database behind this build. Theme, enrolments, lesson progress, watch position and notes
            live in this browser&apos;s localStorage under the <code className="mono">tb.</code> prefix. Close the tab,
            reopen it, and everything is still here.
          </p>
          <div className="btn-row" style={{ marginTop: 20 }}>
            <button className="btn btn-s btn-sm" onClick={() => setShowRaw(s => !s)}>
              {showRaw ? 'Hide stored data' : 'Show stored data'}
            </button>
            <button className="btn btn-s btn-sm" onClick={() => { if (confirm('Erase all locally stored progress?')) clearAll(); }}>
              Reset this device
            </button>
          </div>
          {showRaw && <div className="storage" style={{ marginTop: 20 }}>{raw}</div>}
        </div>
      </section>

      <Footer />
    </>
  );
}
