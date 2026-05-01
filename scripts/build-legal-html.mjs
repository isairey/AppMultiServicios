#!/usr/bin/env node
/**
 * .offer_extract.txt (from PROSTIR_Публічна_Оферта.docx) → public/legal.html
 * Cyber-Noir TUI command center header, > list markers, split table, full text.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const src =
  process.env.PROSTIR_OFFER_TXT?.trim() || path.join(root, '.offer_extract.txt');
const out = path.join(root, 'public', 'legal.html');

if (!fs.existsSync(src)) {
  console.error(
    'Missing offer text. Run: textutil -convert txt -stdout "/path/PROSTIR_Публічна_Оферта.docx" > .offer_extract.txt'
  );
  process.exit(1);
}

const raw = fs.readFileSync(src, 'utf8');
const lines = raw.split(/\n/);

const ZAKON_PAY = 'https://zakon.rada.gov.ua/laws/show/1591-20#n11';

/** Section titles aligned with PROSTIR_Публічна_Оферта.docx (document headings). */
const SECTIONS = [
  { id: 's1', n: 1, title: '1. ВИЗНАЧЕННЯ ТЕРМІНІВ', shell: 'Definitions' },
  { id: 's2', n: 2, title: '2. ПРЕДМЕТ ДОГОВОРУ', shell: 'Subject' },
  { id: 's3', n: 3, title: '3. ПОРЯДОК НАДАННЯ ТЕХНОЛОГІЧНИХ ПОСЛУГ', shell: 'Services' },
  { id: 's4', n: 4, title: '4. ВАРТІСТЬ ПОСЛУГ ТА ПОРЯДОК РОЗРАХУНКІВ', shell: 'FEES' },
  { id: 's5', n: 5, title: "5. ПРАВА ТА ОБОВ'ЯЗКИ СТОРІН", shell: 'Rights' },
  { id: 's6', n: 6, title: '6. ВИРІШЕННЯ СПОРІВ ТА ВІДПОВІДАЛЬНІСТЬ', shell: 'Disputes' },
  { id: 's7', n: 7, title: '7. ТЕРМІН ДІЇ ОФЕРТИ ТА ПОРЯДОК АКЦЕПТУ', shell: 'Accept' },
  { id: 's8', n: 8, title: '8. КОНФІДЕНЦІЙНІСТЬ ТА ЗАХИСТ ДАНИХ', shell: 'Privacy' },
  { id: 's9', n: 9, title: '9. ПОВЕРНЕННЯ КОШТІВ', shell: 'Refunds' },
  { id: 's10', n: 10, title: '10. ПРИКІНЦЕВІ ПОЛОЖЕННЯ', shell: 'Final' },
  { id: 's11', n: 11, title: '11. РЕКВІЗИТИ ВИКОНАВЦЯ', shell: 'Registry' },
];

