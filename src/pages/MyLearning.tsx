import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Library, RotateCw } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { fetchEnrolledCourses, type EnrolledCourse } from "@/lib/course";

export default function MyLearning() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadCourses() {
      if (!user?.id) return;
      setLoading(true);
      setError(null);

      try {
        const enrolledCourses = await fetchEnrolledCourses(user.id);
        if (active) setCourses(enrolledCourses);
      } catch (caughtError) {
        if (active) {
          setError(caughtError instanceof Error ? caughtError.message : "Could not load your learning courses.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadCourses();
    return () => {
      active = false;
    };
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-purple-300 hover:text-purple-700">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to Dashboard
          </Link>

          <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-purple-600">Your courses</p>
              <h1 className="mt-1 text-3xl font-bold text-gray-900">Learning</h1>
              <p className="mt-2 text-gray-600">Continue the courses you have enrolled in and track your progress.</p>
            </div>
            <Link href="/browse" className="inline-flex w-fit items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700">
              <Library className="h-4 w-4" aria-hidden="true" /> Browse courses
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3" aria-label="Loading your courses">
            {[1, 2, 3].map(item => (
              <div key={item} className="animate-pulse overflow-hidden rounded-2xl border border-gray-200 bg-white">
                <div className="h-44 bg-gray-200" />
                <div className="space-y-3 p-5"><div className="h-5 w-2/3 rounded bg-gray-200" /><div className="h-3 rounded bg-gray-100" /><div className="h-10 rounded-xl bg-gray-200" /></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <RotateCw className="mx-auto h-8 w-8 text-red-500" aria-hidden="true" />
            <h2 className="mt-3 text-lg font-bold text-red-900">Could not load your courses</h2>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-purple-200 bg-white px-6 py-16 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-purple-600" aria-hidden="true" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">You haven’t started a course yet</h2>
            <p className="mx-auto mt-2 max-w-md text-gray-600">Explore the catalog, choose a free or Pro course, and select Start Learning.</p>
            <Link href="/browse" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white transition hover:bg-purple-700">
              Explore courses <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {courses.map(course => {
              const progress = Math.min(100, Math.max(0, course.enrollment_progress || 0));
              return (
                <article key={course.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="relative h-44 bg-gradient-to-br from-purple-100 to-indigo-100">
                    {course.thumbnail_url ? <img src={course.thumbnail_url} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-6xl" aria-hidden="true">📚</div>}
                    <span className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-bold ${course.is_premium ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-700"}`}>
                      {course.is_premium ? "Pro" : "Free"}
                    </span>
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-purple-600">{course.category}</p>
                    <h2 className="mt-1 line-clamp-2 text-xl font-bold text-gray-900">{course.title}</h2>
                    <p className="mt-1 text-sm text-gray-500">{course.modules?.length || 0} modules</p>
                    <div className="mt-5">
                      <div className="mb-2 flex justify-between text-xs font-semibold text-gray-600"><span>Progress</span><span>{Math.round(progress)}%</span></div>
                      <div className="h-2 overflow-hidden rounded-full bg-gray-100" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
                        <div className="h-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-600" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                    <div className="mt-5 flex gap-2">
                      <Link href={`/course/${course.id}`} className="flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-center text-sm font-semibold text-gray-700 transition hover:border-purple-300 hover:text-purple-700">Overview</Link>
                      <Link href={`/learning/${course.id}`} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-900 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700">Continue <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
