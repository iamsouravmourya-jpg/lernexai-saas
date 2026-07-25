import { useEffect } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Problem } from "@/components/landing/Problem";
import { Subjects } from "@/components/landing/Subjects";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Certificate } from "@/components/landing/Certificate";
import { FAQ } from "@/components/landing/FAQ";
import { Cta } from "@/components/landing/Cta";
import { Footer } from "@/components/landing/Footer";
import { useAuth } from "@/context/AuthContext";

function AuthRedirectScreen({ message }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
        <p className="text-gray-600">{message ?? "Checking your session..."}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  const oauthCallbackSearch =
    typeof window !== "undefined" && new URL(window.location.href).searchParams.has("code")
      ? window.location.search
      : null;

  useEffect(() => {
    if (oauthCallbackSearch) {
      setLocation(`/auth/callback${oauthCallbackSearch}`, { replace: true });
      return;
    }

    if (!loading && user) {
      setLocation("/dashboard", { replace: true });
    }
  }, [loading, user, setLocation, oauthCallbackSearch]);

  if (oauthCallbackSearch || loading || user) {
    return (
      <AuthRedirectScreen
        message={oauthCallbackSearch ? "Completing sign in..." : undefined}
      />
    );
  }

  return (
    <div className="relative min-h-screen bg-white text-foreground overflow-x-hidden font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Global subtle texture */}
      <div className="fixed inset-0 z-0 bg-noise opacity-[0.02] mix-blend-multiply pointer-events-none"></div>
      
      {/* Background ambient glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-200/40 blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-200/40 blur-[120px] pointer-events-none z-0"></div>

      <Navbar />
      
      <main className="relative z-10 flex flex-col items-center">
        <Hero />
        <Problem />
        <Subjects />
        <Features />
        <HowItWorks />
        <Certificate />
        <FAQ />
        <Cta />
      </main>

      <Footer />
    </div>
  );
}
