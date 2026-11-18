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

// Step 1: Click "BOSQICHLI REJIM (1-3)"
console.log('[TEST] Drawing UI and clicking "BOSQICHLI REJIM (1-3)" at (300, 350)...');
vm.runInContext('game.ui.draw(game.ctx);', context);
const clickedCampaign = vm.runInContext('game.ui.handleClick(300, 350);', context);
const state2 = vm.runInContext('game.state;', context);
console.log(`[TEST] Click handled: ${clickedCampaign}, New state: ${state2} (Expected: LEVEL_SELECT)`);
if (state2 !== 'LEVEL_SELECT') throw new Error('Did not transition to LEVEL_SELECT');

// Step 2: In LEVEL_SELECT, click "BOSHLASH" on Stage 1 (x: 200, y: 500)
console.log('[TEST] Drawing Level Select and clicking "BOSHLASH" on Stage 1 at (200, 500)...');
vm.runInContext('game.ui.draw(game.ctx);', context);
const clickedStart = vm.runInContext('game.ui.handleClick(200, 500);', context);
const state3 = vm.runInContext('game.state;', context);
console.log(`[TEST] Click handled: ${clickedStart}, New state: ${state3} (Expected: PLAYING)`);
if (state3 !== 'PLAYING') throw new Error('Did not transition to PLAYING upon clicking BOSHLASH!');

// Step 3: Run 150 active gameplay frames
console.log('[TEST] Running 150 active gameplay frames (physics, weather, pets, spawner, boss, draw)...');
for (let i = 0; i < 150; i++) {
  vm.runInContext('game.update(0.016); game.draw();', context);
}
const dist = vm.runInContext('game.distance;', context);
const speed = vm.runInContext('game.gameSpeed;', context);
console.log(`[TEST] Distance reached: ${dist.toFixed(1)}m, Game Speed: ${speed.toFixed(1)}`);
console.log('[SUCCESS] All transitions, click handling, and gameplay loops executed with 0 errors!');
process.exit(0);
