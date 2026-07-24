import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight, Check, Clock3, Code2, Loader2, PlayCircle } from "lucide-react";
import type { Course, Lesson, Module } from "@/lib/course";
import QuizSection from "@/components/QuizSection";

type LessonWithType = Lesson & { content_type?: string };

interface LessonContentProps {
  course: Course;
  module: Module;
  lesson: Lesson;
  isCompleted: boolean;
  isModuleComplete: boolean;
  onToggleComplete: () => void;
  saving: boolean;
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  quizScoresById?: Record<string, number>;
  onQuizComplete: (quizId: string, score: number, answers: Record<string, number>) => void;
}

function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={index} className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm text-purple-700">{part.slice(1, -1)}</code>;
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function renderContent(content: string) {
  const lines = content.split("\n");
  const elements: ReactNode[] = [];
  let codeLines: string[] | null = null;
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length === 0) return;
    elements.push(
      <ul key={`list-${elements.length}`} className="my-4 list-disc space-y-2 pl-6 text-gray-700">
        {listItems.map((item, index) => <li key={index}>{renderInline(item)}</li>)}
      </ul>
    );
    listItems = [];
  };

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex];
    if (line.trim().startsWith("|") && lines[lineIndex + 1]?.trim().match(/^\|?[\s:|-]+\|?$/)) {
      flushList();
      const headers = line.split("|").map(cell => cell.trim()).filter(Boolean);
      const rows: string[][] = [];
      lineIndex += 2;
      while (lineIndex < lines.length && lines[lineIndex].trim().startsWith("|")) {
        rows.push(lines[lineIndex].split("|").map(cell => cell.trim()).filter(Boolean));
        lineIndex += 1;
      }
      lineIndex -= 1;
      elements.push(
        <div key={`table-${lineIndex}`} className="my-5 overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50">
              <tr>{headers.map((header, index) => <th key={index} className="px-4 py-3 font-semibold text-gray-900">{renderInline(header)}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex} className="px-4 py-3 text-gray-700">{renderInline(cell)}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    if (line.trim().startsWith("```")) {
      flushList();
      if (codeLines === null) {
        codeLines = [];
      } else {
        elements.push(
          <pre key={`code-${lineIndex}`} className="my-5 overflow-x-auto rounded-xl bg-gray-950 p-4 text-sm text-gray-100"><code>{codeLines.join("\n")}</code></pre>
        );
        codeLines = null;
      }
      continue;
    }

    if (codeLines !== null) {
      codeLines.push(line);
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      listItems.push(line.replace(/^[-*]\s+/, ""));
      continue;
    }
    flushList();

    if (line.startsWith("### ")) {
      elements.push(<h3 key={lineIndex} className="mb-2 mt-7 text-lg font-bold text-gray-900">{renderInline(line.slice(4))}</h3>);
    } else if (line.startsWith("## ")) {
      elements.push(<h2 key={lineIndex} className="mb-3 mt-8 text-2xl font-bold text-gray-900">{renderInline(line.slice(3))}</h2>);
    } else if (line.startsWith("# ")) {
      elements.push(<h2 key={lineIndex} className="mb-3 mt-8 text-2xl font-bold text-gray-900">{renderInline(line.slice(2))}</h2>);
    } else if (line.trim()) {
      elements.push(<p key={lineIndex} className="my-3 leading-7 text-gray-700">{renderInline(line)}</p>);
    }
  }

  flushList();
  if (codeLines !== null) {
    elements.push(<pre key="code-final" className="my-5 overflow-x-auto rounded-xl bg-gray-950 p-4 text-sm text-gray-100"><code>{codeLines.join("\n")}</code></pre>);
  }
  return elements;
}

function getYouTubeEmbedUrl(url: string) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace("www.", "");
    let videoId = "";
    if (host === "youtu.be") videoId = parsed.pathname.slice(1).split("/")[0];
    if (host === "youtube.com" || host === "m.youtube.com") {
      videoId = parsed.pathname.startsWith("/shorts/")
        ? parsed.pathname.split("/")[2]
        : parsed.searchParams.get("v") ?? "";
    }
    return videoId ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}` : null;
  } catch {
    return null;
  }
}

export default function LessonContent({
  course,
  module,
  lesson,
  isCompleted,
  isModuleComplete,
  onToggleComplete,
  saving,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  quizScoresById = {},
  onQuizComplete,
}: LessonContentProps) {
  const typedLesson = lesson as LessonWithType;
  const youtubeEmbed = lesson.video_url ? getYouTubeEmbedUrl(lesson.video_url) : null;
  const isCodeLesson = ["code", "coding"].includes(typedLesson.content_type?.toLowerCase() ?? "");
  const isLastLessonInModule = module.lessons?.at(-1)?.id === lesson.id;
  const moduleQuiz = module.quiz;
  const lessonQuiz = lesson.quiz;
  const moduleQuizQuestions = moduleQuiz?.questions || [];
  const lessonQuizQuestions = lessonQuiz?.questions || lesson.quiz_questions || [];
  const moduleQuizScore = moduleQuiz?.id ? quizScoresById[moduleQuiz.id] : undefined;
  const lessonQuizScore = lessonQuiz?.id ? quizScoresById[lessonQuiz.id] : undefined;
  const canShowModuleQuiz = isLastLessonInModule && isModuleComplete && moduleQuizQuestions.length > 0;

  return (
    <main className="min-w-0 flex-1 bg-gray-50 px-4 py-6 sm:px-8 lg:h-full lg:overflow-y-auto lg:px-10">
      <article className="mx-auto max-w-4xl rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
        <nav className="flex flex-wrap items-center gap-2 text-xs text-gray-500" aria-label="Breadcrumb">
          <span>{course.title}</span><span aria-hidden="true">/</span>
          <span>{module.title}</span><span aria-hidden="true">/</span>
          <span className="font-medium text-purple-700">{lesson.title}</span>
        </nav>

        <header className="mt-5 border-b border-gray-100 pb-6">
          <h1 className="text-2xl font-bold text-gray-950 sm:text-3xl">{lesson.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-500">
            {lesson.duration_minutes != null && <span className="inline-flex items-center gap-1.5"><Clock3 className="h-4 w-4" aria-hidden="true" />{lesson.duration_minutes} min</span>}
            <span className="inline-flex items-center gap-1.5 capitalize">{isCodeLesson ? <Code2 className="h-4 w-4" aria-hidden="true" /> : <PlayCircle className="h-4 w-4" aria-hidden="true" />}{typedLesson.content_type ?? (lesson.video_url ? "video" : "lesson")}</span>
          </div>
        </header>

        {lesson.video_url && (
          <div className="mt-7 aspect-video overflow-hidden rounded-2xl bg-black">
            {youtubeEmbed ? (
              <iframe src={youtubeEmbed} title={`${lesson.title} video`} className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            ) : (
              <video src={lesson.video_url} controls className="h-full w-full" preload="metadata">Your browser does not support embedded video.</video>
            )}
          </div>
        )}

        <div className="mt-7">
          {isCodeLesson ? (
            <pre className="overflow-x-auto rounded-xl bg-gray-950 p-4 text-sm leading-6 text-gray-100"><code>{lesson.content}</code></pre>
          ) : (
            renderContent(lesson.content)
          )}
        </div>

        {lessonQuizQuestions.length > 0 && (
          <div className="mt-8">
            <div className="mb-3 rounded-xl border border-purple-100 bg-purple-50 px-4 py-3 text-sm text-purple-900">
              <p className="font-bold">Lesson checkpoint quiz</p>
              <p className="mt-1 leading-6">These questions come directly from the lesson you just studied.</p>
            </div>
            <QuizSection
              questions={lessonQuizQuestions}
              passingScore={lessonQuiz?.passing_score}
              previousScore={lessonQuizScore}
              timeLimitMinutes={lessonQuiz?.time_limit_minutes}
              onComplete={(score, answers) => {
                if (lessonQuiz?.id) onQuizComplete(lessonQuiz.id, score, answers);
              }}
              onPassed={() => {
                if (!isCompleted) onToggleComplete();
              }}
            />
          </div>
        )}

        {!isModuleComplete && isLastLessonInModule && moduleQuizQuestions.length > 0 && (
          <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
            <p className="font-bold">Quiz locked until the full module is complete.</p>
            <p className="mt-1 leading-6">
              Complete all lessons in this module first. The quiz checks the full module, so it appears only after every lesson has been completed.
            </p>
          </div>
        )}

        {canShowModuleQuiz && (
          <div className="mt-8">
            <div className="mb-3 rounded-xl border border-purple-100 bg-purple-50 px-4 py-3 text-sm text-purple-900">
              <p className="font-bold">Module quiz</p>
              <p className="mt-1 leading-6">This checks your understanding of the full module, not just the current lesson.</p>
            </div>
            <QuizSection
              questions={moduleQuizQuestions}
              passingScore={moduleQuiz?.passing_score}
              previousScore={moduleQuizScore}
              timeLimitMinutes={moduleQuiz?.time_limit_minutes}
              onComplete={(score, answers) => {
                if (moduleQuiz?.id) onQuizComplete(moduleQuiz.id, score, answers);
              }}
              onPassed={() => {
                if (!isCompleted) onToggleComplete();
              }}
            />
          </div>
        )}

        <div className="mt-10 border-t border-gray-100 pt-6">
          <button type="button" onClick={onToggleComplete} disabled={saving} className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto ${isCompleted ? "border border-green-200 bg-green-50 text-green-700 hover:bg-green-100" : "bg-purple-600 text-white hover:bg-purple-700"}`}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Check className="h-4 w-4" aria-hidden="true" />}
            {saving ? "Saving…" : isCompleted ? "Mark as incomplete" : "Mark as complete"}
          </button>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <button type="button" onClick={onPrevious} disabled={!hasPrevious} className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Previous
            </button>
            <button type="button" onClick={onNext} disabled={!hasNext} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-40">
              Next <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </article>
    </main>
  );
}
