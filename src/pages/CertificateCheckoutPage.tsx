import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "wouter";
import { Award, ArrowLeft, Download, Share2, CheckCircle2, Loader2, CreditCard } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { createOrder, openRazorpayCheckout, verifyPayment } from "@/lib/razorpay";
import { fetchCourseWithModules, type Course } from "@/lib/course";
import { useToast } from "@/hooks/use-toast";
import { getCertificateGrade } from "@/lib/certificate";

function formatDate(value: Date) {
  return value.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function CertificateCheckoutPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const [course, setCourse] = useState<Course | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [fullName, setFullName] = useState(user?.name || "");
  const [isPaying, setIsPaying] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);
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
        const loadedCourse = await fetchCourseWithModules(courseId);

        if (!active) return;
        setCourse(loadedCourse);
        setScore(Number.isFinite(scoreFromQuery) && scoreFromQuery > 0 ? scoreFromQuery : 85);
        setFullName(user?.name || "");
        setLoading(false);
      } catch (loadError) {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : "Could not load certificate checkout.");
        setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [courseId, location, user?.name]);

  const grade = useMemo(() => (score !== null ? getCertificateGrade(score) : null), [score]);
  const canUnlockCertificate = score !== null && score >= 40;

  const handlePay = async () => {
    if (!course || !user?.email || !fullName.trim()) {
      toast({ title: "Missing details", description: "Please enter your full name and try again.", variant: "destructive" });
      return;
    }

    try {
      setIsPaying(true);
      const order = await createOrder({ amount: 9900, purpose: "certificate" });

      await openRazorpayCheckout({
        orderId: order.id,
        amount: order.amount,
        userName: fullName.trim(),
        userEmail: user.email,
        onSuccess: async (response) => {
          try {
            const verification = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verification.success) {
              setIsPurchased(true);
              if (typeof window !== "undefined" && course) {
                window.localStorage.setItem(
                  "lernexai_certificate_purchase",
                  JSON.stringify({ courseId, courseTitle: course.title, completedAt: new Date().toISOString() })
                );
              }
              toast({ title: "Certificate unlocked", description: "Your verified certificate is ready to download.", variant: "default" });
            } else {
              throw new Error(verification.error || verification.message || "Payment verification failed.");
            }
          } catch (payError) {
            toast({ title: "Payment issue", description: payError instanceof Error ? payError.message : "Verification failed.", variant: "destructive" });
          }
        },
        onFailure: (error) => {
          toast({ title: "Payment cancelled", description: error.message || "The payment did not complete.", variant: "destructive" });
        },
      });
    } catch (payError) {
      toast({ title: "Payment failed", description: payError instanceof Error ? payError.message : "Unable to start payment.", variant: "destructive" });
    } finally {
      setIsPaying(false);
    }
  };

  const handleDownload = () => {
    if (!course || score === null || !fullName.trim()) return;

    const issuedDate = formatDate(new Date());
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
        <text x="700" y="290" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="60" font-weight="800" fill="#ffffff">${fullName.trim()}</text>
        <text x="700" y="350" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="24" fill="#ede9fe">has successfully completed</text>
        <text x="700" y="410" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="38" font-weight="700" fill="#ffffff">${course.title}</text>
        <text x="700" y="470" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="24" fill="#ddd6fe">with a score of ${score}% and grade ${grade?.grade} (${grade?.label})</text>
        <text x="700" y="610" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="28" font-weight="700" fill="#ffffff">Issued on ${issuedDate}</text>
      </svg>`;

    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${course.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-certificate.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "My certificate",
        text: `I completed ${course?.title || "a course"} with a score of ${score}%!`,
      });
    } else {
      navigator.clipboard.writeText(`I completed ${course?.title || "a course"} with a score of ${score}%!`);
      toast({ title: "Copied", description: "Certificate message copied to clipboard.", variant: "default" });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" aria-hidden="true" />
      </div>
    );
  }

  if (error || !course || score === null || !grade || !canUnlockCertificate) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="max-w-md rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <Award className="mx-auto h-10 w-10 text-red-500" aria-hidden="true" />
          <h1 className="mt-4 text-xl font-bold text-slate-900">Certificate unavailable</h1>
          <p className="mt-2 text-sm text-slate-600">{error || "Complete the final exam first to unlock your certificate."}</p>
          <button onClick={() => setLocation(`/learning/${courseId}`)} className="mt-6 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-purple-700">Back to course</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-600">Certificate</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Get your verified certificate</h1>
            <p className="mt-2 text-sm text-slate-600">Complete the payment, add your name, preview the certificate, and download it instantly.</p>
          </div>
          <button onClick={() => setLocation("/dashboard")} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to dashboard
          </button>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <div className="rounded-3xl border border-purple-100 bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-100">Certificate preview</p>
                  <h2 className="mt-2 text-2xl font-semibold">{fullName.trim() || "Your Name"}</h2>
                </div>
                <div className="rounded-2xl bg-white/20 p-3">
                  <Award className="h-8 w-8" aria-hidden="true" />
                </div>
              </div>
              <p className="mt-4 text-sm text-indigo-100">has successfully completed</p>
              <p className="mt-2 text-xl font-semibold">{course.title}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/20 px-3 py-1 text-sm">Score: {score}%</span>
                <span className="rounded-full bg-white/20 px-3 py-1 text-sm">Grade: {grade.grade} ({grade.label})</span>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-semibold text-slate-700">Full name on certificate</label>
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Enter your full name"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-0 focus:border-purple-500"
              />
            </div>

            {!isPurchased ? (
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={handlePay}
                  disabled={isPaying}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isPaying ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <CreditCard className="h-4 w-4" aria-hidden="true" />}
                  Pay ₹99 for certificate
                </button>
                <button onClick={() => setLocation("/dashboard")} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-white">
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to dashboard
                </button>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Certificate unlocked
                </div>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <button onClick={handleDownload} className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700">
                    <Download className="h-4 w-4" aria-hidden="true" /> Download certificate
                  </button>
                  <button onClick={() => setLocation("/dashboard")} className="inline-flex items-center gap-2 rounded-xl border border-green-200 bg-white px-4 py-2 font-semibold text-green-700 hover:bg-green-100">
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Go to dashboard
                  </button>
                  <button onClick={handleShare} className="inline-flex items-center gap-2 rounded-xl border border-green-200 bg-white px-4 py-2 font-semibold text-green-700 hover:bg-green-100">
                    <Share2 className="h-4 w-4" aria-hidden="true" /> Share achievement
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-slate-900">What you get</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li className="rounded-2xl bg-slate-50 p-3">• Verified certificate for your completed course</li>
              <li className="rounded-2xl bg-slate-50 p-3">• Your final score and grade shown on the certificate</li>
              <li className="rounded-2xl bg-slate-50 p-3">• Download as SVG and share instantly</li>
            </ul>
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
              <p className="font-semibold">One-time fee</p>
              <p className="mt-1 text-2xl font-bold text-amber-800">₹99</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
