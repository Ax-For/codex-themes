import { randomUUID } from "node:crypto";
import { constants as fsConstants } from "node:fs";
import { link, lstat, mkdir, open, realpath, rename, unlink } from "node:fs/promises";
import { dirname, isAbsolute, join, normalize } from "node:path";

import { validateInstallTreeParticipant } from "./install-transaction.mjs";
import { validateMacosLauncherParticipant } from "./macos-launcher.mjs";
import {
  assertOperationLeaseCapability,
  commitWithOperationLease,
  guardOperationLease,
} from "./operation-lock.mjs";
import { validateKnownOuterTransactionDocument } from "./outer-transaction-validator.mjs";
import { validateInstallStateParticipant } from "./state-store.mjs";

const FILE_NAME = "macos-install.json";
const PRODUCT = "heige-codex-skin-studio";
const MAX_BYTES = 256 * 1024;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const LABEL = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
const PHASES = [
  "skeleton",
  "tree-prepared",
  "launcher-prepared",
  "state-prepared",
  "freeze-intent",
  "services-frozen",
  "tree-published",
  "launcher-published",
  "state-published",
  "activation-planned",
  "activation-skipped",
  "service-prepared",
  "ready-acked",
  "commit-decided",
  "rollback-decided",
  "freeze-rollback-restored",
];
const PHASE_SET = new Set(PHASES);
const FORWARD = new Map(PHASES.map((phase, index) => [phase, PHASES[index + 1] ?? null]));
FORWARD.set("state-published", new Set(["activation-planned", "activation-skipped"]));
FORWARD.set("activation-planned", "service-prepared");
FORWARD.set("activation-skipped", "commit-decided");
FORWARD.set("ready-acked", "commit-decided");
const ACTIVATIONS = new Set([
  "pending",
  "none",
  "controller",
]);
const KEYS = [
  "ack",
  "activation",
  "createdAt",
  "decision",
  "freezeParticipant",
  "home",
  "launcherParticipant",
  "nonce",
  "operation",
  "phase",
  "previousNonce",
  "product",
  "revision",
  "schemaVersion",
  "sourceRoot",
  "stateParticipant",
  "stateRoot",
  "targetRoot",
  "transactionId",
  "treeParticipant",
];

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function exactKeys(value, keys) {
  return isRecord(value) &&
    Object.keys(value).sort().join("\0") === [...keys].sort().join("\0");
}

function canonicalAbsolute(value, label) {
  if (
    typeof value !== "string" ||
    !isAbsolute(value) ||
    normalize(value) !== value ||
    value.includes("\0")
  ) throw new Error(`${label} must be a canonical absolute path`);
  return value;
}

function validateFreezeParticipant(value, document, expectedPath) {
  if (value === null) return null;
  const keys = [
    "controllerLabel",
    "controllerPlistPath",
    "coordinatorJournalPath",
    "operation",
    "participantJournalPath",
    "schemaVersion",
    "transactionId",
    "watchdogLabel",
    "watchdogPlistPath",
  ];
  if (
    !exactKeys(value, keys) ||
    value.schemaVersion !== 1 ||
    value.operation !== "freeze-stable-services" ||
    value.transactionId !== document.transactionId ||
    value.coordinatorJournalPath !== expectedPath ||
    !LABEL.test(value.controllerLabel) ||
    !LABEL.test(value.watchdogLabel)
  ) throw new Error("macOS install freeze participant schema is invalid");
  for (const key of [
    "controllerPlistPath",
    "coordinatorJournalPath",
    "participantJournalPath",
    "watchdogPlistPath",
  ]) canonicalAbsolute(value[key], `freeze participant ${key}`);
  if (
    value.participantJournalPath !== join(document.stateRoot, "stable-service-freeze.json") ||
    value.controllerPlistPath !== join(
      document.home,
      "Library",
      "LaunchAgents",
      `${value.controllerLabel}.plist`,
    ) ||
    value.watchdogPlistPath !== join(
      document.home,
      "Library",
      "LaunchAgents",
      `${value.watchdogLabel}.plist`,
    )
  ) throw new Error("macOS install freeze participant paths are invalid");
  return value;
}

