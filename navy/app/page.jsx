'use client';
import Link from 'next/link';
import CourseCard from '@/components/CourseCard';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';
import CountUp from '@/components/CountUp';
import Marquee from '@/components/Marquee';
import Countdown, { nextBatchDate, batchLabel } from '@/components/Countdown';
import { SkeletonGrid } from '@/components/Skeleton';
import { HIRERS, ALUMNI, TESTIMONIALS, EXPERTS, COMBOS, fmt } from '@/lib/data';
import { useCourses } from '@/lib/store';

export default function Home() {
  const courses = useCourses();
  const live = courses.published;
  const featured = live.filter(c => c.cat === 'flagship').slice(0, 4);
  const others = live.filter(c => c.cat !== 'flagship').slice(0, 2);
  const batch = batchLabel(nextBatchDate());

  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className="wrap hero-h">
        <div className="split">
          <div className="enter">
            <p className="eyebrow">Practical finance training</p>
            <h1>
              Learn the work,<br />
              not the{' '}
              <span className="rotor">
                <span>theory.</span>
                <span>textbook.</span>
                <span>syllabus.</span>
              </span>
            </h1>
            <p className="lede">
              Masterclasses built from real engagement files by CAs who worked at KPMG, Deloitte and EY —
              so you walk into the job already knowing what week one looks like.
            </p>
            <div className="btn-row" style={{ marginTop: 32 }}>
              <Link href="/courses" className="btn btn-p btn-lg">Browse masterclasses</Link>
              <Link href="/course/placement" className="btn btn-s btn-lg">Start free program</Link>
            </div>
            <div className="ribbon" style={{ marginTop: 40, justifyContent: 'flex-start' }}>
              <span><b>✓</b> 7-day refund</span>
              <span><b>✓</b> Lifetime access</span>
              <span><b>✓</b> Placement support included</span>
            </div>
          </div>

          <div className="deck" aria-hidden="true">
            <div className="card-f c1">
              <p className="eyebrow" style={{ marginBottom: 8 }}>Module 2</p>
              <div style={{ fontWeight: 600, letterSpacing: '-.01em' }}>Substantive testing</div>
            </div>
            <div className="card-f c2">
              <p className="eyebrow" style={{ marginBottom: 8 }}>Template</p>
              <div style={{ fontWeight: 600, letterSpacing: '-.01em' }}>Revenue working paper</div>
            </div>
            <div className="card-f c3">
              <p className="eyebrow" style={{ marginBottom: 12 }}>Now playing</p>
              <div style={{ fontSize: 19, fontWeight: 600, letterSpacing: '-.01em', marginBottom: 16 }}>
                Materiality — the number that shapes everything
              </div>
              <div className="mini">
                <div className="pbar"><i style={{ width: '62%' }} /></div>
                <span className="tnum" style={{ color: 'var(--muted)' }}>5:02</span>
              </div>
            </div>
          </div>
        </div>

        {/* animated stats */}
        <Reveal className="stats" style={{ marginTop: 64, paddingTop: 32, borderTop: '1px solid var(--border)' }}>
          <div className="stat"><div className="n"><CountUp to={80000} suffix="+" /></div><div className="l">Learners trained</div></div>
          <div className="stat"><div className="n"><CountUp to={20000} suffix="+" /></div><div className="l">Placements supported</div></div>
          <div className="stat"><div className="n"><CountUp to={4.8} decimals={1} /></div><div className="l">Average rating</div></div>
          <div className="stat"><div className="n"><CountUp to={30} suffix="+" /></div><div className="l">Masterclasses</div></div>
        </Reveal>
      </section>

      {/* ---------- HIRER MARQUEE ---------- */}
      <section className="sec-sm tint">
        <div className="wrap">
          <p className="eyebrow" style={{ textAlign: 'center' }}>Our learners work at</p>
        </div>
        <div style={{ marginTop: 28 }}>
          <Marquee items={HIRERS} />
        </div>
      </section>

      {/* ---------- FLAGSHIP ---------- */}
      <section className="sec wrap">
        <Reveal className="sec-head">
          <p className="eyebrow">Flagship</p>
          <h2>The masterclasses people get hired from</h2>
          <p>Every course ships with the actual templates, a reviewed capstone, and lifetime access.</p>
        </Reveal>

        {!courses.ready ? (
          <SkeletonGrid count={4} className="g4" />
        ) : (
          <div className="g4">
            {featured.map((c, i) => (
              <Reveal key={c.id} delay={i * 70}><CourseCard course={c} /></Reveal>
            ))}
          </div>
        )}

        <Reveal style={{ textAlign: 'center', marginTop: 48 }}>
          <Link href="/courses" className="btn btn-s">View all courses</Link>
        </Reveal>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section className="sec band">
        <div className="wrap">
          <Reveal className="sec-head">
            <p className="eyebrow">How it works</p>
            <h2>Four steps, no fluff</h2>
          </Reveal>
          <div className="g4">
            {[
              ['01', 'Pick the domain', 'Audit, tax, deals or FP&A. The free Decide Your Domain session helps if you are unsure.'],
              ['02', 'Do the actual work', 'Recorded sessions built around real files. You produce the deliverable, not notes.'],
              ['03', 'Get reviewed', 'Submit the capstone. An instructor marks it against the standard a manager would apply.'],
              ['04', 'Get placed', 'Resume review, mock interviews and the job board — free, forever.']
            ].map(([n, t, d], i) => (
              <Reveal key={n} delay={i * 80}>
                <div className="panel">
                  <p className="eyebrow" style={{ color: 'var(--ac-dark)' }}>{n}</p>
                  <h4 style={{ fontSize: 19, marginBottom: 12 }}>{t}</h4>
                  <p style={{ fontSize: 15, margin: 0 }}>{d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- MORE COURSES ---------- */}
      <section className="sec wrap">
        <Reveal className="sec-head">
          <p className="eyebrow">Tools &amp; free programs</p>
          <h2>Start without spending anything</h2>
        </Reveal>

        {!courses.ready ? (
          <SkeletonGrid count={4} className="g4" />
        ) : (
          <div className="g4">
            {others.map((c, i) => (
              <Reveal key={c.id} delay={i * 70}><CourseCard course={c} /></Reveal>
            ))}
            {COMBOS.slice(0, 2).map((k, i) => (
              <Reveal key={k.id} delay={(others.length + i) * 70}>
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
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* ---------- PLACEMENTS ---------- */}
      <section className="sec tint">
        <div className="wrap">
          <Reveal className="sec-head">
            <p className="eyebrow">Placements</p>
            <h2>Real people, real offers</h2>
            <p>A sample of learners placed in the last two quarters, with the course they took.</p>
          </Reveal>
          <div className="g4">
            {ALUMNI.map((a, i) => (
              <Reveal key={a.n} delay={(i % 4) * 60}>
                <div className="alum">
                  <span className="av">{a.i}</span>
                  <span className="tx">
                    <span className="nm">{a.n}</span>
                    <span className="rl">{a.f} · {a.c}</span>
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal style={{ textAlign: 'center', marginTop: 48 }}>
            <Link href="/jobs" className="btn btn-s">See open roles</Link>
          </Reveal>
        </div>
      </section>

      {/* ---------- TESTIMONIALS ---------- */}
      <section className="sec wrap">
        <Reveal className="sec-head">
          <p className="eyebrow">In their words</p>
          <h2>What changed after the course</h2>
        </Reveal>
        <div className="g3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.n} delay={i * 90}>
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
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- EXPERTS ---------- */}
      <section className="sec wrap">
        <Reveal className="sec-head">
          <p className="eyebrow">Who teaches</p>
          <h2>Practitioners, not presenters</h2>
          <p>Every instructor has done the work at a firm you recognise. Names and credentials sit below the portrait — never over a face.</p>
        </Reveal>
        <div className="g4">
          {EXPERTS.map((e, i) => (
            <Reveal key={e.n} delay={i * 70}>
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
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- CLOSING CTA WITH COUNTDOWN ---------- */}
      <section className="sec band">
        <div className="wrap" style={{ textAlign: 'center' }}>
          <Reveal>
            <p className="eyebrow" style={{ color: 'var(--ac-dark)' }}>Enrolment closing</p>
            <h2 style={{ fontSize: 40, letterSpacing: '-.025em', maxWidth: '24ch', margin: '0 auto 20px' }}>
              The next batch starts on {batch}.
            </h2>
            <p style={{ maxWidth: '52ch', margin: '0 auto 32px', fontSize: 19 }}>
              Enrol once and keep lifetime access, every future update, and placement support at no extra cost.
            </p>
          </Reveal>

          <Reveal delay={120} style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
            <Countdown />
          </Reveal>

          <Reveal delay={200} className="btn-row" style={{ justifyContent: 'center' }}>
            <Link href="/courses" className="btn btn-d btn-lg">Browse masterclasses</Link>
            <Link href="/contact" className="btn btn-o btn-lg">Talk to a counsellor</Link>
          </Reveal>
        </div>
      </section>

      <Footer />
    </>
  );
}
