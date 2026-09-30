# CybrBuild MCP / API bridge map

**Status:** design / map only — **do not build** the site-factory in this pass.  
**Host lock:** `https://build.cybrflux.online` (CF Pages / Wrangler — **not** Vercel for the builder shell).  
**OAuth callback (exact):** `https://build.cybrflux.online/auth/google/callback`  
**Related:** [CYBRBUILD-VAULT-GATES.md](./CYBRBUILD-VAULT-GATES.md) — Sites vault allow/ban gates + BRIEF + screenshot hooks.

---

## Purpose

Document where a future **site-factory agent** (vault + QA) would plug into CybrBuild (this bolt.diy fork), using the Remix API surface and the signed-in user as a tenant key — without implementing the factory yet.

Keep two MCP worlds distinct:

| Surface | What it is | Who owns it |
| --- | --- | --- |
| **bolt in-product MCP** (if/when present in upstream bolt.diy) | Tools exposed *inside* the IDE chat / WebContainer workflow | Upstream / product |
| **CybrFlux agent MCP** | External agents (Cursr, site-factory, vault, Learn/Graphify) talking to CybrBuild or sibling services | CybrFlux ops |

Do **not** conflate them in code or env.

---

## Existing LLM API surfaces (today)

| Route | Role |
| --- | --- |
| `app/routes/api.chat.ts` | Main chat streaming (`action`). Reads `apiKeys` / `providers` cookies + `context.cloudflare.env`. **Gate point** for future `AUTH_REQUIRED=true` (see below). |
| `app/routes/api.llmcall.ts` | One-shot LLM calls (non-chat). |
| `app/routes/api.enhancer.ts` | Prompt enhancement. |
| `app/routes/api.models.ts` / `api.models.$provider.ts` | Model list / per-provider models. |
| `app/routes/api.check-env-key.ts` | Env key presence checks for settings UI. |

Supporting: deploy adapters (`api.vercel-deploy.ts`, `api.netlify-deploy.ts`), Supabase helpers, system diagnostics — **not** factory entry points.

Auth scaffold helpers (this PR):

- `app/lib/auth/session.server.ts` — `__cybrbuild_session` cookie
- `app/lib/auth/auth.server.ts` — Google strategy (redirect only)
- `app/lib/auth/user.server.ts` — `getUser` / `requireUser` / `isAuthRequired`

**Tenant key for factory:** `user.id` (Google `sub`) from session after OAuth.

---

## Where the factory plugs in (future)

```
Browser (CybrBuild UI + WebContainer)
        │
        ▼
Remix loaders/actions  ──session user.id──►  tenant scope
        │
        ├── /api/chat (LLM + IDE agent — existing)
        └── /api/factory/* (FUTURE stubs — not implemented)
                ├── vault read / component allow-ban
                ├── BRIEF validation (hard gate)
                ├── generate site artifacts
                ├── QA screenshots (desktop + mobile hero)
                └── reject → Learn/Graphify event (stub)
```

Server-side tool/MCP calls for the factory should live **beside** WebContainer IDE work (server routes / workers), not inside the browser WC sandbox. WC stays the user’s live IDE; factory is a privileged server path keyed by session user.

---

## Suggested future routes (stubs only — do not implement)

| Route | Intent |
| --- | --- |
| `POST /api/factory/brief/validate` | Hard-refuse incomplete BRIEF before generation. |
| `POST /api/factory/generate` | Start site generation (tenant = `user.id`). |
| `GET  /api/factory/vault/components` | Map allow/ban component IDs from Sites vault. |
| `POST /api/factory/qa/screenshots` | Always emit desktop + mobile hero screenshots. |
| `POST /api/factory/rejects` | Feed Sites rejects into Learn/Graphify later. |
| `POST /api/factory/events/sites-reject` | Named future event/endpoint for reject → Learn (see vault gates doc). |

See **CYBRBUILD-VAULT-GATES.md** for hard gates 1–4.

---

## AUTH_REQUIRED gate point (document only; default off)

In `api.chat.ts` `chatAction` (and optionally `api.llmcall.ts` / `api.enhancer.ts`):

```ts
// FUTURE — do not enable until secrets + product ready
import { getUser, isAuthRequired } from '~/lib/auth/user.server';

const env = context.cloudflare?.env;
if (isAuthRequired(env)) {
  const user = await getUser(request, context);
  if (!user) return new Response('Unauthorized', { status: 401 });
  // tenantKey = user.id
}
```

Scaffold leaves **`AUTH_REQUIRED` unset/false** so the app runs without secrets.

---

## Env / secrets the bridge will need later

### Required now for OAuth scaffold (when enabling sign-in)

| Var | Notes |
| --- | --- |
| `GOOGLE_CLIENT_ID` | Google Cloud OAuth client |
| `GOOGLE_CLIENT_SECRET` | Google Cloud OAuth secret |
| `AUTH_SECRET` | Session signing (`SESSION_SECRET` alias OK) |
| `APP_URL` or `AUTH_URL` | Production: `https://build.cybrflux.online` |
| `XAI_API_KEY` | Already typed — Grok default path |

**Google Console redirect URI (exact):**  
`https://build.cybrflux.online/auth/google/callback`

### Later (factory / vault / QA — not in this pass)

| Var | Notes |
| --- | --- |
| `AUTH_REQUIRED` | `true` to hard-gate chat |
| `SITES_VAULT_URL` / `SITES_VAULT_TOKEN` | Vault allow/ban API |
| `FACTORY_WEBHOOK_SECRET` | Sign factory callbacks |
| `LEARN_GRAPHIFY_EVENT_URL` | Stub target for reject events |
| `QA_SCREENSHOT_BUCKET` / creds | Store desktop+mobile hero shots |
| Existing LLM keys | As needed beyond xAI |

---

## Explicit non-goals this pass

- No site-factory implementation
- No Vercel project / deploy for the **builder** shell (host remains CF; in-IDE Vercel deploy of *user projects* is unrelated)
- No Learn/Graphify real wiring — name the hook only
- No mass rename of `bolt-elements-*` CSS tokens
