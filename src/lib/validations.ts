import { z } from 'zod';

/**
 * Strips HTML control characters and trims whitespace.
 * Defence-in-depth: Prisma already parameterises queries (no SQL injection),
 * this additionally neutralises stored markup / control chars in free text.
 */
export function sanitizeText(input: string): string {
  return input
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const safeString = (min: number, max: number) =>
  z
    .string()
    .transform(sanitizeText)
    .pipe(z.string().min(min).max(max));

export const contactSchema = z.object({
  name: safeString(2, 80),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Please provide a valid email address.')
    .max(160),
  message: safeString(10, 2000),
  // Honeypot: must be empty. Bots tend to fill every field.
  company: z.string().max(0).optional().or(z.literal('')),
});

export type ContactInput = z.infer<typeof contactSchema>;

export const rateLimitKeySchema = z.string().min(1).max(128);
