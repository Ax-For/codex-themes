import { execFile } from "node:child_process";
import { access } from "node:fs/promises";
import { homedir } from "node:os";
import { posix, win32 } from "node:path";
import { promisify } from "node:util";

import {
  isolatedWindowsPowerShellEnvironment,
  trustedWindowsPowerShellPath,
} from "./windows-secure-fs.mjs";

const execFileAsync = promisify(execFile);

// Codex Desktop 各平台安装位点。Windows 覆盖 electron-builder 常见目录，
// doctor 逐个探测并报告命中的那一个。
export function codexAppCandidates({
  platform = process.platform,
  env = process.env,
  home = homedir(),
} = {}) {
  if (platform === "win32") {
    const localAppData = env.LOCALAPPDATA ?? win32.join(home, "AppData", "Local");
    const programFiles = env.ProgramFiles ?? "C:\\Program Files";
    return [
      win32.join(localAppData, "Programs", "ChatGPT", "ChatGPT.exe"),
      win32.join(localAppData, "Programs", "Codex", "Codex.exe"),
      win32.join(programFiles, "ChatGPT", "ChatGPT.exe"),
      win32.join(programFiles, "Codex", "Codex.exe"),
    ];
  }
  // 无管理员权限时 macOS 标准安装位是 ~/Applications，必须一并探测
  return ["/Applications/ChatGPT.app", posix.join(home, "Applications", "ChatGPT.app")];
}

export function bundledNodeCandidates(appPath, { platform = process.platform } = {}) {
  if (platform === "win32") {
    const appDir = win32.dirname(appPath);
    return [
      win32.join(appDir, "resources", "cua_node", "node.exe"),
      win32.join(appDir, "resources", "cua_node", "bin", "node.exe"),
    ];
  }
  return [
    posix.join(appPath, "Contents", "Resources", "cua_node", "bin", "node"),
    posix.join(appPath, "Contents", "Resources", "cua_node", "node"),
  ];
}

export function codexInstallation(appPath, { platform = process.platform } = {}) {
  const candidates = bundledNodeCandidates(appPath, { platform });
  if (platform === "win32") {
    return {
      appPath,
      executablePath: appPath,
      bundledNodePath: candidates[0],
      bundledNodeCandidates: candidates,
    };
  }
  return {
    appPath,
    executablePath: posix.join(appPath, "Contents", "MacOS", "ChatGPT"),
    bundledNodePath: candidates[0],
    bundledNodeCandidates: candidates,
  };
}

async function firstExisting(paths, exists) {
  for (const path of paths) {
    if (await exists(path)) return path;
  }
  return null;
}

export async function resolveCodexApp({
  platform = process.platform,
  env = process.env,
  home = homedir(),
  exists = (path) => access(path).then(() => true, () => false),
} = {}) {
  const explicit = env.HEIGE_CODEX_APP;
  if (explicit) {
    if (!(await exists(explicit))) {
      throw new Error(`HEIGE_CODEX_APP does not exist: ${explicit}`);
    }
    return {
      platform,
      ...codexInstallation(explicit, { platform }),
      source: "env",
    };
  }

  const candidates = codexAppCandidates({ platform, env, home });
  for (let index = 0; index < candidates.length; index += 1) {
    const appPath = candidates[index];
    if (await exists(appPath)) {
      const source = platform === "win32"
        ? (index < 2 ? "user" : "system")
        : (index === 0 ? "system" : "user");
      return {
        platform,
        ...codexInstallation(appPath, { platform }),
        source,
      };
    }
  }

  throw new Error(`Codex app was not found in: ${candidates.join(", ")}`);
}

function isValidProcessIdentity(identity) {
  return identity !== null &&
    typeof identity === "object" &&
    Number.isInteger(identity.pid) &&
    identity.pid > 0 &&
    typeof identity.executablePath === "string" &&
    identity.executablePath.length > 0 &&
    typeof identity.startedAt === "string" &&
    identity.startedAt.length > 0;
}

export function sameProcessIdentity(left, right) {
  return isValidProcessIdentity(left) &&
    isValidProcessIdentity(right) &&
    left.pid === right.pid &&
    left.executablePath === right.executablePath &&
    left.startedAt === right.startedAt;
}

export function parseMacPsTable(output) {
  const rows = [];
  for (const line of String(output).split(/\r?\n/)) {
    const match = line.match(/^\s*(\d+)\s+(\S+)\s+(\S+)\s+(\d{1,2})\s+(\d{2}:\d{2}:\d{2})\s+(\d{4})\s+(.*)$/);
    if (!match) continue;
    rows.push({
      pid: Number(match[1]),
      startedAt: `${match[2]} ${match[3]} ${match[4]} ${match[5]} ${match[6]}`,
      commandLine: match[7],
    });
  }
  return rows;
}

