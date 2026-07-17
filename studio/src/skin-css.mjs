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
:root[data-codex-window-type="electron"][data-heige-codex-skin="xp-qq"] {
  --qq-blue-700: #155d9f;
  --qq-blue-600: #2879bd;
  --qq-blue-500: #4a91cc;
  --qq-blue-200: #b9d5ea;
  --qq-blue-100: #dcecf8;
  --qq-blue-050: #eef6fc;
  --qq-paper: #ffffff;
  --qq-ink: #20364a;
  --qq-muted: #6f8394;
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
  --color-token-editor-background: #f8fbfe !important;
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
  --color-token-side-bar-background: #e7f3fb !important;
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

:root[data-heige-codex-skin="xp-qq"] body {
  background: #d7e8f5 !important;
}

:root[data-heige-codex-skin="xp-qq"] #root {
  position: relative;
  padding: 0 !important;
  color: var(--qq-ink) !important;
  background: #eef5fa !important;
  font-family: Tahoma, "Microsoft YaHei", "Segoe UI", sans-serif !important;
}

:root[data-heige-codex-skin="xp-qq"] #root > div:first-child {
  min-height: 100% !important;
  overflow: hidden;
  border: 0 !important;
  border-radius: 0 !important;
  background: #eef5fa !important;
  box-shadow: none !important;
}

:root[data-heige-codex-skin="xp-qq"] #root::before,
:root[data-heige-codex-skin="xp-qq"] #root::after {
  display: none !important;
  content: none !important;
}

