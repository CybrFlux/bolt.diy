import { Authenticator } from 'remix-auth';
import { GoogleStrategy } from '@coji/remix-auth-google';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  image: string | null;
};

/** Locked production host (MASTER). */
export const PRODUCTION_APP_URL = 'https://build.cybrflux.online';
export const PRODUCTION_GOOGLE_CALLBACK_URL = `${PRODUCTION_APP_URL}/auth/google/callback`;

export type AuthEnv = {
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  AUTH_SECRET?: string;
  SESSION_SECRET?: string;
  /** Preferred absolute origin override, e.g. https://build.cybrflux.online */
  APP_URL?: string;
  AUTH_URL?: string;
  AUTH_REQUIRED?: string;
};

export function isGoogleOAuthConfigured(env: AuthEnv): boolean {
  return Boolean(
    env.GOOGLE_CLIENT_ID &&
      env.GOOGLE_CLIENT_SECRET &&
      (env.AUTH_SECRET || env.SESSION_SECRET),
  );
}

/**
 * Resolve OAuth callback base origin.
 * Prefer APP_URL / AUTH_URL (production lock: https://build.cybrflux.online),
 * otherwise derive from the incoming request (local/dev).
 */
export function resolveAppOrigin(request: Request, env: AuthEnv): string {
  const override = (env.APP_URL || env.AUTH_URL || '').replace(/\/$/, '');

  if (override) {
    return override;
  }

  return new URL(request.url).origin;
}

export function resolveGoogleCallbackURL(request: Request, env: AuthEnv): string {
  return `${resolveAppOrigin(request, env)}/auth/google/callback`;
}

/**
 * Build a per-request Authenticator so redirectURI matches host
 * (APP_URL/AUTH_URL in prod, request origin in local/dev).
 */
export function createAuthenticator(request: Request, env: AuthEnv): Authenticator<AuthUser> | null {
  if (!isGoogleOAuthConfigured(env)) {
    return null;
  }

  const authenticator = new Authenticator<AuthUser>();
  const redirectURI = resolveGoogleCallbackURL(request, env);

  authenticator.use(
    new GoogleStrategy<AuthUser>(
      {
        clientId: env.GOOGLE_CLIENT_ID!,
        clientSecret: env.GOOGLE_CLIENT_SECRET!,
        redirectURI,
        scopes: ['openid', 'email', 'profile'],
        prompt: 'select_account',
      },
      async ({ tokens }) => {
        const profile = await GoogleStrategy.userProfile(tokens);
        const email = profile.emails?.[0]?.value || profile._json?.email || '';

        return {
          id: profile.id || profile._json?.sub,
          email,
          name: profile.displayName || profile._json?.name || email || 'User',
          image: profile.photos?.[0]?.value || profile._json?.picture || null,
        };
      },
    ),
    'google',
  );

  return authenticator;
}
