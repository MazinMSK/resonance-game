import { SceneArt } from "../art/SceneArt";
import { ACHIEVEMENTS } from "../engine/useProgress";
import { ENDING_IDS } from "../engine/endings";

// ─── TITLE SCREEN ────────────────────────────────────────────────────────────

export function TitleScreen({
  scene, choose, canContinue, onContinue,
  onOpenSettings, onOpenConstellation, achievements = [], endingsFound = [],
}) {
  const achTotal = Object.keys(ACHIEVEMENTS).length;
  const hasProgress = achievements.length > 0 || endingsFound.length > 0;
  return (
    <div style={{ minHeight: "100vh", background: "#020408", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Cinzel:wght@400;500;600&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%,100%{opacity:0.4}50%{opacity:1}}
        @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.02)}}
        * { box-sizing: border-box; }
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#020408}::-webkit-scrollbar-thumb{background:#c9a96e44;border-radius:2px}
      `}</style>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 40%, rgba(201,169,110,0.06) 0%, transparent 60%)", pointerEvents: "none" }} />
      <div style={{ textAlign: "center", animation: "fadeUp 1.2s ease forwards", padding: "0 24px", maxWidth: 500 }}>
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: 11, letterSpacing: "0.3em", color: "#7ec8c8", opacity: 0.7, marginBottom: 20, textTransform: "uppercase" }}>
          A Novel in Two Volumes
        </div>
        <div style={{ marginBottom: 28 }}>
          <SceneArt type="archive" animate={true} />
        </div>
        <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(28px,5vw,48px)", fontWeight: 500, color: "#e8d5a0", letterSpacing: "0.08em", marginBottom: 8, lineHeight: 1.1 }}>
          The Resonance Archive
        </h1>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 16, color: "#7ec8c8", letterSpacing: "0.06em", marginBottom: 8, opacity: 0.8 }}>
          Gods, Machines &amp; the Memory of Eternity
        </p>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 13, color: "rgba(200,192,180,0.4)", letterSpacing: "0.04em", marginBottom: 40 }}>
          Based on The Digital Tapestry &amp; What the Gods Remember
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 320, margin: "0 auto" }}>
          {canContinue && (
            <button onClick={onContinue} style={{ background: "rgba(126,200,200,0.12)", border: "1px solid rgba(126,200,200,0.5)", color: "#9dd8d8", padding: "14px 24px", cursor: "pointer", fontFamily: "'Cormorant Garamond', serif", fontSize: 15, fontStyle: "italic", letterSpacing: "0.04em", transition: "all 0.3s", borderRadius: 1 }}>
              ⟳ Continue your archive
            </button>
          )}
          {scene.choices.map((c, i) => (
            <button key={i} onClick={() => choose(c, i)} style={{ background: i === 0 ? "rgba(201,169,110,0.1)" : "transparent", border: `1px solid ${i === 0 ? "rgba(201,169,110,0.5)" : "rgba(126,200,200,0.25)"}`, color: i === 0 ? "#e8d5a0" : "#7ec8c8", padding: "14px 24px", cursor: "pointer", fontFamily: "'Cormorant Garamond', serif", fontSize: 15, fontStyle: "italic", letterSpacing: "0.04em", transition: "all 0.3s", borderRadius: 1 }}
              onMouseEnter={e => { e.target.style.background = i === 0 ? "rgba(201,169,110,0.2)" : "rgba(126,200,200,0.1)"; }}
              onMouseLeave={e => { e.target.style.background = i === 0 ? "rgba(201,169,110,0.1)" : "transparent"; }}
            >
              {c.icon} {c.text}
            </button>
          ))}
        </div>
        {/* Progress tracker (only once the player has discovered something) */}
        {hasProgress && (
          <div style={{ marginTop: 34, padding: "16px 18px", border: "1px solid rgba(201,169,110,0.16)", borderRadius: 4, background: "rgba(201,169,110,0.03)" }}>
            <div style={{ display: "flex", justifyContent: "center", gap: 24, fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: "0.12em", color: "rgba(200,192,180,0.55)", textTransform: "uppercase" }}>
              <span>Endings {endingsFound.length}/{ENDING_IDS.length}</span>
              <span>Achievements {achievements.length}/{achTotal}</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8, marginTop: 12 }}>
              {Object.values(ACHIEVEMENTS).map((a) => {
                const got = achievements.includes(a.id);
                return (
                  <span key={a.id} title={got ? `${a.name} — ${a.desc}` : "Locked"} style={{ fontSize: 18, color: got ? "#e8d5a0" : "rgba(200,192,180,0.18)", filter: got ? "drop-shadow(0 0 6px rgba(201,169,110,0.4))" : "none", transition: "all 0.3s" }}>
                    {a.icon}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "center", gap: 18, marginTop: 26 }}>
          <button onClick={onOpenConstellation} style={{ background: "none", border: "none", fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: "0.15em", color: "rgba(126,200,200,0.6)", cursor: "pointer", textTransform: "uppercase", padding: 8 }}>✶ Constellation</button>
          <button onClick={onOpenSettings} style={{ background: "none", border: "none", fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: "0.15em", color: "rgba(200,192,180,0.5)", cursor: "pointer", textTransform: "uppercase", padding: 8 }}>⚙ Settings</button>
        </div>

        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 12, color: "rgba(200,192,180,0.3)", marginTop: 32, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Mazin Mohamedkhair
        </p>
      </div>
    </div>
  );
}
