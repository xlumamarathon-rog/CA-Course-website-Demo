'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/store';
import { ADMIN_ACCOUNTS } from '@/lib/accounts';

/* Staff sign-in. Kept off the public /login page, which advertises
   learner accounts only — the admin credential appears here and nowhere else. */
export default function AdminLoginPage() {
  const router = useRouter();
  const { user, isAdmin, login, logout } = useAuth();

  const [f, setF] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [filled, setFilled] = useState(null);

  const fill = (acc) => {
    setF({ email: acc.email, password: acc.password });
    setErr('');
    setFilled(acc.email);
  };

  const submit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setErr('');
    try {
      const res = login(f.email, f.password);
      if (res.error) { setErr(res.error); return; }
      if (res.user.role !== 'admin') {
        setErr('That is a learner account. Staff credentials are required here.');
        return;
      }
      router.push('/admin');
    } catch (ex) {
      setErr('Sign-in failed: ' + (ex && ex.message ? ex.message : String(ex)));
    }
  };

  return (
    <>
      <section className="wrap" style={{ paddingTop: 56, paddingBottom: 96, maxWidth: 520 }}>
        <p className="eyebrow">Staff access</p>
        <h1 style={{ fontSize: 34, letterSpacing: '-.02em', marginBottom: 12 }}>Administrator sign-in</h1>
        <p style={{ color: 'var(--secondary)', marginBottom: 32 }}>
          Manage courses, upload lesson video, edit the homepage and inspect the database.
          Learners sign in at <Link href="/login" style={{ textDecoration: 'underline' }}>/login</Link>.
        </p>

        {user && (
          <div className="ok" style={{ marginBottom: 24 }}>
            <span style={{ fontWeight: 700 }}>{isAdmin ? '✓' : '!'}</span>
            <span>
              Signed in as {user.name} ({user.role}).{' '}
              {isAdmin
                ? <Link href="/admin" style={{ textDecoration: 'underline' }}>Open the admin panel</Link>
                : <button className="btn btn-t" style={{ fontSize: 14 }} onClick={logout}>Sign out to switch</button>}
            </span>
          </div>
        )}

        <form onSubmit={submit}>
          <div className="field">
            <label>Work email <span className="req">*</span></label>
            <input required type="email" value={f.email}
              onChange={e => { setF({ ...f, email: e.target.value }); setFilled(null); }}
              placeholder="you@ledgerline.in" />
          </div>
          <div className="field">
            <label>Password <span className="req">*</span></label>
            <input required type="password" value={f.password}
              onChange={e => { setF({ ...f, password: e.target.value }); setFilled(null); }}
              placeholder="••••••••" />
          </div>

          {err && <p style={{ color: 'var(--danger)', fontSize: 14, marginTop: -8, marginBottom: 20 }}>{err}</p>}

          <button className="btn btn-p btn-lg btn-full" type="submit" onClick={submit}>
            Sign in to the admin panel
          </button>
        </form>

        <div className="creds">
          <div className="creds-h">
            <span>Staff credential</span>
            <span className="creds-hint">Demo only</span>
          </div>
          {ADMIN_ACCOUNTS.map(a => (
            <button type="button" key={a.email} className={'cred' + (filled === a.email ? ' on' : '')}
              onClick={() => fill(a)}>
              <span className="av ac">{a.name.split(' ').map(x => x[0]).join('').slice(0, 2)}</span>
              <span className="cred-tx">
                <span className="cred-top">
                  <b>{a.label}</b>
                  <span className="tagm">Admin</span>
                </span>
                <span className="cred-mail mono">{a.email} · {a.password}</span>
                <span className="cred-blurb">{a.blurb}</span>
              </span>
              <span className="cred-act">{filled === a.email ? 'Filled ✓' : 'Use'}</span>
            </button>
          ))}
          <p className="creds-foot">
            Shown here because this is a demo. In production this page would carry no credentials at
            all, and the role check would live on the server rather than in the browser.
          </p>
        </div>
      </section>
      <Footer />
    </>
  );
}
