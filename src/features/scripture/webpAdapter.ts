import type {
  ScriptureAdapter,
  ScriptureBookSummary,
  ScriptureChapter,
  ScriptureRef,
} from './types';

const TRANSLATION_ID = 'webp';
const CHAPTER_ROOT = '/scripture/webp/chapters';
const MANIFEST_PATH = '/scripture/webp/manifest.json';

export type ScriptureJsonLoader = (path: string) => Promise<unknown>;

type WebpManifest = {
  translationId: 'webp';
  books: ScriptureBookSummary[];
};

async function browserJsonLoader(path: string): Promise<unknown> {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Scripture source unavailable: ${path} (${response.status})`);
  }
  return response.json();
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Invalid Scripture payload.');
  }
  return value as Record<string, unknown>;
}

function parseChapter(value: unknown, ref: ScriptureRef): ScriptureChapter {
  const record = asRecord(value);
  const verses = record.verses;

  if (
    record.translationId !== TRANSLATION_ID ||
    record.book !== ref.book ||
    record.chapter !== ref.chapter ||
    typeof record.translationName !== 'string' ||
    typeof record.bookName !== 'string' ||
    !Array.isArray(verses)
  ) {
    throw new Error(`Scripture payload does not match ${ref.book} ${ref.chapter}.`);
  }

  const parsedVerses = verses.map((verse, index) => {
    const verseRecord = asRecord(verse);
    if (typeof verseRecord.verse !== 'number' || typeof verseRecord.text !== 'string') {
      throw new Error(`Invalid verse payload at index ${index}.`);
    }
    return { verse: verseRecord.verse, text: verseRecord.text };
  });

  return {
    translationId: TRANSLATION_ID,
    translationName: record.translationName,
    book: ref.book,
    bookName: record.bookName,
    chapter: ref.chapter,
    verses: parsedVerses,
  };
}

function parseManifest(value: unknown): WebpManifest {
  const record = asRecord(value);
  if (record.translationId !== TRANSLATION_ID || !Array.isArray(record.books)) {
    throw new Error('Invalid WEBP manifest.');
  }

  const books = record.books.map((book, index) => {
    const bookRecord = asRecord(book);
    if (
      typeof bookRecord.id !== 'string' ||
      typeof bookRecord.name !== 'string' ||
      typeof bookRecord.chapters !== 'number' ||
      !Array.isArray(bookRecord.availableChapters) ||
      !bookRecord.availableChapters.every((chapter) => typeof chapter === 'number')
    ) {
      throw new Error(`Invalid WEBP book manifest at index ${index}.`);
    }

    return {
      id: bookRecord.id,
      name: bookRecord.name,
      chapters: bookRecord.chapters,
      availableChapters: [...bookRecord.availableChapters] as number[],
    };
  });

  return { translationId: TRANSLATION_ID, books };
}

export function createWebpAdapter(loadJson: ScriptureJsonLoader = browserJsonLoader): ScriptureAdapter {
  return {
    translationId: TRANSLATION_ID,

    async listBooks() {
      const manifest = parseManifest(await loadJson(MANIFEST_PATH));
      return manifest.books;
    },

    async getChapter(ref) {
      if (ref.translationId !== TRANSLATION_ID) {
        throw new Error(`Unsupported translation: ${ref.translationId}`);
      }
      if (!Number.isInteger(ref.chapter) || ref.chapter < 1) {
        throw new Error(`Invalid chapter: ${ref.chapter}`);
      }

      const path = `${CHAPTER_ROOT}/${ref.book}.${ref.chapter}.json`;
      return parseChapter(await loadJson(path), ref);
    },
  };
}

export const webpAdapter = createWebpAdapter();
