/**
 * DualInputManager handles keyboard/mouse (desktop) and dual virtual joysticks (mobile touch).
 * It allows simultaneous movement and aiming on touch devices (two distinct touch pointers)
 * as well as WASD + Mouse aiming on desktop.
 */

export function calculateJoystickVector(startTouch, currentTouch, maxRadius = 50) {
  if (!startTouch || !currentTouch) {
    return { x: 0, y: 0, distanceRatio: 0, angle: 0 };
  }

  const dx = currentTouch.clientX - startTouch.clientX;
  const dy = currentTouch.clientY - startTouch.clientY;
  const distance = Math.hypot(dx, dy);

  if (distance === 0) {
    return { x: 0, y: 0, distanceRatio: 0, angle: 0 };
  }

  const clampedDistance = Math.min(distance, maxRadius);
  const angle = Math.atan2(dy, dx);

  const normalizedX = (Math.cos(angle) * clampedDistance) / maxRadius;
  const normalizedY = (Math.sin(angle) * clampedDistance) / maxRadius;

  return {
    x: normalizedX,
    y: normalizedY, // positive Y is down in screen coordinates
    knobX: Math.cos(angle) * clampedDistance,
    knobY: Math.sin(angle) * clampedDistance,
    distanceRatio: clampedDistance / maxRadius,
    angle
  };
}

export class DualInputManager {
  constructor(options = {}) {
    this.moveZone = options.moveZone || null;
    this.moveKnob = options.moveKnob || null;
    this.aimZone = options.aimZone || null;
    this.aimKnob = options.aimKnob || null;
    this.fireBtn = options.fireBtn || null;
    this.maxRadius = options.maxRadius || 50;

    // Movement state: x (-1 to 1), y (-1 to 1)
    this.moveVector = { x: 0, y: 0 };

    // Aiming vector: x (-1 to 1), y (-1 to 1)
    this.aimVector = { x: 0, y: 0 };

    // Fire state
    this.isFiring = false;

    // Pointer Tracking
    this.moveTouchId = null;
    this.moveStartPos = null;

    this.aimTouchId = null;
    this.aimStartPos = null;

    // Keyboard state
    this.keys = {
      KeyW: false,
      KeyA: false,
      KeyS: false,
      KeyD: false,
      ArrowUp: false,
      ArrowLeft: false,
      ArrowDown: false,
      ArrowRight: false,
      Space: false
    };

    // Mouse aim target ground plane / mouse coords
    this.mouseScreenPos = { x: 0, y: 0 };
    this.isMouseDown = false;

    this.boundPointerDown = this.handlePointerDown.bind(this);
    this.boundPointerMove = this.handlePointerMove.bind(this);
    this.boundPointerUp = this.handlePointerUp.bind(this);

    this.boundKeyDown = this.handleKeyDown.bind(this);
    this.boundKeyUp = this.handleKeyUp.bind(this);

    this.boundMouseMove = this.handleMouseMove.bind(this);
    this.boundMouseDown = this.handleMouseDown.bind(this);
    this.boundMouseUp = this.handleMouseUp.bind(this);
  }

