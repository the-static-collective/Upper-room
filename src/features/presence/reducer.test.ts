import { describe, expect, it } from 'vitest';
import {
  claimObservedLocation,
  createPresenceState,
  displayedWindow,
  markParticipantOffline,
  moveMyWindow,
  observeUser,
  observedParticipant,
  receiveRemoteWindow,
  returnToMine,
} from './reducer';
import type { ReadingWindow, RemoteWindow } from './types';

const john1: ReadingWindow = {
  scripture: { translationId: 'webp', book: 'JHN', chapter: 1 },
  anchorVerse: 1,
};
const john5: ReadingWindow = {
  scripture: { translationId: 'webp', book: 'JHN', chapter: 1 },
  anchorVerse: 5,
  selection: { startVerse: 5, endVerse: 5, exactText: 'The light shines in the darkness' },
};
const romans8: ReadingWindow = {
  scripture: { translationId: 'webp', book: 'ROM', chapter: 8 },
  anchorVerse: 1,
};
const paula: RemoteWindow = {
  userId: 'paula', displayName: 'Paula', sessionId: 'phone-a',
  revision: 1, window: john5, online: true,
};

describe('sovereign presence viewport', () => {
  it('observes a participant without overwriting my saved window', () => {
    const state = observeUser(receiveRemoteWindow(createPresenceState('lu', john1), paula), 'paula');
    expect(displayedWindow(state)).toEqual(john5);
    expect(state.mine).toEqual(john1);
    expect(observedParticipant(state)?.displayName).toBe('Paula');
  });

  it('updates the observed lens without moving my window', () => {
    const observing = observeUser(receiveRemoteWindow(createPresenceState('lu', john1), paula), 'paula');
    const moved = receiveRemoteWindow(observing, { ...paula, revision: 2, window: romans8 });
    expect(displayedWindow(moved)).toEqual(romans8);
    expect(moved.mine).toEqual(john1);
    expect(observing.remote.paula.window).toEqual(john5);
  });

  it('claims the exact observed location on the first local gesture', () => {
    const observing = observeUser(receiveRemoteWindow(createPresenceState('lu', john1), paula), 'paula');
    const claimed = claimObservedLocation(observing);
    expect(claimed.observingUserId).toBeNull();
    expect(claimed.mine).toEqual(john5);
    expect(claimed.remote.paula).toEqual(paula);
    const laterRemoteMove = receiveRemoteWindow(claimed, { ...paula, revision: 2, window: romans8 });
    expect(displayedWindow(laterRemoteMove)).toEqual(john5);
  });

  it('returns to my saved location when tapping Me rather than claiming', () => {
    const observing = observeUser(receiveRemoteWindow(createPresenceState('lu', john1), paula), 'paula');
    const mine = returnToMine(observing);
    expect(mine.observingUserId).toBeNull();
    expect(displayedWindow(mine)).toEqual(john1);
  });

  it('a local move cannot edit or steer another person', () => {
    const observing = observeUser(receiveRemoteWindow(createPresenceState('lu', john1), paula), 'paula');
    const moved = moveMyWindow(observing, romans8);
    expect(moved.mine).toEqual(romans8);
    expect(moved.remote.paula.window).toEqual(john5);
    expect(moved.observingUserId).toBeNull();
  });

  it('rejects another participant trying to overwrite my user id or stale same-session motion', () => {
    const state = receiveRemoteWindow(createPresenceState('lu', john1), paula);
    expect(receiveRemoteWindow(state, { ...paula, userId: 'lu' })).toBe(state);
    expect(receiveRemoteWindow(state, { ...paula, revision: 1, window: romans8 })).toBe(state);
    expect(receiveRemoteWindow(state, { ...paula, revision: 0, window: romans8 })).toBe(state);
  });

  it('keeps a disconnected participant visible but offline without inventing presence', () => {
    const observing = observeUser(receiveRemoteWindow(createPresenceState('lu', john1), paula), 'paula');
    const offline = markParticipantOffline(observing, 'paula', 'phone-a');
    expect(observedParticipant(offline)?.online).toBe(false);
    expect(displayedWindow(offline)).toEqual(john5);
    expect(markParticipantOffline(observing, 'paula', 'other-session')).toBe(observing);
  });

  it('cannot observe an unknown user and does not append durable events', () => {
    const state = createPresenceState('lu', john1);
    expect(observeUser(state, 'ron')).toBe(state);
    expect(Object.keys(claimObservedLocation(state))).toEqual([
      'ownUserId', 'mine', 'observingUserId', 'remote',
    ]);
  });
});