/* Use Codex's real draggable header as the QQ title bar. */
:root[data-heige-codex-skin="xp-qq"] header.app-header-tint {
  color: #fff !important;
  border-bottom: 1px solid #0e4e88 !important;
  background: linear-gradient(180deg, #5da1d8 0%, #2d7dbd 48%, #1765a8 100%) !important;
  box-shadow: inset 0 1px rgba(255, 255, 255, .48), 0 1px 2px rgba(24, 65, 99, .18) !important;
}

:root[data-heige-codex-skin="xp-qq"] header.app-header-tint * {
  color: #fff !important;
  text-shadow: 0 1px rgba(11, 56, 96, .8);
}

:root[data-heige-codex-skin="xp-qq"] header.app-header-tint button {
  border-color: transparent !important;
  border-radius: 3px !important;
  background: transparent !important;
}

:root[data-heige-codex-skin="xp-qq"] header.app-header-tint button:hover {
  border-color: rgba(255, 255, 255, .32) !important;
  background: rgba(255, 255, 255, .13) !important;
}

:root[data-heige-codex-skin="xp-qq"] .app-shell-left-panel {
  position: relative;
  background: linear-gradient(180deg, #edf6fd 0%, #e3f0fa 100%) !important;
  border-right: 1px solid #9ebed7 !important;
  box-shadow: inset -1px 0 rgba(255, 255, 255, .82);
  backdrop-filter: none !important;
}

:root[data-heige-codex-skin="xp-qq"] .app-shell-left-panel::before {
  position: absolute;
  z-index: 12;
  top: 46px;
  right: 0;
  left: 0;
  height: 78px;
  padding: 39px 68px 0 66px;
  content: "在线 · 正在处理任务";
  color: #173f63;
  border-bottom: 1px solid #a9c8df;
  background: linear-gradient(180deg, #f8fcff, #d8ebfa);
  box-shadow: inset 0 -1px #fff;
  font: 700 13px/1.65 Tahoma, "Microsoft YaHei", sans-serif;
  white-space: pre;
  pointer-events: none;
}

:root[data-heige-codex-skin="xp-qq"] .app-shell-left-panel::after {
  position: absolute;
  z-index: 13;
  top: 58px;
  left: 14px;
  display: grid;
  width: 44px;
  height: 44px;
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

:root[data-heige-codex-skin="xp-qq"][data-heige-xp-qq-avatar="custom"] .app-shell-left-panel::after {
  content: "";
  background-color: #dcecf8;
  background-image: var(--heige-xp-qq-avatar-image) !important;
  background-position: center !important;
  background-size: cover !important;
}

:root[data-heige-codex-skin="xp-qq"] .app-shell-left-panel > .max-w-full {
  box-sizing: border-box;
  padding-top: 78px;
}

:root[data-heige-codex-skin="xp-qq"] .app-shell-left-panel div:has(> button[aria-label^="切换模式"]) {
  position: fixed !important;
  z-index: 16 !important;
  /* The sidebar uses contain:layout_paint, so fixed descendants are offset by its 124px nav origin. */
  top: -72px !important;
  left: 64px !important;
  display: flex !important;
  width: 132px !important;
  height: 28px !important;
  margin: 0 !important;
  padding: 0 !important;
  align-items: center !important;
}

:root[data-heige-codex-skin="xp-qq"] .app-shell-left-panel > div[data-heige-role="xp-qq-mode-switch"]:has(> button[aria-label^="切换模式"]) {
  position: absolute !important;
  top: 52px !important;
  left: 64px !important;
}

:root[data-heige-codex-skin="xp-qq"] .app-shell-left-panel button[aria-label^="切换模式"] {
  height: 27px !important;
  min-width: 0 !important;
  max-width: 132px !important;
  margin: 0 !important;
  padding: 0 7px !important;
  color: #173f63 !important;
  border: 1px solid transparent !important;
  border-radius: 3px !important;
  background: transparent !important;
  font-size: 13px !important;
  font-weight: 700 !important;
  line-height: 25px !important;
}

:root[data-heige-codex-skin="xp-qq"] .app-shell-left-panel button[aria-label^="切换模式"]:hover,
:root[data-heige-codex-skin="xp-qq"] .app-shell-left-panel button[aria-label^="切换模式"][data-state="open"] {
  border-color: #a8c5da !important;
  background: rgba(255, 255, 255, .72) !important;
}

#heige-xp-qq-avatar-editor,
#heige-xp-qq-avatar-notice {
  display: none;
}

:root[data-heige-codex-skin="xp-qq"] #heige-xp-qq-avatar-editor {
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

:root[data-heige-codex-skin="xp-qq"] #heige-xp-qq-avatar-editor > span {
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

:root[data-heige-codex-skin="xp-qq"] #heige-xp-qq-avatar-editor:hover > span,
:root[data-heige-codex-skin="xp-qq"] #heige-xp-qq-avatar-editor:focus-visible > span {
  opacity: 1;
  transform: translateY(0);
}

:root[data-heige-codex-skin="xp-qq"] #heige-xp-qq-avatar-editor:focus-visible {
  outline: 2px solid #4a91cc;
  outline-offset: 2px;
}

:root[data-heige-codex-skin="xp-qq"] #heige-xp-qq-avatar-editor:disabled {
  cursor: wait;
}

:root[data-heige-codex-skin="xp-qq"] #heige-xp-qq-avatar-notice:not([hidden]) {
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

:root[data-heige-codex-skin="xp-qq"] #heige-xp-qq-avatar-notice[data-kind="error"] {
  color: #8a3733;
  border-color: #d9aaa7;
  background: #fff2f1;
}

:root[data-heige-codex-skin="xp-qq"] .app-shell-left-panel nav {
  color: #28475f !important;
}

:root[data-heige-codex-skin="xp-qq"] .app-shell-left-panel [data-app-action-sidebar-section-heading] *,
:root[data-heige-codex-skin="xp-qq"] .app-shell-left-panel [class*="text-token-input-placeholder"] {
  color: #647d91 !important;
}

:root[data-heige-codex-skin="xp-qq"] .app-shell-left-panel button[data-app-action-sidebar-section-toggle] {
  font-size: 0 !important;
}

