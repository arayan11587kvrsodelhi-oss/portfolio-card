import type { ProfileDTO } from '@/types';

interface ProfileProps {
  profile: ProfileDTO;
}

/**
 * Profile hero: avatar with glow + gradient ring, name, title badge, bio.
 * Structure and classes mirror the original index.html markup exactly.
 */
export default function Profile({ profile }: ProfileProps) {
  return (
    <section className="profile-hero" aria-label="Profile">
      <div className="profile-container">
        <div className="profile-glow" aria-hidden="true" />
        <div className="profile-ring" aria-hidden="true" />
        <img
          src={profile.profileImage}
          alt={`${profile.name} — ${profile.title} profile picture`}
          className="profile-pic"
          loading="eager"
          decoding="async"
          width={124}
          height={124}
        />
      </div>

      <h1 className="name">{profile.name}</h1>

      <div className="title-badge">
        <i className="fa-solid fa-graduation-cap" aria-hidden="true" />
        <span>{profile.title}</span>
      </div>

      <p className="description">{profile.bio}</p>
    </section>
  );
}
