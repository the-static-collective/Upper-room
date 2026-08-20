import { describe, expect, it } from 'vitest';

import {
  addBranchTransformation,
  createBranchWitness,
  createEncounterWitness,
  createReturnWitness,
} from './branchReturn';

const anchor = {
  sourceRef: 'selection:john-1-1',
  scriptureRef: {
    translationId: 'webp',
    book: 'JHN',
    chapter: 1,
    verse: 1,
  },
};

describe('Branch / Return Witness v0', () => {
  it('keeps the source anchor while transformations append without rewriting first witness', () => {
    const opened = createBranchWitness({
      branchId: 'branch:a',
      anchor,
      openedBy: 'human:a',
    });

    const changed = addBranchTransformation(opened, {
      transformationRef: 'note:later-reading',
      actorRef: 'human:a',
    });

    expect(opened.transformations).toEqual([]);
    expect(changed.anchor).toEqual(anchor);
    expect(changed.transformations).toEqual([
      {
        transformationRef: 'note:later-reading',
        actorRef: 'human:a',
      },
    ]);
  });

  it('records coexist merge or refusal only through an explicit encounter disposition', () => {
    const branchA = createBranchWitness({
      branchId: 'branch:a',
      anchor,
      openedBy: 'human:a',
    });
    const branchB = createBranchWitness({
      branchId: 'branch:b',
      anchor,
      openedBy: 'human:b',
    });

    const coexist = createEncounterWitness({
      encounterId: 'encounter:coexist',
      branches: [branchA, branchB],
      witnessedBy: ['human:a', 'human:b'],
      disposition: { kind: 'coexist' },
    });
    const merged = createEncounterWitness({
      encounterId: 'encounter:merge',
      branches: [branchA, branchB],
      witnessedBy: ['human:a', 'human:b'],
      disposition: {
        kind: 'merge',
        admissionRef: 'admission:merge-1',
        mergedBranchRef: 'branch:ab',
      },
    });
    const refused = createEncounterWitness({
      encounterId: 'encounter:refuse',
      branches: [branchA, branchB],
      witnessedBy: ['human:a', 'human:b'],
      disposition: {
        kind: 'refuse',
        refusalRef: 'refusal:merge-1',
      },
    });

    expect(coexist.disposition.kind).toBe('coexist');
    expect(merged.disposition.kind).toBe('merge');
    expect(refused.disposition.kind).toBe('refuse');
    expect(branchA.transformations).toEqual([]);
    expect(branchB.transformations).toEqual([]);
  });

  it('records return without claiming uninterrupted presence', () => {
    const branch = createBranchWitness({
      branchId: 'branch:a',
      anchor,
      openedBy: 'human:a',
    });

    const returned = createReturnWitness({
      returnId: 'return:a-1',
      branch,
      actorRef: 'human:a',
      targetRef: anchor.sourceRef,
    });

    expect(returned.presenceClaim).toBe('not-observed-between');
    expect(returned.branchRef).toBe(branch.branchId);
    expect(returned.targetRef).toBe(anchor.sourceRef);
  });
});
