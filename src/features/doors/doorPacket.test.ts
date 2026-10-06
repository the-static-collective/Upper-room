import { describe, expect, it } from 'vitest';
import { createDoorPacketV0 } from './doorPacket';

describe('DOOR PACKET 001', () => {
  it('exports one Scripture door without exporting the room', () => {
    const packet = createDoorPacketV0({
      packetRef: 'door:upper-room:001',
      sourceRef: 'selection:john-1-5',
      doorKind: 'selection',
      anchor: {
        translationId: 'webp',
        book: 'JHN',
        chapter: 1,
        startVerse: 5,
        endVerse: 5,
      },
    });

    expect(packet).toEqual({
      schema: 'static.door-packet/0.1',
      packetRef: 'door:upper-room:001',
      source: {
        system: 'upper-room',
        sourceRef: 'selection:john-1-5',
        doorKind: 'selection',
      },
      anchor: {
        translationId: 'webp',
        book: 'JHN',
        chapter: 1,
        startVerse: 5,
        endVerse: 5,
      },
      disclosure: {
        includesPrivateText: false,
        includesHumanNote: false,
        includesParticipantIdentity: false,
      },
      authority: null,
      requestedEffect: null,
    });
    const exported = packet as unknown as Record<string, unknown>;
    expect(exported).not.toHaveProperty('roomId');
    expect(exported).not.toHaveProperty('participantId');
    expect(exported).not.toHaveProperty('humanNote');
    expect(exported).not.toHaveProperty('exactText');
  });

  it('refuses impossible or reversed Scripture ranges', () => {
    expect(() => createDoorPacketV0({
      packetRef: 'door:bad',
      sourceRef: 'selection:bad',
      doorKind: 'selection',
      anchor: { translationId: 'webp', book: 'JHN', chapter: 1, startVerse: 8, endVerse: 5 },
    })).toThrow(/verse range/i);
  });
});
