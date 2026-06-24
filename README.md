# EBRAINS Neuromorphic Job Manager

The Job Manager is the web front-end for the EBRAINS Neuromorphic Computing
service. It lets users submit and monitor jobs that run on neuromorphic
hardware (SpiNNaker, BrainScaleS), browse the results, and manage their compute
quotas.

**Live:** <https://neuromorphic-job-manager.apps.ebrains.eu/> — also available
as an app inside the EBRAINS Collaboratory.

It is a React single-page application. The backend is the EBRAINS Neuromorphic
Job Queue REST API, and authentication is delegated to EBRAINS IAM (Keycloak).
This is **version 3**, a rewrite built with React Router v6 data routes and MUI v6.
See [`docs/architecture.md`](docs/architecture.md) for how the pieces fit together.

## Quick start

```sh
npm ci
npm run dev    # serves on http://localhost:3000 with hot reload
```

By default the dev server expects a local Job Queue API; the
[development guide](docs/development.md) explains how to authenticate and how to
point it at the deployed staging/production API instead.

## Documentation

| Document | What it covers |
| --- | --- |
| [`docs/architecture.md`](docs/architecture.md) | How the app is structured and how it talks to EBRAINS services. |
| [`docs/development.md`](docs/development.md) | Local setup, tests, linting, type-checking, the release process. |
| [`docs/operations.md`](docs/operations.md) | Build, Docker images, deployment, and monitoring. |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Branch/release model and how to submit changes. |
| [`CHANGELOG.md`](CHANGELOG.md) | Notable changes per release. |
| [`PRIVACY.md`](PRIVACY.md) | What personal data the app processes, and where it goes. |
| [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md) | Expected behaviour in project spaces. |

End-user documentation for the Neuromorphic Computing service is in the
[HBP SP9 Guidebook](https://electronicvisions.github.io/hbp-sp9-guidebook).

## License

Released under the [Apache License 2.0](LICENSE).

## Acknowledgments

The current version of the application was developed as part of the EBRAINS
research infrastructure, funded from the European Union’s Horizon Europe
Programme under Specific Grant Agreement No. 101147319 (EBRAINS 2.0 Project).

Previous versions were developed in the Human Brain Project, funded from the
European Union’s Horizon 2020 Framework Programme for Research and Innovation
under Specific Grant Agreements No. 720270, No. 785907 and No. 945539 (Human
Brain Project SGA1, SGA2 and SGA3).
