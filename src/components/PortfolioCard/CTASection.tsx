import type { ProfileDTO } from '@/types';

interface CTAProps {
  profile: ProfileDTO;
}

/** Primary + secondary CTA buttons — original markup and icon behavior. */
export default function CTASection({ profile }: CTAProps) {
  return (
    <footer className="cta-section" aria-label="Call to action">
      {profile.portfolioUrl && (
        <a
          href={profile.portfolioUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary cta-btn magnetic"
        >
          <span>View Portfolio</span>
          <i className="fa-solid fa-arrow-up-right-from-square btn-icon" aria-hidden="true" />
        </a>
      )}

      <a href={`mailto:${profile.email}`} className="btn btn-secondary cta-btn magnetic">
        <i className="fa-solid fa-paper-plane btn-icon-left" aria-hidden="true" />
        <span>Contact Me</span>
      </a>
    </footer>
  );
}
