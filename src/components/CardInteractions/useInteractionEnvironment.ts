'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Detects `(hover: hover) and (pointer: fine)` and
 * `(prefers-reduced-motion: reduce)` reactively.
 *
 * Both values are needed by every interaction hook, so we centralise them
 * and always return `false` on the server (first paint) to avoid hydration
 * mismatches — effects only run after mount.
 */
export function useInteractionEnvironment() {
  const [supportsHover, setSupportsHover] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const hoverQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const syncHover = () => setSupportsHover(hoverQuery.matches);
    const syncMotion = () => setPrefersReducedMotion(motionQuery.matches);

    syncHover();
    syncMotion();

    hoverQuery.addEventListener('change', syncHover);
    motionQuery.addEventListener('change', syncMotion);
    return () => {
      hoverQuery.removeEventListener('change', syncHover);
      motionQuery.removeEventListener('change', syncMotion);
    };
  }, []);

  return { supportsHover, prefersReducedMotion };
}

/** Tracks page visibility so expensive loops can pause when hidden. */
export function usePageVisible() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const onChange = () => setVisible(!document.hidden);
    onChange();
    document.addEventListener('visibilitychange', onChange);
    return () => document.removeEventListener('visibilitychange', onChange);
  }, []);

  return visible;
}

/**
 * Cross-instance shared animation ticker.
 *
 * Instead of every interactive element running its own rAF loop, all of
 * them subscribe to a single ticker which only runs while the page is
 * visible AND there is at least one active subscriber. This keeps GPU/CPU
 * work bounded and guarantees loops pause when the tab is hidden.
 */
type FrameCallback = (deltaMs: number, elapsedMs: number) => void;

class AnimationTicker {
  private callbacks = new Set<FrameCallback>();
  private rafId: number | null = null;
  private lastTime = 0;
  private elapsed = 0;
  private visibilityBound = false;

  subscribe(cb: FrameCallback): () => void {
    this.callbacks.add(cb);
    this.bindVisibility();
    this.start();
    return () => {
      this.callbacks.delete(cb);
      if (this.callbacks.size === 0) this.stop();
    };
  }

  private bindVisibility() {
    if (this.visibilityBound || typeof document === 'undefined') return;
    this.visibilityBound = true;
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.stop();
      else if (this.callbacks.size > 0) this.start();
    });
  }

  private start() {
    if (this.rafId !== null || typeof window === 'undefined') return;
    this.lastTime = performance.now();
    this.rafId = window.requestAnimationFrame(this.tick);
  }

  private stop() {
    if (this.rafId !== null) {
      window.cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private tick = (time: number) => {
    const delta = Math.min(time - this.lastTime, 64);
    this.lastTime = time;
    this.elapsed += delta;

    for (const cb of this.callbacks) cb(delta, this.elapsed);

    if (this.callbacks.size > 0) {
      this.rafId = window.requestAnimationFrame(this.tick);
    } else {
      this.rafId = null;
    }
  };
}

let sharedTicker: AnimationTicker | null = null;

export function getAnimationTicker(): AnimationTicker {
  if (!sharedTicker) sharedTicker = new AnimationTicker();
  return sharedTicker;
}

/** Runs a callback on every shared ticker frame while mounted. */
export function useAnimationFrame(callback: FrameCallback, enabled = true) {
  const cbRef = useRef(callback);
  cbRef.current = callback;

  useEffect(() => {
    if (!enabled) return;
    const ticker = getAnimationTicker();
    return ticker.subscribe((delta, elapsed) => cbRef.current(delta, elapsed));
  }, [enabled]);
}
