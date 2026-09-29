# Tarot accounts and paid AI setup

The GitHub Pages app remains usable without any backend configuration. `config.js` is intentionally empty until a Supabase project is provisioned. No payments can be collected until the server is explicitly enabled. The Stripe and Supabase ChatGPT connections do not supply runtime credentials to the website.

## What is implemented

- Email code sign-in, permanent UUID account IDs, unique usernames, opt-in public profiles and profile links.
- Private cloud copies of chosen local readings. Explicit save/update avoids silently importing a shared device's entire journal. The original device journal remains local; cloud copies do not overwrite it. This version does not automatically sync custom spreads or deck preferences.
- Public or single-recipient snapshots; owner revocation; private questions and notes excluded. Owners opt into allowing AI use by recipients.
- Free deterministic comparison and paid AI comparison of two selected cloud/shared readings.
- One-time Stripe Checkout purchases for an expanded interpretation or a comparison. Prices come from server-configured Stripe Prices; no subscription and no invented production price.
- Signed webhook grants the report entitlement. Server independently verifies the paid session, purchaser, amount, currency, successful payment intent, and refund/dispute status before generation. A browser redirect never grants access.
- Immutable report inputs, atomic generation claim, saved output, and three attempts per purchase. Successful reports reopen without another AI call. Retry failed requests using the existing order, not another purchase.
- AI receives only spread, card IDs, reversals, positions, date and deck. No names, email, private question, or notes. `store:false` is sent to the Responses API; this is not a promise of zero provider retention.

## Provision and deploy

1. Choose a Supabase organization and project region. Apply `supabase/migrations/202609290001_tarot.sql` to a new project. Existing projects require checking for table-name conflicts first.
2. Enable email authentication. Change the Magic Link email template to include the OTP `{{ .Token }}`. Set the Site URL to `https://mdsnmchll.com/tarot.html`. Configure production SMTP and email rate limits before opening public registration. The UI verifies the code directly, so it does not rely on a redirect login flow.
3. Add project URL and **publishable browser key only** to `tarot-studio/config.js`.
4. Deploy `supabase/functions/tarot-api` with `verify_jwt=false` as set in config.toml. Authenticated routes explicitly validate the bearer token through Supabase Auth. The webhook route verifies Stripe's signature instead.
5. Configure these server secrets in Supabase Edge Function Secrets (never in GitHub or chat):
   - `APP_ORIGIN=https://mdsnmchll.com` (no trailing slash)
   - `STRIPE_RESTRICTED_KEY`: restricted key with Checkout Sessions write/read, Prices read, PaymentIntents read and Charges read access; verify scopes against sandbox requests.
   - `STRIPE_INTERPRETATION_PRICE` and `STRIPE_COMPARISON_PRICE`: active one-time fixed prices. Agree on actual customer prices before configuring live mode.
   - `STRIPE_WEBHOOK_SECRET`: signing secret for the endpoint below.
   - `OPENAI_API_KEY` and `OPENAI_MODEL`: a model available in the project's account that supports Responses, instructions and max_output_tokens. Set a project spend limit.
   - `PAYMENTS_ENABLED=false` until the end-to-end tests pass. Built-in Supabase service credentials remain server-side.
6. Create Stripe webhook `https://PROJECT.supabase.co/functions/v1/tarot-api/webhook` for `checkout.session.completed`, `checkout.session.async_payment_succeeded`, and `checkout.session.async_payment_failed`. Use matching sandbox/live keys, prices and signing secret. API version: `2026-08-26.dahlia`. Fulfillment happens on signed webhook delivery even if the buyer never returns; AI generation starts when the purchaser requests their entitled report.
7. Use an isolated Stripe sandbox for initial integration tests. Set `PAYMENTS_ENABLED=true` in that sandbox deployment only once OpenAI and the signed webhook are configured. Live mode requires agreed pricing, successful tests and matching live configuration.

## Required deployment checks

Use two real test accounts A and B. Confirm B cannot fetch A's private readings by direct REST requests or edit A's profile. Share A's snapshot with B; test access, then revoke it. Confirm unrelated C cannot read the private share. Toggle public profile visibility. Test public share display signed out and sign-in code delivery on iPhone Safari.

Check successful payment, canceled checkout, delayed payment success/failure, duplicate webhook, invalid signature, another user's order ID, altered amount, refunded payment, and two concurrent Generate requests. Only a confirmed paid owned order may generate. Verify failed generation can retry the same purchase; completed reports reopen with no model call. Verify a revoked or AI-disallowed share cannot be used to create a new checkout. Previously purchased snapshots remain part of that purchaser's report.

Local tests (Node 24): `cd tests`, `npm install`, then `npm test`. The database migration is also exercised with PGlite during development under anon/authenticated/service roles. Production Supabase Auth, Stripe, SMTP, and OpenAI end-to-end tests are still required after provisioning.

## Operations and known limits

- A function terminated during generation may leave `processing`. Inspect the order and function logs before marking it `failed` for a retry. Never automatically reclaim a running job, which could duplicate a paid model call. Three failed attempts require operator recovery or a refund. Add a support contact to launch materials before charging customers.
- The order list retains canceled/unpaid attempts for recovery. Payments are gated by a 10-orders/hour per-account check; it is a basic abuse control, not a global rate-limit service. Add gateway limits and spending alerts before a large public launch.
- Revocation cannot retract copies people have already saved, including purchased report snapshots.
- Questions/notes are private cloud data; they are not sent to AI in this version. Account deletion and data-export self-service are not implemented; operators can fulfill requests through Supabase.
- The page includes a scoped meta CSP for GitHub Pages. If moving hosts, also serve CSP as a response header. The account SDK is version-pinned and loaded from esm.sh; no Stripe.js or card form is embedded.
- No secrets belong in source. Rotate any accidentally exposed keys immediately. Keep sandbox and production credentials separate.
