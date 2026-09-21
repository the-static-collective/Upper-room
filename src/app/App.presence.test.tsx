import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import App from './App';
import type { ScriptureAdapter } from '../features/scripture/types';
import type { ChannelFactory } from '../features/presence/localRoomChannel';

const chapter = {
  translationId: 'webp', translationName: 'World English Bible',
  book: 'JHN', bookName: 'John', chapter: 1,
  verses: [
    { verse: 1, text: 'In the beginning was the Word.' },
    { verse: 5, text: 'The light shines in the darkness.' },
  ],
};
const adapter: ScriptureAdapter = {
  translationId: 'webp',
  listBooks: async () => [{ id: 'JHN', name: 'John', chapters: 21, availableChapters: [1] }],
  getChapter: async () => chapter,
};
const channelFactory: ChannelFactory = () => ({
  onmessage: null, postMessage: vi.fn(), close: vi.fn(),
});

describe('Upper Room local presence entry', () => {
  it('keeps Scripture visible until a reader deliberately opens a local room', async () => {
    const user = userEvent.setup();
    render(<App scriptureAdapter={adapter} localChannelFactory={channelFactory} />);
    expect(await screen.findByRole('heading', { name: 'John 1' })).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Reading windows' })).not.toBeInTheDocument();
    await user.type(screen.getByRole('textbox', { name: 'Your name' }), 'Lu');
    await user.click(screen.getByRole('button', { name: 'Open local room' }));
    expect(screen.getByRole('navigation', { name: 'Reading windows' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Me/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText(/same-browser tabs only/i)).toBeInTheDocument();
    expect(screen.getByText('In the beginning was the Word.')).toBeInTheDocument();
  });
});
