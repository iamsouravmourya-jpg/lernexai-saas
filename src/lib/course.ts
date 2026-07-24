import { supabase } from './supabase';

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  thumbnail_url?: string;
  is_premium?: boolean;
  total_modules?: number;
  estimated_hours?: number;
  created_at: string;
  modules?: Module[];
}

export interface EnrolledCourse extends Course {
  enrollment_progress: number;
  enrolled_at?: string;
}

export interface ProgressData {
  completedLessonIds: Set<string>;
  completedCount: number;
  totalLessons: number;
  percentage: number;
}

export type ModuleQuizScores = Record<number, number>;

export interface QuizQuestionData {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface CourseQuiz {
  id: string;
  course_id: string;
  module_index: number;
  lesson_id?: string | null;
  questions: QuizQuestionData[];
  passing_score: number;
  time_limit_minutes?: number;
}

export interface Module {
  id: string;
  course_id: string;
  module_number?: number;
  title: string;
  description?: string;
  order_index: number;
  lessons?: Lesson[];
  quiz?: CourseQuiz;
}

export interface Lesson {
  id: string;
  module_id: string;
  lesson_number?: number;
  title: string;
  content: string;
  content_type?: 'text' | 'video' | 'code' | 'quiz' | string;
  video_url?: string;
  order_index: number;
  duration_minutes?: number;
  quiz?: CourseQuiz;
  quiz_questions?: QuizQuestionData[];
}

export interface UserEnrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  progress_percentage: number;
  completed_at?: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  is_completed: boolean;
  completed_at?: string;
}

function normalizeDifficulty(value: unknown): Course['difficulty'] {
  const difficulty = String(value || '').toLowerCase();
  if (difficulty === 'intermediate') return 'Intermediate';
  if (difficulty === 'advanced') return 'Advanced';
  return 'Beginner';
}

function normalizeCourse(course: Record<string, unknown>): Course {
  return {
    ...course,
    difficulty: normalizeDifficulty(course.difficulty),
  } as Course;
}

// Fetch all courses with optional category filter
export async function fetchCourses(category?: string): Promise<Course[]> {
  let query = supabase
    .from('courses')
    .select('*, modules(id)')
    .order('created_at', { ascending: false });

  if (category && category !== 'All') {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching courses:', error);
    return [];
  }

  return (data || []).map(course => normalizeCourse(course));
}

// Fetch single course with modules and lessons
export async function fetchCourseById(courseId: string): Promise<Course | null> {
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single();

  if (courseError) {
    console.error('Error fetching course:', courseError);
    return null;
  }

  // Fetch modules for this course
  const { data: modules, error: modulesError } = await supabase
    .from('modules')
    .select('*')
    .eq('course_id', courseId)
    .order('order_index', { ascending: true });

  if (modulesError) {
    console.error('Error fetching modules:', modulesError);
    return normalizeCourse(course);
  }

  const { data: quizzes, error: quizzesError } = await supabase
    .from('quizzes')
    .select('id, course_id, module_index, lesson_id, questions, passing_score, time_limit_minutes')
    .eq('course_id', courseId);

  if (quizzesError) {
    console.warn('Quizzes are not available for this course:', quizzesError.message);
  }

  const normalizedQuizzes: CourseQuiz[] = (quizzes || []).map((quiz) => ({
    ...quiz,
    lesson_id: quiz.lesson_id ?? null,
    time_limit_minutes: quiz.time_limit_minutes ?? undefined,
    questions: Array.isArray(quiz.questions)
      ? quiz.questions.map((question: Record<string, unknown>, index: number) => ({
          id: String(question.id || `${quiz.id}-${index}`),
          question: String(question.question || ''),
          options: Array.isArray(question.options) ? question.options.map(String) : [],
          correctAnswer: Number(question.correctAnswer ?? question.correct_answer ?? 0),
          explanation: question.explanation ? String(question.explanation) : undefined,
        }))
      : [],
  }));

  const moduleQuizByIndex = new Map<number, CourseQuiz>();
  const lessonQuizById = new Map<string, CourseQuiz>();

  normalizedQuizzes.forEach((quiz) => {
    if (quiz.lesson_id) {
      lessonQuizById.set(quiz.lesson_id, quiz);
      return;
    }

    if (!moduleQuizByIndex.has(quiz.module_index)) {
      moduleQuizByIndex.set(quiz.module_index, quiz);
    }
  });

  // Fetch lessons for each module
  const modulesWithLessons = await Promise.all(
    (modules || []).map(async (module) => {
      const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('module_id', module.id)
        .order('order_index', { ascending: true });

      if (lessonsError) {
        console.error('Error fetching lessons:', lessonsError);
        return { ...module, lessons: [] };
      }

      const moduleIndex = module.module_number ?? module.order_index;
      const lessonsWithQuizzes = (lessons || []).map((lesson) => ({
        ...lesson,
        quiz: lessonQuizById.get(lesson.id),
      }));

      return {
        ...module,
        lessons: lessonsWithQuizzes,
        quiz: moduleQuizByIndex.get(moduleIndex),
      };
    })
  );

  return { ...normalizeCourse(course), modules: modulesWithLessons };
}

