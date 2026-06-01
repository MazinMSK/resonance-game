// Scene-graph integrity check. Run: npm run check:story
// Verifies: no broken `next` links, no bad memory references, no unreachable
// scenes (from TITLE). Exits non-zero on failure so it can gate commits/CI.

import { SCENES } from "../src/content/scenes.js";
import { MEMORIES } from "../src/content/memories.js";
import { LEXICON } from "../src/engine/lexicon.js";

const ids = new Set(Object.keys(SCENES));
const broken = [];
const badMem = [];
let choiceCount = 0;

for (const [id, s] of Object.entries(SCENES)) {
  if (s.memoryGain && !MEMORIES[s.memoryGain]) badMem.push(`${id} -> ${s.memoryGain}`);
  for (const c of s.choices || []) {
    choiceCount++;
    if (!ids.has(c.next)) broken.push(`${id} -> ${c.next}`);
  }
}

// Reachability from TITLE.
const seen = new Set(["TITLE"]);
const stack = ["TITLE"];
while (stack.length) {
  const cur = stack.pop();
  for (const c of SCENES[cur].choices || []) {
    if (!seen.has(c.next)) {
      seen.add(c.next);
      stack.push(c.next);
    }
  }
}
const unreachable = [...ids].filter((i) => !seen.has(i));

// Endings = reachable terminal scenes (no choice that advances elsewhere).
const endings = [...seen].filter((id) => {
  const s = SCENES[id];
  if (!s || s.isTitle) return false;
  return (s.choices || []).filter((c) => !c.isRestart && c.next).length === 0;
});

// Lexicon: word-ids must be unique.
const lexIds = Object.values(LEXICON).map((e) => e.id);
const dupLexIds = lexIds.filter((id, i) => lexIds.indexOf(id) !== i);

console.log(`Scenes: ${ids.size} | Choices: ${choiceCount} | Memories: ${Object.keys(MEMORIES).length}`);
console.log(`Resonant words: ${lexIds.length} | Derived endings: ${endings.length}`);
console.log(`Broken next links: ${broken.length ? broken.join(", ") : "NONE"}`);
console.log(`Bad memoryGain refs: ${badMem.length ? badMem.join(", ") : "NONE"}`);
console.log(`Unreachable scenes: ${unreachable.length ? unreachable.join(", ") : "NONE"}`);
console.log(`Duplicate lexicon ids: ${dupLexIds.length ? dupLexIds.join(", ") : "NONE"}`);
console.log(`Reachable endings: ${endings.length ? endings.join(", ") : "NONE (!)"}`);

if (broken.length || badMem.length || unreachable.length || dupLexIds.length || endings.length === 0) {
  console.error("\n✗ Story integrity check FAILED");
  process.exit(1);
}
console.log("\n✓ Story integrity OK");
