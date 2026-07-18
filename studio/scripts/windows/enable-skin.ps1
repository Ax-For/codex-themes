param(
    [ValidateSet("xp-qq")][string]$Theme = "xp-qq",
    [ValidateRange(1024, 65535)][int]$Port = 9341
)
$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "lib\entrypoints.ps1")
[Console]::OutputEncoding = [Text.Encoding]::UTF8

if (-not $PSBoundParameters.ContainsKey("Port") -and $env:CODEX_THEMES_PORT) {
    $Port = [int]$env:CODEX_THEMES_PORT
}
$root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$arguments = @{ Root = $root; Port = $Port; Theme = $Theme }
$result = Invoke-CodexThemesEnableSkinFlow @arguments
Write-Host "皮肤已应用到当前会话：$($result.Theme)。下次仍需常驻，请在 Codex 顶部打开「皮肤常驻」开关。"
