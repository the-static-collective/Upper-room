import type { PresenceState } from './types';

type Props = {
  state: PresenceState;
  onObserve(userId: string): void;
  onReturn(): void;
};

export default function PresenceTabs({ state, onObserve, onReturn }: Props) {
  const peers = Object.values(state.remote);
  return (
    <nav className="presence-tabs" aria-label="Reading windows">
      <button
        type="button"
        className="presence-tab"
        aria-pressed={state.observingUserId === null}
        onClick={onReturn}
      >
        Me <span className="presence-anchor">· {state.mine.scripture.book} {state.mine.scripture.chapter}:{state.mine.anchorVerse}</span>
      </button>
      {peers.map((person) => (
        <button
          type="button"
          key={person.userId}
          className="presence-tab"
          aria-pressed={state.observingUserId === person.userId}
          onClick={() => onObserve(person.userId)}
        >
          {person.displayName}
          <span className="presence-anchor"> · {person.window.scripture.book} {person.window.scripture.chapter}:{person.window.anchorVerse}</span>
          {!person.online && <span className="presence-offline"> · offline</span>}
        </button>
      ))}
    </nav>
  );
}
