# Privacy Notice

This document describes what personal data the Neuromorphic Job Manager web
application processes, where the data is sent, and how long it is kept. It
supplements the overarching [EBRAINS Privacy
Policy](https://www.ebrains.eu/privacy-policy/), which governs the EBRAINS
infrastructure on which this app runs.

## What the app processes

The app itself stores no user data on its own servers — it is a static
single-page application served by nginx, with all state held in two places:

1. **Your browser.** The Keycloak/IAM authentication token is held in
   browser memory and (depending on the Keycloak flow used) in
   `localStorage`/`sessionStorage`. It is used to authenticate calls to the
   EBRAINS Neuromorphic Job Queue API and is cleared on logout or when the tab
   is closed and the token expires.
2. **The EBRAINS services the app calls.** Submitting a job sends your job
   script, parameters, hardware selection, and identifying information (your
   EBRAINS user ID and the Collab ID) to the
   [Neuromorphic Job Queue API](https://nmpi-v3.hbpneuromorphic.eu/). Job
   submissions, results, and logs are stored there. Authentication uses
   [EBRAINS IAM](https://iam.ebrains.eu/). File operations may also call the
   [EBRAINS Drive/Bucket APIs](https://drive.ebrains.eu/).

This app does not run any tracking pixel, cookie banner, or analytics script of
its own beyond what is noted below.

## Analytics

Anonymous usage analytics are collected via the EBRAINS-operated **Matomo**
instance (`stats.humanbrainproject.eu`), which records page views, browser
type, and approximate location derived from IP address. Matomo respects the
`Do Not Track` browser header and the EBRAINS-wide cookie configuration.

The dashboard for this app's analytics is at
<https://stats.humanbrainproject.eu/index.php?idSite=22>.

## Legal basis

Use of EBRAINS services requires accepting the EBRAINS Terms of Use and Privacy
Policy at the point of account creation. Processing within this app is on the
basis of that consent and of legitimate interest in operating and improving
the Neuromorphic Computing service.

## Your rights under GDPR

You may exercise the rights described in the EBRAINS Privacy Policy
(access, rectification, erasure, restriction, portability, objection) by
contacting **support@ebrains.eu**. Requests that concern only data submitted
through this app — e.g. removing a particular job submission and its outputs —
can also be made via the project maintainer at **andrew.davison@cnrs.fr**.

## Data controller

The data controller for EBRAINS services is the **EBRAINS AISBL**. See the
[EBRAINS Privacy Policy](https://www.ebrains.eu/privacy-policy/) for contact
details and the Data Protection Officer.
