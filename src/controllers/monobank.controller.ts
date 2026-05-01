import crypto from 'crypto';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { emitTableUpdated } from '../realtime/socket';

export const monobankRouter = express.Router();

const DB_PATH = path.join(__dirname, '..', '..', 'db.json');

type DbTable = {
  id: number;
  venueId: string;
  seats: number;
  view: string;
  zone: string;
  status: string;
  orderId?: string;
};

type Db = {
  tables: DbTable[];
  [key: string]: unknown;
};

function readDb(): Db {
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8')) as Db;
}

function writeDb(data: Db): void {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

/**
 * Verify the Monobank webhook X-Sign header.
 * Monobank signs the raw body with their private key (Ed25519).
 * In dev / without a real key we skip verification.
 */
function verifyMonobankSignature(rawBody: Buffer, xSign: string | undefined): boolean {
  const pubKeyPem = process.env.MONOBANK_PUBLIC_KEY_PEM;
  if (!pubKeyPem || process.env.NODE_ENV !== 'production') {
    return true;
  }
  if (!xSign) return false;
  try {
    return crypto.verify(
      null,
      rawBody,
      { key: pubKeyPem, format: 'pem' },
      Buffer.from(xSign, 'base64')
    );
  } catch {
    return false;
  }
}

/**
 * POST /api/webhooks/monobank
 *
 * Monobank sends a webhook when a payment invoice changes state.
 * When status becomes "success" we mark the linked table as "paid"
 * and broadcast TABLE_UPDATED to the venue's Socket.io room.
 *
 * Table → order linkage convention:
 *   Table has `orderId` field matching invoice `reference`.
 *   If no orderId, fall back to matching by tableId stored in `reference`.
 */
monobankRouter.post(
  '/monobank',
  express.raw({ type: 'application/json', limit: '64kb' }),
  (req, res) => {
    const rawBody = req.body as Buffer;
    const xSign = req.headers['x-sign'] as string | undefined;

    if (!verifyMonobankSignature(rawBody, xSign)) {
      return res.status(401).json({ error: 'INVALID_SIGNATURE' });
    }

    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(rawBody.toString('utf-8')) as Record<string, unknown>;
    } catch {
      return res.status(400).json({ error: 'INVALID_JSON' });
    }

    const { status, reference, amount } = payload as {
      status?: string;
      reference?: string;
      amount?: number;
    };

    console.log('[Monobank] webhook received:', { status, reference, amount });

    if (status !== 'success') {
      return res.status(200).json({ ok: true, action: 'noop' });
    }

    const db = readDb();

    let table: DbTable | undefined;

    if (reference) {
      table = db.tables.find((t) => t.orderId === reference);

      if (!table) {
        const refId = parseInt(reference, 10);
        if (Number.isFinite(refId)) {
          table = db.tables.find((t) => t.id === refId);
        }
      }
    }

    if (!table) {
      console.warn('[Monobank] no table matched reference:', reference);
      return res.status(200).json({ ok: true, action: 'no_table_match' });
    }

    table.status = 'paid';
    writeDb(db);

    emitTableUpdated(table.venueId, table.id, 'paid');

    return res.status(200).json({ ok: true, action: 'TABLE_PAID', tableId: table.id });
  }
);
