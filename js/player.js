// ==========================================
// PIXEL RUNNER: PLAYER CONTROLLER
// ==========================================

class Player {
  constructor() {
    this.x = 220;
    this.y = 548;
    this.width = 36;
    this.height = 54;
    
    this.velocityY = 0;
    this.normalGravity = 1400;
    this.jumpForce = 580;
    this.fastFallAccel = 2400;
    
    this.isOnSurface = true;
    this.isInverted = false;
    
    this.isSliding = false;
    this.slideTimer = 0;
    this.slideDuration = 0.6;
    
    this.animTimer = 0;
    this.runFrame = 1;
    
    this.hasShield = false;
    this.magnetActive = false;
    this.doubleActive = false;
    this.gravityActive = false;
    
    this.magnetRadius = 260;
    this.skin = StorageManager.getEquippedSkin();
    
    // Floor and Ceiling bounds
    this.floorY = 580;
    this.ceilingY = 140;
    
    this.loadSprites();
  }

  loadSprites() {
    this.sprites = {};
    const skinName = this.skin || 'default';
    const poses = ['run1', 'run2', 'run3', 'run4', 'jump', 'slide'];
    poses.forEach(p => {
      const img = new Image();
      img.src = `assets/sprites/player/player_${skinName}_${p}.png`;
      this.sprites[p] = img;
    });

    this.shieldImg = new Image();
    this.shieldImg.src = 'assets/sprites/player/shield_bubble.png';
  }

  updateSkin(newSkin) {
    this.skin = newSkin;
    this.loadSprites();
  }

  reset() {
    this.isInverted = false;
    this.y = this.floorY - this.height;
    this.velocityY = 0;
    this.isOnSurface = true;
    this.isSliding = false;
    this.slideTimer = 0;
    this.hasShield = false;
    this.magnetActive = false;
    this.doubleActive = false;
    this.gravityActive = false;
    this.skin = StorageManager.getEquippedSkin();
    this.loadSprites();
  }

  jump() {
    if (this.isOnSurface) {
      this.velocityY = this.isInverted ? this.jumpForce : -this.jumpForce;
      this.isOnSurface = false;
      this.isSliding = false;
      AudioSys.playSFX('jump');
    }
  }

  slide() {
    if (this.isOnSurface) {
      if (!this.isSliding) {
        this.isSliding = true;
        this.slideTimer = this.slideDuration;
        AudioSys.playSFX('slide');
      }
    }
  }

  fastFall(delta) {
    if (!this.isOnSurface) {
      if (this.isInverted) {
        this.velocityY -= this.fastFallAccel * delta;
      } else {
        this.velocityY += this.fastFallAccel * delta;
      }
    }
  }

  flipGravity() {
    this.isInverted = !this.isInverted;
    AudioSys.playSFX('gravity_flip');
    CameraSys.addTrauma(0.35);
    this.velocityY = this.isInverted ? -350 : 350;
    this.isOnSurface = false;
  }

  update(delta, gameSpeed) {
    // Current gravity force
    const currentGravity = this.isInverted ? -this.normalGravity : this.normalGravity;

    // Apply gravity
    if (!this.isOnSurface) {
      this.velocityY += currentGravity * delta;
      this.velocityY = Math.max(-1200, Math.min(1200, this.velocityY));
    }

    this.y += this.velocityY * delta;

    // Floor and Ceiling collision resolution
    if (!this.isInverted) {
      const currentH = this.isSliding ? 26 : this.height;
      if (this.y + currentH >= this.floorY) {
        this.y = this.floorY - currentH;
        this.velocityY = 0;
        this.isOnSurface = true;
      } else {
        this.isOnSurface = false;
      }
    } else {
      if (this.y <= this.ceilingY) {
        this.y = this.ceilingY;
        this.velocityY = 0;
        this.isOnSurface = true;
      } else {
        this.isOnSurface = false;
      }
    }

    // Slide timer
    if (this.isSliding) {
      this.slideTimer -= delta;
      if (this.slideTimer <= 0 || !this.isOnSurface) {
        this.isSliding = false;
      }
    }

    // Animation frame progression
    if (this.isOnSurface && !this.isSliding) {
      this.animTimer += delta * (gameSpeed / 40);
      if (this.animTimer >= 1.0) {
        this.animTimer = 0;
        this.runFrame = (this.runFrame % 4) + 1;
      }
    }
  }

  getHitbox() {
    if (this.isSliding) {
      return {
        x: this.x - 24,
        y: this.isInverted ? this.y : this.y + 20,
        width: 48,
        height: 26
      };
    }
    return {
      x: this.x - 16,
      y: this.y,
      width: 32,
      height: this.height
    };
  }

  takeDamage() {
    if (this.hasShield) {
      this.hasShield = false;
      AudioSys.playSFX('shield_break');
      CameraSys.addTrauma(0.5);
      return true; // Survived
    }
    return false; // Fatal
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y + (this.isInverted ? 0 : this.height / 2));

    // Vertical flip for ceiling running
    if (this.isInverted) {
      ctx.scale(1, -1);
      ctx.translate(0, -this.height / 2);
    }

    // Pick sprite pose
    let pose = 'run1';
    if (this.isSliding) {
      pose = 'slide';
    } else if (!this.isOnSurface) {
      pose = 'jump';
    } else {
      pose = `run${this.runFrame}`;
    }

    const sprite = this.sprites[pose];
    if (sprite && sprite.complete && sprite.naturalWidth > 0) {
      ctx.drawImage(sprite, -32, -32, 64, 64);
    } else {
      // Procedural pixel-art fallback
      ctx.fillStyle = this.skin === 'mech' ? '#ffd700' : (this.skin === 'ninja' ? '#ff1e8c' : '#00f0ff');
      if (this.isSliding) {
        ctx.fillRect(-24, 0, 48, 24);
      } else {
        ctx.fillRect(-16, -24, 32, 48);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, -18, 12, 8); // Visor
      }
    }

    // Shield Bubble
    if (this.hasShield) {
      if (this.shieldImg && this.shieldImg.complete && this.shieldImg.naturalWidth > 0) {
        ctx.drawImage(this.shieldImg, -48, -48, 96, 96);
      } else {
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 40, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    ctx.restore();
  }
}
