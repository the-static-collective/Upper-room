# Upper Room v0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a phone-first private shared Scripture room where three people can read independently, inspect one another's live reading windows, select text, invoke evidence-bounded AIHYPER proposals, create durable human/AI witness events, branch, leave, and return without losing room history.

**Architecture:** A Vite React TypeScript PWA owns the Scripture-first phone surface. Supabase Auth/Postgres hold private durable room membership and append-only events; Supabase Realtime Presence holds slow-changing participant state while Broadcast carries throttled live viewport movement. AIHYPER runs in a Supabase Edge Function, validates structured Gemini output, verifies Scripture references against the local WEB corpus, and refuses unsupported claims instead of silently inventing evidence.

**Tech Stack:** Node.js 20.19+; Vite; React; TypeScript; Vitest; Testing Library; Playwright; `@supabase/supabase-js`; Supabase Postgres/Auth/Realtime/Edge Functions; Zod; `vite-plugin-pwa`; Gemini REST API behind a provider adapter.

## Global Constraints

- Phone-first responsive PWA; Scripture remains the dominant visual surface.
- Default Scripture source is the 66-book World English Bible Protestant edition (`engwebp`), preserved verbatim and labeled as WEB.
- Translation access lives behind a `ScriptureAdapter`; event semantics never depend on WEB-specific layout.
- All room content is private-to-room by default; v0 has no public publishing workflow.
- AIHYPER never initiates speech. It runs only from an explicit Scripture selection plus an explicit menu action.
- AIHYPER output is a proposal, never canonical Scripture and never an authoritative interpretation.
- Unsupported lexical/historical claims return an explicit unsupported result rather than fabricated evidence.
- Presence is a viewport, not control: observing another participant never mutates that participant or the observer's saved viewport.
- Supabase Presence is limited to slow-changing state; throttled viewport motion uses Realtime Broadcast, not repeated `track()` calls.
- Scroll/viewport movement is ephemeral and must never create append-only room events.
- Notes, questions, recognitions, objections, branch creation, AIHYPER proposal/admission/refusal, and returns are durable append-only events.
- Refusal remains visible residue but has no admitted semantic effect.
- No forced synchronized scrolling, sermon generation, devotional feed, doctrinal scoring, gamification, or permanent reading telemetry.

---

## File Structure

```text
Upper-room/
├── .env.example
├── .github/
│   └── workflows/ci.yml
├── index.html
├── package.json
├── playwright.config.ts
├── tsconfig.json
├── vite.config.ts
├── public/
│   ├── icons/
│   └── scripture/
│       └── webp/
│           ├── manifest.json
│           └── chapters/*.json
├── scripts/
│   └── import-webp.mjs
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   └── App.test.tsx
│   ├── lib/
│   │   ├── supabase/client.ts
│   │   └── supabase/env.ts
│   ├── features/
│   │   ├── scripture/
│   │   │   ├── types.ts
│   │   │   ├── adapter.ts
│   │   │   ├── webpAdapter.ts
│   │   │   ├── webpAdapter.test.ts
│   │   │   ├── Reader.tsx
│   │   │   └── Reader.test.tsx
│   │   ├── selection/
│   │   │   ├── selection.ts
│   │   │   ├── selection.test.ts
│   │   │   ├── SelectionLayer.tsx
│   │   │   └── SelectionLayer.test.tsx
│   │   ├── presence/
│   │   │   ├── types.ts
│   │   │   ├── reducer.ts
│   │   │   ├── reducer.test.ts
│   │   │   ├── roomChannel.ts
│   │   │   ├── PresenceTabs.tsx
│   │   │   └── PresenceTabs.test.tsx
│   │   ├── room/
│   │   │   ├── types.ts
│   │   │   ├── api.ts
│   │   │   ├── api.test.ts
│   │   │   ├── RoomScreen.tsx
│   │   │   └── RoomScreen.test.tsx
│   │   ├── events/
│   │   │   ├── types.ts
│   │   │   ├── projection.ts
│   │   │   ├── projection.test.ts
│   │   │   ├── MemorySheet.tsx
│   │   │   └── MemorySheet.test.tsx
│   │   └── aihyper/
│   │       ├── types.ts
│   │       ├── schema.ts
│   │       ├── schema.test.ts
│   │       ├── api.ts
│   │       ├── AIHyperSheet.tsx
│   │       └── AIHyperSheet.test.tsx
│   ├── main.tsx
│   └── styles.css
├── supabase/
│   ├── config.toml
│   ├── migrations/
│   │   └── 20260814190000_upper_room_v0.sql
│   └── functions/
│       └── aihyper/
│           ├── index.ts
│           ├── provider.ts
│           ├── provider.test.ts
│           └── prompt.ts
└── tests/
    └── upper-room.spec.ts
```

The field-test corpus can begin with John 1 while the importer is being proved, but Task 2 is not complete until the generated manifest covers all 66 `engwebp` books.

---

### Task 1: Scaffold the phone-first PWA and test floor

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/app/App.tsx`
- Create: `src/app/App.test.tsx`
- Create: `src/styles.css`
- Create: `.env.example`
- Create: `.github/workflows/ci.yml`
- Create: `playwright.config.ts`

**Interfaces:**
- Produces: a React application mounted at `#root`; `npm test`, `npm run build`, `npm run lint`, and `npm run test:e2e` scripts; PWA manifest/service-worker registration; validated client environment access.
- Consumes: none.

