import { createMiddleware } from '@tanstack/react-start';

// Attaches the session token (stored in localStorage) to every server-function
// call as an Authorization header so server functions can authenticate the user.
export const attachSupabaseAuth = createMiddleware({ type: 'function' }).client(
  async ({ next }) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('lc_token') : null;
    return next({
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
);
