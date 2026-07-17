#!/bin/zsh
set -euo pipefail

ROOT="${0:A:h:h}"
if (( $# != 0 )); then
  print -u2 -- "用法：enable-skin.command"
  exit 64
fi
exec "$ROOT/scripts/apply.command"
