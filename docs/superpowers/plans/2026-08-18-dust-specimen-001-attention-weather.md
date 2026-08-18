# Dust Specimen 001 — Attention Weather Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a pure, deterministic Upper Room domain specimen that converts synthetic local attention observations into coarse, decaying, non-authoritative Scripture attention weather without changing Scripture, navigation, room memory, or AI context.

**Architecture:** Add one isolated `src/features/dust/` module. Local observations contain the richer information needed to suppress feedback; `deriveAttentionWeather(...)` destroys that detail at the aggregation boundary and returns only verse anchor, coarse concentration, expiry, and `authority: 'none'`. No current UI component consumes the module in Specimen 001; existing John 1 rendering remains an explicit regression witness.

**Tech Stack:** TypeScript 7, Vitest 4, React 19/Vite 8 existing project floor; no new dependencies.

**Spec:** `docs/superpowers/specs/2026-08-18-dust-specimen-001-attention-weather-design.md`

## Global Constraints

- Raw reading behavior remains local; only coarse, unattributed, lossy, rapidly decaying concentration may enter the shared projection.
- Dust is evidence that attention occurred, not evidence that the attended thing is important, true, central, spiritually significant, or worthy of imitation.
- `authority = none`.
- Navigation, Scripture order, Scripture text, translation authority, AIHYPER input/context, room memory, and admission state remain unchanged.
- No popularity counts, percentages, participant names, contributor identities, rankings, recommendations, notifications, streaks, badges, public telemetry, automatic AIHYPER context, or semantic/doctrinal scoring.
- Following visible weather is not, by itself, independent evidence of attention.
- Shared output exposes no participant count, event count, attention kind, cue provenance, numeric score, exact timing history, or path.
- No Supabase, realtime transport, durable attention history, AIHYPER integration, adaptive navigation, explicit preserved witness events, or final visual treatment in this specimen.
- No new npm dependencies.

## File Structure

- Create `src/features/dust/types.ts` — public local-observation and shared-weather contracts plus configuration type.
- Create `src/features/dust/attentionWeather.ts` — eligibility, validation, deduplication, deterministic decay, aggregation, coarse-band projection, and canonical ordering.
- Create `src/features/dust/attentionWeather.test.ts` — all synthetic John 1 witness fixtures and constitutional regression tests for the pure domain module.
- Modify `src/app/App.test.tsx` — add one explicit regression assertion proving the application renders the same Scripture heartbeat with no Dust dependency or required weather input.

No production UI file changes are planned.

---

### Task 1: Define the Dust boundary and local eligibility law

**Files:**
- Create: `src/features/dust/types.ts`
- Create: `src/features/dust/attentionWeather.ts`
- Create: `src/features/dust/attentionWeather.test.ts`

**Interfaces:**
- Consumes: existing `ScriptureRef` from `src/features/scripture/types.ts`.
- Produces:
  - `AttentionObservationKind`
  - `LocalAttentionObservation`
  - `AttentionWeatherSample`
  - `AttentionWeatherConfig`
  - `DEFAULT_ATTENTION_WEATHER_CONFIG`
  - `DustSpecimenError`
  - `isEligibleAttentionObservation(observation: LocalAttentionObservation): boolean`

- [ ] **Step 1: Write the failing type/eligibility tests**

Create `src/features/dust/attentionWeather.test.ts` with this initial content:

