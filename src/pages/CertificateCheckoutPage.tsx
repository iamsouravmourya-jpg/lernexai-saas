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
        setScore(Number.isFinite(scoreFromQuery) && scoreFromQuery > 0 ? scoreFromQuery : null);
        setFullName(user?.name || "");

        // Check if certificate was already purchased for this specific course
        if (typeof window !== "undefined") {
          const purchaseKey = `lernexai_certificate_purchase_${courseId}`;
          const purchaseData = window.localStorage.getItem(purchaseKey);
          if (purchaseData) {
            try {
              const parsed = JSON.parse(purchaseData);
              if (parsed.courseId === courseId && parsed.purchased) {
                setIsPurchased(true);
              }
            } catch {
              // Invalid data, ignore
            }
          }
        }

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
                const purchaseKey = `lernexai_certificate_purchase_${courseId}`;
                window.localStorage.setItem(
                  purchaseKey,
                  JSON.stringify({ courseId, courseTitle: course.title, purchased: true, completedAt: new Date().toISOString() })
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
    // Generate consistent certificate ID based on course and user
    const certId = `LXAI-${new Date().getFullYear()}-${courseId.slice(0, 4).toUpperCase()}-${Math.floor(score)}`;
    const verifyUrl = `https://lernexai.com/verify/${certId}`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificate - ${course.title}</title>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Great+Vibes&family=Montserrat:wght@300;400;500;600;700&family=Playfair+Display+SC:wght@400;700;900&display=swap" rel="stylesheet">
    <style>
        :root {
            --navy: #0a1628;
            --navy-md: #12294a;
            --navy-light: #1a3a5c;
            --green: #064e3b;
            --gold: #ca8a04;
            --gold-light: #eab308;
            --gold-dark: #a16207;
            --cream: #fffbeb;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        @media print {
            @page {
                size: A4 landscape;
                margin: 0;
            }
            body {
                background: none !important;
                padding: 0 !important;
                margin: 0 !important;
            }
            .certificate {
                width: 297mm !important;
                height: 210mm !important;
                box-shadow: none !important;
                border: 10px solid #12294a !important;
                outline: 2px solid #ca8a04 !important;
                transform: none !important;
                margin: 0 auto !important;
                page-break-after: avoid;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            .corner-ornament { display: block !important; }
            .print-hide { display: none !important; }
        }

        body {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            background: #e8ecf1;
            font-family: 'Lora', serif;
            padding: 40px 20px;
            gap: 25px;
        }

        .print-btn {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            background: #12294a;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            z-index: 1000;
        }

        .certificate {
            width: 1100px;
            height: 780px;
            background: #fff;
            position: relative;
            overflow: hidden;
            box-shadow: 0 40px 100px rgba(0,0,0,0.2);
            border: 8px solid #12294a;
            outline: 2px solid #ca8a04;
            outline-offset: -15px;
            flex-shrink: 0;
        }

        .wave-top {
            position: absolute;
            top: 0; left: 0; z-index: 1;
            width: 100%; height: 230px;
            background: linear-gradient(160deg, #12294a 0%, #1a3a5c 25%, #064e3b 55%, #047857 80%, #12294a 100%);
            clip-path: polygon(0 0, 100% 0, 100% 45%, 82% 65%, 63% 48%, 40% 72%, 18% 52%, 0 65%);
        }

        .corner-ornament {
            position: absolute; width: 40px; height: 40px; z-index: 5;
        }
        .corner-ornament::before, .corner-ornament::after {
            content: ''; position: absolute; background: #ca8a04;
        }
        .corner-ornament::before { width: 100%; height: 3px; top: 0; }
        .corner-ornament::after { width: 3px; height: 100%; left: 0; }
        
        .co-tr { top: 35px; right: 35px; transform: rotate(90deg); }
        .co-tl { top: 35px; left: 35px; }
        .co-br { bottom: 35px; right: 35px; transform: rotate(180deg); }
        .co-bl { bottom: 35px; left: 35px; transform: rotate(270deg); }

        .content {
            position: relative; z-index: 3;
            height: 100%; padding: 45px 70px;
            display: flex; flex-direction: column;
            text-align: center;
        }

        .header { display: flex; justify-content: center; margin-bottom: 25px; }
        .brand { display: flex; align-items: center; gap: 15px; }
        .logo {
            width: 70px; height: 70px; background: #fff; border-radius: 12px;
            display: grid; place-items: center; box-shadow: 0 5px 15px rgba(0,0,0,0.15);
        }
        .logo svg { width: 50px; height: 50px; fill: #12294a; }

        .brand h2 { font-family: 'Cormorant Garamond', serif; font-size: 42px; color: #fff; letter-spacing: 5px; font-weight: 700; }
        .brand p { color: rgba(255,255,255,0.9); font-size: 11px; letter-spacing: 3px; text-transform: uppercase; font-family: 'Montserrat'; }

        .title-section h1 {
            font-family: 'Playfair Display SC', serif; font-size: 60px;
            color: #12294a; letter-spacing: 12px; margin-top: 10px;
        }
        .gold-line { width: 300px; height: 3px; margin: 15px auto; background: linear-gradient(90deg, transparent, var(--gold), transparent); }

        .subtitle { font-style: italic; font-size: 19px; color: #5a6270; margin-bottom: 15px; }
        .recipient-name {
            font-family: 'Cormorant Garamond', serif; font-size: 65px;
            font-weight: 700; color: #12294a; border-bottom: 3px solid var(--gold);
            padding: 0 40px 5px; display: inline-block; margin-bottom: 20px;
        }

        .course-name { font-size: 20px; font-weight: 600; color: #12294a; margin: 10px 0; font-family: 'Montserrat'; }
        .grade-display { font-size: 18px; color: #4a5568; margin-top: 15px; }
        .grade-text-simple { font-weight: 800; color: #000; font-size: 26px; }

        .footer-section {
            display: flex; justify-content: space-between; align-items: flex-end;
            margin-top: auto; padding-bottom: 20px;
        }
        .sig-block { width: 220px; text-align: center; }
        .sig-line { height: 1.5px; background: #cbd5e1; margin-bottom: 10px; }
        .sig-name { font-family: 'Great Vibes', cursive; font-size: 32px; color: #12294a; }
        .sig-role { font-size: 11px; font-weight: 700; text-transform: uppercase; font-family: 'Montserrat'; color: #64748b; }

        .badge-qr-container { display: flex; align-items: center; gap: 30px; }
        .ribbon-circle {
            width: 110px; height: 110px; border-radius: 50%;
            background: radial-gradient(circle, #fbbf24, #ca8a04);
            border: 4px double rgba(255,255,255,0.3);
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            color: #fff; box-shadow: 0 10px 20px rgba(202,138,4,0.3);
        }
        .qr-box {
            width: 85px; height: 85px; padding: 5px; background: #fff;
            border: 1px solid #e2e8f0; border-radius: 8px;
        }
        .qr-box img { width: 100%; height: 100%; }

        .footer-note {
            border-top: 1px solid #e5e7eb; padding-top: 15px;
            font-family: 'Montserrat', sans-serif; font-size: 11px;
            color: #4a5568; line-height: 1.6;
        }
        .verify-link a { color: #12294a; font-weight: 700; text-decoration: none; }
        .legal-note { font-size: 9px; opacity: 0.7; margin-top: 5px; }
    </style>
</head>
<body>
    <button class="print-btn print-hide" onclick="window.print()">Download as PDF</button>
    <div class="certificate">
        <div class="corner-ornament co-tl"></div>
        <div class="corner-ornament co-tr"></div>
        <div class="corner-ornament co-bl"></div>
        <div class="corner-ornament co-br"></div>

        <div class="wave-top"></div>

        <div class="content">
            <div class="header">
                <div class="brand">
                    <div class="logo">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
                            <rect width="32" height="32" rx="8" fill="url(#gradient)"></rect>
                            <path d="M16 4L6 10L16 16L26 10L16 4Z" fill="white" fill-opacity="0.9"></path>
                            <path d="M6 22L16 28L26 22" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                            <path d="M6 10V22" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                            <path d="M26 10V22" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                            <path d="M16 16V28" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                            <circle cx="16" cy="16" r="2" fill="white" fill-opacity="0.8"></circle>
                            <defs>
                                <linearGradient id="gradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                                    <stop stop-color="#4F46E5"></stop>
                                    <stop offset="0.5" stop-color="#7C3AED"></stop>
                                    <stop offset="1" stop-color="#3730A3"></stop>
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <div>
                        <h2>LERNEXAI</h2>
                        <p>Learn • Execute • AI</p>
                    </div>
                </div>
            </div>

            <div class="title-section">
                <h1>CERTIFICATE</h1>
                <p style="letter-spacing: 5px; font-weight: 600; color: #ca8a04; font-size: 14px;">OF COMPLETION</p>
                <div class="gold-line"></div>
            </div>

            <p class="subtitle">This is to certify that</p>
            
            <div class="recipient-name">${fullName.trim()}</div>

            <p style="font-size: 16px; color: #4a5568; max-width: 700px; margin: 0 auto;">
                has successfully completed the intensive training program and demonstrated exceptional proficiency in:
            </p>

            <div class="course-name">${course.title}</div>
            
            <div class="grade-display">
                Grade Achieved: <span class="grade-text-simple">" ${grade?.grade} (${grade?.label}) "</span>
            </div>

            <div class="footer-section">
                <div class="sig-block">
                    <div class="sig-name">Sourav Maurya</div>
                    <div class="sig-line"></div>
                    <div class="sig-role">Founder & CEO</div>
                </div>

                <div class="badge-qr-container">
                    <div class="ribbon-circle">
                        <span style="font-size: 24px;">🏅</span>
                        <span style="font-size: 10px; font-weight: 800; letter-spacing: 1px;">VERIFIED</span>
                    </div>
                    <div style="text-align: center;">
                        <div class="qr-box">
                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${verifyUrl}" alt="QR">
                        </div>
                        <p style="font-size: 8px; margin-top: 5px; font-weight: 700;">SCAN TO VERIFY</p>
                    </div>
                </div>

                <div class="sig-block">
                    <div class="sig-name" style="font-family: 'Cormorant Garamond'; font-weight: 700; font-size: 26px;">LernexAI</div>
                    <div class="sig-line"></div>
                    <div class="sig-role">Official Authority</div>
                </div>
            </div>

            <div class="footer-note">
                <div>Verify this credential at: <a href="${verifyUrl}">${verifyUrl}</a></div>
                <div>Certificate ID: <strong>${certId}</strong> • Issued on <strong>${issuedDate}</strong></div>
                <div class="legal-note">© 2025–2026 LernexAI Academy. This document is a digital representation of academic achievement.</div>
            </div>
        </div>
    </div>
</body>
</html>`;

    const newWindow = window.open("", "_blank");
    if (newWindow) {
      newWindow.document.write(html);
      newWindow.document.close();
    }
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
              <li className="rounded-2xl bg-slate-50 p-3">• Download as PDF and share instantly</li>
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
