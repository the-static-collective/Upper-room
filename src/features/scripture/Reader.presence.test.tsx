import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Reader from './Reader';
import type { ScriptureAdapter } from './types';

describe('reader focus while observing a participant', () => {
  it('does not reload the same chapter when only their verse changes', async () => {
    const getChapter = vi.fn(async () => ({
      translationId: 'webp', translationName: 'World English Bible',
      book: 'JHN', bookName: 'John', chapter: 1,
      verses: [{ verse: 1, text: 'In the beginning was the Word.' },
        { verse: 5, text: 'The light shines in the darkness.' }],
    }));
    const adapter: ScriptureAdapter = {
      translationId: 'webp',
      listBooks: async () => [],
      getChapter,
    };
    const first = { translationId: 'webp', book: 'JHN', chapter: 1 };
    const view = render(<Reader adapter={adapter} scriptureRef={first} focusVerse={1} focusKey="mine" />);
    await screen.findByRole('heading', { name: 'John 1' });
    view.rerender(<Reader adapter={adapter} scriptureRef={{ ...first }} focusVerse={5} focusKey="remote:p:1" />);
    expect(getChapter).toHaveBeenCalledTimes(1);
  });
});
