// ==========================================
// PIXEL RUNNER: PLAYER CONTROLLER (v2.2 DOUBLE/TRIPLE JUMP & SLIDE)
// ==========================================

class Player {
  constructor(game = null) {
    this.game = game;
    this.x = 220;
    this.y = 548;
    this.width = 36;
    this.height = 54;
    
    this.velocityY = 0;
    this.normalGravity = 1400;
    this.jumpForce = 580;
    this.fastFallAccel = 2600;
    
    this.isOnSurface = true;
    this.isInverted = false;
    
    // Jump mechanics (2-3 times mid-air jump)
    this.jumpCount = 0;
    this.maxJumps = 2; // Default: Double Jump! (Can be 3 in Hyper mode)
    
    // Slide / Yotish mechanics
    this.isSliding = false;
    this.slideHeld = false; // Continues while button/key held!
    this.slideTimer = 0;
    this.slideMinDuration = 0.45;
    
    this.animTimer = 0;
    this.runFrame = 1;
    
    // Power-ups
    this.hasShield = false;
    this.magnetActive = false;
    this.doubleActive = false;
    this.gravityActive = false;
    this.isHyper = false;
    
    // Dash Ability
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
    this.jumpCount = 0;
    this.isSliding = false;
    this.slideHeld = false;
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
    // Determine maximum allowed jumps (3 in Hyper mode, 2 normally)
    const allowedJumps = this.isHyper ? 3 : this.maxJumps;

    if (this.isOnSurface) {
      // 1st Jump: From surface
      this.velocityY = this.isInverted ? this.jumpForce : -this.jumpForce;
      this.isOnSurface = false;
      this.isSliding = false;
      this.jumpCount = 1;
      AudioSys.playSFX('jump');
      
      const footY = this.isInverted ? this.ceilingY : this.floorY;
      ParticleSys.emitJumpBurst(this.x, footY, this.getAccentColor(), this.isInverted);
    } else if (this.jumpCount < allowedJumps) {
      // Mid-Air Jump: Double Jump (2-marta sakrash) or Triple Jump!
      this.jumpCount++;
      const airForce = this.jumpForce * 0.95;
      this.velocityY = this.isInverted ? airForce : -airForce;
      this.isSliding = false;
      
      AudioSys.playSFX('jump');
      
      const burstColor = this.jumpCount === 2 ? '#00ffff' : '#ff00d4';
      ParticleSys.emitJumpBurst(this.x, this.y + this.height / 2, burstColor, this.isInverted);
      
      const jumpText = this.jumpCount === 2 ? 'DOUBLE JUMP!' : 'TRIPLE JUMP!';
      ParticleSys.addFloatingText(this.x, this.y - 25, jumpText, burstColor, 15);

      if (this.game) {
        if (this.game.comboSys) this.game.comboSys.addAction('double_jump');
        if (this.game.dailyQuests) this.game.dailyQuests.onDoubleJump();
      }
    }
  }

  startSlide() {
    this.slideHeld = true;
    if (this.isOnSurface) {
      if (!this.isSliding) {
        this.isSliding = true;
        this.slideTimer = this.slideMinDuration;
        AudioSys.playSFX('slide');
        ParticleSys.addFloatingText(this.x, this.y - 15, 'SLIDE!', '#ffaa00', 13);
        if (this.game) {
          if (this.game.comboSys) this.game.comboSys.addAction('slide');
          if (this.game.dailyQuests) this.game.dailyQuests.onSlide();
        }
      }
    }
  }

  stopSlide() {
    this.slideHeld = false;
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
    ParticleSys.addFloatingText(this.x, this.y - 20, 'GRAVITY FLIP!', '#d844ff', 15);
    
    if (this.game) {
      if (this.game.comboSys) this.game.comboSys.addAction('flip');
      if (this.game.dailyQuests) this.game.dailyQuests.onGravityFlip();
    }
    
    this.velocityY = this.isInverted ? -360 : 360;
    this.isOnSurface = false;
    this.jumpCount = 1; // Can still perform mid-air double jump!
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

    // Afterimages decay
    for (let i = this.afterimages.length - 1; i >= 0; i--) {
      this.afterimages[i].alpha -= delta * 5;
      if (this.afterimages[i].alpha <= 0) {
        this.afterimages.splice(i, 1);
      }
    }

    // Gravity force
    const currentGravity = this.isInverted ? -this.normalGravity : this.normalGravity;

    if (!this.isOnSurface && !this.isDashing) {
      this.velocityY += currentGravity * delta;
      this.velocityY = Math.max(-1250, Math.min(1250, this.velocityY));
    }

    if (!this.isDashing) {
      this.y += this.velocityY * delta;
    }

    // Surface bounds & collision
    const currentH = this.isSliding ? 20 : this.height;

    if (!this.isInverted) {
      if (this.y + currentH >= this.floorY) {
        this.y = this.floorY - currentH;
        this.velocityY = 0;
        this.isOnSurface = true;
        this.jumpCount = 0; // Reset jumps upon landing!
      } else {
        this.isOnSurface = false;
      }
    } else {
      if (this.y <= this.ceilingY) {
        this.y = this.ceilingY;
        this.velocityY = 0;
        this.isOnSurface = true;
        this.jumpCount = 0; // Reset jumps upon landing on ceiling!
      } else {
        this.isOnSurface = false;
      }
    }

    // Slide duration logic
    if (this.isSliding) {
      this.slideTimer -= delta;
      if ((!this.slideHeld && this.slideTimer <= 0) || !this.isOnSurface) {
        this.isSliding = false;
      }
    }

    // Run / Slide trail particles
    if (this.isOnSurface) {
      const trailY = this.isInverted ? this.ceilingY + 4 : this.floorY - 4;
      const trailColor = this.isHyper ? '#ff00d4' : (this.isSliding ? '#ffaa00' : this.getAccentColor());
      ParticleSys.emitJetTrail(this.x - 14, trailY, trailColor, this.isSliding ? 4 : 1);
    }

    // Animation cycle
    if (this.isOnSurface && !this.isSliding) {
      this.animTimer += delta * (gameSpeed / 40);
      if (this.animTimer >= 1.0) {
        this.animTimer = 0;
        this.runFrame = (this.runFrame % 4) + 1;
      }
    }
  }

  // Hitbox: height is reduced to 18px when lying down / sliding!
  getHitbox() {
    if (this.isSliding) {
      return {
        x: this.x - 28,
        y: this.isInverted ? this.ceilingY : this.floorY - 20,
        width: 56,
        height: 20
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
      return true; // Invulnerable
    }

    if (this.hasShield) {
      this.hasShield = false;
      AudioSys.playSFX('shield_break');
      CameraSys.addTrauma(0.55);
      ParticleSys.emitExplosion(this.x, this.y + this.height / 2, '#00f0ff', 24);
      ParticleSys.addFloatingText(this.x, this.y - 20, 'SHIELD BROKE!', '#00f0ff', 15);
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
      if (this.isHyper) {
        ctx.shadowColor = '#ff00ff';
        ctx.shadowBlur = 18;
      }
      // Draw lying horizontal sprite when sliding
      if (this.isSliding) {
        ctx.drawImage(sprite, -32, -20, 64, 44);
      } else {
        ctx.drawImage(sprite, -32, -32, 64, 64);
      }
    } else {
      // Procedural fallback
      ctx.fillStyle = this.getAccentColor();
      if (this.isSliding) {
        ctx.fillRect(-28, 0, 56, 18);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(10, 4, 10, 6);
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
