import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { DEFAULT_THEME_ID, NATIVE_THEME_ID } from "../src/constants.mjs";
import { buildSkinMenuScript } from "../src/skin-menu.mjs";

const studioRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const execFileAsync = promisify(execFile);

test("public package exposes XP QQ and native only", async () => {
  assert.equal(DEFAULT_THEME_ID, "xp-qq");
  assert.equal(NATIVE_THEME_ID, "__heige_native__");

  const packageDocument = JSON.parse(await readFile(join(studioRoot, "package.json"), "utf8"));
  assert.equal(packageDocument.name, "heige-codex-skin-studio");

  const bundled = (await readdir(join(studioRoot, "themes"), { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  assert.deepEqual(bundled, ["xp-qq"]);

  const cliSource = await readFile(join(studioRoot, "src", "cli.mjs"), "utf8");
  assert.match(
    cliSource,
    /activeId: themeId === NATIVE_THEME_ID \? null : effectiveThemeId/,
  );
});

test("injected menu has one skin option plus native and no custom upload", async () => {
  const css = await readFile(join(studioRoot, "src", "skin-css.mjs"), "utf8");
  assert.match(css, /data-heige-codex-skin="xp-qq"/);

  const script = buildSkinMenuScript({
    entries: [{ id: "xp-qq", name: "Windows XP · QQ", accent: "#2879bd", css: ":root{}" }],
    activeId: "xp-qq",
    styleId: "skin-style",
    menuId: "skin-menu",
  });
  assert.match(script, /Windows XP · QQ/);
  assert.match(script, /原生界面/);
  assert.doesNotMatch(script, /custom-upload/);
  assert.doesNotMatch(script, /自定义图片/);
});

test("injected menu applies theme immediately through one queued controller request", () => {
  const script = buildSkinMenuScript({
    entries: [{ id: "xp-qq", name: "Windows XP · QQ", accent: "#2879bd", css: ":root{}" }],
    activeId: "xp-qq",
    styleId: "skin-style",
    menuId: "skin-menu",
  });

  assert.match(script, /width:30px;height:30px/);
  assert.match(script, /position:absolute;top:100%;left:50%;transform:translateX\(-50%\)/);
  assert.match(script, /listen\(document, "keydown"/);
  const queuedRequest = script.indexOf("queued = queueControlRequest(fallbackRequest");
  const optimisticApply = script.indexOf("applyThemeSelection(themeId);");
  const optimisticClose = script.indexOf("setPanelOpen(false, { focusTrigger: true });", optimisticApply);
  assert.ok(
    queuedRequest !== -1 && queuedRequest < optimisticApply && optimisticApply < optimisticClose,
    "the request must be durable before the selected theme and closed menu become visible",
  );
  assert.match(script, /onTimeout: rollbackThemeSelection/);
  assert.doesNotMatch(script, /fetch\(themeEndpoint/);
});

test("XP QQ mode proxy aligns the native popover anchor before opening it", () => {
  const script = buildSkinMenuScript({
    entries: [{ id: "xp-qq", name: "Windows XP · QQ", accent: "#2879bd", css: ":root{}" }],
    activeId: "xp-qq",
    styleId: "skin-style",
    menuId: "skin-menu",
  });

  assert.match(script, /const alignNativeModeAnchor = \(target\) =>/);
  assert.match(script, /const proxyRect = modeSwitchProxy\.getBoundingClientRect\(\);/);
  const align = script.indexOf("alignNativeModeAnchor(target);");
  const dispatch = script.indexOf('target.dispatchEvent(new PointerEvent("pointerdown"', align);
  assert.ok(align !== -1 && dispatch > align, "native anchor must be aligned before Radix measures it");
  assert.match(script, /target\.style\.setProperty\("position", "fixed", "important"\)/);
  assert.match(script, /const positionedRect = target\.getBoundingClientRect\(\);/);
  assert.match(script, /proxyRect\.top - positionedRect\.top/);
});

test("public CLI does not expose theme creation or unrelated installers", async () => {
  const { stdout } = await execFileAsync(process.execPath, ["src/cli.mjs", "help"], {
    cwd: studioRoot,
    encoding: "utf8",
  });
  const help = JSON.parse(stdout);
  assert.ok(help.commands.includes("list"));
  assert.ok(help.commands.includes("apply [--theme ID] [--port 9341]"));
  assert.ok(!help.commands.some((command) => /create|customize|install-pet/.test(command)));

  const windowsEntries = await readdir(join(studioRoot, "scripts", "windows"));
  assert.ok(!windowsEntries.some((name) => name.startsWith("customize.")));
});

test("public user-facing copy does not reference the legacy HeiGe launcher", async () => {
  const script = buildSkinMenuScript({
    entries: [{ id: "xp-qq", name: "Windows XP · QQ", accent: "#2879bd", css: ":root{}" }],
    activeId: "xp-qq",
    styleId: "skin-style",
    menuId: "skin-menu",
  });
  assert.doesNotMatch(script, /button\.title = "HeiGe Codex Skin Studio"/);
  assert.doesNotMatch(script, /helper\.textContent = "[^"]*HeiGe/);
  assert.doesNotMatch(script, /常驻已关闭[^"\n]*HeiGe/);

  for (const relativePath of [
    "scripts/disable-persist.command",
    "scripts/enable-persist.command",
    "scripts/windows/restore.ps1",
  ]) {
    const copy = await readFile(join(studioRoot, relativePath), "utf8");
    assert.doesNotMatch(copy, /HeiGe 皮肤启动器|启用 HeiGe 皮肤/);
  }
});
