'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useStored } from '@/lib/storage';
import Countdown, { nextBatchDate, batchLabel } from './Countdown';

/* One offer surface, in the page furniture — not a modal over the content.
   Dismissible, and the dismissal is remembered on the device. */
export default function AnnouncementBar() {
  const [hidden, setHidden] = useStored('announcementHidden', false);
  const [copied, setCopied] = useState(false);
  const label = batchLabel(nextBatchDate());

  useEffect(() => {
    document.documentElement.classList.toggle('ann-off', !!hidden);
  }, [hidden]);

  const copy = async () => {
    try { await navigator.clipboard.writeText('COMBO30'); setCopied(true); setTimeout(() => setCopied(false), 1800); }
    catch (e) { setCopied(false); }
  };

  if (hidden) return null;

  return (
    <div className="ann">
      <div className="ann-in">
        <span className="ann-dot" aria-hidden="true" />
        <span className="ann-msg">
          <b>30% off all combos</b>
          <span className="ann-sep">·</span>
          <span className="ann-quiet">next batch starts {label} in</span>
          <Countdown compact />
        </span>
        <button className="ann-code" onClick={copy} title="Copy code">
          {copied ? 'Copied ✓' : 'COMBO30'}
        </button>
        <Link href="/courses" className="ann-cta">Browse courses →</Link>
        <button className="ann-x" onClick={() => setHidden(true)} aria-label="Dismiss announcement">✕</button>
      </div>
    </div>
  );
}
