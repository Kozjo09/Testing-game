import { DualInputManager, toggleFullscreen, isFullscreenActive } from './controls.js';
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
  ctx.fillStyle = '#050811';
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

  // Draw Enemies (Red Dots / Yellow Boss)
  game.enemies.forEach((e) => {
    const ex = center + e.tankData.group.position.x * scale;
    const ey = center + e.tankData.group.position.z * scale;
    ctx.fillStyle = e.isBoss ? '#f59e0b' : '#ef4444';
    ctx.beginPath();
    ctx.arc(ex, ey, e.isBoss ? 7 : (e.type === 'heavy' ? 4 : 3), 0, Math.PI * 2);
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
  const ammoCountDisplay = document.getElementById('ammo-count');
  const reloadBarFill = document.getElementById('reload-bar');
  const reloadBtn = document.getElementById('reload-btn');

  // Boss HUD
  const bossHudContainer = document.getElementById('boss-hud-container');
  const bossHealthBar = document.getElementById('boss-health-bar');

  // Roblox Settings & Camera Toggle Buttons
  const settingsToggleBtn = document.getElementById('settings-toggle-btn');
  const fpToggleBtn = document.getElementById('fp-toggle-btn');
  const fpReticle = document.getElementById('fp-reticle');

  // Settings Modal
  const settingsModal = document.getElementById('settings-modal');
  const settingCamBtn = document.getElementById('setting-cam-btn');
  const settingAudioBtn = document.getElementById('setting-audio-btn');
  const settingGraphics = document.getElementById('setting-graphics');
  const closeSettingsBtn = document.getElementById('close-settings-btn');

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

  // Fullscreen button setup
  const fullscreenBtn = document.getElementById('fullscreen-btn');
  if (fullscreenBtn) {
    const updateFsIcon = () => {
      fullscreenBtn.textContent = isFullscreenActive() ? 'EXIT FULLSCREEN' : 'FULLSCREEN';
    };
    fullscreenBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFullscreen(document.documentElement);
      setTimeout(updateFsIcon, 100);
    });
    document.addEventListener('fullscreenchange', updateFsIcon);
    document.addEventListener('webkitfullscreenchange', updateFsIcon);
  }

  document.body.addEventListener('touchend', (e) => {
    if (!isFullscreenActive() && e.target && !e.target.closest('button, input, select, #touch-controls, #settings-modal')) {
      toggleFullscreen(document.documentElement);
    }
  }, { passive: true });

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

  // Wire Reload Button
  if (reloadBtn) {
    reloadBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      game.startReload();
    });
  }

  // Camera Mode Toggle Function
  const updateCameraUI = () => {
    if (settingCamBtn) {
      settingCamBtn.textContent = game.cameraMode === '1st' ? '1st Person (Gunner Optic)' : '3rd Person (Chassis)';
    }
    if (fpReticle) {
      if (game.cameraMode === '1st') {
        fpReticle.classList.add('active');
      } else {
        fpReticle.classList.remove('active');
      }
    }
  };

  if (fpToggleBtn) {
    fpToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      game.toggleCameraMode();
      updateCameraUI();
    });
  }

  if (settingCamBtn) {
    settingCamBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      game.toggleCameraMode();
      updateCameraUI();
    });
  }

  // Settings Modal Toggle
  if (settingsToggleBtn) {
    settingsToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      settingsModal.classList.remove('hidden');
    });
  }

  if (closeSettingsBtn) {
    closeSettingsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      settingsModal.classList.add('hidden');
    });
  }

  if (settingAudioBtn) {
    settingAudioBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      game.audioEnabled = !game.audioEnabled;
      settingAudioBtn.textContent = game.audioEnabled ? 'Enabled' : 'Muted';
    });
  }

  if (settingGraphics) {
    settingGraphics.addEventListener('change', () => {
      const val = settingGraphics.value;
      if (val === 'ultra') {
        game.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      } else if (val === 'high') {
        game.renderer.setPixelRatio(1.25);
      } else {
        game.renderer.setPixelRatio(1.0);
      }
    });
  }

  // Resize handler
  const handleResize = () => {
    game.resize(window.innerWidth, window.innerHeight);
  };
  window.addEventListener('resize', handleResize);
  window.addEventListener('orientationchange', () => {
    setTimeout(handleResize, 100);
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

    const delta = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    // Check keyboard shortcuts for Reload and Camera Toggle
    if (inputManager.checkReloadRequested()) {
      game.startReload();
    }
    if (inputManager.checkCameraToggleRequested()) {
      game.toggleCameraMode();
      updateCameraUI();
    }

    const moveInput = inputManager.getMoveInput();
    const aimInput = inputManager.getAimInput();
    const isFiring = inputManager.getFiring();

    game.update(delta, moveInput, aimInput, isFiring);

    // Update Health
    if (healthBar) {
      healthBar.style.width = `${Math.max(0, game.health)}%`;
    }

    // Update Ammo & Reload Bar
    if (ammoCountDisplay) {
      ammoCountDisplay.textContent = game.isReloading ? 'RELOADING...' : `${game.ammoCount} / ${game.ammoMax}`;
    }
    if (reloadBarFill) {
      reloadBarFill.style.width = `${Math.floor(game.reloadProgress * 100)}%`;
    }

    // Update Boss Health Bar
    if (bossHudContainer) {
      if (game.bossObj) {
        bossHudContainer.classList.add('active');
        if (bossHealthBar) {
          const bossPct = Math.max(0, (game.bossObj.health / game.bossObj.maxHealth) * 100);
          bossHealthBar.style.width = `${bossPct}%`;
        }
      } else {
        bossHudContainer.classList.remove('active');
      }
    }

    if (scoreDisplay) {
      scoreDisplay.textContent = Math.floor(game.score);
    }

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
