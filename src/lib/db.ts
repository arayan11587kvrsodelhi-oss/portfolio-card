import { PrismaClient } from '@prisma/client';

/**
 * Prisma client singleton.
 *
 * In development, Next.js hot-reloads modules and would otherwise create a
 * new PrismaClient (and a new connection pool) on every reload. Storing it on
 * globalThis prevents connection exhaustion.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Reads are wrapped so a missing/undefined database (e.g. before `prisma db push`
 * in a fresh env) returns a graceful fallback instead of crashing the page.
 */
export async function safeDb<T>(
  fn: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.error('[db] query failed:', error instanceof Error ? error.message : error);
    return fallback;
  }
}
