# ============================================
# PYTHON COURSE DATA FORMAT FOR SUPABASE
# Use this format in your AI course engine
# ============================================

import uuid
from datetime import datetime

# ============================================
# COURSE DATA FORMAT
# ============================================
course_data = {
    "id": str(uuid.uuid4()),  # Auto-generate or let Supabase handle
    "title": "Course Title Here",
    "description": "Course description here",
    "category": "Productivity",  # Required: Productivity, Programming, Design, etc.
    "difficulty": "beginner",  # Optional: beginner, intermediate, advanced
    "is_premium": False,  # Optional: True/False
    "total_modules": 3,  # Optional: Number of modules
    "estimated_hours": 9,  # Optional: Estimated duration
    "cover_image_url": "https://example.com/image.jpg"  # Optional
}

# ============================================
# MODULE DATA FORMAT
# ============================================
module_data = {
    "id": str(uuid.uuid4()),  # Auto-generate
    "course_id": "course_uuid_here",  # Link to course
    "module_number": 1,  # Required: Module number (1, 2, 3...)
    "title": "Module Title Here",
    "description": "Module description here",
    "order_index": 1  # Optional: Display order
}

# ============================================
# LESSON DATA FORMAT
# ============================================
lesson_data = {
    "id": str(uuid.uuid4()),  # Auto-generate
    "module_id": "module_uuid_here",  # Link to module
    "lesson_number": 1,  # Required: Lesson number within module
    "title": "Lesson Title Here",
    "content_type": "text",  # Optional: text, video, mixed
    "content": """
    ## Theoretical Deep Dive
    Your theoretical content here
    
    ## Environment & Tools Setup
    Setup instructions here
    
    ## Key Tools & Shortcuts
    • Shortcut 1: Description
    • Shortcut 2: Description
    
    ## Practical Implementation Workflow
    Step 1: First step
    Step 2: Second step
    
    ## Industry Pro-Tips & Pitfalls
    • PRO-TIP: Your tip here
    • COMMON PITFALL: Your warning here
    
    ## Hands-On Assignment
    Assignment instructions here
    
    ## Expected Deliverable
    Deliverable specifications here
    """,  # Rich lesson content (Markdown format)
    "video_url": None,  # Optional: YouTube/Vimeo URL if video lesson
    "duration_minutes": 15,  # Optional: Lesson duration
    "order_index": 1  # Optional: Display order
}

# ============================================
# QUIZ DATA FORMAT
# ============================================
quiz_data = {
    "id": str(uuid.uuid4()),  # Auto-generate
    "course_id": "course_uuid_here",  # Link to course
    "module_index": 1,  # Which module this quiz belongs to
    "quiz_title": "Module 1 Quiz: Quiz Title Here",
    "questions": [
        {
            "question": "Question text here?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correct_answer": 0  # Index of correct option (0-based)
        },
        {
            "question": "Another question here?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correct_answer": 1
        }
        # Add 5 questions total per module
    ],
    "passing_score": 60,  # Percentage needed to pass
    "time_limit_minutes": 10,  # Quiz duration
    "question_count": 5  # Number of questions
}

# ============================================
# COMPLETE COURSE STRUCTURE EXAMPLE
# ============================================
complete_course = {
    "course": {
        "title": "Excel for Beginners: Master Essential Desktop Spreadsheet Skills",
        "description": "A step-by-step masterclass for absolute beginners",
        "category": "Productivity",
        "difficulty": "beginner",
        "is_premium": False,
        "total_modules": 3,
        "estimated_hours": 9,
        "cover_image_url": "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1200&q=80"
    },
    "modules": [
        {
            "module_number": 1,
            "title": "Module 1: Excel Grid Navigation & Data Formatting",
            "description": "Learn Excel basics and formatting",
            "lessons": [
                {
                    "lesson_number": 1,
                    "title": "Lesson 1.1: Interface Overview & Workbook Setup",
                    "content_type": "text",
                    "content": "## Theoretical Deep Dive\nYour content here...",
                    "duration_minutes": 15
                },
                {
                    "lesson_number": 2,
                    "title": "Lesson 1.2: Number Formatting, Fonts & Cell Borders",
                    "content_type": "text",
                    "content": "## Theoretical Deep Dive\nYour content here...",
                    "duration_minutes": 15
                }
            ],
            "quiz": {
                "quiz_title": "Module 1 Quiz: Excel Navigation & Formatting",
                "questions": [
                    {
                        "question": "What shortcut key returns you to cell A1?",
                        "options": ["Ctrl + Home", "Ctrl + End", "Alt + Home", "Shift + Home"],
                        "correct_answer": 0
                    }
                    # Add 5 questions total
                ],
                "passing_score": 60,
                "time_limit_minutes": 10
            }
        }
        # Add more modules
    ]
}

# ============================================
# SUPABASE INSERTION EXAMPLE (Python)
# ============================================
import os
from supabase import create_client

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(supabase_url, supabase_key)

# Insert course
course_result = supabase.table("courses").insert(course_data).execute()
course_id = course_result.data[0]["id"]

# Insert modules
for module in complete_course["modules"]:
    module_data["course_id"] = course_id
    module_result = supabase.table("modules").insert(module_data).execute()
    module_id = module_result.data[0]["id"]
    
    # Insert lessons
    for lesson in module["lessons"]:
        lesson_data["module_id"] = module_id
        supabase.table("lessons").insert(lesson_data).execute()
    
    # Insert quiz
    if "quiz" in module:
        quiz_data["course_id"] = course_id
        quiz_data["module_index"] = module["module_number"]
        supabase.table("quizzes").insert(quiz_data).execute()
