import type { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifySessionToken } from '../utils/session-jwt';

export const ROOM_PREFIX = 'venue:';

export type TableUpdatedPayload = {
  venueId: string;
  tableId: number;
  status: string;
  updatedAt: string;
};

let io: SocketIOServer | null = null;

function resolveApiKey(): string | null {
  return process.env.PROSTIR_API_KEY ?? null;
}

function authenticateSocket(
  socket: Socket,
  next: (err?: Error) => void
): void {
  const { token, apiKey } = socket.handshake.auth as {
    token?: string;
    apiKey?: string;
  };

  const headerKey =
    (socket.handshake.headers['x-prostir-api-key'] as string | undefined) ??
    null;

  const configuredApiKey = resolveApiKey();

  if (configuredApiKey) {
    const supplied = apiKey ?? headerKey;
    if (supplied && supplied === configuredApiKey) {
      return next();
    }
  }

  if (token) {
    try {
      verifySessionToken(token);
      return next();
    } catch {
      return next(new Error('AUTH_INVALID_TOKEN'));
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    return next();
  }

  next(new Error('AUTH_REQUIRED'));
}

export function initSocketIO(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    const { venueId } = socket.handshake.query as { venueId?: string };

    if (venueId) {
      const room = `${ROOM_PREFIX}${venueId}`;
      void socket.join(room);
      console.log(`[WS] ${socket.id} joined ${room}`);
    }

    socket.on('join_venue', (vid: unknown) => {
      if (typeof vid === 'string' && vid.length > 0) {
        void socket.join(`${ROOM_PREFIX}${vid}`);
        console.log(`[WS] ${socket.id} joined ${ROOM_PREFIX}${vid}`);
      }
    });

    socket.on('leave_venue', (vid: unknown) => {
      if (typeof vid === 'string') {
        void socket.leave(`${ROOM_PREFIX}${vid}`);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`[WS] ${socket.id} disconnected: ${reason}`);
    });
  });

  return io;
}

export function getIO(): SocketIOServer {
  if (!io) throw new Error('Socket.io not initialised — call initSocketIO first');
  return io;
}

export function emitTableUpdated(
  venueId: string,
  tableId: number,
  status: string
): void {
  if (!io) return;
  const payload: TableUpdatedPayload = {
    venueId,
    tableId,
    status,
    updatedAt: new Date().toISOString(),
  };
  io.to(`${ROOM_PREFIX}${venueId}`).emit('TABLE_UPDATED', payload);
  console.log(`[WS] TABLE_UPDATED → ${ROOM_PREFIX}${venueId}`, payload);
}
