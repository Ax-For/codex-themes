import test from "node:test";
import assert from "node:assert/strict";

import {
  INSTALL_MARKER_NAME,
  isAcceptedOwnedTopLevel,
} from "../src/install-transaction.mjs";

const current = [INSTALL_MARKER_NAME, "package.json", "scripts", "src", "themes"];

test("installer accepts only the public tree for newly validated installs", () => {
  assert.equal(isAcceptedOwnedTopLevel(current), true);
  assert.equal(isAcceptedOwnedTopLevel([...current, "custom-pet"]), false);
});

test("installer can upgrade verified older owned layouts without preserving extras", () => {
  assert.equal(isAcceptedOwnedTopLevel([...current, "custom-pet"], { allowLegacyLayout: true }), true);
  assert.equal(isAcceptedOwnedTopLevel([...current, "custom-pet", "test"], { allowLegacyLayout: true }), true);
  assert.equal(isAcceptedOwnedTopLevel([...current, "unowned-file"], { allowLegacyLayout: true }), false);
});
