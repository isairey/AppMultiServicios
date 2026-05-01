import { randomUUID } from 'crypto';
import { getPool, hasDatabase } from '../db/pool';
import type { User } from '../models/user.model';

/** In-memory users when DATABASE_URL is not set (local Diia mock without Postgres). */
const memoryByDiiaId = new Map<string, User>();

function mapRow(row: Record<string, unknown>): User {
  return {
    id: String(row.id),
    diia_id: String(row.diia_id),
    full_name: String(row.full_name),
    is_verified: Boolean(row.is_verified),
    created_at: row.created_at as Date,
    updated_at: row.updated_at as Date,
  };
}

export async function findUserByDiiaId(diiaId: string): Promise<User | null> {
  if (!hasDatabase()) {
    return memoryByDiiaId.get(diiaId) ?? null;
  }
  const res = await getPool().query(
    `SELECT id, diia_id, full_name, is_verified, created_at, updated_at
     FROM users WHERE diia_id = $1 LIMIT 1`,
    [diiaId]
  );
  if (!res.rows[0]) return null;
  return mapRow(res.rows[0] as Record<string, unknown>);
}

export async function createUser(input: {
  diia_id: string;
  full_name: string;
  is_verified: boolean;
}): Promise<User> {
  if (!hasDatabase()) {
    const now = new Date();
    const u: User = {
      id: randomUUID(),
      diia_id: input.diia_id,
      full_name: input.full_name,
      is_verified: input.is_verified,
      created_at: now,
      updated_at: now,
    };
    memoryByDiiaId.set(input.diia_id, u);
    return u;
  }
  const res = await getPool().query(
    `INSERT INTO users (diia_id, full_name, is_verified)
     VALUES ($1, $2, $3)
     RETURNING id, diia_id, full_name, is_verified, created_at, updated_at`,
    [input.diia_id, input.full_name, input.is_verified]
  );
  return mapRow(res.rows[0] as Record<string, unknown>);
}

export async function findOrCreateUserByDiia(input: {
  diia_id: string;
  full_name: string;
  is_verified: boolean;
}): Promise<User> {
  if (!hasDatabase()) {
    const existing = memoryByDiiaId.get(input.diia_id);
    if (existing) {
      const u: User = {
        ...existing,
        full_name: input.full_name,
        is_verified: input.is_verified,
        updated_at: new Date(),
      };
      memoryByDiiaId.set(input.diia_id, u);
      return u;
    }
    return createUser(input);
  }

  const existing = await findUserByDiiaId(input.diia_id);
  if (existing) {
    const pool = getPool();
    const res = await pool.query(
      `UPDATE users
       SET full_name = $2, is_verified = $3, updated_at = now()
       WHERE diia_id = $1
       RETURNING id, diia_id, full_name, is_verified, created_at, updated_at`,
      [input.diia_id, input.full_name, input.is_verified]
    );
    return mapRow(res.rows[0] as Record<string, unknown>);
  }
  return createUser(input);
}
