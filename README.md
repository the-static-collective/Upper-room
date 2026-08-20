# Upper Room

Upper Room is a phone-first shared Scripture room designed to make shared attention easier without making attention less free.

## Defining edge

> **Upper Room preserves the thread, not the pose.**

Its defining concern is **continuity without captivity**: participants may wander, branch, disagree, leave, return, and change without losing the attributable relation back to the text and encounter that produced what came later.

Continuity here does not mean maximal recording or forced synchronization. It means preserving only the durable relations needed for honest re-entry: textual anchors, witness provenance, branch lineage, first-witness history, explicit returns, and admission/refusal boundaries. See [`docs/superpowers/specs/2026-08-20-continuity-defining-edge-design.md`](./docs/superpowers/specs/2026-08-20-continuity-defining-edge-design.md).

## Current slice

The first executable milestone is intentionally small:

- React + TypeScript + Vite PWA shell;
- Scripture remains the primary screen surface;
- a translation-neutral `ScriptureAdapter` boundary;
- the first local WEB Protestant (`engwebp`) corpus witness: John 1;
- a pure Dust Specimen 001 domain module for synthetic, non-authoritative attention weather;
- unit/component tests plus a phone-shaped Playwright witness.

Dust is not connected to the reading UI in this specimen. Room auth, presence, selection, AIHYPER, durable memory, branches, and publication boundaries remain specified but are not implemented in this slice.

## Run

```bash
npm install
npm test
npm run build
npm run test:e2e
```

CI reconstructs `package-lock.json` against the fixed registry horizon that produced the accepted lock witness, refuses the result unless its SHA-256 matches `dependency-lock.sha256`, then installs with `npm ci`. Advancing that horizon is therefore an explicit dependency-admission act rather than an accidental consequence of later peer-package publication. Successful runs preserve both the verified lock and the Pixel 7 Scripture screenshot as the milestone-B proof artifact.

The WEB corpus manifest records eBible.org as source authority. Local JSON is a distributable witness for the public-domain text, not a replacement source of authority.
