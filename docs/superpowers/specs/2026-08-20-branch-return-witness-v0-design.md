# Upper Room — Branch / Return Witness v0

**Status:** Approved first executable continuity specimen  
**Date:** 2026-08-20

## Purpose

Turn the landed `continuity without captivity` design edge into one deliberately small executable witness without introducing networking, synchronization, CRDTs, persistence, or a generic continuity service.

> **The encounter does not dictate the outcome.**

A participant or branch may diverge, develop independently, later encounter a related branch, and then coexist, merge under separate admission, or refuse reconciliation while the attributable thread remains inspectable.

## Durable objects

The slice introduces three local witness shapes.

### Branch witness

A branch records only:

- its local branch identity;
- the exact source/Scripture anchor from which it opened;
- who opened it;
- attributable transformations appended afterward.

Adding a transformation returns a new branch witness. First witness is not rewritten.

### Encounter witness

An encounter records:

- two existing branch identities;
- who witnessed the encounter;
- exactly one explicit disposition:
  - `coexist`;
  - `merge` with a separate `admissionRef` and new `mergedBranchRef`;
  - `refuse` with a `refusalRef`.

The existence of an encounter does not infer a disposition. The existence of a possible merge does not constitute or authorize one.

### Return witness

A return records:

- the branch being re-entered;
- the returning actor;
- the exact target/source being re-entered;
- `presenceClaim: not-observed-between`.

That last field is intentional: reconnecting may restore relation, but it must not counterfeit an uninterrupted realtime presence history that was never witnessed.

## Privacy boundary

This witness is selective memory, not telemetry.

It does not record:

- scrolling;
- every viewport movement;
- hesitation;
- ambient presence ticks;
- inferred attention;
- hidden user state.

Only explicit durable relations enter the witness grammar.

## Authority boundary

The module is a local data/witness grammar only.

- `coexist` creates no merge authority.
- `refuse` remains attributable rather than disappearing.
- `merge` is representable only when the caller supplies a separate `admissionRef` and a distinct merged branch identity.
- none of these objects make AI output, presence, or branch ancestry authoritative by themselves.

## Non-goals

- no CRDT implementation;
- no networking or multi-device sync;
- no persistence/database layer;
- no automatic merge policy;
- no canonical room summary;
- no doctrinal reconciliation engine;
- no UI redesign;
- no shared Project0 runtime dependency;
- no `Re-entry Topology` shared primitive.

## Acceptance

1. A branch keeps its exact anchor while later transformations append without mutating the original witness.
2. Two branches can encounter and explicitly record `coexist`, admitted `merge`, or `refuse` without rewriting either branch.
3. A merge disposition requires both `admissionRef` and `mergedBranchRef` by type.
4. A return points to the existing branch and target while explicitly refusing to claim presence during the unwitnessed interval.
5. The first slice remains a pure local module with focused tests and no UI/network/persistence changes.
