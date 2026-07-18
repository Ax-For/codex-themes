import { HEX_COLOR } from "./constants.mjs";
import { RESOURCE_LIMITS } from "./resource-limits.mjs";

const DEFAULT_ACCENT = "#24c9d7";
const CONTROL_ENDPOINT = /^http:\/\/127\.0\.0\.1:([1-9][0-9]{0,4})\/v1\/persistence$/;
const CONTROL_TOKEN = /^[A-Za-z0-9_-]{43}$/;

export const XP_QQ_AVATAR_RULES = Object.freeze({
  storageKey: "heigeCodexXpQqAvatarV1",
  maxInputBytes: 8 * 1024 * 1024,
  maxStoredChars: 256_000,
  outputSide: 128,
  mimeByExtension: Object.freeze({
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
  }),
});

export const XP_QQ_PROFILE_RULES = Object.freeze({
  storageKey: "heigeCodexXpQqProfileV1",
  nicknameMax: 24,
  signatureMax: 48,
  levelMin: 1,
  levelMax: 5,
  defaults: Object.freeze({
    nickname: "For Ax",
    signature: "在线 · 正在处理任务",
    level: 3,
  }),
});

export function normalizeXpQqProfile(value, rules = XP_QQ_PROFILE_RULES) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return null;
  const keys = Object.keys(value).sort();
  if (keys.length !== 3 || keys[0] !== "level" || keys[1] !== "nickname" || keys[2] !== "signature") {
    return null;
  }
  if (
    typeof value.nickname !== "string"
    || typeof value.signature !== "string"
    || !Number.isInteger(value.level)
  ) return null;
  const clean = (text) => text.replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim();
  const nickname = clean(value.nickname);
  const signature = clean(value.signature);
  if (
    nickname.length < 1
    || [...nickname].length > rules.nicknameMax
    || [...signature].length > rules.signatureMax
    || value.level < rules.levelMin
    || value.level > rules.levelMax
  ) return null;
  return { nickname, signature, level: value.level };
}

export function deriveXpQqContactIdentity(title, threadId = "") {
  const normalized = typeof title === "string"
    ? title.replace(/[\u0000-\u001f\u007f]+/g, " ").trim()
    : "";
  const symbol = [...normalized].find((character) => /[\p{L}\p{N}]/u.test(character)) ?? "C";
  const initial = [...symbol.toLocaleUpperCase("en-US")][0] ?? "C";
  let hash = 2166136261;
  for (const character of String(threadId) + "|" + normalized) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return { initial, tone: hash % 6 };
}

export function xpQqContactStatus(state) {
  if (state === "running") return "正在处理";
  if (state === "active") return "当前会话";
  if (state === "pinned") return "已置顶";
  return "本地会话";
}

export function validateXpQqAvatarFileMeta(file, rules) {
  if (!file || typeof file.name !== "string" || typeof file.type !== "string") {
    return "请选择有效的本地图片";
  }
  if (!Number.isSafeInteger(file.size) || file.size < 1) return "图片文件大小无效";
  if (file.size > rules.maxInputBytes) return "头像图片不能超过 8 MiB";
  const extension = file.name.toLowerCase().match(/\.[a-z0-9]+$/)?.[0] ?? "";
  const expectedMime = rules.mimeByExtension[extension];
  if (!expectedMime || !["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
    return "头像仅支持 PNG、JPEG 或 WebP";
  }
  if (expectedMime !== file.type) return "图片扩展名与文件类型不一致";
  return null;
}

export function computeXpQqAvatarCrop(width, height) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width < 1 || height < 1) {
    throw new Error("图片尺寸无效");
  }
  const size = Math.min(width, height);
  return {
    sx: Math.floor((width - size) / 2),
    sy: Math.floor((height - size) / 2),
    size,
  };
}

