/**
 * Star Wars X-Wing Intercept - Cockpit Tactical HUD
 */

import React from 'react';
import { Volume2, VolumeX, Pause, Play, ShieldAlert, Sparkles, Rocket, Zap } from 'lucide-react';
import { GameStats } from '../game/types';

interface HUDProps {
  stats: GameStats;
  isPaused: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onTogglePause: () => void;
  onFireTorpedo: () => void;
  onShieldBoost: () => void;
  waveAnnouncement: { wave: number; title: string } | null;
  isTouchDevice: boolean;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  isPaused,
  soundEnabled,
  onToggleSound,
  onTogglePause,
  onFireTorpedo,
  onShieldBoost,
  waveAnnouncement,
  isTouchDevice,
}) => {
  const shieldPercent = Math.max(0, Math.round((stats.shield / stats.maxShield) * 100));
  const isLowShield = shieldPercent <= 25;

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-10 flex flex-col justify-between p-3 sm:p-5">
      {/* Wave Announcement Banner */}
      {waveAnnouncement && (
        <div className="absolute top-20 left-0 right-0 flex justify-center items-center pointer-events-none z-30 animate-pulse">
          <div className="bg-gradient-to-r from-transparent via-cyan-950/80 to-transparent border-y border-cyan-500/50 px-8 py-2.5 text-center backdrop-blur-sm shadow-[0_0_20px_rgba(0,240,255,0.3)]">
            <div className="text-[11px] tracking-[4px] text-cyan-400 font-mono uppercase">
              Incoming Sector Threat
            </div>
            <div className="text-xl sm:text-2xl font-bold tracking-[2px] text-yellow-300 font-display glow-yellow">
              {waveAnnouncement.title}
            </div>
          </div>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="flex items-start justify-between gap-3 w-full">
        {/* Left: Score & High Score */}
        <div className="flex flex-col bg-slate-950/70 border border-cyan-500/40 rounded-lg p-2.5 backdrop-blur-md shadow-[0_0_15px_rgba(0,240,255,0.15)] min-w-[130px]">
          <div className="flex items-center justify-between text-[10px] tracking-wider text-cyan-400 font-tech uppercase">
            <span>SCORE</span>
            <span className="text-slate-400">HI: {stats.highScore.toLocaleString()}</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-yellow-300 font-display glow-yellow tracking-wider">
            {stats.score.toLocaleString()}
          </div>
          {stats.combo > 1 && (
            <div className="flex items-center gap-1.5 mt-1 text-[11px] font-bold text-amber-400 font-tech">
              <span className="px-1.5 py-0.2 bg-amber-500/20 border border-amber-400/50 rounded text-[10px]">
                COMBO x{Math.min(5, Math.floor(stats.combo / 3) + 1)}
              </span>
              <span>{stats.combo} HITS</span>
            </div>
          )}
        </div>

        {/* Center: Wave & Sector Display */}
        <div className="hidden sm:flex flex-col items-center bg-slate-950/70 border border-cyan-500/40 rounded-lg px-4 py-1.5 backdrop-blur-md">
          <span className="text-[9px] tracking-[3px] text-cyan-400 font-tech uppercase">
            REBEL PATROL SECTOR
          </span>
          <span className="text-sm font-bold text-cyan-200 tracking-widest font-display">
            WAVE 0{stats.wave}
          </span>
        </div>

        {/* Right: Shield Gauge & System Actions */}
        <div className="flex items-start gap-2">
          {/* Deflector Shield Gauge */}
          <div
            className={`flex flex-col bg-slate-950/70 border rounded-lg p-2.5 backdrop-blur-md min-w-[140px] sm:min-w-[160px] transition-colors ${
              isLowShield
                ? 'border-red-500/80 shadow-[0_0_20px_rgba(255,0,0,0.3)] animate-pulse'
                : 'border-cyan-500/40 shadow-[0_0_15px_rgba(0,240,255,0.15)]'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] tracking-wider font-tech uppercase">
              <span className={isLowShield ? 'text-red-400 font-bold flex items-center gap-1' : 'text-cyan-400'}>
                {isLowShield && <ShieldAlert className="w-3 h-3 inline animate-bounce" />}
                SHIELDS
              </span>
              <span
                className={`font-bold ${
                  shieldPercent > 50 ? 'text-cyan-300' : shieldPercent > 25 ? 'text-yellow-400' : 'text-red-400'
                }`}
              >
                {shieldPercent}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2.5 bg-slate-900 border border-slate-700 rounded-full overflow-hidden mt-1.5 p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  shieldPercent > 50
                    ? 'bg-gradient-to-r from-cyan-400 to-emerald-400'
                    : shieldPercent > 25
                    ? 'bg-gradient-to-r from-yellow-400 to-amber-500'
                    : 'bg-gradient-to-r from-red-600 to-rose-400'
                }`}
                style={{ width: `${shieldPercent}%` }}
              />
            </div>

            {/* Torpedo count indicator */}
            <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-800 text-[10px] font-tech text-slate-300">
              <span className="flex items-center gap-1 text-pink-400">
                <Rocket className="w-2.5 h-2.5" /> TORPEDO:
              </span>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full border ${
                      idx < stats.torpedoes
                        ? 'bg-pink-500 border-pink-300 shadow-[0_0_6px_#ff007f]'
                        : 'bg-slate-800 border-slate-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Sound & Pause controls */}
          <div className="flex flex-col gap-1.5 pointer-events-auto">
            <button
              onClick={onToggleSound}
              title={soundEnabled ? '靜音 (Mute)' : '開啟音效 (Unmute)'}
              aria-label={soundEnabled ? '靜音' : '開啟音效'}
              className="w-8 h-8 rounded-lg bg-slate-900/80 border border-cyan-500/40 text-cyan-400 hover:text-cyan-200 hover:border-cyan-400 flex items-center justify-center transition-all cursor-pointer backdrop-blur active:scale-95"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-400" />}
            </button>

            <button
              onClick={onTogglePause}
              title={isPaused ? '繼續 (Resume)' : '暫停 (Pause)'}
              aria-label={isPaused ? '繼續' : '暫停'}
              className="w-8 h-8 rounded-lg bg-slate-900/80 border border-cyan-500/40 text-cyan-400 hover:text-cyan-200 hover:border-cyan-400 flex items-center justify-center transition-all cursor-pointer backdrop-blur active:scale-95"
            >
              {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Area: Controls & Mobile Buttons */}
      <div className="w-full flex items-end justify-between gap-4 pointer-events-auto">
        {/* Left: Keyboard shortcuts hint on desktop */}
        <div className="hidden md:flex flex-col text-[11px] font-tech text-slate-400 bg-slate-950/60 border border-slate-800/80 rounded-lg p-2 backdrop-blur-sm">
          <div><span className="text-cyan-400 font-bold">A / D / ← →</span> : 機動飛行</div>
          <div><span className="text-yellow-400 font-bold">SPACE</span> : 四聯裝雷射發射</div>
          <div><span className="text-pink-400 font-bold">X / E</span> : 質子魚雷 (剩餘 {stats.torpedoes})</div>
          <div><span className="text-emerald-400 font-bold">C / SHIFT</span> : 偏向護盾過載防護</div>
        </div>

        {/* Mobile / Touch Action Buttons */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Shield Overdrive Button */}
          <button
            onClick={onShieldBoost}
            className="flex flex-col items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-cyan-950/70 border-2 border-cyan-400 text-cyan-300 active:scale-90 active:bg-cyan-800/80 transition-all shadow-[0_0_15px_rgba(0,240,255,0.4)] cursor-pointer"
          >
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-[9px] font-tech font-bold mt-0.5">SHIELD</span>
          </button>

          {/* Proton Torpedo Button */}
          <button
            onClick={onFireTorpedo}
            disabled={stats.torpedoes <= 0}
            className={`flex flex-col items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 transition-all cursor-pointer ${
              stats.torpedoes > 0
                ? 'bg-pink-950/70 border-pink-500 text-pink-300 active:scale-90 active:bg-pink-800/80 shadow-[0_0_20px_rgba(255,0,127,0.5)]'
                : 'bg-slate-900/50 border-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Rocket className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-[9px] font-tech font-bold mt-0.5">
              TORP ({stats.torpedoes})
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
