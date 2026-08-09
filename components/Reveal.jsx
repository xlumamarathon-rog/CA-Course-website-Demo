'use client';
import { useRef, useEffect, useState } from 'react';

/* Fades content up as it enters the viewport. Fires once, and is a no-op
   for anyone who prefers reduced motion (they see the final state). */
export default function Reveal({ children, delay = 0, as: Tag = 'div', className = '', style, ...rest }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const noMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (noMotion || typeof IntersectionObserver === 'undefined') { setShown(true); return; }
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={'reveal' + (shown ? ' in' : '') + (className ? ' ' + className : '')}
      style={{ ...(style || {}), transitionDelay: delay ? delay + 'ms' : undefined }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
