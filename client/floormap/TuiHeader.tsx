import { AnimatePresence, motion } from "motion/react";
import React from "react";
import type { ConnectionStatus } from "./types";

type Props = {
  venueName: string;
  connectionStatus: ConnectionStatus;
  tableCount: number;
  freeCount: number;
};

const statusConfig: Record<
  ConnectionStatus,
  { label: string; color: string; dot: string }
> = {
  connected: {
    label: "LIVE",
    color: "#22c55e",
    dot: "#22c55e",
  },
  reconnecting: {
    label: "SYSTEM: RECONNECTING...",
    color: "#f59e0b",
    dot: "#f59e0b",
  },
  offline: {
    label: "OFFLINE",
    color: "#ef4444",
    dot: "#ef4444",
  },
};

export function TuiHeader({
  venueName,
  connectionStatus,
  tableCount,
  freeCount,
}: Props): React.ReactElement {
  const cfg = statusConfig[connectionStatus];

  return (
    <header style={styles.root}>
      <div style={styles.inner}>
        <span style={styles.logo}>PROSTIR</span>

        <span style={styles.separator}>·</span>

        <span style={styles.venue}>{venueName.toUpperCase()}</span>

        <span style={styles.separator}>·</span>

        <span style={styles.counter}>
          {freeCount}/{tableCount}{" "}
          <span style={styles.counterLabel}>FREE</span>
        </span>

        <div style={styles.spacer} />

        <AnimatePresence mode="wait">
          <motion.span
            key={connectionStatus}
            style={{ ...styles.status, color: cfg.color }}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2 }}
          >
            <motion.span
              style={{ ...styles.dot, background: cfg.dot }}
              animate={
                connectionStatus === "reconnecting"
                  ? { opacity: [1, 0.2, 1], scale: [1, 1.4, 1] }
                  : connectionStatus === "connected"
                  ? { opacity: [1, 0.5, 1] }
                  : { opacity: 1 }
              }
              transition={{ duration: 1.4, repeat: Infinity }}
            />
            {"[ "}
            {cfg.label}
            {" ]"}
          </motion.span>
        </AnimatePresence>
      </div>
    </header>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    background: "rgba(0,0,0,0.88)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    fontFamily: "'JetBrains Mono', 'Fira Code', ui-monospace, monospace",
  },
  inner: {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "0.65rem 1.25rem",
    fontSize: "0.7rem",
    letterSpacing: "0.08em",
    color: "rgba(255,255,255,0.55)",
    whiteSpace: "nowrap",
    overflow: "hidden",
  },
  logo: {
    fontWeight: 800,
    letterSpacing: "0.14em",
    color: "#fff",
  },
  separator: {
    opacity: 0.3,
  },
  venue: {
    color: "rgba(255,255,255,0.8)",
    letterSpacing: "0.1em",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "200px",
  },
  counter: {
    fontVariantNumeric: "tabular-nums",
    color: "#a78bfa",
  },
  counterLabel: {
    opacity: 0.55,
    fontSize: "0.6rem",
  },
  spacer: {
    flex: 1,
    minWidth: "1rem",
  },
  status: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    fontWeight: 700,
    letterSpacing: "0.1em",
    flexShrink: 0,
  },
  dot: {
    display: "inline-block",
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    flexShrink: 0,
  },
};
