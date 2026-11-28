# Changelog

## [Unreleased]

### `ConnectorPayload.holders`: which node holds which ref

- **New optional field `holders`** (`RouteHolders`): per node id, the newest
  ref of the route that node holds completely. A hub sets it on what it sends
  its clients; a sender never does. A hint for readers, like `src`. Old
  payloads without the field stay valid.
- **New event `held`** in `syncEvents(route)`: `${route}:held`, client →
  server, with a `HeldPayload` (`{ r }`): the client's node holds that ref
  completely.

### The build runs on Windows

- **`pnpm run build` copies with a node script:** the READMEs and
  `src/example.ts` go into `dist` through `scripts/copy-readme-to-dist.js`
  instead of `cp` and `mkdir`, which `cmd.exe` refuses. `dist` holds the same
  files as before.

## [0.0.90]

### The rljson DNA 0.4.0: docs language first, no prompts hook

- `@rljson/dna-rljson` 0.4.0, on dna-gg 2.0: the guides and templates of the
  DNA live in `doc/en/`, `doc/de/` and `doc/fa/`. The Claude Code hook that
  would keep every prompt in a project management repo is gone, with
  `.claude/hooks` and `.claude/settings.json`. New are the architecture guide
  and the `/gg-review-architecture` skill.
- The own documentation follows: `doc/<file>` to `doc/en/<file>`, the blog
  posts to `pm/<lang>/2026-Q4/blog/`. The links point to the new places.

## [0.0.89]

### `ConnectorPayload.src`: the node a ref came from

- **New optional field `src`:** the node id of the client a hub received the
  ref from. The hub sets it when it relays the ref; a sender never does. A
  receiver may read the ref's data from that node first and fall back to the
  hub. Old payloads without the field stay valid.

### CLAUDE.md keeps this repo's own rules

- The rules every rljson repo shares (coverage, pinning, docs, releases,
  reviews) come with the rljson DNA: `doc/guides/rljson-guide.md` and
  `doc/guides/for-ai/rljson-review-guide.md`. `CLAUDE.md` no longer repeats
  them and no longer describes the old `gg one` workflow.

## [0.0.87]

### Developed in gg tickets

- **Developed in gg tickets.** The repo carries the rljson DNA (`@rljson/dna-rljson`): gg's `/gg-*` skills, the guides and the quick check (`.github/workflows/quick_check.yaml`).
- **Pull requests are checked by the quick check** (`gg one did commit`: every commit went through gg's local lint, tests and coverage). `Build and Test` runs on `main` after the merge.
- **`tsconfig.json` lists `node` in `types`:** TypeScript 6 includes no `@types` by default.
- **vitest also runs `test/**/*.test.ts`,** where gg's release writes the version test.
- **`minimumReleaseAgeExclude: ['@rljson/*']`:** pnpm 11 holds back packages younger than a day, and a release of the chain installs versions published minutes earlier.
- **Dependencies raised to their newest versions** (TypeScript 6 among them).

### Releases go through gg

**What changed for contributors.** A release happens only when the owner
runs `gg one do publish`, which merges first and uploads only what `main`
holds (`--merge-only` merges without a release); the CI publish was already
switched off. CLAUDE.md describes
the whole workflow through gg — `gg one do create ticket`, `gg one do
commit`, `gg one do push`, `gg one do publish`. The scripts gg replaces —
`create-branch.js`, `push-branch.js`, `wait-for-pr.js`, `publish-to-npm.js`,
`add-version-tag.js` — are removed.

## [0.0.1]

Initial commit.
