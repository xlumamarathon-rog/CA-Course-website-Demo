'use client';
import { useState } from 'react';
import Footer from '@/components/Footer';

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [f, setF] = useState({ name: '', email: '', mobile: '', topic: 'Course guidance', msg: '' });

  return (
    <>
      <section className="wrap" style={{ paddingTop: 48, paddingBottom: 64 }}>
        <div className="split" style={{ alignItems: 'start' }}>
          <div>
            <p className="eyebrow">Contact</p>
            <h1 style={{ fontSize: 44, letterSpacing: '-.022em', marginBottom: 16 }}>Talk to a counsellor</h1>
            <p style={{ fontSize: 19, color: 'var(--secondary)', maxWidth: '48ch' }}>
              Not sure which domain fits your background? Tell us where you are and we will point you at the
              right starting course — including the free ones.
            </p>

            {sent ? (
              <div className="ok" style={{ marginTop: 40, maxWidth: 440 }}>
                <span style={{ fontWeight: 700 }}>✓</span>
                <span>Thanks {f.name || 'there'} — we will reply within one working day.</span>
              </div>
            ) : (
              <form style={{ marginTop: 40 }} onSubmit={e => { e.preventDefault(); setSent(true); }}>
                <div className="field-row">
                  <div className="field">
                    <label>Full name <span className="req">*</span></label>
                    <input required value={f.name} onChange={e => setF({ ...f, name: e.target.value })} placeholder="Priya Sharma" />
                  </div>
                  <div className="field">
                    <label>Email <span className="req">*</span></label>
                    <input required type="email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} placeholder="priya@firm.com" />
                  </div>
                </div>
                <div className="field">
                  <label>Mobile <span className="req">*</span></label>
                  <input required value={f.mobile} onChange={e => setF({ ...f, mobile: e.target.value })} placeholder="98765 43210" />
                </div>
                <div className="field">
                  <label>What is this about?</label>
                  <select value={f.topic} onChange={e => setF({ ...f, topic: e.target.value })}>
                    {['Course guidance', 'Placement support', 'Corporate / B2B training', 'Refund or billing', 'Become a mentor']
                      .map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Message</label>
                  <textarea rows={4} value={f.msg} onChange={e => setF({ ...f, msg: e.target.value })}
                    placeholder="Where are you in your career right now?" />
                </div>
                <button className="btn btn-p btn-lg" type="submit">Send message</button>
              </form>
            )}
          </div>

          <div>
            <div className="panel" style={{ background: 'var(--surface)' }}>
              <h3 style={{ fontSize: 19, marginBottom: 20 }}>Reach us directly</h3>
              <table className="tb">
                <tbody>
                  <tr><td style={{ color: 'var(--muted)' }}>Email</td><td>connect@thinkingbridge.in</td></tr>
                  <tr><td style={{ color: 'var(--muted)' }}>Phone</td><td className="tnum">9650147313</td></tr>
                  <tr><td style={{ color: 'var(--muted)' }}>Hours</td><td>Mon–Sat, 10am–7pm IST</td></tr>
                  <tr><td style={{ color: 'var(--muted)' }}>Response</td><td>Within 1 working day</td></tr>
                </tbody>
              </table>
            </div>
            <div className="panel" style={{ marginTop: 24 }}>
              <h3 style={{ fontSize: 19, marginBottom: 12 }}>Hiring from us?</h3>
              <p style={{ fontSize: 15, color: 'var(--secondary)', margin: 0 }}>
                Choose “Corporate / B2B training” and include the role. We shortlist from learners who completed
                the relevant capstone.
              </p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
