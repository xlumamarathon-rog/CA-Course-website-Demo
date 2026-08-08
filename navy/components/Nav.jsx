'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth, usePurchases } from '@/lib/store';

const LINKS = [
  { href: '/courses', label: 'Courses' },
  { href: '/jobs', label: 'Jobs' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' }
];

export default function Nav() {
  const path = usePathname() || '/';
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const { user, isAdmin, logout } = useAuth();
  const { list } = usePurchases();

  useEffect(() => { setOpen(false); setMenu(false); }, [path]);

  const active = (href) => path === href || path.startsWith(href + '/');

  return (
    <>
      <nav className="nav">
        <div className="nav-in">
          <Link href="/" className="logo">
            <span className="mark">TB</span>
            <span>THINKING BRIDGE</span>
          </Link>

          <ul className="nav-links">
            {LINKS.map(l => (
              <li key={l.href}>
                <Link href={l.href} className={active(l.href) ? 'on' : ''}>{l.label}</Link>
              </li>
            ))}
            {list.length > 0 && (
              <li>
                <Link href="/dashboard" className={active('/dashboard') ? 'on' : ''}>My learning</Link>
              </li>
            )}
          </ul>

          <div className="nav-right">
            {isAdmin && <Link href="/admin" className="btn btn-s btn-sm">Admin</Link>}
            {user ? (
              <div className="acct">
                <button className="acct-btn" onClick={() => setMenu(m => !m)} aria-expanded={menu}>
                  <span className={'av' + (isAdmin ? ' ac' : '')} style={{ width: 30, height: 30, fontSize: 12 }}>
                    {(user.name || '?').split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase()}
                  </span>
                  <span className="acct-nm">{(user.name || '').split(' ')[0]}</span>
                  <span className="acct-cv">▾</span>
                </button>
                {menu && (
                  <div className="acct-menu">
                    <div className="acct-head">
                      <b>{user.name}</b>
                      <i>{user.email}</i>
                    </div>
                    <Link href="/dashboard" onClick={() => setMenu(false)}>My learning</Link>
                    {isAdmin && <Link href="/admin" onClick={() => setMenu(false)}>Admin panel</Link>}
                    <Link href="/courses" onClick={() => setMenu(false)}>Browse courses</Link>
                    <button onClick={() => { setMenu(false); logout(); }}>Sign out</button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="btn btn-s btn-sm">Sign in</Link>
                <Link href="/courses" className="btn btn-p btn-sm">Browse courses</Link>
              </>
            )}
            <button className="burger" onClick={() => setOpen(o => !o)} aria-label="Menu" aria-expanded={open}>
              <span />
            </button>
          </div>
        </div>
      </nav>

      <div className={'mobmenu' + (open ? ' open' : '')}>
        {LINKS.map(l => <Link key={l.href} href={l.href}>{l.label}</Link>)}
        <Link href="/dashboard">My learning</Link>
        {isAdmin && <Link href="/admin">Admin panel</Link>}
        {user
          ? <button onClick={logout} style={{ display: 'block', fontSize: 19, fontWeight: 600, padding: '16px 0', background: 'none', border: 'none', borderBottom: '1px solid var(--border)', width: '100%', textAlign: 'left', cursor: 'pointer' }}>Sign out</button>
          : <Link href="/login">Sign in</Link>}
        <div style={{ marginTop: 24 }}>
          <Link href="/courses" className="btn btn-p btn-full">Browse courses</Link>
        </div>
      </div>
    </>
  );
}
