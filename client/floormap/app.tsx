import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { createRoot } from "react-dom/client";
import { FloorMap } from "./FloorMap";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 15_000),
      refetchOnWindowFocus: true,
    },
  },
});

declare global {
  interface Window {
    __PROSTIR_API_BASE__?: string;
    __PROSTIR_VENUE_ID__?: string;
    __PROSTIR_VENUE_NAME__?: string;
    __PROSTIR_TOKEN__?: string;
    __PROSTIR_API_KEY__?: string;
  }
}

function App(): React.ReactElement {
  const venueId =
    window.__PROSTIR_VENUE_ID__ ??
    new URLSearchParams(window.location.search).get("venueId") ??
    "cafe-aura";

  const venueName =
    window.__PROSTIR_VENUE_NAME__ ??
    new URLSearchParams(window.location.search).get("venueName") ??
    venueId;

  return (
    <QueryClientProvider client={queryClient}>
      <FloorMap
        venueId={venueId}
        venueName={venueName}
        token={window.__PROSTIR_TOKEN__}
        apiKey={window.__PROSTIR_API_KEY__}
      />
    </QueryClientProvider>
  );
}

const mount = document.getElementById("floormap-root");
if (mount) {
  createRoot(mount).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
