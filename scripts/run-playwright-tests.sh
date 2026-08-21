#!/usr/bin/env bash

set -u

install_browser=true
if [[ "${1:-}" == "--skip-install" ]]; then
  install_browser=false
  shift
fi

if (( $# > 0 )); then
  echo "Usage: $0 [--skip-install]" >&2
  exit 2
fi

static_username="${PLAYWRIGHT_USERNAME:-}"
static_password="${PLAYWRIGHT_PASSWORD:-}"
if [[ -n "$static_username" || -n "$static_password" ]]; then
  if [[ -z "$static_username" || -z "$static_password" ]]; then
    echo "PLAYWRIGHT_USERNAME and PLAYWRIGHT_PASSWORD must be supplied together" >&2
    exit 2
  fi
elif [[ -z "${CREATE_USER_CLIENT_SECRET:-}" && -z "${IDAM_OAUTH2_AW_CLIENT_SECRET:-}" && -z "${OAUTH2_CLIENT_SECRET:-}" ]]; then
  if ! command -v az >/dev/null 2>&1; then
    echo "Azure CLI is required to load the CCD Admin OAuth secret for local execution" >&2
    exit 2
  fi

  vault_environment="${TEST_ENV:-}"
  case "$vault_environment" in
    preview|PREVIEW) vault_environment="aat" ;;
    spreview|SPREVIEW) vault_environment="saat" ;;
  esac

  if [[ -z "$vault_environment" ]]; then
    case "${TEST_URL:-}" in
      *'.demo.'*) vault_environment="demo" ;;
      *'.saat.'*) vault_environment="saat" ;;
      *) vault_environment="aat" ;;
    esac
  fi

  key_vault="${CCD_KEY_VAULT:-ccd-${vault_environment}}"
  if ! client_secret="$(az keyvault secret show \
    --vault-name "$key_vault" \
    --name ccd-admin-web-oauth2-client-secret \
    --query value \
    --output tsv \
    --only-show-errors)"; then
    echo "Unable to load ccd-admin-web-oauth2-client-secret from $key_vault" >&2
    exit 1
  fi
  if [[ -z "$client_secret" ]]; then
    echo "The ccd-admin-web-oauth2-client-secret value in $key_vault is empty" >&2
    exit 1
  fi
  export OAUTH2_CLIENT_SECRET="$client_secret"
  unset client_secret
fi

if [[ "$install_browser" == true ]]; then
  yarn playwright install chromium || exit $?
fi

e2e_status=0
integration_status=0

yarn playwright test --config=playwright.config.ts || e2e_status=$?
yarn playwright test --config=playwright-integration.config.ts || integration_status=$?

if (( e2e_status != 0 || integration_status != 0 )); then
  echo "Playwright suites failed: e2e=$e2e_status integration=$integration_status" >&2
  exit 1
fi

echo "Playwright suites passed: e2e and integration"
