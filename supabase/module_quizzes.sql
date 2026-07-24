-- Seed one five-question quiz for each Microsoft Excel Essentials module.
-- correct_answer is the zero-based index of the correct option.

INSERT INTO public.quizzes (course_id, module_index, questions, passing_score)
SELECT
  c.id,
  1,
  $questions$[
    {
      "question": "Which part of the Excel interface displays and lets you edit the contents or formula of the active cell?",
      "options": ["Name Box", "Formula Bar", "Status Bar", "Sheet tab"],
      "correct_answer": 1
    },
    {
      "question": "How is cell C7 identified in a worksheet?",
      "options": ["Column C intersecting row 7", "Row C intersecting column 7", "The seventh cell in column 7", "The third cell in row C"],
      "correct_answer": 0
    },
    {
      "question": "What happens when you click a column heading such as D?",
      "options": ["Only the first cell in column D is selected", "The entire column D is selected", "The entire fourth row is selected", "Column D is hidden"],
      "correct_answer": 1
    },
    {
      "question": "Which keyboard shortcut copies the currently selected cell or range?",
      "options": ["Ctrl+X", "Ctrl+V", "Ctrl+C", "Ctrl+Z"],
      "correct_answer": 2
    },
    {
      "question": "Which keyboard shortcut moves the active cell to the first cell of the current row?",
      "options": ["Home", "Ctrl+End", "Page Up", "Tab"],
      "correct_answer": 0
    }
  ]$questions$::jsonb,
  80
FROM public.courses AS c
WHERE c.title = 'Microsoft Excel Essentials'
  AND NOT EXISTS (
    SELECT 1
    FROM public.quizzes AS q
    WHERE q.course_id = c.id
      AND q.module_index = 1
  );

INSERT INTO public.quizzes (course_id, module_index, questions, passing_score)
SELECT
  c.id,
  2,
  $questions$[
    {
      "question": "Which entry will Excel normally treat as a numeric value that can be summed directly?",
      "options": ["'250", "250", "250 units", "Two hundred fifty"],
      "correct_answer": 1
    },
    {
      "question": "What does applying a Percentage number format to the stored value 0.25 display?",
      "options": ["0.25%", "2.5%", "25%", "250%"],
      "correct_answer": 2
    },
    {
      "question": "Which formatting changes a cell's appearance without changing its underlying value?",
      "options": ["Applying a currency number format", "Replacing 1000 with the text one thousand", "Deleting decimal digits from the formula", "Converting the cell to an image"],
      "correct_answer": 0
    },
    {
      "question": "Which data type should be used for a calendar date so Excel can sort dates chronologically and perform date calculations?",
      "options": ["A date value recognized by Excel", "Plain text with arbitrary wording", "A cell comment", "A shape label"],
      "correct_answer": 0
    },
    {
      "question": "Which feature automatically applies formatting when cell values meet specified rules?",
      "options": ["Format Painter", "Conditional Formatting", "Find and Replace", "Freeze Panes"],
      "correct_answer": 1
    }
  ]$questions$::jsonb,
  80
FROM public.courses AS c
WHERE c.title = 'Microsoft Excel Essentials'
  AND NOT EXISTS (
    SELECT 1
    FROM public.quizzes AS q
    WHERE q.course_id = c.id
      AND q.module_index = 2
  );

INSERT INTO public.quizzes (course_id, module_index, questions, passing_score)
SELECT
  c.id,
  3,
  $questions$[
    {
      "question": "Which formula correctly totals the values from B2 through B10?",
      "options": ["=SUM(B2:B10)", "=SUM(B2-B10)", "=TOTAL(B2:B10)", "=ADD(B2,B10)"],
      "correct_answer": 0
    },
    {
      "question": "Which formula returns the arithmetic mean of values in C2 through C6?",
      "options": ["=COUNT(C2:C6)", "=AVERAGE(C2:C6)", "=SUM(C2:C6)", "=MEAN(C2:C6)"],
      "correct_answer": 1
    },
    {
      "question": "What does =COUNT(A1:A10) count?",
      "options": ["All nonblank cells", "Only cells containing numeric values", "Only cells containing text", "All cells including blanks"],
      "correct_answer": 1
    },
    {
      "question": "Which formula displays Pass when D2 is at least 80 and Review otherwise?",
      "options": ["=IF(D2>=80,\"Pass\",\"Review\")", "=IF(D2,80,\"Pass\",\"Review\")", "=IF(D2<=80,\"Pass\",\"Review\")", "=IF(\"Pass\",D2>=80,\"Review\")"],
      "correct_answer": 0
    },
    {
      "question": "In =VLOOKUP(F2,A2:D20,3,FALSE), what does FALSE require?",
      "options": ["Return the last row in the table", "Use an exact match for F2", "Search the third row", "Ignore errors in column 3"],
      "correct_answer": 1
    }
  ]$questions$::jsonb,
  80
