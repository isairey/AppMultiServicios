import { Router } from 'express';
import type { LeadStatus } from '@prisma/client';
import { listLeads, getLead, updateLead } from '../services/lead.service';
import { getPrisma } from '../lib/prisma';
import { subscribeLeadEvents } from '../services/lead-broadcast';

export const leadsAdminRouter = Router();

/** Public: header Live / Maintenance pill (no secret). */
leadsAdminRouter.get('/panel-status', (_req, res) => {
  const mode =
    process.env.ADMIN_PANEL_MODE === 'maintenance' ? 'maintenance' : 'live';
  res.json({ mode });
});

function adminToken(req: { header: (n: string) => string | undefined }): string | undefined {
  const h = req.header('x-admin-token') || req.header('authorization');
  if (h?.toLowerCase().startsWith('bearer ')) {
    return h.slice(7).trim();
  }
  return req.header('x-admin-token')?.trim();
}

function requireAdmin(
  req: { header: (n: string) => string | undefined },
  res: { status: (n: number) => { json: (b: unknown) => void } }
): boolean {
  const secret = process.env.ADMIN_LEADS_SECRET;
  if (!secret) {
    res.status(503).json({ ok: false, error: 'ADMIN_LEADS_SECRET is not configured.' });
    return false;
  }
  const token = adminToken(req);
  if (!token || token !== secret) {
    res.status(401).json({ ok: false, error: 'Unauthorized' });
    return false;
  }
  return true;
}

/** Query ?token= for EventSource (no custom headers). */
function requireAdminQuery(
  req: { query: Record<string, unknown> },
  res: { status: (n: number) => { json: (b: unknown) => void } }
): boolean {
  const secret = process.env.ADMIN_LEADS_SECRET;
  if (!secret) {
    res.status(503).json({ ok: false, error: 'ADMIN_LEADS_SECRET is not configured.' });
    return false;
  }
  const token = typeof req.query.token === 'string' ? req.query.token : '';
  if (!token || token !== secret) {
    res.status(401).json({ ok: false, error: 'Unauthorized' });
    return false;
  }
  return true;
}

leadsAdminRouter.get('/leads', (req, res) => {
  if (!requireAdmin(req, res)) return;
  if (!getPrisma()) {
    res.status(503).json({ ok: false, error: 'DATABASE_URL is not set.' });
    return;
  }
  void listLeads().then((leads) => {
    res.json({ ok: true, leads });
  });
});

/** Must be registered before `/leads/:id` so `leads-stream` is not captured as an id. */
leadsAdminRouter.get('/leads-stream', (req, res) => {
  if (!requireAdminQuery(req, res)) return;

  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  if (typeof res.flushHeaders === 'function') {
    res.flushHeaders();
  }

  const send = (data: unknown) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  send({ type: 'connected', at: new Date().toISOString() });

  const unsub = subscribeLeadEvents((payload) => {
    send(payload);
  });

  const keepAlive = setInterval(() => {
    res.write(': ping\n\n');
  }, 25000);

  req.on('close', () => {
    clearInterval(keepAlive);
    unsub();
  });
});

leadsAdminRouter.get('/leads/:id', (req, res) => {
  if (!requireAdmin(req, res)) return;
  void getLead(req.params.id).then((lead) => {
    if (!lead) {
      res.status(404).json({ ok: false, error: 'Not found' });
      return;
    }
    res.json({ ok: true, lead });
  });
});

const STATUSES: LeadStatus[] = ['NEW', 'CONTACTED', 'PILOT_READY', 'REJECTED'];

leadsAdminRouter.patch('/leads/:id', (req, res) => {
  if (!requireAdmin(req, res)) return;
  const body = (req.body || {}) as { status?: unknown; notes?: unknown };
  let status: LeadStatus | undefined;
  if (body.status !== undefined) {
    if (typeof body.status !== 'string' || !STATUSES.includes(body.status as LeadStatus)) {
      res.status(400).json({ ok: false, error: 'Invalid status' });
      return;
    }
    status = body.status as LeadStatus;
  }
  const notes = typeof body.notes === 'string' ? body.notes : undefined;
  void updateLead(req.params.id, { status, notes }).then((lead) => {
    if (!lead) {
      res.status(404).json({ ok: false, error: 'Not found' });
      return;
    }
    res.json({ ok: true, lead });
  });
});
