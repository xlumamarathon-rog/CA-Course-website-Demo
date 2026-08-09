import Link from 'next/link';
import Footer from '@/components/Footer';
import { JOBS, HIRERS } from '@/lib/data';

export const metadata = { title: 'Finance jobs — Ledgerline' };

export default function JobsPage() {
  return (
    <>
      <section className="wrap" style={{ paddingTop: 48, paddingBottom: 48 }}>
        <p className="eyebrow">Job board</p>
        <h1 style={{ fontSize: 44, letterSpacing: '-.022em', marginBottom: 16 }}>Roles open to our learners</h1>
        <p style={{ fontSize: 19, color: 'var(--secondary)', maxWidth: '58ch' }}>
          Shared directly by hiring teams. Enrolled learners get a referral note attached to every application.
        </p>
      </section>

      <section className="wrap" style={{ paddingBottom: 96 }}>
        <div style={{ display: 'grid', gap: 16 }}>
          {JOBS.map((j, i) => (
            <div className="job" key={i}>
              <span className="av lg">{j.f.slice(0, 2).toUpperCase()}</span>
              <div className="tx">
                <div className="t">{j.t}</div>
                <div className="m">{j.f} · {j.l} · {j.e} experience</div>
              </div>
              <span className="pill">{j.tag}</span>
              <span className="s">{j.s}</span>
              <Link href="/contact" className="btn btn-p btn-sm">Apply</Link>
            </div>
          ))}
        </div>

        <div className="panel" style={{ marginTop: 48, background: 'var(--surface)' }}>
          <h3 style={{ fontSize: 21, marginBottom: 12 }}>Hiring for a finance team?</h3>
          <p style={{ color: 'var(--secondary)', margin: '0 0 20px', maxWidth: '60ch' }}>
            We have placed learners at {HIRERS.length}+ firms. Send a role and we will shortlist from learners who
            finished the relevant masterclass and capstone.
          </p>
          <Link href="/contact" className="btn btn-p">Post a role</Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
