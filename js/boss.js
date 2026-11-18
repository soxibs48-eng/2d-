// ==========================================
// PIXEL RUNNER: CYBER GOLIATH BOSS SYSTEM
// ==========================================

class CyberBoss {
  constructor(game) {
    this.game = game;
    this.active = false;
    this.x = 1350;
    this.targetX = 1080;
    this.y = 360;
    this.width = 110;
    this.height = 130;
    
    this.maxHp = 100;
    this.hp = 100;
    
    this.time = 0;
    this.attackTimer = 2.8;
    this.attackCooldown = 3.2;
    this.missiles = [];
    this.state = 'entering'; // entering, fighting, defeated
    this.flashTimer = 0;
  }

  activate() {
    this.active = true;
    this.hp = this.maxHp;
    this.x = 1350;
    this.y = 360;
    this.state = 'entering';
    this.missiles = [];
    this.attackTimer = 2.0;
    AudioSys.playSFX('powerup');
    CameraSys.addTrauma(0.6);
    ParticleSys.addFloatingText(640, 260, '⚠ BOSS ALERT: CYBER GOLIATH ⚠', '#ff0055', 20);
  }

  deactivate() {
    this.active = false;
    this.missiles = [];
  }

  reset() {
    this.active = false;
    this.hp = this.maxHp;
    this.x = 1350;
    this.y = 360;
    this.state = 'entering';
    this.missiles = [];
    this.attackTimer = 2.8;
    this.flashTimer = 0;
  }

  takeDamage(amount = 25) {
    if (!this.active || this.state === 'defeated') return;
    
    this.hp = Math.max(0, this.hp - amount);
    this.flashTimer = 0.25;
    AudioSys.playSFX('hit');
    CameraSys.addTrauma(0.45);
    ParticleSys.emitExplosion(this.x, this.y, '#ff00aa', 24);
    ParticleSys.addFloatingText(this.x, this.y - 60, `-${amount} DMG!`, '#ff00ff', 18);

    if (this.hp <= 0) {
      this.state = 'defeated';
      AudioSys.playSFX('powerup');
      CameraSys.addTrauma(0.9);
      ParticleSys.emitExplosion(this.x, this.y, '#ffd700', 60);
      ParticleSys.addFloatingText(640, 320, '★ BOSS MAG\'LUB BO\'LDI! ★', '#ffd700', 24);
      
      setTimeout(() => {
        this.game.completeCurrentStage();
      }, 1800);
    }
  }

  update(delta, player) {
    if (!this.active) return;

    this.time += delta;

    // Entrance animation
    if (this.state === 'entering') {
      this.x = Math.max(this.targetX, this.x - 220 * delta);
      if (this.x <= this.targetX + 5) {
        this.state = 'fighting';
      }
    } else if (this.state === 'fighting') {
      // Hovering vertical sine wave tracking player loosely
      const targetY = 260 + Math.sin(this.time * 2.2) * 160;
      this.y += (targetY - this.y) * 2.5 * delta;

      // Attack cycle
      this.attackTimer -= delta;
      if (this.attackTimer <= 0) {
        this.launchAttack(player);
        this.attackTimer = this.attackCooldown;
      }
    }

    if (this.flashTimer > 0) {
      this.flashTimer -= delta;
    }

    // Update boss plasma missiles
    for (let i = this.missiles.length - 1; i >= 0; i--) {
      const m = this.missiles[i];
      m.x -= m.speed * delta;
      m.time += delta;

      // Check collision with player
      const pHitbox = player.getHitbox();
      if (
        pHitbox.x < m.x + m.size &&
        pHitbox.x + pHitbox.width > m.x - m.size &&
        pHitbox.y < m.y + m.size &&
        pHitbox.y + pHitbox.height > m.y - m.size
      ) {
        if (!player.isHyper && !player.isDashing) {
          const survived = player.takeDamage();
          if (!survived) {
            this.game.endGame();
            return;
          }
        } else {
          ParticleSys.emitExplosion(m.x, m.y, '#00ffff', 12);
        }
        this.missiles.splice(i, 1);
        continue;
      }

      if (m.x < -100) {
        this.missiles.splice(i, 1);
      }
    }
  }

  launchAttack(player) {
    const attackType = Math.floor(Math.random() * 3);

    if (attackType === 0) {
      // Low plasma torpedo (jump over it)
      this.missiles.push({
        x: this.x - 40,
        y: 555,
        speed: 680,
        size: 16,
        color: '#ff2255',
        type: 'low'
      });
      AudioSys.playSFX('hit');
    } else if (attackType === 1) {
      // High laser missile (slide under it)
      this.missiles.push({
        x: this.x - 40,
        y: 515,
        speed: 620,
        size: 20,
        color: '#ffaa00',
        type: 'mid'
      });
      AudioSys.playSFX('hit');
    } else {
      // Ceiling rocket (player on floor is safe, or flips gravity)
      this.missiles.push({
        x: this.x - 40,
        y: 175,
        speed: 680,
        size: 18,
        color: '#d844ff',
        type: 'ceiling'
      });
      AudioSys.playSFX('hit');
    }
  }

  draw(ctx) {
    if (!this.active) return;

    // Draw Missiles
    for (const m of this.missiles) {
      ctx.save();
      ctx.fillStyle = m.color;
      ctx.shadowColor = m.color;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
      ctx.fill();

      // Missile core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.size / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Draw Boss Body
    ctx.save();
    ctx.translate(this.x, this.y);

    if (this.flashTimer > 0) {
      ctx.filter = 'brightness(2.0)';
    }

    // Main Armor
    ctx.fillStyle = '#181e30';
    ctx.strokeStyle = '#ff0055';
    ctx.lineWidth = 3;
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);

    // Glowing Cyber Wings / Thrusters
    ctx.fillStyle = '#ff0055';
    ctx.beginPath();
    ctx.moveTo(this.width / 2, -30);
    ctx.lineTo(this.width / 2 + 25, 0);
    ctx.lineTo(this.width / 2, 30);
    ctx.fill();

    // Red Central Eye
    ctx.fillStyle = '#ff0033';
    ctx.shadowColor = '#ff0033';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(-15, 0, 20, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-18, -4, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Cannon port
    ctx.fillStyle = '#334455';
    ctx.fillRect(-this.width / 2 - 16, -10, 16, 20);

    ctx.restore();

    // Draw Boss Health Bar on top
    this.drawHealthBar(ctx);
  }

  drawHealthBar(ctx) {
    const barW = 460;
    const barH = 18;
    const barX = (1280 - barW) / 2;
    const barY = 82;

    ctx.save();
    // Backdrop
    ctx.fillStyle = 'rgba(15, 20, 35, 0.9)';
    ctx.fillRect(barX - 4, barY - 22, barW + 8, barH + 28);
    ctx.strokeStyle = '#ff0055';
    ctx.lineWidth = 2;
    ctx.strokeRect(barX - 4, barY - 22, barW + 8, barH + 28);

    // Title
    ctx.fillStyle = '#ff0055';
    ctx.font = '11px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('BOSS: CYBER GOLIATH', 640, barY - 6);

    // Health Fill
    const pct = this.hp / this.maxHp;
    ctx.fillStyle = '#220011';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = pct > 0.4 ? '#ff0055' : '#ffaa00';
    ctx.fillRect(barX, barY, barW * pct, barH);

    ctx.fillStyle = '#ffffff';
    ctx.font = '9px "Press Start 2P", monospace';
    ctx.fillText(`${Math.round(this.hp)}%`, 640, barY + 13);
    ctx.restore();
  }
}
