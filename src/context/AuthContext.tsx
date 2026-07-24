import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { getAppUrl } from "@/lib/siteUrl";
import { User as SupabaseUser } from "@supabase/supabase-js";

interface User {
  email: string;
  name: string;
  id?: string;
  avatar?: string;
  plan_type?: string;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string
  ) => Promise<{ sessionCreated: boolean }>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapSupabaseUser(supabaseUser: SupabaseUser | null | undefined): User | null {
  if (!supabaseUser) return null;

  return {
    email: supabaseUser.email || "",
    name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split("@")[0] || "User",
    id: supabaseUser.id,
    avatar: supabaseUser.user_metadata?.avatar_url,
    plan_type: supabaseUser.user_metadata?.plan_type || "free",
    created_at: supabaseUser.created_at,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
          const [loading, setLoading] = useState(true);

          useEffect(() => {
            const initializeAuth = async () => {
              const { data: { user: currentUser } } = await supabase.auth.getUser();
              setUser(mapSupabaseUser(currentUser));
              setLoading(false);
            };

            initializeAuth();

            // Listen for auth changes
            const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
              const mappedUser = mapSupabaseUser(session?.user ?? null);
              setUser(mappedUser);
            });

            return () => subscription.unsubscribe();
          }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      setUser(mapSupabaseUser(data.user));
    }
  };

  const signup = async (email: string, password: string, firstName?: string, lastName?: string) => {
    const fullName = [firstName?.trim(), lastName?.trim()].filter(Boolean).join(" ") || email.split("@")[0];

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getAppUrl("/auth/callback"),
        data: {
          full_name: fullName,
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}&backgroundColor=e2e8f0`,
          plan_type: "free"
        }
      }
    });

    if (error) throw error;

    if (data.session?.user) {
      setUser(mapSupabaseUser(data.session.user));
      return { sessionCreated: true };
    }

    return { sessionCreated: false };
  };

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: getAppUrl("/auth/callback"),
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });

    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const refreshUser = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    setUser(mapSupabaseUser(data.user));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, loginWithGoogle, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
