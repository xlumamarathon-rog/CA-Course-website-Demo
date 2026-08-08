import LearnView from '@/components/LearnView';
import { findCourse } from '@/lib/data';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const c = findCourse(id);
  return { title: c ? 'Learning: ' + c.title : 'Course player' };
}

export default async function LearnPage({ params }) {
  const { id } = await params;
  return <LearnView id={id} />;
}