```ts
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_ATTENTION_WEATHER_CONFIG,
  DustSpecimenError,
  isEligibleAttentionObservation,
} from './attentionWeather';
import type { LocalAttentionObservation } from './types';

const JHN_1_5 = Object.freeze({
  translationId: 'webp',
  book: 'JHN',
  chapter: 1,
  verse: 5,
});

function observation(
  kind: LocalAttentionObservation['kind'],
  cueSource: LocalAttentionObservation['cueSource'] = 'none',
  observedAtMs = 1_000,
): LocalAttentionObservation {
  return {
    anchor: JHN_1_5,
    kind,
    observedAtMs,
    cueSource,
  };
}

describe('Dust Specimen 001 local eligibility', () => {
  it('pins a deterministic default decay configuration', () => {
    expect(DEFAULT_ATTENTION_WEATHER_CONFIG).toEqual({
      freshWindowMs: 300_000,
      ttlMs: 600_000,
      traceThreshold: 0.5,
      presentThreshold: 2,
      denseThreshold: 4,
    });
  });

  it('never treats a glance as qualifying attention', () => {
    expect(isEligibleAttentionObservation(observation('glance', 'none'))).toBe(false);
    expect(isEligibleAttentionObservation(observation('glance', 'weather'))).toBe(false);
  });

  it('suppresses a weather-induced return but permits stronger weather-influenced acts', () => {
    expect(isEligibleAttentionObservation(observation('return', 'weather'))).toBe(false);
    expect(isEligibleAttentionObservation(observation('linger', 'weather'))).toBe(true);
    expect(isEligibleAttentionObservation(observation('wander-return', 'weather'))).toBe(true);
    expect(isEligibleAttentionObservation(observation('explicit-selection', 'weather'))).toBe(true);
  });

  it('permits independent qualifying attention', () => {
    expect(isEligibleAttentionObservation(observation('linger'))).toBe(true);
    expect(isEligibleAttentionObservation(observation('return'))).toBe(true);
    expect(isEligibleAttentionObservation(observation('wander-return'))).toBe(true);
    expect(isEligibleAttentionObservation(observation('explicit-selection'))).toBe(true);
  });

  it('rejects invalid Scripture coordinates at the domain boundary', () => {
    const invalid = {
      ...observation('linger'),
      anchor: { translationId: 'webp', book: 'JHN', chapter: 1 },
    } as LocalAttentionObservation;

    expect(() => isEligibleAttentionObservation(invalid)).toThrow(DustSpecimenError);
  });
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
npm test -- src/features/dust/attentionWeather.test.ts
```

Expected: FAIL because `./attentionWeather` and `./types` do not exist.

- [ ] **Step 3: Add the public Dust types**

Create `src/features/dust/types.ts`:

```ts
import type { ScriptureRef } from '../scripture/types';

export type AttentionObservationKind =
  | 'glance'
  | 'linger'
  | 'return'
  | 'wander-return'
  | 'explicit-selection';

export type LocalAttentionObservation = {
  anchor: ScriptureRef;
  kind: AttentionObservationKind;
  observedAtMs: number;
  cueSource: 'none' | 'weather';
};

export type AttentionConcentration = 'trace' | 'present' | 'dense';

export type AttentionWeatherSample = {
  anchor: ScriptureRef;
  concentration: AttentionConcentration;
  expiresAtMs: number;
  authority: 'none';
};

export type AttentionWeatherConfig = {
  freshWindowMs: number;
  ttlMs: number;
  traceThreshold: number;
  presentThreshold: number;
  denseThreshold: number;
};
```

- [ ] **Step 4: Add minimal validation and eligibility implementation**

Create `src/features/dust/attentionWeather.ts`:

```ts
import type { ScriptureRef } from '../scripture/types';
import type {
  AttentionWeatherConfig,
  LocalAttentionObservation,
} from './types';

export class DustSpecimenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DustSpecimenError';
  }
}

export const DEFAULT_ATTENTION_WEATHER_CONFIG: Readonly<AttentionWeatherConfig> = Object.freeze({
  freshWindowMs: 300_000,
  ttlMs: 600_000,
  traceThreshold: 0.5,
  presentThreshold: 2,
  denseThreshold: 4,
});

function assertVerseAnchor(anchor: ScriptureRef): void {
  if (
    anchor.translationId.trim() === '' ||
    anchor.book.trim() === '' ||
    !Number.isInteger(anchor.chapter) ||
    anchor.chapter <= 0 ||
    !Number.isInteger(anchor.verse) ||
    (anchor.verse ?? 0) <= 0
  ) {
    throw new DustSpecimenError('attention weather requires a valid verse-level Scripture anchor');
  }
}

export function isEligibleAttentionObservation(observation: LocalAttentionObservation): boolean {
  assertVerseAnchor(observation.anchor);

  if (!Number.isFinite(observation.observedAtMs) || observation.observedAtMs < 0) {
    throw new DustSpecimenError('attention observation requires a finite non-negative timestamp');
  }

  if (observation.kind === 'glance') return false;
  if (observation.cueSource === 'weather' && observation.kind === 'return') return false;

  return true;
}
```

- [ ] **Step 5: Run focused tests and verify GREEN**

Run:

```bash
npm test -- src/features/dust/attentionWeather.test.ts
```

Expected: PASS all Task 1 tests.

- [ ] **Step 6: Run TypeScript/build floor**

Run:

```bash
npm run build
```

