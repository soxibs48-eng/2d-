// ==========================================
// PIXEL RUNNER: PLAYER CONTROLLER (v2.1 OVERHAUL)
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
    
    // Power-ups
    this.hasShield = false;
    this.magnetActive = false;
    this.doubleActive = false;
    this.gravityActive = false;
    this.isHyper = false; // Fever / Hyper mode!
    
    // Dash Ability (New Feature)
    this.isDashing = false;
    this.dashTimer = 0;
    this.dashDuration = 0.22;
    this.dashCooldown = 0;
    this.dashCooldownMax = 3.5;
    this.afterimages = [];
    
    this.magnetRadius = 280;
    this.skin = StorageManager.getEquippedSkin();
    
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
    this.isHyper = false;
    this.isDashing = false;
    this.dashTimer = 0;
    this.dashCooldown = 0;
    this.afterimages = [];
    this.skin = StorageManager.getEquippedSkin();
    this.loadSprites();
  }

  jump() {
    if (this.isOnSurface) {
      this.velocityY = this.isInverted ? this.jumpForce : -this.jumpForce;
      this.isOnSurface = false;
      this.isSliding = false;
      AudioSys.playSFX('jump');
      
      const footY = this.isInverted ? this.ceilingY : this.floorY;
      ParticleSys.emitJumpBurst(this.x, footY, this.getAccentColor(), this.isInverted);
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
    CameraSys.addTrauma(0.4);
    ParticleSys.addShockwave(this.x, this.y + this.height / 2, '#d844ff');
    ParticleSys.addFloatingText(this.x, this.y - 20, 'GRAVITY FLIP!', '#d844ff', 14);
    
    this.velocityY = this.isInverted ? -350 : 350;
    this.isOnSurface = false;
  }

  dash() {
    if (this.dashCooldown <= 0 && !this.isDashing) {
      this.isDashing = true;
      this.dashTimer = this.dashDuration;
      this.dashCooldown = this.dashCooldownMax;
      
      AudioSys.playSFX('powerup');
      CameraSys.addTrauma(0.35);
      ParticleSys.addShockwave(this.x, this.y + this.height / 2, '#00ffff');
      ParticleSys.addFloatingText(this.x, this.y - 30, 'CYBER DASH!', '#00ffff', 16);
    }
  }

  getAccentColor() {
    switch (this.skin) {
      case 'ninja': return '#ff1e8c';
      case 'mech': return '#ffd700';
      case 'valkyrie': return '#00ffcc';
      case 'synthwave': return '#b030ff';
      default: return '#00f0ff';
    }
  }

  update(delta, gameSpeed) {
    // Dash cooldown
    if (this.dashCooldown > 0) {
      this.dashCooldown = Math.max(0, this.dashCooldown - delta);
    }

    // Dash execution
    if (this.isDashing) {
      this.dashTimer -= delta;
      // Record afterimages
      this.afterimages.push({
        x: this.x,
        y: this.y,
        alpha: 0.8,
        isInverted: this.isInverted,
        isSliding: this.isSliding
      });
      if (this.dashTimer <= 0) {
        this.isDashing = false;
      }
    }

    // Update afterimages
    for (let i = this.afterimages.length - 1; i >= 0; i--) {
      this.afterimages[i].alpha -= delta * 5;
      if (this.afterimages[i].alpha <= 0) {
        this.afterimages.splice(i, 1);
      }
    }

    // Gravity calculation
    const currentGravity = this.isInverted ? -this.normalGravity : this.normalGravity;

    if (!this.isOnSurface && !this.isDashing) {
      this.velocityY += currentGravity * delta;
      this.velocityY = Math.max(-1200, Math.min(1200, this.velocityY));
    }

    if (!this.isDashing) {
      this.y += this.velocityY * delta;
    }

    // Surface bounds
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

    // Run particles
    if (this.isOnSurface) {
      const trailY = this.isInverted ? this.ceilingY + 4 : this.floorY - 4;
      const trailColor = this.isHyper ? '#ff00d4' : this.getAccentColor();
      ParticleSys.emitJetTrail(this.x - 14, trailY, trailColor, this.isSliding ? 3 : 1);
    }

    // Animation frames
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
    if (this.isDashing || this.isHyper) {
      // Invulnerable during dash and hyper mode!
      return true;
    }

    if (this.hasShield) {
      this.hasShield = false;
      AudioSys.playSFX('shield_break');
      CameraSys.addTrauma(0.55);
      ParticleSys.emitExplosion(this.x, this.y + this.height / 2, '#00f0ff', 20);
      ParticleSys.addFloatingText(this.x, this.y - 20, 'SHIELD BROKE!', '#00f0ff', 14);
      return true;
    }
    return false;
  }

  draw(ctx) {
    // 1. Draw Dash Afterimages
    for (const ghost of this.afterimages) {
      ctx.save();
      ctx.globalAlpha = ghost.alpha * 0.45;
      ctx.translate(ghost.x, ghost.y + (ghost.isInverted ? 0 : this.height / 2));
      if (ghost.isInverted) {
        ctx.scale(1, -1);
        ctx.translate(0, -this.height / 2);
      }
      ctx.fillStyle = '#00ffff';
      ctx.fillRect(-16, -24, 32, 48);
      ctx.restore();
    }

    // 2. Draw Main Player
    ctx.save();
    ctx.translate(this.x, this.y + (this.isInverted ? 0 : this.height / 2));

    if (this.isInverted) {
      ctx.scale(1, -1);
      ctx.translate(0, -this.height / 2);
    }

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
      // Glow filter if in Hyper mode
      if (this.isHyper) {
        ctx.shadowColor = '#ff00ff';
        ctx.shadowBlur = 15;
      }
      ctx.drawImage(sprite, -32, -32, 64, 64);
    } else {
      ctx.fillStyle = this.getAccentColor();
      if (this.isSliding) {
        ctx.fillRect(-24, 0, 48, 24);
      } else {
        ctx.fillRect(-16, -24, 32, 48);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, -18, 12, 8);
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