export async function fetchCourseWithModules(courseId: string): Promise<Course | null> {
  return fetchCourseById(courseId);
}

export async function fetchEnrolledCourses(userId: string): Promise<EnrolledCourse[]> {
  const enrollments = await fetchUserEnrollments(userId);

  const enrolledCourses: Array<EnrolledCourse | null> = await Promise.all(
    enrollments.map(async (enrollment) => {
      const course = await fetchCourseWithModules(enrollment.course_id);
      if (!course) return null;

      const progress = await fetchUserProgress(enrollment.course_id, userId, course);
      return {
        ...course,
        enrollment_progress: progress.percentage,
        enrolled_at: enrollment.enrolled_at,
      };
    })
  );

  return enrolledCourses.filter((course): course is EnrolledCourse => course !== null);
}

// Fetch user's enrolled courses
export async function fetchUserEnrollments(userId: string): Promise<UserEnrollment[]> {
  const { data, error } = await supabase
    .from('user_enrollments')
    .select('*')
    .eq('user_id', userId)
    .order('enrolled_at', { ascending: false });

  if (error) {
    console.error('Error fetching enrollments:', error);
    return [];
  }

  return data || [];
}

// Enroll user in a course, treating an existing enrollment as success
export async function enrollInCourse(userId: string, courseId: string): Promise<boolean> {
  const { data: { user: authenticatedUser }, error: authError } = await supabase.auth.getUser();
  if (authError || !authenticatedUser) {
    throw new Error(`Authentication required: ${authError?.message || 'No active Supabase session'}`);
  }
  if (authenticatedUser.id !== userId) {
    throw new Error('Authenticated user does not match the enrollment user. Please sign in again.');
  }

  const { error } = await supabase
    .from('user_enrollments')
    .upsert({
      user_id: userId,
      course_id: courseId,
      progress_percentage: 0,
    }, {
      onConflict: 'user_id,course_id',
      ignoreDuplicates: true,
    });

  if (error) {
    console.error('Error enrolling in course:', error);
    throw new Error(`Supabase enrollment failed (${error.code || 'unknown'}): ${error.message}`);
  }

  return true;
}

// Fetch completed lesson IDs restricted to the current course's lessons
export async function fetchCompletedLessonIds(
  userId: string,
  courseLessonIds: string[]
): Promise<Set<string>> {
  if (courseLessonIds.length === 0) return new Set();

  const courseLessonIdSet = new Set(courseLessonIds);
  const { data, error } = await supabase
    .from('user_progress')
    .select('lesson_id')
    .eq('user_id', userId)
    .eq('is_completed', true)
    .in('lesson_id', courseLessonIds);

  if (error) {
    console.error('Error fetching completed lessons:', error);
    return new Set();
  }

  return new Set(
    (data || [])
      .map(progress => progress.lesson_id)
      .filter(lessonId => courseLessonIdSet.has(lessonId))
  );
}

export async function fetchUserProgress(
  courseId: string,
  userId: string,
  loadedCourse?: Course | null
): Promise<ProgressData> {
  const course = loadedCourse ?? await fetchCourseWithModules(courseId);
  const lessonIds = course?.modules?.flatMap(module =>
    module.lessons?.map(lesson => lesson.id) || []
  ) || [];
  const completedLessonIds = await fetchCompletedLessonIds(userId, lessonIds);
  const totalLessons = lessonIds.length;
  const completedCount = completedLessonIds.size;

  return {
    completedLessonIds,
    completedCount,
    totalLessons,
    percentage: totalLessons === 0 ? 0 : Math.round((completedCount / totalLessons) * 100),
  };
}

