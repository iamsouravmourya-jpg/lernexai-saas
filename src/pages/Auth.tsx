import { useState, useEffect } from "react"; // Added useEffect
import { useAuth } from "@/context/AuthContext";
import { Link, useLocation } from "wouter";

export default function Auth() {
  const { login, signup, loginWithGoogle, user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [isSignUp, setIsSignUp] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    if (user) {
      setLocation("/dashboard", { replace: true });
    }
  }, [user, setLocation]);
  
  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
    try {
      setError("");
      setGoogleLoading(true);
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message || "Google login failed");
      setGoogleLoading(false);
    }
  };

  if (user) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      if (isSignUp) {
        const result = await signup(email, password, firstName, lastName);
        if (!result.sessionCreated) {
          setError("Account created. Check your email to verify your account, then sign in.");
          setIsSignUp(false);
          return;
        }
      } else {
        await login(email, password);
      }

      setLocation("/dashboard", { replace: true });
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-white flex overflow-y-auto">
      {/* LEFT SIDE - MARKETING CONTENT */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-16 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-md">
          <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-all mb-8">
            <span>←</span>
            <span className="text-sm font-medium">Back</span>
          </Link>
          
          <h1 className="text-5xl font-bold leading-tight mb-6 text-gray-900">
            Build a path that remembers you.
          </h1>
          
          <p className="text-lg text-gray-600 leading-relaxed">
            Create an account so class material, generated lessons, practice misses, and saved work can become one learning thread.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE - SIGNUP/SIGNIN FORM */}
      <div className="flex-1 flex items-start justify-center px-4 py-8 sm:px-6 lg:items-center lg:p-16">
        <div className="w-full max-w-[440px] pb-8">

          <Link href="/" className="mb-6 inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 transition-all hover:bg-gray-200 lg:hidden">
            <span>←</span>
            <span className="text-sm font-medium">Back</span>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {isSignUp ? "Start with Lernex" : "Welcome back"}
            </h2>
            <p className="text-gray-600">
              {isSignUp 
                ? "Use a provider or create a secure email account." 
                : "Sign in to your account to continue learning."
              }
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {isSignUp && (
            <>
              {/* Terms Error Alert */}
              {!termsAccepted && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-red-600">Please agree to the Terms of Service and Privacy Policy to continue.</p>
                </div>
              )}

              {/* Terms Checkbox */}
              <div className={`rounded-lg p-4 mb-6 ${!termsAccepted ? "bg-red-50 border border-red-200" : "bg-gray-50 border border-gray-200"}`}>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={termsAccepted} 
                    onChange={(e) => setTermsAccepted(e.target.checked)} 
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" 
                  />
                  <span className="text-sm text-gray-700">
                    I agree to the <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link> and 
                    <Link href="/privacy" className="text-blue-600 hover:underline"> Privacy Policy</Link>.
                    {!termsAccepted && <span className="block text-red-600 mt-1 font-medium">Required to continue with Apple, Google, or email signup.</span>}
                  </span>
                </label>
              </div>
            </>
          )}

          {/* Google Button */}
          <button 
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading || googleLoading || (isSignUp && !termsAccepted)}
            className={`w-full h-12 border-2 rounded-lg flex items-center justify-center gap-3 transition-all mb-6 active:scale-[0.99] ${
              (isSignUp && !termsAccepted) 
                ? "border-red-300 bg-red-50 cursor-not-allowed opacity-60" 
                : googleLoading
                  ? "border-purple-300 bg-purple-50 cursor-wait"
                  : "border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            }`}
          >
            <svg className={`w-5 h-5 ${googleLoading ? "animate-pulse" : ""}`} viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"/>
              <path fill="#EA4335" d="M12 4.81c1.6 0 3.04.55 4.19 1.64l3.15-3.15C17.45 1.09 14.97 0 12 0 7.7 0 3.99 2.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="font-medium text-gray-700">
              {googleLoading
                ? "Opening Google sign in..."
                : isLoading
                  ? "Connecting..."
                  : (isSignUp && !termsAccepted)
                    ? "Accept terms to continue"
                    : "Continue with Google"}
            </span>
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white text-sm text-gray-500">
                {isSignUp ? "or sign up with email" : "or sign in with email"}
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First name</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-400">👤</span>
                    <input 
                      type="text" 
                      placeholder="John" 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full pl-10 pr-4 h-11 rounded-lg border border-gray-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last name (optional)</label>
                  <input 
                    type="text" 
                    placeholder="Doe" 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 h-11 rounded-lg border border-gray-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400">✉️</span>
                <input 
                  type="email" 
                  placeholder="you@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 h-11 rounded-lg border border-gray-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400">🔒</span>
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder={isSignUp ? "Create a password" : "Enter your password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 h-11 rounded-lg border border-gray-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-1.5 top-1.5 rounded-lg p-2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={(isSignUp && !termsAccepted) || isLoading || googleLoading}
              className={`w-full h-12 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                (isSignUp && !termsAccepted) || isLoading || googleLoading
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                  : "bg-primary text-white hover:bg-secondary cursor-pointer"
              }`}
            >
              {isLoading ? "Please wait..." : (isSignUp ? "Create account →" : "Sign in →")}
            </button>
          </form>

          {/* Footer */}
          {isSignUp && (
            <p className="text-xs text-gray-500 mt-4 text-center">Your agreement is recorded when you create an account.</p>
          )}

          <div className="mt-6 text-center">
            <button 
              onClick={() => {
                const nextIsSignUp = !isSignUp;
                setIsSignUp(nextIsSignUp);
                setTermsAccepted(false);
                setError("");
              }}
              className="text-sm text-blue-600 hover:underline"
            >
              {isSignUp ? (
                <>
                  Already have an account? <strong>Sign in instead</strong>
                </>
              ) : (
                <>
                  Don't have an account? <strong>Sign up instead</strong>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
