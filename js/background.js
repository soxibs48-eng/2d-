// ========================================================
// PIXEL RUNNER: DYNAMIC BACKGROUND & THEME SYSTEM (v3.3)
// ========================================================

const BACKGROUND_THEMES = [
  {
    id: 'auto',
    name: 'AVTOMATIK (BOSQICHGA MOS)',
    desc: 'Har bir sektor va bosqichga mos ravishda fon avtomatik almashadi.',
    color: '#00f0ff',
    icon: '🔄'
  },
  {
    id: 'neon_city',
    name: 'NEON SHAHAR (CYBER CITY)',
    desc: 'Kiber shahar quyosh botishi: Neon osmon va kiber binolar.',
    color: '#00f0ff',
    icon: '🏙️',
    skyColors: ['#080a1a', '#0d1838', '#1a2255', '#2a1a44'],
    farColor: '#121935',
    midColor: '#182448',
    windowColor: '#00f0ff',
    gridColor: '#00f0ff',
    surfaceTint: '#111d33',
    celestial: { type: 'moon', color: '#00f0ff', x: 960, y: 160, r: 60 }
  },
  {
    id: 'gravity_labs',
    name: 'GRAVITATSIYA LABS (LABS)',
    desc: 'Kvant laboratoriyasi: Binafsharang reaktorlar va magnit maydonlar.',
    color: '#d844ff',
    icon: '🔮',
    skyColors: ['#090514', '#150a28', '#2a124a', '#3d1668'],
    farColor: '#1a0d33',
    midColor: '#28134a',
    windowColor: '#d844ff',
    gridColor: '#d844ff',
    surfaceTint: '#220e3a',
    celestial: { type: 'ring', color: '#d844ff', x: 640, y: 140, r: 75 }
  },
  {
    id: 'cyber_highway',
    name: 'KIBER TRASSA (HIGHWAY)',
    desc: 'Oltin kiber trassa: Oltin ufq, tezyurar ko\'priklar va patrul yo\'llari.',
    color: '#ffaa00',
    icon: '🛣️',
    skyColors: ['#120800', '#261202', '#4a2405', '#6b3308'],
    farColor: '#2b1604',
    midColor: '#3d1f08',
    windowColor: '#ffaa00',
    gridColor: '#ffaa00',
    surfaceTint: '#301805',
    celestial: { type: 'sun', color: '#ffaa00', x: 340, y: 180, r: 70 }
  },
  {
    id: 'industrial_foundry',
    name: 'SANOAT SEKSI (FOUNDRY)',
    desc: 'Olovli eritish zavodi: Qizil tutun, mitti cho\'g\'lar va metall presslar.',
    color: '#ff2255',
    icon: '🔥',
    skyColors: ['#140205', '#2b050b', '#4d0a14', '#660d1a'],
    farColor: '#2e070e',
    midColor: '#420b15',
    windowColor: '#ff3366',
    gridColor: '#ff2255',
    surfaceTint: '#380811',
    celestial: { type: 'furnace', color: '#ff4400', x: 640, y: 220, r: 90 }
  },
  {
    id: 'electro_matrix',
    name: 'ELEKTR MATRITSA (MATRIX)',
    desc: 'Zaharli chaqmoq matritsasi: Yashil kiber kodlar va chaqmoq ustunlari.',
    color: '#00ffaa',
    icon: '⚡',
    skyColors: ['#02120a', '#062615', '#0c4024', '#135c34'],
    farColor: '#082e1a',
    midColor: '#0e4226',
    windowColor: '#00ffaa',
    gridColor: '#00ffaa',
    surfaceTint: '#09301b',
    celestial: { type: 'sphere', color: '#00ffaa', x: 880, y: 150, r: 65 }
  },
  {
    id: 'crystal_void',
    name: 'KRISTALL BO\'SHLIQ (VOID)',
    desc: 'Chuqur koinot va billur tuman: Moviy yulduzlar va kristall asteroidlar.',
    color: '#00e5ff',
    icon: '🌠',
    skyColors: ['#030914', '#07162e', '#0e2b59', '#153e7e'],
    farColor: '#0a1d3d',
    midColor: '#102a54',
    windowColor: '#00e5ff',
    gridColor: '#00e5ff',
    surfaceTint: '#0c2244',
    celestial: { type: 'nebula', color: '#00e5ff', x: 500, y: 130, r: 85 }
  },
  {
    id: 'cyber_ruins',
    name: 'KIBER XAROBALAR (RUINS)',
    desc: 'Vayron bo\'lgan kiber dunyo: Oqish oy nuri, muzli shamol va siniq minoralar.',
    color: '#7788ff',
    icon: '🏚️',
    skyColors: ['#0a0c16', '#14182a', '#222944', '#323c61'],
    farColor: '#171c30',
    midColor: '#212742',
    windowColor: '#7788ff',
    gridColor: '#7788ff',
    surfaceTint: '#1c2138',
    celestial: { type: 'moon', color: '#aabbff', x: 780, y: 140, r: 65 }
  },
  {
    id: 'quantum_core',
    name: 'KVANT YADROSI (CORE)',
    desc: 'Rezonansli kvant yadrosi: Nozik energiya halqalari va yorqin pulsatsiyalar.',
    color: '#b030ff',
    icon: '⚛️',
    skyColors: ['#0f0317', '#220733', '#3d0e59', '#57157d'],
    farColor: '#260938',
    midColor: '#380e52',
    windowColor: '#b030ff',
    gridColor: '#b030ff',
    surfaceTint: '#2d0a42',
    celestial: { type: 'ring', color: '#c44dff', x: 640, y: 160, r: 80 }
  },
  {
    id: 'titan_fortress',
    name: 'TITAN QAL\'ASI (FORTRESS)',
    desc: 'Zirhli titan mudofaasi: Oltin qalqonlar, metall devorlar va lazer projektorlar.',
    color: '#ffd700',
    icon: '🏰',
    skyColors: ['#120e03', '#261e07', '#47390f', '#665217'],
    farColor: '#292008',
    midColor: '#3d300d',
    windowColor: '#ffd700',
    gridColor: '#ffd700',
    surfaceTint: '#33280b',
    celestial: { type: 'sun', color: '#ffd700', x: 420, y: 170, r: 70 }
  },
  {
    id: 'apex_matrix',
    name: 'APEX MATRITSA (APEX)',
    desc: 'Yakuniy kiber cho\'qqi: To\'q qizil kosmos, qora monolitlar va lazer oqimlari.',
    color: '#ff00aa',
    icon: '👑',
    skyColors: ['#14010a', '#290317', '#4a072b', '#6b0c40'],
    farColor: '#2b0419',
    midColor: '#3d0725',
    windowColor: '#ff00aa',
    gridColor: '#ff00aa',
    surfaceTint: '#33051e',
    celestial: { type: 'sphere', color: '#ff00aa', x: 640, y: 150, r: 85 }
  }
];

