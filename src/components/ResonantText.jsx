import { Fragment } from "react";
import { lookupWord } from "../engine/lexicon";

// Renders a paragraph, turning lexicon words into tappable spans. Tapping a word
// reveals its gloss (handled by the parent via onReveal) and — the first time a
// given word-id is revealed — grants a small resonance bump. Words already found
// render in a settled "found" style. Clicking non-word text bubbles up so the
// existing click-to-advance behaviour still works.
export function ResonantText({ text, found, onReveal, baseStyle, interactive = true }) {
  if (!interactive) return <span style={baseStyle}>{text}</span>;

  const tokens = text.split(/(\s+)/);

  return (
    <span style={baseStyle}>
      {tokens.map((tok, i) => {
        const entry = /\s+/.test(tok) ? null : lookupWord(tok);
        if (!entry) return <Fragment key={i}>{tok}</Fragment>;
        const isFound = found.has(entry.id);
        return (
          <span
            key={i}
            className={`resonant-word${isFound ? " found" : ""}`}
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); onReveal(entry, tok); }}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); e.preventDefault(); onReveal(entry, tok); } }}
            title="A resonant word"
          >
            {tok}
          </span>
        );
      })}
    </span>
  );
}
