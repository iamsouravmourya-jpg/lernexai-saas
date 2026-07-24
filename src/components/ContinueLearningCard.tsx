import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, RotateCw } from "lucide-react";
import { Link } from "wouter";
import { fetchEnrolledCourses } from "@/lib/course";
import type { EnrolledCourse } from "@/lib/course";

interface ContinueLearningCardProps {
  userId: string;
  onContinueClick: (courseId: string) => void;
}

export default function ContinueLearningCard({
  userId,
  onContinueClick,
}: ContinueLearningCardProps) {
  const [course, setCourse] = useState<EnrolledCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadEnrollment() {
      setLoading(true);
      setError(null);

      try {
        const enrollments = await fetchEnrolledCourses(userId);
        if (active) setCourse(enrollments[0] ?? null);
      } catch (caughtError) {
        if (active) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Unable to load your enrolled courses."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadEnrollment();
    return () => {
      active = false;
    };
  }, [userId]);

  if (loading) {
    return (
      <div className="animate-pulse overflow-hidden rounded-2xl border border-gray-200 bg-white p-5" aria-label="Loading latest course">
        <div className="h-36 rounded-xl bg-gray-200" />
        <div className="mt-5 h-5 w-2/3 rounded bg-gray-200" />
        <div className="mt-3 h-3 w-full rounded bg-gray-100" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <RotateCw className="mx-auto h-7 w-7 text-red-500" aria-hidden="true" />
        <h3 className="mt-3 font-semibold text-red-900">Couldn’t load your course</h3>
        <p className="mt-1 text-sm text-red-700">{error}</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="rounded-2xl border border-dashed border-purple-200 bg-purple-50/60 p-7 text-center">
        <BookOpen className="mx-auto h-9 w-9 text-purple-600" aria-hidden="true" />
        <h3 className="mt-3 text-lg font-bold text-gray-900">Start your first course</h3>
        <p className="mt-1 text-sm text-gray-600">Browse the catalog and choose what you want to learn next.</p>
        <Link href="/browse" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700">
          Browse courses <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  const progress = Math.min(100, Math.max(0, course.enrollment_progress ?? 0));

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="grid sm:grid-cols-[13rem_1fr]">
        <div className="h-44 bg-gradient-to-br from-purple-100 to-indigo-100 sm:h-full">
          {course.thumbnail_url ? (
            <img src={course.thumbnail_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-5xl" aria-hidden="true">📚</div>
          )}
        </div>

        <div className="flex min-w-0 flex-col justify-center p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-purple-600">Continue learning</p>
          <h3 className="mt-2 truncate text-xl font-bold text-gray-900">{course.title}</h3>
          <p className="mt-1 text-sm text-gray-500">{course.modules?.length ?? 0} modules</p>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-xs font-semibold text-gray-600">
              <span>Course progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-100" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
              <div className="h-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <button type="button" onClick={() => onContinueClick(course.id)} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700 sm:w-fit">
            Continue course <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}
