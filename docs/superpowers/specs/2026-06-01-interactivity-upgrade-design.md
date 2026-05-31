# The Resonance Archive — Interactivity Upgrade

**Date:** 2026-06-01
**Author:** Mazin Mohamedkhair (with Claude)
**Status:** Approved

## Goal

Make the game substantially more engaging and interactive — on both mobile and
desktop — without breaking its slow, literary, meditative tone. Style chosen:
**a blend**, mostly atmospheric with a few light "gamey" beats. No arcade timers,
no required mini-games.

## Principles

- **Additive, not a rewrite.** Layer onto the existing engine (`useGameState`,
  Resonance meter, memory fragments, canvas `SceneArt`). Do not rewrite the
  scene graph in `content/scenes.js`.
- **Match existing structure** (`engine/`, `art/`, `components/`, `content/`).
  Small, self-contained, testable modules the engine composes in.
- **Graceful degradation** everywhere. Missing Web Audio → silent. No device
  tilt → mouse parallax. `prefers-reduced-motion` → static art + instant text.
- **No binary assets.** Audio is synthesized via the Web Audio API.

## Features

### Atmospheric
1. **Reactive ambient audio** (`engine/useAudio.js`). Web Audio only. Each scene's
   `art` type maps to a mood bed (low drone + filtered-noise texture). Soft SFX on
   choice select, memory collection, and (optional) typing. Global mute. Audio
   context unlocks on the first user gesture (title-screen button).
2. **Living scene art** (`engine/useParallax.js` + `art/ParallaxLayer.jsx`).
   Subtle parallax driven by mouse (desktop) or device tilt (mobile), plus a faint
   particle/vignette overlay behind the canvas art. Honors reduced-motion (static).
3. **Resonant words** (`engine/lexicon.js` + `components/ResonantText.jsx`).
   A global lexicon maps certain words → a one-line hidden gloss. In prose, matched
   words become tappable; tapping reveals the gloss inline and grants a small
   one-time resonance bump (tracked per word-id so it can't be farmed). Per-scene
   overrides allowed but not required — global lexicon covers all 52 scenes at once.

### Gamey (light)
4. **Achievements + endings tracker** (`engine/useProgress.js`). Endings are
   auto-derived: terminal scenes (no non-restart choices) are the endings. Achievements
   for: first memory, all 9 memories, resonance ≥ 85, explore ≥ 20 scenes, reach any
   ending, reach all endings. Toast on unlock. Tracker shown on the title screen.
   Persisted across runs in its own localStorage key.
5. **Memory Constellation** (`components/ConstellationMap.jsx`). A pannable star-map
   modal: a star per memory (lit if collected) over a field representing visited
   scenes. Opens from the top bar.

### Cross-cutting
6. **Settings panel** (`components/SettingsPanel.jsx`): text speed (slow/normal/fast/
   instant), sound on/off, reduced motion. Persisted.
7. **Mobile/desktop polish**: larger tap targets; swipe-left to advance, swipe-right
   to go home/back; memories panel becomes a bottom sheet under ~640px; safe-area
   insets; replace default Vite `index.css` boilerplate that fights the dark theme.

## Architecture

```
engine/
  useAudio.js        # Web Audio: ambient beds + sfx + mute toggle
  useParallax.js     # pointer/tilt -> {x,y}; reduced-motion aware
  useProgress.js     # achievements + endings, persisted (separate key)
  lexicon.js         # resonant-word glosses (global + optional per-scene)
  endings.js         # derive terminal scenes from SCENES graph
art/
  ParallaxLayer.jsx  # particle/vignette overlay
components/
  SettingsPanel.jsx
  ConstellationMap.jsx
  AchievementToast.jsx
  ResonantText.jsx   # renders a paragraph with tappable lexicon words
```

`App.jsx` wires the hooks and modal state. `StoryView.jsx` renders prose through
`ResonantText`, adds the parallax layer, swipe handlers, and the new top-bar buttons
(settings, constellation). `useGameState.js` gains `resonantWordsFound` (set) used by
the resonance-bump dedupe; save key bumped to `v2` with a migration that reads `v1`.

## Persistence & migration

- Game save: bump `SAVE_KEY` to `resonance:save:v2`. On load, if no v2 but v1 exists,
  migrate (carry sceneId/memories/resonance/history; add empty `resonantWordsFound`).
- Progress (achievements/endings): new key `resonance:progress:v1`.
- Settings: new key `resonance:settings:v1`.
- All reads/writes wrapped in try/catch (storage may be blocked); game works in-memory.

## Error handling / degradation

- No `AudioContext` → audio module is a no-op; UI unaffected.
- No `DeviceOrientationEvent` / desktop → parallax uses mousemove; if neither, static.
- `prefers-reduced-motion` or the setting → no parallax, no particles, instant text option.
- Malformed localStorage → treated as empty, never throws.

## Testing / verification

- Extend `scripts/check-story.js`: validate every `lexicon` word-id is unique and that
  derived endings are reachable from TITLE (reuses existing reachability pass).
- `npm run build` must pass.
- Manual smoke test: full playthrough (title → an ending) at desktop width and at a
  ~390px mobile viewport; verify audio unlock, mute, settings persistence, a resonant
  word reveal, an achievement toast, the constellation modal, and swipe gestures.

## Out of scope

- Rewriting scene content or the canvas art renderers.
- Real audio files / music.
- Timed or required mini-games, scoring leaderboards, backend/multiplayer.

## Deploy

Commit on a feature branch → merge to `main` → push. Vercel project auto-builds from
`main` (Vite, `dist`). Confirm the production URL after deploy.
