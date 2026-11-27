# CCD-7877 Hardcoded Credentials

## Objective

Remove the tracked private key and externalise runtime credentials while preserving safe local development.

## Acceptance criteria

- No private key is tracked.
- Runtime credentials use environment or managed-secret injection.
- Local HTTPS uses ignored, locally managed certificate files.
- No live credential rotation is performed by this change.

## Validation

- TypeScript/source checks were reviewed; full lint requires the repository's `tslint` dependency.
- Full Docker runtime validation remains outstanding.

## Scope and findings

Remediation status: the tracked key has now been removed from this branch. Local HTTPS uses `HTTPS_CERT_PATH` and `HTTPS_KEY_PATH`; no live credential rotation was performed.

- `src/main/resources/localhost-ssl/localhost.key` is a tracked PEM RSA private key, added in history on 2017-09-20 for development HTTPS.
- `src/main/server.ts` reads the bundled certificate and key.
- Existing secret-backed mappings include `IDAM_ADMIN_WEB_SERVICE_KEY`, `IDAM_OAUTH2_AW_CLIENT_SECRET`, and `APPINSIGHTS_INSTRUMENTATIONKEY`.
- Prior secret-removal history does not prove rotation of this private key.

## Validity and deployment

- Current validity: **not confirmed**; no live authentication or secret-store access was available.
- Deployment/runtime: repository evidence only; Helm/Terraform supports environment/secret-backed values, but live pods, CI variables, and cloud secret stores were not accessible.
- Rotation: **not confirmed** for the key or reported credentials.

## Recommendations

Treat the key and reported credentials as compromised. Revoke/rotate, remove the key from source and history, and use runtime-mounted secrets or managed TLS. Continue using existing environment variables; if a runtime key is required, use `HTTPS_KEY_PATH` and `HTTPS_CERT_PATH`. Verify live secret-store references, deployed pods, CI/CD variables, and rotation records before closure.

## Local operation

Local HTTPS is now externalised. When running standalone, provide `HTTPS_CERT_PATH` and `HTTPS_KEY_PATH` to locally managed files. When using the CCD Docker stack, run `ccd-docker/bin/setup-local-secrets.sh`; it creates ignored local values and certificate files for the stack. No approved fixed-defaults-file fallback is currently implemented.
