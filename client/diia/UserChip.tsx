import React from "react";
import { motion } from "motion/react";

export type DiiaUser = {
  id: string;
  diia_id: string;
  full_name: string;
  is_verified: boolean;
};

function firstName(full: string): string {
  const p = full.trim().split(/\s+/)[0];
  return p || full;
}

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function UserChip({
  user,
  onLogout,
  logoutLabel,
}: {
  user: DiiaUser;
  onLogout: () => void;
  logoutLabel: string;
}) {
  const reduce = prefersReducedMotion();

  return (
    <motion.div
      className="prostir-user-chip"
      initial={reduce ? false : { opacity: 0, scale: 0.92, y: -6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 26, mass: 0.9 }}
    >
      <span className="prostir-user-chip-ic" aria-hidden>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
      </span>
      <span className="prostir-user-chip-name">{firstName(user.full_name)}</span>
      <span className="prostir-user-chip-check" title="Diia">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="10" fill="rgba(22,163,74,0.15)" stroke="#16a34a" strokeWidth="1.5" />
          <path d="M8 12l2.5 2.5L16 9" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <button type="button" className="prostir-user-chip-out" onClick={onLogout}>
        {logoutLabel}
      </button>
    </motion.div>
  );
}
