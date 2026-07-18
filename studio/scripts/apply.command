#!/bin/zsh
set -euo pipefail

ROOT="${0:A:h:h}"
PORT="${CODEX_THEMES_PORT:-9341}"

if (( $# != 0 )); then
  print -u2 -- "用法：apply.command"
  exit 64
fi
exec "$ROOT/scripts/lib/run-cli.zsh" apply --theme xp-qq --port "$PORT"
