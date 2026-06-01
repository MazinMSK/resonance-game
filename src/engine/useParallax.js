import { useState, useEffect } from "react";

// Returns {x, y} roughly in [-1, 1], driven by mouse on desktop and device
// tilt on touch devices. Used for subtle scene parallax. When reducedMotion is
// true (setting or OS preference) it stays centered and attaches no listeners.
export function useParallax(reducedMotion) {
  const [t, setT] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (reducedMotion) { setT({ x: 0, y: 0 }); return undefined; }

    const onMouse = (e) => {
      setT({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      });
    };
    const onOrient = (e) => {
      const x = Math.max(-1, Math.min(1, (e.gamma || 0) / 35)); // left-right
      const y = Math.max(-1, Math.min(1, ((e.beta || 0) - 45) / 35)); // front-back
      setT({ x, y });
    };

    const touch = "ontouchstart" in window;
    if (touch && window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", onOrient);
    } else {
      window.addEventListener("mousemove", onMouse);
    }
    return () => {
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("deviceorientation", onOrient);
    };
  }, [reducedMotion]);

  return t;
}
