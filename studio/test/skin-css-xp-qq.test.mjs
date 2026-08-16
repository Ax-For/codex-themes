import test from "node:test";
import assert from "node:assert/strict";

import { buildSkinCss } from "../src/skin-css.mjs";

const PIXEL = "data:image/png;base64,AA==";

test("XP QQ CSS provides stable file and terminal chrome", () => {
  const css = buildSkinCss({
    theme: { id: "xp-qq", colors: {} },
    heroDataUrl: PIXEL,
  });

  assert.match(css, /#codex-themes-xp-qq-file-title:not\(\[hidden\]\)/);
  assert.match(css, /position: fixed/);
  assert.match(
    css,
    /\[role="tabpanel"\]\[data-app-shell-tab-panel-controller="right"\]\[data-tab-id\^="file:"\]/,
  );
  assert.match(
    css,
    /\.isolate:has\(> \[role="tabpanel"\]\[data-app-shell-tab-panel-controller="right"\]\) \{[^}]*position: relative !important;[^}]*z-index: 26 !important;/s,
  );
  assert.match(
    css,
    /\.isolate:has\(> \[role="tabpanel"\]\[data-app-shell-tab-panel-controller="right"\]\) > \.h-toolbar/,
  );
  assert.match(
    css,
    /main\.main-surface::before \{[^}]*right: 0;[^}]*border-bottom: 1px solid #abc5d9;/s,
  );
  assert.doesNotMatch(css, /right: var\(--codex-themes-xp-qq-file-panel-inset/);
  assert.match(css, /\[data-app-shell-tab-controller="right"\]/);
  assert.match(css, /\[role="tab"\]\[aria-selected="true"\]/);
  assert.doesNotMatch(css, /\[role="tabpanel"\]\[aria-label="打开文件"\]/);
  assert.match(css, /\[id\^="terminal-panel-"\]/);
  assert.match(css, /background-color: #10283c !important/);
});

test("XP QQ CSS anchors the skin trigger and does not advertise fake composer tools", () => {
  const css = buildSkinCss({
    theme: { id: "xp-qq", colors: {} },
    heroDataUrl: PIXEL,
  });

  assert.match(css, /#codex-themes-skin-menu-panel \{[^}]*left: 0 !important/s);
  assert.match(
    css,
    /\[data-codex-themes-role="menu-trigger-glyph"\] \{[^}]*width: auto !important;[^}]*white-space: nowrap;/s,
  );
  assert.match(css, /#codex-themes-skin-menu > button \{[^}]*width: 30px !important/s);
  assert.doesNotMatch(css, /字体|表情|截图/);
  assert.doesNotMatch(css, /\.composer-surface-chrome::before/);
});

test("XP QQ CSS paints the editable avatar on its fixed control", () => {
  const css = buildSkinCss({
    theme: { id: "xp-qq", colors: {} },
    heroDataUrl: PIXEL,
  });

  assert.doesNotMatch(css, /\.app-shell-left-panel::after/);
  assert.match(
    css,
    /#codex-themes-xp-qq-avatar-editor::before \{[^}]*position: absolute;[^}]*inset: 0;/s,
  );
  assert.match(
    css,
    /\[data-codex-themes-xp-qq-avatar="custom"\] #codex-themes-xp-qq-avatar-editor::before \{[^}]*background-image: var\(--codex-themes-xp-qq-avatar-image\) !important;/s,
  );
});

test("XP QQ CSS exposes an owned mode proxy without moving the native trigger", () => {
  const css = buildSkinCss({
    theme: { id: "xp-qq", colors: {} },
    heroDataUrl: PIXEL,
  });

  assert.match(css, /#codex-themes-xp-qq-mode-switch \{[^}]*top: 58px !important/s);
  assert.match(css, /#codex-themes-xp-qq-mode-switch \{[^}]*left: 208px !important/s);
  assert.match(css, /#codex-themes-xp-qq-mode-switch \{[^}]*width: 72px !important/s);
  assert.match(css, /\[data-codex-themes-native-mode-hidden="true"\] \{[^}]*clip-path: inset\(50%\) !important/s);
});

test("XP QQ CSS keeps the native settings return action visible", () => {
  const css = buildSkinCss({
    theme: { id: "xp-qq", colors: {} },
    heroDataUrl: PIXEL,
  });

  assert.match(
    css,
    /\.app-shell-left-panel:has\(\[data-settings-panel-slug\]\) nav > div:first-child > \[role="link"\]:first-child \{[^}]*position: absolute !important;[^}]*z-index: 29 !important;[^}]*top: 58px !important;[^}]*right: 8px !important;[^}]*width: 30px !important;[^}]*height: 24px !important;/s,
  );
  assert.match(
    css,
    /\.app-shell-left-panel:has\(\[data-settings-panel-slug\]\) nav > div:first-child > \[role="link"\]:first-child > svg \{[^}]*width: 16px !important;[^}]*height: 16px !important;/s,
  );
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

  assert.match(css, /\[data-codex-themes-role="xp-qq-welcome-space"\]/);
  assert.match(css, /\[data-codex-themes-role="xp-qq-welcome-message"\]::before \{[^}]*content: "Codex 助手"/s);
  assert.match(css, /\[data-codex-themes-role="xp-qq-welcome-suggestions"\]::before \{[^}]*content: "快捷回复"/s);
  assert.match(css, /\[data-codex-themes-role="xp-qq-welcome-suggestions"\] \{[^}]*width: min\(710px, calc\(100% - 44px\)\) !important/s);
  assert.match(css, /\[data-codex-themes-role="xp-qq-quick-replies"\][^{]*> div > div \{[^}]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/s);
  assert.match(css, /\[data-codex-themes-role="xp-qq-quick-reply"\] \{[^}]*min-height: 58px !important/s);
  assert.match(css, /\[data-codex-themes-role="xp-qq-welcome-message"\] \[data-testid="home-icon"\] \{[^}]*display: none !important/s);
});

