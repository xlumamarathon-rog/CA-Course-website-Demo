'use client';
import Link from 'next/link';
import Footer from '@/components/Footer';
import Accordion from '@/components/Accordion';
import Faq from '@/components/Faq';
import BuyCard from '@/components/BuyCard';
import MobileBuyBar from '@/components/MobileBuyBar';
import Stars from '@/components/Stars';
import { FAQS, TESTIMONIALS, totalLessons, parseDur, fmtLong, fmt } from '@/lib/data';
import { useCourses, useAuth, usePurchases } from '@/lib/store';
import { useSite } from '@/lib/site';
import IntroVideo from '@/components/IntroVideo';

export default function CourseDetail({ id }) {
  const courses = useCourses();
  const { isAuthed, ready: authReady } = useAuth();
  const { site } = useSite();
  const c = courses.get(id);
  const { has, ready: pReady } = usePurchases();
  const gateCurriculum = site.access.requireLoginForCurriculum && authReady && !isAuthed;
  const owned = c ? has(c) : false;
  /* signed in, but this course is not theirs yet */
  const needsPurchase = authReady && pReady && isAuthed && !owned;

  /* The catalogue falls back to the seed courses, so a known course renders
     immediately (server-side too). Only wait when it genuinely isn't resolved. */
  if (!c && !courses.ready) {
    return <div className="wrap" style={{ padding: '96px 40px', color: 'var(--muted)' }}>Loading…</div>;
  }

  if (!c) {
    return (
      <>
        <div className="wrap err">
          <div className="code">404</div>
          <h1 style={{ fontSize: 26, letterSpacing: '-.02em', marginBottom: 16 }}>That course does not exist</h1>
          <p style={{ color: 'var(--secondary)' }}>It may have been unpublished or removed in the admin panel.</p>
          <Link href="/courses" className="btn btn-p" style={{ marginTop: 24 }}>Browse courses</Link>
        </div>
        <Footer />
      </>
    );
  }

  const total = totalLessons(c);
  const seconds = c.sections.reduce(
    (a, s) => a + s.lectures.reduce((b, l) => b + parseDur(l.dur), 0), 0
  );

  return (
    <>
      <div className="wrap">
        <nav className="crumb">
          <Link href="/">Home</Link><span>›</span>
          <Link href="/courses">Courses</Link><span>›</span>
          <span style={{ color: 'var(--ink)' }}>{c.title}</span>
        </nav>
      </div>

      {c.published === false && (
        <div className="wrap" style={{ paddingBottom: 16 }}>
          <div className="ok" style={{ background: '#FFF4E5', color: '#8A5D00', marginBottom: 0 }}>
            <span style={{ fontWeight: 700 }}>!</span>
            <span>This course is a draft — it is hidden from the catalogue until you publish it in the admin panel.</span>
          </div>
        </div>
      )}

      {/* ---------- HEAD + BUY ---------- */}
      <section className="wrap" style={{ paddingBottom: 64 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 380px', gap: 48, alignItems: 'start' }} className="detail-grid">
          <div>
            {c.badge && <span className="pill">{c.badge}</span>}
            <h1 style={{ fontSize: 44, letterSpacing: '-.022em', margin: '16px 0 16px' }}>{c.title}</h1>
            <p style={{ fontSize: 21, color: 'var(--secondary)', maxWidth: '52ch' }}>{c.tag}</p>

            <div className="facts" style={{ border: 'none', paddingTop: 0, gap: 24, fontSize: 15, marginTop: 8 }}>
              <span className="st"><Stars rating={c.rating} /> <b style={{ color: 'var(--ink)' }}>{c.rating}</b></span>
              <span>{Number(c.reviews || 0).toLocaleString('en-IN')} reviews</span>
              <span>{Number(c.learners || 0).toLocaleString('en-IN')} enrolled</span>
              <span>Updated {c.updated}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 32, paddingTop: 32, borderTop: '1px solid var(--border)' }}>
              <span className="av lg ac">{c.initials || (c.instructor || '?').slice(0, 2).toUpperCase()}</span>
              <div>
                <div style={{ fontSize: 17, fontWeight: 600 }}>{c.instructor}</div>
                <div style={{ fontSize: 15, color: 'var(--muted)' }}>{c.exFirm} · {c.level} · {c.lang}</div>
              </div>
            </div>

            {/* introduction video — the one thing a signed-out visitor may watch */}
            {(gateCurriculum || needsPurchase) && (
              <div style={{ marginTop: 40 }}>
                <p className="eyebrow">Course introduction</p>
                <IntroVideo src={c.intro} title={c.title} />
                <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 12 }}>
                  {gateCurriculum
                    ? 'A short preview. The full course opens once you sign in and enrol.'
                    : 'A short preview. Buy the course to unlock all ' + total + ' lessons.'}
                </p>
              </div>
            )}

            {/* outcomes */}
            {(c.outcomes || []).filter(Boolean).length > 0 && (
              <>
                <h2 style={{ fontSize: 28, letterSpacing: '-.02em', margin: '64px 0 24px' }}>What you will be able to do</h2>
                <div className="panel" style={{ background: 'var(--surface)' }}>
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {c.outcomes.filter(Boolean).map((o, i) => (
                      <li key={i} style={{ display: 'flex', gap: 14, padding: '10px 0', fontSize: 17, color: 'var(--secondary)' }}>
                        <span style={{ color: 'var(--success)', fontWeight: 700, flex: 'none' }}>✓</span>
                        <span>{o}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {/* curriculum — locked until the visitor signs in */}
            <h2 style={{ fontSize: 28, letterSpacing: '-.02em', margin: '64px 0 12px' }}>Curriculum</h2>
            <p style={{ color: 'var(--muted)', fontSize: 15 }} className="tnum">
              {c.sections.length} sections · {total} lessons · {fmtLong(seconds)} of video
            </p>
            <div style={{ marginTop: 24 }}>
              {gateCurriculum ? (
                <div className="locked">
                  {site.access.showLockedOutline && c.sections.map((s, i) => (
                    <div className="locked-row" key={i}>
                      <span className="ic">🔒</span>
                      <span className="tl">{s.title}</span>
                      <span className="mt">{s.lectures.length} lessons</span>
                    </div>
                  ))}
                  <div className="locked-cta">
                    <p>
                      Lesson titles and the {total} videos unlock when you sign in. Watch the
                      introduction above to see how the course is taught.
                    </p>
                    <div className="btn-row" style={{ justifyContent: 'center' }}>
                      <Link href={'/login?next=' + encodeURIComponent('/course/' + c.id)} className="btn btn-p">
                        Sign in to see the curriculum
                      </Link>
                      <Link href={'/login?mode=signup&next=' + encodeURIComponent('/course/' + c.id)} className="btn btn-s">
                        Create a free account
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <Accordion sections={c.sections} locked={needsPurchase} />

                  {needsPurchase && (
                    <div className="buyband">
                      <div className="buyband-tx">
                        <b>You do not own this course yet</b>
                        <i>
                          The first lesson is a free preview. Buying unlocks the remaining{' '}
                          {total - 1} lessons, {c.templates} templates and the certificate.
                        </i>
                      </div>
                      <div className="buyband-buy">
                        {c.price === 0 ? (
                          <span className="free" style={{ fontSize: 21, fontWeight: 600, color: 'var(--success-deep)' }}>Free</span>
                        ) : (
                          <div className="price">
                            <span className="now">{fmt(c.price)}</span>
                            {c.mrp > c.price && <span className="was">{fmt(c.mrp)}</span>}
                          </div>
                        )}
                        <Link href={c.price === 0 ? '/learn/' + c.id : '/checkout/' + c.id} className="btn btn-p">
                          {c.price === 0 ? 'Start free' : 'Buy this course'}
                        </Link>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* who for */}
            {(c.forWhom || []).filter(Boolean).length > 0 && (
              <>
                <h2 style={{ fontSize: 28, letterSpacing: '-.02em', margin: '64px 0 24px' }}>Who this is for</h2>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                  {c.forWhom.filter(Boolean).map((w, i) => (
                    <li key={i} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)', fontSize: 17, color: 'var(--secondary)' }}>{w}</li>
                  ))}
                </ul>
              </>
            )}

            {/* faq */}
            <h2 style={{ fontSize: 28, letterSpacing: '-.02em', margin: '64px 0 24px' }}>Questions people ask</h2>
            <Faq items={FAQS} />
          </div>

          {/* sticky buy */}
          <aside className="buy-wrap">
            <BuyCard course={c} />
          </aside>
        </div>
      </section>

      {/* ---------- PROOF ---------- */}
      <section className="sec tint">
        <div className="wrap">
          <div className="sec-head">
            <p className="eyebrow">From learners on this course</p>
            <h2>What changed after they finished</h2>
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
        </div>
      </section>

      <Footer />
      <MobileBuyBar course={c} />
    </>
  );
}
