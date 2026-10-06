export type DoorKindV0 = 'selection' | 'branch' | 'return';

export type DoorAnchorV0 = {
  translationId: string;
  book: string;
  chapter: number;
  startVerse: number;
  endVerse: number;
};

export type DoorPacketV0 = {
  schema: 'static.door-packet/0.1';
  packetRef: string;
  source: {
    system: 'upper-room';
    sourceRef: string;
    doorKind: DoorKindV0;
  };
  anchor: DoorAnchorV0;
  disclosure: {
    includesPrivateText: false;
    includesHumanNote: false;
    includesParticipantIdentity: false;
  };
  authority: null;
  requestedEffect: null;
};

function requireText(value: string, label: string): string {
  if (!value.trim()) throw new Error(`${label} is required`);
  return value;
}

function validateAnchor(anchor: DoorAnchorV0): DoorAnchorV0 {
  requireText(anchor.translationId, 'translationId');
  requireText(anchor.book, 'book');
  if (!Number.isInteger(anchor.chapter) || anchor.chapter < 1) {
    throw new Error('chapter must be a positive integer');
  }
  if (
    !Number.isInteger(anchor.startVerse) ||
    !Number.isInteger(anchor.endVerse) ||
    anchor.startVerse < 1 ||
    anchor.endVerse < anchor.startVerse
  ) {
    throw new Error('verse range must be positive and ordered');
  }
  return { ...anchor };
}

export function createDoorPacketV0(input: {
  packetRef: string;
  sourceRef: string;
  doorKind: DoorKindV0;
  anchor: DoorAnchorV0;
}): DoorPacketV0 {
  requireText(input.packetRef, 'packetRef');
  requireText(input.sourceRef, 'sourceRef');

  return {
    schema: 'static.door-packet/0.1',
    packetRef: input.packetRef,
    source: {
      system: 'upper-room',
      sourceRef: input.sourceRef,
      doorKind: input.doorKind,
    },
    anchor: validateAnchor(input.anchor),
    disclosure: {
      includesPrivateText: false,
      includesHumanNote: false,
      includesParticipantIdentity: false,
    },
    authority: null,
    requestedEffect: null,
  };
}
