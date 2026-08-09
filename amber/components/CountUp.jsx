'use client';
import { useRef, useEffect, useState } from 'react';

/* Counts up once, when scrolled into view. Tabular numerals keep the
   layout from shivering while the digits change. */
export default function CountUp({ to, duration = 1400, suffix = '', decimals = 0 }) {
  const ref = useRef(null);
  const [val, setVal] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const noMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (noMotion || typeof IntersectionObserver === 'undefined') { setVal(to); return; }

    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);          // ease-out cubic
        setVal(to * eased);
        if (p < 1) requestAnimationFrame(tick);
        else setVal(to);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.3 });

    io.observe(el);
    return () => io.disconnect();
  }, [to, duration]);

  const shown = decimals
    ? val.toFixed(decimals)
    : Math.round(val).toLocaleString('en-IN');

  return <span ref={ref} className="tnum">{shown}{suffix}</span>;
}
