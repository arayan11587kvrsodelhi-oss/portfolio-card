import type { ProfileDTO } from '@/types';

interface SocialLinksProps {
  profile: ProfileDTO;
}

/**
 * Social links with hover tooltips — identical markup/ARIA to the original.
 * Only links with a real URL are rendered.
 */
export default function SocialLinks({ profile }: SocialLinksProps) {
  const links = [
    { href: profile.githubUrl, icon: 'fab fa-github', name: 'GitHub', label: 'GitHub Profile' },
    { href: profile.linkedinUrl, icon: 'fab fa-linkedin-in', name: 'LinkedIn', label: 'LinkedIn Profile' },
    { href: profile.instagramUrl, icon: 'fab fa-instagram', name: 'Instagram', label: 'Instagram Profile' },
  ].filter((l): l is { href: string; icon: string; name: string; label: string } => Boolean(l.href));

  return (
    <section className="socials" aria-label="Social links">
      {links.map((link) => (
        <a
          key={link.name}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="social-link magnetic"
          aria-label={link.label}
        >
          <i className={link.icon} aria-hidden="true" />
          <span className="social-tooltip">{link.name}</span>
        </a>
      ))}

      {profile.email && (
        <a href={`mailto:${profile.email}`} className="social-link magnetic" aria-label="Send email">
          <i className="fas fa-envelope" aria-hidden="true" />
          <span className="social-tooltip">Email</span>
        </a>
      )}
    </section>
  );
}
