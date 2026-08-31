import * as THREE from 'three';

// --- Collision Helper Functions ---
export function checkSphereCollision(posA, radiusA, posB, radiusB) {
  const dx = posA.x - posB.x;
  const dy = posA.y - posB.y;
  const dz = posA.z - posB.z;
  const distSq = dx * dx + dy * dy + dz * dz;
  const radiusSum = radiusA + radiusB;
  return distSq <= radiusSum * radiusSum;
}

export function checkSphereBoxCollision(spherePos, sphereRadius, box) {
  let minX, maxX, minZ, maxZ;
  if ('minX' in box) {
    minX = box.minX;
    maxX = box.maxX;
    minZ = box.minZ;
    maxZ = box.maxZ;
  } else {
    minX = box.position.x - box.size.x / 2;
    maxX = box.position.x + box.size.x / 2;
    minZ = box.position.z - box.size.z / 2;
    maxZ = box.position.z + box.size.z / 2;
  }

  const closestX = Math.max(minX, Math.min(spherePos.x, maxX));
  const closestZ = Math.max(minZ, Math.min(spherePos.z, maxZ));

  const dx = spherePos.x - closestX;
  const dz = spherePos.z - closestZ;

  return (dx * dx + dz * dz) <= (sphereRadius * sphereRadius);
}

