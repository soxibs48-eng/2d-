// ========================================================
// PIXEL RUNNER: COMPANION PET SYSTEM (v3.0)
// ========================================================

class CompanionPet {
  constructor(game) {
    this.game = game;
    this.x = 160;
    this.y = 540;
    this.vx = 0;
    this.vy = 0;
    
    this.animTimer = 0;
    this.jetTimer = 0;

    // Pet types database
    this.petDatabase = {
      none: {
        id: 'none',
        name: 'YO\'Q',
        price: 0,
        color: '#667788',
        desc: 'Hamrohsiz yolg\'iz yugurish'
      },
      magnet_bot: {
        id: 'magnet_bot',
        name: 'MAGNO (MAGNET BOT)',
        price: 0, // Free starter pet
        color: '#00f0ff',
        desc: '240px masofadagi barcha tangalarni avtomatik tortadi'
      },
      shield_drone: {
        id: 'shield_drone',
        name: 'AEGIS (SHIELD DRONE)',
        price: 150,
        color: '#00ffaa',
        desc: 'Har 60s da qahramonga avtomatik himoya qalqoni beradi'
      },
      sparky: {
        id: 'sparky',
        name: 'SPARKY (NEO FOX)',
        price: 250,
        color: '#ffd700',
        desc: 'Har 75m da +1 bonus tanga va +30% tezroq Combo/Fever beradi'
      }
    };

    this.type = StorageManager.getEquippedPet();
    if (!this.petDatabase[this.type]) this.type = 'magnet_bot';

    // Passive timers
    this.shieldCooldown = 0;
    this.shieldMaxCooldown = 60.0;
    this.sparkyDistanceAcc = 0;
    this.pulseTimer = 0;
  }

  setPet(petId) {
    if (this.petDatabase[petId]) {
      this.type = petId;
      StorageManager.setEquippedPet(petId);
      this.shieldCooldown = 0;
    }
  }

  reset() {
    this.type = StorageManager.getEquippedPet();
    if (!this.petDatabase[this.type]) this.type = 'magnet_bot';
    this.x = this.game.player.x - 45;
    this.y = this.game.player.y;
    this.vx = 0;
    this.vy = 0;
    this.shieldCooldown = 0;
    this.sparkyDistanceAcc = 0;
  }

  update(delta) {
    if (this.type === 'none') return;

    this.animTimer += delta * 4;
    this.pulseTimer += delta;

    const player = this.game.player;

    // 1. Target Position (Smooth Lerp / Spring Follow)
    const bob = Math.sin(this.animTimer) * 10;
    let targetX = player.x - 46;
    let targetY = player.y + 12 + bob;

    if (player.isInverted) {
      targetY = player.y + player.height - 12 - bob;
    }

    // Spring interpolation (Lag follow)
    const lerpSpeed = 8.5;
    this.x += (targetX - this.x) * lerpSpeed * delta;
    this.y += (targetY - this.y) * lerpSpeed * delta;

    // 2. Jet thruster particles
    this.jetTimer += delta;
    if (this.jetTimer >= 0.08) {
      this.jetTimer = 0;
      const petColor = this.petDatabase[this.type]?.color || '#00f0ff';
      const thrusterY = player.isInverted ? this.y - 6 : this.y + 6;
      ParticleSys.emitJetTrail(this.x - 10, thrusterY, petColor, 1);
    }

    // 3. Pet Abilities
    // A. MAGNET BOT: Continuously pull nearby coins
    if (this.type === 'magnet_bot') {
      const magnetRange = 240;
      for (const p of this.game.pickups) {
        if (!p.collected && p.type === 'coin') {
          const dx = (player.x + player.width / 2) - (p.x + p.width / 2);
          const dy = (player.y + player.height / 2) - (p.y + p.height / 2);
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < magnetRange && dist > 1) {
            const pullSpeed = 480;
            p.x += (dx / dist) * pullSpeed * delta;
            p.y += (dy / dist) * pullSpeed * delta;
          }
        }
      }
    }

