import { useState, useEffect, useRef, useCallback } from "react";
import { TYPING_SPEED } from "./constants";

// Character-by-character reveal of a paragraph, with a skip() to jump to the end.
export function useTypewriter(text, speed = TYPING_SPEED) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const idx = useRef(0);
  const timer = useRef(null);
  useEffect(() => {
    setDisplayed("");
    setDone(false);
    idx.current = 0;
    clearInterval(timer.current);
    timer.current = setInterval(() => {
      if (idx.current < text.length) {
        setDisplayed(text.slice(0, idx.current + 1));
        idx.current++;
      } else {
        setDone(true);
        clearInterval(timer.current);
      }
    }, speed);
    return () => clearInterval(timer.current);
  }, [text, speed]);
  const skip = useCallback(() => {
    clearInterval(timer.current);
    setDisplayed(text);
    setDone(true);
    idx.current = text.length;
  }, [text]);
  return { displayed, done, skip };
}
