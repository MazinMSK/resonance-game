import { useEffect, useRef, useCallback } from "react";

// ─── REACTIVE AMBIENT AUDIO (Web Audio API, zero asset files) ────────────────
// A single shared AudioContext is created lazily on the first user gesture
// (browsers block autoplay). Each scene's `art` type maps to a mood bed of a
// low drone + filtered noise. Soft SFX fire on choices / memory collection.
// Everything degrades to silence if Web Audio is unavailable or sound is off.

let ctx = null;
let master = null;
let ambient = null;        // { nodes:[], mood, gain }
let soundOn = true;

function ensureCtx() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  try {
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = soundOn ? 0.55 : 0;
    master.connect(ctx.destination);
  } catch {
    ctx = null;
  }
  return ctx;
}

function unlock() {
  const c = ensureCtx();
  if (c && c.state === "suspended") c.resume().catch(() => {});
}

function setEnabled(on) {
  soundOn = on;
  if (master && ctx) {
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.linearRampToValueAtTime(on ? 0.55 : 0, ctx.currentTime + 0.25);
  }
}

// One-shot blip used to build the small SFX set.
function blip(freq, dur = 0.08, type = "sine", vol = 0.2) {
  const c = ensureCtx();
  if (!c || !soundOn) return;
  try {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0, c.currentTime);
    g.gain.linearRampToValueAtTime(vol, c.currentTime + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
    osc.connect(g).connect(master);
    osc.start();
    osc.stop(c.currentTime + dur + 0.02);
  } catch { /* ignore */ }
}

const SFX = {
  choice: () => { blip(392, 0.1, "triangle", 0.16); setTimeout(() => blip(587, 0.14, "triangle", 0.13), 55); },
  memory: () => { blip(659, 0.09, "sine", 0.16); setTimeout(() => blip(988, 0.16, "sine", 0.12), 60); },
  type: () => blip(1500 + Math.random() * 250, 0.01, "square", 0.01),
  reveal: () => { blip(523, 0.08, "sine", 0.12); setTimeout(() => blip(784, 0.12, "sine", 0.1), 45); },
  achieve: () => [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => blip(f, 0.16, "triangle", 0.14), i * 85)),
  open: () => blip(440, 0.07, "sine", 0.1),
};

function makeNoise(c) {
  const size = 2 * c.sampleRate;
  const buf = c.createBuffer(1, size, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  return src;
}

// art type -> mood bed. drone in Hz, filter cutoff, texture gain.
const BEDS = {
  hospital: { drone: 98.0, filter: 600, q: 0.7, noise: 0.08, droneGain: 0.05 },
  desert:   { drone: 73.42, filter: 900, q: 0.5, noise: 0.06, droneGain: 0.045 },
  pyramid:  { drone: 65.41, filter: 420, q: 1.6, noise: 0.05, droneGain: 0.06 },
  neural:   { drone: 110.0, filter: 1200, q: 1.0, noise: 0.07, droneGain: 0.05 },
  archive:  { drone: 87.31, filter: 700, q: 0.9, noise: 0.06, droneGain: 0.05 },
  tender:   { drone: 130.81, filter: 520, q: 0.5, noise: 0.05, droneGain: 0.05 },
};

function stopAmbient() {
  if (!ambient) return;
  const { nodes } = ambient;
  nodes.forEach((n) => { try { n.stop && n.stop(); } catch { /* */ } try { n.disconnect && n.disconnect(); } catch { /* */ } });
  ambient = null;
}

function playAmbient(mood) {
  const c = ensureCtx();
  if (!c) return;
  if (ambient && ambient.mood === mood) return;
  const next = BEDS[mood] || BEDS.archive;
  stopAmbient();

  const noise = makeNoise(c);
  const nf = c.createBiquadFilter();
  nf.type = "lowpass";
  nf.frequency.value = next.filter;
  nf.Q.value = next.q;
  const ng = c.createGain();
  ng.gain.value = 0;
  ng.gain.linearRampToValueAtTime(next.noise, c.currentTime + 1.4);
  noise.connect(nf).connect(ng).connect(master);
  noise.start();

  const drone = c.createOscillator();
  drone.type = "sine";
  drone.frequency.value = next.drone;
  const dg = c.createGain();
  dg.gain.value = 0;
  dg.gain.linearRampToValueAtTime(next.droneGain, c.currentTime + 1.6);
  drone.connect(dg).connect(master);
  drone.start();

  // Slow LFO -> a faint "breathing" of the drone.
  const lfo = c.createOscillator();
  lfo.frequency.value = 0.07;
  const lfoG = c.createGain();
  lfoG.gain.value = 0.02;
  lfo.connect(lfoG).connect(dg.gain);
  lfo.start();

  ambient = { nodes: [noise, drone, lfo, ng, dg, nf, lfoG], mood };
}

// React hook surface. `mood` follows the current scene; `enabled` follows the
// sound setting; `active` is false on the title screen (no ambient there).
export function useAudio({ mood, enabled, active }) {
  const lastMood = useRef(null);

  useEffect(() => { setEnabled(enabled); }, [enabled]);

  useEffect(() => {
    if (!enabled || !active) { stopAmbient(); lastMood.current = null; return; }
    if (mood && mood !== lastMood.current) {
      playAmbient(mood);
      lastMood.current = mood;
    }
  }, [mood, enabled, active]);

  // Stop everything on unmount.
  useEffect(() => () => stopAmbient(), []);

  const sfx = useCallback((name) => { if (enabled && SFX[name]) SFX[name](); }, [enabled]);

  return { sfx, unlock };
}

export { unlock as unlockAudio, SFX };