class BackgroundSystem {
  constructor(game) {
    this.game = game;
    this.themes = BACKGROUND_THEMES;
    this.selectedThemeId = StorageManager.getBackgroundTheme();
    this.activeTheme = this.resolveActiveTheme();
    this.cachedCanvases = {};
    this.initThemeCanvases();
  }

  getThemeList() {
    return this.themes;
  }

  getSelectedThemeId() {
    return this.selectedThemeId;
  }

  setTheme(themeId) {
    const valid = this.themes.find(t => t.id === themeId);
    if (valid) {
      this.selectedThemeId = themeId;
      StorageManager.setBackgroundTheme(themeId);
      this.activeTheme = this.resolveActiveTheme();
      return true;
    }
    return false;
  }

  cycleTheme() {
    const ids = this.themes.map(t => t.id);
    const currIdx = ids.indexOf(this.selectedThemeId);
    const nextIdx = (currIdx + 1) % ids.length;
    this.setTheme(ids[nextIdx]);
    return this.getActiveTheme();
  }

  resolveActiveTheme() {
    if (this.selectedThemeId !== 'auto') {
      const match = this.themes.find(t => t.id === this.selectedThemeId);
      if (match) return match;
    }

    // Auto Mode: match sector of current stage
    const stageNum = (this.game && this.game.currentStage) ? this.game.currentStage : 1;
    const secIdx = Math.min(9, Math.floor((stageNum - 1) / 10));
    // Themes 1 to 10 correspond to Sectors 1 to 10
    return this.themes[secIdx + 1] || this.themes[1];
  }

