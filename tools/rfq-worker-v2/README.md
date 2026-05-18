# RubberQ RFQ v2 Worker Contract

This folder is the handoff package for the deployed `rubberq-rfq-api` Worker.
The Worker source was not found in this repository or nearby local project paths, so the active Astro site now keeps the backend contract here until the deployed Worker repository is recovered.

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
      INSERT INTO inquiries (
        name, email, company, industry, message, fileLink,
        schema_version, inquiry_type, project_type, annual_volume, project_stage,
        quote_components_json, selected_products_json, product_type, target_material,
        material, sample_quantity, country, source_tracking_json, field_priority_json,
        lead_grade, quote_readiness, rfq_context_json,
        attachment_name, attachment_mime_type, attachment_size
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
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
