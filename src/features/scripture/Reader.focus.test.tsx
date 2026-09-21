import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Reader from './Reader';
import type { ScriptureAdapter, ScriptureRef } from './types';

const ref: ScriptureRef = { translationId: 'webp', book: 'JHN', chapter: 1 };
const adapter: ScriptureAdapter = {
  translationId: 'webp',
  listBooks: async () => [{ id: 'JHN', name: 'John', chapters: 21, availableChapters: [1] }],
  getChapter: async () => ({
    translationId: 'webp', translationName: 'World English Bible',
    book: 'JHN', bookName: 'John', chapter: 1,
    verses: [{ verse: 1, text: 'The Word.' }, { verse: 5, text: 'The light shines.' }],
  }),
};

describe('Scripture reader presence lens', () => {
  it('moves to a participant’s verse when its focus key changes', async () => {
    const scroll = vi.fn();
    Element.prototype.scrollIntoView = scroll;
    const view = render(<Reader adapter={adapter} scriptureRef={ref} focusVerse={1} focusKey="mine" />);
    await screen.findByRole('heading', { name: 'John 1' });
    view.rerender(<Reader adapter={adapter} scriptureRef={ref} focusVerse={5} focusKey="remote:paula:1" />);
    await waitFor(() => expect(scroll).toHaveBeenCalled());
    expect(document.getElementById('JHN-1-5')).toBeInTheDocument();
    scroll.mockClear();
    view.rerender(<Reader adapter={adapter} scriptureRef={ref} focusVerse={5} focusKey="remote:paula:1" />);
    expect(scroll).not.toHaveBeenCalled();
  });
});
