import { motion } from "motion/react";
import React, { useEffect, useRef } from "react";
import type { VenueTable } from "./types";

type Props = {
  table: VenueTable;
  isJustUpdated: boolean;
};

const statusMeta: Record<
  string,
  { label: string; bg: string; border: string; text: string; glow?: string }
> = {
  available: {
    label: "FREE",
    bg: "rgba(34,197,94,0.06)",
    border: "rgba(34,197,94,0.25)",
    text: "#4ade80",
    glow: "rgba(34,197,94,0.15)",
  },
  booked: {
    label: "BOOKED",
    bg: "rgba(139,92,246,0.08)",
    border: "rgba(139,92,246,0.3)",
    text: "#a78bfa",
    glow: "rgba(139,92,246,0.18)",
  },
  occupied: {
    label: "OCCUPIED",
    bg: "rgba(251,146,60,0.07)",
    border: "rgba(251,146,60,0.28)",
    text: "#fb923c",
  },
  reserved: {
    label: "RESERVED",
    bg: "rgba(99,102,241,0.07)",
    border: "rgba(99,102,241,0.28)",
    text: "#818cf8",
  },
  paid: {
    label: "PAID",
    bg: "#ffffff",
    border: "#000000",
    text: "#000000",
    glow: "rgba(255,255,255,0.35)",
  },
};

const defaultMeta = {
  label: "UNKNOWN",
  bg: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.12)",
  text: "rgba(255,255,255,0.4)",
};

export function TableCell({ table, isJustUpdated }: Props): React.ReactElement {
  const meta = statusMeta[table.status] ?? defaultMeta;
  const prevStatus = useRef(table.status);

  useEffect(() => {
    prevStatus.current = table.status;
  }, [table.status]);

  const isPaid = table.status === "paid";

  return (
    <motion.div
      layout
      initial={false}
      animate={{
        backgroundColor: meta.bg,
        borderColor: meta.border,
        color: meta.text,
        boxShadow: isJustUpdated && meta.glow
          ? `0 0 0 2px ${meta.border}, 0 0 24px ${meta.glow}`
          : `0 0 0 1px ${meta.border}`,
        scale: isJustUpdated ? [1, 1.06, 1] : 1,
      }}
      transition={{
        backgroundColor: { duration: 0.45, ease: "easeInOut" },
        borderColor: { duration: 0.45 },
        color: { duration: 0.3 },
        boxShadow: { duration: 0.55 },
        scale: { duration: 0.35, times: [0, 0.5, 1] },
      }}
      style={styles.cell}
      role="listitem"
      aria-label={`Table ${table.id}, ${table.seats} seats, ${table.view}, ${meta.label}`}
    >
      {isPaid && (
        <motion.div
          style={styles.invertOverlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          aria-hidden
        />
      )}

      <div style={styles.topRow}>
        <span style={styles.tableNum}>{String(table.id).padStart(2, "0")}</span>
        <motion.span
          style={{ ...styles.statusPill, color: meta.text }}
          animate={isJustUpdated ? { scale: [1, 1.15, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          {meta.label}
        </motion.span>
      </div>

      <div style={styles.seatsRow}>
        <span style={styles.seatsIcon} aria-hidden>
          {"▣".repeat(Math.min(table.seats, 6))}
        </span>
        <span style={styles.seatsLabel}>{table.seats} seats</span>
      </div>

      <div style={{ ...styles.view, opacity: isPaid ? 0.55 : 0.45 }}>
        {table.view}
      </div>

      <div style={styles.zone}>Z-{table.zone}</div>
    </motion.div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  cell: {
    position: "relative",
    borderRadius: "14px",
    border: "1px solid transparent",
    padding: "0.9rem 1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.3rem",
    fontFamily: "'JetBrains Mono', 'Fira Code', ui-monospace, monospace",
    overflow: "hidden",
    cursor: "default",
    minHeight: "112px",
  },
  invertOverlay: {
    position: "absolute",
    inset: 0,
    background: "#fff",
    pointerEvents: "none",
    zIndex: 0,
    borderRadius: "13px",
  },
  topRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
    zIndex: 1,
  },
  tableNum: {
    fontSize: "1.05rem",
    fontWeight: 800,
    letterSpacing: "-0.02em",
  },
  statusPill: {
    fontSize: "0.55rem",
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    border: "1px solid currentColor",
    borderRadius: "999px",
    padding: "0.15rem 0.5rem",
    opacity: 0.9,
  },
  seatsRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    position: "relative",
    zIndex: 1,
  },
  seatsIcon: {
    fontSize: "0.6rem",
    letterSpacing: "0.1em",
    opacity: 0.6,
  },
  seatsLabel: {
    fontSize: "0.65rem",
    opacity: 0.55,
  },
  view: {
    fontSize: "0.62rem",
    letterSpacing: "0.06em",
    position: "relative",
    zIndex: 1,
  },
  zone: {
    fontSize: "0.55rem",
    letterSpacing: "0.12em",
    opacity: 0.3,
    position: "relative",
    zIndex: 1,
  },
};
