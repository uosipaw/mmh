# MDSN Arts: Cloudflare migration

This branch preserves the existing website and adds the bead form at `/beads/`. The code is prepared for the Cloudflare Worker named `uosipaw`. Do not change the live domain until the temporary deployment has been tested.

## Build connection

Connect `uosipaw/mmh` in Cloudflare Workers & Pages. Use repository root `/`, build command `npm run build`, and deploy command `npx wrangler deploy`. For a preview, select this migration branch. The `wrangler.jsonc` name must match the Worker name.

Install and check locally:

```sh
npm ci
npm run build
npm test
```

The build copies existing public pages, images, fonts, tarot assets and spreads into `dist/`, then builds the bead page. Source code, database migrations, local credentials and setup documents are excluded from that directory.

Two existing files exceed Cloudflare's 25 MiB asset limit. `/images/mwah.gif` and `/images/Your paragraph text.zip` redirect to the matching files in the pinned, public GitHub commit, so those existing URLs continue working. All other oversized assets cause a clear build error instead of silently disappearing.

## Order database

The `wrangler.jsonc` file now declares a Cloudflare D1 binding named `DB` for the order database. On a successful `npx wrangler deploy`, Wrangler can automatically provision the D1 database; an ID is not required to make the first deployment. For deployments through Cloudflare's Git integration, the generated database ID is not written back into GitHub.

**One-time setup after the first successful deploy:**

1. In Cloudflare, open Workers & Pages → **uosipaw** → Settings → Bindings and locate the D1 binding `DB`. Open the attached D1 database.
2. In the D1 database's SQL console, execute the statements from `migrations/0001_bead_orders.sql` exactly once. This creates the order table and indexes.
3. Open `/beads/api/config` at the deployed hostname and confirm `ordersReady` is `true`. Without the table, order requests and PayPal remain disabled.

Alternatively, copy the database's actual ID into the `DB` entry in `wrangler.jsonc` and run:

```sh
npx wrangler d1 migrations apply mdsn-bead-orders --remote
```

The Cloudflare database is separate from the original ChatGPT Site database. Existing orders must be exported and imported separately; connecting D1 does not migrate them. The public endpoints are `/beads/api/config`, `/beads/api/orders`, and `/beads/api/capture`.

## Owner order studio

Store `STUDIO_PASSWORD` as a Cloudflare secret, at least 16 characters long and randomly generated. Visit `/beads/studio`, enter username `admin`, and use that password. The studio shows recent orders and supports CSV export. An unset password keeps the studio closed. The original ChatGPT owner login does not apply on this host.

## PayPal

Store `PAYPAL_CLIENT_SECRET` as a Cloudflare secret. Add the matching `PAYPAL_CLIENT_ID` from the same PayPal REST app. Start in sandbox and verify an order and capture before switching both credentials to Live.

The configuration must have these values set deliberately:

| Setting | Meaning |
| --- | --- |
| `PAYPAL_MODE` | `sandbox` for testing; `live` for actual payments |
| `STORE_READY` | Set to `true` only after approving catalog prices, shipping, tax and terms |
| `SHIPPING_CENTS` | Approved flat US shipping price, in cents |
| `TAX_BPS` | Applicable configured tax rate, in basis points; 100 means 1% |
| `ORDER_TERMS` | Optional text shown beside the required terms checkbox |

Set the nonsecret configuration values in `wrangler.jsonc` under `vars` so redeploys preserve them. Never put PayPal's Secret or the studio password in the repository or browser code. Payment stays disabled while required configuration is missing. Order requests do not collect money. Email confirmations are not automatic.

Pricing currently mirrors the original bead form: curtains $100/$155/$275/$325 at 12/24/48/55 inches; mini suncatchers $24; keychains $16; phone charms $20. These remain draft prices until approved. Tax is a configured flat rate, not a jurisdiction-aware tax service.

## Domain cutover

First test the homepage, tarot page, beads, order requests and owner studio at the temporary `workers.dev` address. PayPal Live requires its own final verification.

Cloudflare Workers custom domains need an active Cloudflare DNS zone. Wix does not allow nameserver changes for domains registered with Wix. If `mdsnmchll.com` is registered with Wix, this exact Workers setup requires transferring the registration to a provider that allows Cloudflare nameservers, or selecting a different hosting arrangement. Do not start a domain transfer or alter DNS without reviewing that choice first. Hosting can remain on Cloudflare's Free plan; a domain transfer may carry a registrar charge.

After Cloudflare DNS is active, add the tested Worker as the custom domain's origin. Preserve all existing email and verification records. Retain the existing GitHub Pages site until the cutover is verified.

## Editing

- Bead form wording and labels: `beads/src/OrderPage.tsx`
- Products, draft prices and palette names: `beads/src/catalog.ts`
- Bead form styling: `beads/src/styles.css`
- Existing homepage: `index.html`

Validation covers successful request persistence, repeated requests, server-side prices, session ownership, rejected cross-origin submissions, invalid options, disabled payments, studio authorization and escaped customer text. Live PayPal calls and a full visual browser check require the deployment and account setup.
