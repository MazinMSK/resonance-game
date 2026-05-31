import { useState, useEffect, useCallback, useRef } from "react";
import { START_SCENE, SAVE_KEY } from "./constants";

// ─── PERSISTENT GAME STATE ───────────────────────────────────────────────────
// Single source of truth for player progress. Auto-saves to localStorage so a
// refresh resumes where the player left off. This is the foundation that makes
// personalization and "continue" possible in v2.0.

const EMPTY = {
  sceneId: START_SCENE,
  memories: [],     // array of memory ids collected
  resonance: 0,     // 0–100 meter
  history: [],       // ordered list of visited scene ids (for analytics / "paths")
  startedAt: null,   // ISO timestamp of first play
  updatedAt: null,
};

function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.sceneId !== "string") return null;
    return { ...EMPTY, ...parsed };
  } catch {
    return null;
  }
}

export function hasSave() {
  const s = load();
  return !!(s && s.sceneId && s.sceneId !== START_SCENE);
}

function isPristine(s) {
  return s.sceneId === START_SCENE && s.memories.length === 0 && s.resonance === 0 && s.history.length === 0;
}

export function useGameState() {
  // Always begin at the title; the saved game stays in localStorage for an
  // explicit "Continue" rather than auto-resuming over the title screen.
  const [state, setState] = useState(() => ({ ...EMPTY }));
  const persistTimer = useRef(null);

  // Debounced save on any meaningful change. Skip while pristine so we don't
  // clobber an existing save before the player chooses to continue or restart.
  useEffect(() => {
    if (isPristine(state)) return;
    clearTimeout(persistTimer.current);
    persistTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(
          SAVE_KEY,
          JSON.stringify({ ...state, updatedAt: new Date().toISOString() })
        );
      } catch {
        /* storage unavailable — game still works in-memory */
      }
    }, 250);
    return () => clearTimeout(persistTimer.current);
  }, [state]);

  // Restore a previously saved game (scene, memories, resonance, history).
  const resume = useCallback(() => {
    const saved = load();
    if (saved) setState(saved);
  }, []);

  const goToScene = useCallback((id) => {
    setState((s) => ({
      ...s,
      sceneId: id,
      history: [...s.history, id],
      startedAt: s.startedAt || new Date().toISOString(),
    }));
  }, []);

  const addMemory = useCallback((memId) => {
    setState((s) =>
      s.memories.includes(memId) ? s : { ...s, memories: [...s.memories, memId] }
    );
  }, []);

  const addResonance = useCallback((amount) => {
    setState((s) => ({ ...s, resonance: Math.min(100, s.resonance + amount) }));
  }, []);

  const reset = useCallback(() => {
    const fresh = { ...EMPTY, sceneId: START_SCENE };
    setState(fresh);
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  return {
    ...state,
    goToScene,
    addMemory,
    addResonance,
    reset,
    resume,
    setSceneId: goToScene,
  };
}
