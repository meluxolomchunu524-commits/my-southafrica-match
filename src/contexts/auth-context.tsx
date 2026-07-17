import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getMeFn, type AuthUser } from '@/api/auth-fns';

const USER_KEY = 'lc_user';
const TOKEN_KEY = 'lc_token';

function readCachedUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function cacheUser(u: AuthUser | null) {
  if (typeof window === 'undefined') return;
  if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
  else localStorage.removeItem(USER_KEY);
}

type AuthCtx = {
  user: AuthUser | null;
  loading: boolean;
  setUser: (u: AuthUser | null) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthCtx>({
  user: null, loading: true,
  setUser: () => {}, signOut: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  // Always start null/true on both server and client so SSR HTML matches
  // the first client render — prevents hydration mismatch.
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  function setUser(u: AuthUser | null) {
    cacheUser(u);
    setUserState(u);
  }

  useEffect(() => {
    // Runs only on the client, after hydration is complete.
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) { setLoading(false); return; }

    const cached = readCachedUser();
    if (cached) {
      // Show the cached user immediately — no spinner, no network wait.
      setUserState(cached);
      setLoading(false);
      // Silently refresh in the background to pick up any server-side changes.
      getMeFn({ data: {} })
        .then((u) => { if (u) setUser(u); })
        .catch(() => {
          // Token invalid — sign out.
          localStorage.removeItem(TOKEN_KEY);
          cacheUser(null);
          setUserState(null);
        });
    } else {
      // No cache — must hit the network (first login on this device).
      getMeFn({ data: {} })
        .then((u) => { setUser(u ?? null); })
        .catch(() => {
          localStorage.removeItem(TOKEN_KEY);
          cacheUser(null);
          setUserState(null);
        })
        .finally(() => setLoading(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function signOut() {
    localStorage.removeItem(TOKEN_KEY);
    cacheUser(null);
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
