import { describe, expect, it } from 'vitest';

import { createBranchWitness } from './branchReturn';
import { prepareTemporalReturnSpecimen } from './temporalReturn';

const anchor = {
  sourceRef: 'fixture:engwebp:John:1:1',
  scriptureRef: { translationId: 'engwebp', book: 'John', chapter: 1, verse: 1 },
};

function inputs() {
  const first = createBranchWitness({ branchId: 'branch:first', anchor, openedBy: 'fixture:reader' });
  const second = createBranchWitness({ branchId: 'branch:second', anchor, openedBy: 'fixture:reader' });
  const atA = '2026-09-20T14:00:00Z';
  const atB = '2026-10-20T14:00:00Z';
  const packet = (instant_utc: string, solar: number) => ({
    kind: 'experimental_astronomical_coordinate_packet' as const,
    instant_utc, provider: { name: 'synthetic fixture', coordinate_frame: 'geocentric_apparent_ecliptic_of_date' },
    chinese_solar: { index_from_vernal_equinox_zero_based: solar },
    hindu_angular: { tithi: 10, nakshatra: 5, yoga: 10, karana: { half_tithi_index: 0 } },
    ayanamsa: { name: 'fixture', degrees: 24 },
  });
  return {
    specimenId: 'fixture-return-001', participantSelected: true,
    encounters: [
      { encounterId: 'enc:first', branch: first, instantUtc: atA, temporalWitness: packet(atA, 11) },
      { encounterId: 'enc:second', branch: second, instantUtc: atB, temporalWitness: packet(atB, 13) },
    ] as const,
  };
}

describe('TEMPORAL-RETURN-001 opt-in export', () => {
  it('requires explicit participant selection, not a passive reader event', () => {
    const value = inputs();
    expect(() => prepareTemporalReturnSpecimen({
      ...value, encounters: [...value.encounters], participantSelected: false,
    })).toThrow(/explicit participant selection/);
  });

  it('preserves both distinct encounter IDs and exact scripture anchor, without original text', () => {
    const value = inputs();
    const exported = prepareTemporalReturnSpecimen({
      ...value, encounters: [...value.encounters],
    });
    expect(exported.schema).toBe('dogram.temporal-return/specimen-v0');
    expect(exported.encounters.map((entry) => entry.encounterId)).toEqual(['enc:first', 'enc:second']);
    expect(exported.encounters[0].anchor).toEqual(anchor);
    expect(exported.encounters[1].anchor).toEqual(anchor);
    expect(exported.encounters[0].temporalWitness?.instant_utc).toBe('2026-09-20T14:00:00Z');
    expect(exported.encounters[0].anchor).not.toBe(value.encounters[0].branch.anchor);
    expect(exported.encounters[0].temporalWitness).not.toBe(value.encounters[0].temporalWitness);
    expect(JSON.stringify(exported)).not.toContain('openedBy');
  });

  it('preserves distinct source selections for the same Scripture address', () => {
    const value = inputs();
    const secondSource = createBranchWitness({
      branchId: 'branch:separate-selection',
      anchor: { ...anchor, sourceRef: 'fixture:later-selection' },
      openedBy: 'fixture:reader',
    });
    const result = prepareTemporalReturnSpecimen({
      ...value, encounters: [value.encounters[0], { ...value.encounters[1], branch: secondSource }],
    });
    expect(result.encounters[0].anchor.sourceRef).not.toBe(result.encounters[1].anchor.sourceRef);
    expect(result.encounters[0].anchor.scriptureRef).toEqual(result.encounters[1].anchor.scriptureRef);
  });

  it('can explicitly leave temporal context unavailable', () => {
    const value = inputs();
    const second = { ...value.encounters[1], temporalWitness: null };
    const output = prepareTemporalReturnSpecimen({
      ...value, encounters: [value.encounters[0], second],
    });
    expect(output.encounters[1].temporalWitness).toBeNull();
  });

  it('refuses mismatched clock time or scripture anchor', () => {
    const value = inputs();
    const first = value.encounters[0];
    const broken = { ...first, temporalWitness: { ...first.temporalWitness, instant_utc: '2026-09-21T14:00:00Z' } };
    expect(() => prepareTemporalReturnSpecimen({
      ...value, encounters: [broken, value.encounters[1]],
    })).toThrow(/share the exact UTC instant/);
    const different = createBranchWitness({
      branchId: 'branch:other', anchor: { ...anchor, scriptureRef: { ...anchor.scriptureRef, verse: 2 } },
      openedBy: 'fixture:reader',
    });
    expect(() => prepareTemporalReturnSpecimen({
      ...value, encounters: [first, { ...value.encounters[1], branch: different }],
    })).toThrow(/same exact Scripture reference/);
  });
});
