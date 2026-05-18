# RubberQ RFQ v2 Worker Contract

This folder is the handoff package for the deployed `rubberq-rfq-api` Worker.
The Worker was originally deployed from Cloudflare Dashboard / Quick Editor, so the active Astro site keeps the backend contract here until the Worker source is restored into version control.

Confirmed production resources via Wrangler on 2026-05-18:

- Worker: `rubberq-rfq-api`
- D1 binding: `DB`
- D1 database: `rubberq_rfq`
- D1 table: `rfqs`
- Existing Worker secret: `RESEND_API_KEY`
- Existing plain-text bindings: `ALLOWED_ORIGIN`, `FROM_EMAIL`, `TO_EMAIL`

## What "Worker input schema" means

The Worker input schema is the agreed JSON shape that the website sends to the Cloudflare Worker, and that the Worker validates before writing to D1 and sending the Resend notification.

For RFQ v2, the Worker must continue accepting legacy fields:

- `name`
- `email`
- `company`
- `industry`
- `message`
- `fileLink`
- `attachment`
- `inquiryType`

It must also accept these v2 fields:

- `projectType`
- `annualVolume`
- `projectStage`
- `quoteComponents[]`
- `selectedProducts[]`
- `productType`
- `material`
- `targetMaterial`
- `quantity`
- `country`
- `sourceTracking`
- `fieldPriority`

## Files

- `rfq-v2-contract.mjs` normalizes and validates incoming payloads, grades lead quality, produces D1 column values, and renders a structured Resend email.
- `migrations/2026-05-18-rfq-v2-fields.sql` adds RFQ v2 columns to the existing D1 table.
- `worker.mjs` is a deployable Worker entrypoint rebuilt around the RFQ v2 contract.
- `wrangler.toml` targets the existing production Worker name and D1 binding.

## Worker integration sketch

```js
import {
  normalizeRfqPayload,
  renderRfqEmail,
  toD1ColumnValues,
} from './rfq-v2-contract.mjs';

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    if (request.method !== 'POST') {
      return json({ ok: false, error: 'Method not allowed.' }, 405, request);
    }

    let rawPayload;
    try {
      rawPayload = await request.json();
    } catch {
      return json({ ok: false, error: 'Invalid JSON body.' }, 400, request);
    }

    const normalized = normalizeRfqPayload(rawPayload, {
      requestId: request.headers.get('cf-ray') || crypto.randomUUID(),
    });

    if (!normalized.ok) {
      return json(normalized, 400, request);
    }

    const lead = normalized.value;
    const d1 = toD1ColumnValues(lead);

    await env.DB.prepare(`
      INSERT INTO rfqs (
        name, email, company, industry, message, fileLink, pageUrl,
        schema_version, inquiry_type, project_type, annual_volume, project_stage,
        quote_components_json, selected_products_json, product_type, target_material,
        material, sample_quantity, country, source_tracking_json, field_priority_json,
        lead_grade, quote_readiness, rfq_context_json,
        attachment_name, attachment_mime_type, attachment_size
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?
      )
    `).bind(
      lead.name,
      lead.email,
      lead.company,
      lead.industry,
      lead.message,
      lead.fileLink,
      lead.pageUrl,
      d1.schema_version,
      d1.inquiry_type,
      d1.project_type,
      d1.annual_volume,
      d1.project_stage,
      d1.quote_components_json,
      d1.selected_products_json,
      d1.product_type,
      d1.target_material,
      d1.material,
      d1.sample_quantity,
      d1.country,
      d1.source_tracking_json,
      d1.field_priority_json,
      d1.lead_grade,
      d1.quote_readiness,
      d1.rfq_context_json,
      d1.attachment_name,
      d1.attachment_mime_type,
      d1.attachment_size
    ).run();

    const email = renderRfqEmail(lead);
    await sendWithResend(env.RESEND_API_KEY, {
      from: env.LEAD_FROM_EMAIL,
      to: env.LEAD_TO_EMAIL || 'contact@rubberq.com',
      reply_to: lead.email,
      subject: email.subject,
      html: email.html,
      text: email.text,
    });

    return json({ ok: true, leadGrade: lead.leadGrade, quoteReadiness: lead.quoteReadiness }, 200, request);
  },
};
```

Keep production Worker changes aligned with Cloudflare Worker practices:

- Use D1 bindings (`env.DB`) instead of Cloudflare REST calls from inside the Worker.
- Keep Resend credentials in `wrangler secret`, not source or config.
- Await all D1 and Resend promises before returning, or explicitly use `ctx.waitUntil()` for non-critical follow-up work.
- Keep CORS allowlists explicit for `https://rubberq.com`, `https://www.rubberq.com`, and local preview origins.

## Local contract check

```bash
node tools/rfq-worker-v2/rfq-v2-contract.mjs --self-test
```

## Production migration note

The active database table is `rfqs`, not `inquiries`. Apply the migration only after confirming the table still has not received these v2 columns:

```bash
npx wrangler d1 execute rubberq_rfq --remote --command "PRAGMA table_info(rfqs);"
npx wrangler d1 execute rubberq_rfq --remote --file tools/rfq-worker-v2/migrations/2026-05-18-rfq-v2-fields.sql
```

If the Worker is rebuilt from this contract, deploy to the existing Worker name `rubberq-rfq-api` and keep the existing secret/bindings. Keep rollback version `97faf548-8795-4992-9b9b-363366da6896` available until a live RFQ test passes.

Dry-run the rebuilt Worker bundle before production deployment:

```bash
npx wrangler deploy --config tools/rfq-worker-v2/wrangler.toml --dry-run --outdir /tmp/rubberq-rfq-worker-build
```

Production deployment, after D1 migration and a final review:

```bash
npx wrangler deploy --config tools/rfq-worker-v2/wrangler.toml --message "RFQ v2 schema and lead grading"
```

## Production status on 2026-05-18

The production upgrade has been applied to the existing resources. No second D1 database was created.

- D1 database `rubberq_rfq` was migrated in place.
- Active table is `rfqs`.
- Worker `rubberq-rfq-api` was deployed from `tools/rfq-worker-v2/worker.mjs`.
- Active deployed version after this upgrade: `98ef9d07-83cb-4f41-9478-47d4464e38c3`.
- Rollback version kept for reference: `97faf548-8795-4992-9b9b-363366da6896`.

Local end-to-end POST testing from this machine could not reach `*.workers.dev`; both `https://workers.dev` and the Worker endpoint timed out from the local network. D1 was queried afterward and no `codex-test@example.com` row was written.

Recommended remaining live check:

```bash
curl -i https://rubberq-rfq-api.midnightblue-lin.workers.dev \
  -H 'content-type: application/json' \
  -H 'origin: https://rubberq.com' \
  --data '{"name":"Codex Test","email":"codex-test@example.com","company":"RubberQ Test","industry":"EV / Energy Storage","message":"RFQ v2 live connectivity test.","inquiryType":"contact_rfq","projectType":"application_driven","annualVolume":"100k_500k","projectStage":"sample_validation","quoteComponents":["unit_price","sample"],"country":"US","pageUrl":"https://rubberq.com/en/contact"}'
```

Run the live check only from a network that can access `workers.dev`, or after the Worker is mapped under a RubberQ-owned hostname.
