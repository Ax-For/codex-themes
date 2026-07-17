# HeiGe Codex Skin Studio Windows entrypoint orchestration
$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "common.ps1")
. (Join-Path $PSScriptRoot "scheduled-task.ps1")

function New-HeiGeWindowsEntrypointContext {
    param([Parameter(Mandatory = $true)][string]$Root)
    $resolvedRoot = Get-HeiGeComparablePath -Path $Root
    if (-not (Test-Path -LiteralPath $resolvedRoot -PathType Container)) {
        throw "安装目录不存在：$resolvedRoot"
    }
    $rootItem = Get-Item -LiteralPath $resolvedRoot -Force -ErrorAction Stop
    if (($rootItem.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) {
        throw "安装目录不能是 reparse point：$resolvedRoot"
    }

    $cliPath = Join-Path $resolvedRoot "src\cli.mjs"
    $controllerPath = Join-Path $resolvedRoot "scripts\windows\controller.ps1"
    foreach ($path in @($cliPath, $controllerPath)) {
        if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
            throw "Windows 入口依赖文件不存在：$path"
        }
    }
    $app = Resolve-CodexApp
    $runtime = Get-NodeRuntime -App $app
    if (-not $runtime -or -not $runtime.Path -or -not (Test-Path -LiteralPath $runtime.Path -PathType Leaf)) {
        throw "Windows 入口无法验证 Node.js 运行时。"
    }
    $stateDirectory = Resolve-HeiGeScopedStateDirectory -StateDirectory $null
    Protect-HeiGeStateDirectory -Path $stateDirectory | Out-Null
    return [pscustomobject][ordered]@{
        App = $app
        NodePath = [string]$runtime.Path
        CliPath = $cliPath
        ControllerPath = $controllerPath
        StateDirectory = $stateDirectory
        TaskName = $script:HeiGeProductionTaskName
    }
}

function Get-HeiGeFlowContext {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [scriptblock]$ContextProvider
    )
    $values = @(
        if ($ContextProvider) {
            & $ContextProvider $Root
        } else {
            New-HeiGeWindowsEntrypointContext -Root $Root
        }
    )
    if ($values.Count -ne 1 -or $null -eq $values[0]) {
        throw "Windows 入口预检结果不唯一。"
    }
    $context = $values[0]
    foreach ($name in @("App", "NodePath", "CliPath", "ControllerPath", "StateDirectory", "TaskName")) {
        if ($context.PSObject.Properties.Name -notcontains $name -or $null -eq $context.$name) {
            throw "Windows 入口预检缺少字段：$name"
        }
    }
    return $context
}

function Invoke-HeiGeContextCli {
    param(
        [Parameter(Mandatory = $true)]$Context,
        [Parameter(Mandatory = $true)][string[]]$Arguments,
        [scriptblock]$CliProvider
    )
    $identityToken = ConvertTo-HeiGeCodexAppIdentityToken -App $Context.App
    $environmentName = "HEIGE_WINDOWS_APP_IDENTITY"
    $previousIdentity = [System.Environment]::GetEnvironmentVariable(
        $environmentName,
        [System.EnvironmentVariableTarget]::Process
    )
    [System.Environment]::SetEnvironmentVariable(
        $environmentName,
        $identityToken,
        [System.EnvironmentVariableTarget]::Process
    )
    try {
        $values = @(
            if ($CliProvider) {
                & $CliProvider $Context $Arguments
            } else {
                $cliArguments = @([string]$Context.CliPath) + @($Arguments)
                $json = Invoke-SkinCli -Node ([string]$Context.NodePath) -CliArgs $cliArguments
                try {
                    $json | ConvertFrom-Json
                } catch {
                    throw "皮肤命令返回了无效 JSON：$($_.Exception.Message)"
                }
            }
        )
    } finally {
        [System.Environment]::SetEnvironmentVariable(
            $environmentName,
            $previousIdentity,
            [System.EnvironmentVariableTarget]::Process
        )
    }
    if ($values.Count -ne 1 -or $null -eq $values[0]) {
        throw "皮肤命令返回结果不唯一。"
    }
    return $values[0]
}

function Assert-HeiGeModeResult {
    param(
        [Parameter(Mandatory = $true)]$Result,
        [Parameter(Mandatory = $true)][string]$Expected
    )
    if ($Result.PSObject.Properties.Name -notcontains "mode" -or [string]$Result.mode -cne $Expected) {
        throw "皮肤命令状态验证失败：期望 $Expected。"
    }
}

