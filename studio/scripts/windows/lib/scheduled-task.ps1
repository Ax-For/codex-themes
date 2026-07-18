# Codex Themes Scheduled Task adapter (Windows current user only)
$script:CodexThemesProductionTaskName = "Codex Themes Controller"
$script:CodexThemesTestTaskPattern = '^Codex Themes Test [0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'

function Test-CodexThemesTestTaskName {
    param([Parameter(Mandatory = $true)][string]$TaskName)
    return $TaskName -cmatch $script:CodexThemesTestTaskPattern
}

function Assert-CodexThemesKnownTaskName {
    param([Parameter(Mandatory = $true)][string]$TaskName)
    if ($TaskName -ceq $script:CodexThemesProductionTaskName) { return }
    if (Test-CodexThemesTestTaskName -TaskName $TaskName) { return }
    throw "Scheduled Task 名称必须是精确生产名或包含 GUID 的隔离测试名。"
}

function Assert-CodexThemesTaskScope {
    param(
        [Parameter(Mandatory = $true)][string]$TaskName,
        [switch]$TestMode
    )
    Assert-CodexThemesKnownTaskName -TaskName $TaskName
    if ($TestMode) {
        if ($TaskName -ceq $script:CodexThemesProductionTaskName) {
            throw "test mode cannot address the production task"
        }
        if (-not (Test-CodexThemesTestTaskName -TaskName $TaskName)) {
            throw "test mode task name must contain an exact GUID"
        }
        return
    }
    if ($TaskName -cne $script:CodexThemesProductionTaskName) {
        throw "production mode can address only the production task"
    }
}