- [ ] **Step 1: Scaffold Vite React TypeScript into the existing repository without deleting docs**

Run from a temporary directory, then copy only scaffold files into `Upper-room` so `docs/` survives:

```bash
npm create vite@latest upper-room-scaffold -- --template react-ts
cp -R upper-room-scaffold/src upper-room-scaffold/public upper-room-scaffold/index.html upper-room-scaffold/package.json upper-room-scaffold/tsconfig*.json upper-room-scaffold/vite.config.ts .
rm -rf upper-room-scaffold
npm install
npm install @supabase/supabase-js zod vite-plugin-pwa
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @playwright/test eslint
```

- [ ] **Step 2: Add scripts and the test environment**

Set the relevant `package.json` scripts to:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  }
}
```

Configure `vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Upper Room',
        short_name: 'Upper Room',
        display: 'standalone',
        start_url: '/',
        theme_color: '#111111',
        background_color: '#111111',
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
```

Create `src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 3: Write the failing shell test**

```tsx
import { render, screen } from '@testing-library/react';
import App from './App';

it('keeps Scripture as the primary promised surface', () => {
  render(<App />);
  expect(screen.getByRole('main')).toHaveAttribute('data-surface', 'scripture');
  expect(screen.getByText('Upper Room')).toBeInTheDocument();
});
```

- [ ] **Step 4: Run the shell test and verify failure**

Run:

```bash
npm test -- src/app/App.test.tsx
```

Expected: FAIL because the final app shell is not implemented.

- [ ] **Step 5: Implement the minimal shell**

```tsx
export default function App() {
  return (
    <div className="app-shell">
      <header className="room-header">Upper Room</header>
      <main data-surface="scripture" className="scripture-surface">
        <p>Enter a room to begin reading.</p>
      </main>
    </div>
  );
}
```

Keep CSS intentionally spare: full viewport, readable line length, touch targets at least 44px, no permanent side rails.

- [ ] **Step 6: Add CI**

Create `.github/workflows/ci.yml`:

```yaml
name: CI
on:
  pull_request:
  push:
    branches: [main]
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npm run build
```

- [ ] **Step 7: Run foundation verification**

```bash
npm test
npm run build
```

