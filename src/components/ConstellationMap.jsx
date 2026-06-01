import { useMemo, useState } from "react";
import { MEMORIES } from "../content/memories";
import { ENDING_IDS, endingMeta } from "../engine/endings";

// Background star field, generated once per mount (kept out of render so it is
// stable and does not call an impure function during rendering).
function makeBgStars() {
  return Array.from({ length: 46 }, () => ({
    x: Math.random() * 500,
    y: Math.random() * 300,
    r: Math.random() * 1.1 + 0.3,
    o: Math.random() * 0.5 + 0.1,
  }));
}

// ─── MEMORY CONSTELLATION (modal) ────────────────────────────────────────────
// A star-map of progress: one star per memory (lit if collected) arranged in a
// ring, with faint background stars for ambience and an endings tally. Read-only
// and lightweight — no panning needed at this scale, works on small screens.

const overlay = {
  position: "fixed", inset: 0, zIndex: 150, background: "rgba(1,2,5,0.9)",
  backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
};
const panel = {
  width: "100%", maxWidth: 520, background: "rgba(4,6,12,0.98)",
  border: "1px solid rgba(126,200,200,0.22)", borderRadius: 6, padding: "22px 20px 18px",
  fontFamily: "'Cormorant Garamond', serif", color: "#c8c0b0",
};

export function ConstellationMap({ collected, endingsFound, onClose }) {
  const ids = Object.keys(MEMORIES);
  const collectedSet = useMemo(() => new Set(collected), [collected]);
  const endSet = useMemo(() => new Set(endingsFound), [endingsFound]);

  const cx = 250, cy = 150, R = 110;
  const points = ids.map((id, i) => {
    const a = (i / ids.length) * Math.PI * 2 - Math.PI / 2;
    return { id, x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R, mem: MEMORIES[id], lit: collectedSet.has(id) };
  });

  const [bgStars] = useState(makeBgStars);

  return (
    <div style={overlay} onClick={onClose}>
      <div style={panel} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 15, color: "#9dd8d8", letterSpacing: "0.16em", margin: 0 }}>Constellation</h2>
          <button onClick={onClose} aria-label="Close" style={{ background: "none", border: "none", color: "rgba(200,192,180,0.6)", fontSize: 18, cursor: "pointer" }}>✕</button>
        </div>

        <svg viewBox="0 0 500 300" style={{ width: "100%", height: "auto", display: "block" }}>
          {bgStars.map((s, i) => (
            <circle key={`b${i}`} cx={s.x} cy={s.y} r={s.r} fill="#cfe8ff" opacity={s.o} />
          ))}
          {/* connect lit stars to suggest a forming constellation */}
          {points.filter((p) => p.lit).map((p, i, arr) => {
            const nxt = arr[(i + 1) % arr.length];
            if (arr.length < 2) return null;
            return <line key={`l${i}`} x1={p.x} y1={p.y} x2={nxt.x} y2={nxt.y} stroke="rgba(201,169,110,0.25)" strokeWidth="1" />;
          })}
          {points.map((p) => (
            <g key={p.id}>
              <circle
                cx={p.x} cy={p.y} r={p.lit ? 6 : 3}
                fill={p.lit ? (p.mem.color || "#e8d5a0") : "rgba(200,192,180,0.18)"}
                style={p.lit ? { filter: "drop-shadow(0 0 6px rgba(201,169,110,0.6))" } : undefined}
              />
              {p.lit && (
                <text x={p.x} y={p.y - 12} textAnchor="middle" fontSize="9" fill="rgba(200,192,180,0.7)" fontFamily="'Cinzel', serif">
                  {p.mem.label}
                </text>
              )}
            </g>
          ))}
        </svg>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontStyle: "italic", fontSize: 14, color: "rgba(200,192,180,0.65)" }}>
          <span>{collected.length} / {ids.length} memories</span>
          <span>{endSet.size} / {ENDING_IDS.length} endings</span>
        </div>
        {endSet.size > 0 && (
          <div style={{ marginTop: 8, fontSize: 12, color: "rgba(126,200,200,0.6)", fontStyle: "italic" }}>
            Endings reached: {endingsFound.map((id) => endingMeta(id)?.title).filter(Boolean).join(" · ")}
          </div>
        )}
      </div>
    </div>
  );
}
