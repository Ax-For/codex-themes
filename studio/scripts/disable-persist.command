#!/bin/zsh
set -euo pipefail

ROOT="${0:A:h:h}"
PORT="${HEIGE_CODEX_SKIN_PORT:-9341}"
"$ROOT/scripts/lib/run-cli.zsh" set-persistence false --port "$PORT"
print -r -- "常驻已关闭：本次皮肤继续使用。"
print -r -- "下次启动完全原生；需要恢复时，请重新运行项目安装脚本。"