function Assert-HeiGePersistenceResult {
    param(
        [Parameter(Mandatory = $true)]$Result,
        [Parameter(Mandatory = $true)][bool]$Expected
    )
    if ($Result.PSObject.Properties.Name -notcontains "persistenceEnabled" -or
        $Result.persistenceEnabled -isnot [System.Boolean] -or
        [bool]$Result.persistenceEnabled -ne $Expected) {
        throw "常驻状态验证失败：期望 $Expected。"
    }
}

function Start-HeiGeEntrypointCdp {
    param(
        [Parameter(Mandatory = $true)]$Context,
        [Parameter(Mandatory = $true)][int]$Port,
        [scriptblock]$StartCdpProvider
    )
    if ($StartCdpProvider) {
        & $StartCdpProvider $Context $Port | Out-Null
    } else {
        Start-CodexWithCdp -Port $Port -AppInfo $Context.App
    }
}

function Require-HeiGeEntrypointCdp {
    param(
        [Parameter(Mandatory = $true)]$Context,
        [Parameter(Mandatory = $true)][int]$Port,
        [scriptblock]$RequireCdpProvider
    )
    if ($RequireCdpProvider) {
        & $RequireCdpProvider $Context $Port | Out-Null
        return
    }
    if (-not (Test-CdpEndpoint -Port $Port)) {
        throw "当前 Codex 未开启可归属的 CDP 端口：$Port"
    }
    Get-CdpOwner -Port $Port -App $Context.App | Out-Null
}

function Unregister-HeiGeEntrypointTask {
    param(
        [Parameter(Mandatory = $true)]$Context,
        [scriptblock]$UnregisterProvider
    )
    $values = @(
        if ($UnregisterProvider) {
            & $UnregisterProvider $Context
        } else {
            Unregister-HeiGeScheduledTask -TaskName ([string]$Context.TaskName) `
                -StateDirectory ([string]$Context.StateDirectory)
        }
    )
    if ($values.Count -ne 1 -or $null -eq $values[0] -or
        $values[0].PSObject.Properties.Name -notcontains "VerifiedAbsent" -or
        $values[0].VerifiedAbsent -isnot [System.Boolean] -or
        -not [bool]$values[0].VerifiedAbsent) {
        throw "Scheduled Task 注销后未能验证任务已消失。"
    }
    return $values[0]
}

function Get-HeiGeEntrypointProcessMode {
    param(
        [Parameter(Mandatory = $true)]$Context,
        [scriptblock]$ProcessProvider
    )
    $records = if ($ProcessProvider) {
        @(& $ProcessProvider $Context)
    } else {
        @(Get-CimInstance -ClassName Win32_Process `
            -Filter "Name='ChatGPT.exe' OR Name='Codex.exe'" -ErrorAction Stop)
    }
    $owned = @()
    foreach ($record in $records) {
        if ($null -eq $record) {
            throw "Codex 进程记录为空，无法唯一归属。"
        }
        $propertyNames = @($record.PSObject.Properties.Name)
        $processIdName = if ($propertyNames -contains "ProcessId") {
            "ProcessId"
        } elseif ($propertyNames -contains "Id") {
            "Id"
        } else {
            $null
        }
        $pathName = if ($propertyNames -contains "ExecutablePath") {
            "ExecutablePath"
        } elseif ($propertyNames -contains "Path") {
            "Path"
        } else {
            $null
        }
        if (-not $processIdName -or -not $pathName -or
            $propertyNames -notcontains "ParentProcessId") {
            throw "Codex 进程记录缺少 PID、父 PID 或可执行路径，无法唯一归属。"
        }
        try {
            $path = [string]$record.$pathName
            $processId = 0
            $parentProcessId = 0
            $validProcessId = [int]::TryParse([string]$record.$processIdName, [ref]$processId)
            $validParentId = [int]::TryParse([string]$record.ParentProcessId, [ref]$parentProcessId)
        } catch {
            throw "Codex 进程记录无法安全读取，无法唯一归属。"
        }
        if (-not $path -or -not $validProcessId -or $processId -le 0 -or
            -not $validParentId -or $parentProcessId -lt 0) {
            throw "Codex 进程记录无效，无法唯一归属。"
        }
        $owner = [pscustomobject]@{
            Id = $processId
            Path = $path
            ProcessName = if ($propertyNames -contains "Name") {
                [string]$record.Name
            } elseif ($propertyNames -contains "ProcessName") {
                [string]$record.ProcessName
            } else {
                ""
            }
        }
        if (Test-CdpOwnerMatchesApp -Owner $owner -App $Context.App) {
            $owned += [pscustomobject][ordered]@{
                Id = $processId
                ParentProcessId = $parentProcessId
                Path = Get-HeiGeFullPath -Path $path
            }
        } else {
            throw "Codex 候选进程不属于已绑定的不可变应用身份。"
        }
    }
    if ($owned.Count -eq 0) { return "closed" }

    $normalized = @()
    foreach ($group in @($owned | Group-Object Id)) {
        $parents = @($group.Group | ForEach-Object { [int]$_.ParentProcessId } | Sort-Object -Unique)
        $paths = @($group.Group | ForEach-Object { [string]$_.Path } | Sort-Object -Unique)
        if ($parents.Count -ne 1 -or $paths.Count -ne 1) {
            throw "同一 Codex PID 存在冲突记录，无法唯一归属。"
        }
        $normalized += [pscustomobject][ordered]@{
            Id = [int]$group.Name
            ParentProcessId = [int]$parents[0]
            Path = [string]$paths[0]
        }
    }
    $ownedIds = @{}
    foreach ($process in $normalized) { $ownedIds[[int]$process.Id] = $process }
    $mainProcesses = @($normalized | Where-Object {
        -not $ownedIds.ContainsKey([int]$_.ParentProcessId)
    })
    if ($mainProcesses.Count -ne 1) {
        throw "Codex 主进程归属不唯一，拒绝判断 closed/native。"
    }
    $rootProcess = $mainProcesses[0]
    foreach ($process in $normalized) {
        $visited = @{}
        $current = $process
        while ($ownedIds.ContainsKey([int]$current.ParentProcessId)) {
            if ($visited.ContainsKey([int]$current.Id)) {
                throw "Codex 进程图包含归属环，拒绝判断 closed/native。"
            }
            $visited[[int]$current.Id] = $true
            $current = $ownedIds[[int]$current.ParentProcessId]
        }
        if ([int]$current.Id -ne [int]$rootProcess.Id) {
            throw "Codex 进程图包含孤立归属组件，拒绝判断 closed/native。"
        }
    }
    return "native"
}

