import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getMeFn, type AuthUser } from '@/api/auth-fns';

const USER_KEY = 'lc_user';
const TOKEN_KEY = 'lc_token';

function readCachedUser(): AuthUser | null {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(USER_KEY) : null;
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
  // Initialise from cache — synchronous, no network, instant render
  const [user, setUserState] = useState<AuthUser | null>(readCachedUser);
  // Only show "loading" spinner if a token exists but we have no cached user yet
  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem(TOKEN_KEY);
  const [loading, setLoading] = useState(hasToken && !readCachedUser());

  function setUser(u: AuthUser | null) {
    cacheUser(u);
    setUserState(u);
  }

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
    if (!token) { setLoading(false); return; }

    // If we already have a cached user, background-refresh silently
    const isSilent = !!readCachedUser();
    if (!isSilent) setLoading(true);

    getMeFn({ data: {} })
      .then((u) => { setUser(u ?? null); })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        cacheUser(null);
        setUserState(null);
      })
      .finally(() => setLoading(false));
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
