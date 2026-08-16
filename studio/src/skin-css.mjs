import { HEX_COLOR } from "./constants.mjs";

const DEFAULT_COLORS = {
  accent: "#24c9d7",
  secondary: "#ef8fd3",
  surface: "#f7fbff",
  text: "#17344f",
};

function color(value, fallback) {
  const result = value ?? fallback;
  if (!HEX_COLOR.test(result)) throw new Error(`无效主题颜色：${result}`);
  return result;
}

function copy(value, fallback = "") {
  return JSON.stringify(typeof value === "string" ? value : fallback);
}

const DATA_URL = /^data:image\/(?:png|jpeg|webp);base64,[a-z0-9+/=]+$/i;

function buildVariantCss(id, heroDataUrl) {
  if (id !== "xp-qq") return "";

  return `
/* Windows XP · QQ: a real chat-client composition, scoped to this theme only. */
:root[data-codex-window-type="electron"][data-codex-themes-skin="xp-qq"] {
  --qq-blue-700: #155d9f;
  --qq-blue-600: #2879bd;
  --qq-blue-500: #4a91cc;
  --qq-blue-200: #b9d5ea;
  --qq-blue-100: #dcecf8;
  --qq-blue-050: #eef6fc;
  --qq-paper: #ffffff;
  --qq-ink: #20364a;
  --qq-muted: #6f8394;
  --qq-shell: #eaf3f9;
  --qq-workspace: #f5f7f9;
  --qq-panel: #ffffff;
  --qq-utility-chrome: #f3f6f8;
  --qq-message-assistant: #ffffff;
  --qq-message-user: #dff1ff;
  --qq-divider: #d7e1e8;
  --qq-focus: #2879bd;
  --qq-motion-fast: 140ms;
  --color-background-surface: var(--qq-paper) !important;
  --color-background-panel: var(--qq-blue-050) !important;
  --color-background-button-primary: var(--qq-blue-600) !important;
  --color-text-foreground: var(--qq-ink) !important;
  --color-border: var(--qq-blue-200) !important;

  /*
   * Codex can be running in dark mode underneath a skin.  Override the full
   * neutral semantic layer so portals, resource cards and transient states do
   * not inherit dark surfaces while their text has already become dark.
   */
  --color-token-activity-bar-badge-background: var(--qq-blue-600) !important;
  --color-token-activity-bar-badge-foreground: #fff !important;
  --color-token-badge-background: #dcecf8 !important;
  --color-token-badge-foreground: var(--qq-ink) !important;
  --color-token-border: var(--qq-blue-200) !important;
  --color-token-border-default: var(--qq-blue-200) !important;
  --color-token-border-heavy: #9fbed5 !important;
  --color-token-border-light: #d6e4ee !important;
  --color-token-button-background: var(--qq-blue-600) !important;
  --color-token-button-border: var(--qq-blue-700) !important;
  --color-token-button-foreground: #fff !important;
  --color-token-button-secondary-hover-background: var(--qq-blue-100) !important;
  --color-token-checkbox-background: #fff !important;
  --color-token-checkbox-border: #9fbed5 !important;
  --color-token-checkbox-foreground: var(--qq-blue-700) !important;
  --color-token-description-foreground: var(--qq-muted) !important;
  --color-token-disabled-foreground: #8ea1b0 !important;
  --color-token-dropdown-background: #f8fbfe !important;
  --color-token-dropdown-foreground: var(--qq-ink) !important;
  --color-token-editor-background: var(--qq-panel) !important;
  --color-token-editor-find-match-background: #bcdcf2 !important;
  --color-token-editor-find-match-highlight-background: #dcecf8 !important;
  --color-token-editor-foreground: var(--qq-ink) !important;
  --color-token-editor-group-drop-background: #dcecf8 !important;
  --color-token-editor-group-drop-into-prompt-background: #dcecf8 !important;
  --color-token-editor-group-drop-into-prompt-foreground: var(--qq-ink) !important;
  --color-token-editor-selection-background: #c9e2f4 !important;
  --color-token-editor-widget-background: #fff !important;
  --color-token-focus-border: #5c9dcc !important;
  --color-token-foreground: var(--qq-ink) !important;
  --color-token-icon-foreground: #48677f !important;
  --color-token-input-background: #fff !important;
  --color-token-input-border: #a9c5d9 !important;
  --color-token-input-foreground: var(--qq-ink) !important;
  --color-token-input-placeholder-foreground: #7d91a1 !important;
  --color-token-input-validation-error-background: #fff0ef !important;
  --color-token-input-validation-info-background: #edf6fd !important;
  --color-token-input-validation-warning-background: #fff5e9 !important;
  --color-token-list-active-selection-background: #c9e2f4 !important;
  --color-token-list-active-selection-foreground: var(--qq-ink) !important;
  --color-token-list-active-selection-icon-foreground: #48677f !important;
  --color-token-list-hover-background: #e4f1fa !important;
  --color-token-main-surface-primary: #fff !important;
  --color-token-menu-background: #fff !important;
  --color-token-menu-border: #a7c4d9 !important;
  --color-token-menubar-selection-background: #dcecf8 !important;
  --color-token-menubar-selection-foreground: var(--qq-ink) !important;
  --color-token-progress-bar-background: var(--qq-blue-600) !important;
  --color-token-radio-active-foreground: var(--qq-blue-700) !important;
  --color-token-radio-inactive-border: #9fbed5 !important;
  --color-token-scrollbar-slider-active-background: #689abb !important;
  --color-token-scrollbar-slider-background: #a7c5d9 !important;
  --color-token-scrollbar-slider-hover-background: #83abc6 !important;
  --color-token-side-bar-background: var(--qq-shell) !important;
  --color-token-terminal-background: #fff !important;
  --color-token-terminal-border: var(--qq-blue-200) !important;
  --color-token-terminal-foreground: var(--qq-ink) !important;
  --color-token-text-code-block-background: #eef5fa !important;
  --color-token-text-link-active-foreground: #155d9f !important;
  --color-token-text-link-foreground: #2879bd !important;
  --color-token-text-preformat-background: #edf4f9 !important;
  --color-token-text-preformat-foreground: var(--qq-ink) !important;
  --color-token-text-primary: var(--qq-ink) !important;
  --color-token-text-secondary: #60788b !important;
  --color-token-text-tertiary: #7d91a1 !important;
  --color-token-toolbar-hover-background: #dcecf8 !important;
  font-family: Tahoma, "Microsoft YaHei", "Segoe UI", sans-serif !important;
}

:root[data-codex-themes-skin="xp-qq"] body {
  background: #d7e8f5 !important;
}

:root[data-codex-themes-skin="xp-qq"] #root {
  position: relative;
  padding: 0 !important;
  color: var(--qq-ink) !important;
  background: #eef5fa !important;
  font-family: Tahoma, "Microsoft YaHei", "Segoe UI", sans-serif !important;
}

:root[data-codex-themes-skin="xp-qq"] #root > div:first-child {
  min-height: 100% !important;
  overflow: hidden;
  border: 0 !important;
  border-radius: 0 !important;
  background: #eef5fa !important;
  box-shadow: none !important;
}

:root[data-codex-themes-skin="xp-qq"] #root::before,
:root[data-codex-themes-skin="xp-qq"] #root::after {
  display: none !important;
  content: none !important;
}

/* Use Codex's real draggable header as the QQ title bar. */
:root[data-codex-themes-skin="xp-qq"] header.app-header-tint {
  color: #fff !important;
  border-bottom: 1px solid #0e4e88 !important;
  background: linear-gradient(180deg, #5da1d8 0%, #2d7dbd 48%, #1765a8 100%) !important;
  box-shadow: inset 0 1px rgba(255, 255, 255, .48), 0 1px 2px rgba(24, 65, 99, .18) !important;
}

:root[data-codex-themes-skin="xp-qq"] header.app-header-tint * {
  color: #fff !important;
  text-shadow: 0 1px rgba(11, 56, 96, .8);
}

:root[data-codex-themes-skin="xp-qq"] header.app-header-tint button {
  border-color: transparent !important;
  border-radius: 3px !important;
  background: transparent !important;
}

:root[data-codex-themes-skin="xp-qq"] header.app-header-tint button:hover {
  border-color: rgba(255, 255, 255, .32) !important;
  background: rgba(255, 255, 255, .13) !important;
}

:root[data-codex-themes-skin="xp-qq"] .app-shell-left-panel {
  position: relative;
  background: linear-gradient(180deg, #edf6fd 0%, #e3f0fa 100%) !important;
  border-right: 1px solid #9ebed7 !important;
  box-shadow: inset -1px 0 rgba(255, 255, 255, .82);
  backdrop-filter: none !important;
}

:root[data-codex-themes-skin="xp-qq"] .app-shell-left-panel::before {
  position: absolute;
  z-index: 12;
  top: 46px;
  right: 0;
  left: 0;
  height: 78px;
  padding: 0;
  content: "";
  color: #173f63;
  border-bottom: 1px solid #a9c8df;
  background: linear-gradient(180deg, #f8fcff, #d8ebfa);
  box-shadow: inset 0 -1px #fff;
  font: 700 13px/1.65 Tahoma, "Microsoft YaHei", sans-serif;
  white-space: pre;
  pointer-events: none;
}

:root[data-codex-themes-skin="xp-qq"] #codex-themes-xp-qq-avatar-editor::before {
  position: absolute;
  z-index: 13;
  inset: 0;
  box-sizing: border-box;
  display: grid;
  place-items: center;
  content: "C";
  color: #fff;
  border: 2px solid #fff;
  border-radius: 10px 10px 12px 7px;
  background: linear-gradient(145deg, #4ba2dd, #1769ad);
  box-shadow: 0 1px 3px rgba(30, 78, 116, .28), inset 0 1px rgba(255, 255, 255, .45);
  font: 800 22px/1 Tahoma, sans-serif;
  pointer-events: none;
}

:root[data-codex-themes-skin="xp-qq"][data-codex-themes-xp-qq-avatar="custom"] #codex-themes-xp-qq-avatar-editor::before {
  content: "";
  background-color: #dcecf8;
  background-image: var(--codex-themes-xp-qq-avatar-image) !important;
  background-position: center !important;
  background-size: cover !important;
}

:root[data-codex-themes-skin="xp-qq"] .app-shell-left-panel > .max-w-full {
  box-sizing: border-box;
  padding-top: 78px;
}

/* Settings uses a different sidebar tree. Its native return action normally
 * occupies the same title strip as the QQ identity card, so lift that real
 * action above the decorative profile layer and keep it at the free right
 * edge. This preserves the native click and keyboard behavior. */
:root[data-codex-themes-skin="xp-qq"] .app-shell-left-panel:has([data-settings-panel-slug]) nav > div:first-child > [role="link"]:first-child {
  position: absolute !important;
  z-index: 29 !important;
  top: 58px !important;
  right: 8px !important;
  display: flex !important;
  box-sizing: border-box !important;
  width: 30px !important;
  height: 24px !important;
  margin: 0 !important;
  padding: 0 !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 0 !important;
  overflow: hidden !important;
  color: #31536e !important;
  border: 1px solid #a8c3d7 !important;
  border-radius: 3px !important;
  background: linear-gradient(180deg, #fff, #e5f0f8) !important;
  box-shadow: inset 0 1px #fff !important;
  font-size: 0 !important;
  opacity: 1 !important;
  -webkit-app-region: no-drag;
}

:root[data-codex-themes-skin="xp-qq"] .app-shell-left-panel:has([data-settings-panel-slug]) nav > div:first-child > [role="link"]:first-child:hover,
:root[data-codex-themes-skin="xp-qq"] .app-shell-left-panel:has([data-settings-panel-slug]) nav > div:first-child > [role="link"]:first-child:focus-visible {
  color: #174f7b !important;
  border-color: #76a6c9 !important;
  background: linear-gradient(180deg, #fff, #d9ebf7) !important;
}

:root[data-codex-themes-skin="xp-qq"] .app-shell-left-panel:has([data-settings-panel-slug]) nav > div:first-child > [role="link"]:first-child > svg {
  width: 16px !important;
  height: 16px !important;
  flex: none !important;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-native-mode-hidden="true"] {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  overflow: hidden !important;
  opacity: 0 !important;
  clip-path: inset(50%) !important;
  pointer-events: none !important;
}

:root[data-codex-themes-skin="xp-qq"] #codex-themes-xp-qq-mode-switch {
  position: absolute !important;
  z-index: 16 !important;
  top: 58px !important;
  left: 208px !important;
  display: flex !important;
  width: 72px !important;
  height: 24px !important;
  align-items: center !important;
  justify-content: center !important;
  min-width: 0 !important;
  max-width: 72px !important;
  margin: 0 !important;
  padding: 0 6px !important;
  color: #31536e !important;
  border: 1px solid #a8c3d7 !important;
  border-radius: 3px !important;
  background: linear-gradient(180deg, #fff, #e5f0f8) !important;
  box-shadow: inset 0 1px #fff !important;
  font-size: 11px !important;
  font-weight: 600 !important;
  line-height: 22px !important;
  cursor: pointer !important;
}

:root[data-codex-themes-skin="xp-qq"] #codex-themes-xp-qq-mode-switch::after {
  margin-left: 5px;
  content: "⌄";
  color: #5c7890;
  font-size: 12px;
}

:root[data-codex-themes-skin="xp-qq"] #codex-themes-xp-qq-mode-switch:hover,
:root[data-codex-themes-skin="xp-qq"] #codex-themes-xp-qq-mode-switch[aria-expanded="true"] {
  color: #174f7b !important;
  border-color: #76a6c9 !important;
  background: linear-gradient(180deg, #fff, #d9ebf7) !important;
}

#codex-themes-xp-qq-avatar-editor,
#codex-themes-xp-qq-avatar-notice,
#codex-themes-xp-qq-profile,
#codex-themes-xp-qq-profile-panel {
  display: none;
}

:root[data-codex-themes-skin="xp-qq"] #codex-themes-xp-qq-profile {
  position: fixed;
  z-index: 27;
  top: 58px;
  left: 66px;
  display: grid;
  box-sizing: border-box;
  width: 136px;
  height: 50px;
  padding: 0;
  grid-template-rows: 18px 16px 16px;
  align-items: center;
  color: #173f63;
  -webkit-app-region: no-drag;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-profile-heading-row"] {
  display: flex;
  width: fit-content;
  max-width: 136px;
  min-width: 0;
  gap: 4px;
  align-items: center;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-profile-nickname"],
:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-profile-signature"],
:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-profile-level"] {
  display: block;
  min-width: 0;
  overflow: hidden;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-profile-nickname"] {
  max-width: 112px;
  flex: 0 1 auto;
  color: #173f63;
  font: 700 13px/1.2 Tahoma, "Microsoft YaHei", sans-serif;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-profile-signature"] {
  color: #58748a;
  font: 11px/1.2 Tahoma, "Microsoft YaHei", sans-serif;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-profile-level"] {
  color: #b56e16;
  font: 10px/1.2 Tahoma, "Apple Color Emoji", "Segoe UI Emoji", sans-serif;
  letter-spacing: 0;
}

:root[data-codex-themes-skin="xp-qq"] #codex-themes-xp-qq-profile-editor {
  position: static;
  display: grid;
  width: 18px;
  height: 18px;
  flex: 0 0 18px;
  padding: 0;
  place-items: center;
  cursor: pointer;
  color: #4f7089;
  border: 1px solid transparent;
  border-radius: 3px;
  background: transparent;
  font: 700 13px/1 Tahoma, sans-serif;
}

:root[data-codex-themes-skin="xp-qq"] #codex-themes-xp-qq-profile-editor:hover,
:root[data-codex-themes-skin="xp-qq"] #codex-themes-xp-qq-profile-editor[aria-expanded="true"] {
  color: #174f7b;
  border-color: #a8c5da;
  background: rgba(255, 255, 255, .76);
}

:root[data-codex-themes-skin="xp-qq"] #codex-themes-xp-qq-profile-editor:focus-visible {
  outline: 2px solid #4a91cc;
  outline-offset: 1px;
}

:root[data-codex-themes-skin="xp-qq"] #codex-themes-xp-qq-profile-panel:not([hidden]) {
  position: fixed;
  z-index: 90;
  top: 114px;
  left: 64px;
  display: grid;
  box-sizing: border-box;
  width: 286px;
  padding: 11px;
  gap: 8px;
  color: #29475f;
  border: 1px solid #8eafc8;
  border-radius: 4px;
  background: #f8fbfe;
  box-shadow: 1px 3px 10px rgba(35, 73, 101, .24), inset 0 1px #fff;
  font: 11px/1.35 Tahoma, "Microsoft YaHei", sans-serif;
  -webkit-app-region: no-drag;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-profile-heading"] {
  color: #173f63;
  font-size: 13px;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-profile-field"] {
  display: grid;
  grid-template-columns: 62px minmax(0, 1fr);
  gap: 7px;
  align-items: center;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-profile-field"] > span {
  color: #58748a;
  text-align: right;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-profile-field"] input,
:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-profile-field"] select {
  box-sizing: border-box;
  width: 100%;
  height: 28px;
  min-width: 0;
  padding: 3px 7px;
  color: #20364a;
  border: 1px solid #a9c5d9;
  border-radius: 3px;
  background: #fff;
  box-shadow: inset 0 1px 2px rgba(52, 88, 115, .08);
  font: 11px/1.2 Tahoma, "Microsoft YaHei", sans-serif;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-profile-field"] input:focus,
:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-profile-field"] select:focus {
  border-color: #4a91cc;
  outline: 1px solid #b8d7ee;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-profile-level-hint"] {
  display: block;
  margin: -2px 0 1px 69px;
  color: #6a8397;
  font: 10px/1.35 Tahoma, "Microsoft YaHei", sans-serif;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-profile-feedback"]:not([hidden]) {
  display: block;
  padding: 5px 7px;
  color: #8a3733;
  border: 1px solid #dfb0ad;
  border-radius: 3px;
  background: #fff2f1;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-profile-actions"] {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-profile-actions"] button {
  min-width: 54px;
  height: 26px;
  padding: 0 10px;
  color: #31536e;
  border: 1px solid #a8c3d7;
  border-radius: 3px;
  background: linear-gradient(180deg, #fff, #e5f0f8);
  box-shadow: inset 0 1px #fff;
  font: 11px/1 Tahoma, "Microsoft YaHei", sans-serif;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-profile-actions"] button[type="submit"] {
  color: #fff;
  border-color: #155d9f;
  background: linear-gradient(180deg, #4a91cc, #2879bd);
}

:root[data-codex-themes-skin="xp-qq"] #codex-themes-xp-qq-avatar-editor {
  position: fixed;
  z-index: 28;
  top: 58px;
  left: 14px;
  display: block;
  width: 44px;
  height: 44px;
  padding: 0;
  overflow: visible;
  cursor: pointer;
  color: #fff;
  border: 0;
  border-radius: 10px 10px 12px 7px;
  background: transparent;
  box-shadow: none;
  -webkit-app-region: no-drag;
}

:root[data-codex-themes-skin="xp-qq"] #codex-themes-xp-qq-avatar-editor > span {
  position: absolute;
  right: 1px;
  bottom: 1px;
  left: 1px;
  display: block;
  padding: 3px 0 2px;
  opacity: 0;
  color: #fff;
  border: 0;
  border-radius: 0 0 10px 6px;
  background: rgba(21, 93, 159, .9);
  box-shadow: inset 0 1px rgba(255, 255, 255, .24);
  font: 10px/1.2 Tahoma, "Microsoft YaHei", sans-serif;
  text-align: center;
  transform: translateY(2px);
  transition: opacity 120ms ease, transform 120ms ease;
  pointer-events: none;
}

:root[data-codex-themes-skin="xp-qq"] #codex-themes-xp-qq-avatar-editor:hover > span,
:root[data-codex-themes-skin="xp-qq"] #codex-themes-xp-qq-avatar-editor:focus-visible > span {
  opacity: 1;
  transform: translateY(0);
}

:root[data-codex-themes-skin="xp-qq"] #codex-themes-xp-qq-avatar-editor:focus-visible {
  outline: 2px solid #4a91cc;
  outline-offset: 2px;
}

:root[data-codex-themes-skin="xp-qq"] #codex-themes-xp-qq-avatar-editor:disabled {
  cursor: wait;
}

:root[data-codex-themes-skin="xp-qq"] #codex-themes-xp-qq-avatar-notice:not([hidden]) {
  position: fixed;
  z-index: 80;
  top: 104px;
  left: 14px;
  display: block;
  max-width: 250px;
  padding: 6px 8px;
  color: #244761;
  border: 1px solid #9fbed5;
  border-radius: 3px;
  background: #f8fbfe;
  box-shadow: 1px 2px 7px rgba(35, 73, 101, .18);
  font: 11px/1.45 Tahoma, "Microsoft YaHei", sans-serif;
}

:root[data-codex-themes-skin="xp-qq"] #codex-themes-xp-qq-avatar-notice[data-kind="error"] {
  color: #8a3733;
  border-color: #d9aaa7;
  background: #fff2f1;
}

:root[data-codex-themes-skin="xp-qq"] .app-shell-left-panel nav {
  color: #28475f !important;
}

/* QQ-style primary navigation: five native Codex actions in one tab strip. */
:root[data-codex-themes-skin="xp-qq"] #codex-themes-xp-qq-sidebar-actions {
  position: relative;
  z-index: 13;
  display: grid !important;
  min-height: 66px;
  padding: 5px 7px 6px;
  grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
  gap: 2px;
  color: #49677f;
  border-bottom: 1px solid #aec9dc;
  background: linear-gradient(180deg, #f8fcff, #dfedf7);
  box-shadow: inset 0 1px rgba(255, 255, 255, .9), inset 0 -1px #fff;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-native-action-hidden="true"] {
  display: none !important;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-sidebar-action"] {
  display: flex !important;
  width: 100% !important;
  min-width: 0 !important;
  min-height: 56px !important;
  height: 56px !important;
  padding: 3px 1px !important;
  align-items: center !important;
  justify-content: center !important;
  flex-direction: column !important;
  gap: 4px !important;
  color: #49677f !important;
  border: 1px solid transparent !important;
  border-radius: 3px !important;
  background: transparent !important;
  box-shadow: none !important;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-sidebar-action"]:hover,
:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-sidebar-action"]:focus-within {
  color: #174f7b !important;
  border-color: #9fc0d8 !important;
  background: linear-gradient(180deg, #fff, #d9ebf8) !important;
  box-shadow: inset 0 1px #fff !important;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-sidebar-action"] svg {
  width: 18px !important;
  height: 18px !important;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-sidebar-action"] .codex-themes-xp-qq-sidebar-action-label {
  display: block !important;
  width: 100% !important;
  overflow: hidden !important;
  color: inherit !important;
  font: 600 11px/1.15 Tahoma, "Microsoft YaHei", sans-serif !important;
  text-align: center !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
}

:root[data-codex-themes-skin="xp-qq"] .app-shell-left-panel [data-app-action-sidebar-section-heading] *,
:root[data-codex-themes-skin="xp-qq"] .app-shell-left-panel [class*="text-token-input-placeholder"] {
  color: #647d91 !important;
}

:root[data-codex-themes-skin="xp-qq"] .app-shell-left-panel button[data-app-action-sidebar-section-toggle] {
  height: 28px !important;
  padding: 0 10px !important;
  font-size: 0 !important;
}

:root[data-codex-themes-skin="xp-qq"] .app-shell-left-panel button[data-app-action-sidebar-section-toggle]::after {
  content: attr(data-codex-themes-section-label);
  color: #647d91;
  font: 600 11px/1 Tahoma, "Microsoft YaHei", sans-serif;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-contact-group"] {
  position: relative !important;
  height: 26px !important;
  min-height: 26px !important;
  margin: 4px 7px 1px !important;
  padding: 0 26px 0 19px !important;
  color: #61798c !important;
  border: 0 !important;
  border-top: 1px solid #c7d9e6 !important;
  border-radius: 0 !important;
  background: transparent !important;
  font: 600 11px/25px Tahoma, "Microsoft YaHei", sans-serif !important;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-contact-group"]::before {
  position: absolute;
  top: 0;
  left: 6px;
  content: "▾";
  color: #688399;
  font: 10px/25px Tahoma, sans-serif;
  pointer-events: none;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-contact-group"] > div:first-child > [data-sidebar-project-drop-zone] {
  display: none !important;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-contact-group"]::after {
  position: absolute;
  top: 1px;
  right: 7px;
  content: attr(data-codex-themes-contact-count);
  color: #8a9cab;
  font: 10px/24px Tahoma, sans-serif;
  pointer-events: none;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-contact-group"]:hover {
  color: #174f7b !important;
  background: #e8f2f9 !important;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-contact-group"] .text-fade-truncate {
  color: inherit !important;
  font: 600 11px/1.2 Tahoma, "Microsoft YaHei", sans-serif !important;
}

:root[data-codex-themes-skin="xp-qq"] .app-shell-left-panel [role="listitem"]::after {
  display: none !important;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-contact"] {
  position: relative !important;
  box-sizing: border-box !important;
  width: calc(100% - 12px) !important;
  height: 50px !important;
  min-height: 50px !important;
  margin: 1px 6px !important;
  padding: 0 7px 0 51px !important;
  overflow: hidden !important;
  color: #29475f !important;
  border: 1px solid transparent !important;
  border-radius: 4px !important;
  background: transparent !important;
  transition: color var(--qq-motion-fast) ease, background-color var(--qq-motion-fast) ease, border-color var(--qq-motion-fast) ease, box-shadow var(--qq-motion-fast) ease;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-contact"]::before {
  position: absolute;
  z-index: 2;
  top: 8px;
  left: 9px;
  display: grid;
  width: 34px;
  height: 34px;
  box-sizing: border-box;
  place-items: center;
  content: attr(data-codex-themes-contact-initial);
  color: #fff;
  border: 1px solid rgba(31, 74, 105, .32);
  border-radius: 8px;
  background: #4f86ad;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .24), 0 1px 2px rgba(32, 70, 98, .14);
  font: 700 13px/1 Tahoma, "Microsoft YaHei", sans-serif;
  text-shadow: 0 1px rgba(15, 66, 105, .38);
  pointer-events: none;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-contact"]::after {
  position: absolute;
  z-index: 1;
  top: 27px;
  right: 52px;
  left: 51px;
  overflow: hidden;
  content: attr(data-codex-themes-contact-status);
  color: #7c8f9e;
  font: 10.5px/14px Tahoma, "Microsoft YaHei", sans-serif;
  text-overflow: ellipsis;
  white-space: nowrap;
  pointer-events: none;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-contact"] [data-thread-title-trigger] {
  position: absolute !important;
  z-index: 2 !important;
  top: 5px !important;
  right: 52px !important;
  left: 51px !important;
  display: flex !important;
  width: auto !important;
  height: 20px !important;
  min-width: 0 !important;
  align-items: center !important;
  color: #29475f !important;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-contact"] [data-thread-title] {
  overflow: hidden !important;
  color: inherit !important;
  font: 500 12px/20px Tahoma, "Microsoft YaHei", sans-serif !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-contact"]:hover {
  border-color: #d4e3ee !important;
  background: #eef6fc !important;
  box-shadow: none !important;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-contact"]:focus-within {
  border-color: #8fb7d5 !important;
  outline: none !important;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-contact-presence"] {
  position: absolute;
  z-index: 4;
  top: 33px;
  left: 36px;
  display: block;
  width: 8px;
  height: 8px;
  box-sizing: border-box;
  border: 2px solid #edf6fd;
  border-radius: 50%;
  background: #2e9d62;
  box-shadow: 0 0 0 1px rgba(25, 94, 60, .18);
  pointer-events: none;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-contact-presence"][data-codex-themes-contact-state="active"] {
  background: #2879bd;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-contact"][data-codex-themes-contact-state="running"] {
  color: #173f63 !important;
  border-color: #bdd5e6 !important;
  background: #dfeef9 !important;
  box-shadow: inset 3px 0 #2d79b8 !important;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-contact"][data-codex-themes-contact-state="running"]::after {
  color: #2f7b58;
  font-weight: 600;
}

:root[data-codex-themes-skin="xp-qq"] [data-app-action-sidebar-thread-active="true"] {
  color: #163f63 !important;
  border-color: #bdd5e6 !important;
  background: #dfeef9 !important;
  box-shadow: inset 3px 0 #2d79b8 !important;
}

:root[data-codex-themes-skin="xp-qq"] [data-app-action-sidebar-thread-active="true"] [data-thread-title],
:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-contact"][data-codex-themes-contact-state="running"] [data-thread-title] {
  font-weight: 650 !important;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-contact-tone="1"]::before {
  background: #4c8d91;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-contact-tone="2"]::before {
  background: #6d80a0;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-contact-tone="3"]::before {
  background: #56879d;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-contact-tone="4"]::before {
  background: #718494;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-contact-tone="5"]::before {
  background: #5d8876;
}

:root[data-codex-themes-skin="xp-qq"] .main-surface,
:root[data-codex-themes-skin="xp-qq"] .browser-main-surface {
  position: relative;
  background: var(--qq-workspace) !important;
}

/* A visible QQ contact header between the title bar and conversation. */
:root[data-codex-themes-skin="xp-qq"] main.main-surface::before {
  position: absolute;
  z-index: 24;
  top: 46px;
  right: 0;
  left: 0;
  height: 62px;
  padding: 10px 16px 0 66px;
  content: "Codex 助手\\A在线 · 本地工作区";
  color: #1c3f5d;
  border-bottom: 1px solid #abc5d9;
  background: linear-gradient(180deg, #fff, #e8f3fb);
  box-shadow: inset 0 -1px #fff;
  font: 700 13px/1.55 Tahoma, "Microsoft YaHei", sans-serif;
  white-space: pre;
  pointer-events: none;
}

:root[data-codex-themes-skin="xp-qq"] main.main-surface::after {
  position: absolute;
  z-index: 25;
  top: 56px;
  left: 16px;
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  content: "AI";
  color: #fff;
  border: 2px solid #fff;
  border-radius: 10px 10px 12px 7px;
  background: linear-gradient(145deg, #61a9dd, #226ea8);
  box-shadow: 0 1px 3px rgba(31, 77, 112, .25);
  font: 800 13px/1 Tahoma, sans-serif;
  pointer-events: none;
}

:root[data-codex-themes-skin="xp-qq"] main.main-surface > header + div {
  box-sizing: border-box;
  padding-top: 62px;
}

:root[data-codex-themes-skin="xp-qq"] .app-shell-main-content-viewport {
  background: #f7fafc !important;
}

/* Keep Codex's functional output panel, but make it part of the same light QQ shell. */
:root[data-codex-themes-skin="xp-qq"] main .rounded-3xl.bg-token-dropdown-background {
  color: #29475f !important;
  border: 1px solid #9ebed7 !important;
  border-radius: 5px !important;
  background: #f7fbfe !important;
  box-shadow: 0 5px 16px rgba(39, 78, 106, .16) !important;
}

:root[data-codex-themes-skin="xp-qq"] main .rounded-3xl.bg-token-dropdown-background header {
  color: #526d82 !important;
  background: #f7fbfe !important;
}

:root[data-codex-themes-skin="xp-qq"] main .rounded-3xl.bg-token-dropdown-background section::after {
  background: #c9d9e5 !important;
}

/* Portal tooltips live outside the sidebar, so they must use semantic tokens too. */
:root[data-codex-themes-skin="xp-qq"] [role="tooltip"][class*="bg-token-dropdown-background"] {
  color: var(--qq-ink) !important;
  border: 1px solid #9fbed5 !important;
  background: #f8fbfe !important;
  box-shadow: 1px 2px 8px rgba(35, 73, 101, .18) !important;
  backdrop-filter: none !important;
}

/* Codex summary/resource panels are mounted through a portal and may use the
 * newer elevated surface tokens even while the rest of the shell is light. */
:root[data-codex-themes-skin="xp-qq"] [class*="bg-surface-elevated-secondary"] {
  color-scheme: light !important;
  color: #29475f !important;
  border: 1px solid #9fbed5 !important;
  background: #f8fbfe !important;
  box-shadow: 1px 3px 10px rgba(35, 73, 101, .20), inset 0 1px #fff !important;
  backdrop-filter: none !important;
}

:root[data-codex-themes-skin="xp-qq"] [class*="before:bg-surface-elevated-secondary"]::before {
  background: #f8fbfe !important;
}

:root[data-codex-themes-skin="xp-qq"] [class*="bg-surface-elevated-secondary"] :where(header, h1, h2, h3, p, span, button, a, svg) {
  color: #29475f !important;
}

:root[data-codex-themes-skin="xp-qq"] [class*="bg-surface-elevated-secondary"] :where([class*="text-tertiary"], [class*="text-secondary"], [class*="text-text/40"]) {
  color: #6f8394 !important;
}

:root[data-codex-themes-skin="xp-qq"] [class*="bg-surface-elevated-secondary"] [data-slot="thread-summary-panel-item-button"] {
  color: #29475f !important;
}

:root[data-codex-themes-skin="xp-qq"] [class*="bg-surface-elevated-secondary"] [data-slot="thread-summary-panel-item-button"]:hover::before {
  background: #e4f1fa !important;
}

/* Attachments and turn diffs are useful controls, not dark floating cards. */
:root[data-codex-themes-skin="xp-qq"] main [class*="bg-token-dropdown-background/50"] {
  color: var(--qq-ink) !important;
  border: 1px solid #bfd4e4 !important;
  background: #eef5fa !important;
  box-shadow: inset 0 1px #fff !important;
}

:root[data-codex-themes-skin="xp-qq"] main [class*="bg-token-dropdown-background/50"] > * + * {
  border-color: #c8dbe9 !important;
}

/*
 * The review renderer is a web component whose shadow root writes its own
 * dark color scheme. Override the host and the inherited Pierre diff tokens
 * together so syntax text, gutters, additions and deletions stay legible.
 */
:root[data-codex-themes-skin="xp-qq"] diffs-container {
  color-scheme: light !important;
  color: #20364a !important;
  background-color: var(--qq-panel) !important;
  --diffs-bg: #ffffff !important;
  --diffs-fg: #20364a !important;
  --diffs-dark: #20364a !important;
  --diffs-light: #20364a !important;
  --diffs-mixer: #20364a !important;
  --diffs-addition-base: #2f8f61 !important;
  --diffs-deletion-base: #c94f52 !important;
  --diffs-addition-color: #176a45 !important;
  --diffs-deletion-color: #a92f35 !important;
  --diffs-bg-addition: #e8f5ee !important;
  --diffs-bg-deletion: #fdeceb !important;
  --diffs-bg-addition-emphasis: #cfe9db !important;
  --diffs-bg-deletion-emphasis: #f5d4d2 !important;
  --diffs-bg-context: #ffffff !important;
  --diffs-bg-context-gutter: #f5f9fc !important;
  --diffs-bg-buffer: #f5f9fc !important;
  --diffs-bg-separator: #e6eef4 !important;
  --diffs-fg-number: #6f8394 !important;
}

/* File tools read as an embedded XP utility window, not an unstyled white page. */
:root[data-codex-themes-skin="xp-qq"] .isolate:has(> [role="tabpanel"][data-app-shell-tab-panel-controller="right"]) {
  position: relative !important;
  z-index: 26 !important;
  border-left: 1px solid #9fbed5 !important;
  background: #f4f9fc !important;
}

:root[data-codex-themes-skin="xp-qq"] .isolate:has(> [role="tabpanel"][data-app-shell-tab-panel-controller="right"]) > .h-toolbar {
  position: relative !important;
  height: 38px !important;
  min-height: 38px !important;
  padding: 0 6px !important;
  color: #244761 !important;
  border-bottom: 1px solid #aac6da !important;
  background: linear-gradient(180deg, #f7fbfe 0%, #dcecf7 100%) !important;
  box-shadow: inset 0 1px #fff, inset 0 -1px rgba(255, 255, 255, .72) !important;
}

#codex-themes-xp-qq-file-title {
  display: none;
}

/* Electron occasionally keeps the native tab in the accessibility tree but
 * drops its entire text layer. The runtime positions this body-level label
 * over the toolbar so it stays in a separate compositor layer. */
:root[data-codex-themes-skin="xp-qq"] #codex-themes-xp-qq-file-title:not([hidden]) {
  position: fixed;
  z-index: 42;
  display: block;
  translate: 0 -50%;
  color: #20364a;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
  pointer-events: none;
}

:root[data-codex-themes-skin="xp-qq"] .isolate:has(> [role="tabpanel"][data-app-shell-tab-panel-controller="right"]) [data-app-shell-tab-controller="right"] > [role="button"] {
  height: 30px !important;
  border: 1px solid #aac6da !important;
  border-radius: 4px !important;
  background: #eaf4fb !important;
  box-shadow: inset 0 1px rgba(255, 255, 255, .9) !important;
}

:root[data-codex-themes-skin="xp-qq"] .isolate:has(> [role="tabpanel"][data-app-shell-tab-panel-controller="right"]) [data-app-shell-tab-controller="right"]:has([role="tab"][aria-selected="true"]) > [role="button"] {
  border-color: #78a8ca !important;
  background: #fff !important;
  box-shadow: inset 0 2px #4a91cc, inset 0 1px #fff !important;
}

:root[data-codex-themes-skin="xp-qq"] [role="tabpanel"][data-app-shell-tab-panel-controller="right"][data-tab-id^="file:"] {
  color: #29475f !important;
  background: var(--qq-panel) !important;
}

:root[data-codex-themes-skin="xp-qq"] [role="tabpanel"][data-app-shell-tab-panel-controller="right"][data-tab-id^="file:"] > nav[aria-label="文件路径"] {
  height: 34px !important;
  color: #36566e !important;
  border-bottom-color: #bfd4e4 !important;
  background: #f8fbfe !important;
}

:root[data-codex-themes-skin="xp-qq"] [role="tabpanel"][data-app-shell-tab-panel-controller="right"][data-tab-id^="file:"] > .flex {
  border-top: 1px solid #d2e1eb !important;
  background: #f7fbfe !important;
}

:root[data-codex-themes-skin="xp-qq"] [role="tabpanel"][data-app-shell-tab-panel-controller="right"][data-tab-id^="file:"] .border-l:has(input[placeholder*="筛选文件"]) {
  border-left-color: #aac6da !important;
  background: linear-gradient(180deg, #f3f9fd, #eaf4fb) !important;
}

:root[data-codex-themes-skin="xp-qq"] [role="tabpanel"][data-app-shell-tab-panel-controller="right"][data-tab-id^="file:"] div:has(> input[placeholder*="筛选文件"]) {
  border-color: #aac6da !important;
  border-radius: 3px !important;
  background: #fff !important;
  box-shadow: inset 1px 1px 2px rgba(62, 101, 130, .09) !important;
}

:root[data-codex-themes-skin="xp-qq"] [role="tabpanel"][data-app-shell-tab-panel-controller="right"][data-tab-id^="file:"] input[placeholder*="筛选文件"] {
  color: var(--qq-ink) !important;
}

/* The terminal stays dark for ANSI readability, but belongs to the QQ blue system. */
:root[data-codex-themes-skin="xp-qq"] .isolate:has([id^="terminal-panel-"]) {
  border-top-color: #8fb3cf !important;
  background: #e8f2f9 !important;
}

:root[data-codex-themes-skin="xp-qq"] .isolate:has(> [role="tabpanel"] [id^="terminal-panel-"]) > div:has(> [role="tablist"]) {
  color: #29475f !important;
  border-bottom: 1px solid #8fb3cf !important;
  background: linear-gradient(180deg, #f9fcfe, #dcebf5) !important;
  box-shadow: inset 0 1px #fff !important;
}

:root[data-codex-themes-skin="xp-qq"] .isolate:has(> [role="tabpanel"] [id^="terminal-panel-"]) [role="tablist"] {
  border: 1px solid #9ebbd0 !important;
  border-bottom-color: #10283c !important;
  border-radius: 3px 3px 0 0 !important;
  background: #fff !important;
}

:root[data-codex-themes-skin="xp-qq"] [id^="terminal-panel-"],
:root[data-codex-themes-skin="xp-qq"] [id^="terminal-panel-"] .xterm,
:root[data-codex-themes-skin="xp-qq"] [id^="terminal-panel-"] .xterm-screen,
:root[data-codex-themes-skin="xp-qq"] [id^="terminal-panel-"] .xterm-viewport,
:root[data-codex-themes-skin="xp-qq"] [id^="terminal-panel-"] .xterm-rows {
  color: #e7f2f8 !important;
  background-color: #10283c !important;
}

:root[data-codex-themes-skin="xp-qq"] [id^="terminal-panel-"] {
  border-top: 1px solid #071c2b !important;
  box-shadow: inset 0 1px rgba(255, 255, 255, .05) !important;
}

:root[data-codex-themes-skin="xp-qq"] [id^="terminal-panel-"] .xterm-selection div {
  background-color: rgba(95, 164, 214, .38) !important;
}

/* Empty tasks read as the first exchange in a QQ conversation, while every
 * native suggestion remains the original, working Codex action. */
:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-welcome-space"] {
  min-height: 0 !important;
  padding: 54px 32px 20px !important;
  align-items: flex-start !important;
  justify-content: center !important;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-welcome"] {
  display: flex !important;
  width: min(100%, 860px) !important;
  max-width: 860px !important;
  padding: 0 24px !important;
  flex-direction: column !important;
  align-items: stretch !important;
  justify-content: flex-start !important;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-welcome"]::before {
  align-self: center;
  margin-bottom: 22px;
  padding: 3px 11px;
  content: "本地工作区 · 新会话";
  color: #7a8e9e;
  border: 1px solid #d4e1ea;
  border-radius: 10px;
  background: #eef4f8;
  font: 500 11px/1.2 Tahoma, "Microsoft YaHei", sans-serif;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-welcome-message"] {
  position: relative !important;
  display: block !important;
  width: min(710px, calc(100% - 44px)) !important;
  min-height: 0 !important;
  margin-left: 44px !important;
  color: var(--qq-ink) !important;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-welcome-message"]::before {
  display: block;
  margin: 0 0 6px 1px;
  content: "Codex 助手";
  color: #60798d;
  font: 600 11px/1.2 Tahoma, "Microsoft YaHei", sans-serif;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-welcome-message"]::after {
  position: absolute;
  top: 19px;
  left: -44px;
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  content: "C";
  color: #fff;
  border: 1px solid #fff;
  border-radius: 8px 8px 9px 5px;
  background: linear-gradient(145deg, #4c9cd3, #236da6);
  box-shadow: 0 1px 2px rgba(27, 70, 104, .22);
  font: 800 12px/1 Tahoma, sans-serif;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-welcome-message"] > div {
  position: relative;
  display: block !important;
  width: auto !important;
  min-height: 0 !important;
  padding: 14px 16px !important;
  color: #20364a !important;
  border: 1px solid #bfd3e2;
  border-radius: 5px 5px 5px 2px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(44, 78, 103, .09);
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-welcome-message"] > div::before {
  display: block;
  margin-bottom: 5px;
  content: "你好，我已经准备好协助这个项目。";
  color: #20364a;
  font: 600 14px/1.5 Tahoma, "Microsoft YaHei", sans-serif;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-welcome-message"] [data-testid="home-icon"] {
  display: none !important;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-welcome-message"] > div > div {
  display: block !important;
  color: #60788b !important;
  font-size: 13px !important;
  line-height: 1.55 !important;
  text-align: left !important;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-welcome-message"] button {
  color: #246fa9 !important;
  font-weight: 650 !important;
  text-decoration-color: #8eb5d0 !important;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-welcome-suggestions"] {
  position: relative !important;
  inset: auto !important;
  width: min(710px, calc(100% - 44px)) !important;
  margin: 16px 0 0 44px !important;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-welcome-suggestions"]::before {
  display: block;
  margin: 0 0 7px 1px;
  content: "快捷回复";
  color: #6d8293;
  font: 600 11px/1.2 Tahoma, "Microsoft YaHei", sans-serif;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-quick-replies"] > div {
  margin: 0 !important;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-quick-replies"] > div > div {
  display: grid !important;
  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  gap: 8px !important;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-quick-reply"] {
  display: grid !important;
  min-height: 58px !important;
  height: auto !important;
  padding: 9px 12px !important;
  grid-template-columns: 27px minmax(0, 1fr) !important;
  align-items: center !important;
  color: #29475f !important;
  border: 1px solid #bdd3e3 !important;
  border-radius: 4px !important;
  background: linear-gradient(180deg, #fff, #f2f8fc) !important;
  box-shadow: inset 0 1px #fff, 0 1px 2px rgba(46, 82, 108, .07) !important;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-quick-reply"]:hover {
  border-color: #78a9cc !important;
  background: #e6f3fc !important;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-quick-reply"]:focus-visible {
  outline: 2px solid #4a91cc !important;
  outline-offset: 2px !important;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-quick-reply"] > span:first-child {
  width: 24px !important;
  height: 24px !important;
  color: #2879bd !important;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-quick-reply"] > span:last-child {
  min-height: 0 !important;
  margin: 0 !important;
  justify-content: center !important;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-quick-reply"] > span:last-child > span {
  color: #29475f !important;
  font-size: 12px !important;
  font-weight: 600 !important;
  line-height: 1.35 !important;
}

@media (max-width: 980px) {
  :root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-welcome-space"] {
    padding-inline: 16px !important;
  }

  :root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-quick-replies"] > div > div {
    grid-template-columns: minmax(0, 1fr) !important;
  }
}

/* QQ-like message rows with clear sender identity. */
:root[data-codex-themes-skin="xp-qq"] [data-user-message-bubble] {
  position: relative;
  margin-top: 18px !important;
  margin-right: 44px !important;
  overflow: visible !important;
  color: #18364f !important;
  border: 1px solid #9fc3de !important;
  border-radius: 5px 5px 2px 5px !important;
  background: var(--qq-message-user) !important;
  box-shadow: 0 1px 2px rgba(38, 83, 117, .12) !important;
}

:root[data-codex-themes-skin="xp-qq"] [data-user-message-bubble]::before {
  position: absolute;
  top: -19px;
  right: -42px;
  display: block;
  width: 128px;
  height: 16px;
  overflow: hidden;
  content: attr(data-codex-themes-xp-qq-nickname);
  color: #58748a;
  font: 11px/16px Tahoma, "Microsoft YaHei", sans-serif;
  text-align: right;
  text-overflow: ellipsis;
  white-space: nowrap;
  pointer-events: none;
}

:root[data-codex-themes-skin="xp-qq"] [data-user-message-bubble]::after {
  position: absolute;
  top: -1px;
  right: -42px;
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  content: "D";
  color: #fff;
  border: 1px solid #fff;
  border-radius: 8px 8px 9px 5px;
  background: #3f8f69;
  box-shadow: 0 1px 2px rgba(28, 69, 51, .22);
  font: 700 12px/1 Tahoma, sans-serif;
}

:root[data-codex-themes-skin="xp-qq"][data-codex-themes-xp-qq-avatar="custom"] [data-user-message-bubble]::after {
  content: "" !important;
  border-color: #fff !important;
  background-color: #fff !important;
  background-image: var(--codex-themes-xp-qq-avatar-image) !important;
  background-repeat: no-repeat !important;
  background-position: center !important;
  background-size: cover !important;
}

:root[data-codex-themes-skin="xp-qq"] [data-local-conversation-final-assistant] {
  position: relative;
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
  margin-left: 44px;
  padding: 13px 15px !important;
  color: var(--qq-ink) !important;
  border: 1px solid #c3d6e5;
  border-radius: 5px 5px 5px 2px;
  background: var(--qq-message-assistant);
  box-shadow: 0 1px 2px rgba(44, 78, 103, .08);
}

/* Codex wide Markdown blocks use negative thread margins in the native layout.
 * A bordered QQ message bubble owns its content width, so contain tables here
 * and keep overflow local to the table scroller instead of the whole message. */
:root[data-codex-themes-skin="xp-qq"] :is([data-wide-markdown-block-kind="table"], [data-markdown-table="true"]) {
  --thread-content-margin: 0px !important;
  --wide-block-container-max-width: 100% !important;
  --wide-block-default-max-width: 100% !important;
  --wide-block-width: 100% !important;
  width: 100% !important;
  max-width: 100% !important;
  margin-inline: 0 !important;
}

:root[data-codex-themes-skin="xp-qq"] :is([data-wide-markdown-block-kind="table"], [data-markdown-table="true"]) [class*="_tableScroller_"] {
  width: 100% !important;
  max-width: 100% !important;
  overflow-x: auto !important;
  overscroll-behavior-inline: contain !important;
  scrollbar-gutter: stable;
  justify-content: flex-start !important;
}

:root[data-codex-themes-skin="xp-qq"] :is([data-wide-markdown-block-kind="table"], [data-markdown-table="true"]) [class*="_tableWrapper_"] {
  width: max-content !important;
  min-width: 100% !important;
  max-width: none !important;
  margin-inline: 0 !important;
}

:root[data-codex-themes-skin="xp-qq"] :is([data-wide-markdown-block-kind="table"], [data-markdown-table="true"]) table {
  min-width: 100% !important;
}

:root[data-codex-themes-skin="xp-qq"] [data-local-conversation-final-assistant]::before {
  position: absolute;
  top: -1px;
  left: -43px;
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  content: "C";
  color: #fff;
  border: 1px solid #fff;
  border-radius: 8px 8px 9px 5px;
  background: linear-gradient(145deg, #4c9cd3, #236da6);
  box-shadow: 0 1px 2px rgba(27, 70, 104, .22);
  font: 800 12px/1 Tahoma, sans-serif;
}

:root[data-codex-themes-skin="xp-qq"] .composer-surface-chrome {
  position: relative;
  min-height: 92px;
  padding-top: 0;
  overflow: visible !important;
  border: 1px solid #8fb3cf !important;
  border-radius: 3px !important;
  background: #fff !important;
  box-shadow: inset 1px 1px #e3edf5, 0 2px 5px rgba(42, 83, 114, .10) !important;
  backdrop-filter: none !important;
}

:root[data-codex-themes-skin="xp-qq"] [data-composer-surface-variant="default"] {
  color-scheme: light !important;
  color: #20364a !important;
  border: 1px solid #8fb3cf !important;
  border-radius: 5px !important;
  background: #fff !important;
  box-shadow: inset 1px 1px #e3edf5, 0 2px 5px rgba(42, 83, 114, .10) !important;
  backdrop-filter: none !important;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-composer-root] [data-codex-composer="true"] {
  color: #20364a !important;
  caret-color: #155d9f !important;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-composer-root] [data-codex-composer="true"]::before {
  color: #7d91a1 !important;
}

:root[data-codex-themes-skin="xp-qq"] [data-composer-surface-variant="default"] [class*="text-tertiary"] {
  color: #58748a !important;
}

:root[data-codex-themes-skin="xp-qq"] [data-composer-surface-variant="default"] [class*="bg-primary-solid"] {
  color: #fff !important;
  background: linear-gradient(180deg, #4a91cc, #246fab) !important;
}

:root[data-codex-themes-skin="xp-qq"] .composer-surface-chrome [data-codex-composer="true"] {
  min-height: 46px;
  color: #20364a !important;
}

:root[data-codex-themes-skin="xp-qq"] .composer-surface-chrome button[aria-label^="发送"],
:root[data-codex-themes-skin="xp-qq"] .composer-surface-chrome button[aria-label^="停止"] {
  flex: 0 0 58px !important;
  width: 58px !important;
  height: 28px !important;
  opacity: 1 !important;
  color: #fff !important;
  border: 1px solid #155d9f !important;
  border-radius: 3px !important;
  background: linear-gradient(180deg, #4a91cc, #246fab) !important;
  box-shadow: inset 0 1px rgba(255, 255, 255, .28) !important;
}

:root[data-codex-themes-skin="xp-qq"] .composer-surface-chrome button[aria-label^="发送"]::after {
  content: "发送";
  margin-left: 3px;
  font: 11px/1 Tahoma, "Microsoft YaHei", sans-serif;
}

:root[data-codex-themes-skin="xp-qq"] .composer-surface-chrome button[aria-label^="停止"]::after {
  content: "停止";
  margin-left: 3px;
  font: 11px/1 Tahoma, "Microsoft YaHei", sans-serif;
}

:root[data-codex-themes-skin="xp-qq"] .composer-surface-chrome button[aria-label^="发送"]:disabled {
  color: #7890a3 !important;
  border-color: #b6ccdc !important;
  background: linear-gradient(180deg, #edf4f9, #dbe8f1) !important;
  box-shadow: inset 0 1px #fff !important;
}

/* New Codex builds place the user bubble, process updates and final answer in
 * one turn wrapper. Frame only individual process text units so the turn can
 * keep its native layout and nested patch/file rows remain untouched. */
:root[data-codex-themes-skin="xp-qq"] main [class~="gap-[var(--conversation-item-gap,16px)]"] [data-content-search-unit-key]:not([data-local-conversation-final-assistant] *):not([class*="conversation-patch-file"] *) {
  position: relative;
  min-width: 0;
  max-width: 720px;
  box-sizing: border-box;
  margin-left: 28px;
  padding: 7px 10px !important;
  color: #536c80 !important;
  border: 1px solid #d7e4ed !important;
  border-radius: 4px !important;
  background: rgba(255, 255, 255, .72) !important;
  box-shadow: 0 1px 1px rgba(42, 72, 94, .04) !important;
  font-size: 13px !important;
  line-height: 1.65 !important;
}

:root[data-codex-themes-skin="xp-qq"] main [class~="gap-[var(--conversation-item-gap,16px)]"] [data-content-search-unit-key]:not([data-local-conversation-final-assistant] *):not([class*="conversation-patch-file"] *)::before {
  position: absolute;
  top: 7px;
  left: -29px;
  display: grid !important;
  place-items: center;
  content: "···" !important;
  width: 18px;
  height: 18px;
  color: #69859a;
  border: 1px solid #bdd2e1;
  border-radius: 50%;
  background: #f5f9fc;
  box-shadow: 0 0 0 3px var(--qq-workspace);
  font: 700 9px/1 Tahoma, sans-serif;
  letter-spacing: -1px;
}

:root[data-codex-themes-skin="xp-qq"] main [class~="gap-[var(--conversation-item-gap,16px)]"] [data-content-search-unit-key]:not([data-local-conversation-final-assistant] *):not([class*="conversation-patch-file"] *) :is(p, ul, ol) {
  margin-block: 0 8px !important;
}

:root[data-codex-themes-skin="xp-qq"] main [class~="gap-[var(--conversation-item-gap,16px)]"] [data-content-search-unit-key]:not([data-local-conversation-final-assistant] *):not([class*="conversation-patch-file"] *) :is(p, ul, ol):last-child {
  margin-bottom: 0 !important;
}

:root[data-codex-themes-skin="xp-qq"] [data-local-conversation-final-assistant] {
  padding: 15px 18px !important;
  border-color: var(--qq-divider) !important;
  background: var(--qq-message-assistant) !important;
  box-shadow: 0 1px 2px rgba(31, 58, 80, .07) !important;
}

:root[data-codex-themes-skin="xp-qq"] [data-local-conversation-final-assistant] [data-content-search-unit-key] {
  min-width: 0 !important;
  color: var(--qq-ink) !important;
  font-size: 15px !important;
  line-height: 1.72 !important;
}

:root[data-codex-themes-skin="xp-qq"] [data-local-conversation-final-assistant] [data-content-search-unit-key] :where(p, li) {
  color: var(--qq-ink) !important;
  font-size: 15px !important;
  line-height: 1.72 !important;
}

:root[data-codex-themes-skin="xp-qq"] [data-local-conversation-final-assistant] [data-content-search-unit-key] :where(h1) {
  margin: 18px 0 10px !important;
  color: #1e5f94 !important;
  font-size: 23px !important;
  font-weight: 700 !important;
  line-height: 1.32 !important;
  letter-spacing: -.01em !important;
}

:root[data-codex-themes-skin="xp-qq"] [data-local-conversation-final-assistant] [data-content-search-unit-key] :where(h2) {
  margin: 17px 0 8px !important;
  color: #244761 !important;
  font-size: 19px !important;
  font-weight: 700 !important;
  line-height: 1.38 !important;
}

:root[data-codex-themes-skin="xp-qq"] [data-local-conversation-final-assistant] [data-content-search-unit-key] :where(h3, h4) {
  margin: 15px 0 7px !important;
  color: #29475f !important;
  font-size: 16px !important;
  font-weight: 700 !important;
  line-height: 1.42 !important;
}

:root[data-codex-themes-skin="xp-qq"] [data-local-conversation-final-assistant] [data-content-search-unit-key] :where(ul, ol) {
  margin-block: 8px !important;
  padding-inline-start: 22px !important;
}

:root[data-codex-themes-skin="xp-qq"] [data-local-conversation-final-assistant] [data-content-search-unit-key] :where(pre, blockquote) {
  max-width: 100% !important;
  overflow: auto !important;
  border-color: var(--qq-divider) !important;
  background: #f4f6f8 !important;
}

:root[data-codex-themes-skin="xp-qq"] [data-local-conversation-final-assistant] [data-content-search-unit-key] :where(code:not(pre code)) {
  color: #244761 !important;
  background: #edf1f4 !important;
}

:root[data-codex-themes-skin="xp-qq"] [data-local-conversation-final-assistant] [data-content-search-unit-key] table {
  width: max-content !important;
  min-width: 100% !important;
  color: var(--qq-ink) !important;
  border-collapse: separate !important;
  border-spacing: 0 !important;
  font-size: 13px !important;
  line-height: 1.5 !important;
}

:root[data-codex-themes-skin="xp-qq"] [data-local-conversation-final-assistant] [data-content-search-unit-key] :where(th, td) {
  padding: 8px 10px !important;
  border-color: var(--qq-divider) !important;
  vertical-align: top !important;
}

:root[data-codex-themes-skin="xp-qq"] [data-local-conversation-final-assistant] [data-content-search-unit-key] th {
  color: #29475f !important;
  background: #f1f4f6 !important;
  font-weight: 700 !important;
}

:root[data-codex-themes-skin="xp-qq"]:has([data-settings-panel-slug]) main.main-surface {
  background: #f7f8fa !important;
}

:root[data-codex-themes-skin="xp-qq"]:has([data-settings-panel-slug]) main.main-surface::before,
:root[data-codex-themes-skin="xp-qq"]:has([data-settings-panel-slug]) main.main-surface::after {
  display: none !important;
  content: none !important;
}

:root[data-codex-themes-skin="xp-qq"]:has([data-settings-panel-slug]) main.main-surface > header + div {
  padding-top: 0 !important;
}

:root[data-codex-themes-skin="xp-qq"]:has([data-settings-panel-slug]) [class*="rounded-2xl"][class*="border-token-border"] {
  border-color: var(--qq-divider) !important;
  background: var(--qq-panel) !important;
  border-radius: 8px !important;
  box-shadow: 0 1px 2px rgba(31, 58, 80, .05) !important;
}

:root[data-codex-themes-skin="xp-qq"]:has([data-settings-panel-slug]) main.main-surface :where(input, textarea, select, [role="switch"]) {
  color-scheme: light !important;
}

:root[data-codex-themes-skin="xp-qq"] .isolate:has(> [role="tabpanel"][data-app-shell-tab-panel-controller="right"]) {
  background: var(--qq-utility-chrome) !important;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role]:focus-visible,
:root[data-codex-themes-skin="xp-qq"] #codex-themes-skin-menu button:focus-visible,
:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="xp-qq-contact"]:focus-within {
  outline: 2px solid var(--qq-focus) !important;
  outline-offset: 2px !important;
}

:root[data-codex-themes-skin="xp-qq"] #codex-themes-xp-qq-avatar-editor::after {
  position: absolute;
  z-index: 15;
  right: -1px;
  bottom: -1px;
  width: 10px;
  height: 10px;
  box-sizing: border-box;
  content: "";
  border: 2px solid #f4fbff;
  border-radius: 50%;
  background: #2ea866;
  box-shadow: 0 0 0 1px rgba(22, 98, 58, .16);
  pointer-events: none;
}

/* If a future Codex build removes one of the three audited shell anchors,
 * preserve the native controls and disable only layout-owning decorations. */
:root[data-codex-themes-skin="xp-qq"][data-codex-themes-xp-qq-compatibility="fallback"] #codex-themes-xp-qq-profile,
:root[data-codex-themes-skin="xp-qq"][data-codex-themes-xp-qq-compatibility="fallback"] #codex-themes-xp-qq-profile-panel,
:root[data-codex-themes-skin="xp-qq"][data-codex-themes-xp-qq-compatibility="fallback"] #codex-themes-xp-qq-avatar-editor,
:root[data-codex-themes-skin="xp-qq"][data-codex-themes-xp-qq-compatibility="fallback"] #codex-themes-xp-qq-sidebar-actions,
:root[data-codex-themes-skin="xp-qq"][data-codex-themes-xp-qq-compatibility="fallback"] #codex-themes-xp-qq-mode-switch {
  display: none !important;
}

:root[data-codex-themes-skin="xp-qq"][data-codex-themes-xp-qq-compatibility="fallback"] [data-codex-themes-native-action-hidden="true"] {
  display: revert !important;
}

:root[data-codex-themes-skin="xp-qq"][data-codex-themes-xp-qq-compatibility="fallback"] .app-shell-left-panel::before,
:root[data-codex-themes-skin="xp-qq"][data-codex-themes-xp-qq-compatibility="fallback"] main.main-surface::before,
:root[data-codex-themes-skin="xp-qq"][data-codex-themes-xp-qq-compatibility="fallback"] main.main-surface::after {
  display: none !important;
  content: none !important;
}

:root[data-codex-themes-skin="xp-qq"][data-codex-themes-xp-qq-compatibility="fallback"] .app-shell-left-panel > .max-w-full,
:root[data-codex-themes-skin="xp-qq"][data-codex-themes-xp-qq-compatibility="fallback"] main.main-surface > header + div {
  padding-top: 0 !important;
}

@media (prefers-reduced-motion: reduce) {
  :root[data-codex-themes-skin="xp-qq"] *,
  :root[data-codex-themes-skin="xp-qq"] *::before,
  :root[data-codex-themes-skin="xp-qq"] *::after {
    scroll-behavior: auto !important;
    transition-duration: .01ms !important;
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
  }
}

:root[data-codex-themes-skin="xp-qq"] button {
  font-family: Tahoma, "Microsoft YaHei", "Segoe UI", sans-serif !important;
}

:root[data-codex-themes-skin="xp-qq"] #codex-themes-skin-menu > button {
  width: 30px !important;
  height: 24px !important;
  color: #31536e !important;
  border: 1px solid #a8c3d7 !important;
  border-radius: 3px !important;
  background: linear-gradient(180deg, #fff, #e5f0f8) !important;
  box-shadow: inset 0 1px #fff !important;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="menu-trigger-glyph"] {
  width: auto !important;
  height: auto !important;
  font-size: 0 !important;
  white-space: nowrap;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="theme-icon"] {
  display: none !important;
}

:root[data-codex-themes-skin="xp-qq"] [data-codex-themes-role="menu-trigger-glyph"]::after {
  content: "换肤";
  font: 11px/1 Tahoma, "Microsoft YaHei", sans-serif;
}

:root[data-codex-themes-skin="xp-qq"] #codex-themes-skin-menu-panel {
  left: 0 !important;
  width: 304px !important;
  transform: none !important;
  color: #29475f !important;
  border: 1px solid #8eafc8 !important;
  border-radius: 4px !important;
  background: #f6fbff !important;
  box-shadow: 2px 3px 9px rgba(30, 67, 94, .24) !important;
  backdrop-filter: none !important;
}

:root[data-codex-themes-skin="xp-qq"] #codex-themes-skin-menu-panel button {
  border-radius: 2px !important;
}

:root[data-codex-themes-skin="xp-qq"] ::-webkit-scrollbar {
  width: 12px;
  height: 12px;
}

:root[data-codex-themes-skin="xp-qq"] ::-webkit-scrollbar-track {
  background: #e9f1f7;
  box-shadow: inset 1px 0 #c2d4e1;
}

:root[data-codex-themes-skin="xp-qq"] ::-webkit-scrollbar-thumb {
  border: 2px solid #e9f1f7;
  border-radius: 2px;
  background: #92b8d3;
}
`;
}

