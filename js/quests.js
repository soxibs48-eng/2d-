// ========================================================
// PIXEL RUNNER: DAILY QUESTS & MISSION SYSTEM (v3.0)
// ========================================================

class DailyQuestSystem {
  constructor(game) {
    this.game = game;
    this.questPool = [
      { id: 'dist_1000', title: 'Marafonchi', desc: 'Bugun jami 1,000 metr masofa bosib o\'t', target: 1000, reward: 150, unit: 'm' },
      { id: 'coins_50', title: 'Tanga Ovchisi', desc: 'Bugun 50 ta tanga yig\'', target: 50, reward: 200, unit: 'ta' },
      { id: 'gravity_3', title: 'Gravitatsiya Hakkeri', desc: '3 marta Anti-Gravity shiftga sakrashni ishlat', target: 3, reward: 150, unit: 'marta' },
      { id: 'fever_1', title: 'Fever Ustasi', desc: '1 marta 100% Fever Hyper Drive rejimiga erish', target: 1, reward: 250, unit: 'marta' },
      { id: 'jump_8', title: 'Akrobat', desc: '8 marta havoda 2-marta sakrash (Double Jump) bajar', target: 8, reward: 150, unit: 'marta' },
      { id: 'slide_5', title: 'Kiber Sirpanuvchi', desc: '5 marta to\'siqlar ostidan to\'liq yotib (Slide) o\'t', target: 5, reward: 150, unit: 'marta' },
      { id: 'boss_emp_2', title: 'Kiber Qotil', desc: 'Bossga qarshi 2 marta EMP snaryadini ot', target: 2, reward: 300, unit: 'marta' }
    ];

    this.activeQuests = [];
    this.todayStr = this.getTodayDateString();
    this.loadOrGenerateQuests();
  }

  getTodayDateString() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  loadOrGenerateQuests(forceNew = false) {
    const saved = StorageManager.getDailyQuestsData();
    if (!forceNew && saved && saved.date === this.todayStr && Array.isArray(saved.quests) && saved.quests.length > 0) {
      this.activeQuests = saved.quests;
    } else {
      this.generateNewQuests();
    }
  }

  generateNewQuests() {
    // Pick 3 unique random quests from the pool
    const shuffled = [...this.questPool].sort(() => 0.5 - Math.random());
    this.activeQuests = shuffled.slice(0, 3).map(q => ({
      id: q.id,
      title: q.title,
      desc: q.desc,
      target: q.target,
      reward: q.reward,
      unit: q.unit,
      current: 0,
      completed: false,
      claimed: false
    }));

    this.save();
  }

  save() {
    StorageManager.saveDailyQuestsData({
      date: this.todayStr,
      quests: this.activeQuests
    });
  }

  // EVENT HOOKS FROM GAMEPLAY
  onDistance(distance) {
    this.addProgress('dist_1000', distance);
  }

  onCoin() {
    this.addProgress('coins_50', 1);
  }

  onGravityFlip() {
    this.addProgress('gravity_3', 1);
  }

  onFever() {
    this.addProgress('fever_1', 1);
  }

  onDoubleJump() {
    this.addProgress('jump_8', 1);
  }

  onSlide() {
    this.addProgress('slide_5', 1);
  }

  onBossEMP() {
    this.addProgress('boss_emp_2', 1);
  }

  addProgress(questId, amount) {
    let changed = false;
    for (const q of this.activeQuests) {
      if (q.id === questId && !q.completed) {
        q.current = Math.min(q.target, q.current + amount);
        changed = true;
        if (q.current >= q.target) {
          q.completed = true;
          AudioSys.playSFX('quest_complete');
          CameraSys.addTrauma(0.3);
          ParticleSys.addFloatingText(640, 180, `🏆 VAZIFA BAJARILDI: ${q.title}!`, '#00ffcc', 18);
        }
      }
    }
    if (changed) {
      this.save();
    }
  }

  claimReward(questId) {
    for (const q of this.activeQuests) {
      if (q.id === questId && q.completed && !q.claimed) {
        q.claimed = true;
        StorageManager.addCoins(q.reward);
        AudioSys.playSFX('powerup');
        ParticleSys.addFloatingText(640, 320, `+${q.reward} TANGA OLINDI!`, '#ffd700', 20);
        this.save();
        return true;
      }
    }
    return false;
  }
}
