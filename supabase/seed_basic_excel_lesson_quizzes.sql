-- Seed lesson-level checkpoint quizzes for the beginner Excel course.
-- Run this once after the course has been cloned.
--
-- Prerequisite: the quizzes table must have a nullable lesson_id column.
-- This file is idempotent for the target course: it removes any existing
-- lesson-level quizzes for the course and inserts the aligned set again.

ALTER TABLE public.quizzes
  ADD COLUMN IF NOT EXISTS lesson_id uuid REFERENCES public.lessons(id) ON DELETE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS quizzes_lesson_id_unique
  ON public.quizzes(lesson_id)
  WHERE lesson_id IS NOT NULL;

DO $$
DECLARE
  v_course_id uuid;
BEGIN
  SELECT id
    INTO v_course_id
  FROM public.courses
  WHERE title = 'Basic Microsoft Excel & Data Analysis'
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_course_id IS NULL THEN
    RAISE EXCEPTION 'Target course "Basic Microsoft Excel & Data Analysis" was not found.';
  END IF;

  DELETE FROM public.quizzes
  WHERE course_id = v_course_id
    AND lesson_id IS NOT NULL;

  WITH lesson_quiz_seed (module_number, lesson_number, quiz_questions) AS (
    VALUES
      (1, 1, $json$
        [
          {
            "question": "Which shortcut saves an Excel workbook?",
            "options": ["Ctrl + S", "Ctrl + P", "Ctrl + C", "Ctrl + V"],
            "correct_answer": 0,
            "explanation": "Ctrl + S saves the current workbook."
          }
        ]$json$::jsonb),
      (1, 2, $json$
        [
          {
            "question": "What does cell B5 mean?",
            "options": ["Row B, column 5", "Column B and row 5", "The fifth worksheet", "A merged cell"],
            "correct_answer": 1,
            "explanation": "B5 means column B, row 5."
          }
        ]$json$::jsonb),
      (1, 3, $json$
        [
          {
            "question": "What does Ctrl + Home do in Excel?",
            "options": ["Opens the Home tab", "Moves to cell A1", "Saves the workbook", "Toggles filters"],
            "correct_answer": 1,
            "explanation": "Ctrl + Home takes you to the start of the worksheet, usually cell A1."
          }
        ]$json$::jsonb),
      (2, 1, $json$
        [
          {
            "question": "Which entry is treated as text instead of a number?",
            "options": ["250", "0.5", "'250", "250.75"],
            "correct_answer": 2,
            "explanation": "A leading apostrophe forces Excel to treat the value as text."
          }
        ]$json$::jsonb),
      (2, 2, $json$
        [
          {
            "question": "Which number format is most suitable for showing currency with decimals?",
            "options": ["General", "Accounting", "Text", "Date"],
            "correct_answer": 1,
            "explanation": "Accounting format is commonly used for currency values."
          }
        ]$json$::jsonb),
      (3, 1, $json$
        [
          {
            "question": "Which formula adds the values in A1 through A3?",
            "options": ["=SUM(A1:A3)", "=ADD(A1:A3)", "=TOTAL(A1:A3)", "=COUNT(A1:A3)"],
            "correct_answer": 0,
            "explanation": "SUM is the standard Excel function for adding a range."
          }
        ]$json$::jsonb),
      (3, 2, $json$
        [
          {
            "question": "Which IF formula returns Pass when A1 is at least 60?",
            "options": ["=IF(A1>=60,\"Pass\",\"Fail\")", "=IF(A1<=60,\"Pass\",\"Fail\")", "=IF(A1,60,\"Pass\",\"Fail\")", "=IF(\"Pass\",A1>=60,\"Fail\")"],
            "correct_answer": 0,
            "explanation": "The logical test checks whether A1 is greater than or equal to 60."
          }
        ]$json$::jsonb),
      (3, 3, $json$
        [
          {
            "question": "In VLOOKUP, which argument forces an exact match?",
            "options": ["TRUE", "FALSE", "0", "1"],
            "correct_answer": 1,
            "explanation": "Setting range_lookup to FALSE forces VLOOKUP to use exact matching."
          }
        ]$json$::jsonb),
      (4, 1, $json$
        [
          {
            "question": "Which shortcut converts a selected range into an official Excel Table?",
            "options": ["Ctrl + T", "Ctrl + B", "Ctrl + H", "Ctrl + Y"],
            "correct_answer": 0,
            "explanation": "Ctrl + T opens the Create Table dialog for the selected range."
          }
        ]$json$::jsonb),
      (4, 2, $json$
        [
          {
            "question": "What does filtering a table do?",
            "options": ["Deletes matching rows", "Hides rows that do not match the criteria", "Converts text to numbers", "Sorts every column alphabetically"],
            "correct_answer": 1,
            "explanation": "Filtering temporarily hides rows that do not match the filter criteria."
          }
        ]$json$::jsonb),
      (5, 1, $json$
        [
          {
            "question": "Which chart type is usually best for showing trends over time?",
            "options": ["Line chart", "Pie chart", "Doughnut chart", "Radar chart"],
            "correct_answer": 0,
            "explanation": "Line charts are ideal for time-based trends."
          }
        ]$json$::jsonb),
      (6, 1, $json$
        [
          {
            "question": "In the Budget Tracker project, how is variance calculated?",
            "options": ["Planned minus Actual", "Actual minus Planned", "Revenue divided by cost", "Average of all categories"],
            "correct_answer": 1,
            "explanation": "Variance is calculated as Actual minus Planned in the project flow."
          }
        ]$json$::jsonb)
  )
  INSERT INTO public.quizzes (course_id, module_index, lesson_id, questions, passing_score, time_limit_minutes)
  SELECT
    v_course_id,
    m.module_number,
    l.id,
    lesson_quiz_seed.quiz_questions,
    80,
    5
  FROM lesson_quiz_seed
  JOIN public.modules AS m
    ON m.course_id = v_course_id
   AND m.module_number = lesson_quiz_seed.module_number
  JOIN public.lessons AS l
    ON l.module_id = m.id
   AND l.lesson_number = lesson_quiz_seed.lesson_number
  ORDER BY m.module_number, l.lesson_number;

  RAISE NOTICE 'Seeded lesson quizzes for course id %', v_course_id;
END $$;
