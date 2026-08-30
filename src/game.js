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
  // box format: { minX, maxX, minZ, maxZ } or { position: {x,y,z}, size: {x,y,z} }
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

  // Closest point on box to sphere
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
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 512, 512);

    // Mud & dirt camouflage grid pattern
    for (let i = 0; i < 800; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#0f172a' : '#334155';
      ctx.beginPath();
      ctx.arc(Math.random() * 512, Math.random() * 512, Math.random() * 4 + 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Grid lines for tactical battlefield floor
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
    ctx.lineWidth = 2;
    const step = 64;
    for (let x = 0; x <= 512; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 512); ctx.stroke();
    }
    for (let y = 0; y <= 512; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke();
    }
  } else if (type === 'camo_desert') {
    ctx.fillStyle = '#d97706';
    ctx.fillRect(0, 0, 512, 512);
    const colors = ['#b45309', '#78350f', '#f59e0b', '#92400e'];
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.ellipse(Math.random() * 512, Math.random() * 512, Math.random() * 60 + 20, Math.random() * 40 + 10, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === 'camo_urban') {
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 0, 512, 512);
    const colors = ['#1e293b', '#475569', '#0f172a', '#64748b'];
    for (let i = 0; i < 50; i++) {
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(Math.random() * 512, Math.random() * 512, Math.random() * 80 + 20, Math.random() * 60 + 20);
    }
  } else if (type === 'camo_scout') {
    ctx.fillStyle = '#15803d';
    ctx.fillRect(0, 0, 512, 512);
    const colors = ['#166534', '#14532d', '#4d7c0f', '#3f6212'];
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.ellipse(Math.random() * 512, Math.random() * 512, Math.random() * 70 + 20, Math.random() * 30 + 10, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === 'camo_player') {
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(0, 0, 512, 512);
    const colors = ['#0369a1', '#075985', '#0284c7', '#38bdf8'];
    for (let i = 0; i < 35; i++) {
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(Math.random() * 512, Math.random() * 512, Math.random() * 70 + 15, Math.random() * 50 + 15);
    }
  } else if (type === 'armor_plate') {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 8;
    ctx.strokeRect(10, 10, 492, 492);
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
    camoType = 'camo_player',
    scale = 1.0,
    barrelCount = 1,
    accentColor = 0x38bdf8
  } = options;

  const tankGroup = new THREE.Group();
  tankGroup.scale.set(scale, scale, scale);

  const texture = createProceduralTexture(camoType);
  const bodyMat = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.4,
    metalness: 0.6
  });

  const darkMetalMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.3,
    metalness: 0.8
  });

  const treadMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.9,
    metalness: 0.3
  });

  // 1. Lower Chassis
  const chassisGeo = new THREE.BoxGeometry(2.4, 0.7, 3.2);
  const chassisMesh = new THREE.Mesh(chassisGeo, bodyMat);
  chassisMesh.position.y = 0.6;
  chassisMesh.castShadow = true;
  chassisMesh.receiveShadow = true;
  tankGroup.add(chassisMesh);

  // Front Glacis Plate (Angled Armor)
  const glacisGeo = new THREE.BoxGeometry(2.35, 0.5, 1.2);
  const glacisMesh = new THREE.Mesh(glacisGeo, bodyMat);
  glacisMesh.rotation.x = Math.PI / 6;
  glacisMesh.position.set(0, 0.75, 1.3);
  glacisMesh.castShadow = true;
  tankGroup.add(glacisMesh);

  // Side Skirts / Armor Covers
  [-1.25, 1.25].forEach((xSide) => {
    const skirtGeo = new THREE.BoxGeometry(0.15, 0.6, 3.3);
    const skirtMesh = new THREE.Mesh(skirtGeo, bodyMat);
    skirtMesh.position.set(xSide, 0.55, 0);
    skirtMesh.castShadow = true;
    tankGroup.add(skirtMesh);
  });

  // Exhaust Vents at rear
  [-0.6, 0.6].forEach((xPos) => {
    const pipeGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.6, 12);
    const pipeMesh = new THREE.Mesh(pipeGeo, darkMetalMat);
    pipeMesh.rotation.x = -Math.PI / 4;
    pipeMesh.position.set(xPos, 0.8, -1.6);
    tankGroup.add(pipeMesh);
  });

  // 2. Treads & Wheels
  const wheelGeom = new THREE.CylinderGeometry(0.35, 0.35, 0.3, 16);
  const wheels = [];

  [-1.1, 1.1].forEach((xPos) => {
    // Treads outer box
    const treadBoxGeo = new THREE.BoxGeometry(0.35, 0.75, 3.4);
    const treadMesh = new THREE.Mesh(treadBoxGeo, treadMat);
    treadMesh.position.set(xPos, 0.45, 0);
    treadMesh.castShadow = true;
    tankGroup.add(treadMesh);

    // Road wheels
    for (let z = -1.2; z <= 1.2; z += 0.6) {
      const wheel = new THREE.Mesh(wheelGeom, darkMetalMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(xPos, 0.4, z);
      wheel.castShadow = true;
      tankGroup.add(wheel);
      wheels.push(wheel);
    }
  });

  // 3. Rotating Turret
  const turretGroup = new THREE.Group();
  turretGroup.position.set(0, 1.05, 0.1);

  // Turret Base
  const turretGeo = new THREE.BoxGeometry(1.8, 0.7, 2.0);
  const turretMesh = new THREE.Mesh(turretGeo, bodyMat);
  turretMesh.castShadow = true;
  turretGroup.add(turretMesh);

  // Turret Commander Hatch / Cupola
  const cupolaGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.25, 12);
  const cupolaMesh = new THREE.Mesh(cupolaGeo, darkMetalMat);
  cupolaMesh.position.set(0.4, 0.45, -0.2);
  turretGroup.add(cupolaMesh);

  // Glowing Visor / Radar Sensor on Turret
  const visorGeo = new THREE.BoxGeometry(0.5, 0.15, 0.1);
  const visorMat = new THREE.MeshBasicMaterial({ color: accentColor });
  const visorMesh = new THREE.Mesh(visorGeo, visorMat);
  visorMesh.position.set(-0.4, 0.35, 0.95);
  turretGroup.add(visorMesh);

  // Cannon Barrels & Muzzle Brakes
  const barrels = [];
  const barrelOffsetX = barrelCount === 2 ? [-0.3, 0.3] : [0];

  barrelOffsetX.forEach((xOffset) => {
    const barrelContainer = new THREE.Group();
    barrelContainer.position.set(xOffset, 0.1, 1.0);

    // Main Tube
    const mainTubeGeo = new THREE.CylinderGeometry(0.12, 0.14, 2.2, 16);
    const mainTubeMesh = new THREE.Mesh(mainTubeGeo, darkMetalMat);
    mainTubeMesh.rotation.x = Math.PI / 2;
    mainTubeMesh.position.set(0, 0, 1.1);
    mainTubeMesh.castShadow = true;
    barrelContainer.add(mainTubeMesh);

    // Muzzle Brake at tip
    const brakeGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.4, 16);
    const brakeMesh = new THREE.Mesh(brakeGeo, darkMetalMat);
    brakeMesh.rotation.x = Math.PI / 2;
    brakeMesh.position.set(0, 0, 2.2);
    barrelContainer.add(brakeMesh);

    turretGroup.add(barrelContainer);
    barrels.push(barrelContainer);
  });

  // Headlights
  if (isPlayer) {
    const headlightMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    [-0.8, 0.8].forEach((xPos) => {
      const lightCap = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.1, 12), headlightMat);
      lightCap.rotation.x = Math.PI / 2;
      lightCap.position.set(xPos, 0.75, 1.6);
      tankGroup.add(lightCap);

      const spotLight = new THREE.SpotLight(0x38bdf8, 3, 25, Math.PI / 6, 0.5);
      spotLight.position.set(xPos, 0.75, 1.65);
      spotLight.target.position.set(xPos, 0, 10);
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

    // Camera Shake
    this.shakeIntensity = 0;

    // Three.js Core
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0f1d);
    this.scene.fog = new THREE.FogExp2(0x0a0f1d, 0.012);

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
    this.projectiles = [];
    this.particles = [];
    this.obstacles = []; // Boxes for collision: { position, size, minX, maxX, minZ, maxZ }

    // Cooldowns
    this.lastFireTime = 0;
    this.fireRate = 180; // ms between shots

    this.initScene();
  }

  initAudio() {
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
    if (!this.audioCtx) return;
    try {
      const now = this.audioCtx.currentTime;
      // Main Blast
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = isHeavy ? 'square' : 'sawtooth';
      osc.frequency.setValueAtTime(isHeavy ? 180 : 320, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.25);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.25);

      // Low frequency sub rumble
      const subOsc = this.audioCtx.createOscillator();
      const subGain = this.audioCtx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(90, now);
      subOsc.frequency.exponentialRampToValueAtTime(20, now + 0.35);

      subGain.gain.setValueAtTime(0.5, now);
      subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      subOsc.connect(subGain);
      subGain.connect(this.audioCtx.destination);
      subOsc.start(now);
      subOsc.stop(now + 0.35);
    } catch (e) {}
  }

  playExplosionSound() {
    if (!this.audioCtx) return;
    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(20, now + 0.45);

      gain.gain.setValueAtTime(0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    } catch (e) {}
  }

  playRicochetSound() {
    if (!this.audioCtx) return;
    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.12);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {}
  }

  initScene() {
    // 1. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.5);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfef08a, 1.4);
    dirLight.position.set(60, 90, 50);
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

    // 2. Terrain Floor
    const mapSize = 120;
    const groundGeo = new THREE.PlaneGeometry(mapSize, mapSize, 32, 32);
    const groundTex = createProceduralTexture('ground_dirt');
    groundTex.repeat.set(6, 6);

    const groundMat = new THREE.MeshStandardMaterial({
      map: groundTex,
      roughness: 0.85,
      metalness: 0.15
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;
    this.scene.add(groundMesh);

    // 3. Build Map Obstacles & Structures
    this.buildMapStructures(mapSize);

    // 4. Build Player Tank
    this.playerData = buildTankMesh({
      isPlayer: true,
      camoType: 'camo_player',
      scale: 1.0,
      barrelCount: 2,
      accentColor: 0x38bdf8
    });
    this.playerData.recoilTimer = 0;
    this.scene.add(this.playerData.group);

    // 5. Spawn initial enemy tanks
    for (let i = 0; i < 6; i++) {
      this.spawnEnemy();
    }
  }

  buildMapStructures(mapSize) {
    const half = mapSize / 2;
    const wallHeight = 4;
    const wallThick = 2;

    const wallMat = new THREE.MeshStandardMaterial({
      map: createProceduralTexture('armor_plate'),
      roughness: 0.7,
      metalness: 0.3
    });

    // Perimeter Fortified Concrete Walls
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

    // Central & Corner Ruined Bunkers / Buildings
    const bunkerPositions = [
      [-25, -20, 10, 8],
      [25, 20, 12, 10],
      [-20, 25, 8, 12],
      [20, -25, 10, 10],
      [0, 22, 14, 6],
      [0, -22, 14, 6]
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

    // Czech Hedgehog Anti-Tank Traps
    const hedgehogMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 });
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

    // Watch Towers with Red Warning Searchlights
    const towerPositions = [
      [-48, -48], [48, 48], [-48, 48], [48, -48]
    ];
    towerPositions.forEach(([tx, tz]) => {
      const towerGroup = new THREE.Group();
      towerGroup.position.set(tx, 0, tz);

      // Legs
      const legMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7 });
      const legGeo = new THREE.CylinderGeometry(0.2, 0.3, 10, 8);
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.y = 5;
      leg.castShadow = true;
      towerGroup.add(leg);

      // Cabin
      const cabGeo = new THREE.BoxGeometry(3, 2, 3);
      const cabMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
      const cab = new THREE.Mesh(cabGeo, cabMat);
      cab.position.y = 10;
      towerGroup.add(cab);

      // Red Searchlight
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

    // Position along outer battlefield safe distance
    let validPos = false;
    let spawnX = 0, spawnZ = 0;

    for (let attempts = 0; attempts < 20; attempts++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 30 + Math.random() * 22;
      spawnX = Math.cos(angle) * dist;
      spawnZ = Math.sin(angle) * dist;

      // Ensure no initial collision with map obstacles
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

  fireProjectile(isPlayer = true, sourceTank = null) {
    const now = performance.now();
    this.initAudio();

    if (isPlayer) {
      if (now - this.lastFireTime < this.fireRate) return;
      this.lastFireTime = now;
      this.shotsFired++;
      this.playCannonSound(true);
      this.shakeIntensity = 0.35; // Trigger recoil camera shake
    } else {
      this.playCannonSound(false);
    }

    const tankData = isPlayer ? this.playerData : sourceTank.tankData;
    const turret = tankData.turret;

    // Recoil animation on barrels
    tankData.barrels.forEach((b) => {
      b.position.z = 0.6; // Push back for recoil
    });

    // Muzzle Flash Effect
    const worldPos = new THREE.Vector3();
    turret.getWorldPosition(worldPos);

    const direction = new THREE.Vector3(0, 0, 1);
    direction.applyQuaternion(turret.getWorldQuaternion(new THREE.Quaternion()));

    const muzzlePos = worldPos.clone().add(direction.clone().multiplyScalar(2.0));

    // Muzzle flash light burst
    const flashLight = new THREE.PointLight(isPlayer ? 0x38bdf8 : 0xef4444, 5, 12);
    flashLight.position.copy(muzzlePos);
    this.scene.add(flashLight);
    setTimeout(() => this.scene.remove(flashLight), 50);

    // Shell Mesh
    const projGeo = new THREE.SphereGeometry(0.3, 12, 12);
    const projMat = new THREE.MeshBasicMaterial({
      color: isPlayer ? 0x38bdf8 : 0xf87171
    });
    const projMesh = new THREE.Mesh(projGeo, projMat);
    projMesh.position.copy(muzzlePos);

    const projObj = {
      mesh: projMesh,
      direction: direction,
      speed: isPlayer ? 45 : 30,
      life: 2.2,
      radius: 0.3,
      isPlayer: isPlayer
    };

    this.projectiles.push(projObj);
    this.scene.add(projMesh);
  }

  createExplosion(position, isLarge = false) {
    this.playExplosionSound();
    this.shakeIntensity = isLarge ? 0.6 : 0.25;

    const particleCount = isLarge ? 30 : 15;
    for (let i = 0; i < particleCount; i++) {
      const size = Math.random() * 0.4 + 0.15;
      const partGeo = new THREE.BoxGeometry(size, size, size);
      const colors = [0xef4444, 0xf97316, 0xfbbf24, 0x475569];
      const partMat = new THREE.MeshBasicMaterial({
        color: colors[Math.floor(Math.random() * colors.length)]
      });
      const particle = new THREE.Mesh(partGeo, partMat);
      particle.position.copy(position);

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * (isLarge ? 12 : 7),
        Math.random() * (isLarge ? 10 : 6) + 2,
        (Math.random() - 0.5) * (isLarge ? 12 : 7)
      );

      this.particles.push({
        mesh: particle,
        velocity: vel,
        life: isLarge ? 0.8 : 0.5
      });
      this.scene.add(particle);
    }
  }

  update(delta, moveInput, aimInput, isFiring) {
    if (this.isGameOver) return;

    // Recover barrel recoil
    if (this.playerData) {
      this.playerData.barrels.forEach((b) => {
        b.position.z = THREE.MathUtils.lerp(b.position.z, 1.0, delta * 12);
      });
    }

    // 1. Move Player
    const playerGroup = this.playerData.group;
    const moveSpeed = 10;
    const proposedX = playerGroup.position.x + moveInput.x * moveSpeed * delta;
    const proposedZ = playerGroup.position.z + moveInput.y * moveSpeed * delta;

    // Check obstacle collision for player
    const playerRadius = 1.3;
    const collidesX = this.obstacles.some((obs) =>
      checkSphereBoxCollision({ x: proposedX, z: playerGroup.position.z }, playerRadius, obs)
    );
    const collidesZ = this.obstacles.some((obs) =>
      checkSphereBoxCollision({ x: playerGroup.position.x, z: proposedZ }, playerRadius, obs)
    );

    if (!collidesX) playerGroup.position.x = proposedX;
    if (!collidesZ) playerGroup.position.z = proposedZ;

    // Rotate player chassis towards movement direction
    if (Math.hypot(moveInput.x, moveInput.y) > 0.1) {
      const targetAngle = Math.atan2(moveInput.x, moveInput.y);
      playerGroup.rotation.y = THREE.MathUtils.lerp(playerGroup.rotation.y, targetAngle, delta * 8);

      // Tread wheels rotation animation
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

      // Obstacle collision for shell
      const hitObstacle = this.obstacles.some((obs) =>
        checkSphereBoxCollision(p.mesh.position, p.radius, obs)
      );

      if (hitObstacle) {
        destroyed = true;
        this.playRicochetSound();
        this.createExplosion(p.mesh.position, false);
      } else if (p.isPlayer) {
        // Player Shell -> Enemy Tanks
        for (let j = this.enemies.length - 1; j >= 0; j--) {
          const enemy = this.enemies[j];
          if (checkSphereCollision(p.mesh.position, p.radius, enemy.tankData.group.position, enemy.radius)) {
            enemy.health -= 1;
            this.shotsHit++;
            destroyed = true;

            if (enemy.health <= 0) {
              this.createExplosion(enemy.tankData.group.position, true);
              this.scene.remove(enemy.tankData.group);
              this.enemies.splice(j, 1);
              this.kills++;
              this.score += enemy.type === 'heavy' ? 250 : enemy.type === 'artillery' ? 150 : 100;
              this.spawnEnemy(); // Respawn
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
          this.health -= 15;
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

    // 5. Update Enemy Tanks AI & Movement
    const now = performance.now();
    for (let i = 0; i < this.enemies.length; i++) {
      const enemy = this.enemies[i];
      const enemyGroup = enemy.tankData.group;

      // Recover barrel recoil
      enemy.tankData.barrels.forEach((b) => {
        b.position.z = THREE.MathUtils.lerp(b.position.z, 1.0, delta * 10);
      });

      // Direction vector to player
      const toPlayer = new THREE.Vector3().subVectors(playerGroup.position, enemyGroup.position);
      toPlayer.y = 0;
      const distToPlayer = toPlayer.length();

      if (distToPlayer > 0.1) {
        toPlayer.normalize();

        // Move towards player if not too close
        if (distToPlayer > 8) {
          const proposedX = enemyGroup.position.x + toPlayer.x * enemy.speed * delta;
          const proposedZ = enemyGroup.position.z + toPlayer.z * enemy.speed * delta;

          const collides = this.obstacles.some((obs) =>
            checkSphereBoxCollision({ x: proposedX, z: proposedZ }, enemy.radius, obs)
          );

          if (!collides) {
            enemyGroup.position.x = proposedX;
            enemyGroup.position.z = proposedZ;
          }

          // Orient Enemy Chassis
          const enemyTargetAngle = Math.atan2(toPlayer.x, toPlayer.z);
          enemyGroup.rotation.y = THREE.MathUtils.lerp(enemyGroup.rotation.y, enemyTargetAngle, delta * 4);
        }

        // Aim Enemy Turret at Player
        const localPlayerPos = playerGroup.position.clone();
        enemyGroup.worldToLocal(localPlayerPos);
        const turretAngle = Math.atan2(localPlayerPos.x, localPlayerPos.z);
        enemy.tankData.turret.rotation.y = THREE.MathUtils.lerp(enemy.tankData.turret.rotation.y, turretAngle, delta * 6);

        // Enemy Firing Logic
        if (distToPlayer < 35 && now - enemy.lastShotTime > enemy.fireRate) {
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

    // 7. Camera Follow & Camera Shake
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

    this.playerData.group.position.set(0, 0, 0);

    // Clear projectiles & particles
    this.projectiles.forEach((p) => this.scene.remove(p.mesh));
    this.projectiles = [];
    this.particles.forEach((pt) => this.scene.remove(pt.mesh));
    this.particles = [];

    // Reset enemies
    this.enemies.forEach((e) => this.scene.remove(e.tankData.group));
    this.enemies = [];
    for (let i = 0; i < 6; i++) {
      this.spawnEnemy();
    }
  }
}