Expected: PASS; the new pure domain module introduces no browser-incompatible dependency.

- [ ] **Step 7: Commit Task 1**

```bash
git add src/features/dust/types.ts src/features/dust/attentionWeather.ts src/features/dust/attentionWeather.test.ts
git commit -m "feat: define Dust attention eligibility boundary"
```

---

### Task 2: Derive coarse weather with deduplication and deterministic decay

**Files:**
- Modify: `src/features/dust/attentionWeather.ts`
- Modify: `src/features/dust/attentionWeather.test.ts`

**Interfaces:**
- Consumes: `LocalAttentionObservation[]`, evaluation time, optional `AttentionWeatherConfig`.
- Produces: `deriveAttentionWeather(observations: readonly LocalAttentionObservation[], nowMs: number, config?: Readonly<AttentionWeatherConfig>): AttentionWeatherSample[]`.
- Output rule: no raw observations, kinds, counts, cue source, paths, or numeric score appear in `AttentionWeatherSample`.

**Algorithm pinned for Specimen 001:**

- Validate configuration: `freshWindowMs > 0`, `ttlMs > freshWindowMs`, thresholds finite and `0 < traceThreshold < presentThreshold < denseThreshold`.
- Validate `nowMs` as finite and non-negative.
- Ignore ineligible observations (`glance`; `return` with `cueSource: 'weather'`).
- Ignore future observations (`observedAtMs > nowMs`) by rejecting them with `DustSpecimenError`; do not silently time-travel.
- Group by canonical verse key: `translationId|book|chapter|verse`.
- Within each anchor, deduplicate by qualifying attention kind, retaining only the most recent eligible observation for each kind.
- Internal weights:
  - `linger = 1`
  - `return = 1`
  - `wander-return = 2`
  - `explicit-selection = 2`
- Freshness factor:
  - age `< freshWindowMs`: `1`
  - age `>= freshWindowMs && age < ttlMs`: `0.5`
  - age `>= ttlMs`: `0`
- Internal score = sum of `weight * freshness` over deduplicated eligible kinds.
- Band:
  - `< traceThreshold`: no sample
  - `>= traceThreshold && < presentThreshold`: `trace`
  - `>= presentThreshold && < denseThreshold`: `present`
  - `>= denseThreshold`: `dense`
- `expiresAtMs` = maximum `observedAtMs + ttlMs` among deduplicated observations that still have nonzero freshness.
- Return samples sorted lexically by canonical verse key for deterministic output.

- [ ] **Step 1: Add failing aggregation/decay tests**

Append to `src/features/dust/attentionWeather.test.ts` and update imports to include `deriveAttentionWeather`:

```ts
import {
  DEFAULT_ATTENTION_WEATHER_CONFIG,
  DustSpecimenError,
  deriveAttentionWeather,
  isEligibleAttentionObservation,
} from './attentionWeather';
```

Then append:

