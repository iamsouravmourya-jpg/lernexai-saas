import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const [message, setMessage] = useState("Completing sign in…");

  useEffect(() => {
    let active = true;

    async function finishAuth() {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");

      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (!active) return;
        if (error) {
          setMessage(error.message || "Could not complete sign in.");
          setTimeout(() => setLocation("/auth"), 1500);
          return;
        }

        if (data.session) {
          if (!active) return;
          setLocation("/dashboard", { replace: true });
          return;
        }
      }

      const { data } = await supabase.auth.getSession();
      if (!active) return;

      if (data.session) {
        if (!active) return;
        setLocation("/dashboard", { replace: true });
        return;
      }

      setMessage("Session not found. Redirecting back to sign in…");
      setTimeout(() => setLocation("/auth"), 1500);
    }

    void finishAuth();

    return () => {
      active = false;
    };
  }, [setLocation]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gray-50 px-6 text-center">
      <div>
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-purple-100 border-t-purple-600" />
        <h1 className="text-xl font-bold text-gray-900">Finishing sign in</h1>
        <p className="mt-2 text-sm text-gray-600">{message}</p>
      </div>
    </div>
  );
}
