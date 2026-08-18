# Dust Specimen 001 — Attention Weather

**Status:** Implemented / review-ready specimen  
**Date:** 2026-08-18  
**Repository:** `the-static-collective/Upper-room`

## Purpose

Upper Room already carries a strong constitutional claim:

> shared attention should become easier without making attention less free.

Dust Specimen 001 asks a narrower question:

> **Can prior human attention become faintly perceptible to later readers without becoming ranking, recommendation, consensus, surveillance, or authority?**

The selected answer is **realtime attention weather**: raw reading behavior remains local; only coarse, unattributed, lossy, rapidly decaying concentration may enter the shared room projection.

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

Upper Room currently has the Scripture heartbeat but not durable room state, presence, selection, or AIHYPER wired into the executable application. Therefore Dust Specimen 001 exists as a **pure domain module** exercised by synthetic multi-reader observations over John 1.

No Supabase dependency is required for this specimen. No account, participant, or room identity is required to prove the primitive.

The specimen proves:

```text
synthetic local attention observations
          ↓
local eligibility classification
          ↓
lossy aggregation
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

The system may observe local interaction long enough to classify a bounded attention gesture, but raw observations are not room artifacts.

Candidate local observations for the specimen:

- **glance** — brief arrival near an anchor; never sufficient by itself;
- **linger** — the reader remains settled near a Scripture anchor beyond a minimum dwell threshold;
- **return** — the reader leaves an anchor and later comes back independently;
- **wander-return** — the reader materially traverses elsewhere and later returns;
- **explicit-selection** — the reader deliberately selects a Scripture range when selection infrastructure exists.

For Specimen 001, these observations are synthetic fixtures rather than production telemetry.

The aggregation boundary must be one-way: a shared weather sample cannot reconstruct the source participant, attention kind, exact dwell duration, exact path, cue provenance, or ordered raw observation history.

---

## Anti-feedback law

A visible weather cue must not cheaply manufacture more of itself.

> **Following the weather is not, by itself, new independent evidence of attention.**

If a reader notices a dusty verse because it shimmered and merely glances at it, that observation contributes nothing.

A weather-influenced arrival may become eligible only after a stronger act occurs:

- a qualifying linger after the initial glance;
- a material wander away and return;
- an explicit selection.

A later independent return may also qualify when its local provenance is no longer the weather cue itself.

Cue provenance exists only on the local observation side. It must be sufficient to suppress reflex amplification but must never enter the shared weather projection.

---

## Data model

The local specimen input may contain information that the shared output deliberately destroys.

```ts
type AttentionObservationKind =
  | 'glance'
  | 'linger'
  | 'return'
  | 'wander-return'
  | 'explicit-selection';

type LocalAttentionObservation = {
  anchor: ScriptureRef;
  kind: AttentionObservationKind;
  observedAtMs: number;
  cueSource: 'none' | 'weather';
};

