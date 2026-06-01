import { useState, useEffect, useRef, useMemo } from "react";
import { SCENES } from "./content/scenes";
import { START_SCENE, resonanceColorFor } from "./engine/constants";
import { useTypewriter } from "./engine/useTypewriter";
import { useGameState, hasSave } from "./engine/useGameState";
import { useSettings } from "./engine/useSettings";
import { useProgress } from "./engine/useProgress";
import { useParallax } from "./engine/useParallax";
import { useAudio, unlockAudio } from "./engine/useAudio";
import { ENDING_IDS } from "./engine/endings";
import { TitleScreen } from "./components/TitleScreen";
import { StoryView } from "./components/StoryView";
import { SettingsPanel } from "./components/SettingsPanel";
import { ConstellationMap } from "./components/ConstellationMap";
import { AchievementToast } from "./components/AchievementToast";
import { ParallaxLayer } from "./art/ParallaxLayer";

// ─── MAIN GAME ORCHESTRATOR ──────────────────────────────────────────────────
// Owns transient UI state and delegates durable progress to hooks: useGameState
// (run save), useSettings (prefs), useProgress (achievements/endings). Wires in
// the atmospheric layers (audio, parallax) and the new modals.

const ENDING_SET = new Set(ENDING_IDS);

export default function ResonanceArchiveGame() {
  const game = useGameState();
  const {
    sceneId, memories, resonance, history, resonantWords,
    goToScene, addMemory, addResonance, revealWord, reset, resume,
  } = game;

  const [settings, setSettings] = useSettings();
  const progress = useProgress();

  const [parIdx, setParIdx] = useState(0);
  const [showChoices, setShowChoices] = useState(false);
  const [showMemories, setShowMemories] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [choiceFlash, setChoiceFlash] = useState(null);
  const [modal, setModal] = useState(null); // 'settings' | 'constellation'
  const [wordGloss, setWordGloss] = useState(null); // { gloss } currently shown
  const [resumeAvailable] = useState(() => hasSave());
  const scrollRef = useRef(null);

  const scene = SCENES[sceneId];
  const currentPar = scene.text[parIdx] || "";
  const { displayed, done, skip } = useTypewriter(currentPar, settings.textSpeed);

  const tilt = useParallax(settings.reducedMotion);
  const { sfx } = useAudio({
    mood: scene.art,
    enabled: settings.sound,
    active: !scene.isTitle,
  });

  const foundWords = useMemo(() => new Set(resonantWords), [resonantWords]);

  // Reset transient view state whenever the scene changes.
  useEffect(() => {
    setParIdx(0);
    setShowChoices(false);
    setWordGloss(null);
  }, [sceneId]);

  // Reveal choices once the final paragraph finishes; award memory + resonance.
  useEffect(() => {
    if (done && parIdx >= scene.text.length - 1) {
      const t = setTimeout(() => {
        setShowChoices(true);
        if (scene.memoryGain) { addMemory(scene.memoryGain); sfx("memory"); }
        if (scene.resonanceGain) addResonance(scene.resonanceGain);
      }, 500);
      return () => clearTimeout(t);
    }
  }, [done, parIdx, scene, addMemory, addResonance, sfx]);

  // Evaluate achievements / endings from a snapshot of the live run.
  useEffect(() => {
    if (scene.isTitle) return;
    progress.evaluate({
      memories,
      resonance,
      visitedCount: new Set(history).size,
      atEnding: ENDING_SET.has(sceneId),
      sceneId,
    });
  }, [sceneId, memories, resonance, history]); // eslint-disable-line react-hooks/exhaustive-deps

  const advance = () => {
    if (!done) { skip(); return; }
    if (parIdx < scene.text.length - 1) {
      setParIdx((p) => p + 1);
      setShowChoices(false);
      setWordGloss(null);
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), 100);
    }
  };

  const choose = (choice, idx) => {
    if (transitioning) return;
    sfx("choice");
    setChoiceFlash(idx);
    setTransitioning(true);
    if (choice.resonance) addResonance(choice.resonance);
    setTimeout(() => {
      setChoiceFlash(null);
      if (choice.isRestart) reset();
      else goToScene(choice.next);
      setTransitioning(false);
    }, 600);
  };

  // A resonant word was tapped: show its gloss; grant a one-time bump + SFX.
  const onRevealWord = (entry) => {
    const firstTime = revealWord(entry.id, 2);
    setWordGloss({ id: entry.id, gloss: entry.gloss });
    sfx(firstTime ? "reveal" : "open");
  };

  const beginPlay = (fn) => { unlockAudio(); fn(); };

  const resonancePct = Math.round(resonance);
  const resonanceColor = resonanceColorFor(resonance);

  return (
    <>
      {!scene.isTitle && <ParallaxLayer tilt={tilt} reducedMotion={settings.reducedMotion} />}

      {scene.isTitle ? (
        <TitleScreen
          scene={scene}
          choose={(c, i) => beginPlay(() => choose(c, i))}
          canContinue={resumeAvailable && sceneId === START_SCENE}
          onContinue={() => beginPlay(resume)}
          onOpenSettings={() => setModal("settings")}
          onOpenConstellation={() => setModal("constellation")}
          achievements={progress.achievements}
          endingsFound={progress.endings}
        />
      ) : (
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
          tilt={tilt}
          reducedMotion={settings.reducedMotion}
          foundWords={foundWords}
          wordGloss={wordGloss}
          onRevealWord={onRevealWord}
          onDismissGloss={() => setWordGloss(null)}
          onAdvance={advance}
          onSkip={skip}
          onChoose={choose}
          onToggleMemories={() => setShowMemories((m) => !m)}
          onHome={() => goToScene(START_SCENE)}
          onOpenSettings={() => setModal("settings")}
          onOpenConstellation={() => setModal("constellation")}
        />
      )}

      {modal === "settings" && (
        <SettingsPanel settings={settings} onChange={setSettings} onClose={() => setModal(null)} />
      )}
      {modal === "constellation" && (
        <ConstellationMap collected={memories} endingsFound={progress.endings} onClose={() => setModal(null)} />
      )}

      {progress.toast && (
        <AchievementToast
          id={progress.toast}
          onMount={() => sfx("achieve")}
          onDone={progress.dismissToast}
        />
      )}
    </>
  );
}
