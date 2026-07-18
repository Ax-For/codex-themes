param(
    [Parameter(Mandatory = $true)]
    [ValidateSet("run", "register", "start", "unregister", "status")]
    [string]$Action,
    [string]$TaskName = "Codex Themes Controller",
    [ValidateRange(1024, 65535)]
    [int]$Port = 9341,
    [string]$StateDirectory,
    [string]$AppIdentityToken,
    [Nullable[long]]$ExpectedRevision,
    [string]$ExpectedTransitionNonce,
    [switch]$PreserveHandshake
)

$ErrorActionPreference = "Stop"
$script:WindowsRoot = $PSScriptRoot
$script:RepositoryRoot = Split-Path (Split-Path $script:WindowsRoot -Parent) -Parent
. (Join-Path $script:WindowsRoot "lib\common.ps1")
. (Join-Path $script:WindowsRoot "lib\scheduled-task.ps1")

try {
    $testMode = Test-CodexThemesTestTaskName -TaskName $TaskName
    Assert-CodexThemesTaskScope -TaskName $TaskName -TestMode:$testMode
    $StateDirectory = Resolve-CodexThemesScopedStateDirectory `
        -StateDirectory $StateDirectory -TestMode:$testMode
    $hasExpectedRevision = $PSBoundParameters.ContainsKey("ExpectedRevision")
    $hasExpectedNonce = $PSBoundParameters.ContainsKey("ExpectedTransitionNonce")
    if (($Action -eq "run" -or $Action -eq "register") -and ($hasExpectedRevision -or $hasExpectedNonce)) {
        throw "$Action does not accept expected handshake parameters"
    }
    if (($Action -eq "status" -or $Action -eq "unregister") -and
        ($hasExpectedRevision -or $hasExpectedNonce)) {
        throw "$Action does not accept handshake parameters"
    }
    if ($PreserveHandshake -and $Action -ne "unregister") {
        throw "$Action does not accept PreserveHandshake"
    }

    if ($Action -eq "status") {
        Get-CodexThemesScheduledTaskStatus -TaskName $TaskName -StateDirectory $StateDirectory `
            -TestMode:$testMode | ConvertTo-Json -Depth 8
        exit 0
    }

    if ($Action -eq "unregister") {
        Unregister-CodexThemesScheduledTask -TaskName $TaskName -StateDirectory $StateDirectory `
            -TestMode:$testMode -PreserveHandshake:$PreserveHandshake | ConvertTo-Json -Depth 8
        exit 0
    }

    if ($Action -eq "start") {
        if ($null -eq $ExpectedRevision -or -not $ExpectedTransitionNonce) {
            throw "start requires ExpectedRevision and ExpectedTransitionNonce"
        }
        Protect-CodexThemesStateDirectory -Path $StateDirectory | Out-Null
        Start-CodexThemesScheduledTask -TaskName $TaskName -StateDirectory $StateDirectory `
            -ExpectedRevision ([long]$ExpectedRevision) `
            -ExpectedTransitionNonce $ExpectedTransitionNonce -TestMode:$testMode | ConvertTo-Json -Depth 8
        exit 0
    }

    Protect-CodexThemesStateDirectory -Path $StateDirectory | Out-Null
    $inheritedIdentityToken = [System.Environment]::GetEnvironmentVariable(
        "CODEX_THEMES_WINDOWS_APP_IDENTITY",
        [System.EnvironmentVariableTarget]::Process
    )
    if ($AppIdentityToken -and $inheritedIdentityToken -and
        $AppIdentityToken -cne $inheritedIdentityToken) {
        throw "controller app identity token conflicts with the inherited identity"
    }
    $boundIdentityToken = if ($AppIdentityToken) { $AppIdentityToken } else { $inheritedIdentityToken }
    if (-not $boundIdentityToken) {
        throw "$Action requires an immutable app identity token"
    }
    $app = Resolve-CodexThemesBoundCodexApp -IdentityToken $boundIdentityToken
    [System.Environment]::SetEnvironmentVariable(
        "CODEX_THEMES_WINDOWS_APP_IDENTITY",
        $boundIdentityToken,
        [System.EnvironmentVariableTarget]::Process
    )
    $node = Get-NodeRuntime -App $app

    if ($Action -eq "register") {
        Register-CodexThemesScheduledTask -TaskName $TaskName -NodePath $node.Path `
            -ControllerPath $PSCommandPath -StateDirectory $StateDirectory -Port $Port `
            -AppIdentityToken $boundIdentityToken `
            -TestMode:$testMode | ConvertTo-Json -Depth 8
        exit 0
    }

    $cliPath = Join-Path $script:RepositoryRoot "src\cli.mjs"
    if (-not (Test-Path -LiteralPath $cliPath -PathType Leaf)) {
        throw "Node controller CLI 不存在：$cliPath"
    }
    $result = Invoke-CodexThemesNodeControllerProcess -NodePath $node.Path -CliPath $cliPath `
        -TaskName $TaskName -Port $Port -StateDirectory $StateDirectory `
        -AppIdentityToken $boundIdentityToken
    if ([string]$result.action -ceq "unregister") {
        & $PSCommandPath -Action "unregister" -TaskName $TaskName -Port $Port `
            -StateDirectory $StateDirectory -PreserveHandshake | Out-Null
        exit 0
    }
    if ([string]$result.action -ceq "error") {
        throw "Node controller 返回 error action。"
    }
    throw "Node controller 以未知 action 退出：$([string]$result.action)"
} catch {
    [Console]::Error.WriteLine("Codex Themes Windows controller：$($_.Exception.Message)")
    exit 1
}
