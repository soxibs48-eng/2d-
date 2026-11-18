// ==========================================
// PIXEL RUNNER: CANVAS UI SYSTEM (v2.1 OVERHAUL)
// ==========================================

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
      case 'PLAYING':
        this.drawHUD(ctx);
        break;
      case 'PAUSED':
        this.drawHUD(ctx);
        this.drawPauseMenu(ctx);
        break;
      case 'GAMEOVER':
        this.drawHUD(ctx);
        this.drawGameOver(ctx);
        break;
      case 'SHOP':
        this.drawShop(ctx);
        break;
      case 'SETTINGS':
        this.drawSettings(ctx);
        break;
    }

    this.renderButtons(ctx);
  }

  drawHUD(ctx) {
    // 1. Top Glassmorphism Bar
    ctx.fillStyle = 'rgba(10, 15, 30, 0.82)';
    ctx.fillRect(0, 0, 1280, 68);
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0, 67, 1280, 1);

    // Distance
    ctx.fillStyle = '#00f0ff';
    ctx.font = '16px "Press Start 2P", monospace';
    ctx.fillText(`MASOFA: ${Math.floor(this.game.distance)}m`, 30, 42);

    // Coins
    if (this.coinIcon.complete) {
      ctx.drawImage(this.coinIcon, 340, 22, 24, 24);
    }
    ctx.fillStyle = '#ffd700';
    ctx.font = '16px "Press Start 2P", monospace';
    ctx.fillText(`${this.game.coins}`, 375, 42);

    // Speedometer (New Feature)
    const speedKmh = Math.floor(this.game.gameSpeed);
    ctx.fillStyle = '#ff00aa';
    ctx.font = '13px "Press Start 2P", monospace';
    ctx.fillText(`TEZLIK: ${speedKmh} KM/H`, 470, 42);

    // Combo Meter (New Feature)
    ctx.fillStyle = '#00ffcc';
    ctx.font = '13px "Press Start 2P", monospace';
    ctx.fillText(`KOMBO: x${this.game.comboMultiplier.toFixed(1)}`, 740, 42);

    // Dash Status (New Feature)
    const dashReady = this.game.player.dashCooldown <= 0;
    ctx.fillStyle = dashReady ? '#00ffff' : '#778899';
    ctx.font = '11px "Press Start 2P", monospace';
    const dashText = dashReady ? 'DASH: TAYYOR (E)' : `DASH: ${this.game.player.dashCooldown.toFixed(1)}s`;
    ctx.fillText(dashText, 930, 42);

    // Pause button in HUD
    this.addButton('pause', 1210, 14, 40, 40, 'II', () => this.game.pauseGame(), '#00f0ff');

    // 2. Fever / Hyper Gauge (Top Center Line)
    const feverPct = Math.min(1.0, this.game.feverMeter / 100.0);
    ctx.fillStyle = 'rgba(255, 0, 128, 0.2)';
    ctx.fillRect(0, 68, 1280, 4);
    ctx.fillStyle = this.game.player.isHyper ? '#00ffff' : '#ff0088';
    ctx.fillRect(0, 68, 1280 * feverPct, 4);

    // 3. Power-up Badges (Left Column)
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

    // Controls hints on bottom
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.font = '13px "Rajdhani", sans-serif';
    ctx.fillText('SPACE/W: Sakrash  |  S: Egilish/Tez tushish  |  E: Cyber Dash  |  SHIFT/F: Antigravitatsiya  |  ESC: Pauza', 30, 705);
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
    ctx.fillStyle = 'rgba(8, 10, 20, 0.75)';
    ctx.fillRect(0, 0, 1280, 720);

    // Glowing Title
    ctx.fillStyle = '#00f0ff';
    ctx.font = '52px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 25;
    ctx.fillText('PIXEL RUNNER', 640, 210);
    ctx.shadowBlur = 0;

    // Subtitle
    ctx.fillStyle = '#ff2288';
    ctx.font = '18px "Press Start 2P", monospace';
    ctx.fillText('— ANTI-GRAVITY PROTOCOL —', 640, 258);

    // High score banner
    ctx.fillStyle = '#8899aa';
    ctx.font = '13px "Press Start 2P", monospace';
    ctx.fillText(`ENG YUQORI REKORD: ${Math.floor(StorageManager.getHighScore())} M  |  TANGALAR: ${StorageManager.getTotalCoins()}`, 640, 310);
    ctx.textAlign = 'left';

    // Buttons
    this.addButton('play', 480, 360, 320, 56, "O'YINNI BOSHLASH", () => this.game.startGame(), '#00ffcc');
    this.addButton('shop', 480, 435, 320, 52, "DO'KON (5 TA SKIN)", () => { this.game.state = 'SHOP'; }, '#ffd700');
    this.addButton('settings', 480, 505, 320, 52, "SOZLAMALAR", () => { this.game.state = 'SETTINGS'; }, '#00f0ff');
  }

  drawPauseMenu(ctx) {
    ctx.fillStyle = 'rgba(8, 12, 24, 0.85)';
    ctx.fillRect(0, 0, 1280, 720);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(480, 180, 320, 360);
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(480, 180, 320, 360);

    ctx.fillStyle = '#00f0ff';
    ctx.font = '24px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('PAUZA', 640, 240);
    ctx.textAlign = 'left';

    this.addButton('resume', 510, 270, 260, 48, 'DAVOM ETTIRISH', () => this.game.resumeGame(), '#00ffcc');
    this.addButton('restart', 510, 335, 260, 48, 'QAYTA BOSHLASH', () => this.game.startGame(), '#ffd700');
    this.addButton('menu', 510, 400, 260, 48, 'ASOSIY MENYU', () => { this.game.state = 'MENU'; }, '#ff4444');
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
    ctx.fillText(`Maks Kombo: x${this.game.maxCombo.toFixed(1)}`, 640, 330);
    ctx.fillStyle = '#8899aa';
    ctx.fillText(`Eng yaxshi: ${Math.floor(StorageManager.getHighScore())} m`, 640, 365);
    ctx.textAlign = 'left';

    this.addButton('go_restart', 480, 400, 320, 50, 'QAYTA BOSHLASH', () => this.game.startGame(), '#00ffcc');
    this.addButton('go_shop', 480, 460, 320, 46, "DO'KON (SKINLAR)", () => { this.game.state = 'SHOP'; }, '#ffd700');
    this.addButton('go_menu', 480, 515, 320, 46, 'ASOSIY MENYU', () => { this.game.state = 'MENU'; }, '#00f0ff');
  }

  drawShop(ctx) {
    ctx.fillStyle = 'rgba(8, 10, 20, 0.95)';
    ctx.fillRect(0, 0, 1280, 720);

    // Title
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

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(cardX, cardY, 220, 430);
      ctx.strokeStyle = equipped === s.id ? '#00ffcc' : s.color;
      ctx.lineWidth = equipped === s.id ? 4 : 2;
      ctx.strokeRect(cardX, cardY, 220, 430);

      ctx.fillStyle = s.color;
      ctx.font = '12px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(s.name, cardX + 110, cardY + 35);

      // Preview box
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(cardX + 45, cardY + 55, 130, 130);
      
      // Avatar preview
      ctx.fillStyle = s.color;
      ctx.fillRect(cardX + 95, cardY + 95, 30, 46);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cardX + 110, cardY + 100, 12, 8);

      ctx.fillStyle = '#8899aa';
      ctx.font = '12px "Rajdhani", sans-serif';
      ctx.fillText(s.desc, cardX + 110, cardY + 215);
      ctx.fillText(`Narxi: ${s.price === 0 ? 'Bepul' : s.price + ' tanga'}`, cardX + 110, cardY + 240);
      ctx.textAlign = 'left';

      // Action button
      let btnText = 'OCHISH';
      let btnColor = s.color;
      let action = () => {};

      if (equipped === s.id) {
        btnText = 'TANLANGAN';
        btnColor = '#556677';
      } else if (unlocked.includes(s.id)) {
        btnText = 'TANLASH';
        btnColor = '#00ffcc';
        action = () => {
          StorageManager.setEquippedSkin(s.id);
          this.game.player.updateSkin(s.id);
        };
      } else {
        btnText = `OCHISH (${s.price})`;
        const canBuy = StorageManager.getTotalCoins() >= s.price;
        btnColor = canBuy ? '#ffd700' : '#444455';
        action = () => {
          if (StorageManager.spendCoins(s.price)) {
            StorageManager.unlockSkin(s.id);
            StorageManager.setEquippedSkin(s.id);
            this.game.player.updateSkin(s.id);
            AudioSys.playSFX('powerup');
          }
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

    this.addButton('fullscreen', 480, 420, 320, 40, 'TO\'LIQ EKRAN', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    }, '#00ffcc');

    this.addButton('settings_back', 520, 490, 240, 44, 'ORTGA', () => { this.game.state = 'MENU'; }, '#00f0ff');
  }

  renderButtons(ctx) {
    for (const btn of this.buttons) {
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
