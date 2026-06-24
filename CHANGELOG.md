# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

The project follows [Semantic Versioning](https://semver.org/). The current
generation of the app ("version 3") began with the 2024 React Router
reimplementation (3.0.0); the Create React App generation before it was 2.x,
and version 1 was the AngularJS/Django app in the `job-queue-api` repository.
Each release carries both a SemVer tag (`vX.Y.Z`) and a legacy date tag
(`release-YYYY-MM-DD`); both are kept. The `version` field in `package.json`
tracks the SemVer.

## [Unreleased]

The next release will be **3.4.0**, covering the move to TypeScript, the
React 19 / MUI 6 toolchain upgrade, and the absorption of the former standalone
administration app.

### Added

- **Administration section.** A new `/admin` route lists resource (quota)
  requests, filterable by status, and lets administrators accept or reject them
  and grant quotas. This merges the former standalone `neuromorphic-admin-app`
  into this app. The section is shown only to users whose IAM roles mark them as
  administrators (`auth.isAdmin`); everyone else sees an "administrators only"
  message. The new components live under `src/components/admin/`.
- Substantially expanded the test suite: unit tests for `auth.ts`,
  `datastore.ts`, and `utils.ts`, plus render tests for components across the
  feature areas.

### Changed

- **Migrated the entire codebase to strict TypeScript.** Sources are now
  `*.ts` / `*.tsx`, with a `tsconfig.json`, shared types in `src/types.ts`, a
  `tsc --noEmit` typecheck wired into `npm run build` (and a standalone
  `npm run typecheck`), and `@typescript-eslint` rules added to ESLint.
- Upgraded to **React 19** (with `@testing-library/react` 16 and
  `@monaco-editor/react` 4.7).
- Upgraded **MUI to v6** (`@mui/material` / `@mui/icons-material` 6.5.0,
  `@mui/lab` 6.0.1-beta.36).
- Upgraded `react-router-dom` to 6.30.4 and `react-syntax-highlighter` to v16.
- Bumped the build/test toolchain: Vite 8, Vitest 4, `@vitejs/plugin-react` 6,
  `@vitest/coverage-v8` 4.
- Production and staging nginx now run as the non-root user `1001` and listen
  on port 8080, for the EBRAINS Kubernetes deployment.
- The staging Docker build temporarily targets the production Job Queue API
  until the staging API is deployed.

### Fixed

- Comment rendering used a React `key` referencing a non-existent `comment_id`
  field.
- Updated the `keycloak-js` test mock for Vitest 4 compatibility.

## [3.3.0] — 2025-11-28

### Added

- Display the EBRAINS Neuromorphic server status on the home page, with a
  warning banner and disabled "Submit job" buttons when the relevant hardware
  is unavailable.

### Security

- Move the local development IAM token out of source code into a gitignored
  `.env.local` (`VITE_DEV_TOKEN`). Added a pre-commit hook
  (`scripts/pre-commit`, installed via `scripts/install-hooks.sh`) that blocks
  commits containing JWT-shaped strings.

## [3.2.0] — 2025-08-26

### Changed

- Hide the "Copy to Drive" and "Copy to Bucket" buttons for jobs that were
  submitted from a user's private space (not associated with a Collab).
- Update the CORS-proxy URL used for EBRAINS Drive/Bucket calls.

### Fixed

- Restore Matomo analytics tracking, which had been broken by the React
  Router rewrite.

## [3.1.0] — 2025-02-14

### Changed

- Upgrade to Keycloak v26.
- Production and staging deployments now serve on port 80 (SSL is terminated
  by the EBRAINS Kubernetes ingress).

### Added

- Organise component code and tests into per-feature subdirectories.
- Run the test suite on every push and pull request via GitHub Actions.

### Fixed

- All ESLint errors and warnings cleared; CI now enforces `--max-warnings 0`.

---

Earlier releases — 3.0.0 (`release-2024-01-26`, the React Router
reimplementation) and the 2.x Create React App series before it — predate this
changelog and are documented only in `git log`.

[Unreleased]: https://github.com/HumanBrainProject/nmpi-job-manager-app/compare/v3.3.0...HEAD
[3.3.0]: https://github.com/HumanBrainProject/nmpi-job-manager-app/compare/v3.2.0...v3.3.0
[3.2.0]: https://github.com/HumanBrainProject/nmpi-job-manager-app/compare/v3.1.0...v3.2.0
[3.1.0]: https://github.com/HumanBrainProject/nmpi-job-manager-app/compare/v3.0.0...v3.1.0
