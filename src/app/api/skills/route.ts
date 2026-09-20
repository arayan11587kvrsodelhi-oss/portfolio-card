import { getSkills } from '@/lib/portfolio';
import { ok, handleRouteError } from '@/lib/api';

export const dynamic = 'force-dynamic';

/** GET /api/skills — ordered tech-stack list. */
export async function GET() {
  try {
    const skills = await getSkills();
    return ok(skills);
  } catch (error) {
    return handleRouteError('skills', error);
  }
}
