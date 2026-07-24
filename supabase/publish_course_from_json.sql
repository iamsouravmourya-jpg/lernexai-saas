-- One-shot course publisher for LernexAI.
--
-- How to use:
-- 1) Replace the empty JSON payload below with your full course JSON.
-- 2) Run this file in the Supabase SQL Editor.
-- 3) The course, modules, lessons, quizzes, and final exam questions will be inserted.
--
-- Safe re-run behavior:
-- - If a course with the same title already exists, it is deleted first.
-- - Child rows are removed automatically through foreign-key cascades.

BEGIN;

ALTER TABLE public.quizzes
  ADD COLUMN IF NOT EXISTS lesson_id uuid REFERENCES public.lessons(id) ON DELETE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS quizzes_lesson_id_unique
  ON public.quizzes(lesson_id)
  WHERE lesson_id IS NOT NULL;

DO $$
DECLARE
v_payload jsonb := $json$
{ ...your full JSON... }
$json$::jsonb;
 -- Replace with your full JSON payload.
 -- -- =========================================================
 -- LERNEXAI ONE-SHOT COURSE PUBLISH FORMAT (SUPABASE / POSTGRESQL)
 -- Course Title: Applied Machine Learning & AI Systems Engineering Masterclass
 -- Course ID: custom-ai-1784871062774-mastering-ai-tools---chatgpt-for-everyday-productivity
 -- Total Modules: 6
 -- =========================================================

 -- 1. ENSURE RELATIONAL TABLES EXIST
 CREATE TABLE IF NOT EXISTS public.courses (
   id TEXT PRIMARY KEY,
   title TEXT NOT NULL,
   description TEXT,
   category TEXT,
   difficulty TEXT,
   is_premium BOOLEAN DEFAULT FALSE,
   total_modules INTEGER,
   estimated_hours NUMERIC,
   cover_image_url TEXT,
   course_data JSONB,
   created_at TIMESTAMPTZ DEFAULT NOW(),
   updated_at TIMESTAMPTZ DEFAULT NOW()
 );

 CREATE TABLE IF NOT EXISTS public.modules (
   id TEXT PRIMARY KEY,
   course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE,
   module_number INTEGER NOT NULL,
   title TEXT NOT NULL,
   description TEXT,
   order_index INTEGER NOT NULL
 );

 CREATE TABLE IF NOT EXISTS public.lessons (
   id TEXT PRIMARY KEY,
   module_id TEXT REFERENCES public.modules(id) ON DELETE CASCADE,
   lesson_number INTEGER NOT NULL,
   title TEXT NOT NULL,
   content TEXT,
   content_type TEXT DEFAULT 'text',
   video_url TEXT,
   duration_minutes INTEGER,
   order_index INTEGER NOT NULL
 );

 CREATE TABLE IF NOT EXISTS public.quizzes (
   id TEXT PRIMARY KEY,
   course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE,
   module_index INTEGER,
   lesson_id TEXT REFERENCES public.lessons(id) ON DELETE CASCADE,
   questions JSONB NOT NULL,
   passing_score INTEGER DEFAULT 80,
   time_limit_minutes INTEGER DEFAULT 10
 );

 CREATE TABLE IF NOT EXISTS public.final_exam_questions (
   id TEXT PRIMARY KEY,
   course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE,
   module_index INTEGER,
   difficulty TEXT,
   question TEXT NOT NULL,
   options JSONB NOT NULL,
   correct_answer INTEGER NOT NULL,
   explanation TEXT,
   order_index INTEGER NOT NULL
 );

 -- ENABLE ROW LEVEL SECURITY & PUBLIC READ ACCESS
 ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
 ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
 ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
 ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
 ALTER TABLE public.final_exam_questions ENABLE ROW LEVEL SECURITY;

 DO $$
 BEGIN
   IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'courses' AND policyname = 'Allow public read access') THEN
     CREATE POLICY "Allow public read access" ON public.courses FOR SELECT USING (true);
   END IF;
   IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'modules' AND policyname = 'Allow public read access') THEN
     CREATE POLICY "Allow public read access" ON public.modules FOR SELECT USING (true);
   END IF;
   IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'lessons' AND policyname = 'Allow public read access') THEN
     CREATE POLICY "Allow public read access" ON public.lessons FOR SELECT USING (true);
   END IF;
   IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quizzes' AND policyname = 'Allow public read access') THEN
     CREATE POLICY "Allow public read access" ON public.quizzes FOR SELECT USING (true);
   END IF;
   IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'final_exam_questions' AND policyname = 'Allow public read access') THEN
     CREATE POLICY "Allow public read access" ON public.final_exam_questions FOR SELECT USING (true);
   END IF;
 END $$;

 -- 2. ONE-SHOT ATOMIC TRANSACTION (IDEMPOTENT SAFE RE-RUN PATTERN)
 BEGIN;

 -- IDEMPOTENT CLEANUP BEFORE INSERT (Prevents duplicates on re-runs)
 DELETE FROM public.final_exam_questions WHERE course_id = $L_ID$custom-ai-1784871062774-mastering-ai-tools---chatgpt-for-everyday-productivity$L_ID$;
 DELETE FROM public.quizzes WHERE course_id = $L_ID$custom-ai-1784871062774-mastering-ai-tools---chatgpt-for-everyday-productivity$L_ID$;
 DELETE FROM public.lessons WHERE module_id IN (SELECT id FROM public.modules WHERE course_id = $L_ID$custom-ai-1784871062774-mastering-ai-tools---chatgpt-for-everyday-productivity$L_ID$);
 DELETE FROM public.modules WHERE course_id = $L_ID$custom-ai-1784871062774-mastering-ai-tools---chatgpt-for-everyday-productivity$L_ID$;
 DELETE FROM public.courses WHERE id = $L_ID$custom-ai-1784871062774-mastering-ai-tools---chatgpt-for-everyday-productivity$L_ID$;

 -- INSERT COURSE ROW
 INSERT INTO public.courses (
   id, title, description, category, difficulty, is_premium, total_modules, estimated_hours, cover_image_url, course_data
 ) VALUES (
   $L_ID$custom-ai-1784871062774-mastering-ai-tools---chatgpt-for-everyday-productivity$L_ID$,
   $L_TXT$Applied Machine Learning & AI Systems Engineering Masterclass$L_TXT$,
   $L_TXT$A master-level, content-first written course on Mastering AI Tools & ChatGPT for Everyday Productivity. Learn interface navigation, core formulas (IF, XLOOKUP), Pivot Tables, data cleaning, and executive dashboard design with detailed step-by-step guides.$L_TXT$,
   $L_TXT$Data & Analytics$L_TXT$,
   $L_TXT$beginner$L_TXT$,
   false,
   6,
   22,
   $L_TXT$https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&q=80$L_TXT$,
   $L_JSON${
   "id": "custom-ai-1784871062774-mastering-ai-tools---chatgpt-for-everyday-productivity",
   "created_at": "2026-07-24T05:31:02.774Z",
   "is_custom_ai": true,
   "course_metadata": {
     "title": "Applied Machine Learning & AI Systems Engineering Masterclass",
     "subtitle": "Complete written masterclass with hands-on practice exercises, formulas & real-world projects",
     "description": "A master-level, content-first written course on Mastering AI Tools & ChatGPT for Everyday Productivity. Learn interface navigation, core formulas (IF, XLOOKUP), Pivot Tables, data cleaning, and executive dashboard design with detailed step-by-step guides.",
     "category": "Data & Analytics",
     "subcategory": "Microsoft Excel",
     "difficulty_level": "beginner",
     "total_estimated_hours": 22,
     "skill_level_from": "Zero Experience",
     "skill_level_to": "Business Data Analyst",
     "language": "English",
     "instructor_name": "LernExAI Analytics Engineering Team",
     "instructor_bio": "Senior Data Analysts & Financial Modeling Specialists",
     "last_updated": "2026-02",
     "students_enrolled_simulated": "2,450+",
     "badge_color": "from-emerald-600 to-teal-800"
   },
   "learning_objectives": [
     "Master Excel navigation, formatting, and shortcut speed tricks",
     "Build dynamic formulas with IF, AND, OR, XLOOKUP, and INDEX-MATCH",
     "Create interactive Pivot Tables, Slicers, and executive dashboards",
     "Clean messy CRM data exports and automate calculations"
   ],
   "target_audience": [
     "Beginners wanting to build strong spreadsheet foundations",
     "Accountants, Business Analysts, and Finance Professionals",
     "Students and Job Seekers aiming to enhance resume technical skills"
   ],
   "prerequisites": [
     "Basic computer familiarity and internet connection"
   ],
   "modules": [
     {
       "module_number": 1,
       "title": "Excel Fundamentals & Workspace Mastery",
       "description": "Master the Excel interface, workbook structure, cell formatting, and fundamental navigation techniques.",
       "estimated_hours": 3,
       "lessons": [
         {
           "lesson_id": "les-m1-l1",
           "lesson_number": 1,
           "title": "Introduction to Excel Interface & Workbook Navigation",
           "estimated_minutes": 25,
           "youtube_video_id": "",
           "video_duration_seconds": 0,
           "text_content": "# Welcome to Microsoft Excel & Data Analysis\n\nMicrosoft Excel is the world's most widely used spreadsheet application, trusted by financial analysts, project managers, and data scientists. In this comprehensive lesson, you will learn how to navigate the ribbon interface, organize data into workbooks, and utilize essential keyboard shortcuts to boost productivity.\n\n## 1. Understanding the Excel Workbook & Grid Structure\nAn Excel file is known as a **Workbook**, which contains one or more **Worksheets**. Each sheet consists of millions of cells arranged in rows (numbered 1 to 1,048,576) and columns (lettered A to XFD).\n\n- **Cell Reference**: Formed by column letter and row number (e.g., `A1`, `C15`).\n- **Formula Bar**: Located above the grid, displaying cell contents or active formulas.\n- **Name Box**: Shows active cell address or named ranges.\n\n## 2. Essential Excel Formatting Principles\nFormatting elevates raw data into professional reports:\n1. **Number Formatting**: Apply Currency (`$`), Percentage (`%`), and Date formats.\n2. **Text Alignment**: Wrap text and merge cells responsibly.\n3. **Table Styles**: Convert ranges to Excel Tables using `Ctrl + T`.\n\n```excel\n// Example Cell Formulas\n=SUM(A1:A10)\n=AVERAGE(B1:B20)\n```\n\n## 3. Keyboard Shortcuts Cheat Sheet\n- `Ctrl + C` / `Ctrl + V`: Copy and Paste\n- `Ctrl + Z`: Undo action\n- `Ctrl + Arrow Keys`: Jump to data region edge\n- `F4`: Toggle absolute cell references (`$A$1`)\n\n## Summary\nYou now understand the foundational layout of Microsoft Excel! Proceed to the practical exercise below.",
           "key_takeaways": [
             "Excel grids consist of rows, columns, and cell addresses.",
             "Always use Ctrl + T to convert data into smart Excel Tables.",
             "F4 toggles absolute cell referencing ($A$1)."
           ],
           "images": [
             {
               "image_url": "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&q=80",
               "caption": "Introduction to Excel Interface & Workbook Navigation: Neural Network Architecture & Deep Learning Model Pipelines",
               "alt_text": "AI Architecture",
               "placement_after_paragraph": 2
             }
           ],
           "practice_exercise": {
             "title": "Exercise 1: Cell Formatting & Data Entry",
             "instructions": "Format column A as Date, column B as Text, and column C as Currency ($). Calculate the total in C10 using SUM.",
             "starter_code": "=SUM(C2:C9)",
             "hints": [
               "Highlight C2 to C9 before entering SUM.",
               "Use Ctrl + Shift + 4 for Currency format."
             ],
             "expected_output": "Total revenue sum displayed in currency format $15,450.00"
           }
         },
         {
           "lesson_id": "les-m1-l2",
           "lesson_number": 2,
           "title": "Cell References: Relative vs Absolute ($A$1)",
           "estimated_minutes": 30,
           "youtube_video_id": "",
           "video_duration_seconds": 0,
           "text_content": "# Master Relative, Absolute, and Mixed Cell References\n\nUnderstanding how Excel handles cell references during formula copying is crucial for building scalable financial models and error-free reports.\n\n## 1. Relative Cell References (`A1`)\nBy default, Excel cell references are relative. When you copy a formula down or across, the reference adjusts relative to the new cell position.\n\n## 2. Absolute Cell References (`$A$1`)\nAdding dollar signs (`$`) locks the reference. The formula will always refer to exact cell `A1` regardless of where it is copied.\n\n- **Formula**: `=B2 * $C$1` (where C1 contains tax rate 15%).\n\n## 3. Mixed Cell References (`$A1` or `A$1`)\nLocks either the column or the row independently for two-dimensional calculation grids.\n\n```excel\n// Multiplying Row header by Column header\n=$A2 * B$1\n```\n\n## Best Practices\n- Never hardcode constants inside formulas (e.g. `* 0.15`). Place tax rates or discount percentages in dedicated cells and lock them with `$F$2`.",
           "key_takeaways": [
             "Relative references adjust when copied.",
             "Absolute references ($A$1) remain fixed.",
             "Press F4 while editing a reference to cycle through reference types."
           ],
           "images": [
             {
               "image_url": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
               "caption": "Cell References: Relative vs Absolute ($A$1): Generative AI Prompt Engineering & Vector Embeddings",
               "alt_text": "Generative AI",
               "placement_after_paragraph": 2
             }
           ],
           "practice_exercise": {
             "title": "Exercise 2: Tax Calculation with Locked Rate",
             "instructions": "Calculate tax for sales in B2:B10 using tax rate stored in cell $E$1.",
             "starter_code": "=B2 * $E$1",
             "hints": [
               "Press F4 on E1 to lock the cell reference."
             ],
             "expected_output": "Accurate tax amounts computed without calculation errors."
           }
         }
       ],
       "module_image_url": "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&q=80"
     },
     {
       "module_number": 2,
       "title": "Essential Excel Formulas & Text Functions",
       "description": "Master core logical functions (IF, AND, OR), text manipulation (LEFT, RIGHT, CONCAT), and math aggregations.",
       "estimated_hours": 4,
       "lessons": [
         {
           "lesson_id": "les-m2-l1",
           "lesson_number": 1,
           "title": "Logical Functions: IF, AND, OR, IFS",
           "estimated_minutes": 35,
           "youtube_video_id": "",
           "video_duration_seconds": 0,
           "text_content": "# Master Logical Decision Making in Excel\n\nLogical functions allow your spreadsheet to dynamically evaluate conditions and output tailored results.\n\n## 1. The `IF` Function\nEvaluates a logical test and returns one value if true, another if false:\n```excel\n=IF(Sales >= 10000, \"Bonus\", \"Standard\")\n```\n\n## 2. Combining Conditions with `AND` and `OR`\n- **AND**: Returns TRUE if ALL conditions are met.\n- **OR**: Returns TRUE if AT LEAST ONE condition is met.\n\n```excel\n// Commission for High Performers in East Region\n=IF(AND(Region=\"East\", Sales>20000), \"Eligible\", \"Not Eligible\")\n```\n\n## 3. The `IFS` Function (Excel 2019 / 365)\nReplaces complex nested IF statements with clean syntax:\n```excel\n=IFS(Score>=90, \"A\", Score>=80, \"B\", Score>=70, \"C\", TRUE, \"F\")\n```",
           "key_takeaways": [
             "IF handles binary decisions.",
             "AND requires all criteria to evaluate true.",
             "IFS simplifies multi-tier grading systems."
           ],
           "images": [
             {
               "image_url": "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&q=80",
               "caption": "Logical Functions: IF, AND, OR, IFS: Statistical Machine Learning Algorithms & Regression Plots",
               "alt_text": "Machine Learning",
               "placement_after_paragraph": 2
             }
           ],
           "practice_exercise": {
             "title": "Exercise: Bonus Eligibility Matrix",
             "instructions": "Write an IF statement checking if Sales (B2) > 5000 AND Rating (C2) >= 4.",
             "starter_code": "=IF(AND(B2>5000, C2>=4), \"Qualified\", \"Ineligible\")",
             "hints": [
               "Wrap condition inside AND()."
             ],
             "expected_output": "\"Qualified\" returned for high performers."
           }
         }
       ],
       "module_image_url": "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&q=80"
     },
     {
       "module_number": 3,
       "title": "Lookup Functions: VLOOKUP, XLOOKUP & INDEX-MATCH",
       "description": "Perform relational data lookups across tables using VLOOKUP, XLOOKUP, and flexible INDEX-MATCH pairs.",
       "estimated_hours": 4,
       "lessons": [
         {
           "lesson_id": "les-m3-l1",
           "lesson_number": 1,
           "title": "Modern Data Lookups with XLOOKUP & VLOOKUP",
           "estimated_minutes": 40,
           "youtube_video_id": "",
           "video_duration_seconds": 0,
           "text_content": "# The Ultimate Guide to Lookups in Excel\n\nData lookup functions connect separate datasets by linking common keys (e.g., Employee ID, SKU Number).\n\n## 1. Traditional VLOOKUP\nSearches for a key in the first column of a table and retrieves values from specified column index:\n```excel\n=VLOOKUP(Lookup_Value, Table_Array, Col_Index_Num, FALSE)\n// Example\n=VLOOKUP(\"SKU-102\", A2:D100, 3, FALSE)\n```\n\n## 2. Modern XLOOKUP (Recommended)\nXLOOKUP replaces VLOOKUP and INDEX-MATCH with faster, bidirectional lookup power:\n```excel\n=XLOOKUP(lookup_value, lookup_array, return_array, [if_not_found])\n// Example\n=XLOOKUP(E2, Employee[ID], Employee[Salary], \"Not Found\")\n```\n\n### Why XLOOKUP Wins:\n- Lookups left or right.\n- Defaults to exact match.\n- Built-in error handling (\"Not Found\").",
           "key_takeaways": [
             "VLOOKUP requires exact column counting and right-side retrieval.",
             "XLOOKUP works in any direction with automatic error handling.",
             "Always set exact match (FALSE / 0)."
           ],
           "images": [
             {
               "image_url": "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&q=80",
               "caption": "Modern Data Lookups with XLOOKUP & VLOOKUP: Neural Network Architecture & Deep Learning Model Pipelines",
               "alt_text": "AI Architecture",
               "placement_after_paragraph": 2
             }
           ],
           "practice_exercise": {
             "title": "Exercise: Fetch Employee Salary with XLOOKUP",
             "instructions": "Write XLOOKUP formula to search for Employee ID in A2:A50 and pull Salary from D2:D50.",
             "starter_code": "=XLOOKUP(G2, A2:A50, D2:D50, \"ID Missing\")",
             "hints": [
               "First parameter is lookup cell G2."
             ],
             "expected_output": "Correct salary returned instantly without column counting."
           }
         }
       ],
       "module_image_url": "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&q=80"
     },
     {
       "module_number": 4,
       "title": "Pivot Tables & Dynamic Summary Reports",
       "description": "Summarize thousands of rows of data instantly with Pivot Tables, Slicers, and Pivot Charts.",
       "estimated_hours": 3.5,
       "lessons": [
         {
           "lesson_id": "les-m4-l1",
           "lesson_number": 1,
           "title": "Building Interactive Pivot Tables & Slicers",
           "estimated_minutes": 30,
           "youtube_video_id": "",
           "video_duration_seconds": 0,
           "text_content": "# Pivot Tables: Turn Big Data into Insights\n\nPivot Tables allow you to summarize, group, filter, and analyze large datasets without writing complex formulas.\n\n## 1. Creating a Pivot Table\n1. Select your clean data range or Excel Table (`Ctrl + T`).\n2. Go to **Insert > PivotTable**.\n3. Choose destination worksheet.\n\n## 2. The Four Pivot Table Quadrants\n- **Filters**: Global dataset filtering.\n- **Columns**: Horizontal breakdown (e.g., Quarters).\n- **Rows**: Primary categories (e.g., Product Lines).\n- **Values**: Aggregation metrics (SUM, AVERAGE, COUNT).\n\n## 3. Adding Visual Slicers\nSlicers provide one-click interactive filtering buttons for executive dashboards!",
           "key_takeaways": [
             "Pivot Tables require clean data with column headers.",
             "Slicers provide interactive visual filters.",
             "Refresh Pivot Tables when underlying source data changes."
           ],
           "images": [
             {
               "image_url": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
               "caption": "Building Interactive Pivot Tables & Slicers: Generative AI Prompt Engineering & Vector Embeddings",
               "alt_text": "Generative AI",
               "placement_after_paragraph": 2
             }
           ],
           "practice_exercise": {
             "title": "Exercise: Regional Sales Pivot Table",
             "instructions": "Create a Pivot Table placing \"Region\" in Rows and \"Revenue\" in Values summarized as SUM.",
             "starter_code": "PivotTable Fields: Rows -> Region, Values -> SUM(Revenue)",
             "hints": [
               "Right-click values to format as Currency."
             ],
             "expected_output": "Clean summary table showing total sales per region."
           }
         }
       ],
       "module_image_url": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80"
     },
     {
       "module_number": 5,
       "title": "Data Cleansing & Power Query Automation",
       "description": "Clean dirty messy data, handle missing values, split columns, and automate ETL workflows using Power Query.",
       "estimated_hours": 4,
       "lessons": [
         {
           "lesson_id": "les-m5-l1",
           "lesson_number": 1,
           "title": "Data Cleaning: TRIM, CLEAN, TEXTJOIN & Flash Fill",
           "estimated_minutes": 30,
           "youtube_video_id": "",
           "video_duration_seconds": 0,
           "text_content": "# Master Excel Data Cleansing\n\nRaw data exported from CRMs or SQL databases is often messy—containing extra spaces, bad capitalization, or combined fields.\n\n## 1. Removing Irregular Spaces (`TRIM`)\n`TRIM` removes leading, trailing, and duplicate spaces:\n```excel\n=TRIM(A2)\n```\n\n## 2. Text Case Conversion (`UPPER`, `LOWER`, `PROPER`)\n- `PROPER(\"john DOE\")` -> `\"John Doe\"`\n- `UPPER(\"sku-100\")` -> `\"SKU-100\"`\n\n## 3. Flash Fill (`Ctrl + E`)\nExcel auto-detects patterns in adjacent columns to split names, extract phone numbers, or reformat dates automatically!",
           "key_takeaways": [
             "TRIM removes unwanted spaces.",
             "PROPER formats names neatly.",
             "Ctrl + E invokes intelligent Flash Fill."
           ],
           "images": [
             {
               "image_url": "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&q=80",
               "caption": "Data Cleaning: TRIM, CLEAN, TEXTJOIN & Flash Fill: Statistical Machine Learning Algorithms & Regression Plots",
               "alt_text": "Machine Learning",
               "placement_after_paragraph": 2
             }
           ],
           "practice_exercise": {
             "title": "Exercise: Clean Customer Name Records",
             "instructions": "Clean messy string \"  jANe   sMITh  \" into \"Jane Smith\".",
             "starter_code": "=PROPER(TRIM(A2))",
             "hints": [
               "Nest TRIM inside PROPER."
             ],
             "expected_output": "\"Jane Smith\""
           }
         }
       ],
       "module_image_url": "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&q=80"
     },
     {
       "module_number": 6,
       "title": "Excel Charts, Visualization & Executive Dashboards",
       "description": "Build professional bar charts, line trends, waterfall graphs, and interactive KPI dashboards.",
       "estimated_hours": 3.5,
       "lessons": [
         {
           "lesson_id": "les-m6-l1",
           "lesson_number": 1,
           "title": "Designing Professional Charts & KPI Scorecards",
           "estimated_minutes": 35,
           "youtube_video_id": "",
           "video_duration_seconds": 0,
           "text_content": "# Data Visualization Best Practices in Excel\n\nCharts communicate trends and insights faster than raw tables.\n\n## 1. Choosing the Right Chart Type\n- **Bar/Column Chart**: Category comparisons.\n- **Line Chart**: Time-series trend analysis (monthly sales).\n- **Pie Chart**: Single composition (limit to < 5 slices).\n- **Combo Chart**: Dual axis (e.g., Revenue $ + Margin %).\n\n## 2. Executive Formatting Rules\n1. **Remove Gridline Clutter**: Keep chart backgrounds clean.\n2. **Direct Data Labels**: Label bars directly instead of distant legends.\n3. **Consistent Palette**: Use corporate dark navy and subtle accent colors.",
           "key_takeaways": [
             "Match chart type to message.",
             "Dual-axis combo charts blend lines and columns.",
             "Keep visual noise minimal for executive presentation."
           ],
           "images": [
             {
               "image_url": "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&q=80",
               "caption": "Designing Professional Charts & KPI Scorecards: Neural Network Architecture & Deep Learning Model Pipelines",
               "alt_text": "AI Architecture",
               "placement_after_paragraph": 2
             }
           ],
           "practice_exercise": {
             "title": "Exercise: Create 12-Month Sales Trend Line Chart",
             "instructions": "Highlight Month (A2:A13) and Sales (B2:B13) and insert a smooth Line Chart with data markers.",
             "starter_code": "Insert -> Charts -> Line with Markers",
             "hints": [
               "Add title \"2026 Monthly Sales Trend\"."
             ],
             "expected_output": "Interactive trend line chart formatted cleanly."
           }
         }
       ],
       "module_image_url": "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&q=80"
     }
   ],
   "quizzes": [
     {
       "quiz_id": "quiz-mod-1",
       "title": "Module 1 Checkpoint: Excel Fundamentals",
       "quiz_type": "module_checkpoint",
       "module_number": 1,
       "passing_score": 70,
       "max_attempts": 3,
       "questions": [
         {
           "question": "Which key locks a cell reference to make it absolute ($A$1)?",
           "type": "multiple_choice",
           "options": [
             "F2",
             "F4",
             "F8",
             "Ctrl + L"
           ],
           "correct_answer_index": 1,
           "explanation": "Pressing F4 while highlighting a cell reference adds dollar signs to lock row and column ($A$1)."
         },
         {
           "question": "What shortcut converts a highlighted range into a smart Excel Table?",
           "type": "multiple_choice",
           "options": [
             "Ctrl + T",
             "Ctrl + Shift + N",
             "Alt + F1",
             "Ctrl + P"
           ],
           "correct_answer_index": 0,
           "explanation": "Ctrl + T instantly formats selected data into an Excel Table with filtering and structured references."
         }
       ]
     }
   ],
   "final_exam": {
     "total_questions": 5,
     "passing_score": 80,
     "time_limit_minutes": 30,
     "covers_all_modules": true,
     "questions": [
       {
         "question": "Which lookup function allows bidirectional lookup without column number counting?",
         "type": "multiple_choice",
         "difficulty": "medium",
         "weight": 20,
         "options": [
           "VLOOKUP",
           "HLOOKUP",
           "XLOOKUP",
           "LOOKUP"
         ],
         "correct_answer_index": 2,
         "explanation": "XLOOKUP searches in any direction and defaults to exact match without needing column index numbers."
       },
       {
         "question": "Which formula cleans leading, trailing, and duplicate middle spaces from string \"  John   Doe \"?",
         "type": "multiple_choice",
         "difficulty": "easy",
         "weight": 20,
         "options": [
           "CLEAN(A1)",
           "TRIM(A1)",
           "REMOVE(A1)",
           "PROPER(A1)"
         ],
         "correct_answer_index": 1,
         "explanation": "TRIM removes unwanted spaces while retaining single spaces between words."
       }
     ]
   },
   "projects": [
     {
       "project_number": 1,
       "title": "Capstone: Executive Financial Data Dashboard",
       "difficulty": "intermediate",
       "estimated_hours": 6,
       "modules_covered": [
         1,
         2,
         3,
         4,
         5,
         6
       ],
       "deliverables": [
         "Clean raw sales transaction dataset using TRIM and XLOOKUP",
         "Build Pivot Table breakdown by Region and Quarter with interactive Slicers",
         "Design 12-month Trend Line Chart with KPI summary cards"
       ],
       "portfolio_ready": true,
       "job_interview_material": true
     }
   ],
   "career_resources": {
     "job_roles_prepared_for": [
       "Data Analyst",
       "Financial Analyst",
       "Business Operations Manager"
     ],
     "average_salary_range": "$65,000 - $115,000 / year",
     "resume_tips": [
       "List \"Advanced Excel (XLOOKUP, Pivot Tables, Power Query)\" in technical skills section",
       "Include link to Capstone Excel Financial Dashboard project"
     ],
     "interview_questions": [
       "Difference between VLOOKUP and XLOOKUP?",
       "How do you handle dirty data with duplicate spaces and wrong casing?"
     ],
     "networking_resources": [
       "Excel World Championship Community",
       "LernExAI Discord Analyst Group"
     ]
   },
   "additional_resources": {
     "downloadable_files": [
       {
         "file_name": "Excel_Formulas_Master_Cheatsheet.pdf",
         "file_type": "PDF",
         "purpose": "Quick reference guide"
       },
       {
         "file_name": "Practice_Dataset_Sales_2026.xlsx",
         "file_type": "XLSX",
         "purpose": "Exercise workbook"
       }
     ],
     "community_links": [
       {
         "platform": "Discord",
         "url": "https://discord.gg/lernexai",
         "purpose": "Community support & Q&A"
       }
     ]
   }
 }$L_JSON$::jsonb
 );

 -- Module 1: Excel Fundamentals & Workspace Mastery
 INSERT INTO public.modules (id, course_id, module_number, title, description, order_index)
 VALUES (
   $L_ID$custom-ai-1784871062774-mastering-ai-tools---chatgpt-for-everyday-productivity_mod_1$L_ID$,
   $L_ID$custom-ai-1784871062774-mastering-ai-tools---chatgpt-for-everyday-productivity$L_ID$,
   1,
   $L_TXT$Excel Fundamentals & Workspace Mastery$L_TXT$,
   $L_TXT$Master the Excel interface, workbook structure, cell formatting, and fundamental navigation techniques.$L_TXT$,
   1
 );
 INSERT INTO public.lessons (id, module_id, lesson_number, title, content, content_type, video_url, duration_minutes, order_index)
 VALUES (
   $L_ID$custom-ai-1784871062774-mastering-ai-tools---chatgpt-for-everyday-productivity_mod_1_les_1$L_ID$,
   $L_ID$custom-ai-1784871062774-mastering-ai-tools---chatgpt-for-everyday-productivity_mod_1$L_ID$,
   1,
   $L_TXT$Introduction to Excel Interface & Workbook Navigation$L_TXT$,
   $L_TXT$# Welcome to Microsoft Excel & Data Analysis

 Microsoft Excel is the world's most widely used spreadsheet application, trusted by financial analysts, project managers, and data scientists. In this comprehensive lesson, you will learn how to navigate the ribbon interface, organize data into workbooks, and utilize essential keyboard shortcuts to boost productivity.

 ## 1. Understanding the Excel Workbook & Grid Structure
 An Excel file is known as a **Workbook**, which contains one or more **Worksheets**. Each sheet consists of millions of cells arranged in rows (numbered 1 to 1,048,576) and columns (lettered A to XFD).

 - **Cell Reference**: Formed by column letter and row number (e.g., `A1`, `C15`).
 - **Formula Bar**: Located above the grid, displaying cell contents or active formulas.
 - **Name Box**: Shows active cell address or named ranges.

 ## 2. Essential Excel Formatting Principles
 Formatting elevates raw data into professional reports:
 1. **Number Formatting**: Apply Currency (`$`), Percentage (`%`), and Date formats.
 2. **Text Alignment**: Wrap text and merge cells responsibly.
 3. **Table Styles**: Convert ranges to Excel Tables using `Ctrl + T`.

 ```excel
 // Example Cell Formulas
 =SUM(A1:A10)
 =AVERAGE(B1:B20)
 ```

 ## 3. Keyboard Shortcuts Cheat Sheet
 - `Ctrl + C` / `Ctrl + V`: Copy and Paste
 - `Ctrl + Z`: Undo action
 - `Ctrl + Arrow Keys`: Jump to data region edge
 - `F4`: Toggle absolute cell references (`$A$1`)

 ## Summary
 You now understand the foundational layout of Microsoft Excel! Proceed to the practical exercise below.$L_TXT$,
   'text',
   $L_TXT$$L_TXT$,
   25,
   1
 );
 INSERT INTO public.quizzes (id, course_id, module_index, lesson_id, questions, passing_score, time_limit_minutes)
 VALUES (
   $L_ID$quiz_custom-ai-1784871062774-mastering-ai-tools---chatgpt-for-everyday-productivity_mod_1_les_1$L_ID$,
   $L_ID$custom-ai-1784871062774-mastering-ai-tools---chatgpt-for-everyday-productivity$L_ID$,
   1,
   $L_ID$custom-ai-1784871062774-mastering-ai-tools---chatgpt-for-everyday-productivity_mod_1_les_1$L_ID$,
   $L_JSON$[{"question":"Lesson 1 Checkpoint: Exercise 1: Cell Formatting & Data Entry","options":["Option A (Correct)","Option B","Option C","Option D"],"correct_answer":0,"explanation":"Practice exercise instructions: Format column A as Date, column B as Text, and column C as Currency ($). Calculate the total in C10 using SUM."}]$L_JSON$::jsonb,
   80,
   5
 );
 INSERT INTO public.lessons (id, module_id, lesson_number, title, content, content_type, video_url, duration_minutes, order_index)
 VALUES (
   $L_ID$custom-ai-1784871062774-mastering-ai-tools---chatgpt-for-everyday-productivity_mod_1_les_2$L_ID$,
   $L_ID$custom-ai-1784871062774-mastering-ai-tools---chatgpt-for-everyday-productivity_mod_1$L_ID$,
   2,
   $L_TXT$Cell References: Relative vs Absolute ($A$1)$L_TXT$,
   $L_TXT$# Master Relative, Absolute, and Mixed Cell References

 Understanding how Excel handles cell references during formula copying is crucial for building scalable financial models and error-free reports.

 ## 1. Relative Cell References (`A1`)
 By default, Excel cell references are relative. When you copy a formula down or across, the reference adjusts relative to the new cell position.

 ## 2. Absolute Cell References (`$A$1`)
 Adding dollar signs (`$`) locks the reference. The formula will always refer to exact cell `A1` regardless of where it is copied.

 - **Formula**: `=B2 * $C$1` (where C1 contains tax rate 15%).

 ## 3. Mixed Cell References (`$A1` or `A$1`)
 Locks either the column or the row independently for two-dimensional calculation grids.

 ```excel
 // Multiplying Row header by Column header
 =$A2 * B$1
 ```

 ## Best Practices
 - Never hardcode constants inside formulas (e.g. `* 0.15`). Place tax rates or discount percentages in dedicated cells and lock them with `$F$2`.$L_TXT$,
   'text',
   $L_TXT$$L_TXT$,
   30,
   2
 );
 INSERT INTO public.quizzes (id, course_id, module_index, lesson_id, questions, passing_score, time_limit_minutes)
 VALUES (
   $L_ID$quiz_custom-ai-1784871062774-mastering-ai-tools---chatgpt-for-everyday-productivity_mod_1_les_2$L_ID$,
   $L_ID$custom-ai-1784871062774-mastering-ai-tools---chatgpt-for-everyday-productivity$L_ID$,
   1,
   $L_ID$custom-ai-1784871062774-mastering-ai-tools---chatgpt-for-everyday-productivity_mod_1_les_2$L_ID$,
   $L_JSON$[{"question":"Lesson 2 Checkpoint: Exercise 2: Tax Calculation with Locked Rate","options":["Option A (Correct)","Option B","Option C","Option D"],"correct_answer":0,"explanation":"Practice exercise instructions: Calculate tax for sales in B2:B10 using tax rate stored in cell $E$1."}]$L_JSON$::jsonb,
   80,
   5
 );
 INSERT INTO public.quizzes (id, course_id, module_index, lesson_id, questions, passing_score, time_limit_minutes)
 VALUES (
   $L_ID$quiz_mod_custom-ai-1784871062774-mastering-ai-tools---chatgpt-for-everyday-productivity_mod_1$L_ID$,
   $L_ID$custom-ai-1784871062774-mastering-ai-tools---chatgpt-for-everyday-productivity$L_ID$,
   1,
   NULL,
   $L_JSON$[{"question":"Which key locks a cell reference to make it absolute ($A$1)?","options":["F2","F4","F8","Ctrl + L"],"correct_answer":1,"explanation":"Pressing F4 while highlighting a cell reference adds dollar signs to lock row and column ($A$1)."},{"question":"What shortcut converts a highlighted range into a smart Excel Table?","options":["Ctrl + T","Ctrl + Shift + N","Alt + F1","Ctrl + P"],"correct_answer":0,"explanation":"Ctrl + T instantly formats selected data into an Excel Table with filtering and structured references."}]$L_JSON$::jsonb,
   80,
   8
 );

 -- Module 2: Essential Excel Formulas & Text Functions
 INSERT INTO public.modules (id, course_id, module_number, title, description, order_index)
 VALUES (
   $L_ID$custom-ai-1784871062774-mastering-ai-tools---chatgpt-for-everyday-productivity_mod_2$L_ID$,
   $L_ID$custom-ai-1784871062774-mastering-ai-tools---chatgpt-for-everyday-productivity$L_ID$,
   2,
   $L_TXT$Essential Excel Formulas & Text Functions$L_TXT$,
   $L_TXT$Master core logical functions (IF, AND, OR), text manipulation (LEFT, RIGHT, CONCAT), and math aggregations.$L_TXT$,
   2
 );
 INSERT INTO public.lessons (id, module_id, lesson_number, title, content, content_type, video_url, duration_minutes, order_index)
 VALUES (
   $L_ID$custom-ai-1784871062774-mastering-ai-tools---chatgpt-for-everyday-productivity_mod_2_les_1$L_ID$,
   $L_ID$custom-ai-1784871062774-mastering-ai-tools---chatgpt-for-everyday-productivity_mod_2$L_ID$,
   1,
   $L_TXT$Logical Functions: IF, AND, OR, IFS$L_TXT$,
   $L_TXT$# Master Logical Decision Making in Excel

 Logical functions allow your spreadsheet to dynamically evaluate conditions and output tailored results.

 ## 1. The `IF` Function
 Evaluates a logical test and returns one value if true, another if false:
 ```excel
 =IF(Sales >= 10000, "Bonus", "Standard")
 ```

 ## 2. Combining Conditions with `AND` and `OR`
 - **AND**: Returns TRUE if ALL conditions are met.
 - **OR**: Returns TRUE if AT LEAST ONE condition is met.

 ```excel
 // Commission for High Performers in East Region
 =IF(AND(Region="East", Sales>20000), "Eligible", "Not Eligible")
 ```

 ## 3. The `IFS` Function (Excel 2019 / 365)
 Replaces complex nested IF statements with clean syntax:
 ```excel
 =IFS(Score>=90, "A", Score>=80, "B", Score>=70, "C", TRUE, "F")
 ```$L_TXT$,
   'text',
   $L_TXT$$L_TXT$,
   35,
   1
 );
 INSERT INTO public.quizzes (id, course_id, module_index, lesson_id, questions, passing_score, time_limit_minutes)
 VALUES (
   $L_ID$quiz_custom-ai-1784871062774-mastering-ai-tools---chatgpt-for-everyday-productivity_mod_2_les_1$L_ID$,
   $L_ID$custom-ai-1784871062774-mastering-ai-tools---chatgpt-for-everyday-productivity$L_ID$,
   2,
   $L_ID$custom-ai-1784871062774-mastering-ai-tools---chatgpt-for-everyday-productivity_mod_2_les_1$L_ID$,
   $L_JSON$[{"question":"Lesson 1 Checkpoint: Exercise: Bonus Eligibility Matrix","options":["Option A (Correct)","Option B","Option C","Option D"],"correct_answer":0,"explanation":"Practice exercise instructions: Write an IF statement checking if Sales (B2) > 5000 AND Rating (C2) >= 4."}]$L_JSON$::jsonb,
   80,
   5
 );

 -- Module 3: Lookup Functions: VLOOKUP, XLOOKUP & INDEX-MATCH
 INSERT INTO public.modules (id, course_id, module_number, title, description, order_index)
 VALUES (
   $L_ID$custom-ai-1784871062774-mastering-ai-tools---chatgpt-for-everyday-productivity_mod_3$L_ID$,
   $L_ID$custom-ai-1784871062774-mastering-ai-tools---chatgpt-for-everyday-productivity$L_ID$,
   3,
   $L_TXT$Lookup Functions: VLOOKUP, XLOOKUP & INDEX-MATCH$L_TXT$,
   $L_TXT$Perform relational data lookups across tables using VLOOKUP, XLOOKUP, and flexible INDEX-MATCH pairs.$L_TXT$,
   3
 );
 INSERT INTO public.lessons (id, module_id, lesson_number, title, content, content_type, video_url, duration_minutes, order_index)
 VALUES (
   $L_ID$custom-ai-1784871062774-mastering-ai-tools---chatgpt-for-everyday-productivity_mod_3_les_1$L_ID$,
   $L_ID$custom-ai-1784871062774-mastering-ai-tools---chatgpt-for-everyday-productivity_mod_3$L_ID$,
   1,
   $L_TXT$Modern Data Lookups with XLOOKUP & VLOOKUP$L_TXT$,
   $L_TXT$# The Ultimate Guide to Lookups in Excel

 Data lookup functions connect separate datasets by linking common keys (e.g., Employee ID, SKU Number).

 ## 1. Traditional VLOOKUP
 Searches for a key in the first column of a table and retrieves values from specified column index:
 ```excel
 =VLOOKUP(Lookup_Value, Table_Array, Col_Index_Num, FALSE)
 // Example
 =VLOOKUP("SKU-102", A2:D100, 3, FALSE)
 ```

 ## 2. Modern XLOOKUP (Recommended)
 XLOOKUP replaces VLOOKUP and INDEX-MATCH with faster, bidirectional lookup power:
 ```excel
 =XLOOKUP(lookup_value, lookup_array, return_array, [if_not_found])
 // Example
 =XLOOKUP(E2, Employee[ID], Employee[Salary], "Not Found")
 ```

 ### Why XLOOKUP Wins:
 - Lookups left or right.
 - Defaults to exact match.
 - Built-in error handling ("Not Found").$L_TXT$,
   'text',
   $L_TXT$$L_TXT$,
   40,
   1
 );
 INSERT INTO public.quizzes (id, course_id, module_index, lesson_id, questions, passing_score, time_limit_minutes)
 VALUES (
   $L_ID$quiz_custom-ai-1784871062774-mastering-ai-tools---chatgpt-for-everyday-productivity_mod_3_les_1$L_ID$,
   $L_ID$custom-ai-1784871062774-mastering-ai-tools---chatgpt-for-everyday-productivity$L_ID$,
   3,
   $L_ID$custom-ai-1784871062774-mastering-ai-tools---chatgpt-for-everyday-productivity_mod_3_les_1$L_ID$,
   $L_JSON$[{"question":"Lesson 1 Checkpoint: Exercise: Fetch Employee Salary with XLOOKUP","options":["Option A (Correct)","Option B","Option C","Option D"],"correct_answer":0,"explanation":"Practice exercise instructions: Write XLOOKUP formula to search for Employee ID in A2:A50 and pull Salary from D2:D50."}]$L_JSON$::jsonb,
   80,
   5
 );

 -- Module 4: Pivot Tables & Dynamic Summary Reports
 INSERT INTO public.modules (id, course_id, module_number, title, description, order_index)
 VALUES (
   $L_ID$custom-ai-1784871062774-mastering-ai-tools---chatgpt-for-everyday-productivity_mod_4$L_ID$,
   $L_ID$custom-ai-1784871062774-mastering-ai-tools---chatgpt-for-everyday-productivity$L_ID$,
   4,
   $L_TXT$Pivot Tables & Dynamic Summary Reports$L_TXT$,
   $L_TXT$Summarize thousands of rows of data instantly with Pivot Tables, Slicers, and Pivot Charts.$L_TXT$,
   4
 );
 INSERT INTO public.lessons (id, module_id, lesson_number, title, content, content_type, video_url, duration_minutes, order_index)
 VALUES (
   $L_ID$custom-ai-1784871062774-mastering-ai-tools---chatgpt-for-everyday-productivity_mod_4_les_1$L_ID$,
   $L_ID$custom-ai-1784871062774-mastering-ai-tools---chatgpt-for-everyday-productivity_mod_4$L_ID$,
   1,
   $L_TXT$Building Interactive Pivot Tables & Slicers$L_TXT$,
   $L_TXT$# Pivot Tables: Turn Big Data into Insights

 Pivot Tables allow you to summarize, group, filter, and analyze large datasets without writing complex formulas.

 ## 1. Creating a Pivot Table
 1. Select your clean data range or Excel Table (`Ctrl + T`).
 2. Go to **Insert > PivotTable**.
 3. Choose destination worksheet.

 ## 2. The Four Pivot Table Quadrants
 - **Filters**: Global dataset filtering.
 - **Columns**: Horizontal breakdown (e.g., Quarters).
 - **Rows**: Primary categories (e.g., Product Lines).
 - **Values**: Aggregation metrics (SUM, AVERAGE, COUNT).

 ## 3. Adding Visual Slicers
 Slicers provide one-click interactive filtering buttons for executive dashboards!$L_TXT$,
   'text',
   $L_TXT$$L_TXT$,
   30,
   1
 );
 INSERT INTO public.quizzes (id, course_id, module_index, lesson_id, questions, passing_score, time_limit_minutes)
 VALUES (
   $L_ID$quiz_custom-ai-1784871062774-mastering-ai-tools---chatgpt-for-everyday-productivity_mod_4_les_1$L_ID$,
   $L_ID$custom-ai-1784871062774-mastering-ai-tools---chatgpt-for-everyday-productivity$L_ID$,
   4,
   $L_ID$custom-ai-1784871062774-mastering-ai-tools---chatgpt-for-everyday-productivity_mod_4_les_1$L_ID$,
   $L_JSON$[{"question":"Lesson 1 Checkpoint: Exercise: Regional Sales Pivot Table","options":["Option A (Correct)","Option B","Option C","Option D"],"correct_answer":0,"explanation":"Practice exercise instructions: Create a Pivot Table placing \"Region\" in Rows and \"Revenue\" in Values summarized as SUM."}]$L_JSON$::jsonb,
   80,
   5
 );

 -- Module 5: Data Cleansing & Power Query Automation
 INSERT INTO public.modules (id, course_id, module_number, title, description, order_index)
 VALUES (
   $L_ID$custom-ai-1784871062774-mastering-ai-tools---chatgpt-for-everyday-productivity_mod_5$L_ID$,
   $L_ID$custom-ai-1784871062774-mastering-ai-tools---chatgpt-for-everyday-productivity$L_ID$,
   5,
   $L_TXT$Data Cleansing & Power Query Automation$L_TXT$,
   $L_TXT$Clean dirty messy data, handle missing values, split columns, and automate ETL workflows using Power Query.$L_TXT$,
   5
 );
 INSERT INTO public.lessons (id, module_id, lesson_number, title, content, content_type, video_url, duration_minutes, order_index)
 VALUES (
   $L_ID$custom-ai-1784871062774-mastering-ai-tools---chatgpt-for-everyday-productivity_mod_5_les_1$L_ID$,
   $L_ID$custom-ai-1784871062774-mastering-ai-tools---chatgpt-for-everyday-productivity_mod_5$L_ID$,
   1,
   $L_TXT$Data Cleaning: TRIM, CLEAN, TEXTJOIN & Flash Fill$L_TXT$,
   $L_TXT$# Master Excel Data Cleansing

 Raw data exported from CRMs or SQL databases is often messy—containing extra spaces, bad capitalization, or combined fields.

 ## 1. Removing Irregular Spaces (`TRIM`)
 `TRIM` removes leading, trailing, and duplicate spaces:
 ```excel
 =TRIM(A2)
 ```

 ## 2. Text Case Conversion (`UPPER`, `LOWER`, `PROPER`)
 - `PROPER("john DOE")` -> `"John Doe"`
 - `UPPER("sku-100")` -> `"SKU-100"`

 ## 3. Flash Fill (`Ctrl + E`)
 Excel auto-detects patterns in adjacent columns to split names, extract phone numbers, or reformat dates automatically!$L_TXT$,
   'text',
   $L_TXT$$L_TXT$,
   30,
   1
 );
 INSERT INTO public.quizzes (id, course_id, module_index, lesson_id, questions, passing_score, time_limit_minutes)
 VALUES (
   $L_ID$quiz_custom-ai-1784871062774-mastering-ai-tools---chatgpt-for-everyday-productivity_mod_5_les_1$L_ID$,
   $L_ID$custom-ai-1784871062774-mastering-ai-tools---chatgpt-for-everyday-productivity$L_ID$,
   5,
   $L_ID$custom-ai-1784871062774-mastering-ai-tools---chatgpt-for-everyday-productivity_mod_5_les_1$L_ID$,
   $L_JSON$[{"question":"Lesson 1 Checkpoint: Exercise: Clean Customer Name Records","options":["Option A (Correct)","Option B","Option C","Option D"],"correct_answer":0,"explanation":"Practice exercise instructions: Clean messy string \"  jANe   sMITh  \" into \"Jane Smith\"."}]$L_JSON$::jsonb,
   80,
   5
 );

 -- Module 6: Excel Charts, Visualization & Executive Dashboards
 INSERT INTO public.modules (id, course_id, module_number, title, description, order_index)
 VALUES (
   $L_ID$custom-ai-1784871062774-mastering-ai-tools---chatgpt-for-everyday-productivity_mod_6$L_ID$,
   $L_ID$custom-ai-1784871062774-mastering-ai-tools---chatgpt-for-everyday-productivity$L_ID$,
   6,
   $L_TXT$Excel Charts, Visualization & Executive Dashboards$L_TXT$,
   $L_TXT$Build professional bar charts, line trends, waterfall graphs, and interactive KPI dashboards.$L_TXT$,
   6
 );
 INSERT INTO public.lessons (id, module_id, lesson_number, title, content, content_type, video_url, duration_minutes, order_index)
 VALUES (
   $L_ID$custom-ai-1784871062774-mastering-ai-tools---chatgpt-for-everyday-productivity_mod_6_les_1$L_ID$,
   $L_ID$custom-ai-1784871062774-mastering-ai-tools---chatgpt-for-everyday-productivity_mod_6$L_ID$,
   1,
   $L_TXT$Designing Professional Charts & KPI Scorecards$L_TXT$,
   $L_TXT$# Data Visualization Best Practices in Excel

 Charts communicate trends and insights faster than raw tables.

 ## 1. Choosing the Right Chart Type
 - **Bar/Column Chart**: Category comparisons.
 - **Line Chart**: Time-series trend analysis (monthly sales).
 - **Pie Chart**: Single composition (limit to < 5 slices).
 - **Combo Chart**: Dual axis (e.g., Revenue $ + Margin %).

 ## 2. Executive Formatting Rules
 1. **Remove Gridline Clutter**: Keep chart backgrounds clean.
 2. **Direct Data Labels**: Label bars directly instead of distant legends.
 3. **Consistent Palette**: Use corporate dark navy and subtle accent colors.$L_TXT$,
   'text',
   $L_TXT$$L_TXT$,
   35,
   1
 );
 INSERT INTO public.quizzes (id, course_id, module_index, lesson_id, questions, passing_score, time_limit_minutes)
 VALUES (
   $L_ID$quiz_custom-ai-1784871062774-mastering-ai-tools---chatgpt-for-everyday-productivity_mod_6_les_1$L_ID$,
   $L_ID$custom-ai-1784871062774-mastering-ai-tools---chatgpt-for-everyday-productivity$L_ID$,
   6,
   $L_ID$custom-ai-1784871062774-mastering-ai-tools---chatgpt-for-everyday-productivity_mod_6_les_1$L_ID$,
   $L_JSON$[{"question":"Lesson 1 Checkpoint: Exercise: Create 12-Month Sales Trend Line Chart","options":["Option A (Correct)","Option B","Option C","Option D"],"correct_answer":0,"explanation":"Practice exercise instructions: Highlight Month (A2:A13) and Sales (B2:B13) and insert a smooth Line Chart with data markers."}]$L_JSON$::jsonb,
   80,
   5
 );

 -- Final Exam Questions (2 Questions)
 INSERT INTO public.final_exam_questions (id, course_id, module_index, difficulty, question, options, correct_answer, explanation, order_index)
 VALUES (
   $L_ID$fe_custom-ai-1784871062774-mastering-ai-tools---chatgpt-for-everyday-productivity_q1$L_ID$,
   $L_ID$custom-ai-1784871062774-mastering-ai-tools---chatgpt-for-everyday-productivity$L_ID$,
   1,
   $L_TXT$medium$L_TXT$,
   $L_TXT$Which lookup function allows bidirectional lookup without column number counting?$L_TXT$,
   $L_JSON$["VLOOKUP","HLOOKUP","XLOOKUP","LOOKUP"]$L_JSON$::jsonb,
   2,
   $L_TXT$XLOOKUP searches in any direction and defaults to exact match without needing column index numbers.$L_TXT$,
   1
 );
 INSERT INTO public.final_exam_questions (id, course_id, module_index, difficulty, question, options, correct_answer, explanation, order_index)
 VALUES (
   $L_ID$fe_custom-ai-1784871062774-mastering-ai-tools---chatgpt-for-everyday-productivity_q2$L_ID$,
   $L_ID$custom-ai-1784871062774-mastering-ai-tools---chatgpt-for-everyday-productivity$L_ID$,
   1,
   $L_TXT$easy$L_TXT$,
   $L_TXT$Which formula cleans leading, trailing, and duplicate middle spaces from string "  John   Doe "?$L_TXT$,
   $L_JSON$["CLEAN(A1)","TRIM(A1)","REMOVE(A1)","PROPER(A1)"]$L_JSON$::jsonb,
   1,
   $L_TXT$TRIM removes unwanted spaces while retaining single spaces between words.$L_TXT$,
   2
 );

 COMMIT;

 -- VERIFICATION QUERY
 SELECT 'LERNEXAI ONE-SHOT SUCCESS' as status, c.id, c.title,
   (SELECT COUNT(*) FROM public.modules WHERE course_id = c.id) as total_modules,
   (SELECT COUNT(*) FROM public.lessons WHERE module_id IN (SELECT id FROM public.modules WHERE course_id = c.id)) as total_lessons,
   (SELECT COUNT(*) FROM public.quizzes WHERE course_id = c.id) as total_quizzes,
   (SELECT COUNT(*) FROM public.final_exam_questions WHERE course_id = c.id) as total_exam_questions
 FROM public.courses c WHERE c.id = $L_ID$custom-ai-1784871062774-mastering-ai-tools---chatgpt-for-everyday-productivity$L_ID$;
  v_course_meta jsonb;
  v_course_id uuid;
  v_module record;
  v_lesson record;
  v_module_quiz jsonb;
  v_final_question record;
  v_module_id uuid;
  v_lesson_id uuid;
  v_course_title text;
  v_module_number integer;
  v_lesson_number integer;
  v_order_index integer;
  v_final_exam jsonb;
  v_lesson_content text;
