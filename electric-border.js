class ElectricBorder {
  constructor(element, options = {}) {
    this.element = element;
    this.color = options.color || '#7df9ff';
    this.speed = options.speed || 1;
    this.chaos = options.chaos || 0.12;
    this.borderRadius = options.borderRadius || 24;
    this.canvas = null;
    this.ctx = null;
    this.frame = null;
    this.time = 0;
    this.lastTime = 0;
    this.init();
  }

  init() {
    this.element.style.setProperty('--electric-border-color', this.color);
    this.element.classList.add('electric-border');

    const container = document.createElement('div');
    container.className = 'eb-canvas-container';
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'eb-canvas';
    container.appendChild(this.canvas);
    this.element.appendChild(container);

    this.ctx = this.canvas.getContext('2d');
    this.resize();
    this.animate();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    if (!this.canvas || !this.ctx) return;
    const rect = this.element.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  random(x) {
    return (Math.sin(x * 12.9898) * 43758.5453) % 1;
  }

  noise2D(x, y) {
    const i = Math.floor(x);
    const j = Math.floor(y);
    const fx = x - i;
    const fy = y - j;
    const a = this.random(i + j * 57);
    const b = this.random(i + 1 + j * 57);
    const c = this.random(i + (j + 1) * 57);
    const d = this.random(i + 1 + (j + 1) * 57);
    const ux = fx * fx * (3 - 2 * fx);
    const uy = fy * fy * (3 - 2 * fy);
    return a * (1 - ux) * (1 - uy) + b * ux * (1 - uy) + c * (1 - ux) * uy + d * ux * uy;
  }

  octavedNoise(x, octaves, lacunarity, gain, amplitude, frequency, time, seed, baseFlatness) {
    let y = 0;
    let currentAmplitude = amplitude;
    let currentFrequency = frequency;
    for (let i = 0; i < octaves; i++) {
      let octaveAmplitude = currentAmplitude;
      if (i === 0) octaveAmplitude *= baseFlatness;
      y += octaveAmplitude * this.noise2D(currentFrequency * x + seed * 100, time * currentFrequency * 0.3);
      currentFrequency *= lacunarity;
      currentAmplitude *= gain;
    }
    return y;
  }

  getCornerPoint(centerX, centerY, radius, startAngle, arcLength, progress) {
    const angle = startAngle + progress * arcLength;
    return { x: centerX + radius * Math.cos(angle), y: centerY + radius * Math.sin(angle) };
  }

  getRoundedRectPoint(t, left, top, width, height, radius) {
    const straightWidth = width - 2 * radius;
    const straightHeight = height - 2 * radius;
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
      return this.getCornerPoint(left + width - radius, top + radius, radius, -Math.PI / 2, Math.PI / 2, progress);
    }
    accumulated += cornerArc;

    if (distance <= accumulated + straightHeight) {
      const progress = (distance - accumulated) / straightHeight;
      return { x: left + width, y: top + radius + progress * straightHeight };
    }
    accumulated += straightHeight;

    if (distance <= accumulated + cornerArc) {
      const progress = (distance - accumulated) / cornerArc;
      return this.getCornerPoint(left + width - radius, top + height - radius, radius, 0, Math.PI / 2, progress);
    }
    accumulated += cornerArc;

    if (distance <= accumulated + straightWidth) {
      const progress = (distance - accumulated) / straightWidth;
      return { x: left + width - radius - progress * straightWidth, y: top + height };
    }
    accumulated += straightWidth;

    if (distance <= accumulated + cornerArc) {
      const progress = (distance - accumulated) / cornerArc;
      return this.getCornerPoint(left + radius, top + height - radius, radius, Math.PI / 2, Math.PI / 2, progress);
    }
    accumulated += cornerArc;

    if (distance <= accumulated + straightHeight) {
      const progress = (distance - accumulated) / straightHeight;
      return { x: left, y: top + height - radius - progress * straightHeight };
    }
    accumulated += straightHeight;

    const progress = (distance - accumulated) / cornerArc;
    return this.getCornerPoint(left + radius, top + radius, radius, Math.PI, Math.PI / 2, progress);
  }

  animate(currentTime = 0) {
    if (!this.ctx || !this.canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = this.element.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const delta = (currentTime - this.lastTime) / 1000 || 0.016;
    this.time += delta * this.speed;
    this.lastTime = currentTime;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.ctx.strokeStyle = this.color;
    this.ctx.lineWidth = 1;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    const padding = 10;
    const left = padding;
    const top = padding;
    const borderWidth = width - padding * 2;
    const borderHeight = height - padding * 2;
    const maxRadius = Math.min(borderWidth, borderHeight) / 2;
    const radius = Math.min(this.borderRadius, maxRadius);
    const approxPerimeter = 2 * (borderWidth + borderHeight) + 2 * Math.PI * radius;
    const sampleCount = Math.floor(approxPerimeter / 2);

    this.ctx.beginPath();
    for (let i = 0; i <= sampleCount; i++) {
      const progress = i / sampleCount;
      const point = this.getRoundedRectPoint(progress, left, top, borderWidth, borderHeight, radius);
      const xNoise = this.octavedNoise(progress * 8, 10, 1.6, 0.7, this.chaos, 10, this.time, 0, 0);
      const yNoise = this.octavedNoise(progress * 8, 10, 1.6, 0.7, this.chaos, 10, this.time, 1, 0);
      const displacedX = point.x + xNoise * 60;
      const displacedY = point.y + yNoise * 60;
      if (i === 0) this.ctx.moveTo(displacedX, displacedY);
      else this.ctx.lineTo(displacedX, displacedY);
    }
    this.ctx.closePath();
    this.ctx.stroke();

    this.frame = window.requestAnimationFrame((t) => this.animate(t));
  }
}

window.ElectricBorder = ElectricBorder;

window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-electric-border]').forEach((el) => {
    if (el.querySelector('.eb-canvas-container')) return;
    new ElectricBorder(el, {
      color: el.dataset.color || '#7df9ff',
      speed: parseFloat(el.dataset.speed || '1'),
      chaos: parseFloat(el.dataset.chaos || '0.12'),
      borderRadius: parseFloat(el.dataset.radius || '24')
    });
  });
});
