import type { ScriptureRef } from '../scripture/types';

/** A reading location, never a command to move another participant. */
export type ReadingWindow = Readonly<{
  scripture: ScriptureRef;
  anchorVerse: number;
  branchId?: string;
  selection?: Readonly<{ startVerse: number; endVerse: number; exactText: string }>;
}>;

/** Ephemeral transport state. It is not a room event or a reading-history log. */
export type RemoteWindow = Readonly<{
  userId: string;
  displayName: string;
  sessionId: string;
  revision: number;
  window: ReadingWindow;
  online: boolean;
}>;

export type PresenceState = Readonly<{
  ownUserId: string;
  mine: ReadingWindow;
  observingUserId: string | null;
  remote: Readonly<Record<string, RemoteWindow>>;
}>;