type AttentionWeatherSample = {
  anchor: ScriptureRef;
  concentration: 'trace' | 'present' | 'dense';
  expiresAtMs: number;
  authority: 'none';
};
```

The exact internal weights, eligible-kind set, deduplication state, and decay curve are implementation details. The public projection exposes **coarse bands only**.

It exposes no participant count, event count, attention kind, cue provenance, or numeric score.

A future network transport may choose an even poorer representation if needed for privacy.

---

## Decay

Dust is weather, not archive.

Every contribution loses influence with time. The field must naturally return to empty without cleanup by a human moderator.

Specimen 001 uses deterministic time decay so tests prove:

1. a fresh qualifying observation can create a visible weather sample;
2. diverse independent qualifying observations can increase the coarse concentration band;
3. stale observations lose influence;
4. all observations eventually fall below visibility;
5. no permanent historical record is required to reconstruct the current field.

Exact durations remain implementation configuration, not constitutional semantics.

---

## Aggregation

Aggregation rewards **diversity of meaningful attention**, not volume.

Repeated low-value observations cannot dominate the field. Multiple distinct qualifying kinds around the same anchor may produce a stronger concentration than many identical events.

The first algorithm therefore uses:

- deduplicated qualifying kinds within a bounded time window;
- capped contribution from duplicate observations;
- decay over accumulation;
- coarse bands rather than numeric exposure.

Specimen 001 does not infer unique human beings. Its fixtures prove that event spam cannot create an arbitrarily strong field.

---

## Noticeability contract

The only lawful downstream effect is **perceptual noticeability**.

A future consumer may map weather to a faint presentation cue, for example:

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

Specimen 001 deliberately does **not** connect the domain module to the UI. Existing John 1 rendering remains independent of Dust.

---

## Synthetic witness fixtures

The executable witness models anonymous attention over John 1 without exposing reader identity in weather output.

Tests prove:

1. **single linger** — creates at most a faint `trace` band;
2. **diverse independent attention** — can increase concentration without exposing who acted or how many people acted;
3. **wander-return plus linger** — produces a stronger but still non-authoritative field;
4. **spam resistance** — many duplicate low-value observations do not grow without bound;
5. **cue reflex suppression** — a weather-influenced `glance` contributes nothing;
6. **cue followed by qualifying linger** — may lawfully contribute after the stronger act;
7. **decay** — identical fixtures evaluated later produce weaker or no weather;
8. **coordinate isolation** — attention on John 1:5 cannot alter John 1:6;
9. **projection impoverishment** — output exposes no attention kind, participant count, cue source, raw timing history, or source path;
10. **Scripture/application independence** — the existing App continues to render canonical John 1 without importing or requiring Dust.

---

## Failure behavior

Dust fails toward absence or explicit refusal.

- Invalid or incomplete local observations are rejected; they do not invent weather.
- Unknown observation kinds are rejected.
- Unknown cue sources are rejected.
- Invalid Scripture coordinates cannot enter a weather sample.
- Future-dated observations are rejected rather than producing negative-age weather.
- Invalid decay configuration is rejected rather than producing non-decaying residue.
- If weather computation is absent or fails, Scripture reading remains fully usable because the current App does not depend on the module.

No failure may block Scripture rendering.

---

## Reproducibility repair discovered during implementation

The first test-only RED commit exposed a pre-existing CI weakness before Vitest could run. Upper Room reconstructed `package-lock.json` from the live npm registry and then checked its SHA-256. A later optional Vitest peer publication changed peer resolution and caused npm 10.9.8 Arborist to fail before the checksum gate.

The accepted repair preserves the original contract but fixes its time dependency:

```text
fixed accepted registry horizon
          ↓
reconstruct package-lock.json
          ↓
verify dependency-lock.sha256
          ↓
npm ci
```

The horizon is pinned to the registry state that produced the already accepted lock witness. Advancing it is now an explicit dependency-admission act rather than an accidental effect of future package publication.

This repair changes no Dust semantics and adds no dependency.

---

## Implementation evidence

Observed RED → GREEN witnesses:

- **Task 1 RED:** GitHub Actions run `32179007964` reached Vitest only after the repaired dependency gate passed, then failed because `./attentionWeather` did not exist.
- **Task 2 RED:** run `32179224341` kept all Task 1 eligibility tests green while all nine derivation tests failed because `deriveAttentionWeather` was absent.
- **Final exact-head GREEN:** run `32179544863` on head `78da60ded3496299accb8c2cc963cc0a954c9b28` passed lock reconstruction/hash verification, `npm ci`, unit/component tests, production build, Chromium installation, phone-shaped Playwright witness, and proof artifact upload.
- **Final proof artifact:** `upper-room-milestone-b-proof`, artifact `9340284352`, digest `sha256:ea94be419dbe4ededf558bb697afcb39c5424c1557028e724b155e44ef64f918`.

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

The specimen is successful when deterministic evidence proves all of the following:

1. qualifying synthetic attention can derive a coarse weather sample for a Scripture anchor;
2. raw observations and their kinds are not present in the public projection;
3. participant identity is neither required nor exposed;
4. duplicate-event spam is bounded;
5. weather-influenced reflex attention cannot self-amplify the field;
6. stronger qualifying attention after a cue may contribute;
7. concentration decays to absence over time;
8. neighboring Scripture anchors remain unaffected;
9. weather carries `authority: 'none'`;
10. Scripture content, order, navigation, reachability, room memory, and AI context remain unchanged;
11. the application can ignore the module entirely and still render John 1 normally.

The governing statement is:

> **Dust lets the room remember that attention passed through without telling the next reader where to look, what mattered, or what to believe.**
