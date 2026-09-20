import { getProjects } from '@/lib/portfolio';
import { ok, handleRouteError } from '@/lib/api';

export const dynamic = 'force-dynamic';

/** GET /api/projects — projects (empty until real ones are added). */
export async function GET() {
  try {
    const projects = await getProjects();
    return ok(projects);
  } catch (error) {
    return handleRouteError('projects', error);
  }
}
