import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useLocation } from "wouter";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Loader2,
  ShieldQuestion,
  Trophy,
  XCircle,
} from "lucide-react";
import { fetchCourseWithModules, type Course } from "@/lib/course";
import {
  fetchFinalExamStatus,
  startFinalExam,
  submitFinalExam,
  type FinalExamAttemptSummary,
  type FinalExamQuestion,
  type FinalExamResult,
} from "@/lib/finalExam";

type Stage = "loading" | "intro" | "in_progress" | "submitting" | "result" | "error";

function formatClock(totalSeconds: number) {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function FinalExam() {
  const { courseId } = useParams<{ courseId: string }>();
  const [, setLocation] = useLocation();

  const [stage, setStage] = useState<Stage>("loading");
  const [course, setCourse] = useState<Course | null>(null);
  const [lastAttempt, setLastAttempt] = useState<FinalExamAttemptSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<FinalExamQuestion[]>([]);
  const [passingScore, setPassingScore] = useState(40);
  const [deadline, setDeadline] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<FinalExamResult | null>(null);

  const submittingRef = useRef(false);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!courseId) return;
      try {
        const [loadedCourse, attempt] = await Promise.all([
          fetchCourseWithModules(courseId),
          fetchFinalExamStatus(courseId),
        ]);
        if (!active) return;
        setCourse(loadedCourse);
        setLastAttempt(attempt);
        setStage("intro");
      } catch (loadError) {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : "Could not load the final exam.");
        setStage("error");
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [courseId]);

  const submitExam = useCallback(async (finalAnswers: Record<string, number>) => {
    if (!courseId || !attemptId || submittingRef.current) return;
    submittingRef.current = true;
    setStage("submitting");
    setError(null);

    try {
      const examResult = await submitFinalExam(courseId, attemptId, finalAnswers);
      setResult(examResult);
      setStage("result");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not submit the final exam.");
      setStage("error");
    } finally {
      submittingRef.current = false;
    }
  }, [courseId, attemptId]);

  // Timer countdown
  useEffect(() => {
    if (stage !== "in_progress" || deadline === null) return;

    const tick = () => {
      const secondsLeft = Math.max(0, Math.round((deadline - Date.now()) / 1000));
      setRemainingSeconds(secondsLeft);
      if (secondsLeft <= 0) {
        void submitExam(answers);
      }
    };

    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [stage, deadline, submitExam, answers]);

  // Auto-redirect passing exams to certificate checkout after brief celebration
  useEffect(() => {
    if (stage === "result" && result) {
      const isPassing = result.passed || result.score >= 40;
      if (isPassing && courseId) {
        const timer = setTimeout(() => {
          setLocation(`/certificate/${courseId}?fromExam=true`);
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
    return undefined;
  }, [stage, result, courseId]);

  async function handleStart() {
    if (!courseId) return;
    setError(null);
    try {
      const start = await startFinalExam(courseId);
      setAttemptId(start.attemptId);
      setQuestions(start.questions);
      setPassingScore(start.passingScore);
      setAnswers({});
      setCurrentIndex(0);
      setDeadline(new Date(start.startedAt).getTime() + start.timeLimitMinutes * 60 * 1000);
      setStage("in_progress");
    } catch (startError) {
      setError(startError instanceof Error ? startError.message : "Could not start the final exam.");
    }
  }

  const currentQuestion = questions[currentIndex];
  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);

  if (stage === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" aria-hidden="true" />
      </div>
    );
  }

  if (stage === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6 text-center">
        <div className="max-w-md rounded-2xl border border-red-200 bg-red-50 p-8">
          <AlertTriangle className="mx-auto h-10 w-10 text-red-500" aria-hidden="true" />
          <h1 className="mt-4 text-xl font-bold text-red-900">Could not load the final exam</h1>
          <p className="mt-2 text-sm text-red-700">{error}</p>
          <button onClick={() => setLocation(`/learning/${courseId}`)} className="mt-6 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-purple-700">Back to course</button>
        </div>
      </div>
    );
  }

  if (stage === "intro") {
    const alreadyPassed = lastAttempt?.passed === true;
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-2xl rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-10">
          <ShieldQuestion className="h-12 w-12 text-purple-600" aria-hidden="true" />
          <p className="mt-4 text-xs font-bold uppercase tracking-wider text-purple-600">Final exam</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">{course?.title || "Course"} \u2014 Final Exam</h1>
          <p className="mt-3 text-gray-600">This exam covers every module of the course. Answer thoughtfully \u2014 once the timer starts, it cannot be paused.</p>

          <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-purple-50 p-4"><dt className="text-xs font-semibold text-purple-600">Questions</dt><dd className="mt-1 text-2xl font-bold text-gray-900">25</dd></div>
            <div className="rounded-xl bg-purple-50 p-4"><dt className="text-xs font-semibold text-purple-600">Time limit</dt><dd className="mt-1 text-2xl font-bold text-gray-900">30 min</dd></div>
            <div className="rounded-xl bg-purple-50 p-4"><dt className="text-xs font-semibold text-purple-600">Passing score</dt><dd className="mt-1 text-2xl font-bold text-gray-900">40%</dd></div>
          </dl>

          {lastAttempt && (
            <div className={`mt-6 rounded-xl border p-4 text-sm ${alreadyPassed ? "border-green-200 bg-green-50 text-green-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
              {alreadyPassed
                ? `You already passed the final exam with a score of ${lastAttempt.score}%. Your certificate is unlocked.`
                : `Your last attempt scored ${lastAttempt.score ?? 0}%. Review the course and try again when you're ready.`}
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button onClick={() => setLocation(`/learning/${courseId}`)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to course</button>
            <button onClick={handleStart} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white hover:bg-purple-700">{alreadyPassed ? "Retake final exam" : "Start final exam"}</button>
          </div>
          {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        </div>
      </div>
    );
  }

  if (stage === "submitting") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-gray-50 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" aria-hidden="true" />
        <p className="text-sm font-medium text-gray-600">Grading your final exam\u2026</p>
      </div>
    );
  }

  if (stage === "result" && result) {
    const isPassing = result.passed || result.score >= 40;

    // For passing exams: show brief celebration before redirect
    if (isPassing) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-50 px-6 text-center">
          <Trophy className="h-20 w-20 text-green-600 animate-bounce" aria-hidden="true" />
          <div>
            <h1 className="text-5xl font-bold text-gray-900">{result.score}%</h1>
            <p className="mt-3 text-xl font-semibold text-green-700">Congratulations! You passed!</p>
            <p className="mt-2 text-sm text-gray-600">Redirecting to certificate checkout...</p>
          </div>
        </div>
      );
    }

    // For failing exams: show full result page
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-2xl rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-10">
          <div className="text-center">
            <Trophy className="mx-auto h-12 w-12 text-amber-600" aria-hidden="true" />
            <p className="mt-3 text-xs font-bold uppercase tracking-wider text-gray-500">Final exam result</p>
            <h1 className="mt-1 text-4xl font-bold text-gray-900">{result.score}%</h1>
            <p className="mt-2 text-sm text-gray-600">You answered {result.correctCount} of {result.total} questions correctly.</p>
            {result.timedOut && <p className="mt-1 text-sm font-semibold text-amber-700">Time expired before all answers were confirmed.</p>}
            <p className="mt-3 text-base font-semibold text-amber-700">
              Score {passingScore}% or higher to pass.
            </p>
          </div>

          <div className="mt-8 space-y-3">
            <h2 className="text-sm font-bold text-gray-900">Review your answers</h2>
            {result.breakdown.map((item, index) => (
              <div key={item.questionId} className={`rounded-xl border p-4 text-sm ${item.isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                <div className="flex items-start gap-2">
                  {item.isCorrect ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" aria-hidden="true" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-hidden="true" />}
                  <div>
                    <p className="font-semibold text-gray-900">{index + 1}. {item.question}</p>
                    {!item.isCorrect && item.explanation && <p className="mt-1 text-gray-600">{item.explanation}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button onClick={() => setLocation(`/learning/${courseId}`)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50">Back to course</button>
            <button onClick={() => setStage("intro")} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white hover:bg-purple-700">Try again</button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;
  const selectedAnswer = answers[currentQuestion.id];
  const isLastQuestion = currentIndex === questions.length - 1;
  const lowTime = remainingSeconds <= 60;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-500">Question {currentIndex + 1} of {questions.length}</span>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold ${lowTime ? "bg-red-100 text-red-700" : "bg-purple-100 text-purple-700"}`}>
            <Clock3 className="h-4 w-4" aria-hidden="true" /> {formatClock(remainingSeconds)}
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-gray-200">
          <div className="h-full rounded-full bg-purple-600 transition-all" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
        </div>

        <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <fieldset>
            <legend className="text-lg font-bold leading-7 text-gray-900">{currentQuestion.question}</legend>
            <div className="mt-5 grid gap-3">
              {currentQuestion.options.map((option, optionIndex) => {
                const isSelected = selectedAnswer === optionIndex;
                return (
                  <label key={optionIndex} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-sm transition ${isSelected ? "border-purple-500 bg-purple-50 text-purple-900 ring-1 ring-purple-200" : "border-gray-200 text-gray-700 hover:border-purple-200 hover:bg-purple-50/50"}`}>
                    <input type="radio" name={`final-exam-question-${currentQuestion.id}`} checked={isSelected} onChange={() => setAnswers(current => ({ ...current, [currentQuestion.id]: optionIndex }))} className="accent-purple-600" />
                    <span className="flex-1">{option}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-7 flex items-center justify-between gap-3">
            <button type="button" onClick={() => setCurrentIndex(index => Math.max(0, index - 1))} disabled={currentIndex === 0} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Previous</button>
            {isLastQuestion ? (
              <button type="button" onClick={() => void submitExam(answers)} className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700">Submit exam</button>
            ) : (
              <button type="button" onClick={() => setCurrentIndex(index => Math.min(questions.length - 1, index + 1))} className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-purple-700">Next question <ArrowRight className="h-4 w-4" aria-hidden="true" /></button>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
          <span>{answeredCount} of {questions.length} answered</span>
          <button type="button" onClick={() => void submitExam(answers)} className="font-semibold text-purple-700 hover:underline">Submit exam now</button>
        </div>
      </div>
    </div>
  );
}
