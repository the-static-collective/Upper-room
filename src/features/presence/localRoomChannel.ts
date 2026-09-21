import type { ReadingWindow, RemoteWindow } from './types';

/**
 * A same-origin, same-browser rehearsal channel. BroadcastChannel cannot cross
 * devices; an authenticated server room must replace this transport for phones.
 */
export type ChannelPort = {
  onmessage: ((event: MessageEvent) => void) | null;
  postMessage(data: unknown): void;
  close(): void;
};
export type ChannelFactory = (name: string) => ChannelPort;
type Callbacks = {
  onWindow(incoming: RemoteWindow): void;
  onLeave?(userId: string, sessionId: string): void;
};
type Packet =
  | { kind: 'hello' | 'snapshot' | 'viewport'; senderId: string; participant: RemoteWindow }
  | { kind: 'bye'; senderId: string; participant: RemoteWindow };

export function openLocalRoomChannel(
  roomId: string,
  initial: RemoteWindow,
  callbacks: Callbacks,
  factory: ChannelFactory = (name) => new BroadcastChannel(name),
) {
  if (!/^[a-zA-Z0-9-]{1,100}$/.test(roomId)) throw new Error('Invalid local room id.');
  let self: RemoteWindow = { ...initial, revision: 0, online: true };
  const port = factory(`upper-room:local:${roomId}`);
  let closed = false;

  const send = (kind: Packet['kind']) => {
    if (!closed) port.postMessage({ kind, senderId: self.sessionId, participant: self } satisfies Packet);
  };

  port.onmessage = (event) => {
    const packet: unknown = event.data;
    if (!packet || typeof packet !== 'object' || !('kind' in packet) ||
        !('senderId' in packet) || !('participant' in packet)) return;
    const data = packet as Packet;
    const other = data.participant;
    if (!other || typeof other !== 'object' ||
        typeof other.userId !== 'string' ||
        typeof other.sessionId !== 'string' ||
        typeof other.revision !== 'number' ||
        !other.window?.scripture ||
        other.sessionId !== data.senderId ||
        data.senderId === self.sessionId) return;
    if (data.kind === 'bye') {
      callbacks.onLeave?.(other.userId, other.sessionId);
    } else if (data.kind === 'hello' || data.kind === 'snapshot' || data.kind === 'viewport') {
      callbacks.onWindow(other);
      if (data.kind === 'hello') send('snapshot');
    }
  };

  // An existing tab answers hello with its current reading location.
  send('hello');

  return {
    publish(window: ReadingWindow) {
      if (closed) return;
      self = { ...self, revision: self.revision + 1, window, online: true };
      send('viewport');
    },
    close() {
      if (closed) return;
      send('bye');
      closed = true;
      port.onmessage = null;
      port.close();
    },
  };
}
