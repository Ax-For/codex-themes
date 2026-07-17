import { execFile as execFileCallback } from "node:child_process";
import { promisify } from "node:util";

import {
  isolatedWindowsPowerShellEnvironment,
  trustedWindowsPowerShellPath,
} from "./windows-secure-fs.mjs";

const execFile = promisify(execFileCallback);

function validPid(pid) {
  return Number.isSafeInteger(pid) && pid > 0;
}

export async function readProcessIdentity(pid, {
  platform = process.platform,
  env = process.env,
  execFileImpl = execFile,
} = {}) {
  if (!validPid(pid)) throw new TypeError("process identity pid must be positive");
  if (platform === "win32") {
    const script = [
      "$ErrorActionPreference='Stop'",
      `$p=Get-Process -Id ${pid} -ErrorAction Stop`,
      "$o=[ordered]@{pid=[int]$p.Id;startedAt=$p.StartTime.ToUniversalTime().ToString('o')}",
      "[Console]::Out.Write(($o|ConvertTo-Json -Compress))",
    ].join(";");
    try {
      const { stdout } = await execFileImpl(trustedWindowsPowerShellPath(env), [
        "-NoLogo", "-NoProfile", "-NonInteractive", "-Command", script,
      ], {
        env: isolatedWindowsPowerShellEnvironment(env),
        timeout: 5_000,
        maxBuffer: 16 * 1024,
      });
      const value = JSON.parse(stdout);
      return value?.pid === pid && typeof value.startedAt === "string" && value.startedAt.length > 0
        ? { pid, startedAt: value.startedAt }
        : null;
    } catch (error) {
      if (error?.code === 1 || /Cannot find a process/i.test(String(error?.stderr ?? ""))) return null;
      throw error;
    }
  }
  try {
    const { stdout } = await execFileImpl("/bin/ps", ["-p", String(pid), "-o", "pid=,lstart="], {
      timeout: 5_000,
      maxBuffer: 16 * 1024,
    });
    const match = /^\s*(\d+)\s+(.+?)\s*$/.exec(stdout);
    return match !== null && Number(match[1]) === pid
      ? { pid, startedAt: match[2] }
      : null;
  } catch (error) {
    if (error?.code === 1) return null;
    throw error;
  }
}

export function sameProcessIdentity(left, right) {
  return left?.pid === right?.pid && left?.startedAt === right?.startedAt;
}
