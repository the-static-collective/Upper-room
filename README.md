# Upper Room

Upper Room is a phone-first shared Scripture room designed to make shared attention easier without making attention less free.

## Current slice

The first executable milestone is intentionally small:

- React + TypeScript + Vite PWA shell;
- Scripture remains the primary screen surface;
- a translation-neutral `ScriptureAdapter` boundary;
- the first local WEB Protestant (`engwebp`) corpus witness: John 1;
- unit/component tests plus a phone-shaped Playwright witness.

Room auth, presence, selection, AIHYPER, durable memory, branches, and publication boundaries remain specified but are not implemented in this slice.

## Run

```bash
npm install
npm test
npm run build
npm run test:e2e
```

CI reconstructs `package-lock.json`, refuses it unless its SHA-256 matches `dependency-lock.sha256`, then installs with `npm ci`. Successful runs preserve both the verified lock and the Pixel 7 Scripture screenshot as the milestone-B proof artifact.

The WEB corpus manifest records eBible.org as source authority. Local JSON is a distributable witness for the public-domain text, not a replacement source of authority.
