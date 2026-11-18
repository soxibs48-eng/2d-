// ==========================================
// PIXEL RUNNER: PROCEDURAL SPAWNER (v2.1 OVERHAUL)
// ==========================================

class Spawner {
  constructor() {
    this.spawnTimer = 1.2;
    this.spawnX = 1380;
    this.floorY = 556;
    this.ceilingY = 164;
    this.midY = 360;
  }

  reset() {
    this.spawnTimer = 1.2;
  }

  update(delta, gameSpeed, obstacles, pickups) {
    this.spawnTimer -= delta;

    if (this.spawnTimer <= 0) {
      this.spawnPattern(obstacles, pickups);
      const baseGap = 460 + Math.random() * 200;
      this.spawnTimer = Math.max(0.70, Math.min(1.9, baseGap / gameSpeed));
    }
  }

  spawnPattern(obstacles, pickups) {
    const roll = Math.floor(Math.random() * 9);

    switch (roll) {
      case 0:
        // Floor spikes
        obstacles.push(new Obstacle('spike_floor', this.spawnX, this.floorY));
        if (Math.random() > 0.6) {
          obstacles.push(new Obstacle('spike_floor', this.spawnX + 60, this.floorY));
        }
        this.spawnCoinArc(pickups, this.spawnX - 40, this.floorY - 80, 4);
        break;

      case 1:
        // Ceiling spikes
        obstacles.push(new Obstacle('spike_ceiling', this.spawnX, this.ceilingY));
        if (Math.random() > 0.6) {
          obstacles.push(new Obstacle('spike_ceiling', this.spawnX + 60, this.ceilingY));
        }
        this.spawnCoinArc(pickups, this.spawnX - 40, this.ceilingY + 80, 4);
        break;

      case 2:
        // Split Hazard
        obstacles.push(new Obstacle('spike_floor', this.spawnX, this.floorY));
        obstacles.push(new Obstacle('spike_ceiling', this.spawnX + 180, this.ceilingY));
        this.spawnCoinLine(pickups, this.spawnX, this.midY, 4);
        break;

      case 3:
        // Floating Cyber Mine
        const mineY = 280 + Math.random() * 160;
        obstacles.push(new Obstacle('floating_mine', this.spawnX, mineY));
        this.spawnCoinLine(pickups, this.spawnX + 60, this.floorY - 20, 3);
        break;

      case 4:
        // Laser Barrier
        const laserY = Math.random() > 0.5 ? this.floorY - 50 : this.ceilingY + 50;
        obstacles.push(new Obstacle('laser_barrier', this.spawnX, laserY));
        const safeY = laserY > this.midY ? this.ceilingY + 40 : this.floorY - 40;
        this.spawnCoinLine(pickups, this.spawnX - 30, safeY, 4);
        break;

      case 5:
        // Anti-Gravity Portal
        obstacles.push(new Obstacle('gravity_portal', this.spawnX, this.midY));
        this.spawnCoinLine(pickups, this.spawnX - 100, this.floorY - 30, 3);
        this.spawnCoinLine(pickups, this.spawnX + 80, this.ceilingY + 30, 3);
        break;

      case 6:
        // NEW: Spinning Laser Saw obstacle!
        const sawY = Math.random() > 0.5 ? this.floorY - 30 : this.ceilingY + 30;
        obstacles.push(new Obstacle('laser_saw', this.spawnX, sawY));
        this.spawnCoinArc(pickups, this.spawnX - 40, sawY > this.midY ? sawY - 90 : sawY + 90, 4);
        break;

      case 7:
        // Pure Coin Wave + Powerup
        this.spawnCoinLine(pickups, this.spawnX, this.floorY - 30, 6);
        if (Math.random() > 0.4) {
          this.spawnRandomPowerup(pickups, this.spawnX + 300, this.floorY - 30);
        }
        break;

      case 8:
        // Powerup flanked by spinning saws
        this.spawnRandomPowerup(pickups, this.spawnX, this.midY);
        obstacles.push(new Obstacle('laser_saw', this.spawnX - 130, this.floorY - 30));
        obstacles.push(new Obstacle('laser_saw', this.spawnX + 130, this.ceilingY + 30));
        break;
    }
  }

  spawnCoinLine(pickups, startX, y, count) {
    for (let i = 0; i < count; i++) {
      pickups.push(new Pickup('coin', startX + i * 45, y));
    }
  }

  spawnCoinArc(pickups, startX, peakY, count) {
    for (let i = 0; i < count; i++) {
      const progress = i / Math.max(1, count - 1);
      const arcY = peakY - Math.sin(progress * Math.PI) * 60;
      pickups.push(new Pickup('coin', startX + i * 40, arcY));
    }
  }

  spawnRandomPowerup(pickups, x, y) {
    const roll = Math.random();
    let type = 'shield';
    if (roll < 0.3) type = 'shield';
    else if (roll < 0.6) type = 'magnet';
    else if (roll < 0.85) type = 'double';
    else type = 'gravity';

    pickups.push(new Pickup(type, x, y));
  }
}
