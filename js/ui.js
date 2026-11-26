// ========================================================
// PIXEL RUNNER: CANVAS UI SYSTEM (v3.0 EXTENDED EDITION)
// ========================================================

class UIManager {
  constructor(game) {
    this.game = game;
    this.buttons = [];
    this.hoveredBtn = null;
    this.loadIcons();
  }

  loadIcons() {
    this.coinIcon = new Image();
    this.coinIcon.src = 'assets/sprites/ui/icon_coin.png';
    this.shieldIcon = new Image();
    this.shieldIcon.src = 'assets/sprites/ui/icon_shield.png';
    this.magnetIcon = new Image();
    this.magnetIcon.src = 'assets/sprites/ui/icon_magnet.png';
    this.gravityIcon = new Image();
    this.gravityIcon.src = 'assets/sprites/ui/icon_gravity.png';
    this.doubleIcon = new Image();
    this.doubleIcon.src = 'assets/sprites/ui/icon_double.png';
  }

  clearButtons() {
    this.buttons = [];
  }

  addButton(id, x, y, width, height, text, onClick, color = '#00f0ff') {
    this.buttons.push({ id, x, y, width, height, text, onClick, color });
  }

  handleClick(mouseX, mouseY) {
    for (const btn of this.buttons) {
      if (
        mouseX >= btn.x &&
        mouseX <= btn.x + btn.width &&
        mouseY >= btn.y &&
        mouseY <= btn.y + btn.height
      ) {
        AudioSys.playSFX('click');
        btn.onClick();
        return true;
      }
    }
    return false;
  }

  handleMouseMove(mouseX, mouseY) {
    this.hoveredBtn = null;
    for (const btn of this.buttons) {
      if (
        mouseX >= btn.x &&
        mouseX <= btn.x + btn.width &&
        mouseY >= btn.y &&
        mouseY <= btn.y + btn.height
      ) {
        this.hoveredBtn = btn;
        return;
      }
    }
  }

  draw(ctx) {
    this.clearButtons();

    switch (this.game.state) {
      case 'MENU':
        this.drawMainMenu(ctx);
        break;
      case 'LEVEL_SELECT':
        this.drawLevelSelect(ctx);
        break;
      case 'PLAYING':
        this.drawHUD(ctx);
        break;
      case 'PAUSED':
        this.drawHUD(ctx);
        this.drawPauseMenu(ctx);
        break;
      case 'STAGE_CLEAR':
        this.drawHUD(ctx);
        this.drawStageClear(ctx);
        break;
      case 'GAMEOVER':
        this.drawHUD(ctx);
        this.drawGameOver(ctx);
        break;
      case 'SHOP':
        this.drawShop(ctx);
        break;
      case 'PETS':
        this.drawPetsShop(ctx);
        break;
      case 'QUESTS':
        this.drawQuestsModal(ctx);
        break;
      case 'SETTINGS':
        this.drawSettings(ctx);
        break;
      case 'CONTROLS_GUIDE':
        this.drawControlsGuide(ctx);
        break;
      case 'BACKGROUND_SELECT':
        this.drawBackgroundSelect(ctx);
        break;
    }

    this.renderButtons(ctx);
  }

  drawHUD(ctx) {
    // 1. Top Glassmorphism Bar
    ctx.fillStyle = 'rgba(10, 15, 30, 0.88)';
    ctx.fillRect(0, 0, 1280, 68);
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0, 67, 1280, 1);

    // Distance or Stage Progress
    ctx.fillStyle = '#00f0ff';
    ctx.font = '13px "Press Start 2P", monospace';
    if (this.game.gameMode === 'campaign') {
      const target = this.game.getStageTarget(this.game.currentStage);
      const displayDist = Math.min(target, Math.floor(this.game.distance));
      ctx.fillText(`${this.game.currentStage}-BOSQICH: ${displayDist}/${target}m`, 25, 42);
    } else {
      ctx.fillText(`MASOFA: ${Math.floor(this.game.distance)}m`, 25, 42);
    }

    // Coins Counter
    if (this.coinIcon.complete) {
      ctx.drawImage(this.coinIcon, 340, 22, 24, 24);
    }
    ctx.fillStyle = '#ffd700';
    ctx.font = '15px "Press Start 2P", monospace';
    ctx.fillText(`${this.game.coins}`, 372, 42);

    // Speedometer
    const speedKmh = Math.floor(this.game.gameSpeed);
    ctx.fillStyle = '#ff00aa';
    ctx.font = '11px "Press Start 2P", monospace';
    ctx.fillText(`${speedKmh}KM/H`, 440, 42);

    // 2. CENTER: DYNAMIC FEVER & COMBO BAR
    const comboSys = this.game.comboSys;
    const barX = 540;
    const barY = 16;
    const barW = 280;
    const barH = 34;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.strokeStyle = comboSys.isFeverActive ? '#ff00aa' : '#00f0ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY, barW, barH);

