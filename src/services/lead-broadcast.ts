import { EventEmitter } from 'events';

const emitter = new EventEmitter();
emitter.setMaxListeners(100);

export type LeadBroadcastPayload =
  | { type: 'lead_created'; lead: unknown }
  | { type: 'lead_updated'; lead: unknown };

export function broadcastLeadEvent(payload: LeadBroadcastPayload): void {
  emitter.emit('message', payload);
}

export function subscribeLeadEvents(
  handler: (payload: LeadBroadcastPayload) => void
): () => void {
  emitter.on('message', handler);
  return () => {
    emitter.off('message', handler);
  };
}