function validateAck(value) {
  if (value === null) return null;
  if (
    !exactKeys(value, ["persistenceEnabled", "processIdentity", "revision"]) ||
    value.persistenceEnabled !== true ||
    !Number.isSafeInteger(value.revision) ||
    value.revision < 0 ||
    !exactKeys(value.processIdentity, ["pid", "startedAt"]) ||
    !Number.isSafeInteger(value.processIdentity.pid) ||
    value.processIdentity.pid <= 0 ||
    typeof value.processIdentity.startedAt !== "string" ||
    value.processIdentity.startedAt.length === 0
  ) throw new Error("macOS install exact ACK schema is invalid");
  return { ...value, processIdentity: { ...value.processIdentity } };
}

function phaseAtLeast(phase, expected) {
  if (["rollback-decided", "freeze-rollback-restored"].includes(phase)) return false;
  return PHASES.indexOf(phase) >= PHASES.indexOf(expected);
}

export function validateMacosInstallJournal(value, expectedPath = null) {
  if (
    !exactKeys(value, KEYS) ||
    value.schemaVersion !== 1 ||
    value.product !== PRODUCT ||
    value.operation !== "macos-install" ||
    !UUID.test(value.transactionId) ||
    !["undecided", "rollback", "commit"].includes(value.decision) ||
    !PHASE_SET.has(value.phase) ||
    !ACTIVATIONS.has(value.activation) ||
    !Number.isSafeInteger(value.revision) ||
    value.revision < 0 ||
    !UUID.test(value.nonce) ||
    !(value.previousNonce === null || UUID.test(value.previousNonce)) ||
    typeof value.createdAt !== "string" ||
    !Number.isFinite(Date.parse(value.createdAt)) ||
    (value.decision === "commit") !== (value.phase === "commit-decided") ||
    (value.decision === "rollback") !== [
      "rollback-decided",
      "freeze-rollback-restored",
    ].includes(value.phase)
  ) throw new Error("macOS install journal identity is invalid");
  const sourceRoot = canonicalAbsolute(value.sourceRoot, "sourceRoot");
  const targetRoot = canonicalAbsolute(value.targetRoot, "targetRoot");
  const home = canonicalAbsolute(value.home, "home");
  const stateRoot = canonicalAbsolute(value.stateRoot, "stateRoot");
  if (
    targetRoot !== join(home, ".codex", PRODUCT) ||
    stateRoot !== join(home, "Library", "Application Support", "HeiGeCodexSkinStudio")
  ) throw new Error("macOS install journal production roots are invalid");
  const path = expectedPath ?? macosInstallJournalPath(stateRoot);
  if (path !== macosInstallJournalPath(stateRoot)) {
    throw new Error("macOS install journal path does not match stateRoot");
  }

  const document = { ...value, sourceRoot, targetRoot, home, stateRoot };
  const treeParticipant = value.treeParticipant === null
    ? null
    : validateInstallTreeParticipant(value.treeParticipant);
  const launcherParticipant = value.launcherParticipant === null
    ? null
    : validateMacosLauncherParticipant(value.launcherParticipant);
  const stateParticipant = value.stateParticipant === null
    ? null
    : validateInstallStateParticipant(value.stateParticipant);
  const freezeParticipant = validateFreezeParticipant(value.freezeParticipant, document, path);
  const ack = validateAck(value.ack);
  if (
    (treeParticipant !== null && (
      treeParticipant.transactionId !== value.transactionId ||
      treeParticipant.targetRoot !== targetRoot
    )) ||
    (launcherParticipant !== null && (
      launcherParticipant.transactionId !== value.transactionId ||
      launcherParticipant.home !== home ||
      launcherParticipant.installRoot !== targetRoot
    )) ||
    (stateParticipant !== null && (
      stateParticipant.transactionId !== value.transactionId ||
      stateParticipant.statePath !== join(stateRoot, "state.json")
    ))
  ) throw new Error("macOS install participant binding is invalid");
  validateKnownOuterTransactionDocument(document, {
    transactionId: value.transactionId,
  });
  if (
    (phaseAtLeast(value.phase, "tree-prepared") && treeParticipant === null) ||
    (phaseAtLeast(value.phase, "launcher-prepared") && launcherParticipant === null) ||
    (phaseAtLeast(value.phase, "state-prepared") && stateParticipant === null) ||
    (phaseAtLeast(value.phase, "freeze-intent") && freezeParticipant === null)
  ) throw new Error("macOS install phase is missing a required participant");
  if (value.phase === "activation-skipped" && value.activation !== "none") {
    throw new Error("macOS install skipped activation is invalid");
  }
  if (
    ["activation-planned", "service-prepared", "ready-acked"].includes(value.phase) &&
    value.activation !== "controller"
  ) throw new Error("macOS install activation phase is invalid");
  if ((value.phase === "ready-acked" || value.phase === "commit-decided") && stateParticipant !== null) {
    if (stateParticipant.afterState.persistenceEnabled && (
      ack === null || ack.revision !== stateParticipant.afterState.revision
    )) throw new Error("macOS install persistent commit is missing its exact ACK");
    if (!stateParticipant.afterState.persistenceEnabled && ack !== null) {
      throw new Error("macOS install non-persistent commit must not contain an ACK");
    }
    if (
      value.phase === "commit-decided" &&
      (
        (stateParticipant.afterState.persistenceEnabled && value.activation !== "controller") ||
        (!stateParticipant.afterState.persistenceEnabled && value.activation !== "none")
      )
    ) throw new Error("macOS install commit activation does not match state");
  }
  return {
    ...document,
    treeParticipant,
    launcherParticipant,
    stateParticipant,
    freezeParticipant,
    ack,
  };
}

