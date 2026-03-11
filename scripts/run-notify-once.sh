#!/bin/zsh
set -euo pipefail

ROOT="/Users/gimhyeongjun/Desktop/codex code"
ENV_FILE="$ROOT/.notify.env"
LOG_DIR="$ROOT/logs"

mkdir -p "$LOG_DIR"

if [[ -f "$ENV_FILE" ]]; then
  set -a
  source "$ENV_FILE"
  set +a
fi

cd "$ROOT"
exec /opt/homebrew/bin/npm run notify:once
