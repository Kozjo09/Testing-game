import { describe, it, expect } from 'vitest';
import { checkSphereCollision } from '../src/game.js';

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
});
