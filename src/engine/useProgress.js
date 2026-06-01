import { useState, useEffect, useCallback, useRef } from "react";
import { ENDING_COUNT } from "./endings";
import { MEMORIES } from "../content/memories";

// ─── CROSS-RUN PROGRESS: achievements + endings discovered ───────────────────
// Persisted separately from the game save so it survives restarts. Achievements
// are evaluated from a snapshot of the current run plus accumulated progress.

const PROGRESS_KEY = "resonance:progress:v1";
const MEMORY_TOTAL = Object.keys(MEMORIES).length;

export const ACHIEVEMENTS = {
  firstMemory:  { id: "firstMemory", icon: "◈", name: "First Fragment", desc: "Collect your first memory." },
  allMemories:  { id: "allMemories", icon: "❖", name: "The Whole Archive", desc: `Collect all ${MEMORY_TOTAL} memories.` },
  deepResonance:{ id: "deepResonance", icon: "✦", name: "Deep Resonance", desc: "Reach a resonance of 85 or more." },
  wanderer:     { id: "wanderer", icon: "❉", name: "Wanderer", desc: "Explore 20 different scenes." },
  firstEnding:  { id: "firstEnding", icon: "☉", name: "An Ending", desc: "Reach one of the story's endings." },
  allEndings:   { id: "allEndings", icon: "✺", name: "Every Thread", desc: "Discover every ending." },
};

function load() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    const p = raw ? JSON.parse(raw) : {};
    return { achievements: p.achievements || [], endings: p.endings || [] };
  } catch {
    return { achievements: [], endings: [] };
  }
}

function save(p) {
  try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(p)); } catch { /* ignore */ }
}

export function useProgress() {
  const [progress, setProgress] = useState(() => load());
  const [toast, setToast] = useState(null); // achievement id to surface
  const queue = useRef([]);

  useEffect(() => { save(progress); }, [progress]);

  const grant = useCallback((id) => {
    if (!ACHIEVEMENTS[id]) return;
    setProgress((p) => {
      if (p.achievements.includes(id)) return p;
      queue.current.push(id);
      if (!toast) setToast(queue.current.shift());
      return { ...p, achievements: [...p.achievements, id] };
    });
  }, [toast]);

  const dismissToast = useCallback(() => {
    setToast(queue.current.length ? queue.current.shift() : null);
  }, []);

  const recordEnding = useCallback((sceneId) => {
    setProgress((p) => {
      const endings = p.endings.includes(sceneId) ? p.endings : [...p.endings, sceneId];
      return { ...p, endings };
    });
  }, []);

  // Evaluate snapshot-derived achievements whenever the run changes.
  const evaluate = useCallback((snap) => {
    // snap: { memories:[], resonance, visitedCount, atEnding:bool, sceneId }
    if (snap.memories.length >= 1) grant("firstMemory");
    if (snap.memories.length >= MEMORY_TOTAL) grant("allMemories");
    if (snap.resonance >= 85) grant("deepResonance");
    if (snap.visitedCount >= 20) grant("wanderer");
    if (snap.atEnding) {
      grant("firstEnding");
      recordEnding(snap.sceneId);
    }
  }, [grant, recordEnding]);

  // allEndings depends on the persisted endings set.
  useEffect(() => {
    if (ENDING_COUNT > 0 && progress.endings.length >= ENDING_COUNT) grant("allEndings");
  }, [progress.endings, grant]);

  return {
    achievements: progress.achievements,
    endings: progress.endings,
    toast,
    dismissToast,
    grant,
    evaluate,
    recordEnding,
  };
}