    // B. SHIELD DRONE: Auto shield generation
    if (this.type === 'shield_drone') {
      if (!player.hasShield) {
        this.shieldCooldown += delta;
        if (this.shieldCooldown >= this.shieldMaxCooldown) {
          this.shieldCooldown = 0;
          player.hasShield = true;
          AudioSys.playSFX('pet_action');
          ParticleSys.addShockwave(player.x, player.y + player.height / 2, '#00ffaa');
          ParticleSys.addFloatingText(player.x, player.y - 30, 'AEGIS SHIELD!', '#00ffaa', 16);
        }
      } else {
        this.shieldCooldown = 0;
      }
    }

    // C. SPARKY: Generates bonus coins every 75 meters
    if (this.type === 'sparky') {
      this.sparkyDistanceAcc += this.game.gameSpeed * delta;
      if (this.sparkyDistanceAcc >= 75) {
        this.sparkyDistanceAcc = 0;
        this.game.coins++;
        StorageManager.addCoins(1);
        AudioSys.playSFX('coin');
        ParticleSys.emitCoinSparkle(this.x, this.y);
        ParticleSys.addFloatingText(this.x, this.y - 20, '+1 SPARKY!', '#ffd700', 13);
        if (this.game.dailyQuests) {
          this.game.dailyQuests.onCoin();
        }
      }
    }
  }

  draw(ctx) {
    if (this.type === 'none') return;

    ctx.save();
    ctx.translate(this.x, this.y);

    const isInverted = this.game.player.isInverted;
    if (isInverted) {
      ctx.scale(1, -1);
    }

    const petInfo = this.petDatabase[this.type];
    const color = petInfo ? petInfo.color : '#00f0ff';

    // Glowing aura
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;

    switch (this.type) {
      case 'magnet_bot':
        // Spherical drone with magnetic pulse rings
        ctx.fillStyle = '#112233';
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Glowing cyan eye / core
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(2, 0, 4, 0, Math.PI * 2);
        ctx.fill();

        // Pulsing magnetic rings
        const ringRad = 14 + (Math.sin(this.pulseTimer * 6) + 1) * 4;
        ctx.strokeStyle = `rgba(0, 240, 255, ${0.8 - ringRad / 30})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, ringRad, 0, Math.PI * 2);
        ctx.stroke();
        break;

      case 'shield_drone':
        // Hexagonal drone with dual orbiting energy spheres
        ctx.fillStyle = '#0a221a';
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i;
          const px = Math.cos(angle) * 12;
          const py = Math.sin(angle) * 12;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Green emerald core
        ctx.fillStyle = color;
        ctx.fillRect(-3, -3, 6, 6);

        // Orbiting shield nodules
        const orbAngle = this.animTimer * 1.5;
        const ox1 = Math.cos(orbAngle) * 18;
        const oy1 = Math.sin(orbAngle) * 18;
        const ox2 = Math.cos(orbAngle + Math.PI) * 18;
        const oy2 = Math.sin(orbAngle + Math.PI) * 18;

        ctx.fillStyle = '#00ffaa';
        ctx.beginPath();
        ctx.arc(ox1, oy1, 3.5, 0, Math.PI * 2);
        ctx.arc(ox2, oy2, 3.5, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'sparky':
        // Electric fox drone with glowing ears and tail
        ctx.fillStyle = '#2a1a00';
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(-10, -8, 20, 16, 4) : ctx.rect(-10, -8, 20, 16);
        ctx.fill();

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Ears
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(-6, -8);
        ctx.lineTo(-2, -16);
        ctx.lineTo(2, -8);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(4, -8);
        ctx.lineTo(8, -16);
        ctx.lineTo(12, -8);
        ctx.fill();

        // Golden spark core
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, -2, 5, 4);

        // Electric sparks
        if (Math.random() > 0.4) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(-10, 0);
          ctx.lineTo(-15, -4);
          ctx.lineTo(-12, 4);
          ctx.stroke();
        }
        break;
    }

    ctx.restore();
  }
}
