# Architecture

The Job Manager is a small **React single-page application**, served as static
files by nginx. The backend is the EBRAINS Neuromorphic Job Queue API, and every
interaction is a call to that or another EBRAINS service.

## Big picture

```
        ┌───────────────────────────────────────────┐
        │       Browser (the user)                  │
        │                                           │
        │   Job Manager app (this repo)             │
        │   ├─ React Router routes/loaders          │
        │   ├─ datastore.ts (in-memory cache)       │
        │   └─ auth.ts (Keycloak client)            │
        └──────┬────────────────┬──────────────┬────┘
               │                │              │
       fetch + Bearer    iframe / popup     static assets
               │                │              │
        ┌──────▼──────┐  ┌──────▼───────┐   ┌──▼────────────────┐
        │ Job Queue   │  │ EBRAINS IAM  │   │ nginx serving the │
        │ REST API    │  │ (Keycloak)   │   │ built app bundle  │
        │ nmpi-v3.*   │  │ iam.*.ebrains│   │ (this repo image) │
        └──────┬──────┘  └──────────────┘   └───────────────────┘
               │
               ▼
        SpiNNaker / BrainScaleS / etc. (downstream — not part of this app)
```

The app is also embeddable as an **EBRAINS Collaboratory app**, in which case
it runs inside an iframe on the Collab site and needs a slightly different
auth flow (see "Auth" below).

## Layered view of the code

```
main.tsx
  ├─ initAuth(renderApp) ────────────►  auth.ts (Keycloak)
  │       on success: returns `keycloak` to renderApp
  │
  └─ renderApp(keycloak)
        ├─ serverInfo()      ────────►  datastore.ts → GET /
        └─ <RouterProvider router={getRouter(keycloak)}>
                │
                ├─ /                       routes/home           (loader: listCollabs)
                ├─ /:collabId/jobs/        routes/jobs           (loader: queryJobs/queryTags)
                ├─ /:collabId/jobs/new     routes/job-creation   (action: createJob)
                ├─ /:collabId/jobs/:jobId  routes/job-detail     (loader: getJob; action: tags/comments/repository)
                ├─ /:collabId/jobs/:jobId/new                    (loader: getJob; reuses creation form)
                ├─ /:collabId/projects/    routes/projects       (loader: queryProjects; action: patchProject)
                └─ /admin                  routes/admin          (admin-only resource-request review; no loader)
```

Each route file exports:

- a **default React component** that renders the page;
- a **`getLoader(keycloak)`** factory that returns a React-Router loader
  closing over the auth handle and calling into `datastore.ts`;
- optionally an **`action`** for form submissions (mutations).

This keeps the React components free of fetch logic. The one exception is
`routes/admin.tsx`, which currently self-fetches inside its table component
rather than going through a loader/action — see the `TODO` at the top of that
file.

## Auth (`src/auth.ts`)

The app deals with **three deployment modes**, all driven by detecting
`window.opener` and `window.parent`:

| Mode | When | Flow |
| --- | --- | --- |
| **Standalone** | Opened directly in a tab. | Standard Keycloak Authorization Code flow. On no-session, redirect to IAM. |
| **Framed (Collab)** | Embedded as an iframe in the EBRAINS Collaboratory. | Implicit flow as a fallback (the standard flow times out on the 3rd-party iframe message). On no-session, open a delegate tab. |
| **Delegate tab** | Opened by the framed app to perform the IAM redirect dance. | Logs in, posts `clb.authenticated` back to the opener, closes itself. |

The token is held in the Keycloak client instance in memory and passed as a
`Bearer` header on every API call via `datastore.getRequestConfig(auth)`.

In **dev**, if `VITE_DEV_TOKEN` is set in `.env.local`, `main.tsx` bypasses
Keycloak entirely and uses the pasted token directly.

## Data layer (`src/datastore.ts`)

All Job Queue API calls live in one module. It implements:

- A module-scope **in-memory cache** (`cache.jobs`, `cache.projects`,
  `cache.collabs`, `cache.tags`, `cache.logs`, `cache.comments`,
  `cache.about`, `cache.jobCursor`). The cache lives for the lifetime of the
  page; reloading the tab clears it.
- A **paginated job-list cursor** per collab (`queryJobs`), so scrolling for
  more jobs only fetches the delta.
- **Mutation helpers** (`createJob`, `hideJob`, `addTag`, `deleteTag`,
  `changeRepository`, `createComment`, `createProject`, `patchProject`,
  `deleteProject`) that round-trip the API and patch the cache to keep it
  consistent with the server response.
- **Admin helpers** (`queryResourceRequests`, `updateResourceRequest`,
  `addQuota`) backing the `/admin` section. Resource-request data is not
  cached — the admin table fetches it fresh.

Routes pass `auth` (the Keycloak instance) into these functions; the data
layer never reaches into React contexts. The shapes returned and accepted by
these functions are typed in `src/types.ts`.

## React state

Three contexts (`src/context.ts`), provided in `main.tsx`:

| Context | What it carries |
| --- | --- |
| `AuthContext` | The Keycloak instance (used by route loaders and any component making API calls). `auth.isAdmin`, set during `initAuth` from the user's IAM roles, gates the `/admin` section. |
| `StatusContext` | The result of `GET /` on the Job Queue API — used by the home page to disable hardware buttons when a provider is down. |
| `RequestedCollabContext` | The `clb-collab-id` query-string parameter — set by the Collaboratory when the app is opened in an iframe, used to preselect the user's collab. |

The app state is based on the React Router loaders and the in-memory cache in `datastore.ts`.

## External services

| Service | Endpoint | What we call |
| --- | --- | --- |
| Neuromorphic Job Queue API | `nmpi-v3.hbpneuromorphic.eu` (prod), `nmpi-v3-staging.hbpneuromorphic.eu` (staging) | `GET /`, `/collabs/`, `/jobs/`, `/jobs/{id}`, `/jobs/{id}/log`, `/jobs/{id}/comments`, `/jobs/{id}/tags/`, `/jobs/{id}/output_data`, `/projects/`, `/projects/{id}`, `/tags/` |
| EBRAINS IAM (Keycloak) | `iam.ebrains.eu` (prod/staging), `iam-int.ebrains.eu` (dev) | OIDC Authorization Code / Implicit flow |
| EBRAINS Drive (via CORS proxy) | `corsproxy.apps.ebrains.eu/https://drive.ebrains.eu` | File listing for saved results |

The fact that the dev `driveServer` goes through a CORS proxy is a
workaround — `drive.ebrains.eu` does not set permissive CORS headers.

## Build-time configuration

The Vite build inlines whatever is in `src/globals.ts` at the time `npm run
build` runs. The Dockerfiles
([`deployment/Dockerfile.prod`](../deployment/Dockerfile.prod),
[`deployment/Dockerfile.staging`](../deployment/Dockerfile.staging)) overwrite
`src/globals.ts` with `src/globals-prod.ts` or `src/globals-staging.ts`
respectively, then run `npm run build`. The resulting static bundle is
served by nginx (as the non-root user `1001`, on port 8080).

## What this app intentionally does **not** do

- Run any computation. Jobs are queued by the Job Queue API and executed on
  SpiNNaker / BrainScaleS / etc.
- Implement authentication. It only delegates to EBRAINS IAM.
- Handle SSL. That is terminated by the EBRAINS Kubernetes ingress.
