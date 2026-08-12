-- ============================================
-- EXCEL COURSE COMPLETE INJECTION
-- Single file - execute step by step
-- ============================================

-- STEP 1: Create Course and get ID
-- ============================================
DO $$
DECLARE
    course_id UUID;
    module1_id UUID;
    module2_id UUID;
    module3_id UUID;
BEGIN
    -- Create Course
    INSERT INTO courses (
        id,
        title,
        description,
        category,
        difficulty,
        is_premium,
        total_modules,
        estimated_hours,
        cover_image_url
    ) VALUES (
        gen_random_uuid(),
        'Excel for Beginners: Master Essential Desktop Spreadsheet Skills',
        'A step-by-step masterclass designed for absolute beginners to master Microsoft Excel on PC/Laptop. Learn grid navigation, formatting, fundamental formulas (SUM, AVERAGE, COUNT, IF), data sorting/filtering, and instant chart creation.',
        'Productivity',
        'beginner',
        false,
        3,
        9,
        'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1200&q=80'
    ) RETURNING id INTO course_id;
    
    RAISE NOTICE 'Course created with ID: %', course_id;
    
    -- Create Module 1
    INSERT INTO modules (
        id,
        course_id,
        module_number,
        title,
        description,
        order_index
    ) VALUES (
        gen_random_uuid(),
        course_id,
        1,
        'Module 1: Excel Grid Navigation & Data Formatting',
        'Module 1: Excel Grid Navigation & Data Formatting',
        1
    ) RETURNING id INTO module1_id;
    
    RAISE NOTICE 'Module 1 created with ID: %', module1_id;
    
    -- Create Module 2
    INSERT INTO modules (
        id,
        course_id,
        module_number,
        title,
        description,
        order_index
    ) VALUES (
        gen_random_uuid(),
        course_id,
        2,
        'Module 2: Core Formulas & Essential Functions',
        'Module 2: Core Formulas & Essential Functions',
        2
    ) RETURNING id INTO module2_id;
    
    RAISE NOTICE 'Module 2 created with ID: %', module2_id;
    
    -- Create Module 3
    INSERT INTO modules (
        id,
        course_id,
        module_number,
        title,
        description,
        order_index
    ) VALUES (
        gen_random_uuid(),
        course_id,
        3,
        'Module 3: Data Sorting, Filtering & Quick Visual Charts',
        'Module 3: Data Sorting, Filtering & Quick Visual Charts',
        3
    ) RETURNING id INTO module3_id;
    
    RAISE NOTICE 'Module 3 created with ID: %', module3_id;
    
    -- Create Lessons for Module 1
    INSERT INTO lessons (id, module_id, lesson_number, title, content_type, content, video_url, duration_minutes, order_index) VALUES
    (gen_random_uuid(), module1_id, 1, 'Lesson 1.1: Interface Overview & Workbook Setup', 'text', 
    'Microsoft Excel Desktop organizes numerical and textual data into a structured matrix of columns (labeled A, B, C) and rows (labeled 1, 2, 3). Understanding cell grid coordinates (such as cell A1 or D12) and navigating the Desktop Ribbon toolbar tabs (Home, Insert, Page Layout, Data) forms the essential foundation for all spreadsheet modeling. Mastering mouse left-clicks, right-clicks, and keyboard focus allows professionals to construct clean reports efficiently.

## Environment & Tools Setup
Launch Microsoft Excel 365 or Excel 2021 on your Windows PC or Mac Desktop. Click "Blank Workbook" on the welcome screen to initialize a fresh worksheet. Ensure the Formula Bar and Gridlines are visible by navigating to Ribbon -> View Tab -> Show Group -> Check "Gridlines" and "Formula Bar".

## Key Tools & Shortcuts
• Navigation Shortcuts: Ctrl + Arrow Keys (jump to edge of data block), Ctrl + Home (return to A1), Ctrl + End (jump to last populated cell).
• Key Workbook Actions: F2 (Edit active cell), Ctrl + N (Create new workbook), Ctrl + S (Save workbook instantly).

## Practical Implementation Workflow
Step 1: Left-click cell A1 and type "Q1 Sales Report 2026" then press Enter.
Step 2: Left-click cell A3 and enter column header "Item ID". Press Tab key to move right to B3.
Step 3: In B3, type "Product Name", in C3 type "Quantity Sold", in D3 type "Unit Cost", and in E3 type "Total Value".
Step 4: Select row 3 by left-clicking row header 3, then go to Home Tab -> Font Group -> click "Bold" (Ctrl + B) and set fill color to Light Slate Grey.

## Industry Pro-Tips & Pitfalls
• PRO-TIP: Double-click the column border line between column letters (e.g., between A and B) to AutoFit the column width to the longest text string instantly.
• COMMON PITFALL: Avoid typing currency symbols like "$" or "₹" directly inside numerical values, as Excel will treat them as raw text strings and break downstream calculations.

## Hands-On Assignment
Open Excel Desktop, build a 5-item product inventory table with column headers for Item, Category, Units, and Price, then apply bold formatting to the header row.

## Expected Deliverable
Saved Excel workbook (.xlsx) containing a clean 5-row inventory grid with AutoFitted columns and formatted headers.', NULL, 15, 1),
    
    (gen_random_uuid(), module1_id, 2, 'Lesson 1.2: Number Formatting, Fonts & Cell Borders', 'text',
    'Raw numerical data without visual hierarchy is difficult to analyze. Number formatting inside Microsoft Excel transforms plain digits into intuitive values—such as Currencies ($ / ₹ / €), Percentages (%), or Dates—without altering the underlying precision stored in memory. Cell borders and background fills draw immediate visual attention to total summary rows.

## Environment & Tools Setup
Open your active inventory workbook on Excel Desktop. Highlight the numerical data cells in column D (Unit Cost) and column E (Total Value) by left-clicking and dragging down the range.

## Key Tools & Shortcuts
• Number Formatting Shortcuts: Ctrl + Shift + $ (Apply Currency Format), Ctrl + Shift + % (Apply Percentage Format), Ctrl + Shift + # (Apply Date Format).
• Border Tools: Home Tab -> Font Group -> Borders drop-down menu -> "All Borders" and "Thick Outside Border".

## Practical Implementation Workflow
Step 1: Left-click cell D4 and drag down to D8 to select the cost cells.
Step 2: On the Home tab in the Ribbon, navigate to the Number group drop-down menu and select "Currency".
Step 3: Click "Decrease Decimal" button twice if you wish to round figures to whole units.
Step 4: Select row 9 (Summary Row), apply "Top Border and Double Bottom Border" from Home Tab -> Font Group -> Borders menu.

## Industry Pro-Tips & Pitfalls
• PRO-TIP: Use Format Painter (Home Tab -> Clipboard Group -> Paintbrush Icon) to copy formatting from one cell block and paint it onto another range with a single click.
• COMMON PITFALL: Storing numbers as text strings (indicated by a small green triangle in the top-left corner of a cell) will cause SUM formulas to skip those cells.

## Hands-On Assignment
Format a list of 5 employee salaries into Currency format with 2 decimal places and apply a double bottom border to the summary row.

## Expected Deliverable
Excel worksheet displaying properly formatted currency values and double-underline summary border aesthetics.', NULL, 15, 2);
    
    RAISE NOTICE 'Module 1 lessons created (2 lessons)';
    
    -- Create Lessons for Module 2
    INSERT INTO lessons (id, module_id, lesson_number, title, content_type, content, video_url, duration_minutes, order_index) VALUES
    (gen_random_uuid(), module2_id, 1, 'Lesson 2.1: Mathematical Calculations & AutoSum (SUM, AVERAGE, COUNT)', 'text',
    'Formulas are the core computational engine of Microsoft Excel. Every formula begins with an equals sign (=). Rather than typing static numbers, Excel relies on cell references (e.g., =B4*C4) so that calculations update automatically whenever source numbers are modified. Fundamental statistical functions like SUM, AVERAGE, and COUNT handle aggregate reporting effortlessly.

## Environment & Tools Setup
Select your sales report worksheet in Excel Desktop with numerical columns populated in C4:C8 (Quantities) and D4:D8 (Unit Costs).

## Key Tools & Shortcuts
• Essential Syntax: =SUM(range), =AVERAGE(range), =COUNT(range), =MAX(range), =MIN(range).
• Instant AutoSum Shortcut: Alt + = (Automatically inserts SUM formula for adjacent numerical cells).

## Practical Implementation Workflow
Step 1: Left-click cell E4 and type "=C4*D4" then press Enter to calculate Total Value for row 1.
Step 2: Hover mouse cursor over the bottom-right corner of cell E4 until it becomes a solid black cross (Fill Handle).
Step 3: Double-click or left-click and drag the Fill Handle down to E8 to copy the formula to all rows.
Step 4: Left-click cell E9 below the total column, press "Alt + =" on keyboard, and press Enter to compute grand total.

## Industry Pro-Tips & Pitfalls
• PRO-TIP: Press Ctrl + ` (grave accent) on keyboard to toggle "Show Formulas" mode across the entire sheet to audit calculations quickly.
• COMMON PITFALL: Creating circular references (e.g., placing =SUM(E4:E9) inside cell E9 itself) causes an error loop in Excel.

## Hands-On Assignment
Calculate total revenue, average sale value, and total transaction count for a 5-row invoice sheet using SUM, AVERAGE, and COUNT.

## Expected Deliverable
Excel spreadsheet containing dynamic =SUM, =AVERAGE, and =COUNT formulas calculating accurate grand totals.', NULL, 15, 1),
    
    (gen_random_uuid(), module2_id, 2, 'Lesson 2.2: Logical Decision Making with IF Functions', 'text',
    'The IF function introduces automated logic into spreadsheets. It evaluates a specified logical condition (e.g., whether sales exceed a target) and returns one distinct value if the condition is TRUE, and another value if the condition is FALSE. This is essential for credit approvals, performance flags, discount rules, and automated grading.

## Environment & Tools Setup
In Desktop Excel, open your worksheet and add a new column header in cell F3 named "Bonus Status".

## Key Tools & Shortcuts
• IF Function Syntax: =IF(logical_test, value_if_true, value_if_false).
• Logical Operators: > (Greater than), < (Less than), >= (Greater or equal), <= (Less or equal), <> (Not equal to).

## Practical Implementation Workflow
Step 1: Left-click cell F4.
Step 2: Type "=IF(E4>=1000, "Eligible", "Standard")" into the Formula Bar.
Step 3: Press Enter. Excel evaluates cell E4 and displays "Eligible" if total value is 1000 or higher.
Step 4: Left-click the Fill Handle of cell F4 and drag down to F8 to apply logical check across all inventory items.

## Industry Pro-Tips & Pitfalls
• PRO-TIP: Enclose textual output values inside double quotation marks (e.g., "Eligible") inside formulas; numbers do not require quotes.
• COMMON PITFALL: Forgetting to close parentheses or misplacing quotation marks results in a "#NAME?" or syntax error popup.

## Hands-On Assignment
Create a column titled "Stock Alert" using an IF formula that outputs "Reorder Needed" if Quantity < 10, otherwise "In Stock".

## Expected Deliverable
Excel file with a working IF formula column accurately flagging low inventory stock levels.', NULL, 15, 2);
    
    RAISE NOTICE 'Module 2 lessons created (2 lessons)';
    
    -- Create Lessons for Module 3
    INSERT INTO lessons (id, module_id, lesson_number, title, content_type, content, video_url, duration_minutes, order_index) VALUES
    (gen_random_uuid(), module3_id, 1, 'Lesson 3.1: Data Sorting & Multi-Criteria AutoFiltering', 'text',
    'As datasets grow to hundreds of rows, finding specific records manually becomes unfeasible. Sorting reorganizes rows alphabetically or numerically (A-Z, Z-A, Smallest to Largest). AutoFiltering allows users to temporarily isolate specific rows matching strict criteria without deleting underlying data.

## Environment & Tools Setup
Click any single cell inside your populated data table on Excel Desktop. Ensure row 3 contains distinct header titles.

## Key Tools & Shortcuts
• Toggle AutoFilter Shortcut: Ctrl + Shift + L (Instantly adds or removes drop-down filter arrows on headers).
• Sort Actions: Ribbon Data Tab -> Sort & Filter Group -> "Sort A to Z" or "Sort Z to A".

## Practical Implementation Workflow
Step 1: Press Ctrl + Shift + L on keyboard to activate AutoFilter arrows on all header cells in row 3.
Step 2: Left-click the filter arrow on "Category" header cell B3.
Step 3: Uncheck "(Select All)", then check only "Hardware" and click OK.
Step 4: Left-click the filter arrow on "Total Value" cell E3 and choose "Sort Largest to Smallest" to order records by highest value.

## Industry Pro-Tips & Pitfalls
• PRO-TIP: Ensure there are no completely blank rows or blank columns inside your data table before applying filters, otherwise Excel will only filter the top subset.
• COMMON PITFALL: Sorting only a single selected column instead of the whole table scrambles data rows across columns permanently.

## Hands-On Assignment
Apply AutoFilters to a 10-row sales log on Excel Desktop, sort rows by highest total revenue, and filter for a specific region.

## Expected Deliverable
Excel worksheet with active drop-down filter arrows showing filtered, sorted sales records.', NULL, 15, 1),
    
    (gen_random_uuid(), module3_id, 2, 'Lesson 3.2: Creating Column & Pie Charts for Executive Reports', 'text',
    'Visual charts transform dense numerical tables into executive graphic summaries. Column and Bar charts illustrate comparisons across discrete product categories, while Pie charts demonstrate proportional market share. Excel Desktop provides powerful formatting tools to customize chart titles, legends, axis scales, and color themes.

## Environment & Tools Setup
In Excel Desktop, highlight the summary range containing category names in B4:B8 and total sales values in E4:E8.

## Key Tools & Shortcuts
• Instant Chart Shortcut: Alt + F1 (Inserts a default 2D Column Chart on the active sheet instantly).
• Chart Ribbon Tabs: Chart Design Tab and Format Tab (appear automatically when chart object is selected).

## Practical Implementation Workflow
Step 1: Select cell range B3:B8, hold Ctrl key on keyboard, and select range E3:E8.
Step 2: Navigate to Ribbon -> Insert Tab -> Charts Group -> click "Insert Column or Bar Chart" -> select "2D Clustered Column".
Step 3: Double-click the "Chart Title" text box on top of the chart object and type "Q1 Product Sales Comparison".
Step 4: Drag the chart object below your table and resize using the corner handles.

## Industry Pro-Tips & Pitfalls
• PRO-TIP: Press Alt + F1 after highlighting data to generate a clean column chart instantly without navigating submenus.
• COMMON PITFALL: Selecting totals rows along with category breakdown rows in chart ranges skews the scale, making individual bars look artificially small.

## Hands-On Assignment
Generate a 2D Column Chart from a 5-item sales summary table in Excel Desktop, rename the title, and place it neatly below the data grid.

## Expected Deliverable
Excel workbook featuring a professional 2D Column Chart aligned below the source table.', NULL, 15, 2);
    
    RAISE NOTICE 'Module 3 lessons created (2 lessons)';
    
    -- Create Quizzes
    INSERT INTO quizzes (id, course_id, module_index, quiz_title, questions, passing_score, time_limit_minutes, question_count) VALUES
    (gen_random_uuid(), course_id, 1, 'Module 1 Quiz: Excel Navigation & Formatting',
    '[{"question":"What shortcut key returns you to cell A1?","options":["Ctrl + Home","Ctrl + End","Alt + Home","Shift + Home"],"correct_answer":0},{"question":"Which shortcut applies Currency format?","options":["Ctrl + Shift + $","Ctrl + Shift + %","Ctrl + Shift + #","Ctrl + Shift + !"],"correct_answer":0},{"question":"What happens when you double-click a column border?","options":["AutoFits column width","Deletes column","Hides column","Sorts column"],"correct_answer":0},{"question":"Which tool copies formatting from one cell to another?","options":["Format Painter","Fill Handle","AutoSum","Cell Styles"],"correct_answer":0},{"question":"What indicates a number is stored as text?","options":["Green triangle in corner","Red border","Blue background","Yellow highlight"],"correct_answer":0}]'::jsonb, 60, 10, 5),
    
    (gen_random_uuid(), course_id, 2, 'Module 2 Quiz: Excel Formulas & Functions',
    '[{"question":"What symbol must every Excel formula begin with?","options":["=","+","-","*"],"correct_answer":0},{"question":"Which function calculates the average of a range?","options":["=AVERAGE()","=SUM()","=COUNT()","=MAX()"],"correct_answer":0},{"question":"What is the AutoSum shortcut?","options":["Alt + =","Ctrl + =","Shift + =","Alt + S"],"correct_answer":0},{"question":"What does the IF function do?","options":["Evaluates conditions and returns different values","Sums a range","Counts cells","Formats cells"],"correct_answer":0},{"question":"What happens if you create a circular reference?","options":["Excel shows an error loop","Formula works normally","Cell becomes locked","Data gets deleted"],"correct_answer":0}]'::jsonb, 60, 10, 5),
    
    (gen_random_uuid(), course_id, 3, 'Module 3 Quiz: Data Sorting, Filtering & Charts',
    '[{"question":"What shortcut toggles AutoFilter arrows?","options":["Ctrl + Shift + L","Ctrl + L","Alt + L","Shift + L"],"correct_answer":0},{"question":"What happens if you sort only one column?","options":["Data rows get scrambled across columns","Sorts entire table correctly","Deletes other columns","Hides other columns"],"correct_answer":0},{"question":"What shortcut creates a default column chart?","options":["Alt + F1","Ctrl + F1","Alt + C","Ctrl + C"],"correct_answer":0},{"question":"What type of chart shows proportional market share?","options":["Pie chart","Column chart","Line chart","Bar chart"],"correct_answer":0},{"question":"Why should you avoid blank rows in data tables?","options":["Excel will only filter the top subset","Blank rows improve performance","Blank rows are required for formulas","Blank rows don''t affect filtering"],"correct_answer":0}]'::jsonb, 60, 10, 5);
    
    RAISE NOTICE 'All quizzes created (3 quizzes with 5 questions each)';
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'COURSE INJECTION COMPLETED SUCCESSFULLY';
    RAISE NOTICE 'Course ID: %', course_id;
    RAISE NOTICE 'Total: 3 modules, 6 lessons, 3 quizzes';
    RAISE NOTICE '===========================================';
    
END $$;
