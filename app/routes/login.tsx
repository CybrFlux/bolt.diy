import { json, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/cloudflare';
import { Form, Link, useLoaderData } from '@remix-run/react';
import {
  isGoogleOAuthConfigured,
  PRODUCTION_GOOGLE_CALLBACK_URL,
  type AuthEnv,
} from '~/lib/auth/auth.server';
import { getUser } from '~/lib/auth/user.server';

export const meta: MetaFunction = () => {
  return [{ title: 'Sign in · CybrBuild' }, { name: 'description', content: 'Sign in to CybrBuild' }];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  const env = (context.cloudflare?.env as AuthEnv) || {};
  const user = await getUser(request, context);
  const configured = isGoogleOAuthConfigured(env);

  return json({
    user,
    configured,
    productionCallback: PRODUCTION_GOOGLE_CALLBACK_URL,
  });
}

export default function LoginPage() {
  const { user, configured, productionCallback } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bolt-elements-background-depth-1 px-4">
      <div className="w-full max-w-md rounded-xl border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-bolt-elements-textPrimary mb-2">CybrBuild</h1>
        <p className="text-sm text-bolt-elements-textSecondary mb-6">
          CybrFlux AI builder — sign in with Google (full-page redirect; popups are blocked by COOP).
        </p>

        {user ? (
          <div className="space-y-4">
            <p className="text-sm text-bolt-elements-textPrimary">
              Signed in as <strong>{user.email}</strong>
            </p>
            <Link
              to="/"
              className="inline-flex items-center justify-center w-full rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white"
            >
              Continue to builder
            </Link>
            <Form action="/auth/logout" method="post">
              <button
                type="submit"
                className="inline-flex items-center justify-center w-full rounded-lg border border-bolt-elements-borderColor px-4 py-2 text-sm text-bolt-elements-textPrimary"
              >
                Sign out
              </button>
            </Form>
          </div>
        ) : configured ? (
          <a
            href="/auth/google"
            className="inline-flex items-center justify-center w-full rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Sign in with Google
          </a>
        ) : (
          <div className="space-y-3">
            <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
              Google sign-in is <strong>not configured</strong>. Set the secrets below, then reload.
            </p>
            <ul className="text-xs text-bolt-elements-textSecondary list-disc pl-5 space-y-1">
              <li>
                <code>GOOGLE_CLIENT_ID</code>
              </li>
              <li>
                <code>GOOGLE_CLIENT_SECRET</code>
              </li>
              <li>
                <code>AUTH_SECRET</code> (or <code>SESSION_SECRET</code>)
              </li>
              <li>
                <code>APP_URL</code> or <code>AUTH_URL</code> = <code>https://build.cybrflux.online</code> (production)
              </li>
            </ul>
            <p className="text-xs text-bolt-elements-textTertiary">
              Google Cloud Console authorized redirect URI must be exactly:
              <br />
              <code className="text-bolt-elements-textSecondary">{productionCallback}</code>
            </p>
            <Link
              to="/"
              className="inline-flex items-center justify-center w-full rounded-lg border border-bolt-elements-borderColor px-4 py-2 text-sm text-bolt-elements-textPrimary"
            >
              Back to CybrBuild
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
