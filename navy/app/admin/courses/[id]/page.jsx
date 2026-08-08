'use client';
import { useParams } from 'next/navigation';
import CourseEditor from '@/components/CourseEditor';
export default function EditCoursePage() {
  const { id } = useParams();
  return <CourseEditor courseId={id} />;
}