function Restore-HeiGeApplyPrestate {
    param(
        [Parameter(Mandatory = $true)]$Context,
        [Parameter(Mandatory = $true)][int]$Port,
        [Parameter(Mandatory = $true)][ValidateSet("native", "closed")][string]$Mode
    )
    if ($Mode -ceq "native") {
        Restart-CodexWithoutCdp -AppInfo $Context.App -Port $Port | Out-Null
    } else {
        Get-CdpOwner -Port $Port -App $Context.App | Out-Null
        Stop-CodexNormally -AppInfo $Context.App | Out-Null
        for ($attempt = 0; $attempt -lt 20; $attempt++) {
            if (-not (Test-CdpEndpoint -Port $Port)) { break }
            if ($attempt -lt 19) { Start-Sleep -Milliseconds 250 }
        }
        if (Test-CdpEndpoint -Port $Port) {
            throw "closed 补偿后 CDP 端口仍未释放：$Port"
        }
        if (@(Get-RunningCodex -AppInfo $Context.App).Count -ne 0) {
            throw "closed 补偿后仍存在已归属的 Codex 进程。"
        }
    }
    return [pscustomobject][ordered]@{ Restored = $true; Mode = $Mode }
}

function Invoke-HeiGeApplyCompensation {
    param(
        [Parameter(Mandatory = $true)]$Context,
        [Parameter(Mandatory = $true)][int]$Port,
        [Parameter(Mandatory = $true)][ValidateSet("native", "closed")][string]$Mode,
        [scriptblock]$CompensateProvider
    )
    $values = @(
        if ($CompensateProvider) {
            & $CompensateProvider $Context $Port $Mode
        } else {
            Restore-HeiGeApplyPrestate -Context $Context -Port $Port -Mode $Mode
        }
    )
    if ($values.Count -ne 1 -or $null -eq $values[0] -or
        $values[0].PSObject.Properties.Name -notcontains "Restored" -or
        $values[0].Restored -isnot [System.Boolean] -or
        -not [bool]$values[0].Restored -or
        $values[0].PSObject.Properties.Name -notcontains "Mode" -or
        [string]$values[0].Mode -cne $Mode) {
        throw "apply 补偿未能验证已恢复 $Mode 前态。"
    }
    return $values[0]
}

