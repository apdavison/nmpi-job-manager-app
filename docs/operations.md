# Operations guide

How the Neuromorphic Job Manager web app is built, packaged, and deployed.

The current deployments are on the EBRAINS Kubernetes clusters
with TLS terminated by the cluster ingress.

## Where it runs

| Environment | URL | Image tag | Triggered by |
| --- | --- | --- | --- |
| Production | <https://neuromorphic-job-manager.apps.ebrains.eu/> | `docker-registry.ebrains.eu/neuromorphic/nmpi_job_manager:prod` | push to GitLab `main` |
| Staging | <https://neuromorphic-job-manager.apps.dev-adacloud.ebrains.eu/> | `docker-registry.ebrains.eu/neuromorphic/nmpi_job_manager:staging` | push to GitLab `staging` |

The cluster-side configuration (Deployment, Service, Ingress, secret refs) is
**not** in this repository. It is managed in the
[`ebrains-components`](https://gitlab.ebrains.eu/cnrs-neuroinformatics/ebrains-components/-/tree/main/neuromorphic-remote-access/job-manager)
repository.

## Build pipeline

```
GitHub (HumanBrainProject/nmpi-job-manager-app)
  push to master/staging
  ├─► .github/workflows/test.yml      lint + build + coverage
  └─► .github/workflows/ebrains.yml   mirror to gitlab.ebrains.eu/neuromorphic/nmpi-job-manager-app

GitLab (gitlab.ebrains.eu/neuromorphic/nmpi-job-manager-app)
  on push to main:     .gitlab-ci.yml → docker build -f deployment/Dockerfile.prod    → :prod
  on push to staging:  .gitlab-ci.yml → docker build -f deployment/Dockerfile.staging → :staging
```

A push to `master` on GitHub becomes a push to `main` on GitLab via the
`ebrains.yml` sync job; that triggers the Docker build on the GitLab side.
Tags are mirrored similarly.

## Building images locally (rarely needed)

```sh
# production
docker build -f deployment/Dockerfile.prod    -t docker-registry.ebrains.eu/neuromorphic/nmpi_job_manager:prod .
# staging
docker build -f deployment/Dockerfile.staging -t docker-registry.ebrains.eu/neuromorphic/nmpi_job_manager:staging .
```

Both Dockerfiles are two-stage: a `node:20-alpine` builder runs `npm ci` and
`npm run build`, then nginx serves the resulting `dist/`. The build stage
**swaps in the environment-specific `src/globals.ts`** (copying
`globals-prod.ts` / `globals-staging.ts` over `globals.ts`) before building, so
the right `jobQueueServer`, `authServer`, etc. end up baked into the bundle.

The nginx stage runs as the non-root user `1001` and listens on **port 8080**
(see `deployment/nginx-app.conf` / `nginx-app-staging.conf`), as required by the
EBRAINS Kubernetes deployment. TLS is terminated by the cluster ingress.

Pushing to the EBRAINS Docker registry requires `DOCKER_REGISTRY_USER` /
`DOCKER_REGISTRY_SECRET` CI variables — they are not available locally and
should not be hard-coded.

## Updating dependencies in the deployed image

Day-to-day npm dependency updates go through the normal PR flow — the GitLab
build picks up `package.json` and `package-lock.json` on the next push, so
there is nothing operations-specific to do.

If the base Node or nginx images need updating, edit the `FROM` lines in
`deployment/Dockerfile.prod` and `deployment/Dockerfile.staging`. Both
currently use mirrors at `docker-registry.ebrains.eu/neuromorphic/...` rather
than the public Docker Hub to avoid rate-limits.

## Monitoring

- **Resource dashboards (Grafana):**
  <https://grafana.ebrains.eu/dashboards/f/b7a2de0a-e345-4ac3-9929-f946aa1328b5/neuromorphic-remote-access>
- **Service status:** <https://status.ebrains.eu>
- **Usage analytics (Matomo):**
  <https://stats.humanbrainproject.eu/index.php?idSite=22>
- **CI / build status:**
  - GitHub Actions: <https://github.com/HumanBrainProject/nmpi-job-manager-app/actions>
  - GitLab pipelines: <https://gitlab.ebrains.eu/neuromorphic/nmpi-job-manager-app/-/pipelines>

## Releasing

See ["Release process"](development.md#release-process) in the development
guide. In short: validate on staging, update `CHANGELOG.md`, bump `version`
in `package.json` to the next Semantic Version, tag `vX.Y.Z`, push tags.
The GitLab pipeline rebuilds the Docker images.

## Rolling back

A rollback is a re-deploy of an earlier `:prod` image from
`docker-registry.ebrains.eu`. The cluster-side change is made via the
`ebrains-components` repo. The relevant tag history (and therefore the list of
available images to roll back to) is in this repo's `git tag` output.

## Known operational caveats

- The image build is **environment-aware via file swap**, not via runtime
  environment variables. You cannot retarget a built image at a different
  Job Queue API without rebuilding it.
- Authentication state lives in the browser (Keycloak tokens). A user
  reporting a stuck "logged in" state can usually be fixed by clearing
  site data for `neuromorphic-job-manager.apps.ebrains.eu` in their browser.
- The dev fallback path (`VITE_DEV_TOKEN` in `.env.local`) is **only**
  reachable when `import.meta.env.DEV` is true — Vite production builds strip
  it. Refer to `src/main.tsx` if in doubt.
