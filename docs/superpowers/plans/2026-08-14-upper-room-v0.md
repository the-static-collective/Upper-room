# Upper Room v0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a phone-first private shared Scripture room where three people can read independently, inspect one another's live reading windows, select text, invoke evidence-bounded AIHYPER proposals, create durable human/AI witness events, branch, leave, and return without losing room history.

**Architecture:** A Vite React TypeScript PWA owns the Scripture-first phone surface. Supabase Auth/Postgres hold private durable room membership and append-only events. Supabase Realtime Presence holds slow-changing participant identity/location state while Broadcast carries throttled live viewport movement. AIHYPER runs in a Supabase Edge Function behind a provider adapter, validates structured Gemini output, verifies Scripture references against the local WEB corpus, and refuses unsupported claims instead of inventing evidence.

**Tech Stack:** Node.js 20.19+; Vite; React; TypeScript; Vitest; Testing Library; Playwright; `@supabase/supabase-js`; Supabase Postgres/Auth/Realtime/Edge Functions; Zod; `vite-plugin-pwa`; Gemini REST API.

## Global Constraints

- Scripture remains the dominant visual surface.
- Default Scripture source is the 66-book World English Bible Protestant edition (`engwebp`), stored verbatim and labeled WEB.
- Translation access lives behind `ScriptureAdapter`; event semantics never depend on rendered layout.
- All room content is private-to-room by default; v0 has no public publishing workflow.
- AIHYPER runs only from an explicit Scripture selection plus an explicit human menu action.
- AIHYPER output is a proposal, never canonical Scripture or authoritative interpretation.
- Unsupported lexical/historical claims return an explicit unsupported state.
- Presence is a viewport, not control: observing another participant never mutates that participant or the observer's saved viewport.
- Use Supabase Presence for slow-changing state; use throttled Broadcast for live viewport movement.
- Viewport/scroll movement is ephemeral and never becomes a durable room event.
- Notes, questions, recognitions, objections, branch creation, AIHYPER proposal/admission/refusal, and returns are append-only durable events.
- Refusal remains visible residue but has no admitted semantic effect.
- No forced synchronized scrolling, sermon generation, devotional feed, doctrinal scoring, gamification, or permanent reading telemetry.

---

## File Map

```text
.env.example
.github/workflows/ci.yml
index.html
package.json
playwright.config.ts
vite.config.ts
src/
  main.tsx
  styles.css
  test/setup.ts
  app/App.tsx
  app/App.test.tsx
  lib/supabase/{env.ts,client.ts}
  features/scripture/{types.ts,adapter.ts,webpAdapter.ts,webpAdapter.test.ts,Reader.tsx,Reader.test.tsx}
  features/selection/{selection.ts,selection.test.ts,SelectionLayer.tsx,SelectionLayer.test.tsx}
  features/presence/{types.ts,reducer.ts,reducer.test.ts,roomChannel.ts,PresenceTabs.tsx,PresenceTabs.test.tsx}
  features/room/{types.ts,api.ts,api.test.ts,RoomScreen.tsx,RoomScreen.test.tsx}
  features/events/{types.ts,projection.ts,projection.test.ts,MemorySheet.tsx,MemorySheet.test.tsx}
  features/aihyper/{types.ts,schema.ts,schema.test.ts,api.ts,AIHyperSheet.tsx,AIHyperSheet.test.tsx}
public/scripture/webp/{manifest.json,chapters/*.json}
scripts/import-webp.mjs
supabase/config.toml
supabase/migrations/20260814190000_upper_room_v0.sql
supabase/functions/aihyper/{index.ts,provider.ts,provider.test.ts,prompt.ts}
tests/upper-room.spec.ts
README.md
docs/field-test-v0.md
```

---

### Task 1: Establish the PWA and test floor

**Files:** create `package.json`, `vite.config.ts`, `playwright.config.ts`, `src/test/setup.ts`, `src/app/App.tsx`, `src/app/App.test.tsx`, `src/styles.css`, `.env.example`, `.github/workflows/ci.yml`.

