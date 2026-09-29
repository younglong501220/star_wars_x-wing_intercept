/**
 * Star Wars: X-Wing Intercept - Core Game Engine
 * Manages game loop, physics, collisions, wave progression, and inputs.
 */

import { sound } from '../audio/soundController';
import {
  PlayerFighter,
  EnemyFighter,
  LaserBeam,
  ProtonTorpedo,
  PowerupItem,
  SpaceParticle,
  Shockwave,
  AsteroidItem,
  Star,
  GameStats,
  PilotCallsign,
  Difficulty,
} from './types';
import {
  drawXWing,
  drawTieFighter,
  drawTieInterceptor,
  drawTieBomber,
  drawTieAdvanced,
  drawLaser,
  drawTorpedo,
  drawAsteroid,
  drawPowerup,
  drawShockwave,
  drawTargetingHUD,
} from './renderers';

export interface EngineCallbacks {
  onStatsChange: (stats: GameStats) => void;
  onGameOver: (stats: GameStats) => void;
  onWaveAnnouncement: (waveNumber: number, title: string) => void;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private callbacks: EngineCallbacks;

  // Viewport
  public width: number = 540;
  public height: number = 800;
  private dpr: number = 1;

  // State
  public isRunning: boolean = false;
  public isPaused: boolean = false;
  private animationFrameId: number | null = null;
  private lastTime: number = 0;

  // Configuration
  public pilot: PilotCallsign = 'red-five';
  public difficulty: Difficulty = 'veteran';

  // Game entities
  private stars: Star[] = [];
  private player: PlayerFighter;
  private enemies: EnemyFighter[] = [];
  private lasers: LaserBeam[] = [];
  private torpedoes: ProtonTorpedo[] = [];
  private powerups: PowerupItem[] = [];
  private particles: SpaceParticle[] = [];
  private shockwaves: Shockwave[] = [];
  private asteroids: AsteroidItem[] = [];

  // Wave / Spawner
  private waveNumber: number = 1;
  private waveEnemiesRemaining: number = 10;
  private waveTotalSpawned: number = 0;
  private spawnCooldown: number = 60;
  private spawnTimer: number = 0;
  private isWarping: boolean = false;
  private warpTimer: number = 0;

  // Targeting
  private lockedEnemy: EnemyFighter | null = null;

  // Screen shake
  private shakeIntensity: number = 0;

  // Input states
  private keys: Record<string, boolean> = {};
  public isPointerDown: boolean = false;
  public pointerX: number = 0;
  public pointerY: number = 0;
  public autoFire: boolean = true;

  // Stats
  private stats: GameStats = {
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
  };

  private nextEntityId: number = 1;

  constructor(canvas: HTMLCanvasElement, callbacks: EngineCallbacks) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get 2D canvas context');
    this.ctx = context;
    this.callbacks = callbacks;

    // Load High Score from localStorage
    try {
      const saved = localStorage.getItem('sw_xwing_highscore');
      if (saved) {
        this.stats.highScore = parseInt(saved, 10) || 0;
      }
    } catch {}

