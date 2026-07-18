import test from "node:test";
import assert from "node:assert/strict";

import { createSkinController } from "../src/controller.mjs";

const token = Buffer.alloc(32, 7).toString("base64url");
const generation = "a".repeat(32);
const processIdentity = {
  pid: 4242,
  executablePath: "/Applications/ChatGPT.app/Contents/MacOS/ChatGPT",
  startedAt: "2026-07-18T00:00:00.000Z",
};

function rendererStatus({ controlRequest = null, themeId = "xp-qq" } = {}) {
  return {
    statuses: [{
      installed: true,
      generation,
      menu: true,
      mode: themeId === "__codex_themes_native__" ? "native" : "active",
      themeId,
      persistenceEnabled: true,
      revision: 7,
      controlRequest,
    }],
  };
}

test("an in-flight repair never reinjects a stale theme after a renderer request arrives", async () => {
  const state = {
    persistenceEnabled: true,
    revision: 7,
    selectedThemeId: "xp-qq",
    lastNonNativeThemeId: "xp-qq",
    controlToken: token,
  };
  const request = {
    schemaVersion: 1,
    requestId: "b".repeat(32),
    action: "set-theme",
    capability: token,
    expectedRevision: 7,
    themeId: "__codex_themes_native__",
  };
  let pendingRequest = false;
  let releaseHealth;
  let healthInspectionStarted;
  const healthStarted = new Promise((resolve) => { healthInspectionStarted = resolve; });
  const healthGate = new Promise((resolve) => { releaseHealth = resolve; });
  const injectedThemes = [];

  const controller = createSkinController({
    withLease: async (_operation, action) => action({ id: "lease" }),
    readState: async () => state,
    readSession: async () => ({
      schemaVersion: 1,
      mode: "active",
      process: processIdentity,
      activeThemeId: "xp-qq",
      keepUntilProcessExit: false,
    }),
    readTransition: async () => null,
    writeJournal: async () => {},
    compareAndUpdate: async () => state,
    writeSession: async () => {},
    clearJournal: async () => {},
    recoverTransition: async () => ({ state, recovered: false }),
    probeCurrentProcess: async () => processIdentity,
    validatePortOwner: async () => true,
    inspectSkin: async (options) => {
      if (options?.purpose === "renderer-control-request") {
        return rendererStatus({ controlRequest: pendingRequest ? request : null });
      }
      healthInspectionStarted();
      await healthGate;
      return rendererStatus({ themeId: "__codex_themes_native__" });
    },
    injectSkin: async ({ themeId }) => { injectedThemes.push(themeId); },
    removeSkin: async () => {},
    startControlServer: async () => ({
      host: "127.0.0.1",
      port: 49341,
      close: async () => {},
    }),
    registerBackground: async () => ({ registered: true, started: true }),
    unregisterBackground: async () => {},
    inspectBackground: async () => ({ registered: false }),
    wakeBackground: async () => {},
    verifyBackgroundHandshake: async () => processIdentity,
    backgroundProcess: true,
  });

  await controller.start();
  injectedThemes.length = 0;
  const tick = controller.tick();
  await healthStarted;
  pendingRequest = true;
  releaseHealth();
  const result = await tick;

  assert.equal(result.action, "idle");
  assert.deepEqual(injectedThemes, []);
  await controller.stop();
});
