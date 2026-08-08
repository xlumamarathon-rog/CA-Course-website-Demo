'use client';
import { useState } from 'react';
import { parseDur, fmtTime } from '@/lib/data';

export default function Accordion({ sections, openFirst = true }) {
  const [open, setOpen] = useState(openFirst ? { 0: true } : {});
  const toggle = (i) => setOpen(o => Object.assign({}, o, { [i]: !o[i] }));

  return (
    <div className="acc">
      {sections.map((s, i) => {
        const secs = s.lectures.reduce((a, l) => a + parseDur(l.dur), 0);
        return (
          <div key={i} className={'acc-item' + (open[i] ? ' open' : '')}>
            <button className="acc-h" onClick={() => toggle(i)} aria-expanded={!!open[i]}>
              <span className="cv">▶</span>
              <span className="tl">{s.title}</span>
              <span className="mt">{s.lectures.length} lectures · {fmtTime(secs)}</span>
            </button>
            <div className="acc-b">
              {s.lectures.map((l, j) => (
                <div className="lec" key={j}>
                  <span className="ic">{l.type === 'file' ? '⤓' : l.type === 'quiz' ? '✎' : '▶'}</span>
                  <span className="tl">{l.title}</span>
                  {i === 0 && j === 0 && <span className="prev">Free preview</span>}
                  <span className="dur">{l.dur}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