export function isSafeXpQqAvatarDataUrl(value, rules) {
  return typeof value === "string"
    && value.length > 24
    && value.length < rules.maxStoredChars
    && /^data:image\/(?:png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(value);
}

function normalizeControl(control) {
  if (control === undefined || control === null) return null;
  if (typeof control !== "object" || Array.isArray(control)) {
    throw new Error("菜单控制描述必须是对象");
  }
  const keys = Object.keys(control).sort();
  const expectedKeys = [
    "available",
    "endpoint",
    "launcherName",
    "persistenceEnabled",
    "revision",
    "token",
  ];
  if (keys.length !== expectedKeys.length || keys.some((key, index) => key !== expectedKeys[index])) {
    throw new Error("菜单控制描述字段无效");
  }
  const endpointMatch = typeof control.endpoint === "string"
    ? CONTROL_ENDPOINT.exec(control.endpoint)
    : null;
  const port = endpointMatch === null ? 0 : Number(endpointMatch[1]);
  if (
    control.available !== true ||
    typeof control.persistenceEnabled !== "boolean" ||
    !Number.isSafeInteger(control.revision) ||
    control.revision < 0 ||
    endpointMatch === null ||
    port > 65_535 ||
    !CONTROL_TOKEN.test(control.token ?? "") ||
    Buffer.from(control.token, "base64url").length !== 32 ||
    Buffer.from(control.token, "base64url").toString("base64url") !== control.token ||
    control.launcherName !== "HeiGe 皮肤启动器"
  ) {
    throw new Error("菜单控制描述无效");
  }
  return {
    available: true,
    persistenceEnabled: control.persistenceEnabled,
    revision: control.revision,
    endpoint: control.endpoint,
    token: control.token,
    launcherName: control.launcherName,
  };
}

export function buildSkinMenuScript({
  entries,
  activeId,
  styleId,
  menuId,
  control = null,
}) {
  if (!Array.isArray(entries) || entries.length === 0) {
    throw new Error("皮肤菜单至少需要一个主题");
  }
  const themes = entries.map((entry) => {
    if (!entry?.id || typeof entry.css !== "string") throw new Error("主题条目缺少 id 或 css");
    return {
      id: String(entry.id),
      name: typeof entry.name === "string" && entry.name.trim() ? entry.name : String(entry.id),
      accent: HEX_COLOR.test(entry.accent ?? "") ? entry.accent : DEFAULT_ACCENT,
      css: entry.css,
    };
  });
  if (activeId !== null && !themes.some((theme) => theme.id === activeId)) {
    throw new Error(`当前主题不在菜单列表中：${activeId}`);
  }
  const payload = JSON.stringify({
    styleId,
    menuId,
    activeId,
    themes,
    hiddenKey: "heigeCodexSkinMenuHidden",
    selectedKey: "heigeCodexSkinSelected",
    nativeSel: "__heige_native__",
    control: normalizeControl(control),
    limits: RESOURCE_LIMITS,
    avatar: {
      ...XP_QQ_AVATAR_RULES,
      buttonId: "heige-xp-qq-avatar-editor",
      inputId: "heige-xp-qq-avatar-input",
      noticeId: "heige-xp-qq-avatar-notice",
    },
    profile: {
      ...XP_QQ_PROFILE_RULES,
      cardId: "heige-xp-qq-profile",
      editorId: "heige-xp-qq-profile-editor",
      panelId: "heige-xp-qq-profile-panel",
    },
    fileTitleId: "heige-xp-qq-file-title",
    sidebarActionsId: "heige-xp-qq-sidebar-actions",
  });

  return `(() => {
  try { window.__heigeCodexSkinRuntime?.dispose?.(); } catch {}
  const data = ${payload};
  const validateXpQqAvatarFileMeta = (${validateXpQqAvatarFileMeta.toString()});
  const computeXpQqAvatarCrop = (${computeXpQqAvatarCrop.toString()});
  const isSafeXpQqAvatarDataUrl = (${isSafeXpQqAvatarDataUrl.toString()});
  const normalizeXpQqProfile = (${normalizeXpQqProfile.toString()});
  const deriveXpQqContactIdentity = (${deriveXpQqContactIdentity.toString()});
  const xpQqContactStatus = (${xpQqContactStatus.toString()});

  const runtimeAbortController = new AbortController();
  const signal = runtimeAbortController.signal;
  const generationBytes = new Uint8Array(16);
  if (!globalThis.crypto?.getRandomValues) throw new Error("HeiGe menu requires crypto.getRandomValues");
  globalThis.crypto.getRandomValues(generationBytes);
  const generation = [...generationBytes].map((value) => value.toString(16).padStart(2, "0")).join("");
  const trackedListeners = [];
  const trackedTimers = new Set();
  const trackedReaders = new Set();
  const trackedImages = new Map();
  const trackedControllers = new Set();
  const trackedObservers = new Set();
  const trackedDiffShadowStyles = new Set();
  const rawChannel = typeof BroadcastChannel === "function"
    ? new BroadcastChannel("heige-codex-skin-v2")
    : null;
  const channel = {
    closed: false,
    postMessage(value) {
      if (this.closed) throw new DOMException("HeiGe menu generation disposed", "InvalidStateError");
      rawChannel?.postMessage(value);
    },
    close() {
      if (this.closed) return;
      this.closed = true;
      try { rawChannel?.close(); } catch {}
    },
  };
  const listen = (target, type, listener, options) => {
    target.addEventListener(type, listener, options);
    trackedListeners.push([target, type, listener, options]);
    return listener;
  };
  const later = (callback, milliseconds) => {
    const id = setTimeout(() => {
      trackedTimers.delete(id);
      if (!signal.aborted) callback();
    }, milliseconds);
    trackedTimers.add(id);
    return id;
  };
  const clearLater = (id) => {
    clearTimeout(id);
    trackedTimers.delete(id);
  };
  const childController = () => {
    const controller = new AbortController();
    trackedControllers.add(controller);
    if (signal.aborted) controller.abort();
    return controller;
  };
  let statusSnapshot = () => ({
    generation,
    themeId: null,
    menu: false,
    mode: "native",
    persistenceEnabled: data.control?.persistenceEnabled ?? false,
    revision: data.control?.revision ?? 0,
  });
  let clearXpQqWelcomeRoles = () => {};
  let clearXpQqUserNames = () => {};
  let clearXpQqContacts = () => {};
  let restoreXpQqSidebarActions = () => {};
  let disposed = false;
  let runtime;
  const dispose = () => {
    if (disposed) return false;
    disposed = true;
    runtimeAbortController.abort();
    for (const controller of trackedControllers) { try { controller.abort(); } catch {} }
    trackedControllers.clear();
    for (const [target, type, listener, options] of trackedListeners.splice(0)) {
      try { target.removeEventListener(type, listener, options); } catch {}
    }
    for (const id of trackedTimers) clearTimeout(id);
    trackedTimers.clear();
    for (const reader of trackedReaders) {
      try { reader.onload = null; reader.onerror = null; reader.onabort = null; reader.abort?.(); } catch {}
    }
    trackedReaders.clear();
    for (const [image, reject] of trackedImages) {
      try { image.onload = null; image.onerror = null; image.src = ""; } catch {}
      try { reject(new DOMException("HeiGe menu generation disposed", "AbortError")); } catch {}
    }
    trackedImages.clear();
    for (const observer of trackedObservers) {
      try { observer.disconnect(); } catch {}
    }
    trackedObservers.clear();
    for (const shadowStyle of trackedDiffShadowStyles) {
      try { shadowStyle.remove(); } catch {}
    }
    trackedDiffShadowStyles.clear();
    clearXpQqWelcomeRoles();
    clearXpQqUserNames();
    clearXpQqContacts();
    restoreXpQqSidebarActions();
    channel.close();
    const ownedMenu = document.getElementById(data.menuId);
    const ownedStyle = document.getElementById(data.styleId);
    const ownedAvatarButton = document.getElementById(data.avatar.buttonId);
    const ownedAvatarInput = document.getElementById(data.avatar.inputId);
    const ownedAvatarNotice = document.getElementById(data.avatar.noticeId);
    const ownedProfile = document.getElementById(data.profile.cardId);
    const ownedProfilePanel = document.getElementById(data.profile.panelId);
    const ownedFileTitle = document.getElementById(data.fileTitleId);
    const ownedModeSwitch = document.querySelector('[data-heige-role="xp-qq-mode-switch"]');
    if (ownedMenu?.dataset.heigeGeneration === generation) ownedMenu.remove();
    if (ownedStyle?.dataset.heigeGeneration === generation) ownedStyle.remove();
    if (ownedAvatarButton?.dataset.heigeGeneration === generation) ownedAvatarButton.remove();
    if (ownedAvatarInput?.dataset.heigeGeneration === generation) ownedAvatarInput.remove();
    if (ownedAvatarNotice?.dataset.heigeGeneration === generation) ownedAvatarNotice.remove();
    if (ownedProfile?.dataset.heigeGeneration === generation) ownedProfile.remove();
    if (ownedProfilePanel?.dataset.heigeGeneration === generation) ownedProfilePanel.remove();
    if (ownedFileTitle?.dataset.heigeGeneration === generation) ownedFileTitle.remove();
    if (ownedModeSwitch) {
      const home = ownedModeSwitch.__heigeXpQqModeHome;
      const next = ownedModeSwitch.__heigeXpQqModeNext;
      delete ownedModeSwitch.dataset.heigeRole;
      if (home?.isConnected) {
        if (next?.parentElement === home) home.insertBefore(ownedModeSwitch, next);
        else home.appendChild(ownedModeSwitch);
      }
    }
    document.documentElement.style.removeProperty("--heige-xp-qq-avatar-image");
    delete document.documentElement.dataset.heigeXpQqAvatar;
    if (window.__heigeCodexSkinRuntime === runtime) {
      delete document.documentElement.dataset.heigeCodexSkin;
      try { delete window.__heigeCodexSkin; } catch { window.__heigeCodexSkin = undefined; }
      try { delete window.__heigeCodexSkinRuntime; } catch { window.__heigeCodexSkinRuntime = undefined; }
    }
    return true;
  };
  runtime = { generation, signal, channel, dispose, status: () => statusSnapshot() };
  window.__heigeCodexSkinRuntime = runtime;
  const isCurrent = () => !signal.aborted && window.__heigeCodexSkinRuntime === runtime;
  const assertCurrent = () => {
    if (!isCurrent()) throw new DOMException("HeiGe menu generation disposed", "AbortError");
  };
  let outboundSequence = 0;
  const publish = (kind, value) => {
    assertCurrent();
    if (rawChannel === null) return false;
    outboundSequence += 1;
    try {
      channel.postMessage({
        schemaVersion: 1,
        senderGeneration: generation,
        sequence: outboundSequence,
        kind,
        value,
      });
      return true;
    } catch { return false; }
  };

  let style = document.getElementById(data.styleId);
  if (!style) {
    style = document.createElement("style");
    style.id = data.styleId;
    document.head.appendChild(style);
  }
  style.dataset.heigeGeneration = generation;

  document.getElementById(data.menuId)?.remove();
  const root = document.createElement("div");
  root.id = data.menuId;
  root.dataset.heigeGeneration = generation;
  // 双平台统一放顶部中间：右上角会撞 Windows 的窗口控制按钮和 Codex 自身菜单；
  // 顶部中间正是标题栏拖拽区，no-drag 必须保留，否则点击被拖拽吞掉
  root.style.cssText = "position:fixed;top:10px;left:50%;width:30px;height:30px;transform:translateX(-50%);z-index:2147483000;font:500 13px/1.4 system-ui;user-select:none;-webkit-app-region:no-drag;";

  const button = document.createElement("button");
  button.type = "button";
  button.setAttribute("aria-label", "打开皮肤菜单");
  button.setAttribute("aria-expanded", "false");
  button.title = "Codex 主题切换";
  button.style.cssText = "display:block;margin:0 auto;width:30px;height:30px;border-radius:50%;border:1px solid rgba(0,0,0,.12);background:rgba(255,255,255,.82);backdrop-filter:blur(10px);box-shadow:0 2px 8px rgba(0,0,0,.14);cursor:pointer;font-size:15px;padding:0;-webkit-app-region:no-drag;";
  const triggerGlyph = document.createElement("span");
  triggerGlyph.dataset.heigeRole = "menu-trigger-glyph";
  triggerGlyph.textContent = "\\u{1F3A8}";
  triggerGlyph.setAttribute("aria-hidden", "true");
  button.appendChild(triggerGlyph);

  const panel = document.createElement("div");
  panel.id = data.menuId + "-panel";
  panel.dataset.heigeRole = "menu-panel";
  panel.style.cssText = "display:none;position:absolute;top:100%;left:50%;transform:translateX(-50%);margin-top:8px;width:330px;max-width:calc(100vw - 24px);max-height:calc(100vh - 58px);overflow-y:auto;overscroll-behavior:contain;padding:6px;border-radius:12px;border:1px solid rgba(0,0,0,.1);background:rgba(255,255,255,.94);backdrop-filter:blur(16px);box-shadow:0 10px 30px rgba(0,0,0,.18);color:#17344f;-webkit-app-region:no-drag;";
  button.setAttribute("aria-controls", panel.id);
  let hidden = false;
  const setPanelOpen = (open, { focusTrigger = false } = {}) => {
    assertCurrent();
    const next = open === true && !hidden;
    if (!next && focusTrigger) button.focus();
    panel.style.display = next ? "block" : "none";
    button.setAttribute("aria-expanded", String(next));
    button.setAttribute("aria-label", hidden ? "显示皮肤菜单" : next ? "关闭皮肤菜单" : "打开皮肤菜单");
  };
  listen(panel, "focusin", (event) => {
    event.target?.scrollIntoView?.({ block: "nearest" });
  });
  listen(document, "keydown", (event) => {
    if (event.key !== "Escape" || panel.style.display === "none") return;
    event.preventDefault();
    event.stopPropagation();
    setPanelOpen(false, { focusTrigger: true });
  });

  const rows = new Map();
  const paint = (id) => {
    for (const [rowId, row] of rows) {
      row.style.background = rowId === id ? "rgba(36,201,215,.16)" : "transparent";
      row.style.fontWeight = rowId === id ? "700" : "500";
      if (row.hasAttribute("aria-pressed")) row.setAttribute("aria-pressed", String(rowId === id));
    }
  };
  const row = (label, dotColor, onPick, before, { role = "menu-action", selectable = false } = {}) => {
    const item = document.createElement("button");
    item.type = "button";
    item.dataset.heigeRole = role;
    if (selectable) item.setAttribute("aria-pressed", "false");
    item.style.cssText = "display:flex;align-items:center;gap:8px;width:100%;padding:7px 10px;border:0;border-radius:8px;background:transparent;color:inherit;cursor:pointer;font:inherit;text-align:left;";
    const dot = document.createElement("span");
    dot.setAttribute("aria-hidden", "true");
    dot.style.cssText = "width:10px;height:10px;border-radius:50%;flex:none;background:" + dotColor + ";";
    const text = document.createElement("span");
    text.textContent = label;
    item.append(dot, text);
    listen(item, "mouseenter", () => { if (item.style.fontWeight !== "700") item.style.background = "rgba(0,0,0,.05)"; });
    // 先无条件复位再 paint：上传行/隐藏行不在 rows 里，paint 遍历不到它们，
    // 只靠 paint 会让这两行的 hover 灰底永久残留
    listen(item, "mouseleave", () => { item.style.background = "transparent"; paint(document.documentElement.dataset.heigeCodexSkin ?? null); });
    listen(item, "click", () => onPick(item));
    if (before) panel.insertBefore(item, before); else panel.appendChild(item);
    return item;
  };

  // 正式主题由 controller state 决定；localStorage 仅同步同机窗口的当前选择。
  const writeSelected = (id) => { assertCurrent(); try { localStorage.setItem(data.selectedKey, id); } catch {} };
  // 卸载皮肤后 style 已脱离 DOM，任何脚本化调用不得再改 dataset/写存储，否则污染 status
  const alive = () => { assertCurrent(); return style.isConnected; };

  const setTheme = (id, persist = true, broadcast = true) => {
    if (!alive()) return;
    const theme = data.themes.find((candidate) => candidate.id === id);
    if (!theme) return;
    style.textContent = theme.css;
    document.documentElement.dataset.heigeCodexSkin = theme.id;
    syncXpQqDiffShadows();
    paint(theme.id);
    if (persist) writeSelected(theme.id);
    if (broadcast) publish("theme", theme.id);
  };
  const clearTheme = (persist = true, broadcast = true) => {
    if (!alive()) return;
    style.textContent = "";
    delete document.documentElement.dataset.heigeCodexSkin;
    syncXpQqDiffShadows();
    paint(null);
    if (persist) writeSelected(data.nativeSel);
    if (broadcast) publish("theme", data.nativeSel);
  };

  let requestThemeSelection = async (id) => {
    if (id === data.nativeSel) clearTheme();
    else setTheme(id);
    return true;
  };

  for (const theme of data.themes) {
    const themeRow = row(theme.name, theme.accent, () => {
      void requestThemeSelection(theme.id).then((applied) => {
        if (applied) setPanelOpen(false, { focusTrigger: true });
      });
    }, null, { role: "theme-option", selectable: true });
    themeRow.dataset.heigeThemeId = theme.id;
    rows.set(theme.id, themeRow);
  }

  // ---- 本地头像：严格校验 header、尺寸与 MIME 后再进行方形裁切 ----
  const imageError = (message) => new Error(message);
  const u16be = (bytes, offset) => {
    if (offset + 2 > bytes.length) throw imageError("图片 header 已截断");
    return bytes[offset] * 256 + bytes[offset + 1];
  };
  const u16le = (bytes, offset) => {
    if (offset + 2 > bytes.length) throw imageError("图片 header 已截断");
    return bytes[offset] + bytes[offset + 1] * 256;
  };
  const u24le = (bytes, offset) => {
    if (offset + 3 > bytes.length) throw imageError("图片 header 已截断");
    return bytes[offset] + bytes[offset + 1] * 256 + bytes[offset + 2] * 65536;
  };
  const u32be = (bytes, offset) => {
    if (offset + 4 > bytes.length) throw imageError("图片 header 已截断");
    return bytes[offset] * 16777216 + bytes[offset + 1] * 65536 + bytes[offset + 2] * 256 + bytes[offset + 3];
  };
  const u32le = (bytes, offset) => {
    if (offset + 4 > bytes.length) throw imageError("图片 header 已截断");
    return (bytes[offset] + bytes[offset + 1] * 256 + bytes[offset + 2] * 65536 + bytes[offset + 3] * 16777216) >>> 0;
  };
  const ascii = (bytes, offset, length) => {
    if (offset + length > bytes.length) throw imageError("图片 header 已截断");
    let value = "";
    for (let index = 0; index < length; index += 1) value += String.fromCharCode(bytes[offset + index]);
    return value;
  };
  const checkedDimensions = (mime, width, height) => {
    if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1) throw imageError("图片尺寸无效");
    return { mime, width, height };
  };
  const parseBrowserImage = (input) => {
    const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
    if (bytes.length >= 8 && ascii(bytes, 0, 8) === "\\u0089PNG\\r\\n\\u001a\\n") {
      if (bytes.length < 24 || u32be(bytes, 8) !== 13 || ascii(bytes, 12, 4) !== "IHDR") throw imageError("PNG header 无效或已截断");
      return checkedDimensions("image/png", u32be(bytes, 16), u32be(bytes, 20));
    }
    if (bytes.length >= 2 && bytes[0] === 255 && bytes[1] === 216) {
      const sof = new Set([192, 193, 194, 195, 197, 198, 199, 201, 202, 203, 205, 206, 207]);
      let offset = 2;
      while (offset < bytes.length) {
        if (bytes[offset] !== 255) throw imageError("JPEG marker header 无效");
        while (offset < bytes.length && bytes[offset] === 255) offset += 1;
        if (offset >= bytes.length) throw imageError("JPEG header 已截断");
        const marker = bytes[offset++];
        if (marker === 0 || marker === 217 || marker === 218) break;
        if (marker === 1 || marker === 216 || (marker >= 208 && marker <= 215)) continue;
        const length = u16be(bytes, offset);
        if (length < 2 || offset + length > bytes.length) throw imageError("JPEG segment header 已截断");
        if (sof.has(marker)) {
          if (length < 7) throw imageError("JPEG SOF header 已截断");
          return checkedDimensions("image/jpeg", u16be(bytes, offset + 5), u16be(bytes, offset + 3));
        }
        offset += length;
      }
      throw imageError("JPEG 缺少尺寸 header");
    }
    if (bytes.length >= 4 && ascii(bytes, 0, 4) === "RIFF") {
      if (bytes.length < 20 || ascii(bytes, 8, 4) !== "WEBP") throw imageError("WebP RIFF header 无效");
      const riffEnd = u32le(bytes, 4) + 8;
      if (riffEnd < 20 || riffEnd > bytes.length) throw imageError("WebP RIFF header 已截断");
      let offset = 12;
      while (offset + 8 <= riffEnd) {
        const type = ascii(bytes, offset, 4);
        const length = u32le(bytes, offset + 4);
        const start = offset + 8;
        const end = start + length;
        if (!Number.isSafeInteger(end) || end > riffEnd) throw imageError("WebP chunk header 已截断");
        if (type === "VP8X") {
          if (length < 10) throw imageError("WebP VP8X header 已截断");
          return checkedDimensions("image/webp", u24le(bytes, start + 4) + 1, u24le(bytes, start + 7) + 1);
        }
        if (type === "VP8L") {
          if (length < 5 || bytes[start] !== 47) throw imageError("WebP VP8L header 无效");
          return checkedDimensions(
            "image/webp",
            1 + bytes[start + 1] + ((bytes[start + 2] & 63) << 8),
            1 + ((bytes[start + 2] & 192) >>> 6) + (bytes[start + 3] << 2) + ((bytes[start + 4] & 15) << 10),
          );
        }
        if (type === "VP8 ") {
          if (length < 10 || bytes[start + 3] !== 157 || bytes[start + 4] !== 1 || bytes[start + 5] !== 42) throw imageError("WebP VP8 header 无效");
          return checkedDimensions("image/webp", u16le(bytes, start + 6) & 16383, u16le(bytes, start + 8) & 16383);
        }
        offset = end + (length & 1);
      }
      throw imageError("WebP 缺少尺寸 header");
    }
    throw imageError("不支持或无法识别的图片 header");
  };
  const validateBrowserImage = (input, expectedMime) => {
    const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
    if (bytes.byteLength > data.limits.assetBytes) throw imageError("图片超过 8388608 bytes（8 MiB）");
    const metadata = parseBrowserImage(bytes);
    if (expectedMime && metadata.mime !== expectedMime) throw imageError("MIME 不匹配：期望 " + expectedMime + "，实际 " + metadata.mime);
    if (metadata.width > data.limits.imageWidth) throw imageError("图片宽度 width 超过 " + data.limits.imageWidth);
    if (metadata.height > data.limits.imageHeight) throw imageError("图片高度 height 超过 " + data.limits.imageHeight);
    if (metadata.width > Math.floor(data.limits.imagePixels / metadata.height)) throw imageError("图片像素 pixel 总数超过 " + data.limits.imagePixels);
    const shorter = Math.min(metadata.width, metadata.height);
    const longer = Math.max(metadata.width, metadata.height);
    if (longer > shorter * data.limits.aspectRatio) throw imageError("图片纵横比 aspect ratio 超过 " + data.limits.aspectRatio + ":1");
    return metadata;
  };
  const parseDataUrlImage = (dataUrl) => {
    if (typeof dataUrl !== "string" || dataUrl.length > 12_000_000 || !dataUrl.startsWith("data:image/")) throw imageError("图片 data URL 无效或过大");
    const marker = ";base64,";
    const split = dataUrl.indexOf(marker);
    if (split < 0) throw imageError("图片 data URL 必须使用 base64");
    const mime = dataUrl.slice(5, split).toLowerCase();
    if (mime !== "image/png" && mime !== "image/jpeg" && mime !== "image/webp") throw imageError("图片 MIME 不受支持");
    let binary;
    try { binary = atob(dataUrl.slice(split + marker.length)); }
    catch { throw imageError("图片 base64 无效"); }
    if (binary.length > data.limits.assetBytes) throw imageError("图片超过 8388608 bytes（8 MiB）");
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return { bytes, metadata: validateBrowserImage(bytes, mime) };
  };
  const expectedUploadMime = (file) => {
    const lower = String(file.name ?? "").toLowerCase();
    const extensionMime = lower.endsWith(".png") ? "image/png"
      : lower.endsWith(".jpg") || lower.endsWith(".jpeg") ? "image/jpeg"
        : lower.endsWith(".webp") ? "image/webp" : null;
    if (!extensionMime) throw imageError("文件扩展名必须是 PNG、JPEG 或 WebP");
    const declared = typeof file.type === "string" ? file.type.toLowerCase() : "";
    if (declared && declared !== extensionMime) throw imageError("MIME 与文件扩展名不匹配");
    return extensionMime;
  };
  const boundedOperation = (operation, label) => new Promise((resolve, reject) => {
    let settled = false;
    const finish = (callback, value) => {
      if (settled) return;
      settled = true;
      clearLater(timeoutId);
      signal.removeEventListener("abort", onAbort);
      callback(value);
    };
    const onAbort = () => finish(reject, new DOMException("HeiGe menu generation disposed", "AbortError"));
    const timeoutId = later(() => finish(reject, imageError(label + "超时，请重试")), data.limits.browserOperationMs);
    signal.addEventListener("abort", onAbort, { once: true });
    Promise.resolve().then(operation).then(
      (value) => finish(resolve, value),
      (error) => finish(reject, error),
    );
  });
  const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
    assertCurrent();
    let settled = false;
    const reader = new FileReader();
    const finishReader = () => {
      trackedReaders.delete(reader);
      clearLater(timeoutId);
      signal.removeEventListener("abort", onAbort);
      reader.onload = null;
      reader.onerror = null;
      reader.onabort = null;
    };
    const finish = (callback, value) => {
      if (settled) return;
      settled = true;
      finishReader();
      callback(value);
    };
    const onAbort = () => {
      try { reader.abort(); } catch {}
      finish(reject, new DOMException("HeiGe menu generation disposed", "AbortError"));
    };
    const timeoutId = later(() => {
      finish(reject, imageError("文件读取超时，请重试"));
      try { reader.abort(); } catch {}
    }, data.limits.browserOperationMs);
    signal.addEventListener("abort", onAbort, { once: true });
    trackedReaders.add(reader);
    reader.onload = () => {
      if (typeof reader.result !== "string") finish(reject, imageError("文件读取结果无效"));
      else finish(resolve, reader.result);
    };
    reader.onerror = () => finish(reject, imageError("文件读取失败，请重试"));
    reader.onabort = () => finish(reject, isCurrent() ? imageError("文件读取已取消") : new DOMException("HeiGe menu generation disposed", "AbortError"));
    try { reader.readAsDataURL(file); }
    catch (error) { finish(reject, error); }
  });

  const avatarButton = document.createElement("button");
  avatarButton.id = data.avatar.buttonId;
  avatarButton.type = "button";
  avatarButton.dataset.heigeGeneration = generation;
  avatarButton.dataset.heigeRole = "xp-qq-avatar-editor";
  avatarButton.setAttribute("aria-label", "更换 QQ 头像");
  avatarButton.title = "更换 QQ 头像";
  const avatarButtonLabel = document.createElement("span");
  avatarButtonLabel.textContent = "更换";
  avatarButton.appendChild(avatarButtonLabel);

  const avatarPicker = document.createElement("input");
  avatarPicker.id = data.avatar.inputId;
  avatarPicker.type = "file";
  avatarPicker.accept = "image/png,image/jpeg,image/webp";
  avatarPicker.dataset.heigeGeneration = generation;
  avatarPicker.style.display = "none";

  const avatarNotice = document.createElement("div");
  avatarNotice.id = data.avatar.noticeId;
  avatarNotice.dataset.heigeGeneration = generation;
  avatarNotice.dataset.heigeRole = "xp-qq-avatar-notice";
  avatarNotice.setAttribute("role", "status");
  avatarNotice.setAttribute("aria-live", "polite");
  avatarNotice.hidden = true;
  let avatarNoticeTimer = null;
  const showAvatarNotice = (message, kind = "success") => {
    avatarNotice.textContent = String(message).replace(/[\\r\\n\\t]+/g, " ").slice(0, 96);
    avatarNotice.dataset.kind = kind;
    avatarNotice.hidden = false;
    if (avatarNoticeTimer !== null) clearLater(avatarNoticeTimer);
    avatarNoticeTimer = later(() => {
      avatarNotice.hidden = true;
      avatarNotice.textContent = "";
      avatarNoticeTimer = null;
    }, 2600);
  };

  const applyAvatarDataUrl = (dataUrl) => {
    if (!isSafeXpQqAvatarDataUrl(dataUrl, data.avatar)) return false;
    let parsed;
    try { parsed = parseDataUrlImage(dataUrl); }
    catch { return false; }
    if (
      parsed.metadata.width !== data.avatar.outputSide
      || parsed.metadata.height !== data.avatar.outputSide
    ) return false;
    document.documentElement.style.setProperty(
      "--heige-xp-qq-avatar-image",
      'url("' + dataUrl + '")',
    );
    document.documentElement.dataset.heigeXpQqAvatar = "custom";
    return true;
  };

  const saveAvatarDataUrl = (dataUrl) => {
    if (!isSafeXpQqAvatarDataUrl(dataUrl, data.avatar)) return false;
    try {
      localStorage.setItem(data.avatar.storageKey, dataUrl);
      return true;
    } catch {
      return false;
    }
  };

  const processAvatarDataUrl = (dataUrl, metadata) => new Promise((resolve, reject) => {
    assertCurrent();
    let settled = false;
    const img = new Image();
    const finishImage = () => {
      trackedImages.delete(img);
      clearLater(timeoutId);
      signal.removeEventListener("abort", onAbort);
      img.onload = null;
      img.onerror = null;
    };
    const finish = (callback, value) => {
      if (settled) return;
      settled = true;
      finishImage();
      callback(value);
    };
    const fail = (error) => finish(reject, error);
    const onAbort = () => fail(new DOMException("HeiGe menu generation disposed", "AbortError"));
    const timeoutId = later(() => {
      fail(imageError("头像解码超时，请重试"));
      try { img.src = ""; } catch {}
    }, data.limits.browserOperationMs);
    signal.addEventListener("abort", onAbort, { once: true });
    trackedImages.set(img, fail);
    img.onload = () => {
      try {
        assertCurrent();
        const width = Number(img.naturalWidth || img.width);
        const height = Number(img.naturalHeight || img.height);
        if (width !== metadata.width || height !== metadata.height) {
          throw imageError("头像解码尺寸与 header 不一致");
        }
        const crop = computeXpQqAvatarCrop(width, height);
        const canvas = document.createElement("canvas");
        canvas.width = data.avatar.outputSide;
        canvas.height = data.avatar.outputSide;
        const context = canvas.getContext("2d");
        if (!context || typeof context.drawImage !== "function") throw imageError("无法创建头像画布");
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";
        context.drawImage(
          img,
          crop.sx,
          crop.sy,
          crop.size,
          crop.size,
          0,
          0,
          data.avatar.outputSide,
          data.avatar.outputSide,
        );
        const encoded = canvas.toDataURL("image/webp", 0.86);
        if (!isSafeXpQqAvatarDataUrl(encoded, data.avatar)) throw imageError("头像压缩结果无效");
        const encodedMetadata = parseDataUrlImage(encoded).metadata;
        if (
          encodedMetadata.width !== data.avatar.outputSide
          || encodedMetadata.height !== data.avatar.outputSide
        ) throw imageError("头像压缩尺寸不一致");
        const persisted = saveAvatarDataUrl(encoded);
        if (!applyAvatarDataUrl(encoded)) throw imageError("头像应用失败");
        showAvatarNotice(
          persisted ? "头像已更新并保存在本机" : "头像本次已更新，但本地空间不足",
          persisted ? "success" : "warning",
        );
        finish(resolve, encoded);
      } catch (error) {
        fail(error);
      }
    };
    img.onerror = () => fail(isCurrent() ? imageError("头像解码失败") : new DOMException("HeiGe menu generation disposed", "AbortError"));
    try { img.src = dataUrl; }
    catch (error) { fail(error); }
  });

  const uploadAvatarFile = async (file) => {
    assertCurrent();
    const metadataError = validateXpQqAvatarFileMeta(file, data.avatar);
    if (metadataError) throw imageError(metadataError);
    if (typeof file.arrayBuffer !== "function") throw imageError("浏览器无法读取头像文件");
    const expectedMime = expectedUploadMime(file);
    const arrayBuffer = await boundedOperation(() => file.arrayBuffer(), "头像文件读取");
    assertCurrent();
    if (Object.prototype.toString.call(arrayBuffer) !== "[object ArrayBuffer]") throw imageError("头像文件读取结果无效");
    const bytes = new Uint8Array(arrayBuffer);
    if (bytes.byteLength !== file.size) throw imageError("头像文件大小在读取时发生变化");
    const metadata = validateBrowserImage(bytes, expectedMime);
    const verifiedBlob = new Blob([bytes], { type: expectedMime });
    const dataUrl = await readFileAsDataUrl(verifiedBlob);
    assertCurrent();
    const reparsed = parseDataUrlImage(dataUrl);
    if (
      reparsed.metadata.mime !== metadata.mime
      || reparsed.metadata.width !== metadata.width
      || reparsed.metadata.height !== metadata.height
    ) throw imageError("头像读取内容前后不一致");
    return processAvatarDataUrl(dataUrl, metadata);
  };

  listen(avatarButton, "click", () => avatarPicker.click());
  listen(avatarPicker, "change", () => {
    assertCurrent();
    const file = avatarPicker.files?.[0];
    if (!file) return;
    avatarButton.disabled = true;
    avatarButton.setAttribute("aria-busy", "true");
    void uploadAvatarFile(file)
      .catch((error) => { if (isCurrent()) showAvatarNotice(safeUploadError(error), "error"); })
      .finally(() => {
        if (!isCurrent()) return;
        avatarButton.disabled = false;
        avatarButton.setAttribute("aria-busy", "false");
        avatarPicker.value = "";
      });
  });

  document.body.append(avatarButton, avatarPicker, avatarNotice);
  try {
    const storedAvatar = localStorage.getItem(data.avatar.storageKey);
    if (storedAvatar && !applyAvatarDataUrl(storedAvatar)) {
      localStorage.removeItem(data.avatar.storageKey);
    }
  } catch {}

  // ---- XP QQ identity: nickname, signature and a compact classic level mark ----
  const profileCard = document.createElement("section");
  profileCard.id = data.profile.cardId;
  profileCard.dataset.heigeGeneration = generation;
  profileCard.dataset.heigeRole = "xp-qq-profile";
  profileCard.setAttribute("aria-label", "QQ 资料");

  const profileNickname = document.createElement("strong");
  profileNickname.dataset.heigeRole = "xp-qq-profile-nickname";
  const profileSignature = document.createElement("span");
  profileSignature.dataset.heigeRole = "xp-qq-profile-signature";
  const profileLevel = document.createElement("span");
  profileLevel.dataset.heigeRole = "xp-qq-profile-level";

  const profileEditor = document.createElement("button");
  profileEditor.id = data.profile.editorId;
  profileEditor.type = "button";
  profileEditor.dataset.heigeRole = "xp-qq-profile-editor";
  profileEditor.setAttribute("aria-label", "编辑 QQ 资料");
  profileEditor.setAttribute("aria-expanded", "false");
  profileEditor.title = "编辑网名、签名和等级";
  profileEditor.textContent = "✎";
  const profileHeadingRow = document.createElement("div");
  profileHeadingRow.dataset.heigeRole = "xp-qq-profile-heading-row";
  profileHeadingRow.append(profileNickname, profileEditor);
  profileCard.append(profileHeadingRow, profileSignature, profileLevel);

  const profilePanel = document.createElement("form");
  profilePanel.id = data.profile.panelId;
  profilePanel.dataset.heigeGeneration = generation;
  profilePanel.dataset.heigeRole = "xp-qq-profile-panel";
  profilePanel.setAttribute("role", "dialog");
  profilePanel.setAttribute("aria-modal", "false");
  profilePanel.setAttribute("aria-label", "编辑 QQ 资料");
  profilePanel.hidden = true;

  const profileHeading = document.createElement("strong");
  profileHeading.dataset.heigeRole = "xp-qq-profile-heading";
  profileHeading.textContent = "编辑 QQ 资料";

  const profileField = (labelText, control) => {
    const label = document.createElement("label");
    label.dataset.heigeRole = "xp-qq-profile-field";
    const caption = document.createElement("span");
    caption.textContent = labelText;
    label.append(caption, control);
    return label;
  };
  const nicknameInput = document.createElement("input");
  nicknameInput.name = "nickname";
  nicknameInput.type = "text";
  nicknameInput.maxLength = data.profile.nicknameMax;
  nicknameInput.autocomplete = "off";
  nicknameInput.placeholder = "例如：AX_FOR";

  const signatureInput = document.createElement("input");
  signatureInput.name = "signature";
  signatureInput.type = "text";
  signatureInput.maxLength = data.profile.signatureMax;
  signatureInput.autocomplete = "off";
  signatureInput.placeholder = "写一句个性签名";

  const levelSelect = document.createElement("select");
  levelSelect.name = "level";
  for (let level = data.profile.levelMin; level <= data.profile.levelMax; level += 1) {
    const option = document.createElement("option");
    option.value = String(level);
    option.textContent = "⭐".repeat(level) + "（" + level + " 星）";
    levelSelect.appendChild(option);
  }

  const profileFeedback = document.createElement("div");
  profileFeedback.dataset.heigeRole = "xp-qq-profile-feedback";
  profileFeedback.setAttribute("role", "status");
  profileFeedback.setAttribute("aria-live", "polite");
  profileFeedback.hidden = true;

  const profileActions = document.createElement("div");
  profileActions.dataset.heigeRole = "xp-qq-profile-actions";
  const profileCancel = document.createElement("button");
  profileCancel.type = "button";
  profileCancel.textContent = "取消";
  const profileSave = document.createElement("button");
  profileSave.type = "submit";
  profileSave.textContent = "保存";
  profileActions.append(profileCancel, profileSave);
  profilePanel.append(
    profileHeading,
    profileField("网名 ID", nicknameInput),
    profileField("QQ 签名", signatureInput),
    profileField("等级", levelSelect),
    profileFeedback,
    profileActions,
  );

  let currentXpQqProfile = { ...data.profile.defaults };
  let syncXpQqUserNames = () => {};
  const levelText = (level) => "👑 🌙 " + "⭐".repeat(level);
  const closeProfileEditor = ({ restoreFocus = false } = {}) => {
    if (profilePanel.hidden) return;
    profilePanel.hidden = true;
    profileEditor.setAttribute("aria-expanded", "false");
    profileFeedback.hidden = true;
    profileFeedback.textContent = "";
    if (restoreFocus) profileEditor.focus();
  };
  const applyXpQqProfile = (profile) => {
    currentXpQqProfile = { ...profile };
    profileNickname.textContent = profile.nickname;
    profileSignature.textContent = profile.signature || "还没有个性签名";
    profileLevel.textContent = levelText(profile.level);
    profileLevel.setAttribute("aria-label", "QQ 等级 " + profile.level + " 星");
    profileCard.title = profile.nickname + "\\n" + (profile.signature || "还没有个性签名");
    syncXpQqUserNames();
  };
  const openProfileEditor = () => {
    nicknameInput.value = currentXpQqProfile.nickname;
    signatureInput.value = currentXpQqProfile.signature;
    levelSelect.value = String(currentXpQqProfile.level);
    profileFeedback.hidden = true;
    profileFeedback.textContent = "";
    profilePanel.hidden = false;
    profileEditor.setAttribute("aria-expanded", "true");
    nicknameInput.focus();
    nicknameInput.select();
  };
  const readStoredProfile = (rawValue) => {
    if (typeof rawValue !== "string" || rawValue.length > 1024) return null;
    try { return normalizeXpQqProfile(JSON.parse(rawValue), data.profile); }
    catch { return null; }
  };
  const saveProfile = (profile) => {
    try {
      localStorage.setItem(data.profile.storageKey, JSON.stringify(profile));
      return true;
    } catch {
      return false;
    }
  };

  clearXpQqUserNames = () => {
    for (const bubble of document.querySelectorAll("[data-heige-xp-qq-nickname]")) {
      bubble.removeAttribute("data-heige-xp-qq-nickname");
    }
  };
  syncXpQqUserNames = () => {
    if (!isCurrent()) return;
    const active = document.documentElement.dataset.heigeCodexSkin === "xp-qq";
    profileCard.style.display = active ? "" : "none";
    avatarButton.style.display = active ? "" : "none";
    if (!active) {
      closeProfileEditor();
      clearXpQqUserNames();
      return;
    }
    for (const bubble of document.querySelectorAll("[data-user-message-bubble]")) {
      if (bubble.getAttribute("data-heige-xp-qq-nickname") !== currentXpQqProfile.nickname) {
        bubble.setAttribute("data-heige-xp-qq-nickname", currentXpQqProfile.nickname);
      }
    }
  };

  listen(profileEditor, "click", () => {
    if (profilePanel.hidden) openProfileEditor();
    else closeProfileEditor({ restoreFocus: true });
  });
  listen(profileCancel, "click", () => closeProfileEditor({ restoreFocus: true }));
  listen(profilePanel, "submit", (event) => {
    event.preventDefault();
    const profile = normalizeXpQqProfile({
      nickname: nicknameInput.value,
      signature: signatureInput.value,
      level: Number(levelSelect.value),
    }, data.profile);
    if (profile === null) {
      profileFeedback.textContent = "请填写 1–" + data.profile.nicknameMax + " 字网名，并选择有效等级";
      profileFeedback.hidden = false;
      nicknameInput.focus();
      return;
    }
    const persisted = saveProfile(profile);
    applyXpQqProfile(profile);
    closeProfileEditor({ restoreFocus: true });
    showAvatarNotice(
      persisted ? "QQ 资料已更新并保存在本机" : "资料本次已更新，但本地空间不足",
      persisted ? "success" : "warning",
    );
  });
  listen(document, "keydown", (event) => {
    if (event.key === "Escape" && !profilePanel.hidden) {
      event.preventDefault();
      closeProfileEditor({ restoreFocus: true });
    }
  });
  listen(document, "pointerdown", (event) => {
    if (
      !profilePanel.hidden
      && !profilePanel.contains(event.target)
      && !profileCard.contains(event.target)
    ) closeProfileEditor();
  });

  document.body.append(profileCard, profilePanel);
  try {
    const rawProfile = localStorage.getItem(data.profile.storageKey);
    if (rawProfile !== null) {
      const storedProfile = readStoredProfile(rawProfile);
      if (storedProfile) currentXpQqProfile = storedProfile;
      else localStorage.removeItem(data.profile.storageKey);
    }
  } catch {}
  applyXpQqProfile(currentXpQqProfile);

  const profileObserver = new MutationObserver(syncXpQqUserNames);
  profileObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-heige-codex-skin"],
    childList: true,
    subtree: true,
  });
  trackedObservers.add(profileObserver);

  let modeSwitchNode = null;
  let modeSwitchHome = null;
  let modeSwitchNextSibling = null;
  const syncXpQqModeSwitch = () => {
    if (!isCurrent()) return;
    const sidebar = document.querySelector(".app-shell-left-panel");
    const modeButton = document.querySelector('button[aria-label^="切换模式"]');
    const candidate = modeButton?.parentElement ?? null;
    if (candidate && candidate !== modeSwitchNode) {
      const fallbackHome = sidebar?.querySelector("nav .relative.z-10.flex.shrink-0.flex-col") ?? null;
      const candidateAlreadyMoved = candidate.parentElement === sidebar;
      modeSwitchNode = candidate;
      modeSwitchHome = candidate.__heigeXpQqModeHome
        ?? (candidateAlreadyMoved ? fallbackHome : candidate.parentElement);
      modeSwitchNextSibling = candidate.__heigeXpQqModeNext
        ?? (candidateAlreadyMoved ? fallbackHome?.firstChild ?? null : candidate.nextSibling);
      candidate.__heigeXpQqModeHome = modeSwitchHome;
      candidate.__heigeXpQqModeNext = modeSwitchNextSibling;
    }
    if (!modeSwitchNode) return;
    const xpQqActive = document.documentElement.dataset.heigeCodexSkin === "xp-qq";
    if (xpQqActive && sidebar) {
      modeSwitchNode.dataset.heigeRole = "xp-qq-mode-switch";
      if (modeSwitchNode.parentElement !== sidebar) sidebar.appendChild(modeSwitchNode);
      return;
    }
    if (!xpQqActive && modeSwitchNode.dataset.heigeRole === "xp-qq-mode-switch") {
      delete modeSwitchNode.dataset.heigeRole;
      if (modeSwitchHome?.isConnected) {
        if (modeSwitchNextSibling?.parentElement === modeSwitchHome) {
          modeSwitchHome.insertBefore(modeSwitchNode, modeSwitchNextSibling);
        } else {
          modeSwitchHome.appendChild(modeSwitchNode);
        }
      }
    }
  };
  syncXpQqModeSwitch();
  const modeSwitchObserver = new MutationObserver(syncXpQqModeSwitch);
  modeSwitchObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-heige-codex-skin"],
    childList: true,
    subtree: true,
  });
  trackedObservers.add(modeSwitchObserver);

  /* QQ clients present their primary destinations as a compact tab strip.
   * Move Codex's five real sidebar actions into one owned toolbar while the
   * theme is active, then restore every node to its original parent/order. */
  const sidebarActionLabels = ["新建任务", "拉取请求", "站点", "已安排", "插件"];
  let sidebarActionsToolbar = null;
  let sidebarActionHomes = [];
  let sidebarActionSources = [];
  const directChildContaining = (rootNode, descendant) => {
    let node = descendant;
    while (node && node.parentElement !== rootNode) node = node.parentElement;
    return node?.parentElement === rootNode ? node : null;
  };
  restoreXpQqSidebarActions = () => {
    for (const entry of sidebarActionHomes) {
      const { node, home, next } = entry;
      delete node.dataset.heigeRole;
      delete node.dataset.heigeSidebarActionLabel;
      delete node.dataset.heigeSidebarActionsGeneration;
      if (!home?.isConnected) continue;
      if (next?.parentElement === home) home.insertBefore(node, next);
      else home.appendChild(node);
    }
    sidebarActionHomes = [];
    for (const source of sidebarActionSources) {
      delete source.dataset.heigeRole;
      delete source.dataset.heigeSidebarActionsGeneration;
    }
    sidebarActionSources = [];
    sidebarActionsToolbar?.remove();
    sidebarActionsToolbar = null;
  };
  const syncXpQqSidebarActions = () => {
    if (!isCurrent()) return;
    const xpQqActive = document.documentElement.dataset.heigeCodexSkin === "xp-qq";
    if (!xpQqActive) {
      restoreXpQqSidebarActions();
      return;
    }
    if (sidebarActionsToolbar?.isConnected && sidebarActionsToolbar.children.length === 5) return;
    restoreXpQqSidebarActions();
    const nav = document.querySelector(".app-shell-left-panel nav");
    const scroll = nav?.querySelector("[data-app-action-sidebar-scroll]") ?? null;
    if (!nav || !scroll) return;
    const buttons = sidebarActionLabels.map((label) => (
      [...nav.querySelectorAll("button")].find((candidate) => (
        (candidate.textContent ?? "").trim() === label
      )) ?? null
    ));
    if (buttons.some((candidate) => candidate === null)) return;
    const newTaskRow = buttons[0].parentElement;
    const newTaskSource = directChildContaining(nav, newTaskRow);
    const quickActionSource = directChildContaining(scroll, buttons[1]);
    if (!newTaskRow || !newTaskSource || !quickActionSource) return;
    const actions = [newTaskRow, ...buttons.slice(1)];
    const toolbar = document.createElement("div");
    toolbar.id = data.sidebarActionsId;
    toolbar.dataset.heigeRole = "xp-qq-sidebar-actions";
    toolbar.dataset.heigeGeneration = generation;
    toolbar.setAttribute("role", "toolbar");
    toolbar.setAttribute("aria-label", "主要功能");
    nav.insertBefore(toolbar, newTaskSource);
    sidebarActionsToolbar = toolbar;
    sidebarActionSources = [newTaskSource, quickActionSource];
    for (const source of sidebarActionSources) {
      source.dataset.heigeRole = "xp-qq-sidebar-actions-source";
      source.dataset.heigeSidebarActionsGeneration = generation;
    }
    actions.forEach((action, index) => {
      sidebarActionHomes.push({ node: action, home: action.parentElement, next: action.nextSibling });
      action.dataset.heigeRole = "xp-qq-sidebar-action";
      action.dataset.heigeSidebarActionLabel = sidebarActionLabels[index];
      action.dataset.heigeSidebarActionsGeneration = generation;
      toolbar.appendChild(action);
    });
  };
  syncXpQqSidebarActions();
  const sidebarActionsObserver = new MutationObserver(syncXpQqSidebarActions);
  sidebarActionsObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-heige-codex-skin"],
    childList: true,
    subtree: true,
  });
  trackedObservers.add(sidebarActionsObserver);

  /* Present native project/thread rows as a QQ recent-contact list. Keep the
   * original nodes and event handlers; only add stable metadata and one
   * pointer-inert presence dot derived from real runtime state. */
  clearXpQqContacts = () => {
    for (const node of document.querySelectorAll(
      '[data-heige-contact-generation="' + generation + '"]',
    )) {
      if (node.dataset.heigeRole === "xp-qq-contact-presence") {
        node.remove();
        continue;
      }
      delete node.dataset.heigeRole;
      delete node.dataset.heigeContactGeneration;
      delete node.dataset.heigeContactInitial;
      delete node.dataset.heigeContactTone;
      delete node.dataset.heigeContactProject;
      delete node.dataset.heigeContactStatus;
      delete node.dataset.heigeContactState;
      delete node.dataset.heigeContactCount;
    }
  };
  const setContactData = (node, key, value) => {
    if (node.dataset[key] !== value) node.dataset[key] = value;
  };
  const contactProjectName = (row) => {
    const label = row.closest('[role="list"]')?.getAttribute("aria-label") ?? "";
    const suffix = "中的已安排任务";
    return label.endsWith(suffix) ? label.slice(0, -suffix.length) : "本地工作区";
  };
  const syncXpQqContacts = () => {
    if (!isCurrent()) return;
    const xpQqActive = document.documentElement.dataset.heigeCodexSkin === "xp-qq";
    if (!xpQqActive) {
      clearXpQqContacts();
      return;
    }

    const projectLists = [...document.querySelectorAll(
      "[data-app-action-sidebar-project-list-id]",
    )];
    for (const project of document.querySelectorAll("[data-app-action-sidebar-project-row]")) {
      const projectId = project.dataset.appActionSidebarProjectId ?? "";
      const projectList = projectLists.find((candidate) => (
        candidate.dataset.appActionSidebarProjectListId === projectId
      ));
      const count = projectList?.querySelectorAll("[data-app-action-sidebar-thread-row]").length ?? 0;
      setContactData(project, "heigeRole", "xp-qq-contact-group");
      setContactData(project, "heigeContactGeneration", generation);
      setContactData(project, "heigeContactCount", String(count));
    }

    for (const row of document.querySelectorAll("[data-app-action-sidebar-thread-row]")) {
      const title = row.dataset.appActionSidebarThreadTitle
        || row.querySelector("[data-thread-title]")?.textContent
        || "Codex";
      const threadId = row.dataset.appActionSidebarThreadId ?? title;
      const project = contactProjectName(row);
      const identity = deriveXpQqContactIdentity(title, threadId);
      const running = row.querySelector(".animate-spin") !== null;
      const active = row.dataset.appActionSidebarThreadActive === "true";
      const pinned = row.dataset.appActionSidebarThreadPinned === "true";
      const state = running ? "running" : active ? "active" : pinned ? "pinned" : "idle";
      const status = xpQqContactStatus(state);
      setContactData(row, "heigeRole", "xp-qq-contact");
      setContactData(row, "heigeContactGeneration", generation);
      setContactData(row, "heigeContactInitial", identity.initial);
      setContactData(row, "heigeContactTone", String(identity.tone));
      setContactData(row, "heigeContactProject", project);
      setContactData(row, "heigeContactStatus", status);
      setContactData(row, "heigeContactState", state);

      let presence = row.querySelector(':scope > [data-heige-role="xp-qq-contact-presence"]');
      if (state !== "running" && state !== "active") {
        presence?.remove();
        continue;
      }
      if (!presence) {
        presence = document.createElement("span");
        presence.dataset.heigeRole = "xp-qq-contact-presence";
        presence.dataset.heigeContactGeneration = generation;
        presence.setAttribute("aria-hidden", "true");
        row.appendChild(presence);
      }
      setContactData(presence, "heigeContactState", state);
    }
  };
  syncXpQqContacts();
  const contactObserver = new MutationObserver(syncXpQqContacts);
  contactObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: [
      "data-heige-codex-skin",
      "data-app-action-sidebar-thread-active",
      "data-app-action-sidebar-thread-pinned",
      "aria-expanded",
      "class",
    ],
    childList: true,
    subtree: true,
  });
  trackedObservers.add(contactObserver);

  const fileTitle = document.createElement("div");
  fileTitle.id = data.fileTitleId;
  fileTitle.dataset.heigeGeneration = generation;
  fileTitle.dataset.heigeRole = "xp-qq-file-title";
  fileTitle.textContent = "文件浏览器";
  fileTitle.setAttribute("aria-hidden", "true");
  fileTitle.hidden = true;
  document.body.appendChild(fileTitle);

  let fileToolbar = null;
  let fileTitleResizeObserver = null;
  const syncXpQqFileTitle = () => {
    if (!isCurrent()) return;
    const nextToolbar = document.querySelector(
      '.isolate:has(> [role="tabpanel"][aria-label="打开文件"]) > .h-toolbar',
    );
    if (nextToolbar !== fileToolbar) {
      fileTitleResizeObserver?.disconnect();
      fileToolbar = nextToolbar;
      if (fileToolbar) fileTitleResizeObserver?.observe(fileToolbar);
    }
    const xpQqActive = document.documentElement.dataset.heigeCodexSkin === "xp-qq";
    if (!xpQqActive || !fileToolbar || fileToolbar.getClientRects().length === 0) {
      if (!fileTitle.hidden) fileTitle.hidden = true;
      return;
    }
    const rect = fileToolbar.getBoundingClientRect();
    const left = Math.round(rect.left + 24) + "px";
    const top = Math.round(rect.top + rect.height / 2) + "px";
    if (fileTitle.style.left !== left) fileTitle.style.left = left;
    if (fileTitle.style.top !== top) fileTitle.style.top = top;
    if (fileTitle.hidden) fileTitle.hidden = false;
  };
  fileTitleResizeObserver = new ResizeObserver(syncXpQqFileTitle);
  trackedObservers.add(fileTitleResizeObserver);
  syncXpQqFileTitle();
  listen(window, "resize", syncXpQqFileTitle);
  const fileTitleObserver = new MutationObserver(syncXpQqFileTitle);
  fileTitleObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-heige-codex-skin", "style"],
    childList: true,
    subtree: true,
  });
  trackedObservers.add(fileTitleObserver);

  /* The empty task surface is rendered as a centered home-page hero by Codex.
   * Mark only that native surface so the XP QQ stylesheet can present the
   * existing heading and working suggestion buttons as a chat transcript. */
  const markXpQqWelcomeRole = (node, role) => {
    if (!node) return;
    if (node.dataset.heigeRole !== role) node.dataset.heigeRole = role;
    if (node.dataset.heigeWelcomeGeneration !== generation) {
      node.dataset.heigeWelcomeGeneration = generation;
    }
  };
  clearXpQqWelcomeRoles = () => {
    for (const node of document.querySelectorAll(
      '[data-heige-welcome-generation="' + generation + '"]',
    )) {
      delete node.dataset.heigeRole;
      delete node.dataset.heigeWelcomeGeneration;
    }
  };
  let xpQqWelcomeSection = null;
  const syncXpQqWelcome = () => {
    if (!isCurrent()) return;
    const xpQqActive = document.documentElement.dataset.heigeCodexSkin === "xp-qq";
    const section = xpQqActive
      ? document.querySelector('section[class*="group/home-suggestions"]')
      : null;
    const suggestions = section?.parentElement ?? null;
    const welcome = suggestions?.parentElement ?? null;
    const message = welcome?.firstElementChild ?? null;
    const space = welcome?.parentElement ?? null;
    const replies = section?.querySelector("button")?.parentElement?.parentElement ?? null;
    if (!section || !suggestions || !welcome || !message || !space || !replies) {
      if (xpQqWelcomeSection !== null) clearXpQqWelcomeRoles();
      xpQqWelcomeSection = null;
      return;
    }
    if (xpQqWelcomeSection !== section) clearXpQqWelcomeRoles();
    xpQqWelcomeSection = section;
    markXpQqWelcomeRole(space, "xp-qq-welcome-space");
    markXpQqWelcomeRole(welcome, "xp-qq-welcome");
    markXpQqWelcomeRole(message, "xp-qq-welcome-message");
    markXpQqWelcomeRole(suggestions, "xp-qq-welcome-suggestions");
    markXpQqWelcomeRole(section, "xp-qq-quick-replies");
    markXpQqWelcomeRole(replies, "xp-qq-quick-replies-grid");
    for (const reply of section.querySelectorAll("button")) {
      markXpQqWelcomeRole(reply, "xp-qq-quick-reply");
    }
  };
  syncXpQqWelcome();
  const welcomeObserver = new MutationObserver(syncXpQqWelcome);
  welcomeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-heige-codex-skin"],
    childList: true,
    subtree: true,
  });
  trackedObservers.add(welcomeObserver);

  /* Codex renders review diffs inside an open shadow root. Its generated
   * dark palette cannot be corrected from the document stylesheet alone. */
  const diffShadowStyleId = "heige-xp-qq-diff-shadow-style";
  const xpQqDiffShadowCss = [
    "@layer base {",
    ":host { color-scheme: light !important; color: #20364a !important; background-color: #ffffff !important; --diffs-bg: #ffffff !important; --diffs-fg: #20364a !important; --diffs-dark: #20364a !important; --diffs-light: #20364a !important; }",
    ":is([data-diff], [data-file]) { --diffs-bg: #ffffff !important; --diffs-fg: #20364a !important; --diffs-mixer: #20364a !important; --diffs-addition-base: #2f8f61 !important; --diffs-deletion-base: #c94f52 !important; --diffs-addition-color: #176a45 !important; --diffs-deletion-color: #a92f35 !important; --diffs-bg-addition: #e8f5ee !important; --diffs-bg-deletion: #fdeceb !important; --diffs-bg-addition-emphasis: #cfe9db !important; --diffs-bg-deletion-emphasis: #f5d4d2 !important; --diffs-bg-context: #ffffff !important; --diffs-bg-context-gutter: #f5f9fc !important; --diffs-bg-buffer: #f5f9fc !important; --diffs-bg-separator: #e6eef4 !important; --diffs-fg-number: #6f8394 !important; }",
    "[data-line-type='change-addition']:is([data-line], [data-no-newline]) { --diffs-computed-diff-line-bg: #e8f5ee !important; }",
    "[data-line-type='change-deletion']:is([data-line], [data-no-newline]) { --diffs-computed-diff-line-bg: #fdeceb !important; }",
    "[data-code] [data-line] span { color: #20364a !important; }",
    "[data-code] [data-line-type='change-addition'][data-line] span { color: #204f39 !important; }",
    "[data-code] [data-line-type='change-deletion'][data-line] span { color: #6f3033 !important; }",
    "}",
  ].join("");
  const observedDiffShadows = new WeakSet();
  const removeXpQqDiffShadowStyles = () => {
    for (const shadowStyle of trackedDiffShadowStyles) {
      try { shadowStyle.remove(); } catch {}
    }
    trackedDiffShadowStyles.clear();
    for (const diffHost of document.querySelectorAll("diffs-container")) {
      try { diffHost.shadowRoot?.getElementById(diffShadowStyleId)?.remove(); } catch {}
    }
  };
  const syncXpQqDiffShadows = () => {
    if (!isCurrent()) return;
    if (document.documentElement.dataset.heigeCodexSkin !== "xp-qq") {
      removeXpQqDiffShadowStyles();
      return;
    }
    for (const diffHost of document.querySelectorAll("diffs-container")) {
      const shadow = diffHost.shadowRoot;
      if (!shadow) continue;
      if (!observedDiffShadows.has(shadow)) {
        const diffShadowObserver = new MutationObserver(syncXpQqDiffShadows);
        diffShadowObserver.observe(shadow, { childList: true });
        trackedObservers.add(diffShadowObserver);
        observedDiffShadows.add(shadow);
      }
      let shadowStyle = shadow.getElementById(diffShadowStyleId);
      if (!shadowStyle) {
        shadowStyle = document.createElement("style");
        shadowStyle.id = diffShadowStyleId;
        shadow.appendChild(shadowStyle);
      }
      shadowStyle.dataset.heigeGeneration = generation;
      if (shadowStyle.textContent !== xpQqDiffShadowCss) {
        shadowStyle.textContent = xpQqDiffShadowCss;
      }
      if (shadow.lastElementChild !== shadowStyle) shadow.appendChild(shadowStyle);
      trackedDiffShadowStyles.add(shadowStyle);
    }
  };
  syncXpQqDiffShadows();
  const diffShadowObserver = new MutationObserver(syncXpQqDiffShadows);
  diffShadowObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-heige-codex-skin"],
    childList: true,
    subtree: true,
  });
  trackedObservers.add(diffShadowObserver);

  const native = row("\\u539f\\u751f\\u754c\\u9762", "rgba(0,0,0,.24)", () => {
    void requestThemeSelection(data.nativeSel).then((applied) => {
      if (applied) setPanelOpen(false, { focusTrigger: true });
    });
  }, null, { role: "native-option", selectable: true });
  native.dataset.heigeThemeId = data.nativeSel;
  rows.set(null, native);

  // ---- 常驻开关：只显示控制器确认的真实状态，不使用 localStorage 伪造持久化 ----
  let getPersistenceState = () => null;
  let applyRemotePersistence = () => false;
  let controlRequest = null;
  if (data.control?.available === true) {
    const section = document.createElement("section");
    section.dataset.heigeRole = "persistence-section";
    section.style.cssText = "margin-top:6px;padding:10px;border-top:1px solid rgba(23,52,79,.1);background:rgba(36,201,215,.055);border-radius:9px;";

    const heading = document.createElement("div");
    heading.style.cssText = "display:flex;align-items:center;justify-content:space-between;gap:14px;";
    const headingCopy = document.createElement("div");
    headingCopy.style.cssText = "min-width:0;";
    const headingTitle = document.createElement("div");
    headingTitle.id = data.menuId + "-persistence-title";
    headingTitle.textContent = "皮肤常驻";
    headingTitle.style.cssText = "font-weight:750;letter-spacing:.01em;color:#17344f;";
    const headingState = document.createElement("div");
    headingState.id = data.menuId + "-persistence-state";
    headingState.dataset.heigeRole = "persistence-state";
    headingState.style.cssText = "margin-top:1px;font-size:11px;color:rgba(23,52,79,.68);";
    headingCopy.append(headingTitle, headingState);

    const persistenceSwitch = document.createElement("button");
    persistenceSwitch.type = "button";
    persistenceSwitch.dataset.heigeRole = "persistence-switch";
    persistenceSwitch.setAttribute("role", "switch");
    persistenceSwitch.setAttribute("tabindex", "0");
    persistenceSwitch.setAttribute("aria-labelledby", headingTitle.id);
    persistenceSwitch.style.cssText = "position:relative;flex:none;width:42px;height:24px;padding:0;border:1px solid #31526b;border-radius:999px;cursor:pointer;-webkit-app-region:no-drag;";
    const switchKnob = document.createElement("span");
    switchKnob.setAttribute("aria-hidden", "true");
    switchKnob.style.cssText = "position:absolute;top:3px;width:16px;height:16px;border-radius:50%;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.24);";
    persistenceSwitch.appendChild(switchKnob);
    heading.append(headingCopy, persistenceSwitch);

    const helper = document.createElement("p");
    helper.id = data.menuId + "-persistence-helper";
    helper.dataset.heigeRole = "persistence-helper";
    helper.textContent = "关闭后，本次继续使用当前主题；下次启动将恢复原生界面。\\n重新启用时，请运行项目安装脚本，再打开此开关。";
    helper.style.cssText = "margin:8px 0 0;white-space:pre-line;font-size:11px;line-height:1.55;color:rgba(23,52,79,.74);";
    persistenceSwitch.setAttribute("aria-describedby", headingState.id + " " + helper.id);

    const confirmation = document.createElement("div");
    confirmation.dataset.heigeRole = "persistence-confirmation";
    confirmation.setAttribute("role", "group");
    confirmation.setAttribute("aria-describedby", helper.id);
    confirmation.setAttribute("aria-busy", "false");
    confirmation.hidden = true;
    confirmation.style.cssText = "margin-top:9px;padding:9px;border:1px solid rgba(187,72,50,.24);border-radius:8px;background:rgba(255,244,240,.92);";
    const confirmationText = document.createElement("div");
    confirmationText.id = data.menuId + "-persistence-confirmation-text";
    confirmationText.textContent = "确认关闭常驻？本次会话仍继续使用皮肤，下次启动将恢复原生界面。";
    confirmationText.style.cssText = "font-size:11px;line-height:1.55;color:#713a31;";
    confirmation.setAttribute("aria-labelledby", confirmationText.id);
    const confirmationActions = document.createElement("div");
    confirmationActions.style.cssText = "display:flex;justify-content:flex-end;gap:7px;margin-top:8px;";
    const cancel = document.createElement("button");
    cancel.type = "button";
    cancel.dataset.heigeRole = "persistence-cancel";
    cancel.textContent = "取消";
    cancel.style.cssText = "padding:4px 9px;border:1px solid rgba(23,52,79,.18);border-radius:6px;background:#fff;color:#17344f;cursor:pointer;";
    const confirm = document.createElement("button");
    confirm.type = "button";
    confirm.dataset.heigeRole = "persistence-confirm";
    confirm.textContent = "确认关闭";
    confirm.style.cssText = "padding:4px 9px;border:1px solid #a84232;border-radius:6px;background:#a84232;color:#fff;cursor:pointer;";
    confirmationActions.append(cancel, confirm);
    confirmation.append(confirmationText, confirmationActions);

    const alert = document.createElement("div");
    alert.dataset.heigeRole = "persistence-alert";
    alert.setAttribute("role", "alert");
    alert.setAttribute("aria-live", "polite");
    alert.hidden = true;
    alert.style.cssText = "margin-top:8px;padding:7px 8px;border-radius:7px;background:rgba(23,52,79,.07);font-size:11px;line-height:1.5;color:#17344f;white-space:pre-line;";

    section.append(heading, helper, confirmation, alert);
    panel.appendChild(section);

    let persistenceEnabled = data.control.persistenceEnabled;
    let controlRevision = data.control.revision;
    let pending = false;
    let themePending = false;
    let controlRequestTimeout = null;
    const themeEndpoint = data.control.endpoint.slice(0, -"/v1/persistence".length) + "/v1/theme";
    const newRequestId = () => {
      const bytes = new Uint8Array(16);
      globalThis.crypto.getRandomValues(bytes);
      return [...bytes].map((value) => value.toString(16).padStart(2, "0")).join("");
    };

    const closeConfirmation = ({ restoreFocus = false } = {}) => {
      assertCurrent();
      if (confirmation.hidden) return false;
      if (restoreFocus) {
        if (pending) button.focus();
        else persistenceSwitch.focus();
      }
      confirmation.hidden = true;
      confirmation.setAttribute("aria-busy", "false");
      cancel.removeAttribute("aria-disabled");
      confirm.removeAttribute("aria-disabled");
      return true;
    };

    const showAlert = (message, kind = "error") => {
      assertCurrent();
      alert.textContent = message;
      alert.style.background = kind === "success" ? "rgba(26,132,103,.10)" : "rgba(187,72,50,.10)";
      alert.style.color = kind === "success" ? "#175f4d" : "#713a31";
      alert.hidden = false;
    };
    const hideAlert = () => { assertCurrent(); alert.hidden = true; alert.textContent = ""; };
    const paintPersistence = () => {
      assertCurrent();
      persistenceSwitch.setAttribute("aria-checked", String(persistenceEnabled));
      persistenceSwitch.setAttribute("aria-busy", String(pending));
      persistenceSwitch.disabled = pending;
      persistenceSwitch.style.background = persistenceEnabled ? "#087d8a" : "#66788a";
      persistenceSwitch.style.opacity = pending ? ".64" : "1";
      switchKnob.style.left = persistenceEnabled ? "21px" : "4px";
      headingState.textContent = pending ? "正在等待后台确认…" : persistenceEnabled ? "已开启，下次启动继续使用" : "已关闭，仅保留本次会话";
    };
    const safeClientError = (error) => {
      if (error?.name === "AbortError") return "控制器请求超时，请重试";
      let detail = typeof error?.message === "string" ? error.message : "无法连接后台控制器";
      detail = detail
        .split(data.control.token).join("[已隐去]")
        .split(data.control.endpoint).join("本机控制端点")
        .split(themeEndpoint).join("本机主题端点");
      detail = detail.replace(/[\\r\\n\\t]+/g, " ").slice(0, 160);
      return detail.includes("控制器不可用") ? detail : "控制器不可用：" + detail;
    };
    const clearControlRequest = () => {
      const cleared = controlRequest;
      if (controlRequestTimeout !== null) clearLater(controlRequestTimeout);
      controlRequestTimeout = null;
      controlRequest = null;
      return cleared;
    };
    const queueControlRequest = (request) => {
      if (controlRequest !== null) return false;
      controlRequest = request;
      controlRequestTimeout = later(() => {
        if (controlRequest?.requestId !== request.requestId) return;
        clearControlRequest();
        if (request.action === "set-persistence") {
          pending = false;
          closeConfirmation({ restoreFocus: true });
          paintPersistence();
        } else {
          themePending = false;
          for (const item of rows.values()) item.disabled = false;
        }
        showAlert("后台控制器未确认，请重试");
      }, 15000);
      showAlert("正在等待后台确认…", "success");
      return true;
    };
    const isRevision = (value) => Number.isSafeInteger(value) && value >= 0;
    requestThemeSelection = async (themeId) => {
      assertCurrent();
      const currentThemeId = document.documentElement.dataset.heigeCodexSkin ?? data.nativeSel;
      if (themePending || themeId === currentThemeId) return false;
      if (
        themeId !== data.nativeSel &&
        !data.themes.some((theme) => theme.id === themeId)
      ) return false;
      const requestRevision = controlRevision;
      const fallbackRequest = {
        schemaVersion: 1,
        requestId: newRequestId(),
        action: "set-theme",
        capability: data.control.token,
        expectedRevision: requestRevision,
        themeId,
      };
      themePending = true;
      let queued = false;
      hideAlert();
      for (const item of rows.values()) item.disabled = true;
      queued = queueControlRequest(fallbackRequest);
      if (!queued) {
        themePending = false;
        for (const item of rows.values()) item.disabled = false;
        showAlert("已有主题切换正在等待后台确认");
        return false;
      }
      const abortController = childController();
      const timeoutId = later(() => abortController.abort(), 3000);
      try {
        const response = await fetch(themeEndpoint, {
          method: "POST",
          mode: "cors",
          cache: "no-store",
          credentials: "omit",
          redirect: "error",
          referrerPolicy: "no-referrer",
          headers: {
            "Content-Type": "application/json",
            "X-HeiGe-Control-Token": data.control.token,
          },
          body: JSON.stringify({ revision: requestRevision, themeId }),
          signal: abortController.signal,
        });
        assertCurrent();
        const body = await response.json();
        assertCurrent();
        clearControlRequest();
        queued = false;
        if (!response.ok) {
          if (
            body?.ok === false &&
            body.persistenceEnabled === persistenceEnabled &&
            isRevision(body.revision) &&
            body.revision > controlRevision
          ) {
            controlRevision = body.revision;
            publish("persistence", { enabled: persistenceEnabled, revision: controlRevision });
          }
          const message = typeof body?.message === "string" && body.message.length <= 160
            ? body.message
            : "后台拒绝了主题选择，界面未更改";
          showAlert(message);
          return false;
        }
        if (
          body?.ok !== true ||
          body.themeId !== themeId ||
          body.persistenceEnabled !== persistenceEnabled ||
          !isRevision(body.revision) ||
          body.revision < requestRevision ||
          body.revision < controlRevision
        ) {
          throw new Error("后台未确认主题选择，界面未更改");
        }
        controlRevision = body.revision;
        publish("persistence", { enabled: persistenceEnabled, revision: controlRevision });
        if (themeId === data.nativeSel) clearTheme(true, true);
        else setTheme(themeId, true, true);
        showAlert("主题选择已保存。", "success");
        return true;
      } catch (error) {
        if (isCurrent() && !queued) showAlert(safeClientError(error));
        return false;
      } finally {
        clearLater(timeoutId);
        trackedControllers.delete(abortController);
        if (isCurrent()) {
          if (!queued) {
            themePending = false;
            for (const item of rows.values()) item.disabled = false;
          }
        }
      }
    };
    const requestPersistence = async (target, restoreFocus = false) => {
      assertCurrent();
      if (pending || target === persistenceEnabled) return;
      const previousEnabled = persistenceEnabled;
      const requestRevision = controlRevision;
      const fallbackRequest = {
        schemaVersion: 1,
        requestId: newRequestId(),
        action: "set-persistence",
        capability: data.control.token,
        expectedRevision: requestRevision,
        persistenceEnabled: target,
      };
      pending = true;
      let queued = false;
      if (!target && !confirmation.hidden) {
        confirmation.setAttribute("aria-busy", "true");
        cancel.setAttribute("aria-disabled", "true");
        confirm.setAttribute("aria-disabled", "true");
      }
      hideAlert();
      paintPersistence();
      const abortController = childController();
      const timeoutId = later(() => abortController.abort(), 3000);
      try {
        const response = await fetch(data.control.endpoint, {
          method: "POST",
          mode: "cors",
          cache: "no-store",
          credentials: "omit",
          redirect: "error",
          referrerPolicy: "no-referrer",
          headers: {
            "Content-Type": "application/json",
            "X-HeiGe-Control-Token": data.control.token,
          },
          body: JSON.stringify({ revision: requestRevision, persistenceEnabled: target }),
          signal: abortController.signal,
        });
        assertCurrent();
        const body = await response.json();
        assertCurrent();
        if (response.ok) {
          if (
            body?.ok !== true ||
            body.persistenceEnabled !== target ||
            !isRevision(body.revision) ||
            body.revision <= requestRevision
          ) {
            throw new Error("后台响应无效，开关未更改");
          }
          if (body.revision <= controlRevision) return;
          persistenceEnabled = target;
          controlRevision = body.revision;
          publish("persistence", { enabled: persistenceEnabled, revision: controlRevision });
          showAlert(target
            ? "常驻已开启，下次启动继续使用皮肤。"
            : "常驻已关闭。本次继续使用当前主题，下次启动将恢复原生界面。\\n重新启用时，请运行项目安装脚本，再打开此开关。",
          "success");
        } else {
          if (
            body?.ok === false &&
            body.persistenceEnabled === previousEnabled &&
            isRevision(body.revision) &&
            body.revision > requestRevision
          ) {
            controlRevision = body.revision;
          }
          const message = typeof body?.message === "string" && body.message.length <= 160
            ? body.message
            : "后台拒绝了常驻设置，开关未更改";
          showAlert(message);
        }
      } catch (error) {
        if (!isCurrent()) return;
        if (error?.message?.includes("后台响应无效")) {
          showAlert(error.message);
        } else {
          queued = queueControlRequest(fallbackRequest);
          if (!queued) showAlert(safeClientError(error));
        }
      } finally {
        clearLater(timeoutId);
        trackedControllers.delete(abortController);
        if (!isCurrent()) return;
        if (!queued) pending = false;
        paintPersistence();
        if (restoreFocus) closeConfirmation({ restoreFocus: true });
      }
    };
    applyRemotePersistence = (value) => {
      assertCurrent();
      if (value.revision <= controlRevision) return false;
      const cleared = clearControlRequest();
      if (cleared?.action === "set-persistence") pending = false;
      if (cleared?.action === "set-theme") {
        themePending = false;
        for (const item of rows.values()) item.disabled = false;
      }
      closeConfirmation({ restoreFocus: !confirmation.hidden });
      persistenceEnabled = value.enabled;
      controlRevision = value.revision;
      hideAlert();
      paintPersistence();
      return true;
    };
    const activatePersistenceSwitch = () => {
      assertCurrent();
      if (pending) return;
      if (persistenceEnabled) {
        hideAlert();
        confirmation.hidden = false;
        confirmation.setAttribute("aria-busy", "false");
        cancel.focus();
      } else {
        void requestPersistence(true);
      }
    };
    listen(persistenceSwitch, "click", activatePersistenceSwitch);
    listen(persistenceSwitch, "keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      activatePersistenceSwitch();
    });
    listen(cancel, "click", () => {
      if (pending) return;
      closeConfirmation({ restoreFocus: true });
    });
    listen(confirmation, "keydown", (event) => {
      if (event.key !== "Escape" || confirmation.hidden || pending) return;
      event.preventDefault();
      event.stopPropagation();
      closeConfirmation({ restoreFocus: true });
    });
    listen(confirm, "click", () => { void requestPersistence(false, true); });
    getPersistenceState = () => { assertCurrent(); return { persistenceEnabled, revision: controlRevision, pending }; };
    paintPersistence();
  }

  // ---- 隐藏按钮：收成半透明小圆点少占地方，点圆点恢复，状态跨重启保留 ----
  const readHidden = () => { assertCurrent(); try { return localStorage.getItem(data.hiddenKey) === "1"; } catch { return false; } };
  const writeHidden = (value) => { assertCurrent(); try { if (value) localStorage.setItem(data.hiddenKey, "1"); else localStorage.removeItem(data.hiddenKey); } catch {} };
  const FULL_BUTTON_CSS = button.style.cssText;
  const MINI_BUTTON_CSS = "display:block;margin:0 auto;width:24px;height:24px;border:0;background:transparent;box-shadow:none;cursor:pointer;font-size:0;padding:0;-webkit-app-region:no-drag;";
  const setHidden = (value, persist = true, broadcast = true) => {
    assertCurrent();
    if (typeof value !== "boolean") return;
    const panelHadFocus = panel.contains(document.activeElement);
    if (value) setPanelOpen(false, { focusTrigger: panelHadFocus });
    hidden = value;
    button.style.cssText = value ? MINI_BUTTON_CSS : FULL_BUTTON_CSS;
    triggerGlyph.textContent = value ? "" : "\\u{1F3A8}";
    triggerGlyph.style.cssText = value
      ? "display:block;margin:auto;width:10px;height:10px;border-radius:50%;background:#66788a;box-shadow:0 1px 4px rgba(0,0,0,.18);opacity:.55;"
      : "";
    button.title = value ? "\\u663e\\u793a\\u6362\\u80a4\\u6309\\u94ae" : "Codex 主题切换";
    setPanelOpen(false);
    if (persist) writeHidden(value);
    if (broadcast) publish("menu-hidden", value);
  };
  listen(button, "mouseenter", () => { if (hidden) { triggerGlyph.style.opacity = ".9"; triggerGlyph.style.transform = "scale(1.15)"; } });
  listen(button, "mouseleave", () => { if (hidden) { triggerGlyph.style.opacity = ".55"; triggerGlyph.style.transform = "scale(1)"; } });
  const hideRow = row("\\u9690\\u85cf\\u6b64\\u6309\\u94ae", "rgba(0,0,0,.18)", () => setHidden(true), null, { role: "hide-trigger" });
  hideRow.style.borderTop = "1px solid rgba(0,0,0,.08)";

  const receivedSequences = new Map();
  const rememberSequence = (senderGeneration, sequence) => {
    if (!receivedSequences.has(senderGeneration) && receivedSequences.size >= 256) {
      receivedSequences.delete(receivedSequences.keys().next().value);
    }
    receivedSequences.delete(senderGeneration);
    receivedSequences.set(senderGeneration, sequence);
  };
  const exactKeys = (value, expected) => {
    if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
    const keys = Object.keys(value).sort();
    const sorted = [...expected].sort();
    return keys.length === sorted.length && keys.every((key, index) => key === sorted[index]);
  };
  const normalizeBroadcast = (message) => {
    if (!exactKeys(message, ["schemaVersion", "senderGeneration", "sequence", "kind", "value"])) return null;
    if (
      message.schemaVersion !== 1
      || typeof message.senderGeneration !== "string"
      || !/^[0-9a-f]{32}$/.test(message.senderGeneration)
      || message.senderGeneration === generation
      || !Number.isSafeInteger(message.sequence)
      || message.sequence < 1
      || !["theme", "menu-hidden", "persistence"].includes(message.kind)
    ) return null;
    if (message.kind === "theme") {
      if (
        typeof message.value !== "string"
        || (
          message.value !== data.nativeSel
          && !data.themes.some((theme) => theme.id === message.value)
        )
      ) return null;
    } else if (message.kind === "menu-hidden") {
      if (typeof message.value !== "boolean") return null;
    } else if (
      !exactKeys(message.value, ["enabled", "revision"])
      || typeof message.value.enabled !== "boolean"
      || !Number.isSafeInteger(message.value.revision)
      || message.value.revision < 0
    ) return null;
    return message;
  };
  const receiveBroadcast = (event) => {
    try {
      const message = normalizeBroadcast(event?.data);
      if (message === null) return;
      const previous = receivedSequences.get(message.senderGeneration) ?? 0;
      if (message.sequence <= previous) return;
      if (message.kind === "theme" && message.value === data.nativeSel) {
        clearTheme(true, false);
      } else if (message.kind === "theme") {
        setTheme(message.value, true, false);
      } else if (message.kind === "menu-hidden") {
        setHidden(message.value, true, false);
      } else {
        applyRemotePersistence(message.value);
      }
      rememberSequence(message.senderGeneration, message.sequence);
    } catch {}
  };
  if (rawChannel !== null) listen(rawChannel, "message", receiveBroadcast);
  listen(window, "storage", (event) => {
    try {
      if (event.key === data.selectedKey) {
        if (event.newValue === data.nativeSel) clearTheme(false, false);
        else if (data.themes.some((theme) => theme.id === event.newValue)) {
          setTheme(event.newValue, false, false);
        }
      } else if (event.key === data.hiddenKey && (event.newValue === "1" || event.newValue === null)) {
        setHidden(event.newValue === "1", false, false);
      } else if (event.key === data.profile.storageKey) {
        const profile = event.newValue === null
          ? { ...data.profile.defaults }
          : readStoredProfile(event.newValue);
        if (profile) applyXpQqProfile(profile);
      }
    } catch {}
  });

  listen(button, "click", () => {
    assertCurrent();
    if (hidden) { setHidden(false); return; }
    setPanelOpen(panel.style.display === "none");
  });

  root.append(button, panel);
  document.body.appendChild(root);
  const restore = () => {
    if (data.activeId === null) clearTheme(true, false);
    else setTheme(data.activeId, true, false);
  };
  restore();
  if (readHidden()) setHidden(true, false, false);

  statusSnapshot = () => {
    assertCurrent();
    const themeId = document.documentElement.dataset.heigeCodexSkin ?? null;
    const persistence = getPersistenceState();
    return {
      generation,
      themeId,
      menu: root.isConnected,
      mode: themeId === null ? "native" : "active",
      persistenceEnabled: persistence?.persistenceEnabled ?? false,
      revision: persistence?.revision ?? 0,
      controlRequest: controlRequest === null ? null : { ...controlRequest },
    };
  };
  window.__heigeCodexSkin = { generation, setTheme, clearTheme, setHidden, getPersistenceState };
  return true;
})()`;
}
