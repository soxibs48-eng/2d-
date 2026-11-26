// =======================================================
// PIXEL RUNNER: DYNAMIC WEATHER & TIME CYCLE SYSTEM (v3.0)
// =======================================================

class WeatherSystem {
  constructor(game) {
    this.game = game;

    // Time cycle: DAWN -> DAY -> SUNSET -> NIGHT
    this.timePhases = [
      { name: 'KUNDUZ (DAY)', duration: 350, r: 0, g: 0, b: 0, a: 0.0, skyTint: '#0d1326' },
      { name: 'SHOM (SUNSET)', duration: 250, r: 255, g: 80, b: 20, a: 0.16, skyTint: '#2b102f' },
      { name: 'TUN (NIGHT)', duration: 350, r: 5, g: 10, b: 30, a: 0.36, skyTint: '#030511' },
      { name: 'TONG (DAWN)', duration: 250, r: 180, g: 70, b: 160, a: 0.16, skyTint: '#1c1533' }
    ];

    this.currentPhaseIdx = 0;
    this.phaseDistance = 0;
    this.cycleDistanceTotal = 1200; // Total meters per full 24h day/night cycle
    this.currentAmbient = 'rgba(0, 0, 0, 0.0)';
    this.ambientAlpha = 0;

    // Weather types: CLEAR, RAIN, SNOW, CYBER_STORM
    this.weatherTypes = ['CLEAR', 'RAIN', 'SNOW', 'CYBER_STORM'];
    this.currentWeather = 'CLEAR';
    this.weatherTimer = 0;
    this.weatherDuration = 25; // seconds per weather pattern

    // Particle pools for performance (zero GC stutter)
    this.maxRain = 140;
    this.raindrops = [];
    for (let i = 0; i < this.maxRain; i++) {
      this.raindrops.push({
        x: Math.random() * 1400,
        y: Math.random() * 720,
        len: 14 + Math.random() * 16,
        speed: 850 + Math.random() * 400,
        color: Math.random() > 0.4 ? '#00f0ff' : '#0088ff'
      });
    }

    this.maxSnow = 70;
    this.snowflakes = [];
    for (let i = 0; i < this.maxSnow; i++) {
      this.snowflakes.push({
        x: Math.random() * 1280,
        y: Math.random() * 720,
        size: 1.5 + Math.random() * 2.5,
        speed: 120 + Math.random() * 90,
        drift: Math.random() * Math.PI * 2,
        color: '#e6ffff'
      });
    }

    // Parallax Night Stars (gentle calm glow, no high-frequency strobe)
    this.stars = [];
    for (let i = 0; i < 45; i++) {
      this.stars.push({
        x: Math.random() * 1280,
        y: Math.random() * 280,
        size: 1 + Math.random() * 1.5,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.5 + Math.random() * 0.7
      });
    }

    // Storm lightning effect
    this.lightningAlpha = 0;
    this.nextLightningTimer = 6.0;
  }

  reset() {
    this.currentPhaseIdx = 0;
    this.phaseDistance = 0;
    this.currentWeather = 'CLEAR';
    this.weatherTimer = 0;
    this.lightningAlpha = 0;
    this.currentAmbient = 'rgba(0, 0, 0, 0.0)';
    this.ambientAlpha = 0;
  }

