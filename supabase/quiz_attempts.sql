-- Store one quiz attempt per user and quiz.

CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id uuid REFERENCES public.quizzes(id) ON DELETE CASCADE,
  score integer CHECK (score BETWEEN 0 AND 100),
  answers jsonb DEFAULT '{}'::jsonb,
  completed_at timestamptz DEFAULT now(),
  UNIQUE (user_id, quiz_id)
);

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own quiz attempts" ON public.quiz_attempts;
CREATE POLICY "Users can view own quiz attempts"
  ON public.quiz_attempts FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own quiz attempts" ON public.quiz_attempts;
CREATE POLICY "Users can create own quiz attempts"
  ON public.quiz_attempts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own quiz attempts" ON public.quiz_attempts;
CREATE POLICY "Users can update own quiz attempts"
  ON public.quiz_attempts FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS quiz_attempts_user_id_idx
  ON public.quiz_attempts(user_id);

CREATE INDEX IF NOT EXISTS quiz_attempts_quiz_id_idx
  ON public.quiz_attempts(quiz_id);
