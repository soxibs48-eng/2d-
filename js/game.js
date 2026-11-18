// ==========================================
// PIXEL RUNNER: MAIN GAME ENGINE
// ==========================================

class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    
    // Virtual resolution
    this.width = 1280;
    this.height = 720;

    // Difficulty curve parameters from TZ
    this.baseSpeed = 380;
    this.accelerationRate = 0.04;
    this.maxSpeed = 950;
    this.gameSpeed = 380;
    this.distance = 0;
    this.coins = 0;
    this.isNewRecord = false;

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
      // Audio unlock on user interaction
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
            this.player.slide();
          } else {
            this.player.fastFall(0.05);
          }
        }
      }

      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyF') {
        e.preventDefault();
        if (this.state === 'PLAYING' && (this.timers.gravity > 0 || this.state === 'TEST')) {
          this.player.flipGravity();
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

    // Touch controls
    const jumpBtn = document.getElementById('touch-jump');
    const slideBtn = document.getElementById('touch-slide');
    const flipBtn = document.getElementById('touch-flip');

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
        if (this.state === 'PLAYING') this.player.slide();
      });
    }

    if (flipBtn) {
      flipBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (this.state === 'PLAYING' && this.timers.gravity > 0) {
          this.player.flipGravity();
        }
      });
    }

    // Mouse click handling for canvas UI
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

    this.timers.magnet = 0;
    this.timers.gravity = 0;
    this.timers.double = 0;

    this.obstacles = [];
    this.pickups = [];
    this.player.reset();
    this.spawner.reset();

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
    CameraSys.addTrauma(0.8);

    this.isNewRecord = StorageManager.saveHighScore(this.distance);
    StorageManager.addCoins(this.coins);
  }

  update(delta) {
    CameraSys.update(delta);

    // Parallax background always scrolls for dynamic ambience
    const scrollSpeed = this.state === 'PLAYING' ? this.gameSpeed : 80;
    this.bgOffsets.sky = (this.bgOffsets.sky + scrollSpeed * 0.1 * delta) % 1280;
    this.bgOffsets.far = (this.bgOffsets.far + scrollSpeed * 0.3 * delta) % 1280;
    this.bgOffsets.mid = (this.bgOffsets.mid + scrollSpeed * 0.6 * delta) % 1280;
    this.bgOffsets.floor = (this.bgOffsets.floor + scrollSpeed * delta) % 256;
    this.bgOffsets.ceiling = (this.bgOffsets.ceiling + scrollSpeed * delta) % 256;

    if (this.state !== 'PLAYING') return;

    // Progress distance
    this.distance += (this.gameSpeed * delta) / 10;

    // Dynamic speed scaling from TZ formula
    this.gameSpeed = Math.min(this.baseSpeed + this.distance * this.accelerationRate, this.maxSpeed);

    // Power-up timers
    if (this.timers.magnet > 0) {
      this.timers.magnet = Math.max(0, this.timers.magnet - delta);
      this.player.magnetActive = this.timers.magnet > 0;
    }
    if (this.timers.gravity > 0) {
      this.timers.gravity = Math.max(0, this.timers.gravity - delta);
      this.player.gravityActive = this.timers.gravity > 0;
      const flipBtn = document.getElementById('touch-flip');
      if (flipBtn) flipBtn.style.display = this.timers.gravity > 0 ? 'block' : 'none';
    }
    if (this.timers.double > 0) {
      this.timers.double = Math.max(0, this.timers.double - delta);
      this.player.doubleActive = this.timers.double > 0;
    }

    // Player update
    this.player.update(delta, this.gameSpeed);

    // Spawner update
    this.spawner.update(delta, this.gameSpeed, this.obstacles, this.pickups);

    // Obstacles update & collision
    const pHitbox = this.player.getHitbox();

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.update(delta, this.gameSpeed);

      if (obs.isDead) {
        this.obstacles.splice(i, 1);
        continue;
      }

      // Check collision
      const oHitbox = obs.getHitbox();
      if (
        pHitbox.x < oHitbox.x + oHitbox.width &&
        pHitbox.x + pHitbox.width > oHitbox.x &&
        pHitbox.y < oHitbox.y + oHitbox.height &&
        pHitbox.y + pHitbox.height > oHitbox.y
      ) {
        if (obs.type === 'gravity_portal') {
          // Flip gravity safely!
          this.player.flipGravity();
          this.obstacles.splice(i, 1);
        } else if (obs.damage) {
          const survived = this.player.takeDamage();
          if (survived) {
            this.obstacles.splice(i, 1);
          } else {
            this.endGame();
            return;
          }
        }
      }
    }

    // Pickups update & collection
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
          this.coins += 1 * mult;
          AudioSys.playSFX('coin');
        } else if (p.type === 'shield') {
          this.player.hasShield = true;
          AudioSys.playSFX('powerup');
        } else if (p.type === 'magnet') {
          this.timers.magnet = Math.max(this.timers.magnet, 8.0);
          this.player.magnetActive = true;
          AudioSys.playSFX('powerup');
        } else if (p.type === 'gravity') {
          this.timers.gravity = Math.max(this.timers.gravity, 10.0);
          this.player.gravityActive = true;
          AudioSys.playSFX('powerup');
        } else if (p.type === 'double') {
          this.timers.double = Math.max(this.timers.double, 10.0);
          this.player.doubleActive = true;
          AudioSys.playSFX('powerup');
        }

        this.pickups.splice(i, 1);
      }
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.ctx.save();
    // Apply camera shake
    CameraSys.apply(this.ctx);

    // 1. Draw Parallax Backgrounds
    this.drawParallax();

    // 2. Draw Obstacles & Pickups
    for (const obs of this.obstacles) {
      obs.draw(this.ctx);
    }
    for (const p of this.pickups) {
      p.draw(this.ctx);
    }

    // 3. Draw Player
    if (this.state === 'PLAYING' || this.state === 'PAUSED') {
      this.player.draw(this.ctx);
    }

    this.ctx.restore();

    // 4. Draw UI Overlays
    this.ui.draw(this.ctx);
  }

  drawParallax() {
    const { ctx } = this;

    // Sky Layer
    if (this.bgImages.sky.complete && this.bgImages.sky.naturalWidth > 0) {
      const offX = -this.bgOffsets.sky;
      ctx.drawImage(this.bgImages.sky, offX, 0, 1280, 720);
      ctx.drawImage(this.bgImages.sky, offX + 1280, 0, 1280, 720);
    } else {
      ctx.fillStyle = '#0a0d1a';
      ctx.fillRect(0, 0, 1280, 720);
    }

    // Far Buildings Layer
    if (this.bgImages.far.complete && this.bgImages.far.naturalWidth > 0) {
      const offX = -this.bgOffsets.far;
      ctx.drawImage(this.bgImages.far, offX, 0, 1280, 720);
      ctx.drawImage(this.bgImages.far, offX + 1280, 0, 1280, 720);
    }

    // Mid Buildings Layer
    if (this.bgImages.mid.complete && this.bgImages.mid.naturalWidth > 0) {
      const offX = -this.bgOffsets.mid;
      ctx.drawImage(this.bgImages.mid, offX, 0, 1280, 720);
      ctx.drawImage(this.bgImages.mid, offX + 1280, 0, 1280, 720);
    }

    // Ceiling Track (Y: 76 to 140)
    const ceilOffX = -this.bgOffsets.ceiling;
    for (let x = ceilOffX - 256; x < 1280 + 256; x += 256) {
      if (this.bgImages.ceiling.complete && this.bgImages.ceiling.naturalWidth > 0) {
        ctx.drawImage(this.bgImages.ceiling, x, 76, 256, 64);
      } else {
        ctx.fillStyle = '#221533';
        ctx.fillRect(x, 76, 256, 64);
      }
    }

    // Floor Track (Y: 580 to 644)
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

// Start game when page loads
window.addEventListener('load', () => {
  window.pixelRunner = new Game();
});
