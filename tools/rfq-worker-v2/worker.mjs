import {
  normalizeRfqPayload,
  renderRfqEmail,
  toD1ColumnValues,
} from './rfq-v2-contract.mjs';

const DEFAULT_ALLOWED_ORIGINS = [
  'https://rubberq.com',
  'https://www.rubberq.com',
  'http://localhost:4321',
  'http://127.0.0.1:4321',
];

function allowedOrigins(env) {
  const configured = String(env.ALLOWED_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return new Set([...DEFAULT_ALLOWED_ORIGINS, ...configured]);
}

function corsHeaders(request, env) {
  const origin = request.headers.get('Origin') || '';
  const allowed = allowedOrigins(env);
  const allowOrigin = allowed.has(origin) ? origin : 'https://rubberq.com';

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function json(request, env, body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...corsHeaders(request, env),
    },
  });
}

async function sendWithResend(env, message) {
  if (!env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY secret is not configured.');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Resend error ${response.status}: ${text.slice(0, 500)}`);
  }

  return response.json();
}

async function insertRfq(env, lead) {
  const d1 = toD1ColumnValues(lead);

  return env.DB.prepare(`
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
  `)
    .bind(
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
    )
    .run();
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(request, env),
      });
    }

    if (request.method !== 'POST') {
      return json(request, env, { ok: false, error: 'Method not allowed.' }, 405);
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return json(request, env, { ok: false, error: 'Invalid JSON body.' }, 400);
    }

    const normalized = normalizeRfqPayload(payload, {
      requestId: request.headers.get('cf-ray') || crypto.randomUUID(),
    });

    if (!normalized.ok) {
      return json(request, env, normalized, 400);
    }

    const lead = normalized.value;

    try {
      await insertRfq(env, lead);

      const email = renderRfqEmail(lead);
      await sendWithResend(env, {
        from: env.FROM_EMAIL || 'RubberQ RFQ <onboarding@resend.dev>',
        to: env.TO_EMAIL || 'sales@rubberq.com',
        reply_to: lead.email,
        subject: email.subject,
        html: email.html,
        text: email.text,
      });

      return json(request, env, {
        ok: true,
        leadGrade: lead.leadGrade,
        quoteReadiness: lead.quoteReadiness,
      });
    } catch (error) {
      console.error('RFQ submission failed:', error);
      return json(request, env, {
        ok: false,
        error: 'Submission failed. Please email sales@rubberq.com directly.',
      }, 500);
    }
  },
};
