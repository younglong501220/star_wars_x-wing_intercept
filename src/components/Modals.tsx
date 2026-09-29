/**
 * Star Wars X-Wing Intercept - Mission Start, Pause & Debriefing Modals
 */

import React from 'react';
import {
  Trophy,
  RotateCcw,
  Play,
  Crosshair,
  Shield,
  Zap,
  Volume2,
  VolumeX,
  Target,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { PilotCallsign, Difficulty, GameStats, PilotProfile } from '../game/types';

export const PILOT_ROSTER: PilotProfile[] = [
  {
    id: 'red-five',
    name: '紅五 (Red Five)',
    callsign: 'Red Five',
    pilotName: 'Luke Skywalker (天行者路克)',
    perk: '均衡作戰機體，標準護盾與能量雷射配備',
    color: '#e84118',
  },
  {
    id: 'rogue-leader',
    name: '盜賊領袖 (Rogue Leader)',
    callsign: 'Rogue Leader',
    pilotName: 'Wedge Antilles (韋吉·安地列斯)',
    perk: '戰機巡航速度提高 20%，雷射射速冷卻加快',
    color: '#e67e22',
  },
  {
    id: 'gold-leader',
    name: '金隊領袖 (Gold Leader)',
    callsign: 'Gold Leader',
    pilotName: 'Keyan Farlander (重型轟炸中隊)',
    perk: '配備強化防護罩 (130% 護盾) 與 5 枚起始質子魚雷',
    color: '#f1c40f',
  },
  {
    id: 'phoenix-one',
    name: '鳳凰小隊 (Phoenix One)',
    callsign: 'Phoenix One',
    pilotName: 'Hera Syndulla (希拉·仙杜拉)',
    perk: '機動回轉靈活，高閃避率與敏銳目標鎖定',
    color: '#9b59b6',
  },
];

interface StartModalProps {
  onStart: (pilot: PilotCallsign, difficulty: Difficulty) => void;
  selectedPilot: PilotCallsign;
  setSelectedPilot: (p: PilotCallsign) => void;
  difficulty: Difficulty;
  setDifficulty: (d: Difficulty) => void;
  highScore: number;
}

export const StartModal: React.FC<StartModalProps> = ({
  onStart,
  selectedPilot,
  setSelectedPilot,
  difficulty,
  setDifficulty,
  highScore,
}) => {
  return (
    <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-40">
      <div className="w-full max-w-lg bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/95 border border-cyan-500/50 rounded-2xl p-5 sm:p-7 shadow-[0_0_40px_rgba(0,240,255,0.25)] flex flex-col gap-5 max-h-[92vh] overflow-y-auto">
        {/* Title & Crest */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-950/60 border border-red-500/40 rounded-full text-[11px] font-tech text-red-400 uppercase tracking-widest mb-2 shadow-[0_0_10px_rgba(255,0,0,0.3)]">
            <Crosshair className="w-3.5 h-3.5 animate-spin" /> 反抗軍同盟 星際攔截指令
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-widest text-yellow-300 font-display glow-yellow">
            STAR WARS
          </h1>
          <p className="text-sm sm:text-base font-bold text-red-400 tracking-[3px] font-display mt-0.5">
            X-WING INTERCEPT (X翼攔截戰)
          </p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            帝國鈦戰機艦隊與達斯·維達正在突襲外環星區！鎖定S-Foils攻擊展開，阻截所有帝國侵入者。
          </p>
        </div>

        {/* High Score Banner */}
        {highScore > 0 && (
          <div className="flex items-center justify-between px-3.5 py-2 bg-slate-950/80 border border-yellow-500/30 rounded-xl text-xs font-tech text-yellow-300">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Trophy className="w-3.5 h-3.5 text-yellow-400" /> 最高紀錄 (HIGH SCORE)
            </span>
            <span className="font-bold text-sm tracking-wider text-yellow-400">
              {highScore.toLocaleString()}
            </span>
          </div>
        )}

        {/* Pilot Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-tech tracking-wider text-cyan-400 uppercase">
            選擇作戰呼號與駕駛員 (Select Pilot Callsign):
          </label>
          <div className="grid grid-cols-2 gap-2">
            {PILOT_ROSTER.map(p => {
              const isSelected = selectedPilot === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPilot(p.id)}
                  className={`flex flex-col text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950/70 border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.3)] ring-1 ring-cyan-400'
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-100 font-display">
                      {p.callsign}
                    </span>
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: p.color }}
                    />
                  </div>
                  <span className="text-[10px] text-cyan-400/90 font-medium truncate mt-0.5">
                    {p.pilotName}
                  </span>
                  <span className="text-[9px] text-slate-400 mt-1 leading-snug">
                    {p.perk}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Controls Info Box */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-[11px] font-tech text-slate-300 space-y-1">
          <div className="text-cyan-400 font-bold mb-1 flex items-center gap-1">
            <Target className="w-3 h-3" /> 操作指令 (CONTROLS):
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[10px]">
            <div>• <strong className="text-white">電腦移動</strong>: 方向鍵 / A, D (滑鼠直接拖曳)</div>
            <div>• <strong className="text-white">主砲射擊</strong>: 空白鍵 Space (或自動連射)</div>
            <div>• <strong className="text-white">質子魚雷</strong>: 鍵盤 X / E (範圍震波爆炸)</div>
            <div>• <strong className="text-white">偏向護盾</strong>: 鍵盤 C / Shift (緊急過載修復)</div>
            <div className="col-span-full text-slate-400">• <strong className="text-cyan-300">手機/平板</strong>: 單指在螢幕滑動操控戰機，右下角按鈕施放魚雷與護盾</div>
          </div>
        </div>

        {/* Launch Button */}
        <button
          onClick={() => onStart(selectedPilot, difficulty)}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 text-white font-display font-bold text-base tracking-widest uppercase transition-all shadow-[0_0_25px_rgba(229,37,33,0.6)] active:scale-98 cursor-pointer flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5 fill-current" /> 展開機翼 迎擊開始 (LAUNCH INTERCEPT)
        </button>
      </div>
    </div>
  );
};

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  volume: number;
  onChangeVolume: (vol: number) => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  soundEnabled,
  onToggleSound,
  volume,
  onChangeVolume,
}) => {
  return (
    <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-40">
      <div className="w-full max-w-sm bg-slate-900 border border-cyan-500/50 rounded-2xl p-6 shadow-[0_0_30px_rgba(0,240,255,0.25)] flex flex-col gap-4 text-center">
        <h2 className="text-2xl font-bold tracking-widest text-cyan-400 font-display glow-cyan">
          MISSION PAUSED
        </h2>
        <p className="text-xs text-slate-400">
          戰術系統暫停中。隨時可以恢復戰鬥或調整音響設定。
        </p>

        {/* Audio Controls */}
        <div className="flex flex-col gap-2 p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs font-tech text-slate-300">
            <span>音效 (SOUND FX)</span>
            <button
              onClick={onToggleSound}
              className="p-1 text-cyan-400 hover:text-cyan-200 cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-400" />}
            </button>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={e => onChangeVolume(parseFloat(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 mt-2">
          <button
            onClick={onResume}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-display font-bold text-sm tracking-wider shadow-[0_0_15px_rgba(0,240,255,0.4)] active:scale-95 cursor-pointer"
          >
            繼續攔截 (RESUME MISSION)
          </button>

          <button
            onClick={onRestart}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-tech text-xs tracking-wider transition-colors cursor-pointer"
          >
            重新開始 (RESTART)
          </button>
        </div>
      </div>
    </div>
  );
};

interface GameOverModalProps {
  stats: GameStats;
  onRestart: () => void;
  onOpenPilotSelect: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  onRestart,
  onOpenPilotSelect,
}) => {
  const isNewRecord = stats.score > 0 && stats.score >= stats.highScore;
  const accuracy =
    stats.shotsFired > 0 ? Math.round((stats.shotsHit / stats.shotsFired) * 100) : 0;

  return (
    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-40">
      <div className="w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-red-500/60 rounded-2xl p-6 sm:p-7 shadow-[0_0_40px_rgba(255,0,0,0.3)] flex flex-col gap-5 text-center">
        <div>
          <div className="text-[11px] font-tech text-red-400 tracking-[3px] uppercase">
            HULL BREACH DETECTED
          </div>
          <h2 className="text-3xl font-black tracking-widest text-red-500 font-display glow-red mt-1">
            MISSION FAILED
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            護盾耗盡，X翼戰機於戰區被摧毀！
          </p>
        </div>

        {/* Score & Record */}
        <div className="flex flex-col bg-slate-950/80 border border-slate-800 rounded-xl p-4">
          <span className="text-[10px] font-tech text-slate-400 tracking-widest uppercase">
            FINAL SCORE (最終戰績)
          </span>
          <span className="text-3xl sm:text-4xl font-black text-yellow-300 font-display glow-yellow mt-1">
            {stats.score.toLocaleString()}
          </span>

          {isNewRecord && (
            <div className="inline-flex items-center justify-center gap-1.5 mt-2 py-1 px-3 bg-yellow-500/20 border border-yellow-400/50 rounded-full text-xs font-bold text-yellow-300 font-tech">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> 突破歷史最高紀錄！ NEW RECORD
            </div>
          )}
        </div>

        {/* Tactical Debriefing Grid */}
        <div className="grid grid-cols-2 gap-2 text-left font-tech text-xs">
          <div className="p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-lg">
            <div className="text-slate-400 text-[10px]">攔截波次 (WAVE REACHED)</div>
            <div className="text-cyan-400 font-bold text-base mt-0.5">WAVE {stats.wave}</div>
          </div>
          <div className="p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-lg">
            <div className="text-slate-400 text-[10px]">擊落帝國戰機 (TIES DESTROYED)</div>
            <div className="text-red-400 font-bold text-base mt-0.5">{stats.kills} 架</div>
          </div>
          <div className="p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-lg">
            <div className="text-slate-400 text-[10px]">雷射命中率 (ACCURACY)</div>
            <div className="text-emerald-400 font-bold text-base mt-0.5">{accuracy}%</div>
          </div>
          <div className="p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-lg">
            <div className="text-slate-400 text-[10px]">最大連擊 (MAX COMBO)</div>
            <div className="text-yellow-400 font-bold text-base mt-0.5">{stats.maxCombo} 連擊</div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2 mt-1">
          <button
            onClick={onRestart}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 text-white font-display font-bold text-sm tracking-widest shadow-[0_0_20px_rgba(229,37,33,0.5)] active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> 重新發動攔截 (REDEPLOY)
          </button>

          <button
            onClick={onOpenPilotSelect}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-tech text-xs tracking-wider transition-colors cursor-pointer"
          >
            更換飛行員與戰術 (CHANGE PILOT)
          </button>
        </div>
      </div>
    </div>
  );
};
