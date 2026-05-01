/* ══════════════════════════════════════════════════════════
   PROSTIR Legal — Terms · Privacy · Contacts
   Shared drawer, works on every page. Include before </body>.
   ══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Content ─────────────────────────────────────────── */
  const CONTENT = {
    ua: {
      terms: {
        title: 'Умови використання',
        updated: 'Оновлено 29 березня 2026',
        sections: [
          {
            icon: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="2" width="14" height="16" rx="2"/><path d="M7 7h6M7 10.5h6M7 14h4"/></svg>`,
            title: 'Що таке PROSTIR',
            body: 'PROSTIR — це цифрова платформа міського OS для резервування столиків у ресторанах, робочих місць у коворкінгах та соціальних взаємодій у місті. Сервіс надається виключно верифікованим користувачам через державний застосунок Дія.',
          },
          {
            icon: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="7" r="3.5"/><path d="M3 18c0-3.9 3.1-7 7-7s7 3.1 7 7"/></svg>`,
            title: 'Вік та верифікація',
            body: 'Для використання PROSTIR вам повинно виповнитись 16 років. Кожен обліковий запис прив\'язаний до одного підтвердженого цифрового підпису Дія. Передача або обмін акаунтами заборонені.',
          },
          {
            icon: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="16" height="11" rx="2"/><path d="M2 8h16M6 12h2M10 12h4"/></svg>`,
            title: 'Бронювання та оплата',
            body: 'Підтверджене бронювання є зобов\'язанням. Скасування можливе не пізніше ніж за 30 хвилин до початку сесії. Оплата через Safe Exit ініціюється автоматично при перетині геофенсингу або по закінченню часу сесії. Спірні транзакції розглядаються протягом 48 годин.',
          },
          {
            icon: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z"/></svg>`,
            title: 'Safe Exit',
            body: 'Функція Safe Exit використовує геолокацію вашого пристрою для визначення виходу із закладу. Ви надаєте явний дозвіл на відстеження геолокації при активній сесії. Після завершення сесії відстеження негайно зупиняється. Ми не зберігаємо маршрут вашого пересування — лише факт перетину межі.',
          },
          {
            icon: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="8"/><path d="M10 6v4l3 3"/></svg>`,
            title: 'Зміни умов',
            body: 'PROSTIR залишає за собою право змінювати ці умови з попередженням за 14 днів. Продовження використання сервісу після набрання чинності змін означає вашу згоду з ними. Поточна версія завжди доступна в цьому розділі.',
          },
          {
            icon: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2C5.6 2 2 5.6 2 10s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8z"/><path d="M10 7v4M10 13v.5"/></svg>`,
            title: 'Обмеження відповідальності',
            body: 'PROSTIR є посередником між користувачами та закладами. Ми не несемо відповідальності за якість послуг закладів-партнерів, форс-мажорні обставини або збої платіжних систем, що знаходяться поза нашим контролем.',
          },
          {
            icon: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="14" height="14" rx="2"/><path d="M7 10l2 2 4-4"/></svg>`,
            title: 'Застосовне право',
            body: 'Ці умови регулюються законодавством України. Будь-які суперечки вирішуються у судах Київської юрисдикції, якщо обидві сторони не досягнуть іншої домовленості.',
          },
        ],
      },
      privacy: {
        title: 'Конфіденційність',
        updated: 'Оновлено 29 березня 2026',
        sections: [
          {
            icon: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2l6 3v5c0 3.8-2.6 7.3-6 8.5C4.6 17.3 2 13.8 2 10V5l8-3z"/></svg>`,
            title: 'Наш підхід',
            body: 'Privacy-first — не маркетинговий слоган, а архітектурне рішення. PROSTIR не монетизує ваші персональні дані, не продає їх третім особам і не використовує для таргетованої реклами. Ми збираємо лише те, що необхідно для роботи сервісу.',
          },
          {
            icon: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="8"/><path d="M10 6v4l2.5 2.5"/></svg>`,
            title: 'Що ми збираємо',
            items: [
              '🪪 Верифікаційний токен Дія (не ваш ІПН або паспорт — лише підтвердження)',
              '📍 Геолокація пристрою — лише під час активної Safe Exit сесії',
              '🗓 Дані бронювань (заклад, час, стіл) для підтвердження та підтримки',
              '⚙️ Налаштування інтерфейсу (тема, мова) — зберігаються локально у вашому браузері',
              '📊 Анонімна статистика взаємодій для покращення UX (без ID)',
            ],
          },
          {
            icon: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 10h16M10 2v16"/></svg>`,
            title: 'Що ми НЕ збираємо',
            items: [
              '🚫 Паролі (їх не існує — вхід лише через Дія)',
              '🚫 Фото, сканування документів або біометрія',
              '🚫 Банківські реквізити або дані картки',
              '🚫 Ваш маршрут або загальна геолокація за межами сесії',
              '🚫 Вміст приватних чатів у Moments',
            ],
          },
          {
            icon: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="16" height="16" rx="3"/><path d="M7 10l2 2 4-4"/></svg>`,
            title: 'Ваші права',
            body: 'Відповідно до Закону України «Про захист персональних даних» та GDPR ви маєте право:\n• Запросити повний перелік ваших даних\n• Виправити неточні дані\n• Видалити акаунт і всі пов\'язані дані\n• Обмежити або заперечити обробку\n• Перенести дані в іншу систему\nНадішліть запит на privacy@prostir.kyiv або через форму Контакти.',
          },
          {
            icon: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8s-3-5-8-5-8 5-8 5 3 5 8 5 8-5 8-5z"/><circle cx="10" cy="8" r="2"/></svg>`,
            title: 'Зберігання та безпека',
            body: 'Дані бронювань зберігаються 12 місяців після завершення. Геолокаційні дані — виключно в оперативній пам\'яті під час активної сесії, не записуються на диск. Всі з\'єднання зашифровані TLS 1.3. Серверна інфраструктура розміщена в дата-центрах на території ЄС.',
          },
          {
            icon: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="8"/><path d="M6.5 10a3.5 3.5 0 0 0 7 0"/><path d="M8 7.5h.5M11.5 7.5h.5"/></svg>`,
            title: 'Cookies',
            body: 'PROSTIR використовує виключно функціональні cookie: збереження сесії, мовних налаштувань та теми інтерфейсу. Аналітичні або рекламні cookie відсутні. Ви можете очистити локальне сховище в будь-який момент через налаштування браузера.',
          },
        ],
      },
      contacts: {
        title: 'Контакти',
        subtitle: 'Ми завжди на зв\'язку',
      },
    },

    en: {
      terms: {
        title: 'Terms of Use',
        updated: 'Updated March 29, 2026',
        sections: [
          {
            icon: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="2" width="14" height="16" rx="2"/><path d="M7 7h6M7 10.5h6M7 14h4"/></svg>`,
            title: 'What is PROSTIR',
            body: 'PROSTIR is a digital urban OS platform for reserving restaurant tables, coworking desks, and social city interactions. The service is available exclusively to users verified through the Ukrainian state app Diia.',
          },
          {
            icon: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="7" r="3.5"/><path d="M3 18c0-3.9 3.1-7 7-7s7 3.1 7 7"/></svg>`,
            title: 'Age & Verification',
            body: 'You must be at least 16 years old to use PROSTIR. Each account is tied to a single confirmed Diia digital signature. Sharing or transferring accounts is prohibited.',
          },
          {
            icon: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="16" height="11" rx="2"/><path d="M2 8h16M6 12h2M10 12h4"/></svg>`,
            title: 'Bookings & Payment',
            body: 'A confirmed booking is a commitment. Cancellation is available up to 30 minutes before the session starts. Safe Exit payment is triggered automatically when you cross the geofence or when the session time expires. Disputed transactions are reviewed within 48 hours.',
          },
          {
            icon: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z"/></svg>`,
            title: 'Safe Exit',
            body: 'The Safe Exit feature uses your device\'s geolocation to detect when you leave a venue. You grant explicit permission to track your location during an active session. Tracking stops immediately after the session ends. We do not store your movement path — only the fact that the boundary was crossed.',
          },
          {
            icon: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="8"/><path d="M10 6v4l3 3"/></svg>`,
            title: 'Changes to Terms',
            body: 'PROSTIR reserves the right to update these terms with 14 days\' notice. Continued use of the service after changes take effect constitutes acceptance. The current version is always available in this section.',
          },
          {
            icon: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2C5.6 2 2 5.6 2 10s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8z"/><path d="M10 7v4M10 13v.5"/></svg>`,
            title: 'Limitation of Liability',
            body: 'PROSTIR acts as an intermediary between users and venues. We are not responsible for the quality of partner venue services, force majeure circumstances, or payment system failures beyond our control.',
          },
          {
            icon: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="14" height="14" rx="2"/><path d="M7 10l2 2 4-4"/></svg>`,
            title: 'Governing Law',
            body: 'These terms are governed by Ukrainian law. Any disputes shall be resolved in Kyiv jurisdiction courts, unless both parties agree otherwise.',
          },
        ],
      },
      privacy: {
        title: 'Privacy Policy',
        updated: 'Updated March 29, 2026',
        sections: [
          {
            icon: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2l6 3v5c0 3.8-2.6 7.3-6 8.5C4.6 17.3 2 13.8 2 10V5l8-3z"/></svg>`,
            title: 'Our Approach',
            body: 'Privacy-first is not a marketing slogan — it\'s an architectural decision. PROSTIR does not monetize your personal data, does not sell it to third parties, and does not use it for targeted advertising. We collect only what is necessary to operate the service.',
          },
          {
            icon: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="8"/><path d="M10 6v4l2.5 2.5"/></svg>`,
            title: 'What We Collect',
            items: [
              '🪪 Diia verification token (not your ID or passport — only confirmation)',
              '📍 Device geolocation — only during an active Safe Exit session',
              '🗓 Booking data (venue, time, table) for confirmation and support',
              '⚙️ Interface settings (theme, language) — stored locally in your browser',
              '📊 Anonymous interaction statistics to improve UX (no user IDs)',
            ],
          },
          {
            icon: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 10h16M10 2v16"/></svg>`,
            title: 'What We Do NOT Collect',
            items: [
              '🚫 Passwords (they don\'t exist — sign-in via Diia only)',
              '🚫 Photos, document scans, or biometrics',
              '🚫 Bank details or card information',
              '🚫 Your route or general geolocation outside an active session',
              '🚫 Content of private chats in Moments',
            ],
          },
          {
            icon: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="16" height="16" rx="3"/><path d="M7 10l2 2 4-4"/></svg>`,
            title: 'Your Rights',
            body: 'Under Ukraine\'s Personal Data Protection Law and GDPR, you have the right to:\n• Request a full list of your data\n• Correct inaccurate data\n• Delete your account and all related data\n• Restrict or object to processing\n• Transfer your data to another system\nSend a request to privacy@prostir.kyiv or via the Contact form.',
          },
          {
            icon: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8s-3-5-8-5-8 5-8 5 3 5 8 5 8-5 8-5z"/><circle cx="10" cy="8" r="2"/></svg>`,
            title: 'Storage & Security',
            body: 'Booking data is stored for 12 months after completion. Geolocation data exists exclusively in RAM during an active session — it is never written to disk. All connections are encrypted with TLS 1.3. Our server infrastructure is hosted in EU-based data centers.',
          },
          {
            icon: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="8"/><path d="M6.5 10a3.5 3.5 0 0 0 7 0"/><path d="M8 7.5h.5M11.5 7.5h.5"/></svg>`,
            title: 'Cookies',
            body: 'PROSTIR uses functional cookies only: session persistence, language settings, and interface theme. No analytics or advertising cookies are used. You can clear local storage at any time via browser settings.',
          },
        ],
      },
      contacts: {
        title: 'Contacts',
        subtitle: 'We\'re always here',
      },
    },
  };

  /* ── Inject styles ─────────────────────────────────────── */
  const style = document.createElement('style');
  style.textContent = `
    #legal-overlay {
      position: fixed; inset: 0; z-index: 9000;
      background: rgba(0,0,0,0); pointer-events: none;
      transition: background 0.35s;
    }
    #legal-overlay.open {
      background: rgba(0,0,0,0.58); pointer-events: all;
      backdrop-filter: blur(4px);
    }
    #legal-drawer {
      position: fixed; bottom: 0; left: 50%; transform: translateX(-50%) translateY(100%);
      width: min(740px, 100vw); max-height: 88vh;
      background: #fff; border-radius: 28px 28px 0 0;
      box-shadow: 0 -8px 64px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.04);
      display: flex; flex-direction: column; z-index: 9001;
      transition: transform 0.45s cubic-bezier(0.22,1,0.36,1);
      overflow: hidden;
    }
    body.theme-noir #legal-drawer {
      background: #0D0D0F;
      box-shadow: 0 -8px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(139,92,246,0.14);
    }
    #legal-overlay.open #legal-drawer { transform: translateX(-50%) translateY(0); }

    /* Handle */
    #legal-handle {
      width: 36px; height: 4px; border-radius: 2px;
      background: rgba(0,0,0,0.12); margin: 12px auto 0; flex-shrink: 0;
    }
    body.theme-noir #legal-handle { background: rgba(255,255,255,0.12); }

    /* Header */
    #legal-header {
      display: flex; align-items: flex-start; justify-content: space-between;
      padding: 1.25rem 1.75rem 0.5rem; flex-shrink: 0;
    }
    #legal-title {
      font-size: 1.18rem; font-weight: 800; letter-spacing: -0.04em;
      color: #0A0A0A; line-height: 1.2;
    }
    body.theme-noir #legal-title { color: #fff; }
    #legal-updated {
      font-family: 'SF Mono', 'JetBrains Mono', monospace;
      font-size: 0.62rem; letter-spacing: 0.08em; text-transform: uppercase;
      color: #9CA3AF; margin-top: 0.3rem;
    }
    body.theme-noir #legal-updated { color: rgba(255,255,255,0.28); }
    #legal-close {
      width: 32px; height: 32px; border-radius: 50%; border: none;
      background: rgba(0,0,0,0.06); color: #6B7280;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; flex-shrink: 0; transition: background 0.2s, color 0.2s;
      margin-left: 1rem; margin-top: 2px;
    }
    body.theme-noir #legal-close { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.45); }
    #legal-close:hover { background: rgba(239,68,68,0.1); color: #ef4444; }

    /* Divider */
    .legal-divider {
      height: 1px; background: rgba(0,0,0,0.06); margin: 0.75rem 1.75rem 0;
    }
    body.theme-noir .legal-divider { background: rgba(255,255,255,0.06); }

    /* Body scroll */
    #legal-body {
      overflow-y: auto; padding: 1.25rem 1.75rem 3rem; flex: 1;
      scroll-behavior: smooth;
    }
    #legal-body::-webkit-scrollbar { width: 4px; }
    #legal-body::-webkit-scrollbar-track { background: transparent; }
    #legal-body::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.25); border-radius: 2px; }

    /* Section card */
    .legal-section {
      background: rgba(139,92,246,0.03); border: 1px solid rgba(139,92,246,0.08);
      border-radius: 18px; padding: 1.15rem 1.25rem; margin-bottom: 0.85rem;
      opacity: 0; transform: translateY(12px);
      transition: opacity 0.4s, transform 0.4s;
    }
    body.theme-noir .legal-section {
      background: rgba(139,92,246,0.05); border-color: rgba(139,92,246,0.12);
    }
    .legal-section.in { opacity: 1; transform: translateY(0); }
    .legal-section-head {
      display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.65rem;
      cursor: pointer; user-select: none;
    }
    .legal-section-head:hover .legal-section-title { color: #8B5CF6; }
    .legal-icon {
      width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0;
      background: rgba(139,92,246,0.1); border: 1px solid rgba(139,92,246,0.15);
      display: flex; align-items: center; justify-content: center;
    }
    body.theme-noir .legal-icon { background: rgba(139,92,246,0.14); border-color: rgba(139,92,246,0.22); }
    .legal-icon svg { width: 16px; height: 16px; stroke: #8B5CF6; }
    .legal-section-title {
      font-size: 0.92rem; font-weight: 700; letter-spacing: -0.02em;
      color: #0A0A0A; flex: 1; transition: color 0.2s;
    }
    body.theme-noir .legal-section-title { color: #fff; }
    .legal-chevron {
      width: 18px; height: 18px; flex-shrink: 0; transition: transform 0.3s cubic-bezier(0.22,1,0.36,1);
      color: #9CA3AF;
    }
    body.theme-noir .legal-chevron { color: rgba(255,255,255,0.25); }
    .legal-section.expanded .legal-chevron { transform: rotate(180deg); }
    .legal-body-text {
      font-size: 0.85rem; color: #6B7280; line-height: 1.75;
      white-space: pre-line; padding-left: calc(34px + 0.75rem);
      max-height: 0; overflow: hidden;
      transition: max-height 0.4s cubic-bezier(0.22,1,0.36,1), opacity 0.3s;
      opacity: 0;
    }
    body.theme-noir .legal-body-text { color: rgba(255,255,255,0.5); }
    .legal-section.expanded .legal-body-text { max-height: 600px; opacity: 1; }
    .legal-items { list-style: none; padding: 0; margin: 0; }
    .legal-items li {
      font-size: 0.84rem; color: #6B7280; line-height: 1.6;
      padding: 0.32rem 0; border-bottom: 1px solid rgba(0,0,0,0.04);
    }
    body.theme-noir .legal-items li { color: rgba(255,255,255,0.5); border-bottom-color: rgba(255,255,255,0.04); }
    .legal-items li:last-child { border-bottom: none; }

    /* Contacts grid */
    .contacts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    @media (max-width: 480px) { .contacts-grid { grid-template-columns: 1fr; } }
    .contact-card {
      background: rgba(139,92,246,0.04); border: 1px solid rgba(139,92,246,0.1);
      border-radius: 16px; padding: 1.1rem 1.2rem;
      transition: border-color 0.22s, transform 0.22s;
      text-decoration: none; display: block;
    }
    .contact-card:hover { border-color: rgba(139,92,246,0.28); transform: translateY(-2px); }
    body.theme-noir .contact-card { background: rgba(139,92,246,0.07); border-color: rgba(139,92,246,0.14); }
    .contact-card-icon {
      width: 38px; height: 38px; border-radius: 11px; margin-bottom: 0.75rem;
      background: rgba(139,92,246,0.1); border: 1px solid rgba(139,92,246,0.18);
      display: flex; align-items: center; justify-content: center;
    }
    .contact-card-icon svg { width: 17px; height: 17px; stroke: #8B5CF6; }
    .contact-card-label {
      font-family: 'SF Mono','JetBrains Mono',monospace;
      font-size: 0.58rem; letter-spacing: 0.1em; text-transform: uppercase;
      color: #9CA3AF; margin-bottom: 0.22rem;
    }
    body.theme-noir .contact-card-label { color: rgba(255,255,255,0.28); }
    .contact-card-val { font-size: 0.85rem; font-weight: 600; color: #0A0A0A; }
    body.theme-noir .contact-card-val { color: #fff; }
    .contact-card-sub { font-size: 0.72rem; color: #9CA3AF; margin-top: 0.12rem; }
    body.theme-noir .contact-card-sub { color: rgba(255,255,255,0.3); }
    .contact-card.violet { border-color: rgba(139,92,246,0.22); }
    .contact-card.violet .contact-card-val { color: #8B5CF6; }
    .contacts-note {
      margin-top: 1.25rem; padding: 1rem 1.25rem; border-radius: 14px;
      background: rgba(34,197,94,0.05); border: 1px solid rgba(34,197,94,0.15);
      font-size: 0.82rem; color: #16a34a; line-height: 1.6;
      display: flex; align-items: flex-start; gap: 0.75rem;
    }
    body.theme-noir .contacts-note { color: #4ade80; background: rgba(34,197,94,0.07); border-color: rgba(34,197,94,0.18); }
    .contacts-note svg { width: 16px; height: 16px; flex-shrink: 0; margin-top: 2px; stroke: currentColor; }
  `;
  document.head.appendChild(style);

  /* ── DOM ───────────────────────────────────────────────── */
  const overlay = document.createElement('div');
  overlay.id = 'legal-overlay';
  overlay.innerHTML = `
    <div id="legal-drawer" role="dialog" aria-modal="true">
      <div id="legal-handle" aria-hidden="true"></div>
      <div id="legal-header">
        <div>
          <div id="legal-title"></div>
          <div id="legal-updated"></div>
        </div>
        <button id="legal-close" aria-label="Закрити">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 1l12 12M13 1L1 13"/></svg>
        </button>
      </div>
      <div class="legal-divider"></div>
      <div id="legal-body"></div>
    </div>`;
  document.body.appendChild(overlay);

  const drawer  = document.getElementById('legal-drawer');
  const bodyEl  = document.getElementById('legal-body');
  const titleEl = document.getElementById('legal-title');
  const updEl   = document.getElementById('legal-updated');

  /* ── Render ────────────────────────────────────────────── */
  function getLang(){ return localStorage.getItem('prostir_lang') || 'ua'; }

  function renderSections(sections) {
    bodyEl.innerHTML = '';
    sections.forEach((s, i) => {
      const card = document.createElement('div');
      card.className = 'legal-section';
      card.style.transitionDelay = (i * 0.05) + 's';

      if (s.items) {
        /* list variant */
        card.innerHTML = `
          <div class="legal-section-head">
            <div class="legal-icon">${s.icon}</div>
            <div class="legal-section-title">${s.title}</div>
            <svg class="legal-chevron" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 6l5 5 5-5"/></svg>
          </div>
          <div class="legal-body-text">
            <ul class="legal-items">${s.items.map(it=>`<li>${it}</li>`).join('')}</ul>
          </div>`;
      } else {
        card.innerHTML = `
          <div class="legal-section-head">
            <div class="legal-icon">${s.icon}</div>
            <div class="legal-section-title">${s.title}</div>
            <svg class="legal-chevron" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 6l5 5 5-5"/></svg>
          </div>
          <div class="legal-body-text">${s.body}</div>`;
      }

      card.querySelector('.legal-section-head').addEventListener('click', () => {
        const isOpen = card.classList.contains('expanded');
        /* collapse all */
        bodyEl.querySelectorAll('.legal-section.expanded').forEach(c => c.classList.remove('expanded'));
        if (!isOpen) card.classList.add('expanded');
      });

      bodyEl.appendChild(card);
      /* stagger in */
      requestAnimationFrame(() => requestAnimationFrame(() => card.classList.add('in')));
    });
  }

  function renderContacts() {
    const lang = getLang();
    const t = CONTENT[lang].contacts;
    titleEl.textContent = t.title;
    updEl.textContent   = '';
    bodyEl.innerHTML = `
      <p style="font-size:.88rem;color:${document.body.classList.contains('theme-noir')?'rgba(255,255,255,0.45)':'#6B7280'};margin-bottom:1.25rem;line-height:1.65">${t.subtitle}</p>
      <div class="contacts-grid">
        <a href="mailto:hello@prostir.kyiv" class="contact-card">
          <div class="contact-card-icon">
            <svg viewBox="0 0 20 20" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="16" height="13" rx="2"/><path d="M2 7l8 5 8-5"/></svg>
          </div>
          <div class="contact-card-label">Email</div>
          <div class="contact-card-val">hello@prostir.kyiv</div>
          <div class="contact-card-sub">${lang==='ua'?'Відповідь протягом 24 год':'Reply within 24 hours'}</div>
        </a>
        <a href="mailto:privacy@prostir.kyiv" class="contact-card violet">
          <div class="contact-card-icon">
            <svg viewBox="0 0 20 20" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2l6 3v5c0 3.8-2.6 7.3-6 8.5C4.6 17.3 2 13.8 2 10V5l8-3z"/></svg>
          </div>
          <div class="contact-card-label">${lang==='ua'?'Конфіденційність':'Privacy'}</div>
          <div class="contact-card-val">privacy@prostir.kyiv</div>
          <div class="contact-card-sub">${lang==='ua'?'Запити щодо даних':'Data requests'}</div>
        </a>
        <a href="https://github.com/shepiitkod/prostir-web" target="_blank" rel="noopener" class="contact-card">
          <div class="contact-card-icon">
            <svg viewBox="0 0 20 20" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2C5.6 2 2 5.6 2 10c0 3.5 2.3 6.5 5.5 7.6.4.1.5-.2.5-.4v-1.4c-2.2.5-2.7-1-2.7-1-.4-.9-.9-1.2-.9-1.2-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.2 1.8.9 2.3.7.1-.5.3-.9.5-1.1-1.8-.2-3.6-.9-3.6-4 0-.9.3-1.6.8-2.1-.1-.2-.4-1 .1-2.1 0 0 .7-.2 2.2.8.6-.2 1.3-.3 2-.3s1.4.1 2 .3c1.5-1 2.2-.8 2.2-.8.5 1.1.2 1.9.1 2.1.5.5.8 1.2.8 2.1 0 3.1-1.9 3.8-3.7 4 .3.3.6.8.6 1.6v2.3c0 .2.1.5.5.4C15.7 16.5 18 13.5 18 10c0-4.4-3.6-8-8-8z"/></svg>
          </div>
          <div class="contact-card-label">GitHub</div>
          <div class="contact-card-val">prostir-web</div>
          <div class="contact-card-sub">${lang==='ua'?'Відкритий код':'Open source'}</div>
        </a>
        <div class="contact-card">
          <div class="contact-card-icon">
            <svg viewBox="0 0 20 20" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2C6.7 2 4 4.6 4 7.8c0 4.7 6 10.2 6 10.2s6-5.5 6-10.2C16 4.6 13.3 2 10 2z"/><circle cx="10" cy="8" r="2"/></svg>
          </div>
          <div class="contact-card-label">${lang==='ua'?'Адреса':'Location'}</div>
          <div class="contact-card-val">Kyiv, Ukraine</div>
          <div class="contact-card-sub">${lang==='ua'?'Ми будуємо місто майбутнього':'Building the city of tomorrow'}</div>
        </div>
      </div>
      <div class="contacts-note">
        <svg viewBox="0 0 16 16" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5">
          <circle cx="8" cy="8" r="6"/><path d="M8 5v4M8 11v.5"/>
        </svg>
        <span>${lang==='ua'
          ? 'PROSTIR — це prototype-продукт у активній розробці. Якщо ви знайшли баг, маєте ідею або хочете стати партнером — пишіть без зайвих слів.'
          : 'PROSTIR is a prototype product in active development. Found a bug, have an idea, or want to become a partner — reach out directly.'
        }</span>
      </div>`;
  }

  /* ── Open / Close ──────────────────────────────────────── */
  function openLegal(type) {
    const lang = getLang();
    const data = CONTENT[lang][type];

    if (type === 'contacts') {
      renderContacts();
    } else {
      titleEl.textContent = data.title;
      updEl.textContent   = data.updated;
      renderSections(data.sections);
    }

    document.body.style.overflow = 'hidden';
    overlay.classList.add('open');
    drawer.focus && drawer.focus();
  }

  function closeLegal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.getElementById('legal-close').addEventListener('click', closeLegal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeLegal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLegal(); });

  /* ── Wire footer links ─────────────────────────────────── */
  function wire() {
    document.querySelectorAll('a[data-i18n="footer.terms"], a[data-i18n="footer.terms-en"]').forEach(el => {
      el.addEventListener('click', e => { e.preventDefault(); openLegal('terms'); });
    });
    document.querySelectorAll('a[data-i18n="footer.privacy"]').forEach(el => {
      el.addEventListener('click', e => { e.preventDefault(); openLegal('privacy'); });
    });
    document.querySelectorAll('a[data-i18n="footer.contacts"]').forEach(el => {
      el.addEventListener('click', e => { e.preventDefault(); openLegal('contacts'); });
    });
    /* also plain text fallback */
    document.querySelectorAll('.footer-links a').forEach(el => {
      const txt = el.textContent.trim().toLowerCase();
      if (txt === 'умови' || txt === 'terms')          el.addEventListener('click', e => { e.preventDefault(); openLegal('terms'); });
      else if (txt === 'конфіденційність' || txt === 'privacy') el.addEventListener('click', e => { e.preventDefault(); openLegal('privacy'); });
      else if (txt === 'контакти' || txt === 'contacts')        el.addEventListener('click', e => { e.preventDefault(); openLegal('contacts'); });
    });
    /* also profile page footer */
    document.querySelectorAll('footer a').forEach(el => {
      const txt = el.textContent.trim().toLowerCase();
      if (txt === 'умови' || txt === 'terms')                    el.addEventListener('click', e => { e.preventDefault(); openLegal('terms'); });
      else if (txt === 'конфіденційність' || txt === 'privacy')  el.addEventListener('click', e => { e.preventDefault(); openLegal('privacy'); });
      else if (txt === 'контакти' || txt === 'contacts')         el.addEventListener('click', e => { e.preventDefault(); openLegal('contacts'); });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire);
  else wire();

  window.openLegal = openLegal;
})();
