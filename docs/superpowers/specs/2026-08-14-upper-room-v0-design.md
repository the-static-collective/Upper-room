# Upper Room v0 — Shared Scripture Presence

**Status:** Design authority / implementation not yet started  
**Date:** 2026-08-14

## Purpose

Upper Room is a phone-first shared Bible reading room for people who are physically together or otherwise sharing an encounter.

It is not primarily a Bible chatbot, study-course platform, sermon generator, or synchronized presentation tool.

Its purpose is simpler:

> **Put our minds in the same room around the text without taking control of one another's attention.**

The design borrows the strongest laws from Groove Rooms: a durable room, sovereign participants, append-only memory, branches, attributable contributions, and realtime coordination that is not itself the source of truth.

The central artifact changes from audio to Scripture.

---

## Core laws

1. **Scripture owns the primary surface.** UI furniture stays subordinate to the passage.
2. **Presence is a viewport, not a command.** A participant can look through another participant's current reading window without being forcibly synchronized to it.
3. **Shared attention does not erase sovereign attention.** Nobody can move another person's viewport.
4. **AI does not speak unless invoked from a human selection.** No unsolicited insights, sermonizing, or ambient assistant chatter.
5. **AIHYPER proposes doors; humans decide which doors belong in the room.** AI output is attributable, inspectable, and admissible/refusable.
6. **Realtime state coordinates the encounter; durable events remember it.** Scroll position and presence are ephemeral. Notes, branches, admitted/refused proposals, and explicit returns are durable.
7. **First witness remains recoverable.** Later interpretation may deepen or change an encounter without rewriting the earlier trace.
8. **The text is not owned by the model.** AI output never becomes canonical Scripture or silent replacement context.

---

## v0 interaction model

### 1. Enter a room

A room has:

- a stable room identity;
- a starting Scripture anchor, such as `John 1`;
- durable membership;
- participant presence;
- an append-only room event history.

The starting anchor is a doorway, not a forced shared position. Participants may wander independently after entering.

### 2. Scripture-first reading surface

The main phone screen is almost entirely readable Scripture.

Minimal persistent chrome:

- room title / current book and chapter;
- participant presence indicators;
- a subtle entry point to room memory/history.

The first implementation should use the **World English Bible (WEB)** as the default text source because it can be distributed without creating a translation-licensing dependency. Scripture access must sit behind a translation adapter so later translations can be added lawfully without changing encounter semantics.

### 3. Presence indicators are viewport tabs

Every participant has a small presence indicator at the top of the reading surface.

The user's own indicator represents **my window**.

Tapping another participant, for example `Paula`, changes the current lens to **Paula's live viewport**:

- the passage she is currently reading;
- her approximate reading anchor / scroll location;
- her active selection, if any;
- her currently opened branch context, if one exists.

This is not remote control and not forced synchronization.

While another participant's tab is active, their ephemeral viewport updates can continue to move the displayed reading window so the observer can see what they are seeing.

**Sovereignty rule:** the first active local gesture that would navigate, scroll, or select text exits the other participant's tab and claims that same location into the user's own window. The user never edits or steers the other participant's viewport.

Therefore Upper Room needs no dedicated `Sync`, `Follow`, or `Share focus` button in v0.

Presence itself is the invitation.

### 4. Selection mode

Normal reading should feel like reading, not editing.

**Gesture:** double-tap inside Scripture to enter selection mode.

Behavior:

1. The tapped word becomes the initial anchor.
2. Drag handles expand or contract the selection across words, phrases, verses, or contiguous multi-verse ranges.
3. Releasing the selection opens the AIHYPER context sheet.
4. Dismissing the sheet returns to clean reading without creating a durable event unless the user explicitly records something.

The selection must preserve canonical Scripture coordinates independent of presentation layout:

- translation id;
- book;
- chapter;
- start verse + character/token offset where needed;
- end verse + character/token offset where needed;
- exact selected text as witnessed at creation time.

This lets the room recover the encounter even if typography, screen size, or later translation adapters change.

---

## AIHYPER

AIHYPER is not a conversational character living in the room.

It is an explicitly invoked hyper-reference instrument attached to a selected Scripture range.

### v0 menu

- **Crossrefs** — materially connected passages.
- **Context** — literary, narrative, historical, or canonical placement.
- **Words** — source-language or translation information only when supported by inspectable evidence.
- **Echoes** — quotation, allusion, recurring image, motif, narrative parallel, or repeated phrase candidates.
- **Ask** — a free-form question scoped to the current selection.

