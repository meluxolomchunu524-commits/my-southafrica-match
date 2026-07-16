import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getMeFn, type AuthUser } from '@/api/auth-fns';

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
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('lc_token') : null;
    if (!token) { setLoading(false); return; }
    getMeFn({ data: {} })
      .then((u) => { setUser(u); setLoading(false); })
      .catch(() => { localStorage.removeItem('lc_token'); setLoading(false); });
  }, []);

  function signOut() {
    localStorage.removeItem('lc_token');
    setUser(null);
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
