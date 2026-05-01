/**
 * PROSTIR shell: notification inbox only (lightweight, no command palette / tours).
 */
(() => {
  const LS_KEY = "prostir_notifications_v1";

  function lang() {
    return localStorage.getItem("prostir_lang") === "en" ? "en" : "ua";
  }

  const STR = {
    ua: {
      notify: "Сповіщення",
      noNotifications: "Поки без нових подій",
      clearAll: "Очистити",
      inbox: "Inbox",
    },
    en: {
      notify: "Notifications",
      noNotifications: "No new updates yet",
      clearAll: "Clear all",
      inbox: "Inbox",
    },
  };

  function t() {
    return STR[lang()];
  }

  function injectStyles() {
    if (document.getElementById("shell-enhancements-style")) return;
    const s = document.createElement("style");
    s.id = "shell-enhancements-style";
    s.textContent = `
      .se-chip{height:32px;border-radius:8px;border:1px solid rgba(139,92,246,.22);background:rgba(139,92,246,.06);color:var(--violet);display:inline-flex;align-items:center;justify-content:center;gap:.5rem;padding:0 .75rem;font-family:var(--font-mono);font-size:.625rem;letter-spacing:.06em;cursor:pointer;transition:border-color .2s cubic-bezier(0.16,1,0.3,1),background .2s cubic-bezier(0.16,1,0.3,1),box-shadow .2s cubic-bezier(0.16,1,0.3,1),transform .15s cubic-bezier(0.16,1,0.3,1)}
      .se-chip:hover{background:rgba(139,92,246,.11);border-color:rgba(167,139,250,.4);box-shadow:0 0 0 1px rgba(139,92,246,.12),0 0 24px rgba(139,92,246,.08)}
      .se-chip:active{transform:scale(.98)}
      .se-dot{width:6px;height:6px;border-radius:50%;background:#22c55e;box-shadow:0 0 0 2px rgba(34,197,94,.12)}
      .se-drawer{position:fixed;right:1rem;top:78px;width:min(380px,calc(100vw - 2rem));max-height:70vh;display:flex;flex-direction:column;background:var(--bg);border:1px solid var(--grey-line);border-radius:16px;box-shadow:0 24px 72px rgba(0,0,0,.2),0 0 0 1px rgba(255,255,255,.03);z-index:9999;opacity:0;transform:translateY(-8px);pointer-events:none;transition:opacity .22s cubic-bezier(0.16,1,0.3,1),transform .22s cubic-bezier(0.16,1,0.3,1),box-shadow .22s cubic-bezier(0.16,1,0.3,1)}
      .se-drawer.open{opacity:1;transform:translateY(0);pointer-events:auto}
      body.theme-noir .se-drawer{background:#0D0D0F;border-color:rgba(255,255,255,.08)}
      .se-dh{display:flex;align-items:center;justify-content:space-between;padding:.75rem 1rem;border-bottom:1px solid var(--grey-line)}
      body.theme-noir .se-dh{border-bottom-color:rgba(255,255,255,.08)}
      .se-dt{font-size:.78rem;font-family:var(--font-mono);letter-spacing:.06em;color:var(--grey-muted);text-transform:uppercase}
      .se-db{overflow:auto;padding:.45rem}
      .se-ic{width:24px;height:24px;border-radius:8px;background:rgba(139,92,246,.13);border:1px solid rgba(139,92,246,.2);display:flex;align-items:center;justify-content:center;color:var(--violet);font-size:.72rem;flex-shrink:0}
      .se-n{display:flex;gap:.6rem;padding:.58rem;border-radius:10px}
      .se-n + .se-n{border-top:1px solid var(--grey-line)}
      body.theme-noir .se-n + .se-n{border-top-color:rgba(255,255,255,.06)}
      .se-n h4{font-size:.78rem;color:var(--jet);margin:0 0 .2rem}
      body.theme-noir .se-n h4{color:#fff}
      .se-n p{font-size:.72rem;color:var(--grey-soft);margin:0;line-height:1.5}
      .se-empty{padding:1.1rem .8rem;color:var(--grey-muted);font-size:.78rem}
      .se-btn{height:32px;border-radius:8px;border:1px solid rgba(139,92,246,.22);background:rgba(139,92,246,.08);color:#8B5CF6;padding:0 .75rem;cursor:pointer;font-size:.75rem;transition:border-color .2s cubic-bezier(0.16,1,0.3,1),background .2s cubic-bezier(0.16,1,0.3,1),box-shadow .2s cubic-bezier(0.16,1,0.3,1),transform .15s cubic-bezier(0.16,1,0.3,1)}
      .se-btn:hover{border-color:rgba(167,139,250,.45);box-shadow:0 0 20px rgba(139,92,246,.1)}
      .se-btn:active{transform:scale(.98)}
    `;
    document.head.appendChild(s);
  }

  function el(tag, cls, html) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function seedNotifications() {
    const L = lang();
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch {
      localStorage.removeItem(LS_KEY);
    }
    const base = [
      L === "en"
        ? { title: "Booking confirmed", body: "Cafe Aura · Table #5 · 19:00", ts: Date.now() - 40000 }
        : { title: "Бронювання підтверджено", body: "Cafe Aura · Стіл #5 · 19:00", ts: Date.now() - 40000 },
      L === "en"
        ? { title: "Safe Exit active", body: "Session timer is running", ts: Date.now() - 900000 }
        : { title: "Safe Exit активний", body: "Таймер сесії запущено", ts: Date.now() - 900000 },
      L === "en"
        ? { title: "Nearby intent signal", body: "Moments · user at table #7", ts: Date.now() - 300000 }
        : { title: "Поруч intent-сигнал", body: "Moments · користувач біля столу #7", ts: Date.now() - 300000 },
    ];
    localStorage.setItem(LS_KEY, JSON.stringify(base));
    return base;
  }

  function installNotificationCenter() {
    const headerRight = document.querySelector(".header-right");
    if (!headerRight || headerRight.querySelector(".se-chip[data-se-inbox]")) return;

    const tr = t();
    const btn = el("button", "se-chip", `<span class="se-dot"></span><span data-se-inbox-label>${tr.inbox}</span>`);
    btn.type = "button";
    btn.setAttribute("data-se-inbox", "1");
    btn.setAttribute("aria-label", tr.notify);
    btn.setAttribute("aria-expanded", "false");
    headerRight.insertBefore(btn, headerRight.firstChild);

    const drawer = el("div", "se-drawer");
    drawer.setAttribute("aria-hidden", "true");
    const head = el("div", "se-dh");
    const title = el("div", "se-dt", tr.notify);
    title.setAttribute("data-se-drawer-title", "1");
    const clear = el("button", "se-btn", tr.clearAll);
    clear.type = "button";
    clear.setAttribute("data-se-clear", "1");
    head.append(title, clear);
    const body = el("div", "se-db");
    drawer.append(head, body);
    document.body.appendChild(drawer);

    function render() {
      const tr2 = t();
      title.textContent = tr2.notify;
      clear.textContent = tr2.clearAll;
      const lbl = btn.querySelector("[data-se-inbox-label]");
      if (lbl) lbl.textContent = tr2.inbox;
      btn.setAttribute("aria-label", tr2.notify);

      let list = [];
      try {
        const raw = localStorage.getItem(LS_KEY);
        list = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(list)) list = [];
      } catch {
        list = [];
        localStorage.removeItem(LS_KEY);
      }

      body.innerHTML = "";
      if (!list.length) {
        body.append(el("div", "se-empty", tr2.noNotifications));
        return;
      }
      list
        .slice()
        .sort((a, b) => (b.ts || 0) - (a.ts || 0))
        .forEach((n) => {
          const item = el("article", "se-n");
          const esc = (s) =>
            String(s || "")
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;");
          item.innerHTML = `<div class="se-ic" aria-hidden="true">•</div><div><h4>${esc(n.title)}</h4><p>${esc(n.body)}</p></div>`;
          body.append(item);
        });
    }

    function toggle(force) {
      const open = force == null ? !drawer.classList.contains("open") : force;
      drawer.classList.toggle("open", open);
      drawer.setAttribute("aria-hidden", open ? "false" : "true");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    }

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggle();
    });
    clear.addEventListener("click", () => {
      localStorage.setItem(LS_KEY, JSON.stringify([]));
      render();
    });
    document.addEventListener("click", (e) => {
      if (!drawer.contains(e.target) && !btn.contains(e.target)) toggle(false);
    });

    window.addEventListener("storage", (e) => {
      if (e.key === "prostir_lang") render();
    });
    document.addEventListener("click", (e) => {
      if (e.target.closest && e.target.closest(".lang-btn")) requestAnimationFrame(render);
    });

    render();
  }

  function init() {
    injectStyles();
    installNotificationCenter();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
