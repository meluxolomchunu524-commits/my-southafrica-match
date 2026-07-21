import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getMeFn } from '@/api/auth-fns';

export type AuthUser = {
  id: string;
  email: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
};

type AuthCtx = {
  user: AuthUser | null;
  loading: boolean;
  setUser: (u: AuthUser | null) => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthCtx>({
  user: null,
  loading: true,
  setUser: () => {},
  signOut: async () => {},
});

async function loadProfile(userId: string, email: string): Promise<AuthUser> {
  const { data } = await supabase
    .from('profiles')
    .select('full_name, username, avatar_url')
    .eq('id', userId)
    .maybeSingle();
  return {
    id: userId,
    email,
    full_name: data?.full_name ?? null,
    username: data?.username ?? null,
    avatar_url: data?.avatar_url ?? null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  function setUser(u: AuthUser | null) {
    setUserState(u);
  }

  useEffect(() => {
    let mounted = true;

    // Fast-path: read cached user from localStorage for instant UI.
    try {
      const cached = typeof window !== 'undefined' ? localStorage.getItem('lc_user') : null;
      if (cached && mounted) setUserState(JSON.parse(cached));
    } catch {}

    (async () => {
      try {
        const me = await getMeFn({ data: {} });
        if (!mounted) return;
        if (me) {
          setUserState(me as any);
          try { if (typeof window !== 'undefined') localStorage.setItem('lc_user', JSON.stringify(me)); } catch {}
        } else {
          setUserState(null);
          try {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('lc_user');
              localStorage.removeItem('lc_token');
            }
          } catch {}
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      if (event === 'SIGNED_OUT') {
        setUserState(null);
        return;
      }
      if (session?.user && (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED')) {
        const u = await loadProfile(session.user.id, session.user.email ?? '');
        setUserState(u);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    try { await supabase.auth.signOut(); } catch {}
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('lc_token');
        localStorage.removeItem('lc_user');
      }
    } catch {}
    setUserState(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, setUser, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