**Interfaces:** produces runnable React app plus `npm test`, `npm run build`, `npm run lint`, `npm run test:e2e`.

- [ ] **Step 1: Scaffold Vite React TypeScript without deleting `docs/`**

```bash
npm create vite@latest upper-room-scaffold -- --template react-ts
cp -R upper-room-scaffold/src upper-room-scaffold/public upper-room-scaffold/index.html upper-room-scaffold/package.json upper-room-scaffold/tsconfig*.json upper-room-scaffold/vite.config.ts .
rm -rf upper-room-scaffold
npm install
npm install @supabase/supabase-js zod vite-plugin-pwa
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @playwright/test eslint
```

- [ ] **Step 2: Set scripts**

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

- [ ] **Step 3: Configure Vite/Vitest/PWA**

```ts
import { defineConfig } from 'vitest/config';
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
        background_color: '#111111'
      }
    })
  ],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts'
  }
});
```

`src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 4: Configure Playwright**

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure'
  },
  projects: [{ name: 'mobile-chrome', use: { ...devices['Pixel 7'] } }],
  webServer: {
    command: 'npm run build && npm run preview -- --host 127.0.0.1',
    port: 4173,
    reuseExistingServer: !process.env.CI
  }
});
```

- [ ] **Step 5: Write the failing shell test**

```tsx
import { render, screen } from '@testing-library/react';
import App from './App';

it('keeps Scripture as the primary promised surface', () => {
  render(<App />);
  expect(screen.getByRole('main')).toHaveAttribute('data-surface', 'scripture');
  expect(screen.getByText('Upper Room')).toBeInTheDocument();
});
```

- [ ] **Step 6: Run it and verify failure**

```bash
npm test -- src/app/App.test.tsx
```

Expected: FAIL before the shell is implemented.

- [ ] **Step 7: Implement the minimal shell**

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

CSS requirements: full-height viewport, readable line length, minimum 44px interactive targets, no permanent sidebars or bottom navigation.

- [ ] **Step 8: Add CI**

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

- [ ] **Step 9: Verify and commit**

```bash
npm test
npm run build
git add .
git commit -m "feat: establish Upper Room phone-first app shell"
```

---

### Task 2: Import WEBP and expose canonical Scripture coordinates

**Files:** create `src/features/scripture/types.ts`, `adapter.ts`, `webpAdapter.ts`, `webpAdapter.test.ts`, `scripts/import-webp.mjs`, generated `public/scripture/webp/*`.

**Interfaces:** produces `ScriptureRef`, `ScriptureChapter`, `ScriptureAdapter`, and `webpAdapter.getChapter()`.

- [ ] **Step 1: Define Scripture types**

```ts
export type ScriptureRef = {
  translationId: string;
  book: string;
  chapter: number;
  verse?: number;
};

export type ScriptureVerse = { verse: number; text: string };

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

- [ ] **Step 2: Write failing adapter tests**

```ts
it('loads John 1 by canonical coordinates', async () => {
  const chapter = await webpAdapter.getChapter({ translationId: 'webp', book: 'JHN', chapter: 1 });
  expect(chapter.book).toBe('JHN');
  expect(chapter.chapter).toBe(1);
  expect(chapter.verses[0]?.verse).toBe(1);
  expect(chapter.verses[0]?.text.length).toBeGreaterThan(0);
});

it('never substitutes another translation', async () => {
  await expect(webpAdapter.getChapter({ translationId: 'other', book: 'JHN', chapter: 1 }))
    .rejects.toThrow('Unsupported translation: other');
});
```

Run:

```bash
npm test -- src/features/scripture/webpAdapter.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement adapter**

```ts
export const webpAdapter: ScriptureAdapter = {
  translationId: 'webp',
  async listBooks() {
    const r = await fetch('/scripture/webp/manifest.json');
    if (!r.ok) throw new Error('WEB manifest unavailable');
    return r.json();
  },
  async getChapter(ref) {
    if (ref.translationId !== 'webp') throw new Error(`Unsupported translation: ${ref.translationId}`);
    const r = await fetch(`/scripture/webp/chapters/${ref.book}.${ref.chapter}.json`);
    if (!r.ok) throw new Error(`WEB passage unavailable: ${ref.book} ${ref.chapter}`);
    return r.json();
  }
};
```

