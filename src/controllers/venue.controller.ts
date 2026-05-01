import { Router } from 'express';
import {
  buildVenueRegisterHtml,
  buildVenueRegisterSubject,
  buildVenueRegisterText,
  getVenueMailFrom,
  getVenueMailTransporter,
  getVenueNotifyTo,
  type VenueRegisterPayload,
} from '../services/venue-register-mail';
import { createLeadFromVenueRegistration } from '../services/lead.service';

const MAX = 240;
const MAX_LINK = 2000;

function trimStr(v: unknown): string {
  if (v === undefined || v === null) return '';
  return String(v).trim();
}

function validateBody(body: Record<string, unknown>): { ok: true; data: VenueRegisterPayload } | { ok: false; error: string } {
  const venueName = trimStr(body.venueName);
  const city = trimStr(body.city);
  const contactName = trimStr(body.contactName);
  const phone = trimStr(body.phone);
  const menuOrSocialLink = trimStr(body.menuOrSocialLink);

  if (!venueName || !city || !contactName || !phone || !menuOrSocialLink) {
    return { ok: false, error: 'Усі поля обов\'язкові.' };
  }
  if (venueName.length > MAX || city.length > MAX || contactName.length > MAX || phone.length > MAX) {
    return { ok: false, error: 'Занадто довге значення в одному з полів.' };
  }
  if (menuOrSocialLink.length > MAX_LINK) {
    return { ok: false, error: 'Посилання занадто довге.' };
  }

  return {
    ok: true,
    data: { venueName, city, contactName, phone, menuOrSocialLink },
  };
}

export const venueRouter = Router();

venueRouter.post('/register', async (req, res) => {
  const parsed = validateBody((req.body || {}) as Record<string, unknown>);
  if (!parsed.ok) {
    return res.status(400).json({ ok: false, error: parsed.error });
  }

  const transporter = getVenueMailTransporter();
  if (!transporter) {
    console.error('[PROSTIR] Venue register: SMTP не налаштовано (SMTP_USER / SMTP_PASS).');
    return res.status(503).json({
      ok: false,
      error:
        'Сервіс листів тимчасово недоступний. Спробуйте пізніше або напишіть нам напряму.',
    });
  }

  const to = getVenueNotifyTo();
  const from = getVenueMailFrom();
  const subject = buildVenueRegisterSubject(parsed.data.venueName);
  const html = buildVenueRegisterHtml(parsed.data);
  const text = buildVenueRegisterText(parsed.data);

  try {
    await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
    });
    void createLeadFromVenueRegistration(parsed.data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[PROSTIR] Venue register: не вдалося надіслати лист:', msg);
    return res.status(502).json({
      ok: false,
      error:
        'Не вдалося надіслати заявку. Перевірте з\'єднання або спробуйте ще раз за кілька хвилин.',
    });
  }

  return res.status(200).json({ ok: true, message: 'Заявку надіслано.' });
});
