param([ValidateRange(1024, 65535)][int]$Port = 9341)
$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "lib\entrypoints.ps1")
[Console]::OutputEncoding = [Text.Encoding]::UTF8

if (-not $PSBoundParameters.ContainsKey("Port") -and $env:HEIGE_CODEX_SKIN_PORT) {
    $Port = [int]$env:HEIGE_CODEX_SKIN_PORT
}
$root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$result = Invoke-HeiGePauseFlow -Root $root -Port $Port
if ($result.Mode -ceq "noop") {
    Write-Host "当前没有可移除的实时皮肤。"
} else {
    Write-Host "皮肤已暂停，Codex 原文件从未被修改。"
}
