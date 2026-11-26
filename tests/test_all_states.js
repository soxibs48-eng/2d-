const fs = require('fs');
const vm = require('vm');

const context = {
  window: {
    addEventListener: () => {},
    AudioContext: class {
      constructor() {
        this.currentTime = 0;
        this.destination = {};
        this.sampleRate = 44100;
      }
      createGain() { return { gain: { value: 1, setValueAtTime: ()=>{}, linearRampToValueAtTime: ()=>{}, exponentialRampToValueAtTime: ()=>{} }, connect: ()=>{} }; }
      createOscillator() { return { frequency: { setValueAtTime: ()=>{}, linearRampToValueAtTime: ()=>{}, exponentialRampToValueAtTime: ()=>{} }, connect: ()=>{}, start: ()=>{}, stop: ()=>{} }; }
      createBuffer() { return { getChannelData: () => new Float32Array(100) }; }
      createBufferSource() { return { connect: ()=>{}, start: ()=>{} }; }
      resume() {}
    }
  },
  performance: { now: () => Date.now() },
  requestAnimationFrame: () => 1,
  localStorage: {
    store: {},
    getItem(k) { return this.store[k] || null; },
    setItem(k, v) { this.store[k] = v.toString(); }
  },
  document: {
    getElementById(id) {
      return {
        width: 1280,
        height: 720,
        getContext: () => mockContext(),
        getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 }),
        addEventListener: () => {}
      };
    },
    createElement(tag) {
      return {
        width: 1280,
        height: 720,
        getContext: () => mockContext()
      };
    },
    documentElement: { requestFullscreen: async () => {} }
  },
  Image: class {
    constructor() {
      this.src = '';
      this.complete = true;
    }
  },
  setTimeout: (fn) => setTimeout(fn, 1),
  clearTimeout: (id) => clearTimeout(id),
  console
};

function mockContext() {
  return {
    save: () => {},
    restore: () => {},
    translate: () => {},
    rotate: () => {},
    scale: () => {},
    fillRect: () => {},
    strokeRect: () => {},
    beginPath: () => {},
    closePath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    arc: () => {},
    ellipse: () => {},
    fill: () => {},
    stroke: () => {},
    fillText: () => {},
    drawImage: () => {},
    createLinearGradient: () => ({ addColorStop: () => {} }),
    createRadialGradient: () => ({ addColorStop: () => {} })
  };
}

vm.createContext(context);

const files = [
  'js/audio.js',
  'js/storage.js',
  'js/stages.js',
  'js/background.js',
  'js/particles.js',
  'js/weather.js',
  'js/pet.js',
  'js/quests.js',
  'js/combo.js',
  'js/player.js',
  'js/obstacles.js',
  'js/pickups.js',
  'js/spawner.js',
  'js/camera.js',
  'js/boss.js',
  'js/ui.js',
  'js/game.js'
];

files.forEach(f => {
  vm.runInContext(fs.readFileSync(f, 'utf8'), context);
});

const testCode = `
  const g = new Game();
  const mockCtx = document.getElementById('gameCanvas').getContext();

  console.log("=== TESTING ALL 12 UI SCREENS ===");
  const states = [
    'MENU',
    'LEVEL_SELECT',
    'PLAYING',
    'PAUSED',
    'STAGE_CLEAR',
    'GAMEOVER',
    'SHOP',
    'PETS',
    'QUESTS',
    'SETTINGS',
    'CONTROLS_GUIDE',
    'BACKGROUND_SELECT'
  ];

  states.forEach(st => {
    g.state = st;
    g.ui.draw(mockCtx);
    console.log('[PASS] State: ' + st + ' rendered with ' + g.ui.buttons.length + ' buttons');
  });

  console.log("=== TESTING ALL 10 BACKGROUND BIOMES ===");
  const themes = g.bgSys.getThemeList();
  themes.forEach(t => {
    g.bgSys.setTheme(t.id);
    const active = g.bgSys.getActiveTheme();
    g.bgSys.drawParallax(mockCtx, { sky: 10, far: 30, mid: 60, floor: 100, ceiling: 100 });
    console.log('[PASS] Theme ' + t.id + ' (' + active.name + ') parallax rendered successfully');
  });

  console.log("=== TESTING BUTTON HOVER & CLICK HITBOXES ===");
  g.state = 'MENU';
  g.ui.draw(mockCtx);
  const campBtn = g.ui.buttons.find(b => b.id === 'campaign');
  if (!campBtn) throw new Error('campaign button missing');
  g.ui.handleMouseMove(campBtn.x + 10, campBtn.y + 10);
  if (g.ui.hoveredBtn !== campBtn) throw new Error('campaign button hover failed');
  console.log('[PASS] Button hover detected correctly');

  g.ui.handleClick(campBtn.x + 10, campBtn.y + 10);
  if (g.state !== 'LEVEL_SELECT') throw new Error('Expected LEVEL_SELECT after clicking campaign');
  console.log('[PASS] Campaign button click correctly transitioned to LEVEL_SELECT');
`;

vm.runInContext(testCode, context);
console.log('[ALL TESTS COMPLETED SUCCESSFULLY]');
