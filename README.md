# Case Admin Web
[![Build Status](https://travis-ci.org/hmcts/ccd-admin-web.svg?branch=master)](https://travis-ci.org/hmcts/ccd-admin-web)
[![Docker Build Status](https://img.shields.io/docker/build/hmcts/ccd-admin-web.svg)](https://hub.docker.com/r/hmcts/ccd-admin-web)
[![codecov](https://codecov.io/gh/hmcts/ccd-admin-web/branch/master/graph/badge.svg)](https://codecov.io/gh/hmcts/ccd-admin-web)

Web application for administration of Case Definition data (initially for importing definitions).

## Overview

[Express](http://expressjs.com) application that allows an authorised user to import Case Definitions in the form of an Excel spreadsheet.

## Getting started

### Prerequisites
- [Node.js](https://nodejs.org/en) >= 24.15.0

### Environment variables

The following environment variables are required:

| Name                                 | Default | Description                                                                                                                                                            |
|--------------------------------------|---------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| IDAM_BASE_URL                        | - | Base URL for IdAM's User API service (idam-app). `http://localhost:5000` for the dockerised local instance or tunnelled `dev` instance.                                |
| IDAM_S2S_URL                         | - | Base URL for IdAM's S2S API service (service-auth-provider). `http://localhost:4502` for the dockerised local instance or tunnelled `dev` instance.                    |
| IDAM_ADMIN_WEB_SERVICE_KEY           | - | Case Admin Web's IdAM S2S micro-service secret key. This must match the IdAM instance it's being run against.                                                          |
| IDAM_LOGOUT_URL                      | - | URL of the IdAM Authentication Web `logout` page. `https://localhost:9002/login/logout` for the dockerised local instance.                                             |
| IDAM_OAUTH2_TOKEN_ENDPOINT           | - | URL of the IdAM OAuth2 API endpoint for obtaining an OAuth2 token. `http://localhost:5000/oauth2/token` for the dockerised local instance or tunnelled `dev` instance. |
| IDAM_OAUTH2_AW_CLIENT_SECRET         | - | Secret to be passed to IdAM when obtaining an OAuth2 token. This must match the IdAM instance it's being run against.                                                  |
| ADMINWEB_LOGIN_URL                   | - | URL of the IdAM Authentication Web `login` page. `https://localhost:9002/login` for the dockerised local instance.                                                     |
| ADMINWEB_IMPORT_URL                  | - | URL of the Case Definition Store API `import` endpoint. `http://localhost:4451/import` for the dockerised local instance.                                              |
| ADMINWEB_UPLOAD_DICTIONARY_FILE_PATH | - | Path to local dir for upload.                                                                                                                                          |
| APPINSIGHTS_INSTRUMENTATIONKEY       | - | Secret for Microsoft Insights logging, can be a dummy string in local.                                                                                                 |

### Building

The project uses [yarn](https://yarnpkg.com/lang/en/). To build it, execute the following command:
```bash
yarn install
```
Setup styles:
```bash
yarn setup
```

### Running

Start the application by executing the following command:
```bash
yarn start
```

To be able to log on and use the application you have to have a IDAM user with `ccd-import` role created.

### Functional tests

The Playwright functional tests require Node 24, a running instance of CCD Admin Web, and accessible IdAM web and
testing-support endpoints. The suite verifies the unauthenticated IdAM redirect, authenticated landing page,
administration menu navigation and logout journey. Global setup reuses a valid saved session or creates a unique CCD
Admin user with `@hmcts/playwright-common` using the `ccd_admin` client and the following roles:

- `idam-user-dashboard--access`
- `ccd-import`
- `load-translations`
- `manage-translations`

Set `OAUTH2_CLIENT_SECRET` to the environment's `ccd-admin-web-oauth2-client-secret` value to enable dynamic creation.
`CREATE_USER_CLIENT_ID`, `CREATE_USER_CLIENT_SECRET`, `CREATE_USER_SCOPE`, `IDAM_WEB_URL` and
`IDAM_TESTING_SUPPORT_URL` can override the defaults. Supplying both `PLAYWRIGHT_USERNAME` and
`PLAYWRIGHT_PASSWORD` bypasses dynamic creation and uses that static account instead.

To test a local instance, start the application in one terminal:

```bash
NODE_ENV=test yarn start
```

Then run the functional tests in another terminal:

```bash
PLAYWRIGHT_USERNAME=<ccd-import-test-email> \
PLAYWRIGHT_PASSWORD=<ccd-import-test-password> \
yarn test:functional
```

For dynamic local execution, provide the target. The runner uses Azure CLI to load
`ccd-admin-web-oauth2-client-secret` from the matching `ccd-aat`, `ccd-demo` or `ccd-saat` vault when the secret is not
already present in the environment:

```bash
TEST_URL=https://ccd-admin-web.aat.platform.hmcts.net \
yarn test:functional
```

Jenkins loads the same client secret from `ccd-${env}`. Preview resolves through the existing AAT Vault override.
User creation or interactive login failures fail global setup and therefore fail the suite.

Playwright creates one user for the E2E and integration suites and keeps its generated credentials and authenticated
browser storage state per target in the ignored `.sessions/` directory. The saved session is validated at the start of
each suite; if E2E logout invalidates it, integration logs in again with the same generated user instead of creating a
second one. Delete `.sessions/` to force creation of a new user while troubleshooting authentication.

Using `NODE_ENV=test` loads the repository's non-production test configuration and serves the application over HTTP.
The local target defaults to `http://localhost:3100`, and the default IdAM login URL is `http://localhost:9002/login`.
The local IdAM service or tunnel must therefore be running as well. If either service is unavailable, Playwright will
report `ERR_CONNECTION_REFUSED`.

To test a deployed environment, provide its CCD Admin Web URL:

```bash
TEST_URL=https://<deployed-admin-web-url> yarn test:functional
```

The test command installs the required Chromium browser before executing the Playwright suites. E2E reports and
failure artifacts are written to `functional-output/e2e/`; integration output is written to
`functional-output/integration/`.

The same combined runner can be called directly from the command line. Use `--skip-install` after Chromium has already
been installed:

```bash
TEST_URL=https://ccd-admin-web.aat.platform.hmcts.net \
./scripts/run-playwright-tests.sh --skip-install
```

### Mocked browser integration tests

The separate Playwright integration suite exercises browser-rendered UI states while intercepting UI-triggered API
requests. It covers successful and failed Elasticsearch and Global Search indexing, successful and failed Welsh
dictionary downloads, and the import reindex-confirmation controls. The mocked requests do not reach the corresponding
backend services, but initial authentication and page rendering still use the target CCD Admin Web environment.

Run it with the same target and IdAM setup used by the functional suite. This example uses a static-account override:

```bash
TEST_URL=https://<deployed-admin-web-url> \
PLAYWRIGHT_USERNAME=<ccd-import-test-email> \
PLAYWRIGHT_PASSWORD=<ccd-import-test-password> \
yarn test:integration
```

These tests are only discovered by `playwright-integration.config.ts`; `yarn test` does not run them. The CI-facing
`yarn test:functional` command runs the E2E and integration suites sequentially and returns a failure if either suite
fails. Jenkins publishes their independent HTML and JUnit reports and archives both sets of failure artifacts from
their respective directories under `functional-output/`.

**Note:** You can also start the application by executing:
```bash
yarn tsx server.js
```

### Developing

To run both the setup and application in watch mode (where it will pick up changes and restart in realtime) then run:
```bash
yarn develop
```

### Managing dependencies:
To update the versions in package.json use:
```bash
$ yarn upgrade-interactive
```
and choose the appropriate version for each dependency.

The jenkins pipeline will check dependency versions for vulnerabilities. If you wish to suppress the issues that the pipeline is looking for you can populate the "yarn-audit-known-issues" file by running:
```bash
$ yarn suppress-cve
```

### Accessing the service

The application uses HTTP, port 3100 by default. Point your browser at http://localhost:3100 to login.
