/**
 * Fallback content used when the database is not yet seeded/reachable.
 *
 * This mirrors exactly what the seed script inserts — it is NOT invented
 * data, it is the same real portfolio content from the original project,
 * so the UI never renders broken/empty during cold start.
 */
import type { ProfileDTO, SkillDTO, ProjectDTO } from '@/types';

export const FALLBACK_PROFILE: ProfileDTO = {
  name: 'Aryan Sharma',
  title: 'TIPS BCA STUDENT',
  bio: 'Building modern, responsive web applications with aesthetic precision and clean performance.',
  location: 'New Delhi, India',
  phone: '8076233501',
  email: 'arayan11587kvrsodelhi@gmail.com',
  availability: 'AVAILABLE FOR PROJECTS',
  profileImage: '/images/aryanpic.jpeg',
  githubUrl: 'https://github.com/arayan11587kvrsodelhi-oss',
  linkedinUrl: 'https://www.linkedin.com/in/aryan-sharma-7681a3380/',
  instagramUrl: 'https://www.instagram.com/aryan._.5harma/',
  portfolioUrl: 'https://arayan11587kvrsodelhi-oss.github.io/aryan-portfolio-cinematic/',
};

export const FALLBACK_SKILLS: SkillDTO[] = [
  { id: 'seed-skill-0', name: 'HTML', icon: 'fa-brands fa-html5', category: 'TECH STACK', color: '#f06529', order: 0 },
  { id: 'seed-skill-1', name: 'CSS', icon: 'fa-brands fa-css3-alt', category: 'TECH STACK', color: '#2965f1', order: 1 },
  { id: 'seed-skill-2', name: 'JavaScript', icon: 'fa-brands fa-js', category: 'TECH STACK', color: '#f7df1e', order: 2 },
  { id: 'seed-skill-3', name: 'Node.js', icon: 'fa-brands fa-node-js', category: 'TECH STACK', color: '#68a063', order: 3 },
  { id: 'seed-skill-4', name: 'Git', icon: 'fa-brands fa-git-alt', category: 'TECH STACK', color: '#f05032', order: 4 },
  { id: 'seed-skill-5', name: 'GitHub', icon: 'fa-brands fa-github', category: 'TECH STACK', color: '#ffffff', order: 5 },
];

export const FALLBACK_PROJECTS: ProjectDTO[] = [];
