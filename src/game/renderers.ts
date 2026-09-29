/**
 * Star Wars: X-Wing Intercept - High fidelity Canvas Vector Renderers
 * Pure procedural drawing with zero external images.
 */

import {
  PlayerFighter,
  EnemyFighter,
  LaserBeam,
  ProtonTorpedo,
  PowerupItem,
  SpaceParticle,
  Shockwave,
  AsteroidItem,
  PilotCallsign,
} from './types';

// Pilot squadron paint schemes
export const SQUADRON_COLORS: Record<PilotCallsign, { stripe: string; glow: string; name: string }> = {
  'red-five': { stripe: '#e84118', glow: '#ff3838', name: 'Red Five (Luke Skywalker)' },
  'rogue-leader': { stripe: '#e67e22', glow: '#f39c12', name: 'Rogue Leader (Wedge)' },
  'gold-leader': { stripe: '#f1c40f', glow: '#ffeaa7', name: 'Gold Leader (Y-Squad)' },
  'phoenix-one': { stripe: '#9b59b6', glow: '#8e44ad', name: 'Phoenix Squadron (Hera)' },
};

/**
 * Render Player T-65 X-Wing Starfighter
 */
export function drawXWing(
  ctx: CanvasRenderingContext2D,
  player: PlayerFighter,
  pilot: PilotCallsign = 'red-five'
) {
  const scheme = SQUADRON_COLORS[pilot] || SQUADRON_COLORS['red-five'];

  ctx.save();
  ctx.translate(player.x, player.y);

  // Banking tilt rotation effect
  const rollAngle = player.tilt * 0.15;
  ctx.rotate(rollAngle);

  // Force Barrier / Deflector Shield Bubble
  if (player.shieldAbilityActive) {
    const shieldPulse = Math.sin(Date.now() * 0.01) * 3;
    const shieldRadius = 38 + shieldPulse;
    ctx.save();
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#00d2ff';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(0, 0, shieldRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
    ctx.fill();

    // Hex shield grid lines
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    for (let a = 0; a < 6; a++) {
      const angle = (a * Math.PI) / 3 + Date.now() * 0.002;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * (shieldRadius - 8), Math.sin(angle) * (shieldRadius - 8));
      ctx.lineTo(Math.cos(angle) * shieldRadius, Math.sin(angle) * shieldRadius);
      ctx.stroke();
    }
    ctx.restore();
  }

  // 1. Dual Engine Thruster Exhaust
  const flameLength = (Math.random() * 14 + 14) * (player.hyperLaserActive ? 1.5 : 1);
  const thrusterColor = player.hyperLaserActive ? '#00d2ff' : '#ff7b00';
  const glowColor = player.hyperLaserActive ? '#00ffff' : '#ff3300';

  ctx.save();
  ctx.fillStyle = thrusterColor;
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 12;

  [-15, 15].forEach(offX => {
    ctx.beginPath();
    ctx.moveTo(offX - 3.5, 16);
    ctx.lineTo(offX + 3.5, 16);
    ctx.lineTo(offX, 16 + flameLength);
    ctx.closePath();
    ctx.fill();

    // Inner bright core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(offX - 1.5, 16);
    ctx.lineTo(offX + 1.5, 16);
    ctx.lineTo(offX, 16 + flameLength * 0.45);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = thrusterColor;
  });
  ctx.restore();

  // 2. S-FOILS (Four wings in X formation)
  // When banking, one side compresses slightly (scaleX)
  const leftWingSpan = 25 - player.tilt * 5;
  const rightWingSpan = 25 + player.tilt * 5;

  ctx.fillStyle = '#d5dae2';
  ctx.strokeStyle = '#2c3e50';
  ctx.lineWidth = 1.5;

  // Left Top & Bottom S-Foils
  ctx.beginPath();
  ctx.moveTo(-4, -4);
  ctx.lineTo(-leftWingSpan, -22);
  ctx.lineTo(-leftWingSpan, -16);
  ctx.lineTo(-4, 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-4, 4);
  ctx.lineTo(-leftWingSpan, 22);
  ctx.lineTo(-leftWingSpan, 16);
  ctx.lineTo(-4, -6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Right Top & Bottom S-Foils
  ctx.beginPath();
  ctx.moveTo(4, -4);
  ctx.lineTo(rightWingSpan, -22);
  ctx.lineTo(rightWingSpan, -16);
  ctx.lineTo(4, 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(4, 4);
  ctx.lineTo(rightWingSpan, 22);
  ctx.lineTo(rightWingSpan, 16);
  ctx.lineTo(4, -6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 3. Wingtip Taim & Bak KX9 Laser Cannons
  ctx.fillStyle = '#576574';
  // Left cannons
  ctx.fillRect(-leftWingSpan - 1, -26, 3, 14);
  ctx.fillRect(-leftWingSpan - 1, 14, 3, 14);
  // Right cannons
  ctx.fillRect(rightWingSpan - 2, -26, 3, 14);
  ctx.fillRect(rightWingSpan - 2, 14, 3, 14);

  // Cannon flash tips
  ctx.fillStyle = '#ff4757';
  ctx.fillRect(-leftWingSpan, -27, 1.5, 2);
  ctx.fillRect(-leftWingSpan, 27, 1.5, 2);
  ctx.fillRect(rightWingSpan - 1, -27, 1.5, 2);
  ctx.fillRect(rightWingSpan - 1, 27, 1.5, 2);

  // 4. Squadron Identification Stripes
  ctx.fillStyle = scheme.stripe;
  ctx.fillRect(-leftWingSpan + 4, -20, 10, 2.5);
  ctx.fillRect(-leftWingSpan + 4, 18, 10, 2.5);
  ctx.fillRect(rightWingSpan - 14, -20, 10, 2.5);
  ctx.fillRect(rightWingSpan - 14, 18, 10, 2.5);

  // 5. Fuselage (Central Incom Hull)
  ctx.fillStyle = '#ecf0f1';
  ctx.beginPath();
  ctx.moveTo(0, -28); // Sharp nose
  ctx.lineTo(8, 18);
  ctx.lineTo(-8, 18);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#34495e';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Nose stripe
  ctx.fillStyle = scheme.stripe;
  ctx.beginPath();
  ctx.moveTo(0, -26);
  ctx.lineTo(3.5, -8);
  ctx.lineTo(-3.5, -8);
  ctx.closePath();
  ctx.fill();

  // 6. Cockpit Canopy (Dark with Cyan reflection)
  ctx.fillStyle = '#1e272e';
  ctx.fillRect(-3, -5, 6, 11);
  ctx.fillStyle = '#00d2d3';
  ctx.fillRect(-1.5, -3, 3, 4);

  // 7. Astromech Droid Socket (R2-D2)
  ctx.fillStyle = '#2980b9'; // Blue dome
  ctx.beginPath();
  ctx.arc(0, 8, 2.5, 0, Math.PI * 2);
  ctx.fill();
  // R2 red eye sensor
  ctx.fillStyle = '#e74c3c';
  ctx.beginPath();
  ctx.arc(Math.sin(player.r2Angle) * 1.2, 7.5, 0.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Render Imperial TIE/ln Fighter (Standard)
 */
export function drawTieFighter(ctx: CanvasRenderingContext2D, enemy: EnemyFighter) {
  ctx.save();
  ctx.translate(enemy.x, enemy.y);

  // Wing panels
  const panelW = 4;
  const panelH = 20;

  const drawHexPanel = (posX: number) => {
    ctx.fillStyle = '#1c1e24';
    ctx.strokeStyle = '#5a6275';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(posX, -panelH);
    ctx.lineTo(posX + panelW, -panelH * 0.7);
    ctx.lineTo(posX + panelW, panelH * 0.7);
    ctx.lineTo(posX, panelH);
    ctx.lineTo(posX - panelW, panelH * 0.7);
    ctx.lineTo(posX - panelW, -panelH * 0.7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Solar radiator struts
    ctx.strokeStyle = '#383f4f';
    ctx.beginPath();
    ctx.moveTo(posX - panelW, 0);
    ctx.lineTo(posX + panelW, 0);
    ctx.moveTo(posX, -panelH);
    ctx.lineTo(posX, panelH);
    ctx.stroke();
  };

  drawHexPanel(-18);
  drawHexPanel(18);

  // Wing pylon struts
  ctx.strokeStyle = '#7f8c8d';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-16, 0);
  ctx.lineTo(16, 0);
  ctx.stroke();

  // Central command pod
  ctx.fillStyle = '#576574';
  ctx.beginPath();
  ctx.arc(0, 0, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#222f3e';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Viewport (Imperial Emerald Eye)
  ctx.fillStyle = '#10ac84';
  ctx.shadowColor = '#1dd1a1';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Render Imperial TIE Interceptor (Dagger wings, fast interceptor)
 */
export function drawTieInterceptor(ctx: CanvasRenderingContext2D, enemy: EnemyFighter) {
  ctx.save();
  ctx.translate(enemy.x, enemy.y);

  // Dagger V-wings
  const drawDaggerWing = (side: number) => {
    ctx.fillStyle = '#15171c';
    ctx.strokeStyle = '#4b5563';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(side * 18, 0);
    ctx.lineTo(side * 24, -22); // Top dagger tip
    ctx.lineTo(side * 14, -6);
    ctx.lineTo(side * 14, 6);
    ctx.lineTo(side * 24, 22);  // Bottom dagger tip
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Laser tip emitters
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(side * 24 - 1, -23, 2, 3);
    ctx.fillRect(side * 24 - 1, 20, 2, 3);
  };

  drawDaggerWing(-1);
  drawDaggerWing(1);

  // Struts
  ctx.strokeStyle = '#6b7280';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-14, 0);
  ctx.lineTo(14, 0);
  ctx.stroke();

  // Cockpit
  ctx.fillStyle = '#4b5563';
  ctx.beginPath();
  ctx.arc(0, 0, 8.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#1f2937';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Green menacing viewport
  ctx.fillStyle = '#00ff88';
  ctx.shadowColor = '#00ff88';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Render Imperial TIE Bomber (Heavy twin hull)
 */
export function drawTieBomber(ctx: CanvasRenderingContext2D, enemy: EnemyFighter) {
  ctx.save();
  ctx.translate(enemy.x, enemy.y);

  // Angled bent wings
  const drawBentWing = (side: number) => {
    ctx.fillStyle = '#1e242b';
    ctx.strokeStyle = '#52616f';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(side * 22, -18);
    ctx.lineTo(side * 25, -12);
    ctx.lineTo(side * 25, 12);
    ctx.lineTo(side * 22, 18);
    ctx.lineTo(side * 18, 14);
    ctx.lineTo(side * 18, -14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };

  drawBentWing(-1);
  drawBentWing(1);

  // Struts
  ctx.strokeStyle = '#4a5568';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-18, 0);
  ctx.lineTo(18, 0);
  ctx.stroke();

  // Twin Fuselage: Left = Pilot Pod, Right = Ordnance Bay
  // Left Pilot Pod
  ctx.fillStyle = '#4a5568';
  ctx.beginPath();
  ctx.arc(-7, 0, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#2d3748';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Pilot viewport
  ctx.fillStyle = '#10ac84';
  ctx.shadowColor = '#10ac84';
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.arc(-7, 0, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Right Ordnance / Missile Pod
  ctx.fillStyle = '#2d3748';
  ctx.beginPath();
  ctx.arc(7, 0, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#1a202c';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Bomb Chute
  ctx.fillStyle = '#e53e3e';
  ctx.shadowColor = '#e53e3e';
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.arc(7, 3, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.restore();
}

/**
 * Render Darth Vader's TIE Advanced x1 (Boss unit)
 */
export function drawTieAdvanced(ctx: CanvasRenderingContext2D, enemy: EnemyFighter) {
  ctx.save();
  ctx.translate(enemy.x, enemy.y);

  // Curved Bent Solar Wings
  const drawVaderWing = (side: number) => {
    ctx.fillStyle = '#111317';
    ctx.strokeStyle = '#4b5563';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(side * 28, -26);
    ctx.lineTo(side * 34, -18);
    ctx.lineTo(side * 34, 18);
    ctx.lineTo(side * 28, 26);
    ctx.lineTo(side * 22, 16);
    ctx.lineTo(side * 22, -16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Strut connection
    ctx.strokeStyle = '#374151';
    ctx.beginPath();
    ctx.moveTo(side * 22, 0);
    ctx.lineTo(side * 34, 0);
    ctx.stroke();
  };

  drawVaderWing(-1);
  drawVaderWing(1);

  // Extended heavy pylon struts
  ctx.strokeStyle = '#4b5563';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-22, 0);
  ctx.lineTo(22, 0);
  ctx.stroke();

  // Heavy Central Cockpit Pod
  ctx.fillStyle = '#374151';
  ctx.beginPath();
  ctx.arc(0, 0, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#111827';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Menacing Crimson / Emerald Dual Core Viewport
  ctx.fillStyle = '#ef4444';
  ctx.shadowColor = '#ef4444';
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(0, 0, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Boss HP Bar floating above
  const hpPct = Math.max(0, enemy.hp / enemy.maxHp);
  const barW = 54;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(-barW / 2, -36, barW, 6);
  ctx.fillStyle = hpPct > 0.4 ? '#ef4444' : '#f59e0b';
  ctx.fillRect(-barW / 2 + 1, -35, (barW - 2) * hpPct, 4);

  ctx.restore();
}

/**
 * Render Lasers
 */
export function drawLaser(ctx: CanvasRenderingContext2D, laser: LaserBeam) {
  ctx.save();
  ctx.shadowColor = laser.color;
  ctx.shadowBlur = 10;
  ctx.fillStyle = laser.color;
  ctx.fillRect(laser.x - laser.width / 2, laser.y, laser.width, laser.length);

  // Bright white energetic beam core
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(laser.x - 1, laser.y + 2, 2, Math.max(1, laser.length - 4));
  ctx.restore();
}

/**
 * Render Proton Torpedo (Magenta/Orange pulse missile)
 */
export function drawTorpedo(ctx: CanvasRenderingContext2D, torpedo: ProtonTorpedo) {
  ctx.save();
  ctx.translate(torpedo.x, torpedo.y);

  // Exhaust glow
  ctx.shadowColor = '#ff007f';
  ctx.shadowBlur = 14;
  ctx.fillStyle = '#ff00aa';

  // Torpedo Body
  ctx.beginPath();
  ctx.arc(0, 0, 5, 0, Math.PI * 2);
  ctx.fill();

  // Super-bright warhead
  ctx.fillStyle = '#ffeaa7';
  ctx.beginPath();
  ctx.arc(0, -1, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Ion thruster trail
  ctx.fillStyle = 'rgba(255, 100, 200, 0.7)';
  ctx.beginPath();
  ctx.moveTo(-2, 3);
  ctx.lineTo(2, 3);
  ctx.lineTo(0, 10 + Math.random() * 5);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

/**
 * Render Asteroid
 */
export function drawAsteroid(ctx: CanvasRenderingContext2D, rock: AsteroidItem) {
  ctx.save();
  ctx.translate(rock.x, rock.y);
  ctx.rotate(rock.rotation);

  ctx.fillStyle = '#4a4b53';
  ctx.strokeStyle = '#2b2c31';
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  rock.points.forEach((pt, idx) => {
    if (idx === 0) ctx.moveTo(pt.x, pt.y);
    else ctx.lineTo(pt.x, pt.y);
  });
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Surface craters
  ctx.fillStyle = '#37383e';
  ctx.beginPath();
  ctx.arc(rock.radius * 0.3, rock.radius * 0.2, rock.radius * 0.25, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(-rock.radius * 0.25, -rock.radius * 0.3, rock.radius * 0.18, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Render Powerup Drop Pod
 */
export function drawPowerup(ctx: CanvasRenderingContext2D, item: PowerupItem) {
  ctx.save();
  ctx.translate(item.x, item.y);

  // Rotating holographic ring
  const pulse = Math.sin(Date.now() * 0.008) * 3;
  ctx.strokeStyle = item.type === 'shield' ? '#00f0ff' : item.type === 'torpedo' ? '#ff007f' : '#ffe600';
  ctx.shadowColor = ctx.strokeStyle;
  ctx.shadowBlur = 10;
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.arc(0, 0, 15 + pulse, 0, Math.PI * 2);
  ctx.stroke();

  // Container Pod
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(0, 0, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Icon symbol in center
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px Orbitron, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  let symbol = 'S';
  if (item.type === 'shield') symbol = '🛡️';
  else if (item.type === 'torpedo') symbol = '🚀';
  else if (item.type === 'hyper_laser') symbol = '⚡';
  else if (item.type === 'force_barrier') symbol = '✨';

  ctx.fillText(symbol, 0, 1);
  ctx.restore();
}

/**
 * Render Shockwave Ring
 */
export function drawShockwave(ctx: CanvasRenderingContext2D, sw: Shockwave) {
  ctx.save();
  ctx.strokeStyle = sw.color;
  ctx.shadowColor = sw.color;
  ctx.shadowBlur = 12;
  ctx.globalAlpha = Math.max(0, sw.alpha);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

/**
 * Death Star Trench Rebel Targeting Computer Grid (Classic wireframe HUD overlay)
 */
export function drawTargetingHUD(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  playerX: number,
  playerY: number,
  lockedEnemy: EnemyFighter | null
) {
  // Reticle around nearest/target enemy if available
  if (lockedEnemy) {
    ctx.save();
    ctx.translate(lockedEnemy.x, lockedEnemy.y);
    const boxSize = 26;
    ctx.strokeStyle = '#ff9f1a';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = '#ff9f1a';
    ctx.shadowBlur = 8;

    // Corner targeting brackets
    const bracketLen = 7;
    // Top-left
    ctx.beginPath();
    ctx.moveTo(-boxSize, -boxSize + bracketLen);
    ctx.lineTo(-boxSize, -boxSize);
    ctx.lineTo(-boxSize + bracketLen, -boxSize);
    ctx.stroke();
    // Top-right
    ctx.beginPath();
    ctx.moveTo(boxSize - bracketLen, -boxSize);
    ctx.lineTo(boxSize, -boxSize);
    ctx.lineTo(boxSize, -boxSize + bracketLen);
    ctx.stroke();
    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(-boxSize, boxSize - bracketLen);
    ctx.lineTo(-boxSize, boxSize);
    ctx.lineTo(-boxSize + bracketLen, boxSize);
    ctx.stroke();
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(boxSize - bracketLen, boxSize);
    ctx.lineTo(boxSize, boxSize);
    ctx.lineTo(boxSize, boxSize - bracketLen);
    ctx.stroke();

    // Distance read-out
    const dist = Math.round(Math.hypot(playerX - lockedEnemy.x, playerY - lockedEnemy.y));
    ctx.fillStyle = '#ff9f1a';
    ctx.font = '10px "Chakra Petch", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`LOCK: ${dist}m`, 0, boxSize + 14);

    ctx.restore();
  }
}
