export type TableStatus = 'available' | 'booked' | 'paid' | 'occupied' | 'reserved';

export type VenueTable = {
  id: number;
  venueId: string;
  seats: number;
  view: string;
  zone: string;
  status: TableStatus;
  orderId?: string;
};

export type TableUpdatedPayload = {
  venueId: string;
  tableId: number;
  status: string;
  updatedAt: string;
};

export type ConnectionStatus = 'connected' | 'reconnecting' | 'offline';

export const WS_EVENTS = {
  TABLE_UPDATED: 'TABLE_UPDATED',
  JOIN_VENUE: 'join_venue',
  LEAVE_VENUE: 'leave_venue',
} as const;
