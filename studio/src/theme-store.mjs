import { readdir } from "node:fs/promises";
import { join } from "node:path";

import { parseBoundedJson, readBoundedFile, RESOURCE_LIMITS } from "./resource-limits.mjs";

export async function listThemes({ roots }) {
  const themes = [];
  for (const root of roots) {
    let entries;
    try {
      entries = await readdir(root, { withFileTypes: true });
    } catch (error) {
      if (error.code === "ENOENT") continue;
      throw error;
    }
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      try {
        const { bytes } = await readBoundedFile(join(root, entry.name, "theme.json"), {
          maxBytes: RESOURCE_LIMITS.manifestBytes,
          label: "theme.json",
        });
        const manifest = parseBoundedJson(bytes);
        if (typeof manifest?.id !== "string" || typeof manifest?.name !== "string") continue;
        themes.push({ ...manifest, path: join(root, entry.name) });
      } catch {
        // Ignore incomplete directories so one bad copy cannot block startup.
      }
    }
  }
  return themes.sort((left, right) => left.name.localeCompare(right.name));
}