export function buildSkinCss({ theme, heroDataUrl, logoDataUrl = null, polaroidDataUrl = null }) {
  if (!DATA_URL.test(heroDataUrl)) {
    throw new Error("hero 必须是本地 PNG、JPEG 或 WebP 数据");
  }
  if (logoDataUrl !== null && !DATA_URL.test(logoDataUrl)) {
    throw new Error("logo 必须是本地 PNG、JPEG 或 WebP 数据");
  }
  if (polaroidDataUrl !== null && !DATA_URL.test(polaroidDataUrl)) {
    throw new Error("polaroid 必须是本地 PNG、JPEG 或 WebP 数据");
  }
  const colors = {
    accent: color(theme.colors?.accent, DEFAULT_COLORS.accent),
    secondary: color(theme.colors?.secondary, DEFAULT_COLORS.secondary),
    surface: color(theme.colors?.surface, DEFAULT_COLORS.surface),
    text: color(theme.colors?.text, DEFAULT_COLORS.text),
  };
  const id = String(theme.id ?? "custom").replace(/[^a-z0-9_-]/gi, "");

  return `/* CODEX_THEMES_SKIN:${id} */
:root[data-codex-window-type="electron"] {
  color-scheme: light !important;
  --codex-themes-accent: ${colors.accent};
  --codex-themes-secondary: ${colors.secondary};
  --codex-themes-surface: ${colors.surface};
  --codex-themes-text: ${colors.text};
  --color-background-surface: color-mix(in srgb, var(--codex-themes-surface) 90%, transparent) !important;
  --color-background-panel: color-mix(in srgb, var(--codex-themes-surface) 94%, transparent) !important;
  --color-background-button-primary: var(--codex-themes-accent) !important;
  --color-text-foreground: var(--codex-themes-text) !important;
  --color-border: color-mix(in srgb, var(--codex-themes-accent) 45%, transparent) !important;
}

#root {
  color: var(--codex-themes-text) !important;
  background:
    linear-gradient(90deg, color-mix(in srgb, var(--codex-themes-surface) 96%, transparent) 0 22%, transparent 46%),
    linear-gradient(180deg, transparent 0 45%, color-mix(in srgb, var(--codex-themes-surface) 78%, transparent) 78% 100%),
    url(${JSON.stringify(heroDataUrl)}) right center / cover no-repeat fixed !important;
}

#root::before {
  position: fixed;
  z-index: 20;
  top: 76px;
  left: max(380px, 24vw);
  content: ${copy(theme.copy?.brand)};
  color: var(--codex-themes-accent);
  font: 800 clamp(16px, 2vw, 30px)/1.2 ui-rounded, system-ui;
  text-shadow: 0 2px 10px white;
  pointer-events: none;
}

#root::after {
  position: fixed;
  z-index: 20;
  top: 120px;
  left: max(380px, 24vw);
  max-width: 42vw;
  content: ${copy(theme.copy?.headline)};
  color: var(--codex-themes-text);
  font: 750 clamp(18px, 2.7vw, 42px)/1.15 ui-rounded, system-ui;
  text-shadow: 0 2px 12px white;
  pointer-events: none;
}

.app-shell-left-panel {
  background: color-mix(in srgb, var(--codex-themes-surface) 88%, transparent) !important;
  border-right: 1px solid color-mix(in srgb, var(--codex-themes-accent) 45%, transparent) !important;
  backdrop-filter: blur(20px) saturate(1.12);
}

.main-surface,
.browser-main-surface {
  background: linear-gradient(180deg, transparent 0 40%, color-mix(in srgb, var(--codex-themes-surface) 74%, transparent) 100%) !important;
}

.composer-surface-chrome,
[data-user-message-bubble],
[data-local-conversation-final-assistant],
[data-codex-approval-surface] {
  color: var(--codex-themes-text) !important;
  border-color: color-mix(in srgb, var(--codex-themes-accent) 48%, transparent) !important;
  background: color-mix(in srgb, var(--codex-themes-surface) 88%, transparent) !important;
  box-shadow: 0 8px 24px color-mix(in srgb, var(--codex-themes-accent) 18%, transparent) !important;
  backdrop-filter: blur(18px) saturate(1.08);
}

[data-app-action-sidebar-thread-active="true"] {
  background: linear-gradient(90deg, color-mix(in srgb, var(--codex-themes-accent) 22%, transparent), color-mix(in srgb, var(--codex-themes-secondary) 16%, transparent)) !important;
}
${buildVariantCss(id, heroDataUrl)}
${logoDataUrl === null ? "" : `
/* 侧栏工作区标题换品牌 Logo，按钮仍可点开模式切换 */
.app-shell-left-panel button[aria-haspopup="menu"][aria-label*="ChatGPT"] {
  background: url(${JSON.stringify(logoDataUrl)}) left center / contain no-repeat !important;
  width: 214px;
  height: 78px !important;
  margin: 4px 0 0;
}
.app-shell-left-panel button[aria-haspopup="menu"][aria-label*="ChatGPT"] > span,
.app-shell-left-panel button[aria-haspopup="menu"][aria-label*="ChatGPT"] > svg {
  visibility: hidden;
}
`}${polaroidDataUrl === null ? "" : `
/* 右下角拍立得挂件，点击穿透 */
body::after {
  content: "";
  position: fixed;
  right: 20px;
  bottom: 24px;
  width: 200px;
  height: 300px;
  background: url(${JSON.stringify(polaroidDataUrl)}) center / contain no-repeat;
  pointer-events: none;
  z-index: 15;
  filter: drop-shadow(0 12px 26px color-mix(in srgb, var(--codex-themes-text) 24%, transparent));
}
`}`;
}
