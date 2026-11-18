// ==========================================
// PIXEL RUNNER: PROCEDURAL SPAWNER (v2.3 STAGE-AWARE)
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

  update(delta, gameSpeed, obstacles, pickups, stage = 1, bossActive = false) {
    this.spawnTimer -= delta;

    if (this.spawnTimer <= 0) {
      if (bossActive) {
        this.spawnBossBattlePattern(obstacles, pickups);
        this.spawnTimer = 1.4;
      } else {
        this.spawnStagePattern(obstacles, pickups, stage);
        const baseGap = stage === 1 ? 480 : (stage === 2 ? 440 : 410);
        this.spawnTimer = Math.max(0.65, Math.min(1.8, (baseGap + Math.random() * 180) / gameSpeed));
      }
    }
  }

  spawnBossBattlePattern(obstacles, pickups) {
    // During boss battle: spawn EMP Orbs to damage boss, plus occasional low beam or saw to dodge
    const roll = Math.random();
    if (roll < 0.65) {
      // Spawn EMP Orb
      const empY = Math.random() > 0.5 ? this.floorY - 40 : this.ceilingY + 40;
      pickups.push(new Pickup('emp_orb', this.spawnX, empY));
      this.spawnCoinLine(pickups, this.spawnX + 60, empY, 3);
    } else if (roll < 0.85) {
      // Low laser wire to force sliding
      obstacles.push(new Obstacle('low_beam', this.spawnX, this.floorY - 26));
    } else {
      // Tall spikes to force double jump
      obstacles.push(new Obstacle('tall_spikes', this.spawnX, this.floorY - 25));
    }
  }

  spawnStagePattern(obstacles, pickups, stage) {
    // Stage 1 Patterns (Neon City: Learning jumps & slides)
    if (stage === 1) {
      const r = Math.floor(Math.random() * 5);
      switch (r) {
        case 0:
          obstacles.push(new Obstacle('spike_floor', this.spawnX, this.floorY));
          this.spawnCoinArc(pickups, this.spawnX - 40, this.floorY - 80, 4);
          break;
        case 1:
          // Low beam (Learn to slide / lie down!)
          obstacles.push(new Obstacle('low_beam', this.spawnX, this.floorY - 26));
          this.spawnCoinLine(pickups, this.spawnX - 40, this.floorY - 15, 3);
          break;
        case 2:
          obstacles.push(new Obstacle('spike_ceiling', this.spawnX, this.ceilingY));
          this.spawnCoinArc(pickups, this.spawnX - 40, this.ceilingY + 80, 4);
          break;
        case 3:
          // Tall spikes (Learn to Double Jump!)
          obstacles.push(new Obstacle('tall_spikes', this.spawnX, this.floorY - 25));
          this.spawnCoinArc(pickups, this.spawnX - 50, this.floorY - 150, 4);
          break;
        case 4:
          this.spawnCoinLine(pickups, this.spawnX, this.floorY - 30, 5);
          if (Math.random() > 0.5) this.spawnRandomPowerup(pickups, this.spawnX + 240, this.floorY - 30);
          break;
      }
      return;
    }

    // Stage 2 Patterns (Gravity Anomaly: Heavy Inversions & Saws)
    if (stage === 2) {
      const r = Math.floor(Math.random() * 6);
      switch (r) {
        case 0:
          // Gravity Portal + Saws
          obstacles.push(new Obstacle('gravity_portal', this.spawnX, this.midY));
          this.spawnCoinLine(pickups, this.spawnX - 80, this.floorY - 30, 3);
          this.spawnCoinLine(pickups, this.spawnX + 80, this.ceilingY + 30, 3);
          break;
        case 1:
          // Spinning Laser Saw on floor or ceiling
          const sawY = Math.random() > 0.5 ? this.floorY - 30 : this.ceilingY + 30;
          obstacles.push(new Obstacle('laser_saw', this.spawnX, sawY));
          break;
        case 2:
          // Low beam on ceiling
          obstacles.push(new Obstacle('low_beam', this.spawnX, this.ceilingY + 26));
          this.spawnCoinLine(pickups, this.spawnX - 40, this.ceilingY + 15, 3);
          break;
        case 3:
          // Split hazard
          obstacles.push(new Obstacle('spike_floor', this.spawnX, this.floorY));
          obstacles.push(new Obstacle('spike_ceiling', this.spawnX + 160, this.ceilingY));
          break;
        case 4:
          obstacles.push(new Obstacle('tall_spikes', this.spawnX, this.floorY - 25));
          this.spawnCoinArc(pickups, this.spawnX - 50, this.floorY - 150, 5);
          break;
        case 5:
          this.spawnCoinLine(pickups, this.spawnX, this.ceilingY + 30, 6);
          this.spawnRandomPowerup(pickups, this.spawnX + 280, this.ceilingY + 30);
          break;
      }
      return;
    }

    // Stage 3 / Endless Patterns (Full Cyber Matrix)
    const r = Math.floor(Math.random() * 8);
    switch (r) {
      case 0:
        obstacles.push(new Obstacle('patrol_drone', this.spawnX, 320));
        break;
      case 1:
        obstacles.push(new Obstacle('laser_saw', this.spawnX, this.floorY - 30));
        obstacles.push(new Obstacle('laser_saw', this.spawnX + 160, this.ceilingY + 30));
        break;
      case 2:
        obstacles.push(new Obstacle('low_beam', this.spawnX, this.floorY - 26));
        break;
      case 3:
        obstacles.push(new Obstacle('tall_spikes', this.spawnX, this.floorY - 25));
        break;
      case 4:
        obstacles.push(new Obstacle('gravity_portal', this.spawnX, this.midY));
        break;
      case 5:
        obstacles.push(new Obstacle('laser_barrier', this.spawnX, this.floorY - 50));
        break;
      case 6:
        obstacles.push(new Obstacle('floating_mine', this.spawnX, 340));
        break;
      case 7:
        this.spawnCoinLine(pickups, this.spawnX, this.floorY - 30, 6);
        this.spawnRandomPowerup(pickups, this.spawnX + 280, this.midY);
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
