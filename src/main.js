import { DualInputManager } from './controls.js';
import { GameEngine } from './game.js';

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas');

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
  const finalScoreText = document.getElementById('final-score-text');
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

    const delta = Math.min((now - lastTime) / 1000, 0.1); // clamp delta to 100ms
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

    if (game.isGameOver) {
      gameOverModal.classList.remove('hidden');
      if (finalScoreText) {
        finalScoreText.textContent = `Final Score: ${Math.floor(game.score)}`;
      }
    }
  }

  requestAnimationFrame(animate);
});