Expected: both exit 0.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json vite.config.ts tsconfig*.json index.html src public .env.example .github playwright.config.ts
git commit -m "feat: establish Upper Room phone-first app shell"
```

---

### Task 2: Create the Scripture domain and import WEBP without layout coupling

**Files:**
- Create: `src/features/scripture/types.ts`
- Create: `src/features/scripture/adapter.ts`
- Create: `src/features/scripture/webpAdapter.ts`
- Create: `src/features/scripture/webpAdapter.test.ts`
- Create: `scripts/import-webp.mjs`
- Create/generated: `public/scripture/webp/manifest.json`
- Create/generated: `public/scripture/webp/chapters/*.json`

**Interfaces:**
- Produces: `ScriptureAdapter`, `ScriptureRef`, `ScriptureVerse`, `ScriptureChapter`; `webpAdapter.getChapter(ref)`; generated immutable WEBP chapter JSON.
- Consumes: browser `fetch` only.

- [ ] **Step 1: Define canonical Scripture types**

```ts
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
  book: string;
  chapter: number;
  verses: ScriptureVerse[];
};

export interface ScriptureAdapter {
  translationId: string;
  listBooks(): Promise<Array<{ id: string; name: string; chapters: number }>>;
  getChapter(ref: ScriptureRef): Promise<ScriptureChapter>;
}
```

- [ ] **Step 2: Write adapter tests before implementation**

Tests must prove:

```ts
it('loads John 1 by canonical coordinates', async () => {
  const chapter = await webpAdapter.getChapter({ translationId: 'webp', book: 'JHN', chapter: 1 });
  expect(chapter.translationId).toBe('webp');
  expect(chapter.book).toBe('JHN');
  expect(chapter.chapter).toBe(1);
  expect(chapter.verses[0]?.verse).toBe(1);
  expect(chapter.verses[0]?.text.length).toBeGreaterThan(0);
});

it('rejects translation substitution', async () => {
  await expect(webpAdapter.getChapter({ translationId: 'other', book: 'JHN', chapter: 1 }))
    .rejects.toThrow('Unsupported translation: other');
});
```

Mock `fetch` against a deterministic fixture in the test.

- [ ] **Step 3: Run tests and verify failure**

```bash
npm test -- src/features/scripture/webpAdapter.test.ts
```

Expected: FAIL because `webpAdapter` does not exist.

- [ ] **Step 4: Implement the browser adapter**

```ts
import type { ScriptureAdapter, ScriptureChapter, ScriptureRef } from './types';

export const webpAdapter: ScriptureAdapter = {
  translationId: 'webp',
  async listBooks() {
    const response = await fetch('/scripture/webp/manifest.json');
    if (!response.ok) throw new Error('WEB manifest unavailable');
    return response.json();
  },
  async getChapter(ref: ScriptureRef): Promise<ScriptureChapter> {
    if (ref.translationId !== 'webp') throw new Error(`Unsupported translation: ${ref.translationId}`);
    const response = await fetch(`/scripture/webp/chapters/${ref.book}.${ref.chapter}.json`);
    if (!response.ok) throw new Error(`WEB passage unavailable: ${ref.book} ${ref.chapter}`);
    return response.json();
  },
};
```

- [ ] **Step 5: Implement a deterministic importer around eBible's VPL archive**

`scripts/import-webp.mjs` must accept exactly two arguments:

```bash
node scripts/import-webp.mjs ./vendor/engwebp_vpl.zip ./public/scripture/webp
```

Implementation requirements:

1. Unzip into a temporary directory using Node's `child_process.execFileSync('unzip', ['-q', archive, '-d', tempDir])` so no ZIP library enters the runtime bundle.
2. Locate the archive's `.txt` VPL file and `.sql` metadata file.
3. Parse verse lines with one anchored regular expression after inspecting the downloaded source file in the task branch. Fail the import if any non-empty canonical verse line does not match; do not silently skip malformed verse lines.
4. Normalize book IDs to the USFM three-character identifiers used in the source archive.
5. Write one JSON file per chapter with exact verse text and no textual normalization beyond line-ending removal.
6. Write `manifest.json` with every imported book and chapter count.
7. Assert exactly 66 books for `engwebp`; abort if not.

The generated chapter shape is:

```json
{
  "translationId": "webp",
  "book": "JHN",
  "chapter": 1,
  "verses": [
    { "verse": 1, "text": "...exact imported text..." }
  ]
}
```

Do not hand-edit generated verse text.

- [ ] **Step 6: Import the corpus and verify invariants**

Download `engwebp_vpl.zip` from eBible's developer formats page into `vendor/` for the import only; do not commit the ZIP.

Run:

```bash
node scripts/import-webp.mjs vendor/engwebp_vpl.zip public/scripture/webp
node -e "const m=require('./public/scripture/webp/manifest.json'); if(m.length!==66) process.exit(1); console.log(m.length)"
```

Expected output ends with `66`.

- [ ] **Step 7: Run adapter tests and build**

```bash
npm test -- src/features/scripture/webpAdapter.test.ts
npm run build
```

Expected: PASS and build exit 0.

- [ ] **Step 8: Commit**

```bash
git add scripts/import-webp.mjs public/scripture/webp src/features/scripture
git commit -m "feat: add canonical WEB Scripture adapter"
```

---

### Task 3: Build the Scripture reader and double-tap canonical selection

**Files:**
- Create: `src/features/scripture/Reader.tsx`
- Create: `src/features/scripture/Reader.test.tsx`
- Create: `src/features/selection/selection.ts`
- Create: `src/features/selection/selection.test.ts`
- Create: `src/features/selection/SelectionLayer.tsx`
- Create: `src/features/selection/SelectionLayer.test.tsx`

**Interfaces:**
- Consumes: `ScriptureChapter` from Task 2.
- Produces: `ScriptureSelection`, `SelectionAction`, `selectionReducer`, `Reader` callbacks `onViewportChange` and `onSelectionComplete`.

- [ ] **Step 1: Define selection coordinates independent of rendered pixels**

```ts
export type ScriptureSelection = {
  translationId: string;
  book: string;
  chapter: number;
  start: { verse: number; token: number; char: number };
  end: { verse: number; token: number; char: number };
  exactText: string;
};
```

Tokenization rule for v0: preserve whitespace and punctuation in verse text but expose selectable word/punctuation tokens using `Intl.Segmenter('en', { granularity: 'word' })`; store each token's starting character offset in the exact verse string.

- [ ] **Step 2: Write reducer tests**

```ts
it('starts on one token and expands forward', () => {
  const started = selectionReducer(idleState, { type: 'start', verse: 5, token: 3 });
  const expanded = selectionReducer(started, { type: 'extend', verse: 5, token: 7 });
  expect(expanded.anchor).toEqual({ verse: 5, token: 3 });
  expect(expanded.focus).toEqual({ verse: 5, token: 7 });
});

it('normalizes backward drags', () => {
  const selection = normalizeRange({ verse: 5, token: 7 }, { verse: 4, token: 2 });
  expect(selection.start).toEqual({ verse: 4, token: 2 });
  expect(selection.end).toEqual({ verse: 5, token: 7 });
});
```

- [ ] **Step 3: Verify tests fail**

```bash
npm test -- src/features/selection/selection.test.ts
```

Expected: FAIL because reducer/helpers are absent.

- [ ] **Step 4: Implement pure selection state first**

Use a reducer with states `idle | selecting | complete`. Keep DOM events out of the reducer so touch behavior can be tested separately.

- [ ] **Step 5: Write interaction tests for double-tap and drag**

Render `SelectionLayer` over a five-token verse. Use fake timers to prove:

```tsx
await user.pointer([
  { keys: '[TouchA>]', target: token3 }, { keys: '[/TouchA]' },
  { keys: '[TouchA>]', target: token3 }, { keys: '[/TouchA]' },
]);
expect(onSelectionStart).toHaveBeenCalledWith(expect.objectContaining({ verse: 1, token: 2 }));
```

Then simulate pointer movement to a later token and assert the completed selection contains canonical token/character offsets and exact text.

- [ ] **Step 6: Implement the reader surface**

Each verse renders with explicit verse number and token spans carrying:

```tsx
<span
  data-verse={verse.verse}
  data-token={token.index}
  data-char={token.charStart}
>
  {token.text}
</span>
```

Do not add selection toolbars permanently. `SelectionLayer` becomes active only after the double-tap detector fires within 350ms on the same token.

- [ ] **Step 7: Verify the reader/selection suite**

```bash
npm test -- src/features/scripture/Reader.test.tsx src/features/selection
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/features/scripture/Reader* src/features/selection
git commit -m "feat: add touch-first canonical Scripture selection"
```

---

### Task 4: Create private rooms and append-only durable event admission

**Files:**
- Create: `supabase/config.toml`
- Create: `supabase/migrations/20260814190000_upper_room_v0.sql`
- Create: `src/lib/supabase/env.ts`
- Create: `src/lib/supabase/client.ts`
- Create: `src/features/room/types.ts`
- Create: `src/features/room/api.ts`
- Create: `src/features/room/api.test.ts`

**Interfaces:**
- Produces: `createRoom`, `joinRoomByInvite`, `listRoomEvents`, `appendRoomEvent`; database RPCs `create_room`, `join_room_by_invite`, `append_room_event`.
- Consumes: authenticated Supabase user and canonical Scripture coordinates.

- [ ] **Step 1: Create the database schema with a per-room sequence authority**

Migration core:

```sql
create extension if not exists pgcrypto;

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  translation_id text not null default 'webp',
  start_book text not null,
  start_chapter integer not null check (start_chapter > 0),
  created_by uuid not null references auth.users(id),
  last_seq bigint not null default 0,
  created_at timestamptz not null default now()
);

create table public.room_members (
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  joined_at timestamptz not null default now(),
  primary key (room_id, user_id)
);

create table public.room_invites (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  token uuid not null unique default gen_random_uuid(),
  created_by uuid not null references auth.users(id),
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.room_events (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  seq bigint not null,
  user_id uuid not null references auth.users(id),
  kind text not null check (kind in (
    'note','question','recognition','objection','branch_created',
    'aihyper_proposed','aihyper_admitted','aihyper_refused','return'
  )),
  scripture jsonb,
  parent_event_id uuid references public.room_events(id),
  branch_id uuid references public.room_events(id),
  payload jsonb not null,
  created_at timestamptz not null default now(),
  unique (room_id, seq)
);
```

- [ ] **Step 2: Add fail-closed append RPC**

```sql
create or replace function public.append_room_event(
  p_room_id uuid,
  p_kind text,
  p_scripture jsonb,
  p_parent_event_id uuid,
  p_branch_id uuid,
  p_payload jsonb
) returns public.room_events
language plpgsql
security definer
set search_path = public
as $$
declare
  v_seq bigint;
  v_event public.room_events;
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  if not exists (
    select 1 from public.room_members m
    where m.room_id = p_room_id and m.user_id = auth.uid()
  ) then raise exception 'room membership required'; end if;

  update public.rooms
  set last_seq = last_seq + 1
  where id = p_room_id
  returning last_seq into v_seq;

  if v_seq is null then raise exception 'room not found'; end if;

  insert into public.room_events (
    room_id, seq, user_id, kind, scripture, parent_event_id, branch_id, payload
  ) values (
    p_room_id, v_seq, auth.uid(), p_kind, p_scripture, p_parent_event_id, p_branch_id, p_payload
  ) returning * into v_event;

  return v_event;
end;
$$;
```

No update/delete RPC for `room_events` exists in v0.

- [ ] **Step 3: Add RLS and invite RPCs**

Enable RLS on all four tables. Policies:

- members can read their room and member list;
- members can read events from their room;
- clients cannot directly insert/update/delete `room_events`;
- room creator can read/revoke invite rows;
- `create_room(title, book, chapter, display_name)` inserts room + creator membership + one invite and returns both room id and invite token;
- `join_room_by_invite(token, display_name)` inserts membership idempotently and returns room id;
- no public anonymous read policy exists.

- [ ] **Step 4: Write client API tests against a mocked Supabase RPC layer**

```ts
it('preserves server-assigned event sequence', async () => {
  rpc.mockResolvedValue({ data: { id: 'e1', seq: 8 }, error: null });
  const event = await appendRoomEvent(client, input);
  expect(event.seq).toBe(8);
  expect(rpc).toHaveBeenCalledWith('append_room_event', expect.objectContaining({ p_kind: 'note' }));
});

it('does not synthesize an event after a failed durable write', async () => {
  rpc.mockResolvedValue({ data: null, error: { message: 'room membership required' } });
  await expect(appendRoomEvent(client, input)).rejects.toThrow('room membership required');
});
```

- [ ] **Step 5: Implement the Supabase client wrapper**

`.env.example`:

```dotenv
VITE_SUPABASE_URL=https://project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_replace_me
```

`env.ts` must throw at startup if either variable is missing; never embed a secret/service-role key in the browser.

- [ ] **Step 6: Run local Supabase database tests**

```bash
supabase start
supabase db reset
```

Then execute a SQL smoke script using three test users that proves:

- outsider cannot select room events;
- member can select room events;
- direct client insert into `room_events` is denied;
- two append RPC calls receive sequences `1`, then `2`;
- invite join is idempotent.

- [ ] **Step 7: Run application tests**

```bash
npm test -- src/features/room
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add supabase src/lib/supabase src/features/room .env.example
git commit -m "feat: add private append-only study rooms"
```

---

### Task 5: Implement presence tabs with sovereign viewport claiming

**Files:**
- Create: `src/features/presence/types.ts`
- Create: `src/features/presence/reducer.ts`
- Create: `src/features/presence/reducer.test.ts`
- Create: `src/features/presence/roomChannel.ts`
- Create: `src/features/presence/PresenceTabs.tsx`
- Create: `src/features/presence/PresenceTabs.test.tsx`

**Interfaces:**
- Consumes: Supabase client, authenticated user, `ScriptureRef`, optional `ScriptureSelection`, optional `branchId`.
- Produces: `PresenceViewport`, `ObservedLensState`, `createRoomChannel()`, `observeUser(userId)`, `claimObservedLocation()`.

- [ ] **Step 1: Define slow and fast realtime payloads separately**

```ts
export type PresenceViewport = {
  userId: string;
  displayName: string;
  translationId: string;
  book: string;
  chapter: number;
  anchorVerse: number;
  branchId?: string;
  selection?: ScriptureSelection;
  updatedAt: string;
};

export type ViewportBroadcast = PresenceViewport & {
  type: 'viewport';
  clientId: string;
};
```

Presence `track()` payload changes only when online identity, book, chapter, or branch changes. Throttled anchor/selection movement uses Broadcast event `viewport` at no more than four sends per second.

- [ ] **Step 2: Write pure reducer tests for the sovereignty rule**

```ts
it('observes Paula without overwriting my saved viewport', () => {
  const state = observeUser(baseState, 'paula');
  const moved = receiveRemoteViewport(state, 'paula', paulaAtJohn5);
  expect(moved.displayed).toEqual(paulaAtJohn5);
  expect(moved.mine).toEqual(mySavedViewport);
});

it('claims the displayed location on first local navigation', () => {
  const observing = receiveRemoteViewport(observeUser(baseState, 'paula'), 'paula', paulaAtJohn5);
  const claimed = claimObservedLocation(observing);
  expect(claimed.observingUserId).toBeNull();
  expect(claimed.mine.book).toBe('JHN');
  expect(claimed.mine.anchorVerse).toBe(5);
});
```

- [ ] **Step 3: Run reducer tests and verify failure**

```bash
npm test -- src/features/presence/reducer.test.ts
```

Expected: FAIL before reducer implementation.

- [ ] **Step 4: Implement `createRoomChannel`**

Channel shape:

```ts
const channel = supabase.channel(`upper-room:${roomId}`, {
  config: { presence: { key: `${userId}:${clientId}` } },
});
```

Subscribe to:

```ts
channel.on('presence', { event: 'sync' }, handlePresenceSync);
channel.on('broadcast', { event: 'viewport' }, handleViewportBroadcast);
```

Publish slow state with `channel.track(slowPresence)` after subscription. Publish live viewport with:

```ts
channel.send({
  type: 'broadcast',
  event: 'viewport',
  payload: viewport,
});
```

Throttle Broadcast to 250ms and send immediately on selection completion or branch change.

- [ ] **Step 5: Write component tests**

Prove:

- tabs show `Me`, `Paula`, `Ron`;
- tapping `Paula` calls `observeUser('paula')`;
- an observed-tab remote update changes displayed verse;
- first local scroll calls `claimObservedLocation()` before applying the local viewport update;
- tapping `Me` restores the user's saved window without mutating Paula's state;
- disconnected participant gets an offline/stale marker rather than disappearing silently.

- [ ] **Step 6: Implement `PresenceTabs` and integrate with `Reader`**

Persistent chrome stays one compact horizontal row. No `Sync`, `Follow`, or `Share focus` controls exist.

- [ ] **Step 7: Run tests**

```bash
npm test -- src/features/presence src/features/scripture/Reader.test.tsx
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/features/presence src/features/scripture/Reader.tsx
git commit -m "feat: make participant presence a sovereign viewport"
```

---

### Task 6: Add human witness events, branches, and room memory

**Files:**
- Create: `src/features/events/types.ts`
- Create: `src/features/events/projection.ts`
- Create: `src/features/events/projection.test.ts`
- Create: `src/features/events/MemorySheet.tsx`
- Create: `src/features/events/MemorySheet.test.tsx`
- Modify: `src/features/room/RoomScreen.tsx`
- Modify: `src/features/room/api.ts`

**Interfaces:**
- Consumes: durable events from Task 4 and canonical selections from Task 3.
- Produces: `projectBranch(events, branchId)`, `admittedEvents(events)`, `MemorySheet`, human action composer.

- [ ] **Step 1: Define the discriminated event union**

```ts
export type HumanEventKind = 'note' | 'question' | 'recognition' | 'objection' | 'return';
export type RoomEventKind = HumanEventKind | 'branch_created' | 'aihyper_proposed' | 'aihyper_admitted' | 'aihyper_refused';

export type RoomEvent = {
  id: string;
  roomId: string;
  seq: number;
  userId: string;
  kind: RoomEventKind;
  scripture: ScriptureSelection | null;
  parentEventId: string | null;
  branchId: string | null;
  payload: Record<string, unknown>;
  createdAt: string;
};
```

`return` payload is exactly:

```ts
type ReturnPayload = {
  text: string;
  changed: string;
  held: string;
  unresolved: string;
};
```

Empty strings are valid; the app must not force a completed theology worksheet.

- [ ] **Step 2: Write branch/admission projection tests**

```ts
it('keeps refused AI proposals visible but out of admitted state', () => {
  const visible = projectBranch(eventsWithRefusal, null);
  expect(visible.some(e => e.kind === 'aihyper_refused')).toBe(true);
  const admitted = admittedEvents(eventsWithRefusal);
  expect(admitted.some(e => e.id === refusedProposalId)).toBe(false);
});

it('projects a branch from the same immutable room history', () => {
  expect(projectBranch(events, branchEventId).map(e => e.seq)).toEqual([1, 3, 4, 8]);
});
```

- [ ] **Step 3: Implement projection as pure functions**

Rules:

1. root projection includes root events only plus branch-created markers;
2. branch projection includes ancestor context plus events whose `branchId` belongs to that branch chain;
3. `aihyper_refused` keeps the proposal/refusal visible as residue but the target proposal is excluded from `admittedEvents`;
4. original payloads are never edited.

- [ ] **Step 4: Build human action sheet from a Scripture selection**

Actions shown beside AIHYPER:

```text
Note · Question · Recognition · Objection · Branch · Return
```

Each submit calls `appendRoomEvent`; if the RPC fails, retain the typed local draft and show `Not saved — retry`.

- [ ] **Step 5: Build `MemorySheet` tests**

Assert:

- chronological sequence order;
- human/model provenance labels differ;
- tapping event calls `onNavigate(event.scripture)`;
- branch event exposes an `Enter branch` action;
- refusal shows residue status;
- memory sheet is closed by default and does not occupy permanent reader width.

- [ ] **Step 6: Implement `MemorySheet` and room navigation**

The sheet is a bottom drawer on narrow screens. Opening an event navigates the reader to the exact canonical selection; it does not manufacture a new durable event.

- [ ] **Step 7: Verify events/memory**

```bash
npm test -- src/features/events src/features/room
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/features/events src/features/room
git commit -m "feat: preserve human witness and branch memory"
```

---

### Task 7: Build evidence-bounded AIHYPER behind a server-side adapter

**Files:**
- Create: `src/features/aihyper/types.ts`
- Create: `src/features/aihyper/schema.ts`
- Create: `src/features/aihyper/schema.test.ts`
- Create: `src/features/aihyper/api.ts`
- Create: `src/features/aihyper/AIHyperSheet.tsx`
- Create: `src/features/aihyper/AIHyperSheet.test.tsx`
- Create: `supabase/functions/aihyper/provider.ts`
- Create: `supabase/functions/aihyper/provider.test.ts`
- Create: `supabase/functions/aihyper/prompt.ts`
- Create: `supabase/functions/aihyper/index.ts`

**Interfaces:**
- Consumes: authenticated room membership, `ScriptureSelection`, AIHYPER mode, optional Ask text, local WEB corpus/reference validator.
- Produces: validated `AIHyperResult`; durable `aihyper_proposed`, `aihyper_admitted`, and `aihyper_refused` events.

- [ ] **Step 1: Define a response schema that can represent refusal/unsupported evidence**

```ts
export const AIHyperProposalSchema = z.object({
  kind: z.enum(['crossref', 'context', 'word', 'echo', 'answer']),
  claim: z.string().min(1).max(600),
  rationale: z.string().min(1).max(900),
  scriptureRefs: z.array(z.object({
    book: z.string().min(3).max(3),
    chapter: z.number().int().positive(),
    startVerse: z.number().int().positive(),
    endVerse: z.number().int().positive().optional(),
  })).max(8),
  evidenceRefs: z.array(z.object({
    type: z.enum(['scripture', 'book_context', 'lexical']),
    id: z.string().min(1),
  })).max(12),
  confidence: z.enum(['strong', 'possible', 'uncertain']),
});

export const AIHyperResultSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('ok'), proposals: z.array(AIHyperProposalSchema).min(1).max(6) }),
  z.object({ status: z.literal('unsupported'), reason: z.string().min(1).max(400) }),
]);
```

- [ ] **Step 2: Write schema validation tests**

Reject:

- missing evidence refs for a `word` claim;
- more than six proposals;
- invalid three-letter Scripture book IDs;
- empty rationale;
- arbitrary model fields not represented by the schema.

Accept an explicit `unsupported` result.

- [ ] **Step 3: Implement the provider boundary using Gemini REST**

`provider.ts` exports:

```ts
export async function generateStructuredAIHyper(args: {
  apiKey: string;
  model: string;
  systemInstruction: string;
  prompt: string;
  fetchImpl?: typeof fetch;
}): Promise<unknown>;
```

Call:

```ts
await fetchImpl(
  `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
  {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemInstruction }] },
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' },
    }),
  },
);
```

Runtime secrets:

```text
GEMINI_API_KEY
AIHYPER_MODEL=gemini-3.6-flash
```

The model name remains environment-configurable; the event receipt records the actual model string used.

- [ ] **Step 4: Write provider tests with mocked fetch**

Prove:

- API key is sent only from the server function;
- non-2xx provider response becomes a typed service error;
- malformed JSON is rejected;
- valid JSON reaches Zod validation;
- model receipt records provider, model, invocation timestamp, and request mode.

- [ ] **Step 5: Implement the evidence gate before durable admission**

For every model-returned Scripture reference:

1. load the referenced chapter from the server-side WEB corpus or generated lookup;
2. verify start/end verses exist;
3. attach exact verse text as `evidenceRefs` metadata;
4. discard any proposal whose cited Scripture reference cannot be resolved.

For v0 `word` claims:

- if no configured lexical evidence record exists, return `status: 'unsupported'` with reason `Lexical evidence source is not configured for this claim.`
- never allow the model's own generated etymology or gloss to count as evidence.

For `context` claims:

- permit canonical/literary context supported by Scripture references;
- reject external historical-date/person claims unless a future curated `book_context` evidence record exists.

This keeps Words and Context visible without rewarding unsupported certainty.

- [ ] **Step 6: Implement the Edge Function membership boundary**

`index.ts` must:

1. require `Authorization: Bearer <user jwt>`;
2. instantiate a Supabase client using the request JWT and publishable key for membership reads;
3. verify caller is a member of `roomId`;
4. parse selection/mode with Zod;
5. call provider;
6. validate/filter evidence;
7. return the proposal result plus `modelReceipt`;
8. never write a durable room event itself.

The browser writes the proposal event only after receiving a validated result, keeping the invoking human attributable as the event author.

- [ ] **Step 7: Build the AIHYPER bottom sheet**

From an active selection show exactly:

```text
Crossrefs · Context · Words · Echoes · Ask
```

An `ok` proposal card provides:

```text
Open passage · Add to room · Branch · Refuse
```

Behavior:

- `Open passage` navigates ephemerally only;
- `Add to room` writes `aihyper_proposed` then `aihyper_admitted` referring to that proposal;
- `Branch` writes proposal/admission plus `branch_created` parented to the admitted proposal;
- `Refuse` writes proposal plus `aihyper_refused` and preserves residue;
- `unsupported` displays its reason and creates no event unless the human explicitly adds a note about it.

- [ ] **Step 8: Verify AIHYPER without a live model key**

```bash
npm test -- src/features/aihyper
supabase functions serve aihyper --env-file supabase/.env.test
```

Run function tests with mocked provider responses; no CI test depends on billable model calls.

- [ ] **Step 9: Manual one-shot provider smoke test**

With a real `GEMINI_API_KEY`, select John 1:5 and invoke `Crossrefs`. Verify the UI returns at least one openable, server-validated Scripture reference or an explicit unsupported/error state. Save the model receipt in test evidence; do not assert a specific theological answer.

- [ ] **Step 10: Commit**

```bash
git add src/features/aihyper supabase/functions/aihyper
git commit -m "feat: add evidence-bounded AIHYPER proposals"
```

---

### Task 8: Assemble the three-person room surface and fail-soft behavior

**Files:**
- Create: `src/features/room/RoomScreen.tsx`
- Create: `src/features/room/RoomScreen.test.tsx`
- Modify: `src/app/App.tsx`
- Modify: `src/styles.css`
- Modify: `vite.config.ts`
- Create: `tests/upper-room.spec.ts`

**Interfaces:**
- Consumes: all previous feature modules.
- Produces: complete v0 field-test flow.

- [ ] **Step 1: Write the integration tests before wiring**

Test `RoomScreen` with fake adapters/services to prove:

1. Scripture loads when presence service is offline.
2. Human Note remains available when AIHYPER is offline.
3. observing Paula changes only the displayed lens;
4. first local scroll while observing Paula claims Paula's current location into `mine`;
5. selecting text opens human actions and AIHYPER actions;
6. failed durable write keeps the typed draft with `Not saved — retry`;
7. tapping a memory event navigates to the exact selection;
8. no viewport update calls `appendRoomEvent`.

- [ ] **Step 2: Wire `RoomScreen` around one source of displayed-view truth**

Derive the visible chapter from:

```ts
const displayedViewport = presenceState.observingUserId
  ? presenceState.displayed
  : presenceState.mine;
```

The reader never reads remote presence maps directly. All observation/claim behavior goes through the presence reducer.

- [ ] **Step 3: Implement navigation without permanent furniture**

Top chrome contains:

- `Upper Room` / room title;
- current book + chapter control;
- compact presence tabs;
- one memory button.

No bottom navigation bar. AIHYPER/human actions appear only after selection. Memory is a sheet.

- [ ] **Step 4: Add offline/failure copy**

Exact copy:

```text
Presence unavailable — reading still works.
AIHYPER unavailable — your notes still work.
Not saved — retry.
Passage unavailable offline.
Paula is offline — showing their last live window.
```

Never replace a failed WEB chapter with another translation.

- [ ] **Step 5: Add Playwright field-flow test with three browser contexts**

`tests/upper-room.spec.ts` launches three authenticated storage states named `lu`, `paula`, and `ron` against local Supabase.

Test flow:

```ts
// conceptual sequence, implemented with actual locators
await lu.goto(roomUrl);
await paula.goto(roomUrl);
await ron.goto(roomUrl);
await paula.getByText('John 1:5').scrollIntoViewIfNeeded();
await lu.getByRole('button', { name: 'Paula' }).click();
await expect(lu.getByTestId('viewport-owner')).toHaveText('Paula');
await lu.getByText(/light shines/i).dblclick();
await expect(lu.getByTestId('viewport-owner')).toHaveText('Me');
await expect(lu.getByRole('button', { name: 'Crossrefs' })).toBeVisible();
```

Stub AIHYPER network output in deterministic E2E; the separate Task 7 smoke test covers the live provider.

- [ ] **Step 6: Prove reload/re-entry determinism**

In Playwright:

1. create a Note;
2. create a branch;
3. write a refused AIHYPER fixture proposal;
4. reload all three contexts;
5. assert event sequence/order is identical;
6. assert refusal residue remains visible;
7. assert no durable viewport events exist.

- [ ] **Step 7: Verify PWA/build and full test suite**

```bash
npm test
npm run build
npx playwright install --with-deps chromium
npm run test:e2e
```

Expected: all exit 0.

- [ ] **Step 8: Run the manual three-phone specimen checklist**

On three real phones in the same physical room:

```text
[ ] all three join the same private room
[ ] each can wander independently
[ ] Lu taps Paula and sees Paula's live reading window
[ ] Lu touches/scrolls while observing Paula and takes that exact place into Lu's own window
[ ] Ron double-taps a word and drags a multi-word selection
[ ] human Note works without AIHYPER
[ ] AIHYPER Crossrefs returns a validated proposal or explicit unsupported/error
[ ] one useful proposal is admitted
[ ] one bad proposal is refused and remains visible residue
[ ] one branch is created from a selected passage
[ ] all three leave and re-enter
[ ] durable history and branch projection recover intact
[ ] no one sees a public/share/publish action
```

Record only technical specimen notes unless all participants separately consent to preserve personal study content.

- [ ] **Step 9: Commit the assembled v0**

```bash
git add src tests vite.config.ts
git commit -m "feat: assemble Upper Room v0 field-test flow"
```

---

### Task 9: Documentation, repository evidence, and PR readiness

**Files:**
- Create: `README.md`
- Create: `docs/field-test-v0.md`
- Modify: `docs/superpowers/specs/2026-08-14-upper-room-v0-design.md` only if implementation discovered a factual mismatch; do not silently change product law.

**Interfaces:**
- Consumes: verified commands/results from Tasks 1–8.
- Produces: implementer/operator instructions and a complete PR evidence packet.

- [ ] **Step 1: Write README around the actual product law**

README opening:

```markdown
# Upper Room

Upper Room is a phone-first shared Scripture presence room.

The passage is the primary surface. Each participant keeps a sovereign reading window. Tap another person's presence to look through their current viewport; the first local reading gesture brings that same location into your own window. AIHYPER appears only after an intentional Scripture selection and proposes attributable, evidence-bounded doors rather than unsolicited teaching.
```

Include local setup, Supabase setup, WEBP corpus import, Edge Function secrets, test commands, and privacy boundary.

- [ ] **Step 2: Write `docs/field-test-v0.md`**

Include the exact three-phone checklist from Task 8 plus a specimen-note template:

```markdown
## Technical witness
- Build commit:
- Devices/browsers:
- Room id:
- Presence result:
- Selection result:
- AIHYPER result:
- Durable reload result:

## Human witness (optional, consented)
- What surprised us?
- What became easier?
- Where did the software get in the way?
- What should remain unresolved?
```

- [ ] **Step 3: Run fresh completion verification**

```bash
npm ci
npm test
npm run build
npm run test:e2e
```

Also run:

```bash
git status --short
git diff --check
```

Expected: verification commands exit 0; `git diff --check` prints nothing.

- [ ] **Step 4: Commit documentation**

```bash
git add README.md docs
git commit -m "docs: add Upper Room v0 field-test guide"
```

- [ ] **Step 5: Open a PR with implementation evidence**

PR body must include:

```markdown
## What this proves
- Scripture-first phone reading surface
- sovereign presence-as-viewport tabs
- double-tap canonical selection
- private append-only room history
- human witness events and branches
- evidence-bounded AIHYPER proposal/admit/refuse flow
- reload/re-entry determinism

## Verification
- `npm test`
- `npm run build`
- `npm run test:e2e`
- three-phone field specimen: PASS / NOT YET RUN

## Privacy
Room contents remain private-to-room. v0 exposes no public publishing action.
```

- [ ] **Step 6: Hand the PR to review/PR Completion**

Use Develoop review resolution and PR Completion only after the PR exists and fresh verification evidence is recorded. Do not merge automatically; PR Completion must bind any later landing approval to the exact ready head SHA.

---

## Self-review record

### Spec coverage

- Scripture-first phone surface: Tasks 1, 2, 3, 8.
- presence-as-viewport / no forced sync: Tasks 5, 8.
- double-tap range selection: Task 3.
- private durable rooms and membership: Task 4.
- append-only event history and refusal residue: Tasks 4, 6.
- branches and Return: Task 6.
- AIHYPER invocation/menu/structured proposal/evidence gate: Task 7.
- fail-soft behavior: Tasks 7, 8.
- PWA/offline shell: Tasks 1, 8.
- deterministic leave/rejoin: Tasks 6, 8.
- no public publishing: Tasks 4, 8, 9.
- first three-person field specimen: Tasks 8, 9.

### Type consistency

Canonical shared nouns are fixed across tasks:

```text
ScriptureRef
ScriptureChapter
ScriptureSelection
PresenceViewport
RoomEvent
AIHyperProposal
AIHyperResult
```

The presence subsystem never appends room events. AIHYPER Edge Function never appends room events. The authenticated invoking client remains the durable event author.

### Primary implementation references

- Vite current getting-started guide: `https://vite.dev/guide/`
- Supabase Realtime Presence: `https://supabase.com/docs/guides/realtime/presence`
- Supabase Realtime overview/Broadcast guidance: `https://supabase.com/docs/guides/realtime`
- Supabase JavaScript initialization: `https://supabase.com/docs/reference/javascript/initializing`
- eBible WEBP developer formats/public-domain statement: `https://ebible.org/details.php?all=1&id=engwebp`
- Gemini Generate Content REST API: `https://ai.google.dev/api/generate-content`

The plan intentionally keeps the Gemini model configurable even though the initial environment example uses `gemini-3.6-flash`.
