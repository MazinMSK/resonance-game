// ─── DERIVED ENDINGS ─────────────────────────────────────────────────────────
// An "ending" is a terminal scene: one with no choices that advance to another
// scene (only a restart, or none at all). Derived from the graph so we never
// hand-maintain a list. Title scene is excluded.

import { SCENES } from "../content/scenes";

function isEnding(scene) {
  if (!scene || scene.isTitle) return false;
  const real = (scene.choices || []).filter((c) => !c.isRestart && c.next);
  return real.length === 0;
}

export const ENDING_IDS = Object.values(SCENES)
  .filter(isEnding)
  .map((s) => s.id);

export const ENDING_COUNT = ENDING_IDS.length;

export function endingMeta(id) {
  const s = SCENES[id];
  return s ? { id, title: s.title, year: s.year } : null;
}
