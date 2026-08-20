import type { ScriptureRef } from '../scripture/types';

export type BranchAnchorV0 = {
  sourceRef: string;
  scriptureRef: ScriptureRef;
};

export type BranchTransformationV0 = {
  transformationRef: string;
  actorRef: string;
};

export type BranchWitnessV0 = {
  schema: 'upper-room.branch/0.1';
  branchId: string;
  anchor: BranchAnchorV0;
  openedBy: string;
  transformations: BranchTransformationV0[];
};

export type EncounterDispositionV0 =
  | { kind: 'coexist' }
  | { kind: 'merge'; admissionRef: string; mergedBranchRef: string }
  | { kind: 'refuse'; refusalRef: string };

export type EncounterWitnessV0 = {
  schema: 'upper-room.branch-encounter/0.1';
  encounterId: string;
  branchRefs: [string, string];
  witnessedBy: string[];
  disposition: EncounterDispositionV0;
};

export type ReturnWitnessV0 = {
  schema: 'upper-room.branch-return/0.1';
  returnId: string;
  branchRef: string;
  actorRef: string;
  targetRef: string;
  presenceClaim: 'not-observed-between';
};

function copyAnchor(anchor: BranchAnchorV0): BranchAnchorV0 {
  return {
    sourceRef: anchor.sourceRef,
    scriptureRef: { ...anchor.scriptureRef },
  };
}

function copyTransformation(value: BranchTransformationV0): BranchTransformationV0 {
  return { ...value };
}

export function createBranchWitness({
  branchId,
  anchor,
  openedBy,
}: {
  branchId: string;
  anchor: BranchAnchorV0;
  openedBy: string;
}): BranchWitnessV0 {
  return {
    schema: 'upper-room.branch/0.1',
    branchId,
    anchor: copyAnchor(anchor),
    openedBy,
    transformations: [],
  };
}

export function addBranchTransformation(
  branch: BranchWitnessV0,
  transformation: BranchTransformationV0,
): BranchWitnessV0 {
  return {
    ...branch,
    anchor: copyAnchor(branch.anchor),
    transformations: [
      ...branch.transformations.map(copyTransformation),
      copyTransformation(transformation),
    ],
  };
}

export function createEncounterWitness({
  encounterId,
  branches,
  witnessedBy,
  disposition,
}: {
  encounterId: string;
  branches: [BranchWitnessV0, BranchWitnessV0];
  witnessedBy: string[];
  disposition: EncounterDispositionV0;
}): EncounterWitnessV0 {
  return {
    schema: 'upper-room.branch-encounter/0.1',
    encounterId,
    branchRefs: [branches[0].branchId, branches[1].branchId],
    witnessedBy: [...witnessedBy],
    disposition: { ...disposition },
  };
}

export function createReturnWitness({
  returnId,
  branch,
  actorRef,
  targetRef,
}: {
  returnId: string;
  branch: BranchWitnessV0;
  actorRef: string;
  targetRef: string;
}): ReturnWitnessV0 {
  return {
    schema: 'upper-room.branch-return/0.1',
    returnId,
    branchRef: branch.branchId,
    actorRef,
    targetRef,
    presenceClaim: 'not-observed-between',
  };
}