  init() {
    // Attach touch / pointer listeners
    if (this.moveZone) {
      this.moveZone.addEventListener('pointerdown', (e) => this.handleZonePointerDown(e, 'move'));
    }
    if (this.aimZone) {
      this.aimZone.addEventListener('pointerdown', (e) => this.handleZonePointerDown(e, 'aim'));
    }
    if (this.fireBtn) {
      this.fireBtn.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        this.isFiring = true;
      });
      this.fireBtn.addEventListener('pointerup', (e) => {
        e.stopPropagation();
        this.isFiring = false;
      });
      this.fireBtn.addEventListener('pointercancel', (e) => {
        e.stopPropagation();
        this.isFiring = false;
      });
    }

    window.addEventListener('pointermove', this.boundPointerMove);
    window.addEventListener('pointerup', this.boundPointerUp);
    window.addEventListener('pointercancel', this.boundPointerUp);

    // Keyboard & Mouse
    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);
    window.addEventListener('mousemove', this.boundMouseMove);
    window.addEventListener('mousedown', this.boundMouseDown);
    window.addEventListener('mouseup', this.boundMouseUp);
  }

  destroy() {
    window.removeEventListener('pointermove', this.boundPointerMove);
    window.removeEventListener('pointerup', this.boundPointerUp);
    window.removeEventListener('pointercancel', this.boundPointerUp);

    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('keyup', this.boundKeyUp);
    window.removeEventListener('mousemove', this.boundMouseMove);
    window.removeEventListener('mousedown', this.boundMouseDown);
    window.removeEventListener('mouseup', this.boundMouseUp);
  }

  handleKeyDown(e) {
    if (this.keys.hasOwnProperty(e.code)) {
      this.keys[e.code] = true;
    }
  }

  handleKeyUp(e) {
    if (this.keys.hasOwnProperty(e.code)) {
      this.keys[e.code] = false;
    }
  }

  handleMouseMove(e) {
    // Normalize mouse pos (-1 to 1) for raycasting or mouse aim
    this.mouseScreenPos.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouseScreenPos.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }

  handleMouseDown(e) {
    if (e.button === 0) {
      this.isMouseDown = true;
    }
  }

  handleMouseUp(e) {
    if (e.button === 0) {
      this.isMouseDown = false;
    }
  }

  handleZonePointerDown(e, type) {
    e.preventDefault();
    if (type === 'move' && this.moveTouchId === null) {
      this.moveTouchId = e.pointerId;
      const rect = this.moveZone.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      this.moveStartPos = { clientX: centerX, clientY: centerY };
      this.updateJoystick('move', e);
    } else if (type === 'aim' && this.aimTouchId === null) {
      this.aimTouchId = e.pointerId;
      const rect = this.aimZone.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      this.aimStartPos = { clientX: centerX, clientY: centerY };
      this.updateJoystick('aim', e);
    }
  }

  handlePointerDown(e) {
    // Fallback for document level pointer down if user taps near zones
  }

  handlePointerMove(e) {
    if (e.pointerId === this.moveTouchId) {
      this.updateJoystick('move', e);
    }
    if (e.pointerId === this.aimTouchId) {
      this.updateJoystick('aim', e);
    }
  }

  handlePointerUp(e) {
    if (e.pointerId === this.moveTouchId) {
      this.moveTouchId = null;
      this.moveStartPos = null;
      this.moveVector = { x: 0, y: 0 };
      if (this.moveKnob) {
        this.moveKnob.style.transform = 'translate(0px, 0px)';
      }
    }
    if (e.pointerId === this.aimTouchId) {
      this.aimTouchId = null;
      this.aimStartPos = null;
      this.aimVector = { x: 0, y: 0 };
      if (this.aimKnob) {
        this.aimKnob.style.transform = 'translate(0px, 0px)';
      }
    }
  }

  updateJoystick(type, currentPointer) {
    const startPos = type === 'move' ? this.moveStartPos : this.aimStartPos;
    const knobEl = type === 'move' ? this.moveKnob : this.aimKnob;

    if (!startPos) return;

    const res = calculateJoystickVector(startPos, currentPointer, this.maxRadius);

    if (type === 'move') {
      this.moveVector = { x: res.x, y: res.y };
    } else {
      this.aimVector = { x: res.x, y: res.y };
    }

    if (knobEl) {
      knobEl.style.transform = `translate(${res.knobX || 0}px, ${res.knobY || 0}px)`;
    }
  }

  getMoveInput() {
    let x = this.moveVector.x;
    let y = this.moveVector.y;

    // Keyboard override / merge if joysticks are not used
    let kx = 0;
    let ky = 0;

    if (this.keys.KeyW || this.keys.ArrowUp) ky -= 1;
    if (this.keys.KeyS || this.keys.ArrowDown) ky += 1;
    if (this.keys.KeyA || this.keys.ArrowLeft) kx -= 1;
    if (this.keys.KeyD || this.keys.ArrowRight) kx += 1;

    if (kx !== 0 || ky !== 0) {
      const len = Math.hypot(kx, ky);
      x = kx / len;
      y = ky / len;
    }

    return { x, y };
  }

  getAimInput() {
    return {
      x: this.aimVector.x,
      y: this.aimVector.y,
      isTouchAiming: Math.hypot(this.aimVector.x, this.aimVector.y) > 0.1,
      mouseScreenPos: this.mouseScreenPos
    };
  }

  getFiring() {
    return (
      this.isFiring ||
      this.isMouseDown ||
      this.keys.Space ||
      Math.hypot(this.aimVector.x, this.aimVector.y) > 0.5
    );
  }
}