export async function fetchQuizAttemptScores(
  userId: string,
  course: Course
): Promise<Record<string, number>> {
  const quizIds = (course.modules || [])
    .flatMap(module => [
      module.quiz?.id,
      ...(module.lessons || []).map(lesson => lesson.quiz?.id).filter((id): id is string => Boolean(id)),
    ])
    .filter((id): id is string => Boolean(id));

  if (quizIds.length === 0) return {};

  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('quiz_id, score')
    .eq('user_id', userId)
    .in('quiz_id', quizIds);

  if (error) {
    console.error('Error fetching quiz scores:', error);
    return {};
  }

  return (data || []).reduce<Record<string, number>>((scores, attempt) => {
    scores[attempt.quiz_id] = attempt.score;
    return scores;
  }, {});
}

export async function fetchModuleQuizScores(
  userId: string,
  course: Course
): Promise<ModuleQuizScores> {
  const quizScores = await fetchQuizAttemptScores(userId, course);
  const scores: ModuleQuizScores = {};

  (course.modules || []).forEach((module) => {
    const moduleIndex = module.module_number ?? module.order_index;
    const moduleQuizId = module.quiz?.id;
    if (!moduleQuizId) return;
    const score = quizScores[moduleQuizId];
    if (score !== undefined) scores[moduleIndex] = score;
  });

  return scores;
}

export async function saveQuizAttempt(
  userId: string,
  quizId: string,
  score: number,
  answers: Record<string, number>
): Promise<void> {
  const { error } = await supabase
    .from('quiz_attempts')
    .upsert({
      user_id: userId,
      quiz_id: quizId,
      score,
      answers,
      completed_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,quiz_id',
    });

  if (error) {
    console.error('Error saving quiz attempt:', error);
    throw new Error(`Quiz score could not be saved (${error.code || 'unknown'}): ${error.message}`);
  }
}

// Update lesson progress
export async function updateLessonProgress(
  userId: string,
  lessonId: string,
  isCompleted: boolean
): Promise<boolean> {
  const { error } = await supabase
    .from('user_progress')
    .upsert({
      user_id: userId,
      lesson_id: lessonId,
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
    }, {
      onConflict: 'user_id,lesson_id',
    });

  if (error) {
    console.error('Error updating lesson progress:', error);
    return false;
  }

  return true;
}

// Get user progress for a course
export async function getUserProgress(userId: string, courseId: string): Promise<number> {
  // Get all lessons for the course
  const { data: modules, error: modulesError } = await supabase
    .from('modules')
    .select('id')
    .eq('course_id', courseId);

  if (modulesError || !modules) {
    console.error('Error fetching modules:', modulesError);
    return 0;
  }

  const moduleIds = modules.map(m => m.id);

  // Get all lesson IDs
  const { data: lessons, error: lessonsError } = await supabase
    .from('lessons')
    .select('id')
    .in('module_id', moduleIds);

  if (lessonsError || !lessons) {
    console.error('Error fetching lessons:', lessonsError);
    return 0;
  }

  const lessonIds = lessons.map(l => l.id);

  // Get completed lessons
  const { data: progress, error: progressError } = await supabase
    .from('user_progress')
    .select('lesson_id')
    .eq('user_id', userId)
    .eq('is_completed', true)
    .in('lesson_id', lessonIds);

  if (progressError) {
    console.error('Error fetching progress:', progressError);
    return 0;
  }

  const totalLessons = lessons.length;
  const completedLessons = progress?.length || 0;

  if (totalLessons === 0) return 0;

  return Math.round((completedLessons / totalLessons) * 100);
}

// Update enrollment progress percentage
export async function updateEnrollmentProgress(
  userId: string,
  courseId: string,
  progress: number
): Promise<boolean> {
  const { error } = await supabase
    .from('user_enrollments')
    .update({ progress_percentage: progress })
    .eq('user_id', userId)
    .eq('course_id', courseId);

  if (error) {
    console.error('Error updating enrollment progress:', error);
    return false;
  }

  return true;
}