```ts
describe('Dust Specimen 001 weather derivation', () => {
  const NOW = 1_000_000;

  it('derives a faint trace from one fresh linger', () => {
    const result = deriveAttentionWeather([
      observation('linger', 'none', NOW - 1_000),
    ], NOW);

    expect(result).toEqual([
      {
        anchor: JHN_1_5,
        concentration: 'trace',
        expiresAtMs: NOW - 1_000 + 600_000,
        authority: 'none',
      },
    ]);
  });

  it('rewards diverse attention without exposing the kinds', () => {
    const result = deriveAttentionWeather([
      observation('linger', 'none', NOW - 1_000),
      observation('wander-return', 'none', NOW - 2_000),
    ], NOW);

    expect(result[0]?.concentration).toBe('present');
    expect(result[0]).not.toHaveProperty('kind');
    expect(result[0]).not.toHaveProperty('observedKinds');
    expect(result[0]).not.toHaveProperty('count');
    expect(result[0]).not.toHaveProperty('score');
    expect(result[0]).not.toHaveProperty('cueSource');
  });

  it('bounds duplicate-event spam by attention kind', () => {
    const spam = Array.from({ length: 50 }, (_, index) =>
      observation('linger', 'none', NOW - index),
    );

    expect(deriveAttentionWeather(spam, NOW)[0]?.concentration).toBe('trace');
  });

  it('does not let a weather-induced glance or return self-amplify the field', () => {
    const result = deriveAttentionWeather([
      observation('glance', 'weather', NOW - 100),
      observation('return', 'weather', NOW - 200),
    ], NOW);

    expect(result).toEqual([]);
  });

  it('allows a stronger qualifying act after a weather cue', () => {
    const result = deriveAttentionWeather([
      observation('glance', 'weather', NOW - 5_000),
      observation('linger', 'weather', NOW - 1_000),
    ], NOW);

    expect(result[0]?.concentration).toBe('trace');
  });

  it('decays fresh weather to a weaker band and then to absence', () => {
    const source = [
      observation('wander-return', 'none', 100_000),
    ];

    expect(deriveAttentionWeather(source, 100_001)[0]?.concentration).toBe('present');
    expect(deriveAttentionWeather(source, 400_000)[0]?.concentration).toBe('trace');
    expect(deriveAttentionWeather(source, 700_000)).toEqual([]);
  });

  it('keeps neighboring verse anchors isolated and output deterministically ordered', () => {
    const verseSix: LocalAttentionObservation = {
      anchor: { ...JHN_1_5, verse: 6 },
      kind: 'wander-return',
      observedAtMs: NOW - 1_000,
      cueSource: 'none',
    };

    const result = deriveAttentionWeather([
      verseSix,
      observation('linger', 'none', NOW - 2_000),
    ], NOW);

    expect(result.map((sample) => sample.anchor.verse)).toEqual([5, 6]);
    expect(result[0]?.concentration).toBe('trace');
    expect(result[1]?.concentration).toBe('present');
  });

  it('rejects future observations instead of inventing negative-age weather', () => {
    expect(() =>
      deriveAttentionWeather([
        observation('linger', 'none', NOW + 1),
      ], NOW),
    ).toThrow(DustSpecimenError);
  });
});
```

- [ ] **Step 2: Run focused tests and verify RED**

Run:

```bash
npm test -- src/features/dust/attentionWeather.test.ts
```

Expected: FAIL because `deriveAttentionWeather` is not exported.

- [ ] **Step 3: Implement deterministic aggregation**

Extend `src/features/dust/attentionWeather.ts` with these imports and helpers:

```ts
import type {
  AttentionConcentration,
  AttentionObservationKind,
  AttentionWeatherConfig,
  AttentionWeatherSample,
  LocalAttentionObservation,
} from './types';

const ATTENTION_WEIGHT: Readonly<Record<Exclude<AttentionObservationKind, 'glance'>, number>> = Object.freeze({
  linger: 1,
  return: 1,
  'wander-return': 2,
  'explicit-selection': 2,
});

function assertConfig(config: Readonly<AttentionWeatherConfig>): void {
  const valid =
    Number.isFinite(config.freshWindowMs) &&
    Number.isFinite(config.ttlMs) &&
    config.freshWindowMs > 0 &&
    config.ttlMs > config.freshWindowMs &&
    Number.isFinite(config.traceThreshold) &&
    Number.isFinite(config.presentThreshold) &&
    Number.isFinite(config.denseThreshold) &&
    config.traceThreshold > 0 &&
    config.traceThreshold < config.presentThreshold &&
    config.presentThreshold < config.denseThreshold;

  if (!valid) throw new DustSpecimenError('invalid attention weather configuration');
}

function anchorKey(anchor: ScriptureRef): string {
  assertVerseAnchor(anchor);
  return `${anchor.translationId}|${anchor.book}|${anchor.chapter}|${anchor.verse}`;
}

function freshness(ageMs: number, config: Readonly<AttentionWeatherConfig>): number {
  if (ageMs < config.freshWindowMs) return 1;
  if (ageMs < config.ttlMs) return 0.5;
  return 0;
}

function concentrationFor(score: number, config: Readonly<AttentionWeatherConfig>): AttentionConcentration | null {
  if (score < config.traceThreshold) return null;
  if (score < config.presentThreshold) return 'trace';
  if (score < config.denseThreshold) return 'present';
  return 'dense';
}
```

Then add the public derivation:

