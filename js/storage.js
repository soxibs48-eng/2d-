// ==========================================
// PIXEL RUNNER: LOCAL STORAGE MANAGER (v3.0)
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

  // STAGE PROGRESSION (1-100 STAGES)
  getUnlockedStages() {
    const s = localStorage.getItem('pixel_runner_unlocked_stages');
    return s ? JSON.parse(s) : [1];
  },

  unlockStage(stageNum) {
    if (stageNum > 100) return;
    const stages = this.getUnlockedStages().map(Number);
    if (!stages.includes(stageNum)) {
      stages.push(stageNum);
      localStorage.setItem('pixel_runner_unlocked_stages', JSON.stringify(stages));
    }
  },

  getHighestUnlockedStage() {
    const stages = this.getUnlockedStages().map(Number);
    return stages.length > 0 ? Math.max(...stages) : 1;
  },

  getStageStars() {
    const s = localStorage.getItem('pixel_runner_stage_stars');
    return s ? JSON.parse(s) : { 1: 0 };
  },

  saveStageStars(stageNum, stars) {
    const data = this.getStageStars();
    if ((data[stageNum] || 0) < stars) {
      data[stageNum] = stars;
      localStorage.setItem('pixel_runner_stage_stars', JSON.stringify(data));
    }
  },

  getTotalStars() {
    const data = this.getStageStars();
    let total = 0;
    for (const key in data) {
      total += parseInt(data[key], 10) || 0;
    }
    return total;
  },

  // SKINS
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

  // PETS (v3.0 COMPANION PET SYSTEM)
  getUnlockedPets() {
    const pets = localStorage.getItem('pixel_runner_pets');
    return pets ? JSON.parse(pets) : ['none', 'magnet_bot']; // magnet_bot is starter friendly
  },

  unlockPet(petId) {
    const pets = this.getUnlockedPets();
    if (!pets.includes(petId)) {
      pets.push(petId);
      localStorage.setItem('pixel_runner_pets', JSON.stringify(pets));
    }
  },

  getEquippedPet() {
    return localStorage.getItem('pixel_runner_equipped_pet') || 'magnet_bot';
  },

  setEquippedPet(petId) {
    localStorage.setItem('pixel_runner_equipped_pet', petId);
  },

  // DAILY QUESTS (v3.0 MISSION SYSTEM)
  getDailyQuestsData() {
    const raw = localStorage.getItem('pixel_runner_daily_quests');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  },

  saveDailyQuestsData(data) {
    localStorage.setItem('pixel_runner_daily_quests', JSON.stringify(data));
  },

  // AUDIO VOLUMES
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
  },

  // BACKGROUND THEMES
  getBackgroundTheme() {
    return localStorage.getItem('pixel_runner_bg_theme') || 'auto';
  },

  setBackgroundTheme(themeId) {
    localStorage.setItem('pixel_runner_bg_theme', themeId);
  }
};
