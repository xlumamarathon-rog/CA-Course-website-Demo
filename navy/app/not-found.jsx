import Link from 'next/link';
import Footer from '@/components/Footer';

export default function NotFound() {
  return (
    <>
      <div className="wrap err">
        <div className="code">404</div>
        <h1 style={{ fontSize: 28, letterSpacing: '-.02em', marginBottom: 16 }}>
          That page has moved on to a better engagement.
        </h1>
        <p style={{ color: 'var(--secondary)', fontSize: 19 }}>
          The link is broken or the course was renamed. Everything current is one click away.
        </p>
        <div className="btn-row" style={{ justifyContent: 'center', marginTop: 32 }}>
          <Link href="/courses" className="btn btn-p">Browse courses</Link>
          <Link href="/" className="btn btn-s">Back to home</Link>
        </div>
      </div>
      <Footer />
    </>
  );
}
