import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Send, MessageCircle, HelpCircle, AlertCircle, CreditCard, BookOpen, User, Settings, ChevronDown } from "lucide-react";
import AITutorGuide from "@/components/AITutorGuide";

export default function Support() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [issueType, setIssueType] = useState("");
  const [customIssue, setCustomIssue] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [showIssueDropdown, setShowIssueDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const issueCategories = [
    { id: "account", label: "Account Issues", icon: User, description: "Login, profile, or account settings" },
    { id: "payment", label: "Payment & Billing", icon: CreditCard, description: "Certificates, subscriptions, refunds" },
    { id: "course", label: "Course Content", icon: BookOpen, description: "Lessons, modules, quizzes" },
    { id: "technical", label: "Technical Problems", icon: AlertCircle, description: "Bugs, errors, performance" },
    { id: "general", label: "General Inquiry", icon: HelpCircle, description: "Questions, feedback, suggestions" },
    { id: "other", label: "Other", icon: MessageCircle, description: "Custom issue description" },
  ];

  const selectedIssue = issueCategories.find(cat => cat.id === issueType);
  const isCustomIssue = issueType === "other";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Demo submission - no actual API call
    setTimeout(() => {
      setIsSubmitting(false);
      alert("Support request submitted successfully! (Demo)");
      setIssueType("");
      setCustomIssue("");
      setSubject("");
      setMessage("");
    }, 1500);
  };

  return (
    <div className="bg-bgSecondary text-textDark font-sans min-h-screen lg:flex">
      {/* LEFT SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 z-40 flex w-72 flex-col justify-between bg-white p-6 shadow-2xl transition-transform duration-300 lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:w-64 lg:translate-x-0 lg:border-r lg:border-border lg:shadow-none -translate-x-full">
        <div>
          <div className="mb-8 flex items-center gap-2">
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

          <nav className="space-y-2">
            <Link href="/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-xl ${location === "/dashboard" ? "bg-gradient-to-r from-primary to-secondary text-white font-semibold shadow-md" : "text-textMuted hover:bg-accent/20 hover:text-primary transition-all"}`}>
              <span>🏠</span>
              <span>Dashboard</span>
            </Link>
            <Link href="/browse" className={`flex items-center gap-3 px-4 py-3 rounded-xl ${location === "/browse" ? "bg-gradient-to-r from-primary to-secondary text-white font-semibold shadow-md" : "text-textMuted hover:bg-accent/20 hover:text-primary transition-all"}`}>
              <span>📚</span>
              <span>Browse Courses</span>
            </Link>
            <Link href="/my-learning" className={`flex items-center gap-3 px-4 py-3 rounded-xl ${location === "/my-learning" ? "bg-gradient-to-r from-primary to-secondary text-white font-semibold shadow-md" : "text-textMuted hover:bg-accent/20 hover:text-primary transition-all"}`}>
              <span>📖</span>
              <span>Learning</span>
            </Link>
            <Link href="/certificate" className={`flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-left transition-all ${location.startsWith("/certificate") ? "bg-gradient-to-r from-primary to-secondary text-white font-semibold shadow-md" : "text-textMuted hover:bg-accent/20 hover:text-primary"}`}>
              <span className="flex items-center gap-3"><span>🎓</span><span>Certificates</span></span>
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">New</span>
            </Link>
            <Link href="/support" className={`flex items-center gap-3 px-4 py-3 rounded-xl ${location === "/support" ? "bg-gradient-to-r from-primary to-secondary text-white font-semibold shadow-md" : "text-textMuted hover:bg-accent/20 hover:text-primary transition-all"}`}>
              <span>🛟</span>
              <span>Support</span>
            </Link>
          </nav>
        </div>

        <div className="flex flex-col gap-3 pt-4 border-t border-border">
          <div className="flex items-center gap-3">
            <img src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun&backgroundColor=e2e8f0"} alt="User" className="w-10 h-10 rounded-full border-2 border-primary" />
            <div>
              <div className="font-bold text-sm">{user?.name || "User"}</div>
              <div className="text-xs text-success">✓ {user?.plan_type === "pro" ? "Pro Plan" : "Free Plan"}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 min-h-screen bg-bgSecondary lg:ml-0">
        <div className="max-w-6xl mx-auto p-6 lg:p-10">
          {/* Header */}
          <div className="mb-8">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-textMuted hover:text-primary transition-all mb-4">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back to Dashboard</span>
            </Link>
            <h1 className="text-3xl font-bold text-textDark mb-2">Support Center</h1>
            <p className="text-textMuted">Get help with any issues or questions. Our AI tutor is here to assist you.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Support Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-border p-6">
                <h2 className="text-xl font-bold text-textDark mb-6 flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  Submit a Support Request
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Issue Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-textDark mb-2">What type of issue are you facing?</label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowIssueDropdown(!showIssueDropdown)}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border bg-white hover:border-primary transition-all text-left"
                      >
                        <div className="flex items-center gap-3">
                          {selectedIssue ? (
                            <>
                              <selectedIssue.icon className="h-5 w-5 text-primary" />
                              <span className="font-medium">{selectedIssue.label}</span>
                            </>
                          ) : (
                            <span className="text-textMuted">Select an issue type</span>
                          )}
                        </div>
                        <ChevronDown className={`h-4 w-4 text-textMuted transition-transform ${showIssueDropdown ? 'rotate-180' : ''}`} />
                      </button>

                      {showIssueDropdown && (
                        <div className="absolute z-10 w-full mt-2 bg-white border border-border rounded-xl shadow-lg overflow-hidden">
                          {issueCategories.map((category) => (
                            <button
                              key={category.id}
                              type="button"
                              onClick={() => {
                                setIssueType(category.id);
                                setShowIssueDropdown(false);
                              }}
                              className="w-full px-4 py-3 text-left hover:bg-accent/20 transition-all flex items-start gap-3"
                            >
                              <category.icon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <div>
                                <div className="font-medium text-textDark">{category.label}</div>
                                <div className="text-xs text-textMuted">{category.description}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Custom Issue Input */}
                  {isCustomIssue && (
                    <div>
                      <label className="block text-sm font-medium text-textDark mb-2">Describe your issue</label>
                      <input
                        type="text"
                        value={customIssue}
                        onChange={(e) => setCustomIssue(e.target.value)}
                        placeholder="Briefly describe your issue..."
                        className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        required
                      />
                    </div>
                  )}

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-medium text-textDark mb-2">Subject</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Brief summary of your request"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      required
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-textDark mb-2">Message</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please provide detailed information about your issue..."
                      rows={6}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || !issueType || !subject || !message}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Submit Request</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Quick Help Cards */}
              <div className="mt-6 grid sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-4 border border-border hover:border-primary transition-all cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-textDark">Course Help</span>
                  </div>
                  <p className="text-sm text-textMuted">Get help with lessons, quizzes, and course navigation.</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-border hover:border-primary transition-all cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-textDark">Payment Issues</span>
                  </div>
                  <p className="text-sm text-textMuted">Questions about certificates, payments, and refunds.</p>
                </div>
              </div>
            </div>

            {/* AI Tutor Guide */}
            <div className="lg:col-span-1">
              <AITutorGuide context="support" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
