/**
 * Data structures and types for Star Wars: X-Wing Intercept
 */

export type PilotCallsign = 'red-five' | 'rogue-leader' | 'gold-leader' | 'phoenix-one';

export interface PilotProfile {
  id: PilotCallsign;
  name: string;
  callsign: string;
  pilotName: string;
  perk: string;
  color: string;
}

export type Difficulty = 'cadet' | 'veteran' | 'jedi';

export interface Star {
  x: number;
  y: number;
  radius: number;
  speed: number;
  alpha: number;
  color: string;
}

export interface PlayerFighter {
  x: number;
  y: number;
  targetX: number;
  width: number;
  height: number;
  speed: number;
  tilt: number; // Banking angle (-1 to 1)
  sFoilAngle: number; // 0 (closed) to 1 (fully locked in attack position)
  r2Angle: number;
  fireCooldown: number;
  cooldownLimit: number;
  torpedoCooldown: number;
  shieldAbilityCooldown: number;
  shieldAbilityActive: boolean;
  shieldAbilityTimer: number;
  hyperLaserActive: boolean;
  hyperLaserTimer: number;
}

export type EnemyType = 'tie_fighter' | 'tie_interceptor' | 'tie_bomber' | 'tie_advanced';

export interface EnemyFighter {
  id: number;
  type: EnemyType;
  x: number;
  y: number;
  radius: number;
  speedY: number;
  speedX: number;
  hp: number;
  maxHp: number;
  scoreValue: number;
  wobble: number;
  wobbleSpeed: number;
  fireCooldown: number;
  markedForDeletion: boolean;
  isBoss?: boolean;
}

export interface LaserBeam {
  id: number;
  x: number;
  y: number;
  speedY: number;
  speedX?: number;
  width: number;
  length: number;
  isEnemy: boolean;
  color: string;
  damage: number;
  markedForDeletion: boolean;
}

export interface ProtonTorpedo {
  id: number;
  x: number;
  y: number;
  targetEnemyId: number | null;
  speedY: number;
  speedX: number;
  blastRadius: number;
  damage: number;
  markedForDeletion: boolean;
}

export type PowerupType = 'shield' | 'hyper_laser' | 'torpedo' | 'force_barrier';

export interface PowerupItem {
  id: number;
  type: PowerupType;
  x: number;
  y: number;
  radius: number;
  speedY: number;
  wobble: number;
  markedForDeletion: boolean;
}

export interface SpaceParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
  spark?: boolean;
  markedForDeletion: boolean;
}

export interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
  markedForDeletion: boolean;
}

export interface AsteroidItem {
  id: number;
  x: number;
  y: number;
  radius: number;
  speedY: number;
  speedX: number;
  rotation: number;
  rotSpeed: number;
  points: { x: number; y: number }[];
  hp: number;
  markedForDeletion: boolean;
}

export interface GameStats {
  score: number;
  highScore: number;
  shield: number;
  maxShield: number;
  torpedoes: number;
  wave: number;
  kills: number;
  shotsFired: number;
  shotsHit: number;
  combo: number;
  maxCombo: number;
  comboTimer: number;
}
