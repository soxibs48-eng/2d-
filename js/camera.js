// ==========================================
// PIXEL RUNNER: CAMERA & SCREEN SHAKE
// ==========================================

class Camera {
  constructor() {
    this.trauma = 0;
    this.decay = 2.2;
    this.maxOffset = 22;
    this.maxRoll = 0.03;
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
    if (this.trauma > 0) {
      this.trauma = Math.max(0, this.trauma - this.decay * delta);
      const shake = this.trauma * this.trauma;
      this.offsetX = (Math.random() * 2 - 1) * this.maxOffset * shake;
      this.offsetY = (Math.random() * 2 - 1) * this.maxOffset * shake;
      this.roll = (Math.random() * 2 - 1) * this.maxRoll * shake;
    } else {
      this.offsetX = 0;
      this.offsetY = 0;
      this.roll = 0;
    }
  }

  apply(ctx) {
    if (this.offsetX !== 0 || this.offsetY !== 0 || this.roll !== 0) {
      ctx.translate(640 + this.offsetX, 360 + this.offsetY);
      ctx.rotate(this.roll);
      ctx.translate(-640, -360);
    }
  }
}

const CameraSys = new Camera();
