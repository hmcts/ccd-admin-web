# Case Admin Web [![Build Status](https://travis-ci.org/hmcts/ccd-admin-web.svg?branch=master)](https://travis-ci.org/hmcts/ccd-admin-web)
Web application for administration of Case Definition data (initially for importing definitions).

## Overview
[Express](http://expressjs.com) application that allows an authorised user to import Case Definitions in the form of an Excel spreadsheet.

## Getting started

### Prerequisites
- [Node.js](https://nodejs.org/en) version 8.8.0

### Environment variables

The following environment variables are required:

| Name | Default | Description |
|------|---------|-------------|
| IDAM_BASE_URL | - | Base URL for IdAM's User API service (idam-app). `http://localhost:4501` for the dockerised local instance or tunnelled `dev` instance. |
| IDAM_S2S_URL | - | Base URL for IdAM's S2S API service (service-auth-provider). `http://localhost:4502` for the dockerised local instance or tunnelled `dev` instance. |
| IDAM_ADMIN_WEB_SERVICE_KEY | - | Case Admin Web's IdAM S2S micro-service secret key. This must match the IdAM instance it's being run against. |
| IDAM_LOGOUT_URL | - | URL of the IdAM Authentication Web `logout` page. `https://localhost:3501/login/logout` for the dockerised local instance. |
| IDAM_OAUTH2_TOKEN_ENDPOINT | - | URL of the IdAM OAuth2 API endpoint for obtaining an OAuth2 token. `http://localhost:4501/oauth2/token` for the dockerised local instance or tunnelled `dev` instance. |
| IDAM_OAUTH2_AW_CLIENT_SECRET | - | Secret to be passed to IdAM when obtaining an OAuth2 token. This must match the IdAM instance it's being run against. |
| ADMINWEB_LOGIN_URL | - | URL of the IdAM Authentication Web `login` page. `https://localhost:3501/login` for the dockerised local instance. |
| ADMINWEB_IMPORT_URL | - | URL of the Case Definition Store API `import` endpoint. `http://localhost:4451/import` for the dockerised local instance. |
| APPINSIGHTS_INSTRUMENTATIONKEY | - | Secret for Microsoft Insights logging, can be a dummy string in local. |

### Building

The project uses [yarn](https://yarnpkg.com/lang/en/). To build it, execute the following command:
```bash
yarn install
```

### Running

Start the application by executing the following command:
```bash
yarn start
```

**Note:** You can also start the application by executing:
```bash
node server.js
```

### Accessing the service

The application uses HTTP, port 3100 by default. Point your browser at http://localhost:3100 to login.
