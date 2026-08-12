import React, { createContext, useContext, useState, useEffect } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { getAppUrl } from "@/lib/siteUrl";
import { User as SupabaseUser } from "@supabase/supabase-js";

interface User {
  email: string;
  name: string;
  id?: string;
  avatar?: string;
  plan_type?: string;
  created_at?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
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

async function fetchUserProfile(supabaseUser: SupabaseUser): Promise<User> {
  try {
    const { data: profileData, error } = await supabase
      .from('users')
      .select('first_name, last_name, phone, plan_type')
      .eq('id', supabaseUser.id)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      // Return basic user data if profile fetch fails
      return {
        email: supabaseUser.email || "",
        name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split("@")[0] || "User",
        id: supabaseUser.id,
        avatar: supabaseUser.user_metadata?.avatar_url,
        plan_type: supabaseUser.user_metadata?.plan_type || "free",
        created_at: supabaseUser.created_at,
      };
    }

    return {
      email: supabaseUser.email || "",
      name: [profileData?.first_name, profileData?.last_name].filter(Boolean).join(" ") ||
            supabaseUser.user_metadata?.full_name ||
            supabaseUser.email?.split("@")[0] ||
            "User",
      id: supabaseUser.id,
      avatar: supabaseUser.user_metadata?.avatar_url,
      plan_type: profileData?.plan_type || supabaseUser.user_metadata?.plan_type || "free",
      created_at: supabaseUser.created_at,
      first_name: profileData?.first_name,
      last_name: profileData?.last_name,
      phone: profileData?.phone,
    };
  } catch (error) {
    console.error("Error in fetchUserProfile:", error);
    return {
      email: supabaseUser.email || "",
      name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split("@")[0] || "User",
      id: supabaseUser.id,
      avatar: supabaseUser.user_metadata?.avatar_url,
      plan_type: supabaseUser.user_metadata?.plan_type || "free",
      created_at: supabaseUser.created_at,
    };
  }
}

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
          const [loading, setLoading] = useState(false);

          useEffect(() => {
            const initializeAuth = async () => {
              if (!isSupabaseConfigured) {
                setUser(null);
                return;
              }

              try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                  const userProfile = await fetchUserProfile(session.user);
                  setUser(userProfile);
                } else {
                  setUser(null);
                }
              } catch (error) {
                console.error("Auth initialization failed", error);
                setUser(null);
              }
            };

            void initializeAuth();

            // Listen for auth changes
            const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
              if (session?.user) {
                const userProfile = await fetchUserProfile(session.user);
                setUser(userProfile);
              } else {
                setUser(null);
              }
            });

            return () => subscription.unsubscribe();
          }, []);

  const login = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase environment variables are missing on this deployment.");
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      const userProfile = await fetchUserProfile(data.user);
      setUser(userProfile);
    }
  };

  const signup = async (email: string, password: string, firstName?: string, lastName?: string) => {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase environment variables are missing on this deployment.");
    }

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

    if (data.user) {
      // Also save to users table
      try {
        await supabase
          .from('users')
          .upsert({
            id: data.user.id,
            email: email,
            first_name: firstName || null,
            last_name: lastName || null,
            plan_type: 'free'
          });
      } catch (profileError) {
        console.error("Error creating user profile:", profileError);
        // Don't fail signup if profile creation fails
      }

      if (data.session?.user) {
        const userProfile = await fetchUserProfile(data.session.user);
        setUser(userProfile);
        return { sessionCreated: true };
      }
    }

    return { sessionCreated: false };
  };

  const loginWithGoogle = async () => {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase environment variables are missing on this deployment.");
    }

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
    if (!isSupabaseConfigured) {
      setUser(null);
      return;
    }

    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    if (data.user) {
      const userProfile = await fetchUserProfile(data.user);
      setUser(userProfile);
    }
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
