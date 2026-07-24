-- Final exam schema for LernexAI courses.
-- Questions are service-role only (never sent to the client with answers attached).
-- Run once in the Supabase SQL Editor.

-- Per-module quiz timers (minutes), matching the agreed pacing plan.
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS time_limit_minutes integer;

UPDATE public.quizzes SET time_limit_minutes = 5 WHERE module_index IN (1, 2, 6);
UPDATE public.quizzes SET time_limit_minutes = 8 WHERE module_index IN (3, 4, 5);

-- Final exam question bank (25 questions: 8 easy / 12 medium / 5 hard).
CREATE TABLE IF NOT EXISTS public.final_exam_questions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  module_index integer NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  question text NOT NULL,
  options jsonb NOT NULL,
  correct_answer integer NOT NULL,
  explanation text,
  order_index integer NOT NULL DEFAULT 0
);

ALTER TABLE public.final_exam_questions ENABLE ROW LEVEL SECURITY;
-- Intentionally no SELECT policy for authenticated/anon: only the service-role
-- Edge Function can read questions (including correct_answer), so answers are
-- never exposed to the browser.

-- One final exam attempt result per user per course. Grading happens only
-- inside the service-role Edge Function.
CREATE TABLE IF NOT EXISTS public.final_exam_attempts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  question_ids uuid[] NOT NULL,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  score integer CHECK (score BETWEEN 0 AND 100),
  passed boolean,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  time_limit_minutes integer NOT NULL DEFAULT 30,
  UNIQUE (user_id, course_id, started_at)
);

ALTER TABLE public.final_exam_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own final exam attempts" ON public.final_exam_attempts;
CREATE POLICY "Users can view own final exam attempts"
  ON public.final_exam_attempts FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS final_exam_attempts_user_course_idx
  ON public.final_exam_attempts(user_id, course_id);

-- Seed the 25-question final exam for Microsoft Excel Essentials.
DO $$
DECLARE
  v_course_id uuid;
