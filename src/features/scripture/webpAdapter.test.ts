import { describe, expect, it, vi } from 'vitest';
import { createWebpAdapter } from './webpAdapter';
import type { ScriptureChapter } from './types';

const chapter: ScriptureChapter = {
  translationId: 'webp',
  translationName: 'World English Bible',
  book: 'JHN',
  bookName: 'John',
  chapter: 1,
  verses: [{ verse: 1, text: 'In the beginning was the Word, and the Word was with God, and the Word was God.' }],
};

describe('WEBP scripture adapter', () => {
  it('loads John 1 from canonical Scripture coordinates', async () => {
    const loadJson = vi.fn(async () => chapter);
    const adapter = createWebpAdapter(loadJson);

    const result = await adapter.getChapter({ translationId: 'webp', book: 'JHN', chapter: 1 });

    expect(loadJson).toHaveBeenCalledWith('/scripture/webp/chapters/JHN.1.json');
    expect(result).toEqual(chapter);
    expect(result.verses[0]).toEqual({ verse: 1, text: chapter.verses[0]?.text });
  });

  it('refuses a mismatched translation instead of silently substituting WEB', async () => {
    const adapter = createWebpAdapter(async () => chapter);

    await expect(
      adapter.getChapter({ translationId: 'kjv', book: 'JHN', chapter: 1 }),
    ).rejects.toThrow('Unsupported translation: kjv');
  });
});
