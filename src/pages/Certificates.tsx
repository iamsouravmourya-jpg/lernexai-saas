import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Award, BookOpen, CheckCircle2, Clock3, Loader2, ShieldCheck, Sparkles, Trophy } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { fetchEnrolledCourses, type EnrolledCourse } from "@/lib/course";
import { fetchFinalExamStatus } from "@/lib/finalExam";
import { getCertificateGrade } from "@/lib/certificate";

interface CertificateCourse extends EnrolledCourse {
  examScore: number | null;
  examPassed: boolean;
  certificatePurchased: boolean;
}

export default function Certificates() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [courses, setCourses] = useState<CertificateCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadCertificates() {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const enrolledCourses = await fetchEnrolledCourses(user.id);
        if (!active) return;

        const resolvedCourses = await Promise.all(
          enrolledCourses.map(async (course) => {
            let examScore: number | null = null;
            let examPassed = false;

            try {
              const attempt = await fetchFinalExamStatus(course.id);
              examPassed = attempt?.passed === true;
              examScore = typeof attempt?.score === "number" ? attempt.score : null;
            } catch {
              examScore = null;
              examPassed = false;
            }

            let certificatePurchased = false;
            if (typeof window !== "undefined") {
              try {
                const stored = window.localStorage.getItem("lernexai_certificate_purchase");
                if (stored) {
                  const parsed = JSON.parse(stored);
                  certificatePurchased = parsed.courseId === course.id;
                }
              } catch {
                certificatePurchased = false;
              }
            }

            return {
              ...course,
              examScore,
              examPassed,
              certificatePurchased,
            } satisfies CertificateCourse;
          })
        );

        if (active) setCourses(resolvedCourses);
      } catch (caughtError) {
        if (active) {
          setError(caughtError instanceof Error ? caughtError.message : "Could not load your certificates.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadCertificates();
    return () => {
      active = false;
    };
  }, [user?.id]);

  const summary = useMemo(() => {
    const readyToPay = courses.filter((course) => course.examPassed && course.examScore !== null && course.examScore >= 40 && !course.certificatePurchased).length;
    const purchased = courses.filter((course) => course.certificatePurchased).length;
    const inProgress = courses.length - readyToPay - purchased;
    return { readyToPay, purchased, inProgress };
  }, [courses]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(139,92,246,0.12),_transparent_40%),linear-gradient(180deg,_#faf5ff_0%,_#f8fafc_100%)]">
      <header className="border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-purple-300 hover:text-purple-700">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to dashboard
            </Link>
            <div className="mt-5">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-600">Certificates</p>
              <h1 className="mt-1 text-3xl font-bold text-slate-900 sm:text-4xl">Your achievement hub</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">Complete your course, pass the final exam, and unlock a polished certificate you can share with employers or on LinkedIn.</p>
            </div>
          </div>

          <div className="rounded-[28px] border border-purple-200 bg-gradient-to-br from-purple-700 via-violet-700 to-indigo-700 p-5 text-white shadow-lg">
            <div className="flex items-center gap-2 text-sm font-semibold text-purple-100">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              <span>Certificate center</span>
            </div>
            <div className="mt-3 text-3xl font-bold">{summary.readyToPay} ready</div>
            <div className="mt-1 text-sm text-purple-100">{summary.purchased} purchased • {summary.inProgress} still in progress</div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <section className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-100 text-purple-700">
                <Trophy className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Pass the final exam</p>
                <p className="text-sm text-slate-500">Your score becomes your certificate grade</p>
              </div>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Verified certificate</p>
                <p className="text-sm text-slate-500">One-time payment unlocks your downloadable proof</p>
              </div>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Share it proudly</p>
                <p className="text-sm text-slate-500">Use it for LinkedIn, interviews, or your portfolio</p>
              </div>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="grid gap-6 xl:grid-cols-2" aria-label="Loading certificates">
            {[1, 2].map((item) => (
              <div key={item} className="animate-pulse rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="h-5 w-2/3 rounded bg-slate-200" />
                <div className="mt-4 h-3 rounded bg-slate-100" />
                <div className="mt-6 h-10 rounded-xl bg-slate-200" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-[32px] border border-red-200 bg-red-50 p-8 text-center text-red-700 shadow-sm">
            <Award className="mx-auto h-8 w-8" aria-hidden="true" />
            <h2 className="mt-3 text-lg font-semibold">We could not load your certificates</h2>
            <p className="mt-2 text-sm">{error}</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="rounded-[32px] border border-dashed border-slate-300 bg-white/90 p-10 text-center shadow-sm">
            <BookOpen className="mx-auto h-12 w-12 text-purple-600" aria-hidden="true" />
            <h2 className="mt-4 text-2xl font-bold text-slate-900">No certificate-ready courses yet</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600">Enroll in a course, finish it, and take the final exam to unlock your certificate.</p>
            <Link href="/browse" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-purple-700">
              Browse courses <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-2">
            {courses.map((course) => {
              const progress = Math.min(100, Math.max(0, course.enrollment_progress || 0));
              const isCompleted = progress >= 100;
              const isReadyToBuy = course.examPassed && course.examScore !== null && course.examScore >= 40 && !course.certificatePurchased;
              const grade = course.examScore !== null ? getCertificateGrade(course.examScore) : null;

              return (
                <article key={course.id} className="group relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600" />
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-600">{course.category}</p>
                      <h3 className="mt-2 text-xl font-bold text-slate-900">{course.title}</h3>
                    </div>
                    {course.certificatePurchased ? (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">Purchased</span>
                    ) : isReadyToBuy ? (
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">Ready to buy</span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{isCompleted ? "Needs final exam" : "In progress"}</span>
                    )}
                  </div>

                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                      <span>Course progress</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                      <div className="h-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-600" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-600">
                      {course.examScore !== null && grade ? (
                        <span className="rounded-full bg-white px-3 py-1">Final score: {course.examScore}% • {grade.grade} ({grade.label})</span>
                      ) : (
                        <span className="rounded-full bg-white px-3 py-1">Final exam pending</span>
                      )}
                      <span className="rounded-full bg-white px-3 py-1 flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" aria-hidden="true" /> {isCompleted ? "Course complete" : "Keep learning"}</span>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    {course.certificatePurchased ? (
                      <button onClick={() => setLocation(`/certificate/${course.id}?score=${course.examScore ?? ""}`)} className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700">
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Download certificate
                      </button>
                    ) : isReadyToBuy ? (
                      <button onClick={() => setLocation(`/certificate/${course.id}?score=${course.examScore ?? ""}`)} className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700">
                        <Award className="h-4 w-4" aria-hidden="true" /> Buy certificate for ₹99
                      </button>
                    ) : isCompleted ? (
                      <button onClick={() => setLocation(`/final-exam/${course.id}`)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-purple-300 hover:text-purple-700">
                        <Award className="h-4 w-4" aria-hidden="true" /> Take final exam
                      </button>
                    ) : (
                      <button onClick={() => setLocation(`/learning/${course.id}`)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-purple-300 hover:text-purple-700">
                        <BookOpen className="h-4 w-4" aria-hidden="true" /> Continue course
                      </button>
                    )}
                    <Link href={`/learning/${course.id}`} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-purple-300 hover:text-purple-700">
                      Open course <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
