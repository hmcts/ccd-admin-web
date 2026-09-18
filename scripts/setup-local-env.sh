#!/usr/bin/env bash

set -euo pipefail

if [[ -n "${BASH_SOURCE:-}" && "${BASH_SOURCE[0]}" == "${0}" ]]; then
  echo "Run with: source ./scripts/setup-local-env.sh" >&2
  exit 1
fi

secret_dir="${LOCAL_SECRET_DIR:-$PWD/.local-secrets}"
mkdir -p "$secret_dir"
chmod 700 "$secret_dir"

if [[ ! -f "$secret_dir/localhost.key" || ! -f "$secret_dir/localhost.crt" ]]; then
  openssl req -x509 -newkey rsa:2048 -nodes -days 365 \
    -keyout "$secret_dir/localhost.key" \
    -out "$secret_dir/localhost.crt" \
    -subj "/CN=localhost" >/dev/null 2>&1
  chmod 600 "$secret_dir/localhost.key" "$secret_dir/localhost.crt"
fi

export HTTPS_CERT_PATH="$secret_dir/localhost.crt"
export HTTPS_KEY_PATH="$secret_dir/localhost.key"

if [[ -z "${IDAM_ADMIN_WEB_SERVICE_KEY:-}" ]]; then
  if [[ -n "${ZSH_VERSION:-}" ]]; then
    read -r -s "IDAM_ADMIN_WEB_SERVICE_KEY?IDAM_ADMIN_WEB_SERVICE_KEY: "
  else
    read -r -s -p "IDAM_ADMIN_WEB_SERVICE_KEY: " IDAM_ADMIN_WEB_SERVICE_KEY
    echo
  fi
  export IDAM_ADMIN_WEB_SERVICE_KEY
fi

if [[ -z "${IDAM_OAUTH2_AW_CLIENT_SECRET:-}" ]]; then
  if [[ -n "${ZSH_VERSION:-}" ]]; then
    read -r -s "IDAM_OAUTH2_AW_CLIENT_SECRET?IDAM_OAUTH2_AW_CLIENT_SECRET: "
  else
    read -r -s -p "IDAM_OAUTH2_AW_CLIENT_SECRET: " IDAM_OAUTH2_AW_CLIENT_SECRET
    echo
  fi
  export IDAM_OAUTH2_AW_CLIENT_SECRET
fi

echo "Local HTTPS environment configured for this shell."
