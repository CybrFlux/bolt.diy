# CybrBuild Sites vault gates (map / stubs only)

**Status:** hard gates documented for a **later** site-factory — **not implemented** in this pass.  
Linked from [CYBRBUILD-MCP-BRIDGE.md](./CYBRBUILD-MCP-BRIDGE.md).

Auth/brand OAuth scaffold is the shipping priority; this file only names hooks the factory must honor.

---

## Gate 1 — Map allow/ban component IDs to vault

Before/during generation, resolve component IDs against the Sites vault allowlist/banlist.

### Sites bans (non-exhaustive starter list — keep in vault, not hardcoded forever)

| Ban pattern | Why |
| --- | --- |
| Generic dark-left-two-pills hero | Overused stock layout |
| Stock dual soft pills | Generic CTA chrome |
| Purple gradient blobs | Cliché decorative background |
| Equal 3-icon cards | Template filler section |
| Empty About | Incomplete / placeholder content |
| Fake Maps / NAP | Fabricated location / name-address-phone |
| Fake testimonials | Fabricated social proof |
| Inter-everything | Default Inter-only typography with no brand voice |

**Future hook:** `GET /api/factory/vault/components` (or vault client beside Remix) returns `{ allow: string[], ban: string[] }` scoped by tenant / site type. Generator **must refuse** banned IDs.

---

## Gate 2 — Refuse incomplete BRIEF (hard gate)

No generation may start until BRIEF validation passes.

**Future hook:** `POST /api/factory/brief/validate`  
On failure → `400` with field errors; **do not** call LLM generate.

Minimum BRIEF fields (illustrative — finalize with Sites):

- Business / product name
- Primary audience
- Offer / CTA
- Tone / brand constraints
- Required pages/sections
- Explicit “no fake NAP/testimonials” acknowledgment when local/business

---

## Gate 3 — Always emit desktop + mobile hero screenshots

Every factory run that produces a site **must** attach:

1. Desktop hero screenshot  
2. Mobile hero screenshot  

**Future hook:** `POST /api/factory/qa/screenshots`  
Store under tenant `user.id` + run id (bucket/env TBD: `QA_SCREENSHOT_BUCKET`). QA fails the run if either viewport is missing.

---

## Gate 4 — Stub: Sites rejects → Learn / Graphify

When Sites (or human QA) rejects an output, emit a structured event for later Learn/Graphify ingestion. **No real Learn wiring in this pass.**

| Name | Kind | Notes |
| --- | --- | --- |
| **`sites.reject.v1`** | Event type | Payload: tenant, run id, ban hits, BRIEF hash, screenshot refs, reject reason |
| **`POST /api/factory/events/sites-reject`** | Future CybrBuild endpoint | Accepts reject payload; enqueues / forwards |
| **`LEARN_GRAPHIFY_EVENT_URL`** | Future env | Downstream Learn/Graphify intake URL |

Until Learn exists, the endpoint may `202` + log/store only.

---

## Ordering reminder

1. BRIEF validate (Gate 2)  
2. Vault allow/ban resolve (Gate 1)  
3. Generate  
4. Desktop + mobile hero screenshots (Gate 3)  
5. On reject → `sites.reject.v1` (Gate 4)

Do not implement factory routes in the OAuth/brand PR.
