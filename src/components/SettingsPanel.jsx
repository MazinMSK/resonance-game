// ─── SETTINGS PANEL (modal) ──────────────────────────────────────────────────
// Text speed, sound, reduced motion. Controlled by the parent; changes persist
// via the settings hook in App.

const SPEEDS = [
  { id: "slow", label: "Slow", value: 30 },
  { id: "normal", label: "Normal", value: 16 },
  { id: "fast", label: "Fast", value: 7 },
  { id: "instant", label: "Instant", value: 0 },
];

const overlay = {
  position: "fixed", inset: 0, zIndex: 150, background: "rgba(2,4,8,0.78)",
  backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
};
const panel = {
  width: "100%", maxWidth: 420, background: "rgba(8,8,12,0.98)",
  border: "1px solid rgba(201,169,110,0.25)", borderRadius: 6, padding: "26px 24px",
  fontFamily: "'Cormorant Garamond', serif", color: "#c8c0b0",
};
const rowStyle = { display: "flex", alignItems: "center", justifyContent: "space-between", margin: "18px 0", gap: 16 };
const labelStyle = { fontFamily: "'Cinzel', serif", fontSize: 11, letterSpacing: "0.14em", color: "rgba(200,192,180,0.75)", textTransform: "uppercase" };

function Seg({ options, value, onPick }) {
  return (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onPick(o.value)}
          style={{
            background: value === o.value ? "rgba(201,169,110,0.2)" : "transparent",
            border: `1px solid ${value === o.value ? "rgba(201,169,110,0.6)" : "rgba(201,169,110,0.2)"}`,
            color: value === o.value ? "#e8d5a0" : "rgba(200,192,180,0.55)",
            padding: "7px 13px", cursor: "pointer", fontFamily: "'Cormorant Garamond', serif",
            fontSize: 13, fontStyle: "italic", borderRadius: 3, minWidth: 44,
          }}
        >{o.label}</button>
      ))}
    </div>
  );
}

function Toggle({ on, onToggle }) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={on}
      style={{
        width: 50, height: 27, borderRadius: 14, position: "relative", cursor: "pointer",
        background: on ? "rgba(201,169,110,0.35)" : "rgba(255,255,255,0.08)",
        border: `1px solid ${on ? "rgba(201,169,110,0.6)" : "rgba(255,255,255,0.15)"}`, padding: 0,
        transition: "background 0.25s",
      }}
    >
      <span style={{
        position: "absolute", top: 2, left: on ? 25 : 2, width: 21, height: 21, borderRadius: "50%",
        background: on ? "#e8d5a0" : "rgba(200,192,180,0.5)", transition: "left 0.25s, background 0.25s",
      }} />
    </button>
  );
}

export function SettingsPanel({ settings, onChange, onClose }) {
  const set = (patch) => onChange({ ...settings, ...patch });
  return (
    <div style={overlay} onClick={onClose}>
      <div style={panel} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 16, color: "#e8d5a0", letterSpacing: "0.1em", margin: 0 }}>Settings</h2>
          <button onClick={onClose} aria-label="Close" style={{ background: "none", border: "none", color: "rgba(200,192,180,0.6)", fontSize: 18, cursor: "pointer" }}>✕</button>
        </div>

        <div style={rowStyle}>
          <span style={labelStyle}>Text speed</span>
          <Seg options={SPEEDS} value={settings.textSpeed} onPick={(v) => set({ textSpeed: v })} />
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Sound</span>
          <Toggle on={settings.sound} onToggle={() => set({ sound: !settings.sound })} />
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Reduced motion</span>
          <Toggle on={settings.reducedMotion} onToggle={() => set({ reducedMotion: !settings.reducedMotion })} />
        </div>
      </div>
    </div>
  );
}

export { SPEEDS };
