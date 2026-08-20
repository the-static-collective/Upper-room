import type { ScriptureRef } from '../scripture/types';
import type {
  AttentionConcentration,
  AttentionObservationKind,
  AttentionWeatherConfig,
  AttentionWeatherSample,
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

const ATTENTION_KINDS: ReadonlySet<string> = new Set<AttentionObservationKind>([
  'glance',
  'linger',
  'return',
  'wander-return',
  'explicit-selection',
]);

const CUE_SOURCES: ReadonlySet<string> = new Set(['none', 'weather']);

const ATTENTION_WEIGHT: Readonly<Record<Exclude<AttentionObservationKind, 'glance'>, number>> = Object.freeze({
  linger: 1,
  return: 1,
  'wander-return': 2,
  'explicit-selection': 2,
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

  if (!valid) {
    throw new DustSpecimenError('invalid attention weather configuration');
  }
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

function concentrationFor(
  score: number,
  config: Readonly<AttentionWeatherConfig>,
): AttentionConcentration | null {
  if (score < config.traceThreshold) return null;
  if (score < config.presentThreshold) return 'trace';
  if (score < config.denseThreshold) return 'present';
  return 'dense';
}

export function isEligibleAttentionObservation(observation: LocalAttentionObservation): boolean {
  assertVerseAnchor(observation.anchor);

  if (!ATTENTION_KINDS.has(observation.kind)) {
    throw new DustSpecimenError('unknown attention observation kind');
  }

  if (!CUE_SOURCES.has(observation.cueSource)) {
    throw new DustSpecimenError('unknown attention cue source');
  }

  if (!Number.isFinite(observation.observedAtMs) || observation.observedAtMs < 0) {
    throw new DustSpecimenError('attention observation requires a finite non-negative timestamp');
  }

  if (observation.kind === 'glance') return false;
  if (observation.cueSource === 'weather' && observation.kind === 'return') return false;

  return true;
}

export function deriveAttentionWeather(
  observations: readonly LocalAttentionObservation[],
  nowMs: number,
  config: Readonly<AttentionWeatherConfig> = DEFAULT_ATTENTION_WEATHER_CONFIG,
): AttentionWeatherSample[] {
  if (!Number.isFinite(nowMs) || nowMs < 0) {
    throw new DustSpecimenError('attention weather requires a finite non-negative evaluation time');
  }
  assertConfig(config);

  const byAnchor = new Map<
    string,
    Map<Exclude<AttentionObservationKind, 'glance'>, LocalAttentionObservation>
  >();

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