- [ ] **Step 4: Implement the deterministic VPL importer**

Source archive: eBible `engwebp_vpl.zip`. Haiola's BibleWorks/VPL export is verse-oriented canonical text. Parse each canonical verse with:

```js
const VPL = /^([1-3]?[A-Za-z]{2})\s+(\d+):(\d+)\s+(.+)$/;
```

Normalize `rawBook.toUpperCase()` through this exact map:

```js
const BOOKS = {
  GEN:'GEN', EXO:'EXO', LEV:'LEV', NUM:'NUM', DEU:'DEU', JOS:'JOS', JDG:'JDG', RUT:'RUT',
  '1SA':'1SA', '2SA':'2SA', '1KI':'1KI', '2KI':'2KI', '1CH':'1CH', '2CH':'2CH', EZR:'EZR', NEH:'NEH', EST:'EST', JOB:'JOB', PSA:'PSA', PRO:'PRO', ECC:'ECC', SOL:'SNG',
  ISA:'ISA', JER:'JER', LAM:'LAM', EZE:'EZK', DAN:'DAN', HOS:'HOS', JOE:'JOL', AMO:'AMO', OBA:'OBA', JON:'JON', MIC:'MIC', NAH:'NAM', HAB:'HAB', ZEP:'ZEP', HAG:'HAG', ZEC:'ZEC', MAL:'MAL',
  MAT:'MAT', MAR:'MRK', LUK:'LUK', JOH:'JHN', ACT:'ACT', ROM:'ROM', '1CO':'1CO', '2CO':'2CO', GAL:'GAL', EPH:'EPH', PHI:'PHP', COL:'COL', '1TH':'1TH', '2TH':'2TH', '1TI':'1TI', '2TI':'2TI', TIT:'TIT', PHM:'PHM', HEB:'HEB', JAM:'JAS', '1PE':'1PE', '2PE':'2PE', '1JO':'1JN', '2JO':'2JN', '3JO':'3JN', JUD:'JUD', REV:'REV'
};
```

The importer must:

```js
const [archive, outDir] = process.argv.slice(2);
if (!archive || !outDir) throw new Error('usage: node scripts/import-webp.mjs <engwebp_vpl.zip> <output-dir>');
```

1. unzip to `fs.mkdtempSync(path.join(os.tmpdir(), 'upper-room-webp-'))` using `execFileSync('unzip', ['-q', archive, '-d', tempDir])`;
2. recursively find the largest `.txt`/`.vpltxt` file containing canonical verse lines;
3. for every non-empty line beginning with a three-character BibleWorks code, require `VPL` to match or throw with the line number;
4. reject any book code absent from `BOOKS`;
5. preserve the captured verse text exactly, except stripping the source line ending;
6. group into `{translationId:'webp',book,chapter,verses:[{verse,text}]}`;
7. write `chapters/BOOK.CHAPTER.json`;
8. write a manifest of `{id,name,chapters}` for 66 books;
9. throw unless the manifest has exactly 66 entries.

Do not hand-edit generated Scripture text.

- [ ] **Step 5: Import and verify**

```bash
mkdir -p vendor public/scripture/webp
# download https://ebible.org/Scriptures/engwebp_vpl.zip to vendor/engwebp_vpl.zip
node scripts/import-webp.mjs vendor/engwebp_vpl.zip public/scripture/webp
node -e "const m=require('./public/scripture/webp/manifest.json'); if(m.length!==66) process.exit(1); console.log('books',m.length)"
```

Expected: `books 66`.

- [ ] **Step 6: Run tests/build and commit**

```bash
npm test -- src/features/scripture/webpAdapter.test.ts
npm run build
git add scripts public/scripture src/features/scripture
git commit -m "feat: add canonical WEB Scripture adapter"
```

---

### Task 3: Build touch-first reading and selection

