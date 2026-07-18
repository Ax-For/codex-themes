import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const studioRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

test("operation-lock artifact cleanup snapshots the ownership chain before scanning files", async () => {
  const source = await readFile(join(studioRoot, "src", "operation-lock.mjs"), "utf8");
  const start = source.indexOf("async function cleanupUnreachableFinalArtifacts");
  const end = source.indexOf("async function readPrivateArtifactSnapshot", start);
  assert.notEqual(start, -1);
  assert.notEqual(end, -1);

  const cleanup = source.slice(start, end);
  const snapshot = cleanup.indexOf("let knownChain = await findTail(lockPath);");
  const scan = cleanup.indexOf("for (const entry of entries)");
  assert.ok(snapshot !== -1 && snapshot < scan,
    "the ownership chain must be read once before the artifact loop to avoid quadratic scans");
  assert.match(cleanup, /knownChain = latestChain/);
});
