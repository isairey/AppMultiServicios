import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";

export type TornReceiptProps = {
  venueName: string;
  locale?: "uk" | "en";
};

const FALLBACK_UK = "Ваш заклад";
const FALLBACK_EN = "Your venue";

const TIP_OPTIONS = [10, 15, 20, 25] as const;

const easeOut = [0.22, 1, 0.36, 1] as const;

function layoutTransition(reduceMotion: boolean) {
  return {
    layout: reduceMotion
      ? { duration: 0.05 }
      : { duration: 0.4, ease: easeOut },
  };
}

function copy(locale: "uk" | "en") {
  if (locale === "en") {
    return {
      tipsConnectionTitle: "TIPS ARE GRATITUDE, NOT JUST NUMBERS",
      tipsConnectionBody:
        "PROSTIR removes the awkwardness around the terminal—no hovering by the POS while everyone waits. Guests pick their thanks in one tap, so the room stays human, not a queue.",
      receiptStubLine: "KEEP THIS RECEIPT",
      tipsLabel: "Tip",
      waiterLabel: "Server",
      chatPick: "Pick a tip — watch the total update.",
      chatThanks: (p: number) => `Thanks — ${p}% tip added.`,
      kissHint:
        "At 25%, your server can send a thank-you emoji automatically (or manually). It boosts emotional loyalty.",
      footer: "Your digital trace in the city's space",
    };
  }
  return {
    tipsConnectionTitle: "ЧАЙОВІ — ЦЕ ВДЯЧНІСТЬ, А НЕ ЦИФРИ",
    tipsConnectionBody:
      "PROSTIR прибирає незручність з терміналом: жодного «зачекайте біля POS». Гість сам обирає вдячність — один клік, і зал залишається про людяність, а не про чергу.",
    receiptStubLine: "ЗБЕРІГАЙТЕ КОРІНЬ",
    tipsLabel: "Чайові",
    waiterLabel: "Офіціант",
    chatPick: "Оберіть відсоток чайових — сума оновиться.",
    chatThanks: (p: number) => `Дякуємо! Додано чайові ${p}%.`,
    kissHint:
      "При виборі 25% чайових офіціант автоматично (або вручну) надсилає вам смайлик подяки. Це підвищує емоційну лояльність гостей.",
    footer: "Твій цифровий слід у просторі міста",
  };
}

type Line = { name: string; price: number };

type ReceiptInnerProps = {
  displayVenue: string;
  dateTimeLine: string;
  lines: Line[];
  grandTotal: number;
  tipPct: number | null;
  setTipPct: (p: number) => void;
  t: ReturnType<typeof copy>;
  reduceMotion: boolean;
};

function ReceiptInner({
  displayVenue,
  dateTimeLine,
  lines,
  grandTotal,
  tipPct,
  setTipPct,
  t,
  reduceMotion,
}: ReceiptInnerProps): React.ReactElement {
  return (
    <div className="vn-receipt-inner">
      <div className="vn-receipt-brand">PROSTIR × {displayVenue}</div>
      <div className="vn-receipt-meta">{dateTimeLine}</div>
      <div className="vn-receipt-rule" aria-hidden />
      <ul className="vn-receipt-lines">
        {lines.map((row) => (
          <li key={row.name} className="vn-receipt-line">
            <span className="vn-receipt-item">{row.name}</span>
            <span className="vn-receipt-price">{row.price} UAH</span>
          </li>
        ))}
      </ul>
      <div className="vn-receipt-rule vn-receipt-rule--strong" aria-hidden />
      <div className="vn-receipt-total-row">
        <span className="vn-receipt-total-label">TOTAL</span>
        <motion.span
          className="vn-receipt-total-val"
          key={grandTotal}
          initial={reduceMotion ? undefined : { scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 440, damping: 22 }}
        >
          {grandTotal} UAH
        </motion.span>
      </div>

      <div className="vn-receipt-tips">
        <div className="vn-receipt-tips-label">{t.tipsLabel}</div>
        <div className="vn-receipt-tips-btns" role="group" aria-label={t.tipsLabel}>
          {TIP_OPTIONS.map((pct) => (
            <button
              key={pct}
              type="button"
              className={"vn-tip-btn" + (tipPct === pct ? " vn-tip-btn--active" : "")}
              onClick={() => setTipPct(pct)}
            >
              {pct}%
            </button>
          ))}
        </div>
      </div>

      <p className="vn-receipt-footer">{t.footer}</p>
    </div>
  );
}

