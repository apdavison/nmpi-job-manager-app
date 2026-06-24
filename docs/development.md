# Development guide

This document is for people working on the Neuromorphic Job Manager web app
itself. For an overview of the app and its place in the EBRAINS Neuromorphic
Computing service, see [`README.md`](../README.md). For how the pieces fit
together at runtime, see [`architecture.md`](architecture.md). For deployment,
see [`operations.md`](operations.md).

## Prerequisites

- Node.js **20.x** (the version used in CI and in the production Docker image).
- npm.
- An EBRAINS account if you want to log in against the real services.

## First-time setup

```sh
git clone https://github.com/HumanBrainProject/nmpi-job-manager-app.git
cd nmpi-job-manager-app
npm ci
sh scripts/install-hooks.sh   # installs the JWT-leak pre-commit hook
```

## Running the dev server

```sh
npm run dev
```

This serves the app at <http://localhost:3000> with hot-reload.

By default `src/globals.ts` points the dev server at a **local** Job Queue API
(`http://localhost:8000`) and at the **integration** IAM
(`https://iam-int.ebrains.eu`, client `neuromorphic-remote-access-dev`). If you
don't have a local backend running, edit `src/globals.ts` to point at the
deployed API:

```ts
export const jobQueueServer = "https://nmpi-v3.hbpneuromorphic.eu";
export const authServer = "https://iam.ebrains.eu";
export const authClientId = "neuromorphic-remote-access";
```

(These match `src/globals-staging.ts` — which currently targets the
**production** Job Queue API while the staging API is being deployed; the
production build values are in `src/globals-prod.ts`. The Docker builds swap one
of these in over `globals.ts` at build time — see
[`operations.md`](operations.md).)

Do **not** commit changes to `globals.ts`.

### Authenticating in development

Two options:

1. **Full Keycloak login flow** — just open the dev server; you'll be
   redirected to IAM. This works against `iam-int.ebrains.eu`
   if you have an integration account, or `iam.ebrains.eu` for prod/staging.
2. **Paste an existing IAM token** — copy `.env.local.example` to `.env.local`
   and paste a token into `VITE_DEV_TOKEN`. `src/main.tsx` skips the Keycloak
   flow when `VITE_DEV_TOKEN` is set. Useful when iterating on UI without
   constantly re-logging in.

The pre-commit hook in `scripts/pre-commit` blocks any commit whose diff
contains a JWT-shaped string, to keep tokens out of git.

## Project layout

```
src/
  main.tsx              entrypoint: theme, router, context providers, auth bootstrap
  auth.ts               Keycloak init (standalone / iframe-Collab / delegate-tab flows)
  datastore.ts          all REST calls to the Job Queue API + a small in-memory cache
  context.ts            React contexts: Auth, Status, RequestedCollab
  types.ts              shared TypeScript types (API shapes, Auth, …)
  utils.ts              small helpers (jobIsIncomplete, isAlmostEmpty, …)
  globals.ts            dev defaults — overwritten at build time
  globals-prod.ts       production endpoints (used by Dockerfile.prod)
  globals-staging.ts    staging endpoints (used by Dockerfile.staging)
  vite-env.d.ts         Vite / import.meta.env type declarations
  index.css             global styles
  components/
    general/            shared UI: AppBar, ErrorPage, MarkdownPanel, …
    home/               landing page
    jobs/               job list page
    job-detail/         single-job view (logs, comments, outputs, tags)
    job-creation/       new-job form and "edit & resubmit"
    projects/           per-collab project (quota) list
    admin/              admin-only resource-request review (merged-in admin app)
  routes/               one file per React-Router route; exports element + loader/action
__tests__/              mirrors src/ — vitest + @testing-library/react; fetch is mocked
deployment/             Dockerfiles, nginx configs, docker-compose stubs
scripts/                git-hook installer + pre-commit JWT scan
public/                 static assets served at /
tsconfig.json           TypeScript compiler options (strict)
vite.config.ts          Vite + Vitest configuration
```

## Tests

```sh
npm test          # watch mode
npm run coverage  # one-shot run with v8 coverage; this is what CI runs
```

Conventions:

- Tests use [Vitest](https://vitest.dev/), configured in `vite.config.ts`.
- `__tests__/setup.ts` wires up `vitest-fetch-mock` so `fetch` is mocked by
  default. Tests that need a custom response use `fetch.mockResponseOnce(...)`.
- `__tests__/mockServer.ts` provides a fixture-backed fake Job Queue API (using
  the fixtures in `__tests__/fixtures.ts`) for tests that exercise several
  endpoints at once.
- New components should ship with at least a render-smoke test under
  `__tests__/components/<feature>/`.

There are currently no integration tests against the real Job Queue API.
Adding at least one staging-side smoke test is tracked as a GitLab issue.

## Linting and formatting

```sh
npm run lint
```

`npm run lint` runs `eslint . --ext ts,tsx --report-unused-disable-directives
--max-warnings 0`. The CI build runs the same command, so any warning fails the
build. Configuration:

- `.eslintrc` — `eslint:recommended` plus the React and React-Hooks plugins,
  with a `*.ts`/`*.tsx` override pulling in `@typescript-eslint/recommended`.
- `.prettierrc.json` — 2-space tabs, 112-char width, ES5 trailing commas.

It is recommended to run Prettier-on-save in your editor. There is no
project-wide pre-commit formatter; rely on the editor + CI lint.

## Type checking

```sh
npm run typecheck   # tsc --noEmit
```

`npm run build` runs the same `tsc --noEmit` pass before `vite build`, so a type
error fails the build (and therefore CI). Compiler options are in
`tsconfig.json` (strict mode); shared types live in `src/types.ts`.

## Adding a new page

1. Create the React component(s) under `src/components/<feature>/`.
2. Create the route file under `src/routes/<name>.tsx`. Export a default
   element component and (if it needs server data) a `getLoader` factory and
   (if it accepts form submissions) an `action`. Match the patterns in
   `src/routes/jobs.tsx` and `src/routes/job-detail.tsx`.
3. Register the route in `getRouter(keycloak)` in `src/main.tsx`.
4. If the page calls the Job Queue API, add the call to `src/datastore.ts`
   (don't bypass it — the cache lives there), with any new request/response
   shapes typed in `src/types.ts`. Update `__tests__/datastore.test.ts`.
5. Add tests under `__tests__/components/<feature>/`.

## Updating dependencies

- `npm update` for patch/minor bumps inside the existing semver ranges.
- For major bumps, change the range in `package.json`, run `npm install`,
  run the test suite, and commit `package.json` + `package-lock.json`
  together.
- Dependabot is enabled on the GitHub repo for security updates.

## Release process

1. Merge the change to `master` (CI green).
2. Merge `master` → `staging`, verify on the staging deployment.
3. Decide the next [Semantic Version](https://semver.org/) `X.Y.Z` — a patch,
   minor, or major bump relative to the most recent tag, depending on the
   change.
4. Update `CHANGELOG.md`: move items out of `[Unreleased]` into a new
   `[X.Y.Z] — YYYY-MM-DD` section.
5. Bump `package.json`'s `version` field to `X.Y.Z`.
6. Commit, then tag: `git tag vX.Y.Z && git push --tags`.
7. The push triggers the GitLab CI build of `:prod` and `:staging` Docker
   images. Deployment is managed via the
   [`ebrains-components`](https://gitlab.ebrains.eu/cnrs-neuroinformatics/ebrains-components/-/tree/main/neuromorphic-remote-access/job-manager)
   repository.
