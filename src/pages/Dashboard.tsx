import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { Bell, BellRing, BookOpen, CheckCircle2, Menu, Sparkles, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import ContinueLearningCard from "@/components/ContinueLearningCard";
import AccountDetailsModal from "@/components/AccountDetailsModal";
import { fetchUserCertificatePurchases } from "@/lib/certificates";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [customGoal, setCustomGoal] = useState("");
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountDetailsOpen, setAccountDetailsOpen] = useState(false);
  const [completedCourse, setCompletedCourse] = useState<{ courseId: string; courseTitle: string; completedAt: string } | null>(null);

  const categoryStyles: Record<string, { card: string; icon: string; ring: string }> = {
    blue: { card: "from-blue-50 to-blue-100 border-blue-200", icon: "bg-blue-200", ring: "ring-blue-400" },
    purple: { card: "from-purple-50 to-purple-100 border-purple-200", icon: "bg-purple-200", ring: "ring-purple-400" },
    green: { card: "from-green-50 to-green-100 border-green-200", icon: "bg-green-200", ring: "ring-green-400" },
    orange: { card: "from-orange-50 to-orange-100 border-orange-200", icon: "bg-orange-200", ring: "ring-orange-400" },
    pink: { card: "from-pink-50 to-pink-100 border-pink-200", icon: "bg-pink-200", ring: "ring-pink-400" },
    red: { card: "from-red-50 to-red-100 border-red-200", icon: "bg-red-200", ring: "ring-red-400" },
  };

  const openWizard = () => setWizardOpen(true);
  const closeWizard = () => {
    setWizardOpen(false);
    setCurrentStep(1);
  };

  const goToStep = (step: number) => setCurrentStep(step);

  useEffect(() => {
    async function loadCertificatePurchases() {
      if (!user?.id) {
        setCompletedCourse(null);
        return;
      }

      try {
        const purchases = await fetchUserCertificatePurchases(user.id);
        if (purchases.length > 0) {
          const latest = purchases[0]; // Already ordered by created_at desc
          setCompletedCourse({
            courseId: latest.course_id,
            courseTitle: latest.course_title,
            completedAt: latest.issued_at
          });
        } else {
          setCompletedCourse(null);
        }
      } catch {
        setCompletedCourse(null);
      }
    }

    loadCertificatePurchases();
  }, [user?.id]);

  const generateCourse = () => {
    goToStep(4);
    setTimeout(() => goToStep(5), 3000);
  };

  const notifications = [
    {
      title: completedCourse ? "Certificate ready" : "New learning update",
      description: completedCourse
        ? `${completedCourse.courseTitle} is ready for your certificate journey.`
        : "Keep progressing through your course and unlock your next milestone.",
      icon: completedCourse ? <CheckCircle2 className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />,
      unread: true,
    },
    {
      title: "Final exam unlocked",
      description: "Complete your modules, then take the final exam to earn a score-based certificate.",
      icon: <BookOpen className="h-4 w-4" />,
      unread: true,
    },
    {
      title: "Certificate hub",
      description: "Buy or download certificates directly from your dashboard whenever you are ready.",
      icon: <BellRing className="h-4 w-4" />,
      unread: false,
    },
  ];

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const handleSaveAccountDetails = async (data: { first_name: string; last_name: string; phone: string }) => {
    if (!user?.id) return;

    const { error } = await supabase
      .from('users')
      .update({
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone || null
      })
      .eq('id', user.id);

    if (error) throw error;
  };

  return (
    <div className="bg-bgSecondary text-textDark font-sans min-h-screen lg:flex">
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setMobileMenuOpen(false)} aria-hidden="true" />
      )}

      {/* LEFT SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col justify-between bg-white p-6 shadow-2xl transition-transform duration-300 lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:w-64 lg:translate-x-0 lg:border-r lg:border-border lg:shadow-none ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div>
          <div className="mb-8 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-indigo-300/50 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
              <svg className="w-6 h-6 relative z-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" fillOpacity="0.9"/>
                <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 7V17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 7V17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 12V22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="12" r="2" fill="white" fillOpacity="0.8"/>
              </svg>
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">
              Lernex<span className="text-indigo-600">AI</span>
            </span>
            </div>
            <button type="button" onClick={() => setMobileMenuOpen(false)} className="rounded-lg p-1.5 text-textMuted hover:bg-gray-100 lg:hidden" aria-label="Close menu">
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          
          <nav className="space-y-2">
            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl ${location === "/dashboard" ? "bg-gradient-to-r from-primary to-secondary text-white font-semibold shadow-md" : "text-textMuted hover:bg-accent/20 hover:text-primary transition-all"}`}>
              <span>🏠</span>
              <span>Dashboard</span>
            </Link>
            <Link href="/browse" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl ${location === "/browse" ? "bg-gradient-to-r from-primary to-secondary text-white font-semibold shadow-md" : "text-textMuted hover:bg-accent/20 hover:text-primary transition-all"}`}>
              <span>📚</span>
              <span>Browse Courses</span>
            </Link>
            <Link href="/my-learning" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl ${location === "/my-learning" ? "bg-gradient-to-r from-primary to-secondary text-white font-semibold shadow-md" : "text-textMuted hover:bg-accent/20 hover:text-primary transition-all"}`}>
              <span>📖</span>
              <span>Learning</span>
            </Link>
            <Link href="/certificate" onClick={() => setMobileMenuOpen(false)} className={`flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-left transition-all ${location.startsWith("/certificate") ? "bg-gradient-to-r from-primary to-secondary text-white font-semibold shadow-md" : "text-textMuted hover:bg-accent/20 hover:text-primary"}`}>
              <span className="flex items-center gap-3"><span>🎓</span><span>Certificates</span></span>
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">New</span>
            </Link>
          </nav>
        </div>

        {/* UPGRADE TO PRO */}
        {user?.plan_type !== "pro" ? (
          <Link href="/upgrade" className="mt-8 block">
            <div className="p-4 rounded-xl bg-gradient-to-br from-accent to-primary/5 border border-primary/20 shadow-sm hover:shadow-lg transition-all">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">💎</span>
                <span className="font-bold text-sm text-textDark">Upgrade to Pro</span>
              </div>
              <p className="text-xs text-textMuted mb-3">Unlock advanced courses, AI mentors, and priority support.</p>
              <button className="w-full h-9 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2">
                <span>Upgrade Now</span>
                <span>→</span>
              </button>
            </div>
          </Link>
        ) : (
          <div className="mt-8 p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">✨</span>
              <span className="font-bold text-sm text-green-700">Pro Member</span>
            </div>
            <p className="text-xs text-green-600">You have access to all premium features!</p>
          </div>
        )}

        <div className="flex flex-col gap-3 pt-4 border-t border-border">
          <div className="flex items-center gap-3">
            <img src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun&backgroundColor=e2e8f0"} alt="User" className="w-10 h-10 rounded-full border-2 border-primary" />
            <div>
              <div className="font-bold text-sm">{user?.name || "User"}</div>
              <div className="text-xs text-success">✓ {user?.plan_type === "pro" ? "Pro Plan" : "Free Plan"}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all text-sm font-semibold">
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        
        {/* Welcome Header */}
        <header className="mb-6 flex items-center justify-between gap-3 lg:mb-10">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setMobileMenuOpen(true)} className="rounded-xl border border-border bg-white p-2.5 text-textMuted shadow-sm hover:text-primary lg:hidden" aria-label="Open menu">
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
            <div>
              <h1 className="text-xl font-bold sm:text-2xl lg:mb-1 lg:text-3xl">Welcome back, {user?.name || "User"}! 👋</h1>
              <p className="hidden text-textMuted sm:block">Build your personalized learning path with AI.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/browse" className="hidden items-center gap-2 rounded-full border border-border bg-white px-5 h-12 text-sm font-semibold text-textDark shadow-sm transition-all hover:border-primary hover:text-primary sm:flex">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <span>Search courses</span>
            </Link>
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen((value) => !value)}
                className={`relative flex h-12 w-12 items-center justify-center rounded-full border border-border bg-white text-textMuted shadow-sm transition-all hover:border-primary hover:text-primary ${notificationsOpen ? "border-primary text-primary" : ""}`}
                aria-label="Open notifications"
              >
                {notificationsOpen ? <BellRing className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
                <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-rose-500" />
              </button>
              {notificationsOpen && (
                <div className="absolute right-0 top-14 w-80 rounded-2xl border border-border bg-white p-3 shadow-xl z-50">
                  <div className="mb-2 flex items-center justify-between px-2">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Notifications</div>
                      <div className="text-xs text-slate-500">Fresh updates for your learning journey</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-purple-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-purple-700">
                        {notifications.filter((item) => item.unread).length} new
                      </span>
                      <button
                        type="button"
                        onClick={() => setNotificationsOpen(false)}
                        className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        aria-label="Close notifications"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {notifications.map((item, index) => (
                      <div key={index} className={`rounded-xl border p-3 ${item.unread ? "border-purple-200 bg-purple-50/70" : "border-slate-100 bg-slate-50"}`}>
                        <div className="flex items-start gap-2">
                          <div className={`mt-0.5 rounded-lg p-1.5 shadow-sm ${item.unread ? "bg-white text-purple-600" : "bg-white text-slate-500"}`}>{item.icon}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-semibold text-slate-900">{item.title}</div>
                              {item.unread && <span className="h-2 w-2 rounded-full bg-rose-500" />}
                            </div>
                            <div className="mt-1 text-sm text-slate-600">{item.description}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="relative">
              <img 
                src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun&backgroundColor=e2e8f0"} 
                alt="Profile" 
                className="w-12 h-12 rounded-full border-2 border-primary cursor-pointer" 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              />
              {profileDropdownOpen && (
                <div className="absolute right-0 top-14 w-48 bg-white rounded-xl border border-border shadow-lg py-2 z-50">
                  <div className="px-4 py-2 border-b border-border">
                    <div className="font-bold text-sm">{user?.name || "User"}</div>
                    <div className="text-xs text-textMuted">{user?.email}</div>
                  </div>
                  <button
                    onClick={() => { setProfileDropdownOpen(false); setAccountDetailsOpen(true); }}
                    className="w-full px-4 py-2 text-left text-sm text-textDark hover:bg-gray-50 transition-all flex items-center gap-2"
                  >
                    <span>👤</span>
                    <span>Account details</span>
                  </button>

                  <button
                    onClick={async () => { setProfileDropdownOpen(false); await handleLogout(); }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-all flex items-center gap-2"
                  >
                    <span>🚪</span>
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* COURSE GENERATOR TRIGGER BOX */}
        <section className="mb-10">
          <div 
            className="bg-gradient-to-br from-primary via-secondary to-purple-600 rounded-3xl p-8 md:p-10 shadow-xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl -ml-24 -mb-24"></div>
            
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex-1 pr-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-4 py-1.5 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-sm">
                    ✨ AI-Powered
                  </span>
                  <span className="px-4 py-1.5 rounded-full bg-success/20 text-white text-xs font-semibold backdrop-blur-sm">
                    FREE TO CREATE
                  </span>
                </div>
                
                <h2 className="text-4xl font-bold text-white mb-4">
                  Create your custom course in seconds
                </h2>
                <p className="text-white/80 text-lg max-w-2xl mb-6">
                  Tell us what you want to learn and our AI will generate a personalized curriculum just for you. No cost!
                </p>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm">
                    <span className="text-xl">⏱️</span>
                    <span className="text-white text-sm">~10 seconds</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm">
                    <span className="text-xl">✅</span>
                    <span className="text-white text-sm">No credit card</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm">
                    <span className="text-xl">🎯</span>
                    <span className="text-white text-sm">Personalized</span>
                  </div>
                </div>

                <button 
                  onClick={openWizard}
                  className="h-14 px-8 rounded-full bg-white text-primary font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
                >
                  <span>Let's build your personal AI course</span>
                  <span className="text-2xl">→</span>
                </button>
              </div>
              
              <div className="hidden lg:block">
                <div className="w-40 h-40 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20 group-hover:bg-white/15 transition-all">
                  <div className="text-8xl group-hover:scale-110 transition-transform animate-bounce">🤖</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {completedCourse && (
          <section className="mb-10">
            <div className="rounded-3xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">Course completed</p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-900">{completedCourse.courseTitle}</h2>
                  <p className="mt-2 text-sm text-slate-600">You completed this course successfully and your certificate is unlocked.</p>
                </div>
                <div className="rounded-2xl bg-white/80 px-4 py-3 text-sm font-semibold text-green-700 shadow-sm">
                  ✅ Successfully completed
                </div>
              </div>
            </div>
          </section>
        )}

        {/* CONTINUE LEARNING SECTION */}
        <section className="mb-10">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Continue Learning</h2>
            <Link href="/browse" className="text-sm font-semibold text-primary hover:underline">Browse all courses</Link>
          </div>
          {user?.id && (
            <div className="max-w-3xl">
              <ContinueLearningCard
                userId={user.id}
                onContinueClick={(courseId) => setLocation(`/learning/${courseId}`)}
              />
            </div>
          )}
        </section>
      </main>

      {/* WIZARD MODAL */}
      {wizardOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
            {/* CLOSE BUTTON */}
            <button onClick={closeWizard} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-all z-10">
              ✕
            </button>

            {/* PROGRESS INDICATORS */}
            <div className="p-8 pb-4">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className={`w-3 h-3 rounded-full progress-dot ${currentStep > 1 ? "completed" : currentStep === 1 ? "active" : ""}`} id="dot-1"></div>
                <div className="w-12 h-1 bg-gray-200 rounded-full">
                  <div className="h-full bg-primary rounded-full transition-all" style={{width: currentStep > 1 ? "100%" : currentStep === 1 ? "50%" : "0%", background: currentStep > 1 ? "#10B981" : "#7C3AED"}}></div>
                </div>
                <div className={`w-3 h-3 rounded-full progress-dot ${currentStep > 2 ? "completed" : currentStep === 2 ? "active" : ""}`} id="dot-2"></div>
                <div className="w-12 h-1 bg-gray-200 rounded-full">
                  <div className="h-full bg-primary rounded-full transition-all" style={{width: currentStep > 2 ? "100%" : currentStep === 2 ? "50%" : "0%", background: currentStep > 2 ? "#10B981" : "#7C3AED"}}></div>
                </div>
                <div className={`w-3 h-3 rounded-full progress-dot ${currentStep > 3 ? "completed" : currentStep === 3 ? "active" : ""}`} id="dot-3"></div>
                <div className="w-12 h-1 bg-gray-200 rounded-full">
                  <div className="h-full bg-primary rounded-full transition-all" style={{width: currentStep > 3 ? "100%" : currentStep === 3 ? "50%" : "0%", background: currentStep > 3 ? "#10B981" : "#7C3AED"}}></div>
                </div>
                <div className={`w-3 h-3 rounded-full progress-dot ${currentStep === 4 || currentStep === 5 ? "active" : ""}`} id="dot-4"></div>
              </div>
            </div>

            {/* STEP 1 */}
            {currentStep === 1 && (
              <div className="p-8 pt-4">
                <div className="text-center mb-8">
                  <div className="text-6xl mb-4">🎯</div>
                  <h2 className="text-3xl font-bold mb-3">What do you want to learn?</h2>
                  <p className="text-textMuted text-lg">Choose what excites you most!</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                  {[
                    {icon: "💻", title: "Web Development", desc: "HTML, CSS, React, Build websites", color: "blue", value: "Web Dev"},
                    {icon: "🤖", title: "AI & Machine Learning", desc: "Neural networks, LLMs, Data science", color: "purple", value: "AI & ML"},
                    {icon: "📊", title: "Data Science", desc: "Python, SQL, Analysis, Visualization", color: "green", value: "Data Science"},
                    {icon: "📈", title: "Stock Market", desc: "Trading, Investing, Financial markets", color: "orange", value: "Stock Market"},
                    {icon: "🎨", title: "UI/UX Design", desc: "Figma, Design systems, Prototypes", color: "pink", value: "UI/UX Design"},
                    {icon: "🛡️", title: "Cybersecurity", desc: "Ethical hacking, Network security", color: "red", value: "Cybersecurity"},
                  ].map((item) => {
                    const style = categoryStyles[item.color];
                    const isSelected = selectedCategory === item.value;
                    return (
                      <div
                        key={item.value}
                        onClick={() => setSelectedCategory(item.value)}
                        className={`wizard-option-card cursor-pointer rounded-2xl border-2 bg-gradient-to-br p-6 text-center transition-all ${style.card} ${isSelected ? `ring-4 ${style.ring} bg-accent` : ""}`}
                      >
                        <div className="text-5xl mb-3">{item.icon}</div>
                        <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                        <p className="text-sm text-textMuted">{item.desc}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="mb-6">
                  <label className="block text-textDark font-semibold mb-3">Or tell us in your own words:</label>
                  <textarea 
                    value={customGoal}
                    onChange={(e) => setCustomGoal(e.target.value)}
                    className="w-full h-24 px-4 py-3 rounded-xl border border-border focus:outline-none focus:border-primary resize-none"
                    placeholder="e.g., 'I want to build my own portfolio website' or 'Teach me how to trade options'"
                  />
                </div>

                <div className="flex justify-between">
                  <button onClick={closeWizard} className="px-6 py-3 rounded-full text-textMuted hover:bg-gray-100 transition-all">Cancel</button>
                  <button onClick={() => goToStep(2)} disabled={!selectedCategory && !customGoal.trim()} className="px-8 py-3 rounded-full bg-primary text-white font-semibold transition-all pulse-btn hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40">Next →</button>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {currentStep === 2 && (
              <div className="p-8 pt-4">
                <div className="text-center mb-8">
                  <div className="text-6xl mb-4">📊</div>
                  <h2 className="text-3xl font-bold mb-3">What's your experience level?</h2>
                  <p className="text-textMuted text-lg">Don't worry, no judgment here! 😊</p>
                </div>
                
                <div className="space-y-4 mb-8">
                  <div 
                    onClick={() => setSelectedLevel("Beginner")}
                    className={`wizard-option-card bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border-2 border-green-200 flex items-center gap-4 transition-all cursor-pointer ${selectedLevel === "Beginner" ? "ring-4 ring-primary bg-accent" : ""}`}
                  >
                    <div className="w-16 h-16 rounded-2xl bg-green-200 flex items-center justify-center text-3xl">🌱</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">Complete Beginner</h3>
                      <p className="text-textMuted">New to this topic. Starting from scratch!</p>
                    </div>
                    <div className="text-2xl text-green-600">→</div>
                  </div>
                  <div 
                    onClick={() => setSelectedLevel("Intermediate")}
                    className={`wizard-option-card bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border-2 border-blue-200 flex items-center gap-4 transition-all cursor-pointer ${selectedLevel === "Intermediate" ? "ring-4 ring-primary bg-accent" : ""}`}
                  >
                    <div className="w-16 h-16 rounded-2xl bg-blue-200 flex items-center justify-center text-3xl">🚀</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">Some Experience</h3>
                      <p className="text-textMuted">Know the basics. Want to go deeper.</p>
                    </div>
                    <div className="text-2xl text-blue-600">→</div>
                  </div>
                  <div 
                    onClick={() => setSelectedLevel("Advanced")}
                    className={`wizard-option-card bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border-2 border-purple-200 flex items-center gap-4 transition-all cursor-pointer ${selectedLevel === "Advanced" ? "ring-4 ring-primary bg-accent" : ""}`}
                  >
                    <div className="w-16 h-16 rounded-2xl bg-purple-200 flex items-center justify-center text-3xl">🏆</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">Advanced</h3>
                      <p className="text-textMuted">Experienced. Looking for advanced concepts.</p>
                    </div>
                    <div className="text-2xl text-purple-600">→</div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button onClick={() => goToStep(1)} className="px-6 py-3 rounded-full text-textMuted hover:bg-gray-100 transition-all">← Back</button>
                  <button onClick={() => goToStep(3)} disabled={!selectedLevel} className="px-8 py-3 rounded-full bg-primary text-white font-semibold transition-all pulse-btn hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40">Next →</button>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {currentStep === 3 && (
              <div className="p-8 pt-4">
                <div className="text-center mb-8">
                  <div className="text-6xl mb-4">⏱️</div>
                  <h2 className="text-3xl font-bold mb-3">How much time can you commit?</h2>
                  <p className="text-textMuted text-lg">Be realistic — we'll adjust the pace! 😄</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div 
                    onClick={() => setSelectedTime("casual")}
                    className={`wizard-option-card bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 text-center border-2 border-orange-200 transition-all cursor-pointer ${selectedTime === "casual" ? "ring-4 ring-primary bg-accent" : ""}`}
                  >
                    <div className="text-5xl mb-3">☕</div>
                    <h3 className="font-bold text-lg mb-1">Casual</h3>
                    <p className="text-textMuted text-sm mb-2">~2 hours/week</p>
                    <div className="px-3 py-1 bg-orange-200 text-orange-800 text-xs rounded-full inline-block">Relaxed pace</div>
                  </div>
                  <div 
                    onClick={() => setSelectedTime("moderate")}
                    className={`wizard-option-card bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 text-center border-2 border-blue-200 transition-all cursor-pointer ${selectedTime === "moderate" ? "ring-4 ring-primary bg-accent" : ""}`}
                  >
                    <div className="text-5xl mb-3">💪</div>
                    <h3 className="font-bold text-lg mb-1">Moderate</h3>
                    <p className="text-textMuted text-sm mb-2">~5 hours/week</p>
                    <div className="px-3 py-1 bg-blue-200 text-blue-800 text-xs rounded-full inline-block">Balanced</div>
                  </div>
                  <div 
                    onClick={() => setSelectedTime("intensive")}
                    className={`wizard-option-card bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 text-center border-2 border-purple-200 transition-all cursor-pointer ${selectedTime === "intensive" ? "ring-4 ring-primary bg-accent" : ""}`}
                  >
                    <div className="text-5xl mb-3">🔥</div>
                    <h3 className="font-bold text-lg mb-1">Intensive</h3>
                    <p className="text-textMuted text-sm mb-2">~10+ hours/week</p>
                    <div className="px-3 py-1 bg-purple-200 text-purple-800 text-xs rounded-full inline-block">Fast track</div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button onClick={() => goToStep(2)} className="px-6 py-3 rounded-full text-textMuted hover:bg-gray-100 transition-all">← Back</button>
                  <button onClick={generateCourse} disabled={!selectedTime} className="px-8 py-3 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-bold transition-all pulse-btn hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40">✨ Generate My Course</button>
                </div>
              </div>
            )}

            {/* STEP 4 */}
            {currentStep === 4 && (
              <div className="p-8 pt-4">
                <div className="text-center py-12">
                  <div className="relative w-32 h-32 mx-auto mb-8">
                    <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-4xl">🤖</div>
                  </div>
                  <h2 className="text-3xl font-bold mb-4">Building Your Custom Course...</h2>
                  <p className="text-textMuted text-lg mb-8">Our AI is crafting the perfect learning path for you!</p>
                  
                  <div className="max-w-md mx-auto space-y-3">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center">✓</div>
                      <span className="text-textDark">Analyzing your goals...</span>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">⏳</div>
                      <span className="text-textDark">Curating resources...</span>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">○</div>
                      <span className="text-textMuted">Generating quizzes...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5 */}
            {currentStep === 5 && (
              <div className="p-8 pt-4">
                <div className="text-center mb-8">
                  <div className="text-7xl mb-4">🎉</div>
                  <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Your Course is Ready!</h2>
                  <p className="text-textMuted text-lg">Congratulations! Here's your personalized learning path.</p>
                </div>

                <div className="bg-gradient-to-br from-accent to-primary/5 border-2 border-primary/20 rounded-2xl p-8 mb-8">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">PERSONALIZED</span>
                      <h3 className="text-2xl font-bold mt-4 mb-2">{selectedCategory} Custom Course</h3>
                      <p className="text-textMuted">Customized for {selectedLevel?.toLowerCase()}s with {selectedTime} pace</p>
                    </div>
                    <div className="text-5xl">💻</div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-white/50 rounded-xl">
                      <div className="text-3xl font-bold text-primary">8</div>
                      <div className="text-sm text-textMuted">Modules</div>
                    </div>
                    <div className="text-center p-4 bg-white/50 rounded-xl">
                      <div className="text-3xl font-bold text-primary">~12h</div>
                      <div className="text-sm text-textMuted">Total Time</div>
                    </div>
                    <div className="text-center p-4 bg-white/50 rounded-xl">
                      <div className="text-3xl font-bold text-success">FREE</div>
                      <div className="text-sm text-textMuted">Learning</div>
                    </div>
                  </div>

                  <div className="bg-white/50 rounded-xl p-4 mb-6">
                    <h4 className="font-bold text-sm mb-3">Your Curriculum:</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">1</div>
                        <span className="flex-1">Introduction to HTML & CSS</span>
                        <span className="text-xs text-textMuted">1 hr</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">2</div>
                        <span className="flex-1">JavaScript Fundamentals</span>
                        <span className="text-xs text-textMuted">2 hrs</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">3</div>
                        <span className="flex-1">Building Your First Website</span>
                        <span className="text-xs text-textMuted">3 hrs</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">🎓</span>
                      <span className="font-bold text-textDark">Want a Certificate?</span>
                    </div>
                    <p className="text-sm text-textMuted mb-3">Complete all modules + final test → Get verified certificate for just ₹99!</p>
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-yellow-600">₹99</span>
                      <span className="text-sm text-textMuted">One-time payment</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between gap-4">
                  <button onClick={closeWizard} className="px-6 py-3 rounded-full text-textMuted hover:bg-gray-100 transition-all">Maybe Later</button>
                  <button onClick={() => { closeWizard(); setLocation("/browse"); }} className="px-8 py-3 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-bold hover:shadow-lg transition-all">Find This Course →</button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ACCOUNT DETAILS MODAL */}
      <AccountDetailsModal
        isOpen={accountDetailsOpen}
        onClose={() => setAccountDetailsOpen(false)}
        user={{
          id: user?.id || "",
          email: user?.email || "",
          first_name: user?.first_name,
          last_name: user?.last_name,
          phone: user?.phone
        }}
        onSave={handleSaveAccountDetails}
      />
    </div>
  );
}
