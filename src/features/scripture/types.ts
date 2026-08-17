export type ScriptureRef = {
  translationId: string;
  book: string;
  chapter: number;
  verse?: number;
};

export type ScriptureVerse = {
  verse: number;
  text: string;
};

export type ScriptureChapter = {
  translationId: string;
  translationName: string;
  book: string;
  bookName: string;
  chapter: number;
  verses: ScriptureVerse[];
};

export type ScriptureBookSummary = {
  id: string;
  name: string;
  chapters: number;
  availableChapters: number[];
};

export interface ScriptureAdapter {
  translationId: string;
  listBooks(): Promise<ScriptureBookSummary[]>;
  getChapter(ref: ScriptureRef): Promise<ScriptureChapter>;
}
