#!/usr/bin/env node
/**
 * Copies public/ → gh-pages-out/ and rewrites root-absolute paths for GitHub Pages
 * project sites: https://<user>.github.io/<repo>/
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const publicDir = path.join(root, 'public');
const outDir = path.join(root, 'gh-pages-out');

function getBasePrefix() {
  const explicit = process.env.GH_PAGES_BASE_PATH?.trim();
  if (explicit) {
    const x = explicit.replace(/^\/+|\/+$/g, '');
    return x ? `/${x}` : '';
  }
  const gr = process.env.GITHUB_REPOSITORY;
  if (gr?.includes('/')) {
    return `/${gr.split('/')[1]}`;
  }
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
    const hp = pkg.homepage;
    if (hp) {
      const u = new URL(hp);
      const seg = u.pathname.replace(/^\/+|\/+$/g, '').split('/')[0];
      return seg ? `/${seg}` : '';
    }
  } catch {
    /* ignore */
  }
  return '';
}

function rewriteHtml(content, prefix) {
  let c = content.replace(/(href|src)="(\/[^"#?]*)"/g, (full, attr, p) => {
    if (p.startsWith('//')) return full;
    if (p === '/') return `${attr}="${prefix}/"`;
    let rest = p.slice(1);
    if (rest === 'venue') rest = 'venue.html';
    return `${attr}="${prefix}/${rest}"`;
  });
  c = c.replace(/(href|src)='(\/[^'#?]*)'/g, (full, attr, p) => {
    if (p.startsWith('//')) return full;
    if (p === '/') return `${attr}='${prefix}/'`;
    let rest = p.slice(1);
    if (rest === 'venue') rest = 'venue.html';
    return `${attr}='${prefix}/${rest}'`;
  });
  c = c.replace(/a\[href="\/"\]/g, `a[href="${prefix}/"]`);
  c = c.replace(/window\.location\.href=('|")\/([^'"]*)\1/g, (_m, q, rest) => {
    const tail = rest ? `${prefix}/${rest}` : `${prefix}/`;
    return `window.location.href=${q}${tail}${q}`;
  });
  return c;
}

const ROOT_FILES = new Set([
  'index.html',
  'dine.html',
  'working.html',
  'moments.html',
  'business.html',
  'profile.html',
  'venue.html',
  '404.html',
  'app.css',
  'prostir-receipt.css',
  'diia-auth.bundle.js',
  'venue-register.bundle.js',
  'business-human-receipt.bundle.js',
  'shell-enhancements.js',
  'delight.js',
  'faq.js',
  'legal.js',
  'legal.html',
  'oferta.html',
]);

function rewriteJs(content, prefix) {
  let s = content;
  s = s.replace(/"\/venue"/g, `"${prefix}/venue.html"`);
  s = s.replace(/'\/venue'/g, `'${prefix}/venue.html'`);
  for (const f of ROOT_FILES) {
    const reD = new RegExp(`"/${f.replace(/\./g, '\\.')}"`, 'g');
    const reS = new RegExp(`'/${f.replace(/\./g, '\\.')}'`, 'g');
    s = s.replace(reD, `"${prefix}/${f}"`);
    s = s.replace(reS, `'${prefix}/${f}'`);
  }
  return s;
}

function walk(dir, prefix, visitor) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full, prefix, visitor);
    else visitor(full);
  }
}

function main() {
  if (!fs.existsSync(publicDir)) {
    console.error('Missing public/ directory');
    process.exit(1);
  }

  const prefix = getBasePrefix();
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.cpSync(publicDir, outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, '.nojekyll'), '');

  if (!prefix) {
    console.log('GH Pages: no base path (set GITHUB_REPOSITORY, GH_PAGES_BASE_PATH, or package.json homepage). Copied public/ as-is.');
    return;
  }

  console.log(`GH Pages: rewriting root paths with prefix "${prefix}"`);

  walk(outDir, prefix, (file) => {
    const ext = path.extname(file).toLowerCase();
    if (ext === '.html') {
      const raw = fs.readFileSync(file, 'utf8');
      fs.writeFileSync(file, rewriteHtml(raw, prefix));
    } else if (ext === '.js') {
      const raw = fs.readFileSync(file, 'utf8');
      fs.writeFileSync(file, rewriteJs(raw, prefix));
    }
  });
}

main();
