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

  it('rejects unknown observation kinds and cue sources at runtime', () => {
    const unknownKind = {
      ...observation('linger'),
      kind: 'hover',
    } as unknown as LocalAttentionObservation;
    const unknownCue = {
      ...observation('linger'),
      cueSource: 'recommendation',
    } as unknown as LocalAttentionObservation;

    expect(() => isEligibleAttentionObservation(unknownKind)).toThrow(DustSpecimenError);
    expect(() => isEligibleAttentionObservation(unknownCue)).toThrow(DustSpecimenError);
  });

  it('rejects malformed timestamps', () => {
    expect(() =>
      isEligibleAttentionObservation(observation('linger', 'none', Number.NaN)),
    ).toThrow(DustSpecimenError);
  });
});
