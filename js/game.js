// ========================================================
// PIXEL RUNNER: MAIN GAME ENGINE (v3.0 EXTENDED EDITION)
// ========================================================

class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    this.width = 1280;
    this.height = 720;

    // Difficulty curve parameters
    this.baseSpeed = 380;
    this.accelerationRate = 0.04;
    this.maxSpeed = 980;
    this.gameSpeed = 380;
    this.distance = 0;
    this.coins = 0;
    this.isNewRecord = false;

    // Game Mode & Stage Progression (1-100 Stages)
    this.gameMode = 'campaign'; // 'campaign' or 'endless'
    this.currentStage = 1;
    this.levelSelectPage = 1;
    this.stageBonus = 0;

    // Game state: MENU, LEVEL_SELECT, PLAYING, PAUSED, STAGE_CLEAR, GAMEOVER, SHOP, PETS, QUESTS, SETTINGS
    this.state = 'MENU';

    // Core Entities and Systems (v3.0)
    this.player = new Player(this);
    this.weatherSys = new WeatherSystem(this);
    this.bgSys = new BackgroundSystem(this);
    this.companionPet = new CompanionPet(this);
    this.dailyQuests = new DailyQuestSystem(this);
    this.comboSys = new ComboSystem(this);
    this.spawner = new Spawner();
    this.boss = new CyberBoss(this);
    this.ui = new UIManager(this);

    this.obstacles = [];
    this.pickups = [];

    // Active power-up timers
    this.timers = {
      magnet: 0,
      gravity: 0,
      double: 0
    };

    // On-screen introductory controls guide timer (seconds)
    this.introGuideTimer = 6.0;

    // Parallax background layers
    this.bgOffsets = {
      sky: 0,
      far: 0,
      mid: 0,
      floor: 0,
      ceiling: 0
    };

    this.loadBackgrounds();
    this.bindInputs();

    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  getStageTarget(stageNum) {
    const s = StageDatabase.getStage(stageNum);
    return s ? s.targetDistance : 400;
  }

  loadBackgrounds() {
    this.bgImages = {
      sky: new Image(),
      far: new Image(),
      mid: new Image(),
      floor: new Image(),
      ceiling: new Image()
    };

    this.bgImages.sky.src = 'assets/sprites/background/sky.png';
    this.bgImages.far.src = 'assets/sprites/background/buildings_far.png';
    this.bgImages.mid.src = 'assets/sprites/background/buildings_mid.png';
    this.bgImages.floor.src = 'assets/sprites/background/floor.png';
    this.bgImages.ceiling.src = 'assets/sprites/background/ceiling.png';
  }

  bindInputs() {
    window.addEventListener('keydown', (e) => {
      AudioSys.init();
      AudioSys.resume();

      if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'Enter') {
        e.preventDefault();
        if (this.state === 'PLAYING') {
          this.player.jump();
        } else if (this.state === 'MENU') {
          this.jumpToHighestLevelPage();
          this.state = 'LEVEL_SELECT';
        } else if (this.state === 'CONTROLS_GUIDE') {
          this.startStage(1);
        } else if (this.state === 'LEVEL_SELECT') {
          const page = this.levelSelectPage || 1;
          const stages = StageDatabase.getStagesForPage(page);
          const unlocked = StorageManager.getUnlockedStages().map(Number);
          const playable = stages.filter(s => s.num === 1 || unlocked.includes(s.num));
          const targetStage = playable.length > 0 ? playable[playable.length - 1].num : 1;
          this.startStage(targetStage);
        } else if (this.state === 'GAMEOVER') {
          if (this.gameMode === 'campaign') this.startStage(this.currentStage);
          else this.startEndlessGame();
        } else if (this.state === 'STAGE_CLEAR') {
          if (this.currentStage < 100) this.startStage(this.currentStage + 1);
          else this.state = 'LEVEL_SELECT';
        } else if (this.state === 'PAUSED') {
          this.resumeGame();
        }
      }

      if (e.code === 'ArrowUp') {
        e.preventDefault();
        if (this.state === 'PLAYING') {
          this.player.jump();
        }
      }

      if (e.code === 'ArrowLeft') {
        if (this.state === 'LEVEL_SELECT') {
          e.preventDefault();
          this.prevLevelPage();
        }
      }
      if (e.code === 'ArrowRight') {
        if (this.state === 'LEVEL_SELECT') {
          e.preventDefault();
          this.nextLevelPage();
        }
      }

      if (e.code === 'Digit1' || e.code === 'Numpad1') {
        if (this.state === 'LEVEL_SELECT') this.startStage(1);
      }
      if (e.code === 'Digit2' || e.code === 'Numpad2') {
        if (this.state === 'LEVEL_SELECT') {
          const unlocked = StorageManager.getUnlockedStages().map(Number);
          if (unlocked.includes(2)) this.startStage(2);
        }
      }
      if (e.code === 'Digit3' || e.code === 'Numpad3') {
        if (this.state === 'LEVEL_SELECT') {
          const unlocked = StorageManager.getUnlockedStages().map(Number);
          if (unlocked.includes(3)) this.startStage(3);
        }
      }

      if (e.code === 'KeyS' || e.code === 'ArrowDown') {
        e.preventDefault();
        if (this.state === 'PLAYING') {
          if (this.player.isOnSurface) {
            this.player.startSlide();
          } else {
            this.player.fastFall(0.05);
          }
        }
      }

      if (e.code === 'KeyE') {
        e.preventDefault();
        if (this.state === 'PLAYING') {
          this.player.dash();
        }
      }

      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyF') {
        e.preventDefault();
        if (this.state === 'PLAYING' && (this.timers.gravity > 0 || this.player.isHyper)) {
          this.player.flipGravity();
        }
      }

      if (e.code === 'Escape' || e.code === 'KeyP') {
        e.preventDefault();
        if (this.state === 'PLAYING') {
          this.pauseGame();
        } else if (this.state === 'PAUSED') {
          this.resumeGame();
        } else if (['LEVEL_SELECT', 'SHOP', 'PETS', 'QUESTS', 'SETTINGS', 'CONTROLS_GUIDE', 'BACKGROUND_SELECT'].includes(this.state)) {
          this.state = 'MENU';
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'KeyS' || e.code === 'ArrowDown') {
        this.player.stopSlide();
      }
    });

    // Touch and On-Screen Click Controls
    const jumpBtn = document.getElementById('touch-jump');
    const slideBtn = document.getElementById('touch-slide');
    const flipBtn = document.getElementById('touch-flip');
    const dashBtn = document.getElementById('touch-dash');

    if (jumpBtn) {
      const doJump = (e) => {
        e.preventDefault();
        AudioSys.init();
        if (this.state === 'PLAYING') this.player.jump();
        else if (this.state === 'MENU') this.state = 'LEVEL_SELECT';
        else if (this.state === 'CONTROLS_GUIDE') this.startStage(1);
        else if (this.state === 'LEVEL_SELECT') this.startStage(1);
      };
      jumpBtn.addEventListener('touchstart', doJump);
      jumpBtn.addEventListener('mousedown', doJump);
    }

    if (slideBtn) {
      const startSlide = (e) => {
        e.preventDefault();
        if (this.state === 'PLAYING') this.player.startSlide();
      };
      const stopSlide = (e) => {
        e.preventDefault();
        this.player.stopSlide();
      };
      slideBtn.addEventListener('touchstart', startSlide);
      slideBtn.addEventListener('touchend', stopSlide);
      slideBtn.addEventListener('mousedown', startSlide);
      slideBtn.addEventListener('mouseup', stopSlide);
    }

    if (dashBtn) {
      const doDash = (e) => {
        e.preventDefault();
        if (this.state === 'PLAYING') this.player.dash();
      };
      dashBtn.addEventListener('touchstart', doDash);
      dashBtn.addEventListener('mousedown', doDash);
    }

    if (flipBtn) {
      const doFlip = (e) => {
        e.preventDefault();
        if (this.state === 'PLAYING' && (this.timers.gravity > 0 || this.player.isHyper)) {
          this.player.flipGravity();
        }
      };
      flipBtn.addEventListener('touchstart', doFlip);
      flipBtn.addEventListener('mousedown', doFlip);
    }

    const handleInputPos = (clientX, clientY, isRightClick = false) => {
      if (clientX === undefined || clientY === undefined) return;
      AudioSys.init();
      AudioSys.resume();
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      const x = (clientX - rect.left) * scaleX;
      const y = (clientY - rect.top) * scaleY;
      const handled = this.ui.handleClick(x, y);
      
      // If clicking directly on screen during gameplay (and not clicking Pause button):
      if (!handled && this.state === 'PLAYING') {
        if (isRightClick) {
          this.player.startSlide();
          setTimeout(() => this.player.stopSlide(), 450);
        } else {
          // ANY tap or left click on the screen makes the player JUMP! (2x/3x in air)
          this.player.jump();
        }
      }
    };

    this.canvas.addEventListener('click', (e) => {
      handleInputPos(e.clientX, e.clientY, e.button === 2);
    });

    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      if (this.state === 'PLAYING') {
        this.player.startSlide();
        setTimeout(() => this.player.stopSlide(), 450);
      }
    });

    this.canvas.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch' || e.pointerType === 'pen') {
        handleInputPos(e.clientX, e.clientY, false);
      }
    });

    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches.length > 0) {
        handleInputPos(e.touches[0].clientX, e.touches[0].clientY, false);
      }
    }, { passive: true });

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      this.ui.handleMouseMove((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
    });
  }

  updateTouchControlsVisibility() {
    const tc = document.getElementById('touch-controls');
    if (!tc) return;
    if (this.state === 'PLAYING') {
      tc.style.display = 'flex';
      const flipBtn = document.getElementById('touch-flip');
      if (flipBtn) {
        flipBtn.style.display = (this.timers.gravity > 0 || this.player.isHyper) ? 'block' : 'none';
      }
    } else {
      tc.style.display = 'none';
    }
  }

  nextLevelPage() {
    this.levelSelectPage = Math.min(10, (this.levelSelectPage || 1) + 1);
    AudioSys.playSFX('click');
  }

  prevLevelPage() {
    this.levelSelectPage = Math.max(1, (this.levelSelectPage || 1) - 1);
    AudioSys.playSFX('click');
  }

  jumpToHighestLevelPage() {
    const highest = StorageManager.getHighestUnlockedStage();
    this.levelSelectPage = Math.min(10, Math.floor((highest - 1) / 10) + 1);
    AudioSys.playSFX('powerup');
  }

  startStage(stageNum) {
    this.gameMode = 'campaign';
    this.currentStage = Math.max(1, Math.min(100, parseInt(stageNum, 10) || 1));
    this.resetGame();

    const stageData = StageDatabase.getStage(this.currentStage);
    const secIdx = stageData.sectorId;

    // Difficulty curve scaling per sector (1 to 10)
    this.baseSpeed = 380 + Math.min(240, Math.floor((this.currentStage - 1) / 10) * 24);
    this.spawner.minInterval = Math.max(0.85, 1.6 - (secIdx - 1) * 0.07);
    this.spawner.maxInterval = Math.max(1.3, 2.4 - (secIdx - 1) * 0.08);

    // Dynamic weather matching sector
    const weatherMap = ['CLEAR', 'RAIN', 'CLEAR', 'SNOW', 'CYBER_STORM', 'SNOW', 'RAIN', 'CLEAR', 'CYBER_STORM', 'CYBER_STORM'];
    this.weatherSys.currentWeather = weatherMap[secIdx - 1] || 'CLEAR';

    // If it's a boss stage, the boss will activate when reaching targetDistance
    this.state = 'PLAYING';
    AudioSys.startBGM();
    AudioSys.playSFX('powerup');
    ParticleSys.addFloatingText(640, 240, `${this.currentStage}-BOSQICH: ${stageData.targetDistance}M BOSHLANDI!`, '#00f0ff', 24);
  }

  startEndlessGame() {
    this.gameMode = 'endless';
    this.currentStage = 1;
    this.resetGame();
    this.baseSpeed = 380;
    this.spawner.minInterval = 1.5;
    this.spawner.maxInterval = 2.4;

    this.state = 'PLAYING';
    AudioSys.startBGM();
    AudioSys.playSFX('powerup');
    ParticleSys.addFloatingText(640, 240, 'CHEKSIZ REJIM BOSHLANDI!', '#ffaa00', 24);
  }

  resetGame() {
    this.gameSpeed = this.baseSpeed;
    this.distance = 0;
    this.coins = 0;
    this.isNewRecord = false;
    this.timers = { magnet: 0, gravity: 0, double: 0 };
    this.obstacles = [];
    this.pickups = [];

    this.player.reset();
    this.companionPet.reset();
    this.comboSys.reset();
    this.weatherSys.reset();
    this.spawner.reset();
    this.boss.reset();
    CameraSys.reset();
    ParticleSys.reset();
    this.introGuideTimer = 6.0;
  }

  completeCurrentStage() {
    this.state = 'STAGE_CLEAR';
    AudioSys.stopBGM();
    AudioSys.playSFX('quest_complete');
    CameraSys.addTrauma(0.5);

    const stageData = StageDatabase.getStage(this.currentStage);
    this.stageBonus = stageData ? stageData.coinBonus : (this.currentStage * 15);
    StorageManager.addCoins(this.coins + this.stageBonus);
    StorageManager.saveStageStars(this.currentStage, 3);
    if (this.currentStage < 100) {
      StorageManager.unlockStage(this.currentStage + 1);
    }

    ParticleSys.addShockwave(640, 360, '#00ffcc');
    const clearText = this.currentStage >= 100 ? '★ 100-BOSQICH G\'ALABASI! ★' : `★ ${this.currentStage}-BOSQICH: ${stageData.targetDistance}M YAKUNLANDI! ★`;
    ParticleSys.addFloatingText(640, 280, clearText, '#00ffcc', 26);
  }

  pauseGame() {
    this.state = 'PAUSED';
    AudioSys.playSFX('click');
  }

  resumeGame() {
    this.state = 'PLAYING';
    AudioSys.playSFX('click');
  }

  endGame() {
    this.state = 'GAMEOVER';
    AudioSys.stopBGM();
    AudioSys.playSFX('hit');
    CameraSys.addTrauma(0.85);

    ParticleSys.emitExplosion(this.player.x, this.player.y + 20, '#ff2255', 30);
    this.isNewRecord = StorageManager.saveHighScore(this.distance);
    StorageManager.addCoins(this.coins);
  }

  update(delta) {
    this.updateTouchControlsVisibility();
    CameraSys.update(delta);
    ParticleSys.update(delta);

    const scrollSpeed = this.state === 'PLAYING' ? this.gameSpeed : 80;
    this.bgOffsets.sky = (this.bgOffsets.sky + scrollSpeed * 0.1 * delta) % 1280;
    this.bgOffsets.far = (this.bgOffsets.far + scrollSpeed * 0.3 * delta) % 1280;
    this.bgOffsets.mid = (this.bgOffsets.mid + scrollSpeed * 0.6 * delta) % 1280;
    this.bgOffsets.floor = (this.bgOffsets.floor + scrollSpeed * delta) % 256;
    this.bgOffsets.ceiling = (this.bgOffsets.ceiling + scrollSpeed * delta) % 256;

    // Update Weather system in all active gameplay states
    this.weatherSys.update(delta);

    if (this.state !== 'PLAYING') return;

    if (this.introGuideTimer > 0) {
      this.introGuideTimer -= delta;
    }

    const frameDist = (this.gameSpeed * delta) / 10;
    this.distance += frameDist;

    // Daily Quests distance progression
    this.dailyQuests.onDistance(frameDist);

    // Stage Completion Check (Campaign Mode 1-100)
    if (this.gameMode === 'campaign') {
      const stageData = StageDatabase.getStage(this.currentStage);
      const target = stageData ? stageData.targetDistance : 400;

      if (stageData && stageData.isBoss) {
        // Milestone Boss Stage: trigger boss at target distance
        if (this.distance >= target && !this.boss.active && this.boss.state !== 'defeated') {
          this.boss.activate(stageData.boss.name, stageData.boss.hp);
        }
      } else {
        // Standard Stage: clear stage when target distance is reached
        if (this.distance >= target) {
          this.completeCurrentStage();
          return;
        }
      }
    }

    // Update Combo & Fever System
    this.comboSys.update(delta);

    this.gameSpeed = Math.min(this.baseSpeed + this.distance * this.accelerationRate, this.maxSpeed);

    // Power-up timers
    if (this.timers.magnet > 0) {
      this.timers.magnet = Math.max(0, this.timers.magnet - delta);
      this.player.magnetActive = this.timers.magnet > 0 || this.player.isHyper;
    } else {
      this.player.magnetActive = this.player.isHyper;
    }

    if (this.timers.gravity > 0) {
      this.timers.gravity = Math.max(0, this.timers.gravity - delta);
      this.player.gravityActive = this.timers.gravity > 0 || this.player.isHyper;
    }

    const flipBtn = document.getElementById('touch-flip');
    if (flipBtn) flipBtn.style.display = (this.timers.gravity > 0 || this.player.isHyper) ? 'block' : 'none';

    if (this.timers.double > 0) {
      this.timers.double = Math.max(0, this.timers.double - delta);
      this.player.doubleActive = this.timers.double > 0;
    }

    // Update Player & Companion Pet
    this.player.update(delta, this.gameSpeed);
    this.companionPet.update(delta);

    // Update Spawner with stage context
    this.spawner.update(delta, this.gameSpeed, this.obstacles, this.pickups, this.currentStage, this.boss.active);

    // Update Boss if active
    if (this.boss.active) {
      this.boss.update(delta, this.player);
    }

    // Obstacles collision
    const pHitbox = this.player.getHitbox();

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.update(delta, this.gameSpeed);

      if (obs.isDead) {
        // Clean dodge bonus
        this.comboSys.addAction('dodge');
        this.obstacles.splice(i, 1);
        continue;
      }

      const oHitbox = obs.getHitbox();
      if (
        pHitbox.x < oHitbox.x + oHitbox.width &&
        pHitbox.x + pHitbox.width > oHitbox.x &&
        pHitbox.y < oHitbox.y + oHitbox.height &&
        pHitbox.y + pHitbox.height > oHitbox.y
      ) {
        if (obs.type === 'gravity_portal') {
          this.player.flipGravity();
          this.obstacles.splice(i, 1);
        } else if (this.player.isHyper || this.player.isDashing) {
          ParticleSys.emitExplosion(obs.x, obs.y, '#ff00aa', 16);
          ParticleSys.addFloatingText(obs.x, obs.y, '+50 SMASH!', '#ff00aa', 16);
          this.coins += 2;
          this.comboSys.addAction('dodge');
          this.obstacles.splice(i, 1);
          AudioSys.playSFX('hit');
        } else if (obs.damage) {
          const survived = this.player.takeDamage();
          if (survived) {
            this.comboSys.comboMultiplier = 1.0;
            this.obstacles.splice(i, 1);
          } else {
            this.endGame();
            return;
          }
        }
      }
    }

    // Pickups collision
    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const p = this.pickups[i];
      p.update(delta, this.gameSpeed, this.player);

      if (p.isDead) {
        this.pickups.splice(i, 1);
        continue;
      }

      if (p.checkCollision(this.player)) {
        if (p.type === 'coin') {
          let gained = 1;
          if (this.comboSys.isFeverActive) {
            gained = 3; // 3X Coins in FEVER MODE!
            ParticleSys.addFloatingText(p.x, p.y - 12, '+3 FEVER!', '#ff00d4', 16);
          } else if (this.player.doubleActive) {
            gained = 2;
            ParticleSys.addFloatingText(p.x, p.y - 10, `+2`, '#ffd700', 14);
          } else {
            ParticleSys.addFloatingText(p.x, p.y - 10, `+1`, '#ffd700', 14);
          }

          this.coins += gained;
          this.comboSys.addAction('coin');
          this.dailyQuests.onCoin();

          AudioSys.playSFX('coin');
          ParticleSys.emitCoinSparkle(p.x, p.y);
        } else if (p.type === 'emp_orb') {
          // EMP Orb collected: deals damage to the boss!
          AudioSys.playSFX('powerup');
          ParticleSys.addShockwave(p.x, p.y, '#00ff66');
          ParticleSys.addFloatingText(p.x, p.y - 20, 'EMP LAUNCHED!', '#00ff66', 16);
          this.dailyQuests.onBossEMP();
          if (this.boss.active) {
            this.boss.takeDamage(25);
          }
        } else if (p.type === 'shield') {
          this.player.hasShield = true;
          AudioSys.playSFX('powerup');
          ParticleSys.addFloatingText(p.x, p.y - 15, 'SHIELD!', '#00f0ff', 16);
        } else if (p.type === 'magnet') {
          this.timers.magnet = Math.max(this.timers.magnet, 8.0);
          this.player.magnetActive = true;
          AudioSys.playSFX('powerup');
          ParticleSys.addFloatingText(p.x, p.y - 15, 'MAGNET!', '#ff4444', 16);
        } else if (p.type === 'gravity') {
          this.timers.gravity = Math.max(this.timers.gravity, 10.0);
          this.player.gravityActive = true;
          AudioSys.playSFX('powerup');
          ParticleSys.addFloatingText(p.x, p.y - 15, 'GRAVITY CORE!', '#d844ff', 16);
        } else if (p.type === 'double') {
          this.timers.double = Math.max(this.timers.double, 10.0);
          this.player.doubleActive = true;
          AudioSys.playSFX('powerup');
          ParticleSys.addFloatingText(p.x, p.y - 15, '2X MULTIPLIER!', '#ffd700', 16);
        }

        this.pickups.splice(i, 1);
      }
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.ctx.save();
    CameraSys.apply(this.ctx);

    // 1. Background Parallax
    this.drawParallax();

    // 2. Background Weather (Stars in Night/Dawn)
    this.weatherSys.drawBackgroundWeather(this.ctx);

    // 3. Obstacles & Pickups
    for (const obs of this.obstacles) {
      obs.draw(this.ctx);
    }
    for (const p of this.pickups) {
      p.draw(this.ctx);
    }

    // 4. Boss
    if (this.boss.active) {
      this.boss.draw(this.ctx);
    }

    // 5. Player & Companion Pet
    if (this.state === 'PLAYING' || this.state === 'PAUSED' || this.state === 'STAGE_CLEAR') {
      this.player.draw(this.ctx);
      this.companionPet.draw(this.ctx);
    }

    // 6. Particles
    ParticleSys.draw(this.ctx);

    // 7. Foreground Weather (Rain, Snow, Lightning & Ambient Tint)
    this.weatherSys.drawForegroundWeather(this.ctx);

    this.ctx.restore();

    // 8. Screen-space Fever FX
    this.comboSys.drawFeverEffects(this.ctx);

    // 9. UI Screens and HUD
    this.ui.draw(this.ctx);
  }

  drawParallax() {
    this.bgSys.drawParallax(this.ctx, this.bgOffsets);
  }

  loop(timestamp) {
    const delta = Math.min((timestamp - this.lastTime) / 1000, 0.1);
    this.lastTime = timestamp;

    this.update(delta);
    this.draw();

    requestAnimationFrame((t) => this.loop(t));
  }
}

window.addEventListener('load', () => {
  window.pixelRunner = new Game();
});
