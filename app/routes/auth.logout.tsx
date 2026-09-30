import { type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { logout } from "~/lib/auth/user.server";

export async function action({ request, context }: ActionFunctionArgs) {
  return logout(request, context);
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  return logout(request, context);
}