// --- Procedural Canvas Textures Generator ---
export function createProceduralTexture(type) {
  if (typeof document === 'undefined') {
    return new THREE.Texture();
  }

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture();

  if (type === 'ground_dirt') {
    // Multi-textured battlefield ground: Asphalt, Mud, Scorched Earth
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(0, 0, 512, 512);

    // Mud & crater spots
    for (let i = 0; i < 1200; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#0c0a09' : '#292524';
      ctx.beginPath();
      ctx.arc(Math.random() * 512, Math.random() * 512, Math.random() * 6 + 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Scorched grass / dirt camouflage streaks
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = i % 2 === 0 ? 'rgba(20, 83, 45, 0.25)' : 'rgba(120, 53, 15, 0.3)';
      ctx.beginPath();
      ctx.ellipse(
        Math.random() * 512, Math.random() * 512,
        Math.random() * 90 + 20, Math.random() * 40 + 10,
        Math.random() * Math.PI, 0, Math.PI * 2
      );
      ctx.fill();
    }

    // Tactical metallic grid lines
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.lineWidth = 1.5;
    const step = 64;
    for (let x = 0; x <= 512; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 512); ctx.stroke();
    }
    for (let y = 0; y <= 512; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke();
    }
  } else if (type === 'bump_map') {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 3000; i++) {
      const val = Math.floor(Math.random() * 255);
      ctx.fillStyle = `rgb(${val},${val},${val})`;
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
    }
  } else if (type === 'camo_desert') {
    ctx.fillStyle = '#b45309';
    ctx.fillRect(0, 0, 512, 512);
    const colors = ['#78350f', '#d97706', '#f59e0b', '#451a03'];
    for (let i = 0; i < 50; i++) {
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.ellipse(Math.random() * 512, Math.random() * 512, Math.random() * 70 + 20, Math.random() * 45 + 10, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === 'camo_urban') {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 512, 512);
    const colors = ['#0f172a', '#334155', '#475569', '#64748b'];
    for (let i = 0; i < 60; i++) {
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(Math.random() * 512, Math.random() * 512, Math.random() * 90 + 20, Math.random() * 70 + 20);
    }
  } else if (type === 'camo_scout') {
    ctx.fillStyle = '#14532d';
    ctx.fillRect(0, 0, 512, 512);
    const colors = ['#166534', '#15803d', '#3f6212', '#064e3b'];
    for (let i = 0; i < 45; i++) {
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.ellipse(Math.random() * 512, Math.random() * 512, Math.random() * 75 + 20, Math.random() * 35 + 10, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === 'camo_player') {
    ctx.fillStyle = '#0369a1';
    ctx.fillRect(0, 0, 512, 512);
    const colors = ['#075985', '#0284c7', '#38bdf8', '#0f172a'];
    for (let i = 0; i < 45; i++) {
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(Math.random() * 512, Math.random() * 512, Math.random() * 80 + 15, Math.random() * 55 + 15);
    }
  } else if (type === 'camo_boss') {
    ctx.fillStyle = '#7f1d1d';
    ctx.fillRect(0, 0, 512, 512);
    const colors = ['#991b1b', '#dc2626', '#450a0a', '#18181b'];
    for (let i = 0; i < 60; i++) {
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(Math.random() * 512, Math.random() * 512, Math.random() * 100 + 20, Math.random() * 60 + 20);
    }
  } else if (type === 'armor_plate') {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 10;
    ctx.strokeRect(12, 10, 488, 492);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(20, 20, 16, 16); ctx.fillRect(476, 20, 16, 16);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// --- Tank Model Builder ---
export function buildTankMesh(options = {}) {
  const {
    isPlayer = false,
    isBoss = false,
    camoType = 'camo_player',
    scale = 1.0,
    barrelCount = 1,
    accentColor = 0x38bdf8
  } = options;

  const tankGroup = new THREE.Group();
  tankGroup.scale.set(scale, scale, scale);

  const texture = createProceduralTexture(camoType);
  const bumpTexture = createProceduralTexture('bump_map');
  bumpTexture.repeat.set(4, 4);

  const bodyMat = new THREE.MeshStandardMaterial({
    map: texture,
    bumpMap: bumpTexture,
    bumpScale: 0.05,
    roughness: 0.35,
    metalness: 0.75
  });

  const eraArmorMat = new THREE.MeshStandardMaterial({
    color: isBoss ? 0x991b1b : 0x334155,
    roughness: 0.2,
    metalness: 0.9
  });

  const darkMetalMat = new THREE.MeshStandardMaterial({
    color: 0x090d16,
    roughness: 0.25,
    metalness: 0.85
  });

  const treadMat = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.85,
    metalness: 0.4
  });

  // 1. Lower Chassis
  const chassisGeo = new THREE.BoxGeometry(2.5, 0.75, 3.4);
  const chassisMesh = new THREE.Mesh(chassisGeo, bodyMat);
  chassisMesh.position.y = 0.65;
  chassisMesh.castShadow = true;
  chassisMesh.receiveShadow = true;
  tankGroup.add(chassisMesh);

  // Front Glacis Plate (Angled Sloped Armor)
  const glacisGeo = new THREE.BoxGeometry(2.45, 0.55, 1.3);
  const glacisMesh = new THREE.Mesh(glacisGeo, bodyMat);
  glacisMesh.rotation.x = Math.PI / 5.5;
  glacisMesh.position.set(0, 0.8, 1.4);
  glacisMesh.castShadow = true;
  tankGroup.add(glacisMesh);

  // ERA (Explosive Reactive Armor) Blocks on Glacis Plate
  for (let x = -0.9; x <= 0.9; x += 0.45) {
    const eraGeo = new THREE.BoxGeometry(0.38, 0.12, 0.35);
    const eraMesh = new THREE.Mesh(eraGeo, eraArmorMat);
    eraMesh.rotation.x = Math.PI / 5.5;
    eraMesh.position.set(x, 0.9, 1.45);
    eraMesh.castShadow = true;
    tankGroup.add(eraMesh);
  }

  // Side Skirts / Heavy Armor Covers
  [-1.3, 1.3].forEach((xSide) => {
    const skirtGeo = new THREE.BoxGeometry(0.18, 0.65, 3.5);
    const skirtMesh = new THREE.Mesh(skirtGeo, bodyMat);
    skirtMesh.position.set(xSide, 0.6, 0);
    skirtMesh.castShadow = true;
    tankGroup.add(skirtMesh);

    // Side ERA Tiles
    for (let z = -1.2; z <= 1.2; z += 0.6) {
      const tileGeo = new THREE.BoxGeometry(0.1, 0.3, 0.45);
      const tileMesh = new THREE.Mesh(tileGeo, eraArmorMat);
      tileMesh.position.set(xSide + (xSide > 0 ? 0.08 : -0.08), 0.65, z);
      tankGroup.add(tileMesh);
    }
  });

  // Dual Rear Exhaust Vents
  [-0.65, 0.65].forEach((xPos) => {
    const pipeGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.7, 12);
    const pipeMesh = new THREE.Mesh(pipeGeo, darkMetalMat);
    pipeMesh.rotation.x = -Math.PI / 4;
    pipeMesh.position.set(xPos, 0.85, -1.7);
    tankGroup.add(pipeMesh);
  });

  // 2. Treads & Road Wheels
  const wheelGeom = new THREE.CylinderGeometry(0.38, 0.38, 0.32, 16);
  const wheels = [];

  [-1.15, 1.15].forEach((xPos) => {
    const treadBoxGeo = new THREE.BoxGeometry(0.38, 0.8, 3.6);
    const treadMesh = new THREE.Mesh(treadBoxGeo, treadMat);
    treadMesh.position.set(xPos, 0.45, 0);
    treadMesh.castShadow = true;
    tankGroup.add(treadMesh);

    for (let z = -1.3; z <= 1.3; z += 0.52) {
      const wheel = new THREE.Mesh(wheelGeom, darkMetalMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(xPos, 0.4, z);
      wheel.castShadow = true;
      tankGroup.add(wheel);
      wheels.push(wheel);
    }
  });

  // 3. Main Turret Assembly
  const turretGroup = new THREE.Group();
  turretGroup.position.set(0, 1.1, 0.1);

  const turretGeo = new THREE.BoxGeometry(1.9, 0.75, 2.2);
  const turretMesh = new THREE.Mesh(turretGeo, bodyMat);
  turretMesh.castShadow = true;
  turretGroup.add(turretMesh);

  // Turret ERA Frontal Wedges
  [-0.6, 0.6].forEach((xWedge) => {
    const wedgeGeo = new THREE.BoxGeometry(0.7, 0.35, 0.6);
    const wedgeMesh = new THREE.Mesh(wedgeGeo, eraArmorMat);
    wedgeMesh.rotation.y = xWedge > 0 ? -Math.PI / 8 : Math.PI / 8;
    wedgeMesh.position.set(xWedge, 0.1, 1.1);
    wedgeMesh.castShadow = true;
    turretGroup.add(wedgeMesh);
  });

  // Smoke Grenade Dischargers
  [-1.0, 1.0].forEach((xSmoke) => {
    const smokeGroup = new THREE.Group();
    smokeGroup.position.set(xSmoke, 0.3, 0.2);
    for (let s = 0; s < 3; s++) {
      const canGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.35, 8);
      const can = new THREE.Mesh(canGeo, darkMetalMat);
      can.rotation.x = Math.PI / 3;
      can.position.set((s - 1) * 0.12, 0, 0);
      smokeGroup.add(can);
    }
    turretGroup.add(smokeGroup);
  });

  // Commander Cupola & Gunner Optic Sight
  const cupolaGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.28, 12);
  const cupolaMesh = new THREE.Mesh(cupolaGeo, darkMetalMat);
  cupolaMesh.position.set(0.45, 0.48, -0.2);
  turretGroup.add(cupolaMesh);

  // Gunner Optic Lens (First Person Camera Attachment Node)
  const opticGeo = new THREE.BoxGeometry(0.45, 0.2, 0.25);
  const opticMat = new THREE.MeshBasicMaterial({ color: accentColor });
  const opticMesh = new THREE.Mesh(opticGeo, opticMat);
  opticMesh.position.set(-0.45, 0.4, 0.9);
  opticMesh.name = 'gunnerOptic';
  turretGroup.add(opticMesh);

  // Rocket Launcher Pod on Boss Tank
  if (isBoss) {
    const podGeo = new THREE.BoxGeometry(1.2, 0.5, 0.8);
    const podMesh = new THREE.Mesh(podGeo, darkMetalMat);
    podMesh.position.set(0, 0.65, -0.5);
    turretGroup.add(podMesh);
  }

  // Cannon Barrels
  const barrels = [];
  const barrelOffsetX = barrelCount === 2 ? [-0.35, 0.35] : [0];

  barrelOffsetX.forEach((xOffset) => {
    const barrelContainer = new THREE.Group();
    barrelContainer.position.set(xOffset, 0.1, 1.1);

    const mainTubeGeo = new THREE.CylinderGeometry(0.13, 0.15, 2.5, 16);
    const mainTubeMesh = new THREE.Mesh(mainTubeGeo, darkMetalMat);
    mainTubeMesh.rotation.x = Math.PI / 2;
    mainTubeMesh.position.set(0, 0, 1.25);
    mainTubeMesh.castShadow = true;
    barrelContainer.add(mainTubeMesh);

    // Muzzle Brake
    const brakeGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.45, 16);
    const brakeMesh = new THREE.Mesh(brakeGeo, darkMetalMat);
    brakeMesh.rotation.x = Math.PI / 2;
    brakeMesh.position.set(0, 0, 2.5);
    barrelContainer.add(brakeMesh);

    turretGroup.add(barrelContainer);
    barrels.push(barrelContainer);
  });

  // Player Headlights
  if (isPlayer) {
    const headlightMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    [-0.85, 0.85].forEach((xPos) => {
      const lightCap = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.1, 12), headlightMat);
      lightCap.rotation.x = Math.PI / 2;
      lightCap.position.set(xPos, 0.8, 1.7);
      tankGroup.add(lightCap);

      const spotLight = new THREE.SpotLight(0x38bdf8, 4, 30, Math.PI / 5, 0.5);
      spotLight.position.set(xPos, 0.8, 1.75);
      spotLight.target.position.set(xPos, 0, 12);
      tankGroup.add(spotLight);
      tankGroup.add(spotLight.target);
    });
  }

  tankGroup.add(turretGroup);

  return {
    group: tankGroup,
    turret: turretGroup,
    barrels: barrels,
    wheels: wheels
  };
}

