import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, ShieldQuestion, Trophy, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface QuizSectionProps {
  questions: QuizQuestion[];
  passingScore?: number;
  previousScore?: number;
  timeLimitMinutes?: number;
  onComplete?: (score: number, answers: Record<string, number>) => void;
  onPassed: (score: number) => void;
}

function formatClock(totalSeconds: number) {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

const DEFAULT_PASS_PERCENTAGE = 80;
const MAX_QUESTIONS = 5;

export default function QuizSection({
  questions,
  passingScore = DEFAULT_PASS_PERCENTAGE,
  previousScore,
  timeLimitMinutes,
  onComplete,
  onPassed,
}: QuizSectionProps) {
  const quizQuestions = useMemo(() => questions.slice(0, MAX_QUESTIONS), [questions]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const deadlineRef = useRef<number | null>(null);

  const currentQuestion = quizQuestions[currentIndex];
  const selectedAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const isAnswered = selectedAnswer !== undefined;
  const isCurrentCorrect = isAnswered && selectedAnswer === currentQuestion.correctAnswer;
  const correctCount = quizQuestions.filter(question => answers[question.id] === question.correctAnswer).length;
  const score = finalScore ?? (quizQuestions.length === 0 ? 0 : Math.round((correctCount / quizQuestions.length) * 100));
  const passed = score >= passingScore;

  function selectAnswer(optionIndex: number) {
    if (!currentQuestion || isAnswered) return;
    setAnswers(current => ({ ...current, [currentQuestion.id]: optionIndex }));
  }

  function computeAndFinish(finalAnswers: Record<string, number>) {
    const finalCorrectCount = quizQuestions.filter(question => finalAnswers[question.id] === question.correctAnswer).length;
    const calculatedScore = quizQuestions.length === 0 ? 0 : Math.round((finalCorrectCount / quizQuestions.length) * 100);
    setFinalScore(calculatedScore);
    setSubmitted(true);
    onComplete?.(calculatedScore, finalAnswers);
    if (calculatedScore >= passingScore) onPassed(calculatedScore);
  }

  function finishQuiz() {
    if (!currentQuestion || selectedAnswer === undefined) return;
    computeAndFinish(answers);
  }

  function retryQuiz() {
    setAnswers({});
    setCurrentIndex(0);
    setSubmitted(false);
    setFinalScore(null);
    deadlineRef.current = null;
    setRemainingSeconds(null);
  }

  function openQuiz() {
    retryQuiz();
    setDialogOpen(true);
  }

  useEffect(() => {
    if (!dialogOpen || submitted || !timeLimitMinutes) return;
    if (deadlineRef.current === null) {
      deadlineRef.current = Date.now() + timeLimitMinutes * 60 * 1000;
    }

    const tick = () => {
      const secondsLeft = Math.max(0, Math.round((deadlineRef.current! - Date.now()) / 1000));
      setRemainingSeconds(secondsLeft);
      if (secondsLeft <= 0) computeAndFinish(answers);
    };

    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialogOpen, submitted, timeLimitMinutes]);

  if (quizQuestions.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
        <h2 className="text-lg font-bold text-gray-900">Quiz coming soon</h2>
        <p className="mt-1 text-sm text-gray-500">Questions for this module are not available yet.</p>
      </section>
    );
  }

  return (
    <>
      <section className="rounded-2xl border-2 border-dashed border-purple-200 bg-purple-50/50 p-6 text-center sm:p-8">
        <ShieldQuestion className="mx-auto h-9 w-9 text-purple-600" aria-hidden="true" />
        <h2 className="mt-3 text-lg font-bold text-gray-900">Module quiz</h2>
        <p className="mt-1 text-sm text-gray-600">
          Answer {quizQuestions.length} question{quizQuestions.length > 1 ? "s" : ""} in a focused pop-up to complete this module.
        </p>
        {previousScore !== undefined && (
          <span className="mt-3 inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700">Best score: {previousScore}%</span>
        )}
        <div className="mt-5">
          <button type="button" onClick={openQuiz} className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-purple-700">
            {previousScore !== undefined ? "Retake module quiz" : "Take module quiz"}
          </button>
        </div>
      </section>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          onInteractOutside={(event) => event.preventDefault()}
          onEscapeKeyDown={(event) => event.preventDefault()}
          className="max-h-[90vh] w-full max-w-lg overflow-y-auto sm:rounded-2xl"
        >
          {submitted ? (
            <div className="text-center">
              <Trophy className={`mx-auto h-10 w-10 ${passed ? "text-green-600" : "text-amber-600"}`} aria-hidden="true" />
              <DialogHeader className="items-center text-center">
                <DialogTitle className="text-xs font-bold uppercase tracking-wider text-gray-500">Module quiz result</DialogTitle>
                <DialogDescription className="text-3xl font-bold text-gray-900">{score}%</DialogDescription>
              </DialogHeader>
              <p className="mt-2 text-sm text-gray-700">You answered {correctCount} of {quizQuestions.length} questions correctly.</p>
              <p className={`mt-2 text-sm font-semibold ${passed ? "text-green-700" : "text-amber-700"}`}>{passed ? "Quiz passed \u2014 module complete!" : `Score ${passingScore}% or higher to pass.`}</p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <button type="button" onClick={retryQuiz} className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">Retake quiz</button>
                <button type="button" onClick={() => setDialogOpen(false)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700">Continue</button>
              </div>
            </div>
          ) : (
            <div>
              <DialogHeader>
                <div className="flex items-center justify-between gap-3">
                  <DialogTitle className="text-xs font-bold uppercase tracking-wider text-purple-600">Question {currentIndex + 1} of {quizQuestions.length}</DialogTitle>
                  {remainingSeconds !== null && (
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${remainingSeconds <= 30 ? "bg-red-100 text-red-700" : "bg-purple-100 text-purple-700"}`}>
                      <Clock3 className="h-3.5 w-3.5" aria-hidden="true" /> {formatClock(remainingSeconds)}
                    </span>
                  )}
                </div>
                <DialogDescription className="text-lg font-bold leading-7 text-gray-900">{currentQuestion.question}</DialogDescription>
              </DialogHeader>

              <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-purple-600 transition-all" style={{ width: `${((currentIndex + 1) / quizQuestions.length) * 100}%` }} />
              </div>

              <fieldset className="mt-6 min-w-0">
                <div className="grid gap-3">
                  {currentQuestion.options.map((option, optionIndex) => {
                    const isSelected = selectedAnswer === optionIndex;
                    const isCorrectOption = optionIndex === currentQuestion.correctAnswer;
                    const optionClasses = !isAnswered
                      ? isSelected
                        ? "border-purple-500 bg-purple-50 text-purple-900 ring-1 ring-purple-200"
                        : "border-gray-200 text-gray-700 hover:border-purple-200 hover:bg-purple-50/50"
                      : isCorrectOption
                        ? "border-green-500 bg-green-50 text-green-900 ring-1 ring-green-200"
                        : isSelected
                          ? "border-red-500 bg-red-50 text-red-900 ring-1 ring-red-200"
                          : "border-gray-200 text-gray-400";
                    return (
                      <label key={optionIndex} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-sm transition ${optionClasses} ${isAnswered ? "cursor-default" : ""}`}>
                        <input type="radio" name={`question-${currentQuestion.id}`} checked={isSelected} disabled={isAnswered} onChange={() => selectAnswer(optionIndex)} className="accent-purple-600" />
                        <span className="flex-1">{option}</span>
                        {isAnswered && isCorrectOption && <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" aria-hidden="true" />}
                        {isAnswered && isSelected && !isCorrectOption && <XCircle className="h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />}
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              {isAnswered && (
                <div className={`mt-4 rounded-xl border p-4 text-sm ${isCurrentCorrect ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"}`} role="status">
                  <p className="font-bold">{isCurrentCorrect ? "Correct!" : "Not quite."}</p>
                  {currentQuestion.explanation && <p className="mt-1 text-sm leading-6 opacity-90">{currentQuestion.explanation}</p>}
                </div>
              )}

              <div className="mt-6 flex items-center justify-between gap-3">
                <button type="button" onClick={() => setCurrentIndex(index => Math.max(0, index - 1))} disabled={currentIndex === 0} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"><ArrowLeft className="h-4 w-4" /> Previous</button>
                {currentIndex < quizQuestions.length - 1 ? (
                  <button type="button" onClick={() => setCurrentIndex(index => index + 1)} disabled={!isAnswered} className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">Next question <ArrowRight className="h-4 w-4" /></button>
                ) : (
                  <button type="button" onClick={finishQuiz} disabled={!isAnswered} className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">Finish and show score</button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
