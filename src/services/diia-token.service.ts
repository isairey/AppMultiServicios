import jwt from 'jsonwebtoken';
import { isDiiaMockMode } from '../config/diia-mock';

export type DiiaIdentityClaims = {
  diia_id: string;
  full_name: string;
};

/**
 * Decodes/verifies the token issued by Diia (or mock) after the user completes the flow.
 * Production: replace HS256 mock verification with Diia JWKS / RS256 as per official docs.
 */
export function parseDiiaToken(token: string): DiiaIdentityClaims {
  const useMock = isDiiaMockMode();

  if (useMock) {
    const secret = process.env.DIIA_MOCK_SECRET || 'dev-diia-mock-change-me';
    const decoded = jwt.verify(token, secret, {
      algorithms: ['HS256'],
    }) as jwt.JwtPayload;

    const diia_id = (decoded.sub as string) || (decoded.diia_id as string);
    const full_name =
      (decoded.full_name as string) ||
      (decoded.name as string) ||
      (decoded.given_name as string);

    if (!diia_id || !full_name) {
      throw new Error('Mock Diia token missing sub/diia_id or full_name');
    }
    return { diia_id, full_name };
  }

  // Non-mock: placeholder — verify with Diia public key / JWKS when keys are configured.
  const pem = process.env.DIIA_JWT_PUBLIC_KEY_PEM;
  if (!pem) {
    throw new Error('DIIA_JWT_PUBLIC_KEY_PEM is required when USE_DIIA_MOCK is not true');
  }
  const decoded = jwt.verify(token, pem, {
    algorithms: ['RS256'],
  }) as jwt.JwtPayload;

  const diia_id = (decoded.sub as string) || (decoded.diia_id as string);
  const full_name =
    (decoded.full_name as string) ||
    (decoded.name as string) ||
    '';

  if (!diia_id || !full_name) {
    throw new Error('Diia token missing identity claims');
  }
  return { diia_id, full_name };
}

/**
 * Issues a short-lived token that mimics what Diia would send to our callback (mock only).
 */
export function signMockDiiaToken(claims: {
  sub: string;
  full_name: string;
}): string {
  const secret = process.env.DIIA_MOCK_SECRET || 'dev-diia-mock-change-me';
  return jwt.sign(
    { full_name: claims.full_name },
    secret,
    {
      subject: claims.sub,
      expiresIn: '5m',
      algorithm: 'HS256',
    }
  );
}
