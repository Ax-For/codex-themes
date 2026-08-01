import test from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";

import {
  readLifecycleProcessIdentity,
  requestNormalQuit,
  spawnDetachedLifecycle,
} from "../src/lifecycle-helper.mjs";

test("lifecycle process identity normalizes single-digit macOS dates", async () => {
  const executablePath = "/Applications/ChatGPT.app/Contents/MacOS/ChatGPT";
  const identity = await readLifecycleProcessIdentity(10182, { executablePath }, {
    run: async () => ({
      stdout: `10182 Sat Aug  1 10:21:57 2026     ${executablePath}\n`,
    }),
  });

  assert.deepEqual(identity, {
    pid: 10182,
    executablePath,
    startedAt: "Sat Aug 1 10:21:57 2026",
  });
});

test("background lifecycle recovery suppresses its failure dialog", async () => {
  let invocation;
  const child = new EventEmitter();
  child.pid = 4321;
  child.unref = () => {};

  const queued = spawnDetachedLifecycle({
    actionPath: "/tmp/codex-themes-action.json",
    helperPath: "/tmp/lifecycle-helper.mjs",
    nodePath: "/tmp/node",
    showFailureDialog: false,
    spawnImpl: (command, args, options) => {
      invocation = { command, args, options };
      queueMicrotask(() => child.emit("spawn"));
      return child;
    },
  });

  assert.deepEqual(await queued, { queued: true });
  assert.deepEqual(invocation.args, [
    "/tmp/lifecycle-helper.mjs",
    "/tmp/codex-themes-action.json",
    "--no-dialog",
  ]);
});

test("normal quit targets the exact Codex app through a quit Apple event", async () => {
  let invocation;
  const appPath = "/Applications/ChatGPT.app";
  await requestNormalQuit({
    appPath,
    process: {
      executablePath: `${appPath}/Contents/MacOS/ChatGPT`,
      pid: 10182,
      startedAt: "Sat Aug 1 10:21:57 2026",
    },
  }, {
    execFile: async (command, args) => {
      invocation = { command, args };
      return { stdout: "" };
    },
  });

  assert.equal(invocation.command, "/usr/bin/osascript");
  assert.deepEqual(invocation.args.slice(-2), ["10182", appPath]);
  assert.match(invocation.args[3], /Application\(argv\[1\]\)\.quit\(\)/);
});
