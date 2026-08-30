import * as THREE from 'three';

export function checkSphereCollision(posA, radiusA, posB, radiusB) {
  const dx = posA.x - posB.x;
  const dy = posA.y - posB.y;
  const dz = posA.z - posB.z;
  const distSq = dx * dx + dy * dy + dz * dz;
  const radiusSum = radiusA + radiusB;
  return distSq <= radiusSum * radiusSum;
}

export class GameEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // Game state
    this.score = 0;
    this.health = 100;
    this.isGameOver = false;

    // Three.js core
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0b0f19);
    this.scene.fog = new THREE.FogExp2(0x0b0f19, 0.015);

    this.camera = new THREE.PerspectiveCamera(60, this.width / this.height, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;

    // Raycaster for mouse aiming
    this.raycaster = new THREE.Raycaster();
    this.groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

    // Audio synthesizer (Web Audio API)
    this.audioCtx = null;

    // Entities
    this.player = null;
    this.turret = null;
    this.projectiles = [];
    this.enemies = [];
    this.particles = [];

    // Cooldowns
    this.lastFireTime = 0;
    this.fireRate = 200; // ms between shots

    this.initScene();
  }

  initAudio() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playLaserSound() {
    if (!this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, this.audioCtx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.15);
    } catch (e) {
      // Audio fallback
    }
  }

  playExplosionSound() {
    if (!this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, this.audioCtx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.25);
    } catch (e) {}
  }

  initScene() {
    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    dirLight.position.set(40, 60, 40);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    this.scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xf43f5e, 1, 50);
    pointLight.position.set(0, 10, 0);
    this.scene.add(pointLight);

    // Grid / Terrain Ground
    const gridHelper = new THREE.GridHelper(100, 50, 0x38bdf8, 0x1e293b);
    gridHelper.position.y = 0.01;
    this.scene.add(gridHelper);

    const floorGeo = new THREE.PlaneGeometry(100, 100);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.8,
      metalness: 0.2
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    this.scene.add(floorMesh);

    // Decorative pillars
    for (let i = 0; i < 12; i++) {
      const pillarGeo = new THREE.CylinderGeometry(1, 1, 8, 8);
      const pillarMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3 });
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      const angle = (i / 12) * Math.PI * 2;
      const radius = 35 + Math.random() * 5;
      pillar.position.set(Math.cos(angle) * radius, 4, Math.sin(angle) * radius);
      pillar.castShadow = true;
      pillar.receiveShadow = true;
      this.scene.add(pillar);
    }

    // Build Player Vehicle / Mech
    this.playerGroup = new THREE.Group();

    // Base chassis
    const bodyGeo = new THREE.BoxGeometry(2, 0.8, 2.4);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.y = 0.6;
    bodyMesh.castShadow = true;
    this.playerGroup.add(bodyMesh);

    // Wheels / Treads
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const wheelPositions = [
      [-1.1, 0.4, 0.8],
      [1.1, 0.4, 0.8],
      [-1.1, 0.4, -0.8],
      [1.1, 0.4, -0.8]
    ];
    wheelPositions.forEach((pos) => {
      const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.4, 12);
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(...pos);
      wheel.castShadow = true;
      this.playerGroup.add(wheel);
    });

    // Turret (Rotates to Aim)
    this.turret = new THREE.Group();
    this.turret.position.set(0, 1.1, 0);

    const domeGeo = new THREE.SphereGeometry(0.7, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.5, roughness: 0.2 });
    const domeMesh = new THREE.Mesh(domeGeo, domeMat);
    this.turret.add(domeMesh);

    // Barrel
    const barrelGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.6, 12);
    const barrelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8 });
    const barrelMesh = new THREE.Mesh(barrelGeo, barrelMat);
    barrelMesh.rotation.x = Math.PI / 2;
    barrelMesh.position.set(0, 0.2, 0.8);
    barrelMesh.castShadow = true;
    this.turret.add(barrelMesh);

    this.playerGroup.add(this.turret);
    this.scene.add(this.playerGroup);

    // Spawn initial target enemies
    for (let i = 0; i < 5; i++) {
      this.spawnEnemy();
    }
  }

  spawnEnemy() {
    const enemyGroup = new THREE.Group();

    const bodyGeo = new THREE.DodecahedronGeometry(1);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0x991b1b,
      roughness: 0.3
    });
    const mesh = new THREE.Mesh(bodyGeo, bodyMat);
    mesh.castShadow = true;
    enemyGroup.add(mesh);

    // Random placement along perimeter
    const angle = Math.random() * Math.PI * 2;
    const distance = 25 + Math.random() * 20;
    enemyGroup.position.set(Math.cos(angle) * distance, 1, Math.sin(angle) * distance);

    const enemyObj = {
      group: enemyGroup,
      mesh: mesh,
      radius: 1,
      speed: 1.5 + Math.random() * 2,
      health: 2
    };

    this.enemies.push(enemyObj);
    this.scene.add(enemyGroup);
  }

  fireProjectile() {
    const now = performance.now();
    if (now - this.lastFireTime < this.fireRate) return;
    this.lastFireTime = now;

    this.initAudio();
    this.playLaserSound();

    // Spawn projectile from turret direction
    const projGeo = new THREE.SphereGeometry(0.25, 8, 8);
    const projMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const projMesh = new THREE.Mesh(projGeo, projMat);

    // Get turret barrel tip world position & direction
    const worldPos = new THREE.Vector3();
    this.turret.getWorldPosition(worldPos);

    const direction = new THREE.Vector3(0, 0, 1);
    direction.applyQuaternion(this.turret.getWorldQuaternion(new THREE.Quaternion()));

    projMesh.position.copy(worldPos).add(direction.clone().multiplyScalar(1.2));

    const projObj = {
      mesh: projMesh,
      direction: direction,
      speed: 35,
      life: 2.0, // seconds
      radius: 0.25
    };

    this.projectiles.push(projObj);
    this.scene.add(projMesh);
  }

  createExplosion(position) {
    this.playExplosionSound();
    for (let i = 0; i < 15; i++) {
      const partGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
      const partMat = new THREE.MeshBasicMaterial({
        color: Math.random() > 0.5 ? 0xf87171 : 0xfbbf24
      });
      const particle = new THREE.Mesh(partGeo, partMat);
      particle.position.copy(position);

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 8,
        Math.random() * 6 + 1,
        (Math.random() - 0.5) * 8
      );

      this.particles.push({
        mesh: particle,
        velocity: vel,
        life: 0.5
      });
      this.scene.add(particle);
    }
  }

  update(delta, moveInput, aimInput, isFiring) {
    if (this.isGameOver) return;

    // 1. Move Player
    const moveSpeed = 8;
    const dx = moveInput.x * moveSpeed * delta;
    const dz = moveInput.y * moveSpeed * delta;

    this.playerGroup.position.x += dx;
    this.playerGroup.position.z += dz;

    // Clamp player within 45 unit arena bound
    const bound = 45;
    this.playerGroup.position.x = Math.max(-bound, Math.min(bound, this.playerGroup.position.x));
    this.playerGroup.position.z = Math.max(-bound, Math.min(bound, this.playerGroup.position.z));

    // Rotate player body towards move direction if moving
    if (Math.hypot(moveInput.x, moveInput.y) > 0.1) {
      const targetAngle = Math.atan2(moveInput.x, moveInput.y);
      this.playerGroup.rotation.y = targetAngle;
    }

    // 2. Aim Turret
    if (aimInput.isTouchAiming) {
      // Right Joystick aim vector (x, y)
      const aimAngle = Math.atan2(aimInput.x, aimInput.y);
      // Absolute target angle relative to world
      this.turret.rotation.y = aimAngle - this.playerGroup.rotation.y;
    } else {
      // Mouse raycast aim on desktop
      this.raycaster.setFromCamera(aimInput.mouseScreenPos, this.camera);
      const targetPoint = new THREE.Vector3();
      if (this.raycaster.ray.intersectPlane(this.groundPlane, targetPoint)) {
        const localTarget = targetPoint.clone();
        this.playerGroup.worldToLocal(localTarget);
        const mouseAngle = Math.atan2(localTarget.x, localTarget.z);
        this.turret.rotation.y = mouseAngle;
      }
    }

    // 3. Fire Projectiles
    if (isFiring) {
      this.fireProjectile();
    }

    // Update Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.life -= delta;
      p.mesh.position.addScaledVector(p.direction, p.speed * delta);

      let destroyed = false;

      // Check collision with enemies
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const enemy = this.enemies[j];
        if (checkSphereCollision(p.mesh.position, p.radius, enemy.group.position, enemy.radius)) {
          enemy.health -= 1;
          destroyed = true;

          if (enemy.health <= 0) {
            this.createExplosion(enemy.group.position);
            this.scene.remove(enemy.group);
            this.enemies.splice(j, 1);
            this.score += 100;
            this.spawnEnemy(); // Respawn new enemy
          }
          break;
        }
      }

      if (destroyed || p.life <= 0) {
        this.scene.remove(p.mesh);
        this.projectiles.splice(i, 1);
      }
    }

    // Update Enemies (move towards player)
    for (let i = 0; i < this.enemies.length; i++) {
      const enemy = this.enemies[i];
      enemy.group.rotation.x += delta * 2;
      enemy.group.rotation.y += delta * 2;

      const toPlayer = new THREE.Vector3().subVectors(this.playerGroup.position, enemy.group.position);
      toPlayer.y = 0;
      if (toPlayer.length() > 0.1) {
        toPlayer.normalize();
        enemy.group.position.addScaledVector(toPlayer, enemy.speed * delta);
      }

      // Check collision with player
      if (checkSphereCollision(enemy.group.position, enemy.radius, this.playerGroup.position, 1.2)) {
        this.health -= 20 * delta; // Take damage
        if (this.health <= 0) {
          this.health = 0;
          this.isGameOver = true;
          this.createExplosion(this.playerGroup.position);
        }
      }
    }

    // Update Explosion Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.life -= delta;
      pt.velocity.y -= 9.8 * delta; // gravity
      pt.mesh.position.addScaledVector(pt.velocity, delta);

      if (pt.life <= 0) {
        this.scene.remove(pt.mesh);
        this.particles.splice(i, 1);
      }
    }

    // Camera follow (Third-person view)
    const camOffset = new THREE.Vector3(0, 18, 16);
    this.camera.position.copy(this.playerGroup.position).add(camOffset);
    this.camera.lookAt(this.playerGroup.position.x, 1, this.playerGroup.position.z);

    // Render 3D Scene
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

    this.playerGroup.position.set(0, 0, 0);

    // Clear projectiles & particles
    this.projectiles.forEach((p) => this.scene.remove(p.mesh));
    this.projectiles = [];
    this.particles.forEach((pt) => this.scene.remove(pt.mesh));
    this.particles = [];

    // Reset enemies
    this.enemies.forEach((e) => this.scene.remove(e.group));
    this.enemies = [];
    for (let i = 0; i < 5; i++) {
      this.spawnEnemy();
    }
  }
}
