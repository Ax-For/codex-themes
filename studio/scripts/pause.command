#!/bin/zsh
set -euo pipefail

ROOT="${0:A:h:h}"
PORT="${CODEX_THEMES_PORT:-9341}"
exec "$ROOT/scripts/lib/run-cli.zsh" pause --port "$PORT"
