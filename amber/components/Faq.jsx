'use client';
import { useState } from 'react';

export default function Faq({ items }) {
  const [open, setOpen] = useState({});
  return (
    <div className="acc">
      {items.map((f, i) => (
        <div key={i} className={'acc-item' + (open[i] ? ' open' : '')}>
          <button className="acc-h" onClick={() => setOpen(o => Object.assign({}, o, { [i]: !o[i] }))} aria-expanded={!!open[i]}>
            <span className="cv">▶</span>
            <span className="tl">{f.q}</span>
          </button>
          <div className="acc-b">
            <p style={{ padding: '4px 24px 16px', margin: 0, color: 'var(--secondary)', fontSize: 16, maxWidth: '72ch' }}>{f.a}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
