import test from "node:test";
import assert from "node:assert/strict";

import { buildSkinCss } from "../src/skin-css.mjs";

const PIXEL = "data:image/png;base64,AA==";

test("XP QQ CSS provides stable file and terminal chrome", () => {
  const css = buildSkinCss({
    theme: { id: "xp-qq", colors: {} },
    heroDataUrl: PIXEL,
  });

  assert.match(css, /#heige-xp-qq-file-title:not\(\[hidden\]\)/);
  assert.match(css, /position: fixed/);
  assert.match(css, /\[id\^="terminal-panel-"\]/);
  assert.match(css, /background-color: #10283c !important/);
});

test("XP QQ CSS anchors the skin trigger and does not advertise fake composer tools", () => {
  const css = buildSkinCss({
    theme: { id: "xp-qq", colors: {} },
    heroDataUrl: PIXEL,
  });

  assert.match(css, /#heige-codex-skin-menu \{[^}]*width: 52px !important/s);
  assert.match(css, /#heige-codex-skin-menu-panel \{[^}]*left: 0 !important/s);
  assert.doesNotMatch(css, /字体|表情|截图/);
  assert.doesNotMatch(css, /\.composer-surface-chrome::before/);
});
