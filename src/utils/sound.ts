// Web Audio API Retro Sound Effects Engine

class RetroAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // Check saved mute preference
    const saved = localStorage.getItem('retroforge_sound_muted');
    if (saved !== null) {
      this.isMuted = saved === 'true';
    }
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem('retroforge_sound_muted', String(this.isMuted));
    return this.isMuted;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    localStorage.setItem('retroforge_sound_muted', String(muted));
  }

  private playTone(freq: number, type: OscillatorType, duration: number, startVol = 0.15, endVol = 0.001) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(startVol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, endVol), this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio not permitted or failed
    }
  }

  // Classic Snake Eat
  public eat() {
    if (this.isMuted) return;
    this.playTone(520, 'square', 0.08, 0.12);
    setTimeout(() => {
      this.playTone(780, 'square', 0.1, 0.14);
    }, 40);
  }

  // Direction Change / Nav click
  public tick() {
    this.playTone(400, 'sine', 0.03, 0.04);
  }

  // Tetris Move / Rotate
  public rotate() {
    this.playTone(330, 'triangle', 0.06, 0.1);
  }

  // Tetris Drop / Lock
  public drop() {
    this.playTone(180, 'triangle', 0.08, 0.15);
  }

  // Tetris Line Clear
  public lineClear(lines = 1) {
    if (this.isMuted) return;
    const baseFreqs = [523.25, 659.25, 783.99, 1046.5]; // C, E, G, High C
    const count = Math.min(lines, 4);
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        this.playTone(baseFreqs[i], 'square', 0.12, 0.12);
      }, i * 65);
    }
  }

  // Platformer Jump
  public jump() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(160, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(620, this.ctx.currentTime + 0.16);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.16);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.16);
    } catch {
      // Audio fallback
    }
  }

  // Coin Collect
  public coin() {
    if (this.isMuted) return;
    this.playTone(987.77, 'sine', 0.08, 0.15); // B5
    setTimeout(() => {
      this.playTone(1318.51, 'sine', 0.28, 0.18); // E6
    }, 70);
  }

  // Ball Bounce on Paddle/Wall
  public bounce(high = false) {
    this.playTone(high ? 480 : 320, 'square', 0.05, 0.09);
  }

  // Brick Destroy
  public brickHit(tier = 1) {
    const freqs = [350, 440, 560, 700];
    const f = freqs[(tier - 1) % freqs.length];
    this.playTone(f, 'square', 0.08, 0.14);
  }

  // Powerup Collect
  public powerup() {
    if (this.isMuted) return;
    const notes = [330, 440, 550, 660, 880];
    notes.forEach((f, i) => {
      setTimeout(() => {
        this.playTone(f, 'square', 0.09, 0.12);
      }, i * 45);
    });
  }

  // Laser shot (Space Defender)
  public laser() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch {
      // Audio fallback
    }
  }

  // Alien explosion / generic explosion
  public explosion() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      // White noise explosion buffer
      const bufferSize = this.ctx.sampleRate * 0.25;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.25);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start();
      whiteNoise.stop(this.ctx.currentTime + 0.25);
    } catch {
      this.playTone(120, 'sawtooth', 0.2, 0.15);
    }
  }

  // Game Over
  public gameOver() {
    if (this.isMuted) return;
    const notes = [392, 370, 349, 311];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'sawtooth', 0.22, 0.15);
      }, idx * 140);
    });
  }

  // Stage Clear / Win
  public victory() {
    if (this.isMuted) return;
    const notes = [523, 659, 784, 1046, 784, 1046];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.18, 0.15);
      }, idx * 95);
    });
  }
}

export const sound = new RetroAudioEngine();
