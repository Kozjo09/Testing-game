import { DualInputManager } from './controls.js';
import { GameEngine } from './game.js';

export function renderRadar(canvas, game) {
  if (!canvas || !game) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const center = w / 2;
  const mapRadius = 60; // 120x120 map -> -60 to +60
  const scale = (center - 8) / mapRadius;

  ctx.clearRect(0, 0, w, h);

  // Background radar grid
  ctx.fillStyle = '#0a0f1d';
  ctx.beginPath();
  ctx.arc(center, center, center - 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(center, center, (center - 8) * 0.5, 0, Math.PI * 2);
  ctx.arc(center, center, center - 8, 0, Math.PI * 2);
  ctx.moveTo(center, 8); ctx.lineTo(center, h - 8);
  ctx.moveTo(8, center); ctx.lineTo(w - 8, center);
  ctx.stroke();

  // Draw Map Obstacles
  ctx.fillStyle = 'rgba(71, 85, 105, 0.6)';
  game.obstacles.forEach((obs) => {
    const rx = center + obs.position.x * scale;
    const ry = center + obs.position.z * scale;
    const rw = Math.max(2, obs.size.x * scale);
    const rh = Math.max(2, obs.size.z * scale);
    ctx.fillRect(rx - rw / 2, ry - rh / 2, rw, rh);
  });

  // Draw Enemies (Red Dots)
  ctx.fillStyle = '#ef4444';
  game.enemies.forEach((e) => {
    const ex = center + e.tankData.group.position.x * scale;
    const ey = center + e.tankData.group.position.z * scale;
    ctx.beginPath();
    ctx.arc(ex, ey, e.type === 'heavy' ? 4 : 3, 0, Math.PI * 2);
    ctx.fill();
  });

  // Draw Player (Blue Icon & Heading Line)
  if (game.playerData) {
    const px = center + game.playerData.group.position.x * scale;
    const py = center + game.playerData.group.position.z * scale;

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fill();

    // Direction line
    const angle = game.playerData.group.rotation.y;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + Math.sin(angle) * 10, py + Math.cos(angle) * 10);
    ctx.stroke();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas');
  const radarCanvas = document.getElementById('radar-canvas');

  // DOM elements for HUD
  const healthBar = document.getElementById('health-bar');
  const scoreDisplay = document.getElementById('score-display');

  // Touch control elements
  const moveZone = document.getElementById('move-joystick-zone');
  const moveKnob = document.getElementById('move-joystick-knob');
  const aimZone = document.getElementById('aim-joystick-zone');
  const aimKnob = document.getElementById('aim-joystick-knob');
  const fireBtn = document.getElementById('fire-button');

  // Modal elements
  const gameOverModal = document.getElementById('game-over-modal');
  const finalScoreVal = document.getElementById('final-score-val');
  const killsVal = document.getElementById('kills-val');
  const accuracyVal = document.getElementById('accuracy-val');
  const restartButton = document.getElementById('restart-button');

  // Input Manager
  const inputManager = new DualInputManager({
    moveZone,
    moveKnob,
    aimZone,
    aimKnob,
    fireBtn,
    maxRadius: 50
  });
  inputManager.init();

  // Game Engine
  const game = new GameEngine(canvas);

  // Resize handler
  window.addEventListener('resize', () => {
    game.resize(window.innerWidth, window.innerHeight);
  });

  // Restart Handler
  restartButton.addEventListener('click', () => {
    game.restart();
    gameOverModal.classList.add('hidden');
  });

  // Main Loop
  let lastTime = performance.now();

  function animate(now) {
    requestAnimationFrame(animate);

    const delta = Math.min((now - lastTime) / 1000, 0.1); // clamp delta
    lastTime = now;

    const moveInput = inputManager.getMoveInput();
    const aimInput = inputManager.getAimInput();
    const isFiring = inputManager.getFiring();

    game.update(delta, moveInput, aimInput, isFiring);

    // Update UI HUD
    if (healthBar) {
      healthBar.style.width = `${Math.max(0, game.health)}%`;
    }
    if (scoreDisplay) {
      scoreDisplay.textContent = Math.floor(game.score);
    }

    // Render Minimap / Radar
    if (radarCanvas) {
      renderRadar(radarCanvas, game);
    }

    if (game.isGameOver) {
      gameOverModal.classList.remove('hidden');
      if (finalScoreVal) finalScoreVal.textContent = Math.floor(game.score);
      if (killsVal) killsVal.textContent = game.kills;
      if (accuracyVal) {
        const acc = game.shotsFired > 0 ? Math.round((game.shotsHit / game.shotsFired) * 100) : 0;
        accuracyVal.textContent = `${acc}%`;
      }
    }
  }

  requestAnimationFrame(animate);
});