**Files:** create `Reader.tsx`, `Reader.test.tsx`, `selection.ts`, `selection.test.ts`, `SelectionLayer.tsx`, `SelectionLayer.test.tsx`.

**Interfaces:** consumes `ScriptureChapter`; produces canonical `ScriptureSelection` and callbacks `onViewportChange`, `onSelectionComplete`.

- [ ] **Step 1: Define selection**

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

Use `Intl.Segmenter('en', { granularity: 'word' })`; every rendered token stores its verse, token index, and exact starting character offset.

- [ ] **Step 2: Write reducer tests**

```ts
it('starts on one token and expands', () => {
  const a = selectionReducer(idleState, { type:'start', verse:5, token:3 });
  const b = selectionReducer(a, { type:'extend', verse:5, token:7 });
  expect(b.anchor).toEqual({ verse:5, token:3 });
  expect(b.focus).toEqual({ verse:5, token:7 });
});

it('normalizes backward drag ranges', () => {
  expect(normalizeRange({verse:5,token:7},{verse:4,token:2})).toEqual({
    start:{verse:4,token:2}, end:{verse:5,token:7}
  });
});
```

Run and expect FAIL:

```bash
npm test -- src/features/selection/selection.test.ts
```

- [ ] **Step 3: Implement pure reducer and token extraction**

States: `idle`, `selecting`, `complete`. DOM/pointer events stay outside the reducer.

- [ ] **Step 4: Write interaction tests for the double-tap law**

The second tap must land on the same token within 350ms. Then pointer movement extends the range. Assert completion contains exact text plus canonical offsets.

- [ ] **Step 5: Implement Reader tokens**

```tsx
<span data-verse={verse.verse} data-token={token.index} data-char={token.charStart}>
  {token.text}
</span>
```

Normal reading shows no toolbar. Selection furniture appears only after the double-tap detector enters selection mode.

- [ ] **Step 6: Verify and commit**

```bash
npm test -- src/features/scripture/Reader.test.tsx src/features/selection
npm run build
git add src/features/scripture/Reader* src/features/selection
git commit -m "feat: add touch-first canonical Scripture selection"
```

---

### Task 4: Create private rooms and append-only durable events

**Files:** create Supabase migration, Supabase client/env, room types/API/tests.

**Interfaces:** produces RPCs `create_room`, `join_room_by_invite`, `append_room_event` plus client functions of the same responsibility.

- [ ] **Step 1: Create schema**

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
  primary key (room_id,user_id)
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
  kind text not null check (kind in ('note','question','recognition','objection','branch_created','aihyper_proposed','aihyper_admitted','aihyper_refused','return')),
  scripture jsonb,
  parent_event_id uuid references public.room_events(id),
  branch_id uuid references public.room_events(id),
  payload jsonb not null,
  created_at timestamptz not null default now(),
  unique(room_id,seq)
);
```

- [ ] **Step 2: Implement sequence-authoritative append RPC**

```sql
create or replace function public.append_room_event(
  p_room_id uuid,
  p_kind text,
  p_scripture jsonb,
  p_parent_event_id uuid,
  p_branch_id uuid,
  p_payload jsonb
) returns public.room_events
language plpgsql security definer set search_path=public
as $$
declare v_seq bigint; v_event public.room_events;
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  if not exists(select 1 from room_members where room_id=p_room_id and user_id=auth.uid())
    then raise exception 'room membership required'; end if;
  update rooms set last_seq=last_seq+1 where id=p_room_id returning last_seq into v_seq;
  if v_seq is null then raise exception 'room not found'; end if;
  insert into room_events(room_id,seq,user_id,kind,scripture,parent_event_id,branch_id,payload)
    values(p_room_id,v_seq,auth.uid(),p_kind,p_scripture,p_parent_event_id,p_branch_id,p_payload)
    returning * into v_event;
  return v_event;
