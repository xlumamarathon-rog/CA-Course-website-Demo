'use client';
import { useState } from 'react';
import Link from 'next/link';
import AdminShell from '@/components/AdminShell';
import { useConfirm } from '@/components/Confirm';
import { useSite, resolveBatchDate } from '@/lib/site';
import { batchLabel } from '@/components/Countdown';

const TABS = [
  ['announcement', 'Announcement bar'],
  ['hero', 'Hero'],
  ['stats', 'Stats & trust'],
  ['partners', 'Partners'],
  ['sections', 'Sections'],
  ['closing', 'Closing CTA'],
  ['motion', 'Motion']
];

/* small helpers ------------------------------------------------------- */
function Toggle({ on, onChange, label, hint }) {
  return (
    <label className="tgl">
      <input type="checkbox" checked={!!on} onChange={e => onChange(e.target.checked)} />
      <span className="tgl-box" aria-hidden="true"><i /></span>
      <span className="tgl-tx">
        <b>{label}</b>
        {hint && <i>{hint}</i>}
      </span>
    </label>
  );
}

function ListEditor({ items, onChange, placeholder, max = 12 }) {
  return (
    <>
      {items.map((v, i) => (
        <div className="ed-lec-row" key={i} style={{ marginBottom: 10 }}>
          <div className="field" style={{ margin: 0, flex: 1, maxWidth: 'none' }}>
            <input value={v} placeholder={placeholder}
              onChange={e => onChange(items.map((x, j) => (j === i ? e.target.value : x)))} />
          </div>
          <button className="iconbtn" title="Move up" onClick={() => {
            if (i === 0) return;
            const a = items.slice(); const t = a[i]; a[i] = a[i - 1]; a[i - 1] = t; onChange(a);
          }}>↑</button>
          <button className="iconbtn danger" title="Remove"
            onClick={() => onChange(items.filter((_, j) => j !== i))}>✕</button>
        </div>
      ))}
      {items.length < max && (
        <button className="btn btn-t" onClick={() => onChange(items.concat(['']))}>+ Add item</button>
      )}
    </>
  );
}

