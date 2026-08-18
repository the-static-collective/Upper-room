# Dust Specimen 001 — Attention Weather

**Status:** Approved direction / design review gate  
**Date:** 2026-08-18  
**Repository:** `the-static-collective/Upper-room`

## Purpose

Upper Room already carries a strong constitutional claim:

> shared attention should become easier without making attention less free.

Dust Specimen 001 asks a narrower question:

> **Can prior human attention become faintly perceptible to later readers without becoming ranking, recommendation, consensus, surveillance, or authority?**

The selected answer is **realtime attention weather**: raw reading behavior remains local; only coarse, unattributed, lossy, rapidly decaying traces may enter the shared room projection.

Dust is evidence that attention occurred. It is **not** evidence that the attended thing is important, true, central, spiritually significant, or worthy of imitation.

---

## Why this approach

Three candidate shapes were considered.

### 1. Durable particles — rejected

Writing linger, scroll, and return events into room history would make the event field a surveillance log of reading movement. That conflicts with Upper Room's existing law that presence and viewport movement are ephemeral coordination, not durable evidence by default.

### 2. Realtime attention weather — selected

Raw attention stays local. A lossy projection emits only coarse concentration around Scripture coordinates. The projection decays, cannot identify a participant, cannot reconstruct source behavior, and has no authority-bearing effect.

### 3. Explicit witnessed Dust — deferred

A human may eventually choose to preserve a meaningful trace, but explicit preservation belongs closer to existing Note, Recognition, Question, Objection, Branch, and Return grammar. It is not the ambient primitive being tested here.

---

## Specimen boundary

The first implementation is intentionally smaller than the eventual realtime room feature.

Upper Room currently has the Scripture heartbeat but not durable room state, presence, selection, or AIHYPER wired into the executable application. Therefore Dust Specimen 001 should first exist as a **pure domain module** exercised by synthetic multi-reader traces over John 1.

No Supabase dependency is required for this specimen. No account, participant, or room identity is required to prove the primitive.

The specimen proves:

```text
synthetic local attention traces
          ↓
lossy classification
          ↓
coarse aggregation
          ↓
time decay
          ↓
AttentionWeather projection
          ↓
read-only noticeability cue
```

It does not prove realtime transport, persistence, privacy policy at network boundaries, or final visual treatment.

---

## Constitutional laws

The following are hard invariants.

```text
authority = none
navigation = unchanged
Scripture order = unchanged
Scripture text = unchanged
translation authority = unchanged
AIHYPER input/context = unchanged
room memory = unchanged
admission state = unchanged
```

Dust must never create:

- popularity counts;
- percentages;
- participant names;
- contributor identities;
- rankings;
- "most read" lists;
- recommended verses;
- notifications;
- streaks;
- badges;
- public telemetry;
- automatic AIHYPER context;
- semantic or doctrinal scoring.

A reader must remain able to traverse Scripture exactly as if no Dust existed.

---

## Raw attention remains local

The system may observe local interaction long enough to classify a bounded attention gesture, but raw events are not room artifacts.

Candidate local signals for the specimen:

- **linger** — the reader remains settled near a Scripture anchor beyond a minimum dwell threshold;
- **return** — the reader leaves an anchor and later comes back;
- **wander-return** — the reader materially traverses elsewhere and later returns;
- **explicit-selection** — the reader deliberately selects a Scripture range when selection infrastructure exists.

For Specimen 001, these signals are synthetic fixtures rather than production telemetry.

The aggregation boundary must be one-way: a shared weather sample cannot reconstruct the source participant, exact dwell duration, exact path, or ordered raw gesture history.

---

## Anti-feedback law

A visible weather cue must not cheaply manufacture more of itself.

> **Following the weather is not, by itself, new independent evidence of attention.**

If a reader notices a dusty verse because it shimmered and simply looks at it, that act alone must not strengthen the field.

A weather-influenced visit becomes eligible only after a stronger independent act occurs, such as:

- settling into a qualifying linger after the initial glance;
- later returning independently;
- wandering elsewhere and coming back;
- making an explicit selection.

The implementation must make provenance of the local observation sufficient to suppress cue-induced reflex amplification without making that provenance part of the shared room output.

---

## Data model

The public specimen types should remain small and Scripture-coordinate based.

```ts
type AttentionKind =
  | 'linger'
  | 'return'
  | 'wander-return'
  | 'explicit-selection';

type LocalAttentionTrace = {
  anchor: ScriptureRef;
  kind: AttentionKind;
  observedAtMs: number;
  cueInfluenced: boolean;
};

type AttentionWeatherSample = {
  anchor: ScriptureRef;
  concentration: 'trace' | 'present' | 'dense';
  observedKinds: AttentionKind[];
  expiresAtMs: number;
  authority: 'none';
};
```

