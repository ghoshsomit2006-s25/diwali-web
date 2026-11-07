/**
 * Procedural Web Audio API sound effect generator for Diwali Digital Diya.
 * 100% synthesized SFX - zero external audio files.
 * Background music is handled by the YouTube player.
 */

class FestiveAudioEngine {
  private ctx: AudioContext | null = null;
  private sfxGain: GainNode | null = null;
  private masterGain: GainNode | null = null;

  private isSfxMuted = false;
  private isMusicPlaying = false;
  private baseSfxVolume = 1.0;

  private listeners = new Set<() => void>();

  public init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    this.ctx = new AudioContextClass();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.setValueAtTime(this.isMusicPlaying ? 0.65 : 1.0, this.ctx.currentTime);
    this.sfxGain.connect(this.masterGain);
  }

  // -------------------------------------------------------------
  // SFX: Diya Ignition Whoosh
  // -------------------------------------------------------------
  public playDiyaWhoosh() {
    if (this.isSfxMuted) return;
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;

    // Filtered noise swoosh
    const bufferSize = this.ctx.sampleRate * 0.8;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(200, t);
    filter.frequency.exponentialRampToValueAtTime(1200, t + 0.35);
    filter.frequency.exponentialRampToValueAtTime(400, t + 0.7);
    filter.Q.setValueAtTime(3.0, t);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.01, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.35, t + 0.25);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.75);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);

    whiteNoise.start(t);
    whiteNoise.stop(t + 0.8);

    // Warm resonant chime underpinning the ignition
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(440, t + 0.3);
    osc.frequency.exponentialRampToValueAtTime(330, t + 0.7);

    oscGain.gain.setValueAtTime(0.01, t);
    oscGain.gain.exponentialRampToValueAtTime(0.2, t + 0.2);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.75);

    osc.connect(oscGain);
    oscGain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.8);
  }

  // -------------------------------------------------------------
  // SFX: Temple Bell (Ghanti) Chime
  // -------------------------------------------------------------
  public playBellChime(freq = 880) {
    if (this.isSfxMuted) return;
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const partials = [
      { ratio: 1.0, gain: 0.35, decay: 1.8 },
      { ratio: 2.76, gain: 0.18, decay: 1.2 },
      { ratio: 5.4, gain: 0.08, decay: 0.7 },
      { ratio: 8.93, gain: 0.04, decay: 0.4 },
    ];

    partials.forEach((p) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * p.ratio, t);

      gain.gain.setValueAtTime(p.gain, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + p.decay);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(t);
      osc.stop(t + p.decay);
    });
  }

  // -------------------------------------------------------------
  // SFX: Firework Launch Whistle
  // -------------------------------------------------------------
  public playFireworkLaunch() {
    if (this.isSfxMuted) return;
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(1400, t + 0.55);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.2, t + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.65);
  }

  // -------------------------------------------------------------
  // SFX: Firework Burst / Boom
  // -------------------------------------------------------------
  public playFireworkBoom(deep = true) {
    if (this.isSfxMuted) return;
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const dur = deep ? 1.2 : 0.8;

    // Sub rumble
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(deep ? 95 : 140, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + dur);

    oscGain.gain.setValueAtTime(0.4, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    osc.connect(oscGain);
    oscGain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + dur);

    // Filtered explosion noise
    const bufferSize = Math.floor(this.ctx.sampleRate * dur);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(deep ? 350 : 600, t);
    filter.frequency.exponentialRampToValueAtTime(80, t + dur);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.35, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);

    noise.start(t);
    noise.stop(t + dur);
  }

  // -------------------------------------------------------------
  // SFX: Firework Crackles
  // -------------------------------------------------------------
  public playFireworkCrackle() {
    if (this.isSfxMuted) return;
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    const count = 7 + Math.floor(Math.random() * 5);
    for (let i = 0; i < count; i++) {
      const delay = 0.2 + Math.random() * 0.4;
      setTimeout(() => {
        if (!this.ctx || !this.sfxGain || this.isSfxMuted) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(1000 + Math.random() * 2000, t);

        gain.gain.setValueAtTime(0.05, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(t);
        osc.stop(t + 0.06);
      }, delay * 1000);
    }
  }

  // -------------------------------------------------------------
  // SFX: Sparkles / Shimmer Arpeggio
  // -------------------------------------------------------------
  public playSparkle() {
    if (this.isSfxMuted) return;
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    const notes = [1046.5, 1318.5, 1567.98, 2093.0];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        if (!this.ctx || !this.sfxGain || this.isSfxMuted) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(t);
        osc.stop(t + 0.32);
      }, idx * 60);
    });
  }

  // -------------------------------------------------------------
  // SFX: Golden Coin Shower Clink
  // -------------------------------------------------------------
  public playCoinSound() {
    if (this.isSfxMuted) return;
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, t); // B5
    osc.frequency.setValueAtTime(1318.51, t + 0.07); // E6

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.36);
  }

  // -------------------------------------------------------------
  // SFX Mute & Audio Coordination
  // -------------------------------------------------------------
  public toggleSfxMute(): boolean {
    this.isSfxMuted = !this.isSfxMuted;
    this.notify();
    return this.isSfxMuted;
  }

  public isMuted(): boolean {
    return this.isSfxMuted;
  }

  /**
   * Lower SFX volume slightly while background music is playing so
   * firework and diya sounds do not overpower the song.
   */
  public duckForMusic(isPlaying: boolean) {
    this.isMusicPlaying = isPlaying;
    if (this.ctx && this.sfxGain) {
      const targetGain = isPlaying ? 0.65 : 1.0;
      this.sfxGain.gain.setValueAtTime(this.sfxGain.gain.value, this.ctx.currentTime);
      this.sfxGain.gain.linearRampToValueAtTime(targetGain, this.ctx.currentTime + 0.3);
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch (err) {
        console.error('Audio listener error:', err);
      }
    });
  }
}

export const festiveAudio = new FestiveAudioEngine();
