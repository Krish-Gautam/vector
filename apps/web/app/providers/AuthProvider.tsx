"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { User } from "@supabase/supabase-js";

import { supabase } from "../lib/supabase";
import { clearAuthSession, syncAuthSession } from "../lib/auth-session";

type Profile = {
  id: string;
  username: string;
  avatar_url: string | null;
};

type AuthState = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Failed to load profile:", error);
      setProfile(null);
      return;
    }

    setProfile(data);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    await loadProfile(user.id);
  }, [user, loadProfile]);

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      const authUser = session?.user ?? null;

      syncAuthSession(session);

      setUser(authUser);

      if (authUser) {
        await loadProfile(authUser.id);
      } else {
        setProfile(null);
      }

      setLoading(false);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const authUser = session?.user ?? null;

      syncAuthSession(session);

      setUser(authUser);

      if (authUser) {
        await loadProfile(authUser.id);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    loadSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    clearAuthSession();
  }, []);

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      signOut,
      refreshProfile,
    }),
    [user, profile, loading, signOut, refreshProfile]
  );

  return (
    <AuthContext.Provider value={value}>
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