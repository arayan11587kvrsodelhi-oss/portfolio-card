import { getProfile } from '@/lib/portfolio';
import { ok, handleRouteError } from '@/lib/api';

export const dynamic = 'force-dynamic';

/** GET /api/profile — public profile data. */
export async function GET() {
  try {
    const profile = await getProfile();
    return ok(profile);
  } catch (error) {
    return handleRouteError('profile', error);
  }
}