:root[data-heige-codex-skin="xp-qq"] .app-shell-left-panel button[data-app-action-sidebar-section-toggle]::after {
  content: "我的会话";
  color: #647d91;
  font: 600 11px/1 Tahoma, "Microsoft YaHei", sans-serif;
}

:root[data-heige-codex-skin="xp-qq"] [data-app-action-sidebar-thread-row],
:root[data-heige-codex-skin="xp-qq"] [data-app-action-sidebar-project-row] {
  border: 1px solid transparent;
  border-radius: 2px !important;
}

:root[data-heige-codex-skin="xp-qq"] [data-app-action-sidebar-thread-row]:hover,
:root[data-heige-codex-skin="xp-qq"] [data-app-action-sidebar-project-row]:hover {
  border-color: #b2cde1;
  background: #f5faff !important;
}

:root[data-heige-codex-skin="xp-qq"] [data-app-action-sidebar-thread-active="true"] {
  color: #163f63 !important;
  border: 1px solid #8fb7d5;
  border-radius: 2px !important;
  background: linear-gradient(180deg, #dceefd, #c9e2f4) !important;
  box-shadow: inset 0 1px rgba(255, 255, 255, .9);
}

:root[data-heige-codex-skin="xp-qq"] .main-surface,
:root[data-heige-codex-skin="xp-qq"] .browser-main-surface {
  position: relative;
  background: #f8fbfd !important;
}

/* A visible QQ contact header between the title bar and conversation. */
:root[data-heige-codex-skin="xp-qq"] main.main-surface::before {
  position: absolute;
  z-index: 24;
  top: 46px;
  right: 316px;
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

:root[data-heige-codex-skin="xp-qq"] main.main-surface::after {
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

:root[data-heige-codex-skin="xp-qq"] main.main-surface > header + div {
  box-sizing: border-box;
  padding-top: 62px;
}

:root[data-heige-codex-skin="xp-qq"] .app-shell-main-content-viewport {
  background: #f7fafc !important;
}

/* Keep Codex's functional output panel, but make it part of the same light QQ shell. */
:root[data-heige-codex-skin="xp-qq"] main .rounded-3xl.bg-token-dropdown-background {
  color: #29475f !important;
  border: 1px solid #9ebed7 !important;
  border-radius: 5px !important;
  background: #f7fbfe !important;
  box-shadow: 0 5px 16px rgba(39, 78, 106, .16) !important;
}

:root[data-heige-codex-skin="xp-qq"] main .rounded-3xl.bg-token-dropdown-background header {
  color: #526d82 !important;
  background: #f7fbfe !important;
}

:root[data-heige-codex-skin="xp-qq"] main .rounded-3xl.bg-token-dropdown-background section::after {
  background: #c9d9e5 !important;
}

/* Portal tooltips live outside the sidebar, so they must use semantic tokens too. */
:root[data-heige-codex-skin="xp-qq"] [role="tooltip"][class*="bg-token-dropdown-background"] {
  color: var(--qq-ink) !important;
  border: 1px solid #9fbed5 !important;
  background: #f8fbfe !important;
  box-shadow: 1px 2px 8px rgba(35, 73, 101, .18) !important;
  backdrop-filter: none !important;
}

/* Attachments and turn diffs are useful controls, not dark floating cards. */
:root[data-heige-codex-skin="xp-qq"] main [class*="bg-token-dropdown-background/50"] {
  color: var(--qq-ink) !important;
  border: 1px solid #bfd4e4 !important;
  background: #eef5fa !important;
  box-shadow: inset 0 1px #fff !important;
}

:root[data-heige-codex-skin="xp-qq"] main [class*="bg-token-dropdown-background/50"] > * + * {
  border-color: #c8dbe9 !important;
}

/* File tools read as an embedded XP utility window, not an unstyled white page. */
:root[data-heige-codex-skin="xp-qq"] .isolate:has(> [role="tabpanel"][aria-label="打开文件"]) {
  border-left: 1px solid #9fbed5 !important;
  background: #f4f9fc !important;
}

:root[data-heige-codex-skin="xp-qq"] .isolate:has(> [role="tabpanel"][aria-label="打开文件"]) > .h-toolbar {
  position: relative !important;
  color: #244761 !important;
  border-bottom: 1px solid #aac6da !important;
  background: linear-gradient(180deg, #fdfefe, #e5f1f9) !important;
  box-shadow: inset 0 -1px #fff !important;
}

#heige-xp-qq-file-title {
  display: none;
}

/* Electron occasionally keeps the native tab in the accessibility tree but
 * drops its entire text layer. The runtime positions this body-level label
 * over the toolbar so it stays in a separate compositor layer. */
:root[data-heige-codex-skin="xp-qq"] #heige-xp-qq-file-title:not([hidden]) {
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

:root[data-heige-codex-skin="xp-qq"] .isolate:has(> [role="tabpanel"][aria-label="打开文件"]) [role="button"]:has(> [role="tab"]) {
  border: 1px solid #aac6da !important;
  border-radius: 3px 3px 0 0 !important;
  background: #fff !important;
  box-shadow: inset 0 1px #fff !important;
}

:root[data-heige-codex-skin="xp-qq"] [role="tabpanel"][aria-label="打开文件"] {
  color: #29475f !important;
  background: #f7fbfe !important;
}

:root[data-heige-codex-skin="xp-qq"] [role="tabpanel"][aria-label="打开文件"] > .flex {
  border-top: 1px solid #d2e1eb !important;
  background: #f7fbfe !important;
}

:root[data-heige-codex-skin="xp-qq"] [role="tabpanel"][aria-label="打开文件"] .border-l:has(input[placeholder*="筛选文件"]) {
  border-left-color: #aac6da !important;
  background: linear-gradient(180deg, #f3f9fd, #eaf4fb) !important;
}

:root[data-heige-codex-skin="xp-qq"] [role="tabpanel"][aria-label="打开文件"] div:has(> input[placeholder*="筛选文件"]) {
  border-color: #aac6da !important;
  border-radius: 3px !important;
  background: #fff !important;
  box-shadow: inset 1px 1px 2px rgba(62, 101, 130, .09) !important;
}

:root[data-heige-codex-skin="xp-qq"] [role="tabpanel"][aria-label="打开文件"] input[placeholder*="筛选文件"] {
  color: var(--qq-ink) !important;
}

/* The terminal stays dark for ANSI readability, but belongs to the QQ blue system. */
:root[data-heige-codex-skin="xp-qq"] .isolate:has([id^="terminal-panel-"]) {
  border-top-color: #8fb3cf !important;
  background: #e8f2f9 !important;
}

:root[data-heige-codex-skin="xp-qq"] .isolate:has(> [role="tabpanel"] [id^="terminal-panel-"]) > div:has(> [role="tablist"]) {
  color: #29475f !important;
  border-bottom: 1px solid #8fb3cf !important;
  background: linear-gradient(180deg, #f9fcfe, #dcebf5) !important;
  box-shadow: inset 0 1px #fff !important;
}

:root[data-heige-codex-skin="xp-qq"] .isolate:has(> [role="tabpanel"] [id^="terminal-panel-"]) [role="tablist"] {
  border: 1px solid #9ebbd0 !important;
  border-bottom-color: #10283c !important;
  border-radius: 3px 3px 0 0 !important;
  background: #fff !important;
}

:root[data-heige-codex-skin="xp-qq"] [id^="terminal-panel-"],
:root[data-heige-codex-skin="xp-qq"] [id^="terminal-panel-"] .xterm,
:root[data-heige-codex-skin="xp-qq"] [id^="terminal-panel-"] .xterm-screen,
:root[data-heige-codex-skin="xp-qq"] [id^="terminal-panel-"] .xterm-viewport,
:root[data-heige-codex-skin="xp-qq"] [id^="terminal-panel-"] .xterm-rows {
  color: #e7f2f8 !important;
  background-color: #10283c !important;
}

:root[data-heige-codex-skin="xp-qq"] [id^="terminal-panel-"] {
  border-top: 1px solid #071c2b !important;
  box-shadow: inset 0 1px rgba(255, 255, 255, .05) !important;
}

:root[data-heige-codex-skin="xp-qq"] [id^="terminal-panel-"] .xterm-selection div {
  background-color: rgba(95, 164, 214, .38) !important;
}

/* QQ-like message rows with clear sender identity. */
:root[data-heige-codex-skin="xp-qq"] [data-user-message-bubble] {
  position: relative;
  margin-right: 44px !important;
  overflow: visible !important;
  color: #18364f !important;
  border: 1px solid #9fc3de !important;
  border-radius: 5px 5px 2px 5px !important;
  background: #dff1ff !important;
  box-shadow: 0 1px 2px rgba(38, 83, 117, .12) !important;
}

:root[data-heige-codex-skin="xp-qq"] [data-user-message-bubble]::after {
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

:root[data-heige-codex-skin="xp-qq"] [data-local-conversation-final-assistant],
:root[data-heige-codex-skin="xp-qq"] main [class*="conversation-item-gap"] {
  position: relative;
  margin-left: 44px;
  padding: 13px 15px !important;
  color: var(--qq-ink) !important;
  border: 1px solid #c3d6e5;
  border-radius: 5px 5px 5px 2px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(44, 78, 103, .08);
}

:root[data-heige-codex-skin="xp-qq"] [data-local-conversation-final-assistant]::before,
:root[data-heige-codex-skin="xp-qq"] main [class*="conversation-item-gap"]::before {
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

:root[data-heige-codex-skin="xp-qq"] .composer-surface-chrome {
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

:root[data-heige-codex-skin="xp-qq"] .composer-surface-chrome [data-codex-composer="true"] {
  min-height: 46px;
  color: #20364a !important;
}

:root[data-heige-codex-skin="xp-qq"] .composer-surface-chrome button[aria-label^="发送"],
:root[data-heige-codex-skin="xp-qq"] .composer-surface-chrome button[aria-label^="停止"] {
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

:root[data-heige-codex-skin="xp-qq"] .composer-surface-chrome button[aria-label^="发送"]::after {
  content: "发送";
  margin-left: 3px;
  font: 11px/1 Tahoma, "Microsoft YaHei", sans-serif;
}

:root[data-heige-codex-skin="xp-qq"] .composer-surface-chrome button[aria-label^="停止"]::after {
  content: "停止";
  margin-left: 3px;
  font: 11px/1 Tahoma, "Microsoft YaHei", sans-serif;
}

:root[data-heige-codex-skin="xp-qq"] .composer-surface-chrome button[aria-label^="发送"]:disabled {
  color: #7890a3 !important;
  border-color: #b6ccdc !important;
  background: linear-gradient(180deg, #edf4f9, #dbe8f1) !important;
  box-shadow: inset 0 1px #fff !important;
}

:root[data-heige-codex-skin="xp-qq"] button {
  font-family: Tahoma, "Microsoft YaHei", "Segoe UI", sans-serif !important;
}

/* The theme control belongs to the QQ profile header, not the window chrome. */
:root[data-heige-codex-skin="xp-qq"] #heige-codex-skin-menu {
  top: 58px !important;
  right: auto !important;
  bottom: auto !important;
  left: 208px !important;
  width: 52px !important;
  height: 24px !important;
  transform: none !important;
}

:root[data-heige-codex-skin="xp-qq"] #heige-codex-skin-menu > button {
  width: 52px !important;
  height: 24px !important;
  color: #31536e !important;
  border: 1px solid #a8c3d7 !important;
  border-radius: 3px !important;
  background: linear-gradient(180deg, #fff, #e5f0f8) !important;
  box-shadow: inset 0 1px #fff !important;
}

:root[data-heige-codex-skin="xp-qq"] [data-heige-role="menu-trigger-glyph"] {
  font-size: 0 !important;
}

:root[data-heige-codex-skin="xp-qq"] [data-heige-role="menu-trigger-glyph"]::after {
  content: "换肤";
  font: 11px/1 Tahoma, "Microsoft YaHei", sans-serif;
}

:root[data-heige-codex-skin="xp-qq"] #heige-codex-skin-menu-panel {
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

:root[data-heige-codex-skin="xp-qq"] #heige-codex-skin-menu-panel button {
  border-radius: 2px !important;
}

:root[data-heige-codex-skin="xp-qq"] ::-webkit-scrollbar {
  width: 12px;
  height: 12px;
}

:root[data-heige-codex-skin="xp-qq"] ::-webkit-scrollbar-track {
  background: #e9f1f7;
  box-shadow: inset 1px 0 #c2d4e1;
}

:root[data-heige-codex-skin="xp-qq"] ::-webkit-scrollbar-thumb {
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

  return `/* HEIGE_CODEX_SKIN:${id} */
:root[data-codex-window-type="electron"] {
  color-scheme: light !important;
  --heige-accent: ${colors.accent};
  --heige-secondary: ${colors.secondary};
  --heige-surface: ${colors.surface};
  --heige-text: ${colors.text};
  --color-background-surface: color-mix(in srgb, var(--heige-surface) 90%, transparent) !important;
  --color-background-panel: color-mix(in srgb, var(--heige-surface) 94%, transparent) !important;
  --color-background-button-primary: var(--heige-accent) !important;
  --color-text-foreground: var(--heige-text) !important;
  --color-border: color-mix(in srgb, var(--heige-accent) 45%, transparent) !important;
}

#root {
  color: var(--heige-text) !important;
  background:
    linear-gradient(90deg, color-mix(in srgb, var(--heige-surface) 96%, transparent) 0 22%, transparent 46%),
    linear-gradient(180deg, transparent 0 45%, color-mix(in srgb, var(--heige-surface) 78%, transparent) 78% 100%),
    url(${JSON.stringify(heroDataUrl)}) right center / cover no-repeat fixed !important;
}

#root::before {
  position: fixed;
  z-index: 20;
  top: 76px;
  left: max(380px, 24vw);
  content: ${copy(theme.copy?.brand)};
  color: var(--heige-accent);
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
  color: var(--heige-text);
  font: 750 clamp(18px, 2.7vw, 42px)/1.15 ui-rounded, system-ui;
  text-shadow: 0 2px 12px white;
  pointer-events: none;
}

.app-shell-left-panel {
  background: color-mix(in srgb, var(--heige-surface) 88%, transparent) !important;
  border-right: 1px solid color-mix(in srgb, var(--heige-accent) 45%, transparent) !important;
  backdrop-filter: blur(20px) saturate(1.12);
}

.main-surface,
.browser-main-surface {
  background: linear-gradient(180deg, transparent 0 40%, color-mix(in srgb, var(--heige-surface) 74%, transparent) 100%) !important;
}

.composer-surface-chrome,
[data-user-message-bubble],
[data-local-conversation-final-assistant],
[data-codex-approval-surface] {
  color: var(--heige-text) !important;
  border-color: color-mix(in srgb, var(--heige-accent) 48%, transparent) !important;
  background: color-mix(in srgb, var(--heige-surface) 88%, transparent) !important;
  box-shadow: 0 8px 24px color-mix(in srgb, var(--heige-accent) 18%, transparent) !important;
  backdrop-filter: blur(18px) saturate(1.08);
}

[data-app-action-sidebar-thread-active="true"] {
  background: linear-gradient(90deg, color-mix(in srgb, var(--heige-accent) 22%, transparent), color-mix(in srgb, var(--heige-secondary) 16%, transparent)) !important;
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
  filter: drop-shadow(0 12px 26px color-mix(in srgb, var(--heige-text) 24%, transparent));
}
`}`;
}
