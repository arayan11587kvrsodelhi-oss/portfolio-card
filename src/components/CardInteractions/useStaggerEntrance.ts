'use client';

import { useEffect, useRef } from 'react';

/**
 * Staggered entrance animation.
 *
 * React port of the original staggered-entrance logic. Elements start with
 * `opacity: 0; translateY(18px)` and are revealed on the next frame with a
 * per-index transition delay. Uses refs + direct style writes (no state) and
 * respects `prefers-reduced-motion`.
 */
export function useStaggerEntrance(
  containerRef: React.RefObject<HTMLElement>,
  selector: string,
  { enabled, step = 0.07, base = 0.08 }: { enabled: boolean; step?: number; base?: number },
) {
  const waitRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const elements = Array.from(container.querySelectorAll<HTMLElement>(selector));
    if (elements.length === 0) return;

    if (!enabled || waitRef.current) {
      // Reduced motion: make everything immediately visible.
      elements.forEach((el) => {
        el.classList.add('animate-in');
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
        el.style.transition = 'none';
      });
      return;
    }

    elements.forEach((el, index) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(18px)';
      el.style.willChange = 'opacity, transform';
      el.style.transition = `opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * step + base
        }s, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * step + base}s`;
    });

    const timeout = window.setTimeout(() => {
      elements.forEach((el) => {
        el.classList.add('animate-in');
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      });
      // Drop will-change once the entrance is done so we don't keep layers.
      const cleanup = window.setTimeout(() => {
        elements.forEach((el) => {
          el.style.willChange = '';
        });
      }, 1200);
      return () => window.clearTimeout(cleanup);
    }, 30);

    waitRef.current = true;
    return () => window.clearTimeout(timeout);
  }, [containerRef, selector, enabled, step, base]);
}
