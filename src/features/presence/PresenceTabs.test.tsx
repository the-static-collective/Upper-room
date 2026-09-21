import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createPresenceState, observeUser, receiveRemoteWindow } from './reducer';
import PresenceTabs from './PresenceTabs';

const mine = { scripture: { translationId: 'webp', book: 'JHN', chapter: 1 }, anchorVerse: 1 };
const paula = {
  userId: 'paula', displayName: 'Paula', sessionId: 'p1', revision: 1,
  online: true, window: { ...mine, anchorVerse: 5 },
};

describe('presence tabs', () => {
  it('opens another participant’s live window and lets Me restore my own', async () => {
    const onObserve = vi.fn();
    const onReturn = vi.fn();
    const state = receiveRemoteWindow(createPresenceState('lu', mine), paula);
    const view = render(<PresenceTabs state={state} onObserve={onObserve} onReturn={onReturn} />);
    fireEvent.click(screen.getByRole('button', { name: /Paula/ }));
    expect(onObserve).toHaveBeenCalledWith('paula');
    view.rerender(<PresenceTabs state={observeUser(state, 'paula')} onObserve={onObserve} onReturn={onReturn} />);
    expect(screen.getByRole('button', { name: /Paula/ })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: /Me/ }));
    expect(onReturn).toHaveBeenCalledOnce();
  });

  it('shows a disconnected participant as offline rather than pretending they are here', () => {
    const state = receiveRemoteWindow(createPresenceState('lu', mine), { ...paula, online: false });
    render(<PresenceTabs state={state} onObserve={vi.fn()} onReturn={vi.fn()} />);
    expect(screen.getByRole('button', { name: /Paula.*offline/ })).toBeInTheDocument();
  });
});
