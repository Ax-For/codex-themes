import test from "node:test";
import assert from "node:assert/strict";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { launchMacCodexWithCdp } from "../src/cli.mjs";

const appPath = join(tmpdir(), "ChatGPT.app");
const app = {
  appPath,
  executablePath: join(appPath, "Contents", "MacOS", "ChatGPT"),
};

test("macOS login prelaunch starts the exact Codex app with loopback CDP arguments", async () => {
  const calls = [];
  const result = await launchMacCodexWithCdp({
    app,
    port: 9341,
    listProcesses: async () => [],
    run: async (...args) => { calls.push(args); },
  });

  assert.deepEqual(result, { queued: true });
  assert.deepEqual(calls, [[
    "/usr/bin/open",
    [
      "-a",
      appPath,
      "--args",
      "--remote-debugging-address=127.0.0.1",
      "--remote-debugging-port=9341",
    ],
  ]]);
});

test("macOS login prelaunch does not create a second instance when Codex wins the startup race", async () => {
  let execCalls = 0;
  const result = await launchMacCodexWithCdp({
    app,
    port: 9341,
    listProcesses: async () => [{
      pid: 888,
      executablePath: app.executablePath,
      startedAt: "Sat Aug 1 11:00:00 2026",
      cdpPort: null,
    }],
    run: async () => { execCalls += 1; },
  });

  assert.deepEqual(result, { queued: false, reason: "already-running" });
  assert.equal(execCalls, 0);
});
