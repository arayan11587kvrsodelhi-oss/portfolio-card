'use client';

import { useEffect, useMemo, useRef } from 'react';

interface BorderGlowProps {
  colors?: string[];
  backgroundColor?: string;
  borderRadius?: number;
  glowColor?: string; // "H S L"
  glowRadius?: number;
  glowIntensity?: number;
  coneSpread?: number;
  fillOpacity?: number;
  edgeSensitivity?: number;
  enabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

const GRADIENT_POSITIONS = ['80% 55%', '69% 34%', '8% 6%', '41% 38%', '86% 85%', '82% 18%', '51% 4%'];
const GRADIENT_KEYS = [
  '--gradient-one',
  '--gradient-two',
  '--gradient-three',
  '--gradient-four',
  '--gradient-five',
  '--gradient-six',
  '--gradient-seven',
];
const COLOR_MAP = [0, 1, 2, 0, 1, 2, 1];

function buildGradientVars(colors: string[]): Record<string, string> {
  const vars: Record<string, string> = {};
  for (let i = 0; i < 7; i++) {
    const c = colors[Math.min(COLOR_MAP[i], colors.length - 1)];
    vars[GRADIENT_KEYS[i]] = `radial-gradient(at ${GRADIENT_POSITIONS[i]}, ${c} 0px, transparent 50%)`;
  }
  vars['--gradient-base'] = `linear-gradient(${colors[0]} 0 100%)`;
  return vars;
}

function parseHSL(hslStr: string) {
  const match = hslStr.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/);
  if (!match) return { h: 40, s: 80, l: 80 };
  return { h: parseFloat(match[1]), s: parseFloat(match[2]), l: parseFloat(match[3]) };
}

function buildGlowVars(glowColor: string, intensity: number): Record<string, string> {
  const { h, s, l } = parseHSL(glowColor);
  const base = `${h}deg ${s}% ${l}%`;
  const opacities = [100, 60, 50, 40, 30, 20, 10];
  const keys = ['', '-60', '-50', '-40', '-30', '-20', '-10'];
  const vars: Record<string, string> = {};
  for (let i = 0; i < opacities.length; i++) {
    vars[`--glow-color${keys[i]}`] = `hsl(${base} / ${Math.min(opacities[i] * intensity, 100)}%)`;
  }
  return vars;
}

/**
 * BorderGlow — React port of BorderGlow.js.
 *
 * Cursor-tracked glowing edge. The pointer math (edge proximity + cursor
 * angle) is identical to the original. Performance notes:
 *   - pointer coordinates are written straight to CSS custom properties on
 *     the element inside a single rAF tick (no React state),
 *   - the document-level pointermove listener is only attached while the
 *     pointer is actually over the card,
 *   - `enabled` lets us skip all of it on touch / reduced-motion devices.
 */
export default function BorderGlow({
  colors = ['#c084fc', '#f472b6', '#38bdf8'],
  backgroundColor = '#0c0d12',
  borderRadius = 28,
  glowColor = '40 80 80',
  glowRadius = 40,
  glowIntensity = 1.0,
  coneSpread = 25,
  fillOpacity = 0.5,
  edgeSensitivity = 30,
  enabled = true,
  className,
  children,
}: BorderGlowProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const rafId = useRef<number | null>(null);
  const pending = useRef<{ x: number; y: number } | null>(null);

  const styleVars = useMemo(
    () => ({
      '--card-bg': backgroundColor,
      '--edge-sensitivity': String(edgeSensitivity),
      '--border-radius': `${borderRadius}px`,
      '--glow-padding': `${glowRadius}px`,
      '--cone-spread': String(coneSpread),
      '--fill-opacity': String(fillOpacity),
      ...buildGlowVars(glowColor, glowIntensity),
      ...buildGradientVars(colors),
    }),
    [backgroundColor, borderRadius, coneSpread, edgeSensitivity, fillOpacity, glowIntensity, glowColor, glowRadius, colors],
  );

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    const flush = () => {
      rafId.current = null;
      const p = pending.current;
      if (!p) return;
      const rect = el.getBoundingClientRect();
      const x = p.x - rect.left;
      const y = p.y - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const dx = x - cx;
      const dy = y - cy;

      let kx = Infinity;
      let ky = Infinity;
      if (dx !== 0) kx = cx / Math.abs(dx);
      if (dy !== 0) ky = cy / Math.abs(dy);
      const edgeProximity = Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);

      let angle = 0;
      if (!(dx === 0 && dy === 0)) {
        let degrees = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
        if (degrees < 0) degrees += 360;
        angle = degrees;
      }

      el.style.setProperty('--edge-proximity', (edgeProximity * 100).toFixed(3));
      el.style.setProperty('--cursor-angle', `${angle.toFixed(3)}deg`);
    };

    const onMove = (e: PointerEvent) => {
      pending.current = { x: e.clientX, y: e.clientY };
      if (rafId.current === null) rafId.current = window.requestAnimationFrame(flush);
    };

    const onEnter = () => {
      el.classList.add('sweep-active');
      document.addEventListener('pointermove', onMove, { passive: true });
    };

    const onLeave = () => {
      el.classList.remove('sweep-active');
      document.removeEventListener('pointermove', onMove);
      pending.current = null;
      if (rafId.current !== null) {
        window.cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
    };

    el.addEventListener('pointerenter', onEnter);
    el.addEventListener('pointerleave', onLeave);

    return () => {
      el.removeEventListener('pointerenter', onEnter);
      el.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('pointermove', onMove);
      if (rafId.current !== null) window.cancelAnimationFrame(rafId.current);
      rafId.current = null;
      pending.current = null;
    };
  }, [enabled]);

  return (
    <div
      ref={ref}
      className={`border-glow-card ${className ?? ''}`}
      style={styleVars as React.CSSProperties}
    >
      <span className="edge-light" aria-hidden="true" />
      <div className="border-glow-inner">{children}</div>
    </div>
  );
}
