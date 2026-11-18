// ==========================================
// PIXEL RUNNER: MAIN GAME ENGINE (v2.1 OVERHAUL)
// ==========================================

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

    // New Mechanics: Combo & Fever
    this.comboMultiplier = 1.0;
    this.maxCombo = 1.0;
    this.feverMeter = 0;
    this.hyperTimer = 0;

    // Game state: MENU, PLAYING, PAUSED, GAMEOVER, SHOP, SETTINGS
    this.state = 'MENU';

    // Entities
    this.player = new Player();
    this.spawner = new Spawner();
    this.ui = new UIManager(this);
    this.obstacles = [];
    this.pickups = [];

    // Active power-up timers
    this.timers = {
      magnet: 0,
      gravity: 0,
      double: 0
    };

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

      if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (this.state === 'PLAYING') {
          this.player.jump();
        } else if (this.state === 'MENU') {
          this.startGame();
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

      // Dash Ability (Key E)
      if (e.code === 'KeyE') {
        e.preventDefault();
        if (this.state === 'PLAYING') {
          this.player.dash();
        }
      }

      // Flip Gravity (Shift or F)
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyF') {
        e.preventDefault();
        if (this.state === 'PLAYING' && (this.timers.gravity > 0 || this.player.isHyper)) {
          this.player.flipGravity();
          this.feverMeter = Math.min(100, this.feverMeter + 8);
        }
      }

      if (e.code === 'Escape' || e.code === 'KeyP') {
        e.preventDefault();
        if (this.state === 'PLAYING') {
          this.pauseGame();
        } else if (this.state === 'PAUSED') {
          this.resumeGame();
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'KeyS' || e.code === 'ArrowDown') {
        this.player.stopSlide();
      }
    });

    // Touch controls
    const jumpBtn = document.getElementById('touch-jump');
    const slideBtn = document.getElementById('touch-slide');
    const flipBtn = document.getElementById('touch-flip');
    const dashBtn = document.getElementById('touch-dash');

    if (jumpBtn) {
      jumpBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        AudioSys.init();
        if (this.state === 'PLAYING') this.player.jump();
        else if (this.state === 'MENU') this.startGame();
      });
    }

    if (slideBtn) {
      slideBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (this.state === 'PLAYING') this.player.startSlide();
      });
      slideBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.player.stopSlide();
      });
    }

    if (dashBtn) {
      dashBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (this.state === 'PLAYING') this.player.dash();
      });
    }

    if (flipBtn) {
      flipBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (this.state === 'PLAYING' && (this.timers.gravity > 0 || this.player.isHyper)) {
          this.player.flipGravity();
          this.feverMeter = Math.min(100, this.feverMeter + 8);
        }
      });
    }

    // Canvas click & mouse position
    const getCanvasPos = (evt) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      return {
        x: (evt.clientX - rect.left) * scaleX,
        y: (evt.clientY - rect.top) * scaleY
      };
    };

    this.canvas.addEventListener('click', (e) => {
      AudioSys.init();
      AudioSys.resume();
      const pos = getCanvasPos(e);
      this.ui.handleClick(pos.x, pos.y);
    });

    this.canvas.addEventListener('mousemove', (e) => {
      const pos = getCanvasPos(e);
      this.ui.handleMouseMove(pos.x, pos.y);
    });
  }

  startGame() {
    this.state = 'PLAYING';
    this.distance = 0;
    this.coins = 0;
    this.gameSpeed = this.baseSpeed;
    this.isNewRecord = false;

    this.comboMultiplier = 1.0;
    this.maxCombo = 1.0;
    this.feverMeter = 0;
    this.hyperTimer = 0;

    this.timers.magnet = 0;
    this.timers.gravity = 0;
    this.timers.double = 0;

    this.obstacles = [];
    this.pickups = [];
    this.player.reset();
    this.spawner.reset();
    ParticleSys.reset();

    AudioSys.startBGM();

    const flipBtn = document.getElementById('touch-flip');
    if (flipBtn) flipBtn.style.display = 'none';
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

  triggerHyperMode() {
    this.hyperTimer = 6.0;
    this.player.isHyper = true;
    AudioSys.playSFX('powerup');
    CameraSys.addTrauma(0.4);
    ParticleSys.addShockwave(this.player.x, this.player.y + 20, '#ff00d4');
    ParticleSys.addFloatingText(this.player.x, 300, '★ HYPER DRIVE! ★', '#ff00d4', 24);
  }

  update(delta) {
    CameraSys.update(delta);
    ParticleSys.update(delta);

    // Parallax background scrolling
    const scrollSpeed = this.state === 'PLAYING' ? this.gameSpeed : 80;
    this.bgOffsets.sky = (this.bgOffsets.sky + scrollSpeed * 0.1 * delta) % 1280;
    this.bgOffsets.far = (this.bgOffsets.far + scrollSpeed * 0.3 * delta) % 1280;
    this.bgOffsets.mid = (this.bgOffsets.mid + scrollSpeed * 0.6 * delta) % 1280;
    this.bgOffsets.floor = (this.bgOffsets.floor + scrollSpeed * delta) % 256;
    this.bgOffsets.ceiling = (this.bgOffsets.ceiling + scrollSpeed * delta) % 256;

    if (this.state !== 'PLAYING') return;

    // Progress distance
    this.distance += (this.gameSpeed * delta) / 10;

    // Combo multiplier slowly ramps up during clean run
    this.comboMultiplier = Math.min(4.0, 1.0 + (this.distance / 250) * 0.2);
    this.maxCombo = Math.max(this.maxCombo, this.comboMultiplier);

    // Hyper mode timer
    if (this.hyperTimer > 0) {
      this.hyperTimer -= delta;
      if (this.hyperTimer <= 0) {
        this.player.isHyper = false;
        this.feverMeter = 0;
      }
    } else {
      // Natural slow decay of fever
      this.feverMeter = Math.max(0, this.feverMeter - delta * 1.5);
    }

    // Dynamic speed formula
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

    // Player update
    this.player.update(delta, this.gameSpeed);

    // Spawner update
    this.spawner.update(delta, this.gameSpeed, this.obstacles, this.pickups);

    // Obstacles collision
    const pHitbox = this.player.getHitbox();

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.update(delta, this.gameSpeed);

      if (obs.isDead) {
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
          this.feverMeter = Math.min(100, this.feverMeter + 10);
          this.obstacles.splice(i, 1);
        } else if (this.player.isHyper || this.player.isDashing) {
          // Smash obstacle during hyper or dash!
          ParticleSys.emitExplosion(obs.x, obs.y, '#ff00aa', 16);
          ParticleSys.addFloatingText(obs.x, obs.y, '+50 SMASH!', '#ff00aa', 16);
          this.coins += 2;
          this.obstacles.splice(i, 1);
          AudioSys.playSFX('hit');
        } else if (obs.damage) {
          const survived = this.player.takeDamage();
          if (survived) {
            this.comboMultiplier = 1.0; // Combo reset on hit
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
          const mult = this.player.doubleActive ? 2 : 1;
          const gained = Math.round(1 * mult * this.comboMultiplier);
          this.coins += gained;
          this.feverMeter = Math.min(100, this.feverMeter + 4);
          
          if (this.feverMeter >= 100 && this.hyperTimer <= 0) {
            this.triggerHyperMode();
          }

          AudioSys.playSFX('coin');
          ParticleSys.emitCoinSparkle(p.x, p.y);
          ParticleSys.addFloatingText(p.x, p.y - 10, `+${gained}`, '#ffd700', 14);
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

    // Dynamic Biome tinting
    this.drawParallax();

    for (const obs of this.obstacles) {
      obs.draw(this.ctx);
    }
    for (const p of this.pickups) {
      p.draw(this.ctx);
    }

    if (this.state === 'PLAYING' || this.state === 'PAUSED') {
      this.player.draw(this.ctx);
    }

    // Draw Particles on top of world
    ParticleSys.draw(this.ctx);

    this.ctx.restore();

    // Draw UI Overlays
    this.ui.draw(this.ctx);
  }

  drawParallax() {
    const { ctx } = this;

    // Apply Biome hue based on distance
    ctx.save();
    if (this.distance > 1200) {
      // Emerald Cyber Core
      ctx.filter = 'hue-rotate(90deg) saturate(1.2)';
    } else if (this.distance > 500) {
      // Synthwave Sunset
      ctx.filter = 'hue-rotate(280deg) saturate(1.3)';
    }

    // Sky
    if (this.bgImages.sky.complete && this.bgImages.sky.naturalWidth > 0) {
      const offX = -this.bgOffsets.sky;
      ctx.drawImage(this.bgImages.sky, offX, 0, 1280, 720);
      ctx.drawImage(this.bgImages.sky, offX + 1280, 0, 1280, 720);
    } else {
      ctx.fillStyle = '#0a0d1a';
      ctx.fillRect(0, 0, 1280, 720);
    }

    // Far Buildings
    if (this.bgImages.far.complete && this.bgImages.far.naturalWidth > 0) {
      const offX = -this.bgOffsets.far;
      ctx.drawImage(this.bgImages.far, offX, 0, 1280, 720);
      ctx.drawImage(this.bgImages.far, offX + 1280, 0, 1280, 720);
    }

    // Mid Buildings
    if (this.bgImages.mid.complete && this.bgImages.mid.naturalWidth > 0) {
      const offX = -this.bgOffsets.mid;
      ctx.drawImage(this.bgImages.mid, offX, 0, 1280, 720);
      ctx.drawImage(this.bgImages.mid, offX + 1280, 0, 1280, 720);
    }

    ctx.restore(); // Restore filter

    // Ceiling Track
    const ceilOffX = -this.bgOffsets.ceiling;
    for (let x = ceilOffX - 256; x < 1280 + 256; x += 256) {
      if (this.bgImages.ceiling.complete && this.bgImages.ceiling.naturalWidth > 0) {
        ctx.drawImage(this.bgImages.ceiling, x, 76, 256, 64);
      } else {
        ctx.fillStyle = '#221533';
        ctx.fillRect(x, 76, 256, 64);
      }
    }

    // Floor Track
    const floorOffX = -this.bgOffsets.floor;
    for (let x = floorOffX - 256; x < 1280 + 256; x += 256) {
      if (this.bgImages.floor.complete && this.bgImages.floor.naturalWidth > 0) {
        ctx.drawImage(this.bgImages.floor, x, 580, 256, 64);
      } else {
        ctx.fillStyle = '#162233';
        ctx.fillRect(x, 580, 256, 64);
      }
    }
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
