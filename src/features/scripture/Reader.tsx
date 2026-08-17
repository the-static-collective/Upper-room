import { useEffect, useState } from 'react';
import type { ScriptureAdapter, ScriptureChapter, ScriptureRef } from './types';

type ReaderProps = {
  adapter: ScriptureAdapter;
  scriptureRef: ScriptureRef;
};

type ReaderState =
  | { status: 'loading' }
  | { status: 'ready'; chapter: ScriptureChapter }
  | { status: 'error'; message: string };

export default function Reader({ adapter, scriptureRef }: ReaderProps) {
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

  if (state.status === 'loading') {
    return <p className="reader-status">Opening John 1…</p>;
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
