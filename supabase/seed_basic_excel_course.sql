-- Clone the existing Microsoft Excel Essentials course into a second beginner Excel course.
-- Run this file once in the Supabase SQL Editor.
--
-- What it does:
-- 1) Finds the existing flagship course by title
-- 2) Recreates a second course with the new beginner metadata
-- 3) Copies modules, lessons, module quizzes, and final exam questions
-- 4) Keeps the learner flow identical to the first course

DO $$
DECLARE
  v_source_course_id uuid;
  v_target_course_id uuid;
  v_source_title text := 'Microsoft Excel Essentials';
  v_target_title text := 'Basic Microsoft Excel & Data Analysis';
BEGIN
  SELECT id
    INTO v_source_course_id
  FROM public.courses
  WHERE title = v_source_title
  ORDER BY created_at ASC
  LIMIT 1;

  IF v_source_course_id IS NULL THEN
    RAISE EXCEPTION 'Source course "%" was not found.', v_source_title;
  END IF;

  -- Re-run safe: remove any previously created copy first.
  DELETE FROM public.courses
  WHERE title = v_target_title;

  INSERT INTO public.courses (
    title,
    description,
    category,
    difficulty,
    is_premium,
    total_modules,
    estimated_hours,
    cover_image_url
  )
  VALUES (
    v_target_title,
    'Master essential spreadsheet skills, data manipulation techniques, formulas, functions, and fundamental visual analytics. This course takes you from absolute beginner to a proficient Excel user capable of processing, cleaning, analyzing, and visualizing business data.',
    'Productivity',
    'beginner',
    false,
    6,
    30,
    'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1200&q=80'
  )
  RETURNING id INTO v_target_course_id;

  CREATE TEMP TABLE tmp_module_map (
    source_module_id uuid PRIMARY KEY,
    target_module_id uuid NOT NULL,
    module_number integer NOT NULL
  ) ON COMMIT DROP;

  INSERT INTO tmp_module_map (source_module_id, target_module_id, module_number)
  SELECT
    m.id,
    gen_random_uuid(),
    COALESCE(m.module_number, m.order_index)
  FROM public.modules AS m
  WHERE m.course_id = v_source_course_id
  ORDER BY m.order_index;

  INSERT INTO public.modules (
    id,
    course_id,
    module_number,
    title,
    description,
    order_index
  )
  SELECT
    mm.target_module_id,
    v_target_course_id,
    src.module_number,
    src.title,
    src.description,
    src.order_index
  FROM public.modules AS src
  JOIN tmp_module_map AS mm
    ON mm.source_module_id = src.id
  WHERE src.course_id = v_source_course_id
  ORDER BY src.order_index;

  INSERT INTO public.lessons (
    id,
    module_id,
    lesson_number,
    title,
    content,
    content_type,
    video_url,
    duration_minutes,
    order_index
  )
  SELECT
    gen_random_uuid(),
    mm.target_module_id,
    src.lesson_number,
    src.title,
    src.content,
    src.content_type,
    src.video_url,
    src.duration_minutes,
    src.order_index
  FROM public.lessons AS src
  JOIN tmp_module_map AS mm
    ON mm.source_module_id = src.module_id
  ORDER BY mm.module_number, src.order_index;

  INSERT INTO public.quizzes (
    id,
    course_id,
    module_index,
    questions,
    passing_score,
    time_limit_minutes
  )
  SELECT
    gen_random_uuid(),
    v_target_course_id,
    q.module_index,
    q.questions,
    q.passing_score,
    q.time_limit_minutes
  FROM public.quizzes AS q
  WHERE q.course_id = v_source_course_id
  ORDER BY q.module_index;

  INSERT INTO public.final_exam_questions (
    id,
    course_id,
    module_index,
    difficulty,
    question,
    options,
    correct_answer,
    explanation,
    order_index
  )
  SELECT
    gen_random_uuid(),
    v_target_course_id,
    fe.module_index,
    fe.difficulty,
    fe.question,
    fe.options,
    fe.correct_answer,
    fe.explanation,
    fe.order_index
  FROM public.final_exam_questions AS fe
  WHERE fe.course_id = v_source_course_id
  ORDER BY fe.order_index;

  RAISE NOTICE 'Created course "%" with id %', v_target_title, v_target_course_id;
END $$;
