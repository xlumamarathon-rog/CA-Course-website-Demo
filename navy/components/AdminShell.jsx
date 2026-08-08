'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/store';

const NAV = [
  { href: '/admin', label: 'Dashboard', ic: '▦' },
  { href: '/admin/courses', label: 'Courses', ic: '▤' },
  { href: '/admin/students', label: 'Students', ic: '◍' }
];

export default function AdminShell({ children, title, action }) {
  const path = usePathname() || '';
  const router = useRouter();
  const { user, isAdmin, ready, logout } = useAuth();

  if (!ready) {
    return <div className="wrap" style={{ padding: '96px 40px', color: 'var(--muted)' }}>Loading…</div>;
  }

  if (!isAdmin) {
    return (
      <section className="wrap" style={{ paddingTop: 80, paddingBottom: 96, maxWidth: 560 }}>
        <div className="panel" style={{ textAlign: 'center', padding: 48 }}>
          <span className="lockic">🔒</span>
          <h1 style={{ fontSize: 26, letterSpacing: '-.02em', margin: '24px 0 12px' }}>Administrators only</h1>
          <p style={{ color: 'var(--secondary)', maxWidth: '40ch', margin: '0 auto 28px' }}>
            {user
              ? 'You are signed in as a learner. Sign in with the admin account to manage courses.'
              : 'Sign in with the admin account to manage courses.'}
          </p>
          <div className="btn-row" style={{ justifyContent: 'center' }}>
            <Link href="/login?next=/admin" className="btn btn-p">
              {user ? 'Switch account' : 'Sign in as admin'}
            </Link>
            <Link href="/" className="btn btn-s">Back to site</Link>
          </div>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 24, marginBottom: 0 }} className="mono">
            admin@thinkingbridge.in · admin123
          </p>
        </div>
      </section>
    );
  }

  return (
    <div className="adm">
      <aside className="adm-side">
        <div className="adm-brand">
          <span className="mark">TB</span>
          <span>
            <b>Admin</b>
            <i>Thinking Bridge</i>
          </span>
        </div>
        <nav>
          {NAV.map(n => (
            <Link key={n.href} href={n.href}
              className={'adm-link' + (path === n.href || (n.href !== '/admin' && path.startsWith(n.href)) ? ' on' : '')}>
              <span className="ic">{n.ic}</span>{n.label}
            </Link>
          ))}
        </nav>
        <div className="adm-side-foot">
          <Link href="/" className="adm-link"><span className="ic">↗</span>View live site</Link>
          <button className="adm-link" onClick={() => { logout(); router.push('/'); }}>
            <span className="ic">⤶</span>Sign out
          </button>
          <div className="adm-me">
            <span className="av ac">{(user.name || 'A').slice(0, 2).toUpperCase()}</span>
            <span>
              <b>{user.name}</b>
              <i>{user.email}</i>
            </span>
          </div>
        </div>
      </aside>

      <div className="adm-main">
        <header className="adm-top">
          <h1>{title}</h1>
          <div className="adm-act">{action}</div>
        </header>
        <div className="adm-body">{children}</div>
      </div>
    </div>
  );
}
