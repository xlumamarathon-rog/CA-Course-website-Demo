'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fmt, totalLessons } from '@/lib/data';
import { useProgress } from '@/lib/storage';
import { useAuth, usePurchases } from '@/lib/store';

export default function BuyCard({ course: c }) {
  const router = useRouter();
  const { isAuthed, isAdmin } = useAuth();
  const { has, purchase } = usePurchases();
  const { doneCount, last } = useProgress(c.id);

  const owned = has(c);
  const free = c.price === 0;
  const total = totalLessons(c);
  const pct = total ? Math.round((doneCount / total) * 100) : 0;

  const startFree = () => {
    if (!isAuthed) { router.push('/login?next=' + encodeURIComponent('/learn/' + c.id)); return; }
    purchase(c.id);
    router.push('/learn/' + c.id);
  };

  const buy = () => {
    if (!isAuthed) { router.push('/login?next=' + encodeURIComponent('/checkout/' + c.id)); return; }
    router.push('/checkout/' + c.id);
  };

  return (
    <div className="buy">
      <div className="bt">
        {owned ? (
          <>
            <p className="eyebrow" style={{ marginBottom: 12 }}>
              {isAdmin && !free ? 'Admin preview access' : 'You have access'}
            </p>
            <div style={{ marginBottom: 16 }}>
              <div className="pbar"><i style={{ width: pct + '%' }} /></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--muted)', marginTop: 8 }}>
                <span className="tnum">{pct}% complete</span>
                <span className="tnum">{doneCount} / {total} lessons</span>
              </div>
            </div>
            <Link href={'/learn/' + c.id} className="btn btn-p btn-full btn-lg">
              {doneCount > 0 ? 'Resume lesson ' + (last + 1) : 'Start course'}
            </Link>
          </>
        ) : free ? (
          <>
            <div className="price" style={{ marginBottom: 16 }}><span className="free">Free</span></div>
            <button className="btn btn-p btn-full btn-lg" onClick={startFree}>
              {isAuthed ? 'Start now' : 'Sign in to start'}
            </button>
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: '12px 0 0', textAlign: 'center' }}>
              No card needed. Included with every account.
            </p>
          </>
        ) : (
          <>
            <div className="price">
              <span className="now" style={{ fontSize: 34 }}>{fmt(c.price)}</span>
              {c.mrp > c.price && <span className="was">{fmt(c.mrp)}</span>}
            </div>
            {c.mrp > c.price && <span className="save">Save {fmt(c.mrp - c.price)} with COMBO30</span>}
            <div style={{ marginTop: 20 }}>
              <button className="btn btn-p btn-full btn-lg" onClick={buy}>
                {isAuthed ? 'Enrol now' : 'Sign in to enrol'}
              </button>
            </div>
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: '12px 0 0', textAlign: 'center' }}>
              7-day refund · Inclusive of GST
            </p>
          </>
        )}
      </div>

      <ul className="incl">
        <li><span className="tk">✓</span><span>{c.hours}+ hours of recorded sessions</span></li>
        <li><span className="tk">✓</span><span>{c.templates} working templates you keep</span></li>
        <li><span className="tk">✓</span><span>Reviewed capstone project</span></li>
        <li><span className="tk">✓</span><span>Certificate with verification code</span></li>
        <li><span className="tk">✓</span><span>Lifetime access and all updates</span></li>
        <li><span className="tk">✓</span><span>Placement support at no extra cost</span></li>
      </ul>
    </div>
  );
}
