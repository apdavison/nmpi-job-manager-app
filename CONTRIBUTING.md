# Contributing to the Neuromorphic Job Manager

This document covers how to set up a
development environment, the branch and release model, code style, and the
process for submitting changes.

If you're new here, please also read:

- [`README.md`](README.md) — what the app is and where it runs.
- [`docs/development.md`](docs/development.md) — local development guide.
- [`docs/architecture.md`](docs/architecture.md) — how the pieces fit together.
- [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md) — expected behaviour.

## Reporting bugs and requesting features

Open an issue on GitHub:
<https://github.com/HumanBrainProject/nmpi-job-manager-app/issues>. Please
include the steps to reproduce, the URL of the deployed instance you were using,
the browser, and (for UI bugs) a screenshot.

## Development setup

Prerequisites: Node.js 20.x and npm.

```sh
git clone https://github.com/HumanBrainProject/nmpi-job-manager-app.git
cd nmpi-job-manager-app
npm ci
npm run dev      # http://localhost:3000
```

See [`docs/development.md`](docs/development.md) for the full guide, including
how to obtain a development IAM token (`.env.local`) and how to point the dev
server at the staging or production Job Queue API.

## Branch and release model

- **`master`** — integration branch. Pull requests target `master`.
- **`staging`** — what is currently deployed to the staging environment. A push
  to `staging` triggers a Docker build to the `:staging` image tag.
- A push to `master` also triggers tests and mirrors the repo to
  `gitlab.ebrains.eu/neuromorphic/nmpi-job-manager-app`.
- **Releases** are tagged from `master` once the change has been validated on
  staging. The project uses [Semantic Versioning](https://semver.org/): the tag
  is `vX.Y.Z` and the `version` field in `package.json` matches the most recent
  tag. Each release also keeps a legacy `release-YYYY-MM-DD` date tag alongside
  the SemVer tag.
- Every release must add a section to [`CHANGELOG.md`](CHANGELOG.md).

## Code style

The app is written in strict TypeScript. Code style is enforced by ESLint
and Prettier, and types by `tsc`. The CI build fails on any lint warning
(`--max-warnings 0`) or type error.

```sh
npm run lint
npm run typecheck
```

Conventions:

- React function components with hooks; no class components.
- Two-space indentation; 112-character line width (`.prettierrc.json`).
- Component files in `PascalCase.tsx` under `src/components/<feature>/`.
- Shared types belong in `src/types.ts`; avoid `any` in non-test code.
- Co-locate tests under `__tests__/components/<feature>/` mirroring the source
  tree.
- For non-trivial exported functions, add a short doc comment describing
  parameters and return shape — especially in `datastore.ts` where most of the
  app/server contract lives.

## Tests

```sh
npm test          # vitest in watch mode
npm run coverage  # one-shot run with v8 coverage
```

When adding a feature, add or update tests in `__tests__/`. UI tests use
`@testing-library/react`; `fetch` is mocked via `vitest-fetch-mock`.

## Submitting a pull request

1. Branch from `master`.
2. Make your change. Add or update tests. Update `CHANGELOG.md` under
   `## [Unreleased]`.
3. Run `npm run lint && npm run build && npm run coverage` locally.
4. Open a PR against `master`. Describe what changed, why, and how it was
   tested. Link any related issue.
5. A maintainer will review. The CI must be green before merge.

## Licensing of contributions

By submitting a pull request you agree to license your contribution under the
[Apache License 2.0](LICENSE) — the same licence as the rest of the project. No
separate Contributor Licence Agreement (CLA) is required.

## Technical debt

Issues that represent known technical debt should be opened on GitHub and
labelled `tech-debt`.