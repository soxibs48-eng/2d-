// ==========================================
// PIXEL RUNNER: PICKUPS & COLLECTIBLES (v2.3)
// ==========================================

class Pickup {
  constructor(type, x, y) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.initialY = y;
    this.time = Math.random() * 5;
    this.isDead = false;
    this.radius = 18;

    this.sprite = new Image();
    const spriteName = type === 'coin' ? 'coin' : (type === 'emp_orb' ? 'powerup_shield' : `powerup_${type}`);
    this.sprite.src = `assets/sprites/pickups/${spriteName}.png`;
  }

  update(delta, gameSpeed, player) {
    this.x -= gameSpeed * delta;
    this.time += delta * 4;

    this.y = this.initialY + Math.sin(this.time) * 6;

    // Magnet attraction
    if ((this.type === 'coin' || this.type === 'emp_orb') && player.magnetActive) {
      const dx = player.x - this.x;
      const dy = player.y - this.y;
      const dist = Math.hypot(dx, dy);

      if (dist < player.magnetRadius) {
        const pullSpeed = 820 * delta;
        this.x += (dx / dist) * pullSpeed;
        this.y += (dy / dist) * pullSpeed;
      }
    }

    if (this.x < -150) {
      this.isDead = true;
    }
  }

  checkCollision(player) {
    const pBox = player.getHitbox();
    const closestX = Math.max(pBox.x, Math.min(this.x, pBox.x + pBox.width));
    const closestY = Math.max(pBox.y, Math.min(this.y, pBox.y + pBox.height));
    const dist = Math.hypot(this.x - closestX, this.y - closestY);
    return dist < this.radius;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    if (this.type === 'emp_orb') {
      // Custom glowing EMP Orb that damages the Boss
      ctx.fillStyle = '#00ff66';
      ctx.shadowColor = '#00ff66';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();

      // EMP lightning rings
      ctx.strokeStyle = '#00ffcc';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 20 + Math.sin(this.time * 5) * 4, 0, Math.PI * 2);
      ctx.stroke();
    } else if (this.sprite && this.sprite.complete && this.sprite.naturalWidth > 0) {
      if (this.type === 'coin') {
        const scaleX = Math.cos(this.time * 0.8);
        ctx.scale(scaleX, 1);
        ctx.drawImage(this.sprite, -18, -18, 36, 36);
      } else {
        const pulse = 1.0 + Math.sin(this.time) * 0.15;
        ctx.scale(pulse, pulse);
        ctx.drawImage(this.sprite, -22, -22, 44, 44);
      }
    } else {
      ctx.fillStyle = this.type === 'coin' ? '#ffd700' : '#00ffff';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
