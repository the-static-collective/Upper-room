import type { PresenceState, ReadingWindow, RemoteWindow } from './types';

/**
 * Presence is a viewport, not a command. This module owns only ephemeral
 * reading locations; callers must never append these transitions to room memory.
 */
export function createPresenceState(ownUserId: string, mine: ReadingWindow): PresenceState {
  if (!ownUserId) throw new Error('A local user id is required.');
  return { ownUserId, mine, observingUserId: null, remote: {} };
}

export function receiveRemoteWindow(
  state: PresenceState,
  incoming: RemoteWindow,
): PresenceState {
  if (!incoming.userId || incoming.userId === state.ownUserId) return state;
  const previous = state.remote[incoming.userId];
  // A retransmission from the same session cannot reverse the displayed lens.
  if (
    previous &&
    previous.sessionId === incoming.sessionId &&
    previous.revision >= incoming.revision
  ) return state;

  return {
    ...state,
    remote: { ...state.remote, [incoming.userId]: incoming },
  };
}

export function observeUser(state: PresenceState, userId: string): PresenceState {
  if (userId === state.ownUserId) return returnToMine(state);
  if (!state.remote[userId]) return state;
  return { ...state, observingUserId: userId };
}

export function returnToMine(state: PresenceState): PresenceState {
  return state.observingUserId === null ? state : { ...state, observingUserId: null };
}

export function displayedWindow(state: PresenceState): ReadingWindow {
  return (state.observingUserId && state.remote[state.observingUserId]?.window) || state.mine;
}

export function observedParticipant(state: PresenceState): RemoteWindow | null {
  return state.observingUserId ? state.remote[state.observingUserId] ?? null : null;
}

/**
 * The observer's first local reading gesture starts at the observed location,
 * but does not modify the remote participant's state.
 */
export function claimObservedLocation(state: PresenceState): PresenceState {
  if (state.observingUserId === null) return state;
  return {
    ...state,
    mine: displayedWindow(state),
    observingUserId: null,
  };
}

/** Always claim before applying local scroll, navigation, or selection. */
export function moveMyWindow(state: PresenceState, next: ReadingWindow): PresenceState {
  const claimed = claimObservedLocation(state);
  return { ...claimed, mine: next };
}

/** Preserve the last witnessed window, but never claim the person remains live. */
export function markParticipantOffline(
  state: PresenceState,
  userId: string,
  sessionId: string,
): PresenceState {
  const previous = state.remote[userId];
  if (!previous || previous.sessionId !== sessionId || !previous.online) return state;
  return {
    ...state,
    remote: { ...state.remote, [userId]: { ...previous, online: false } },
  };
}