function Invoke-HeiGeApplyWithContext {
    param(
        [Parameter(Mandatory = $true)]$Context,
        [AllowNull()][string]$Theme,
        [Parameter(Mandatory = $true)][int]$Port,
        [scriptblock]$StartCdpProvider,
        [scriptblock]$CliProvider,
        [scriptblock]$CdpStatusProvider,
        [scriptblock]$ProcessProvider,
        [scriptblock]$CompensateProvider
    )
    $hasExactCdp = if ($CdpStatusProvider) {
        [bool](& $CdpStatusProvider $Context $Port)
    } else {
        Test-Cdp -Port $Port -App $Context.App
    }
    $prestate = if ($hasExactCdp) {
        "cdp"
    } else {
        Get-HeiGeEntrypointProcessMode -Context $Context -ProcessProvider $ProcessProvider
    }
    Start-HeiGeEntrypointCdp -Context $Context -Port $Port -StartCdpProvider $StartCdpProvider
    $arguments = @("apply")
    if ([string]::IsNullOrWhiteSpace($Theme)) {
        $arguments += "--prefer-stored"
    } else {
        $arguments += @("--theme", $Theme)
    }
    $arguments += @("--port", [string]$Port)
    try {
        $result = Invoke-HeiGeContextCli -Context $Context `
            -Arguments $arguments -CliProvider $CliProvider
        Assert-HeiGeModeResult -Result $result -Expected "active"
        return $result
    } catch {
        $applyError = $_.Exception
        if ($prestate -ceq "cdp") { throw $applyError }
        try {
            Invoke-HeiGeApplyCompensation -Context $Context -Port $Port -Mode $prestate `
                -CompensateProvider $CompensateProvider | Out-Null
        } catch {
            throw "皮肤应用失败且未能恢复启动前状态。原始错误：$($applyError.Message)；补偿错误：$($_.Exception.Message)"
        }
        throw $applyError
    }
}

function Invoke-HeiGeApplyFlow {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [AllowNull()][string]$Theme,
        [ValidateRange(1024, 65535)][int]$Port = 9341,
        [scriptblock]$ContextProvider,
        [scriptblock]$StartCdpProvider,
        [scriptblock]$CliProvider,
        [scriptblock]$CdpStatusProvider,
        [scriptblock]$ProcessProvider,
        [scriptblock]$CompensateProvider
    )
    if ($PSBoundParameters.ContainsKey("Theme") -and [string]::IsNullOrWhiteSpace($Theme)) {
        throw "Theme 显式传入时不能为空。"
    }
    $context = Get-HeiGeFlowContext -Root $Root -ContextProvider $ContextProvider
    $applied = Invoke-HeiGeApplyWithContext -Context $context -Theme $Theme -Port $Port `
        -StartCdpProvider $StartCdpProvider -CliProvider $CliProvider `
        -CdpStatusProvider $CdpStatusProvider -ProcessProvider $ProcessProvider `
        -CompensateProvider $CompensateProvider
    if ($applied.PSObject.Properties.Name -notcontains "persistenceEnabled" -or
        $applied.persistenceEnabled -isnot [System.Boolean]) {
        throw "apply 未返回可验证的常驻状态。"
    }
    return [pscustomobject][ordered]@{
        Mode = "active"
        PersistenceEnabled = [bool]$applied.persistenceEnabled
        PersistenceChanged = $false
        Theme = $Theme
        ThemeSelection = if ($PSBoundParameters.ContainsKey("Theme")) {
            "explicit"
        } else {
            "stored-or-default"
        }
        Completion = "complete"
    }
}

function Invoke-HeiGeEnableSkinFlow {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [AllowNull()][string]$Theme,
        [ValidateRange(1024, 65535)][int]$Port = 9341,
        [scriptblock]$ContextProvider,
        [scriptblock]$StartCdpProvider,
        [scriptblock]$CliProvider,
        [scriptblock]$CdpStatusProvider,
        [scriptblock]$ProcessProvider,
        [scriptblock]$CompensateProvider
    )
    if ($PSBoundParameters.ContainsKey("Theme") -and [string]::IsNullOrWhiteSpace($Theme)) {
        throw "Theme 显式传入时不能为空。"
    }
    $arguments = @{
        Root = $Root
        Port = $Port
        ContextProvider = $ContextProvider
        StartCdpProvider = $StartCdpProvider
        CliProvider = $CliProvider
        CdpStatusProvider = $CdpStatusProvider
        ProcessProvider = $ProcessProvider
        CompensateProvider = $CompensateProvider
    }
    if ($PSBoundParameters.ContainsKey("Theme")) { $arguments.Theme = $Theme }
    return Invoke-HeiGeApplyFlow @arguments
}

function Invoke-HeiGePauseFlow {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [ValidateRange(1024, 65535)][int]$Port = 9341,
        [scriptblock]$ContextProvider,
        [scriptblock]$CdpStatusProvider,
        [scriptblock]$CliProvider
    )
    $context = Get-HeiGeFlowContext -Root $Root -ContextProvider $ContextProvider
    $hasCdp = if ($CdpStatusProvider) {
        [bool](& $CdpStatusProvider $context $Port)
    } else {
        Test-Cdp -Port $Port -App $context.App
    }
    if (-not $hasCdp) {
        return [pscustomobject][ordered]@{
            Mode = "noop"
            PersistenceEnabled = $null
            Completion = "complete"
        }
    }
    $result = Invoke-HeiGeContextCli -Context $context `
        -Arguments @("pause", "--port", [string]$Port) -CliProvider $CliProvider
    Assert-HeiGeModeResult -Result $result -Expected "paused"
    return [pscustomobject][ordered]@{
        Mode = "paused"
        PersistenceEnabled = if ($result.PSObject.Properties.Name -contains "persistenceEnabled") {
            [bool]$result.persistenceEnabled
        } else { $null }
        Completion = "complete"
    }
}

