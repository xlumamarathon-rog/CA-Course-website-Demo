import Link from 'next/link';
import Footer from '@/components/Footer';
import { EXPERTS, HIRERS } from '@/lib/data';

export const metadata = { title: 'About — Thinking Bridge' };

export default function AboutPage() {
  return (
    <>
      <section className="wrap" style={{ paddingTop: 48, paddingBottom: 64 }}>
        <p className="eyebrow">About</p>
        <h1 style={{ fontSize: 48, letterSpacing: '-.025em', marginBottom: 24, maxWidth: '22ch' }}>
          We teach the file, not the syllabus.
        </h1>
        <p style={{ fontSize: 21, color: 'var(--secondary)', maxWidth: '62ch' }}>
          Thinking Bridge started because qualified finance professionals kept arriving at their first job
          able to quote a standard but unable to open a working paper. Every course here is built backwards
          from a real deliverable.
        </p>
      </section>

      <section className="sec-sm tint">
        <div className="wrap">
          <div className="stats" style={{ justifyContent: 'space-between' }}>
            <div className="stat"><div className="n">80,000+</div><div className="l">Learners trained</div></div>
            <div className="stat"><div className="n">20,000+</div><div className="l">Placements supported</div></div>
            <div className="stat"><div className="n">30+</div><div className="l">Masterclasses</div></div>
            <div className="stat"><div className="n">{HIRERS.length}+</div><div className="l">Hiring partners</div></div>
          </div>
        </div>
      </section>

      <section className="sec wrap">
        <div className="sec-head">
          <p className="eyebrow">How we build a course</p>
          <h2>Backwards from the deliverable</h2>
        </div>
        <div className="g3">
          {[
            ['Start with the artefact', 'We take a real working paper, model or report and strip the client data. That artefact becomes the course goal.'],
            ['Record the actual work', 'The instructor produces it on camera, including the parts where judgement is required and the answer is not obvious.'],
            ['Review what you produce', 'You submit your own version. It comes back marked against the standard an engagement manager applies.']
          ].map(([t, d]) => (
            <div className="panel" key={t}>
              <h4 style={{ fontSize: 19, marginBottom: 12 }}>{t}</h4>
              <p style={{ fontSize: 15, color: 'var(--secondary)', margin: 0 }}>{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="sec wrap">
        <div className="sec-head">
          <p className="eyebrow">The team</p>
          <h2>Who teaches here</h2>
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

      <section className="sec band">
        <div className="wrap" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 34, letterSpacing: '-.02em', marginBottom: 20 }}>Start with something free</h2>
          <p style={{ maxWidth: '48ch', margin: '0 auto 32px' }}>
            The Placement Program costs nothing and stays free forever.
          </p>
          <Link href="/course/placement" className="btn btn-d btn-lg">Open the free program</Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
