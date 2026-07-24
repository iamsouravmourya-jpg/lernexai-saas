-- LernexAI course access and progress policies
-- Run once in the Supabase SQL Editor.

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view courses" ON public.courses;
CREATE POLICY "Authenticated users can view courses"
  ON public.courses FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can view modules" ON public.modules;
CREATE POLICY "Authenticated users can view modules"
  ON public.modules FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can view lessons" ON public.lessons;
CREATE POLICY "Authenticated users can view lessons"
  ON public.lessons FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can view quizzes" ON public.quizzes;
CREATE POLICY "Authenticated users can view quizzes"
  ON public.quizzes FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can view own enrollments" ON public.user_enrollments;
CREATE POLICY "Users can view own enrollments"
  ON public.user_enrollments FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own enrollments" ON public.user_enrollments;
CREATE POLICY "Users can create own enrollments"
  ON public.user_enrollments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own enrollments" ON public.user_enrollments;
CREATE POLICY "Users can update own enrollments"
  ON public.user_enrollments FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own progress" ON public.user_progress;
CREATE POLICY "Users can view own progress"
  ON public.user_progress FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own progress" ON public.user_progress;
CREATE POLICY "Users can create own progress"
  ON public.user_progress FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own progress" ON public.user_progress;
CREATE POLICY "Users can update own progress"
  ON public.user_progress FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE UNIQUE INDEX IF NOT EXISTS user_enrollments_user_course_unique
  ON public.user_enrollments(user_id, course_id);

CREATE UNIQUE INDEX IF NOT EXISTS user_progress_user_lesson_unique
  ON public.user_progress(user_id, lesson_id);
