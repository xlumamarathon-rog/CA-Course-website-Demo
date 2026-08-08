'use client';
import { useParams } from 'next/navigation';
import Player from '@/components/Player';
import Gate from '@/components/Gate';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useCourses, useAuth, usePurchases } from '@/lib/store';

export default function LearnPage() {
  const { id } = useParams();
  const courses = useCourses();
  const { isAuthed, ready: authReady } = useAuth();
  const { has, ready: pReady } = usePurchases();

  const course = courses.get(id);

  if (!courses.ready || !authReady || !pReady) {
    return <div className="wrap" style={{ padding: '96px 40px', color: 'var(--muted)' }}>Loading…</div>;
  }

  if (!course) {
    return (
      <>
        <div className="wrap err">
          <div className="code">404</div>
          <h1 style={{ fontSize: 26, marginBottom: 16 }}>That course does not exist</h1>
          <Link href="/courses" className="btn btn-p">Browse courses</Link>
        </div>
        <Footer />
      </>
    );
  }

  if (!isAuthed) return <Gate mode="auth" course={course} next={'/learn/' + id} />;
  if (!has(course)) return <Gate mode="buy" course={course} next={'/learn/' + id} />;

  return <Player course={course} />;
}
