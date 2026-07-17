#!/bin/zsh
set -euo pipefail

ROOT="${0:A:h:h}"
PORT="${HEIGE_CODEX_SKIN_PORT:-9341}"
exec "$ROOT/scripts/lib/run-cli.zsh" resume --port "$PORT"