test("XP QQ CSS reuses the custom profile image for user messages", () => {
  const css = buildSkinCss({
    theme: { id: "xp-qq", colors: {} },
    heroDataUrl: PIXEL,
  });

  assert.match(css, /\[data-codex-themes-xp-qq-avatar="custom"\] \[data-user-message-bubble\]::after/);
  assert.match(css, /\[data-codex-themes-xp-qq-avatar="custom"\] \[data-user-message-bubble\]::after \{[^}]*content: "" !important/s);
  assert.match(css, /\[data-codex-themes-xp-qq-avatar="custom"\] \[data-user-message-bubble\]::after \{[^}]*background-image: var\(--codex-themes-xp-qq-avatar-image\) !important/s);
  assert.match(css, /\[data-codex-themes-xp-qq-avatar="custom"\] \[data-user-message-bubble\]::after \{[^}]*background-size: cover !important/s);
});

test("XP QQ CSS keeps wide Markdown tables inside assistant message bubbles", () => {
  const css = buildSkinCss({
    theme: { id: "xp-qq", colors: {} },
    heroDataUrl: PIXEL,
  });

  assert.match(
    css,
    /\[data-local-conversation-final-assistant\] \{[^}]*min-width: 0;[^}]*max-width: 100%;/s,
  );
  assert.match(
    css,
    /:is\(\[data-wide-markdown-block-kind="table"\], \[data-markdown-table="true"\]\) \{[^}]*--thread-content-margin: 0px !important;[^}]*--wide-block-width: 100% !important;[^}]*width: 100% !important;[^}]*max-width: 100% !important;[^}]*margin-inline: 0 !important;/s,
  );
  assert.match(
    css,
    /:is\(\[data-wide-markdown-block-kind="table"\], \[data-markdown-table="true"\]\) \[class\*="_tableScroller_"\] \{[^}]*width: 100% !important;[^}]*max-width: 100% !important;[^}]*overflow-x: auto !important;[^}]*justify-content: flex-start !important;/s,
  );
  assert.match(
    css,
    /:is\(\[data-wide-markdown-block-kind="table"\], \[data-markdown-table="true"\]\) \[class\*="_tableWrapper_"\] \{[^}]*min-width: 100% !important;[^}]*margin-inline: 0 !important;/s,
  );
});