    this.player = this.createDefaultPlayer();
    this.resize();
    this.initStars();
  }

  private createDefaultPlayer(): PlayerFighter {
    return {
      x: this.width / 2,
      y: this.height - 110,
      targetX: this.width / 2,
      width: 48,
      height: 48,
      speed: 7,
      tilt: 0,
      sFoilAngle: 1,
      r2Angle: 0,
      fireCooldown: 0,
      cooldownLimit: 12,
      torpedoCooldown: 0,
      shieldAbilityCooldown: 0,
      shieldAbilityActive: false,
      shieldAbilityTimer: 0,
      hyperLaserActive: false,
      hyperLaserTimer: 0,
    };
  }

  public resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width || 540;
    this.height = rect.height || 800;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    if (this.player) {
      if (this.player.x > this.width) this.player.x = this.width / 2;
      this.player.y = Math.min(this.player.y, this.height - 70);
    }
  }

  private initStars() {
    this.stars = [];
    const count = 120;
    const colors = ['#ffffff', '#e0f7fa', '#fff9c4', '#ffe0b2', '#b3e5fc'];
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 1.6 + 0.4,
        speed: Math.random() * 2.5 + 0.6,
        alpha: Math.random() * 0.7 + 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
  }

  public start(pilot: PilotCallsign = 'red-five', difficulty: Difficulty = 'veteran') {
    this.pilot = pilot;
    this.difficulty = difficulty;

    // Reset game entities
    this.enemies = [];
    this.lasers = [];
    this.torpedoes = [];
    this.powerups = [];
    this.particles = [];
    this.shockwaves = [];
    this.asteroids = [];

    // Reset player
    this.player = this.createDefaultPlayer();
    if (pilot === 'rogue-leader') {
      this.player.speed = 8.5; // Faster agility
      this.player.cooldownLimit = 10;
    } else if (pilot === 'gold-leader') {
      this.stats.shield = 130;
      this.stats.maxShield = 130; // Heavy shielding
    } else {
      this.stats.shield = 100;
      this.stats.maxShield = 100;
    }

    // Stats reset
    const savedHighScore = this.stats.highScore;
    this.stats = {
      score: 0,
      highScore: savedHighScore,
      shield: this.stats.shield,
      maxShield: this.stats.maxShield,
      torpedoes: pilot === 'gold-leader' ? 5 : 3,
      wave: 1,
      kills: 0,
      shotsFired: 0,
      shotsHit: 0,
      combo: 0,
      maxCombo: 0,
      comboTimer: 0,
    };

    this.waveNumber = 1;
    this.startWave(1);

    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();

    sound.init();
    sound.r2Chirp();

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.loop = this.loop.bind(this);
    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  public pause() {
    this.isPaused = true;
  }

  public resume() {
    this.isPaused = false;
    this.lastTime = performance.now();
  }

  public stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private startWave(waveNum: number) {
    this.waveNumber = waveNum;
    this.stats.wave = waveNum;

    // Wave config
    this.waveEnemiesRemaining = 8 + waveNum * 4;
    this.waveTotalSpawned = 0;
    this.spawnCooldown = Math.max(25, 60 - waveNum * 4);
    this.spawnTimer = 0;

    // Trigger Hyperspace jump transition
    this.isWarping = true;
    this.warpTimer = 75; // frames of warp speed
    sound.hyperspace();

    let waveTitle = `WAVE ${waveNum}: TIE PATROL INTERCEPT`;
    if (waveNum === 2) waveTitle = `WAVE 2: TIE INTERCEPTOR FLOTILLA`;
    if (waveNum === 3) waveTitle = `WAVE 3: ASTEROID BELT AMBUSH`;
    if (waveNum === 4) waveTitle = `WAVE 4: IMPERIAL BOMBER RUN`;
    if (waveNum === 5) waveTitle = `WAVE 5: WARNING! DARTH VADER TIE ADVANCED`;
    if (waveNum > 5) waveTitle = `WAVE ${waveNum}: SECTOR HEAVY COMBAT`;

    this.callbacks.onWaveAnnouncement(waveNum, waveTitle);
    this.callbacks.onStatsChange({ ...this.stats });
  }

  // Handle keyboard & touch inputs
  public handleKeyDown(code: string) {
    this.keys[code] = true;
    if (code === 'Space') {
      this.firePlayerLaser();
    }
    if (code === 'KeyX' || code === 'KeyE') {
      this.fireTorpedo();
    }
    if (code === 'KeyC' || code === 'ShiftLeft' || code === 'ShiftRight') {
      this.triggerShieldBoost();
    }
  }

  public handleKeyUp(code: string) {
    this.keys[code] = false;
  }

  public handlePointerMove(canvasX: number, canvasY: number) {
    this.pointerX = Math.max(20, Math.min(this.width - 20, canvasX));
    this.pointerY = Math.max(this.height * 0.3, Math.min(this.height - 40, canvasY));
  }

  public firePlayerLaser() {
    if (!this.isRunning || this.isPaused || this.player.fireCooldown > 0) return;

    const isHyper = this.player.hyperLaserActive;
    const color = isHyper ? '#00f0ff' : '#ff3838';
    const damage = isHyper ? 2 : 1;

    // Quad cannon alternate pair
    this.lasers.push({
      id: this.nextEntityId++,
      x: this.player.x - 22,
      y: this.player.y - 18,
      speedY: 15,
      width: isHyper ? 4.5 : 3.5,
      length: isHyper ? 26 : 20,
      isEnemy: false,
      color,
      damage,
      markedForDeletion: false,
    });

    this.lasers.push({
      id: this.nextEntityId++,
      x: this.player.x + 22,
      y: this.player.y - 18,
      speedY: 15,
      width: isHyper ? 4.5 : 3.5,
      length: isHyper ? 26 : 20,
      isEnemy: false,
      color,
      damage,
      markedForDeletion: false,
    });

    sound.laser(isHyper);
    this.stats.shotsFired += 2;
    this.player.fireCooldown = isHyper ? 6 : this.player.cooldownLimit;
  }

  public fireTorpedo() {
    if (!this.isRunning || this.isPaused || this.stats.torpedoes <= 0 || this.player.torpedoCooldown > 0) {
      return;
    }

    this.stats.torpedoes--;
    this.player.torpedoCooldown = 35;

    // Find best target enemy
    let targetId: number | null = null;
    if (this.lockedEnemy && !this.lockedEnemy.markedForDeletion) {
      targetId = this.lockedEnemy.id;
    } else if (this.enemies.length > 0) {
      targetId = this.enemies[0].id;
    }

    this.torpedoes.push({
      id: this.nextEntityId++,
      x: this.player.x,
      y: this.player.y - 20,
      targetEnemyId: targetId,
      speedY: 10,
      speedX: 0,
      blastRadius: 90,
      damage: 12,
      markedForDeletion: false,
    });

    sound.protonTorpedo();
    this.shakeIntensity = 8;
    this.callbacks.onStatsChange({ ...this.stats });
  }

  public triggerShieldBoost() {
    if (this.player.shieldAbilityCooldown > 0 || this.player.shieldAbilityActive) return;

    this.player.shieldAbilityActive = true;
    this.player.shieldAbilityTimer = 180; // 3 seconds of invulnerability
    this.player.shieldAbilityCooldown = 600; // 10s cooldown
    this.stats.shield = Math.min(this.stats.maxShield, this.stats.shield + 20);

    sound.shieldActivate();
    sound.r2Chirp();
    this.callbacks.onStatsChange({ ...this.stats });
  }

  private spawnEnemy() {
    if (this.waveEnemiesRemaining <= 0) return;

    // Pick type based on wave
    let type: 'tie_fighter' | 'tie_interceptor' | 'tie_bomber' | 'tie_advanced' = 'tie_fighter';
    let hp = 1;
    let scoreVal = 100;
    let isBoss = false;

    if (this.waveNumber === 5 && this.waveTotalSpawned === 0) {
      // Darth Vader TIE Advanced Boss
      type = 'tie_advanced';
      hp = 45;
      scoreVal = 2500;
      isBoss = true;
    } else if (this.waveNumber >= 4 && Math.random() < 0.3) {
      type = 'tie_bomber';
      hp = 4;
      scoreVal = 300;
    } else if (this.waveNumber >= 2 && Math.random() < 0.45) {
      type = 'tie_interceptor';
      hp = 2;
      scoreVal = 200;
    }

    const enemy: EnemyFighter = {
      id: this.nextEntityId++,
      type,
      x: Math.random() * (this.width - 90) + 45,
      y: isBoss ? -60 : -40,
      radius: isBoss ? 26 : type === 'tie_bomber' ? 22 : 18,
      speedY: isBoss ? 1.0 : type === 'tie_interceptor' ? 3.2 : type === 'tie_bomber' ? 1.6 : 2.2,
      speedX: 0,
      hp,
      maxHp: hp,
      scoreValue: scoreVal,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.04 + 0.02,
      fireCooldown: Math.floor(Math.random() * 60) + 40,
      markedForDeletion: false,
      isBoss,
    };

    this.enemies.push(enemy);
    this.waveTotalSpawned++;
    this.waveEnemiesRemaining--;
  }

  private spawnAsteroid() {
    if (this.asteroids.length > 5) return;
    const radius = Math.random() * 18 + 14;
    const numPoints = 8;
    const points: { x: number; y: number }[] = [];
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      const dist = radius * (0.8 + Math.random() * 0.4);
      points.push({ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist });
    }

    this.asteroids.push({
      id: this.nextEntityId++,
      x: Math.random() * (this.width - 40) + 20,
      y: -50,
      radius,
      speedY: Math.random() * 1.5 + 1.2,
      speedX: (Math.random() - 0.5) * 1.0,
      rotation: Math.random() * Math.PI,
      rotSpeed: (Math.random() - 0.5) * 0.03,
      points,
      hp: Math.ceil(radius / 8),
      markedForDeletion: false,
    });
  }

  private createExplosion(x: number, y: number, size: 'small' | 'medium' | 'heavy' = 'medium') {
    sound.explosion(size);
    this.shakeIntensity = size === 'heavy' ? 16 : size === 'medium' ? 8 : 4;

    // Shockwave ring
    this.shockwaves.push({
      x,
      y,
      radius: 5,
      maxRadius: size === 'heavy' ? 95 : size === 'medium' ? 50 : 25,
      color: size === 'heavy' ? '#ff0055' : '#00ff88',
      alpha: 1,
      markedForDeletion: false,
    });

    // Particle shower
    const count = size === 'heavy' ? 50 : size === 'medium' ? 25 : 12;
    const colors = ['#00ff88', '#10ac84', '#ff793f', '#ff5252', '#ffeaa7', '#ffffff'];

    for (let i = 0; i < count; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * (size === 'heavy' ? 7 : 5) + 1;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 3 + 1,
        color,
        alpha: 1,
        decay: Math.random() * 0.03 + 0.02,
        markedForDeletion: false,
      });
    }
  }

  public damagePlayer(amount: number) {
    if (this.player.shieldAbilityActive) return; // Invulnerable

    this.stats.shield -= amount;
    this.shakeIntensity = 14;
    sound.alarm();

    if (this.stats.shield <= 0) {
      this.stats.shield = 0;
      this.gameOver();
    }
    this.callbacks.onStatsChange({ ...this.stats });
  }

  private gameOver() {
    this.isRunning = false;
    this.createExplosion(this.player.x, this.player.y, 'heavy');

    // Update high score
    if (this.stats.score > this.stats.highScore) {
      this.stats.highScore = this.stats.score;
      try {
        localStorage.setItem('sw_xwing_highscore', this.stats.score.toString());
      } catch {}
    }

    this.callbacks.onGameOver({ ...this.stats });
  }

  // Main Loop
  private loop(currentTime: number) {
    if (!this.isRunning) return;

    if (!this.isPaused) {
      this.update();
    }
    this.render();

    this.lastTime = currentTime;
    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  private update() {
    // 1. Warp / Hyperspace transition update
    if (this.isWarping) {
      this.warpTimer--;
      if (this.warpTimer <= 0) {
        this.isWarping = false;
      }
    }

    // 2. Stars
    const starSpeedMultiplier = this.isWarping ? 12 : 1;
    this.stars.forEach(star => {
      star.y += star.speed * starSpeedMultiplier;
      if (star.y > this.height) {
        star.y = 0;
        star.x = Math.random() * this.width;
      }
    });

    // 3. Player Updates
    let moveX = 0;
    let moveY = 0;
    if (this.keys['ArrowLeft'] || this.keys['KeyA']) moveX -= 1;
    if (this.keys['ArrowRight'] || this.keys['KeyD']) moveX += 1;
    if (this.keys['ArrowUp'] || this.keys['KeyW']) moveY -= 1;
    if (this.keys['ArrowDown'] || this.keys['KeyS']) moveY += 1;

    // Direct movement from keys
    if (moveX !== 0 || moveY !== 0) {
      this.player.x += moveX * this.player.speed;
      this.player.y += moveY * this.player.speed;
      this.player.tilt += (moveX - this.player.tilt) * 0.2;
    } else if (this.isPointerDown) {
      // Pointer tracking
      const dx = this.pointerX - this.player.x;
      const dy = this.pointerY - this.player.y;
      this.player.x += dx * 0.22;
      this.player.y += dy * 0.15;
      const targetTilt = Math.max(-1, Math.min(1, dx / 20));
      this.player.tilt += (targetTilt - this.player.tilt) * 0.2;
    } else {
      this.player.tilt *= 0.85;
    }

    // Clamp player bounds
    const halfW = this.player.width / 2;
    this.player.x = Math.max(halfW, Math.min(this.width - halfW, this.player.x));
    this.player.y = Math.max(this.height * 0.35, Math.min(this.height - 45, this.player.y));

    // R2 head turning animation
    this.player.r2Angle += 0.05;

    // Cooldown timers
    if (this.player.fireCooldown > 0) this.player.fireCooldown--;
    if (this.player.torpedoCooldown > 0) this.player.torpedoCooldown--;

    // Shield ability countdown
    if (this.player.shieldAbilityActive) {
      this.player.shieldAbilityTimer--;
      if (this.player.shieldAbilityTimer <= 0) {
        this.player.shieldAbilityActive = false;
      }
    }
    if (this.player.shieldAbilityCooldown > 0) {
      this.player.shieldAbilityCooldown--;
    }

    // Hyper laser countdown
    if (this.player.hyperLaserActive) {
      this.player.hyperLaserTimer--;
      if (this.player.hyperLaserTimer <= 0) {
        this.player.hyperLaserActive = false;
      }
    }

    // Continuous auto-fire or pointer firing
    if ((this.autoFire || this.isPointerDown || this.keys['Space']) && !this.isWarping) {
      this.firePlayerLaser();
    }

    // Combo timer decay
    if (this.stats.combo > 0) {
      this.stats.comboTimer--;
      if (this.stats.comboTimer <= 0) {
        this.stats.combo = 0;
        this.callbacks.onStatsChange({ ...this.stats });
      }
    }

    // 4. Asteroid Spawning (Wave 3+)
    if (this.waveNumber >= 3 && !this.isWarping) {
      if (Math.random() < 0.015) {
        this.spawnAsteroid();
      }
    }

    // 5. Enemy Spawning
    if (!this.isWarping && this.waveEnemiesRemaining > 0) {
      this.spawnTimer++;
      if (this.spawnTimer >= this.spawnCooldown) {
        this.spawnEnemy();
        this.spawnTimer = 0;
      }
    }

    // Check if Wave Completed
    if (!this.isWarping && this.waveEnemiesRemaining <= 0 && this.enemies.length === 0) {
      // Wave clear! Give bonus and advance
      this.stats.score += this.waveNumber * 500;
      this.stats.torpedoes = Math.min(6, this.stats.torpedoes + 1);
      sound.victoryFanfare();
      this.startWave(this.waveNumber + 1);
    }

    // 6. Laser Beams
    for (let i = this.lasers.length - 1; i >= 0; i--) {
      const laser = this.lasers[i];
      if (laser.isEnemy) {
        laser.y += laser.speedY;
        if (laser.y > this.height + 30) laser.markedForDeletion = true;

        // Hit player check
        const dist = Math.hypot(laser.x - this.player.x, laser.y - this.player.y);
        if (dist < 22 && !laser.markedForDeletion) {
          laser.markedForDeletion = true;
          this.damagePlayer(8);
        }
      } else {
        laser.y -= laser.speedY;
        if (laser.y < -30) laser.markedForDeletion = true;
      }

      if (laser.markedForDeletion) {
        this.lasers.splice(i, 1);
      }
    }

    // 7. Proton Torpedoes
    for (let i = this.torpedoes.length - 1; i >= 0; i--) {
      const torp = this.torpedoes[i];
      // Home in on target enemy if still alive
      let target: EnemyFighter | undefined;
      if (torp.targetEnemyId) {
        target = this.enemies.find(e => e.id === torp.targetEnemyId && !e.markedForDeletion);
      }
      if (target) {
        const dx = target.x - torp.x;
        const dy = target.y - torp.y;
        const angle = Math.atan2(dy, dx);
        torp.x += Math.cos(angle) * 11;
        torp.y += Math.sin(angle) * 11;
      } else {
        torp.y -= torp.speedY;
      }

      // Smoke trail
      if (Math.random() < 0.7) {
        this.particles.push({
          x: torp.x,
          y: torp.y + 6,
          vx: (Math.random() - 0.5) * 1.5,
          vy: Math.random() * 2 + 1,
          radius: Math.random() * 2.5 + 1,
          color: '#ff77aa',
          alpha: 0.8,
          decay: 0.05,
          markedForDeletion: false,
        });
      }

      // Out of bounds check
      if (torp.y < -40 || torp.y > this.height + 40) {
        torp.markedForDeletion = true;
      }

      // Detonation check
      for (const enemy of this.enemies) {
        const dist = Math.hypot(torp.x - enemy.x, torp.y - enemy.y);
        if (dist < enemy.radius + 15) {
          torp.markedForDeletion = true;
          this.createExplosion(torp.x, torp.y, 'heavy');

          // Blast radius damage to all nearby enemies & asteroids
          this.enemies.forEach(e => {
            const blastDist = Math.hypot(torp.x - e.x, torp.y - e.y);
            if (blastDist < torp.blastRadius) {
              e.hp -= torp.damage;
              if (e.hp <= 0) {
                this.destroyEnemy(e);
              }
            }
          });

          this.asteroids.forEach(a => {
            const blastDist = Math.hypot(torp.x - a.x, torp.y - a.y);
            if (blastDist < torp.blastRadius) {
              a.hp -= 5;
              if (a.hp <= 0) a.markedForDeletion = true;
            }
          });
          break;
        }
      }

      if (torp.markedForDeletion) {
        this.torpedoes.splice(i, 1);
      }
    }

    // 8. Enemies
    this.lockedEnemy = null;
    let closestDist = Infinity;

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      e.y += e.speedY;
      e.wobble += e.wobbleSpeed;
      e.x += Math.sin(e.wobble) * (e.type === 'tie_interceptor' ? 2.5 : 1.2);

      // Keep within bounds
      if (e.x < 30) e.x = 30;
      if (e.x > this.width - 30) e.x = this.width - 30;

      // Enemy fire weapons
      if (!this.isWarping && e.y > 20 && e.y < this.height * 0.7) {
        e.fireCooldown--;
        if (e.fireCooldown <= 0) {
          this.lasers.push({
            id: this.nextEntityId++,
            x: e.x,
            y: e.y + e.radius + 4,
            speedY: 7,
            width: 3.5,
            length: 16,
            isEnemy: true,
            color: '#00ff88',
            damage: 8,
            markedForDeletion: false,
          });
          sound.tieLaser();
          e.fireCooldown = e.isBoss ? 28 : Math.floor(Math.random() * 80) + 70;
        }
      }

      // Check distance for target lock
      const pDist = Math.hypot(e.x - this.player.x, e.y - this.player.y);
      if (pDist < closestDist) {
        closestDist = pDist;
        this.lockedEnemy = e;
      }

      // Check collision with player laser
      for (const laser of this.lasers) {
        if (laser.isEnemy || laser.markedForDeletion) continue;
        const d = Math.hypot(e.x - laser.x, e.y - laser.y);
        if (d < e.radius + 6) {
          laser.markedForDeletion = true;
          this.stats.shotsHit++;
          e.hp -= laser.damage;
          this.createExplosion(laser.x, laser.y, 'small');

          if (e.hp <= 0) {
            this.destroyEnemy(e);
            break;
          }
        }
      }

      // Collision with player ship
      if (!e.markedForDeletion) {
        const distShip = Math.hypot(e.x - this.player.x, e.y - this.player.y);
        if (distShip < e.radius + 20) {
          this.destroyEnemy(e);
          this.damagePlayer(15);
        }
      }

      // Breach past bottom defense line
      if (e.y > this.height + 40) {
        e.markedForDeletion = true;
        this.damagePlayer(10); // Penalty for leaked enemy
      }

      if (e.markedForDeletion) {
        this.enemies.splice(i, 1);
      }
    }

    // 9. Asteroids
    for (let i = this.asteroids.length - 1; i >= 0; i--) {
      const rock = this.asteroids[i];
      rock.y += rock.speedY;
      rock.x += rock.speedX;
      rock.rotation += rock.rotSpeed;

      // Laser collision
      for (const laser of this.lasers) {
        if (laser.isEnemy || laser.markedForDeletion) continue;
        const d = Math.hypot(rock.x - laser.x, rock.y - laser.y);
        if (d < rock.radius) {
          laser.markedForDeletion = true;
          rock.hp -= laser.damage;
          this.createExplosion(laser.x, laser.y, 'small');
          if (rock.hp <= 0) {
            rock.markedForDeletion = true;
            this.createExplosion(rock.x, rock.y, 'medium');
            this.stats.score += 50;
            break;
          }
        }
      }

      // Player collision with asteroid
      if (!rock.markedForDeletion) {
        const dist = Math.hypot(rock.x - this.player.x, rock.y - this.player.y);
        if (dist < rock.radius + 18) {
          rock.markedForDeletion = true;
          this.createExplosion(rock.x, rock.y, 'medium');
          this.damagePlayer(15);
        }
      }

      if (rock.y > this.height + 50) rock.markedForDeletion = true;
      if (rock.markedForDeletion) {
        this.asteroids.splice(i, 1);
      }
    }

    // 10. Powerups
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const p = this.powerups[i];
      p.y += p.speedY;
      p.wobble += 0.05;
      p.x += Math.sin(p.wobble) * 0.8;

      // Player pickup check
      const d = Math.hypot(p.x - this.player.x, p.y - this.player.y);
      if (d < 30) {
        p.markedForDeletion = true;
        this.applyPowerup(p.type);
      }

      if (p.y > this.height + 30) p.markedForDeletion = true;
      if (p.markedForDeletion) {
        this.powerups.splice(i, 1);
      }
    }

    // 11. Particles & Shockwaves
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.alpha -= pt.decay;
      if (pt.alpha <= 0) this.particles.splice(i, 1);
    }

    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += 4.5;
      sw.alpha -= 0.05;
      if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
        this.shockwaves.splice(i, 1);
      }
    }

    // Screen Shake decay
    if (this.shakeIntensity > 0) {
      this.shakeIntensity *= 0.9;
      if (this.shakeIntensity < 0.4) this.shakeIntensity = 0;
    }
  }

  private destroyEnemy(enemy: EnemyFighter) {
    enemy.markedForDeletion = true;
    this.createExplosion(enemy.x, enemy.y, enemy.isBoss ? 'heavy' : 'medium');

    // Combo system
    this.stats.combo++;
    this.stats.comboTimer = 150; // ~2.5 seconds
    if (this.stats.combo > this.stats.maxCombo) {
      this.stats.maxCombo = this.stats.combo;
    }

    const multiplier = Math.min(5, Math.floor(this.stats.combo / 3) + 1);
    this.stats.score += enemy.scoreValue * multiplier;
    this.stats.kills++;

    // Random powerup drop chance (25%)
    if (Math.random() < 0.28 || enemy.isBoss) {
      const types: PowerupItem['type'][] = ['shield', 'hyper_laser', 'torpedo', 'force_barrier'];
      const picked = types[Math.floor(Math.random() * types.length)];
      this.powerups.push({
        id: this.nextEntityId++,
        type: picked,
        x: enemy.x,
        y: enemy.y,
        radius: 14,
        speedY: 1.8,
        wobble: Math.random() * Math.PI,
        markedForDeletion: false,
      });
    }

    this.callbacks.onStatsChange({ ...this.stats });
  }

  private applyPowerup(type: PowerupItem['type']) {
    sound.powerup();

    if (type === 'shield') {
      this.stats.shield = Math.min(this.stats.maxShield, this.stats.shield + 25);
    } else if (type === 'hyper_laser') {
      this.player.hyperLaserActive = true;
      this.player.hyperLaserTimer = 400; // ~6.5 seconds
    } else if (type === 'torpedo') {
      this.stats.torpedoes = Math.min(6, this.stats.torpedoes + 2);
    } else if (type === 'force_barrier') {
      this.player.shieldAbilityActive = true;
      this.player.shieldAbilityTimer = 240;
    }

    this.callbacks.onStatsChange({ ...this.stats });
  }

  private render() {
    this.ctx.save();

    // Screen Shake Translation
    if (this.shakeIntensity > 0) {
      const sx = (Math.random() - 0.5) * this.shakeIntensity;
      const sy = (Math.random() - 0.5) * this.shakeIntensity;
      this.ctx.translate(sx, sy);
    }

    // Space Deep Background
    this.ctx.fillStyle = '#03050c';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Subtle Radial Space Nebula
    const grad = this.ctx.createRadialGradient(
      this.width / 2,
      this.height * 0.4,
      10,
      this.width / 2,
      this.height * 0.4,
      this.width * 0.8
    );
    grad.addColorStop(0, 'rgba(10, 24, 48, 0.4)');
    grad.addColorStop(0.6, 'rgba(6, 12, 25, 0.25)');
    grad.addColorStop(1, 'rgba(2, 4, 10, 0)');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Render Stars (Stretching to streaks during Hyperspace warp)
    this.stars.forEach(star => {
      this.ctx.save();
      this.ctx.fillStyle = star.color;
      this.ctx.globalAlpha = star.alpha;
      if (this.isWarping) {
        // Hyperspace Warp Lines
        this.ctx.strokeStyle = '#80d8ff';
        this.ctx.lineWidth = star.radius * 1.5;
        this.ctx.beginPath();
        this.ctx.moveTo(star.x, star.y);
        this.ctx.lineTo(star.x, star.y + star.speed * 25);
        this.ctx.stroke();
      } else {
        this.ctx.beginPath();
        this.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.restore();
    });

    // Asteroids
    this.asteroids.forEach(rock => drawAsteroid(this.ctx, rock));

    // Powerups
    this.powerups.forEach(pu => drawPowerup(this.ctx, pu));

    // Lasers
    this.lasers.forEach(laser => drawLaser(this.ctx, laser));

    // Torpedoes
    this.torpedoes.forEach(torp => drawTorpedo(this.ctx, torp));

    // Enemies
    this.enemies.forEach(enemy => {
      if (enemy.type === 'tie_advanced') {
        drawTieAdvanced(this.ctx, enemy);
      } else if (enemy.type === 'tie_bomber') {
        drawTieBomber(this.ctx, enemy);
      } else if (enemy.type === 'tie_interceptor') {
        drawTieInterceptor(this.ctx, enemy);
      } else {
        drawTieFighter(this.ctx, enemy);
      }
    });

    // Player X-Wing
    if (this.isRunning && this.stats.shield > 0) {
      drawXWing(this.ctx, this.player, this.pilot);
    }

    // Shockwaves
    this.shockwaves.forEach(sw => drawShockwave(this.ctx, sw));

    // Particles
    this.particles.forEach(p => {
      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, p.alpha);
      this.ctx.fillStyle = p.color;
      this.ctx.shadowColor = p.color;
      this.ctx.shadowBlur = 6;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });

    // Targeting HUD computer
    drawTargetingHUD(
      this.ctx,
      this.width,
      this.height,
      this.player.x,
      this.player.y,
      this.lockedEnemy
    );

    this.ctx.restore();
  }
}
