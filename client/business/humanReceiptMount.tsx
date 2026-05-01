import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { TornReceipt } from "../components/TornReceipt";

function langFromStorage(): "uk" | "en" {
  return localStorage.getItem("prostir_lang") === "en" ? "en" : "uk";
}

const rootEl = document.getElementById("biz-receipt-root");
const DATA_VENUE =
  rootEl?.getAttribute("data-venue-name")?.trim() || "Cafe Aura";

function BizReceiptHost(): React.ReactElement {
  const [locale, setLocale] = useState<"uk" | "en">(langFromStorage);

  useEffect(() => {
    const sync = () => setLocale(langFromStorage());
    window.addEventListener("prostir-lang-change", sync);
    return () => window.removeEventListener("prostir-lang-change", sync);
  }, []);

  return <TornReceipt venueName={DATA_VENUE} locale={locale} />;
}

if (rootEl) {
  createRoot(rootEl).render(
    <React.StrictMode>
      <BizReceiptHost />
    </React.StrictMode>
  );
}
