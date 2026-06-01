# The Resonance Archive

An interactive, text-based narrative game — *Gods, Machines & the Memory of Eternity* —
adapted from the novels *The Digital Tapestry* and *What the Gods Remember*.

Built with React 19 + Vite. By **Mazin Mohamedkhair**.

**▶ Play it live:** https://resonance-game-nine.vercel.app/

---

## Run it

```bash
npm install
npm run dev      # local dev server
npm run build    # production build
npm run preview  # preview the build
```

## How it plays

A branching story. You read scenes paragraph by paragraph (typewriter reveal),
make choices that route you through the graph, collect **memory fragments**, and
build a **resonance** meter (0–100). Progress now persists across refreshes and a
**Continue** option appears on the title screen when a save exists.

Current content: **52 scenes, 106 choices, 9 collectible memories** — every scene
reachable from the title, every choice links to a valid scene (verified).

## Architecture (v2.0 foundation)

The game was a single 1,777-line file. It is now split by responsibility so
content, logic, and rendering can evolve independently:

```
src/
├── App.jsx                 # thin orchestrator — wires state + UI together
├── main.jsx                # React entry
├── content/                # WHAT the story is (no logic)
│   ├── scenes.js           #   the full scene graph
│   └── memories.js         #   collectible memory fragments
├── engine/                 # HOW the game runs (no JSX)
│   ├── constants.js        #   tunables: typing speed, save key, color ramp
│   ├── useTypewriter.js    #   paragraph reveal hook
│   └── useGameState.js     #   persistent state + save/load/resume/reset
├── art/
│   └── SceneArt.jsx        #   animated <canvas> scene illustrations
└── components/             # WHAT the player sees
    ├── TitleScreen.jsx
    └── StoryView.jsx
```

Why this matters: writing new chapters now means editing only `content/scenes.js`.
Changing game feel means only `engine/`. Re-skinning means only `components/` and
`art/`. The three no longer collide in one file.

## Adding a scene

Append to `SCENES` in `src/content/scenes.js`:

```js
NEW_SCENE: {
  id: "NEW_SCENE",
  art: "archive",                 // hospital | pyramid | neural | desert | archive | tender
  year: "Khartoum — 2035",
  title: "Scene Title",
  text: [ "Paragraph one.", "Paragraph two." ],
  memoryGain: "halima_words",     // optional — must exist in memories.js
  resonanceGain: 15,              // optional
  choices: [
    { text: "A choice", next: "SOME_SCENE_ID", icon: "◆", resonance: 10 },
  ],
},
```

Run the integrity check (no broken `next` links, no unreachable scenes) before
shipping content changes — see `V2_ROADMAP.md`.

## What's next

See **`V2_ROADMAP.md`** for the phased v2.0 plan: graphics, interactivity,
personalization, and gamification.