export function TornReceipt({ venueName, locale = "uk" }: TornReceiptProps): React.ReactElement {
  const reduceMotion = useReducedMotion();
  const receiptZoneRef = useRef<HTMLDivElement>(null);
  const tipsIntroId = useId();
  const t = copy(locale);
  const displayVenue =
    venueName.trim() || (locale === "en" ? FALLBACK_EN : FALLBACK_UK);

  const dateTimeLine = useMemo(() => {
    return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "uk-UA", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date());
  }, [locale]);

  const lines = useMemo(
    () => [
      { name: "Negroni", price: 250 },
      { name: "Truffle Pasta", price: 420 },
    ],
    []
  );
  const subtotal = lines.reduce((s, l) => s + l.price, 0);

  const [tipPct, setTipPct] = useState<number | null>(null);
  const [showKiss, setShowKiss] = useState(false);

  const tipAmount =
    tipPct != null ? Math.round((subtotal * tipPct) / 100) : 0;
  const grandTotal = subtotal + tipAmount;

  const { scrollYProgress } = useScroll({
    target: receiptZoneRef,
    offset: ["start 0.88", "end 0.22"],
  });

  const tearProgress = useSpring(scrollYProgress, {
    stiffness: reduceMotion ? 500 : 170,
    damping: reduceMotion ? 80 : 30,
    mass: 0.32,
    restDelta: 0.0008,
  });

  const stubY = useTransform(
    tearProgress,
    [0, 1],
    reduceMotion ? [0, 0] : [0, -44]
  );
  const stubRotate = useTransform(
    tearProgress,
    [0, 1],
    reduceMotion ? [0, 0] : [0, -2.8]
  );

  const receiptInnerProps: ReceiptInnerProps = {
    displayVenue,
    dateTimeLine,
    lines,
    grandTotal,
    tipPct,
    setTipPct,
    t,
    reduceMotion: Boolean(reduceMotion),
  };

  useEffect(() => {
    if (tipPct === 25) {
      const id = window.setTimeout(() => setShowKiss(true), 500);
      return () => {
        window.clearTimeout(id);
        setShowKiss(false);
      };
    }
    setShowKiss(false);
    return undefined;
  }, [tipPct]);

  return (
    <div className="biz-receipt-experience">
      {/* Use <div>, not <header>: global app.css targets `header` as fixed nav */}
      <div
        className="biz-tips-connection"
        role="group"
        aria-labelledby={tipsIntroId}
      >
        <h3 className="biz-tips-connection-title" id={tipsIntroId}>
          {t.tipsConnectionTitle}
        </h3>
        <p className="biz-tips-connection-body">{t.tipsConnectionBody}</p>
      </div>

      <motion.div
        className="vn-receipt-ambient"
        initial={{ opacity: 0, y: 22 }}
        whileInView={
          reduceMotion
            ? { opacity: 1, y: 0 }
            : {
                opacity: 1,
                y: 0,
                x: [0, -5, 4, -3, 3, -1, 0],
                rotate: [0.4, -0.35, 0.2, -0.15, 0],
              }
        }
        viewport={{ once: true, amount: 0.35 }}
        transition={
          reduceMotion
            ? { duration: 0.35 }
            : {
                opacity: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
                y: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
                x: {
                  duration: 0.62,
                  ease: "easeOut",
                  times: [0, 0.15, 0.32, 0.48, 0.65, 0.82, 1],
                },
                rotate: {
                  duration: 0.55,
                  ease: "easeOut",
                  times: [0, 0.25, 0.5, 0.72, 1],
                },
              }
        }
      >
        <div ref={receiptZoneRef} className="vn-receipt-scroll-zone">
          <div className="vn-receipt-glow" aria-hidden />
          <div className="vn-receipt-assembly">
            <motion.div
              className="vn-receipt-stub"
              style={{ y: stubY, rotate: stubRotate }}
              aria-hidden
            >
              <span className="vn-receipt-stub__line">{t.receiptStubLine}</span>
            </motion.div>
            <div className="vn-receipt-paper">
              <ReceiptInner {...receiptInnerProps} />
            </div>
          </div>
        </div>

        <motion.div
          className="biz-waiter-chat"
          aria-live="polite"
          layout={!reduceMotion}
          transition={layoutTransition(Boolean(reduceMotion))}
        >
          <div className="biz-waiter-avatar" aria-hidden="true">
            <svg viewBox="0 0 32 32" width="32" height="32" fill="none">
              <circle cx="16" cy="11" r="5" stroke="currentColor" strokeWidth="1.4" />
              <path
                d="M8 26c0-4.4 3.6-8 8-8s8 3.6 8 8"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <motion.div
            className="biz-waiter-col"
            layout={!reduceMotion}
            transition={layoutTransition(Boolean(reduceMotion))}
          >
            <div className="biz-waiter-name">{t.waiterLabel}</div>
            <motion.div
              className="biz-waiter-bubble"
              layout={!reduceMotion}
              transition={layoutTransition(Boolean(reduceMotion))}
            >
              <AnimatePresence mode="wait">
                {!tipPct ? (
                  <motion.p
                    key="pick"
                    className="biz-waiter-text"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.25, ease: easeOut }}
                  >
                    {t.chatPick}
                  </motion.p>
                ) : (
                  <motion.div
                    key="thread"
                    className="biz-waiter-thread"
                    layout={!reduceMotion}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.28,
                      ease: easeOut,
                      ...layoutTransition(Boolean(reduceMotion)),
                    }}
                  >
                    <AnimatePresence initial={false} mode="popLayout">
                      <motion.p
                        key={tipPct}
                        className="biz-waiter-text"
                        layout={!reduceMotion}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{
                          duration: reduceMotion ? 0.08 : 0.28,
                          ease: easeOut,
                          ...layoutTransition(Boolean(reduceMotion)),
                        }}
                      >
                        {t.chatThanks(tipPct)}
                      </motion.p>
                    </AnimatePresence>
                    <AnimatePresence initial={false}>
                      {showKiss && tipPct === 25 ? (
                        <motion.div
                          key="kiss"
                          className="biz-kiss-wrap"
                          layout={!reduceMotion}
                          initial={
                            reduceMotion
                              ? { opacity: 1 }
                              : { opacity: 0, scale: 0.2, rotate: -18 }
                          }
                          animate={
                            reduceMotion
                              ? { opacity: 1 }
                              : {
                                  opacity: 1,
                                  scale: 1,
                                  rotate: [0, 12, -8, 6, 0],
                                }
                          }
                          exit={
                            reduceMotion
                              ? { opacity: 0 }
                              : { opacity: 0, scale: 0.75, y: -6 }
                          }
                          transition={{
                            opacity: { duration: reduceMotion ? 0.1 : 0.32, ease: easeOut },
                            scale: { duration: 0.32, ease: easeOut },
                            y: { duration: 0.28, ease: easeOut },
                            rotate: { duration: 0.85, ease: "easeInOut" },
                          }}
                        >
                          <span className="biz-kiss-emoji" aria-hidden="true">
                            😘
                          </span>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            <AnimatePresence initial={false}>
              {tipPct === 25 && showKiss ? (
                <motion.p
                  key="kiss-hint"
                  className="biz-kiss-hint"
                  layout={!reduceMotion}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{
                    opacity: { duration: reduceMotion ? 0.1 : 0.3, ease: easeOut },
                    y: { duration: reduceMotion ? 0.1 : 0.3, ease: easeOut },
                    layout: reduceMotion
                      ? { duration: 0.05 }
                      : { duration: 0.38, ease: easeOut },
                  }}
                >
                  {t.kissHint}
                </motion.p>
              ) : null}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
