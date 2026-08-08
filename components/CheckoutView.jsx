'use client';
import Checkout from '@/components/Checkout';
import Gate from '@/components/Gate';
import { useCourses, useAuth } from '@/lib/store';

export default function CheckoutView({ id }) {
  const courses = useCourses();
  const { isAuthed, ready } = useAuth();
  const course = courses.get(id);

  if (!ready || (!course && !courses.ready)) {
    return <div className="wrap" style={{ padding: '96px 40px', color: 'var(--muted)' }}>Loading…</div>;
  }
  if (!course) {
    return <div className="wrap err"><div className="code">404</div><h1>Course not found</h1></div>;
  }
  if (!isAuthed) return <Gate mode="auth" course={course} next={'/checkout/' + id} />;

  return <Checkout course={course} />;
}
