import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { fetchCompletedLessonIds, fetchCourseById, updateLessonProgress, getUserProgress, updateEnrollmentProgress } from "@/lib/course";
import { Course, Module, Lesson } from "@/lib/course";
import ModuleList from "@/components/ModuleList";
import AITutor from "@/components/AITutor";

export default function Player() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentModuleId, setCurrentModuleId] = useState<string>("");
  const [currentLessonId, setCurrentLessonId] = useState<string>("");
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [progressSaving, setProgressSaving] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (id) {
      loadCourse(id);
    }
  }, [id, user?.id]);

  const loadCourse = async (courseId: string) => {
    setLoading(true);
    const data = await fetchCourseById(courseId);
    setCourse(data);

    if (data?.modules?.length) {
      const firstModule = data.modules[0];
      setCurrentModuleId(firstModule.id);
      
      if (firstModule.lessons?.length) {
        setCurrentLessonId(firstModule.lessons[0].id);
      }
    }

    if (user?.id && data) {
      const courseLessonIds = data.modules?.flatMap(module =>
        module.lessons?.map(lesson => lesson.id) || []
      ) || [];
      const persistedCompletedLessons = await fetchCompletedLessonIds(user.id, courseLessonIds);
      setCompletedLessons(persistedCompletedLessons);
    } else {
      setCompletedLessons(new Set());
    }

    setLoading(false);
  };

  const handleModuleSelect = (moduleId: string) => {
    setCurrentModuleId(moduleId);
    const module = course?.modules?.find(m => m.id === moduleId);
    if (module && module.lessons && module.lessons.length > 0) {
      setCurrentLessonId(module.lessons[0].id);
    }
  };

  const handleLessonSelect = (lessonId: string) => {
    setCurrentLessonId(lessonId);
  };

  const handleToggleCompletion = async () => {
    if (!user?.id || !currentLessonId || progressSaving) return;

    const isCurrentlyCompleted = completedLessons.has(currentLessonId);
    setProgressSaving(true);

    try {
      const success = await updateLessonProgress(user.id, currentLessonId, !isCurrentlyCompleted);
      if (!success) return;

      setCompletedLessons(prev => {
        const next = new Set(prev);
        if (isCurrentlyCompleted) {
          next.delete(currentLessonId);
        } else {
          next.add(currentLessonId);
        }
        return next;
      });

      if (id) {
        const newProgress = await getUserProgress(user.id, id);
        await updateEnrollmentProgress(user.id, id, newProgress);
      }
    } finally {
      setProgressSaving(false);
    }
  };

  const getCurrentLesson = (): Lesson | null => {
    const module = course?.modules?.find(m => m.id === currentModuleId);
    return module?.lessons?.find(l => l.id === currentLessonId) || null;
  };

  const getCurrentModule = (): Module | null => {
    return course?.modules?.find(m => m.id === currentModuleId) || null;
  };

  const getNextLesson = (): Lesson | null => {
    const currentModule = getCurrentModule();
    if (!currentModule || !currentModule.lessons) return null;

    const currentIndex = currentModule.lessons.findIndex(l => l.id === currentLessonId);
    if (currentIndex < currentModule.lessons.length - 1) {
      return currentModule.lessons[currentIndex + 1];
    }

    // Move to next module
    const moduleIndex = course?.modules?.findIndex(m => m.id === currentModuleId) || -1;
    if (moduleIndex >= 0 && moduleIndex < (course?.modules?.length || 0) - 1) {
      const nextModule = course?.modules?.[moduleIndex + 1];
      if (nextModule && nextModule.lessons && nextModule.lessons.length > 0) {
        return nextModule.lessons[0];
      }
    }

    return null;
  };

  const getPreviousLesson = (): Lesson | null => {
    const currentModule = getCurrentModule();
    if (!currentModule || !currentModule.lessons) return null;

    const currentIndex = currentModule.lessons.findIndex(l => l.id === currentLessonId);
    if (currentIndex > 0) {
      return currentModule.lessons[currentIndex - 1];
    }

    // Move to previous module
    const moduleIndex = course?.modules?.findIndex(m => m.id === currentModuleId) || -1;
    if (moduleIndex > 0) {
      const prevModule = course?.modules?.[moduleIndex - 1];
      if (prevModule && prevModule.lessons && prevModule.lessons.length > 0) {
        return prevModule.lessons[prevModule.lessons.length - 1];
      }
    }

    return null;
  };

  const handleNext = () => {
    const nextLesson = getNextLesson();
    if (nextLesson) {
      setCurrentLessonId(nextLesson.id);
      const module = course?.modules?.find(m => m.lessons?.some(l => l.id === nextLesson.id));
      if (module) {
        setCurrentModuleId(module.id);
      }
    }
  };

  const handlePrevious = () => {
    const prevLesson = getPreviousLesson();
    if (prevLesson) {
      setCurrentLessonId(prevLesson.id);
      const module = course?.modules?.find(m => m.lessons?.some(l => l.id === prevLesson.id));
      if (module) {
        setCurrentModuleId(module.id);
      }
    }
  };

  const currentLesson = getCurrentLesson();
  const currentModule = getCurrentModule();

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (!course || !currentLesson) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl mb-4 block">📚</span>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Lesson not found</h3>
          <Link href={`/course/${id}`}>
            <button className="text-purple-600 hover:underline">Back to course</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen flex">
      {/* LEFT SIDEBAR */}
      <aside className={`bg-white border-r border-gray-200 h-screen sticky top-0 flex flex-col justify-between transition-all duration-300 ${sidebarCollapsed ? "w-16" : "w-64"}`}>
        <div>
          {/* Logo */}
          <div className={`flex items-center gap-2 mb-8 ${sidebarCollapsed ? "justify-center" : "px-6"}`}>
            {!sidebarCollapsed && (
              <>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                  <span className="text-xl">🎓</span>
                </div>
                <span className="font-bold text-xl text-gray-900">LernexAI</span>
              </>
            )}
            {sidebarCollapsed && (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                <span className="text-xl">🎓</span>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            <Link href="/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-100 transition-all ${sidebarCollapsed ? "justify-center" : ""}`}>
              <span>🏠</span>
              {!sidebarCollapsed && <span>Dashboard</span>}
            </Link>
            <Link href="/browse" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-100 transition-all ${sidebarCollapsed ? "justify-center" : ""}`}>
              <span>📚</span>
              {!sidebarCollapsed && <span>Browse</span>}
            </Link>
            <Link href={`/course/${id}`} className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-purple-50 text-purple-600 font-semibold transition-all ${sidebarCollapsed ? "justify-center" : ""}`}>
              <span>📖</span>
              {!sidebarCollapsed && <span>Course</span>}
            </Link>
          </nav>
        </div>

        {/* User Profile */}
        <div className={`flex flex-col gap-3 pt-4 border-t border-gray-200 ${sidebarCollapsed ? "items-center px-4" : "px-6"}`}>
          <div className={`flex items-center gap-3 ${sidebarCollapsed ? "justify-center" : ""}`}>
            <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">
              {user?.name?.charAt(0) || "U"}
            </div>
            {!sidebarCollapsed && (
              <div>
                <div className="font-bold text-sm">{user?.name || "User"}</div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="text-gray-600 hover:text-purple-600 p-2 rounded-lg hover:bg-gray-100 transition-all">
              ☰
            </button>
            <Link href={`/course/${id}`}>
              <button className="text-gray-600 hover:text-purple-600">←</button>
            </Link>
            <h1 className="text-lg font-bold text-gray-900">{course.title}</h1>
          </div>
          
          {/* Progress */}
          <div className="flex items-center gap-4 w-1/3">
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div className="bg-purple-600 h-full rounded-full" style={{ width: `${completedLessons.size / (course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 1) * 100}%` }}></div>
            </div>
            <span className="text-sm text-gray-500 whitespace-nowrap">
              <span className="text-purple-600 font-semibold">{completedLessons.size}</span> lessons completed
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Module List */}
          <div className={`border-r border-gray-200 bg-white overflow-y-auto transition-all duration-300 ${sidebarCollapsed ? "w-0" : "w-72"}`}>
            <div className="p-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Course Modules</h3>
              {course.modules && (
                <ModuleList
                  modules={course.modules}
                  currentModuleId={currentModuleId}
                  currentLessonId={currentLessonId}
                  completedLessons={completedLessons}
                  onModuleSelect={handleModuleSelect}
                  onLessonSelect={handleLessonSelect}
                />
              )}
            </div>
          </div>

          {/* Lesson Content */}
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-4xl mx-auto">
              {/* Breadcrumbs */}
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <span>{currentModule?.title}</span>
                <span>›</span>
                <span className="text-purple-600 font-semibold">{currentLesson.title}</span>
              </div>

              {/* Lesson Card */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full font-semibold">
                    {currentModule?.title}
                  </span>
                  {currentLesson.duration_minutes && (
                    <span className="text-gray-400 text-sm">• {currentLesson.duration_minutes} min</span>
                  )}
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{currentLesson.title}</h2>
                
                {currentLesson.video_url && (
                  <div className="aspect-video bg-gray-100 rounded-xl mb-6 flex items-center justify-center">
                    <span className="text-4xl">🎬</span>
                  </div>
                )}
                
                <div className="prose prose-gray max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: currentLesson.content }} />
                </div>
              </div>

              {/* Practice Exercise */}
              <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100 mb-6">
                <h3 className="font-bold text-purple-900 mb-3">🎯 Practice Exercise</h3>
                <p className="text-sm text-purple-700 mb-4">
                  Try applying what you've learned. Open Excel and practice the concepts from this lesson.
                </p>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handlePrevious}
                  disabled={!getPreviousLesson()}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                    getPreviousLesson()
                      ? "bg-white border border-gray-200 text-gray-700 hover:border-purple-300 hover:text-purple-600"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  ← Previous
                </button>

                <button
                  onClick={handleToggleCompletion}
                  disabled={progressSaving}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-60 ${
                    completedLessons.has(currentLessonId)
                      ? "bg-green-100 text-green-700 hover:bg-red-50 hover:text-red-600"
                      : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-lg"
                  }`}
                >
                  {progressSaving
                    ? "Saving..."
                    : completedLessons.has(currentLessonId)
                    ? "Mark Incomplete"
                    : "Mark Complete"}
                </button>

                <button
                  onClick={handleNext}
                  disabled={!getNextLesson()}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                    getNextLesson()
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-lg"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Next →
                </button>
              </div>

              {/* Keyboard Shortcuts */}
              <div className="mt-8 bg-gray-50 rounded-xl p-4 border border-gray-200">
                <h4 className="text-sm font-bold text-gray-700 mb-2">⌨️ Keyboard Shortcuts</h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <div><kbd className="px-2 py-1 bg-white rounded border">←</kbd> Previous lesson</div>
                  <div><kbd className="px-2 py-1 bg-white rounded border">→</kbd> Next lesson</div>
                  <div><kbd className="px-2 py-1 bg-white rounded border">C</kbd> Mark complete</div>
                  <div><kbd className="px-2 py-1 bg-white rounded border">M</kbd> Toggle sidebar</div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Tutor */}
          <AITutor courseId={id} lessonId={currentLessonId} />
        </div>
      </div>
    </div>
  );
}
