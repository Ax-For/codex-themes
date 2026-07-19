import { homedir } from "node:os";
import { posix, win32 } from "node:path";

export const PRODUCT_ID = "codex-themes";
export const PRODUCT_NAME = "Codex Themes";
export const STATE_SCHEMA_VERSION = 2;
export const THEME_SCHEMA_VERSION = 1;
export const DEFAULT_THEME_ID = "xp-qq";
export const NATIVE_THEME_ID = "__codex_themes_native__";
export const DEFAULT_CDP_PORT = 9341;
export const CODEX_RENDERER_ORIGIN = "app://-";
export const EXPECTED_BUNDLE_ID = "com.openai.codex";
export const EXPECTED_TEAM_ID = "2DC432GLL2";

// 只放行 CSS 认得的三/四/六/八位 hex，5/7 位在 CSS 里是无效色会静默失效
export const HEX_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

export function resolveStudioPaths({
  home = homedir(),
  platform = process.platform,
  env = process.env,
} = {}) {
  const path = platform === "win32" ? win32 : posix;
  const installRoot = path.join(home, ".codex", PRODUCT_ID);
  const stateRoot =
    platform === "win32"
      ? path.join(env.APPDATA ?? path.join(home, "AppData", "Roaming"), "CodexThemes")
      : path.join(home, "Library", "Application Support", "CodexThemes");

  return {
    installRoot,
    stateRoot,
    statePath: path.join(stateRoot, "state.json"),
    sessionPath: path.join(stateRoot, "session.json"),
    transitionPath: path.join(stateRoot, "transition.json"),
    lockPath: path.join(stateRoot, "operation.lock"),
    logPath: path.join(stateRoot, "injector.log"),
    userThemesRoot: path.join(stateRoot, "themes"),
  };
}
