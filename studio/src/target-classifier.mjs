const EXACT_MAIN_URL = "app://-/index.html";

export function classifyCodexTarget(target) {
  let type;
  let value;
  try {
    type = target?.type;
    value = target?.url;
  } catch {
    return "unknown";
  }
  if (type !== "page" || typeof value !== "string") return "unknown";
  if (value === EXACT_MAIN_URL) return "main";
  if (value.includes("#")) return "unknown";

  let url;
  try { url = new URL(value); } catch { return "unknown"; }
  if (
    url.protocol !== "app:" ||
    url.hostname !== "-" ||
    url.pathname !== "/index.html" ||
    url.username ||
    url.password ||
    url.port ||
    url.hash ||
    !url.search
  ) {
    return "unknown";
  }
  const keys = [...url.searchParams.keys()];
  if (
    keys.length === 1 &&
    keys[0] === "initialRoute" &&
    url.searchParams.get("initialRoute") === "/avatar-overlay"
  ) {
    return "overlay";
  }
  return "unknown";
}

export function classifyCodexTargets(targets) {
  if (!Array.isArray(targets)) throw new TypeError("Codex targets 必须是数组");
  return targets.map((target) => ({
    ...target,
    kind: classifyCodexTarget(target),
  }));
}