### Response contract

AIHYPER responses are **proposals**, not pronouncements.

Each proposal should contain:

```ts
type AIHyperProposal = {
  id: string;
  roomId: string;
  selectionId: string;
  kind: "crossref" | "context" | "word" | "echo" | "answer";
  claim: string;
  rationale: string;
  scriptureRefs: ScriptureRef[];
  evidenceRefs: EvidenceRef[];
  confidence: "strong" | "possible" | "uncertain";
  modelReceipt: ModelReceipt;
  createdByUserId: string;
  createdAt: string;
};
```

Requirements:

- Scripture references must be explicit and openable.
- Source-language claims must carry an evidence reference; unsupported lexical claims are refused rather than improvised.
- Confidence expresses evidence strength, not spiritual authority.
- The invoking human is attributable separately from the model that generated the proposal.
- AIHYPER output has no semantic effect on room memory until a human admits it, attaches a note to it, branches from it, or explicitly preserves its refusal.

Example:

> **Possible connection — Genesis 1:3–5**  
> John 1:5 reuses light/darkness imagery that is already structurally important in the opening creation narrative.  
> `Open passage` · `Add to room` · `Branch` · `Refuse`

The interface should prefer concise doors over generated essays.

---

## Human events

Humans remain the primary witnesses.

A selected Scripture range may receive:

- **Note** — observation in the participant's own words;
- **Question** — unresolved inquiry;
- **Recognition** — explicit lived or textual recognition;
- **Objection** — disagreement, resistance, confusion, or discomfort;
- **Branch** — open a bounded line of inquiry from this selection;
- **Return** — revisit an earlier selection/event and record what changed, held, or remains unresolved.

No category should require polished theology.

A sentence fragment is lawful.

Silence is lawful.

---

## Durable event grammar

Upper Room should reuse Groove Rooms' architectural distinction between ephemeral coordination and durable history.

```ts
type RoomEvent =
  | ScriptureNoteEvent
  | ScriptureQuestionEvent
  | RecognitionEvent
  | ObjectionEvent
  | BranchCreatedEvent
  | AIHyperProposedEvent
  | AIHyperAdmittedEvent
  | AIHyperRefusedEvent
  | ReturnEvent;
```

Every durable event carries:

- room id;
- participant / channel id;
- monotonic room sequence;
- Scripture selection or parent event coordinates;
- branch id if applicable;
- creation timestamp;
- provenance;
- immutable original payload.

Later events may refer to earlier events. They do not mutate them.

Refusal remains visible as residue but contributes no admitted semantic state, matching the existing Groove Rooms admission law.

---

## Branches

A branch is a focused inquiry that descends from a Scripture selection or durable event.

Example:

> `Ron branched from John 1:5 — "the darkness has not overcome it"`

The branch can contain:

- Ron's first reaction;
- Paula's note;
- Lu's cross-reference;
- an AIHYPER proposal;
- a refused AIHYPER proposal;
- a later return saying what changed.

Branches are projections over the same room history, not private replacement databases.

Leaving and re-entering the branch must recover the same admitted history.

---

## Presence state

Presence is deliberately lighter than room memory.

```ts
type PresenceViewport = {
  userId: string;
  roomId: string;
  translationId: string;
  book: string;
  chapter: number;
  anchorVerse: number;
  anchorOffset?: number;
  selection?: ScriptureSelection;
  branchId?: string;
  updatedAt: string;
};
```

Presence state is:

- realtime;
- replaceable;
- not append-only;
- not evidence by default;
- safe to lose and reconstruct.

It should use the realtime coordination channel rather than writing scroll events into durable room history.

This prevents the event field from becoming a surveillance log of every reading movement.

---

## Room memory surface

Room memory exists but should not compete with Scripture.

On phone, it should open as a sheet/drawer rather than permanently consuming screen width.

It shows chronological durable events and branch context:

- who contributed;
- exact Scripture anchor;
- human or AI provenance;
- admitted/refused status where relevant;
- parent / branch relations;
- later returns.

Tapping an event returns the reading surface to its Scripture location.

The memory surface is a witness trail, not the primary reading experience.

---

## Privacy and publication boundary

Upper Room is initially a private shared-study instrument even if its code repository is public.

Room contents are not publication-ready merely because they are durable.

Core law:

> **Encountered does not mean publishable.**

