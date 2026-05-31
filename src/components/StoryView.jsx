import { SceneArt } from "../art/SceneArt";
import { MEMORIES } from "../content/memories";

// ─── STORY VIEW (the playing screen) ─────────────────────────────────────────

const isQuote = (s) => s.startsWith(`"`) || s.startsWith(`'`) || s.startsWith(`“`);
const isSION = (s) =>
  s.startsWith(`"I`) || s.startsWith(`"Yes`) || s.startsWith(`"No`) ||
  s.startsWith(`"The`) || s.startsWith(`"What`) || s.startsWith(`"She`);

export function StoryView({
  scene, parIdx, displayed, done, showChoices, showMemories,
  memories, resonancePct, resonanceColor, choiceFlash, transitioning,
  scrollRef, onAdvance, onSkip, onChoose, onToggleMemories, onHome,
}) {
  const currentPar = scene.text[parIdx] || "";

  return (
    <div style={{ minHeight: "100vh", background: "#020408", color: "#c8c0b0", fontFamily: "'Cormorant Garamond', Palatino, serif", position: "relative", opacity: transitioning ? 0 : 1, transition: "opacity 0.5s ease" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Cinzel:wght@400;500&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%,100%{opacity:0.4}50%{opacity:1}}
        @keyframes glow{0%,100%{box-shadow:0 0 8px rgba(201,169,110,0.1)}50%{box-shadow:0 0 20px rgba(201,169,110,0.25)}}
        @keyframes memPop{from{opacity:0;transform:scale(0.8) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}
        * { box-sizing: border-box; }
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:#020408}::-webkit-scrollbar-thumb{background:#c9a96e33}
        .choice-btn { background:transparent; border:1px solid rgba(201,169,110,0.2); color:#c9a96e; padding:13px 20px 13px 16px; cursor:pointer; font-family:'Cormorant Garamond',serif; font-size:15px; font-style:italic; letter-spacing:0.03em; line-height:1.5; text-align:left; width:100%; margin-bottom:8px; transition:all 0.25s ease; position:relative; }
        .choice-btn:hover { background:rgba(201,169,110,0.08); border-color:rgba(201,169,110,0.5); color:#e8d5a0; transform:translateX(4px); }
        .choice-btn.flashing { background:rgba(201,169,110,0.18); border-color:rgba(201,169,110,0.8); }
        .mem-tag { display:inline-block; padding:3px 10px; border-radius:20px; font-size:11px; font-family:'Cinzel',serif; letter-spacing:0.08em; margin:3px; cursor:pointer; transition:all 0.2s; border:1px solid transparent; animation:memPop 0.4s ease forwards; }
        .mem-tag:hover { transform:scale(1.05); }
      `}</style>

      {/* Top bar */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(2,4,8,0.95)", backdropFilter: "blur(8px)", borderBottom: "1px solid rgba(201,169,110,0.08)", padding: "10px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={onHome} style={{ background: "none", border: "none", fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.2em", color: "rgba(126,200,200,0.5)", cursor: "pointer", textTransform: "uppercase" }}>
          ← Archive
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, maxWidth: 220, margin: "0 20px" }}>
          <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.15em", color: "rgba(200,192,180,0.4)", whiteSpace: "nowrap" }}>RESONANCE</span>
          <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${resonancePct}%`, background: `linear-gradient(90deg, #7ec8c8, ${resonanceColor})`, borderRadius: 2, transition: "width 1s ease, background 1s ease" }} />
          </div>
          <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, color: resonanceColor, minWidth: 28, transition: "color 1s" }}>{resonancePct}</span>
        </div>
        <button onClick={onToggleMemories} style={{ background: "none", border: "none", fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.15em", color: memories.length > 0 ? "rgba(201,169,110,0.7)" : "rgba(200,192,180,0.3)", cursor: "pointer", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ fontSize: 14 }}>◈</span> {memories.length} MEMORIES
        </button>
      </div>

      {/* Memories panel */}
      {showMemories && (
        <div style={{ position: "fixed", top: 45, right: 0, bottom: 0, width: 280, background: "rgba(2,4,8,0.98)", borderLeft: "1px solid rgba(201,169,110,0.12)", zIndex: 40, padding: "24px 16px", overflowY: "auto" }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.2em", color: "#7ec8c8", marginBottom: 20 }}>MEMORY FRAGMENTS</div>
          {memories.length === 0 && <p style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", color: "rgba(200,192,180,0.3)", fontSize: 14 }}>No memories collected yet.</p>}
          {memories.map((mid) => {
            const mem = MEMORIES[mid];
            if (!mem) return null;
            return (
              <div key={mid} style={{ marginBottom: 16, padding: "12px 14px", border: `1px solid ${mem.color}33`, background: `${mem.color}08`, borderRadius: 2 }}>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.12em", color: mem.color, marginBottom: 6 }}>{mem.label}</div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: 13, color: "rgba(200,192,180,0.6)", lineHeight: 1.5 }}>{mem.desc}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Main layout */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 20px 80px", display: "grid", gridTemplateColumns: "1fr", gap: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 24, alignItems: "start", padding: "28px 0 24px", borderBottom: "1px solid rgba(201,169,110,0.08)", marginBottom: 28 }}>
          <div style={{ opacity: 1, transition: "opacity 0.8s ease" }}>
            <SceneArt type={scene.art} animate={true} />
          </div>
          <div style={{ paddingTop: 4 }}>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.2em", color: "#7ec8c8", opacity: 0.7, marginBottom: 10, textTransform: "uppercase" }}>
              {scene.year}
            </div>
            <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: "clamp(18px,3vw,26px)", fontWeight: 500, color: "#e8d5a0", letterSpacing: "0.05em", lineHeight: 1.25, margin: 0 }}>
              {scene.title}
            </h2>
            <div style={{ display: "flex", gap: 4, marginTop: 16, flexWrap: "wrap" }}>
              {scene.text.map((_, i) => (
                <div key={i} style={{ width: i === parIdx ? 18 : 5, height: 2, background: i <= parIdx ? "rgba(201,169,110,0.6)" : "rgba(201,169,110,0.12)", borderRadius: 1, transition: "all 0.4s ease" }} />
              ))}
            </div>
          </div>
        </div>

        <div>
          {scene.text.slice(0, parIdx).map((p, i) => (
            <p key={i} onClick={onAdvance} style={{ fontSize: "clamp(15px,2vw,18px)", lineHeight: 1.85, marginBottom: 20, fontStyle: isQuote(p) ? "italic" : "normal", color: isQuote(p) ? (isSION(p) ? "#8fcfcf" : "#b0c8c0") : "rgba(200,192,180,0.55)", cursor: "pointer", letterSpacing: "0.01em", opacity: Math.max(0.3, 1 - (parIdx - i) * 0.12), transition: "opacity 0.3s" }}>
              {p}
            </p>
          ))}

          <p onClick={onAdvance} style={{ fontSize: "clamp(15px,2vw,18px)", lineHeight: 1.85, marginBottom: 20, fontStyle: isQuote(currentPar) ? "italic" : "normal", color: isQuote(currentPar) ? (isSION(currentPar) ? "#9dd8d8" : "#c0d8d0") : "#d0c8b8", cursor: "pointer", letterSpacing: "0.01em", minHeight: "1.85em" }}>
            {displayed}
            {!done && <span style={{ display: "inline-block", width: 2, height: "1em", background: "#c9a96e", marginLeft: 2, verticalAlign: "text-bottom", animation: "shimmer 0.7s ease-in-out infinite" }} />}
          </p>

          {!done && (
            <button onClick={onSkip} style={{ background: "none", border: "none", fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.15em", color: "rgba(201,169,110,0.35)", cursor: "pointer", textTransform: "uppercase", padding: 0, marginBottom: 20, animation: "shimmer 2s ease-in-out infinite" }}>
              skip →
            </button>
          )}

          {done && parIdx < scene.text.length - 1 && (
            <button onClick={onAdvance} style={{ background: "none", border: "none", fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.15em", color: "rgba(201,169,110,0.4)", cursor: "pointer", textTransform: "uppercase", padding: 0, marginBottom: 20, animation: "shimmer 2s ease-in-out infinite" }}>
              continue →
            </button>
          )}

          {showChoices && (
            <div style={{ marginTop: 36, borderTop: "1px solid rgba(201,169,110,0.1)", paddingTop: 28, animation: "fadeUp 0.5s ease forwards" }}>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.2em", color: "rgba(201,169,110,0.35)", marginBottom: 16, textTransform: "uppercase" }}>
                What do you do?
              </div>
              {scene.choices.map((c, i) => (
                <button key={i} className={`choice-btn${choiceFlash === i ? " flashing" : ""}`} onClick={() => onChoose(c, i)}>
                  <span style={{ opacity: 0.5, marginRight: 8, fontSize: 11 }}>{c.icon || "◆"}</span>
                  {c.text}
                  {c.resonance && <span style={{ float: "right", fontSize: 11, opacity: 0.4, fontStyle: "normal", fontFamily: "'Cinzel',serif" }}>+{c.resonance}</span>}
                </button>
              ))}
            </div>
          )}

          <div ref={scrollRef} />
        </div>
      </div>
    </div>
  );
}
