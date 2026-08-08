'use client';
import Link from 'next/link';
import Footer from './Footer';
import { fmt } from '@/lib/data';

/* Shown instead of the player when the visitor is not signed in,
   or is signed in but has not bought the course. */
export default function Gate({ mode, course, next }) {
  const login = '/login?next=' + encodeURIComponent(next || '/');

  return (
    <>
      <section className="wrap" style={{ paddingTop: 80, paddingBottom: 96, maxWidth: 640 }}>
        <div className="panel" style={{ textAlign: 'center', padding: 48 }}>
          <span className="lockic">{mode === 'auth' ? '◎' : '🔒'}</span>

          {mode === 'auth' ? (
            <>
              <h1 style={{ fontSize: 28, letterSpacing: '-.02em', margin: '24px 0 12px' }}>Sign in to start learning</h1>
              <p style={{ color: 'var(--secondary)', maxWidth: '42ch', margin: '0 auto 32px' }}>
                {course ? course.title + ' is ready for you.' : 'This lesson is ready for you.'} Sign in
                or create an account and we will bring you straight back here.
              </p>
              <div className="btn-row" style={{ justifyContent: 'center' }}>
                <Link href={login} className="btn btn-p btn-lg">Sign in</Link>
                <Link href={login + '&mode=signup'} className="btn btn-s btn-lg">Create account</Link>
              </div>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 24, marginBottom: 0 }}>
                Demo credentials are listed on the sign-in page — one click fills them in.
              </p>
            </>
          ) : (
            <>
              <h1 style={{ fontSize: 28, letterSpacing: '-.02em', margin: '24px 0 12px' }}>You do not own this course yet</h1>
              <p style={{ color: 'var(--secondary)', maxWidth: '44ch', margin: '0 auto 24px' }}>
                {course ? course.title : 'This course'} unlocks the moment your purchase goes through —
                all lessons, templates and the certificate.
              </p>
              {course && (
                <div className="price" style={{ justifyContent: 'center', marginBottom: 8 }}>
                  <span className="now" style={{ fontSize: 30 }}>{fmt(course.price)}</span>
                  {course.mrp > course.price && <span className="was">{fmt(course.mrp)}</span>}
                </div>
              )}
              <div className="btn-row" style={{ justifyContent: 'center', marginTop: 24 }}>
                <Link href={'/checkout/' + course.id} className="btn btn-p btn-lg">Buy this course</Link>
                <Link href={'/course/' + course.id} className="btn btn-s btn-lg">See what is inside</Link>
              </div>
            </>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}