function esc(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function stripSectionNumber(title) {
  return title.replace(/^(10|[1-9])\.\s+/, '');
}

const shellBarHtml = SECTIONS.map((s, i) => {
  const active = i === 0 ? ' legal-shell-cell--active' : '';
  const cur = i === 0 ? ' aria-current="true"' : '';
  return `        <a class="legal-shell-cell${active}" href="#${s.id}" data-shell="${s.n}"${cur}><span class="legal-shell-cell__n">[ ${String(s.n).padStart(2, '0')} ]</span><span class="legal-shell-cell__t">${esc(s.shell)}</span></a>`;
}).join('\n');

const sectionMetaJson = JSON.stringify(
  SECTIONS.map((s) => ({ id: s.id, n: s.n, title: s.title }))
);

function isMainSection(line) {
  return /^(10|[1-9])\.\s+[А-ЯІЇЄҐA-Z]/.test(line.trim());
}

function isSubSection(line) {
  return /^\d+\.\d+\.\s/.test(line.trim());
}

function isBullet(line) {
  return /^\t*•\t/.test(line) || line.trimStart().startsWith('•');
}

function stripBullet(line) {
  return line.replace(/^\t*•\t*/, '').trim();
}

function linkify1591(html) {
  return html.replace(
    /№\s*1591-IX/g,
    `<a class="legal-zakon-ref" href="${ZAKON_PAY}" target="_blank" rel="noopener noreferrer">№ 1591-IX</a>`
  );
}

function merchantSplitTable() {
  return `      <div class="legal-split-wrap" id="split-payment-overview">
        <p class="legal-split-caption legal-split-caption--en">split_payment · margin · total 100%</p>
        <div class="legal-split-table-outer">
        <table class="legal-split-table" role="table" aria-label="Розподіл: частки учасників (100%)" tabindex="0">
          <thead>
            <tr>
              <th scope="col">Participant</th>
              <th scope="col" class="legal-split-col-share">Share %</th>
              <th scope="col">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Restaurant (Partner)</td>
              <td class="legal-split-mono">96.5%</td>
              <td>Net revenue after fees</td>
            </tr>
            <tr>
              <td>PROSTIR Platform</td>
              <td class="legal-split-mono">2.0%</td>
              <td>Technology service fee</td>
            </tr>
            <tr>
              <td>Acquiring Bank (Mono)</td>
              <td class="legal-split-mono">1.5%</td>
              <td>Standard bank processing fee</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="legal-split-total">
              <th scope="row">Total</th>
              <td class="legal-split-mono">100%</td>
              <td>All participant shares sum to the transaction amount.</td>
            </tr>
          </tfoot>
        </table>
        </div>
        <p class="legal-split-note">Partner 96.5% / PROSTIR 2.0% / Acquiring 1.5% — licensed PSP executes settlement; PROSTIR supplies integration technology only.</p>
        <p class="legal-split-footnote">Bank fee is subject to monobank's current tariffs for legal entities.</p>
      </div>\n`;
}

const pre = [];
let i = 0;
while (i < lines.length && !isMainSection(lines[i])) {
  const L = lines[i];
  if (L.trim() === '' && pre.length) {
    i++;
    continue;
  }
  if (L.trim() === '') {
    i++;
    continue;
  }
  pre.push(L);
  i++;
}

const docStart = pre.findIndex((x) => x.trim().startsWith('Цей документ'));
const frontLines =
  docStart > 0 ? pre.slice(0, docStart).filter((x) => x.trim()) : [];
const preBody = docStart >= 0 ? pre.slice(docStart) : pre;

const frontMatterHtml = frontLines
  .map(
    (line) =>
      `    <p class="legal-doc-front">${linkify1591(esc(line.trim()))}</p>\n`
  )
  .join('');

const shellHead = `<!DOCTYPE html>
<html lang="uk" class="legal-scroll-root">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta name="description" content="Публічна оферта PROSTIR — повний текст."/>
  <title>PROSTIR — Публічна оферта</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
  <style>
    :root {
      --bg: #000000;
      --fg: #ffffff;
      --fg-soft: rgba(255, 255, 255, 0.82);
      --fg-dim: rgba(255, 255, 255, 0.5);
      --tui-gray: #444444;
      --line: rgba(255, 255, 255, 0.1);
      --violet: #7c3aed;
      --violet-alt: #8b5cf6;
      --violet-glow: rgba(124, 58, 237, 0.5);
      --mono: 'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, Monaco, Consolas, monospace;
      --sans: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', system-ui, sans-serif;
    }

    *, *::before, *::after { box-sizing: border-box; }
    html.legal-scroll-root {
      scroll-behavior: smooth;
      scroll-padding-top: 2rem;
    }

    body.legal-noir {
      margin: 0;
      min-height: 100vh;
      background: var(--bg);
      color: var(--fg-soft);
      font-family: var(--sans);
      font-size: 1.02rem;
      line-height: 1.78;
      -webkit-font-smoothing: antialiased;
    }

    .legal-grain {
      position: fixed;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      opacity: 0.028;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
      background-size: 300px 300px;
    }

    .legal-shell {
      position: relative;
      z-index: 1;
      max-width: 800px;
      margin: 0 auto;
      padding: 1.65rem clamp(1rem, 4vw, 1.75rem) 0;
    }

    .legal-shell-panel {
      border: none;
      padding: 0 0 2rem;
      margin-bottom: 0.25rem;
      background: transparent;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
    .legal-shell-panel::-webkit-scrollbar { display: none; width: 0; height: 0; }

    .legal-shell-top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1.25rem;
      padding-bottom: 0.85rem;
      margin-bottom: 0;
    }

    .legal-shell-brand {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.4rem;
      min-width: 0;
    }

    .text-violet-500 {
      color: #8b5cf6;
    }

    .legal-os-logo {
      font-size: 1.02rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      text-decoration: none;
      color: var(--fg);
      font-family: var(--mono);
      line-height: 1.2;
    }
    .legal-os-logo .text-violet-500 {
      text-shadow: 0 0 16px rgba(139, 92, 246, 0.55), 0 0 32px rgba(124, 58, 237, 0.28);
    }

    .legal-status-bar {
      font-family: var(--mono);
      font-size: 0.54rem;
      letter-spacing: 0.1em;
      color: var(--tui-gray);
      line-height: 1.5;
      margin: 0;
    }
    .legal-status-bar .legal-status-w {
      color: rgba(255, 255, 255, 0.45);
    }

    .legal-shell-bar {
      display: grid;
      grid-template-columns: repeat(6, minmax(0, 1fr));
      gap: 0.25rem 0.45rem;
      padding: 0.65rem 0 1.5rem;
      align-items: start;
    }
    @media (max-width: 720px) {
      .legal-shell-bar { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    }
    @media (max-width: 400px) {
      .legal-shell-bar { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }

    .legal-shell-cell {
      text-decoration: none;
      color: inherit;
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      padding: 0.35rem 0.25rem;
      min-width: 0;
      border: none;
      background: transparent;
      text-align: left;
      cursor: pointer;
      transition: opacity 0.15s;
    }
    .legal-shell-cell:hover .legal-shell-cell__t {
      color: rgba(255, 255, 255, 0.88);
    }
    .legal-shell-cell__n {
      font-family: var(--mono);
      font-size: 0.52rem;
      font-weight: 600;
      letter-spacing: 0.06em;
      color: var(--tui-gray);
      line-height: 1.35;
    }
    .legal-shell-cell--active .legal-shell-cell__n {
      color: #c4b5fd;
      text-shadow:
        0 0 10px rgba(139, 92, 246, 0.95),
        0 0 22px rgba(124, 58, 237, 0.55),
        0 0 36px rgba(91, 33, 182, 0.35);
    }
    .legal-shell-cell__t {
      font-family: var(--mono);
      font-size: 0.5rem;
      font-weight: 500;
      letter-spacing: 0.05em;
      text-transform: none;
      color: rgba(255, 255, 255, 0.42);
      line-height: 1.25;
    }
    .legal-shell-cell:focus-visible {
      outline: 1px solid var(--violet-alt);
      outline-offset: 2px;
    }

    .legal-print-btn {
      font-family: var(--mono);
      font-size: 0.54rem;
      font-weight: 600;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.38);
      background: transparent;
      border: none;
      padding: 0.5rem 0.15rem;
      cursor: pointer;
      flex-shrink: 0;
      align-self: flex-start;
      transition: color 0.15s, text-shadow 0.15s;
    }
    .legal-print-btn:hover {
      color: rgba(255, 255, 255, 0.92);
      text-shadow: 0 0 16px rgba(124, 58, 237, 0.35);
    }
    .legal-print-btn:focus-visible {
      outline: 1px solid var(--violet-alt);
      outline-offset: 3px;
    }

    .legal-main {
      position: relative;
      z-index: 1;
      padding-bottom: 3rem;
    }

    .legal-wrap {
      max-width: 800px;
      margin: 0 auto;
      padding: 0 clamp(1rem, 4vw, 1.5rem) 2.5rem;
    }

    .legal-doc-front {
      font-family: var(--mono);
      font-size: 0.65rem;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      text-align: center;
      color: var(--fg-dim);
      margin: 0 0 0.4rem;
    }
    .legal-doc-front:first-of-type {
      font-size: 0.74rem;
      letter-spacing: 0.24em;
      color: var(--fg-soft);
      margin-top: 0.15rem;
    }

    .legal-meta {
      font-family: var(--mono);
      font-size: 0.58rem;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      text-align: center;
      color: var(--fg-dim);
      margin: 1.5rem 0 0.85rem;
    }

    .legal-h1 {
      font-family: var(--mono);
      font-size: clamp(0.78rem, 2vw, 0.9rem);
      font-weight: 700;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      text-align: center;
      margin: 0 0 0.55rem;
      color: var(--fg);
    }
    .legal-sub {
      text-align: center;
      color: var(--fg-dim);
      font-size: 0.92rem;
      margin: 0 0 1.65rem;
      line-height: 1.65;
    }

    .legal-law {
      display: block;
      margin: 0 0 1.85rem;
      padding: 1rem 1.05rem;
      border: 1px solid var(--line);
      background: rgba(255, 255, 255, 0.02);
      text-decoration: none;
      color: inherit;
      transition: border-color 0.15s;
    }
    .legal-law:hover {
      border-color: rgba(139, 92, 246, 0.35);
    }
    .legal-law__k {
      font-family: var(--mono);
      font-size: 0.54rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--fg-dim);
      margin-bottom: 0.35rem;
    }
    .legal-law__t { font-weight: 600; font-size: 0.98rem; color: var(--fg); }
    .legal-law__u {
      font-family: var(--mono);
      font-size: 0.64rem;
      color: var(--fg-dim);
      margin-top: 0.45rem;
      word-break: break-all;
    }

    .legal-p { margin: 0 0 1.05rem; color: var(--fg-soft); }

    a.legal-zakon-ref {
      color: var(--fg);
      text-decoration: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.35);
      box-shadow: 0 0 18px rgba(255, 255, 255, 0.08);
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    a.legal-zakon-ref:hover {
      border-bottom-color: rgba(139, 92, 246, 0.55);
      box-shadow: 0 0 22px rgba(139, 92, 246, 0.18);
    }

    .legal-wrap a:not(.legal-law):not(.legal-os-logo):not(.legal-shell-cell):not(.legal-foot a):not(.legal-endnote a) {
      color: var(--fg-soft);
      text-decoration: underline;
      text-underline-offset: 3px;
      text-decoration-color: rgba(255, 255, 255, 0.35);
    }
    .legal-wrap a:not(.legal-law):not(.legal-os-logo):not(.legal-shell-cell):not(.legal-foot a):not(.legal-endnote a):hover {
      color: var(--fg);
      text-decoration-color: rgba(255, 255, 255, 0.55);
    }

    .legal-section {
      margin-top: 2.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--line);
    }
    .legal-section h2 {
      font-family: var(--mono);
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.11em;
      text-transform: uppercase;
      margin: 0 0 1.05rem;
      padding-bottom: 0.55rem;
      border-bottom: 1px solid var(--line);
      color: var(--fg);
    }
    .legal-section h3 {
      font-family: var(--mono);
      font-size: 0.6rem;
      font-weight: 600;
      letter-spacing: 0.09em;
      text-transform: uppercase;
      margin: 1.15rem 0 0.7rem;
      color: var(--fg-dim);
    }

    .legal-list { margin: 0 0 1.15rem; }
    .legal-li {
      display: flex;
      gap: 0.65rem;
      align-items: flex-start;
      margin: 0 0 0.5rem;
      padding: 0;
      line-height: 1.72;
      color: var(--fg-soft);
    }
    .legal-li__m {
      flex: 0 0 0.85rem;
      font-family: var(--mono);
      font-size: 0.72rem;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.35);
      line-height: 1.72;
      user-select: none;
    }
    .legal-li__t { flex: 1; min-width: 0; }

    .legal-def {
      position: relative;
      margin: 0 0 0.9rem;
      line-height: 1.75;
      padding-left: 1rem;
      border: none;
      color: var(--fg-soft);
    }
    .legal-def::before {
      content: '~';
      position: absolute;
      left: 0;
      top: 0.05em;
      font-family: var(--mono);
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.32);
      user-select: none;
    }
    .legal-def strong { font-weight: 600; color: var(--fg); }

    .legal-split-wrap { margin: 1.2rem 0 1.6rem; }
    .legal-split-caption--en {
      font-family: var(--mono);
      font-size: 0.6rem;
      letter-spacing: 0.08em;
      text-transform: lowercase;
      color: var(--fg-dim);
      margin: 0 0 0.85rem;
    }
    .legal-split-note {
      font-family: var(--mono);
      font-size: 0.68rem;
      line-height: 1.65;
      color: var(--fg-dim);
      margin: 1rem 0 0;
    }

    .legal-split-footnote {
      font-family: var(--mono);
      font-size: 0.6rem;
      line-height: 1.55;
      color: rgba(255, 255, 255, 0.38);
      margin: 0.65rem 0 0;
      letter-spacing: 0.02em;
    }

    .legal-split-table-outer {
      border: none;
      border-radius: 3px;
      padding: 2px;
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.12), rgba(124, 58, 237, 0.04) 45%, transparent 65%);
      filter:
        drop-shadow(0 0 32px rgba(139, 92, 246, 0.45))
        drop-shadow(0 0 64px rgba(91, 33, 182, 0.2))
        drop-shadow(0 16px 48px rgba(0, 0, 0, 0.55));
    }

    .legal-split-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.86rem;
      background: var(--bg);
    }
    .legal-split-table:focus-visible {
      outline: 1px solid var(--violet);
      outline-offset: 4px;
    }
    .legal-split-table th,
    .legal-split-table td {
      padding: 0.75rem 0.85rem;
      text-align: left;
      vertical-align: top;
      border-bottom: 1px solid var(--line);
    }
    .legal-split-table tbody tr {
      transition: background 0.15s ease;
    }
    .legal-split-table tbody tr:hover {
      background: rgba(255, 255, 255, 0.04);
    }
    .legal-split-table thead th {
      font-family: var(--mono);
      font-size: 0.56rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--fg-dim);
      border-bottom: 1px solid rgba(139, 92, 246, 0.25);
    }
    .legal-split-col-share {
      width: 6.5rem;
      text-align: right;
    }
    .legal-split-mono {
      font-family: var(--mono);
      font-weight: 700;
      font-size: 0.9rem;
      letter-spacing: 0.03em;
      color: var(--fg);
      text-align: right;
      white-space: nowrap;
    }
    .legal-split-table tbody tr:last-child td {
      border-bottom: 1px solid rgba(139, 92, 246, 0.2);
    }

    .legal-split-table tfoot tr.legal-split-total th,
    .legal-split-table tfoot tr.legal-split-total td {
      font-family: var(--mono);
      font-size: 0.78rem;
      padding-top: 0.95rem;
      padding-bottom: 0.85rem;
      border-bottom: none;
      color: var(--fg);
    }
    .legal-split-table tfoot tr.legal-split-total th {
      text-transform: uppercase;
      letter-spacing: 0.12em;
      font-size: 0.58rem;
      color: var(--violet-alt);
    }

    .legal-req {
      margin-top: 0.75rem;
      border: 1px solid var(--line);
      padding: 0.85rem 0.75rem;
      background: rgba(255, 255, 255, 0.015);
    }

    .legal-endnote {
      margin-top: 2.75rem;
      padding-top: 1.35rem;
      border-top: 1px solid var(--line);
      text-align: center;
      font-family: var(--mono);
      font-size: 0.6rem;
      letter-spacing: 0.1em;
      color: var(--fg-dim);
    }
    .legal-endnote a {
      color: var(--fg-soft);
      text-decoration: none;
      border-bottom: 1px solid var(--line);
    }
    .legal-endnote a:hover { color: var(--fg); border-bottom-color: var(--fg-dim); }

    .legal-foot {
      margin-top: 0;
      padding: 2.25rem clamp(1rem, 4vw, 1.5rem) 3rem;
      border-top: 1px solid var(--line);
      background: #000;
      position: relative;
      z-index: 1;
    }
    .legal-foot-inner { max-width: 800px; margin: 0 auto; }

    .legal-sys-banner {
      font-family: var(--mono);
      font-size: 0.58rem;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--fg-dim);
      margin: 0 0 1rem;
    }

    .legal-foot__logo {
      font-size: 1rem;
      font-weight: 700;
      letter-spacing: -0.03em;
      text-decoration: none;
      color: var(--fg);
      display: inline-block;
      margin-bottom: 1.25rem;
      font-family: var(--mono);
    }
    .legal-foot__logo .text-violet-500 {
      text-shadow: 0 0 12px rgba(139, 92, 246, 0.45);
    }
    .legal-foot__logo .legal-foot-rest { color: rgba(255, 255, 255, 0.42); }

    .legal-sys-block {
      font-family: var(--mono);
      font-size: 0.72rem;
      line-height: 1.85;
      color: var(--fg-soft);
      border: 1px solid var(--line);
      padding: 1rem 1rem 1rem 0.85rem;
      background: rgba(255, 255, 255, 0.02);
    }
    .legal-sys-line {
      margin: 0;
      padding: 0.15rem 0;
      display: flex;
      gap: 0.65rem;
      align-items: baseline;
    }
    .legal-sys-line__m {
      flex: 0 0 1rem;
      color: var(--fg-dim);
      user-select: none;
    }
    .legal-sys-line__k {
      flex: 0 0 11.5rem;
      color: var(--fg-dim);
      font-size: 0.62rem;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .legal-sys-line__v { flex: 1; min-width: 0; color: var(--fg-soft); }
    @media (max-width: 560px) {
      .legal-sys-line { flex-wrap: wrap; }
      .legal-sys-line__k { flex: 1 1 100%; }
    }

    .legal-foot-copy {
      font-family: var(--mono);
      font-size: 0.55rem;
      color: var(--fg-dim);
      letter-spacing: 0.08em;
      margin: 1.25rem 0 0;
    }

    @media print {
      .legal-grain, .legal-print-btn, .legal-shell { display: none !important; }
      body.legal-noir { background: #fff; color: #111; }
      .legal-law, .legal-split-table-outer, .legal-sys-block, .legal-req { border-color: #ccc; }
      .legal-p, .legal-li, .legal-def, .legal-sys-line__v { color: #222; }
      .legal-section h2 { color: #000; }
      a.legal-zakon-ref { color: #000; box-shadow: none; }
      .legal-split-table-outer { filter: none; }
    }
  </style>
</head>
<body class="legal-noir">
<div class="legal-grain" aria-hidden="true"></div>

<div class="legal-shell">
  <header class="legal-shell-panel" aria-label="PROSTIR · shell">
    <div class="legal-shell-top">
      <div class="legal-shell-brand">
        <a class="legal-os-logo" href="/" aria-label="PROSTIR — головна">PR<span class="text-violet-500">O</span>STIR</a>
        <p class="legal-status-bar" role="status"><span class="legal-status-w">v1.0.4-LEGAL</span></p>
      </div>
      <button type="button" class="legal-print-btn" onclick="window.print()">PRINT TO PDF</button>
    </div>
    <nav class="legal-shell-bar" aria-label="Розділи документа">
${shellBarHtml}
    </nav>
  </header>
</div>

<main class="legal-main">
  <div class="legal-wrap">
${frontMatterHtml}
    <p class="legal-meta">prostir.app · public_offer · utf-8</p>
    <h1 class="legal-h1">Публічна оферта</h1>
    <p class="legal-sub">Про надання технологічних послуг · платформа PROSTIR</p>

    <a class="legal-law" href="${ZAKON_PAY}" target="_blank" rel="noopener noreferrer">
      <div class="legal-law__k">Закон України · платіжні послуги</div>
      <div class="legal-law__t">«Про платіжні послуги» № 1591-IX</div>
      <div class="legal-law__u">zakon.rada.gov.ua — офіційний текст</div>
    </a>
`;

const shellFoot = `
    <p class="legal-endnote"><a href="/">/home</a> · <a href="mailto:legal@prostir.app">legal@prostir.app</a></p>
  </div>
</main>

<footer class="legal-foot">
  <div class="legal-foot-inner">
    <p class="legal-sys-banner">// system.out · contractor_registry</p>
    <a class="legal-foot__logo" href="/" aria-label="PROSTIR">PR<span class="text-violet-500">O</span><span class="legal-foot-rest">STIR</span></a>
    <div class="legal-sys-block" aria-label="Реквізити виконавця">
      <p class="legal-sys-line"><span class="legal-sys-line__m">&gt;</span><span class="legal-sys-line__k">entity</span><span class="legal-sys-line__v">ФОП Шепітько Денис Олексійович · комерційне найменування PROSTIR</span></p>
      <p class="legal-sys-line"><span class="legal-sys-line__m">&gt;</span><span class="legal-sys-line__k">rnokpp_tin</span><span class="legal-sys-line__v">[ідентифікаційний номер]</span></p>
      <p class="legal-sys-line"><span class="legal-sys-line__m">&gt;</span><span class="legal-sys-line__k">legal_addr</span><span class="legal-sys-line__v">[юридична адреса ФОП]</span></p>
      <p class="legal-sys-line"><span class="legal-sys-line__m">&gt;</span><span class="legal-sys-line__k">iban</span><span class="legal-sys-line__v">UA673220010000026200347104840</span></p>
      <p class="legal-sys-line"><span class="legal-sys-line__m">&gt;</span><span class="legal-sys-line__k">bank</span><span class="legal-sys-line__v">АТ «Універсал Банк» (monobank)</span></p>
      <p class="legal-sys-line"><span class="legal-sys-line__m">&gt;</span><span class="legal-sys-line__k">mfo</span><span class="legal-sys-line__v">322001</span></p>
      <p class="legal-sys-line"><span class="legal-sys-line__m">&gt;</span><span class="legal-sys-line__k">email</span><span class="legal-sys-line__v">legal@prostir.app</span></p>
      <p class="legal-sys-line"><span class="legal-sys-line__m">&gt;</span><span class="legal-sys-line__k">host</span><span class="legal-sys-line__v">prostir.app</span></p>
    </div>
    <p class="legal-foot-copy">© 2026 PROSTIR · Kyiv · EOF</p>
  </div>
</footer>
<script>
(function () {
  var meta = ${sectionMetaJson};
  if (!meta.length) return;

  var lastN = 0;
  function setActive(n) {
    if (n === lastN) return;
    lastN = n;
    if (!meta[n - 1]) return;
    document.querySelectorAll('.legal-shell-cell').forEach(function (el) {
      var d = el.getAttribute('data-shell');
      var on = d === String(n);
      el.classList.toggle('legal-shell-cell--active', on);
      if (on) el.setAttribute('aria-current', 'true');
      else el.removeAttribute('aria-current');
    });
  }

  function topOf(el) {
    return el.getBoundingClientRect().top + (window.scrollY || window.pageYOffset || 0);
  }

  var sections = meta
    .map(function (s) {
      return document.getElementById(s.id);
    })
    .filter(Boolean);

  if (!sections.length) return;

  var ticking = false;
  function pickFromScroll() {
    ticking = false;
    var pad = 100;
    var y = (window.scrollY || window.pageYOffset || 0) + pad;
    var n = meta[0].n;
    for (var i = sections.length - 1; i >= 0; i--) {
      if (topOf(sections[i]) <= y) {
        n = meta[i].n;
        break;
      }
    }
    setActive(n);
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(pickFromScroll);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  pickFromScroll();
})();
</script>
</body>
</html>
`;

const parts = [];

function flushParagraphs(buf) {
  if (!buf.length) return;
  for (const p of buf) {
    if (p.trim()) parts.push(`    <p class="legal-p">${linkify1591(esc(p))}</p>\n`);
  }
}

function closeList(ul) {
  if (!ul.length) return '';
  const rows = ul
    .map(
      (x, idx) =>
        `      <p class="legal-li"><span class="legal-li__m" aria-hidden="true">${idx % 2 === 0 ? '&gt;' : '~'}</span><span class="legal-li__t">${linkify1591(esc(x))}</span></p>`
    )
    .join('\n');
  return `    <div class="legal-list">\n${rows}\n    </div>\n`;
}

for (const p of preBody) {
  if (p.trim()) parts.push(`    <p class="legal-p">${linkify1591(esc(p))}</p>\n`);
}

while (i < lines.length) {
  const line = lines[i];

  if (line.trim() === 'РЕКВІЗИТИ ВИКОНАВЦЯ') {
    i++;
    const reqLines = [];
    while (i < lines.length) {
      if (lines[i].trim() === '') {
        i++;
        continue;
      }
      reqLines.push(lines[i]);
      i++;
    }
    parts.push(`    <section class="legal-section" id="s11" aria-labelledby="h11">\n`);
    parts.push(`      <h2 id="h11">11. РЕКВІЗИТИ ВИКОНАВЦЯ</h2>\n`);
    parts.push(`      <div class="legal-req legal-list">\n`);
    reqLines.forEach((rl, ri) => {
      const mark = ri % 2 === 0 ? '&gt;' : '~';
      parts.push(
        `        <p class="legal-li"><span class="legal-li__m" aria-hidden="true">${mark}</span><span class="legal-li__t">${linkify1591(esc(rl))}</span></p>\n`
      );
    });
    parts.push(`      </div>\n    </section>\n`);
    break;
  }

  if (isMainSection(line)) {
    const title = line.trim();
    const m = title.match(/^(10|[1-9])\.\s+(.+)$/);
    if (!m) {
      i++;
      continue;
    }
    const num = m[1];
    const id = `s${num}`;
    parts.push(`    <section class="legal-section" id="${id}" aria-labelledby="h${num}">\n`);
    parts.push(`      <h2 id="h${num}">${esc(title)}</h2>\n`);
    i++;
    let ul = [];
    const paraBuf = [];

    const flushPara = () => {
      flushParagraphs(paraBuf);
      paraBuf.length = 0;
    };

    while (i < lines.length) {
      const L = lines[i];
      if (L.trim() === 'РЕКВІЗИТИ ВИКОНАВЦЯ') break;
      if (isMainSection(L)) break;

      if (isSubSection(L)) {
        parts.push(closeList(ul));
        ul = [];
        flushPara();
        parts.push(`      <h3>${esc(L.trim())}</h3>\n`);
        i++;
        continue;
      }

      if (isBullet(L)) {
        const t = stripBullet(L);
        if (num === '4' && /Розподіл коштів при кожній/.test(t)) {
          let k = 1;
          while (i + k < lines.length && isBullet(lines[i + k])) k++;
          if (k >= 2) {
            flushPara();
            parts.push(closeList(ul));
            ul = [];
            parts.push(`    <p class="legal-p">${linkify1591(esc(t))}</p>\n`);
            parts.push(merchantSplitTable());
            i += k;
            continue;
          }
        }
        flushPara();
        ul.push(t);
        i++;
        continue;
      }

      if (L.trim() === '') {
        if (ul.length) {
          parts.push(closeList(ul));
          ul = [];
        }
        i++;
        continue;
      }

      if (ul.length) {
        parts.push(closeList(ul));
        ul = [];
      }

      if (num === '1' && L.includes(' — ')) {
        flushPara();
        const idx = L.indexOf(' — ');
        const term = L.slice(0, idx);
        const rest = L.slice(idx + 3);
        parts.push(
          `      <p class="legal-def"><strong>${esc(term)}</strong> — ${linkify1591(esc(rest))}</p>\n`
        );
        i++;
        continue;
      }

      paraBuf.push(L);
      i++;
    }

    flushPara();
    parts.push(closeList(ul));
    parts.push(`    </section>\n`);
    continue;
  }

  i++;
}

fs.writeFileSync(out, shellHead + parts.join('') + shellFoot, 'utf8');
console.log('Wrote', out);
