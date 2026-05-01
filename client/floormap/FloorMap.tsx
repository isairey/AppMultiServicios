import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import React, { useMemo, useRef } from "react";
import { useRealtime } from "../hooks/useRealtime";
import { TableCell } from "./TableCell";
import { TuiHeader } from "./TuiHeader";
import type { VenueTable } from "./types";

type Props = {
  venueId: string;
  venueName?: string;
  token?: string;
  apiKey?: string;
};

function apiBase(): string {
  if (typeof window === "undefined") return "";
  const w = window as Window & { __PROSTIR_API_BASE__?: string };
  if (w.__PROSTIR_API_BASE__) return String(w.__PROSTIR_API_BASE__).replace(/\/$/, "");
  const { hostname } = window.location;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return `http://localhost:${window.location.port || "8080"}`;
  }
  return "https://prostir-web-production.up.railway.app";
}

export function FloorMap({
  venueId,
  venueName = venueId,
  token,
  apiKey,
}: Props): React.ReactElement {
  const { data: tables = [], isLoading, isError } = useQuery<VenueTable[]>({
    queryKey: ["tables", venueId],
    queryFn: async () => {
      const res = await fetch(`${apiBase()}/api/tables/${venueId}`);
      if (!res.ok) throw new Error("Failed to load tables");
      return res.json() as Promise<VenueTable[]>;
    },
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

  const { connectionStatus, lastEvent } = useRealtime({
    venueId,
    token,
    apiKey,
  });

  const justUpdatedId = useRef<number | null>(null);
  if (lastEvent) {
    justUpdatedId.current = lastEvent.tableId;
    const timer = setTimeout(() => {
      justUpdatedId.current = null;
    }, 1600);
    void timer;
  }

  const freeCount = useMemo(
    () => tables.filter((t) => t.status === "available").length,
    [tables]
  );

  const grouped = useMemo(() => {
    const map = new Map<string, VenueTable[]>();
    for (const t of tables) {
      const zone = t.zone ?? "—";
      if (!map.has(zone)) map.set(zone, []);
      map.get(zone)!.push(t);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [tables]);

  return (
    <div style={styles.root}>
      <TuiHeader
        venueName={venueName}
        connectionStatus={connectionStatus}
        tableCount={tables.length}
        freeCount={freeCount}
      />

      <main style={styles.main}>
        <AnimatePresence>
          {isLoading && (
            <motion.div
              key="loader"
              style={styles.state}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <span style={styles.loaderText}>[ LOADING FLOOR MAP... ]</span>
            </motion.div>
          )}

          {isError && !isLoading && (
            <motion.div
              key="error"
              style={{ ...styles.state, color: "#ef4444" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              [ SYNC ERROR — CHECK CONNECTION ]
            </motion.div>
          )}
        </AnimatePresence>

        {!isLoading && !isError && grouped.length === 0 && (
          <div style={{ ...styles.state, opacity: 0.4 }}>
            [ NO TABLES FOUND FOR {venueId.toUpperCase()} ]
          </div>
        )}

        {grouped.map(([zone, zoneTables]) => (
          <section key={zone} style={styles.zoneSection}>
            <div style={styles.zoneLabel}>
              <span style={styles.zoneLine} aria-hidden />
              <span style={styles.zoneTag}>ZONE {zone}</span>
              <span style={styles.zoneLine} aria-hidden />
            </div>

            <div
              style={styles.grid}
              role="list"
              aria-label={`Zone ${zone} tables`}
            >
              {zoneTables.map((table) => (
                <TableCell
                  key={table.id}
                  table={table}
                  isJustUpdated={justUpdatedId.current === table.id}
                />
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    minHeight: "100vh",
    background: "#0a0a0e",
    color: "#fff",
    fontFamily: "'JetBrains Mono', 'Fira Code', ui-monospace, monospace",
  },
  main: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "2rem 1.25rem 4rem",
  },
  state: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "40vh",
    fontFamily: "'JetBrains Mono', 'Fira Code', ui-monospace, monospace",
    fontSize: "0.75rem",
    letterSpacing: "0.12em",
    color: "rgba(255,255,255,0.35)",
  },
  loaderText: {
    animation: "pulse 1.5s ease-in-out infinite",
  },
  zoneSection: {
    marginBottom: "2.5rem",
  },
  zoneLabel: {
    display: "flex",
    alignItems: "center",
    gap: "0.8rem",
    marginBottom: "1.1rem",
  },
  zoneLine: {
    flex: 1,
    height: "1px",
    background:
      "linear-gradient(90deg, rgba(139,92,246,0), rgba(139,92,246,0.3), rgba(139,92,246,0))",
  },
  zoneTag: {
    fontSize: "0.6rem",
    letterSpacing: "0.18em",
    color: "#a78bfa",
    fontWeight: 700,
    border: "1px solid rgba(139,92,246,0.25)",
    borderRadius: "999px",
    padding: "0.2rem 0.75rem",
    background: "rgba(139,92,246,0.06)",
    whiteSpace: "nowrap",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
    gap: "0.75rem",
  },
};
