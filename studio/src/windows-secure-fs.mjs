import { execFile as execFileCallback } from "node:child_process";
import { win32 } from "node:path";
import { promisify } from "node:util";

const execFile = promisify(execFileCallback);

const ACL_SCRIPT = String.raw`& {
param([string]$Action, [string]$TargetPath)
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
$InformationPreference = 'SilentlyContinue'
$WarningPreference = 'SilentlyContinue'
Import-Module -Name (Join-Path $PSHOME 'Modules\Microsoft.PowerShell.Security\Microsoft.PowerShell.Security.psd1') -ErrorAction Stop
$isDirectory = $Action.EndsWith('-directory', [System.StringComparison]::Ordinal)
$protect = $Action.StartsWith('protect-', [System.StringComparison]::Ordinal) -or $Action.StartsWith('migrate-', [System.StringComparison]::Ordinal)
$migrate = $Action.StartsWith('migrate-', [System.StringComparison]::Ordinal)
$item = Get-Item -LiteralPath $TargetPath -Force -ErrorAction Stop
if (($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) {
  throw 'private path is a reparse point'
}
if ($isDirectory -ne [bool]$item.PSIsContainer) {
  throw 'private path type mismatch'
}
$currentSid = [System.Security.Principal.WindowsIdentity]::GetCurrent().User
if ($migrate) {
  $beforeAcl = Microsoft.PowerShell.Security\Get-Acl -LiteralPath $TargetPath -ErrorAction Stop
  try {
    $beforeOwnerSid = ([System.Security.Principal.NTAccount]$beforeAcl.Owner).Translate([System.Security.Principal.SecurityIdentifier])
  } catch {
    $beforeOwnerSid = New-Object System.Security.Principal.SecurityIdentifier -ArgumentList ([string]$beforeAcl.Owner)
  }
  if ($beforeOwnerSid.Value -cne $currentSid.Value) {
    throw 'legacy private path is not owned by the current user'
  }
  $trustedWriterSids = @(
    $currentSid.Value,
    'S-1-5-18',
    'S-1-5-32-544'
  )
  $writeMask = [int64](
    [System.Security.AccessControl.FileSystemRights]::WriteData -bor
    [System.Security.AccessControl.FileSystemRights]::CreateFiles -bor
    [System.Security.AccessControl.FileSystemRights]::AppendData -bor
    [System.Security.AccessControl.FileSystemRights]::CreateDirectories -bor
    [System.Security.AccessControl.FileSystemRights]::WriteExtendedAttributes -bor
    [System.Security.AccessControl.FileSystemRights]::WriteAttributes -bor
    [System.Security.AccessControl.FileSystemRights]::DeleteSubdirectoriesAndFiles -bor
    [System.Security.AccessControl.FileSystemRights]::Delete -bor
    [System.Security.AccessControl.FileSystemRights]::ChangePermissions -bor
    [System.Security.AccessControl.FileSystemRights]::TakeOwnership -bor
    [System.Security.AccessControl.FileSystemRights]::Modify -bor
    [System.Security.AccessControl.FileSystemRights]::FullControl
  )
  $beforeRules = @($beforeAcl.GetAccessRules($true, $true, [System.Security.Principal.SecurityIdentifier]))
  foreach ($beforeRule in $beforeRules) {
    $isUntrustedWriter = $beforeRule.AccessControlType -eq [System.Security.AccessControl.AccessControlType]::Allow -and
      $trustedWriterSids -cnotcontains $beforeRule.IdentityReference.Value -and
      (([int64]$beforeRule.FileSystemRights -band $writeMask) -ne 0)
    if ($isUntrustedWriter) {
      throw 'legacy private path grants write access to an untrusted identity'
    }
  }
}
if ($protect) {
  $acl = if ($isDirectory) {
    New-Object System.Security.AccessControl.DirectorySecurity
  } else {
    New-Object System.Security.AccessControl.FileSecurity
  }
  $acl.SetAccessRuleProtection($true, $false)
  $acl.SetOwner($currentSid)
  $rights = [System.Security.AccessControl.FileSystemRights]::FullControl
  $allow = [System.Security.AccessControl.AccessControlType]::Allow
  if ($isDirectory) {
    $inheritance = [System.Security.AccessControl.InheritanceFlags]::ContainerInherit -bor [System.Security.AccessControl.InheritanceFlags]::ObjectInherit
    $rule = New-Object System.Security.AccessControl.FileSystemAccessRule -ArgumentList @(
      $currentSid, $rights, $inheritance, [System.Security.AccessControl.PropagationFlags]::None, $allow
    )
  } else {
    $rule = New-Object System.Security.AccessControl.FileSystemAccessRule -ArgumentList @($currentSid, $rights, $allow)
  }
  $acl.AddAccessRule($rule) | Out-Null
  Microsoft.PowerShell.Security\Set-Acl -LiteralPath $TargetPath -AclObject $acl -ErrorAction Stop
}
$observed = Microsoft.PowerShell.Security\Get-Acl -LiteralPath $TargetPath -ErrorAction Stop
try {
  $ownerSid = ([System.Security.Principal.NTAccount]$observed.Owner).Translate([System.Security.Principal.SecurityIdentifier])
} catch {
  $ownerSid = New-Object System.Security.Principal.SecurityIdentifier -ArgumentList ([string]$observed.Owner)
}
$rules = @($observed.GetAccessRules($true, $false, [System.Security.Principal.SecurityIdentifier]))
$private = $observed.AreAccessRulesProtected -and $ownerSid.Value -ceq $currentSid.Value -and $rules.Count -eq 1
if ($private) {
  $rule = $rules[0]
  $private = $rule.IdentityReference.Value -ceq $currentSid.Value -and
    $rule.AccessControlType -eq [System.Security.AccessControl.AccessControlType]::Allow -and
    (($rule.FileSystemRights -band [System.Security.AccessControl.FileSystemRights]::FullControl) -eq [System.Security.AccessControl.FileSystemRights]::FullControl)
  if ($isDirectory) {
    $requiredInheritance = [System.Security.AccessControl.InheritanceFlags]::ContainerInherit -bor [System.Security.AccessControl.InheritanceFlags]::ObjectInherit
    $private = $private -and $rule.InheritanceFlags -eq $requiredInheritance -and $rule.PropagationFlags -eq [System.Security.AccessControl.PropagationFlags]::None
  } else {
    $private = $private -and $rule.InheritanceFlags -eq [System.Security.AccessControl.InheritanceFlags]::None
  }
}
if (-not $private) { throw 'private path ACL is not exact current-user only' }
$result = [pscustomobject][ordered]@{
  schemaVersion = 1
  action = $Action
  path = $TargetPath
  ownerSid = $ownerSid.Value
  private = $true
}
[Console]::Out.Write((ConvertTo-Json -InputObject $result -Compress))
}`;

