import { Link } from "wouter";
import { Course } from "@/lib/course";

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Advanced':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Productivity': 'bg-blue-100 text-blue-700 border-blue-200',
      'Web Development': 'bg-purple-100 text-purple-700 border-purple-200',
      'Data Science': 'bg-indigo-100 text-indigo-700 border-indigo-200',
      'AI/ML': 'bg-pink-100 text-pink-700 border-pink-200',
    };
    return colors[category] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      {/* Thumbnail */}
      <div className="h-48 bg-gradient-to-br from-purple-100 to-indigo-100 relative overflow-hidden">
        {course.thumbnail_url ? (
          <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl">📚</span>
          </div>
        )}
        <div className="absolute left-3 top-3">
          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getCategoryColor(course.category)}`}>
            {course.category}
          </span>
        </div>
        <span className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-bold shadow-sm ${course.is_premium ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-700"}`}>
          {course.is_premium ? "Pro" : "Free"}
        </span>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <span className={`px-2 py-1 rounded-lg text-xs font-semibold border ${getDifficultyColor(course.difficulty)}`}>
            {course.difficulty}
          </span>
          <span className="text-xs text-gray-500">
            {course.modules?.length || 0} modules
          </span>
        </div>

        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
          {course.title}
        </h3>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {course.description}
        </p>

        <Link href={`/course/${course.id}`}>
          <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:shadow-lg transition-all">
            View Course
          </button>
        </Link>
      </div>
    </div>
  );
}
