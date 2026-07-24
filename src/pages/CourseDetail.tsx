import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { fetchCompletedLessonIds, fetchCourseById, enrollInCourse, fetchUserEnrollments } from "@/lib/course";
import { Course } from "@/lib/course";
import ModuleList from "@/components/ModuleList";

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (id) {
      loadCourse(id);
      checkEnrollment(id);
    }
  }, [id, user?.id]);

  const loadCourse = async (courseId: string) => {
    setLoading(true);
    const data = await fetchCourseById(courseId);
    setCourse(data);

    if (user?.id && data) {
      const courseLessonIds = data.modules?.flatMap(module =>
        module.lessons?.map(lesson => lesson.id) || []
      ) || [];
      const persistedCompletedLessons = await fetchCompletedLessonIds(user.id, courseLessonIds);
      setCompletedLessons(persistedCompletedLessons);
      setProgress(
        courseLessonIds.length === 0
          ? 0
          : Math.round((persistedCompletedLessons.size / courseLessonIds.length) * 100)
      );
    } else {
      setCompletedLessons(new Set());
      setProgress(0);
    }

    setLoading(false);
  };

  const checkEnrollment = async (courseId: string) => {
    if (!user?.id) return;

    const enrollments = await fetchUserEnrollments(user.id);
    const isEnrolled = enrollments.some(e => e.course_id === courseId);
    setEnrolled(isEnrolled);


  };

  const handleEnroll = async () => {
    if (!user?.id || !id || enrolling) return;
    if (course?.is_premium && user.plan_type !== "pro") {
      setLocation("/upgrade");
      return;
    }

    setEnrolling(true);
    setEnrollmentError(null);
    try {
      await enrollInCourse(user.id, id);
      setEnrolled(true);
      setLocation(`/learning/${id}`);
    } catch (error) {
      setEnrollmentError(error instanceof Error ? error.message : "Enrollment failed. Please try again.");
    } finally {
      setEnrolling(false);
    }
  };

  const handleStartLearning = () => {
    if (id) {
      setLocation(`/learning/${id}`);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Advanced':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl mb-4 block">📚</span>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Course not found</h3>
          <Link href="/browse">
            <button className="text-purple-600 hover:underline">Browse all courses</button>
          </Link>
        </div>
      </div>
    );
  }

  const totalLessons = course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;
  const totalHours = Math.round(totalLessons * 0.5); // Estimate 30 min per lesson
  const isPremiumLocked = course.is_premium && user?.plan_type !== "pro";

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/browse">
              <button className="text-white/80 hover:text-white">← Back to Browse</button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getDifficultyColor(course.difficulty)}`}>
                  {course.difficulty}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-white/20">
                  {course.category}
                </span>
              </div>
              
              <h1 className="text-2xl font-bold mb-4 sm:text-3xl lg:text-4xl">{course.title}</h1>
              <p className="text-lg text-white/90 mb-6">{course.description}</p>
              
              <div className="flex flex-wrap items-center gap-3 text-sm sm:gap-6">
                <div className="flex items-center gap-2">
                  <span>📖</span>
                  <span>{course.modules?.length || 0} modules</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>⏱️</span>
                  <span>{totalHours} hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📝</span>
                  <span>{totalLessons} lessons</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-1">
              <div className="bg-white rounded-2xl p-6 text-gray-900 shadow-xl">
                {enrolled ? (
                  <>
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold">Your Progress</span>
                        <span className="text-sm font-bold text-purple-600">{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-purple-600 h-full rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleStartLearning}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:shadow-lg transition-all"
                    >
                      Continue Learning →
                    </button>
                  </>
                ) : (
                  <>
                    <div className="text-center mb-4">
                      <span className="text-4xl">🎓</span>
                    </div>
                    <h3 className="text-lg font-bold mb-2">{isPremiumLocked ? "Unlock this Pro course" : "Start Learning Today"}</h3>
                    <p className="text-sm text-gray-600 mb-4">{isPremiumLocked ? "Upgrade to Pro to enroll and access every lesson." : "Enroll for free and track your progress."}</p>
                    <button
                      onClick={handleEnroll}
                      disabled={enrolling}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:shadow-lg transition-all disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isPremiumLocked ? "Upgrade to Pro →" : enrolling ? "Enrolling…" : "Start Learning →"}
                    </button>
                    {enrollmentError && (
                      <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs leading-5 text-red-700">{enrollmentError}</p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Content</h2>
        
        {course.modules && course.modules.length > 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <ModuleList
              modules={course.modules}
              completedLessons={completedLessons}
            />
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <span className="text-4xl mb-4 block">📝</span>
            <p className="text-gray-600">No modules available yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
