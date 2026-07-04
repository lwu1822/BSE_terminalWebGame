# Terminal Trails

A browser game that teaches filesystem and terminal fundamentals through a
simulated shell. There is no backend and no real command execution — the
"shell" is a pure TypeScript interpreter over an in-memory file tree.

Built with **React 19 + TypeScript + Vite 8**. Tests use **Vitest 3**.

## Architecture

Strict separation between a pure engine and the React UI:

- `src/engine/` — filesystem model, path resolution, shell parser, one module
  per command, simulated `git` and `alias`. Zero React/DOM imports.
- `src/levels/` — levels are pure data "cartridges" (tree, objectives, hints).
- `src/ui/` — `Terminal`, `FileTreePanel`, `LevelPanel`, `App`.
- `src/state/` — `localStorage` progress persistence.

## Getting started

```bash
npm install     # installs deps, including vitest
npm run dev      # start the dev server (Vite)
npm run build    # type-check + production build
```

## Running the tests

The engine and every level's solvability are unit-tested with Vitest.

```bash
npm test          # run the full suite once
npm run test:watch # watch mode
```

What the suite covers:

- `src/engine/path.test.ts` — exhaustive `resolvePath` cases (`.`, `..` at
  root, mixed `../a/./b`, trailing slashes, `~`, absolute vs relative).
- `src/engine/fs.test.ts` — filesystem operations (create/move/copy/remove).
- `src/engine/shell.test.ts` — each command's happy path and scripted errors.
- `src/levels/levels.test.ts` — a scripted command sequence solves every
  level, doubling as a solvability regression guard.