```ts
export function deriveAttentionWeather(
  observations: readonly LocalAttentionObservation[],
  nowMs: number,
  config: Readonly<AttentionWeatherConfig> = DEFAULT_ATTENTION_WEATHER_CONFIG,
): AttentionWeatherSample[] {
  if (!Number.isFinite(nowMs) || nowMs < 0) {
    throw new DustSpecimenError('attention weather requires a finite non-negative evaluation time');
  }
  assertConfig(config);

  const byAnchor = new Map<string, Map<Exclude<AttentionObservationKind, 'glance'>, LocalAttentionObservation>>();

  for (const observation of observations) {
    const eligible = isEligibleAttentionObservation(observation);
    if (observation.observedAtMs > nowMs) {
      throw new DustSpecimenError('attention observation cannot occur after the evaluation time');
    }
    if (!eligible) continue;

    const key = anchorKey(observation.anchor);
    const byKind = byAnchor.get(key) ?? new Map();
    const kind = observation.kind as Exclude<AttentionObservationKind, 'glance'>;
    const current = byKind.get(kind);
    if (!current || current.observedAtMs < observation.observedAtMs) {
      byKind.set(kind, observation);
    }
    byAnchor.set(key, byKind);
  }

  const samples: Array<{ key: string; sample: AttentionWeatherSample }> = [];

  for (const [key, byKind] of byAnchor.entries()) {
    let score = 0;
    let expiresAtMs = 0;
    let anchor: ScriptureRef | null = null;

    for (const [kind, observation] of byKind.entries()) {
      const ageMs = nowMs - observation.observedAtMs;
      const factor = freshness(ageMs, config);
      if (factor === 0) continue;

      score += ATTENTION_WEIGHT[kind] * factor;
      expiresAtMs = Math.max(expiresAtMs, observation.observedAtMs + config.ttlMs);
      anchor = observation.anchor;
    }

    const concentration = concentrationFor(score, config);
    if (!concentration || !anchor) continue;

    samples.push({
      key,
      sample: {
        anchor: Object.freeze({ ...anchor }),
        concentration,
        expiresAtMs,
        authority: 'none',
      },
    });
  }

  return samples
    .sort((left, right) => left.key.localeCompare(right.key))
    .map(({ sample }) => sample);
}
```

- [ ] **Step 4: Run focused tests and verify GREEN**

Run:

```bash
npm test -- src/features/dust/attentionWeather.test.ts
```

Expected: PASS all Task 1 and Task 2 tests.

- [ ] **Step 5: Run full unit suite and build**

Run:

```bash
npm test
npm run build
```

Expected: both PASS.

- [ ] **Step 6: Commit Task 2**

```bash
git add src/features/dust/attentionWeather.ts src/features/dust/attentionWeather.test.ts
git commit -m "feat: derive decaying Dust attention weather"
```

---

### Task 3: Prove projection impoverishment, immutability, and application independence

**Files:**
- Modify: `src/features/dust/attentionWeather.test.ts`
- Modify: `src/app/App.test.tsx`

**Interfaces:**
- Consumes: `deriveAttentionWeather(...)` from Task 2 and the existing `App` Scripture heartbeat.
- Produces: no new production interface; this task closes constitutional evidence gaps.

- [ ] **Step 1: Add failing immutability and projection-shape tests**

Append to `src/features/dust/attentionWeather.test.ts`:

```ts
describe('Dust Specimen 001 constitutional boundaries', () => {
  const NOW = 2_000_000;

  it('does not mutate local observations or their Scripture anchors', () => {
    const input: LocalAttentionObservation = {
      anchor: { ...JHN_1_5 },
      kind: 'wander-return',
      observedAtMs: NOW - 1_000,
      cueSource: 'none',
    };
    const before = structuredClone(input);

    deriveAttentionWeather([input], NOW);

    expect(input).toEqual(before);
  });

  it('projects exactly the intentionally impoverished public keys', () => {
    const [sample] = deriveAttentionWeather([
      observation('explicit-selection', 'none', NOW - 1_000),
    ], NOW);

    expect(Object.keys(sample ?? {}).sort()).toEqual([
      'anchor',
      'authority',
      'concentration',
      'expiresAtMs',
    ]);
  });

  it('never exposes raw observation metadata through nested output', () => {
    const source = observation('explicit-selection', 'weather', NOW - 1_000);
    const serialized = JSON.stringify(deriveAttentionWeather([source], NOW));

    expect(serialized).not.toContain('explicit-selection');
    expect(serialized).not.toContain('cueSource');
    expect(serialized).not.toContain('weather\"');
    expect(serialized).not.toContain(String(source.observedAtMs));
  });
});
```

Run:

```bash
npm test -- src/features/dust/attentionWeather.test.ts
```

Expected: the exact public-key test should PASS if Task 2 stayed minimal; if any accidental metadata leaked, it must FAIL here and be removed before proceeding. Treat an unexpected PASS as valid evidence, not a reason to add artificial production changes.

