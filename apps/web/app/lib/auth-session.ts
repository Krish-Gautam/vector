import type { Session } from "@supabase/supabase-js";

type AuthSessionState = {
  accessToken: string | null;
  expiresAt: number | null;
};

let currentSession: AuthSessionState = {
  accessToken: null,
  expiresAt: null,
};

export function syncAuthSession(session: Session | null) {
  currentSession = {
    accessToken: session?.access_token ?? null,
    expiresAt: session?.expires_at ?? null,
  };
}

export function clearAuthSession() {
  currentSession = {
    accessToken: null,
    expiresAt: null,
  };
}

export function getAuthAccessToken() {
  return currentSession.accessToken;
}

export function getAuthSessionState() {
  return currentSession;
}