function Invoke-HeiGeResumeFlow {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [ValidateRange(1024, 65535)][int]$Port = 9341,
        [scriptblock]$ContextProvider,
        [scriptblock]$RequireCdpProvider,
        [scriptblock]$CliProvider
    )
    $context = Get-HeiGeFlowContext -Root $Root -ContextProvider $ContextProvider
    Require-HeiGeEntrypointCdp -Context $context -Port $Port -RequireCdpProvider $RequireCdpProvider
    $result = Invoke-HeiGeContextCli -Context $context `
        -Arguments @("resume", "--port", [string]$Port) -CliProvider $CliProvider
    Assert-HeiGeModeResult -Result $result -Expected "active"
    return [pscustomobject][ordered]@{
        Mode = "active"
        PersistenceEnabled = if ($result.PSObject.Properties.Name -contains "persistenceEnabled") {
            [bool]$result.persistenceEnabled
        } else { $null }
        Completion = "complete"
    }
}

function Invoke-HeiGeRestoreFlow {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [ValidateRange(1024, 65535)][int]$Port = 9341,
        [scriptblock]$ContextProvider,
        [scriptblock]$CdpStatusProvider,
        [scriptblock]$ProcessProvider,
        [scriptblock]$CliProvider,
        [scriptblock]$UnregisterProvider,
        [scriptblock]$RestartNativeProvider
    )
    $context = Get-HeiGeFlowContext -Root $Root -ContextProvider $ContextProvider
    $hasExactCdp = if ($CdpStatusProvider) {
        [bool](& $CdpStatusProvider $context $Port)
    } else {
        Test-Cdp -Port $Port -App $context.App
    }
    if (-not $hasExactCdp) {
        Get-HeiGeEntrypointProcessMode -Context $context `
            -ProcessProvider $ProcessProvider | Out-Null
    }
    $disabled = Invoke-HeiGeContextCli -Context $context `
        -Arguments @("set-persistence", "false", "--port", [string]$Port) -CliProvider $CliProvider
    Assert-HeiGePersistenceResult -Result $disabled -Expected $false
    $hasExactCdp = if ($CdpStatusProvider) {
        [bool](& $CdpStatusProvider $context $Port)
    } else {
        Test-Cdp -Port $Port -App $context.App
    }
    if ($hasExactCdp) {
        $paused = Invoke-HeiGeContextCli -Context $context `
            -Arguments @("pause", "--port", [string]$Port) -CliProvider $CliProvider
        Assert-HeiGeModeResult -Result $paused -Expected "paused"
    }
    Unregister-HeiGeEntrypointTask -Context $context -UnregisterProvider $UnregisterProvider | Out-Null
    $offlineMode = if ($hasExactCdp) {
        $null
    } else {
        Get-HeiGeEntrypointProcessMode -Context $context -ProcessProvider $ProcessProvider
    }
    if ($hasExactCdp) {
        if ($RestartNativeProvider) {
            & $RestartNativeProvider $context $Port | Out-Null
        } else {
            Restart-CodexWithoutCdp -AppInfo $context.App -Port $Port
        }
    }
    return [pscustomobject][ordered]@{
        Mode = if ($hasExactCdp) { "restoring" } else { $offlineMode }
        PersistenceEnabled = $false
        Completion = "complete"
    }
}
