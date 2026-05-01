import React, { useCallback, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { AnimatePresence, motion } from "motion/react";

type FormState = {
  venueName: string;
  city: string;
  contactName: string;
  phone: string;
  menuOrSocialLink: string;
};

const initial: FormState = {
  venueName: "",
  city: "",
  contactName: "",
  phone: "",
  menuOrSocialLink: "",
};

const PROSTIR_API_PRODUCTION = "https://prostir-web-production.up.railway.app";
const PROSTIR_API_LOCAL = "http://localhost:8080";

function apiBase(): string {
  if (typeof window === "undefined") return "";
  const w = window as Window & { __PROSTIR_API_BASE__?: string };
  if (w.__PROSTIR_API_BASE__) {
    return String(w.__PROSTIR_API_BASE__).replace(/\/$/, "");
  }
  const { hostname } = window.location;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return PROSTIR_API_LOCAL;
  }
  return PROSTIR_API_PRODUCTION;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 380, damping: 28 },
  },
};

function VenueRegisterApp(): React.ReactElement {
  const [form, setForm] = useState<FormState>(initial);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const endpoint = useMemo(() => `${apiBase()}/api/venue/register`, []);

  const onChange =
    (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
    };

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setErrorMsg("");
      setStatus("sending");
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            venueName: form.venueName,
            city: form.city,
            contactName: form.contactName,
            phone: form.phone,
            menuOrSocialLink: form.menuOrSocialLink,
          }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          ok?: boolean;
          error?: string;
        };
        if (!res.ok || !data.ok) {
          setStatus("error");
          setErrorMsg(
            typeof data.error === "string" && data.error
              ? data.error
              : "Щось пішло не так. Спробуйте ще раз."
          );
          return;
        }
        setStatus("done");
      } catch {
        setStatus("error");
        setErrorMsg("Немає з'єднання з сервером. Перевірте, що API запущено (локально: порт 8080).");
      }
    },
    [endpoint, form]
  );

  return (
    <div className="vn-root">
      <div className="vn-noise" aria-hidden />
      <div className="vn-grid" aria-hidden />

      <motion.div
        className="vn-hero"
        role="banner"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="vn-kicker">PROSTIR</p>
        <h1 className="vn-title">ПРИЄДНУЙТЕСЬ ДО ПРОСТОРУ</h1>
        <p className="vn-sub">
          Цифрова екосистема для кращих закладів України. Почніть з Києва
        </p>
        <motion.ul
          className="vn-trust"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <li className="vn-trust-item">
            <span className="vn-trust-dot" aria-hidden />
            Відповідь за 1 робочий день
          </li>
          <li className="vn-trust-item">
            <span className="vn-trust-dot" aria-hidden />
            Без зобовʼязань — спочатку знайомство
          </li>
          <li className="vn-trust-item">
            <span className="vn-trust-dot" aria-hidden />
            Контакти лише для звʼязку, без спаму
          </li>
        </motion.ul>
      </motion.div>

      <AnimatePresence mode="wait">
        {status === "done" ? (
          <motion.div
            key="thanks"
            className="vn-card vn-thanks"
            role="status"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
          >
            <div className="vn-thanks-glow" aria-hidden />
            <h2 className="vn-thanks-title">Дякуємо!</h2>
            <p className="vn-thanks-text">
              Наш менеджер (або я особисто) зв'яжеться з вами.
            </p>
            <p className="vn-thanks-hint">
              Зазвичай це повідомлення в месенджері або дзвінок упродовж одного
              робочого дня.
            </p>
            <div className="vn-thanks-links">
              <a className="vn-back" href="/business.html">
                До B2B-сторінки
              </a>
              <a className="vn-back vn-back--ghost" href="/">
                На головну
              </a>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            className="vn-card vn-form"
            onSubmit={onSubmit}
            variants={container}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, y: -10 }}
          >
            <motion.p variants={item} className="vn-form-lead">
              Заповніть анкету — це займе близько хвилини. Далі коротко напишемо або
              зателефонуємо, щоб зрозуміти ваш формат.
            </motion.p>
            <motion.div variants={item} className="vn-field">
              <label htmlFor="vn-venue">Назва закладу</label>
              <input
                id="vn-venue"
                name="venueName"
                type="text"
                autoComplete="organization"
                required
                value={form.venueName}
                onChange={onChange("venueName")}
                placeholder="Наприклад, Cafe Aura"
              />
            </motion.div>
            <motion.div variants={item} className="vn-field">
              <label htmlFor="vn-city">Місто</label>
              <input
                id="vn-city"
                name="city"
                type="text"
                autoComplete="address-level2"
                required
                value={form.city}
                onChange={onChange("city")}
                placeholder="Київ"
              />
            </motion.div>
            <motion.div variants={item} className="vn-field">
              <label htmlFor="vn-contact">Контактна особа</label>
              <input
                id="vn-contact"
                name="contactName"
                type="text"
                autoComplete="name"
                required
                value={form.contactName}
                onChange={onChange("contactName")}
                placeholder="Імʼя та прізвище"
              />
            </motion.div>
            <motion.div variants={item} className="vn-field">
              <label htmlFor="vn-phone">Телефон</label>
              <input
                id="vn-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                value={form.phone}
                onChange={onChange("phone")}
                placeholder="+380 …"
              />
            </motion.div>
            <motion.div variants={item} className="vn-field">
              <label htmlFor="vn-link">Посилання на меню / соцмережі</label>
              <input
                id="vn-link"
                name="menuOrSocialLink"
                type="text"
                inputMode="url"
                required
                value={form.menuOrSocialLink}
                onChange={onChange("menuOrSocialLink")}
                placeholder="https://instagram.com/… або сайт меню"
              />
            </motion.div>

            {status === "error" && errorMsg ? (
              <motion.p
                className="vn-error"
                role="alert"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {errorMsg}
              </motion.p>
            ) : null}

            <motion.div variants={item}>
              <button type="submit" className="vn-submit" disabled={status === "sending"}>
                {status === "sending" ? "Надсилаємо…" : "Надіслати заявку"}
              </button>
              <p className="vn-form-foot">
                Не впевнені? Перегляньте{" "}
                <a href="/business.html" className="vn-inline-link">
                  сторінку для бізнесу
                </a>{" "}
                з демо та тарифами.
              </p>
              <p className="vn-form-micro">
                Натискаючи кнопку, ви погоджуєтесь на контакт щодо заявки. Ми не
                передаємо ваші дані третім сторонам для розсилок.
              </p>
            </motion.div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

const mount = document.getElementById("venue-root");
if (mount) {
  createRoot(mount).render(
    <React.StrictMode>
      <VenueRegisterApp />
    </React.StrictMode>
  );
}
