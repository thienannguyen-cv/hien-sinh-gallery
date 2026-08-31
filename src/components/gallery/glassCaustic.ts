import { useCallback, useEffect, useRef } from 'react';
import type { PointerEventHandler } from 'react';

const ORBIT_DURATION_MS = 22_000;
const POINTER_MIN = 14;
const POINTER_MAX = 86;
const POINTER_INFLUENCE = 0.48;
const ORBIT_KEYFRAMES = [
  { at: 0, x: 25, y: 20 },
  { at: 0.30, x: 65, y: 35 },
  { at: 0.60, x: 45, y: 70 },
  { at: 1, x: 25, y: 20 },
] as const;

interface PointerState {
  inside: boolean;
  x: number;
  y: number;
  previousX: number;
  previousY: number;
  previousAt: number;
  lastMotionAt: number;
  motionStrength: number;
}

interface UseGlassCausticOptions {
  phaseOffset?: number;
}

const clampPointer = (value: number) => Math.min(POINTER_MAX, Math.max(POINTER_MIN, value));

const naturalOrbit = (elapsedMs: number, phaseOffset: number) => {
  const progress = ((elapsedMs / ORBIT_DURATION_MS) + phaseOffset) % 1;
  const nextIndex = ORBIT_KEYFRAMES.findIndex(keyframe => keyframe.at >= progress);
  const endIndex = nextIndex <= 0 ? 1 : nextIndex;
  const start = ORBIT_KEYFRAMES[endIndex - 1];
  const end = ORBIT_KEYFRAMES[endIndex];
  const segmentProgress = (progress - start.at) / (end.at - start.at);
  const eased = segmentProgress * segmentProgress * (3 - (2 * segmentProgress));

  return {
    x: start.x + ((end.x - start.x) * eased),
    y: start.y + ((end.y - start.y) * eased),
  };
};

export const useGlassCaustic = ({ phaseOffset = 0 }: UseGlassCausticOptions = {}) => {
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const pointerRef = useRef<PointerState>({
    inside: false,
    x: 50,
    y: 42,
    previousX: 50,
    previousY: 42,
    previousAt: 0,
    lastMotionAt: 0,
    motionStrength: 0,
  });

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reducedMotion.matches) return;

    const startedAt = performance.now();
    const initial = naturalOrbit(0, phaseOffset);
    let x = initial.x;
    let y = initial.y;
    let velocityX = 0;
    let velocityY = 0;
    let attention = 0;
    let previousFrameAt = startedAt;
    let frameId = 0;

    const renderFrame = (now: number) => {
      const dt = Math.min((now - previousFrameAt) / 1000, 0.035);
      previousFrameAt = now;

      const pointer = pointerRef.current;
      const idleSeconds = pointer.lastMotionAt > 0
        ? Math.max(0, (now - pointer.lastMotionAt) / 1000)
        : Number.POSITIVE_INFINITY;
      const attentionDrive = pointer.inside
        ? pointer.motionStrength * Math.exp(-idleSeconds / 0.52)
        : 0;

      // Attention itself eases continuously. Pointer input changes force, never position.
      const attentionResponse = 1 - Math.exp(-dt / 0.30);
      attention += (attentionDrive - attention) * attentionResponse;

      const orbit = naturalOrbit(now - startedAt, phaseOffset);
      const influence = attention * POINTER_INFLUENCE;
      const targetX = orbit.x + ((pointer.x - orbit.x) * influence);
      const targetY = orbit.y + ((pointer.y - orbit.y) * influence);

      // Critically damped attraction preserves continuous position and velocity.
      const angularResponse = 1.85;
      const dampingRatio = 0.96;
      const accelerationX = (angularResponse ** 2 * (targetX - x))
        - (2 * dampingRatio * angularResponse * velocityX);
      const accelerationY = (angularResponse ** 2 * (targetY - y))
        - (2 * dampingRatio * angularResponse * velocityY);

      velocityX += accelerationX * dt;
      velocityY += accelerationY * dt;
      x += velocityX * dt;
      y += velocityY * dt;

      const caustic = surfaceRef.current?.querySelector<HTMLElement>('[data-glass-caustic]');
      if (caustic) {
        caustic.style.setProperty('--caustic-x', `${x.toFixed(3)}%`);
        caustic.style.setProperty('--caustic-y', `${y.toFixed(3)}%`);
      }

      frameId = requestAnimationFrame(renderFrame);
    };

    frameId = requestAnimationFrame(renderFrame);
    return () => cancelAnimationFrame(frameId);
  }, [phaseOffset]);

  const onPointerMove = useCallback<PointerEventHandler<HTMLDivElement>>(event => {
    if (event.pointerType === 'touch') return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const now = performance.now();
    const x = clampPointer(((event.clientX - bounds.left) / bounds.width) * 100);
    const y = clampPointer(((event.clientY - bounds.top) / bounds.height) * 100);
    const pointer = pointerRef.current;
    const elapsed = pointer.previousAt > 0 ? Math.max((now - pointer.previousAt) / 1000, 1 / 240) : 0;
    const distance = Math.hypot(x - pointer.previousX, y - pointer.previousY);
    const speed = elapsed > 0 ? distance / elapsed : 0;

    pointer.inside = true;
    pointer.x = x;
    pointer.y = y;
    pointer.previousX = x;
    pointer.previousY = y;
    pointer.previousAt = now;

    if (distance > 0.04) {
      pointer.lastMotionAt = now;
      pointer.motionStrength = Math.min(1, Math.max(0.18, speed / 72));
    }
  }, []);

  const onPointerLeave = useCallback<PointerEventHandler<HTMLDivElement>>(() => {
    pointerRef.current.inside = false;
  }, []);

  return { surfaceRef, onPointerMove, onPointerLeave };
};
