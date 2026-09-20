import { prisma } from '@/lib/db';
import { contactSchema } from '@/lib/validations';
import { getClientIp, hashIp, rateLimit } from '@/lib/rate-limit';
import { badRequest, created, handleRouteError, tooManyRequests } from '@/lib/api';

export const dynamic = 'force-dynamic';

// 5 submissions per IP per 10 minutes.
const RATE_LIMIT = { limit: 5, windowMs: 10 * 60 * 1000 };
const MAX_BODY_BYTES = 8 * 1024; // reject oversized payloads early

/**
 * POST /api/contact
 *
 * Validation order (all server-side):
 *   1. payload size guard (reject huge bodies)
 *   2. rate limit by hashed client id
 *   3. JSON parse
 *   4. honeypot check (silently accept-and-drop for bots)
 *   5. Zod schema validation + sanitization
 *   6. persist via Prisma (parameterised query — no SQL injection)
 *
 * Errors are generic; internal details are logged server-side only.
 */
export async function POST(request: Request) {
  try {
    // 1. Body size guard.
    const contentLength = Number(request.headers.get('content-length') ?? '0');
    if (contentLength > MAX_BODY_BYTES) {
      return badRequest('Request payload is too large.');
    }

    // 2. Rate limit.
    const clientId = hashIp(getClientIp(request.headers));
    const limitResult = rateLimit(`contact:${clientId}`, RATE_LIMIT);
    if (!limitResult.allowed) {
      const retryAfter = Math.max(1, Math.ceil((limitResult.resetAt - Date.now()) / 1000));
      return tooManyRequests(
        'Too many messages sent. Please try again in a few minutes.',
        retryAfter,
      );
    }

    // 3. Parse JSON safely.
    let json: unknown;
    try {
      json = await request.json();
    } catch {
      return badRequest('Invalid request body.');
    }

    if (typeof json !== 'object' || json === null) {
      return badRequest('Invalid request body.');
    }

    const payload = json as Record<string, unknown>;

    // 4. Honeypot: if filled, pretend success but do not store (anti-spam).
    if (typeof payload.company === 'string' && payload.company.trim().length > 0) {
      return created({ message: 'Message received.' });
    }

    // 5. Schema validation + sanitization.
    const parsed = contactSchema.safeParse(payload);
    if (!parsed.success) {
      const details = parsed.error.flatten().fieldErrors;
      return badRequest('Validation failed.', details);
    }

    const { name, email, message } = parsed.data;

    // 6. Persist — never store raw IP, only a one-way hash.
    await prisma.contactMessage.create({
      data: {
        name,
        email,
        message,
        ipHash: clientId,
        userAgent: request.headers.get('user-agent')?.slice(0, 300) ?? null,
      },
    });

    return created({ message: 'Message received.' });
  } catch (error) {
    return handleRouteError('contact', error);
  }
}

/** GET is not allowed on this resource. */
export async function GET() {
  return badRequest('Method not allowed.');
}
