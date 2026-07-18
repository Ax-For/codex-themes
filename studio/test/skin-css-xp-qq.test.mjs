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
  assert.match(css, /#heige-codex-skin-menu \{[^}]*left: 286px !important/s);
  assert.match(css, /#heige-codex-skin-menu-panel \{[^}]*left: 0 !important/s);
  assert.doesNotMatch(css, /字体|表情|截图/);
  assert.doesNotMatch(css, /\.composer-surface-chrome::before/);
});

test("XP QQ CSS exposes an owned mode proxy without moving the native trigger", () => {
  const css = buildSkinCss({
    theme: { id: "xp-qq", colors: {} },
    heroDataUrl: PIXEL,
  });

  assert.match(css, /#heige-xp-qq-mode-switch \{[^}]*top: 58px !important/s);
  assert.match(css, /#heige-xp-qq-mode-switch \{[^}]*left: 208px !important/s);
  assert.match(css, /#heige-xp-qq-mode-switch \{[^}]*width: 72px !important/s);
  assert.match(css, /\[data-heige-native-mode-hidden="true"\] \{[^}]*clip-path: inset\(50%\) !important/s);
});

test("XP QQ CSS keeps the shadow-DOM review diff on a readable light palette", () => {
  const css = buildSkinCss({
    theme: { id: "xp-qq", colors: {} },
    heroDataUrl: PIXEL,
  });

  assert.match(css, /diffs-container \{[^}]*color-scheme: light !important/s);
  assert.match(css, /diffs-container \{[^}]*--diffs-bg: #ffffff !important/s);
  assert.match(css, /diffs-container \{[^}]*--diffs-fg: #20364a !important/s);
  assert.match(css, /diffs-container \{[^}]*--diffs-bg-addition: #e8f5ee !important/s);
  assert.match(css, /diffs-container \{[^}]*--diffs-bg-deletion: #fdeceb !important/s);
  assert.match(css, /diffs-container \{[^}]*--diffs-bg-separator: #e6eef4 !important/s);
});

test("XP QQ CSS turns the empty home state into a compact chat welcome", () => {
  const css = buildSkinCss({
    theme: { id: "xp-qq", colors: {} },
    heroDataUrl: PIXEL,
  });

  assert.match(css, /\[data-heige-role="xp-qq-welcome-space"\]/);
  assert.match(css, /\[data-heige-role="xp-qq-welcome-message"\]::before \{[^}]*content: "Codex 助手"/s);
  assert.match(css, /\[data-heige-role="xp-qq-welcome-suggestions"\]::before \{[^}]*content: "快捷回复"/s);
  assert.match(css, /\[data-heige-role="xp-qq-welcome-suggestions"\] \{[^}]*width: min\(710px, calc\(100% - 44px\)\) !important/s);
  assert.match(css, /\[data-heige-role="xp-qq-quick-replies"\][^{]*> div > div \{[^}]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/s);
  assert.match(css, /\[data-heige-role="xp-qq-quick-reply"\] \{[^}]*min-height: 58px !important/s);
  assert.match(css, /\[data-heige-role="xp-qq-welcome-message"\] \[data-testid="home-icon"\] \{[^}]*display: none !important/s);
});

test("XP QQ CSS reuses the custom profile image for user messages", () => {
  const css = buildSkinCss({
    theme: { id: "xp-qq", colors: {} },
    heroDataUrl: PIXEL,
  });

  assert.match(css, /\[data-heige-xp-qq-avatar="custom"\] \[data-user-message-bubble\]::after/);
  assert.match(css, /\[data-heige-xp-qq-avatar="custom"\] \[data-user-message-bubble\]::after \{[^}]*content: "" !important/s);
  assert.match(css, /\[data-heige-xp-qq-avatar="custom"\] \[data-user-message-bubble\]::after \{[^}]*background-image: var\(--heige-xp-qq-avatar-image\) !important/s);
  assert.match(css, /\[data-heige-xp-qq-avatar="custom"\] \[data-user-message-bubble\]::after \{[^}]*background-size: cover !important/s);
});

test("XP QQ CSS presents an editable compact identity profile", () => {
  const css = buildSkinCss({
    theme: { id: "xp-qq", colors: {} },
    heroDataUrl: PIXEL,
  });

  assert.match(css, /#heige-xp-qq-profile,\n#heige-xp-qq-profile-panel \{[^}]*display: none/s);
  assert.match(css, /\.app-shell-left-panel::before \{[^}]*height: 78px/s);
  assert.match(css, /\.app-shell-left-panel > \.max-w-full \{[^}]*padding-top: 78px/s);
  assert.match(css, /#heige-xp-qq-profile \{[^}]*top: 58px/s);
  assert.match(css, /#heige-xp-qq-profile \{[^}]*left: 66px/s);
  assert.match(css, /#heige-xp-qq-profile \{[^}]*grid-template-rows: 18px 16px 16px/s);
  assert.match(css, /\[data-heige-role="xp-qq-profile-heading-row"\] \{[^}]*display: flex/s);
  assert.match(css, /\[data-heige-role="xp-qq-profile-heading-row"\] \{[^}]*gap: 4px/s);
  assert.match(css, /\[data-heige-role="xp-qq-profile-nickname"\] \{[^}]*max-width: 112px/s);
  assert.match(css, /#heige-xp-qq-profile-editor \{[^}]*position: static/s);
  assert.match(css, /#heige-xp-qq-profile-editor \{[^}]*flex: 0 0 18px/s);
  assert.match(css, /\[data-heige-role="xp-qq-profile-nickname"\],\n:root\[data-heige-codex-skin="xp-qq"\] \[data-heige-role="xp-qq-profile-signature"\],\n:root\[data-heige-codex-skin="xp-qq"\] \[data-heige-role="xp-qq-profile-level"\] \{[^}]*text-overflow: ellipsis/s);
  assert.match(css, /#heige-xp-qq-profile-panel:not\(\[hidden\]\) \{[^}]*display: grid/s);
  assert.match(css, /#heige-xp-qq-profile-panel:not\(\[hidden\]\) \{[^}]*top: 114px/s);
  assert.match(css, /\[data-user-message-bubble\]::before \{[^}]*content: attr\(data-heige-xp-qq-nickname\)/s);
  assert.match(css, /\[data-user-message-bubble\]::before \{[^}]*text-overflow: ellipsis/s);
});

test("XP QQ CSS presents primary sidebar actions as a five-tab QQ toolbar", () => {
  const css = buildSkinCss({
    theme: { id: "xp-qq", colors: {} },
    heroDataUrl: PIXEL,
  });

  assert.match(css, /#heige-xp-qq-sidebar-actions \{[^}]*grid-template-columns: repeat\(5, minmax\(0, 1fr\)\) !important/s);
  assert.match(css, /\[data-heige-role="xp-qq-sidebar-action"\] \{[^}]*min-height: 56px !important/s);
  assert.match(css, /\[data-heige-role="xp-qq-sidebar-action"\][^{]*\.heige-xp-qq-sidebar-action-label \{[^}]*font: 600 11px\/1\.15/s);
  assert.match(css, /\[data-heige-role="xp-qq-sidebar-action"\][^{]*\.heige-xp-qq-sidebar-action-label \{[^}]*white-space: nowrap !important/s);
  assert.match(css, /\[data-heige-native-action-hidden="true"\] \{[^}]*display: none !important/s);
});

test("XP QQ CSS presents projects and threads as a recent-contact list", () => {
  const css = buildSkinCss({
    theme: { id: "xp-qq", colors: {} },
    heroDataUrl: PIXEL,
  });

  assert.match(css, /button\[data-app-action-sidebar-section-toggle\]::after \{[^}]*content: "最近会话"/s);
  assert.match(css, /\[data-heige-role="xp-qq-contact-group"\] \{[^}]*height: 28px !important/s);
  assert.match(css, /\[data-heige-role="xp-qq-contact-group"\] \{[^}]*background: transparent !important/s);
  assert.match(css, /\[data-heige-role="xp-qq-contact-group"\]::before \{[^}]*content: "▾"/s);
  assert.match(css, /\[data-heige-role="xp-qq-contact-group"\] > div:first-child > \[data-sidebar-project-drop-zone\] \{[^}]*display: none !important/s);
  assert.match(css, /\[data-heige-role="xp-qq-contact-group"\]::after \{[^}]*content: attr\(data-heige-contact-count\)/s);
  assert.match(css, /\[data-heige-role="xp-qq-contact"\] \{[^}]*height: 54px !important/s);
  assert.match(css, /\[data-heige-role="xp-qq-contact"\] \{[^}]*margin: 1px 7px !important/s);
  assert.match(css, /\[data-heige-role="xp-qq-contact"\] \{[^}]*border-radius: 4px !important/s);
  assert.match(css, /\[data-heige-role="xp-qq-contact"\]::before \{[^}]*content: attr\(data-heige-contact-initial\)/s);
  assert.match(css, /\[data-heige-role="xp-qq-contact"\]::before \{[^}]*width: 36px/s);
  assert.match(css, /\[data-heige-role="xp-qq-contact"\]::before \{[^}]*border-radius: 8px/s);
  assert.match(css, /\[data-heige-role="xp-qq-contact"\]::after \{[^}]*content: attr\(data-heige-contact-status\)/s);
  assert.match(css, /\[data-heige-role="xp-qq-contact"\] \[data-thread-title-trigger\] \{[^}]*position: absolute !important/s);
  assert.match(css, /\[data-heige-role="xp-qq-contact"\] \[data-thread-title\] \{[^}]*font: 500 12px\/20px/s);
  assert.match(css, /\[data-app-action-sidebar-thread-active="true"\] \[data-thread-title\][^{]*\{[^}]*font-weight: 650 !important/s);
  assert.match(css, /\[data-heige-role="xp-qq-contact-presence"\] \{[^}]*width: 8px/s);
  assert.match(css, /\[data-heige-role="xp-qq-contact"\]\[data-heige-contact-state="running"\] \{[^}]*background: #dfeef9 !important/s);
  assert.match(css, /\[data-heige-role="xp-qq-contact"\]\[data-heige-contact-state="running"\] \{[^}]*box-shadow: inset 3px 0 #2d79b8 !important/s);
  assert.doesNotMatch(css, /\] \[data-heige-contact-state="running"\] \{/);
  assert.match(css, /\[data-app-action-sidebar-thread-active="true"\] \{[^}]*background: #dfeef9 !important/s);
  assert.doesNotMatch(css, /\[data-heige-role="xp-qq-contact"\]\[data-heige-contact-state="running"\] \{[^}]*linear-gradient/s);
});
