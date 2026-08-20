import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';
import type { ScriptureAdapter, ScriptureChapter } from '../features/scripture/types';

const johnOne: ScriptureChapter = {
  translationId: 'webp',
  translationName: 'World English Bible',
  book: 'JHN',
  bookName: 'John',
  chapter: 1,
  verses: [
    { verse: 1, text: 'In the beginning was the Word, and the Word was with God, and the Word was God.' },
    { verse: 5, text: 'The light shines in the darkness, and the darkness hasn’t overcome it.' },
  ],
};

const adapter: ScriptureAdapter = {
  translationId: 'webp',
  listBooks: async () => [{ id: 'JHN', name: 'John', chapters: 21, availableChapters: [1] }],
  getChapter: async () => johnOne,
};

describe('Upper Room app shell', () => {
  it('keeps Scripture primary and opens on canonical John 1', async () => {
    render(<App scriptureAdapter={adapter} />);

    expect(screen.getByRole('main')).toHaveAttribute('data-surface', 'scripture');
    expect(screen.getByRole('main')).not.toHaveAttribute('data-attention-weather');
    expect(screen.getByText('Upper Room')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'John 1' })).toBeInTheDocument();
    expect(screen.getByText(/In the beginning was the Word/)).toBeInTheDocument();
    expect(document.getElementById('JHN-1-5')).toHaveTextContent(
      'The light shines in the darkness, and the darkness hasn’t overcome it.',
    );
    expect(screen.getByText('WEB')).toBeInTheDocument();
  });
});
