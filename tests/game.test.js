import { describe, it, expect } from 'vitest';
import { checkSphereCollision, checkSphereBoxCollision, buildTankMesh } from '../src/game.js';

describe('Game collision math', () => {
  it('detects sphere collision when distance is less than sum of radii', () => {
    const posA = { x: 0, y: 0, z: 0 };
    const posB = { x: 1, y: 0, z: 0 };
    expect(checkSphereCollision(posA, 0.5, posB, 0.6)).toBe(true);
  });

  it('returns false when spheres do not intersect', () => {
    const posA = { x: 0, y: 0, z: 0 };
    const posB = { x: 5, y: 0, z: 0 };
    expect(checkSphereCollision(posA, 1.0, posB, 1.0)).toBe(false);
  });

  it('detects sphere-box collision accurately', () => {
    const box = {
      position: { x: 0, y: 0, z: 0 },
      size: { x: 10, y: 4, z: 10 },
      minX: -5, maxX: 5, minZ: -5, maxZ: 5
    };

    // Sphere inside or touching box
    expect(checkSphereBoxCollision({ x: 4.5, y: 0, z: 0 }, 1.0, box)).toBe(true);

    // Sphere clearly outside box
    expect(checkSphereBoxCollision({ x: 10, y: 0, z: 10 }, 1.0, box)).toBe(false);
  });

  it('supports box objects without min/max properties pre-calculated', () => {
    const box = {
      position: { x: 20, y: 2, z: 20 },
      size: { x: 10, y: 4, z: 10 }
    };

    expect(checkSphereBoxCollision({ x: 19, y: 0, z: 19 }, 1.0, box)).toBe(true);
    expect(checkSphereBoxCollision({ x: 0, y: 0, z: 0 }, 1.0, box)).toBe(false);
  });
});

describe('Tank mesh construction', () => {
  it('builds a player tank with dual barrels and proper hierarchy', () => {
    const tankData = buildTankMesh({
      isPlayer: true,
      camoType: 'camo_player',
      scale: 1.0,
      barrelCount: 2
    });

    expect(tankData.group).toBeDefined();
    expect(tankData.turret).toBeDefined();
    expect(tankData.barrels.length).toBe(2);
    expect(tankData.wheels.length).toBeGreaterThan(0);
  });

  it('builds a single-barrel enemy tank mesh', () => {
    const tankData = buildTankMesh({
      isPlayer: false,
      camoType: 'camo_scout',
      scale: 0.85,
      barrelCount: 1
    });

    expect(tankData.group).toBeDefined();
    expect(tankData.barrels.length).toBe(1);
  });
});
