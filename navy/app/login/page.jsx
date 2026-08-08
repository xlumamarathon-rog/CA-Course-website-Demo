'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/store';
import { DEMO_ACCOUNTS } from '@/lib/accounts';

function LoginInner() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get('next') || '/dashboard';
  const { user, login, signup, logout } = useAuth();

  const [mode, setMode] = useState(search.get('mode') === 'signup' ? 'signup' : 'signin');
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const [filled, setFilled] = useState(null);

  const fill = (acc) => {
    setMode('signin');
    setF({ name: acc.name, email: acc.email, password: acc.password });
    setErr('');
    setFilled(acc.email);
  };

  const submit = (e) => {
    e.preventDefault();
    setErr('');
    if (mode === 'signup') {
      signup({ name: f.name, email: f.email });
      router.push(next);
      return;
    }
    const res = login(f.email, f.password);
    if (res.error) { setErr(res.error); return; }
    router.push(res.user.role === 'admin' && next === '/dashboard' ? '/admin' : next);
  };

  if (user) {
    return (
      <section className="wrap" style={{ paddingTop: 64, paddingBottom: 96, maxWidth: 560 }}>
        <p className="eyebrow">Signed in</p>
        <h1 style={{ fontSize: 34, letterSpacing: '-.02em', marginBottom: 12 }}>Hello {user.name}</h1>
        <p style={{ color: 'var(--secondary)' }}>
          {user.email} · signed in as <b>{user.role === 'admin' ? 'administrator' : 'learner'}</b>
        </p>
        <div className="btn-row" style={{ marginTop: 24 }}>
          <Link href={user.role === 'admin' ? '/admin' : '/dashboard'} className="btn btn-p">
            {user.role === 'admin' ? 'Open admin panel' : 'My learning'}
          </Link>
          <Link href="/courses" className="btn btn-s">Browse courses</Link>
          <button className="btn btn-t" onClick={logout}>Sign out</button>
        </div>
      </section>
    );
  }

  return (
    <section className="wrap" style={{ paddingTop: 56, paddingBottom: 96, maxWidth: 560 }}>
      <p className="eyebrow">{mode === 'signin' ? 'Sign in' : 'Create account'}</p>
      <h1 style={{ fontSize: 34, letterSpacing: '-.02em', marginBottom: 12 }}>
        {mode === 'signin' ? 'Welcome back' : 'Start learning'}
      </h1>
      <p style={{ color: 'var(--secondary)', marginBottom: 32 }}>
        {next !== '/dashboard'
          ? 'Sign in and we will take you straight back to what you were opening.'
          : 'Your courses, progress and notes stay on this device.'}
      </p>

      <form onSubmit={submit}>
        {mode === 'signup' && (
          <div className="field">
            <label>Full name <span className="req">*</span></label>
            <input required value={f.name} onChange={e => setF({ ...f, name: e.target.value })} placeholder="Priya Sharma" />
          </div>
        )}
        <div className="field">
          <label>Email <span className="req">*</span></label>
          <input required type="email" value={f.email}
            onChange={e => { setF({ ...f, email: e.target.value }); setFilled(null); }}
            placeholder="you@firm.com" />
        </div>
        {mode === 'signin' && (
          <div className="field">
            <label>Password <span className="req">*</span></label>
            <input required type="password" value={f.password}
              onChange={e => { setF({ ...f, password: e.target.value }); setFilled(null); }}
              placeholder="••••••••" />
          </div>
        )}

        {err && <p style={{ color: 'var(--danger)', fontSize: 14, marginTop: -8, marginBottom: 20 }}>{err}</p>}

        <button className="btn btn-p btn-lg btn-full" type="submit">
          {mode === 'signin' ? 'Sign in' : 'Create account and continue'}
        </button>
      </form>

      {/* ---------- one-click demo credentials ---------- */}
      <div className="creds">
        <div className="creds-h">
          <span>Demo credentials</span>
          <span className="creds-hint">Click an account to fill the form</span>
        </div>
        {DEMO_ACCOUNTS.map(a => (
          <button type="button" key={a.email} className={'cred' + (filled === a.email ? ' on' : '')} onClick={() => fill(a)}>
            <span className={'av' + (a.role === 'admin' ? ' ac' : '')}>
              {a.name.split(' ').map(x => x[0]).join('').slice(0, 2)}
            </span>
            <span className="cred-tx">
              <span className="cred-top">
                <b>{a.label}</b>
                {a.role === 'admin' && <span className="tagm">Admin</span>}
              </span>
              <span className="cred-mail mono">{a.email} · {a.password}</span>
              <span className="cred-blurb">{a.blurb}</span>
            </span>
            <span className="cred-act">{filled === a.email ? 'Filled ✓' : 'Use'}</span>
          </button>
        ))}
        <p className="creds-foot">
          Nothing is checked against a server — these accounts exist only in this browser.
        </p>
      </div>

      <p style={{ marginTop: 32, fontSize: 15, color: 'var(--muted)' }}>
        {mode === 'signin' ? 'New here? ' : 'Already have an account? '}
        <button className="btn btn-t" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setErr(''); }}>
          {mode === 'signin' ? 'Create an account' : 'Sign in instead'}
        </button>
      </p>
    </section>
  );
}

export default function LoginPage() {
  return (
    <>
      <Suspense fallback={<div className="wrap" style={{ padding: '96px 40px', color: 'var(--muted)' }}>Loading…</div>}>
        <LoginInner />
      </Suspense>
      <Footer />
    </>
  );
}
