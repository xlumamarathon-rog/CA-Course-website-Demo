import CourseDetail from '@/components/CourseDetail';
import { findCourse } from '@/lib/data';

/* Server wrapper: resolves the route param so the client component can render
   real content during SSR (useParams is not available on the server). */
export async function generateMetadata({ params }) {
  const { id } = await params;
  const c = findCourse(id);
  return c
    ? { title: c.title + ' — Thinking Bridge', description: c.tag }
    : { title: 'Course — Thinking Bridge' };
}

export default async function CoursePage({ params }) {
  const { id } = await params;
  return <CourseDetail id={id} />;
}