async function syncDirectory(path) {
  if (process.platform === "win32") return;
  const handle = await open(path, fsConstants.O_RDONLY);
  try { await handle.sync(); } finally { await handle.close(); }
}

async function ensurePrivateParent(path) {
  const parent = dirname(path);
  await mkdir(parent, { recursive: true, mode: 0o700 });
  if (await realpath(parent) !== parent) {
    throw new Error("macOS install journal parent must be canonical and symlink-free");
  }
  const info = await lstat(parent);
  if (
    info.isSymbolicLink() ||
    !info.isDirectory() ||
    (process.platform !== "win32" && (info.mode & 0o777) !== 0o700) ||
    (typeof process.getuid === "function" && info.uid !== process.getuid())
  ) throw new Error("macOS install journal parent must be a private real directory");
  return parent;
}

async function readPrivate(path) {
  let before;
  try { before = await lstat(path); } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
  if (
    before.isSymbolicLink() ||
    !before.isFile() ||
    before.size <= 0 ||
    before.size > MAX_BYTES ||
    (process.platform !== "win32" && (before.mode & 0o777) !== 0o600) ||
    (typeof process.getuid === "function" && before.uid !== process.getuid())
  ) throw new Error("macOS install journal must be a private bounded regular file");
  const handle = await open(path, fsConstants.O_RDONLY | (fsConstants.O_NOFOLLOW ?? 0));
  let bytes;
  try {
    const opened = await handle.stat();
    if (opened.dev !== before.dev || opened.ino !== before.ino || !opened.isFile()) {
      throw new Error("macOS install journal changed while opening");
    }
    bytes = await handle.readFile();
    const after = await handle.stat();
    if (after.size !== opened.size || after.mtimeMs !== opened.mtimeMs) {
      throw new Error("macOS install journal changed while reading");
    }
  } finally { await handle.close(); }
  let parsed;
  const decoded = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  try { parsed = JSON.parse(decoded); } catch (cause) {
    throw new Error("macOS install journal is not valid JSON", { cause });
  }
  if (decoded !== `${JSON.stringify(parsed)}\n`) {
    throw new Error("macOS install journal JSON must be canonical");
  }
  return validateMacosInstallJournal(parsed, path);
}

async function durableWrite(path, value, { exclusive = false } = {}) {
  const parent = await ensurePrivateParent(path);
  const temporary = `${path}.next.${process.pid}.${randomUUID()}`;
  let handle;
  try {
    handle = await open(temporary, "wx", 0o600);
    await handle.writeFile(`${JSON.stringify(value)}\n`, "utf8");
    if (process.platform !== "win32") await handle.chmod(0o600);
    await handle.sync();
    await handle.close();
    handle = undefined;
    if (exclusive) {
      await link(temporary, path);
      await syncDirectory(parent);
      await unlink(temporary);
    } else {
      await rename(temporary, path);
    }
    await syncDirectory(parent);
  } catch (error) {
    await handle?.close().catch(() => {});
    await unlink(temporary).catch(() => {});
    throw error;
  }
}

