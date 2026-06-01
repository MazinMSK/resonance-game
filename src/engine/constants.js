// ─── ENGINE CONSTANTS ────────────────────────────────────────────────────────

export const TYPING_SPEED = 16;        // ms per character in the typewriter
export const START_SCENE = "TITLE";    // entry scene id
export const SAVE_KEY = "resonance:save:v2";       // localStorage key for progress
export const SAVE_KEY_V1 = "resonance:save:v1";    // legacy key, migrated on load

// Resonance meter color ramp by value (0–100).
export function resonanceColorFor(resonance) {
  if (resonance < 30) return "#7ec8c8";
  if (resonance < 60) return "#c9a96e";
  if (resonance < 85) return "#d4b896";
  return "#e8d5a0";
}
