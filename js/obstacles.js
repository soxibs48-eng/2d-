// ==========================================
// PIXEL RUNNER: OBSTACLES & HAZARDS (v2.1 OVERHAUL)
// ==========================================

class Obstacle {
  constructor(type, x, y) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.initialY = y;
    this.time = Math.random() * 5;
    this.rotation = 0;
    this.isDead = false;

    // Dimensions & Hitboxes
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
      case 'laser_saw': // New spinning neon hazard
        this.width = 54;
        this.height = 54;
        this.damage = true;
        this.rotating = true;
        break;
      case 'gravity_portal':
        this.width = 40;
        this.height = 120;
        this.damage = false;
        break;
    }

    this.sprite = new Image();
    const spritePath = type === 'laser_saw' ? 'floating_mine' : type;
    this.sprite.src = `assets/sprites/obstacles/${spritePath}.png`;
  }

  update(delta, gameSpeed) {
    this.x -= gameSpeed * delta;
    this.time += delta;

    if (this.bobbing) {
      this.y = this.initialY + Math.sin(this.time * 3.0) * 25;
    }

    if (this.rotating) {
      this.rotation += 8.0 * delta;
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

    if (this.type === 'laser_saw') {
      // Custom procedural high-tech spinning saw
      ctx.rotate(this.rotation);
      ctx.strokeStyle = '#ff0055';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI * 2);
      ctx.stroke();

      // Saw teeth
      ctx.fillStyle = '#ff3366';
      for (let i = 0; i < 8; i++) {
        const a = (Math.PI / 4) * i;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * 20, Math.sin(a) * 20);
        ctx.lineTo(Math.cos(a + 0.2) * 30, Math.sin(a + 0.2) * 30);
        ctx.lineTo(Math.cos(a + 0.4) * 20, Math.sin(a + 0.4) * 20);
        ctx.fill();
      }

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.sprite && this.sprite.complete && this.sprite.naturalWidth > 0) {
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
