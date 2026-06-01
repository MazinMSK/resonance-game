import { useEffect, useRef } from "react";

// A faint full-bleed particle/vignette layer that sits behind the scene content
// and drifts with the parallax tilt for depth. Pure ambience: pointer-events
// none, aria-hidden. Renders a single static frame when reducedMotion is set.
export function ParallaxLayer({ tilt, reducedMotion }) {
  const canvasRef = useRef(null);
  const tiltRef = useRef(tilt);
  const raf = useRef(null);
  const parts = useRef([]);

  useEffect(() => { tiltRef.current = tilt; }, [tilt]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    let w = 0, h = 0;

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      const n = Math.min(70, Math.floor((w * h) / 26000));
      parts.current = Array.from({ length: n }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        r: Math.random() * 1.4 + 0.3,
        vx: (Math.random() - 0.5) * 0.12, vy: (Math.random() - 0.5) * 0.12,
        o: Math.random() * 0.4 + 0.1,
      }));
    };
    resize();
    window.addEventListener("resize", resize);

    const paintVignette = () => {
      const g = ctx.createRadialGradient(w / 2, h * 0.42, 40, w / 2, h / 2, Math.max(w, h) * 0.7);
      g.addColorStop(0, "rgba(201,169,110,0.04)");
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    };

    const frame = () => {
      ctx.clearRect(0, 0, w, h);
      paintVignette();
      const t = tiltRef.current || { x: 0, y: 0 };
      const ox = t.x * 14, oy = t.y * 14;
      parts.current.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x + ox, p.y + oy, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,200,220,${p.o})`;
        ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
      });
      raf.current = requestAnimationFrame(frame);
    };

    if (reducedMotion) {
      paintVignette();
    } else {
      raf.current = requestAnimationFrame(frame);
    }

    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(raf.current); };
  }, [reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
    />
  );
}