The exact internal weights are implementation detail. The public projection exposes **coarse bands**, not raw numeric scores.

`observedKinds` is set-like and must not include participant counts or event counts.

A future network transport may choose an even poorer representation if needed for privacy.

---

## Decay

Dust is weather, not archive.

Every contribution loses influence with time. The field must naturally return to empty without cleanup by a human moderator.

Specimen 001 should use deterministic time decay so tests can prove:

1. a fresh qualifying trace can create a visible weather sample;
2. repeated independent trace kinds can increase the coarse concentration band;
3. stale traces lose influence;
4. all traces eventually fall below visibility;
5. no permanent historical record is required to reconstruct the current field.

Exact durations belong to implementation configuration, not constitutional semantics.

---

## Aggregation

Aggregation should reward **diversity of meaningful attention**, not volume.

A single reader generating many repeated low-value traces must not dominate the field. Multiple distinct qualifying kinds around the same anchor may produce a stronger concentration than many identical events.

The first algorithm should therefore favor:

- deduplicated kinds within a bounded time window;
- capped contribution per synthetic source window;
- decay over accumulation;
- coarse bands rather than numeric exposure.

Specimen 001 does not need to infer unique human beings. Its synthetic fixtures should nevertheless prove that event spam cannot create an arbitrarily strong field.

---

## Noticeability contract

The only lawful downstream effect is **perceptual noticeability**.

A consumer may map weather to a faint presentation cue, for example:

- subtle margin density;
- slight texture around a verse;
- restrained particulate shimmer;
- a barely stronger local contrast boundary.

The projection must not:

- move the viewport;
- reorder passages;
- open a cross-reference;
- start AIHYPER;
- preselect text;
- create a branch;
- create a durable event;
- change what counts as reachable;
- imply agreement.

The first domain specimen does not need to settle the final visual language. It only needs to expose enough state for a later UI to render a cue lawfully.

---

## Synthetic witness fixtures

The first witness should model three anonymous readers over John 1.

At minimum, fixtures should prove:

1. **single linger** — creates at most a faint `trace` band;
2. **independent return pattern** — can increase concentration without exposing who returned;
3. **wander-return plus linger** — produces a stronger but still non-authoritative field;
4. **spam resistance** — many duplicate low-value traces do not grow without bound;
5. **cue reflex suppression** — a cue-influenced glance contributes nothing by itself;
6. **cue followed by independent linger** — may lawfully contribute after the stronger act;
7. **decay** — identical fixtures evaluated later produce weaker or no weather;
8. **coordinate isolation** — attention on John 1:5 cannot alter John 1:6;
9. **Scripture immutability** — adapter output and verse order remain byte-for-byte / structurally unchanged by weather derivation.

---

## Failure behavior

Dust should fail toward absence.

- Invalid or incomplete local traces are ignored or rejected; they do not invent weather.
- Unknown attention kinds are rejected.
- Invalid Scripture coordinates cannot enter a weather sample.
- If decay configuration is unavailable, the consumer renders no weather rather than non-decaying residue.
- If weather computation fails, Scripture reading remains fully usable.

No failure may block Scripture rendering.

---

## Explicit non-goals

Dust Specimen 001 does not implement:

- realtime transport;
- Supabase presence;
- durable attention history;
- participant attribution;
- social analytics;
- recommendations;
- doctrinal or spiritual significance inference;
- AIHYPER integration;
- adaptive navigation;
- personalized feeds;
- room-wide consensus;
- explicit preserved witness events;
- final animation or art direction.

---

## Acceptance criteria

The specimen is successful when deterministic tests prove all of the following:

1. qualifying synthetic attention can derive a coarse weather sample for a Scripture anchor;
2. raw traces are not present in the public projection;
3. participant identity is neither required nor exposed;
4. duplicate-event spam is bounded;
5. cue-induced reflex attention cannot self-amplify the field;
6. stronger independent attention after a cue may contribute;
7. concentration decays to absence over time;
8. neighboring Scripture anchors remain unaffected;
9. weather carries `authority: 'none'`;
10. Scripture content, order, navigation, reachability, room memory, and AI context remain unchanged;
11. the application can ignore the module entirely and still render John 1 normally.

The governing statement is:

> **Dust lets the room remember that attention passed through without telling the next reader where to look, what mattered, or what to believe.**
