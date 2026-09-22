import { useRef, useCallback } from 'react';

/**
 * useCuratorScroll
 *
 * Provides unified desktop wheel and mobile touch gesture scrolling for Curator dialogue threads.
 * Resolves the issue where pointerEvents: 'none' on the dialogue container (set to allow mouse
 * pass-through to underlying cards and artwork) prevents native mobile touch scrolling.
 *
 * Supports:
 * - Desktop mouse wheel forwarding
 * - 1-finger vertical touch pan tracking
 * - Inertial momentum fling on touchend with smooth decay
 * - Unimpeded tap/click pass-through for buttons, cards, and inputs
 */
export function useCuratorScroll(containerRef: React.RefObject<HTMLDivElement | null>) {
  const touchStartY = useRef<number | null>(null);
  const touchLastY = useRef<number | null>(null);
  const touchLastTime = useRef<number>(0);
  const velocityY = useRef<number>(0);
  const momentumRafId = useRef<number | null>(null);

  const stopMomentum = useCallback(() => {
    if (momentumRafId.current !== null) {
      cancelAnimationFrame(momentumRafId.current);
      momentumRafId.current = null;
    }
  }, []);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      stopMomentum();
      if (containerRef.current) {
        containerRef.current.scrollTop += e.deltaY;
      }
    },
    [containerRef, stopMomentum]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      // Do not hijack touch if user is interacting with text inputs or textareas
      const target = e.target as HTMLElement | null;
      if (target && target.closest('input, textarea')) {
        return;
      }

      stopMomentum();
      if (e.touches.length === 1) {
        const y = e.touches[0].clientY;
        touchStartY.current = y;
        touchLastY.current = y;
        touchLastTime.current = performance.now();
        velocityY.current = 0;
      }
    },
    [stopMomentum]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest('input, textarea')) {
        return;
      }

      if (touchLastY.current !== null && e.touches.length === 1 && containerRef.current) {
        const currentY = e.touches[0].clientY;
        const now = performance.now();
        const deltaY = touchLastY.current - currentY;
        const dt = now - touchLastTime.current;

        containerRef.current.scrollTop += deltaY;

        if (dt > 0) {
          const instantV = deltaY / dt;
          velocityY.current = 0.75 * instantV + 0.25 * velocityY.current;
        }

        touchLastY.current = currentY;
        touchLastTime.current = now;
      }
    },
    [containerRef]
  );

  const handleTouchEnd = useCallback(() => {
    touchStartY.current = null;
    touchLastY.current = null;

    let v = velocityY.current;
    // Apply inertial momentum if velocity exceeds threshold
    if (Math.abs(v) > 0.08 && containerRef.current) {
      const decay = 0.94;
      const step = () => {
        if (!containerRef.current || Math.abs(v) < 0.01) {
          momentumRafId.current = null;
          return;
        }
        containerRef.current.scrollTop += v * 16;
        v *= decay;
        momentumRafId.current = requestAnimationFrame(step);
      };
      momentumRafId.current = requestAnimationFrame(step);
    }
  }, [containerRef]);

  return {
    handleWheel,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleTouchCancel: handleTouchEnd,
  };
}
