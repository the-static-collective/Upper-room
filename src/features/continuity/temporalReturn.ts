/** Explicit, offline wire export: Upper Room owns the encounter, not the clock. */
import type { BranchWitnessV0 } from './branchReturn';

export type TemporalPacketV0 = {
  kind: 'experimental_astronomical_coordinate_packet';
  instant_utc: string;
  [key: string]: unknown;
};

export type SelectedEncounterV0 = {
  encounterId: string;
  branch: BranchWitnessV0;
  instantUtc: string;
  temporalWitness: TemporalPacketV0 | null;
};

export type TemporalReturnSpecimenV0 = {
  schema: 'dogram.temporal-return/specimen-v0';
  specimen_id: string;
  encounters: [
    { encounterId: string; anchor: BranchWitnessV0['anchor']; instant_utc: string; temporalWitness: TemporalPacketV0 | null },
    { encounterId: string; anchor: BranchWitnessV0['anchor']; instant_utc: string; temporalWitness: TemporalPacketV0 | null },
  ];
};

function required(value: string, label: string): string {
  if (typeof value !== 'string' || !value.trim() || value.length > 256) {
    throw new Error(`${label}: nonblank string of at most 256 characters required`);
  }
  return value;
}

function utc(value: string): string {
  if (!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,6})?Z$/.test(value)) {
    throw new Error('explicit UTC timestamp required');
  }
  const date = new Date(value);
  if (Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== value.slice(0, 10)) {
    throw new Error('invalid UTC instant');
  }
  return value;
}

function anchorEqual(a: BranchWitnessV0['anchor'], b: BranchWitnessV0['anchor']): boolean {
  const x = a.scriptureRef;
  const y = b.scriptureRef;
  return x.translationId === y.translationId && x.book === y.book &&
    x.chapter === y.chapter && x.verse === y.verse;
}

/** Does not share, store, timestamp, authenticate, or publish anything.
 * The caller must obtain an actual participant action before setting participantSelected.
 */
export function prepareTemporalReturnSpecimen({
  specimenId, encounters, participantSelected,
}: {
  specimenId: string;
  encounters: [SelectedEncounterV0, SelectedEncounterV0];
  participantSelected: boolean;
}): TemporalReturnSpecimenV0 {
  if (participantSelected !== true) throw new Error('explicit participant selection required');
  required(specimenId, 'specimenId');
  const [first, second] = encounters;
  if (required(first.encounterId, 'first encounter') === required(second.encounterId, 'second encounter')) {
    throw new Error('distinct encounter IDs required');
  }
  if (!anchorEqual(first.branch.anchor, second.branch.anchor)) {
    throw new Error('same exact Scripture reference required');
  }
  if (Date.parse(utc(second.instantUtc)) < Date.parse(utc(first.instantUtc))) {
    throw new Error('encounters must be in chronological order');
  }
  const output = encounters.map((event) => {
    const instant = utc(event.instantUtc);
    const witness = event.temporalWitness;
    if (witness && (witness.kind !== 'experimental_astronomical_coordinate_packet' || witness.instant_utc !== instant)) {
      throw new Error('clock observation and encounter must share the exact UTC instant');
    }
    return {
      encounterId: event.encounterId,
      anchor: {
        sourceRef: event.branch.anchor.sourceRef,
        scriptureRef: { ...event.branch.anchor.scriptureRef },
      },
      instant_utc: instant,
      temporalWitness: witness === null ? null : structuredClone(witness),
    };
  }) as TemporalReturnSpecimenV0['encounters'];
  return { schema: 'dogram.temporal-return/specimen-v0', specimen_id: specimenId, encounters: output };
}
