import type { Lead, LeadStatus } from '@prisma/client';
import { getPrisma } from '../lib/prisma';
import { broadcastLeadEvent } from './lead-broadcast';

export type LeadPublic = {
  id: string;
  createdAt: string;
  restaurantName: string;
  instagramHandle: string;
  contactPerson: string;
  status: LeadStatus;
  notes: string;
};

function toPublic(row: Lead): LeadPublic {
  return {
    id: row.id,
    createdAt: row.createdAt.toISOString(),
    restaurantName: row.restaurantName,
    instagramHandle: row.instagramHandle,
    contactPerson: row.contactPerson,
    status: row.status,
    notes: row.notes,
  };
}

const ALLOWED: LeadStatus[] = ['NEW', 'CONTACTED', 'PILOT_READY', 'REJECTED'];

export async function createLeadFromVenueRegistration(input: {
  venueName: string;
  city: string;
  contactName: string;
  phone: string;
  menuOrSocialLink: string;
}): Promise<LeadPublic | null> {
  const prisma = getPrisma();
  if (!prisma) return null;

  const notes = [`City: ${input.city}`, `Phone: ${input.phone}`].join('\n');

  try {
    const row = await prisma.lead.create({
      data: {
        restaurantName: input.venueName,
        instagramHandle: input.menuOrSocialLink.slice(0, 500),
        contactPerson: input.contactName,
        status: 'NEW',
        notes,
      },
    });
    const lead = toPublic(row);
    broadcastLeadEvent({ type: 'lead_created', lead });
    return lead;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[PROSTIR] Lead create from venue failed:', msg);
    return null;
  }
}

export async function listLeads(): Promise<LeadPublic[]> {
  const prisma = getPrisma();
  if (!prisma) return [];
  const rows = await prisma.lead.findMany({ orderBy: { createdAt: 'desc' } });
  return rows.map(toPublic);
}

export async function getLead(id: string): Promise<LeadPublic | null> {
  const prisma = getPrisma();
  if (!prisma) return null;
  const row = await prisma.lead.findUnique({ where: { id } });
  return row ? toPublic(row) : null;
}

export async function updateLead(
  id: string,
  patch: { status?: LeadStatus; notes?: string }
): Promise<LeadPublic | null> {
  const prisma = getPrisma();
  if (!prisma) return null;

  const data: { status?: LeadStatus; notes?: string } = {};
  if (patch.status !== undefined) {
    if (!ALLOWED.includes(patch.status)) return null;
    data.status = patch.status;
  }
  if (patch.notes !== undefined) {
    data.notes = patch.notes.slice(0, 8000);
  }
  if (Object.keys(data).length === 0) {
    return getLead(id);
  }

  try {
    const row = await prisma.lead.update({ where: { id }, data });
    const lead = toPublic(row);
    broadcastLeadEvent({ type: 'lead_updated', lead });
    return lead;
  } catch {
    return null;
  }
}
