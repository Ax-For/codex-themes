import test from "node:test";
import assert from "node:assert/strict";

import {
  XP_QQ_AVATAR_RULES,
  buildSkinMenuScript,
  computeXpQqAvatarCrop,
  isSafeXpQqAvatarDataUrl,
  validateXpQqAvatarFileMeta,
} from "../src/skin-menu.mjs";

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

test("generated skin menu installs the local XP QQ avatar editor", () => {
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
  assert.match(script, /ResizeObserver/);
  assert.match(script, /MutationObserver/);
});
