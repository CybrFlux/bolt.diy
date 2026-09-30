import { createCookieSessionStorage, type SessionStorage, type Session } from '@remix-run/cloudflare';
import type { AuthUser } from './auth.server';

export const SESSION_KEY = 'user';
export const SESSION_COOKIE_NAME = '__cybrbuild_session';

type SessionData = {
  [SESSION_KEY]: AuthUser;
};

type SessionFlashData = {
  error: string;
};

export type CybrBuildSession = Session<SessionData, SessionFlashData>;

/**
 * Resolve session signing secret from env.
 * Prefer AUTH_SECRET; accept SESSION_SECRET as alias.
 */
export function getSessionSecret(env: { AUTH_SECRET?: string; SESSION_SECRET?: string }): string | null {
  const secret = env.AUTH_SECRET || env.SESSION_SECRET;
  return secret && secret.length > 0 ? secret : null;
}

export function createAuthSessionStorage(env: {
  AUTH_SECRET?: string;
  SESSION_SECRET?: string;
  APP_URL?: string;
  AUTH_URL?: string;
}): SessionStorage<SessionData, SessionFlashData> | null {
  const secret = getSessionSecret(env);

  if (!secret) {
    return null;
  }

  const origin = (env.APP_URL || env.AUTH_URL || '').replace(/\/$/, '');
  // Production host is HTTPS; allow insecure cookie only for explicit http:// local APP_URL
  const secure = origin ? origin.startsWith('https://') : true;

  return createCookieSessionStorage<SessionData, SessionFlashData>({
    cookie: {
      name: SESSION_COOKIE_NAME,
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secrets: [secret],
      secure,
      maxAge: 60 * 60 * 24 * 30, // 30 days
    },
  });
}

export async function getSession(
  request: Request,
  env: { AUTH_SECRET?: string; SESSION_SECRET?: string },
): Promise<CybrBuildSession | null> {
  const storage = createAuthSessionStorage(env);

  if (!storage) {
    return null;
  }

  return storage.getSession(request.headers.get('Cookie'));
}

export async function commitSession(
  session: CybrBuildSession,
  env: { AUTH_SECRET?: string; SESSION_SECRET?: string },
): Promise<string | null> {
  const storage = createAuthSessionStorage(env);

  if (!storage) {
    return null;
  }

  return storage.commitSession(session);
}

export async function destroySession(
  session: CybrBuildSession,
  env: { AUTH_SECRET?: string; SESSION_SECRET?: string },
): Promise<string | null> {
  const storage = createAuthSessionStorage(env);

  if (!storage) {
    return null;
  }

  return storage.destroySession(session);
}
