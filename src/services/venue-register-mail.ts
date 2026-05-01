import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export type VenueRegisterPayload = {
  venueName: string;
  city: string;
  contactName: string;
  phone: string;
  menuOrSocialLink: string;
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildVenueRegisterSubject(venueName: string): string {
  const name = venueName.trim() || 'Без назви';
  return `Нова заявка: PROSTIR | ${name}`;
}

export function buildVenueRegisterHtml(p: VenueRegisterPayload): string {
  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.08);font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:13px;color:rgba(255,255,255,0.45);width:38%;vertical-align:top;">${label}</td>
      <td style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.08);font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:14px;color:#f4f4f5;vertical-align:top;">${escapeHtml(value)}</td>
    </tr>`;

  const link = p.menuOrSocialLink.trim();
  const isHttp = /^https?:\/\//i.test(link);
  const linkCell = isHttp
    ? `<a href="${escapeHtml(link)}" style="color:#a78bfa;text-decoration:none;">${escapeHtml(link)}</a>`
    : escapeHtml(link);

  return `<!DOCTYPE html>
<html lang="uk">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;background:#0a0a0c;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:linear-gradient(180deg,#0f0f12 0%,#050508 100%);padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;background:#121214;border:1px solid rgba(139,92,246,0.25);border-radius:16px;overflow:hidden;box-shadow:0 24px 80px rgba(0,0,0,0.55),0 0 40px rgba(139,92,246,0.08);">
        <tr>
          <td style="padding:22px 24px;background:linear-gradient(90deg,rgba(139,92,246,0.15),transparent);border-bottom:1px solid rgba(255,255,255,0.06);">
            <p style="margin:0;font-family:ui-monospace,Menlo,monospace;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#a78bfa;">PROSTIR · заявка закладу</p>
            <h1 style="margin:10px 0 0;font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:20px;font-weight:600;color:#fafafa;">Нова анкета з сайту</h1>
          </td>
        </tr>
        <tr><td style="padding:0;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            ${row('Назва закладу', p.venueName)}
            ${row('Місто', p.city)}
            ${row('Контактна особа', p.contactName)}
            ${row('Телефон', p.phone)}
            <tr>
              <td style="padding:12px 16px;font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:13px;color:rgba(255,255,255,0.45);width:38%;vertical-align:top;">Меню / соцмережі</td>
              <td style="padding:12px 16px;font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:14px;color:#f4f4f5;vertical-align:top;word-break:break-all;">${linkCell}</td>
            </tr>
          </table>
        </td></tr>
        <tr><td style="padding:16px 24px 22px;border-top:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0;font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:12px;color:rgba(255,255,255,0.35);">Надіслано автоматично з форми PROSTIR.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function buildVenueRegisterText(p: VenueRegisterPayload): string {
  return [
    'PROSTIR — нова заявка закладу',
    '',
    `Назва закладу: ${p.venueName}`,
    `Місто: ${p.city}`,
    `Контактна особа: ${p.contactName}`,
    `Телефон: ${p.phone}`,
    `Меню / соцмережі: ${p.menuOrSocialLink}`,
  ].join('\n');
}

export function getVenueMailTransporter(): Transporter | null {
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  if (!user || !pass) return null;

  const host = process.env.SMTP_HOST?.trim() || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 465;
  const secure =
    process.env.SMTP_SECURE === 'false'
      ? false
      : process.env.SMTP_SECURE === 'true' || port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

export function getVenueNotifyTo(): string {
  return (process.env.VENUE_NOTIFY_TO || 'shepytkod@gmail.com').trim();
}

export function getVenueMailFrom(): string {
  const from = process.env.SMTP_FROM?.trim();
  const user = process.env.SMTP_USER?.trim();
  if (from) return from;
  if (user) return `PROSTIR <${user}>`;
  return 'PROSTIR <noreply@prostir.local>';
}
