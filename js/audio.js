// ==========================================
// PIXEL RUNNER: WEB AUDIO API SYNTHESIZER
// ==========================================

class AudioManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.bgmPlaying = false;
    this.bgmTimer = null;
    this.isMuted = false;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    
    this.ctx = new AudioContext();
    
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = StorageManager.getMasterVolume();
    this.masterGain.connect(this.ctx.destination);
    
    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = StorageManager.getMusicVolume();
    this.musicGain.connect(this.masterGain);
    
    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = StorageManager.getSFXVolume();
    this.sfxGain.connect(this.masterGain);
    
    this.initialized = true;
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playSFX(type) {
    this.init();
    this.resume();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    gain.connect(this.sfxGain);
    osc.connect(gain);

    switch (type) {
      case 'jump':
        osc.type = 'square';
        osc.frequency.setValueAtTime(220, t);
        osc.frequency.exponentialRampToValueAtTime(600, t + 0.15);
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.15);
        osc.start(t);
        osc.stop(t + 0.15);
        break;

      case 'slide':
        // White noise whoosh
        this.playNoise(0.18, 0.25);
        break;

      case 'gravity_flip':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, t);
        osc.frequency.linearRampToValueAtTime(950, t + 0.14);
        osc.frequency.linearRampToValueAtTime(450, t + 0.28);
        gain.gain.setValueAtTime(0.35, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.28);
        osc.start(t);
        osc.stop(t + 0.28);
        break;

      case 'coin':
        // Bright two-tone bell (B5 -> E6)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(987, t);
        osc.frequency.setValueAtTime(1318, t + 0.06);
        gain.gain.setValueAtTime(0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        osc.start(t);
        osc.stop(t + 0.25);
        break;

      case 'powerup':
        // Ascending 4-tone arpeggio
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, idx) => {
          const o = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          o.type = 'triangle';
          o.frequency.value = freq;
          o.connect(g);
          g.connect(this.sfxGain);
          const start = t + idx * 0.07;
          g.gain.setValueAtTime(0.3, start);
          g.gain.linearRampToValueAtTime(0.01, start + 0.12);
          o.start(start);
          o.stop(start + 0.12);
        });
        break;

      case 'shield_break':
        this.playNoise(0.25, 0.4);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1200, t);
        osc.frequency.exponentialRampToValueAtTime(200, t + 0.22);
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.22);
        osc.start(t);
        osc.stop(t + 0.22);
        break;

      case 'hit':
        this.playNoise(0.35, 0.5);
        osc.type = 'square';
        osc.frequency.setValueAtTime(160, t);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.3);
        gain.gain.setValueAtTime(0.4, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.3);
        osc.start(t);
        osc.stop(t + 0.3);
        break;

      case 'click':
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, t);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.04);
        osc.start(t);
        osc.stop(t + 0.04);
        break;

      case 'fever_start':
        // Epic hyper drive sweep
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, t);
        osc.frequency.exponentialRampToValueAtTime(1400, t + 0.4);
        gain.gain.setValueAtTime(0.4, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.45);
        osc.start(t);
        osc.stop(t + 0.45);
        break;

      case 'quest_complete':
        // Victorious fanfare chimes
        [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((freq, idx) => {
          const o = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          o.type = 'sine';
          o.frequency.value = freq;
          o.connect(g);
          g.connect(this.sfxGain);
          const st = t + idx * 0.08;
          g.gain.setValueAtTime(0.35, st);
          g.gain.exponentialRampToValueAtTime(0.001, st + 0.28);
          o.start(st);
          o.stop(st + 0.28);
        });
        break;

      case 'thunder':
        this.playNoise(0.7, 0.55);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(80, t);
        osc.frequency.exponentialRampToValueAtTime(30, t + 0.6);
        gain.gain.setValueAtTime(0.45, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.6);
        osc.start(t);
        osc.stop(t + 0.6);
        break;

      case 'pet_action':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, t);
        osc.frequency.exponentialRampToValueAtTime(1760, t + 0.15);
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.15);
        osc.start(t);
        osc.stop(t + 0.15);
        break;
    }
  }

  playNoise(duration, volume) {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.connect(this.sfxGain);
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + duration);
    noise.connect(gain);
    noise.start();
  }

  startBGM() {
    this.init();
    this.resume();
    if (this.bgmPlaying || !this.ctx) return;
    this.bgmPlaying = true;

    // Upbeat 8-bar loopable synthwave chiptune
    const bpm = 126;
    const beatDur = 60 / bpm;
    const melody = [
      440, 523, 659, 880,  349, 440, 523, 698,
      523, 659, 783, 1046, 392, 493, 587, 783
    ];
    const bass = [110, 87.3, 130.8, 98.0]; // Am, F, C, G

    let beat = 0;
    const playStep = () => {
      if (!this.bgmPlaying || !this.ctx) return;
      const t = this.ctx.currentTime;
      
      // Melody note
      const mOsc = this.ctx.createOscillator();
      const mGain = this.ctx.createGain();
      mOsc.type = 'square';
      mOsc.frequency.setValueAtTime(melody[beat % 16], t);
      mGain.gain.setValueAtTime(0.08, t);
      mGain.gain.exponentialRampToValueAtTime(0.005, t + beatDur * 0.85);
      mOsc.connect(mGain);
      mGain.connect(this.musicGain);
      mOsc.start(t);
      mOsc.stop(t + beatDur);

      // Bass note
      const bOsc = this.ctx.createOscillator();
      const bGain = this.ctx.createGain();
      bOsc.type = 'triangle';
      bOsc.frequency.setValueAtTime(bass[Math.floor(beat / 4) % 4], t);
      bGain.gain.setValueAtTime(0.14, t);
      bGain.gain.exponentialRampToValueAtTime(0.01, t + beatDur);
      bOsc.connect(bGain);
      bGain.connect(this.musicGain);
      bOsc.start(t);
      bOsc.stop(t + beatDur);

      beat = (beat + 1) % 16;
      this.bgmTimer = setTimeout(playStep, beatDur * 1000);
    };

    playStep();
  }

  stopBGM() {
    this.bgmPlaying = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  setMasterVolume(val) {
    if (this.masterGain) this.masterGain.gain.value = val;
  }

  setMusicVolume(val) {
    if (this.musicGain) this.musicGain.gain.value = val;
  }

  setSFXVolume(val) {
    if (this.sfxGain) this.sfxGain.gain.value = val;
  }
}

const AudioSys = new AudioManager();
