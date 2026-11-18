// ==========================================
// PIXEL RUNNER: HIGH-PERFORMANCE PARTICLE SYSTEM
// ==========================================

class ParticleSystem {
  constructor() {
    this.particles = [];
    this.floatingTexts = [];
    this.shockwaves = [];
  }

  reset() {
    this.particles = [];
    this.floatingTexts = [];
    this.shockwaves = [];
  }

  // Running jet / runner trail
  emitJetTrail(x, y, color = '#00f0ff', count = 2) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() * 6 - 3),
        y: y + (Math.random() * 6 - 3),
        vx: -(120 + Math.random() * 100),
        vy: (Math.random() * 2 - 1) * 30,
        size: 3 + Math.random() * 3,
        color: color,
        alpha: 0.8,
        life: 0.25,
        decay: 1.0 / 0.25
      });
    }
  }

  // Jump ring burst
  emitJumpBurst(x, y, color = '#00ffcc', isInverted = false) {
    const dirY = isInverted ? 1 : -1;
    for (let i = 0; i < 14; i++) {
      const angle = (Math.PI / 14) * i + (isInverted ? 0 : Math.PI);
      const speed = 100 + Math.random() * 150;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed * 0.6 + dirY * 60,
        size: 3 + Math.random() * 4,
        color: color,
        alpha: 1.0,
        life: 0.4,
        decay: 1.0 / 0.4
      });
    }
  }

  // Shockwave ring (Gravity flip, EMP dash)
  addShockwave(x, y, color = '#d844ff') {
    this.shockwaves.push({
      x: x,
      y: y,
      radius: 10,
      maxRadius: 160,
      color: color,
      alpha: 1.0,
      speed: 400
    });
  }

  // Coin sparkle & popups
  emitCoinSparkle(x, y) {
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 120;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 3,
        color: Math.random() > 0.5 ? '#ffd700' : '#ffffff',
        alpha: 1.0,
        life: 0.35,
        decay: 1.0 / 0.35
      });
    }
  }

  // Floating text (+1, +2X, FEVER!, DASH!)
  addFloatingText(x, y, text, color = '#ffd700', size = 18) {
    this.floatingTexts.push({
      x: x,
      y: y,
      text: text,
      color: color,
      size: size,
      alpha: 1.0,
      vy: -60,
      life: 0.8
    });
  }

  // Explosion debris on damage / shield shatter
  emitExplosion(x, y, color = '#ff2255', count = 24) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 240;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 5,
        color: color,
        alpha: 1.0,
        life: 0.5,
        decay: 1.0 / 0.5
      });
    }
  }

  update(delta) {
    // Update normal particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * delta;
      p.y += p.vy * delta;
      p.alpha -= p.decay * delta;
      p.size = Math.max(0, p.size - delta * 2);

      if (p.alpha <= 0 || p.size <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += sw.speed * delta;
      sw.alpha = Math.max(0, 1.0 - sw.radius / sw.maxRadius);

      if (sw.radius >= sw.maxRadius || sw.alpha <= 0) {
        this.shockwaves.splice(i, 1);
      }
    }

    // Update floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy * delta;
      ft.life -= delta;
      ft.alpha = Math.max(0, ft.life / 0.8);

      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    // Draw shockwaves
    for (const sw of this.shockwaves) {
      ctx.save();
      ctx.strokeStyle = sw.color;
      ctx.lineWidth = 4 * sw.alpha;
      ctx.globalAlpha = sw.alpha;
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Draw particles
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      ctx.restore();
    }

    // Draw floating texts
    for (const ft of this.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.fillStyle = ft.color;
      ctx.font = `${ft.size}px "Press Start 2P", monospace`;
      ctx.textAlign = 'center';
      ctx.shadowColor = ft.color;
      ctx.shadowBlur = 8;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }
}

const ParticleSys = new ParticleSystem();