BEGIN
  SELECT id INTO v_course_id FROM public.courses ORDER BY created_at ASC LIMIT 1;
  IF v_course_id IS NULL THEN
    RAISE NOTICE 'No course found, skipping final exam seed.';
    RETURN;
  END IF;

  DELETE FROM public.final_exam_questions WHERE course_id = v_course_id;

  INSERT INTO public.final_exam_questions (course_id, module_index, difficulty, question, options, correct_answer, explanation, order_index)
  VALUES
  (v_course_id, 1, 'easy', 'What is the maximum number of rows in an Excel worksheet?', '["16,384", "1,048,576", "65,536", "1,000,000"]', 1, 'Excel worksheets support up to 1,048,576 rows and 16,384 columns.', 1),
  (v_course_id, 1, 'easy', 'Which keyboard shortcut saves the current workbook?', '["Ctrl + N", "Ctrl + S", "Ctrl + F", "Ctrl + H"]', 1, 'Ctrl + S saves the workbook; Ctrl + N creates a new one.', 2),
  (v_course_id, 1, 'medium', 'What does the cell address B5 represent?', '["Row B, column 5", "Column B intersecting row 5", "The 5th cell in column B only", "Sheet B, cell 5"]', 1, 'A cell address is column letter + row number, so B5 is column B intersecting row 5.', 3),

  (v_course_id, 2, 'easy', 'By default, how are text values aligned in a cell?', '["Right-aligned", "Center-aligned", "Left-aligned", "Justified"]', 2, 'Text (labels) are left-aligned by default in Excel.', 4),
  (v_course_id, 2, 'easy', 'Which shortcut applies Bold formatting to selected text?', '["Ctrl + B", "Ctrl + I", "Ctrl + U", "Ctrl + F"]', 0, 'Ctrl + B toggles Bold. Ctrl + I is Italic and Ctrl + U is Underline.', 5),
  (v_course_id, 2, 'medium', 'By default, how are number values aligned in a cell?', '["Left-aligned", "Right-aligned", "Center-aligned", "They are not aligned"]', 1, 'Numbers are right-aligned by default, unlike text.', 6),
  (v_course_id, 2, 'medium', 'Which path opens the Format Cells dialog?', '["Right-click a cell then choose Format Cells", "Insert then Format Cells", "Data then Format Cells", "View then Format Cells"]', 0, 'Format Cells is available from the right-click context menu (or Home tab).', 7),

  (v_course_id, 3, 'easy', 'Every Excel formula must begin with which symbol?', '["#", "@", "=", "$"]', 2, 'Formulas always start with an equals sign (=).', 8),
  (v_course_id, 3, 'medium', 'A1=5000, A2=7500, A3=6000. What does =SUM(A1:A3) return?', '["18500", "6166.67", "7500", "12500"]', 0, '5000 + 7500 + 6000 = 18500.', 9),
  (v_course_id, 3, 'medium', 'Using the same values (5000, 7500, 6000), what does =AVERAGE(A1:A3) return?', '["6166.67", "18500", "6000", "7500"]', 0, '18500 / 3 = 6166.67.', 10),
  (v_course_id, 3, 'medium', 'What does =IF(A1>=60,"Pass","Fail") return when A1 is 45?', '["Pass", "Fail", "TRUE", "#VALUE!"]', 1, '45 is not >= 60, so the false branch "Fail" is returned.', 11),
  (v_course_id, 3, 'medium', 'In VLOOKUP, what does setting range_lookup to FALSE do?', '["Finds an approximate match", "Finds an exact match", "Ignores the lookup_value", "Searches only the first column"]', 1, 'FALSE forces an exact match; TRUE allows an approximate match.', 12),
  (v_course_id, 3, 'hard', 'Employee table: ID 1=Arjun/Sales, 2=Priya/HR, 3=Rahul/IT (columns ID, Name, Department). What does =VLOOKUP(3, A2:C4, 3, FALSE) return?', '["Rahul", "IT", "3", "#N/A"]', 1, 'column_index 3 is the Department column, and ID 3 belongs to Rahul in IT.', 13),
  (v_course_id, 3, 'hard', 'For =IF(A1>=90,"A+",IF(A1>=80,"A",IF(A1>=70,"B","C"))) with A1 = 82, what is the result?', '["A+", "A", "B", "C"]', 1, '82 is >= 80 but < 90, so it falls into the "A" branch.', 14),

  (v_course_id, 4, 'easy', 'Which shortcut converts a selected data range into a formatted Excel Table?', '["Ctrl + T", "Ctrl + F", "Ctrl + L", "Ctrl + D"]', 0, 'Ctrl + T converts a selected range into a Table.', 15),
  (v_course_id, 4, 'medium', 'What is the main advantage of a structured reference like =SUM(Table1[Sales]) over =SUM(A2:A100)?', '["It calculates faster", "It automatically adjusts as the table grows", "It only works with text", "It removes the need for the equals sign"]', 1, 'Structured references auto-expand as rows are added to the table.', 16),
  (v_course_id, 4, 'medium', 'Which shortcut turns on filter dropdown arrows for a selected data range?', '["Ctrl + Shift + L", "Ctrl + Shift + F", "Ctrl + Alt + T", "Ctrl + Shift + T"]', 0, 'Ctrl + Shift + L toggles AutoFilter dropdown arrows on headers.', 17),
  (v_course_id, 4, 'medium', 'In an Excel Table, what is the purpose of the Totals Row?', '["To hide the last row of data", "To quickly Sum, Average, or Count a column", "To freeze the header row", "To delete duplicate rows"]', 1, 'The Totals Row provides quick aggregate calculations like Sum, Average, and Count.', 18),

  (v_course_id, 5, 'easy', 'Which chart type is best for showing proportions of a whole?', '["Line chart", "Pie chart", "Column chart", "Area chart"]', 1, 'Pie charts are best for showing proportions of a whole.', 19),
  (v_course_id, 5, 'medium', 'Which chart type is best suited for showing trends over time?', '["Pie chart", "Line chart", "Bar chart", "Column chart only"]', 1, 'Line charts are ideal for showing trends over time.', 20),
  (v_course_id, 5, 'medium', 'What is the first step to create a column chart from your data?', '["Insert a text box", "Select your data including headers", "Merge all cells", "Apply conditional formatting"]', 1, 'You must select the data (including headers) before inserting a chart.', 21),
  (v_course_id, 5, 'hard', 'You want to show a trend over time while also emphasizing total volume beneath the line. Which chart type best fits this?', '["Pie chart", "Area chart", "Bar chart", "Column chart"]', 1, 'Area charts show trends with volume, combining a line trend with a filled area.', 22),

  (v_course_id, 6, 'easy', 'In the Budget Tracker project (Planned in column B, Actual in column C), which formula calculates the variance for a category?', '["=B2-C2", "=C2-B2", "=SUM(B2:C2)", "=AVERAGE(B2:C2)"]', 1, 'Variance is Actual minus Planned, so =C2-B2.', 23),
  (v_course_id, 6, 'hard', 'Food category: Planned 8000, Actual 9500. What does =IF(C2>B2,"Over Budget","Within Budget") return for this row?', '["Within Budget", "Over Budget", "#VALUE!", "0"]', 1, '9500 is greater than 8000, so the condition is true and returns "Over Budget".', 24),
  (v_course_id, 6, 'hard', 'Budget Tracker totals: Planned = 50000+15000+8000+3000+5000+10000 = 91000. Actual = 50000+15000+9500+2800+7200+8000 = 92500. What is the overall variance (Actual total minus Planned total)?', '["1500", "-1500", "92500", "0"]', 0, '92500 - 91000 = 1500 over budget overall.', 25);
END $$;
