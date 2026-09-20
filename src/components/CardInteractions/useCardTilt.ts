'use client';

import { useCallback, useEffect, useRef } from 'react';

export interface TiltState {
  rotateX: number;
  rotateY: number;
  /** Light position as percentages of the card box. */
  shineX: number;
  shineY: number;
}

/**
 * 3D tilt + dynamic light reflection.
 *
 * A React port of the original `card-interactions.js` tilt logic.
 * Pointer coordinates are NEVER stored in React state — they live in a ref
 * and are flushed to the DOM inside a single rAF tick so card movement
 * cannot trigger a re-render.
 */
export function useCardTilt(enabled: boolean) {
  const ref = useRef<HTMLDivElement | null>(null);
  const state = useRef<TiltState>({ rotateX: 0, rotateY: 0, shineX: 50, shineY: 50 });
  const rafId = useRef<number | null>(null);
  const target = useRef<TiltState | null>(null);
  const shineEl = useRef<HTMLDivElement | null>(null);

  const bindShine = useCallback((el: HTMLDivElement | null) => {
    shineEl.current = el;
  }, []);

  useEffect(() => {
    const card = ref.current;
    if (!card || !enabled) return;

    const MAX_DEG = 6;

    const flush = () => {
      rafId.current = null;
      const t = target.current;
      if (!t) return;

      const s = state.current;
      // Light interpolation for a smooth, non-jittery follow.
      s.rotateX += (t.rotateX - s.rotateX) * 0.18;
      s.rotateY += (t.rotateY - s.rotateY) * 0.18;
      s.shineX += (t.shineX - s.shineX) * 0.18;
      s.shineY += (t.shineY - s.shineY) * 0.18;

      card.style.transform = `perspective(1000px) rotateX(${s.rotateX.toFixed(2)}deg) rotateY(${s.rotateY.toFixed(2)}deg) translateZ(8px)`;

      const shine = shineEl.current;
      if (shine) {
        shine.style.background = `radial-gradient(circle at ${s.shineX.toFixed(1)}% ${s.shineY.toFixed(1)}%, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 40%, transparent 70%)`;
        shine.style.opacity = '1';
      }

      // Keep animating while we still have distance to cover, then stop.
      const settled =
        Math.abs(t.rotateX - s.rotateX) < 0.01 &&
        Math.abs(t.rotateY - s.rotateY) < 0.01 &&
        Math.abs(t.shineX - s.shineX) < 0.1 &&
        Math.abs(t.shineY - s.shineY) < 0.1;

      if (!settled) {
        rafId.current = window.requestAnimationFrame(flush);
      }
    };

    const schedule = () => {
      if (rafId.current === null) rafId.current = window.requestAnimationFrame(flush);
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      target.current = {
        rotateX: ((y - centerY) / centerY) * -MAX_DEG,
        rotateY: ((x - centerX) / centerX) * MAX_DEG,
        shineX: (x / rect.width) * 100,
        shineY: (y / rect.height) * 100,
      };
      schedule();
    };

    const onPointerEnter = () => {
      card.style.transition = 'transform 0.1s ease-out, box-shadow 0.3s ease';
    };

    const onPointerLeave = () => {
      target.current = { rotateX: 0, rotateY: 0, shineX: 50, shineY: 50 };
      card.style.transition = 'transform 0.5s ease, box-shadow 0.5s ease';
      schedule();
      if (shineEl.current) shineEl.current.style.opacity = '0';
    };

    card.addEventListener('pointerenter', onPointerEnter);
    card.addEventListener('pointermove', onPointerMove);
    card.addEventListener('pointerleave', onPointerLeave);

    return () => {
      card.removeEventListener('pointerenter', onPointerEnter);
      card.removeEventListener('pointermove', onPointerMove);
      card.removeEventListener('pointerleave', onPointerLeave);
      if (rafId.current !== null) window.cancelAnimationFrame(rafId.current);
      rafId.current = null;
      target.current = null;
      // Reset any applied transform when the interaction is disabled/unmounted.
      card.style.transform = '';
      if (shineEl.current) shineEl.current.style.opacity = '0';
    };
  }, [enabled]);

  return { ref, bindShine };
}
