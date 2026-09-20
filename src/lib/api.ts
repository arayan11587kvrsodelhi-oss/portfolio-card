import { NextResponse } from 'next/server';

/**
 * Consistent, safe JSON responses.
 *
 * Never leaks internal error messages, stack traces or database details to
 * the client — those are logged server-side only.
 */
export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ success: true, data }, { status: 200, ...init });
}

export function created<T>(data: T) {
  return NextResponse.json({ success: true, data }, { status: 201 });
}

export function badRequest(message: string, details?: unknown) {
  return NextResponse.json(
    { success: false, error: message, ...(details ? { details } : {}) },
    { status: 400 },
  );
}

export function tooManyRequests(message = 'Too many requests. Please try again later.', retryAfterSeconds = 60) {
  return NextResponse.json(
    { success: false, error: message },
    { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } },
  );
}

export function serverError(message = 'Something went wrong. Please try again later.') {
  return NextResponse.json({ success: false, error: message }, { status: 500 });
}

export function notFound(message = 'Not found.') {
  return NextResponse.json({ success: false, error: message }, { status: 404 });
}

/** Logs the real error server-side while returning a safe generic message. */
export function handleRouteError(scope: string, error: unknown) {
  console.error(`[api:${scope}]`, error instanceof Error ? error.stack ?? error.message : error);
  return serverError();
}
