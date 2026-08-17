import Reader from '../features/scripture/Reader';
import type { ScriptureAdapter, ScriptureRef } from '../features/scripture/types';
import { webpAdapter } from '../features/scripture/webpAdapter';

const JOHN_ONE: ScriptureRef = Object.freeze({
  translationId: 'webp',
  book: 'JHN',
  chapter: 1,
});

type AppProps = {
  scriptureAdapter?: ScriptureAdapter;
};

export default function App({ scriptureAdapter = webpAdapter }: AppProps) {
  return (
    <div className="app-shell">
      <header className="room-header">
        <span className="room-name">Upper Room</span>
        <span className="room-state">John 1</span>
      </header>

      <main className="scripture-surface" data-surface="scripture">
        <Reader adapter={scriptureAdapter} scriptureRef={JOHN_ONE} />
      </main>
    </div>
  );
}
