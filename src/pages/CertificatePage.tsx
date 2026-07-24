import { useEffect, useState } from "react";
import { Award, ArrowLeft, Download, Loader2 } from "lucide-react";
import { useLocation, useParams } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { fetchCourseWithModules, type Course } from "@/lib/course";
import { fetchFinalExamStatus } from "@/lib/finalExam";
import { getCertificateGrade } from "@/lib/certificate";

function formatDate(value: Date) {
  return value.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "certificate";
}

export default function CertificatePage() {
  const { courseId } = useParams<{ courseId: string }>();
  const [location, setLocation] = useLocation();
  const { user } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!courseId) {
        setError("Certificate could not be loaded.");
        setLoading(false);
        return;
      }

      try {
        const params = new URLSearchParams(location.split("?")[1] || "");
        const scoreFromQuery = Number(params.get("score") || "");
        const [loadedCourse, attempt] = await Promise.all([
          fetchCourseWithModules(courseId),
          fetchFinalExamStatus(courseId),
        ]);

        if (!active) return;

        const resolvedScore = Number.isFinite(scoreFromQuery) && scoreFromQuery > 0
          ? scoreFromQuery
          : attempt?.passed && typeof attempt.score === "number"
            ? attempt.score
            : null;

        if (!resolvedScore || resolvedScore < 40) {
          setError("You need to pass the final exam to unlock your certificate.");
          setLoading(false);
          return;
        }

        setCourse(loadedCourse);
        setScore(resolvedScore);
        setLoading(false);
      } catch (loadError) {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : "Could not load your certificate.");
        setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [courseId, location]);

  const handleDownload = () => {
    if (!course || score === null) return;

    const grade = getCertificateGrade(score);
    const issuedDate = formatDate(new Date());
    const learnerName = user?.name || "Learner";
    const courseTitle = course.title;

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="1400" height="900" viewBox="0 0 1400 900">
        <rect width="1400" height="900" fill="#f8f7ff"/>
        <rect x="60" y="60" width="1280" height="780" rx="36" fill="#ffffff" stroke="#d8d0ff" stroke-width="3"/>
        <rect x="90" y="90" width="1220" height="720" rx="28" fill="url(#bg)"/>
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#6d28d9"/>
            <stop offset="100%" stop-color="#4338ca"/>
          </linearGradient>
        </defs>
        <circle cx="1160" cy="220" r="180" fill="white" fill-opacity="0.12"/>
        <circle cx="250" cy="700" r="150" fill="white" fill-opacity="0.08"/>
        <text x="700" y="220" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="34" font-weight="700" fill="#f5f3ff" letter-spacing="4">CERTIFICATE OF COMPLETION</text>
        <text x="700" y="290" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="60" font-weight="800" fill="#ffffff">${learnerName}</text>
        <text x="700" y="350" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="26" fill="#ede9fe">has successfully completed</text>
        <text x="700" y="410" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="38" font-weight="700" fill="#ffffff">${courseTitle}</text>
        <text x="700" y="470" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="24" fill="#ddd6fe">with a score of ${score}% and grade ${grade.grade} (${grade.label})</text>
        <rect x="520" y="520" width="360" height="110" rx="18" fill="#ffffff" fill-opacity="0.18"/>
        <text x="700" y="575" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="24" fill="#ffffff">Issued on</text>
        <text x="700" y="610" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="28" font-weight="700" fill="#ffffff">${issuedDate}</text>
      </svg>
    `;

    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${slugify(courseTitle)}-certificate.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" aria-hidden="true" />
      </div>
    );
  }

  if (error || !course || score === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="max-w-md rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <Award className="mx-auto h-10 w-10 text-red-500" aria-hidden="true" />
          <h1 className="mt-4 text-xl font-bold text-slate-900">Certificate unavailable</h1>
          <p className="mt-2 text-sm text-slate-600">{error || "Complete the final exam first to unlock your certificate."}</p>
          <button onClick={() => setLocation(`/learning/${courseId}`)} className="mt-6 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-purple-700">
            Back to course
          </button>
        </div>
      </div>
    );
  }

  const grade = getCertificateGrade(score);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row">
        <div className="flex-1 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-purple-700">
              <Award className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-600">Certificate</p>
              <h1 className="text-2xl font-bold text-slate-900">Your achievement is ready</h1>
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-purple-100 bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700 p-8 text-white shadow-lg">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-100">Official completion</p>
            <h2 className="mt-3 text-3xl font-bold">{user?.name || "Learner"}</h2>
            <p className="mt-2 text-indigo-100">has successfully completed</p>
            <p className="mt-3 text-2xl font-semibold">{course.title}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-white/20 px-4 py-2 text-sm font-semibold">Score: {score}%</span>
              <span className="rounded-full bg-white/20 px-4 py-2 text-sm font-semibold">Grade: {grade.grade} ({grade.label})</span>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button onClick={handleDownload} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white hover:bg-purple-700">
              <Download className="h-4 w-4" aria-hidden="true" />
              Download certificate
            </button>
            <button onClick={() => setLocation(`/learning/${courseId}`)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to course
            </button>
          </div>
        </div>

        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Certificate preview</h3>
          <div className="mt-4 rounded-2xl border border-dashed border-purple-200 bg-purple-50 p-5 text-sm text-slate-700">
            <p className="font-semibold text-purple-700">Why this matters</p>
            <ul className="mt-3 space-y-2">
              <li>• Share your achievement with employers or on LinkedIn.</li>
              <li>• Keep a proof of your learning journey.</li>
              <li>• Use it as a milestone after completing the final exam.</li>
            </ul>
          </div>
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">Issued on</p>
            <p className="mt-1">{formatDate(new Date())}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
