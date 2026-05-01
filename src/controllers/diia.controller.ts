import { randomBytes } from 'crypto';
import { Router, type Request, type Response } from 'express';
import { isDiiaMockMode } from '../config/diia-mock';
import { findOrCreateUserByDiia } from '../repositories/user.repository';
import { parseDiiaToken, signMockDiiaToken } from '../services/diia-token.service';
import { signSessionToken } from '../utils/session-jwt';

/**
 * Diia OAuth-style entrypoints (mock or real).
 *
 * Frontend flow:
 * 1) GET /auth/diia/connect → open authUrl (or show QR target URL).
 * 2) After Diia completes, your app receives `token` (from redirect/deep link or mobile SDK).
 * 3) POST /auth/diia/callback with JSON { "token": "<diia_token>" }.
 * 4) Store returned `accessToken` (JWT) for Authorization: Bearer ...
 */
export const diiaRouter = Router();

const MOCK_QR_BASE = 'https://mock.diia.gov.ua/qr';

diiaRouter.get('/connect', (_req: Request, res: Response) => {
  const state = randomBytes(24).toString('hex');
  const useMock = isDiiaMockMode();
  const port = process.env.PORT || '8080';
  const publicUrl = process.env.PUBLIC_APP_URL || `http://localhost:${port}`;

  const authUrl = `${MOCK_QR_BASE}?client=prostir&state=${encodeURIComponent(state)}&return=${encodeURIComponent(
    `${publicUrl}/auth/diia/callback`
  )}`;

  const body: Record<string, unknown> = {
    authUrl,
    state,
    expiresIn: 300,
    mode: useMock ? 'mock' : 'live',
  };

  if (useMock) {
    const mockSub = process.env.DIIA_MOCK_SUB || 'UA-DIIA-MOCK-0001';
    const mockName = process.env.DIIA_MOCK_FULL_NAME || 'Тестовий Користувач Дія';
    body.mockDiiaToken = signMockDiiaToken({ sub: mockSub, full_name: mockName });
    body.hint =
      'Send this mockDiiaToken in POST /auth/diia/callback as { "token": "<mockDiiaToken>" }, or { "simulate": true } for a canned identity.';
  }

  return res.json(body);
});

diiaRouter.post('/callback', async (req: Request, res: Response) => {
  try {
    const useMock = isDiiaMockMode();
    const body = req.body as { token?: string; simulate?: boolean };

    let diia_id: string;
    let full_name: string;

    if (useMock && body.simulate === true && !body.token) {
      diia_id = process.env.DIIA_MOCK_SUB || 'UA-DIIA-MOCK-0001';
      full_name = process.env.DIIA_MOCK_FULL_NAME || 'Тестовий Користувач Дія';
    } else if (typeof body.token === 'string' && body.token.length > 0) {
      const claims = parseDiiaToken(body.token);
      diia_id = claims.diia_id;
      full_name = claims.full_name;
    } else {
      return res.status(400).json({
        error: 'token is required (or use { "simulate": true } when USE_DIIA_MOCK=true)',
      });
    }

    const user = await findOrCreateUserByDiia({
      diia_id,
      full_name,
      is_verified: true,
    });

    const accessToken = signSessionToken(user.id, user.diia_id);

    return res.json({
      accessToken,
      tokenType: 'Bearer',
      expiresIn: 60 * 60 * 24 * 7,
      user: {
        id: user.id,
        diia_id: user.diia_id,
        full_name: user.full_name,
        is_verified: user.is_verified,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Diia callback failed';
    return res.status(401).json({ error: message });
  }
});
