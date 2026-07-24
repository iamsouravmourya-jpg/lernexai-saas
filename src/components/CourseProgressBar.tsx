import { LayoutDashboard } from "lucide-react";
import { Clock3 } from "lucide-react";
import type { Course } from "@/lib/course";

interface CourseProgressBarProps {
  course: Course;
  completedCount: number;
  totalCount: number;
  onDashboard: () => void;
}

function formatDuration(minutes: number) {
  if (minutes <= 0) return "Self-paced";
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (!hours) return `${remainingMinutes} min`;
  if (!remainingMinutes) return `${hours} hr`;
  return `${hours} hr ${remainingMinutes} min`;
}

export default function CourseProgressBar({
  course,
  completedCount,
  totalCount,
  onDashboard,
}: CourseProgressBarProps) {
  const safeTotal = Math.max(0, totalCount);
  const safeCompleted = Math.min(Math.max(0, completedCount), safeTotal);
  const percent = safeTotal === 0 ? 0 : Math.round((safeCompleted / safeTotal) * 100);
  const lessonDurationMinutes = (course.modules ?? []).reduce(
    (moduleTotal, module) =>
      moduleTotal +
      (module.lessons ?? []).reduce(
        (lessonTotal, lesson) => lessonTotal + (lesson.duration_minutes ?? 0),
        0
      ),
    0
  );
  const estimatedMinutes = lessonDurationMinutes || Math.round((course.estimated_hours || 0) * 60);

  return (
    <header className="shrink-0 border-b border-gray-200 bg-white px-4 py-3 sm:px-6">
      <div className="mx-auto grid max-w-[1600px] grid-cols-1 items-center gap-3 sm:grid-cols-[9rem_1fr_9rem]">
        <button type="button" onClick={onDashboard} className="inline-flex w-fit shrink-0 items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900" aria-label="Go to dashboard">
          <LayoutDashboard className="h-4 w-4" aria-hidden="true" /> Dashboard
        </button>

        <div className="mx-auto w-full min-w-0 max-w-xl sm:text-center">
          <h1 className="truncate text-base font-bold text-gray-900 sm:text-lg">{course.title}</h1>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500 sm:justify-center">
            <Clock3 className="h-4 w-4" aria-hidden="true" />
            <span>{formatDuration(estimatedMinutes)}</span>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100" role="progressbar" aria-label="Course progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
              <div className="h-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-500" style={{ width: `${percent}%` }} />
            </div>
            <span className="shrink-0 text-xs font-bold text-purple-700">{percent}%</span>
          </div>
          <p className="mt-1.5 text-xs text-gray-500">{safeCompleted} of {safeTotal} lessons complete</p>
        </div>

        <div className="hidden sm:block" aria-hidden="true" />
      </div>
    </header>
  );
}