BEGIN
  v_course_meta := v_payload->'course_metadata';
  v_course_title := v_course_meta->>'title';

  IF v_course_title IS NULL OR v_course_title = '' THEN
    RAISE EXCEPTION 'course_metadata.title is required. Replace the payload JSON first.';
  END IF;

  DELETE FROM public.courses
  WHERE title = v_course_title;

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
    v_course_meta->>'title',
    COALESCE(v_course_meta->>'description', ''),
    COALESCE(v_course_meta->>'category', 'Productivity'),
    COALESCE(v_course_meta->>'level', v_course_meta->>'difficulty_level', 'Beginner'),
    COALESCE((v_course_meta->>'is_premium')::boolean, false),
    COALESCE((v_course_meta->>'total_modules')::int, jsonb_array_length(COALESCE(v_payload->'modules', '[]'::jsonb))),
    COALESCE((v_course_meta->>'estimated_completion_hours')::int, (v_course_meta->>'total_estimated_hours')::int, 0),
    COALESCE(v_course_meta->>'cover_image_url', (v_payload->'modules'->0->>'image_url'))
  )
  RETURNING id INTO v_course_id;

  FOR v_module IN
    SELECT value
    FROM jsonb_array_elements(COALESCE(v_payload->'modules', '[]'::jsonb)) AS value
    ORDER BY (value->>'module_number')::int
  LOOP
    v_module_number := COALESCE((v_module.value->>'module_number')::int, 0);

    INSERT INTO public.modules (
      course_id,
      module_number,
      title,
      description,
      order_index
    )
    VALUES (
      v_course_id,
      v_module_number,
      COALESCE(v_module.value->>'title', ''),
      COALESCE(v_module.value->>'description', ''),
      v_module_number
    )
    RETURNING id INTO v_module_id;

    FOR v_lesson IN
      SELECT value
      FROM jsonb_array_elements(COALESCE(v_module.value->'lessons', '[]'::jsonb)) AS value
      ORDER BY (value->>'lesson_number')::int
    LOOP
      v_lesson_number := COALESCE((v_lesson.value->>'lesson_number')::int, 0);

      v_lesson_content := COALESCE(
        v_lesson.value->>'content_markdown',
        v_lesson.value->>'text_content',
        v_lesson.value->>'content',
        ''
      );

      INSERT INTO public.lessons (
        module_id,
        lesson_number,
        title,
        content,
        content_type,
        video_url,
        duration_minutes,
        order_index
      )
      VALUES (
        v_module_id,
        v_lesson_number,
        COALESCE(v_lesson.value->>'title', ''),
        v_lesson_content,
        COALESCE(v_lesson.value->>'content_type', 'text'),
        NULLIF(v_lesson.value->>'video_url', ''),
        COALESCE((v_lesson.value->>'estimated_minutes')::int, (v_lesson.value->>'duration_minutes')::int, 0),
        v_lesson_number
      )
      RETURNING id INTO v_lesson_id;

      IF jsonb_typeof(v_lesson.value->'quiz') = 'object'
         AND jsonb_typeof(v_lesson.value->'quiz'->'questions') = 'array'
         AND jsonb_array_length(v_lesson.value->'quiz'->'questions') > 0 THEN
        INSERT INTO public.quizzes (
          course_id,
          module_index,
          lesson_id,
          questions,
          passing_score,
          time_limit_minutes
        )
        VALUES (
          v_course_id,
          v_module_number,
          v_lesson_id,
          v_lesson.value->'quiz'->'questions',
          COALESCE((v_lesson.value->'quiz'->>'passing_score')::int, 80),
          COALESCE((v_lesson.value->'quiz'->>'time_limit_minutes')::int, 5)
        );
      END IF;
    END LOOP;

    IF jsonb_typeof(v_payload->'quizzes') = 'array' THEN
      SELECT q.value
        INTO v_module_quiz
      FROM jsonb_array_elements(v_payload->'quizzes') AS q(value)
      WHERE COALESCE((q.value->>'module_number')::int, 0) = v_module_number
        AND COALESCE(q.value->>'quiz_type', 'module_checkpoint') = 'module_checkpoint'
      LIMIT 1;
    ELSE
      v_module_quiz := NULL;
    END IF;

    IF v_module_quiz IS NULL AND jsonb_typeof(v_module.value->'module_quiz') = 'object' THEN
      v_module_quiz := v_module.value->'module_quiz';
    END IF;

    IF jsonb_typeof(v_module_quiz) = 'object'
       AND jsonb_typeof(v_module_quiz->'questions') = 'array'
       AND jsonb_array_length(v_module_quiz->'questions') > 0 THEN
      INSERT INTO public.quizzes (
        course_id,
        module_index,
        lesson_id,
        questions,
        passing_score,
        time_limit_minutes
      )
      VALUES (
        v_course_id,
        v_module_number,
        NULL,
        v_module_quiz->'questions',
        COALESCE((v_module_quiz->>'passing_score')::int, 80),
        COALESCE((v_module_quiz->>'time_limit_minutes')::int, 10)
      );
    END IF;
  END LOOP;

  DELETE FROM public.final_exam_questions
  WHERE course_id = v_course_id;

  IF jsonb_typeof(v_payload->'final_exam') = 'object'
     AND jsonb_typeof(v_payload->'final_exam'->'questions') = 'array' THEN
    v_order_index := 0;

    FOR v_final_question IN
      SELECT value
      FROM jsonb_array_elements(v_payload->'final_exam'->'questions') AS value
    LOOP
      v_order_index := v_order_index + 1;

      INSERT INTO public.final_exam_questions (
        course_id,
        module_index,
        difficulty,
        question,
        options,
        correct_answer,
        explanation,
        order_index
      )
      VALUES (
        v_course_id,
        COALESCE((v_final_question.value->>'module_number')::int, 0),
        COALESCE(v_final_question.value->>'difficulty', 'easy'),
        COALESCE(v_final_question.value->>'question', ''),
        COALESCE(v_final_question.value->'options', '[]'::jsonb),
        COALESCE((v_final_question.value->>'correct_answer')::int, 0),
        COALESCE(v_final_question.value->>'explanation', ''),
        v_order_index
      );
    END LOOP;
  END IF;

  RAISE NOTICE 'Published course "%" with id %', v_course_title, v_course_id;
END $$;

COMMIT;
