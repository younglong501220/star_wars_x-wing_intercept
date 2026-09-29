/**
 * Star Wars: X-Wing Intercept - Web Audio Synthesizer
 * Generates all SFX procedurally with zero external asset files.
 */

class SoundController {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  public volume: number = 0.7;

  constructor() {
    // Lazy initialization on user gesture
  }

  public init(): boolean {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return !!this.ctx;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public toggleMute(): boolean {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  // Classic X-Wing Quad/Dual Red Laser Sound (exponential frequency sweep)
  public laser(alternate: boolean = false) {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      const baseFreq = alternate ? 940 : 880;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.14);

      gain.gain.setValueAtTime(0.22 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.14);
    } catch {
      // Audio error ignored
    }
  }

  // TIE Fighter Green Laser (higher pitch, tighter beam sound)
  public tieLaser() {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.1);

      gain.gain.setValueAtTime(0.12 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch {}
  }

  // Proton Torpedo Launch
  public protonTorpedo() {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      
      // Low rumble sweep
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.35);

      gain.gain.setValueAtTime(0.35 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);

      // High lock-on screech
      const highOsc = this.ctx.createOscillator();
      const highGain = this.ctx.createGain();
      highOsc.type = 'sine';
      highOsc.frequency.setValueAtTime(600, now);
      highOsc.frequency.linearRampToValueAtTime(1200, now + 0.12);
      highGain.gain.setValueAtTime(0.15 * this.volume, now);
      highGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      highOsc.connect(highGain);
      highGain.connect(this.ctx.destination);
      highOsc.start(now);
      highOsc.stop(now + 0.2);
    } catch {}
  }

  // Explosion (Small, Medium, Heavy)
  public explosion(size: 'small' | 'medium' | 'heavy' = 'medium') {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const duration = size === 'heavy' ? 0.6 : size === 'medium' ? 0.35 : 0.2;
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      const initialFreq = size === 'heavy' ? 450 : size === 'medium' ? 650 : 900;
      filter.frequency.setValueAtTime(initialFreq, now);
      filter.frequency.linearRampToValueAtTime(60, now + duration);

      const gain = this.ctx.createGain();
      const peakGain = (size === 'heavy' ? 0.45 : size === 'medium' ? 0.3 : 0.18) * this.volume;
      gain.gain.setValueAtTime(peakGain, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      whiteNoise.start(now);

      // Add sub-bass thump for medium/heavy
      if (size !== 'small') {
        const sub = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(size === 'heavy' ? 120 : 160, now);
        sub.frequency.exponentialRampToValueAtTime(30, now + duration);
        subGain.gain.setValueAtTime(0.3 * this.volume, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        sub.connect(subGain);
        subGain.connect(this.ctx.destination);
        sub.start(now);
        sub.stop(now + duration);
      }
    } catch {}
  }

  // Astromech (R2-D2) cute whistle / chirp
  public r2Chirp() {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [1200, 1600, 2200, 1800, 2600];
      const startNote = notes[Math.floor(Math.random() * notes.length)];
      const endNote = notes[Math.floor(Math.random() * notes.length)];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(startNote, now);
      osc.frequency.linearRampToValueAtTime(endNote, now + 0.08);
      osc.frequency.linearRampToValueAtTime(startNote * 1.3, now + 0.16);

      gain.gain.setValueAtTime(0.12 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    } catch {}
  }

  // Shield damage alert tone
  public alarm() {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.setValueAtTime(650, now + 0.07);
      gain.gain.setValueAtTime(0.2 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch {}
  }

  // Shield Boost / Pickup / Powerup
  public powerup() {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const freqs = [330, 440, 554, 659, 880];
      freqs.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const t = now + idx * 0.04;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.12 * this.volume, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.08);
      });
    } catch {}
  }

  // Deflector Shield Activation
  public shieldActivate() {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.25);
      gain.gain.setValueAtTime(0.25 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch {}
  }

  // Hyperspace Jump Sound
  public hyperspace() {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.exponentialRampToValueAtTime(2400, now + 0.5);
      gain.gain.setValueAtTime(0.01 * this.volume, now);
      gain.gain.linearRampToValueAtTime(0.2 * this.volume, now + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.6);
    } catch {}
  }

  // Short Rebel victory motif
  public victoryFanfare() {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // D4, D4, D4, G4, D5, C5, B4, A4, G5, D5
      const notes = [
        { f: 293.66, d: 0.12, t: 0 },
        { f: 293.66, d: 0.12, t: 0.14 },
        { f: 293.66, d: 0.12, t: 0.28 },
        { f: 392.00, d: 0.4,  t: 0.42 },
        { f: 587.33, d: 0.4,  t: 0.85 },
      ];
      notes.forEach(({ f, d, t }) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + t);
        gain.gain.setValueAtTime(0.2 * this.volume, now + t);
        gain.gain.exponentialRampToValueAtTime(0.001, now + t + d);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + t);
        osc.stop(now + t + d);
      });
    } catch {}
  }
}

export const sound = new SoundController();
