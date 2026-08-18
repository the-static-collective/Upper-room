import { describe, expect, it } from 'vitest';
import {
  DEFAULT_ATTENTION_WEATHER_CONFIG,
  DustSpecimenError,
  deriveAttentionWeather,
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
    const source = [observation('wander-return', 'none', 100_000)];

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
      deriveAttentionWeather([observation('linger', 'none', NOW + 1)], NOW),
    ).toThrow(DustSpecimenError);
  });

  it('rejects invalid decay configuration', () => {
    expect(() =>
      deriveAttentionWeather(
        [observation('linger', 'none', NOW - 1)],
        NOW,
        {
          ...DEFAULT_ATTENTION_WEATHER_CONFIG,
          ttlMs: DEFAULT_ATTENTION_WEATHER_CONFIG.freshWindowMs,
        },
      ),
    ).toThrow(DustSpecimenError);
  });
});
