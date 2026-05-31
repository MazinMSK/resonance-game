import { useEffect, useRef } from "react";

// ─── SCENE ILLUSTRATIONS (animated canvas) ───────────────────────────────────

export const SceneArt = ({ type, animate }) => {
  const canvasRef = useRef(null);
  const frameRef = useRef(0);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;

    const drawHospital = (t) => {
      ctx.clearRect(0, 0, W, H);
      // Dark room gradient
      const bg = ctx.createRadialGradient(W/2, H*0.4, 20, W/2, H/2, W*0.7);
      bg.addColorStop(0, "rgba(30,20,15,1)");
      bg.addColorStop(1, "rgba(5,5,10,1)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
      // Window light
      ctx.fillStyle = "rgba(180,200,255,0.04)";
      ctx.fillRect(W*0.65, 0, W*0.2, H*0.5);
      // Bed silhouette
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.fillRect(W*0.15, H*0.55, W*0.7, H*0.08);
      ctx.fillRect(W*0.15, H*0.45, W*0.7, H*0.12);
      // Heart monitor line
      ctx.strokeStyle = `rgba(100,220,150,${0.5 + Math.sin(t*0.03)*0.2})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      const beats = [0, 0.3, 0.35, 0.28, 0.5, 0.5, 0.5, 0.65, 0.7, 0.6, 0.8, 0.8, 1];
      for (let i = 0; i < 120; i++) {
        const x = W*0.1 + (i/120)*W*0.8;
        const phase = (i/120 + t*0.005) % 1;
        const seg = Math.floor(phase * (beats.length-1));
        const frac = (phase * (beats.length-1)) % 1;
        let y = H*0.3;
        if (seg === 3) y = H*(0.3 - 0.12*Math.sin(frac*Math.PI));
        else if (seg === 4) y = H*(0.3 + 0.06*Math.sin(frac*Math.PI));
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      // Stars through window
      for (let i = 0; i < 12; i++) {
        const sx = W*0.67 + (i%4)*W*0.04;
        const sy = H*0.05 + Math.floor(i/4)*H*0.12;
        const brightness = 0.3 + Math.sin(t*0.02 + i)*0.2;
        ctx.fillStyle = `rgba(200,210,255,${brightness})`;
        ctx.beginPath();
        ctx.arc(sx, sy, 1, 0, Math.PI*2);
        ctx.fill();
      }
      // Halima's hands - soft glow
      const hg = ctx.createRadialGradient(W/2, H*0.5, 0, W/2, H*0.5, W*0.15);
      hg.addColorStop(0, "rgba(201,169,110,0.08)");
      hg.addColorStop(1, "transparent");
      ctx.fillStyle = hg;
      ctx.fillRect(0,0,W,H);
    };

    const drawPyramid = (t) => {
      ctx.clearRect(0, 0, W, H);
      // Night sky
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, "#010208");
      sky.addColorStop(0.6, "#050a15");
      sky.addColorStop(1, "#0a1020");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);
      // Stars
      for (let i = 0; i < 80; i++) {
        const x = ((i * 137.5 + 30) % W);
        const y = ((i * 97.3 + 10) % (H * 0.65));
        const twinkle = 0.4 + Math.sin(t * 0.02 + i * 0.7) * 0.3;
        const size = i % 7 === 0 ? 1.5 : 0.8;
        ctx.fillStyle = `rgba(220,225,255,${twinkle})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
      // Milky way
      for (let i = 0; i < 200; i++) {
        const x = W*0.1 + (i/200)*W*0.8 + Math.sin(i*0.3)*20;
        const y = H*0.1 + Math.sin(i*0.05)*H*0.2;
        ctx.fillStyle = `rgba(180,190,255,${0.05 + Math.random()*0.05})`;
        ctx.fillRect(x, y, 1, 1);
      }
      // Pyramid
      ctx.fillStyle = "rgba(15,10,5,1)";
      ctx.beginPath();
      ctx.moveTo(W*0.5, H*0.28);
      ctx.lineTo(W*0.05, H*0.78);
      ctx.lineTo(W*0.95, H*0.78);
      ctx.closePath();
      ctx.fill();
      // Pyramid edge glow
      ctx.strokeStyle = `rgba(201,169,110,${0.3 + Math.sin(t*0.015)*0.1})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(W*0.5, H*0.28);
      ctx.lineTo(W*0.05, H*0.78);
      ctx.moveTo(W*0.5, H*0.28);
      ctx.lineTo(W*0.95, H*0.78);
      ctx.stroke();
      // Ground
      ctx.fillStyle = "rgba(12,8,4,1)";
      ctx.fillRect(0, H*0.78, W, H*0.22);
      // Glowing hieroglyph lines
      const pulse = 0.4 + Math.sin(t*0.02)*0.3;
      ctx.strokeStyle = `rgba(201,169,110,${pulse*0.6})`;
      ctx.lineWidth = 0.5;
      for (let i = 0; i < 5; i++) {
        const ly = H*0.45 + i*H*0.05;
        const lx1 = W*0.35 + Math.sin(i)*W*0.02;
        ctx.beginPath();
        ctx.moveTo(lx1, ly);
        ctx.lineTo(lx1 + W*0.3, ly);
        ctx.stroke();
      }
      // Apex star
      const ag = ctx.createRadialGradient(W*0.5, H*0.28, 0, W*0.5, H*0.28, 30);
      ag.addColorStop(0, `rgba(201,169,110,${0.6+Math.sin(t*0.03)*0.3})`);
      ag.addColorStop(1, "transparent");
      ctx.fillStyle = ag;
      ctx.fillRect(0, 0, W, H);
    };

    const drawNeural = (t) => {
      ctx.clearRect(0, 0, W, H);
      const bg = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W*0.7);
      bg.addColorStop(0, "#040810");
      bg.addColorStop(1, "#010205");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
      // Neural nodes
      const nodes = [];
      for (let i = 0; i < 18; i++) {
        const angle = (i / 18) * Math.PI * 2 + t * 0.003;
        const r = 60 + (i % 3) * 35;
        const drift = Math.sin(t * 0.01 + i) * 8;
        nodes.push({
          x: W/2 + Math.cos(angle) * r + drift,
          y: H/2 + Math.sin(angle) * r * 0.6 + drift * 0.5,
          pulse: 0.3 + Math.sin(t * 0.02 + i * 1.1) * 0.25,
        });
      }
      // Central node
      nodes.push({ x: W/2, y: H/2, pulse: 0.8 + Math.sin(t*0.025)*0.2, central: true });
      // Draw connections
      for (let i = 0; i < nodes.length - 1; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 110) {
            const alpha = (1 - dist/110) * 0.15 * nodes[i].pulse;
            ctx.strokeStyle = `rgba(126,200,200,${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }
      // Draw nodes
      nodes.forEach(n => {
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.central ? 20 : 8);
        g.addColorStop(0, n.central ? `rgba(201,169,110,${n.pulse})` : `rgba(126,200,200,${n.pulse})`);
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.central ? 20 : 8, 0, Math.PI * 2);
        ctx.fill();
      });
      // Scanning line
      const scanY = (H * ((t * 0.5) % H)) / H;
      const scanGrad = ctx.createLinearGradient(0, scanY - 2, 0, scanY + 2);
      scanGrad.addColorStop(0, "transparent");
      scanGrad.addColorStop(0.5, "rgba(126,200,200,0.1)");
      scanGrad.addColorStop(1, "transparent");
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, scanY, W, 4);
    };

    const drawDesertDawn = (t) => {
      ctx.clearRect(0, 0, W, H);
      const dawn = t % 600;
      const dawnFrac = dawn / 600;
      // Sky gradient - cycles from night to dawn
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      const r1 = Math.floor(5 + dawnFrac * 40);
      const g1 = Math.floor(5 + dawnFrac * 20);
      const b1 = Math.floor(15 + dawnFrac * 30);
      sky.addColorStop(0, `rgb(${r1},${g1},${b1})`);
      sky.addColorStop(0.5, `rgba(${r1+20},${g1+30},${b1+10},1)`);
      sky.addColorStop(1, `rgba(${20+dawnFrac*100},${10+dawnFrac*60},${5+dawnFrac*10},1)`);
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);
      // Horizon glow
      const sunX = W * 0.5, sunY = H * (0.62 - dawnFrac * 0.1);
      const sg = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, W*0.5);
      sg.addColorStop(0, `rgba(255,${180+dawnFrac*60},${50+dawnFrac*100},${0.15+dawnFrac*0.3})`);
      sg.addColorStop(0.3, `rgba(201,120,30,${0.1+dawnFrac*0.15})`);
      sg.addColorStop(1, "transparent");
      ctx.fillStyle = sg;
      ctx.fillRect(0, 0, W, H);
      // Stars fading
      for (let i = 0; i < 40; i++) {
        const sx = (i * 173 + 50) % W;
        const sy = (i * 89 + 20) % (H * 0.5);
        const fade = Math.max(0, (1 - dawnFrac * 3) * (0.3 + Math.sin(t*0.02+i)*0.2));
        ctx.fillStyle = `rgba(220,225,255,${fade})`;
        ctx.beginPath();
        ctx.arc(sx, sy, 0.8, 0, Math.PI*2);
        ctx.fill();
      }
      // Desert dunes
      ctx.fillStyle = `rgba(${8+dawnFrac*30},${5+dawnFrac*15},${3+dawnFrac*5},1)`;
      ctx.beginPath();
      ctx.moveTo(0, H*0.62);
      for (let x = 0; x <= W; x += 5) {
        const y = H*0.62 + Math.sin(x*0.012)*H*0.04 + Math.sin(x*0.007+1)*H*0.03;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
      ctx.fill();
      // House silhouette
      ctx.fillStyle = "rgba(5,3,2,0.95)";
      ctx.fillRect(W*0.35, H*0.48, W*0.3, H*0.15);
      ctx.beginPath();
      ctx.moveTo(W*0.32, H*0.48);
      ctx.lineTo(W*0.5, H*0.36);
      ctx.lineTo(W*0.68, H*0.48);
      ctx.closePath();
      ctx.fill();
      // Window warm light
      const winAlpha = 0.3 + Math.sin(t*0.04)*0.1;
      ctx.fillStyle = `rgba(201,169,110,${winAlpha})`;
      ctx.fillRect(W*0.44, H*0.52, W*0.05, H*0.06);
      ctx.fillRect(W*0.51, H*0.52, W*0.05, H*0.06);
    };

    const drawArchive = (t) => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#020408";
      ctx.fillRect(0, 0, W, H);
      // Concentric rings
      for (let i = 0; i < 8; i++) {
        const r = 20 + i * 28 + Math.sin(t*0.015 + i*0.5)*5;
        const alpha = (0.4 - i*0.04) * (0.5 + Math.sin(t*0.02+i)*0.3);
        ctx.strokeStyle = i % 2 === 0
          ? `rgba(201,169,110,${alpha})`
          : `rgba(126,200,200,${alpha*0.6})`;
        ctx.lineWidth = i === 0 ? 2 : 1;
        ctx.beginPath();
        ctx.arc(W/2, H/2, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      // Rotating inner symbol
      ctx.save();
      ctx.translate(W/2, H/2);
      ctx.rotate(t * 0.005);
      ctx.strokeStyle = `rgba(201,169,110,${0.5+Math.sin(t*0.02)*0.2})`;
      ctx.lineWidth = 1;
      for (let i = 0; i < 6; i++) {
        const a = (i/6)*Math.PI*2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a)*18, Math.sin(a)*18);
        ctx.stroke();
      }
      ctx.restore();
      // Floating memory fragments
      for (let i = 0; i < 12; i++) {
        const angle = (i/12)*Math.PI*2 + t*0.008*(i%2===0?1:-1);
        const r = 70 + (i%3)*30 + Math.sin(t*0.01+i)*10;
        const x = W/2 + Math.cos(angle)*r;
        const y = H/2 + Math.sin(angle)*r*0.7;
        const glow = 0.2 + Math.sin(t*0.03+i*0.8)*0.15;
        ctx.fillStyle = `rgba(180,210,220,${glow})`;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI*2);
        ctx.fill();
        // Connection line to center
        ctx.strokeStyle = `rgba(126,200,200,${glow*0.3})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(W/2, H/2);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
      // Central glow
      const cg = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, 25);
      cg.addColorStop(0, `rgba(201,169,110,${0.8+Math.sin(t*0.025)*0.2})`);
      cg.addColorStop(0.5, `rgba(201,169,110,0.3)`);
      cg.addColorStop(1, "transparent");
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.arc(W/2, H/2, 25, 0, Math.PI*2);
      ctx.fill();
    };

    const drawTender = (t) => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#020508";
      ctx.fillRect(0, 0, W, H);
      // Expanding wave rings - the universe being moved
      for (let i = 0; i < 5; i++) {
        const phase = (t * 0.008 + i * 0.4) % 1;
        const r = phase * W * 0.8;
        const alpha = (1 - phase) * 0.4;
        ctx.strokeStyle = `rgba(201,169,110,${alpha})`;
        ctx.lineWidth = 2 - phase * 1.5;
        ctx.beginPath();
        ctx.arc(W/2, H/2, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      // Stars - all gently brightening
      for (let i = 0; i < 60; i++) {
        const sx = (i * 137.5) % W;
        const sy = (i * 89.3) % H;
        const bright = 0.2 + Math.sin(t * 0.01 + i * 0.3) * 0.15 + (t * 0.0003);
        const size = i % 9 === 0 ? 2 : 1;
        ctx.fillStyle = `rgba(220,235,255,${Math.min(bright, 0.8)})`;
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fill();
      }
      // Central warmth - the tenderness
      const wg = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W*0.5);
      const warmth = 0.05 + Math.sin(t * 0.01) * 0.03;
      wg.addColorStop(0, `rgba(255,220,150,${warmth * 3})`);
      wg.addColorStop(0.3, `rgba(201,169,110,${warmth})`);
      wg.addColorStop(1, "transparent");
      ctx.fillStyle = wg;
      ctx.fillRect(0, 0, W, H);
      // Prayer beads orbit
      for (let i = 0; i < 33; i++) {
        const angle = (i / 33) * Math.PI * 2 + t * 0.004;
        const r = 55 + Math.sin(t*0.01+i)*3;
        const x = W/2 + Math.cos(angle) * r;
        const y = H/2 + Math.sin(angle) * r * 0.5;
        const a = 0.3 + Math.sin(t*0.02+i)*0.15;
        ctx.fillStyle = `rgba(201,169,110,${a})`;
        ctx.beginPath();
        ctx.arc(x, y, i % 11 === 0 ? 3 : 1.5, 0, Math.PI*2);
        ctx.fill();
      }
    };

    const artMap = {
      hospital: drawHospital,
      pyramid: drawPyramid,
      neural: drawNeural,
      desert: drawDesertDawn,
      archive: drawArchive,
      tender: drawTender,
    };
    const drawFn = artMap[type] || drawArchive;

    const loop = () => {
      frameRef.current++;
      drawFn(frameRef.current);
      animRef.current = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(animRef.current);
  }, [type]);

  return (
    <canvas
      ref={canvasRef}
      width={280}
      height={180}
      style={{
        width: "100%",
        maxWidth: 280,
        height: "auto",
        borderRadius: 4,
        opacity: animate ? 1 : 0.6,
        transition: "opacity 1s ease",
        display: "block",
      }}
    />
  );
};
