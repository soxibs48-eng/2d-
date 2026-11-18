// ========================================================
// PIXEL RUNNER: COMBO & FEVER MODE SYSTEM (v3.0)
// ========================================================

class ComboSystem {
  constructor(game) {
    this.game = game;

    this.comboCount = 0;
    this.comboMultiplier = 1.0;
    this.maxMultiplier = 5.0;
    this.comboDecayTimer = 0;
    this.comboDecayTime = 3.2;

    this.feverMeter = 0; // 0 to 100%
    this.isFeverActive = false;
    this.feverDuration = 9.0;
    this.feverTimer = 0;

    // Visuals
    this.pulse = 0;
    this.speedLines = [];
    for (let i = 0; i < 25; i++) {
      this.speedLines.push({
        x: Math.random() * 1280,
        y: Math.random() * 720,
        len: 40 + Math.random() * 80,
        speed: 1400 + Math.random() * 600,
        alpha: 0.3 + Math.random() * 0.5
      });
    }
  }

  reset() {
    this.comboCount = 0;
    this.comboMultiplier = 1.0;
    this.comboDecayTimer = 0;
    this.feverMeter = 0;
    this.isFeverActive = false;
    this.feverTimer = 0;
  }

  addAction(actionType) {
    const isSparky = this.game.companionPet && this.game.companionPet.type === 'sparky';
    const rateBoost = isSparky ? 1.3 : 1.0;

    this.comboCount++;
    this.comboDecayTimer = this.comboDecayTime;

    let meterGain = 4;
    let multGain = 0.1;

    switch (actionType) {
      case 'coin':
        meterGain = 6;
        multGain = 0.15;
        break;
      case 'dodge':
        meterGain = 10;
        multGain = 0.25;
        break;
      case 'double_jump':
        meterGain = 4;
        multGain = 0.1;
        break;
      case 'slide':
        meterGain = 4;
        multGain = 0.1;
        break;
      case 'flip':
        meterGain = 8;
        multGain = 0.2;
        break;
    }

    this.comboMultiplier = Math.min(this.maxMultiplier, this.comboMultiplier + multGain);

    if (!this.isFeverActive) {
      this.feverMeter = Math.min(100, this.feverMeter + meterGain * rateBoost);
      if (this.feverMeter >= 100) {
        this.activateFever();
      }
    }
  }

  activateFever() {
    this.isFeverActive = true;
    this.feverMeter = 100;
    this.feverTimer = this.feverDuration;
    this.game.player.isHyper = true;

    AudioSys.playSFX('fever_start');
    CameraSys.addTrauma(0.5);
    ParticleSys.addShockwave(this.game.player.x, this.game.player.y + this.game.player.height / 2, '#ff00aa', 240, 500);
    ParticleSys.addFloatingText(640, 220, '🔥 FEVER HYPER MODE! (3X TANGALAR) 🔥', '#ff00d4', 22);

    if (this.game.dailyQuests) {
      this.game.dailyQuests.onFever();
    }
  }

  deactivateFever() {
    this.isFeverActive = false;
    this.feverMeter = 0;
    this.feverTimer = 0;
    this.game.player.isHyper = false;
    ParticleSys.addFloatingText(this.game.player.x, this.game.player.y - 25, 'FEVER TUGADI', '#88aacc', 14);
  }

  update(delta) {
    this.pulse += delta * 5;

    // 1. Decay normal combo if idle
    if (this.comboDecayTimer > 0) {
      this.comboDecayTimer -= delta;
      if (this.comboDecayTimer <= 0) {
        this.comboMultiplier = Math.max(1.0, this.comboMultiplier - delta * 1.5);
      }
    } else {
      this.comboMultiplier = Math.max(1.0, this.comboMultiplier - delta * 1.5);
    }

    // 2. Fever Active Countdown
    if (this.isFeverActive) {
      this.feverTimer -= delta;
      this.feverMeter = Math.max(0, (this.feverTimer / this.feverDuration) * 100);

      // Speed lines animation
      for (const sl of this.speedLines) {
        sl.x -= sl.speed * delta;
        if (sl.x < -100) {
          sl.x = 1350;
          sl.y = Math.random() * 720;
        }
      }

      if (this.feverTimer <= 0) {
        this.deactivateFever();
      }
    }
  }

  drawFeverEffects(ctx) {
    if (!this.isFeverActive) return;

    ctx.save();
    // 1. Hyper Speed lines
    ctx.strokeStyle = 'rgba(255, 0, 212, 0.45)';
    ctx.lineWidth = 2;
    for (const sl of this.speedLines) {
      ctx.beginPath();
      ctx.moveTo(sl.x, sl.y);
      ctx.lineTo(sl.x - sl.len, sl.y);
      ctx.stroke();
    }

    // 2. Chromatic Screen Edges Vignette
    const grad = ctx.createRadialGradient(640, 360, 400, 640, 360, 720);
    grad.addColorStop(0, 'rgba(255, 0, 200, 0)');
    grad.addColorStop(1, 'rgba(255, 0, 180, 0.22)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1280, 720);

    ctx.restore();
  }
}
