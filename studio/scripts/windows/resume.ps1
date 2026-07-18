param([ValidateRange(1024, 65535)][int]$Port = 9341)
$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "lib\entrypoints.ps1")
[Console]::OutputEncoding = [Text.Encoding]::UTF8

if (-not $PSBoundParameters.ContainsKey("Port") -and $env:CODEX_THEMES_PORT) {
    $Port = [int]$env:CODEX_THEMES_PORT
}
$root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
Invoke-CodexThemesResumeFlow -Root $root -Port $Port | Out-Null
Write-Host "皮肤已在当前 Codex 会话恢复。"
