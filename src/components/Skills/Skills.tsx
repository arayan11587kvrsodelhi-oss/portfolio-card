import type { SkillDTO } from '@/types';

interface SkillsProps {
  skills: SkillDTO[];
  label?: string;
}

/** Maps a skill name to the data-skill attribute used for icon hover colors. */
function toDataSkill(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('html')) return 'html';
  if (n.includes('css')) return 'css';
  if (n.includes('javascript') || n === 'js') return 'js';
  if (n.includes('node')) return 'node';
  if (n.includes('github')) return 'github';
  if (n.includes('git')) return 'git';
  return n.replace(/[^a-z0-9]/g, '');
}

/**
 * Tech stack pills. Rendered from backend data; `data-skill` preserves the
 * existing per-icon hover color rules from the original CSS.
 */
export default function Skills({ skills, label = 'TECH STACK' }: SkillsProps) {
  if (skills.length === 0) return null;

  return (
    <section className="skills-section" aria-label="Tech stack">
      <div className="section-label">
        <i className="fa-solid fa-code" aria-hidden="true" />
        <span>{label}</span>
      </div>

      <div className="skill-tags">
        {skills.map((skill) => (
          <div className="skill-pill magnetic" key={skill.id} data-skill={toDataSkill(skill.name)}>
            <i className={`${skill.icon} skill-icon`} aria-hidden="true" />
            <span>{skill.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
