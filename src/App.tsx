/**
 * Star Wars: X-Wing Intercept - Main Application Container
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/engine';
import { GameStats, PilotCallsign, Difficulty } from './game/types';
import { sound } from './audio/soundController';
import { HUD } from './components/HUD';
import { StartModal, PauseModal, GameOverModal } from './components/Modals';
import { Maximize2, Minimize2 } from 'lucide-react';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // UI State
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameover'>('menu');
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    highScore: 0,
    shield: 100,
    maxShield: 100,
    torpedoes: 3,
    wave: 1,
    kills: 0,
    shotsFired: 0,
    shotsHit: 0,
    combo: 0,
    maxCombo: 0,
    comboTimer: 0,
  });

  const [selectedPilot, setSelectedPilot] = useState<PilotCallsign>('red-five');
  const [difficulty, setDifficulty] = useState<Difficulty>('veteran');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [volume, setVolume] = useState<number>(0.7);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [waveAnnouncement, setWaveAnnouncement] = useState<{ wave: number; title: string } | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);

  // Initialize Engine
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);

    if (!canvasRef.current) return;

    const engine = new GameEngine(canvasRef.current, {
      onStatsChange: (newStats) => {
        setStats(newStats);
      },
      onGameOver: (finalStats) => {
        setStats(finalStats);
        setGameState('gameover');
      },
      onWaveAnnouncement: (wave, title) => {
        setWaveAnnouncement({ wave, title });
        setTimeout(() => {
          setWaveAnnouncement(null);
        }, 2800);
      },
    });

    engineRef.current = engine;

    // Load initial highscore into state
    try {
      const saved = localStorage.getItem('sw_xwing_highscore');
      if (saved) {
        setStats(prev => ({ ...prev, highScore: parseInt(saved, 10) || 0 }));
      }
    } catch {}

    const handleResize = () => {
      engine.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.stop();
    };
  }, []);

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent scrolling on Space / Arrows
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      if (e.code === 'KeyP' || e.code === 'Escape') {
        if (gameState === 'playing') {
          engineRef.current?.pause();
          setGameState('paused');
        } else if (gameState === 'paused') {
          engineRef.current?.resume();
          setGameState('playing');
        }
        return;
      }

      engineRef.current?.handleKeyDown(e.code);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      engineRef.current?.handleKeyUp(e.code);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  // Pointer / Mouse / Touch Handlers on Canvas
  const getCanvasCoords = useCallback((clientX: number, clientY: number) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    sound.init();
    if (!engineRef.current) return;
    const { x, y } = getCanvasCoords(e.clientX, e.clientY);
    engineRef.current.isPointerDown = true;
    engineRef.current.handlePointerMove(x, y);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!engineRef.current || !engineRef.current.isPointerDown) return;
    const { x, y } = getCanvasCoords(e.clientX, e.clientY);
    engineRef.current.handlePointerMove(x, y);
  };

  const handlePointerUp = () => {
    if (!engineRef.current) return;
    engineRef.current.isPointerDown = false;
  };

  // Actions
  const handleStartGame = (pilot: PilotCallsign, diff: Difficulty) => {
    sound.init();
    setGameState('playing');
    engineRef.current?.start(pilot, diff);
  };

  const handleToggleSound = () => {
    sound.init();
    const enabled = sound.toggleMute();
    setSoundEnabled(enabled);
  };

  const handleChangeVolume = (vol: number) => {
    setVolume(vol);
    sound.setVolume(vol);
  };

  const handleTogglePause = () => {
    if (gameState === 'playing') {
      engineRef.current?.pause();
      setGameState('paused');
    } else if (gameState === 'paused') {
      engineRef.current?.resume();
      setGameState('playing');
    }
  };

  const handleFireTorpedo = () => {
    engineRef.current?.fireTorpedo();
  };

  const handleShieldBoost = () => {
    engineRef.current?.triggerShieldBoost();
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div className="relative w-screen h-screen bg-[#020307] flex items-center justify-center overflow-hidden">
      {/* Game Frame Container */}
      <div
        ref={containerRef}
        className="relative w-full h-full max-w-[560px] max-h-[960px] bg-slate-950 sm:rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,180,255,0.25)] border sm:border-cyan-500/40"
      >
        {/* Canvas Element */}
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="w-full h-full block cursor-crosshair touch-none select-none"
        />

        {/* Scanlines Effect Overlay */}
        <div className="absolute inset-0 scanlines opacity-40 pointer-events-none" />

        {/* Fullscreen Button */}
        <button
          onClick={handleToggleFullscreen}
          title={isFullscreen ? '退出全螢幕' : '全螢幕遊戲'}
          className="absolute bottom-3 left-3 z-20 w-8 h-8 rounded-lg bg-slate-900/70 border border-slate-700/80 text-slate-400 hover:text-cyan-300 flex items-center justify-center transition-colors cursor-pointer backdrop-blur"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* Cockpit HUD */}
        {gameState === 'playing' && (
          <HUD
            stats={stats}
            isPaused={false}
            soundEnabled={soundEnabled}
            onToggleSound={handleToggleSound}
            onTogglePause={handleTogglePause}
            onFireTorpedo={handleFireTorpedo}
            onShieldBoost={handleShieldBoost}
            waveAnnouncement={waveAnnouncement}
            isTouchDevice={isTouchDevice}
          />
        )}

        {/* Start Modal */}
        {gameState === 'menu' && (
          <StartModal
            onStart={handleStartGame}
            selectedPilot={selectedPilot}
            setSelectedPilot={setSelectedPilot}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            highScore={stats.highScore}
          />
        )}

        {/* Pause Modal */}
        {gameState === 'paused' && (
          <PauseModal
            onResume={handleTogglePause}
            onRestart={() => handleStartGame(selectedPilot, difficulty)}
            soundEnabled={soundEnabled}
            onToggleSound={handleToggleSound}
            volume={volume}
            onChangeVolume={handleChangeVolume}
          />
        )}

        {/* Game Over Modal */}
        {gameState === 'gameover' && (
          <GameOverModal
            stats={stats}
            onRestart={() => handleStartGame(selectedPilot, difficulty)}
            onOpenPilotSelect={() => setGameState('menu')}
          />
        )}
      </div>
    </div>
  );
}
