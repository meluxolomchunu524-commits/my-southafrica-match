import { createMiddleware } from '@tanstack/react-start';
import { getWebRequest } from '@tanstack/react-start/server';
import { verifyToken } from '@/lib/auth-helpers';

/**
 * Function middleware that:
 *   CLIENT – reads lc_token from localStorage and sends it as Authorization: Bearer <token>
 *   SERVER  – reads the Authorization header, verifies the JWT, and injects userId / userEmail
 *             into the server function context so handlers don't need getWebRequest().
 */
export const attachSupabaseAuth = createMiddleware({ type: 'function' })
  .client(async ({ next }) => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('lc_token') : null;
    return next({
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  })
  .server(async ({ next }) => {
    const request = getWebRequest();
    const auth =
      request?.headers.get('authorization') ??
      request?.headers.get('Authorization') ??
      '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    const payload = token ? verifyToken(token) : null;
    return next({
      context: {
        userId: payload?.sub ?? null,
        userEmail: payload?.email ?? null,
      },
    });
  });
