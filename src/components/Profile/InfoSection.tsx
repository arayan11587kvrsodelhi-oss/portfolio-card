import type { ProfileDTO } from '@/types';

interface InfoSectionProps {
  profile: ProfileDTO;
}

/** Contact info cards (phone + location) — matches the original markup. */
export default function InfoSection({ profile }: InfoSectionProps) {
  return (
    <section className="info-section" aria-label="Contact information">
      {profile.phone && (
        <a href={`tel:${profile.phone}`} className="info-card magnetic" title={`Call ${profile.name}`}>
          <div className="info-icon">
            <i className="fa-solid fa-phone" aria-hidden="true" />
          </div>
          <div className="info-text">
            <span className="info-label">PHONE</span>
            <span className="info-value">{profile.phone}</span>
          </div>
        </a>
      )}

      <div className="info-card magnetic">
        <div className="info-icon">
          <i className="fa-solid fa-location-dot" aria-hidden="true" />
        </div>
        <div className="info-text">
          <span className="info-label">LOCATION</span>
          <span className="info-value">{profile.location}</span>
        </div>
      </div>
    </section>
  );
}
