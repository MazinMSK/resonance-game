// ─── RESONANT WORDS ──────────────────────────────────────────────────────────
// A global lexicon: word (lowercased, no punctuation) -> { id, gloss }. When a
// paragraph is rendered, matched words become tappable. Tapping reveals the
// gloss inline and grants a small one-time resonance bump (deduped by id).
//
// `id` must be unique across the lexicon (verified by scripts/check-story.js).
// Words match case-insensitively on whole tokens; the first word in a multi-word
// key is not supported — keep keys single tokens for reliable matching.

export const LEXICON = {
  resonance:   { id: "lex_resonance", gloss: "The standing wave a life leaves behind — what does not decay when the body does." },
  memory:      { id: "lex_memory", gloss: "Not storage. A re-enactment. Each recollection rebuilds the thing it remembers." },
  halima:      { id: "lex_halima", gloss: "Your grandmother. The first person who told you the universe was paying attention." },
  eternity:    { id: "lex_eternity", gloss: "Not endless time. A single moment, refusing to let go of itself." },
  god:         { id: "lex_god", gloss: "In Halima's grammar: not a ruler, but a reader who has not finished the story." },
  gods:        { id: "lex_gods", gloss: "The old witnesses. Patient things that were here before the first inscription." },
  stars:       { id: "lex_stars", gloss: "Light that left its source before you were born, arriving precisely now, in your eyes." },
  soul:        { id: "lex_soul", gloss: "\"A story that God has not yet finished reading.\" You were twelve when she said it." },
  archive:     { id: "lex_archive", gloss: "Everything that was ever felt, kept somewhere that is not quite a place." },
  silence:     { id: "lex_silence", gloss: "Not absence. The space a question opens while it waits to be answered." },
  pyramid:     { id: "lex_pyramid", gloss: "A blueprint matched to 99.7% — built four thousand years before you drew it." },
  inscription: { id: "lex_inscription", gloss: "\"You were never separate from what you sought.\"" },
  tenderness:  { id: "lex_tenderness", gloss: "The choice the oldest thing that ever existed made, when it could have chosen anything." },
  light:       { id: "lex_light", gloss: "The only messenger slow enough to carry the past into the present intact." },
};

const PUNCT = /[^a-z]/g;

// Normalize a raw token to a lexicon key (strip punctuation, lowercase).
export function normalizeWord(raw) {
  return raw.toLowerCase().replace(PUNCT, "");
}

export function lookupWord(raw) {
  return LEXICON[normalizeWord(raw)] || null;
}
