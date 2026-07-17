param([ValidateRange(1024, 65535)][int]$Port = 9341)
$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "lib\entrypoints.ps1")
[Console]::OutputEncoding = [Text.Encoding]::UTF8

if (-not $PSBoundParameters.ContainsKey("Port") -and $env:HEIGE_CODEX_SKIN_PORT) {
    $Port = [int]$env:HEIGE_CODEX_SKIN_PORT
}
$root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$result = Invoke-HeiGeRestoreFlow -Root $root -Port $Port
if ($result.Mode -ceq "closed") {
    Write-Host "常驻已关闭。Codex 保持关闭。"
} elseif ($result.Mode -ceq "native") {
    Write-Host "常驻已关闭。Codex 保持原生界面运行。"
} else {
    Write-Host "常驻已关闭，Codex 已以默认前端重新启动。"
}
Write-Host "以后想再使用主题，请重新运行项目安装脚本。"
