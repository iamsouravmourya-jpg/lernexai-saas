import { supabase } from "./supabase";

export interface FinalExamQuestion {
  id: string;
  moduleIndex: number;
  difficulty: "easy" | "medium" | "hard";
  question: string;
  options: string[];
}

export interface FinalExamStart {
  attemptId: string;
  startedAt: string;
  timeLimitMinutes: number;
  passingScore: number;
  questions: FinalExamQuestion[];
}

export interface FinalExamResultItem {
  questionId: string;
  moduleIndex: number;
  question: string;
  correctAnswer: number;
  submittedAnswer: number | null;
  isCorrect: boolean;
  explanation: string | null;
}

export interface FinalExamResult {
  score: number;
  passed: boolean;
  passingScore: number;
  correctCount: number;
  total: number;
  timedOut: boolean;
  breakdown: FinalExamResultItem[];
}

export interface FinalExamAttemptSummary {
  id: string;
  score: number | null;
  passed: boolean | null;
  started_at: string;
  completed_at: string | null;
  time_limit_minutes: number;
}

async function functionErrorMessage(error: unknown, fallback: string) {
  const context = (error as { context?: Response } | null)?.context;
  if (context) {
    try {
      const body = await context.clone().json() as { error?: string };
      if (body.error) return body.error;
    } catch {
      // Fall back to the SDK error below when the response is not JSON.
    }
  }
  return error instanceof Error && error.message ? error.message : fallback;
}

export async function fetchFinalExamStatus(courseId: string) {
  const { data, error } = await supabase.functions.invoke<{ lastAttempt: FinalExamAttemptSummary | null }>("final-exam", {
    body: { action: "status", courseId },
  });
  if (error) throw new Error(await functionErrorMessage(error, "Could not load final exam status."));
  return data?.lastAttempt ?? null;
}

export async function startFinalExam(courseId: string): Promise<FinalExamStart> {
  const { data, error } = await supabase.functions.invoke<FinalExamStart>("final-exam", {
    body: { action: "start", courseId },
  });
  if (error) throw new Error(await functionErrorMessage(error, "Could not start the final exam."));
  if (!data) throw new Error("The final exam returned no data.");
  return data;
}

export async function submitFinalExam(
  courseId: string,
  attemptId: string,
  answers: Record<string, number>
): Promise<FinalExamResult> {
  const { data, error } = await supabase.functions.invoke<FinalExamResult>("final-exam", {
    body: { action: "submit", courseId, attemptId, answers },
  });
  if (error) throw new Error(await functionErrorMessage(error, "Could not submit the final exam."));
  if (!data) throw new Error("The final exam returned no result.");
  return data;
}
