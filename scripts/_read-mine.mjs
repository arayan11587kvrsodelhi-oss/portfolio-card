export default async function run(page) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  return page.evaluate(() => {
    const q = (s) => document.querySelector(s);
    const rect = (s) => {
      const el = q(s);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top) };
    };
    const cs = (s, prop) => {
      const el = q(s);
      return el ? getComputedStyle(el)[prop] : null;
    };
    return {
      card: rect('.card'),
      cardPadding: cs('.card', 'padding'),
      cardBorder: cs('.card', 'borderWidth'),
      borderGlowInnerPadd: cs('.border-glow-inner', 'padding'),
      ebContentPadd: cs('.eb-content', 'padding'),
      electricBorderPadd: cs('.electric-border', 'padding'),
      tiltTargetPadd: cs('.tilt-target', 'padding'),
      headerH: rect('.card-header'),
      headerMarginBottom: cs('.card-header', 'marginBottom'),
      profileHeroH: rect('.profile-hero'),
      profileHeroMargin: cs('.profile-hero', 'marginBottom'),
      skillsH: rect('.skills-section'),
      skillsMargin: cs('.skills-section', 'marginBottom'),
      infoH: rect('.info-section'),
      infoMargin: cs('.info-section', 'marginBottom'),
      contactH: rect('.contact'),
      contactMargin: cs('.contact', 'marginBottom'),
      socialsH: rect('.socials'),
      socialsMargin: cs('.socials', 'marginBottom'),
      ctaH: rect('.cta-section'),
      infoColumns: cs('.info-section', 'gridTemplateColumns'),
      ctaColumns: cs('.cta-section', 'gridTemplateColumns'),
    };
  });
}