export default function AdminSitePage() {
  const { site, update, set, reset } = useSite();
  const [tab, setTab] = useState('announcement');
  const [saved, setSaved] = useState('');
  const confirm = useConfirm();

  const note = (m) => { setSaved(m); setTimeout(() => setSaved(''), 2200); };
  const patch = (group, p) => { update(group, p); note('Saved — the homepage is already showing it.'); };
  const replace = (group, v) => { set(group, v); note('Saved — the homepage is already showing it.'); };

  const a = site.announcement, h = site.hero, cl = site.closing, m = site.motion, p = site.partners;
  const target = resolveBatchDate(site);

  return (
    <AdminShell
      title="Homepage"
      action={
        <>
          <Link href="/" className="btn btn-s btn-sm">View homepage</Link>
          <button className="btn btn-s btn-sm" onClick={async () => {
            const ok = await confirm({
              title: 'Reset the homepage?',
              body: 'Every setting on this page goes back to its default.',
              confirmLabel: 'Reset homepage', danger: true
            });
            if (ok) { reset(); note('Reset to defaults.'); }
          }}>Reset</button>
        </>
      }
    >
      {saved && <div className="ok"><span style={{ fontWeight: 700 }}>✓</span><span>{saved}</span></div>}

      <p style={{ color: 'var(--secondary)', fontSize: 15, maxWidth: '72ch', marginTop: 0 }}>
        Everything on this page writes straight to device storage and the public homepage reads it live —
        no publish step. Open the site in a second tab and watch it change as you type.
      </p>

      <div className="tabs" style={{ padding: 0, margin: '24px 0 28px' }}>
        {TABS.map(([id, label]) => (
          <button key={id} className={'tab' + (tab === id ? ' on' : '')} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      {/* ---------------- ANNOUNCEMENT ---------------- */}
      {tab === 'announcement' && (
        <div className="panel" style={{ maxWidth: 720 }}>
          <Toggle on={a.on} label="Show the announcement bar"
            hint="The single offer surface. There is deliberately no entry popup."
            onChange={v => patch('announcement', { on: v })} />

          <div className="field wide" style={{ marginTop: 24 }}>
            <label>Message</label>
            <input value={a.message} onChange={e => patch('announcement', { message: e.target.value })} />
          </div>
          <div className="field-row" style={{ maxWidth: 'none' }}>
            <div className="field"><label>Coupon code</label>
              <input className="mono" value={a.code} onChange={e => patch('announcement', { code: e.target.value })} />
              <div className="help">Click-to-copy on the bar. Leave blank to hide.</div></div>
            <div className="field"><label>CTA label</label>
              <input value={a.ctaLabel} onChange={e => patch('announcement', { ctaLabel: e.target.value })} /></div>
          </div>
          <div className="field wide">
            <label>CTA link</label>
            <input className="mono" value={a.ctaHref} onChange={e => patch('announcement', { ctaHref: e.target.value })} />
          </div>

          <Toggle on={a.showCountdown} label="Show the countdown in the bar"
            onChange={v => patch('announcement', { showCountdown: v })} />

          <h3 style={{ fontSize: 17, margin: '32px 0 6px' }}>Next batch date</h3>
          <p style={{ fontSize: 14, color: 'var(--muted)' }}>
            Drives both countdowns. Currently <b>{batchLabel(target)}</b>.
          </p>
          <div className="field-row" style={{ maxWidth: 'none' }}>
            <div className="field"><label>Mode</label>
              <select value={site.batch.mode} onChange={e => patch('batch', { mode: e.target.value })}>
                <option value="auto">Automatic — the upcoming 24th</option>
                <option value="fixed">Fixed date</option>
              </select>
              <div className="help">Automatic never shows a date in the past.</div></div>
            <div className="field"><label>Fixed date</label>
              <input type="date" value={site.batch.date}
                disabled={site.batch.mode !== 'fixed'}
                onChange={e => patch('batch', { date: e.target.value })} /></div>
          </div>
        </div>
      )}

      {/* ---------------- HERO ---------------- */}
      {tab === 'hero' && (
        <div className="panel" style={{ maxWidth: 720 }}>
          <div className="field wide"><label>Eyebrow</label>
            <input value={h.eyebrow} onChange={e => patch('hero', { eyebrow: e.target.value })} /></div>
          <div className="field wide"><label>Headline — first line</label>
            <input value={h.headline} onChange={e => patch('hero', { headline: e.target.value })} /></div>

          <h3 style={{ fontSize: 17, margin: '28px 0 6px' }}>Rotating words</h3>
          <p style={{ fontSize: 14, color: 'var(--muted)' }}>
            The second line reads “not the …” and cycles these. First three are used; the first is
            also the static fallback when the rotator is switched off.
          </p>
          <ListEditor items={h.rotate} placeholder="theory." max={3}
            onChange={v => replace('hero', Object.assign({}, h, { rotate: v }))} />

          <div className="field wide" style={{ marginTop: 28 }}><label>Lede paragraph</label>
            <textarea rows={3} value={h.lede} onChange={e => patch('hero', { lede: e.target.value })} /></div>

          <div className="field-row" style={{ maxWidth: 'none' }}>
            <div className="field"><label>Primary button</label>
              <input value={h.primaryLabel} onChange={e => patch('hero', { primaryLabel: e.target.value })} /></div>
            <div className="field"><label>Primary link</label>
              <input className="mono" value={h.primaryHref} onChange={e => patch('hero', { primaryHref: e.target.value })} /></div>
          </div>
          <div className="field-row" style={{ maxWidth: 'none' }}>
            <div className="field"><label>Secondary button</label>
              <input value={h.secondaryLabel} onChange={e => patch('hero', { secondaryLabel: e.target.value })} /></div>
            <div className="field"><label>Secondary link</label>
              <input className="mono" value={h.secondaryHref} onChange={e => patch('hero', { secondaryHref: e.target.value })} /></div>
          </div>
        </div>
      )}

      {/* ---------------- STATS & RIBBON ---------------- */}
      {tab === 'stats' && (
        <div className="ed-grid">
          <div className="panel">
            <h3 style={{ fontSize: 17, marginBottom: 6 }}>Stat counters</h3>
            <p style={{ fontSize: 14, color: 'var(--muted)' }}>These animate up when scrolled into view.</p>
            {site.stats.map((st, i) => (
              <div className="statrow" key={i}>
                <div className="field" style={{ margin: 0, width: 110 }}>
                  <input type="number" step="0.1" value={st.value} aria-label="Value"
                    onChange={e => replace('stats', site.stats.map((x, j) => j === i ? { ...x, value: e.target.value } : x))} />
                </div>
                <div className="field" style={{ margin: 0, width: 64 }}>
                  <input value={st.suffix} placeholder="+" aria-label="Suffix"
                    onChange={e => replace('stats', site.stats.map((x, j) => j === i ? { ...x, suffix: e.target.value } : x))} />
                </div>
                <div className="field" style={{ margin: 0, width: 74 }}>
                  <select value={st.decimals} aria-label="Decimals"
                    onChange={e => replace('stats', site.stats.map((x, j) => j === i ? { ...x, decimals: Number(e.target.value) } : x))}>
                    <option value={0}>0 dp</option><option value={1}>1 dp</option>
                  </select>
                </div>
                <div className="field" style={{ margin: 0, flex: 1, maxWidth: 'none' }}>
                  <input value={st.label} placeholder="Label"
                    onChange={e => replace('stats', site.stats.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} />
                </div>
                <button className="iconbtn danger" title="Remove"
                  onClick={() => replace('stats', site.stats.filter((_, j) => j !== i))}>✕</button>
              </div>
            ))}
            {site.stats.length < 4 && (
              <button className="btn btn-t" onClick={() => replace('stats',
                site.stats.concat([{ value: 0, suffix: '+', decimals: 0, label: 'New stat' }]))}>
                + Add stat
              </button>
            )}
          </div>

          <aside className="ed-side">
            <div className="panel">
              <h3 style={{ fontSize: 17, marginBottom: 6 }}>Trust ribbon</h3>
              <p style={{ fontSize: 14, color: 'var(--muted)' }}>Shown under the hero buttons.</p>
              <ListEditor items={site.ribbon} placeholder="7-day refund" max={4}
                onChange={v => replace('ribbon', v)} />
            </div>
          </aside>
        </div>
      )}

      {/* ---------------- PARTNERS ---------------- */}
      {tab === 'partners' && (
        <div className="panel" style={{ maxWidth: 720 }}>
          <Toggle on={p.on} label="Show the hiring-partner ribbon"
            onChange={v => patch('partners', { on: v })} />
          <div className="field" style={{ marginTop: 24, maxWidth: 260 }}>
            <label>Scroll duration — {p.speed}s per loop</label>
            <input type="range" min="15" max="90" value={p.speed}
              onChange={e => patch('partners', { speed: Number(e.target.value) })} />
            <div className="help">Higher is slower. The ribbon pauses on hover.</div>
          </div>
          <h3 style={{ fontSize: 17, margin: '28px 0 6px' }}>Partner names</h3>
          <p style={{ fontSize: 14, color: 'var(--muted)' }}>{p.items.length} shown, duplicated for a seamless loop.</p>
          <ListEditor items={p.items} placeholder="Deloitte" max={20}
            onChange={v => patch('partners', { items: v })} />
        </div>
      )}

      {/* ---------------- SECTIONS ---------------- */}
      {tab === 'sections' && (
        <div className="panel" style={{ maxWidth: 720 }}>
          <h3 style={{ fontSize: 17, marginBottom: 6 }}>Homepage sections</h3>
          <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 20 }}>
            Switch a section off to drop it from the page entirely.
          </p>
          {[
            ['stats', 'Stat counters'],
            ['partners', 'Hiring partners'],
            ['flagship', 'Flagship courses'],
            ['howItWorks', 'How it works'],
            ['freeAndTools', 'Free courses & combos'],
            ['placements', 'Placements'],
            ['testimonials', 'Testimonials'],
            ['experts', 'Instructors'],
            ['closingCta', 'Closing CTA']
          ].map(([k, label]) => (
            <Toggle key={k} on={site.sections[k]} label={label}
              onChange={v => patch('sections', { [k]: v })} />
          ))}
        </div>
      )}

      {/* ---------------- CLOSING ---------------- */}
      {tab === 'closing' && (
        <div className="panel" style={{ maxWidth: 720 }}>
          <div className="field wide"><label>Eyebrow</label>
            <input value={cl.eyebrow} onChange={e => patch('closing', { eyebrow: e.target.value })} /></div>
          <div className="field wide"><label>Body</label>
            <textarea rows={3} value={cl.body} onChange={e => patch('closing', { body: e.target.value })} /></div>
          <div className="field-row" style={{ maxWidth: 'none' }}>
            <div className="field"><label>Primary button</label>
              <input value={cl.primaryLabel} onChange={e => patch('closing', { primaryLabel: e.target.value })} /></div>
            <div className="field"><label>Secondary button</label>
              <input value={cl.secondaryLabel} onChange={e => patch('closing', { secondaryLabel: e.target.value })} /></div>
          </div>
          <Toggle on={cl.showCountdown} label="Show the countdown block"
            hint={'Counts down to ' + batchLabel(target) + ', set on the Announcement tab.'}
            onChange={v => patch('closing', { showCountdown: v })} />
          <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 20, marginBottom: 0 }}>
            The heading reads “The next batch starts on {batchLabel(target)}.” and follows the batch date.
          </p>
        </div>
      )}

      {/* ---------------- MOTION ---------------- */}
      {tab === 'motion' && (
        <div className="panel" style={{ maxWidth: 720 }}>
          <h3 style={{ fontSize: 17, marginBottom: 6 }}>Animation</h3>
          <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 20 }}>
            Every animation is already disabled automatically for visitors whose system asks for
            reduced motion. These switches turn them off for everyone.
          </p>
          <Toggle on={m.reveals} label="Scroll reveals"
            hint="Sections fade and rise as they enter the viewport."
            onChange={v => patch('motion', { reveals: v })} />
          <Toggle on={m.counters} label="Animated stat counters"
            hint="Off shows the final numbers immediately."
            onChange={v => patch('motion', { counters: v })} />
          <Toggle on={m.marquee} label="Scrolling partner ribbon"
            hint="Off renders a static, centred logo row."
            onChange={v => patch('motion', { marquee: v })} />
          <Toggle on={m.rotator} label="Rotating headline word"
            hint="Off pins the first word in the list."
            onChange={v => patch('motion', { rotator: v })} />
        </div>
      )}
    </AdminShell>
  );
}