  getActiveTheme() {
    this.activeTheme = this.resolveActiveTheme();
    return this.activeTheme;
  }

  initThemeCanvases() {
    if (typeof document === 'undefined' || typeof document.createElement !== 'function') return; // Headless environment

    for (const theme of this.themes) {
      if (theme.id === 'auto') continue;
      this.cachedCanvases[theme.id] = {
        sky: this.generateSkyCanvas(theme),
        far: this.generateFarCanvas(theme),
        mid: this.generateMidCanvas(theme),
        floor: this.generateFloorCanvas(theme),
        ceiling: this.generateCeilingCanvas(theme)
      };
    }
  }

  generateSkyCanvas(theme) {
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    // Sky Gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 720);
    const colors = theme.skyColors || ['#0a0c16', '#1a2255'];
    colors.forEach((c, idx) => {
      grad.addColorStop(idx / (colors.length - 1), c);
    });
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1280, 720);

    // Celestial body
    if (theme.celestial) {
      const { type, color, x, y, r } = theme.celestial;
      ctx.save();
      ctx.shadowColor = color;
      ctx.shadowBlur = 30;

      if (type === 'moon' || type === 'sphere') {
        const radGrad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
        radGrad.addColorStop(0, '#ffffff');
        radGrad.addColorStop(0.6, color);
        radGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      } else if (type === 'sun' || type === 'furnace') {
        // High-tech radiant sun
        const radGrad = ctx.createRadialGradient(x, y, r * 0.2, x, y, r);
        radGrad.addColorStop(0, '#ffffff');
        radGrad.addColorStop(0.4, color);
        radGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();

        // Digital horizontal scanlines across sun
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        for (let sl = y - r; sl < y + r; sl += 6) {
          ctx.fillRect(x - r, sl, r * 2, 2.5);
        }
      } else if (type === 'ring') {
        ctx.strokeStyle = color;
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.ellipse(x, y, r * 1.5, r * 0.65, Math.PI / 6, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, r * 0.6, 0, Math.PI * 2);
        ctx.fill();
      } else if (type === 'nebula') {
        for (let i = 0; i < 4; i++) {
          const radGrad = ctx.createRadialGradient(x + (i - 2) * 50, y + (i % 2) * 40, 20, x, y, r * 1.3);
          radGrad.addColorStop(0, 'rgba(0, 229, 255, 0.4)');
          radGrad.addColorStop(0.5, 'rgba(150, 0, 255, 0.2)');
          radGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = radGrad;
          ctx.beginPath();
          ctx.arc(x + (i - 2) * 40, y, r * 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }

    // Distant background star specks
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    for (let i = 0; i < 60; i++) {
      const sx = (i * 12347) % 1280;
      const sy = (i * 9871) % 460;
      const sz = (i % 3 === 0) ? 2 : 1;
      ctx.fillRect(sx, sy, sz, sz);
    }

    return canvas;
  }

  generateFarCanvas(theme) {
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    ctx.fillStyle = theme.farColor || '#121935';

    // Generate distinct architectural skyline for each biome
    const buildings = [
      { x: 0, w: 120, h: 360 }, { x: 130, w: 90, h: 420 },
      { x: 230, w: 140, h: 310 }, { x: 380, w: 100, h: 490 },
      { x: 490, w: 160, h: 340 }, { x: 660, w: 110, h: 440 },
      { x: 780, w: 130, h: 380 }, { x: 920, w: 150, h: 510 },
      { x: 1080, w: 110, h: 390 }, { x: 1200, w: 100, h: 430 }
    ];

    buildings.forEach(b => {
      const topY = 720 - b.h;
      ctx.fillRect(b.x, topY, b.w, b.h);

      // Antenna / Spire on tall buildings
      if (b.h > 400) {
        ctx.fillRect(b.x + b.w / 2 - 2, topY - 35, 4, 35);
        ctx.fillStyle = theme.color;
        ctx.fillRect(b.x + b.w / 2 - 3, topY - 38, 6, 4);
        ctx.fillStyle = theme.farColor;
      }
    });

    // Dim window matrix
    ctx.fillStyle = theme.windowColor ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 240, 255, 0.15)';
    buildings.forEach(b => {
      const topY = 720 - b.h;
      for (let wy = topY + 30; wy < 600; wy += 26) {
        for (let wx = b.x + 12; wx < b.x + b.w - 12; wx += 20) {
          if ((wx + wy) % 5 === 0) {
            ctx.fillRect(wx, wy, 8, 12);
          }
        }
      }
    });

    return canvas;
  }

  generateMidCanvas(theme) {
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    ctx.fillStyle = theme.midColor || '#182448';

    // Midground structures (closer, with vibrant neon signs and windows)
    const midStructures = [
      { x: 30, w: 150, h: 290 }, { x: 210, w: 180, h: 260 },
      { x: 420, w: 140, h: 320 }, { x: 590, w: 190, h: 270 },
      { x: 810, w: 160, h: 310 }, { x: 1000, w: 150, h: 280 },
      { x: 1170, w: 130, h: 300 }
    ];

    midStructures.forEach(b => {
      const topY = 720 - b.h;
      ctx.fillRect(b.x, topY, b.w, b.h);

      // Glowing edge line at top
      ctx.fillStyle = theme.color;
      ctx.fillRect(b.x, topY, b.w, 3);
      ctx.fillStyle = theme.midColor;
    });

    // Glowing neon billboards and windows
    midStructures.forEach((b, idx) => {
      const topY = 720 - b.h;
      // Billboard on every 2nd building
      if (idx % 2 === 0) {
        ctx.fillStyle = 'rgba(10, 15, 30, 0.9)';
        ctx.fillRect(b.x + 20, topY + 25, b.w - 40, 36);
        ctx.strokeStyle = theme.color;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(b.x + 20, topY + 25, b.w - 40, 36);

        ctx.fillStyle = theme.color;
        ctx.font = '10px monospace';
        ctx.fillText('CYBER //', b.x + 28, topY + 48);
      }

      // Windows
      ctx.fillStyle = theme.windowColor || '#00f0ff';
      for (let wy = topY + 80; wy < 580; wy += 32) {
        for (let wx = b.x + 16; wx < b.x + b.w - 16; wx += 24) {
          if ((wx * 7 + wy * 3) % 4 === 0) {
            ctx.globalAlpha = 0.65;
            ctx.fillRect(wx, wy, 10, 16);
            ctx.globalAlpha = 1.0;
          }
        }
      }
    });

    return canvas;
  }

  generateFloorCanvas(theme) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 140;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    // Floor base gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 140);
    grad.addColorStop(0, theme.surfaceTint || '#162233');
    grad.addColorStop(1, '#050810');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 140);