// --- Game Engine Core ---
export class GameEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = typeof window !== 'undefined' ? window.innerWidth : 800;
    this.height = typeof window !== 'undefined' ? window.innerHeight : 600;

    // State
    this.score = 0;
    this.health = 100;
    this.isGameOver = false;
    this.kills = 0;
    this.shotsFired = 0;
    this.shotsHit = 0;

    // Camera Perspective Mode: '3rd' or '1st'
    this.cameraMode = '3rd';

    // Tank Reload System
    this.ammoMax = 6;
    this.ammoCount = 6;
    this.isReloading = false;
    this.reloadProgress = 1.0; // 0 to 1
    this.reloadTime = 2.5; // seconds
    this.reloadTimer = 0;

    // Audio Mute Setting
    this.audioEnabled = true;

    // Camera Shake & Bodycam Sway
    this.shakeIntensity = 0;
    this.camSwayTime = 0;

    // Three.js Core
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x050811);
    this.scene.fog = new THREE.FogExp2(0x050811, 0.015);

    this.camera = new THREE.PerspectiveCamera(55, this.width / this.height, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Raycaster for Mouse Aim
    this.raycaster = new THREE.Raycaster();
    this.groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

    // Audio Context
    this.audioCtx = null;

    // Entities & Map Objects
    this.playerData = null;
    this.enemies = [];
    this.bossObj = null; // Super Heavy Behemoth Boss
    this.projectiles = [];
    this.particles = [];
    this.atmosphereParticles = [];
    this.obstacles = [];

    // Cooldowns
    this.lastFireTime = 0;
    this.fireRate = 220; // ms between shots in magazine

    this.initScene();
  }

  initAudio() {
    if (!this.audioEnabled) return;
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playCannonSound(isHeavy = false) {
    if (!this.audioEnabled || !this.audioCtx) return;
    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = isHeavy ? 'square' : 'sawtooth';
      osc.frequency.setValueAtTime(isHeavy ? 160 : 300, now);
      osc.frequency.exponentialRampToValueAtTime(25, now + 0.3);

      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.3);

      const subOsc = this.audioCtx.createOscillator();
      const subGain = this.audioCtx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(80, now);
      subOsc.frequency.exponentialRampToValueAtTime(15, now + 0.4);

      subGain.gain.setValueAtTime(0.6, now);
      subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

      subOsc.connect(subGain);
      subGain.connect(this.audioCtx.destination);
      subOsc.start(now);
      subOsc.stop(now + 0.4);
    } catch (e) {}
  }

  playReloadSound() {
    if (!this.audioEnabled || !this.audioCtx) return;
    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.15);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {}
  }

  playExplosionSound() {
    if (!this.audioEnabled || !this.audioCtx) return;
    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(20, now + 0.5);

      gain.gain.setValueAtTime(0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    } catch (e) {}
  }

  playRicochetSound() {
    if (!this.audioEnabled || !this.audioCtx) return;
    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1300, now);
      osc.frequency.exponentialRampToValueAtTime(350, now + 0.12);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {}
  }

  initScene() {
    // 1. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0x94a3b8, 0.6);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfef08a, 1.6);
    dirLight.position.set(65, 95, 55);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 10;
    dirLight.shadow.camera.far = 250;
    const shadowD = 80;
    dirLight.shadow.camera.left = -shadowD;
    dirLight.shadow.camera.right = shadowD;
    dirLight.shadow.camera.top = shadowD;
    dirLight.shadow.camera.bottom = -shadowD;
    this.scene.add(dirLight);

    // 2. Multi-textured Terrain Floor
    const mapSize = 120;
    const groundGeo = new THREE.PlaneGeometry(mapSize, mapSize, 48, 48);
    const groundTex = createProceduralTexture('ground_dirt');
    const groundBump = createProceduralTexture('bump_map');
    groundTex.repeat.set(6, 6);
    groundBump.repeat.set(12, 12);

    const groundMat = new THREE.MeshStandardMaterial({
      map: groundTex,
      bumpMap: groundBump,
      bumpScale: 0.1,
      roughness: 0.85,
      metalness: 0.15
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;
    this.scene.add(groundMesh);

    // Atmospheric Floating Ash & Dust Particles
    const atmosGeo = new THREE.BufferGeometry();
    const count = 300;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * mapSize;
      positions[i + 1] = Math.random() * 15 + 0.5;
      positions[i + 2] = (Math.random() - 0.5) * mapSize;
    }
    atmosGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const atmosMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.35,
      transparent: true,
      opacity: 0.4
    });
    const atmosPoints = new THREE.Points(atmosGeo, atmosMat);
    this.atmosphereParticles = atmosPoints;
    this.scene.add(atmosPoints);

    // 3. Build Map Structures
    this.buildMapStructures(mapSize);

    // 4. Build Player Tank
    this.playerData = buildTankMesh({
      isPlayer: true,
      camoType: 'camo_player',
      scale: 1.0,
      barrelCount: 2,
      accentColor: 0x38bdf8
    });
    this.scene.add(this.playerData.group);

    // 5. Initial Enemies
    for (let i = 0; i < 6; i++) {
      this.spawnEnemy();
    }
  }

  buildMapStructures(mapSize) {
    const half = mapSize / 2;
    const wallHeight = 4.5;
    const wallThick = 2;

    const wallMat = new THREE.MeshStandardMaterial({
      map: createProceduralTexture('armor_plate'),
      bumpMap: createProceduralTexture('bump_map'),
      bumpScale: 0.08,
      roughness: 0.7,
      metalness: 0.35
    });

    const wallsConfig = [
      { pos: [0, wallHeight / 2, -half], size: [mapSize, wallHeight, wallThick] },
      { pos: [0, wallHeight / 2, half], size: [mapSize, wallHeight, wallThick] },
      { pos: [-half, wallHeight / 2, 0], size: [wallThick, wallHeight, mapSize] },
      { pos: [half, wallHeight / 2, 0], size: [wallThick, wallHeight, mapSize] }
    ];

    wallsConfig.forEach((cfg) => {
      const geo = new THREE.BoxGeometry(...cfg.size);
      const mesh = new THREE.Mesh(geo, wallMat);
      mesh.position.set(...cfg.pos);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.scene.add(mesh);

      this.obstacles.push({
        position: { x: cfg.pos[0], y: cfg.pos[1], z: cfg.pos[2] },
        size: { x: cfg.size[0], y: cfg.size[1], z: cfg.size[2] },
        minX: cfg.pos[0] - cfg.size[0] / 2,
        maxX: cfg.pos[0] + cfg.size[0] / 2,
        minZ: cfg.pos[2] - cfg.size[2] / 2,
        maxZ: cfg.pos[2] + cfg.size[2] / 2
      });
    });

    const bunkerPositions = [
      [-25, -20, 10, 8], [25, 20, 12, 10],
      [-20, 25, 8, 12], [20, -25, 10, 10],
      [0, 22, 14, 6], [0, -22, 14, 6]
    ];

    bunkerPositions.forEach(([x, z, w, d]) => {
      const h = 5;
      const bGeo = new THREE.BoxGeometry(w, h, d);
      const bMesh = new THREE.Mesh(bGeo, wallMat);
      bMesh.position.set(x, h / 2, z);
      bMesh.castShadow = true;
      bMesh.receiveShadow = true;
      this.scene.add(bMesh);

      this.obstacles.push({
        position: { x, y: h / 2, z },
        size: { x: w, y: h, z: d },
        minX: x - w / 2,
        maxX: x + w / 2,
        minZ: z - d / 2,
        maxZ: z + d / 2
      });
    });

    const hedgehogMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85, roughness: 0.2 });
    const hedgehogPositions = [
      [-10, -10], [10, 10], [-10, 10], [10, -10],
      [-30, 0], [30, 0], [0, -35], [0, 35]
    ];

    hedgehogPositions.forEach(([hx, hz]) => {
      const group = new THREE.Group();
      group.position.set(hx, 1, hz);

      for (let r = 0; r < 3; r++) {
        const beamGeo = new THREE.BoxGeometry(0.3, 2.5, 0.3);
        const beam = new THREE.Mesh(beamGeo, hedgehogMat);
        beam.rotation.x = (r === 0) ? Math.PI / 4 : 0;
        beam.rotation.z = (r === 1) ? Math.PI / 4 : 0;
        beam.rotation.y = (r === 2) ? Math.PI / 4 : 0;
        beam.castShadow = true;
        group.add(beam);
      }
      this.scene.add(group);

      this.obstacles.push({
        position: { x: hx, y: 1, z: hz },
        size: { x: 2, y: 2, z: 2 },
        minX: hx - 1,
        maxX: hx + 1,
        minZ: hz - 1,
        maxZ: hz + 1
      });
    });

    const towerPositions = [
      [-48, -48], [48, 48], [-48, 48], [48, -48]
    ];
    towerPositions.forEach(([tx, tz]) => {
      const towerGroup = new THREE.Group();
      towerGroup.position.set(tx, 0, tz);

      const legMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7 });
      const legGeo = new THREE.CylinderGeometry(0.2, 0.3, 10, 8);
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.y = 5;
      leg.castShadow = true;
      towerGroup.add(leg);

      const cabGeo = new THREE.BoxGeometry(3, 2, 3);
      const cabMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
      const cab = new THREE.Mesh(cabGeo, cabMat);
      cab.position.y = 10;
      towerGroup.add(cab);

      const redLight = new THREE.PointLight(0xef4444, 2, 20);
      redLight.position.set(0, 11, 0);
      towerGroup.add(redLight);

      this.scene.add(towerGroup);

      this.obstacles.push({
        position: { x: tx, y: 5, z: tz },
        size: { x: 3, y: 10, z: 3 },
        minX: tx - 1.5,
        maxX: tx + 1.5,
        minZ: tz - 1.5,
        maxZ: tz + 1.5
      });
    });
  }

  spawnEnemy() {
    const types = ['scout', 'heavy', 'artillery'];
    const selectedType = types[Math.floor(Math.random() * types.length)];

    let camoType = 'camo_desert';
    let scale = 1.0;
    let speed = 2.2;
    let health = 3;
    let barrelCount = 1;

    if (selectedType === 'scout') {
      camoType = 'camo_scout';
      scale = 0.85;
      speed = 3.8;
      health = 2;
    } else if (selectedType === 'heavy') {
      camoType = 'camo_urban';
      scale = 1.3;
      speed = 1.5;
      health = 7;
      barrelCount = 2;
    } else if (selectedType === 'artillery') {
      camoType = 'camo_desert';
      scale = 1.1;
      speed = 2.0;
      health = 4;
    }

    const enemyTankData = buildTankMesh({
      isPlayer: false,
      camoType,
      scale,
      barrelCount,
      accentColor: 0xef4444
    });

    let validPos = false;
    let spawnX = 0, spawnZ = 0;

    for (let attempts = 0; attempts < 20; attempts++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 30 + Math.random() * 22;
      spawnX = Math.cos(angle) * dist;
      spawnZ = Math.sin(angle) * dist;

      const collides = this.obstacles.some((obs) =>
        checkSphereBoxCollision({ x: spawnX, z: spawnZ }, 2.0 * scale, obs)
      );
      if (!collides) {
        validPos = true;
        break;
      }
    }

    if (!validPos) {
      spawnX = (Math.random() - 0.5) * 60;
      spawnZ = (Math.random() - 0.5) * 60;
    }

    enemyTankData.group.position.set(spawnX, 0, spawnZ);

    const enemyObj = {
      type: selectedType,
      isBoss: false,
      tankData: enemyTankData,
      radius: 1.4 * scale,
      speed: speed,
      health: health,
      maxHealth: health,
      lastShotTime: 0,
      fireRate: selectedType === 'scout' ? 1200 : selectedType === 'heavy' ? 2200 : 1800
    };

    this.enemies.push(enemyObj);
    this.scene.add(enemyTankData.group);
  }

  spawnBoss() {
    if (this.bossObj) return;

    const bossTankData = buildTankMesh({
      isPlayer: false,
      isBoss: true,
      camoType: 'camo_boss',
      scale: 2.2,
      barrelCount: 2,
      accentColor: 0xef4444
    });

    bossTankData.group.position.set(0, 0, -38);

    this.bossObj = {
      type: 'boss',
      isBoss: true,
      tankData: bossTankData,
      radius: 3.2,
      speed: 1.2,
      health: 40,
      maxHealth: 40,
      lastShotTime: 0,
      fireRate: 1000
    };

    this.enemies.push(this.bossObj);
    this.scene.add(bossTankData.group);
  }

  startReload() {
    if (this.isReloading || this.ammoCount === this.ammoMax) return;
    this.isReloading = true;
    this.reloadProgress = 0.0;
    this.reloadTimer = 0;
    this.playReloadSound();
  }

  toggleCameraMode() {
    this.cameraMode = this.cameraMode === '3rd' ? '1st' : '3rd';
  }

  fireProjectile(isPlayer = true, sourceTank = null) {
    const now = performance.now();
    this.initAudio();

    if (isPlayer) {
      if (this.isReloading) return;
      if (this.ammoCount <= 0) {
        this.startReload();
        return;
      }
      if (now - this.lastFireTime < this.fireRate) return;

      this.lastFireTime = now;
      this.ammoCount--;
      this.shotsFired++;
      this.playCannonSound(true);
      this.shakeIntensity = 0.4;

      if (this.ammoCount <= 0) {
        this.startReload();
      }
    } else {
      this.playCannonSound(sourceTank && sourceTank.isBoss);
    }

    const tankData = isPlayer ? this.playerData : sourceTank.tankData;
    const turret = tankData.turret;

    tankData.barrels.forEach((b) => {
      b.position.z = 0.6;
    });

    const worldPos = new THREE.Vector3();
    turret.getWorldPosition(worldPos);

    const direction = new THREE.Vector3(0, 0, 1);
    direction.applyQuaternion(turret.getWorldQuaternion(new THREE.Quaternion()));

    const muzzlePos = worldPos.clone().add(direction.clone().multiplyScalar(isPlayer ? 2.2 : (sourceTank && sourceTank.isBoss ? 5.5 : 2.2)));

    const flashLight = new THREE.PointLight(isPlayer ? 0x38bdf8 : 0xef4444, 6, 15);
    flashLight.position.copy(muzzlePos);
    this.scene.add(flashLight);
    setTimeout(() => this.scene.remove(flashLight), 50);

    const projGeo = new THREE.SphereGeometry(isPlayer ? 0.32 : (sourceTank && sourceTank.isBoss ? 0.6 : 0.3), 12, 12);
    const projMat = new THREE.MeshBasicMaterial({
      color: isPlayer ? 0x38bdf8 : 0xf87171
    });
    const projMesh = new THREE.Mesh(projGeo, projMat);
    projMesh.position.copy(muzzlePos);

    const projObj = {
      mesh: projMesh,
      direction: direction,
      speed: isPlayer ? 50 : (sourceTank && sourceTank.isBoss ? 40 : 32),
      life: 2.2,
      radius: isPlayer ? 0.32 : (sourceTank && sourceTank.isBoss ? 0.6 : 0.3),
      isPlayer: isPlayer,
      damage: isPlayer ? 1 : (sourceTank && sourceTank.isBoss ? 25 : 15)
    };

    this.projectiles.push(projObj);
    this.scene.add(projMesh);
  }

  createExplosion(position, isLarge = false) {
    this.playExplosionSound();
    this.shakeIntensity = isLarge ? 0.7 : 0.25;

    const particleCount = isLarge ? 40 : 18;
    for (let i = 0; i < particleCount; i++) {
      const size = Math.random() * 0.5 + 0.15;
      const partGeo = new THREE.BoxGeometry(size, size, size);
      const colors = [0xef4444, 0xf97316, 0xfbbf24, 0x38bdf8, 0x1e293b];
      const partMat = new THREE.MeshBasicMaterial({
        color: colors[Math.floor(Math.random() * colors.length)]
      });
      const particle = new THREE.Mesh(partGeo, partMat);
      particle.position.copy(position);

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * (isLarge ? 15 : 8),
        Math.random() * (isLarge ? 12 : 7) + 2,
        (Math.random() - 0.5) * (isLarge ? 15 : 8)
      );

      this.particles.push({
        mesh: particle,
        velocity: vel,
        life: isLarge ? 1.0 : 0.5
      });
      this.scene.add(particle);
    }
  }

  update(delta, moveInput, aimInput, isFiring) {
    if (this.isGameOver) return;

    this.camSwayTime += delta * 4;

    // Check Boss Spawn condition (score >= 400 or kills >= 5)
    if (!this.bossObj && (this.kills >= 5 || this.score >= 400)) {
      this.spawnBoss();
    }

    // Handle Reload Progress
    if (this.isReloading) {
      this.reloadTimer += delta;
      this.reloadProgress = Math.min(1.0, this.reloadTimer / this.reloadTime);
      if (this.reloadTimer >= this.reloadTime) {
        this.isReloading = false;
        this.ammoCount = this.ammoMax;
        this.reloadProgress = 1.0;
      }
    }

    // Recover barrel recoil
    if (this.playerData) {
      this.playerData.barrels.forEach((b) => {
        b.position.z = THREE.MathUtils.lerp(b.position.z, 1.25, delta * 12);
      });
    }

    // 1. Move Player
    const playerGroup = this.playerData.group;
    const moveSpeed = 10;
    const proposedX = playerGroup.position.x + moveInput.x * moveSpeed * delta;
    const proposedZ = playerGroup.position.z + moveInput.y * moveSpeed * delta;

    const playerRadius = 1.35;
    const collidesX = this.obstacles.some((obs) =>
      checkSphereBoxCollision({ x: proposedX, z: playerGroup.position.z }, playerRadius, obs)
    );
    const collidesZ = this.obstacles.some((obs) =>
      checkSphereBoxCollision({ x: playerGroup.position.x, z: proposedZ }, playerRadius, obs)
    );

    if (!collidesX) playerGroup.position.x = proposedX;
    if (!collidesZ) playerGroup.position.z = proposedZ;

    if (Math.hypot(moveInput.x, moveInput.y) > 0.1) {
      const targetAngle = Math.atan2(moveInput.x, moveInput.y);
      playerGroup.rotation.y = THREE.MathUtils.lerp(playerGroup.rotation.y, targetAngle, delta * 8);

      this.playerData.wheels.forEach((w) => {
        w.rotation.x += delta * 10;
      });
    }

    // 2. Aim Turret
    const turret = this.playerData.turret;
    if (aimInput.isTouchAiming) {
      const aimAngle = Math.atan2(aimInput.x, aimInput.y);
      turret.rotation.y = aimAngle - playerGroup.rotation.y;
    } else {
      this.raycaster.setFromCamera(aimInput.mouseScreenPos, this.camera);
      const targetPoint = new THREE.Vector3();
      if (this.raycaster.ray.intersectPlane(this.groundPlane, targetPoint)) {
        const localTarget = targetPoint.clone();
        playerGroup.worldToLocal(localTarget);
        const mouseAngle = Math.atan2(localTarget.x, localTarget.z);
        turret.rotation.y = mouseAngle;
      }
    }

    // 3. Fire Player Cannon
    if (isFiring) {
      this.fireProjectile(true);
    }

    // 4. Update Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.life -= delta;
      p.mesh.position.addScaledVector(p.direction, p.speed * delta);

      let destroyed = false;

      const hitObstacle = this.obstacles.some((obs) =>
        checkSphereBoxCollision(p.mesh.position, p.radius, obs)
      );

      if (hitObstacle) {
        destroyed = true;
        this.playRicochetSound();
        this.createExplosion(p.mesh.position, false);
      } else if (p.isPlayer) {
        // Player Shell -> Enemy / Boss Tanks
        for (let j = this.enemies.length - 1; j >= 0; j--) {
          const enemy = this.enemies[j];
          if (checkSphereCollision(p.mesh.position, p.radius, enemy.tankData.group.position, enemy.radius)) {
            enemy.health -= p.damage || 1;
            this.shotsHit++;
            destroyed = true;

            if (enemy.health <= 0) {
              this.createExplosion(enemy.tankData.group.position, true);
              this.scene.remove(enemy.tankData.group);
              this.enemies.splice(j, 1);

              if (enemy.isBoss) {
                this.score += 1000;
                this.kills += 3;
                this.bossObj = null;
              } else {
                this.kills++;
                this.score += enemy.type === 'heavy' ? 250 : enemy.type === 'artillery' ? 150 : 100;
                this.spawnEnemy();
              }
            } else {
              this.createExplosion(p.mesh.position, false);
            }
            break;
          }
        }
      } else {
        // Enemy Shell -> Player Tank
        if (checkSphereCollision(p.mesh.position, p.radius, playerGroup.position, playerRadius)) {
          destroyed = true;
          this.health -= p.damage || 15;
          this.createExplosion(p.mesh.position, false);

          if (this.health <= 0) {
            this.health = 0;
            this.isGameOver = true;
            this.createExplosion(playerGroup.position, true);
          }
        }
      }

      if (destroyed || p.life <= 0) {
        this.scene.remove(p.mesh);
        this.projectiles.splice(i, 1);
      }
    }

    // 5. Update Enemy Tanks & Boss AI
    const now = performance.now();
    for (let i = 0; i < this.enemies.length; i++) {
      const enemy = this.enemies[i];
      const enemyGroup = enemy.tankData.group;

      enemy.tankData.barrels.forEach((b) => {
        b.position.z = THREE.MathUtils.lerp(b.position.z, 1.25, delta * 10);
      });

      const toPlayer = new THREE.Vector3().subVectors(playerGroup.position, enemyGroup.position);
      toPlayer.y = 0;
      const distToPlayer = toPlayer.length();

      if (distToPlayer > 0.1) {
        toPlayer.normalize();

        const stopDist = enemy.isBoss ? 12 : 8;
        if (distToPlayer > stopDist) {
          const proposedX = enemyGroup.position.x + toPlayer.x * enemy.speed * delta;
          const proposedZ = enemyGroup.position.z + toPlayer.z * enemy.speed * delta;

          const collides = this.obstacles.some((obs) =>
            checkSphereBoxCollision({ x: proposedX, z: proposedZ }, enemy.radius, obs)
          );

          if (!collides) {
            enemyGroup.position.x = proposedX;
            enemyGroup.position.z = proposedZ;
          }

          const enemyTargetAngle = Math.atan2(toPlayer.x, toPlayer.z);
          enemyGroup.rotation.y = THREE.MathUtils.lerp(enemyGroup.rotation.y, enemyTargetAngle, delta * 4);
        }

        const localPlayerPos = playerGroup.position.clone();
        enemyGroup.worldToLocal(localPlayerPos);
        const turretAngle = Math.atan2(localPlayerPos.x, localPlayerPos.z);
        enemy.tankData.turret.rotation.y = THREE.MathUtils.lerp(enemy.tankData.turret.rotation.y, turretAngle, delta * 6);

        if (distToPlayer < 40 && now - enemy.lastShotTime > enemy.fireRate) {
          enemy.lastShotTime = now;
          this.fireProjectile(false, enemy);
        }
      }
    }

    // 6. Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.life -= delta;
      pt.velocity.y -= 9.8 * delta;
      pt.mesh.position.addScaledVector(pt.velocity, delta);

      if (pt.life <= 0) {
        this.scene.remove(pt.mesh);
        this.particles.splice(i, 1);
      }
    }

    // Floating Atmosphere Particles Drift
    if (this.atmosphereParticles) {
      const posAttr = this.atmosphereParticles.geometry.attributes.position;
      for (let i = 0; i < posAttr.count; i++) {
        let y = posAttr.getY(i) - delta * 0.8;
        if (y < 0.5) y = 15;
        posAttr.setY(i, y);
      }
      posAttr.needsUpdate = true;
    }

    // 7. Camera & Bodycam Sway Mechanics
    if (this.cameraMode === '1st') {
      // First Person Camera attached directly to Gunner Optic Sight
      const opticWorldPos = new THREE.Vector3();
      this.playerData.turret.getWorldPosition(opticWorldPos);

      const turretQuaternion = new THREE.Quaternion();
      this.playerData.turret.getWorldQuaternion(turretQuaternion);

      const forwardDir = new THREE.Vector3(0, 0, 1).applyQuaternion(turretQuaternion);
      const upDir = new THREE.Vector3(0, 1, 0);

      // Bodycam organic sway
      const swayX = Math.sin(this.camSwayTime * 2) * 0.08;
      const swayY = Math.cos(this.camSwayTime * 3) * 0.06;

      const fpCamPos = opticWorldPos.clone()
        .add(forwardDir.clone().multiplyScalar(0.4))
        .add(upDir.clone().multiplyScalar(0.35 + swayY));

      if (this.shakeIntensity > 0) {
        fpCamPos.x += (Math.random() - 0.5) * this.shakeIntensity * 1.5;
        fpCamPos.y += (Math.random() - 0.5) * this.shakeIntensity * 1.5;
        fpCamPos.z += (Math.random() - 0.5) * this.shakeIntensity * 1.5;
        this.shakeIntensity = Math.max(0, this.shakeIntensity - delta * 2);
      }

      this.camera.position.copy(fpCamPos);
      const targetLook = fpCamPos.clone().add(forwardDir.clone().multiplyScalar(20));
      targetLook.x += swayX;
      this.camera.lookAt(targetLook);
    } else {
      // Third Person Follow Camera
      const camOffset = new THREE.Vector3(0, 20, 18);
      const targetCamPos = playerGroup.position.clone().add(camOffset);

      if (this.shakeIntensity > 0) {
        targetCamPos.x += (Math.random() - 0.5) * this.shakeIntensity * 3;
        targetCamPos.y += (Math.random() - 0.5) * this.shakeIntensity * 3;
        targetCamPos.z += (Math.random() - 0.5) * this.shakeIntensity * 3;
        this.shakeIntensity = Math.max(0, this.shakeIntensity - delta * 2);
      }

      this.camera.position.lerp(targetCamPos, delta * 6);
      this.camera.lookAt(playerGroup.position.x, 1, playerGroup.position.z);
    }

    // Render Scene
    this.renderer.render(this.scene, this.camera);
  }

  resize(w, h) {
    this.width = w;
    this.height = h;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  restart() {
    this.score = 0;
    this.health = 100;
    this.isGameOver = false;
    this.kills = 0;
    this.shotsFired = 0;
    this.shotsHit = 0;

    this.ammoCount = this.ammoMax;
    this.isReloading = false;
    this.reloadProgress = 1.0;

    this.playerData.group.position.set(0, 0, 0);

    this.projectiles.forEach((p) => this.scene.remove(p.mesh));
    this.projectiles = [];
    this.particles.forEach((pt) => this.scene.remove(pt.mesh));
    this.particles = [];

    this.enemies.forEach((e) => this.scene.remove(e.tankData.group));
    this.enemies = [];
    this.bossObj = null;

    for (let i = 0; i < 6; i++) {
      this.spawnEnemy();
    }
  }
}
