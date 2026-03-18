import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
});

const shouldBypassAuth = import.meta.env.DEV && import.meta.env.VITE_BYPASS_AUTH === "1";
const AUTH_INIT_TIMEOUT_MS = 3000;

const devSession = shouldBypassAuth ? ({
  access_token: "dev-bypass-access-token",
  refresh_token: "dev-bypass-refresh-token",
  expires_in: 60 * 60,
  expires_at: Math.floor(Date.now() / 1000) + (60 * 60),
  token_type: "bearer",
  user: {
    id: "dev-bypass-user",
    app_metadata: {},
    user_metadata: { name: "Dev Bypass User" },
    aud: "authenticated",
    created_at: new Date().toISOString(),
  },
} as Session) : null;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(devSession);
  const [loading, setLoading] = useState(!shouldBypassAuth);

  useEffect(() => {
    if (shouldBypassAuth) {
      setSession(devSession);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const finish = (nextSession: Session | null) => {
      if (cancelled) return;
      setSession(nextSession);
      setLoading(false);
    };

    const timeoutId = window.setTimeout(() => {
      finish(null);
    }, AUTH_INIT_TIMEOUT_MS);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      window.clearTimeout(timeoutId);
      finish(session);
    });

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        window.clearTimeout(timeoutId);
        finish(session);
      })
      .catch(() => {
        window.clearTimeout(timeoutId);
        finish(null);
      });

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    if (shouldBypassAuth) return;
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
