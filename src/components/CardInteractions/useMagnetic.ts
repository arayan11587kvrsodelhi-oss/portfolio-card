'use client';

import { useCallback, useEffect, useRef } from 'react';

/**
 * Magnetic interaction for buttons / social links / info cards / skill pills.
 *
 * A React port of the original magnetic logic. Listens once on a container
 * and uses event delegation + a rAF-flushed transform, so pointer movement
 * never causes a React re-render and we register a single set of listeners
 * instead of one per element.
 */
export function useMagnetic(enabled: boolean, selector: string, strength = 0.2) {
  const containerRef = useRef<HTMLElement | null>(null);
  const rafId = useRef<number | null>(null);
  const active = useRef<{ el: HTMLElement; x: number; y: number } | null>(null);

  const flush = useCallback(() => {
    rafId.current = null;
    const current = active.current;
    if (!current) return;
    const { el, x, y } = current;
    el.style.transform = `translate3d(${(x * strength).toFixed(2)}px, ${(y * strength).toFixed(2)}px, 0px)`;
  }, [strength]);

  const schedule = useCallback(() => {
    if (rafId.current === null) rafId.current = window.requestAnimationFrame(flush);
  }, [flush]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled) return;

    const findTarget = (node: EventTarget | null): HTMLElement | null => {
      if (!(node instanceof Element)) return null;
      return node.closest(selector) as HTMLElement | null;
    };

    const onPointerOver = (e: PointerEvent) => {
      const el = findTarget(e.target);
      if (!el) return;
      el.style.transition = 'none';
    };

    const onPointerMove = (e: PointerEvent) => {
      const el = findTarget(e.target);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);
      active.current = { el, x, y };
      schedule();
    };

    const onPointerOut = (e: PointerEvent) => {
      const el = findTarget(e.target);
      if (!el) return;
      const related = e.relatedTarget;
      // Only reset when actually leaving the magnetic element.
      if (related instanceof Node && el.contains(related)) return;
      if (active.current?.el === el) active.current = null;
      el.style.transform = 'translate3d(0px, 0px, 0px)';
      el.style.transition = 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
    };

    container.addEventListener('pointerover', onPointerOver);
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerout', onPointerOut);

    return () => {
      container.removeEventListener('pointerover', onPointerOver);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerout', onPointerOut);
      if (rafId.current !== null) window.cancelAnimationFrame(rafId.current);
      rafId.current = null;
      active.current = null;
    };
  }, [enabled, selector, schedule]);

  return containerRef;
}
