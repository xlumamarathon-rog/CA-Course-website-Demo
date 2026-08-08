'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fmt } from '@/lib/data';
import { useAuth, usePurchases } from '@/lib/store';

export default function MobileBuyBar({ course: c }) {
  const router = useRouter();
  const { isAuthed } = useAuth();
  const { has, purchase } = usePurchases();
  const owned = has(c);
  const free = c.price === 0;

  const go = () => {
    if (!isAuthed) {
      router.push('/login?next=' + encodeURIComponent((free ? '/learn/' : '/checkout/') + c.id));
      return;
    }
    if (free) { purchase(c.id); router.push('/learn/' + c.id); }
    else router.push('/checkout/' + c.id);
  };

  return (
    <div className="mobbuy">
      <div className="mb-in">
        <div>
          {owned ? <span style={{ fontSize: 14, color: 'var(--muted)' }}>You have access</span>
            : free ? <span style={{ fontSize: 21, fontWeight: 600, color: 'var(--success-deep)' }}>Free</span>
            : <div className="price">
                <span className="now" style={{ fontSize: 21 }}>{fmt(c.price)}</span>
                {c.mrp > c.price && <span className="was">{fmt(c.mrp)}</span>}
              </div>}
        </div>
        {owned
          ? <Link href={'/learn/' + c.id} className="btn btn-p">Continue</Link>
          : <button className="btn btn-p" onClick={go}>{free ? 'Start' : 'Enrol now'}</button>}
      </div>
    </div>
  );
}
