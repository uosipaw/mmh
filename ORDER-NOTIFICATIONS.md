# Owner order notifications

The Worker sends full order details by email using Resend and a compact SMS using Twilio. Notifications run after a successful order/capture response, with a five-minute scheduled catch-up. Only `awaiting_quote` requests and verified `paid` orders trigger alerts. Awaiting-payment checkouts do not trigger alerts.

## Activate in Cloudflare

In the **beads** Worker, open Settings → Variables and Secrets. Add these as **Secrets**, then deploy:

| Secret | Value |
| --- | --- |
| `ORDER_NOTIFY_EMAIL` | Owner's receiving email address |
| `RESEND_API_KEY` | Resend sending API key |
| `ORDER_EMAIL_FROM` | A sender address on a Resend-verified domain, e.g. `MDSN Beads <orders@your-domain>` |
| `ORDER_NOTIFY_PHONE` | Owner's receiving number in E.164 format, e.g. `+1…` |
| `TWILIO_ACCOUNT_SID` | Twilio Account SID |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token |
| `TWILIO_FROM_NUMBER` | Your Twilio number approved for SMS, in E.164 format |

Email and SMS activate independently when all secrets for that channel are present. The recipient values and credentials are never sent to the browser or committed to this repository. Trial providers may require verified recipients; a production sender needs the provider's required domain/number verification. SMS charges are determined by your Twilio account.

`NOTIFICATIONS_START_AT` in wrangler.jsonc excludes orders created before this feature was installed. Do not reset it on each deployment. The outbox table is created automatically; no manual D1 migration is required.

## Verify

Submit one clearly labeled test **order request** and confirm the email and text arrive and say **NOT PAID**. Retry the same request: it must not generate duplicate alerts. A paid alert requires a separately verified PayPal capture; do not edit order status in production to simulate payment.

Email includes customer contact details, shipping address, item, palette, length, quantity, arrangement, extras, notes, and price breakdown. SMS omits customer contact/address details. Orders remain saved even if a provider fails.

## Delivery review

The D1 `bead_notifications` table records `pending`, `sending`, `sent`, `failed`, or `unknown` for each order/event/channel. `sent` means the provider accepted the message, not that the inbox/carrier delivered it. Check Resend/Twilio delivery logs for final delivery. Explicit HTTP 429 throttling is retried after five minutes, at most five attempts. Rejected or ambiguous sends require review rather than automatic retries, preventing duplicate texts and charges. Interrupted `sending` records also require review. After checking provider logs, an administrator may reset an undelivered record to `pending` with attempts=0 and updated_at=0. Never reset a delivered record.

References: https://resend.com/docs/api-reference/emails/send-email and https://www.twilio.com/docs/messaging/api/message-resource
