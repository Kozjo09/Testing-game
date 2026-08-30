import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { calculateJoystickVector, DualInputManager } from '../src/controls.js';

describe('Joystick vector math', () => {
  it('returns zero vector if touches are missing or identical', () => {
    expect(calculateJoystickVector(null, null)).toEqual({ x: 0, y: 0, distanceRatio: 0, angle: 0 });
    const touch = { clientX: 100, clientY: 100 };
    expect(calculateJoystickVector(touch, touch)).toEqual({ x: 0, y: 0, distanceRatio: 0, angle: 0 });
  });

  it('calculates direction and clamps distance to max radius', () => {
    const start = { clientX: 100, clientY: 100 };
    const current = { clientX: 200, clientY: 100 }; // dx = 100, dy = 0. maxRadius = 50
    const res = calculateJoystickVector(start, current, 50);

    expect(res.x).toBeCloseTo(1);
    expect(res.y).toBeCloseTo(0);
    expect(res.knobX).toBeCloseTo(50);
    expect(res.knobY).toBeCloseTo(0);
    expect(res.distanceRatio).toBeCloseTo(1);
  });

  it('calculates diagonal touch joystick movement correctly', () => {
    const start = { clientX: 100, clientY: 100 };
    const current = { clientX: 130, clientY: 140 }; // dx = 30, dy = 40, distance = 50
    const res = calculateJoystickVector(start, current, 50);

    expect(res.x).toBeCloseTo(0.6);
    expect(res.y).toBeCloseTo(0.8);
    expect(res.distanceRatio).toBeCloseTo(1);
  });
});

describe('DualInputManager', () => {
  let inputManager;

  beforeEach(() => {
    inputManager = new DualInputManager({ maxRadius: 50 });
  });

  it('merges keyboard WASD inputs correctly', () => {
    inputManager.keys.KeyW = true;
    inputManager.keys.KeyD = true;
    const move = inputManager.getMoveInput();

    expect(move.x).toBeCloseTo(Math.SQRT1_2);
    expect(move.y).toBeCloseTo(-Math.SQRT1_2);
  });

  it('processes touch move and aim joysticks simultaneously', () => {
    // Simulate simultaneous touch move pointer and touch aim pointer
    inputManager.moveStartPos = { clientX: 100, clientY: 100 };
    inputManager.moveTouchId = 1;
    inputManager.updateJoystick('move', { pointerId: 1, clientX: 100, clientY: 50 }); // dy = -50 (up)

    inputManager.aimStartPos = { clientX: 400, clientY: 400 };
    inputManager.aimTouchId = 2;
    inputManager.updateJoystick('aim', { pointerId: 2, clientX: 450, clientY: 400 }); // dx = 50 (right)

    const move = inputManager.getMoveInput();
    const aim = inputManager.getAimInput();

    expect(move.x).toBeCloseTo(0);
    expect(move.y).toBeCloseTo(-1);

    expect(aim.x).toBeCloseTo(1);
    expect(aim.y).toBeCloseTo(0);
    expect(aim.isTouchAiming).toBe(true);
    expect(inputManager.getFiring()).toBe(true); // touch aim magnitude > 0.5 triggers firing
  });
});
