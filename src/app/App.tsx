import { useEffect, useRef, useState, type UIEvent } from 'react';
import Reader from '../features/scripture/Reader';
import type { ScriptureAdapter, ScriptureRef } from '../features/scripture/types';
import { webpAdapter } from '../features/scripture/webpAdapter';
import PresenceTabs from '../features/presence/PresenceTabs';
import {
  claimObservedLocation,
  createPresenceState,
  displayedWindow,
  markParticipantOffline,
  moveMyWindow,
  observeUser,
  receiveRemoteWindow,
  returnToMine,
} from '../features/presence/reducer';
import {
  openLocalRoomChannel,
  type ChannelFactory,
} from '../features/presence/localRoomChannel';
import type { PresenceState, ReadingWindow, RemoteWindow } from '../features/presence/types';

const JOHN_ONE: ScriptureRef = Object.freeze({
  translationId: 'webp',
  book: 'JHN',
  chapter: 1,
});

const START_WINDOW: ReadingWindow = Object.freeze({
  scripture: JOHN_ONE,
  anchorVerse: 1,
});

type Identity = { userId: string; sessionId: string; displayName: string };

type AppProps = {
  scriptureAdapter?: ScriptureAdapter;
  /** A same-browser rehearsal transport; this is not a phone-to-phone relay. */
  localChannelFactory?: ChannelFactory;
};

function newLocalId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Used only to name same-browser rehearsal channels, never for auth or access control.
  return `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function verseAtScrollTop(container: HTMLElement): number | null {
  const verses = Array.from(container.querySelectorAll<HTMLElement>('.verse'));
  if (verses.length === 0) return null;
  const top = container.getBoundingClientRect().top + 20;
  let nearest = verses[0]!;
  for (const verse of verses) {
    if (verse.getBoundingClientRect().top <= top) nearest = verse;
    else break;
  }
  const id = nearest.id.match(/-(\d+)-(\d+)$/);
  return id ? Number(id[2]) : null;
}

export default function App({
  scriptureAdapter = webpAdapter,
  localChannelFactory,
}: AppProps) {
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [presence, setPresence] = useState<PresenceState | null>(null);
  const channelRef = useRef<ReturnType<typeof openLocalRoomChannel> | null>(null);

  useEffect(() => {
    if (!identity || !roomId) return;
    const initial: RemoteWindow = {
      ...identity,
      revision: 0,
      online: true,
      window: START_WINDOW,
    };
    const channel = openLocalRoomChannel(
      roomId,
      initial,
      {
        onWindow: (remote) => setPresence((state) =>
          state ? receiveRemoteWindow(state, remote) : state),
        onLeave: (userId, sessionId) => setPresence((state) =>
          state ? markParticipantOffline(state, userId, sessionId) : state),
      },
      localChannelFactory,
    );
    channelRef.current = channel;
    return () => {
      channel.close();
      if (channelRef.current === channel) channelRef.current = null;
    };
  }, [identity, roomId, localChannelFactory]);

  useEffect(() => {
    if (identity && presence) channelRef.current?.publish(presence.mine);
  }, [identity, presence?.mine]);

  const join = () => {
    const displayName = name.trim();
    if (!displayName || identity) return;
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get('room') ?? '';
    const id = /^[a-zA-Z0-9-]{1,100}$/.test(fromUrl) ? fromUrl : newLocalId();
    params.set('room', id);
    window.history.replaceState(window.history.state, '', `${window.location.pathname}?${params.toString()}${window.location.hash}`);
    const sessionId = newLocalId();
    setRoomId(id);
    setIdentity({ userId: sessionId, sessionId, displayName });
    setPresence(createPresenceState(sessionId, START_WINDOW));
  };

  const current = presence ? displayedWindow(presence) : START_WINDOW;
  const observed = presence?.observingUserId
    ? presence.remote[presence.observingUserId]
    : null;
  const focusKey = observed
    ? `remote:${observed.userId}:${observed.sessionId}:${observed.revision}`
    : 'mine';

  const claim = () => setPresence((state) => state ? claimObservedLocation(state) : state);
  const onScroll = (event: UIEvent<HTMLElement>) => {
    if (!identity) return;
    const verse = verseAtScrollTop(event.currentTarget);
    if (verse === null) return;
    setPresence((state) => {
      if (!state || state.observingUserId !== null || state.mine.anchorVerse === verse) return state;
      return moveMyWindow(state, { ...state.mine, anchorVerse: verse });
    });
  };

  return (
    <div className="app-shell">
      <header className="room-header">
        <span className="room-name">Upper Room</span>
        <span className="room-state">John 1</span>
      </header>

      {!identity ? (
        <form className="presence-entry" onSubmit={(event) => { event.preventDefault(); join(); }}>
          <label htmlFor="reader-name">Your name</label>
          <input
            id="reader-name"
            type="text"
            maxLength={48}
            autoComplete="off"
            value={name}
            onChange={(event) => setName(event.currentTarget.value)}
          />
          <button type="submit" disabled={!name.trim()}>Open local room</button>
          <span className="presence-limitation">Same-browser tabs only · cross-phone rooms need a private relay.</span>
        </form>
      ) : (
        <div className="presence-bar">
          {presence && (
            <PresenceTabs
              state={presence}
              onObserve={(userId) => setPresence((state) => state ? observeUser(state, userId) : state)}
              onReturn={() => setPresence((state) => state ? returnToMine(state) : state)}
            />
          )}
          <span className="presence-limitation">
            Same-browser tabs only · open this room URL in another tab to share a reading window.
          </span>
        </div>
      )}

      <main
        className="scripture-surface"
        data-surface="scripture"
        tabIndex={0}
        onScroll={onScroll}
        onPointerDownCapture={claim}
        onWheelCapture={claim}
        onTouchStartCapture={claim}
        onKeyDownCapture={(event) => {
          if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End'].includes(event.key)) claim();
        }}
      >
        <Reader
          adapter={scriptureAdapter}
          scriptureRef={current.scripture}
          focusVerse={current.anchorVerse}
          focusKey={focusKey}
        />
      </main>
    </div>
  );
}
