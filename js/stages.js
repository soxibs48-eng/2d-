// ========================================================
// PIXEL RUNNER: 100-STAGE CAMPAIGN DATABASE (v3.2)
// ========================================================

const SECTORS_DATA = [
  { id: 1, name: 'NEON OUTSKIRTS', color: '#00f0ff', desc: 'Boshlang\'ich kiber shahar atrofi: Sakrash va yotish' },
  { id: 2, name: 'GRAVITY LABS', color: '#d844ff', desc: 'Gravitatsiya laboratoriyasi: Shiftda yugurish' },
  { id: 3, name: 'CYBER HIGHWAY', color: '#ffaa00', desc: 'Kiber trassa: Tezkor patrul dronlari va arralar' },
  { id: 4, name: 'INDUSTRIAL FOUNDRY', color: '#ff2255', desc: 'Sanoat quyuv sexi: Lazerlar va baland tikanlar' },
  { id: 5, name: 'ELECTRO MATRIX', color: '#00ffaa', desc: 'Elektr bo\'roni: Goliath megabossi bilan jang' },
  { id: 6, name: 'CRYSTAL VOID', color: '#00e5ff', desc: 'Billur neon bo\'shliq: Nozik antigravitatsiya' },
  { id: 7, name: 'CYBER RUINS', color: '#7788ff', desc: 'Tungi kiber xarobalar: Suzuvchi minalar' },
  { id: 8, name: 'QUANTUM CORE', color: '#b030ff', desc: 'Kvant yadrosi: Tezkor polarite o\'zgarishlari' },
  { id: 9, name: 'TITAN FORTRESS', color: '#ffd700', desc: 'Titan qalqon qasri: Zich lazer to\'siqlari' },
  { id: 10, name: 'APEX MATRIX', color: '#ff00aa', desc: 'Yakuniy kiber cho\'qqi: Omega Goliath afsonaviy jangi!' }
];

class StageDatabase {
  static getSectors() {
    return SECTORS_DATA;
  }

  static getSectorForStage(stageNum) {
    const secIdx = Math.min(9, Math.floor((stageNum - 1) / 10));
    return SECTORS_DATA[secIdx];
  }

  static getStage(stageNum) {
    const sNum = Math.max(1, Math.min(100, parseInt(stageNum, 10) || 1));
    const secIdx = Math.min(9, Math.floor((sNum - 1) / 10));
    const sector = SECTORS_DATA[secIdx];

    // Progressive distance scaling: Starts at 350m, increasing with each stage up to 13,940m (~14km)!
    const sectorBases = [350, 850, 1500, 2300, 3300, 4500, 5900, 7500, 9400, 11600];
    const sectorSteps = [50, 65, 80, 100, 120, 140, 160, 190, 220, 260];
    const offset = (sNum - 1) % 10;
    const targetDist = sectorBases[secIdx] + offset * sectorSteps[secIdx];
    const coinBonus = 40 + sNum * 12 + secIdx * 25;
    const isBoss = (sNum % 10 === 0) || (sNum === 25) || (sNum === 75) || (sNum === 100);

    let bossInfo = null;
    if (isBoss) {
      const bossHp = 50 + Math.floor(sNum / 10) * 10;
      let bossName = 'Mini Goliath';
      if (sNum >= 90) bossName = 'OMEGA GOLIATH (FINAL)';
      else if (sNum >= 50) bossName = 'Cyber Goliath';
      else if (sNum >= 20) bossName = 'Scout Titan';

      bossInfo = {
        name: bossName,
        hp: bossHp,
        attacks: ['plasma_torpedo', 'laser_beam', 'ceiling_rocket']
      };
    }

    const subNum = ((sNum - 1) % 10) + 1;
    let name = `${sector.name.split(' ')[0]} ${subNum}`;
    if (isBoss) {
      name += ` 👑 [${bossInfo.name.split(' ')[0]}]`;
    }

    return {
      num: sNum,
      sectorId: secIdx + 1,
      sectorName: sector.name,
      name,
      color: sector.color,
      targetDistance: targetDist,
      coinBonus,
      isBoss,
      boss: bossInfo,
      desc: isBoss ? `👑 ${bossInfo.name} megaboss jangi!` : `${sector.desc}`
    };
  }

  static getStagesForPage(page) {
    // page: 1 to 10 (each page has 10 stages)
    const p = Math.max(1, Math.min(10, parseInt(page, 10) || 1));
    const start = (p - 1) * 10 + 1;
    const list = [];
    for (let i = start; i < start + 10; i++) {
      list.push(this.getStage(i));
    }
    return list;
  }
}
