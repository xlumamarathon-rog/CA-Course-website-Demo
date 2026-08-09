'use client';
import Link from 'next/link';
import CourseCard from '@/components/CourseCard';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';
import CountUp from '@/components/CountUp';
import Marquee from '@/components/Marquee';
import Countdown, { batchLabel } from '@/components/Countdown';
import { SkeletonGrid } from '@/components/Skeleton';
import { ALUMNI, TESTIMONIALS, EXPERTS, COMBOS, fmt } from '@/lib/data';
import { useCourses } from '@/lib/store';
import { useSite, resolveBatchDate } from '@/lib/site';

export default function Home() {
  const courses = useCourses();
  const { site } = useSite();
  const { hero, ribbon, stats, partners, sections, closing, motion } = site;
  const live = courses.published;
  const featured = live.filter(c => c.cat === 'flagship').slice(0, 4);
  const others = live.filter(c => c.cat !== 'flagship').slice(0, 2);
  const target = resolveBatchDate(site);
  const batch = batchLabel(target);

  /* When a motion setting is off, Reveal is bypassed entirely. */
  const R = motion.reveals ? Reveal : (({ children, className, style }) =>
    <div className={className} style={style}>{children}</div>);

  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className="wrap hero-h">
        <div className="split">
          <div className="enter">
            <p className="eyebrow">{hero.eyebrow}</p>
            <h1>
              {hero.headline}<br />
              not the{' '}
              {motion.rotator ? (
                <span className="rotor">
                  {hero.rotate.slice(0, 3).map(w => <span key={w}>{w}</span>)}
                </span>
              ) : (
                <span className="rotor-static">{hero.rotate[0]}</span>
              )}
            </h1>
            <p className="lede">{hero.lede}</p>
            <div className="btn-row" style={{ marginTop: 32 }}>
              <Link href={hero.primaryHref} className="btn btn-p btn-lg">{hero.primaryLabel}</Link>
              <Link href={hero.secondaryHref} className="btn btn-s btn-lg">{hero.secondaryLabel}</Link>
            </div>
            {ribbon.length > 0 && (
              <div className="ribbon" style={{ marginTop: 40, justifyContent: 'flex-start' }}>
                {ribbon.map(r => <span key={r}><b>✓</b> {r}</span>)}
              </div>
            )}
          </div>

          {/* A slice of the actual product, rather than a decorative box. */}
          <div className="showcase" aria-hidden="true">
            <div className="showcase-card">
              <div className="sc-top">
                <span className="sc-dot" /><span className="sc-dot" /><span className="sc-dot" />
                <span className="sc-url">ledgerline.in/learn/audit</span>
              </div>

              <div className="sc-stage">
                <span className="sc-kicker">Lesson 3 of 18</span>
                <span className="sc-title">Materiality — the number that shapes everything</span>
                <span className="sc-play"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg></span>
              </div>

              <div className="sc-bar">
                <div className="pbar"><i style={{ width: '62%' }} /></div>
                <span className="tnum">5:02 / 8:05</span>
              </div>

              <ul className="sc-list">
                <li className="done"><span className="tick">✓</span>How an audit actually gets staffed and run<em>6:12</em></li>
                <li className="done"><span className="tick">✓</span>Reading a trial balance like an auditor<em>9:40</em></li>
                <li className="now"><span className="tick">▶</span>Materiality — the number that shapes everything<em>8:05</em></li>
                <li><span className="tick" />Risk assessment: the memo template<em>11:20</em></li>
              </ul>
            </div>

            <div className="sc-chip sc-chip-a">
              <b>12 templates</b><i>Yours to keep</i>
            </div>
            <div className="sc-chip sc-chip-b">
              <b>Capstone reviewed</b><i>By a Big 4 manager</i>
            </div>
          </div>
        </div>

        {/* animated stats */}
        {sections.stats && (
          <R className="stats" style={{ marginTop: 64, paddingTop: 32, borderTop: '1px solid var(--border)' }}>
            {stats.map(st => (
              <div className="stat" key={st.label}>
                <div className="n">
                  {motion.counters
                    ? <CountUp to={Number(st.value) || 0} suffix={st.suffix} decimals={st.decimals} />
                    : <span className="tnum">
                        {(Number(st.value) || 0).toLocaleString('en-IN', { minimumFractionDigits: st.decimals || 0 })}{st.suffix}
                      </span>}
                </div>
                <div className="l">{st.label}</div>
              </div>
            ))}
          </R>
        )}
      </section>

      {/* ---------- HIRER MARQUEE ---------- */}
      {sections.partners && partners.on && partners.items.length > 0 && (
        <section className="sec-sm tint">
          <div className="wrap">
            <p className="eyebrow" style={{ textAlign: 'center' }}>Our learners work at</p>
          </div>
          <div style={{ marginTop: 28 }}>
            {motion.marquee
              ? <Marquee items={partners.items} speed={partners.speed} />
              : <div className="wrap"><div className="logos">{partners.items.map(i => <span key={i}>{i}</span>)}</div></div>}
          </div>
        </section>
      )}

      {/* ---------- FLAGSHIP ---------- */}
      {sections.flagship && (
      <section className="sec wrap">
        <R className="sec-head">
          <p className="eyebrow">Flagship</p>
          <h2>The masterclasses people get hired from</h2>
          <p>Every course ships with the actual templates, a reviewed capstone, and lifetime access.</p>
        </R>

        {!courses.ready ? (
          <SkeletonGrid count={4} className="g4" />
        ) : (
          <div className="g4">
            {featured.map((c, i) => (
              <R key={c.id} delay={i * 70}><CourseCard course={c} /></R>
            ))}
          </div>
        )}

        <R style={{ textAlign: 'center', marginTop: 48 }}>
          <Link href="/courses" className="btn btn-s">View all courses</Link>
        </R>
      </section>
      )}

      {/* ---------- HOW IT WORKS ---------- */}
      {sections.howItWorks && (
      <section className="sec band">
        <div className="wrap">
          <R className="sec-head">
            <p className="eyebrow">How it works</p>
            <h2>Four steps, no fluff</h2>
          </R>
          <div className="g4">
            {[
              ['01', 'Pick the domain', 'Audit, tax, deals or FP&A. The free Decide Your Domain session helps if you are unsure.'],
              ['02', 'Do the actual work', 'Recorded sessions built around real files. You produce the deliverable, not notes.'],
              ['03', 'Get reviewed', 'Submit the capstone. An instructor marks it against the standard a manager would apply.'],
              ['04', 'Get placed', 'Resume review, mock interviews and the job board — free, forever.']
            ].map(([n, t, d], i) => (
              <R key={n} delay={i * 80}>
                <div className="panel">
                  <p className="eyebrow" style={{ color: 'var(--ac-dark)' }}>{n}</p>
                  <h4 style={{ fontSize: 19, marginBottom: 12 }}>{t}</h4>
                  <p style={{ fontSize: 15, margin: 0 }}>{d}</p>
                </div>
              </R>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ---------- MORE COURSES ---------- */}
      {sections.freeAndTools && (
      <section className="sec wrap">
        <R className="sec-head">
          <p className="eyebrow">Tools &amp; free programs</p>
          <h2>Start without spending anything</h2>
        </R>

        {!courses.ready ? (
          <SkeletonGrid count={4} className="g4" />
        ) : (
          <div className="g4">
            {others.map((c, i) => (
              <R key={c.id} delay={i * 70}><CourseCard course={c} /></R>
            ))}
            {COMBOS.slice(0, 2).map((k, i) => (
              <R key={k.id} delay={(others.length + i) * 70}>
                <Link href="/courses" className="cc">
                  <div className="thumb"><span className="badge">Combo</span><span className="corner" /><span className="tt">{k.title}</span></div>
                  <div className="body">
                    <h4>{k.title}</h4>
                    <p className="by">{k.items} masterclasses bundled</p>
                    <div className="facts"><span>{k.hours}+ hrs</span><span>Lifetime access</span></div>
                    <div className="foot">
                      <div>
                        <div className="price"><span className="now">{fmt(k.price)}</span><span className="was">{fmt(k.mrp)}</span></div>
                        <span className="save">Save {fmt(k.mrp - k.price)} · 30%</span>
                      </div>
                      <span className="btn btn-sm btn-p">View</span>
                    </div>
                  </div>
                </Link>
              </R>
            ))}
          </div>
        )}
      </section>
      )}

      {/* ---------- PLACEMENTS ---------- */}
      {sections.placements && (
      <section className="sec tint">
        <div className="wrap">
          <R className="sec-head">
            <p className="eyebrow">Placements</p>
            <h2>Real people, real offers</h2>
            <p>A sample of learners placed in the last two quarters, with the course they took.</p>
          </R>
          <div className="g4">
            {ALUMNI.map((a, i) => (
              <R key={a.n} delay={(i % 4) * 60}>
                <div className="alum">
                  <span className="av">{a.i}</span>
                  <span className="tx">
                    <span className="nm">{a.n}</span>
                    <span className="rl">{a.f} · {a.c}</span>
                  </span>
                </div>
              </R>
            ))}
          </div>
          <R style={{ textAlign: 'center', marginTop: 48 }}>
            <Link href="/jobs" className="btn btn-s">See open roles</Link>
          </R>
        </div>
      </section>
      )}

      {/* ---------- TESTIMONIALS ---------- */}
      {sections.testimonials && (
      <section className="sec wrap">
        <R className="sec-head">
          <p className="eyebrow">In their words</p>
          <h2>What changed after the course</h2>
        </R>
        <div className="g3">
          {TESTIMONIALS.map((t, i) => (
            <R key={t.n} delay={i * 90}>
              <div className="quote">
                <p>“{t.q}”</p>
                <div className="who">
                  <span className="av">{t.i}</span>
                  <span>
                    <span className="nm" style={{ display: 'block' }}>{t.n}</span>
                    <span className="rl">{t.r}</span>
                  </span>
                </div>
              </div>
            </R>
          ))}
        </div>
      </section>
      )}

      {/* ---------- EXPERTS ---------- */}
      {sections.experts && (
      <section className="sec wrap">
        <R className="sec-head">
          <p className="eyebrow">Who teaches</p>
          <h2>Practitioners, not presenters</h2>
          <p>Every instructor has done the work at a firm you recognise. Names and credentials sit below the portrait — never over a face.</p>
        </R>
        <div className="g4">
          {EXPERTS.map((e, i) => (
            <R key={e.n} delay={i * 70}>
              <div className="cc" style={{ cursor: 'default' }}>
                <div className="thumb" style={{ aspectRatio: '4/5', background: 'var(--surface-2)' }}>
                  <span className="av lg" style={{ margin: 'auto' }}>{e.i}</span>
                </div>
                <div className="body" style={{ gap: 6 }}>
                  <h4 style={{ minHeight: 'auto', WebkitLineClamp: 1 }}>{e.n}</h4>
                  <p className="by" style={{ fontSize: 14 }}>{e.s}</p>
                  <div className="facts" style={{ marginTop: 12 }}><span>{e.y}</span><span>{e.f}</span></div>
                </div>
              </div>
            </R>
          ))}
        </div>
      </section>
      )}

      {/* ---------- CLOSING CTA WITH COUNTDOWN ---------- */}
      {sections.closingCta && (
      <section className="sec band">
        <div className="wrap" style={{ textAlign: 'center' }}>
          <R>
            <p className="eyebrow" style={{ color: 'var(--ac-dark)' }}>{closing.eyebrow}</p>
            <h2 style={{ fontSize: 40, letterSpacing: '-.025em', maxWidth: '24ch', margin: '0 auto 20px' }}>
              The next batch starts on {batch}.
            </h2>
            <p style={{ maxWidth: '52ch', margin: '0 auto 32px', fontSize: 19 }}>{closing.body}</p>
          </R>

          {closing.showCountdown && (
            <R delay={120} style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
              <Countdown target={target} />
            </R>
          )}

          <R delay={200} className="btn-row" style={{ justifyContent: 'center' }}>
            <Link href="/courses" className="btn btn-d btn-lg">{closing.primaryLabel}</Link>
            <Link href="/contact" className="btn btn-o btn-lg">{closing.secondaryLabel}</Link>
          </R>
        </div>
      </section>
      )}

      <Footer />
    </>
  );
}