export function macosInstallJournalPath(stateRoot) {
  return join(canonicalAbsolute(stateRoot, "stateRoot"), FILE_NAME);
}

async function assertBoundLease(lease, journalPath) {
  const capability = assertOperationLeaseCapability(lease);
  if (
    journalPath !== macosInstallJournalPath(capability.stateRoot) ||
    await realpath(capability.stateRoot) !== capability.stateRoot
  ) throw new Error("macOS install journal is not bound to the leased stateRoot");
  await guardOperationLease(lease);
  return capability;
}

export async function readMacosInstallJournal(path, { lease } = {}) {
  path = canonicalAbsolute(path, "journal path");
  await assertBoundLease(lease, path);
  return readPrivate(path);
}

export async function createMacosInstallJournal({
  journalPath,
  transactionId = randomUUID(),
  sourceRoot,
  targetRoot,
  home,
  stateRoot,
  lease,
}) {
  journalPath = canonicalAbsolute(journalPath, "journal path");
  await assertBoundLease(lease, journalPath);
  const document = validateMacosInstallJournal({
    schemaVersion: 1,
    product: PRODUCT,
    operation: "macos-install",
    transactionId,
    revision: 0,
    nonce: randomUUID(),
    previousNonce: null,
    decision: "undecided",
    phase: "skeleton",
    createdAt: new Date().toISOString(),
    sourceRoot,
    targetRoot,
    home,
    stateRoot,
    activation: "pending",
    treeParticipant: null,
    launcherParticipant: null,
    stateParticipant: null,
    freezeParticipant: null,
    ack: null,
  }, journalPath);
  await commitWithOperationLease(
    lease,
    () => durableWrite(journalPath, document, { exclusive: true }),
  );
  return document;
}

export async function updateMacosInstallJournal(
  journalPath,
  current,
  changes,
  { lease } = {},
) {
  journalPath = canonicalAbsolute(journalPath, "journal path");
  await assertBoundLease(lease, journalPath);
  current = validateMacosInstallJournal(current, journalPath);
  if (!isRecord(changes)) throw new Error("macOS install changes must be an object");
  const mutable = new Set([
    "ack",
    "activation",
    "decision",
    "freezeParticipant",
    "launcherParticipant",
    "phase",
    "stateParticipant",
    "treeParticipant",
  ]);
  if (Object.keys(changes).some((key) => !mutable.has(key))) {
    throw new Error("macOS install changes contain immutable fields");
  }
  const nextDecision = Object.hasOwn(changes, "decision")
    ? changes.decision
    : current.decision;
  if (current.decision !== "undecided" && nextDecision !== current.decision) {
    throw new Error("macOS install decision is already durable");
  }
  const nextPhase = changes.phase ?? current.phase;
  if (nextPhase !== current.phase && nextPhase !== "rollback-decided") {
    const allowed = FORWARD.get(current.phase);
    if (!(allowed instanceof Set ? allowed.has(nextPhase) : allowed === nextPhase)) {
      throw new Error("macOS install phase transition is invalid");
    }
  }
  const next = validateMacosInstallJournal({
    ...current,
    ...changes,
    previousNonce: current.nonce,
    nonce: randomUUID(),
    revision: current.revision + 1,
  }, journalPath);
  await commitWithOperationLease(lease, async () => {
    const observed = await readPrivate(journalPath);
    if (
      observed === null ||
      observed.transactionId !== current.transactionId ||
      observed.revision !== current.revision ||
      observed.nonce !== current.nonce
    ) throw new Error("macOS install journal CAS conflict");
    await durableWrite(journalPath, next);
  });
  return next;
}

export async function clearMacosInstallJournal(journalPath, expected, { lease } = {}) {
  journalPath = canonicalAbsolute(journalPath, "journal path");
  await assertBoundLease(lease, journalPath);
  expected = validateMacosInstallJournal(expected, journalPath);
  await commitWithOperationLease(lease, async () => {
    const observed = await readPrivate(journalPath);
    if (
      observed === null ||
      observed.transactionId !== expected.transactionId ||
      observed.revision !== expected.revision ||
      observed.nonce !== expected.nonce
    ) throw new Error("macOS install journal clear conflict");
    await unlink(journalPath);
    await syncDirectory(dirname(journalPath));
  });
}
