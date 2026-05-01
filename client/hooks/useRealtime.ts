import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import type {
  ConnectionStatus,
  TableUpdatedPayload,
} from "../floormap/types";
import { WS_EVENTS } from "../floormap/types";

type UseRealtimeOptions = {
  venueId: string;
  serverUrl?: string;
  token?: string;
  apiKey?: string;
};

type UseRealtimeResult = {
  connectionStatus: ConnectionStatus;
  lastEvent: TableUpdatedPayload | null;
};

function resolveServerUrl(override?: string): string {
  if (override) return override;
  if (typeof window === "undefined") return "";
  const w = window as Window & { __PROSTIR_API_BASE__?: string };
  if (w.__PROSTIR_API_BASE__) return String(w.__PROSTIR_API_BASE__).replace(/\/$/, "");
  const { hostname } = window.location;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return `http://localhost:${window.location.port || "8080"}`;
  }
  return "https://prostir-web-production.up.railway.app";
}

export function useRealtime({
  venueId,
  serverUrl,
  token,
  apiKey,
}: UseRealtimeOptions): UseRealtimeResult {
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("offline");
  const [lastEvent, setLastEvent] = useState<TableUpdatedPayload | null>(null);

  const hardSync = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["tables", venueId] });
  }, [queryClient, venueId]);

  useEffect(() => {
    const url = resolveServerUrl(serverUrl);
    if (!url) return;

    const socket = io(url, {
      transports: ["websocket", "polling"],
      reconnectionDelay: 1000,
      reconnectionDelayMax: 8000,
      reconnectionAttempts: Infinity,
      auth: {
        ...(token ? { token } : {}),
        ...(apiKey ? { apiKey } : {}),
      },
      query: { venueId },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnectionStatus("connected");
      socket.emit(WS_EVENTS.JOIN_VENUE, venueId);
      hardSync();
    });

    socket.on("disconnect", () => {
      setConnectionStatus("offline");
    });

    socket.on("connect_error", () => {
      setConnectionStatus("reconnecting");
    });

    socket.io.on("reconnect_attempt", () => {
      setConnectionStatus("reconnecting");
    });

    socket.io.on("reconnect", () => {
      setConnectionStatus("connected");
      hardSync();
    });

    socket.on(WS_EVENTS.TABLE_UPDATED, (payload: TableUpdatedPayload) => {
      setLastEvent(payload);
      void queryClient.invalidateQueries({ queryKey: ["tables", venueId] });
    });

    return () => {
      socket.emit(WS_EVENTS.LEAVE_VENUE, venueId);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [venueId, serverUrl, token, apiKey, queryClient, hardSync]);

  return { connectionStatus, lastEvent };
}
