import { describe, expect, it, vi } from 'vitest';
import { openLocalRoomChannel, type ChannelFactory } from './localRoomChannel';
import type { ReadingWindow, RemoteWindow } from './types';

const john: ReadingWindow = {
  scripture: { translationId: 'webp', book: 'JHN', chapter: 1 }, anchorVerse: 1,
};
const atFive: ReadingWindow = { ...john, anchorVerse: 5 };

class FakeChannel {
  static groups = new Map<string, Set<FakeChannel>>();
  onmessage: ((event: MessageEvent) => void) | null = null;
  constructor(readonly name: string) {
    const peers = FakeChannel.groups.get(name) ?? new Set<FakeChannel>();
    peers.add(this);
    FakeChannel.groups.set(name, peers);
  }
  postMessage(data: unknown) {
    for (const peer of FakeChannel.groups.get(this.name) ?? []) {
      if (peer !== this) peer.onmessage?.({ data } as MessageEvent);
    }
  }
  close() { FakeChannel.groups.get(this.name)?.delete(this); }
}
const factory: ChannelFactory = (name) => new FakeChannel(name);
const self = (userId: string, sessionId = userId): RemoteWindow => ({
  userId, sessionId, displayName: userId, revision: 0, online: true, window: john,
});

describe('local same-browser room transport', () => {
  it('discovers an existing participant and exchanges reading positions without durable events', () => {
    const first = vi.fn();
    const second = vi.fn();
    const a = openLocalRoomChannel('room1', self('lu'), { onWindow: first }, factory);
    const b = openLocalRoomChannel('room1', self('paula'), { onWindow: second }, factory);
    expect(first).toHaveBeenCalledWith(expect.objectContaining({ userId: 'paula' }));
    expect(second).toHaveBeenCalledWith(expect.objectContaining({ userId: 'lu' }));
    b.publish(atFive);
    expect(first).toHaveBeenLastCalledWith(expect.objectContaining({
      userId: 'paula', revision: 1, window: atFive,
    }));
    a.close(); b.close();
  });

  it('does not leak presence between differently named rooms', () => {
    const receive = vi.fn();
    const a = openLocalRoomChannel('secret-a', self('lu'), { onWindow: receive }, factory);
    const b = openLocalRoomChannel('secret-b', self('ron'), { onWindow: vi.fn() }, factory);
    expect(receive).not.toHaveBeenCalled();
    a.close(); b.close();
  });

  it('marks a departed session offline while retaining its last window', () => {
    const leave = vi.fn();
    const a = openLocalRoomChannel('room3', self('lu'), { onWindow: vi.fn(), onLeave: leave }, factory);
    const b = openLocalRoomChannel('room3', self('paula'), { onWindow: vi.fn() }, factory);
    b.close();
    expect(leave).toHaveBeenCalledWith('paula', 'paula');
    a.close();
  });
});
