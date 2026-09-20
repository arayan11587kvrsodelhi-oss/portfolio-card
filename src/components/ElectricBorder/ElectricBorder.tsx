'use client';

import { useEffect, useRef } from 'react';
import styles from './ElectricBorder.module.css';

interface ElectricBorderProps {
  color?: string;
  speed?: number;
  chaos?: number;
  borderRadius?: number;
  /** Pause the canvas loop (e.g. reduced motion). */
  paused?: boolean;
  children: React.ReactNode;
}

/**
 * ElectricBorder — React port of electric-border.js.
 *
 * The animated lightning border is drawn on a canvas using the same
 * octaved-noise displacement math as the original. Improvements over the
 * vanilla version:
 *   - the rAF loop is registered once and cancelled on unmount,
 *   - it pauses when the page is hidden, when paused, or when reduced
 *     motion is requested,
 *   - resize is handled by a single ResizeObserver instead of a window
 *     listener plus per-frame getBoundingClientRect.
 */
export default function ElectricBorder({
  color = '#7df9ff',
  speed = 1,
  chaos = 0.12,
  borderRadius = 24,
  paused = false,
  children,
}: ElectricBorderProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let time = 0;
    let lastTime = 0;
    let rafId: number | null = null;
    let running = !paused;

    const rand = (x: number) => {
      const v = Math.sin(x * 12.9898) * 43758.5453;
      return v - Math.floor(v);
    };

    const noise2D = (x: number, y: number) => {
      const i = Math.floor(x);
      const j = Math.floor(y);
      const fx = x - i;
      const fy = y - j;
      const a = rand(i + j * 57);
      const b = rand(i + 1 + j * 57);
      const c = rand(i + (j + 1) * 57);
      const d = rand(i + 1 + (j + 1) * 57);
      const ux = fx * fx * (3 - 2 * fx);
      const uy = fy * fy * (3 - 2 * fy);
      return a * (1 - ux) * (1 - uy) + b * ux * (1 - uy) + c * (1 - ux) * uy + d * ux * uy;
    };

    const octavedNoise = (
      x: number,
      octaves: number,
      lacunarity: number,
      gain: number,
      amplitude: number,
      frequency: number,
      t: number,
      seed: number,
      baseFlatness: number,
    ) => {
      let y = 0;
      let currentAmplitude = amplitude;
      let currentFrequency = frequency;
      for (let i = 0; i < octaves; i++) {
        let octaveAmplitude = currentAmplitude;
        if (i === 0) octaveAmplitude *= baseFlatness;
        y += octaveAmplitude * noise2D(currentFrequency * x + seed * 100, t * currentFrequency * 0.3);
        currentFrequency *= lacunarity;
        currentAmplitude *= gain;
      }
      return y;
    };

    const cornerPoint = (
      cx: number,
      cy: number,
      radius: number,
      startAngle: number,
      arcLength: number,
      progress: number,
    ) => ({
      x: cx + radius * Math.cos(startAngle + progress * arcLength),
      y: cy + radius * Math.sin(startAngle + progress * arcLength),
    });

    const roundedRectPoint = (
      t: number,
      left: number,
      top: number,
      w: number,
      h: number,
      radius: number,
    ) => {
      const straightWidth = w - 2 * radius;
      const straightHeight = h - 2 * radius;
      const cornerArc = (Math.PI * radius) / 2;
      const totalPerimeter = 2 * straightWidth + 2 * straightHeight + 4 * cornerArc;
      const distance = t * totalPerimeter;
      let accumulated = 0;

      if (distance <= accumulated + straightWidth) {
        const progress = (distance - accumulated) / straightWidth;
        return { x: left + radius + progress * straightWidth, y: top };
      }
      accumulated += straightWidth;

      if (distance <= accumulated + cornerArc) {
        const progress = (distance - accumulated) / cornerArc;
        return cornerPoint(left + w - radius, top + radius, radius, -Math.PI / 2, Math.PI / 2, progress);
      }
      accumulated += cornerArc;

      if (distance <= accumulated + straightHeight) {
        const progress = (distance - accumulated) / straightHeight;
        return { x: left + w, y: top + radius + progress * straightHeight };
      }
      accumulated += straightHeight;

      if (distance <= accumulated + cornerArc) {
        const progress = (distance - accumulated) / cornerArc;
        return cornerPoint(left + w - radius, top + h - radius, radius, 0, Math.PI / 2, progress);
      }
      accumulated += cornerArc;

      if (distance <= accumulated + straightWidth) {
        const progress = (distance - accumulated) / straightWidth;
        return { x: left + w - radius - progress * straightWidth, y: top + h };
      }
      accumulated += straightWidth;

      if (distance <= accumulated + cornerArc) {
        const progress = (distance - accumulated) / cornerArc;
        return cornerPoint(left + radius, top + h - radius, radius, Math.PI / 2, Math.PI / 2, progress);
      }
      accumulated += cornerArc;

      if (distance <= accumulated + straightHeight) {
        const progress = (distance - accumulated) / straightHeight;
        return { x: left, y: top + h - radius - progress * straightHeight };
      }
      accumulated += straightHeight;

      const progress = (distance - accumulated) / cornerArc;
      return cornerPoint(left + radius, top + radius, radius, Math.PI, Math.PI / 2, progress);
    };

    const resize = () => {
      const rect = host.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (currentTime: number) => {
      rafId = null;
      const delta = lastTime ? (currentTime - lastTime) / 1000 : 0.016;
      lastTime = currentTime;
      time += delta * speed;

      if (width === 0 || height === 0) resize();
      if (width === 0 || height === 0) {
        if (running) rafId = window.requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const padding = 10;
      const left = padding;
      const top = padding;
      const bw = width - padding * 2;
      const bh = height - padding * 2;
      const maxRadius = Math.min(bw, bh) / 2;
      const radius = Math.min(borderRadius, maxRadius);
      const approxPerimeter = 2 * (bw + bh) + 2 * Math.PI * radius;
      const sampleCount = Math.floor(approxPerimeter / 2);

      ctx.beginPath();
      for (let i = 0; i <= sampleCount; i++) {
        const progress = i / sampleCount;
        const point = roundedRectPoint(progress, left, top, bw, bh, radius);
        const xNoise = octavedNoise(progress * 8, 10, 1.6, 0.7, chaos, 10, time, 0, 0);
        const yNoise = octavedNoise(progress * 8, 10, 1.6, 0.7, chaos, 10, time, 1, 0);
        const dx = point.x + xNoise * 60;
        const dy = point.y + yNoise * 60;
        if (i === 0) ctx.moveTo(dx, dy);
        else ctx.lineTo(dx, dy);
      }
      ctx.closePath();
      ctx.stroke();

      if (running) rafId = window.requestAnimationFrame(draw);
    };

    const start = () => {
      if (rafId !== null || !running) return;
      lastTime = 0;
      rafId = window.requestAnimationFrame(draw);
    };

    const stop = () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    resize();
    start();

    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      running = false;
      stop();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
    // Re-run only when the animation parameters change.
  }, [color, speed, chaos, borderRadius, paused]);

  return (
    <div
      ref={hostRef}
      className={`${styles['electric-border']} electric-border`}
      style={{ ['--electric-border-color' as string]: color, borderRadius: `${borderRadius}px` }}
    >
      <div className={`${styles['eb-canvas-container']} eb-canvas-container`} aria-hidden="true">
        <canvas ref={canvasRef} className={`${styles['eb-canvas']} eb-canvas`} />
      </div>
      {children}
    </div>
  );
}