end $$;
```

No v0 update/delete RPC exists for `room_events`.

- [ ] **Step 3: Add RLS and room create/join RPCs**

Policies must prove:

- only members can read rooms/member lists/events;
- clients cannot directly insert/update/delete `room_events`;
- creator can inspect/revoke invites;
- `create_room(title,book,chapter,display_name)` creates room + creator membership + one UUID invite token;
- `join_room_by_invite(token,display_name)` inserts membership idempotently;
- anonymous users can read nothing.

- [ ] **Step 4: Write client tests**

```ts
it('preserves server sequence', async () => {
  rpc.mockResolvedValue({ data:{ id:'e1',seq:8 }, error:null });
  expect((await appendRoomEvent(client,input)).seq).toBe(8);
});

it('does not synthesize failed durable writes', async () => {
  rpc.mockResolvedValue({ data:null,error:{message:'room membership required'} });
  await expect(appendRoomEvent(client,input)).rejects.toThrow('room membership required');
});
```

- [ ] **Step 5: Configure client environment**

```dotenv
VITE_SUPABASE_URL=https://project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_replace_me
```

`env.ts` throws if either is absent. No browser bundle may contain `service_role`/`sb_secret_*`.

- [ ] **Step 6: Verify locally and commit**

```bash
supabase start
supabase db reset
npm test -- src/features/room
```

SQL smoke evidence must show outsider read denied, member read allowed, direct event insert denied, two append calls sequence `1,2`, and invite join idempotent.

```bash
git add supabase src/lib/supabase src/features/room .env.example
git commit -m "feat: add private append-only study rooms"
```

---

### Task 5: Make participant presence a live viewport tab

**Files:** create presence types/reducer/tests/channel/tabs.

**Interfaces:** produces `PresenceViewport`, `observeUser`, `claimObservedLocation`, and `createRoomChannel`.

- [ ] **Step 1: Define realtime payloads**

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

Presence `track()` changes only for online identity/book/chapter/branch. Broadcast `viewport` carries anchor/selection movement at max four sends/second, with immediate send on completed selection or branch change.

- [ ] **Step 2: Write sovereignty reducer tests**

```ts
it('observes Paula without overwriting mine', () => {
  const s = receiveRemoteViewport(observeUser(baseState,'paula'),'paula',paulaAtJohn5);
  expect(s.displayed).toEqual(paulaAtJohn5);
  expect(s.mine).toEqual(mySavedViewport);
});

it('claims displayed location on first local gesture', () => {
  const observed = receiveRemoteViewport(observeUser(baseState,'paula'),'paula',paulaAtJohn5);
  const s = claimObservedLocation(observed);
  expect(s.observingUserId).toBeNull();
  expect(s.mine.anchorVerse).toBe(5);
});
```

Run and expect FAIL:

```bash
npm test -- src/features/presence/reducer.test.ts
```

- [ ] **Step 3: Implement channel**

```ts
const channel = supabase.channel(`upper-room:${roomId}`, {
  config: { presence: { key: `${userId}:${clientId}` } }
});
channel.on('presence',{event:'sync'},handlePresenceSync);
channel.on('broadcast',{event:'viewport'},handleViewportBroadcast);
```

After `SUBSCRIBED`, call `channel.track(slowPresence)`. Send live windows with:

```ts
channel.send({ type:'broadcast', event:'viewport', payload:viewport });
```

Throttle to 250ms.

- [ ] **Step 4: Write PresenceTabs tests**

Prove `Me/Paula/Ron` tabs; tapping Paula enters observed lens; remote movement changes displayed window only; first local scroll/select invokes `claimObservedLocation` before applying local movement; tapping Me restores mine; disconnect marks stale/offline.

- [ ] **Step 5: Implement UI with no synchronization furniture**

Persistent presence is one compact top row. Do not add `Sync`, `Follow`, or `Share focus` controls.

- [ ] **Step 6: Verify and commit**

```bash
npm test -- src/features/presence src/features/scripture/Reader.test.tsx
git add src/features/presence src/features/scripture/Reader.tsx
git commit -m "feat: make participant presence a sovereign viewport"
```

---

### Task 6: Add human witness, branches, and room memory

**Files:** create event types/projection/tests/memory sheet; modify room screen/API.

**Interfaces:** produces `RoomEvent`, `projectBranch`, `admittedEvents`, human action sheet, `MemorySheet`.

- [ ] **Step 1: Define event union**

```ts
export type RoomEventKind =
  | 'note' | 'question' | 'recognition' | 'objection' | 'return'
  | 'branch_created' | 'aihyper_proposed' | 'aihyper_admitted' | 'aihyper_refused';

