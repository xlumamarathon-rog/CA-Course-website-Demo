'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Thumb from './Thumb';
import Footer from './Footer';
import { fmt, totalLessons } from '@/lib/data';
import { useAuth, usePurchases } from '@/lib/store';

const CODE = 'COMBO30';

export default function Checkout({ course: c }) {
  const { user } = useAuth();
  const { purchase, has } = usePurchases();
  const [code, setCode] = useState('');
  const [applied, setApplied] = useState(false);
  const [err, setErr] = useState('');
  const [paid, setPaid] = useState(false);
  const [form, setForm] = useState({
    name: user ? user.name : '',
    email: user ? user.email : '',
    mobile: '98765 43210'
  });

  /* Card details arrive pre-filled so the demo can be walked through in one click. */
  const [card, setCard] = useState({
    number: '4242 4242 4242 4242',
    name: user ? user.name.toUpperCase() : 'PRIYA SHARMA',
    expiry: '12 / 28',
    cvv: '123'
  });
  const [method, setMethod] = useState('card');

  /* The signed-in account resolves from device storage a tick after mount,
     so back-fill the form once it arrives (useState only runs its initialiser once). */
  const prefilled = useRef(false);
  useEffect(() => {
    if (!user || prefilled.current) return;
    prefilled.current = true;
    setForm(f => ({ ...f, name: f.name || user.name, email: f.email || user.email }));
    setCard(c => ({ ...c, name: (user.name || '').toUpperCase() }));
  }, [user]);

  const list = c.mrp || c.price;
  const discount = applied ? list - c.price : 0;
  const total = list - discount;
  const base = Math.round(total / 1.18);
  const gst = total - base;

  const apply = () => {
    if (code.trim().toUpperCase() === CODE) { setApplied(true); setErr(''); }
    else { setApplied(false); setErr('That code is not valid on this course.'); }
  };

  const pay = (e) => {
    e.preventDefault();
    purchase(c.id);
    setPaid(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (paid) {
    return (
      <>
        <section className="wrap" style={{ paddingTop: 64, paddingBottom: 96, maxWidth: 720 }}>
          <div className="ok" style={{ fontSize: 16 }}>
            <span style={{ fontWeight: 700 }}>✓</span>
            <span>Payment successful. Your enrolment is saved on this device.</span>
          </div>
          <h1 style={{ fontSize: 40, letterSpacing: '-.025em', marginBottom: 16 }}>You are in.</h1>
          <p style={{ fontSize: 19, color: 'var(--secondary)' }}>
            {c.title} is now in your library, with all {totalLessons(c)} lessons and {c.templates} templates unlocked.
          </p>
          <div className="panel" style={{ marginTop: 32 }}>
            <table className="tb">
              <tbody>
                <tr><td style={{ color: 'var(--muted)' }}>Course</td><td style={{ fontWeight: 600 }}>{c.title}</td></tr>
                <tr><td style={{ color: 'var(--muted)' }}>Amount paid</td><td className="tnum" style={{ fontWeight: 600 }}>{fmt(total)}</td></tr>
                <tr><td style={{ color: 'var(--muted)' }}>Access</td><td>Lifetime, including updates</td></tr>
                <tr><td style={{ color: 'var(--muted)' }}>Invoice</td><td>Sent to {form.email || 'your email'}</td></tr>
              </tbody>
            </table>
          </div>
          <div className="btn-row" style={{ marginTop: 32 }}>
            <Link href={'/learn/' + c.id} className="btn btn-p btn-lg">Start lesson 1</Link>
            <Link href="/dashboard" className="btn btn-s btn-lg">My learning</Link>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  return (
    <>
      <div className="wrap">
        <nav className="crumb">
          <Link href="/courses">Courses</Link><span>›</span>
          <Link href={'/course/' + c.id}>{c.title}</Link><span>›</span>
          <span style={{ color: 'var(--ink)' }}>Checkout</span>
        </nav>
      </div>

      <section className="wrap" style={{ paddingBottom: 96 }}>
        <h1 style={{ fontSize: 40, letterSpacing: '-.025em', marginBottom: 40 }}>Checkout</h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 400px', gap: 48, alignItems: 'start' }} className="detail-grid">
          {/* form */}
          <form onSubmit={pay}>
            <h3 style={{ fontSize: 21, marginBottom: 24 }}>Your details</h3>
            <div className="field-row">
              <div className="field">
                <label>Full name <span className="req">*</span></label>
                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Priya Sharma" />
              </div>
              <div className="field">
                <label>Email <span className="req">*</span></label>
                <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="priya@firm.com" />
                <div className="help">Invoice and access link go here.</div>
              </div>
            </div>
            <div className="field">
              <label>Mobile <span className="req">*</span></label>
              <input required value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} placeholder="98765 43210" />
              <div className="help">Batch reminders only. No marketing calls.</div>
            </div>

            <h3 style={{ fontSize: 21, margin: '48px 0 8px' }}>Payment method</h3>
            <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 20 }}>
              Test card details are filled in for you — nothing is charged.
            </p>

            <div className="pmlist">
              {[['card', 'Card', 'Visa, Mastercard, RuPay'],
                ['upi', 'UPI', 'GPay, PhonePe, Paytm'],
                ['nb', 'Net banking', 'All major banks']].map(([id, label, sub]) => (
                <label key={id} className={'pm' + (method === id ? ' on' : '')}>
                  <input type="radio" name="pm" checked={method === id} onChange={() => setMethod(id)} />
                  <span className="pm-tx"><b>{label}</b><i>{sub}</i></span>
                  {id === 'card' && <span className="pm-brands">VISA · MC · RuPay</span>}
                </label>
              ))}
            </div>

            {method === 'card' && (
              <div className="cardbox">
                <div className="field wide">
                  <label>Card number</label>
                  <input className="mono" value={card.number} onChange={e => setCard({ ...card, number: e.target.value })} />
                  <div className="help">Test card — 4242 4242 4242 4242</div>
                </div>
                <div className="field wide">
                  <label>Name on card</label>
                  <input value={card.name} onChange={e => setCard({ ...card, name: e.target.value })} />
                </div>
                <div className="field-row" style={{ maxWidth: 'none' }}>
                  <div className="field"><label>Expiry</label>
                    <input className="mono" value={card.expiry} onChange={e => setCard({ ...card, expiry: e.target.value })} /></div>
                  <div className="field"><label>CVV</label>
                    <input className="mono" value={card.cvv} onChange={e => setCard({ ...card, cvv: e.target.value })} /></div>
                </div>
              </div>
            )}

            {method === 'upi' && (
              <div className="cardbox">
                <div className="field wide">
                  <label>UPI ID</label>
                  <input className="mono" defaultValue="priya@okhdfcbank" />
                  <div className="help">A collect request would be sent to this ID.</div>
                </div>
              </div>
            )}

            {method === 'nb' && (
              <div className="cardbox">
                <div className="field wide">
                  <label>Bank</label>
                  <select defaultValue="HDFC Bank">
                    {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Mahindra'].map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
              </div>
            )}

            <button className="btn btn-p btn-lg" type="submit" style={{ marginTop: 16 }}>
              Pay {fmt(total)} securely
            </button>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 12 }}>
              Demo checkout — no gateway is connected, no card is charged. Your purchase is recorded on this device so the course unlocks.
            </p>
          </form>

          {/* summary */}
          <aside className="buy-wrap">
            <div className="buy">
              <div className="bt">
                <div style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
                  <div style={{ width: 96, flex: 'none', borderRadius: 8, overflow: 'hidden' }}>
                    <Thumb title={c.title} small />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.35 }}>{c.title}</div>
                    <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>{c.instructor}</div>
                  </div>
                </div>

                <div className="sumrow"><span>List price</span><span className="v">{fmt(list)}</span></div>
                {applied && (
                  <div className="sumrow disc">
                    <span>Coupon {CODE} · 30%</span>
                    <span className="v">− {fmt(discount)}</span>
                  </div>
                )}
                <div className="sumrow" style={{ color: 'var(--muted)', fontSize: 14 }}>
                  <span>Of which GST (18%)</span><span className="v">{fmt(gst)}</span>
                </div>
                <div className="sumrow tot"><span>Total</span><span className="v">{fmt(total)}</span></div>

                {!applied ? (
                  <div style={{ marginTop: 20 }}>
                    <div className="coupon">
                      <div className="field" style={{ margin: 0 }}>
                        <input placeholder="Coupon code" value={code} onChange={e => setCode(e.target.value)} />
                      </div>
                      <button type="button" className="btn btn-s" onClick={apply}>Apply</button>
                    </div>
                    {err && <p style={{ color: 'var(--danger)', fontSize: 13, marginTop: 8 }}>{err}</p>}
                    <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 8 }}>Try <b>{CODE}</b> for 30% off.</p>
                  </div>
                ) : (
                  <div className="ok" style={{ marginTop: 20, marginBottom: 0 }}>
                    <span style={{ fontWeight: 700 }}>✓</span>
                    <span>{CODE} applied — you saved {fmt(discount)}.</span>
                  </div>
                )}
              </div>
              <ul className="incl">
                <li><span className="tk">✓</span><span>Lifetime access</span></li>
                <li><span className="tk">✓</span><span>7-day refund</span></li>
                <li><span className="tk">✓</span><span>Certificate on completion</span></li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <Footer />
    </>
  );
}
