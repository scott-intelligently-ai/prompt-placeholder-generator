#!/usr/bin/env bash
# Materialize .env.local from Cursor Cloud secrets (process env).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

write_env_file() {
  local dest="$1"
  shift
  local tmp
  tmp="$(mktemp)"
  local wrote=0
  for key in "$@"; do
    if [[ -n "${!key:-}" ]]; then
      printf '%s=%s\n' "$key" "${!key}" >> "$tmp"
      wrote=1
    fi
  done
  if [[ "$wrote" -eq 1 ]]; then
    mkdir -p "$(dirname "$dest")"
    mv "$tmp" "$dest"
    echo "Wrote $dest"
  else
    rm -f "$tmp"
    echo "Skipped $dest (no matching secrets set)"
  fi
}

write_env_file "$ROOT/.env.local" \
  OPENAI_API_KEY \
  GITHUB_TOKEN \
  GITHUB_REPO
