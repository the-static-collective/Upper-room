# DOOR PACKET 001

DOOR PACKET 001 is a deliberately small crossing seam between Upper Room and neighboring systems.

> **The packet carries the door, not the room.**

Upper Room may emit one selected Scripture door. The packet does not export the room, private witness, participant identity, interpretation, authority, or a command to do anything.

## Wire shape

```json
{
  "schema": "static.door-packet/0.1",
  "packetRef": "door:upper-room:001",
  "source": {
    "system": "upper-room",
    "sourceRef": "selection:john-1-5",
    "doorKind": "selection"
  },
  "anchor": {
    "translationId": "webp",
    "book": "JHN",
    "chapter": 1,
    "startVerse": 5,
    "endVerse": 5
  },
  "disclosure": {
    "includesPrivateText": false,
    "includesHumanNote": false,
    "includesParticipantIdentity": false
  },
  "authority": null,
  "requestedEffect": null
}
```

`doorKind` is one of `selection`, `branch`, or `return`.

## Why the negative fields are explicit

The three disclosure flags, `authority`, and `requestedEffect` are deliberately present rather than merely omitted. A receiver can fail closed if a future producer attempts to cross a privacy or jurisdiction boundary using the same schema version.

## Laws

```text
DOOR PACKET != ROOM EXPORT
SCRIPTURE COORDINATE != INTERPRETATION
PACKET != AUTHORITY
PACKET != REQUESTED EFFECT
IMPORT != CROSSING
ADMISSION IS LOCAL
PRIVATE WITNESS DOES NOT CROSS BY DEFAULT
```

## Receiver responsibilities

- **Revival** may hold the packet as an external candidate. Import does not create a source witness, Revival address, lexical claim, interpretation, or textual authority.
- **DVOTE** may hold the packet as an external candidate. Import does not choose TAKE/HOLD/PASS and does not create a witness receipt.
- **GrO** may HOLD, REFUSE, or locally ADMIT the packet. ADMIT requires a separately supplied local affordance. The same packet may lawfully receive different dispositions in different localities.
- A future receiver must preserve the same non-authority boundary or define a new schema rather than silently widening this one.

## Non-goals

- no room synchronization;
- no participant or attention telemetry;
- no human note export;
- no AIHYPER prose;
- no Scripture text body;
- no automatic Revival enrichment;
- no automatic DVOTE action;
- no global GrO canon;
- no source authentication claim beyond the declared opaque source reference.

DOOR PACKET 001 is transport syntax for a candidate door. Consequence remains receiver-local.
