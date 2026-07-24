import { useEffect, useState } from "react";
import { Check, ChevronDown, ChevronsLeft, ChevronsRight, Code2, FileText, HelpCircle, PlayCircle } from "lucide-react";
import type { Lesson, Module } from "@/lib/course";

type LessonWithType = Lesson & { content_type?: string };

interface ModuleSidebarProps {
  modules: Module[];
  completedLessons: Set<string>;
  activeLessonId: string;
  quizScoresById?: Record<string, number>;
  onSelectLesson: (moduleId: string, lessonId: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

function LessonTypeIcon({ lesson }: { lesson: LessonWithType }) {
  const type = lesson.content_type?.toLowerCase();
  const className = "h-4 w-4 shrink-0";

  if (type === "video" || lesson.video_url) return <PlayCircle className={className} aria-hidden="true" />;
  if (type === "code" || type === "coding") return <Code2 className={className} aria-hidden="true" />;
  if (type === "quiz") return <HelpCircle className={className} aria-hidden="true" />;
  return <FileText className={className} aria-hidden="true" />;
}

export default function ModuleSidebar({
  modules,
  completedLessons,
  activeLessonId,
  quizScoresById = {},
  onSelectLesson,
  collapsed,
  onToggleCollapse,
}: ModuleSidebarProps) {
  const activeModuleId = modules.find((module) =>
    module.lessons?.some((lesson) => lesson.id === activeLessonId)
  )?.id;
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    () => new Set(activeModuleId ? [activeModuleId] : modules[0] ? [modules[0].id] : [])
  );

  useEffect(() => {
    if (!activeModuleId) return;
    setExpandedModules((current) => {
      if (current.has(activeModuleId)) return current;
      const next = new Set(current);
      next.add(activeModuleId);
      return next;
    });
  }, [activeModuleId]);

  function toggleModule(moduleId: string) {
    setExpandedModules((current) => {
      const next = new Set(current);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  }

  function expandFromRail(moduleId: string) {
    onToggleCollapse();
    setExpandedModules((current) => new Set(current).add(moduleId));
  }

  return (
    <>
      <aside className={`w-full flex-col border-r border-gray-200 bg-white ${collapsed ? "flex lg:hidden" : "flex lg:h-full lg:w-80 lg:shrink-0 lg:overflow-y-auto"}`}>
        <div className="flex items-center justify-between border-b border-gray-200 p-5">
          <div>
            <h2 className="font-bold text-gray-900">Course content</h2>
            <p className="mt-1 text-xs text-gray-500">Select a lesson to continue</p>
          </div>
          <button type="button" onClick={onToggleCollapse} className="hidden shrink-0 items-center justify-center rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 lg:inline-flex" aria-label="Collapse course content" title="Collapse sidebar">
            <ChevronsLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="divide-y divide-gray-100">
          {modules.map((module, moduleIndex) => {
            const lessons = module.lessons ?? [];
            const completed = lessons.filter((lesson) => completedLessons.has(lesson.id)).length;
            const progress = lessons.length === 0 ? 0 : Math.round((completed / lessons.length) * 100);
            const isExpanded = expandedModules.has(module.id);
            const quizScore = module.quiz?.id ? quizScoresById[module.quiz.id] : undefined;

            return (
              <section key={module.id}>
                <button type="button" onClick={() => toggleModule(module.id)} className={`flex w-full items-center gap-3 p-4 text-left transition hover:bg-gray-50 ${activeModuleId === module.id ? "bg-purple-50/70" : ""}`} aria-expanded={isExpanded}>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-xs font-bold text-purple-700">{moduleIndex + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-900">{module.title}</span>
                      {quizScore !== undefined && <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${quizScore >= (module.quiz?.passing_score ?? 80) ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>Quiz {quizScore}%</span>}
                    </span>
                    <span className="mt-0.5 block text-xs text-gray-500">{completed}/{lessons.length} lessons</span>
                    <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-gray-100">
                      <span className="block h-full rounded-full bg-purple-600 transition-all" style={{ width: `${progress}%` }} />
                    </span>
                  </span>
                  <span className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                    {progress === 100 && lessons.length > 0 ? (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-700" title="Module complete"><Check className="h-3.5 w-3.5" aria-hidden="true" /></span>
                    ) : (
                      <span>{progress}%</span>
                    )}
                    <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} aria-hidden="true" />
                  </span>
                </button>

                {isExpanded && (
                  <ul className="space-y-1 px-3 pb-4">
                    {lessons.map((lesson) => {
                      const typedLesson = lesson as LessonWithType;
                      const isActive = lesson.id === activeLessonId;
                      const isCompleted = completedLessons.has(lesson.id);
                      return (
                        <li key={lesson.id}>
                          <button type="button" onClick={() => onSelectLesson(module.id, lesson.id)} className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition ${isActive ? "bg-purple-100 font-semibold text-purple-800" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`} aria-current={isActive ? "page" : undefined}>
                            {isCompleted ? <Check className="h-4 w-4 shrink-0 text-green-600" aria-label="Completed" /> : <LessonTypeIcon lesson={typedLesson} />}
                            <span className="min-w-0 flex-1 truncate">{lesson.title}</span>
                            {lesson.duration_minutes != null && (
                              <span className="shrink-0 text-[11px] text-gray-400">{lesson.duration_minutes}m</span>
                            )}
                          </button>
                        </li>
                      );
                    })}
                    {lessons.length === 0 && <li className="px-3 py-2 text-xs text-gray-400">No lessons yet</li>}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      </aside>

      {collapsed && (
        <aside className="hidden shrink-0 flex-col items-center gap-2 border-r border-gray-200 bg-white py-4 lg:flex lg:h-full lg:w-14 lg:overflow-y-auto">
          <button type="button" onClick={onToggleCollapse} className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700" aria-label="Expand course content" title="Expand sidebar">
            <ChevronsRight className="h-4 w-4" aria-hidden="true" />
          </button>
          <div className="mt-2 flex flex-col items-center gap-2">
            {modules.map((module, moduleIndex) => {
              const lessons = module.lessons ?? [];
              const completed = lessons.filter((lesson) => completedLessons.has(lesson.id)).length;
              const isModuleComplete = lessons.length > 0 && completed === lessons.length;
              const isActiveModule = activeModuleId === module.id;
              return (
                <button
                  key={module.id}
                  type="button"
                  onClick={() => expandFromRail(module.id)}
                  title={module.title}
                  aria-label={`Expand ${module.title}`}
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition ${isActiveModule ? "bg-purple-600 text-white" : isModuleComplete ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600 hover:bg-purple-50 hover:text-purple-700"}`}
                >
                  {isModuleComplete ? <Check className="h-4 w-4" aria-hidden="true" /> : moduleIndex + 1}
                </button>
              );
            })}
          </div>
        </aside>
      )}
    </>
  );
}