export function parseCodexProcessTable(output, app) {
  const executablePath = app.executablePath;
  return parseMacPsTable(output)
    .filter(({ commandLine }) => commandLine === executablePath || commandLine.startsWith(`${executablePath} `))
    .map(({ pid, startedAt, commandLine }) => {
      const portMatch = commandLine.match(/(?:^|\s)--remote-debugging-port(?:=|\s+)(\d+)(?=\s|$)/);
      return {
        pid,
        executablePath,
        startedAt,
        commandLine,
        hasCdp: /(?:^|\s)--remote-debugging-port(?:=|\s|$)/.test(commandLine),
        cdpPort: portMatch ? Number(portMatch[1]) : null,
      };
    });
}

export async function listCodexProcesses({ app, exec = execFileAsync } = {}) {
  const { stdout } = await exec("/bin/ps", ["-axo", "pid=,lstart=,command="]);
  return parseCodexProcessTable(stdout, app);
}

// 运行态诊断：版本号、进程是否带调试参数、端口是否开放。
// 报障时一份 JSON 说清「参数被接管丢弃 / 版本禁用端口 / 未运行」三类问题。
export async function runtimeDiagnostics({
  platform = process.platform,
  appPath = "/Applications/ChatGPT.app",
  port = 9341,
  exec = execFileAsync,
  env = process.env,
  fetchImpl = globalThis.fetch,
} = {}) {
  const result = {
    appVersion: null,
    processRunning: false,
    processHasDebugFlag: false,
    portOpen: false,
    portBrowser: null,
  };

  if (platform === "darwin") {
    try {
      const { stdout } = await exec("/usr/bin/defaults", [
        "read",
        posix.join(appPath, "Contents", "Info"),
        "CFBundleShortVersionString",
      ]);
      result.appVersion = stdout.trim() || null;
    } catch {}
    try {
      const { stdout } = await exec("/bin/ps", ["-axo", "command"]);
      const mainPrefix = posix.join(appPath, "Contents", "MacOS") + "/";
      const mains = stdout.split("\n").filter((line) => line.startsWith(mainPrefix));
      result.processRunning = mains.length > 0;
      result.processHasDebugFlag = mains.some((line) => line.includes("--remote-debugging-port"));
    } catch {}
  }

  if (platform === "win32") {
    try {
      const { stdout } = await exec(trustedWindowsPowerShellPath(env), [
        "-NoProfile",
        "-Command",
        "Get-CimInstance Win32_Process -Filter \"Name='ChatGPT.exe' or Name='Codex.exe'\" | Select-Object -ExpandProperty CommandLine",
      ], {
        env: isolatedWindowsPowerShellEnvironment(env),
      });
      const lines = stdout.split(/\r?\n/).filter((line) => line.trim());
      result.processRunning = lines.length > 0;
      result.processHasDebugFlag = lines.some((line) => line.includes("--remote-debugging-port"));
    } catch {}
  }

  try {
    const response = await fetchImpl(`http://127.0.0.1:${port}/json/version`, {
      signal: AbortSignal.timeout(1500),
    });
    if (response.ok) {
      result.portOpen = true;
      const version = await response.json().catch(() => null);
      result.portBrowser = version?.Browser ?? null;
    }
  } catch {}

  return result;
}

export function classifyInjection(diag) {
  if (diag.portOpen) return "ok：端口开放，可直接注入";
  if (diag.processRunning && diag.processHasDebugFlag) {
    return "flag-present-port-closed：进程已带调试参数但端口未开放，当前版本可能禁用了调试端口，请附本 JSON 开 Issue";
  }
  if (diag.processRunning) {
    return "running-no-flag：实例未带调试参数（可能被旧实例接管或参数被丢弃），请完全退出 Codex 后重跑 apply.command";
  }
  return "not-running：Codex 未在运行";
}

export async function discoverCodex({
  platform = process.platform,
  env = process.env,
  home = homedir(),
  exists = (path) => access(path).then(() => true, () => false),
} = {}) {
  const candidates = codexAppCandidates({ platform, env, home });
  const app = await firstExisting(candidates, exists);
  const nodeCandidates = app ? bundledNodeCandidates(app, { platform }) : [];
  const bundledNode = app ? await firstExisting(nodeCandidates, exists) : null;
  return {
    platform,
    app: app ?? candidates[0],
    appFound: app !== null,
    candidates,
    bundledNode: bundledNode ?? nodeCandidates[0] ?? null,
    bundledNodeFound: bundledNode !== null,
  };
}
