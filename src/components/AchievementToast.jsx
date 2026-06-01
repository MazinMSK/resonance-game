import { useEffect } from "react";
import { ACHIEVEMENTS } from "../engine/useProgress";

// Transient popup shown when an achievement unlocks. Auto-dismisses after a few
// seconds; the parent feeds the next queued achievement, if any.
export function AchievementToast({ id, onDone, onMount }) {
  const ach = ACHIEVEMENTS[id];

  useEffect(() => {
    if (!ach) return undefined;
    if (onMount) onMount();
    const t = setTimeout(onDone, 3400);
    return () => clearTimeout(t);
  }, [id]);

  if (!ach) return null;

  return (
    <div
      role="status"
      style={{
        position: "fixed", left: "50%", bottom: 28, transform: "translateX(-50%)",
        zIndex: 200, display: "flex", alignItems: "center", gap: 14,
        background: "rgba(10,8,12,0.96)", border: "1px solid rgba(201,169,110,0.45)",
        borderRadius: 4, padding: "13px 20px", maxWidth: "calc(100vw - 32px)",
        boxShadow: "0 0 28px rgba(201,169,110,0.18)", animation: "toastIn 0.45s ease forwards",
        fontFamily: "'Cormorant Garamond', serif",
      }}
    >
      <span style={{ fontSize: 26, color: "#e8d5a0" }}>{ach.icon}</span>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: "0.22em", color: "rgba(126,200,200,0.7)", textTransform: "uppercase" }}>Achievement</span>
        <strong style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: "#e8d5a0", letterSpacing: "0.04em" }}>{ach.name}</strong>
        <span style={{ fontStyle: "italic", fontSize: 13, color: "rgba(200,192,180,0.6)" }}>{ach.desc}</span>
      </div>
    </div>
  );
}
