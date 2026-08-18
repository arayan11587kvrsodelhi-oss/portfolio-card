(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const card = document.querySelector('.card');
    const shine = document.querySelector('.card-shine');
    const magneticBtns = document.querySelectorAll('.cta-btn, .social-link, .info-card, .skill-pill');

    if (!card) return;

    // Check motion and hover support
    const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Desktop 3D Tilt & Light Reflection
    if (supportsHover && !prefersReducedMotion) {
      let rafId = null;

      function updateCardTransform(e) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -6;
        const rotateY = ((x - centerX) / centerX) * 6;

        const mouseXPercent = (x / rect.width) * 100;
        const mouseYPercent = (y / rect.height) * 100;

        if (rafId) cancelAnimationFrame(rafId);

        rafId = requestAnimationFrame(() => {
          card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(8px)`;
          if (shine) {
            shine.style.background = `radial-gradient(circle at ${mouseXPercent.toFixed(1)}% ${mouseYPercent.toFixed(1)}%, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.02) 40%, transparent 70%)`;
            shine.style.opacity = '1';
          }
        });
      }

      function resetCardTransform() {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
          card.style.transition = 'transform 0.5s ease, box-shadow 0.5s ease';
          if (shine) {
            shine.style.opacity = '0';
          }
        });
      }

      card.addEventListener('pointerenter', () => {
        card.style.transition = 'transform 0.1s ease-out, box-shadow 0.3s ease';
      });

      card.addEventListener('pointermove', updateCardTransform);
      card.addEventListener('pointerleave', resetCardTransform);
    }

    // 2. Magnetic Interactions for Buttons and Cards
    if (supportsHover && !prefersReducedMotion) {
      magneticBtns.forEach((btn) => {
        btn.addEventListener('pointermove', (e) => {
          const rect = btn.getBoundingClientRect();
          const btnX = e.clientX - (rect.left + rect.width / 2);
          const btnY = e.clientY - (rect.top + rect.height / 2);

          btn.style.transform = `translate3d(${btnX * 0.2}px, ${btnY * 0.2}px, 0px)`;
        });

        btn.addEventListener('pointerleave', () => {
          btn.style.transform = 'translate3d(0px, 0px, 0px)';
          btn.style.transition = 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
        });

        btn.addEventListener('pointerenter', () => {
          btn.style.transition = 'none';
        });
      });
    }

    // 3. Smooth Stagger Entrance Animation
    const animatedElements = document.querySelectorAll(
      '.card-header, .profile-hero, .skills-section, .info-section, .socials, .cta-section'
    );

    animatedElements.forEach((el, index) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(18px)';
      el.style.transition = `opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.07 + 0.08}s, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.07 + 0.08}s`;

      requestAnimationFrame(() => {
        setTimeout(() => {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, 30);
      });
    });
  });
})();
