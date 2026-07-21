import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      if (data.session?.user) {
        const u = await loadProfile(data.session.user.id, data.session.user.email ?? '');
        if (mounted) setUserState(u);
      }
      if (mounted) setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
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
    await supabase.auth.signOut();
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
