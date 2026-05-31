import { useState, useEffect, useRef } from "react";
import { SCENES } from "./content/scenes";
import { TYPING_SPEED, START_SCENE, resonanceColorFor } from "./engine/constants";
import { useTypewriter } from "./engine/useTypewriter";
import { useGameState, hasSave } from "./engine/useGameState";
import { TitleScreen } from "./components/TitleScreen";
import { StoryView } from "./components/StoryView";

// ─── MAIN GAME ORCHESTRATOR ──────────────────────────────────────────────────
// Owns transient UI state (paragraph index, transitions) and delegates durable
// progress (scene, memories, resonance) to the persistent useGameState hook.

export default function ResonanceArchiveGame() {
  const game = useGameState();
  const { sceneId, memories, resonance, goToScene, addMemory, addResonance, reset, resume } = game;

  const [parIdx, setParIdx] = useState(0);
  const [showChoices, setShowChoices] = useState(false);
  const [showMemories, setShowMemories] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [choiceFlash, setChoiceFlash] = useState(null);
  const [resumeAvailable] = useState(() => hasSave());
  const scrollRef = useRef(null);

  const scene = SCENES[sceneId];
  const currentPar = scene.text[parIdx] || "";
  const { displayed, done, skip } = useTypewriter(currentPar, TYPING_SPEED);

  // Reset transient view state whenever the scene changes.
  useEffect(() => {
    setParIdx(0);
    setShowChoices(false);
  }, [sceneId]);

  // Reveal choices once the final paragraph finishes; award memory + resonance.
  useEffect(() => {
    if (done && parIdx >= scene.text.length - 1) {
      const t = setTimeout(() => {
        setShowChoices(true);
        if (scene.memoryGain) addMemory(scene.memoryGain);
        if (scene.resonanceGain) addResonance(scene.resonanceGain);
      }, 500);
      return () => clearTimeout(t);
    }
  }, [done, parIdx, scene, addMemory, addResonance]);

  const advance = () => {
    if (!done) { skip(); return; }
    if (parIdx < scene.text.length - 1) {
      setParIdx((p) => p + 1);
      setShowChoices(false);
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), 100);
    }
  };

  const choose = (choice, idx) => {
    if (transitioning) return;
    setChoiceFlash(idx);
    setTransitioning(true);
    if (choice.resonance) addResonance(choice.resonance);
    setTimeout(() => {
      setChoiceFlash(null);
      if (choice.isRestart) {
        reset();
      } else {
        goToScene(choice.next);
      }
      setTransitioning(false);
    }, 600);
  };

  const resonancePct = Math.round(resonance);
  const resonanceColor = resonanceColorFor(resonance);

  if (scene.isTitle) {
    return (
      <TitleScreen
        scene={scene}
        choose={choose}
        canContinue={resumeAvailable && sceneId === START_SCENE}
        onContinue={resume}
      />
    );
  }

  return (
    <StoryView
      scene={scene}
      parIdx={parIdx}
      displayed={displayed}
      done={done}
      showChoices={showChoices}
      showMemories={showMemories}
      memories={memories}
      resonancePct={resonancePct}
      resonanceColor={resonanceColor}
      choiceFlash={choiceFlash}
      transitioning={transitioning}
      scrollRef={scrollRef}
      onAdvance={advance}
      onSkip={skip}
      onChoose={choose}
      onToggleMemories={() => setShowMemories((m) => !m)}
      onHome={() => goToScene(START_SCENE)}
    />
  );
}
