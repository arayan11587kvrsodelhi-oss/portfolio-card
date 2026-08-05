/* BorderGlow component JS (vanilla integration) */
(function () {
  function parseHSL(hslStr) {
    const match = hslStr.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/);
    if (!match) return { h: 40, s: 80, l: 80 };
    return { h: parseFloat(match[1]), s: parseFloat(match[2]), l: parseFloat(match[3]) };
  }

  function buildGlowVars(glowColor, intensity) {
    const { h, s, l } = parseHSL(glowColor);
    const base = `${h}deg ${s}% ${l}%`;
    const opacities = [100, 60, 50, 40, 30, 20, 10];
    const keys = ['', '-60', '-50', '-40', '-30', '-20', '-10'];
    const vars = {};
    for (let i = 0; i < opacities.length; i++) {
      vars[`--glow-color${keys[i]}`] = `hsl(${base} / ${Math.min(opacities[i] * intensity, 100)}%)`;
    }
    return vars;
  }

  const GRADIENT_POSITIONS = ['80% 55%', '69% 34%', '8% 6%', '41% 38%', '86% 85%', '82% 18%', '51% 4%'];
  const GRADIENT_KEYS = ['--gradient-one', '--gradient-two', '--gradient-three', '--gradient-four', '--gradient-five', '--gradient-six', '--gradient-seven'];
  const COLOR_MAP = [0, 1, 2, 0, 1, 2, 1];

  function buildGradientVars(colors) {
    const vars = {};
    for (let i = 0; i < 7; i++) {
      const c = colors[Math.min(COLOR_MAP[i], colors.length - 1)];
      vars[GRADIENT_KEYS[i]] = `radial-gradient(at ${GRADIENT_POSITIONS[i]}, ${c} 0px, transparent 50%)`;
    }
    vars['--gradient-base'] = `linear-gradient(${colors[0]} 0 100%)`;
    return vars;
  }

  function getCenterOfElement(el) {
    const { width, height } = el.getBoundingClientRect();
    return [width / 2, height / 2];
  }

  function getEdgeProximity(el, x, y) {
    const [cx, cy] = getCenterOfElement(el);
    const dx = x - cx;
    const dy = y - cy;
    let kx = Infinity;
    let ky = Infinity;
    if (dx !== 0) kx = cx / Math.abs(dx);
    if (dy !== 0) ky = cy / Math.abs(dy);
    return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
  }

  function getCursorAngle(el, x, y) {
    const [cx, cy] = getCenterOfElement(el);
    const dx = x - cx;
    const dy = y - cy;
    if (dx === 0 && dy === 0) return 0;
    const radians = Math.atan2(dy, dx);
    let degrees = radians * (180 / Math.PI) + 90;
    if (degrees < 0) degrees += 360;
    return degrees;
  }

  function attachBorderGlow(el, options = {}) {
    const cfg = Object.assign({
      edgeSensitivity: 30,
      glowColor: '40 80 80',
      backgroundColor: '#120F17',
      borderRadius: 28,
      glowRadius: 40,
      glowIntensity: 1.0,
      coneSpread: 25,
      animated: false,
      colors: ['#c084fc', '#f472b6', '#38bdf8'],
      fillOpacity: 0.5,
    }, options || {});

    const card = el;
    card.classList.add('border-glow-card');
    const inner = document.createElement('div');
    inner.className = 'border-glow-inner';
    // move children into inner
    while (card.firstChild) {
      inner.appendChild(card.firstChild);
    }
    // add edge-light element
    const edge = document.createElement('span');
    edge.className = 'edge-light';
    card.appendChild(edge);
    card.appendChild(inner);

    const glowVars = buildGlowVars(cfg.glowColor, cfg.glowIntensity);
    const gradVars = buildGradientVars(cfg.colors);

    const styleVars = Object.assign({
      '--card-bg': cfg.backgroundColor,
      '--edge-sensitivity': cfg.edgeSensitivity,
      '--border-radius': `${cfg.borderRadius}px`,
      '--glow-padding': `${cfg.glowRadius}px`,
      '--cone-spread': cfg.coneSpread,
      '--fill-opacity': cfg.fillOpacity,
    }, glowVars, gradVars);

    for (const k in styleVars) card.style.setProperty(k, styleVars[k]);

    function onPointerMove(e) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const edgeProx = getEdgeProximity(card, x, y);
      const angle = getCursorAngle(card, x, y);
      card.style.setProperty('--edge-proximity', `${(edgeProx * 100).toFixed(3)}`);
      card.style.setProperty('--cursor-angle', `${angle.toFixed(3)}deg`);
    }

    card.addEventListener('pointermove', onPointerMove);
  }

  // initialize for elements with data-border-glow attributes
  function initAuto() {
    const nodes = document.querySelectorAll('[data-border-glow]');
    nodes.forEach((node) => {
      const colors = node.getAttribute('data-colors');
      const cfg = {};
      if (colors) cfg.colors = colors.split(',').map(s => s.trim());
      attachBorderGlow(node, cfg);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuto);
  } else {
    initAuto();
  }

  // expose attach function
  window.attachBorderGlow = attachBorderGlow;
})();
