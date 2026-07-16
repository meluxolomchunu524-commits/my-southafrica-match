import jwt from 'jsonwebtoken';

const SECRET = process.env.SESSION_SECRET ?? 'loveconnect-dev-secret';

export type TokenPayload = { sub: string; email: string };

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: '30d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function tokenFromRequest(req: Request | null): string | null {
  if (!req) return null;
  const auth = req.headers.get('authorization') ?? req.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  return auth.slice(7);
}
