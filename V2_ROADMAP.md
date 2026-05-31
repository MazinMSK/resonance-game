# Resonance Archive — v2.0 Roadmap

Author: Mazin Mohamedkhair
Status: planning → foundation laid

---

## Honest starting point

v1.0 is a genuinely good piece of writing wrapped in a fragile shell. Before
piling on features, name the constraints, because they decide the order of work:

- **It was one 1,777-line file.** Fixed — code is now split into
  `content / engine / art / components`. New work no longer fights the monolith.
- **Nothing persisted.** Fixed — `engine/useGameState.js` saves to localStorage;
  refresh resumes, and the title screen offers **Continue**. This is the hinge
  the whole "personalization" goal hangs on. You cannot personalize a session
  that forgets the player.
- **The four v2.0 goals are not equal.** "More graphics" is cheap and visible.
  "Personalization" and "better gamification" are expensive and depend on data
  you weren't collecting. Doing the visible stuff first feels productive and
  quietly defers the hard part. The phases below resist that.

A blunt caution: this is a for-fun side project. The biggest risk is not bad
architecture — it's scope. Each phase ships something playable on its own. Do
not start Phase 3 before Phase 1 is in players' hands.

---

## Phase 0 — Foundation (DONE)

- Modular structure.
- Persistent save/load/resume/reset.
- Scene-graph integrity check (below).

**Run before every content change:**

```bash
node --input-type=module -e '
import { SCENES } from "./src/content/scenes.js";
import { MEMORIES } from "./src/content/memories.js";
const ids = new Set(Object.keys(SCENES));
let broken=[], badMem=[];
for (const [id,s] of Object.entries(SCENES)) {
  if (s.memoryGain && !MEMORIES[s.memoryGain]) badMem.push(id+"->"+s.memoryGain);
  for (const c of (s.choices||[])) if(!ids.has(c.next)) broken.push(id+" -> "+c.next);
}
const seen=new Set(["TITLE"]), stack=["TITLE"];
while(stack.length){const cur=stack.pop();for(const c of (SCENES[cur].choices||[]))if(!seen.has(c.next)){seen.add(c.next);stack.push(c.next);}}
console.log("broken:",broken,"badMem:",badMem,"unreachable:",[...ids].filter(i=>!seen.has(i)));
'
```

Wire it into a `npm run check:story` script and (later) a pre-commit hook.

---

## Phase 1 — Graphics & polish (low risk, high visibility)

The cheap, motivating win. Ship first to build momentum.

- **Scene transitions** — cross-fade between scenes (the old transition flag was
  dropped in the refactor; reintroduce it cleanly in `StoryView`).
- **Ambient audio** — one low drone per `art` type + a soft type tick, with a
  mute toggle persisted in `useGameState`. Audio is the single highest-impact /
  lowest-effort upgrade for mood in interactive fiction.
- **Richer canvas art** — the six existing scenes are good; add 2–3 more
  (`SceneArt` is already a clean switch on `type`) and parameterize palette so a
  scene can tint its illustration.
- **Reduced-motion + accessibility pass** — honor `prefers-reduced-motion`,
  ensure choices are keyboard-navigable, check contrast on the gold-on-near-black
  palette (it's currently borderline for body text).

Exit criteria: feels noticeably more alive; no regression in the integrity check.

## Phase 2 — Interactivity (medium risk)

Make choices *matter mechanically*, not just narratively.

- **Conditional choices** — show/hide a choice based on memories held or
  resonance level (e.g. a path that only opens at resonance ≥ 60). Add an
  optional `requires: { memory?, minResonance? }` field to choices; filter in
  `StoryView`.
- **Memory-gated scenes** — let collected fragments unlock alternate dialogue.
- **State-aware text** — small variable substitutions (player name, prior
  choices) inside paragraphs.
- **Inline keyboard controls** — space to advance, number keys to choose.

Exit criteria: at least one branch only reachable by a specific earlier choice,
proving the conditional system end-to-end.

## Phase 3 — Personalization (depends on Phases 0 & 2)

This is where the save layer pays off. None of it works without persisted state.

- **Player name + optional pronouns** captured at start, threaded into text.
- **Reading preferences** — typewriter speed, theme, motion, audio — persisted.
- **"Your archive"** — a profile view: memories collected, scenes seen,
  resonance reached, paths taken (we already record `history`).
- **Multiple save slots** — generalize `SAVE_KEY` to slot-keyed saves.
- **Personalized recap** on return ("Last time, you chose to…").

Exit criteria: a returning player sees their own name and a meaningful recap.

## Phase 4 — Gamification (highest risk — easy to cheapen the tone)

Be careful here. This is a literary, grief-centered story. Crude points/badges
would actively damage it. Gamify the *reflective* loop, not a score chase.

- **Achievements as discoveries**, framed in-world ("You found all 9 fragments",
  "You reached the deep layer without skipping a word") — quiet, not confetti.
- **Multiple endings + path tracking** — surface which of N endings reached.
- **New Game+** — replay with carried-over memories revealing new text.
- **A completion map** — a constellation view of scenes visited (ties to the
  star/archive visual language already in the art).

Explicitly *not* doing: timers, leaderboards, streak pressure, anything that
rushes the reader. The resonance meter is the only "score," and it should reward
attention, not speed.

Exit criteria: at least 2 distinct endings + a discoveries screen that fits the
tone.

---

## Cross-cutting, do early when convenient

- `npm run check:story` script + pre-commit hook.
- A tiny scene-graph visualizer (dev-only) to see the branching at a glance as
  content grows past ~100 scenes.
- Consider lightweight runtime validation of scene objects (shape check on load)
  so a malformed new scene fails loudly in dev.
