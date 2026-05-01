import jwt from 'jsonwebtoken';

const ISS = 'prostir';
const AUD = 'prostir-web';

export type SessionPayload = {
  sub: string;
  diia_id: string;
};

const DEV_FALLBACK_SECRET = 'dev-prostir-jwt-only-not-for-production';

export function signSessionToken(userId: string, diiaId: string, ttl: jwt.SignOptions['expiresIn'] = '7d'): string {
  let secret = process.env.SESSION_JWT_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SESSION_JWT_SECRET or JWT_SECRET must be set');
    }
    secret = DEV_FALLBACK_SECRET;
  }
  const options: jwt.SignOptions = {
    issuer: ISS,
    audience: AUD,
    expiresIn: ttl,
    algorithm: 'HS256',
  };
  return jwt.sign({ sub: userId, diia_id: diiaId }, secret, options);
}

export function verifySessionToken(token: string): SessionPayload {
  let secret = process.env.SESSION_JWT_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SESSION_JWT_SECRET or JWT_SECRET must be set');
    }
    secret = DEV_FALLBACK_SECRET;
  }
  const decoded = jwt.verify(token, secret, {
    issuer: ISS,
    audience: AUD,
    algorithms: ['HS256'],
  }) as jwt.JwtPayload;
  const sub = decoded.sub;
  const diia_id = decoded.diia_id;
  if (!sub || typeof diia_id !== 'string') {
    throw new Error('Invalid session token payload');
  }
  return { sub, diia_id };
}
