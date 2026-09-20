/**
 * Prisma seed script.
 *
 * IMPORTANT: This seeds ONLY data that already exists in the original
 * portfolio-card project. No projects, clients, testimonials, metrics,
 * employers or achievements are invented. The Project table is left
 * intentionally empty (only a commented example shape is shown) until
 * real projects are added.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // ── Profile ─────────────────────────
  const profile = await prisma.profile.upsert({
    where: { slug: 'aryan-sharma' },
    update: {},
    create: {
      slug: 'aryan-sharma',
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
      portfolioUrl:
        'https://arayan11587kvrsodelhi-oss.github.io/aryan-portfolio-cinematic/',
    },
  });

  // ── Skills (exactly the six pills from the original card) ───────────
  const skills = [
    { name: 'HTML', icon: 'fa-brands fa-html5', color: '#f06529', order: 0 },
    { name: 'CSS', icon: 'fa-brands fa-css3-alt', color: '#2965f1', order: 1 },
    { name: 'JavaScript', icon: 'fa-brands fa-js', color: '#f7df1e', order: 2 },
    { name: 'Node.js', icon: 'fa-brands fa-node-js', color: '#68a063', order: 3 },
    { name: 'Git', icon: 'fa-brands fa-git-alt', color: '#f05032', order: 4 },
    { name: 'GitHub', icon: 'fa-brands fa-github', color: '#ffffff', order: 5 },
  ];

  for (const skill of skills) {
    await prisma.skill.upsert({
      where: { id: `seed-skill-${skill.order}` },
      update: skill,
      create: { id: `seed-skill-${skill.order}`, ...skill, category: 'TECH STACK' },
    });
  }

  // ── Projects ────────────────────────
  // Intentionally left empty. Real projects should be added later.
  // Example (commented) so the shape is clear — do NOT uncomment with fake data:
  //
  // await prisma.project.create({
  //   data: {
  //     title: 'My real project',
  //     description: 'A real description.',
  //     techStack: ['Next.js', 'PostgreSQL'],
  //     githubUrl: 'https://github.com/...',
  //     liveUrl: 'https://...',
  //     featured: false,
  //     order: 0,
  //   },
  // });

  console.log('Seed complete.');
  console.log(`Profile: ${profile.name} (${profile.title})`);
  console.log(`Skills: ${skills.length}`);
  console.log('Projects: 0 (add real projects later)');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