FROM public.courses AS c
WHERE c.title = 'Microsoft Excel Essentials'
  AND NOT EXISTS (
    SELECT 1
    FROM public.quizzes AS q
    WHERE q.course_id = c.id
      AND q.module_index = 3
  );

INSERT INTO public.quizzes (course_id, module_index, questions, passing_score)
SELECT
  c.id,
  4,
  $questions$[
    {
      "question": "What is a key benefit of converting a data range into an Excel table?",
      "options": ["It permanently locks all values", "It adds structured formatting and built-in filter controls", "It converts every value to text", "It prevents rows from being added"],
      "correct_answer": 1
    },
    {
      "question": "What does filtering a table do?",
      "options": ["Deletes rows that do not match", "Temporarily hides rows that do not meet selected criteria", "Reorders every column alphabetically", "Moves matching rows to another worksheet"],
      "correct_answer": 1
    },
    {
      "question": "To sort sales from largest to smallest, which sort order should you choose?",
      "options": ["Ascending", "Descending", "Custom list only", "Left to right"],
      "correct_answer": 1
    },
    {
      "question": "Why should a data table use one clear header in each column?",
      "options": ["Headers identify fields used by sorting and filtering", "Headers force every column to contain the same data type", "Headers prevent formulas from being entered", "Headers automatically remove duplicates"],
      "correct_answer": 0
    },
    {
      "question": "When a multi-level sort uses Department first and Last Name second, how are rows organized?",
      "options": ["Only by Last Name across the whole table", "By Department, then by Last Name within each department", "By whichever column contains more values", "Randomly within each department"],
      "correct_answer": 1
    }
  ]$questions$::jsonb,
  80
FROM public.courses AS c
WHERE c.title = 'Microsoft Excel Essentials'
  AND NOT EXISTS (
    SELECT 1
    FROM public.quizzes AS q
    WHERE q.course_id = c.id
      AND q.module_index = 4
  );

INSERT INTO public.quizzes (course_id, module_index, questions, passing_score)
SELECT
  c.id,
  5,
  $questions$[
    {
      "question": "Which chart type is generally best for showing a trend over time?",
      "options": ["Line chart", "Pie chart", "Doughnut chart", "Radar chart"],
      "correct_answer": 0
    },
    {
      "question": "Which chart is most appropriate for comparing values across several categories?",
      "options": ["Column chart", "Pie chart with many slices", "Surface chart", "Stock chart"],
      "correct_answer": 0
    },
    {
      "question": "What should you do first to create a chart from worksheet data?",
      "options": ["Select the relevant data range, including useful headers", "Delete the column headers", "Convert all values to text", "Hide the source data"],
      "correct_answer": 0
    },
    {
      "question": "Which chart element explains what each color or data series represents?",
      "options": ["Legend", "Plot area", "Gridline", "Chart border"],
      "correct_answer": 0
    },
    {
      "question": "If a chart communicates the wrong comparison, what is the most useful customization to try first?",
      "options": ["Add decorative effects", "Change the chart type or switch the row and column series", "Remove the chart title", "Make every series the same color"],
      "correct_answer": 1
    }
  ]$questions$::jsonb,
  80
FROM public.courses AS c
WHERE c.title = 'Microsoft Excel Essentials'
  AND NOT EXISTS (
    SELECT 1
    FROM public.quizzes AS q
    WHERE q.course_id = c.id
      AND q.module_index = 5
  );