export type RoomEvent = {
  id:string; roomId:string; seq:number; userId:string; kind:RoomEventKind;
  scripture:ScriptureSelection|null; parentEventId:string|null;
  branchId:string|null; payload:Record<string,unknown>; createdAt:string;
};
```

`return` payload:

```ts
export type ReturnPayload = { text:string; changed:string; held:string; unresolved:string };
```

Empty strings are valid.

- [ ] **Step 2: Write projection tests**

```ts
it('shows refusal residue but removes proposal from admitted state', () => {
  expect(projectBranch(eventsWithRefusal,null).some(e=>e.kind==='aihyper_refused')).toBe(true);
  expect(admittedEvents(eventsWithRefusal).some(e=>e.id===refusedProposalId)).toBe(false);
});
```

Also prove branch projection includes ancestor context and branch descendants from one immutable room history.

- [ ] **Step 3: Implement human actions**

Selection action row:

```text
Note · Question · Recognition · Objection · Branch · Return
```

Every submit uses `appendRoomEvent`. Failure preserves typed local text and displays exactly `Not saved — retry.`

- [ ] **Step 4: Write and implement MemorySheet**

Tests assert chronological `seq`, human/model provenance labels, event→Scripture navigation, branch entry, refusal residue, and closed-by-default bottom sheet behavior.

- [ ] **Step 5: Verify and commit**

```bash
npm test -- src/features/events src/features/room
git add src/features/events src/features/room
git commit -m "feat: preserve human witness and branch memory"
```

---

### Task 7: Build evidence-bounded AIHYPER

**Files:** create client AIHYPER types/schema/API/sheet/tests and Edge Function provider/prompt/index/tests.

**Interfaces:** consumes authenticated room membership + selection + mode; produces `AIHyperResult` and durable proposal/admit/refuse events authored by the invoking human.

- [ ] **Step 1: Define strict schemas**

```ts
export const AIHyperProposalSchema = z.object({
  kind:z.enum(['crossref','context','word','echo','answer']),
  claim:z.string().min(1).max(600),
  rationale:z.string().min(1).max(900),
  scriptureRefs:z.array(z.object({
    book:z.string().regex(/^[1-3A-Z][A-Z]{2}$/),
    chapter:z.number().int().positive(),
    startVerse:z.number().int().positive(),
    endVerse:z.number().int().positive().optional()
  })).max(8),
  evidenceRefs:z.array(z.object({
    type:z.enum(['scripture','book_context','lexical']),
    id:z.string().min(1)
  })).max(12),
  confidence:z.enum(['strong','possible','uncertain'])
}).strict();