test("XP QQ CSS gives long assistant Markdown a restrained readable type scale", () => {
  const css = buildSkinCss({
    theme: { id: "xp-qq", colors: {} },
    heroDataUrl: PIXEL,
  });

  assert.match(css, /--qq-workspace: #f5f7f9;/);
  assert.match(css, /--qq-message-assistant: #ffffff;/);
  assert.match(css, /--qq-message-user: #dff1ff;/);
  assert.match(
    css,
    /\[data-local-conversation-final-assistant\] \[data-content-search-unit-key\] :where\(p, li\) \{[^}]*font-size: 15px !important;[^}]*line-height: 1\.72 !important;/s,
  );
  assert.match(
    css,
    /\[data-local-conversation-final-assistant\] \[data-content-search-unit-key\] :where\(h1\) \{[^}]*font-size: 23px !important;[^}]*line-height: 1\.32 !important;/s,
  );
  assert.match(
    css,
    /main \[class~="gap-\[var\(--conversation-item-gap,16px\)\]"\] \[data-content-search-unit-key\]:not\(\[data-local-conversation-final-assistant\] \*\):not\(\[class\*="conversation-patch-file"\] \*\) \{[^}]*max-width: 720px;[^}]*margin-left: 28px;[^}]*padding: 7px 10px !important;[^}]*border: 1px solid #d7e4ed !important;[^}]*background: rgba\(255, 255, 255, \.72\) !important;/s,
  );
  assert.match(
    css,
    /main \[class~="gap-\[var\(--conversation-item-gap,16px\)\]"\] \[data-content-search-unit-key\]:not\(\[data-local-conversation-final-assistant\] \*\):not\(\[class\*="conversation-patch-file"\] \*\)::before \{[^}]*content: "···" !important;[^}]*width: 18px;[^}]*height: 18px;/s,
  );
  assert.match(
    css,
    /main \[class~="gap-\[var\(--conversation-item-gap,16px\)\]"\] \[data-content-search-unit-key\]:not\(\[data-local-conversation-final-assistant\] \*\):not\(\[class\*="conversation-patch-file"\] \*\) \{[^}]*font-size: 13px !important;[^}]*line-height: 1\.65 !important;/s,
  );
  assert.doesNotMatch(css, /\[class\*="conversation-item-gap"\]/);
});

test("XP QQ CSS isolates document, file, diff, settings and terminal surfaces", () => {
  const css = buildSkinCss({
    theme: { id: "xp-qq", colors: {} },
    heroDataUrl: PIXEL,
  });

  assert.match(css, /--qq-utility-chrome: #f3f6f8;/);
  assert.match(
    css,
    /\.main-surface,\n:root\[data-codex-themes-skin="xp-qq"\] \.browser-main-surface \{[^}]*background: var\(--qq-workspace\) !important;/s,
  );
  assert.match(
    css,
    /:has\(\[data-settings-panel-slug\]\) main\.main-surface \{[^}]*background: #f7f8fa !important;/s,
  );
  assert.match(
    css,
    /:has\(\[data-settings-panel-slug\]\) main\.main-surface::before,[\s\S]*display: none !important;/s,
  );
  assert.match(
    css,
    /:has\(\[data-settings-panel-slug\]\) \[class\*="rounded-2xl"\]\[class\*="border-token-border"\] \{[^}]*background: var\(--qq-panel\) !important;[^}]*border-radius: 8px !important;/s,
  );
  assert.match(
    css,
    /\[class\*="bg-surface-elevated-secondary"\] \{[^}]*background: #f8fbfe !important;[^}]*backdrop-filter: none !important;/s,
  );
  assert.match(
    css,
    /\[class\*="before:bg-surface-elevated-secondary"\]::before \{[^}]*background: #f8fbfe !important;/s,
  );
  assert.match(
    css,
    /\[data-composer-surface-variant="default"\] \{[^}]*border-radius: 5px !important;[^}]*background: #fff !important;/s,
  );
  assert.match(
    css,
    /\[data-codex-composer-root\] \[data-codex-composer="true"\] \{[^}]*color: #20364a !important;[^}]*caret-color: #155d9f !important;/s,
  );
  assert.match(
    css,
    /button\[data-codex-intelligence-trigger="true"\] :where\(\[data-tooltip-overflow-target="true"\], \[class\*="_ModelPickerTrigger"\]\) \{[^}]*color: #20364a !important;/s,
  );
  assert.match(
    css,
    /\[data-tab-id\^="file:"\] \{[^}]*background: var\(--qq-panel\) !important;/s,
  );
  assert.match(css, /diffs-container \{[^}]*background-color: var\(--qq-panel\) !important;/s);
  assert.match(css, /\[id\^="terminal-panel-"\][\s\S]*background-color: #10283c !important/);
});

