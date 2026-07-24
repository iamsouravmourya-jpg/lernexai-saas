import { useState } from "react";
import { Module, Lesson } from "@/lib/course";

interface ModuleListProps {
  modules: Module[];
  currentModuleId?: string;
  currentLessonId?: string;
  completedLessons?: Set<string>;
  onModuleSelect?: (moduleId: string) => void;
  onLessonSelect?: (lessonId: string) => void;
}

export default function ModuleList({
  modules,
  currentModuleId,
  currentLessonId,
  completedLessons = new Set(),
  onModuleSelect,
  onLessonSelect,
}: ModuleListProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
    if (onModuleSelect) {
      onModuleSelect(moduleId);
    }
  };

  const getModuleProgress = (module: Module) => {
    if (!module.lessons || module.lessons.length === 0) return 0;
    const completed = module.lessons.filter(l => completedLessons.has(l.id)).length;
    return Math.round((completed / module.lessons.length) * 100);
  };

  return (
    <div className="space-y-3">
      {modules.map((module, index) => {
        const isExpanded = expandedModules.has(module.id);
        const isCurrentModule = currentModuleId === module.id;
        const progress = getModuleProgress(module);
        const hasLessons = Boolean(module.lessons?.length);
        const isComplete = hasLessons && progress === 100;

        return (
          <div
            key={module.id}
            className={`border rounded-2xl overflow-hidden transition-all ${
              isCurrentModule
                ? "border-purple-300 bg-purple-50/30 ring-1 ring-purple-200"
                : "border-gray-200 bg-white"
            }`}
          >
            {/* Module Header */}
            <div
              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleModule(module.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-3 flex-1">
                  <span className={`mt-0.5 font-bold text-sm ${
                    isCurrentModule ? "text-purple-600" : "text-gray-500"
                  }`}>
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-gray-900">{module.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {module.lessons?.length || 0} lessons
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Progress indicator */}
                  {hasLessons && (
                    <div className="flex items-center gap-1">
                      <div className="w-16 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-green-500 h-full rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-green-600">
                        {isComplete ? "✓" : `${progress}%`}
                      </span>
                    </div>
                  )}
                  {/* Expand/collapse arrow */}
                  <span
                    className={`text-gray-400 transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                </div>
              </div>
            </div>

            {/* Expanded Lessons */}
            {isExpanded && module.lessons && (
              <div className="px-4 pb-4 pt-0 border-t border-gray-100">
                <ul className="space-y-1 mt-3 ml-8">
                  {module.lessons.map((lesson) => {
                    const isCompleted = completedLessons.has(lesson.id);
                    const isCurrentLesson = currentLessonId === lesson.id;

                    return (
                      <li
                        key={lesson.id}
                        onClick={() => onLessonSelect && onLessonSelect(lesson.id)}
                        className={`text-xs flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                          isCurrentLesson
                            ? "bg-purple-100 text-purple-700 font-semibold"
                            : isCompleted
                            ? "text-green-600"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {isCompleted ? (
                          <span className="text-green-500">✓</span>
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                        )}
                        {lesson.title}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
