'use client';
import Link from 'next/link';
import CourseCard from '@/components/CourseCard';
import Footer from '@/components/Footer';
import { HIRERS, ALUMNI, TESTIMONIALS, EXPERTS, COMBOS, fmt } from '@/lib/data';
import { useCourses } from '@/lib/store';

export default function Home() {
  const courses = useCourses();
  const live = courses.published;
  const featured = live.filter(c => c.cat === 'flagship').slice(0, 4);
  const others = live.filter(c => c.cat !== 'flagship').slice(0, 2);

  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className="wrap hero-h">
        <div className="split">
          <div>
            <p className="eyebrow">Practical finance training</p>
            <h1>Learn the work,<br />not the theory.</h1>
            <p className="lede">
              Masterclasses built from real engagement files by CAs who worked at KPMG, Deloitte and EY —
              so you walk into the job already knowing what week one looks like.
            </p>
            <div className="btn-row" style={{ marginTop: 32 }}>
              <Link href="/courses" className="btn btn-p btn-lg">Browse masterclasses</Link>
              <Link href="/course/placement" className="btn btn-s btn-lg">Start free program</Link>
            </div>
            <div className="stats" style={{ marginTop: 64, paddingTop: 32, borderTop: '1px solid var(--border)' }}>
              <div className="stat"><div className="n">80,000+</div><div className="l">Learners trained</div></div>
              <div className="stat"><div className="n">20,000+</div><div className="l">Placements supported</div></div>
              <div className="stat"><div className="n">4.8</div><div className="l">Average rating</div></div>
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
      </section>

      {/* ---------- HIRERS ---------- */}
      <section className="sec-sm tint">
        <div className="wrap">
          <p className="eyebrow" style={{ textAlign: 'center' }}>Our learners work at</p>
          <div className="logos" style={{ marginTop: 32 }}>
            {HIRERS.map(h => <span key={h}>{h}</span>)}
          </div>
        </div>
      </section>

      {/* ---------- FLAGSHIP ---------- */}
      <section className="sec wrap">
        <div className="sec-head">
          <p className="eyebrow">Flagship</p>
          <h2>The masterclasses people get hired from</h2>
          <p>Every course ships with the actual templates, a reviewed capstone, and lifetime access.</p>
        </div>
        <div className="g4">
          {featured.map(c => <CourseCard key={c.id} course={c} />)}
        </div>
        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <Link href="/courses" className="btn btn-s">View all courses</Link>
        </div>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section className="sec band">
        <div className="wrap">
          <div className="sec-head">
            <p className="eyebrow">How it works</p>
            <h2>Four steps, no fluff</h2>
          </div>
          <div className="g4">
            {[
              ['01', 'Pick the domain', 'Audit, tax, deals or FP&A. The free Decide Your Domain session helps if you are unsure.'],
              ['02', 'Do the actual work', 'Recorded sessions built around real files. You produce the deliverable, not notes.'],
              ['03', 'Get reviewed', 'Submit the capstone. An instructor marks it against the standard a manager would apply.'],
              ['04', 'Get placed', 'Resume review, mock interviews and the job board — free, forever.']
            ].map(([n, t, d]) => (
              <div className="panel" key={n}>
                <p className="eyebrow" style={{ color: 'var(--ac-dark)' }}>{n}</p>
                <h4 style={{ fontSize: 19, marginBottom: 12 }}>{t}</h4>
                <p style={{ fontSize: 15, margin: 0 }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- MORE COURSES ---------- */}
      <section className="sec wrap">
        <div className="sec-head">
          <p className="eyebrow">Tools & free programs</p>
          <h2>Start without spending anything</h2>
        </div>
        <div className="g4">
          {others.map(c => <CourseCard key={c.id} course={c} />)}
          {COMBOS.slice(0, 2).map(k => (
            <Link href="/courses" className="cc" key={k.id}>
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
          ))}
        </div>
      </section>

      {/* ---------- PLACEMENTS ---------- */}
      <section className="sec tint">
        <div className="wrap">
          <div className="sec-head">
            <p className="eyebrow">Placements</p>
            <h2>Real people, real offers</h2>
            <p>A sample of learners placed in the last two quarters, with the course they took.</p>
          </div>
          <div className="g4">
            {ALUMNI.map(a => (
              <div className="alum" key={a.n}>
                <span className="av">{a.i}</span>
                <span className="tx">
                  <span className="nm">{a.n}</span>
                  <span className="rl">{a.f} · {a.c}</span>
                </span>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <Link href="/jobs" className="btn btn-s">See open roles</Link>
          </div>
        </div>
      </section>

      {/* ---------- TESTIMONIALS ---------- */}
      <section className="sec wrap">
        <div className="sec-head">
          <p className="eyebrow">In their words</p>
          <h2>What changed after the course</h2>
        </div>
        <div className="g3">
          {TESTIMONIALS.map(t => (
            <div className="quote" key={t.n}>
              <p>“{t.q}”</p>
              <div className="who">
                <span className="av">{t.i}</span>
                <span>
                  <span className="nm" style={{ display: 'block' }}>{t.n}</span>
                  <span className="rl">{t.r}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- EXPERTS ---------- */}
      <section className="sec wrap">
        <div className="sec-head">
          <p className="eyebrow">Who teaches</p>
          <h2>Practitioners, not presenters</h2>
          <p>Every instructor has done the work at a firm you recognise. Names and credentials sit below the portrait — never over a face.</p>
        </div>
        <div className="g4">
          {EXPERTS.map(e => (
            <div className="cc" style={{ cursor: 'default' }} key={e.n}>
              <div className="thumb" style={{ aspectRatio: '4/5', background: 'var(--surface-2)' }}>
                <span className="av lg" style={{ margin: 'auto' }}>{e.i}</span>
              </div>
              <div className="body" style={{ gap: 6 }}>
                <h4 style={{ minHeight: 'auto', WebkitLineClamp: 1 }}>{e.n}</h4>
                <p className="by" style={{ fontSize: 14 }}>{e.s}</p>
                <div className="facts" style={{ marginTop: 12 }}><span>{e.y}</span><span>{e.f}</span></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="sec band">
        <div className="wrap" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 40, letterSpacing: '-.025em', maxWidth: '24ch', margin: '0 auto 20px' }}>
            The next batch starts on 24 August.
          </h2>
          <p style={{ maxWidth: '52ch', margin: '0 auto 32px', fontSize: 19 }}>
            Enrol once and keep lifetime access, every future update, and placement support at no extra cost.
          </p>
          <div className="btn-row" style={{ justifyContent: 'center' }}>
            <Link href="/courses" className="btn btn-d btn-lg">Browse masterclasses</Link>
            <Link href="/contact" className="btn btn-o btn-lg">Talk to a counsellor</Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
