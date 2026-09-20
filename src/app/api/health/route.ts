import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ok, handleRouteError } from '@/lib/api';

export const dynamic = 'force-dynamic';

/**
 * GET /api/health
 * Liveness + database connectivity probe. Never exposes connection details.
 */
export async function GET() {
  let database = 'disconnected';
  try {
    await prisma.$queryRaw`SELECT 1`;
    database = 'connected';
  } catch (error) {
    console.error('[api:health] db check failed:', error instanceof Error ? error.message : error);
  }

  try {
    return NextResponse.json({
      success: true,
      data: {
        status: 'ok',
        database,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return handleRouteError('health', error);
  }
}

// Keep `ok` imported for consistency across routes without tree-shaking noise.
void ok;
