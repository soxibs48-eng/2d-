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
      if (id === 'gameCanvas') {
        return {
          width: 1280,
          height: 720,
          getContext: () => ({
            clearRect: () => {},
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
            fill: () => {},
            stroke: () => {},
            fillText: () => {},
            drawImage: () => {},
            createLinearGradient: () => ({ addColorStop: () => {} }),
            createRadialGradient: () => ({ addColorStop: () => {} })
          }),
          getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 }),
          addEventListener: () => {}
        };
      }
      return { style: {}, addEventListener: () => {} };
    },
    createElement(tag) {
      return {
        width: 1280,
        height: 720,
        getContext: () => ({
          clearRect: () => {},
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
        })
      };
    },
    documentElement: { requestFullscreen: async () => {} }
  },
  Image: class {
    constructor() {
      this.src = '';
      this.complete = true;
      this.naturalWidth = 100;
      this.naturalHeight = 100;
    }
  },
  setTimeout: (fn, ms) => setTimeout(fn, ms),
  clearTimeout: (id) => clearTimeout(id),
  console
};
context.window.webkitAudioContext = context.window.AudioContext;
vm.createContext(context);

const scriptFiles = [
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

for (const sf of scriptFiles) {
  const code = fs.readFileSync(sf, 'utf-8');
  vm.runInContext(code, context);
}

console.log('[TEST] Initializing Game instance...');
vm.runInContext('const game = new Game();', context);
const state1 = vm.runInContext('game.state;', context);
console.log(`[TEST] Initial state: ${state1} (Expected: MENU)`);
if (state1 !== 'MENU') throw new Error('Initial state is not MENU');

// Step 0: Test "QANDAY O'YNASH KERAK? (BOSHQARUV)" modal
console.log('[TEST] Testing "QANDAY O\'YNASH KERAK?" button at (500, 520)...');
vm.runInContext('game.ui.draw(game.ctx);', context);
const clickedGuide = vm.runInContext('game.ui.handleClick(500, 520);', context);
const stateGuide = vm.runInContext('game.state;', context);
console.log(`[TEST] Click handled: ${clickedGuide}, State: ${stateGuide} (Expected: CONTROLS_GUIDE)`);
if (stateGuide !== 'CONTROLS_GUIDE') throw new Error('Did not transition to CONTROLS_GUIDE');

// Return to MENU
vm.runInContext('game.state = "MENU";', context);

// Step 1: Click "BOSQICHLI REJIM (1-100)"
console.log('[TEST] Drawing UI and clicking "BOSQICHLI REJIM (1-100)" at (300, 350)...');
vm.runInContext('game.ui.draw(game.ctx);', context);
const clickedCampaign = vm.runInContext('game.ui.handleClick(300, 350);', context);
const state2 = vm.runInContext('game.state;', context);
console.log(`[TEST] Click handled: ${clickedCampaign}, New state: ${state2} (Expected: LEVEL_SELECT)`);
if (state2 !== 'LEVEL_SELECT') throw new Error('Did not transition to LEVEL_SELECT');

// Step 2: Test Pagination in 100 Stages
console.log('[TEST] Testing Pagination: Next Page at (1100, 115)...');
vm.runInContext('game.ui.draw(game.ctx);', context);
vm.runInContext('game.ui.handleClick(1100, 115);', context); // KEYINGI >>
const p2 = vm.runInContext('game.levelSelectPage;', context);
console.log(`[TEST] Page after NEXT: ${p2} (Expected: 2)`);
if (p2 !== 2) throw new Error('Pagination next failed');

console.log('[TEST] Testing Pagination: Prev Page at (120, 115)...');
vm.runInContext('game.ui.draw(game.ctx);', context);
vm.runInContext('game.ui.handleClick(120, 115);', context); // << OLDINGI
const p1 = vm.runInContext('game.levelSelectPage;', context);
console.log(`[TEST] Page after PREV: ${p1} (Expected: 1)`);
if (p1 !== 1) throw new Error('Pagination prev failed');

// Step 3: In LEVEL_SELECT Page 1, click Stage 1 card (x: 150, y: 250)
console.log('[TEST] Clicking Stage 1 at (150, 250)...');
vm.runInContext('game.ui.draw(game.ctx);', context);
const clickedStart = vm.runInContext('game.ui.handleClick(150, 250);', context);
const state3 = vm.runInContext('game.state;', context);
console.log(`[TEST] Click handled: ${clickedStart}, New state: ${state3} (Expected: PLAYING)`);
if (state3 !== 'PLAYING') throw new Error('Did not transition to PLAYING upon clicking Stage 1!');

// Step 4: Run 150 active gameplay frames
console.log('[TEST] Running 150 active gameplay frames (physics, weather, pets, spawner, boss, draw)...');
for (let i = 0; i < 150; i++) {
  vm.runInContext('game.update(0.016); game.draw();', context);
}
const dist = vm.runInContext('game.distance;', context);
const speed = vm.runInContext('game.gameSpeed;', context);
console.log(`[TEST] Distance reached: ${dist.toFixed(1)}m, Game Speed: ${speed.toFixed(1)}`);
console.log('[SUCCESS] All 100-stage campaign navigation and gameplay loops executed with 0 errors!');
process.exit(0);
