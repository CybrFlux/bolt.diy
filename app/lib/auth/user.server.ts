import { redirect } from '@remix-run/cloudflare';
import type { AuthUser, AuthEnv } from './auth.server';
import { isGoogleOAuthConfigured } from './auth.server';
import { SESSION_KEY, getSession, destroySession } from './session.server';

function envFromContext(context: { cloudflare?: { env?: AuthEnv } } | undefined): AuthEnv {
  return (context?.cloudflare?.env as AuthEnv) || {};
}

/** Soft read — returns null when unauthenticated or auth not configured. */
export async function getUser(
  request: Request,
  context?: { cloudflare?: { env?: AuthEnv } },
): Promise<AuthUser | null> {
  const env = envFromContext(context);

  if (!isGoogleOAuthConfigured(env)) {
    return null;
  }

  const session = await getSession(request, env);

  if (!session) {
    return null;
  }

  const user = session.get(SESSION_KEY);

  return user ?? null;
}

/** Hard gate — redirects to /login when missing. */
export async function requireUser(
  request: Request,
  context?: { cloudflare?: { env?: AuthEnv } },
): Promise<AuthUser> {
  const user = await getUser(request, context);

  if (!user) {
    throw redirect('/login');
  }

  return user;
}

export async function logout(
  request: Request,
  context?: { cloudflare?: { env?: AuthEnv } },
): Promise<Response> {
  const env = envFromContext(context);
  const session = await getSession(request, env);

  if (!session) {
    return redirect('/');
  }

  const cookie = await destroySession(session, env);

  return redirect('/', {
    headers: cookie ? { 'Set-Cookie': cookie } : undefined,
  });
}

export function authConfigured(context?: { cloudflare?: { env?: AuthEnv } }): boolean {
  return isGoogleOAuthConfigured(envFromContext(context));
}

/**
 * Future hard-gate for /api/chat when AUTH_REQUIRED=true.
 * Scaffold leaves chat ungated; call this from api.chat when enabling.
 */
export function isAuthRequired(env: AuthEnv): boolean {
  return String(env.AUTH_REQUIRED || '').toLowerCase() === 'true';
}
