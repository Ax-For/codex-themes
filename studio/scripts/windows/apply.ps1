param(
    [ValidateSet("xp-qq")][string]$Theme = "xp-qq",
    [ValidateRange(1024, 65535)][int]$Port = 9341
)
$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "lib\entrypoints.ps1")
[Console]::OutputEncoding = [Text.Encoding]::UTF8

if (-not $PSBoundParameters.ContainsKey("Port") -and $env:HEIGE_CODEX_SKIN_PORT) {
    $Port = [int]$env:HEIGE_CODEX_SKIN_PORT
}
$root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$arguments = @{ Root = $root; Port = $Port; Theme = $Theme }
$result = Invoke-HeiGeApplyFlow @arguments
Write-Host "皮肤已应用：$($result.Theme)。当前操作不改变常驻开关。"
