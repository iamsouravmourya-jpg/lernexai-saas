import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const TIME_LIMIT_MINUTES = 30;
const PASSING_SCORE = 80;
const GRACE_SECONDS = 20;

interface FinalExamQuestionRow {
  id: string;
  module_index: number;
  difficulty: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string | null;
  order_index: number;
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      console.error("[final-exam] Missing required server secrets");
      return jsonResponse({ error: "Final exam is not configured" }, 500);
    }

    const authorization = req.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) {
      return jsonResponse({ error: "Please sign in to take the final exam" }, 401);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const token = authorization.slice("Bearer ".length);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return jsonResponse({ error: "Your session has expired. Please sign in again." }, 401);

    const body = await req.json().catch(() => null) as {
      action?: string;
      courseId?: string;
      attemptId?: string;
      answers?: Record<string, number>;
    } | null;

    const action = body?.action === "submit" ? "submit" : body?.action === "status" ? "status" : "start";
    const courseId = body?.courseId?.trim();
    if (!courseId) return jsonResponse({ error: "Course is required" }, 400);

    const { data: enrollment } = await supabase
      .from("user_enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .maybeSingle();
    if (!enrollment) return jsonResponse({ error: "Enroll in this course to take its final exam" }, 403);

    if (action === "status") {
      const { data: attempts } = await supabase
        .from("final_exam_attempts")
        .select("id, score, passed, started_at, completed_at, time_limit_minutes")
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .order("started_at", { ascending: false })
        .limit(1);
      return jsonResponse({ lastAttempt: attempts?.[0] || null });
    }

    if (action === "start") {
      const { data: questionRows, error: questionsError } = await supabase
        .from("final_exam_questions")
        .select("id, module_index, difficulty, question, options, correct_answer, explanation, order_index")
        .eq("course_id", courseId)
        .order("order_index", { ascending: true });

      if (questionsError || !questionRows || questionRows.length === 0) {
        console.error("[final-exam] Question bank lookup failed", questionsError);
        return jsonResponse({ error: "The final exam is not available for this course yet" }, 404);
      }

      const rows = questionRows as FinalExamQuestionRow[];
      const { data: attempt, error: attemptError } = await supabase
        .from("final_exam_attempts")
        .insert({
          user_id: user.id,
          course_id: courseId,
          question_ids: rows.map(row => row.id),
          time_limit_minutes: TIME_LIMIT_MINUTES,
        })
        .select("id, started_at, time_limit_minutes")
        .single();

      if (attemptError || !attempt) {
        console.error("[final-exam] Could not start attempt", attemptError);
        return jsonResponse({ error: "Could not start the final exam. Please try again." }, 500);
      }

      return jsonResponse({
        attemptId: attempt.id,
        startedAt: attempt.started_at,
        timeLimitMinutes: attempt.time_limit_minutes,
        passingScore: PASSING_SCORE,
        questions: rows.map(row => ({
          id: row.id,
          moduleIndex: row.module_index,
          difficulty: row.difficulty,
          question: row.question,
          options: row.options,
        })),
      });
    }

    // action === "submit"
    const attemptId = body?.attemptId?.trim();
    const answers = body?.answers && typeof body.answers === "object" ? body.answers : {};
    if (!attemptId) return jsonResponse({ error: "Exam attempt is required" }, 400);

    const { data: attempt, error: attemptLookupError } = await supabase
      .from("final_exam_attempts")
      .select("id, question_ids, started_at, completed_at, time_limit_minutes")
      .eq("id", attemptId)
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .maybeSingle();

    if (attemptLookupError || !attempt) return jsonResponse({ error: "Exam attempt not found" }, 404);
    if (attempt.completed_at) return jsonResponse({ error: "This exam attempt was already submitted" }, 409);

    const elapsedSeconds = (Date.now() - new Date(attempt.started_at).getTime()) / 1000;
    const allowedSeconds = attempt.time_limit_minutes * 60 + GRACE_SECONDS;
    const withinTimeLimit = elapsedSeconds <= allowedSeconds;

    const questionIds = (attempt.question_ids as string[]) || [];
    const { data: answerKeyRows, error: answerKeyError } = await supabase
      .from("final_exam_questions")
      .select("id, correct_answer, module_index, question, explanation")
      .in("id", questionIds);

    if (answerKeyError || !answerKeyRows) {
      console.error("[final-exam] Could not load answer key", answerKeyError);
      return jsonResponse({ error: "Could not grade the final exam. Please try again." }, 500);
    }

    const total = answerKeyRows.length;
    let correctCount = 0;
    const breakdown = answerKeyRows.map(row => {
      const submittedAnswer = answers[row.id];
      const isCorrect = submittedAnswer === row.correct_answer;
      if (isCorrect) correctCount += 1;
      return {
        questionId: row.id,
        moduleIndex: row.module_index,
        question: row.question,
        correctAnswer: row.correct_answer,
        submittedAnswer: typeof submittedAnswer === "number" ? submittedAnswer : null,
        isCorrect,
        explanation: row.explanation,
      };
    });

    const score = total === 0 ? 0 : Math.round((correctCount / total) * 100);
    const passed = withinTimeLimit && score >= PASSING_SCORE;

    const { error: updateError } = await supabase
      .from("final_exam_attempts")
      .update({
        answers,
        score,
        passed,
        completed_at: new Date().toISOString(),
      })
      .eq("id", attemptId);

    if (updateError) {
      console.error("[final-exam] Could not save attempt result", updateError);
      return jsonResponse({ error: "Could not save your final exam result. Please try again." }, 500);
    }

    if (passed) {
      const { error: enrollmentUpdateError } = await supabase
        .from("user_enrollments")
        .update({ is_completed: true })
        .eq("user_id", user.id)
        .eq("course_id", courseId);
      if (enrollmentUpdateError) console.error("[final-exam] Could not mark course completed", enrollmentUpdateError);
    }

    return jsonResponse({
      score,
      passed,
      passingScore: PASSING_SCORE,
      correctCount,
      total,
      timedOut: !withinTimeLimit,
      breakdown,
    });
  } catch (error) {
    console.error("[final-exam] Unexpected error", error);
    return jsonResponse({ error: "The final exam encountered an unexpected error" }, 500);
  }
});
