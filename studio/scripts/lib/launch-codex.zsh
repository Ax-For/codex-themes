#!/bin/zsh
set -euo pipefail

ROOT="${0:A:h:h:h}"
PORT="${1:-${HEIGE_CODEX_SKIN_PORT:-9341}}"
exec "$ROOT/scripts/lib/run-cli.zsh" apply --port "$PORT"
