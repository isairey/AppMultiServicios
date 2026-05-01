import React, { useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";

export type DiiaAuthModalCopy = {
  title: string;
  scanHint: string;
  close: string;
  simulate: string;
  loading: string;
  qrWait: string;
};

export type DiiaAuthModalProps = {
  open: boolean;
  onClose: () => void;
  authUrl: string | null;
  mockToken: string | null;
  loading: boolean;
  error: string | null;
  onSimulateScan: () => void;
  /** Показувати, коли бекенд повернув mockDiiaToken (тестовий вхід з телефону в локальній мережі). */
  showSimulateScan: boolean;
  copy: DiiaAuthModalCopy;
};

/**
 * Модалка входу через Дію: QR за authUrl та dev-кнопка симуляції сканування.
 */
export function DiiaAuthModal({
  open,
  onClose,
  authUrl,
  mockToken,
  loading,
  error,
  onSimulateScan,
  showSimulateScan,
  copy,
}: DiiaAuthModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="prostir-diia-modal-backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="prostir-diia-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="prostir-diia-modal-title"
      >
        <div className="prostir-diia-modal-head">
          <h2 id="prostir-diia-modal-title">{copy.title}</h2>
          <button type="button" className="prostir-diia-modal-x" onClick={onClose} aria-label={copy.close}>
            ×
          </button>
        </div>
        <p className="prostir-diia-modal-hint">{copy.scanHint}</p>

        <div className="prostir-diia-qr-wrap">
          {loading && !authUrl ? (
            <div className="prostir-diia-qr-placeholder">
              <div className="prostir-diia-spinner" aria-hidden />
              <span>{copy.loading}</span>
            </div>
          ) : authUrl ? (
            <div className="prostir-diia-qr-inner">
              <QRCodeSVG value={authUrl} size={220} level="M" includeMargin />
            </div>
          ) : (
            <div className="prostir-diia-qr-placeholder">
              <span>{copy.qrWait}</span>
            </div>
          )}
        </div>

        {error ? <div className="prostir-diia-modal-err">{error}</div> : null}

        <div className="prostir-diia-modal-actions">
          {showSimulateScan ? (
            <button
              type="button"
              className="prostir-diia-btn prostir-diia-btn-sim"
              onClick={onSimulateScan}
              disabled={loading || !mockToken}
            >
              {copy.simulate}
            </button>
          ) : null}
          <button type="button" className="prostir-diia-btn prostir-diia-btn-ghost" onClick={onClose}>
            {copy.close}
          </button>
        </div>
      </div>
    </div>
  );
}