Room data needs an eventual disclosure model, but v0 should default all room events to room-private and provide no public publishing workflow.

Newsletter, Not-Pastor Ron, Bible-study, or other publication uses must require a later explicit consent/export step outside the core v0 reading loop.

---

## v0 architecture

Recommended initial stack, selected to stay close to Groove Rooms and phone-web constraints:

- React + TypeScript;
- mobile-first responsive PWA shell;
- Supabase Auth;
- Supabase Postgres for durable room/event state;
- Supabase Realtime for presence viewport coordination;
- translation adapter with WEB as first implementation;
- server-side AIHYPER endpoint so model credentials never reach clients;
- structured AIHYPER schema validation before proposals enter the room;
- append-only durable event writes with admission/refusal as separate events.

Groove Rooms is a donor architecture, not a codebase to fork blindly. Reuse laws and proven primitives where appropriate while keeping Scripture-specific concerns isolated.

### Bounded modules

1. **scripture/** — translation adapter, canonical coordinates, passage retrieval.
2. **presence/** — ephemeral participant viewport state and presence tabs.
3. **selection/** — gesture state and canonical text-range serialization.
4. **aihyper/** — request construction, evidence contract, validation, proposal receipts.
5. **room/** — durable membership and append-only event API.
6. **branches/** — branch projection over admitted event history.
7. **memory/** — chronological witness projection and return navigation.

Each module must have a narrow public interface so the AI provider, translation source, or UI implementation can change without changing the event grammar.

---

## Failure behavior

Upper Room should fail quietly around the Scripture surface.

- **Realtime presence unavailable:** reading still works; participant tabs show stale/offline state rather than blocking the room.
- **AIHYPER unavailable:** selection still supports human note/question/branch actions; no fake response is generated.
- **Evidence insufficient:** AIHYPER returns an explicit unsupported/uncertain result rather than filling the gap.
- **Durable write fails:** the UI does not pretend the event exists; preserve the local draft long enough to retry.
- **Translation source unavailable:** previously loaded/cached passage may remain readable; no alternate translation is silently substituted.
- **Participant disconnects while observed:** their viewport freezes with an offline indication; observer remains sovereign and can claim that location locally.

---

## v0 acceptance criteria

A three-person phone test should prove all of the following:

1. Three authenticated people can enter the same room and independently read the starting passage.
2. Each participant can wander without moving anyone else's viewport.
3. Tapping another participant's presence indicator shows that person's current reading location.
4. While observing another participant, their movement can update the observer's displayed lens without changing the observer's own saved viewport.
5. The observer's first active navigation/selection gesture exits the observed tab and begins from the same Scripture location in the observer's own window.
6. Double-tap enters selection mode and produces a stable canonical Scripture selection.
7. AIHYPER can be invoked only from an explicit selection or explicit Ask action attached to that selection.
8. AIHYPER returns structured, attributable proposals with inspectable Scripture/evidence references and confidence.
9. A human can admit, refuse, note, or branch from an AIHYPER proposal.
10. A human can add a first-witness note or question without invoking AI.
11. Durable events survive refresh and re-entry in deterministic room order.
12. Refused AIHYPER proposals remain visible as residue but do not affect admitted branch state.
13. Realtime viewport movement does **not** create durable scroll-history events.
14. Room memory can navigate back to the exact Scripture selection that produced an event.
15. All room content is private-to-room by default; no public publishing action exists in v0.
16. If AIHYPER or realtime presence fails, Scripture reading and human note-taking remain usable.

---

## Explicit non-goals for v0

- sermon generation;
- devotional feed;
- AI-initiated insights;
- forced synchronized scrolling;
- public social profiles;
- public room discovery;
- newsletter publishing;
- video/audio recording;
- full commentary-library ingestion;
- doctrinal scoring or adjudication;
- automated spiritual diagnosis;
- gamification / reading streaks;
- permanent telemetry of reading behavior.

---

## First field specimen

The first meaningful test is not a benchmark.

It is three people in the same room, each holding a phone, reading one passage together.

Success looks like:

- one person wanders;
- another taps their presence and sees where their attention went;
- somebody selects a phrase;
- AIHYPER reveals a useful door;
- somebody refuses a bad door;
- somebody writes something the machine could not have supplied;
- the group leaves;
- later, the room still remembers the encounter without pretending to own it.

> **The room succeeds when shared attention becomes easier without making attention less free.**
