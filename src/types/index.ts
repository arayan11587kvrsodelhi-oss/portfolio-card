/** Shared, serialisable DTO types for the portfolio API + UI. */

export interface ProfileDTO {
  name: string;
  title: string;
  bio: string;
  location: string;
  phone: string | null;
  email: string;
  availability: string;
  profileImage: string;
  githubUrl: string | null;
  linkedinUrl: string | null;
  instagramUrl: string | null;
  portfolioUrl: string | null;
}

export interface SkillDTO {
  id: string;
  name: string;
  icon: string;
  category: string;
  color: string | null;
  order: number;
}

export interface ProjectDTO {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  githubUrl: string | null;
  liveUrl: string | null;
  image: string | null;
  featured: boolean;
  order: number;
}

export interface PortfolioData {
  profile: ProfileDTO;
  skills: SkillDTO[];
  projects: ProjectDTO[];
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
  details?: unknown;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
