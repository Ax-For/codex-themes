import test from "node:test";
import assert from "node:assert/strict";

import {
  XP_QQ_AVATAR_RULES,
  XP_QQ_PROFILE_RULES,
  buildSkinMenuScript,
  computeXpQqAvatarCrop,
  deriveXpQqContactIdentity,
  xpQqContactStatus,
  isSafeXpQqAvatarDataUrl,
  normalizeXpQqProfile,
  validateXpQqAvatarFileMeta,
} from "../src/skin-menu.mjs";

test("XP QQ contact identity is stable for Chinese, Latin and empty titles", () => {
  const chinese = deriveXpQqContactIdentity("  查找 Windows XP 风格  ", "thread-1");
  const latin = deriveXpQqContactIdentity(" codex themes ", "thread-2");
  const empty = deriveXpQqContactIdentity("  --  ", "thread-3");

  assert.equal(chinese.initial, "查");
  assert.equal(latin.initial, "C");
  assert.equal(empty.initial, "C");
  assert.equal(deriveXpQqContactIdentity(" codex themes ", "thread-2").tone, latin.tone);
  assert.ok(Number.isInteger(latin.tone) && latin.tone >= 0 && latin.tone <= 5);
});

test("XP QQ contact copy stays concise and only reflects real state", () => {
  assert.equal(xpQqContactStatus("running"), "正在处理");
  assert.equal(xpQqContactStatus("active"), "当前会话");
  assert.equal(xpQqContactStatus("pinned"), "已置顶");
  assert.equal(xpQqContactStatus("idle"), "本地会话");
  assert.equal(xpQqContactStatus("unknown"), "本地会话");
});

test("XP QQ avatar accepts supported local image metadata", () => {
  assert.equal(validateXpQqAvatarFileMeta({
    name: "portrait.webp",
    type: "image/webp",
    size: 512_000,
  }, XP_QQ_AVATAR_RULES), null);
});

test("XP QQ avatar rejects unsupported, mismatched and oversized files", () => {
  assert.match(validateXpQqAvatarFileMeta({
    name: "portrait.svg",
    type: "image/svg+xml",
    size: 1024,
  }, XP_QQ_AVATAR_RULES), /PNG、JPEG 或 WebP/);

  assert.match(validateXpQqAvatarFileMeta({
    name: "portrait.png",
    type: "image/jpeg",
    size: 1024,
  }, XP_QQ_AVATAR_RULES), /扩展名与文件类型不一致/);

  assert.match(validateXpQqAvatarFileMeta({
    name: "portrait.jpg",
    type: "image/jpeg",
    size: XP_QQ_AVATAR_RULES.maxInputBytes + 1,
  }, XP_QQ_AVATAR_RULES), /不能超过 8 MiB/);
});

test("XP QQ avatar crop is centered for landscape and portrait images", () => {
  assert.deepEqual(computeXpQqAvatarCrop(1200, 800), {
    sx: 200,
    sy: 0,
    size: 800,
  });
  assert.deepEqual(computeXpQqAvatarCrop(600, 900), {
    sx: 0,
    sy: 150,
    size: 600,
  });
  assert.throws(() => computeXpQqAvatarCrop(0, 900), /图片尺寸无效/);
});

test("XP QQ avatar persistence only accepts bounded raster data URLs", () => {
  const valid = "data:image/webp;base64," + "A".repeat(128);
  assert.equal(isSafeXpQqAvatarDataUrl(valid, XP_QQ_AVATAR_RULES), true);
  assert.equal(isSafeXpQqAvatarDataUrl("data:image/svg+xml;base64,PHN2Zz4=", XP_QQ_AVATAR_RULES), false);
  assert.equal(isSafeXpQqAvatarDataUrl(
    "data:image/webp;base64," + "A".repeat(XP_QQ_AVATAR_RULES.maxStoredChars),
    XP_QQ_AVATAR_RULES,
  ), false);
});

test("XP QQ profile accepts bounded nickname, signature and star level", () => {
  assert.deepEqual(normalizeXpQqProfile({
    nickname: "  AX_FOR  ",
    signature: " 等到狮子身上落满麻雀... ",
    level: 3,
  }, XP_QQ_PROFILE_RULES), {
    nickname: "AX_FOR",
    signature: "等到狮子身上落满麻雀...",
    level: 3,
  });

  assert.deepEqual(normalizeXpQqProfile({
    nickname: "For Ax",
    signature: "",
    level: 1,
  }, XP_QQ_PROFILE_RULES), {
    nickname: "For Ax",
    signature: "",
    level: 1,
  });
});