    if (comboSys.isFeverActive) {
      // Animated rainbow gradient in Fever
      const fillW = (barW - 4) * (comboSys.feverTimer / comboSys.feverDuration);
      const feverGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
      feverGrad.addColorStop(0, '#ff0077');
      feverGrad.addColorStop(0.5, '#ffd700');
      feverGrad.addColorStop(1, '#00ffcc');
      ctx.fillStyle = feverGrad;
      ctx.fillRect(barX + 2, barY + 2, fillW, barH - 4);

      ctx.fillStyle = '#ffffff';
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#ff00d4';
      ctx.shadowBlur = 8;
      ctx.fillText(`🔥 FEVER: ${comboSys.feverTimer.toFixed(1)}s (3X COINS) 🔥`, barX + barW / 2, barY + 22);
      ctx.shadowBlur = 0;
      ctx.textAlign = 'left';
    } else {
      // Normal Combo Fill Bar
      const fillW = (barW - 4) * (comboSys.feverMeter / 100);
      ctx.fillStyle = comboSys.feverMeter > 80 ? 'rgba(255, 0, 120, 0.8)' : 'rgba(0, 240, 255, 0.6)';
      ctx.fillRect(barX + 2, barY + 2, fillW, barH - 4);

      ctx.fillStyle = '#ffffff';
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`KOMBO x${comboSys.comboMultiplier.toFixed(1)} [${Math.floor(comboSys.feverMeter)}%]`, barX + barW / 2, barY + 22);
      ctx.textAlign = 'left';
    }

    // 3. RIGHT: WEATHER & PET INDICATOR
    const weatherSys = this.game.weatherSys;
    const petSys = this.game.companionPet;

    // Weather Badge
    ctx.fillStyle = '#88aacc';
    ctx.font = '10px "Press Start 2P", monospace';
    const weatherText = `${weatherSys.getCurrentPhaseName().split(' ')[0]} | ${weatherSys.getCurrentWeatherName()}`;
    ctx.fillText(weatherText, 840, 32);

    // Pet Badge
    if (petSys && petSys.type !== 'none') {
      const petName = petSys.petDatabase[petSys.type]?.name.split(' ')[0] || 'PET';
      const petColor = petSys.petDatabase[petSys.type]?.color || '#00f0ff';
      ctx.fillStyle = petColor;
      ctx.fillText(`PET: ${petName}`, 840, 52);
    }

    // Dash (E)
    const dashReady = this.game.player.dashCooldown <= 0;
    ctx.fillStyle = dashReady ? '#00ffff' : '#778899';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillText(dashReady ? 'DASH: OK' : `DASH:${this.game.player.dashCooldown.toFixed(1)}s`, 1080, 42);

    // Pause button
    this.addButton('pause', 1210, 14, 40, 40, 'II', () => this.game.pauseGame(), '#00f0ff');

    // 4. Stage Progress Line (Top line)
    if (this.game.gameMode === 'campaign') {
      const target = this.game.getStageTarget(this.game.currentStage);
      const prog = Math.min(1.0, this.game.distance / target);
      ctx.fillStyle = 'rgba(0, 240, 255, 0.2)';
      ctx.fillRect(0, 68, 1280, 4);
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(0, 68, 1280 * prog, 4);
    }

    // 5. Power-up Badges (Left Column)
    let badgeX = 30;
    const badgeY = 82;

    if (this.game.player.hasShield) {
      this.drawBadge(ctx, badgeX, badgeY, this.shieldIcon, 'SHIELD', '#00f0ff');
      badgeX += 135;
    }
    if (this.game.timers.magnet > 0) {
      this.drawBadge(ctx, badgeX, badgeY, this.magnetIcon, `${this.game.timers.magnet.toFixed(1)}s`, '#ff4444');
      badgeX += 135;
    }
    if (this.game.timers.gravity > 0) {
      this.drawBadge(ctx, badgeX, badgeY, this.gravityIcon, `${this.game.timers.gravity.toFixed(1)}s`, '#d844ff');
      badgeX += 135;
    }
    if (this.game.timers.double > 0) {
      this.drawBadge(ctx, badgeX, badgeY, this.doubleIcon, `${this.game.timers.double.toFixed(1)}s`, '#ffd700');
    }

    // 6. INTRO CONTROLS TUTORIAL OVERLAY (Prominently visible when entering/starting)
    if (this.game.introGuideTimer > 0) {
      const alpha = Math.min(1.0, this.game.introGuideTimer / 0.8);
      ctx.save();
      ctx.globalAlpha = alpha;

      const bannerX = 220;
      const bannerY = 86;
      const bannerW = 840;
      const bannerH = 175;

      ctx.fillStyle = 'rgba(8, 14, 28, 0.94)';
      ctx.fillRect(bannerX, bannerY, bannerW, bannerH);
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(bannerX, bannerY, bannerW, bannerH);

      // Title
      ctx.fillStyle = '#00f0ff';
      ctx.font = '14px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText("🕹️ QANDAY O'YNASH KERAK? (BOSHQARUV)", bannerX + bannerW / 2, bannerY + 30);

      // Row 1: SAKRASH (JUMP)
      ctx.textAlign = 'left';
      ctx.fillStyle = '#00ffcc';
      ctx.font = '11px "Press Start 2P", monospace';
      ctx.fillText("⬆️ SAKRASH:", bannerX + 25, bannerY + 68);
      ctx.fillStyle = '#ffffff';
      ctx.font = '15px "Rajdhani", sans-serif';
      ctx.fillText("[SPACE] / [W] / [↑] yoki EKRANNI BOSING  (Havoda yana bossangiz: 2X/3X sakraydi!)", bannerX + 165, bannerY + 67);

      // Row 2: YOTISH (SLIDE)
      ctx.fillStyle = '#ffaa00';
      ctx.font = '11px "Press Start 2P", monospace';
      ctx.fillText("⬇️ YOTISH:", bannerX + 25, bannerY + 102);
      ctx.fillStyle = '#ffffff';
      ctx.font = '15px "Rajdhani", sans-serif';
      ctx.fillText("[S] / [↓] (ushlab turing) yoki o'ngdagi [SLIDE]  (Pastki to'siqlar ostidan sirpanish)", bannerX + 165, bannerY + 101);

      // Row 3: DASH & FLIP
      ctx.fillStyle = '#00e5ff';
      ctx.font = '11px "Press Start 2P", monospace';
      ctx.fillText("⚡ DASH:", bannerX + 25, bannerY + 136);
      ctx.fillStyle = '#ffffff';
      ctx.font = '15px "Rajdhani", sans-serif';
      ctx.fillText("[E] yoki [D]  |  🔄 FLIP GRAVITATSIYA: [F] yoki [SHIFT] (Shiftda teskari yugurish)", bannerX + 165, bannerY + 135);

      // Disappear timer hint
      ctx.fillStyle = 'rgba(0, 240, 255, 0.65)';
      ctx.font = '12px "Rajdhani", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Bu yo'riqnoma ${Math.ceil(this.game.introGuideTimer)}s dan keyin avtomatik yopiladi`, bannerX + bannerW / 2, bannerY + 163);

      // Bouncing glowing arrow above the hero
      if (this.game.player && this.game.introGuideTimer > 1.2) {
        const bounce = Math.sin(performance.now() * 0.008) * 8;
        const arrowX = this.game.player.x + 18;
        const arrowY = (this.game.player.isInverted ? this.game.player.y + 75 : this.game.player.y - 36) + bounce;

        ctx.fillStyle = '#00ffcc';
        ctx.font = '11px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#00ffcc';
        ctx.shadowBlur = 12;
        ctx.fillText("⬆️ SAKRASH (SPACE / TAP)!", arrowX, arrowY - 14);
        ctx.font = '20px "Press Start 2P", monospace';
        ctx.fillText("▼", arrowX, arrowY);
        ctx.shadowBlur = 0;
      }

      ctx.restore();
    }

    // 7. BOTTOM CONTROLS HUD (Always visible, clean glass badges)
    ctx.fillStyle = 'rgba(8, 12, 24, 0.9)';
    ctx.fillRect(0, 672, 1280, 48);
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 672, 1280, 1);

    const p1 = { x: 25, y: 678, w: 345, h: 36, col: '#00ffcc', t: '🟢 [SPACE / W / BOSISH] SAKRASH (2X)' };
    const p2 = { x: 385, y: 678, w: 295, h: 36, col: '#ffaa00', t: '🟡 [S / ↓] YOTISH (SLIDE)' };
    const p3 = { x: 695, y: 678, w: 235, h: 36, col: '#00e5ff', t: '🔵 [E] DASH (TEZLIK)' };
    const p4 = { x: 945, y: 678, w: 310, h: 36, col: '#d844ff', t: '🟣 [F / SHIFT] FLIP GRAVITI' };

    [p1, p2, p3, p4].forEach(p => {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.strokeStyle = p.col;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(p.x, p.y, p.w, p.h);

      ctx.fillStyle = p.col;
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(p.t, p.x + p.w / 2, p.y + 22);
    });
    ctx.textAlign = 'left';
  }

  drawBadge(ctx, x, y, icon, label, color) {
    ctx.fillStyle = 'rgba(15, 20, 35, 0.88)';
    ctx.fillRect(x, y, 125, 36);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, 125, 36);

    if (icon.complete) {
      ctx.drawImage(icon, x + 8, y + 6, 24, 24);
    }
    ctx.fillStyle = color;
    ctx.font = '12px "Press Start 2P", monospace';
    ctx.fillText(label, x + 38, y + 23);
  }

  drawMainMenu(ctx) {
    ctx.fillStyle = 'rgba(8, 10, 20, 0.82)';
    ctx.fillRect(0, 0, 1280, 720);

    ctx.fillStyle = '#00f0ff';
    ctx.font = '48px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 24;
    ctx.fillText('PIXEL RUNNER', 640, 160);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#ff2288';
    ctx.font = '16px "Press Start 2P", monospace';
    ctx.fillText('— ANTI-GRAVITY PROTOCOL (v3.0) —', 640, 210);

    ctx.fillStyle = '#8899aa';
    ctx.font = '12px "Press Start 2P", monospace';
    ctx.fillText(`ENG YUQORI REKORD: ${Math.floor(StorageManager.getHighScore())} M  |  TANGALAR: ${StorageManager.getTotalCoins()}`, 640, 255);
    ctx.textAlign = 'left';

    // 2-COLUMN BUTTON LAYOUT FOR BALANCED DESIGN
    // Left Column
    this.addButton('campaign', 260, 315, 360, 54, "BOSQICHLI REJIM (1-100)", () => {
      this.game.jumpToHighestLevelPage();
      this.game.state = 'LEVEL_SELECT';
    }, '#00ffcc');
    this.addButton('endless', 260, 378, 360, 48, "CHEKSIZ REJIM (ENDLESS)", () => this.game.startEndlessGame(), '#ffaa00');
    this.addButton('shop', 260, 434, 360, 48, "DO'KON (5 TA SKIN)", () => { this.game.state = 'SHOP'; }, '#ffd700');

    // Right Column
    this.addButton('quests', 660, 315, 360, 54, "KUNLIK VAZIFALAR 🏆", () => { this.game.state = 'QUESTS'; }, '#00f0ff');
    this.addButton('pets', 660, 378, 360, 48, "HAMROHLAR (PETS) 🤖", () => { this.game.state = 'PETS'; }, '#00ffaa');
    this.addButton('settings', 660, 434, 360, 48, "SOZLAMALAR ⚙️", () => { this.game.state = 'SETTINGS'; }, '#00b0ff');

    // CENTER ACTION BUTTONS
    this.addButton('how_to_play', 410, 492, 460, 46, "QANDAY O'YNASH KERAK? 🕹️", () => {
      this.game.state = 'CONTROLS_GUIDE';
    }, '#00ffcc');

    this.addButton('bg_select', 410, 546, 460, 46, "FONNI ALMASHTIRISH (10 TA BIOM) 🎨", () => {
      this.game.state = 'BACKGROUND_SELECT';
    }, '#ffd700');

    ctx.fillStyle = 'rgba(0, 240, 255, 0.75)';
    ctx.font = '11px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText("Boshlash: [BOSQICHLI REJIM] tugmasi yoki klaviaturada [SPACE] / [ENTER]", 640, 615);
    ctx.textAlign = 'left';
    ctx.textAlign = 'left';
  }

  drawLevelSelect(ctx) {
    ctx.fillStyle = 'rgba(8, 10, 20, 0.96)';
    ctx.fillRect(0, 0, 1280, 720);

    const page = this.game.levelSelectPage || 1;
    const stages = StageDatabase.getStagesForPage(page);
    const sector = StageDatabase.getSectorForStage((page - 1) * 10 + 1);
    const unlocked = StorageManager.getUnlockedStages().map(Number);
    const starsData = StorageManager.getStageStars();
    const totalStars = StorageManager.getTotalStars();

    // 1. Header & Total Stars
    ctx.fillStyle = '#00f0ff';
    ctx.font = '24px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText("BOSQICHLAR XARITASI (1-100 BOSQICH)", 640, 48);

    ctx.fillStyle = '#ffd700';
    ctx.font = '12px "Press Start 2P", monospace';
    ctx.fillText(`JAMI YULDUZLAR: ${totalStars} / 300 ★`, 640, 75);

    // 2. Sector Navigation Bar (Top)
    const navY = 95;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(260, navY, 760, 42);
    ctx.strokeStyle = sector.color;
    ctx.lineWidth = 2;
    ctx.strokeRect(260, navY, 760, 42);

    ctx.fillStyle = sector.color;
    ctx.font = '12px "Press Start 2P", monospace';
    ctx.fillText(`SEKTOR ${page}/10: ${sector.name} (${(page - 1) * 10 + 1}-${page * 10}-BOSQICH)`, 640, navY + 26);
    ctx.textAlign = 'left';

    // Sector Prev / Next Buttons
    if (page > 1) {
      this.addButton('stage_prev_page', 70, navY, 170, 42, "<< OLDINGI", () => {
        this.game.prevLevelPage();
      }, '#00f0ff');
    }

    if (page < 10) {
      this.addButton('stage_next_page', 1040, navY, 170, 42, "KEYINGI >>", () => {
        this.game.nextLevelPage();
      }, '#00f0ff');
    }

    // 3. 5x2 Grid of 10 Stages
    stages.forEach((st, idx) => {
      const col = idx % 5;
      const row = Math.floor(idx / 5);

      const cardW = 216;
      const cardH = 195;
      const cardX = 66 + col * (cardW + 14);
      const cardY = 155 + row * (cardH + 16);

      const isUnlocked = st.num === 1 || unlocked.includes(st.num);

      // Card Background & Border
      ctx.fillStyle = isUnlocked ? (st.isBoss ? 'rgba(35, 12, 25, 0.92)' : 'rgba(15, 23, 42, 0.92)') : 'rgba(18, 20, 28, 0.6)';
      ctx.fillRect(cardX, cardY, cardW, cardH);
      ctx.strokeStyle = isUnlocked ? (st.isBoss ? '#ff0055' : st.color) : '#334155';
      ctx.lineWidth = isUnlocked ? (st.isBoss ? 3 : 2) : 1;
      ctx.strokeRect(cardX, cardY, cardW, cardH);

      // Card Header
      ctx.textAlign = 'center';
      ctx.fillStyle = isUnlocked ? (st.isBoss ? '#ff2266' : st.color) : '#64748b';
      ctx.font = '12px "Press Start 2P", monospace';
      ctx.fillText(st.isBoss ? `👑 ${st.num}-BOSQICH` : `${st.num}-BOSQICH`, cardX + cardW / 2, cardY + 26);

      // Stage Title
      ctx.fillStyle = isUnlocked ? '#ffffff' : '#64748b';
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.fillText(st.name, cardX + cardW / 2, cardY + 50);

      // Target Distance
      ctx.fillStyle = '#88aacc';
      ctx.font = '11px "Press Start 2P", monospace';
      ctx.fillText(st.isBoss ? `BOSS JANGI` : `${st.targetDistance} metr`, cardX + cardW / 2, cardY + 76);

      // Stars
      const starsEarned = starsData[st.num] || 0;
      let starsStr = '';
      for (let s = 1; s <= 3; s++) {
        starsStr += s <= starsEarned ? '★ ' : '☆ ';
      }
      ctx.fillStyle = '#ffd700';
      ctx.font = '15px "Press Start 2P", monospace';
      ctx.fillText(starsStr.trim(), cardX + cardW / 2, cardY + 112);

      if (isUnlocked) {
        // Transparent click overlay for whole card
        this.addButton(`card_stage_${st.num}`, cardX, cardY, cardW, cardH, '', () => {
          this.game.startStage(st.num);
        }, 'transparent');

        // Visible button at bottom of card
        this.addButton(`stage_${st.num}`, cardX + 18, cardY + 142, cardW - 36, 38, "BOSHLASH", () => {
          this.game.startStage(st.num);
        }, st.isBoss ? '#ff0055' : st.color);
      } else {
        ctx.fillStyle = '#64748b';
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.fillText("QULFLANGAN 🔒", cardX + cardW / 2, cardY + 162);
      }
    });

    // 4. Bottom Actions
    this.addButton('ls_back', 66, 595, 230, 48, "ASOSIY MENYU", () => {
      this.game.state = 'MENU';
    }, '#00f0ff');

    this.addButton('ls_jump_highest', 316, 595, 450, 48, "SO'NGGI OCHILGANGA O'TISH", () => {
      this.game.jumpToHighestLevelPage();
    }, '#ffd700');

    const highestUnlocked = StorageManager.getHighestUnlockedStage();
    this.addButton('ls_start_highest', 786, 595, 428, 48, `O'YNASH (${highestUnlocked}-BOSQICH) >>`, () => {
      this.game.startStage(highestUnlocked);
    }, '#00ffcc');

    // Bottom Navigation Hint
    ctx.textAlign = 'center';
    ctx.fillStyle = '#00ffcc';
    ctx.font = '12px "Rajdhani", sans-serif';
    ctx.fillText("💡 QAYERNI BOSISH KERAK: O'yinda [SPACE], [W] yoki Ekranni bosib sakraysiz (2x/3x)! Pastdagi [S] bilan yotasiz.", 640, 662);
    ctx.fillStyle = 'rgba(0, 240, 255, 0.55)';
    ctx.font = '11px "Rajdhani", sans-serif';
    ctx.fillText("Klaviaturada: ← / → sahifa almashtirish  |  [SPACE] / [ENTER]: Boshlash  |  ESC: Menyuga qaytish", 640, 682);
    ctx.textAlign = 'left';
  }

  drawQuestsModal(ctx) {
    ctx.fillStyle = 'rgba(8, 12, 24, 0.96)';
    ctx.fillRect(0, 0, 1280, 720);

    ctx.fillStyle = '#00f0ff';
    ctx.font = '28px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText("KUNLIK VAZIFALAR (DAILY QUESTS)", 640, 75);

    const qSys = this.game.dailyQuests;
    ctx.fillStyle = '#8899aa';
    ctx.font = '13px "Press Start 2P", monospace';
    ctx.fillText(`BUGUNGI SANA: ${qSys.todayStr}  |  YANGILANISH: HAR KUNI`, 640, 115);

    const quests = qSys.activeQuests;
    quests.forEach((q, idx) => {
      const cardY = 160 + idx * 130;
      const cardX = 200;
      const cardW = 880;
      const cardH = 110;

      ctx.fillStyle = q.completed ? 'rgba(10, 35, 30, 0.9)' : 'rgba(15, 23, 42, 0.9)';
      ctx.fillRect(cardX, cardY, cardW, cardH);
      ctx.strokeStyle = q.completed ? '#00ffaa' : '#00b0ff';
      ctx.lineWidth = 2;
      ctx.strokeRect(cardX, cardY, cardW, cardH);

      // Quest Title & Desc
      ctx.textAlign = 'left';
      ctx.fillStyle = '#ffffff';
      ctx.font = '14px "Press Start 2P", monospace';
      ctx.fillText(q.title, cardX + 25, cardY + 34);

      ctx.fillStyle = '#88aacc';
      ctx.font = '14px "Rajdhani", sans-serif';
      ctx.fillText(q.desc, cardX + 25, cardY + 60);

      // Progress Bar
      const prog = Math.min(1.0, q.current / q.target);
      const barW = 420;
      const barH = 16;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(cardX + 25, cardY + 74, barW, barH);
      ctx.fillStyle = q.completed ? '#00ffaa' : '#00f0ff';
      ctx.fillRect(cardX + 25, cardY + 74, barW * prog, barH);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.strokeRect(cardX + 25, cardY + 74, barW, barH);

      ctx.fillStyle = '#ffffff';
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.fillText(`${q.current} / ${q.target} ${q.unit}`, cardX + 460, cardY + 86);

      // Reward & Claim Button
      if (q.claimed) {
        ctx.fillStyle = '#64748b';
        ctx.font = '12px "Press Start 2P", monospace';
        ctx.fillText("✓ OLINDI", cardX + 720, cardY + 60);
      } else if (q.completed) {
        this.addButton(`claim_${q.id}`, cardX + 680, cardY + 32, 170, 48, `OLISH (+${q.reward})`, () => {
          qSys.claimReward(q.id);
        }, '#ffd700');
      } else {
        ctx.fillStyle = '#ffd700';
        ctx.font = '11px "Press Start 2P", monospace';
        ctx.fillText(`MUKOFOT: +${q.reward}`, cardX + 690, cardY + 60);
      }
    });

    // Reset Quests for testing & Back Button
    this.addButton('quest_reset', 320, 595, 280, 48, 'YANGILASH (TEST)', () => {
      qSys.loadOrGenerateQuests(true);
      AudioSys.playSFX('powerup');
    }, '#ffaa00');

    this.addButton('quest_back', 680, 595, 280, 48, 'ASOSIY MENYU', () => {
      this.game.state = 'MENU';
    }, '#00f0ff');
  }

  drawPetsShop(ctx) {
    ctx.fillStyle = 'rgba(8, 10, 20, 0.95)';
    ctx.fillRect(0, 0, 1280, 720);

    ctx.fillStyle = '#00ffaa';
    ctx.font = '28px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText("HAMROH JONZOTLAR (PET DRONES)", 640, 75);

    ctx.fillStyle = '#ffd700';
    ctx.font = '15px "Press Start 2P", monospace';
    ctx.fillText(`JAMI TANGALAR: ${StorageManager.getTotalCoins()}`, 640, 115);
    ctx.textAlign = 'left';

    const petSys = this.game.companionPet;
    const unlocked = StorageManager.getUnlockedPets();
    const equipped = StorageManager.getEquippedPet();

    const petList = [
      { id: 'magnet_bot', name: 'MAGNO (MAGNET BOT)', price: 0, color: '#00f0ff', desc: '240px masofadagi barcha tangalarni avtomatik tortadi.' },
      { id: 'shield_drone', name: 'AEGIS (SHIELD DRONE)', price: 150, color: '#00ffaa', desc: 'Har 60s da qahramonga avtomatik himoya qalqoni beradi.' },
      { id: 'sparky', name: 'SPARKY (NEO FOX)', price: 250, color: '#ffd700', desc: 'Har 75m da +1 bonus tanga va +30% tezroq Combo/Fever beradi.' }
    ];

    petList.forEach((p, idx) => {
      const cardX = 140 + idx * 350;
      const cardY = 160;
      const cardW = 300;
      const cardH = 410;
      const isUnlocked = unlocked.includes(p.id);
      const isEquipped = equipped === p.id;

      ctx.fillStyle = isEquipped ? 'rgba(10, 35, 30, 0.92)' : 'rgba(15, 23, 42, 0.9)';
      ctx.fillRect(cardX, cardY, cardW, cardH);
      ctx.strokeStyle = isEquipped ? '#00ffaa' : p.color;
      ctx.lineWidth = isEquipped ? 3 : 2;
      ctx.strokeRect(cardX, cardY, cardW, cardH);

      // Pet Title
      ctx.fillStyle = p.color;
      ctx.font = '14px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(p.name, cardX + cardW / 2, cardY + 45);

      // Description
      ctx.fillStyle = '#88aacc';
      ctx.font = '14px "Rajdhani", sans-serif';
      ctx.fillText(p.desc, cardX + cardW / 2, cardY + 120);

      // Price
      ctx.fillStyle = '#ffd700';
      ctx.font = '13px "Press Start 2P", monospace';
      ctx.fillText(p.price === 0 ? 'NARXI: BEPUL' : `NARXI: ${p.price} TANGA`, cardX + cardW / 2, cardY + 230);

      // Action Button
      if (isEquipped) {
        ctx.fillStyle = '#00ffaa';
        ctx.font = '14px "Press Start 2P", monospace';
        ctx.fillText("JIHOZLANGAN ✓", cardX + cardW / 2, cardY + 340);
      } else if (isUnlocked) {
        this.addButton(`pet_equip_${p.id}`, cardX + 30, cardY + 315, 240, 48, "TANLASH", () => {
          petSys.setPet(p.id);
          AudioSys.playSFX('powerup');
        }, '#00ffaa');
      } else {
        const canBuy = StorageManager.getTotalCoins() >= p.price;
        this.addButton(`pet_buy_${p.id}`, cardX + 30, cardY + 315, 240, 48, `SOTIB OLISH`, () => {
          if (StorageManager.spendCoins(p.price)) {
            StorageManager.unlockPet(p.id);
            petSys.setPet(p.id);
            AudioSys.playSFX('powerup');
          }
        }, canBuy ? '#ffd700' : '#666677');
      }
    });

    ctx.textAlign = 'left';
    this.addButton('pets_back', 520, 610, 240, 48, "ASOSIY MENYU", () => {
      this.game.state = 'MENU';
    }, '#00f0ff');
  }

  drawStageClear(ctx) {
    ctx.fillStyle = 'rgba(8, 20, 15, 0.9)';
    ctx.fillRect(0, 0, 1280, 720);

    ctx.fillStyle = '#0f291e';
    ctx.fillRect(380, 100, 520, 520);
    ctx.strokeStyle = '#00ffcc';
    ctx.lineWidth = 3;
    ctx.strokeRect(380, 100, 520, 520);

    const stData = StageDatabase.getStage(this.game.currentStage);
    const nextStData = this.game.currentStage < 100 ? StageDatabase.getStage(this.game.currentStage + 1) : null;

    ctx.fillStyle = '#00ffcc';
    ctx.font = '26px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${this.game.currentStage}-BOSQICH YAKUNLANDI!`, 640, 160);

    ctx.fillStyle = '#ffd700';
    ctx.font = '24px "Press Start 2P", monospace';
    ctx.fillText("★★★", 640, 215);

    // Distance completed
    ctx.fillStyle = '#00f0ff';
    ctx.font = '14px "Press Start 2P", monospace';
    ctx.fillText(`MASOFA: ${stData.targetDistance}M BOSIB O'TILDI!`, 640, 265);

    ctx.fillStyle = '#ffd700';
    ctx.font = '13px "Press Start 2P", monospace';
    ctx.fillText(`Mukofot: +${this.game.stageBonus} Tanga!`, 640, 310);

    ctx.fillStyle = '#ffffff';
    ctx.font = '13px "Press Start 2P", monospace';
    ctx.fillText(`Yig'ilgan tangalar: ${this.game.coins}`, 640, 350);

    if (this.game.currentStage < 100) {
      ctx.fillStyle = '#88aacc';
      ctx.font = '14px "Rajdhani", sans-serif';
      ctx.fillText(`Keyingi bosqich masofasi: ${nextStData.targetDistance}m (yana ${nextStData.targetDistance - stData.targetDistance}m uzunroq!)`, 640, 395);

      this.addButton('stage_next', 410, 425, 460, 50, `KEYINGI (${this.game.currentStage + 1}-BOSQICH: ${nextStData.targetDistance}M) >>`, () => {
        this.game.startStage(this.game.currentStage + 1);
      }, '#00ffcc');
    } else {
      ctx.fillStyle = '#ffd700';
      ctx.font = '15px "Press Start 2P", monospace';
      ctx.fillText("★ TABRIKLAYMIZ! BARCHA 100 TA BOSQICH YUTILDI! ★", 640, 430);
    }

    this.addButton('stage_menu', 440, 495, 400, 46, "BOSQICHLAR XARITASI", () => {
      this.game.state = 'LEVEL_SELECT';
    }, '#00f0ff');
    ctx.textAlign = 'left';
  }

  drawPauseMenu(ctx) {
    ctx.fillStyle = 'rgba(8, 12, 24, 0.85)';
    ctx.fillRect(0, 0, 1280, 720);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(480, 130, 320, 460);
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(480, 130, 320, 460);

    ctx.fillStyle = '#00f0ff';
    ctx.font = '24px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('PAUZA', 640, 185);
    ctx.textAlign = 'left';

    const curBg = (this.game.bgSys && this.game.bgSys.getActiveTheme()) ? this.game.bgSys.getActiveTheme().name.split(' ')[0] : 'AUTO';

    this.addButton('resume', 510, 215, 260, 44, 'DAVOM ETTIRISH', () => this.game.resumeGame(), '#00ffcc');
    this.addButton('pause_quests', 510, 270, 260, 44, 'KUNLIK VAZIFALAR', () => { this.game.state = 'QUESTS'; }, '#00f0ff');
    this.addButton('pause_bg', 510, 325, 260, 44, `🎨 FON: ${curBg}`, () => {
      this.game.bgSys.cycleTheme();
      AudioSys.playSFX('powerup');
    }, '#ffd700');
    this.addButton('restart', 510, 380, 260, 44, 'QAYTA BOSHLASH', () => {
      if (this.game.gameMode === 'campaign') this.game.startStage(this.game.currentStage);
      else this.game.startEndlessGame();
    }, '#ffaa00');
    this.addButton('menu', 510, 435, 260, 44, 'ASOSIY MENYU', () => { this.game.state = 'MENU'; }, '#ff4444');
  }

  drawGameOver(ctx) {
    ctx.fillStyle = 'rgba(15, 6, 12, 0.88)';
    ctx.fillRect(0, 0, 1280, 720);

    ctx.fillStyle = '#140c14';
    ctx.fillRect(430, 120, 420, 480);
    ctx.strokeStyle = '#ff2255';
    ctx.lineWidth = 2;
    ctx.strokeRect(430, 120, 420, 480);

    ctx.fillStyle = '#ff2255';
    ctx.font = '28px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText("O'YIN TUGADI!", 640, 180);

    if (this.game.isNewRecord) {
      ctx.fillStyle = '#ffd700';
      ctx.font = '14px "Press Start 2P", monospace';
      ctx.fillText('★ YANGI REKORD! ★', 640, 215);
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = '14px "Press Start 2P", monospace';
    ctx.fillText(`Masofa: ${Math.floor(this.game.distance)} m`, 640, 260);
    ctx.fillStyle = '#ffd700';
    ctx.fillText(`Tangalar: +${this.game.coins}`, 640, 295);
    ctx.fillStyle = '#00ffcc';
    ctx.fillText(`Maks Kombo: x${this.game.comboSys.comboMultiplier.toFixed(1)}`, 640, 330);
    ctx.fillStyle = '#8899aa';
    ctx.fillText(`Eng yaxshi: ${Math.floor(StorageManager.getHighScore())} m`, 640, 365);
    ctx.textAlign = 'left';

    this.addButton('go_restart', 480, 400, 320, 50, 'QAYTA BOSHLASH', () => {
      if (this.game.gameMode === 'campaign') this.game.startStage(this.game.currentStage);
      else this.game.startEndlessGame();
    }, '#00ffcc');
    this.addButton('go_shop', 480, 460, 320, 46, "DO'KON (SKINLAR)", () => { this.game.state = 'SHOP'; }, '#ffd700');
    this.addButton('go_menu', 480, 515, 320, 46, 'ASOSIY MENYU', () => { this.game.state = 'MENU'; }, '#00f0ff');
  }

  drawShop(ctx) {
    ctx.fillStyle = 'rgba(8, 10, 20, 0.95)';
    ctx.fillRect(0, 0, 1280, 720);

    ctx.fillStyle = '#00f0ff';
    ctx.font = '28px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText("MAGAZIN — QAHRAMON SKINLARI", 640, 65);

    ctx.fillStyle = '#ffd700';
    ctx.font = '16px "Press Start 2P", monospace';
    ctx.fillText(`JAMI TANGALAR: ${StorageManager.getTotalCoins()}`, 640, 105);
    ctx.textAlign = 'left';

    const unlocked = StorageManager.getUnlockedSkins();
    const equipped = StorageManager.getEquippedSkin();

    const skins = [
      { id: 'default', name: 'CYBER RUNNER', price: 0, color: '#00f0ff', desc: 'Asosiy kiber yuguruvchi' },
      { id: 'ninja', name: 'NEON NINJA', price: 50, color: '#ff1e8c', desc: 'Tungi neon soyasi' },
      { id: 'mech', name: 'GOLDEN MECH', price: 100, color: '#ffd700', desc: 'Oltin zirhli robot' },
      { id: 'valkyrie', name: 'PHANTOM', price: 150, color: '#00ffcc', desc: 'Tezkor kiber sharpa' },
      { id: 'synthwave', name: 'SYNTH KING', price: 250, color: '#b030ff', desc: 'Retro synthwave hukmdori' }
    ];

    skins.forEach((s, idx) => {
      const cardX = 60 + idx * 236;
      const cardY = 140;
      const cardW = 216;
      const cardH = 430;
      const isUnlocked = unlocked.includes(s.id);
      const isEquipped = equipped === s.id;

      ctx.fillStyle = isEquipped ? 'rgba(10, 35, 45, 0.9)' : 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(cardX, cardY, cardW, cardH);
      ctx.strokeStyle = isEquipped ? '#00ffcc' : s.color;
      ctx.lineWidth = isEquipped ? 3 : 2;
      ctx.strokeRect(cardX, cardY, cardW, cardH);

      ctx.fillStyle = s.color;
      ctx.font = '11px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(s.name, cardX + cardW / 2, cardY + 36);

      ctx.fillStyle = '#88aacc';
      ctx.font = '13px "Rajdhani", sans-serif';
      ctx.fillText(s.desc, cardX + cardW / 2, cardY + 70);

      const previewImg = new Image();
      previewImg.src = `assets/sprites/player/player_${s.id}_run1.png`;
      if (previewImg.complete) {
        ctx.drawImage(previewImg, cardX + cardW / 2 - 36, cardY + 110, 72, 108);
      }

      ctx.fillStyle = '#ffd700';
      ctx.font = '13px "Press Start 2P", monospace';
      ctx.fillText(s.price === 0 ? 'BEPUL' : `${s.price} Tanga`, cardX + cardW / 2, cardY + 280);

      let btnText = 'SOTIB OLISH';
      let btnColor = '#ffd700';
      let action = () => {
        if (StorageManager.spendCoins(s.price)) {
          StorageManager.unlockSkin(s.id);
          StorageManager.setEquippedSkin(s.id);
          this.game.player.updateSkin(s.id);
          AudioSys.playSFX('powerup');
        }
      };

      if (isEquipped) {
        btnText = 'JIHOZLANGAN';
        btnColor = '#00ffcc';
        action = () => { };
      } else if (isUnlocked) {
        btnText = 'TANLASH';
        btnColor = '#00f0ff';
        action = () => {
          StorageManager.setEquippedSkin(s.id);
          this.game.player.updateSkin(s.id);
          AudioSys.playSFX('powerup');
        };
      }

      this.addButton(`skin_${s.id}`, cardX + 15, cardY + 360, 190, 44, btnText, action, btnColor);
    });

    this.addButton('shop_back', 540, 610, 200, 46, 'ORTGA', () => { this.game.state = 'MENU'; }, '#00f0ff');
  }

  drawSettings(ctx) {
    ctx.fillStyle = 'rgba(8, 10, 20, 0.94)';
    ctx.fillRect(0, 0, 1280, 720);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(440, 130, 400, 460);
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(440, 130, 400, 460);

    ctx.fillStyle = '#00f0ff';
    ctx.font = '24px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SOZLAMALAR', 640, 190);
    ctx.textAlign = 'left';

    const master = Math.round(StorageManager.getMasterVolume() * 100);
    const music = Math.round(StorageManager.getMusicVolume() * 100);
    const sfx = Math.round(StorageManager.getSFXVolume() * 100);

    ctx.fillStyle = '#ffffff';
    ctx.font = '12px "Press Start 2P", monospace';
    ctx.fillText(`Umumiy: ${master}%`, 480, 260);
    this.addButton('v_m_down', 680, 240, 40, 30, '-', () => {
      const v = Math.max(0, StorageManager.getMasterVolume() - 0.1);
      StorageManager.saveVolumes(v, StorageManager.getMusicVolume(), StorageManager.getSFXVolume());
      AudioSys.setMasterVolume(v);
    });
    this.addButton('v_m_up', 730, 240, 40, 30, '+', () => {
      const v = Math.min(1.0, StorageManager.getMasterVolume() + 0.1);
      StorageManager.saveVolumes(v, StorageManager.getMusicVolume(), StorageManager.getSFXVolume());
      AudioSys.setMasterVolume(v);
    });

    ctx.fillText(`Musiqa: ${music}%`, 480, 320);
    this.addButton('v_bg_down', 680, 300, 40, 30, '-', () => {
      const v = Math.max(0, StorageManager.getMusicVolume() - 0.1);
      StorageManager.saveVolumes(StorageManager.getMasterVolume(), v, StorageManager.getSFXVolume());
      AudioSys.setMusicVolume(v);
    });
    this.addButton('v_bg_up', 730, 300, 40, 30, '+', () => {
      const v = Math.min(1.0, StorageManager.getMusicVolume() + 0.1);
      StorageManager.saveVolumes(StorageManager.getMasterVolume(), v, StorageManager.getSFXVolume());
      AudioSys.setMusicVolume(v);
    });

    ctx.fillText(`SFX:    ${sfx}%`, 480, 380);
    this.addButton('v_s_down', 680, 360, 40, 30, '-', () => {
      const v = Math.max(0, StorageManager.getSFXVolume() - 0.1);
      StorageManager.saveVolumes(StorageManager.getMasterVolume(), StorageManager.getMusicVolume(), v);
      AudioSys.setSFXVolume(v);
    });
    this.addButton('v_s_up', 730, 360, 40, 30, '+', () => {
      const v = Math.min(1.0, StorageManager.getSFXVolume() + 0.1);
      StorageManager.saveVolumes(StorageManager.getMasterVolume(), StorageManager.getMusicVolume(), v);
      AudioSys.setSFXVolume(v);
    });

    this.addButton('fullscreen', 480, 420, 320, 36, 'TO\'LIQ EKRAN', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => { });
      } else {
        document.exitFullscreen().catch(() => { });
      }
    }, '#00ffcc');

    this.addButton('set_bg', 480, 466, 320, 36, 'FONNI TANLASH 🎨', () => {
      this.game.state = 'BACKGROUND_SELECT';
    }, '#ffd700');

    this.addButton('settings_back', 520, 514, 240, 40, 'ORTGA', () => { this.game.state = 'MENU'; }, '#00f0ff');
  }

  drawControlsGuide(ctx) {
    ctx.fillStyle = 'rgba(8, 10, 20, 0.96)';
    ctx.fillRect(0, 0, 1280, 720);

    // Modal frame
    const mx = 90;
    const my = 35;
    const mw = 1100;
    const mh = 650;

    ctx.fillStyle = 'rgba(12, 18, 35, 0.95)';
    ctx.fillRect(mx, my, mw, mh);
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(mx, my, mw, mh);

    // Header
    ctx.fillStyle = '#00f0ff';
    ctx.font = '22px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 14;
    ctx.fillText("🕹️ QANDAY O'YNASH KERAK? (BOSHQARUV)", 640, 80);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#ffd700';
    ctx.font = '11px "Press Start 2P", monospace';
    ctx.fillText("PIXEL RUNNER: ANTI-GRAVITY PROTOCOL — TO'LIQ QO'LLANMA", 640, 110);

    // 4 Cards in 2x2 Grid
    const cards = [
      {
        x: 120, y: 135, w: 510, h: 220,
        title: "⬆️ SAKRASH (JUMP) — 2X / 3X",
        color: "#00ffcc",
        keys: "[SPACE]  |  [W]  |  [↑]  |  EKRANNI BOSISH",
        desc: [
          "• YERDA: Qahramon to'siqlar ustidan baland sakraydi.",
          "• HAVODA: Yana 1 marta bossangiz 2X DOUBLE JUMP qiladi!",
          "• HYPER REJIMI: Ketma-ket 3X TRIPLE JUMP sakraydi!",
          "• Mobil / Sichqoncha: Ekranning istalgan joyini bosing!"
        ]
      },
      {
        x: 650, y: 135, w: 510, h: 220,
        title: "⬇️ YOTISH / SIRPANISH (SLIDE)",
        color: "#ffaa00",
        keys: "[S]  |  [↓]  |  O'NG TUGMA  |  [SLIDE]",
        desc: [
          "• BOSISH: Qahramon yerga yotib oldinga sirpanadi.",
          "• USHLAB TURISH: Tugmani qo'yib yubormaguncha yotib yuradi.",
          "• MAQSAD: Baland kiber-to'siqlar, lazerlar va uchuvchi",
          "  minalar ostidan xavfsiz emaklab o'tish uchun zarur!"
        ]
      },
      {
        x: 120, y: 375, w: 510, h: 205,
        title: "⚡ KIBER-DASH (TEZLANISH)",
        color: "#00e5ff",
        keys: "[E]  |  [D]  |  EKRANDAGI [DASH]",
        desc: [
          "• EFFEKT: Bir lahzada oldinga kuchli kiber-otilish!",
          "• TO'SIQLARNI YORISH: Yo'lidagi to'siqlarni sindirib o'tadi",
          "  va qo'shimcha +50 ball / tanga keltiradi!",
          "• Qayta tiklanish (Cooldown): 3.5 soniya."
        ]
      },
      {
        x: 650, y: 375, w: 510, h: 205,
        title: "🔄 FLIP (GRAVITATSIYANI BURISH)",
        color: "#d844ff",
        keys: "[F]  |  [SHIFT]  |  EKRANDAGI [FLIP]",
        desc: [
          "• EFFEKT: Gravitatsiya yo'nalishi bir zumda teskari aylanadi!",
          "• SHIFTDA YUGURISH: Pol o'rniga shift bo'ylab yugurasiz.",
          "• QACHON ISHLAYDI: Binafsharang portal yoki gravitatsiya",
          "  bonusi olinganda yoki Fever/Hyper rejimida faollashadi!"
        ]
      }
    ];

    cards.forEach(c => {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.fillRect(c.x, c.y, c.w, c.h);
      ctx.strokeStyle = c.color;
      ctx.lineWidth = 2;
      ctx.strokeRect(c.x, c.y, c.w, c.h);

      // Card Title
      ctx.fillStyle = c.color;
      ctx.font = '12px "Press Start 2P", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(c.title, c.x + 20, c.y + 32);

      // Keys Box
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(c.x + 20, c.y + 44, c.w - 40, 26);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(c.x + 20, c.y + 44, c.w - 40, 26);

      ctx.fillStyle = '#ffffff';
      ctx.font = '11px "Press Start 2P", monospace';
      ctx.fillText(c.keys, c.x + 30, c.y + 62);

      // Bullet points
      ctx.font = '14px "Rajdhani", sans-serif';
      ctx.fillStyle = '#cbd5e1';
      c.desc.forEach((line, lidx) => {
        ctx.fillText(line, c.x + 20, c.y + 96 + lidx * 24);
      });
    });

    // Bottom action buttons
    this.addButton('guide_play', 360, 600, 320, 50, "O'YINNI BOSHLASH >>", () => {
      this.game.startStage(1);
    }, '#00ffcc');

    this.addButton('guide_back', 700, 600, 240, 50, "ASOSIY MENYU", () => {
      this.game.state = 'MENU';
    }, '#00f0ff');
    ctx.textAlign = 'left';
  }

  drawBackgroundSelect(ctx) {
    ctx.fillStyle = 'rgba(8, 10, 20, 0.96)';
    ctx.fillRect(0, 0, 1280, 720);

    // Frame
    ctx.fillStyle = 'rgba(12, 18, 35, 0.95)';
    ctx.fillRect(70, 30, 1140, 660);
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(70, 30, 1140, 660);

    // Header
    ctx.fillStyle = '#00f0ff';
    ctx.font = '22px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 14;
    ctx.fillText("🎨 FON VA MUHITLARNI TANLASH", 640, 72);
    ctx.shadowBlur = 0;

    const bgSys = this.game.bgSys;
    const activeTheme = bgSys ? bgSys.getActiveTheme() : { name: 'AUTO' };
    const currentSelectedId = bgSys ? bgSys.getSelectedThemeId() : 'auto';

    ctx.fillStyle = '#ffd700';
    ctx.font = '11px "Press Start 2P", monospace';
    ctx.fillText(`FAOL REJIM: ${currentSelectedId === 'auto' ? 'AVTOMATIK (BOSQICHLI)' : activeTheme.name}  |  JAMI 10 TA BIOM`, 640, 100);

    // Themes Grid (4 columns x 3 rows)
    const themes = bgSys ? bgSys.getThemeList() : [];
    const colW = 260;
    const rowH = 118;
    const startX = 96;
    const startY = 125;

    themes.forEach((t, idx) => {
      const col = idx % 4;
      const row = Math.floor(idx / 4);
      const cardX = startX + col * (colW + 16);
      const cardY = startY + row * (rowH + 14);
      const isSelected = currentSelectedId === t.id;

      ctx.fillStyle = isSelected ? 'rgba(15, 35, 30, 0.95)' : 'rgba(15, 23, 42, 0.9)';
      ctx.fillRect(cardX, cardY, colW, rowH);
      ctx.strokeStyle = isSelected ? '#00ffaa' : (t.color || '#00f0ff');
      ctx.lineWidth = isSelected ? 3 : 1.5;
      ctx.strokeRect(cardX, cardY, colW, rowH);

      // Title & Icon
      ctx.fillStyle = t.color || '#00f0ff';
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`${t.icon || '🌌'} ${t.name.split('(')[0].trim()}`, cardX + 12, cardY + 24);

      // Color accent preview bar
      ctx.fillStyle = t.color || '#00f0ff';
      ctx.fillRect(cardX + 12, cardY + 34, colW - 24, 4);

      // Description
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px "Rajdhani", sans-serif';
      const shortDesc = t.desc.length > 38 ? t.desc.substring(0, 36) + '...' : t.desc;
      ctx.fillText(shortDesc, cardX + 12, cardY + 56);

      // Selection Button
      if (isSelected) {
        ctx.fillStyle = '#00ffaa';
        ctx.font = '11px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText("✓ TANLANGAN", cardX + colW / 2, cardY + 95);
        ctx.textAlign = 'left';
      } else {
        this.addButton(`bg_btn_${t.id}`, cardX + 16, cardY + 74, colW - 32, 34, "TANLASH", () => {
          if (bgSys) bgSys.setTheme(t.id);
          AudioSys.playSFX('powerup');
        }, t.color || '#00f0ff');
      }
    });

    // Bottom Action Buttons
    this.addButton('bg_play', 400, 630, 240, 44, "O'YINGA O'TISH >>", () => {
      this.game.startStage(1);
    }, '#00ffcc');

    this.addButton('bg_back', 660, 630, 220, 44, "ASOSIY MENYU", () => {
      this.game.state = 'MENU';
    }, '#00f0ff');

    ctx.textAlign = 'left';
  }

  renderButtons(ctx) {
    for (const btn of this.buttons) {
      if (btn.color === 'transparent') continue;

      const isHover = this.hoveredBtn === btn;
      ctx.fillStyle = isHover ? 'rgba(0, 240, 255, 0.28)' : 'rgba(15, 23, 42, 0.9)';
      ctx.fillRect(btn.x, btn.y, btn.width, btn.height);

      ctx.strokeStyle = isHover ? '#ffffff' : btn.color;
      ctx.lineWidth = isHover ? 3 : 2;
      ctx.strokeRect(btn.x, btn.y, btn.width, btn.height);

      ctx.fillStyle = isHover ? '#ffffff' : btn.color;
      ctx.font = '12px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(btn.text, btn.x + btn.width / 2, btn.y + btn.height / 2 + 5);
      ctx.textAlign = 'left';
    }
  }
}
