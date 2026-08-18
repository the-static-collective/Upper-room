import type { ScriptureRef } from '../scripture/types';
import type {
  AttentionObservationKind,
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

const ATTENTION_KINDS: ReadonlySet<string> = new Set<AttentionObservationKind>([
  'glance',
  'linger',
  'return',
  'wander-return',
  'explicit-selection',
]);

const CUE_SOURCES: ReadonlySet<string> = new Set(['none', 'weather']);

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