    // Glowing laser beam edge (running surface at y=0)
    ctx.fillStyle = theme.gridColor || '#00f0ff';
    ctx.fillRect(0, 0, 256, 4);

    // Edge gradient glow strip
    const edgeGrad = ctx.createLinearGradient(0, 4, 0, 26);
    edgeGrad.addColorStop(0, 'rgba(0, 240, 255, 0.45)');
    edgeGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = edgeGrad;
    ctx.fillRect(0, 4, 256, 22);

    // High-tech floor grid / circuitry
    ctx.strokeStyle = theme.gridColor || '#00f0ff';
    ctx.lineWidth = 1.2;
    ctx.globalAlpha = 0.45;
    for (let x = 0; x < 256; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 4);
      ctx.lineTo(x + 20, 140);
      ctx.stroke();
    }
    // Horizontal runway grid lines
    ctx.beginPath();
    ctx.moveTo(0, 28);
    ctx.lineTo(256, 28);
    ctx.moveTo(0, 64);
    ctx.lineTo(256, 64);
    ctx.moveTo(0, 105);
    ctx.lineTo(256, 105);
    ctx.stroke();

    // Circuit nodes
    ctx.fillStyle = theme.gridColor || '#00f0ff';
    for (let x = 16; x < 256; x += 64) {
      ctx.fillRect(x - 2, 26, 4, 4);
      ctx.fillRect(x + 20, 62, 4, 4);
    }
    ctx.globalAlpha = 1.0;

    return canvas;
  }

  generateCeilingCanvas(theme) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 140;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    // Ceiling base gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 140);
    grad.addColorStop(0, '#050810');
    grad.addColorStop(1, theme.surfaceTint || '#162233');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 140);

    // Glowing bottom edge (where inverted player walks at y=140)
    ctx.fillStyle = theme.gridColor || '#00f0ff';
    ctx.fillRect(0, 136, 256, 4);

    // Glow strip upwards
    const edgeGrad = ctx.createLinearGradient(0, 136, 0, 114);
    edgeGrad.addColorStop(0, 'rgba(0, 240, 255, 0.45)');
    edgeGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = edgeGrad;
    ctx.fillRect(0, 114, 256, 22);

    // Inverted ceiling grid lines
    ctx.strokeStyle = theme.gridColor || '#00f0ff';
    ctx.lineWidth = 1.2;
    ctx.globalAlpha = 0.45;
    for (let x = 0; x < 256; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 136);
      ctx.lineTo(x + 20, 0);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(0, 108);
    ctx.lineTo(256, 108);
    ctx.moveTo(0, 72);
    ctx.lineTo(256, 72);
    ctx.moveTo(0, 32);
    ctx.lineTo(256, 32);
    ctx.stroke();

    // Circuit nodes
    ctx.fillStyle = theme.gridColor || '#00f0ff';
    for (let x = 16; x < 256; x += 64) {
      ctx.fillRect(x - 2, 106, 4, 4);
      ctx.fillRect(x + 20, 70, 4, 4);
    }
    ctx.globalAlpha = 1.0;

    return canvas;
  }

  drawParallax(ctx, bgOffsets) {
    const theme = this.getActiveTheme();
    const cached = this.cachedCanvases[theme.id];

    ctx.save();

    if (cached) {
      // 1. SKY LAYER (0.1x parallax)
      const skyX = -(bgOffsets.sky % 1280);
      ctx.drawImage(cached.sky, skyX, 0, 1280, 720);
      ctx.drawImage(cached.sky, skyX + 1280, 0, 1280, 720);

      // 2. FAR ARCHITECTURE LAYER (0.3x parallax)
      const farX = -(bgOffsets.far % 1280);
      ctx.drawImage(cached.far, farX, 0, 1280, 720);
      ctx.drawImage(cached.far, farX + 1280, 0, 1280, 720);

      // 3. MIDGROUND ARCHITECTURE LAYER (0.6x parallax)
      const midX = -(bgOffsets.mid % 1280);
      ctx.drawImage(cached.mid, midX, 0, 1280, 720);
      ctx.drawImage(cached.mid, midX + 1280, 0, 1280, 720);

      // 4. CEILING (y: 0 to 140, 1.0x parallax)
      const ceilOffX = -(bgOffsets.ceiling % 256);
      for (let x = ceilOffX - 256; x < 1280 + 256; x += 256) {
        ctx.drawImage(cached.ceiling, x, 0, 256, 140);
      }

      // 5. FLOOR (y: 580 to 720, 1.0x parallax)
      const floorOffX = -(bgOffsets.floor % 256);
      for (let x = floorOffX - 256; x < 1280 + 256; x += 256) {
        ctx.drawImage(cached.floor, x, 580, 256, 140);
      }
    } else {
      // Fallback if headless / context unavailable
      ctx.fillStyle = theme.skyColors ? theme.skyColors[0] : '#080a1a';
      ctx.fillRect(0, 0, 1280, 720);
      ctx.fillStyle = theme.surfaceTint || '#162233';
      ctx.fillRect(0, 0, 1280, 140);
      ctx.fillRect(0, 580, 1280, 140);
    }

    ctx.restore();
  }
}
