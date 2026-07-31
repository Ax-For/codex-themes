import test from "node:test";
import assert from "node:assert/strict";

import { runControllerProcess } from "../src/cli.mjs";
import { createSkinController } from "../src/controller.mjs";

const token = Buffer.alloc(32, 9).toString("base64url");
const nativeProcess = {
  pid: 5151,
  executablePath: "/Applications/ChatGPT.app/Contents/MacOS/ChatGPT",
  startedAt: "2026-07-31T10:00:00.000Z",
};

function recoveryController({ now, restartIntoCdp }) {
  const state = {
    persistenceEnabled: true,
    revision: 3,
    selectedThemeId: "xp-qq",
    lastNonNativeThemeId: "xp-qq",
    controlToken: token,
  };
  return createSkinController({
    withLease: async (_operation, action) => action({ id: "lease" }),
    readState: async () => state,
    readSession: async () => null,
    readTransition: async () => null,
    writeJournal: async () => {},
    compareAndUpdate: async () => state,
    writeSession: async () => {},
    clearJournal: async () => {},
    recoverTransition: async () => ({ state, recovered: false }),
    probeCurrentProcess: async () => null,
    probeNativeProcess: async () => nativeProcess,
    restartIntoCdp,
    validatePortOwner: async () => false,
    injectSkin: async () => {},
    removeSkin: async () => {},
    registerBackground: async () => ({ registered: true }),
    unregisterBackground: async () => {},
    inspectBackground: async () => ({ registered: true }),
    wakeBackground: async () => {},
    verifyBackgroundHandshake: async () => nativeProcess,
    backgroundProcess: true,
    now,
  });
}

test("background controller retries the same native Codex after a detached upgrade restart stalls", async () => {
  let clock = 1_000_000;
  let restartCalls = 0;
  const controller = recoveryController({
    now: () => clock,
    restartIntoCdp: async () => {
      restartCalls += 1;
      return { queued: true };
    },
  });

  assert.equal((await controller.start()).action, "relaunch");
  assert.equal(restartCalls, 1);

  clock += 44_999;
  assert.equal((await controller.tick()).action, "wait-for-app");
  assert.equal(restartCalls, 1);

  clock += 1;
  assert.equal((await controller.tick()).action, "relaunch");
  assert.equal(restartCalls, 2);

  clock += 45_000;
  assert.equal((await controller.tick()).action, "relaunch");
  assert.equal(restartCalls, 3);

  clock += 45_000;
  assert.equal((await controller.tick()).action, "wait-for-app");
  assert.equal(restartCalls, 3);

  clock = 1_300_000;
  assert.equal((await controller.tick()).action, "relaunch");
  assert.equal(restartCalls, 4);
  await controller.stop();
});

test("background process survives a transient startup failure and keeps reconciling", async () => {
  let tickCalls = 0;
  let stopCalls = 0;
  const waits = [];
  const controller = {
    start: async () => ({
      action: "error",
      mode: "error",
      persistenceEnabled: true,
      revision: 3,
      consecutiveFailures: 1,
    }),
    tick: async () => {
      tickCalls += 1;
      return {
        action: "unregister",
        mode: "native",
        persistenceEnabled: false,
        revision: 4,
      };
    },
    stop: async () => { stopCalls += 1; },
  };

  const result = await runControllerProcess(controller, {
    backgroundRuntime: {
      platform: "darwin",
      backgroundIdentity: "com.codex-themes.skin-controller",
    },
    paths: { stateRoot: "/tmp/codex-themes-update-recovery" },
    claimStartRequest: async () => null,
    wait: async (milliseconds) => { waits.push(milliseconds); },
  });

  assert.equal(result.action, "unregister");
  assert.equal(tickCalls, 1);
  assert.equal(stopCalls, 1);
  assert.equal(waits.length, 1);
  assert.ok(waits[0] >= 1_000 && waits[0] <= 30_000);
});
