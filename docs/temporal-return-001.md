# TEMPORAL-RETURN-001 — bounded, opt-in Scripture encounter export

**Status:** experimental pure helper, not wired into the reader UI, networking, persistent memory or publication. The existing `BranchWitnessV0` owns each source selection and Scripture address. Upper Room owns the encounter; CLOCKWORK-002 supplies *optional* separately attributed astronomical coordinates; Dogram owns the calculation.

`src/features/continuity/temporalReturn.ts` prepares exactly the `dogram.temporal-return/specimen-v0` JSON envelope. Call it only after a real participant intentionally selects two existing encounters and explicitly asks to compare them. The `participantSelected` flag rejects accidental invocations, but is **not proof of consent**: the actual UI must record the human action and separately enforce data-sharing controls before passing anything outside the participant's local room.

```text
two distinct encounterId + independent BranchWitnessV0.anchor
  -> compare ScriptureRef only (sourceRef remains distinct)
  -> manually supply each event's UTC timestamp
  -> optional precomputed CLOCKWORK-002 packet matching that exact instant
  -> participantSelected: true
  -> local JSON specimen (never posted or stored by this helper)
  -> Dogram compare_temporal_return(specimen) under independent operator authority
  -> math-only comparison receipt, never a theological or causal verdict
```

`null` clock packets are preserved as unknown context, not zero, silence, agreement or failure. Different source selections at the same passage are **not collapsed**. No Scripture content, witness's `openedBy` identity, other branch history, or personal notes are copied into this minimal specimen. The caller must treat source reference strings as potentially sensitive; any later cross-room transfer requires explicit disclosure policy.

This module does **not** create first-witness history, certify clock origin, infer a timestamp from the current device, attach a location, or create a return/disposition automatically. No external Bible-code implementations or data have been bundled.

### Run contract check

`npm test -- src/features/continuity/temporalReturn.test.ts`

### Separate integration frontier

First validate a real independently sourced ephemeris in CLOCKWORK-002, then add a deliberately invoked local computation lens to the existing Textual / Context Witness boundary. Do not add ambient passage monitoring, automatic room federation or calendar-based authority. The wire contract and interpretation limits are mirrored in Dogram `research/TEMPORAL-RETURN-001.md`.