function canonicalWindowsPath(value, label) {
  if (
    typeof value !== "string" ||
    !win32.isAbsolute(value) ||
    win32.normalize(value) !== value ||
    value.includes("\0") ||
    /[\r\n]/.test(value)
  ) {
    throw new Error(`${label} must be a canonical absolute Windows path`);
  }
  return value;
}

export function trustedWindowsPowerShellPath(env = process.env) {
  const systemRoot = env.SystemRoot;
  canonicalWindowsPath(systemRoot, "Windows SystemRoot");
  return win32.join(systemRoot, "System32", "WindowsPowerShell", "v1.0", "powershell.exe");
}

export function isolatedWindowsPowerShellEnvironment(env = process.env) {
  if (env === null || typeof env !== "object" || Array.isArray(env)) {
    throw new TypeError("Windows PowerShell environment must be an object");
  }
  return Object.freeze(Object.fromEntries(
    Object.entries(env).filter(([key]) => key.toLowerCase() !== "psmodulepath"),
  ));
}

function exactAclResult(value, { action, path }) {
  const expectedKeys = ["action", "ownerSid", "path", "private", "schemaVersion"];
  const mismatches = [];
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    mismatches.push("document");
  } else {
    if (Object.keys(value).sort().join("\0") !== expectedKeys.sort().join("\0")) mismatches.push("keys");
    if (value.schemaVersion !== 1) mismatches.push("schemaVersion");
    if (value.action !== action) mismatches.push("action");
    if (value.private !== true) mismatches.push("private");
    if (typeof value.ownerSid !== "string" || !/^S-1-(?:\d+-)+\d+$/.test(value.ownerSid)) {
      mismatches.push("ownerSid");
    }
    if (typeof value.path !== "string" || value.path.toLowerCase() !== path.toLowerCase()) {
      mismatches.push("path");
    }
  }
  if (mismatches.length > 0) {
    throw new Error(`Windows private ACL verifier returned an invalid result: ${mismatches.join(",")}`);
  }
  return value;
}

export function createWindowsSecurityAdapter({
  execFileImpl = execFile,
  env = process.env,
  powershellPath = trustedWindowsPowerShellPath(env),
} = {}) {
  canonicalWindowsPath(powershellPath, "trusted Windows PowerShell path");
  const childEnv = isolatedWindowsPowerShellEnvironment(env);
  const run = async (action, path) => {
    canonicalWindowsPath(path, "Windows private path");
    const { stdout, stderr = "" } = await execFileImpl(powershellPath, [
      "-NoLogo",
      "-NoProfile",
      "-NonInteractive",
      "-Command",
      ACL_SCRIPT,
      action,
      path,
    ], {
      env: childEnv,
      timeout: 15_000,
      maxBuffer: 256 * 1024,
      windowsHide: true,
    });
    if (String(stderr).trim().length !== 0) {
      throw new Error("Windows private ACL verifier wrote unexpected stderr");
    }
    let value;
    try {
      value = JSON.parse(String(stdout));
    } catch (cause) {
      throw new Error("Windows private ACL verifier stdout is not one JSON document", { cause });
    }
    return exactAclResult(value, { action, path });
  };
  return Object.freeze({
    protectDirectory: (path) => run("protect-directory", path),
    protectFile: (path) => run("protect-file", path),
    migrateDirectory: (path) => run("migrate-directory", path),
    migrateFile: (path) => run("migrate-file", path),
    verifyDirectory: (path) => run("verify-directory", path),
    verifyFile: (path) => run("verify-file", path),
  });
}

let defaultAdapter;

export function windowsSecurityAdapter() {
  defaultAdapter ??= createWindowsSecurityAdapter();
  return defaultAdapter;
}

export const windowsAclPowerShellScript = ACL_SCRIPT;
