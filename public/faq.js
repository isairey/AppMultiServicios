/* ══════════════════════════════════════════════════════════
   PROSTIR FAQ — shared drawer, works on all pages
   ══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const FAQS = {
    ua: [
      { q: 'Як верифікуватись через Дія?',
        a: 'Відкрийте застосунок Дія та відскануйте QR-код на сторінці бронювання. Верифікація займає до 10 секунд — жодних паролів, жодних форм.' },
      { q: 'Як працює Safe Exit?',
        a: 'Коли ви виходите за межу геофенсингу (50м від закладу), система автоматично ініціює оплату і надсилає push-підтвердження на ваш телефон. Просто встаньте і йдіть.' },
      { q: 'Чи можна скасувати бронювання?',
        a: 'Так, до початку часу бронювання — одним натиском у вашому профілі. Після початку сесії скасування неможливе, але ви завжди можете скоротити час.' },
      { q: 'Які заклади підтримують PROSTIR?',
        a: 'Понад 150 закладів Києва: ресторани, коворкінги та кафе. Повний список доступний у розділах Dine та Working із фільтрами за районом і типом.' },
      { q: 'Чи безпечні мої дані?',
        a: 'Ваша особистість підтверджена державною системою Дія. PROSTIR не зберігає паролів, сканів документів або банківських даних — лише анонімний токен верифікації.' },
      { q: 'Що таке Ghost Mode?',
        a: 'Режим анонімності в Moments. У Ghost Mode ви невидимі для інших користувачів поруч. Переключіться в Open коли захочете спілкуватися — і місто помітить вас.' },
      { q: 'Як підключити мій заклад?',
        a: 'Заповніть форму на сторінці Business — наша команда зв\'яжеться з вами протягом 24 годин. Інтеграція займає менше 48 годин.' },
      { q: 'Потрібен інтернет для Safe Exit?',
        a: 'Так, для відправки push-підтвердження потрібне з\'єднання. Але геофенсинг продовжує відстежувати ваше місцезнаходження навіть при слабкому сигналі — оплата відбудеться щойно з\'явиться мережа.' },
    ],
    en: [
      { q: 'How do I verify with Diia?',
        a: 'Open the Diia app and scan the QR code on the booking page. Verification takes under 10 seconds — no passwords, no forms.' },
      { q: 'How does Safe Exit work?',
        a: 'When you cross the geofence boundary (50m from the venue), the system automatically initiates payment and sends a push confirmation to your phone. Just stand up and go.' },
      { q: 'Can I cancel a booking?',
        a: 'Yes, up until your booking start time — one tap from your profile. After the session starts cancellation is not possible, but you can always shorten the duration.' },
      { q: 'Which venues support PROSTIR?',
        a: 'Over 150 venues in Kyiv: restaurants, coworking spaces and cafes. Full list available in the Dine and Working sections with filters by district and type.' },
      { q: 'Is my data safe?',
        a: 'Your identity is confirmed via Diia — the state verification system. PROSTIR stores no passwords, document scans or banking details — only an anonymous verification token.' },
      { q: 'What is Ghost Mode?',
        a: 'Anonymity mode in Moments. In Ghost Mode you\'re invisible to nearby users. Switch to Open when you want to connect — and the city will notice you.' },
      { q: 'How do I connect my venue?',
        a: 'Fill out the form on the Business page — our team will contact you within 24 hours. Integration takes less than 48 hours.' },
      { q: 'Do I need internet for Safe Exit?',
        a: 'Yes, an active connection is needed to send the push confirmation. However, geofencing continues tracking your location even on a weak signal — payment processes as soon as network is available.' },
    ],
  };

  /* ── Inject styles ── */
  const style = document.createElement('style');
  style.textContent = `
    #faq-overlay {
      position: fixed; inset: 0; z-index: 8000;
      display: flex; align-items: flex-end; justify-content: center;
      background: rgba(0,0,0,0);
      transition: background 0.38s cubic-bezier(0.22,1,0.36,1);
      pointer-events: none;
    }
    #faq-overlay.open {
      background: rgba(0,0,0,0.72);
      pointer-events: auto;
    }
    #faq-drawer {
      width: 100%; max-width: 780px;
      max-height: 82vh;
      background: #0a0a0c;
      border-radius: 28px 28px 0 0;
      border: 1px solid rgba(139,92,246,0.18);
      border-bottom: none;
      overflow: hidden;
      display: flex; flex-direction: column;
      transform: translateY(100%);
      transition: transform 0.42s cubic-bezier(0.22,1,0.36,1);
      box-shadow: 0 -24px 80px rgba(139,92,246,0.12), 0 -8px 24px rgba(0,0,0,0.4);
    }
    #faq-overlay.open #faq-drawer { transform: translateY(0); }
    #faq-handle {
      width: 44px; height: 4px; border-radius: 999px;
      background: rgba(255,255,255,0.12); margin: 12px auto 0;
      flex-shrink: 0;
    }
    #faq-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 1.4rem 1.75rem 0.9rem;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      flex-shrink: 0;
      gap: 1rem;
    }
    #faq-title {
      font-size: 1.1rem; font-weight: 700; letter-spacing: -0.03em;
      color: #fff; margin: 0;
    }
    #faq-title span { color: #8B5CF6; }
    #faq-search {
      flex: 1; max-width: 260px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 10px;
      padding: 0.5rem 0.85rem;
      font-size: 0.82rem; color: #fff;
      outline: none; font-family: inherit;
      transition: border-color 0.2s;
    }
    #faq-search::placeholder { color: rgba(255,255,255,0.28); }
    #faq-search:focus { border-color: rgba(139,92,246,0.55); }
    #faq-close {
      width: 32px; height: 32px; border-radius: 50%;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.08);
      color: rgba(255,255,255,0.55); font-size: 1rem;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; flex-shrink: 0;
      transition: background 0.2s, color 0.2s;
    }
    #faq-close:hover { background: rgba(139,92,246,0.2); color: #fff; }
    #faq-list {
      overflow-y: auto; padding: 0.5rem 1.75rem 2rem;
      flex: 1;
      scrollbar-width: thin;
      scrollbar-color: rgba(139,92,246,0.25) transparent;
    }
    .faq-item {
      border-bottom: 1px solid rgba(255,255,255,0.05);
      overflow: hidden;
    }
    .faq-item:last-child { border-bottom: none; }
    .faq-q {
      display: flex; align-items: center; justify-content: space-between;
      padding: 1.1rem 0;
      cursor: pointer; gap: 1rem;
      font-size: 0.92rem; font-weight: 600; color: rgba(255,255,255,0.82);
      letter-spacing: -0.01em;
      transition: color 0.2s;
      user-select: none;
    }
    .faq-q:hover { color: #fff; }
    .faq-item.open .faq-q { color: #c4b5fd; }
    .faq-chevron {
      width: 18px; height: 18px; flex-shrink: 0;
      border: 1px solid rgba(255,255,255,0.12); border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.62rem; color: rgba(255,255,255,0.38);
      transition: transform 0.3s cubic-bezier(0.22,1,0.36,1),
                  background 0.2s, border-color 0.2s, color 0.2s;
    }
    .faq-item.open .faq-chevron {
      transform: rotate(180deg);
      background: rgba(139,92,246,0.18);
      border-color: rgba(139,92,246,0.35);
      color: #8B5CF6;
    }
    .faq-a-wrap {
      max-height: 0; overflow: hidden;
      transition: max-height 0.38s cubic-bezier(0.22,1,0.36,1);
    }
    .faq-a {
      padding: 0 0 1.1rem;
      font-size: 0.86rem; color: rgba(255,255,255,0.42); line-height: 1.7;
    }
    .faq-empty {
      text-align: center; padding: 2.5rem 1rem;
      font-size: 0.88rem; color: rgba(255,255,255,0.28);
    }
    @media (max-width: 600px) {
      #faq-header { flex-wrap: wrap; }
      #faq-search { max-width: 100%; order: 3; flex-basis: 100%; }
      #faq-drawer { max-height: 88vh; }
    }
  `;
  document.head.appendChild(style);

  /* ── Build DOM ── */
  const overlay = document.createElement('div');
  overlay.id = 'faq-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'FAQ');

  overlay.innerHTML = `
    <div id="faq-drawer">
      <div id="faq-handle" aria-hidden="true"></div>
      <div id="faq-header">
        <h2 id="faq-title">FAQ <span>·</span> PROSTIR</h2>
        <input id="faq-search" type="search" placeholder="Пошук..." autocomplete="off" />
        <button id="faq-close" aria-label="Закрити">✕</button>
      </div>
      <div id="faq-list"></div>
    </div>
  `;
  document.body.appendChild(overlay);

  const list    = document.getElementById('faq-list');
  const search  = document.getElementById('faq-search');
  const closeBtn = document.getElementById('faq-close');

  function getLang() {
    return localStorage.getItem('prostir_lang') === 'en' ? 'en' : 'ua';
  }

  function render(query) {
    const lang  = getLang();
    const items = FAQS[lang];
    const q     = (query || '').toLowerCase().trim();
    const filtered = q
      ? items.filter(f => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q))
      : items;

    if (!filtered.length) {
      list.innerHTML = `<div class="faq-empty">${lang === 'en' ? 'Nothing found 🔍' : 'Нічого не знайдено 🔍'}</div>`;
      return;
    }

    list.innerHTML = filtered.map((f, i) => `
      <div class="faq-item" data-idx="${i}">
        <div class="faq-q" role="button" tabindex="0" aria-expanded="false">
          <span>${f.q}</span>
          <span class="faq-chevron" aria-hidden="true">▾</span>
        </div>
        <div class="faq-a-wrap"><div class="faq-a">${f.a}</div></div>
      </div>
    `).join('');

    list.querySelectorAll('.faq-q').forEach(btn => {
      btn.addEventListener('click', toggleItem);
      btn.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') toggleItem.call(btn); });
    });
  }

  function toggleItem() {
    const item = this.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    /* close all */
    list.querySelectorAll('.faq-item.open').forEach(el => {
      el.classList.remove('open');
      el.querySelector('.faq-a-wrap').style.maxHeight = '0';
      el.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
    });
    if (!isOpen) {
      item.classList.add('open');
      const wrap = item.querySelector('.faq-a-wrap');
      wrap.style.maxHeight = wrap.scrollHeight + 'px';
      this.setAttribute('aria-expanded', 'true');
    }
  }

  /* ── Open / Close ── */
  function openFAQ() {
    render();
    search.value = '';
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => search.focus(), 400);
  }

  function closeFAQ() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', closeFAQ);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeFAQ(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeFAQ(); });

  let searchTimer;
  search.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => render(search.value), 220);
  });

  /* update placeholder on lang change */
  const origSetItem = localStorage.setItem.bind(localStorage);
  localStorage.setItem = function(key, val) {
    origSetItem(key, val);
    if (key === 'prostir_lang') {
      render(search.value);
      search.placeholder = val === 'en' ? 'Search...' : 'Пошук...';
    }
  };

  /* ── Wire up all trigger links ── */
  function wireTriggers() {
    document.querySelectorAll('[data-faq-trigger], .faq-link').forEach(el => {
      if (el._faqWired) return;
      el._faqWired = true;
      el.addEventListener('click', e => { e.preventDefault(); openFAQ(); });
    });
  }
  document.addEventListener('DOMContentLoaded', wireTriggers);
  wireTriggers();

  /* expose globally for inline onclick="" usage */
  window.openFAQ = openFAQ;
})();