test("XP QQ CSS styles Markdown tables as local neutral scrollers", () => {
  const css = buildSkinCss({
    theme: { id: "xp-qq", colors: {} },
    heroDataUrl: PIXEL,
  });

  assert.match(
    css,
    /\[class\*="_tableScroller_"\] \{[^}]*overscroll-behavior-inline: contain !important;[^}]*scrollbar-gutter: stable;/s,
  );
  assert.match(
    css,
    /\[data-content-search-unit-key\] table \{[^}]*font-size: 13px !important;[^}]*line-height: 1\.5 !important;/s,
  );
  assert.match(
    css,
    /\[data-content-search-unit-key\] th \{[^}]*background: #f1f4f6 !important;/s,
  );
});

test("XP QQ CSS exposes keyboard focus, reduced motion and a safe DOM fallback", () => {
  const css = buildSkinCss({
    theme: { id: "xp-qq", colors: {} },
    heroDataUrl: PIXEL,
  });

  assert.match(css, /\[data-codex-themes-role\]:focus-visible/);
  assert.match(css, /outline: 2px solid var\(--qq-focus\) !important/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(
    css,
    /\[data-codex-themes-xp-qq-compatibility="fallback"\] #codex-themes-xp-qq-profile[\s\S]*display: none !important/s,
  );
  assert.match(
    css,
    /\[data-codex-themes-xp-qq-compatibility="fallback"\] \[data-codex-themes-native-action-hidden="true"\] \{[^}]*display: revert !important;/s,
  );
});

test("XP QQ CSS presents an editable compact identity profile", () => {
  const css = buildSkinCss({
    theme: { id: "xp-qq", colors: {} },
    heroDataUrl: PIXEL,
  });

  assert.match(css, /#codex-themes-xp-qq-profile,\n#codex-themes-xp-qq-profile-panel \{[^}]*display: none/s);
  assert.match(css, /\.app-shell-left-panel::before \{[^}]*height: 78px/s);
  assert.match(css, /\.app-shell-left-panel > \.max-w-full \{[^}]*padding-top: 78px/s);
  assert.match(css, /#codex-themes-xp-qq-profile \{[^}]*top: 58px/s);
  assert.match(css, /#codex-themes-xp-qq-profile \{[^}]*left: 66px/s);
  assert.match(css, /#codex-themes-xp-qq-profile \{[^}]*grid-template-rows: 18px 16px 16px/s);
  assert.match(css, /\[data-codex-themes-role="xp-qq-profile-heading-row"\] \{[^}]*display: flex/s);
  assert.match(css, /\[data-codex-themes-role="xp-qq-profile-heading-row"\] \{[^}]*gap: 4px/s);
  assert.match(css, /\[data-codex-themes-role="xp-qq-profile-nickname"\] \{[^}]*max-width: 112px/s);
  assert.match(css, /#codex-themes-xp-qq-profile-editor \{[^}]*position: static/s);
  assert.match(css, /#codex-themes-xp-qq-profile-editor \{[^}]*flex: 0 0 18px/s);
  assert.match(css, /\[data-codex-themes-role="xp-qq-profile-nickname"\],\n:root\[data-codex-themes-skin="xp-qq"\] \[data-codex-themes-role="xp-qq-profile-signature"\],\n:root\[data-codex-themes-skin="xp-qq"\] \[data-codex-themes-role="xp-qq-profile-level"\] \{[^}]*text-overflow: ellipsis/s);
  assert.match(css, /#codex-themes-xp-qq-profile-panel:not\(\[hidden\]\) \{[^}]*display: grid/s);
  assert.match(css, /#codex-themes-xp-qq-profile-panel:not\(\[hidden\]\) \{[^}]*top: 114px/s);
  assert.match(css, /\[data-user-message-bubble\]::before \{[^}]*content: attr\(data-codex-themes-xp-qq-nickname\)/s);
  assert.match(css, /\[data-user-message-bubble\]::before \{[^}]*text-overflow: ellipsis/s);
});

test("XP QQ CSS presents primary sidebar actions as a five-tab QQ toolbar", () => {
  const css = buildSkinCss({
    theme: { id: "xp-qq", colors: {} },
    heroDataUrl: PIXEL,
  });

  assert.match(css, /#codex-themes-xp-qq-sidebar-actions \{[^}]*grid-template-columns: repeat\(5, minmax\(0, 1fr\)\) !important/s);
  assert.match(css, /\[data-codex-themes-role="xp-qq-sidebar-action"\] \{[^}]*min-height: 56px !important/s);
  assert.match(css, /\[data-codex-themes-role="xp-qq-sidebar-action"\][^{]*\.codex-themes-xp-qq-sidebar-action-label \{[^}]*font: 600 11px\/1\.15/s);
  assert.match(css, /\[data-codex-themes-role="xp-qq-sidebar-action"\][^{]*\.codex-themes-xp-qq-sidebar-action-label \{[^}]*white-space: nowrap !important/s);
  assert.match(css, /\[data-codex-themes-native-action-hidden="true"\] \{[^}]*display: none !important/s);
});

test("XP QQ CSS presents projects and threads as a recent-contact list", () => {
  const css = buildSkinCss({
    theme: { id: "xp-qq", colors: {} },
    heroDataUrl: PIXEL,
  });

  assert.match(css, /button\[data-app-action-sidebar-section-toggle\]::after \{[^}]*content: attr\(data-codex-themes-section-label\)/s);
  assert.match(css, /\[data-codex-themes-role="xp-qq-contact-group"\] \{[^}]*height: 26px !important/s);
  assert.match(css, /\[data-codex-themes-role="xp-qq-contact-group"\] \{[^}]*background: transparent !important/s);
  assert.match(css, /\[data-codex-themes-role="xp-qq-contact-group"\]::before \{[^}]*content: "▾"/s);
  assert.match(css, /\[data-codex-themes-role="xp-qq-contact-group"\] > div:first-child > \[data-sidebar-project-drop-zone\] \{[^}]*display: none !important/s);
  assert.match(css, /\[data-codex-themes-role="xp-qq-contact-group"\]::after \{[^}]*content: attr\(data-codex-themes-contact-count\)/s);
  assert.match(css, /\[data-codex-themes-role="xp-qq-contact"\] \{[^}]*height: 50px !important/s);
  assert.match(css, /\[data-codex-themes-role="xp-qq-contact"\] \{[^}]*margin: 1px 6px !important/s);
  assert.match(css, /\[data-codex-themes-role="xp-qq-contact"\] \{[^}]*border-radius: 4px !important/s);
  assert.match(css, /\[data-codex-themes-role="xp-qq-contact"\]::before \{[^}]*content: attr\(data-codex-themes-contact-initial\)/s);
  assert.match(css, /\[data-codex-themes-role="xp-qq-contact"\]::before \{[^}]*width: 34px/s);
  assert.match(css, /\[data-codex-themes-role="xp-qq-contact"\]::before \{[^}]*border-radius: 8px/s);
  assert.match(css, /\[data-codex-themes-role="xp-qq-contact"\]::after \{[^}]*content: attr\(data-codex-themes-contact-status\)/s);
  assert.match(css, /\[data-codex-themes-role="xp-qq-contact"\] \[data-thread-title-trigger\] \{[^}]*position: absolute !important/s);
  assert.match(css, /\[data-codex-themes-role="xp-qq-contact"\] \[data-thread-title\] \{[^}]*font: 500 12px\/20px/s);
  assert.match(css, /\[data-app-action-sidebar-thread-active="true"\] \[data-thread-title\][^{]*\{[^}]*font-weight: 650 !important/s);
  assert.match(css, /\[data-codex-themes-role="xp-qq-contact-presence"\] \{[^}]*width: 8px/s);
  assert.match(css, /\[data-codex-themes-role="xp-qq-contact"\]\[data-codex-themes-contact-state="running"\] \{[^}]*background: #dfeef9 !important/s);
  assert.match(css, /\[data-codex-themes-role="xp-qq-contact"\]\[data-codex-themes-contact-state="running"\] \{[^}]*box-shadow: inset 3px 0 #2d79b8 !important/s);
  assert.doesNotMatch(css, /\] \[data-codex-themes-contact-state="running"\] \{/);
  assert.match(css, /\[data-app-action-sidebar-thread-active="true"\] \{[^}]*background: #dfeef9 !important/s);
  assert.doesNotMatch(css, /\[data-codex-themes-role="xp-qq-contact"\]\[data-codex-themes-contact-state="running"\] \{[^}]*linear-gradient/s);
});
