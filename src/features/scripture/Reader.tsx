import { useEffect, useState } from 'react';
import type { ScriptureAdapter, ScriptureChapter, ScriptureRef } from './types';

type ReaderProps = {
  adapter: ScriptureAdapter;
  scriptureRef: ScriptureRef;
  /** Displayed lens anchor: not a command to change anyone else's window. */
  focusVerse?: number;
  /** Changes only when the reader intentionally switches windows or the observed window moves. */
  focusKey?: string;
};

type ReaderState =
  | { status: 'loading' }
  | { status: 'ready'; chapter: ScriptureChapter }
  | { status: 'error'; message: string };

export default function Reader({ adapter, scriptureRef, focusVerse, focusKey }: ReaderProps) {
  const [state, setState] = useState<ReaderState>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    setState({ status: 'loading' });

    adapter
      .getChapter(scriptureRef)
      .then((chapter) => {
        if (active) setState({ status: 'ready', chapter });
      })
      .catch((error: unknown) => {
        if (!active) return;
        const message = error instanceof Error ? error.message : 'Scripture could not be loaded.';
        setState({ status: 'error', message });
      });

    return () => {
      active = false;
    };
  }, [adapter, scriptureRef]);

  useEffect(() => {
    if (state.status !== 'ready' || !focusVerse) return;
    const target = document.getElementById(
      `${state.chapter.book}-${state.chapter.chapter}-${focusVerse}`,
    );
    if (target && typeof target.scrollIntoView === 'function') {
      target.scrollIntoView({ block: 'start' });
    }
    // focusVerse intentionally omitted: local scrolling changes the anchor
    // without forcing a jump. A distinct focusKey is an explicit lens change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, focusKey]);

  if (state.status === 'loading') {
    return <p className="reader-status">Opening Scripture…</p>;
  }

  if (state.status === 'error') {
    return (
      <div className="reader-status reader-status--error" role="alert">
        <strong>Scripture unavailable.</strong>
        <span>{state.message}</span>
      </div>
    );
  }

  const { chapter } = state;

  return (
    <article className="passage" aria-labelledby="passage-heading">
      <div className="passage-heading-row">
        <div>
          <p className="passage-kicker">{chapter.translationName}</p>
          <h1 id="passage-heading">{chapter.bookName} {chapter.chapter}</h1>
        </div>
        <span className="translation-mark" aria-label="World English Bible">WEB</span>
      </div>

      <div className="verses" aria-label={`${chapter.bookName} ${chapter.chapter}`}>
        {chapter.verses.map((verse) => (
          <p className="verse" id={`${chapter.book}-${chapter.chapter}-${verse.verse}`} key={verse.verse}>
            <sup className="verse-number" aria-label={`Verse ${verse.verse}`}>{verse.verse}</sup>
            {verse.text}
          </p>
        ))}
      </div>
    </article>
  );
}
