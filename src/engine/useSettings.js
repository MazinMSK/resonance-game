import { useState, useEffect } from "react";
import { TYPING_SPEED } from "./constants";

// ─── PLAYER SETTINGS (persisted) ─────────────────────────────────────────────
// text speed (ms/char; 0 = instant), sound on/off, reduced motion. The OS
// prefers-reduced-motion preference seeds the default but the user can override.

const SETTINGS_KEY = "resonance:settings:v1";

function osReducedMotion() {
  try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; }
  catch { return false; }
}

function loadSettings() {
  const defaults = { textSpeed: TYPING_SPEED, sound: true, reducedMotion: osReducedMotion() };
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaults;
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

export function useSettings() {
  const [settings, setSettings] = useState(loadSettings);

  useEffect(() => {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch { /* ignore */ }
  }, [settings]);

  return [settings, setSettings];
}
