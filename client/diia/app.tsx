import React, { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { createRoot } from "react-dom/client";
import confetti from "canvas-confetti";
import { DiiaAuthModal } from "./DiiaAuthModal";
import { UserChip, type DiiaUser } from "./UserChip";

const LOGIN_SELECTOR = 'a.diia-btn[href="#"]';
const LS_TOKEN = "prostir_token";
const LS_USER = "prostir_user";
const LEGACY_TOKEN = "prostir_access_token";

/** Production API (Railway). Override anytime with window.__PROSTIR_API_BASE__. */
const PROSTIR_API_PRODUCTION = "https://prostir-web-production.up.railway.app";
/** Local backend when the static site runs on localhost (any port). */
const PROSTIR_API_LOCAL = "http://localhost:8080";

function apiBase(): string {
  if (typeof window === "undefined") return "";
  const w = window as Window & { __PROSTIR_API_BASE__?: string };
  if (w.__PROSTIR_API_BASE__) {
    return String(w.__PROSTIR_API_BASE__).replace(/\/$/, "");
  }
  const h = window.location.hostname;
  if (h === "localhost" || h === "127.0.0.1") {
    return PROSTIR_API_LOCAL;
  }
  return PROSTIR_API_PRODUCTION;
}

function uiLang(): "ua" | "en" {
  return localStorage.getItem("prostir_lang") === "en" ? "en" : "ua";
}

function readSession(): { token: string; user: DiiaUser } | null {
  let token = localStorage.getItem(LS_TOKEN) || localStorage.getItem(LEGACY_TOKEN);
  const raw = localStorage.getItem(LS_USER);
  if (!token || !raw) return null;
  try {
    const user = JSON.parse(raw) as DiiaUser;
    if (!user?.full_name) return null;
    if (!localStorage.getItem(LS_TOKEN) && localStorage.getItem(LEGACY_TOKEN)) {
      localStorage.setItem(LS_TOKEN, token);
      localStorage.removeItem(LEGACY_TOKEN);
    }
    return { token, user };
  } catch {
    return null;
  }
}

function firstNameForProfile(full: string): string {
  const p = full.trim().split(/\s+/)[0];
  return p || full;
}

function injectStyles(): void {
  if (document.getElementById("prostir-diia-react-styles")) return;
  const s = document.createElement("style");
  s.id = "prostir-diia-react-styles";
  s.textContent = `
    .prostir-diia-modal-backdrop{position:fixed;inset:0;z-index:100050;display:flex;align-items:center;justify-content:center;padding:var(--space-4,1rem);background:rgba(8,8,10,.72);backdrop-filter:blur(16px) saturate(140%);-webkit-backdrop-filter:blur(16px) saturate(140%)}
    .prostir-diia-modal-card{width:min(400px,100%);border-radius:24px;padding:var(--space-5,1.25rem) var(--space-5,1.25rem) var(--space-4,1rem);border:1px solid var(--grey-line,rgba(0,0,0,.08));background:var(--bg,#fff);box-shadow:0 24px 80px rgba(0,0,0,.18),0 0 0 1px rgba(255,255,255,.04)}
    body.theme-noir .prostir-diia-modal-card{background:#101012;border-color:rgba(255,255,255,.08);box-shadow:0 32px 96px rgba(0,0,0,.55),0 0 0 1px rgba(139,92,246,.08)}
    .prostir-diia-modal-head{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3,.75rem);margin-bottom:var(--space-2,.5rem)}
    .prostir-diia-modal-head h2{margin:0;font-size:1.0625rem;font-weight:650;letter-spacing:-.02em;color:var(--jet,#111);line-height:var(--leading-tight,1.25)}
    body.theme-noir .prostir-diia-modal-head h2{color:#fff}
    .prostir-diia-modal-x{width:40px;height:40px;border-radius:12px;border:1px solid var(--grey-line,rgba(0,0,0,.1));background:transparent;color:var(--grey-soft,#666);font-size:1.25rem;line-height:1;cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:border-color .2s var(--ease-out,cubic-bezier(0.16,1,0.3,1)),background .2s var(--ease-out,cubic-bezier(0.16,1,0.3,1)),color .2s var(--ease-out,cubic-bezier(0.16,1,0.3,1)),box-shadow .2s var(--ease-out,cubic-bezier(0.16,1,0.3,1)),transform .15s var(--ease-out,cubic-bezier(0.16,1,0.3,1))}
    .prostir-diia-modal-x:hover{border-color:rgba(139,92,246,.35);color:var(--violet,#8B5CF6);background:rgba(139,92,246,.06);box-shadow:0 0 0 1px rgba(139,92,246,.12),0 0 24px rgba(139,92,246,.12)}
    .prostir-diia-modal-x:active{transform:scale(.97)}
    body.theme-noir .prostir-diia-modal-x{border-color:rgba(255,255,255,.1);color:rgba(255,255,255,.55)}
    body.theme-noir .prostir-diia-modal-x:hover{border-color:rgba(167,139,250,.45);color:#e9d5ff;background:rgba(139,92,246,.1);box-shadow:0 0 0 1px rgba(139,92,246,.15),0 0 28px rgba(139,92,246,.14)}
    .prostir-diia-modal-hint{margin:0 0 var(--space-4,1rem);font-size:.8125rem;color:var(--grey-soft,#666);line-height:var(--leading-normal,1.5)}
    body.theme-noir .prostir-diia-modal-hint{color:rgba(255,255,255,.48)}
    .prostir-diia-qr-wrap{display:flex;align-items:center;justify-content:center;min-height:240px;border-radius:16px;border:1px dashed rgba(139,92,246,.32);background:rgba(139,92,246,.04);margin-bottom:var(--space-4,1rem)}
    body.theme-noir .prostir-diia-qr-wrap{border-color:rgba(139,92,246,.26);background:rgba(139,92,246,.06)}
    .prostir-diia-qr-inner{padding:var(--space-3,.75rem);border-radius:16px;background:#fff}
    body.theme-noir .prostir-diia-qr-inner{background:#161618}
    .prostir-diia-qr-placeholder{display:flex;flex-direction:column;align-items:center;gap:var(--space-3,.75rem);padding:var(--space-6,1.5rem);color:var(--grey-muted,#888);font-size:.8125rem;text-align:center;line-height:var(--leading-normal,1.5)}
    .prostir-diia-spinner{width:40px;height:40px;border-radius:50%;border:3px solid rgba(139,92,246,.2);border-top-color:#8B5CF6;animation:prostir-dspin .8s linear infinite}
    @keyframes prostir-dspin{to{transform:rotate(360deg)}}
    .prostir-diia-modal-err{color:#dc2626;font-size:.8125rem;margin:0 0 var(--space-3,.75rem);line-height:var(--leading-snug,1.4)}
    .prostir-diia-modal-actions{display:flex;flex-wrap:wrap;gap:var(--space-2,.5rem);justify-content:flex-end}
    .prostir-diia-btn{min-height:40px;padding:0 var(--space-4,1rem);border-radius:12px;font:inherit;font-size:.8125rem;font-weight:600;cursor:pointer;border:1px solid transparent;transition:border-color .2s var(--ease-out,cubic-bezier(0.16,1,0.3,1)),box-shadow .2s var(--ease-out,cubic-bezier(0.16,1,0.3,1)),transform .15s var(--ease-out,cubic-bezier(0.16,1,0.3,1)),filter .2s var(--ease-out,cubic-bezier(0.16,1,0.3,1)),background .2s var(--ease-out,cubic-bezier(0.16,1,0.3,1)),opacity .2s}
    .prostir-diia-btn:disabled{opacity:.45;cursor:not-allowed}
    .prostir-diia-btn-sim{background:linear-gradient(135deg,#7c3aed,#8b5cf6);color:#fff;border-color:rgba(139,92,246,.4)}
    .prostir-diia-btn-sim:hover:not(:disabled){filter:brightness(1.05);transform:translateY(-1px);box-shadow:0 0 0 1px rgba(139,92,246,.2),0 12px 32px rgba(139,92,246,.25)}
    .prostir-diia-btn-sim:active:not(:disabled){transform:translateY(0) scale(.98)}
    .prostir-diia-btn-ghost{background:transparent;border-color:var(--grey-line,rgba(0,0,0,.1));color:var(--jet,#111)}
    .prostir-diia-btn-ghost:hover:not(:disabled){border-color:rgba(139,92,246,.28);background:rgba(139,92,246,.05);box-shadow:0 0 20px rgba(139,92,246,.06)}
    body.theme-noir .prostir-diia-btn-ghost{border-color:rgba(255,255,255,.12);color:#fff}
    body.theme-noir .prostir-diia-btn-ghost:hover:not(:disabled){border-color:rgba(167,139,250,.4);background:rgba(139,92,246,.08);box-shadow:0 0 24px rgba(139,92,246,.1)}
    .prostir-auth-chip-host{display:inline-flex;vertical-align:middle;align-items:center}
    .prostir-user-chip{display:inline-flex;align-items:center;gap:var(--space-2,.5rem);flex-wrap:wrap;max-width:min(300px,78vw);min-height:40px;padding:var(--space-2,.5rem) var(--space-3,.75rem);border-radius:12px;border:1px solid rgba(139,92,246,.26);background:rgba(139,92,246,.08);color:var(--jet,#111);transition:border-color .2s var(--ease-out,cubic-bezier(0.16,1,0.3,1)),box-shadow .2s var(--ease-out,cubic-bezier(0.16,1,0.3,1)),transform .15s var(--ease-out,cubic-bezier(0.16,1,0.3,1))}
    .prostir-user-chip:hover{border-color:rgba(167,139,250,.45);box-shadow:0 0 0 1px rgba(139,92,246,.12),0 0 28px rgba(139,92,246,.1)}
    body.theme-noir .prostir-user-chip{color:#fff;border-color:rgba(139,92,246,.32);background:rgba(139,92,246,.1)}
    body.theme-noir .prostir-user-chip:hover{border-color:rgba(196,181,253,.5);box-shadow:0 0 0 1px rgba(139,92,246,.15),0 0 32px rgba(139,92,246,.12)}
    .prostir-user-chip-ic{display:inline-flex;align-items:center;justify-content:center;color:#8B5CF6;flex-shrink:0;line-height:0}
    .prostir-user-chip-name{font-size:.8125rem;font-weight:650;letter-spacing:-.01em;line-height:var(--leading-tight,1.25)}
    .prostir-user-chip-check{display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;line-height:0}
    .prostir-user-chip-out{margin-left:var(--space-1,.25rem);border:none;background:transparent;font:inherit;font-size:.6875rem;font-weight:600;color:var(--grey-soft,#666);cursor:pointer;text-decoration:underline;text-underline-offset:3px;padding:var(--space-1,.25rem);border-radius:4px;transition:color .15s,background .15s}
    .prostir-user-chip-out:hover{color:var(--violet,#8B5CF6);background:rgba(139,92,246,.06)}
    body.theme-noir .prostir-user-chip-out{color:rgba(255,255,255,.5)}
    body.theme-noir .prostir-user-chip-out:hover{color:#e9d5ff;background:rgba(139,92,246,.1)}
  `;
  document.head.appendChild(s);
}

const COPY = {
  ua: {
    modalTitle: "Вхід через Дію",
    scanHint:
      "Це демо-QR: справжня Дія його не відкриє. Щоб увійти, натисніть «Симулювати сканування» (працює й з телефону в Wi‑Fi). Попередження «з’єднання не захищене» на HTTP у локальній мережі — нормально.",
    close: "Закрити",
    simulate: "Симулювати сканування",
    loading: "Завантаження…",
    qrWait: "Очікуємо посилання…",
    errConnect: "Не вдалося отримати QR",
    errCallback: "Не вдалося завершити вхід",
    noMock: "Немає mockDiiaToken (увімкніть USE_DIIA_MOCK)",
    logout: "Вийти",
  },
  en: {
    modalTitle: "Sign in with Diia",
    scanHint:
      "Demo QR only — the real Diia app will not complete this flow. Tap “Simulate scan” to sign in (works from your phone on the same Wi‑Fi). “Not secure” on HTTP in local dev is expected.",
    close: "Close",
    simulate: "Simulate scan",
    loading: "Loading…",
    qrWait: "Waiting for link…",
    errConnect: "Could not load QR",
    errCallback: "Sign-in failed",
    noMock: "No mockDiiaToken (enable USE_DIIA_MOCK)",
    logout: "Log out",
  },
} as const;

function fireConfetti(): void {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  void confetti({
    particleCount: 110,
    spread: 72,
    startVelocity: 38,
    origin: { y: 0.62 },
    scalar: 0.95,
  });
}

type ChipTarget = { wrap: HTMLElement; anchor: HTMLAnchorElement };

function ChipPortals({
  user,
  onLogout,
  logoutLabel,
}: {
  user: DiiaUser;
  onLogout: () => void;
  logoutLabel: string;
}) {
  const [targets, setTargets] = useState<ChipTarget[] | null>(null);

  useLayoutEffect(() => {
    const anchors = [...document.querySelectorAll<HTMLAnchorElement>(LOGIN_SELECTOR)];
    const next: ChipTarget[] = anchors.map((anchor) => {
      const anchorCopy = anchor.cloneNode(true) as HTMLAnchorElement;
      const wrap = document.createElement("span");
      wrap.className = "prostir-auth-chip-host";
      anchor.replaceWith(wrap);
      return { wrap, anchor: anchorCopy };
    });
    setTargets(next);
    return () => {
      next.forEach(({ wrap, anchor }) => {
        wrap.replaceWith(anchor);
      });
    };
  }, [user.id]);

  if (!targets?.length) return null;

  return (
    <>
      {targets.map(({ wrap }, i) => (
        <React.Fragment key={i}>
          {createPortal(<UserChip user={user} onLogout={onLogout} logoutLabel={logoutLabel} />, wrap)}
        </React.Fragment>
      ))}
    </>
  );
}

function App() {
  const [session, setSession] = useState<{ token: string; user: DiiaUser } | null>(() => readSession());
  const [modalOpen, setModalOpen] = useState(false);
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [mockToken, setMockToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [lang, setLang] = useState<"ua" | "en">(uiLang());

  const L = COPY[lang];

  const openModal = useCallback((e?: Event) => {
    e?.preventDefault();
    setModalOpen(true);
    setErr(null);
    setAuthUrl(null);
    setMockToken(null);
  }, []);

  useEffect(() => {
    injectStyles();
  }, []);

  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLAnchorElement>(LOGIN_SELECTOR);
    const handler = (ev: Event) => openModal(ev);
    nodes.forEach((n) => n.addEventListener("click", handler));
    return () => nodes.forEach((n) => n.removeEventListener("click", handler));
  }, [openModal, session]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "prostir_lang") setLang(uiLang());
    };
    const onLangClick = () => queueMicrotask(() => setLang(uiLang()));
    window.addEventListener("storage", onStorage);
    document.querySelectorAll(".lang-btn").forEach((b) => b.addEventListener("click", onLangClick));
    return () => {
      window.removeEventListener("storage", onStorage);
      document.querySelectorAll(".lang-btn").forEach((b) => b.removeEventListener("click", onLangClick));
    };
  }, []);

  useEffect(() => {
    if (!modalOpen) return;
    let cancelled = false;
    const base = apiBase();
    setLoading(true);
    setErr(null);
    void fetch(`${base}/auth/diia/connect`, { mode: "cors", credentials: "omit" })
      .then(async (r) => {
        if (!r.ok) throw new Error(COPY[uiLang()].errConnect);
        return r.json() as Promise<{ authUrl?: string; mockDiiaToken?: string }>;
      })
      .then((d) => {
        if (cancelled) return;
        if (typeof d.authUrl === "string") setAuthUrl(d.authUrl);
        setMockToken(typeof d.mockDiiaToken === "string" ? d.mockDiiaToken : null);
      })
      .catch(() => {
        if (!cancelled) setErr(COPY[uiLang()].errConnect);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [modalOpen]);

  const completeLogin = useCallback(
    (accessToken: string, user: DiiaUser) => {
      localStorage.setItem(LS_TOKEN, accessToken);
      localStorage.setItem(LS_USER, JSON.stringify(user));
      localStorage.removeItem(LEGACY_TOKEN);
      setSession({ token: accessToken, user });
      setModalOpen(false);
      fireConfetti();
    },
    []
  );

  const handleSimulate = useCallback(async () => {
    const C = COPY[lang];
    if (!mockToken) {
      setErr(C.noMock);
      return;
    }
    const base = apiBase();
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch(`${base}/auth/diia/callback`, {
        method: "POST",
        mode: "cors",
        credentials: "omit",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: mockToken }),
      });
      const data = (await r.json()) as { accessToken?: string; user?: DiiaUser; error?: string };
      if (!r.ok) throw new Error(data.error || C.errCallback);
      if (!data.accessToken || !data.user) throw new Error(C.errCallback);
      completeLogin(data.accessToken, data.user);
    } catch (e) {
      setErr(e instanceof Error ? e.message : C.errCallback);
    } finally {
      setLoading(false);
    }
  }, [mockToken, lang, completeLogin]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem(LS_TOKEN);
    localStorage.removeItem(LEGACY_TOKEN);
    localStorage.removeItem(LS_USER);
    setSession(null);
  }, []);

  useEffect(() => {
    const el = document.getElementById("profile-header-name");
    if (el && session?.user) {
      el.textContent = firstNameForProfile(session.user.full_name);
    }
  }, [session]);

  return (
    <>
      {session ? (
        <ChipPortals user={session.user} onLogout={handleLogout} logoutLabel={L.logout} />
      ) : null}
      <DiiaAuthModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        authUrl={authUrl}
        mockToken={mockToken}
        loading={loading}
        error={err}
        onSimulateScan={() => void handleSimulate()}
        showSimulateScan={Boolean(mockToken)}
        copy={{
          title: L.modalTitle,
          scanHint: L.scanHint,
          close: L.close,
          simulate: L.simulate,
          loading: L.loading,
          qrWait: L.qrWait,
        }}
      />
    </>
  );
}

function mount() {
  injectStyles();
  let el = document.getElementById("prostir-diia-react-root");
  if (!el) {
    el = document.createElement("div");
    el.id = "prostir-diia-react-root";
    document.body.appendChild(el);
  }
  const root = createRoot(el);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mount);
} else {
  mount();
}
