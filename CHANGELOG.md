# Changelog

## [Unreleased]

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