export const AIHyperResultSchema = z.discriminatedUnion('status',[
  z.object({status:z.literal('ok'),proposals:z.array(AIHyperProposalSchema).min(1).max(6)}),
  z.object({status:z.literal('unsupported'),reason:z.string().min(1).max(400)})
]);
```

- [ ] **Step 2: Write schema tests**

Reject missing lexical evidence for `word`, >6 proposals, bad book IDs, empty rationale, unknown fields. Accept explicit unsupported result.

- [ ] **Step 3: Implement Gemini provider boundary**

```ts
export async function generateStructuredAIHyper(args:{
  apiKey:string; model:string; systemInstruction:string; prompt:string; fetchImpl?:typeof fetch;
}):Promise<unknown> {
  const f=args.fetchImpl ?? fetch;
  const r=await f(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(args.model)}:generateContent`,{
    method:'POST',
    headers:{'content-type':'application/json','x-goog-api-key':args.apiKey},
    body:JSON.stringify({
      system_instruction:{parts:[{text:args.systemInstruction}]},
      contents:[{role:'user',parts:[{text:args.prompt}]}],
      generationConfig:{responseMimeType:'application/json'}
    })
  });
  if(!r.ok) throw new Error(`Gemini request failed: ${r.status}`);
  return r.json();
}
```

Secrets:

```text
GEMINI_API_KEY
AIHYPER_MODEL=gemini-3.6-flash
```

Model string is configurable and copied into the model receipt.

- [ ] **Step 4: Write provider tests with mocked fetch**

Prove key stays server-side, non-2xx becomes typed failure, malformed JSON is rejected, validated JSON reaches Zod gate, and receipt records provider/model/mode/time.

- [ ] **Step 5: Implement evidence gate**

For every returned Scripture ref, load WEB chapter and verify verse existence; attach exact verse text to evidence. Drop any proposal with unresolvable Scripture refs.

For `word`: if no curated lexical evidence exists, return:

```json
{"status":"unsupported","reason":"Lexical evidence source is not configured for this claim."}
```

For `context`: allow canonical/literary claims supported by Scripture refs; refuse external historical facts unless backed by a future curated `book_context` record. Model-generated assertions never count as their own evidence.

- [ ] **Step 6: Implement Edge Function membership boundary**

Require Bearer JWT; create a request-scoped Supabase client; verify room membership; parse request; call provider; evidence-filter result; return `AIHyperResult + modelReceipt`; do not append room events in the function.

- [ ] **Step 7: Implement AIHYPER sheet**

Menu exactly:

```text
Crossrefs · Context · Words · Echoes · Ask
```

Proposal actions:

```text
Open passage · Add to room · Branch · Refuse
```

`Open passage` is ephemeral. `Add to room` writes proposal then admission. `Branch` writes proposal/admission then branch event. `Refuse` writes proposal plus refusal residue. Unsupported result creates no event unless human separately writes a note.

- [ ] **Step 8: Verify mocked AI and one live smoke**

```bash
npm test -- src/features/aihyper
supabase functions serve aihyper --env-file supabase/.env.test
```

CI uses mocked provider only. With real `GEMINI_API_KEY`, manually select John 1:5 → Crossrefs and verify at least one server-validated openable Scripture reference or an explicit unsupported/error state. Do not test for a predetermined theology.

- [ ] **Step 9: Commit**

```bash
git add src/features/aihyper supabase/functions/aihyper
git commit -m "feat: add evidence-bounded AIHYPER proposals"
```

---

### Task 8: Assemble the three-person field-test flow

**Files:** create/modify `RoomScreen`, app wiring, styles, `tests/upper-room.spec.ts`, PWA behavior.

**Interfaces:** consumes all previous modules; produces complete v0.

- [ ] **Step 1: Write RoomScreen integration tests with fake services**

Prove:

1. Scripture still loads if presence service is offline.
2. Human Note remains usable if AIHYPER is offline.
3. observing Paula changes only displayed lens.
4. first local gesture while observing claims Paula's displayed location into mine.
5. selection opens human + AIHYPER actions.
6. failed durable write preserves draft with `Not saved — retry.`
7. memory event navigates to exact selection.
8. viewport update never calls `appendRoomEvent`.

- [ ] **Step 2: Wire one source of displayed-view truth**

```ts
const displayedViewport = presenceState.observingUserId
  ? presenceState.displayed
  : presenceState.mine;
```

Reader never reads remote presence maps directly.

- [ ] **Step 3: Keep UI furniture minimal**

Top chrome: room title/current book+chapter, presence tabs, one memory button. No bottom nav. Selection summons actions. Memory is bottom sheet.

Failure copy is exact:

```text
Presence unavailable — reading still works.
AIHYPER unavailable — your notes still work.
Not saved — retry.
Passage unavailable offline.
Paula is offline — showing their last live window.
```

- [ ] **Step 4: Add deterministic Playwright three-context flow**

Use three authenticated storage states (`lu`, `paula`, `ron`) against local Supabase. Core assertion sequence:

```ts
await lu.goto(roomUrl);
await paula.goto(roomUrl);
await ron.goto(roomUrl);
await lu.getByRole('button',{name:'Paula'}).click();
await expect(lu.getByTestId('viewport-owner')).toHaveText('Paula');
await lu.getByTestId('reader').dispatchEvent('wheel',{deltaY:300});
await expect(lu.getByTestId('viewport-owner')).toHaveText('Me');
```

Then select text, write a human note, admit one deterministic AI fixture proposal, refuse another, create a branch, reload all three, and prove identical durable event order plus refusal residue.

AIHYPER network is stubbed in E2E; Task 7 covers live provider smoke.

- [ ] **Step 5: Verify PWA and full suite**

```bash
npm test
npm run build
npx playwright install --with-deps chromium
npm run test:e2e
```

Expected: all exit 0.

- [ ] **Step 6: Run real three-phone specimen**

```text
[ ] three authenticated people enter same private room
[ ] each wanders independently
[ ] Lu taps Paula and sees Paula's live window
[ ] Lu scrolls/selects and takes that exact place into Lu's own window
[ ] Ron double-taps and drags a multi-word selection
[ ] human Note works without AIHYPER
[ ] AIHYPER produces validated proposal or explicit unsupported/error
[ ] useful proposal admitted
[ ] bad proposal refused and visible as residue
[ ] branch created
[ ] all leave/re-enter
[ ] durable history/branch recover intact
[ ] no public/share/publish action exists
```

Record only technical specimen notes unless each person separately consents to preserve personal study content.

- [ ] **Step 7: Commit assembled v0**

```bash
git add src tests vite.config.ts
git commit -m "feat: assemble Upper Room v0 field-test flow"
```

---

### Task 9: Document and prepare the PR for Completion

**Files:** create `README.md`, `docs/field-test-v0.md`.

**Interfaces:** produces operator instructions, field evidence, PR handoff.

- [ ] **Step 1: Write README opening exactly from product law**

```markdown
# Upper Room

Upper Room is a phone-first shared Scripture presence room.

The passage is the primary surface. Each participant keeps a sovereign reading window. Tap another person's presence to look through their current viewport; the first local reading gesture brings that same location into your own window. AIHYPER appears only after an intentional Scripture selection and proposes attributable, evidence-bounded doors rather than unsolicited teaching.
```

Then document local setup, WEB import, Supabase setup, Edge Function secrets, test commands, and room-private boundary.

- [ ] **Step 2: Write field-test record template**

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

- [ ] **Step 3: Fresh completion verification**

```bash
npm ci
npm test
npm run build
npm run test:e2e
git diff --check
git status --short
```

Expected: test/build/E2E/diff-check exit 0; no unexplained working-tree changes.

- [ ] **Step 4: Commit docs**

```bash
git add README.md docs
git commit -m "docs: add Upper Room v0 field-test guide"
```

- [ ] **Step 5: Open PR with evidence**

PR body:

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

- [ ] **Step 6: Hand to Develoop review resolution and PR Completion**

PR Completion may prepare, repair, observe checks/reviews, and reach verified-ready. Landing still requires explicit approval for the exact ready head SHA.

---

## Self-review Record

**Spec coverage:** Scripture surface Tasks 1–3/8; presence-tabs Task 5/8; selection Task 3; private durable rooms Task 4; human witness/branches/return Task 6; AIHYPER Task 7; fail-soft/PWA/re-entry Task 8; field specimen and PR evidence Tasks 8–9.

**Type consistency:** canonical shared nouns are `ScriptureRef`, `ScriptureChapter`, `ScriptureSelection`, `PresenceViewport`, `RoomEvent`, `AIHyperProposal`, `AIHyperResult`.

**Authority boundaries:** presence subsystem never appends room events; AIHYPER Edge Function never appends room events; the authenticated invoking client remains durable event author; model output never becomes Scripture.

**Primary references:** Vite guide `https://vite.dev/guide/`; Supabase Presence `https://supabase.com/docs/guides/realtime/presence`; Supabase Realtime/Broadcast `https://supabase.com/docs/guides/realtime`; eBible WEBP formats `https://ebible.org/details.php?all=1&id=engwebp`; Haiola BibleWorks/VPL description `https://haiola.org/haiola.htm`; Gemini Generate Content `https://ai.google.dev/api/generate-content`.
