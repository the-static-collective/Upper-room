# Branch / Return Witness v0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the smallest executable Upper Room witness proving branch, encounter, and return continuity without forced synchronization.

**Architecture:** Introduce one pure TypeScript module with immutable branch transformations and explicit encounter/return witness objects. Keep the slice below UI, storage, networking, and CRDT layers.

**Tech Stack:** TypeScript, Vitest, existing `ScriptureRef` type.

**Spec:** `docs/superpowers/specs/2026-08-20-branch-return-witness-v0-design.md`

## Global Constraints

- Preserve the source/Scripture anchor.
- Do not mutate first witness.
- Encounter does not imply merge.
- Merge requires a separate admission reference and new merged branch identity.
- Return must not claim uninterrupted presence.
- No UI, persistence, networking, CRDT, AI summary, or shared runtime dependency.

---

### Task 1: Pin the behavior first

**Files:**
- Test: `src/features/continuity/branchReturn.test.ts`

**Interfaces:**
- Consumes: the forthcoming branch/encounter/return witness functions.
- Produces: three focused acceptance tests.

- [x] **Step 1: Write the failing test** before the production module exists.
- [x] **Step 2: Observe RED** from the missing `branchReturn` module.

### Task 2: Implement the minimum pure witness grammar

**Files:**
- Create: `src/features/continuity/branchReturn.ts`

**Interfaces:**
- Produces: `createBranchWitness`, `addBranchTransformation`, `createEncounterWitness`, `createReturnWitness` plus local v0 witness types.

- [x] **Step 1: Add `BranchWitnessV0`** with anchor, opener, and append-only-at-the-value-level transformations.
- [x] **Step 2: Add discriminated encounter dispositions** for coexist, admitted merge, and refusal.
- [x] **Step 3: Add `ReturnWitnessV0`** with `presenceClaim: 'not-observed-between'`.
- [x] **Step 4: Observe GREEN** in the focused Node 22 type-stripping harness: 3 tests, 3 pass, 0 fail.

### Task 3: Verify repository integration

- [ ] **Step 1: Compile/type-check the production module against the existing `ScriptureRef` boundary.**
- [ ] **Step 2: Run the strongest available project test/build gate; if dependencies are unavailable locally, use hosted current-head checks and state the limitation explicitly.**
- [ ] **Step 3: Compare against `main` and confirm no unrelated app/UI/network/persistence files changed.**

### Task 4: Publish the PR

- [ ] **Step 1: Open a draft PR against `main` with RED/GREEN evidence and explicit non-goals.**
- [ ] **Step 2: Inspect current-head checks, reviews, and review threads.**
- [ ] **Step 3: Repair only branch-caused findings and re-verify the exact new head.**
