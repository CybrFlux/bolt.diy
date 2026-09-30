import { redirect, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { createAuthenticator, isGoogleOAuthConfigured, type AuthEnv } from '~/lib/auth/auth.server';

/**
 * Starts Google OAuth via full-page redirect (NOT popup).
 * COOP is same-origin in entry.server — popups break.
 */
export async function loader({ request, context }: LoaderFunctionArgs) {
  const env = (context.cloudflare?.env as AuthEnv) || {};

  if (!isGoogleOAuthConfigured(env)) {
    return redirect('/login');
  }

  const authenticator = createAuthenticator(request, env);

  if (!authenticator) {
    return redirect('/login');
  }

  return authenticator.authenticate('google', request);
}
