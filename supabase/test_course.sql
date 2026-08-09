-- Test course for quick certificate flow testing
-- Run this in Supabase SQL Editor

-- Insert test course
INSERT INTO public.courses (id, title, description, category, difficulty, is_premium, total_modules, estimated_hours)
VALUES (
  gen_random_uuid(),
  'Test Course for Certificate Flow',
  'A quick test course to verify certificate purchase and download flow.',
  'Testing',
  'Beginner',
  false,
  1,
  1
);

-- Get the course ID for subsequent inserts
DO $$
DECLARE
  course_id uuid;
  module_id uuid;
  lesson_id uuid;
BEGIN
  SELECT id INTO course_id FROM public.courses WHERE title = 'Test Course for Certificate Flow' LIMIT 1;

  -- Insert 1 module for test course
  INSERT INTO public.modules (id, course_id, module_number, title, description, order_index)
  VALUES (
    gen_random_uuid(),
    course_id,
    1,
    'Module 1: Certificate Flow Testing',
    'Learn the basics of certificate flow testing.',
    1
  ) RETURNING id INTO module_id;

  -- Insert 1 lesson for the module
  INSERT INTO public.lessons (id, module_id, lesson_number, title, content, content_type, order_index, duration_minutes)
  VALUES (
    gen_random_uuid(),
    module_id,
    1,
    'Certificate Flow Basics',
    'This lesson covers the certificate purchase and download flow. Complete this lesson to unlock the final exam.',
    'text',
    1,
    5
  ) RETURNING id INTO lesson_id;

  -- Insert quiz for module 1
  INSERT INTO public.quizzes (course_id, module_index, questions, passing_score, time_limit_minutes)
  VALUES (
    course_id,
    1,
    $questions$[
      {
        "question": "What is the purpose of this test course?",
        "options": ["To test certificate flow", "To learn advanced topics", "For entertainment", "No purpose"],
        "correct_answer": 0
      }
    ]$questions$::jsonb,
    80,
    5
  );

  -- Insert 1 final exam question
  INSERT INTO public.final_exam_questions (id, course_id, module_index, difficulty, question, options, correct_answer, explanation, order_index)
  VALUES (
    gen_random_uuid(),
    course_id,
    1,
    'easy',
    'What is the first step in the certificate flow?',
    '["Pass the final exam", "Complete the course", "Pay for certificate", "Download certificate"]',
    0,
    'You must first complete the course and pass the final exam before purchasing a certificate.',
    1
  );
END $$;
