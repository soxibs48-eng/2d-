// =======================================================
// PIXEL RUNNER: DYNAMIC WEATHER & TIME CYCLE SYSTEM (v3.0)
// =======================================================

class WeatherSystem {
  constructor(game) {
    this.game = game;

    // Time cycle: DAWN -> DAY -> SUNSET -> NIGHT
    this.timePhases = [
      { name: 'KUNDUZ (DAY)', duration: 350, ambient: 'rgba(0, 0, 0, 0.0)', skyTint: '#0d1326' },
      { name: 'SHOM (SUNSET)', duration: 250, ambient: 'rgba(255, 80, 20, 0.18)', skyTint: '#2b102f' },
      { name: 'TUN (NIGHT)', duration: 350, ambient: 'rgba(5, 10, 30, 0.42)', skyTint: '#030511' },
      { name: 'TONG (DAWN)', duration: 250, ambient: 'rgba(180, 70, 160, 0.18)', skyTint: '#1c1533' }
    ];

    this.currentPhaseIdx = 0;
    this.phaseDistance = 0;
    this.cycleDistanceTotal = 1200; // Total meters per full 24h day/night cycle

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

    // Parallax Night Stars
    this.stars = [];
    for (let i = 0; i < 60; i++) {
      this.stars.push({
        x: Math.random() * 1280,
        y: Math.random() * 320,
        size: 1 + Math.random() * 2,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: 2 + Math.random() * 3
      });
    }

    // Storm lightning effect
    this.lightningAlpha = 0;
    this.nextLightningTimer = 4.0;
  }

  reset() {
    this.currentPhaseIdx = 0;
    this.phaseDistance = 0;
    this.currentWeather = 'CLEAR';
    this.weatherTimer = 0;
    this.lightningAlpha = 0;
  }

  update(delta) {
    // 1. Advance Time Cycle based on distance
    const distDelta = this.game.gameSpeed * delta;
    this.phaseDistance += distDelta;

    const currentPhase = this.timePhases[this.currentPhaseIdx];
    if (this.phaseDistance >= currentPhase.duration) {
      this.phaseDistance = 0;
      this.currentPhaseIdx = (this.currentPhaseIdx + 1) % this.timePhases.length;
    }

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

    // 6. Cyber Storm Lightning Flash
    if (this.currentWeather === 'CYBER_STORM') {
      this.nextLightningTimer -= delta;
      if (this.nextLightningTimer <= 0) {
        this.lightningAlpha = 0.75;
        this.nextLightningTimer = 5 + Math.random() * 7;
        CameraSys.addTrauma(0.3);
        AudioSys.playSFX('thunder');
      }
    }

    if (this.lightningAlpha > 0) {
      this.lightningAlpha -= delta * 2.8;
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

    // Draw stars during night and dawn
    if (isNight || isDawn) {
      const alphaMult = isNight ? 0.9 : 0.4;
      ctx.save();
      for (let i = 0; i < this.stars.length; i++) {
        const st = this.stars[i];
        const alpha = Math.abs(Math.sin(st.twinkle)) * alphaMult;
        ctx.fillStyle = `rgba(180, 240, 255, ${alpha})`;
        ctx.fillRect(st.x, st.y, st.size, st.size);
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
        ctx.moveTo(r.x, r.y);
        ctx.lineTo(r.x - 5, r.y + r.len);
        ctx.stroke();
      }
    }

    // 2. Draw Snow
    if (this.currentWeather === 'SNOW') {
      for (let i = 0; i < this.snowflakes.length; i++) {
        const s = this.snowflakes[i];
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 3. Ambient Lighting Tint for Time Cycle
    const currentPhase = this.timePhases[this.currentPhaseIdx];
    if (currentPhase.ambient !== 'rgba(0, 0, 0, 0.0)') {
      ctx.fillStyle = currentPhase.ambient;
      ctx.fillRect(0, 0, 1280, 720);
    }

    // 4. Cyber Lightning Flash Overlay
    if (this.lightningAlpha > 0) {
      ctx.fillStyle = `rgba(200, 240, 255, ${this.lightningAlpha})`;
      ctx.fillRect(0, 0, 1280, 720);
    }

    ctx.restore();
  }
}
