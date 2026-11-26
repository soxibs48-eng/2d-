// ==========================================
// PIXEL RUNNER: CAMERA & SCREEN SHAKE
// ==========================================

class Camera {
  constructor() {
    this.trauma = 0;
    this.decay = 2.4;
    this.maxOffset = 12; // Controlled shake, never leaves screen bounds or causes jitter
    this.maxRoll = 0.016;
    this.offsetX = 0;
    this.offsetY = 0;
    this.roll = 0;
  }

  addTrauma(amount) {
    this.trauma = Math.min(1.0, this.trauma + amount);
  }

  reset() {
    this.trauma = 0;
    this.offsetX = 0;
    this.offsetY = 0;
    this.roll = 0;
  }

  update(delta) {
    if (this.trauma > 0.02) {
      this.trauma = Math.max(0, this.trauma - this.decay * delta);
      const shake = this.trauma * this.trauma;
      this.offsetX = Math.round((Math.random() * 2 - 1) * this.maxOffset * shake);
      this.offsetY = Math.round((Math.random() * 2 - 1) * this.maxOffset * shake);
      this.roll = (Math.random() * 2 - 1) * this.maxRoll * shake;
    } else {
      this.trauma = 0;
      this.offsetX = 0;
      this.offsetY = 0;
      this.roll = 0;
    }
  }

  apply(ctx) {
    if (this.trauma > 0 && (this.offsetX !== 0 || this.offsetY !== 0 || Math.abs(this.roll) > 0.001)) {
      ctx.translate(640 + this.offsetX, 360 + this.offsetY);
      ctx.rotate(this.roll);
      ctx.translate(-640, -360);
    }
  }
}

const CameraSys = new Camera();
