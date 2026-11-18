// ==========================================
// PIXEL RUNNER: LOCAL STORAGE MANAGER
// ==========================================

const StorageManager = {
  getHighScore() {
    return parseFloat(localStorage.getItem('pixel_runner_highscore') || '0');
  },

  saveHighScore(score) {
    const current = this.getHighScore();
    if (score > current) {
      localStorage.setItem('pixel_runner_highscore', score.toString());
      return true;
    }
    return false;
  },

  getTotalCoins() {
    return parseInt(localStorage.getItem('pixel_runner_coins') || '0', 10);
  },

  addCoins(amount) {
    const total = this.getTotalCoins() + amount;
    localStorage.setItem('pixel_runner_coins', total.toString());
    return total;
  },

  spendCoins(amount) {
    const total = this.getTotalCoins();
    if (total >= amount) {
      localStorage.setItem('pixel_runner_coins', (total - amount).toString());
      return true;
    }
    return false;
  },

  getUnlockedSkins() {
    const skins = localStorage.getItem('pixel_runner_skins');
    return skins ? JSON.parse(skins) : ['default'];
  },

  unlockSkin(skinId) {
    const skins = this.getUnlockedSkins();
    if (!skins.includes(skinId)) {
      skins.push(skinId);
      localStorage.setItem('pixel_runner_skins', JSON.stringify(skins));
    }
  },

  getEquippedSkin() {
    return localStorage.getItem('pixel_runner_equipped') || 'default';
  },

  setEquippedSkin(skinId) {
    localStorage.setItem('pixel_runner_equipped', skinId);
  },

  getMasterVolume() {
    return parseFloat(localStorage.getItem('pixel_runner_vol_master') || '0.8');
  },

  getMusicVolume() {
    return parseFloat(localStorage.getItem('pixel_runner_vol_music') || '0.7');
  },

  getSFXVolume() {
    return parseFloat(localStorage.getItem('pixel_runner_vol_sfx') || '0.9');
  },

  saveVolumes(master, music, sfx) {
    localStorage.setItem('pixel_runner_vol_master', master.toString());
    localStorage.setItem('pixel_runner_vol_music', music.toString());
    localStorage.setItem('pixel_runner_vol_sfx', sfx.toString());
  }
};
