import { redirect, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { createAuthenticator, isGoogleOAuthConfigured, type AuthEnv } from "~/lib/auth/auth.server";
import { SESSION_KEY, getSession, commitSession } from "~/lib/auth/session.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const env = (context.cloudflare?.env as AuthEnv) || {};

  if (!isGoogleOAuthConfigured(env)) {
    return redirect("/login");
  }

  const authenticator = createAuthenticator(request, env);

  if (!authenticator) {
    return redirect("/login");
  }

  try {
    const user = await authenticator.authenticate("google", request);
    const session = await getSession(request, env);

    if (!session) {
      return redirect("/login");
    }

    session.set(SESSION_KEY, user);

    const cookie = await commitSession(session, env);

    return redirect("/", {
      headers: cookie ? { "Set-Cookie": cookie } : undefined,
    });
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }

    console.error("[auth.google.callback]", error);
    return redirect("/login");
  }
}