function Get-CodexThemesCurrentUserId {
    return [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
}

function Get-CodexThemesDefaultStateDirectory {
    if ($env:APPDATA) { return (Join-Path $env:APPDATA "CodexThemes") }
    if ($env:USERPROFILE) { return (Join-Path $env:USERPROFILE "AppData\Roaming\CodexThemes") }
    throw "无法解析当前用户的 Windows 状态目录。"
}

function Get-CodexThemesComparablePath {
    param([Parameter(Mandatory = $true)][string]$Path)
    if (-not [System.IO.Path]::IsPathRooted($Path)) { throw "状态目录必须是绝对路径。" }
    $fullPath = [System.IO.Path]::GetFullPath($Path)
    $rootPath = [System.IO.Path]::GetPathRoot($fullPath)
    if ($fullPath -ieq $rootPath) { throw "状态目录不能是文件系统根目录。" }
    $separators = [char[]]@(
        [System.IO.Path]::DirectorySeparatorChar,
        [System.IO.Path]::AltDirectorySeparatorChar
    )
    return $fullPath.TrimEnd($separators)
}

function Resolve-CodexThemesScopedStateDirectory {
    param(
        [AllowNull()][string]$StateDirectory,
        [switch]$TestMode
    )
    $defaultDirectory = Get-CodexThemesComparablePath -Path (Get-CodexThemesDefaultStateDirectory)
    if ($TestMode) {
        if (-not $StateDirectory) { throw "test mode requires an isolated state directory" }
        $resolved = Get-CodexThemesComparablePath -Path $StateDirectory
        if ($resolved -ieq $defaultDirectory) {
            throw "test mode cannot use the production state directory"
        }
        return $resolved
    }
    if ($StateDirectory) {
        $resolved = Get-CodexThemesComparablePath -Path $StateDirectory
        if ($resolved -ine $defaultDirectory) {
            throw "production mode must use the default state directory"
        }
    }
    return $defaultDirectory
}

function Get-CodexThemesWindowsPowerShellPath {
    if (-not $env:SystemRoot) { throw "SystemRoot 不存在，无法定位 Windows PowerShell。" }
    return (Join-Path $env:SystemRoot "System32\WindowsPowerShell\v1.0\powershell.exe")
}

function ConvertTo-CodexThemesQuotedArgument {
    param([Parameter(Mandatory = $true)][string]$Value)
    if ($Value.Contains('"') -or $Value.Contains("`r") -or $Value.Contains("`n")) {
        throw "Scheduled Task 参数包含不允许的引号或换行。"
    }
    return '"' + $Value + '"'
}

function Assert-CodexThemesAppIdentityToken {
    param([Parameter(Mandatory = $true)][string]$AppIdentityToken)
    try {
        ConvertFrom-CodexThemesCodexAppIdentityToken -IdentityToken $AppIdentityToken | Out-Null
    } catch {
        throw "Scheduled Task app identity token is invalid: $($_.Exception.Message)"
    }
}

function Get-CodexThemesHandshakePath {
    param(
        [Parameter(Mandatory = $true)][string]$StateDirectory,
        [Parameter(Mandatory = $true)][string]$TaskName
    )
    Assert-CodexThemesKnownTaskName -TaskName $TaskName
    return (Join-Path $StateDirectory "controller-handshake.json")
}

function Get-CodexThemesStartRequestPath {
    param(
        [Parameter(Mandatory = $true)][string]$StateDirectory,
        [Parameter(Mandatory = $true)][string]$TaskName
    )
    Assert-CodexThemesKnownTaskName -TaskName $TaskName
    return (Join-Path $StateDirectory "controller-start-request.json")
}

function Test-CodexThemesSafeStartRequestFile {
    param([Parameter(Mandatory = $true)][string]$Path)
    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) { return $false }
    $item = Get-Item -LiteralPath $Path -Force -ErrorAction Stop
    if ($item.PSIsContainer -or
        ($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0 -or
        [long]$item.Length -le 0 -or [long]$item.Length -gt 4096) {
        throw "controller start request file is unsafe"
    }
    return $true
}

function Assert-CodexThemesStartRequestParameters {
    param(
        [Nullable[long]]$Revision,
        [AllowNull()][string]$TransitionNonce
    )
    $hasRevision = $null -ne $Revision
    $hasNonce = -not [string]::IsNullOrEmpty($TransitionNonce)
    if (-not $hasRevision -or -not $hasNonce) {
        throw "start request revision and nonce must be supplied together"
    }
    if ([long]$Revision -lt 0 -or [long]$Revision -gt 9007199254740991) {
        throw "start request revision must be a non-negative safe integer"
    }
    if ($TransitionNonce -notmatch '^[A-Za-z0-9_-]{1,128}$') {
        throw "start request transition nonce is invalid"
    }
}

function New-CodexThemesTaskDefinition {
    param(
        [Parameter(Mandatory = $true)][string]$TaskName,
        [Parameter(Mandatory = $true)][string]$NodePath,
        [Parameter(Mandatory = $true)][string]$ControllerPath,
        [Parameter(Mandatory = $true)][string]$StateDirectory,
        [Parameter(Mandatory = $true)][string]$AppIdentityToken,
        [string]$CurrentUserId,
        [string]$PowerShellPath,
        [ValidateRange(1024, 65535)][int]$Port = 9341
    )
    Assert-CodexThemesKnownTaskName -TaskName $TaskName
    Assert-CodexThemesAppIdentityToken -AppIdentityToken $AppIdentityToken
    if (-not $CurrentUserId) { $CurrentUserId = Get-CodexThemesCurrentUserId }
    if (-not $PowerShellPath) { $PowerShellPath = Get-CodexThemesWindowsPowerShellPath }
    foreach ($entry in @(
        [pscustomobject]@{ Name = "NodePath"; Value = $NodePath; Kind = "Leaf" },
        [pscustomobject]@{ Name = "ControllerPath"; Value = $ControllerPath; Kind = "Leaf" },
        [pscustomobject]@{ Name = "PowerShellPath"; Value = $PowerShellPath; Kind = "Leaf" },
        [pscustomobject]@{ Name = "StateDirectory"; Value = $StateDirectory; Kind = "Container" }
    )) {
        if (-not [System.IO.Path]::IsPathRooted([string]$entry.Value)) {
            throw "$($entry.Name) 必须是绝对路径。"
        }
    }
    $argumentList = @(
        "-NoProfile",
        "-NonInteractive",
        "-WindowStyle",
        "Hidden",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        (ConvertTo-CodexThemesQuotedArgument -Value $ControllerPath),
        "-Action",
        "run",
        "-TaskName",
        (ConvertTo-CodexThemesQuotedArgument -Value $TaskName),
        "-Port",
        [string]$Port,
        "-StateDirectory",
        (ConvertTo-CodexThemesQuotedArgument -Value $StateDirectory),
        "-AppIdentityToken",
        (ConvertTo-CodexThemesQuotedArgument -Value $AppIdentityToken)
    )
    $arguments = $argumentList -join " "
    return [pscustomobject][ordered]@{
        TaskName = $TaskName
        TaskPath = "\"
        NodePath = $NodePath
        StateDirectory = $StateDirectory
        Action = [pscustomobject][ordered]@{
            Execute = $PowerShellPath
            Arguments = $arguments
            WorkingDirectory = Split-Path $ControllerPath -Parent
        }
        Principal = [pscustomobject][ordered]@{
            UserId = $CurrentUserId
            LogonType = "InteractiveToken"
            RunLevel = "Limited"
        }
        Trigger = [pscustomobject][ordered]@{
            Type = "AtLogOn"
            UserId = $CurrentUserId
        }
        Settings = [pscustomobject][ordered]@{
            MultipleInstances = "IgnoreNew"
            StartWhenAvailable = $true
            ExecutionTimeLimit = "PT0S"
        }
        RequiresElevation = $false
    }
}

function Register-DefaultCodexThemesScheduledTask {
    param([Parameter(Mandatory = $true)]$Definition)
    $action = New-ScheduledTaskAction -Execute $Definition.Action.Execute `
        -Argument $Definition.Action.Arguments -WorkingDirectory $Definition.Action.WorkingDirectory
    $principal = New-ScheduledTaskPrincipal -UserId $Definition.Principal.UserId `
        -LogonType Interactive -RunLevel Limited
    $trigger = New-ScheduledTaskTrigger -AtLogOn -User $Definition.Trigger.UserId
    $settings = New-ScheduledTaskSettingsSet -MultipleInstances IgnoreNew `
        -StartWhenAvailable -ExecutionTimeLimit ([TimeSpan]::Zero)
    $task = New-ScheduledTask -Action $action -Principal $principal -Trigger $trigger -Settings $settings `
        -Description "Codex Themes current-user controller"
    Register-ScheduledTask -TaskPath "\" -TaskName $Definition.TaskName -InputObject $task -Force | Out-Null
}

function ConvertFrom-DefaultCodexThemesScheduledTask {
    param([Parameter(Mandatory = $true)]$Task)
    $actions = @($Task.Actions)
    $triggers = @($Task.Triggers)
    $logonType = [string]$Task.Principal.LogonType
    if ($logonType -eq "3" -or $logonType -ceq "Interactive" -or
        $logonType -ceq "InteractiveToken") {
        $logonType = "InteractiveToken"
    }
    $runLevel = [string]$Task.Principal.RunLevel
    if ($runLevel -eq "0" -or $runLevel -eq "LeastPrivilege") { $runLevel = "Limited" }
    $multipleInstances = [string]$Task.Settings.MultipleInstances
    if ($multipleInstances -eq "2") { $multipleInstances = "IgnoreNew" }
    $isLogonTrigger = $triggers.Count -eq 1 -and [string]$triggers[0].CimClass.CimClassName -eq "MSFT_TaskLogonTrigger"
    $triggerType = if ($isLogonTrigger) { "AtLogOn" } else { "Unknown" }
    return [pscustomobject][ordered]@{
        TaskName = [string]$Task.TaskName
        TaskPath = [string]$Task.TaskPath
        ActionCount = $actions.Count
        TriggerCount = $triggers.Count
        Action = if ($actions.Count -eq 1) {
            [pscustomobject][ordered]@{
                Execute = [string]$actions[0].Execute
                Arguments = [string]$actions[0].Arguments
                WorkingDirectory = [string]$actions[0].WorkingDirectory
            }
        } else { $null }
        Principal = [pscustomobject][ordered]@{
            UserId = [string]$Task.Principal.UserId
            LogonType = $logonType
            RunLevel = $runLevel
        }
        Trigger = [pscustomobject][ordered]@{
            Type = $triggerType
            UserId = if ($triggers.Count -eq 1) { [string]$triggers[0].UserId } else { $null }
        }
        Settings = [pscustomobject][ordered]@{
            MultipleInstances = $multipleInstances
            StartWhenAvailable = [bool]$Task.Settings.StartWhenAvailable
            ExecutionTimeLimit = [string]$Task.Settings.ExecutionTimeLimit
        }
        RequiresElevation = $runLevel -ne "Limited"
        State = [string]$Task.State
    }
}

function Get-DefaultCodexThemesScheduledTask {
    param([Parameter(Mandatory = $true)][string]$TaskName)
    $task = Get-ScheduledTask -TaskPath "\" -TaskName $TaskName -ErrorAction SilentlyContinue
    if (-not $task) { return $null }
    return ConvertFrom-DefaultCodexThemesScheduledTask -Task $task
}

function Assert-CodexThemesStoredTaskDefinition {
    param(
        [Parameter(Mandatory = $true)]$Expected,
        [Parameter(Mandatory = $true)]$Stored
    )
    $checks = @(
        @("TaskName", [string]$Expected.TaskName, [string]$Stored.TaskName),
        @("TaskPath", [string]$Expected.TaskPath, [string]$Stored.TaskPath),
        @("Action.Execute", [string]$Expected.Action.Execute, [string]$Stored.Action.Execute),
        @("Action.Arguments", [string]$Expected.Action.Arguments, [string]$Stored.Action.Arguments),
        @("Action.WorkingDirectory", [string]$Expected.Action.WorkingDirectory, [string]$Stored.Action.WorkingDirectory),
        @("Principal.UserId", [string]$Expected.Principal.UserId, [string]$Stored.Principal.UserId),
        @("Principal.LogonType", [string]$Expected.Principal.LogonType, [string]$Stored.Principal.LogonType),
        @("Principal.RunLevel", [string]$Expected.Principal.RunLevel, [string]$Stored.Principal.RunLevel),
        @("Trigger.Type", [string]$Expected.Trigger.Type, [string]$Stored.Trigger.Type),
        @("Trigger.UserId", [string]$Expected.Trigger.UserId, [string]$Stored.Trigger.UserId),
        @("Settings.MultipleInstances", [string]$Expected.Settings.MultipleInstances, [string]$Stored.Settings.MultipleInstances),
        @("Settings.ExecutionTimeLimit", [string]$Expected.Settings.ExecutionTimeLimit, [string]$Stored.Settings.ExecutionTimeLimit)
    )
    foreach ($check in $checks) {
        $caseSensitive = [string]$check[0] -eq "Action.Arguments" -or
            [string]$check[0] -eq "TaskName"
        $different = if ($caseSensitive) { $check[1] -cne $check[2] } else { $check[1] -ne $check[2] }
        if ($different) {
            throw "stored task definition mismatch: $($check[0])"
        }
    }
    if ($Stored.PSObject.Properties.Name -contains "ActionCount" -and [int]$Stored.ActionCount -ne 1) {
        throw "stored task definition mismatch: ActionCount"
    }
    if ($Stored.PSObject.Properties.Name -contains "TriggerCount" -and [int]$Stored.TriggerCount -ne 1) {
        throw "stored task definition mismatch: TriggerCount"
    }
    if (-not [bool]$Stored.Settings.StartWhenAvailable) {
        throw "stored task definition mismatch: StartWhenAvailable"
    }
    if ([bool]$Stored.RequiresElevation) {
        throw "stored task definition mismatch: RequiresElevation"
    }
}

function Get-CodexThemesInspectedTask {
    param(
        [Parameter(Mandatory = $true)][string]$TaskName,
        [scriptblock]$InspectProvider
    )
    if (-not $InspectProvider) {
        $InspectProvider = { param($Name) Get-DefaultCodexThemesScheduledTask -TaskName $Name }
    }
    $matches = @(& $InspectProvider $TaskName)
    if ($matches.Count -eq 0) { return $null }
    if ($matches.Count -gt 1) { throw "Scheduled Task 查询结果不唯一：$TaskName" }
    return $matches[0]
}

function Register-CodexThemesScheduledTask {
    param(
        [Parameter(Mandatory = $true)][string]$TaskName,
        [Parameter(Mandatory = $true)][string]$NodePath,
        [Parameter(Mandatory = $true)][string]$ControllerPath,
        [Parameter(Mandatory = $true)][string]$StateDirectory,
        [Parameter(Mandatory = $true)][string]$AppIdentityToken,
        [string]$CurrentUserId,
        [string]$PowerShellPath,
        [ValidateRange(1024, 65535)][int]$Port = 9341,
        [switch]$TestMode,
        [scriptblock]$RegisterProvider,
        [scriptblock]$InspectProvider,
        [scriptblock]$UnregisterProvider
    )
    Assert-CodexThemesTaskScope -TaskName $TaskName -TestMode:$TestMode
    if (-not $TestMode -and $PSBoundParameters.ContainsKey("CurrentUserId")) {
        throw "production current user identity cannot be injected"
    }
    if (-not $TestMode) { $CurrentUserId = Get-CodexThemesCurrentUserId }
    $StateDirectory = Resolve-CodexThemesScopedStateDirectory -StateDirectory $StateDirectory -TestMode:$TestMode
    foreach ($leaf in @(@($NodePath, $ControllerPath, $PowerShellPath) | Where-Object { $_ })) {
        if (-not (Test-Path -LiteralPath $leaf -PathType Leaf)) { throw "Scheduled Task 依赖文件不存在：$leaf" }
    }
    [System.IO.Directory]::CreateDirectory($StateDirectory) | Out-Null
    $definition = New-CodexThemesTaskDefinition -TaskName $TaskName -NodePath $NodePath `
        -ControllerPath $ControllerPath -StateDirectory $StateDirectory `
        -AppIdentityToken $AppIdentityToken `
        -CurrentUserId $CurrentUserId -PowerShellPath $PowerShellPath -Port $Port
    if (-not (Test-Path -LiteralPath $definition.Action.Execute -PathType Leaf)) {
        throw "Windows PowerShell 可执行文件不存在：$($definition.Action.Execute)"
    }
    if (-not $RegisterProvider) {
        $RegisterProvider = { param($Value) Register-DefaultCodexThemesScheduledTask -Definition $Value }
    }
    if (-not $UnregisterProvider) {
        $UnregisterProvider = {
            param($Name)
            Unregister-ScheduledTask -TaskPath "\" -TaskName $Name -Confirm:$false -ErrorAction SilentlyContinue
        }
    }
    & $RegisterProvider $definition | Out-Null
    try {
        $stored = Get-CodexThemesInspectedTask -TaskName $TaskName -InspectProvider $InspectProvider
        if (-not $stored) { throw "stored task definition is missing" }
        Assert-CodexThemesStoredTaskDefinition -Expected $definition -Stored $stored
    } catch {
        $verificationError = $_.Exception.Message
        try {
            & $UnregisterProvider $TaskName | Out-Null
            $remaining = Get-CodexThemesInspectedTask -TaskName $TaskName -InspectProvider $InspectProvider
            if ($remaining) { throw "task remains after rollback" }
        } catch {
            throw "stored task definition verification failed: $verificationError; rollback failed: $($_.Exception.Message)"
        }
        throw "stored task definition verification failed: $verificationError"
    }
    return [pscustomobject][ordered]@{
        TaskName = $TaskName
        Registered = $true
        Verified = $true
        ControllerReady = $false
    }
}

function Remove-CodexThemesStaleControllerHandshake {
    param([Parameter(Mandatory = $true)][string]$Path)
    if (-not (Test-Path -LiteralPath $Path)) { return $false }
    $item = Get-Item -LiteralPath $Path -Force -ErrorAction Stop
    $unsafe = ($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0 -or
        $item.PSIsContainer -or [long]$item.Length -gt 4096
    Remove-Item -LiteralPath $Path -Force -ErrorAction Stop
    if ($unsafe) { throw "unsafe stale controller handshake was removed" }
    return $true
}

function Get-CodexThemesTaskFileKey {
    param([Parameter(Mandatory = $true)][string]$TaskName)
    Assert-CodexThemesKnownTaskName -TaskName $TaskName
    $sha256 = [System.Security.Cryptography.SHA256]::Create()
    try {
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($TaskName)
        $digest = $sha256.ComputeHash($bytes)
        return (-join @($digest | ForEach-Object { $_.ToString("x2") }))
    } finally {
        $sha256.Dispose()
    }
}

function Invoke-CodexThemesNodeControllerProcess {
    param(
        [Parameter(Mandatory = $true)][string]$NodePath,
        [Parameter(Mandatory = $true)][string]$CliPath,
        [Parameter(Mandatory = $true)][string]$TaskName,
        [Parameter(Mandatory = $true)][int]$Port,
        [Parameter(Mandatory = $true)][string]$StateDirectory,
        [Parameter(Mandatory = $true)][string]$AppIdentityToken,
        [scriptblock]$ProcessProvider,
        [scriptblock]$WaitProvider,
        [scriptblock]$StopProvider
    )
    Assert-CodexThemesKnownTaskName -TaskName $TaskName
    Assert-CodexThemesAppIdentityToken -AppIdentityToken $AppIdentityToken
    foreach ($leaf in @($NodePath, $CliPath)) {
        if (-not (Test-Path -LiteralPath $leaf -PathType Leaf)) {
            throw "Node controller dependency does not exist: $leaf"
        }
    }
    $key = Get-CodexThemesTaskFileKey -TaskName $TaskName
    $stdoutPath = Join-Path $StateDirectory ("controller-" + $key + ".stdout.json")
    $stderrPath = Join-Path $StateDirectory ("controller-" + $key + ".stderr.log")
    Remove-Item -LiteralPath $stdoutPath, $stderrPath -Force -ErrorAction SilentlyContinue
    $arguments = @(
        (ConvertTo-CodexThemesQuotedArgument -Value $CliPath),
        "controller",
        "--background",
        "--platform",
        "windows",
        "--task-name",
        (ConvertTo-CodexThemesQuotedArgument -Value $TaskName),
        "--state-directory",
        (ConvertTo-CodexThemesQuotedArgument -Value $StateDirectory),
        "--port",
        [string]$Port
    ) -join " "
    $specification = [pscustomobject][ordered]@{
        FilePath = $NodePath
        Arguments = $arguments
        AppIdentityToken = $AppIdentityToken # secret-scan: allow -- runtime app identity, not a credential
        StandardOutputPath = $stdoutPath
        StandardErrorPath = $stderrPath
    }
    if (-not $ProcessProvider) {
        $ProcessProvider = {
            param($Spec)
            Start-Process -FilePath $Spec.FilePath -ArgumentList $Spec.Arguments -PassThru `
                -WindowStyle Hidden -RedirectStandardOutput $Spec.StandardOutputPath `
                -RedirectStandardError $Spec.StandardErrorPath
        }
    }
    if (-not $WaitProvider) { $WaitProvider = { param($Process) $Process.WaitForExit() } }
    if (-not $StopProvider) {
        $StopProvider = {
            param($Process)
            if (-not $Process.HasExited) {
                $Process.Kill()
                $Process.WaitForExit()
            }
        }
    }
    $process = $null
    try {
        $environmentName = "CODEX_THEMES_WINDOWS_APP_IDENTITY"
        $previousIdentity = [System.Environment]::GetEnvironmentVariable(
            $environmentName,
            [System.EnvironmentVariableTarget]::Process
        )
        [System.Environment]::SetEnvironmentVariable(
            $environmentName,
            $AppIdentityToken,
            [System.EnvironmentVariableTarget]::Process
        )
        try {
            $processValues = @(& $ProcessProvider $specification)
        } finally {
            [System.Environment]::SetEnvironmentVariable(
                $environmentName,
                $previousIdentity,
                [System.EnvironmentVariableTarget]::Process
            )
        }
        if ($processValues.Count -ne 1 -or $null -eq $processValues[0]) {
            throw "Node controller process provider did not return one process"
        }
        $process = $processValues[0]
        & $WaitProvider $process | Out-Null
        if (-not [bool]$process.HasExited) {
            throw "Node controller wait returned before process exit"
        }
        if ([int]$process.ExitCode -ne 0) {
            $detail = if (Test-Path -LiteralPath $stderrPath -PathType Leaf) {
                [System.IO.File]::ReadAllText($stderrPath).Trim()
            } else { "" }
            throw "Node controller 退出码 $([int]$process.ExitCode)：$detail"
        }
        $result = if (Test-Path -LiteralPath $stdoutPath -PathType Leaf) {
            $text = [System.IO.File]::ReadAllText($stdoutPath).Trim()
            if ($text) { $text | ConvertFrom-Json } else { $null }
        } else { $null }
        if (-not $result -or $result.PSObject.Properties.Name -notcontains "action") {
            throw "Node controller 正常退出但没有返回 action。"
        }
        if ([string]$result.action -cne "unregister") {
            throw "Node controller returned an unexpected terminal action: $([string]$result.action)"
        }
        return $result
    } catch {
        $primaryError = $_.Exception.Message
        $cleanupErrors = @()
        if ($process) {
            try {
                if (-not [bool]$process.HasExited) { & $StopProvider $process | Out-Null }
            } catch {
                $cleanupErrors += $_.Exception.Message
            }
        }
        if ($cleanupErrors.Count -gt 0) {
            throw "$primaryError; Node controller cleanup failed: $($cleanupErrors -join '; ')"
        }
        throw $primaryError
    } finally {
        Remove-Item -LiteralPath $stdoutPath, $stderrPath -Force -ErrorAction SilentlyContinue
    }
}

function Get-CodexThemesScheduledTaskStatus {
    param(
        [Parameter(Mandatory = $true)][string]$TaskName,
        [string]$StateDirectory,
        [switch]$TestMode,
        [scriptblock]$InspectProvider
    )
    Assert-CodexThemesTaskScope -TaskName $TaskName -TestMode:$TestMode
    $StateDirectory = Resolve-CodexThemesScopedStateDirectory -StateDirectory $StateDirectory -TestMode:$TestMode
    $stored = Get-CodexThemesInspectedTask -TaskName $TaskName -InspectProvider $InspectProvider
    if (-not $stored) {
        return [pscustomobject][ordered]@{
            TaskName = $TaskName
            Exists = $false
            Registered = $false
            State = "Absent"
            TaskRunning = $false
            ControllerReady = $false
            ControllerRevision = $null
            ControllerOutcome = $null
            ControllerPid = $null
        }
    }
    $state = if ($stored.PSObject.Properties.Name -contains "State") {
        [string]$stored.State
    } else { "Unknown" }
    return [pscustomobject][ordered]@{
        TaskName = $TaskName
        Exists = $true
        Registered = $true
        State = $state
        TaskRunning = $state -ceq "Running"
        ControllerReady = $false
        ControllerRevision = $null
        ControllerOutcome = $null
        ControllerPid = $null
    }
}

function Start-CodexThemesScheduledTask {
    param(
        [Parameter(Mandatory = $true)][string]$TaskName,
        [Parameter(Mandatory = $true)][long]$ExpectedRevision,
        [Parameter(Mandatory = $true)][string]$ExpectedTransitionNonce,
        [ValidateRange(1, 300)][int]$TimeoutSeconds = 10,
        [string]$StateDirectory,
        [switch]$TestMode,
        [scriptblock]$StartProvider,
        [scriptblock]$StopProvider,
        [scriptblock]$RequestInspectorProvider,
        [scriptblock]$SleepProvider,
        [scriptblock]$InspectProvider
    )
    Assert-CodexThemesTaskScope -TaskName $TaskName -TestMode:$TestMode
    Assert-CodexThemesStartRequestParameters -Revision $ExpectedRevision `
        -TransitionNonce $ExpectedTransitionNonce
    $StateDirectory = Resolve-CodexThemesScopedStateDirectory -StateDirectory $StateDirectory -TestMode:$TestMode
    $requestPath = Get-CodexThemesStartRequestPath -StateDirectory $StateDirectory -TaskName $TaskName
    if (-not $RequestInspectorProvider) {
        $RequestInspectorProvider = { param($Value) Test-CodexThemesSafeStartRequestFile -Path $Value }
    }
    $requestInspection = @(& $RequestInspectorProvider $requestPath)
    if ($requestInspection.Count -ne 1 -or $requestInspection[0] -isnot [bool]) {
        throw "controller start request inspection is invalid"
    }
    if (-not [bool]$requestInspection[0]) {
        throw "controller start request is missing"
    }
    $stored = Get-CodexThemesInspectedTask -TaskName $TaskName -InspectProvider $InspectProvider
    if (-not $stored) { throw "Scheduled Task does not exist: $TaskName" }
    $previousState = if ($stored.PSObject.Properties.Name -contains "State") {
        [string]$stored.State
    } else { "Unknown" }
    if (-not $StartProvider) {
        $StartProvider = { param($Name) Start-ScheduledTask -TaskPath "\" -TaskName $Name }
    }
    if (-not $StopProvider) {
        $StopProvider = { param($Name) Stop-ScheduledTask -TaskPath "\" -TaskName $Name }
    }
    if (-not $SleepProvider) {
        $SleepProvider = { param($Milliseconds) Start-Sleep -Milliseconds $Milliseconds }
    }
    $restarted = $false
    if ($previousState -ceq "Running") {
        & $StopProvider $TaskName | Out-Null
        $restarted = $true
        $attempts = $TimeoutSeconds * 10
        $settled = $false
        for ($attempt = 0; $attempt -lt $attempts; $attempt++) {
            $current = Get-CodexThemesInspectedTask -TaskName $TaskName -InspectProvider $InspectProvider
            if (-not $current) { throw "Scheduled Task disappeared while stopping: $TaskName" }
            $state = if ($current.PSObject.Properties.Name -contains "State") {
                [string]$current.State
            } else { "Unknown" }
            if ($state -cne "Running") {
                $settled = $true
                break
            }
            if ($attempt -lt ($attempts - 1)) { & $SleepProvider 100 | Out-Null }
        }
        if (-not $settled) {
            throw "Scheduled Task did not stop within $TimeoutSeconds seconds: $TaskName"
        }
    }
    & $StartProvider $TaskName | Out-Null
    return [pscustomobject][ordered]@{
        TaskName = $TaskName
        StartInvoked = $true
        Restarted = $restarted
        PreviousState = $previousState
        RequestObserved = $true
        ControllerReady = $false
    }
}

function Unregister-CodexThemesScheduledTask {
    param(
        [Parameter(Mandatory = $true)][string]$TaskName,
        [string]$StateDirectory,
        [switch]$TestMode,
        [switch]$PreserveHandshake,
        [scriptblock]$UnregisterProvider,
        [scriptblock]$InspectProvider
    )
    Assert-CodexThemesTaskScope -TaskName $TaskName -TestMode:$TestMode
    $StateDirectory = Resolve-CodexThemesScopedStateDirectory -StateDirectory $StateDirectory -TestMode:$TestMode
    $before = Get-CodexThemesInspectedTask -TaskName $TaskName -InspectProvider $InspectProvider
    if (-not $UnregisterProvider) {
        $UnregisterProvider = {
            param($Name)
            Unregister-ScheduledTask -TaskPath "\" -TaskName $Name -Confirm:$false -ErrorAction SilentlyContinue
        }
    }
    & $UnregisterProvider $TaskName | Out-Null
    $after = Get-CodexThemesInspectedTask -TaskName $TaskName -InspectProvider $InspectProvider
    if ($after) { throw "Scheduled Task 注销后仍存在：$TaskName" }
    if (-not $PreserveHandshake) {
        $handshakePath = Get-CodexThemesHandshakePath -StateDirectory $StateDirectory -TaskName $TaskName
        Remove-CodexThemesStaleControllerHandshake -Path $handshakePath | Out-Null
    }
    return [pscustomobject][ordered]@{
        TaskName = $TaskName
        Removed = $null -ne $before
        VerifiedAbsent = $true
        HandshakePreserved = [bool]$PreserveHandshake
    }
}
