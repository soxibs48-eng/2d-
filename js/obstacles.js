// ==========================================
// PIXEL RUNNER: OBSTACLES & HAZARDS
// ==========================================

class Obstacle {
  constructor(type, x, y) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.initialY = y;
    this.time = 0;
    this.isDead = false;

    // Dimensions and hitboxes
    switch (type) {
      case 'spike_floor':
        this.width = 56;
        this.height = 40;
        this.damage = true;
        break;
      case 'spike_ceiling':
        this.width = 56;
        this.height = 40;
        this.damage = true;
        break;
      case 'laser_barrier':
        this.width = 24;
        this.height = 116;
        this.damage = true;
        break;
      case 'floating_mine':
        this.width = 44;
        this.height = 44;
        this.damage = true;
        this.bobbing = true;
        break;
      case 'gravity_portal':
        this.width = 40;
        this.height = 120;
        this.damage = false; // Triggers gravity flip!
        break;
    }

    this.sprite = new Image();
    this.sprite.src = `assets/sprites/obstacles/${type}.png`;
  }

  update(delta, gameSpeed) {
    this.x -= gameSpeed * delta;
    this.time += delta;

    if (this.bobbing) {
      this.y = this.initialY + Math.sin(this.time * 3.0) * 25;
    }

    if (this.x < -150) {
      this.isDead = true;
    }
  }

  getHitbox() {
    return {
      x: this.x - this.width / 2,
      y: this.y - this.height / 2,
      width: this.width,
      height: this.height
    };
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    if (this.sprite && this.sprite.complete && this.sprite.naturalWidth > 0) {
      const renderW = this.type === 'laser_barrier' || this.type === 'gravity_portal' ? 64 : 64;
      const renderH = this.type === 'laser_barrier' || this.type === 'gravity_portal' ? 128 : 64;
      ctx.drawImage(this.sprite, -renderW / 2, -renderH / 2, renderW, renderH);
    } else {
      // Procedural fallback
      if (this.type === 'spike_floor') {
        ctx.fillStyle = '#ff2244';
        ctx.beginPath();
        ctx.moveTo(-20, 20);
        ctx.lineTo(0, -20);
        ctx.lineTo(20, 20);
        ctx.fill();
      } else if (this.type === 'spike_ceiling') {
        ctx.fillStyle = '#ff2244';
        ctx.beginPath();
        ctx.moveTo(-20, -20);
        ctx.lineTo(0, 20);
        ctx.lineTo(20, -20);
        ctx.fill();
      } else if (this.type === 'laser_barrier') {
        ctx.fillStyle = '#ff0055';
        ctx.fillRect(-8, -50, 16, 100);
      } else if (this.type === 'floating_mine') {
        ctx.fillStyle = '#ff3333';
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.type === 'gravity_portal') {
        ctx.strokeStyle = '#b030ff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 50, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    ctx.restore();
  }
}
