'use client';
import { useState, useEffect } from 'react';

/* Next batch = the upcoming 24th. Rolls to next month once it passes, so
   the demo never shows a date in the past. */
export function nextBatchDate(now = new Date()) {
  const d = new Date(now.getFullYear(), now.getMonth(), 24, 9, 0, 0);
  if (d.getTime() <= now.getTime()) d.setMonth(d.getMonth() + 1);
  return d;
}

export const batchLabel = (d) =>
  d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' });

export default function Countdown({ compact = false, target: given }) {
  const [target] = useState(() => given || nextBatchDate());
  const [left, setLeft] = useState(null);

  useEffect(() => {
    const tick = () => setLeft(Math.max(0, target.getTime() - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  // render nothing until mounted so server and client markup agree
  if (left === null) return <span className="cd-skel" aria-hidden="true" />;

  const s = Math.floor(left / 1000);
  const parts = [
    { v: Math.floor(s / 86400), l: 'days' },
    { v: Math.floor((s % 86400) / 3600), l: 'hrs' },
    { v: Math.floor((s % 3600) / 60), l: 'min' },
    { v: s % 60, l: 'sec' }
  ];

  if (compact) {
    return (
      <span className="cd-inline tnum">
        {parts.map(p => String(p.v).padStart(2, '0')).join(' : ')}
      </span>
    );
  }

  return (
    <div className="cd" role="timer" aria-label={'Next batch starts ' + batchLabel(target)}>
      {parts.map(p => (
        <div className="cd-u" key={p.l}>
          <span className="cd-n tnum">{String(p.v).padStart(2, '0')}</span>
          <span className="cd-l">{p.l}</span>
        </div>
      ))}
    </div>
  );
}
