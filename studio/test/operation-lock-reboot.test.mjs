import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdtemp,
  readFile,
  readdir,
  realpath,
  rm,
  writeFile,
} from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { acquireOperationLock } from "../src/operation-lock.mjs";

async function rewriteJson(path, mutate) {
  const value = JSON.parse(await readFile(path, "utf8"));
  mutate(value);
  await writeFile(path, `${JSON.stringify(value)}\n`, { mode: 0o600 });
}

function lockOptions(stateRoot, identity, operation) {
  return {
    identity,
    lockPath: join(stateRoot, "operation.lock"),
    operation,
    platform: "darwin",
    readProcessIdentity: async () => null,
    stateRoot,
  };
}

test("macOS operation lock survives device-number changes across reboot", async (t) => {
  const temporaryRoot = await realpath(tmpdir());
  const stateRoot = await mkdtemp(join(temporaryRoot, "codex-themes-lock-reboot-"));
  t.after(() => rm(stateRoot, { force: true, recursive: true }));

  const first = await acquireOperationLock(
    lockOptions(stateRoot, { pid: 101, startedAt: "first boot" }, "first"),
  );
  assert.equal(await first.release(), true);

  const second = await acquireOperationLock(
    lockOptions(stateRoot, { pid: 102, startedAt: "first boot" }, "second"),
  );
  assert.equal(await second.release(), true);

  const entries = await readdir(stateRoot);
  const persistedArtifacts = entries.filter((name) =>
    name.startsWith("operation.lock.successor.") ||
    name.startsWith("operation.lock.heartbeat.") ||
    name.startsWith("operation.lock.released."));
  assert.ok(persistedArtifacts.length >= 5);

  for (const name of persistedArtifacts) {
    await rewriteJson(join(stateRoot, name), (value) => {
      if (value.predecessor !== undefined && value.predecessor !== null) {
        value.predecessor.dev = "previous-boot-device";
      }
      if (value.claim !== undefined) {
        value.claim.dev = "previous-boot-device";
      }
    });
  }

  const recovered = await acquireOperationLock(
    lockOptions(stateRoot, { pid: 103, startedAt: "second boot" }, "recovered"),
  );
  assert.equal(recovered.owner.operation, "recovered");
  assert.equal(await recovered.release(), true);
});

test("macOS operation lock still rejects a successor with the wrong nonce", async (t) => {
  const temporaryRoot = await realpath(tmpdir());
  const stateRoot = await mkdtemp(join(temporaryRoot, "codex-themes-lock-tamper-"));
  t.after(() => rm(stateRoot, { force: true, recursive: true }));

  const first = await acquireOperationLock(
    lockOptions(stateRoot, { pid: 201, startedAt: "first boot" }, "first"),
  );
  assert.equal(await first.release(), true);

  const second = await acquireOperationLock(
    lockOptions(stateRoot, { pid: 202, startedAt: "first boot" }, "second"),
  );
  assert.equal(await second.release(), true);

  const successor = (await readdir(stateRoot)).find((name) =>
    name.startsWith("operation.lock.successor."));
  assert.notEqual(successor, undefined);
  await rewriteJson(join(stateRoot, successor), (value) => {
    value.predecessor.nonce = "different-valid-nonce";
  });

  await assert.rejects(
    acquireOperationLock(
      lockOptions(stateRoot, { pid: 203, startedAt: "second boot" }, "tampered"),
    ),
    { code: "LOCK_CHAIN_CORRUPT" },
  );
});
