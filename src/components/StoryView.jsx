import { useRef } from "react";
import { SceneArt } from "../art/SceneArt";
import { MEMORIES } from "../content/memories";
import { ResonantText } from "./ResonantText";

// ─── STORY VIEW (the playing screen) ─────────────────────────────────────────

const isQuote = (s) => s.startsWith(`"`) || s.startsWith(`'`) || s.startsWith(`“`);
const isSION = (s) =>
  s.startsWith(`"I`) || s.startsWith(`"Yes`) || s.startsWith(`"No`) ||
  s.startsWith(`"The`) || s.startsWith(`"What`) || s.startsWith(`"She`);

export function StoryView({
  scene, parIdx, displayed, done, showChoices, showMemories,
  memories, resonancePct, resonanceColor, choiceFlash, transitioning,
  scrollRef, tilt, reducedMotion, foundWords, wordGloss,
  onRevealWord, onDismissGloss,
  onAdvance, onSkip, onChoose, onToggleMemories, onHome,
  onOpenSettings, onOpenConstellation,
}) {
  const currentPar = scene.text[parIdx] || "";
  const touch = useRef(null);

  // Swipe: left → advance, right → home. Ignored if it starts on an interactive
  // element (so taps on words/choices still work).
  const onTouchStart = (e) => {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY, time: Date.now() };
  };
  const onTouchEnd = (e) => {
    if (!touch.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touch.current.x;
    const dy = t.clientY - touch.current.y;
    const dt = Date.now() - touch.current.time;
    touch.current = null;
    if (dt > 700 || Math.abs(dx) < 60 || Math.abs(dy) > Math.abs(dx)) return;
    if (dx < 0) onAdvance(); else onHome();
  };

  const tx = reducedMotion ? 0 : (tilt?.x || 0);
  const ty = reducedMotion ? 0 : (tilt?.y || 0);

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{ minHeight: "100vh", background: "transparent", color: "#c8c0b0", fontFamily: "'Cormorant Garamond', Palatino, serif", position: "relative", zIndex: 1, opacity: transitioning ? 0 : 1, transition: "opacity 0.5s ease" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Cinzel:wght@400;500&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%,100%{opacity:0.4}50%{opacity:1}}
        @keyframes glow{0%,100%{box-shadow:0 0 8px rgba(201,169,110,0.1)}50%{box-shadow:0 0 20px rgba(201,169,110,0.25)}}
        @keyframes memPop{from{opacity:0;transform:scale(0.8) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(14px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        @keyframes glossIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        * { box-sizing: border-box; }
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:#020408}::-webkit-scrollbar-thumb{background:#c9a96e33}
        .choice-btn { background:transparent; border:1px solid rgba(201,169,110,0.2); color:#c9a96e; padding:15px 20px 15px 16px; cursor:pointer; font-family:'Cormorant Garamond',serif; font-size:16px; font-style:italic; letter-spacing:0.03em; line-height:1.5; text-align:left; width:100%; margin-bottom:10px; transition:all 0.25s ease; position:relative; min-height:48px; }
        .choice-btn:hover { background:rgba(201,169,110,0.08); border-color:rgba(201,169,110,0.5); color:#e8d5a0; transform:translateX(4px); }
        .choice-btn.flashing { background:rgba(201,169,110,0.18); border-color:rgba(201,169,110,0.8); }
        .mem-tag { display:inline-block; padding:3px 10px; border-radius:20px; font-size:11px; font-family:'Cinzel',serif; letter-spacing:0.08em; margin:3px; cursor:pointer; transition:all 0.2s; border:1px solid transparent; animation:memPop 0.4s ease forwards; }
        .mem-tag:hover { transform:scale(1.05); }
        .resonant-word { color:#c9a96e; cursor:pointer; border-bottom:1px dotted rgba(201,169,110,0.5); transition:color 0.2s, text-shadow 0.2s; }
        .resonant-word:hover, .resonant-word:focus { color:#e8d5a0; text-shadow:0 0 10px rgba(201,169,110,0.45); outline:none; }
        .resonant-word.found { color:rgba(157,216,216,0.85); border-bottom-color:rgba(126,200,200,0.3); }
        .topbtn { background:none; border:none; font-family:'Cinzel',serif; font-size:10px; letter-spacing:0.15em; cursor:pointer; text-transform:uppercase; display:flex; align-items:center; gap:5px; padding:8px; min-height:40px; }
        .mem-panel { position:fixed; top:45px; right:0; bottom:0; width:300px; background:rgba(2,4,8,0.98); border-left:1px solid rgba(201,169,110,0.12); z-index:120; padding:24px 16px; overflow-y:auto; }
        @media (max-width:640px){
          .mem-panel { top:auto; left:0; right:0; bottom:0; width:100%; max-height:62vh; border-left:none; border-top:1px solid rgba(201,169,110,0.18); border-radius:12px 12px 0 0; animation:fadeUp 0.3s ease forwards; }
          .scene-grid { grid-template-columns:1fr !important; }
          .scene-grid .art-cell { margin:0 auto; }
        }
      `}</style>

      {/* Top bar */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(2,4,8,0.92)", backdropFilter: "blur(8px)", borderBottom: "1px solid rgba(201,169,110,0.08)", padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <button onClick={onHome} className="topbtn" style={{ color: "rgba(126,200,200,0.5)" }}>← Archive</button>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, maxWidth: 200, margin: "0 8px" }}>
          <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.15em", color: "rgba(200,192,180,0.4)", whiteSpace: "nowrap" }}>RES</span>
          <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${resonancePct}%`, background: `linear-gradient(90deg, #7ec8c8, ${resonanceColor})`, borderRadius: 2, transition: "width 1s ease, background 1s ease" }} />
          </div>
          <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, color: resonanceColor, minWidth: 22, transition: "color 1s" }}>{resonancePct}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <button onClick={onOpenConstellation} className="topbtn" title="Constellation" style={{ color: "rgba(126,200,200,0.6)", fontSize: 14 }}>✶</button>
          <button onClick={onOpenSettings} className="topbtn" title="Settings" style={{ color: "rgba(200,192,180,0.5)", fontSize: 14 }}>⚙</button>
          <button onClick={onToggleMemories} className="topbtn" style={{ color: memories.length > 0 ? "rgba(201,169,110,0.7)" : "rgba(200,192,180,0.3)" }}>
            <span style={{ fontSize: 14 }}>◈</span> {memories.length}
          </button>
        </div>
      </div>

      {/* Memories panel (side on desktop, bottom sheet on mobile) */}
      {showMemories && (
        <div className="mem-panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.2em", color: "#7ec8c8" }}>MEMORY FRAGMENTS</span>
            <button onClick={onToggleMemories} aria-label="Close" style={{ background: "none", border: "none", color: "rgba(200,192,180,0.6)", fontSize: 18, cursor: "pointer" }}>✕</button>
          </div>
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
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 20px 90px" }}>
        <div className="scene-grid" style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 24, alignItems: "start", padding: "28px 0 24px", borderBottom: "1px solid rgba(201,169,110,0.08)", marginBottom: 28 }}>
          <div className="art-cell" style={{ transform: `translate(${tx * 6}px, ${ty * 6}px)`, transition: reducedMotion ? "none" : "transform 0.2s ease-out" }}>
            <SceneArt type={scene.art} animate={!reducedMotion} />
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
            <p key={i} onClick={onAdvance} style={{ fontSize: "clamp(16px,2vw,18px)", lineHeight: 1.85, marginBottom: 20, fontStyle: isQuote(p) ? "italic" : "normal", color: isQuote(p) ? (isSION(p) ? "#8fcfcf" : "#b0c8c0") : "rgba(200,192,180,0.55)", cursor: "pointer", letterSpacing: "0.01em", opacity: Math.max(0.3, 1 - (parIdx - i) * 0.12), transition: "opacity 0.3s" }}>
              <ResonantText text={p} found={foundWords} onReveal={onRevealWord} interactive={!isQuote(p)} />
            </p>
          ))}

          <p onClick={onAdvance} style={{ fontSize: "clamp(16px,2vw,18px)", lineHeight: 1.85, marginBottom: 14, fontStyle: isQuote(currentPar) ? "italic" : "normal", color: isQuote(currentPar) ? (isSION(currentPar) ? "#9dd8d8" : "#c0d8d0") : "#d0c8b8", cursor: "pointer", letterSpacing: "0.01em", minHeight: "1.85em" }}>
            {done
              ? <ResonantText text={currentPar} found={foundWords} onReveal={onRevealWord} interactive={!isQuote(currentPar)} />
              : displayed}
            {!done && <span style={{ display: "inline-block", width: 2, height: "1em", background: "#c9a96e", marginLeft: 2, verticalAlign: "text-bottom", animation: "shimmer 0.7s ease-in-out infinite" }} />}
          </p>

          {/* Resonant-word gloss */}
          {wordGloss && (
            <div onClick={onDismissGloss} style={{ margin: "0 0 18px", padding: "12px 16px", borderLeft: "2px solid rgba(201,169,110,0.5)", background: "rgba(201,169,110,0.06)", borderRadius: 2, fontStyle: "italic", fontSize: 15, color: "rgba(232,213,160,0.85)", lineHeight: 1.6, cursor: "pointer", animation: "glossIn 0.3s ease forwards" }}>
              {wordGloss.gloss}
            </div>
          )}

          {!done && (
            <button onClick={onSkip} style={{ background: "none", border: "none", fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.15em", color: "rgba(201,169,110,0.35)", cursor: "pointer", textTransform: "uppercase", padding: "8px 0", marginBottom: 12, animation: "shimmer 2s ease-in-out infinite" }}>
              skip →
            </button>
          )}

          {done && parIdx < scene.text.length - 1 && (
            <button onClick={onAdvance} style={{ background: "none", border: "none", fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.15em", color: "rgba(201,169,110,0.4)", cursor: "pointer", textTransform: "uppercase", padding: "8px 0", marginBottom: 12, animation: "shimmer 2s ease-in-out infinite" }}>
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
