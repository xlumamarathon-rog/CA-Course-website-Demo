'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useStored } from '@/lib/storage';
import { useSite, resolveBatchDate } from '@/lib/site';
import Countdown, { batchLabel } from './Countdown';

/* One offer surface, in the page furniture — not a modal over the content.
   Content, code and countdown are all editable in Admin -> Homepage. */
export default function AnnouncementBar() {
  const { site } = useSite();
  const a = site.announcement;
  const [hidden, setHidden] = useStored('announcementHidden', false);
  const [copied, setCopied] = useState(false);
  const target = resolveBatchDate(site);
  const label = batchLabel(target);

  const off = !a.on || hidden;
  useEffect(() => {
    document.documentElement.classList.toggle('ann-off', !!off);
  }, [off]);

  const copy = async () => {
    try { await navigator.clipboard.writeText(a.code); setCopied(true); setTimeout(() => setCopied(false), 1800); }
    catch (e) { setCopied(false); }
  };

  if (off) return null;

  return (
    <div className="ann">
      <div className="ann-in">
        <span className="ann-dot" aria-hidden="true" />
        <span className="ann-msg">
          <b>{a.message}</b>
          {a.showCountdown && (
            <>
              <span className="ann-sep">·</span>
              <span className="ann-quiet">next batch starts {label} in</span>
              <Countdown compact target={target} />
            </>
          )}
        </span>
        {a.code && (
          <button className="ann-code" onClick={copy} title="Copy code">
            {copied ? 'Copied ✓' : a.code}
          </button>
        )}
        {a.ctaLabel && (
          <Link href={a.ctaHref || '/courses'} className="ann-cta">{a.ctaLabel} →</Link>
        )}
        <button className="ann-x" onClick={() => setHidden(true)} aria-label="Dismiss announcement">✕</button>
      </div>
    </div>
  );
}
