'use client';

import { useRef } from 'react';
import ElectricBorder from '@/components/ElectricBorder/ElectricBorder';
import BorderGlow from '@/components/BorderGlow/BorderGlow';
import Profile from '@/components/Profile/Profile';
import InfoSection from '@/components/Profile/InfoSection';
import Skills from '@/components/Skills/Skills';
import SocialLinks from '@/components/SocialLinks/SocialLinks';
import Contact from '@/components/Contact/Contact';
import CTASection from '@/components/PortfolioCard/CTASection';
import { useCardTilt } from '@/components/CardInteractions/useCardTilt';
import { useMagnetic } from '@/components/CardInteractions/useMagnetic';
import { useStaggerEntrance } from '@/components/CardInteractions/useStaggerEntrance';
import { useInteractionEnvironment } from '@/components/CardInteractions/useInteractionEnvironment';
import type { PortfolioData } from '@/types';

const STAGGER_SELECTOR =
  '.card-header, .profile-hero, .skills-section, .info-section, .socials, .cta-section';

/**
 * PortfolioCard — the whole interactive card surface.
 *
 * Composes the ported animation layers in the same z-order as the original:
 *   BorderGlow (outer glow) → ElectricBorder (canvas lightning) → content
 * with the shine overlay and tilt applied to the card element itself.
 */
export default function PortfolioCard({ data }: { data: PortfolioData }) {
  const { profile, skills } = data;
  const { supportsHover, prefersReducedMotion } = useInteractionEnvironment();

  const tiltEnabled = supportsHover && !prefersReducedMotion;
  const glanceEnabled = supportsHover && !prefersReducedMotion;

  const cardInnerRef = useRef<HTMLDivElement | null>(null);

  const { ref: tiltRef, bindShine } = useCardTilt(tiltEnabled);
  const magneticRef = useMagnetic(glanceEnabled, '.magnetic');

  useStaggerEntrance(cardInnerRef, STAGGER_SELECTOR, {
    enabled: !prefersReducedMotion,
  });

  // Merge the refs we need on the same container.
  const setMagneticContainer = (node: HTMLDivElement | null) => {
    cardInnerRef.current = node;
    (magneticRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
  };

  return (
    <main className="card-container">
      <BorderGlow
        enabled={glanceEnabled}
        colors={['#c084fc', '#f472b6', '#38bdf8']}
        backgroundColor="#0c0d12"
        borderRadius={28}
        className="card"
      >
        <ElectricBorder color="#38bdf8" speed={1} chaos={0.12} borderRadius={28} paused={prefersReducedMotion}>
          <div ref={tiltRef} className="tilt-target">
            <div className="eb-content" ref={setMagneticContainer}>
              <div className="card-shine" ref={bindShine} aria-hidden="true" />

              <header className="card-header">
                <div className="status-badge" title={`Status: ${profile.availability}`}>
                  <span className="status-dot" aria-hidden="true" />
                  <span className="status-text">{profile.availability}</span>
                </div>
                <div className="card-index-tag">DEV // 2026</div>
              </header>

              <Profile profile={profile} />
              <Skills skills={skills} />
              <InfoSection profile={profile} />
              <SocialLinks profile={profile} />
              <Contact />
              <CTASection profile={profile} />
            </div>
          </div>
        </ElectricBorder>
      </BorderGlow>
    </main>
  );
}