- [ ] **Step 2: Add an explicit App independence regression**

Extend the existing test in `src/app/App.test.tsx` with assertions that the Scripture surface requires no Dust data and retains canonical verse identity:

```ts
expect(screen.getByRole('main')).not.toHaveAttribute('data-attention-weather');
expect(document.getElementById('JHN-1-5')).toHaveTextContent(
  'The light shines in the darkness, and the darkness hasn’t overcome it.',
);
```

Do not import the Dust module into `App.test.tsx`. The absence of that dependency is part of the proof.

- [ ] **Step 3: Run the App test**

Run:

```bash
npm test -- src/app/App.test.tsx
```

Expected: PASS. No production App/Reader change should be necessary.

- [ ] **Step 4: Run all required verification**

Run:

```bash
npm test
npm run build
npm run test:e2e
```

Expected:

- unit/component suite PASS;
- TypeScript + Vite production build PASS;
- existing phone-shaped Playwright Scripture witness PASS;
- no new package dependency or lockfile change.

- [ ] **Step 5: Inspect the final diff for forbidden coupling**

Run:

```bash
git diff main...HEAD -- src/features/dust src/app/App.test.tsx package.json dependency-lock.sha256
```

Expected:

- production changes exist only under `src/features/dust/`;
- `src/app/App.test.tsx` contains regression-only assertions;
- `package.json` and `dependency-lock.sha256` are unchanged;
- no Supabase, room, AIHYPER, navigation, persistence, or participant identity import appears.

- [ ] **Step 6: Commit Task 3**

```bash
git add src/features/dust/attentionWeather.test.ts src/app/App.test.tsx
git commit -m "test: prove Dust remains noticeability-only"
```

---

### Task 4: Prepare the specimen PR for review without widening scope

**Files:**
- Modify: PR description only; no repository file required unless verification uncovers a real defect.

**Interfaces:**
- Consumes: completed Tasks 1–3 and their test/build evidence.
- Produces: a reviewable PR whose claims match observed verification.

- [ ] **Step 1: Re-run the repository verification from a clean HEAD**

Run:

```bash
npm test
npm run build
npm run test:e2e
```

Expected: all PASS on the exact final head.

- [ ] **Step 2: Record exact specimen claims in the PR body**

The PR body must state only claims established by the tests:

```markdown
## Dust Specimen 001 proof

- raw attention observations remain input-only and are absent from the public projection;
- weather output contains only Scripture anchor, coarse concentration, expiry, and `authority: none`;
- weather-induced glance/return reflexes do not amplify the field;
- stronger qualifying acts after a cue may contribute;
- duplicate-kind spam is bounded;
- weather decays to absence;
- neighboring verse coordinates remain isolated;
- current Scripture rendering, navigation, room memory, and AI context remain untouched;
- no new dependency, transport, persistence, Supabase, or UI coupling was introduced.
```

Do not claim realtime privacy, multi-device behavior, production telemetry protection, or visual UX proof; those are outside this specimen.

- [ ] **Step 3: Request review focused on constitutional leakage**

Ask reviewers to prioritize:

```text
1. Can any raw observation metadata escape through AttentionWeatherSample?
2. Can a cue-induced reflex create a self-reinforcing loop?
3. Can duplicate low-value events dominate concentration?
4. Can Dust affect Scripture order, navigation, AIHYPER, room memory, or authority?
5. Can stale Dust persist indefinitely?
```

- [ ] **Step 4: Stop at verified review readiness**

Do not merge or enable auto-merge without the repository's normal PR-completion landing gate and fresh exact-head confirmation.

---

## Self-review checklist for the implementer

Before calling the implementation complete, verify each spec requirement maps to observed evidence:

- local-only raw observation richness → Task 1/2 tests;
- no glance feedback amplification → Task 1/2 tests;
- stronger post-cue acts may qualify → Task 1/2 tests;
- lossy output → Task 2/3 shape and serialization tests;
- no identity/count/kind exposure → Task 2/3 tests;
- deterministic decay → Task 2 tests;
- duplicate spam bounded → Task 2 test;
- verse coordinate isolation → Task 2 test;
- `authority: 'none'` → Task 2 expected output;
- Scripture immutability/application independence → Task 3 tests;
- no new dependencies/transport/persistence/UI → Task 3 diff inspection;
- full existing project behavior preserved → Task 3/4 full verification.
