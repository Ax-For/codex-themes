import test from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import {
  NATIVE_THEME_ID,
  PRODUCT_ID,
  PRODUCT_NAME,
  resolveStudioPaths,
} from "../src/constants.mjs";
import {
  CONTROLLER_LAUNCH_AGENT_LABEL,
} from "../src/macos-launch-agent.mjs";
import {
  MACOS_LAUNCHER_BUNDLE_ID,
  MACOS_LAUNCHER_NAME,
} from "../src/macos-launcher.mjs";

const studioRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = join(studioRoot, "..");
const ignoredDirectories = new Set([
  ".codegraph",
  ".git",
  "artifacts",
  "coverage",
  "dist",
  "node_modules",
  "test-results",
]);
const retiredBrand = String.fromCharCode(104, 101, 105, 103, 101);

async function collectTextFiles(directory, files = []) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const absolutePath = join(directory, entry.name);
    if (entry.isDirectory()) {
      await collectTextFiles(absolutePath, files);
      continue;
    }
    const contents = await readFile(absolutePath);
    if (contents.indexOf(0) === -1) files.push({ absolutePath, contents: contents.toString("utf8") });
  }
  return files;
}

test("product identity uses the repository name on macOS and Windows", () => {
  assert.equal(PRODUCT_ID, "codex-themes");
  assert.equal(PRODUCT_NAME, "Codex Themes");
  assert.equal(NATIVE_THEME_ID, "__codex_themes_native__");
  assert.equal(CONTROLLER_LAUNCH_AGENT_LABEL, "com.codex-themes.skin-controller");
  assert.equal(MACOS_LAUNCHER_BUNDLE_ID, "com.codex-themes.skin-launcher");
  assert.equal(MACOS_LAUNCHER_NAME, "Codex 主题启动器");

  const mac = resolveStudioPaths({ home: "/Users/tester", platform: "darwin", env: {} });
  assert.equal(mac.installRoot, "/Users/tester/.codex/codex-themes");
  assert.equal(mac.stateRoot, "/Users/tester/Library/Application Support/CodexThemes");

  const windows = resolveStudioPaths({
    home: "C:\\Users\\tester",
    platform: "win32",
    env: { APPDATA: "C:\\Users\\tester\\AppData\\Roaming" },
  });
  assert.equal(windows.installRoot, "C:\\Users\\tester\\.codex\\codex-themes");
  assert.equal(windows.stateRoot, "C:\\Users\\tester\\AppData\\Roaming\\CodexThemes");
  assert.equal(windows.statePath, "C:\\Users\\tester\\AppData\\Roaming\\CodexThemes\\state.json");
});

test("repository text and paths contain no retired product branding", async () => {
  const matches = [];
  for (const { absolutePath, contents } of await collectTextFiles(repositoryRoot)) {
    const repositoryPath = relative(repositoryRoot, absolutePath);
    if (repositoryPath.toLowerCase().includes(retiredBrand)) matches.push(repositoryPath);
    if (contents.toLowerCase().includes(retiredBrand)) matches.push(repositoryPath);
  }
  assert.deepEqual([...new Set(matches)].sort(), []);
});

test("continuous integration verifies both desktop installer platforms", async () => {
  const workflow = await readFile(join(repositoryRoot, ".github", "workflows", "ci.yml"), "utf8");
  assert.match(workflow, /macos-latest/);
  assert.match(workflow, /windows-latest/);
  assert.match(workflow, /zsh -n/);
  assert.match(workflow, /\[scriptblock\]::Create/);
  assert.match(workflow, /npm run check/);
});

test("macOS background inspection distinguishes a loaded job from a running controller", async () => {
  const source = await readFile(join(studioRoot, "src", "macos-launch-agent.mjs"), "utf8");
  assert.match(source, /const job = await inspectLoadedJob\(options, options\.label\)/);
  assert.match(source, /running: job\.loaded && job\.pid !== null/);
});