test("XP QQ profile rejects malformed or oversized stored values", () => {
  assert.equal(normalizeXpQqProfile(null, XP_QQ_PROFILE_RULES), null);
  assert.equal(normalizeXpQqProfile({ nickname: "", signature: "在线", level: 3 }, XP_QQ_PROFILE_RULES), null);
  assert.equal(normalizeXpQqProfile({
    nickname: "A".repeat(XP_QQ_PROFILE_RULES.nicknameMax + 1),
    signature: "在线",
    level: 3,
  }, XP_QQ_PROFILE_RULES), null);
  assert.equal(normalizeXpQqProfile({ nickname: "AX", signature: "在线", level: 0 }, XP_QQ_PROFILE_RULES), null);
  assert.equal(normalizeXpQqProfile({ nickname: "AX", signature: "在线", level: 2.5 }, XP_QQ_PROFILE_RULES), null);
  assert.equal(normalizeXpQqProfile({ nickname: "AX", signature: "在线", level: 3, extra: true }, XP_QQ_PROFILE_RULES), null);
});

test("generated skin menu installs the XP QQ runtime helpers", () => {
  const script = buildSkinMenuScript({
    entries: [{ id: "xp-qq", name: "Windows XP · QQ", accent: "#2879bd", css: ":root{}" }],
    activeId: "xp-qq",
    styleId: "skin-style",
    menuId: "skin-menu",
  });
  assert.match(script, /heige-xp-qq-avatar-editor/);
  assert.match(script, /image\/png,image\/jpeg,image\/webp/);
  assert.match(script, /computeXpQqAvatarCrop/);
  assert.match(script, /heigeCodexXpQqAvatarV1/);
  assert.match(script, /xp-qq-mode-switch/);
  assert.match(script, /heige-xp-qq-file-title/);
  assert.match(script, /heige-xp-qq-diff-shadow-style/);
  assert.match(script, /diffHost\.shadowRoot/);
  assert.match(script, /observedDiffShadows/);
  assert.match(script, /diffShadowObserver\.observe\(shadow/);
  assert.match(script, /shadow\.lastElementChild !== shadowStyle/);
  assert.match(script, /@layer base/);
  assert.match(script, /--diffs-bg-addition: #e8f5ee !important/);
  assert.match(script, /syncXpQqWelcome/);
  assert.match(script, /xp-qq-welcome-space/);
  assert.match(script, /xp-qq-welcome-message/);
  assert.match(script, /xp-qq-welcome-suggestions/);
  assert.match(script, /xp-qq-quick-replies/);
  assert.match(script, /xp-qq-quick-reply/);
  assert.match(script, /clearXpQqWelcomeRoles/);
  assert.match(script, /heige-xp-qq-sidebar-actions/);
  assert.match(script, /syncXpQqSidebarActions/);
  assert.match(script, /restoreXpQqSidebarActions/);
  assert.match(script, /xp-qq-sidebar-action/);
  assert.match(script, /data-heige-native-action-hidden/);
  assert.match(script, /"新建任务", "拉取请求", "站点", "已安排", "插件"/);
  assert.match(script, /syncXpQqContacts/);
  assert.match(script, /clearXpQqContacts/);
  assert.match(script, /xp-qq-contact-group/);
  assert.match(script, /xp-qq-contact-presence/);
  assert.match(script, /heigeContactInitial/);
  assert.match(script, /heigeContactProject/);
  assert.match(script, /heigeContactStatus/);
  assert.match(script, /heigeContactCount/);
  assert.match(script, /querySelector\("\.animate-spin"\)/);
  assert.match(script, /heige-xp-qq-profile/);
  assert.match(script, /heige-xp-qq-profile-editor/);
  assert.match(script, /xp-qq-profile-heading-row/);
  assert.match(script, /heigeCodexXpQqProfileV1/);
  assert.match(script, /syncXpQqUserNames/);
  assert.match(script, /data-heige-xp-qq-nickname/);
  assert.match(script, /QQ 等级/);
  assert.match(script, /profileCard\.style\.display = active \? "" : "none"/);
  assert.match(script, /avatarButton\.style\.display = active \? "" : "none"/);
  assert.match(script, /ResizeObserver/);
  assert.match(script, /MutationObserver/);
  assert.doesNotThrow(() => new Function(script));
});

test("XP QQ mode switching never reparents React-owned navigation nodes", () => {
  const script = buildSkinMenuScript({
    entries: [{ id: "xp-qq", name: "Windows XP · QQ", accent: "#2879bd", css: ":root{}" }],
    activeId: "xp-qq",
    styleId: "skin-style",
    menuId: "skin-menu",
  });

  assert.doesNotMatch(script, /appendChild\(modeSwitchNode\)/);
  assert.doesNotMatch(script, /insertBefore\(modeSwitchNode/);
  assert.doesNotMatch(script, /toolbar\.appendChild\(action\)/);
  assert.doesNotMatch(script, /xp-qq-sidebar-actions-source/);
  assert.match(script, /modeSwitchProxy/);
  assert.match(script, /data-heige-native-mode-hidden/);
  assert.match(script, /new PointerEvent\("pointerdown"/);
  assert.match(script, /nativeButton\.click\(\)/);
  assert.match(script, /data-heige-native-action-hidden/);
});
