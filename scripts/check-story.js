// Scene-graph integrity check. Run: npm run check:story
// Verifies: no broken `next` links, no bad memory references, no unreachable
// scenes (from TITLE). Exits non-zero on failure so it can gate commits/CI.

import { SCENES } from "../src/content/scenes.js";
import { MEMORIES } from "../src/content/memories.js";

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

console.log(`Scenes: ${ids.size} | Choices: ${choiceCount} | Memories: ${Object.keys(MEMORIES).length}`);
console.log(`Broken next links: ${broken.length ? broken.join(", ") : "NONE"}`);
console.log(`Bad memoryGain refs: ${badMem.length ? badMem.join(", ") : "NONE"}`);
console.log(`Unreachable scenes: ${unreachable.length ? unreachable.join(", ") : "NONE"}`);

if (broken.length || badMem.length || unreachable.length) {
  console.error("\n✗ Story integrity check FAILED");
  process.exit(1);
}
console.log("\n✓ Story integrity OK");
