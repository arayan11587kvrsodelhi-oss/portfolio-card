import { prisma, safeDb } from '@/lib/db';
import {
  FALLBACK_PROFILE,
  FALLBACK_PROJECTS,
  FALLBACK_SKILLS,
} from '@/lib/fallback-data';
import type { PortfolioData, ProfileDTO, ProjectDTO, SkillDTO } from '@/types';

/**
 * Single source of truth for portfolio reads.
 * Used by both the API routes and the server components so the frontend
 * loads data through the backend rather than hardcoding it in the UI.
 */

export async function getProfile(): Promise<ProfileDTO> {
  return safeDb(async () => {
    const profile = await prisma.profile.findFirst({
      orderBy: { createdAt: 'asc' },
    });
    if (!profile) return FALLBACK_PROFILE;
    return {
      name: profile.name,
      title: profile.title,
      bio: profile.bio,
      location: profile.location,
      phone: profile.phone,
      email: profile.email,
      availability: profile.availability,
      profileImage: profile.profileImage,
      githubUrl: profile.githubUrl,
      linkedinUrl: profile.linkedinUrl,
      instagramUrl: profile.instagramUrl,
      portfolioUrl: profile.portfolioUrl,
    };
  }, FALLBACK_PROFILE);
}

export async function getSkills(): Promise<SkillDTO[]> {
  return safeDb(async () => {
    const skills = await prisma.skill.findMany({ orderBy: { order: 'asc' } });
    if (skills.length === 0) return FALLBACK_SKILLS;
    return skills.map((s) => ({
      id: s.id,
      name: s.name,
      icon: s.icon,
      category: s.category,
      color: s.color,
      order: s.order,
    }));
  }, FALLBACK_SKILLS);
}

export async function getProjects(): Promise<ProjectDTO[]> {
  return safeDb(async () => {
    const projects = await prisma.project.findMany({
      orderBy: [{ featured: 'desc' }, { order: 'asc' }],
    });
    if (projects.length === 0) return FALLBACK_PROJECTS;
    return projects.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      techStack: p.techStack,
      githubUrl: p.githubUrl,
      liveUrl: p.liveUrl,
      image: p.image,
      featured: p.featured,
      order: p.order,
    }));
  }, FALLBACK_PROJECTS);
}

export async function getPortfolioData(): Promise<PortfolioData> {
  const [profile, skills, projects] = await Promise.all([
    getProfile(),
    getSkills(),
    getProjects(),
  ]);
  return { profile, skills, projects };
}