  update(delta) {
    // 1. Advance Time Cycle based on distance
    const distDelta = this.game.gameSpeed * delta;
    this.phaseDistance += distDelta;

    const currentPhase = this.timePhases[this.currentPhaseIdx];
    if (this.phaseDistance >= currentPhase.duration) {
      this.phaseDistance -= currentPhase.duration;
      this.currentPhaseIdx = (this.currentPhaseIdx + 1) % this.timePhases.length;
    }

    // Smooth ambient transition across phases (zero abrupt color popping or flicker)
    const nextPhaseIdx = (this.currentPhaseIdx + 1) % this.timePhases.length;
    const curP = this.timePhases[this.currentPhaseIdx];
    const nxtP = this.timePhases[nextPhaseIdx];
    const progress = Math.min(1.0, this.phaseDistance / curP.duration);

    // Cross-fade smoothly in the last 35% of each phase
    let blend = 0;
    if (progress > 0.65) {
      blend = (progress - 0.65) / 0.35;
    }
    const curR = Math.round(curP.r + (nxtP.r - curP.r) * blend);
    const curG = Math.round(curP.g + (nxtP.g - curP.g) * blend);
    const curB = Math.round(curP.b + (nxtP.b - curP.b) * blend);
    const curA = curP.a + (nxtP.a - curP.a) * blend;
    this.currentAmbient = `rgba(${curR}, ${curG}, ${curB}, ${curA.toFixed(3)})`;
    this.ambientAlpha = curA;

    // 2. Weather cycle timer
    this.weatherTimer += delta;
    if (this.weatherTimer >= this.weatherDuration) {
      this.weatherTimer = 0;
      // In Stage 1: Mostly Clear or Rain
      // In Stage 2: Rain or Snow
      // In Stage 3: Cyber Storm or Clear
      if (this.game.gameMode === 'campaign' && this.game.currentStage === 3) {
        this.currentWeather = Math.random() > 0.4 ? 'CYBER_STORM' : 'RAIN';
      } else {
        const nextIdx = Math.floor(Math.random() * this.weatherTypes.length);
        this.currentWeather = this.weatherTypes[nextIdx];
      }
    }

    // 3. Update Raindrops
    if (this.currentWeather === 'RAIN' || this.currentWeather === 'CYBER_STORM') {
      const slantX = (this.game.gameSpeed * 0.45) * delta;
      for (let i = 0; i < this.raindrops.length; i++) {
        const r = this.raindrops[i];
        r.y += r.speed * delta;
        r.x -= slantX;
        if (r.y > 600 || r.x < -50) {
          // Splash ripple
          if (r.y >= 575 && Math.random() > 0.6) {
            ParticleSys.addRipple(r.x, 580, r.color);
          }
          r.y = -20;
          r.x = Math.random() * 1400;
        }
      }
    }

    // 4. Update Snowflakes
    if (this.currentWeather === 'SNOW') {
      for (let i = 0; i < this.snowflakes.length; i++) {
        const s = this.snowflakes[i];
        s.y += s.speed * delta;
        s.drift += delta * 2.5;
        s.x += Math.sin(s.drift) * 40 * delta - (this.game.gameSpeed * 0.15 * delta);
        if (s.y > 600) {
          s.y = -10;
          s.x = Math.random() * 1300;
        }
        if (s.x < -20) s.x = 1300;
      }
    }

    // 5. Update Stars
    for (let i = 0; i < this.stars.length; i++) {
      this.stars[i].twinkle += this.stars[i].twinkleSpeed * delta;
    }

    // 6. Cyber Storm Lightning Flash (smoother, capped trauma)
    if (this.currentWeather === 'CYBER_STORM') {
      this.nextLightningTimer -= delta;
      if (this.nextLightningTimer <= 0) {
        this.lightningAlpha = 0.45; // Soft illumination flash rather than harsh white strobe
        this.nextLightningTimer = 6 + Math.random() * 8;
        CameraSys.addTrauma(0.18);
        AudioSys.playSFX('thunder');
      }
    }

    if (this.lightningAlpha > 0) {
      this.lightningAlpha -= delta * 2.0;
      if (this.lightningAlpha < 0) this.lightningAlpha = 0;
    }
  }

  getCurrentPhaseName() {
    return this.timePhases[this.currentPhaseIdx].name;
  }

  getCurrentWeatherName() {
    switch (this.currentWeather) {
      case 'CLEAR': return 'MUSAFFO';
      case 'RAIN': return 'KIBER YOMG\'IR';
      case 'SNOW': return 'KIBER QOR';
      case 'CYBER_STORM': return 'KIBER BO\'RON';
      default: return this.currentWeather;
    }
  }

  drawBackgroundWeather(ctx) {
    const isNight = this.currentPhaseIdx === 2; // NIGHT
    const isDawn = this.currentPhaseIdx === 3;

    // Draw stars during night and dawn (gentle breathing glow, no harsh blinking)
    if (isNight || isDawn) {
      const alphaMult = isNight ? 0.7 : 0.35;
      ctx.save();
      for (let i = 0; i < this.stars.length; i++) {
        const st = this.stars[i];
        const alpha = (0.35 + 0.3 * Math.sin(st.twinkle)) * alphaMult;
        ctx.fillStyle = `rgba(180, 240, 255, ${alpha.toFixed(2)})`;
        ctx.fillRect(Math.floor(st.x), Math.floor(st.y), st.size, st.size);
      }
      ctx.restore();
    }
  }

  drawForegroundWeather(ctx) {
    ctx.save();

    // 1. Draw Rain
    if (this.currentWeather === 'RAIN' || this.currentWeather === 'CYBER_STORM') {
      ctx.lineWidth = 1.5;
      for (let i = 0; i < this.raindrops.length; i++) {
        const r = this.raindrops[i];
        ctx.strokeStyle = r.color;
        ctx.beginPath();
        ctx.moveTo(Math.floor(r.x), Math.floor(r.y));
        ctx.lineTo(Math.floor(r.x - 5), Math.floor(r.y + r.len));
        ctx.stroke();
      }
    }

    // 2. Draw Snow
    if (this.currentWeather === 'SNOW') {
      for (let i = 0; i < this.snowflakes.length; i++) {
        const s = this.snowflakes[i];
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(Math.floor(s.x), Math.floor(s.y), s.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 3. Ambient Lighting Tint for Time Cycle (seamless cross-fade)
    if (this.ambientAlpha > 0.005) {
      ctx.fillStyle = this.currentAmbient;
      ctx.fillRect(0, 0, 1280, 720);
    }

    // 4. Cyber Lightning Flash Overlay
    if (this.lightningAlpha > 0) {
      ctx.fillStyle = `rgba(200, 240, 255, ${this.lightningAlpha.toFixed(2)})`;
      ctx.fillRect(0, 0, 1280, 720);
    }

    ctx.restore();
  }
}
