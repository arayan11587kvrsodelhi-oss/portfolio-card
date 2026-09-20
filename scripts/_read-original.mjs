// Reads computed geometry/typography from the ORIGINAL live site for comparison.
export default async function run(page) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  return page.evaluate(() => {
    const q = (s) => document.querySelector(s);
    const rect = (s) => {
      const el = q(s);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top), left: Math.round(r.left) };
    };
    const cs = (s, prop) => {
      const el = q(s);
      return el ? getComputedStyle(el)[prop] : null;
    };
    return {
      card: rect('.card'),
      cardPadding: cs('.card', 'padding'),
      cardMaxWidth: cs('.card', 'maxWidth'),
      cardRadius: cs('.card', 'borderRadius'),
      nameFontSize: cs('.name', 'fontSize'),
      nameFontWeight: cs('.name', 'fontWeight'),
      descFontSize: cs('.description', 'fontSize'),
      descMaxWidth: cs('.description', 'maxWidth'),
      titleFontSize: cs('.title-badge', 'fontSize'),
      skillFontSize: cs('.skill-pill', 'fontSize'),
      skillPadding: cs('.skill-pill', 'padding'),
      infoColumns: cs('.info-section', 'gridTemplateColumns'),
      ctaColumns: cs('.cta-section', 'gridTemplateColumns'),
      socialSize: cs('.social-link', 'width'),
      ctaPadding: cs('.btn', 'padding'),
      statusFontSize: cs('.status-text', 'fontSize'),
      bodyBg: cs('body', 'backgroundColor'),
    };
  });
}
