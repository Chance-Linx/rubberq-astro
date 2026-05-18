export const RFQ_V2_SCHEMA_VERSION = 'rfq-v2.2026-05-18';

export const VALID_INQUIRY_TYPES = new Set([
  'contact_rfq',
  'batch_rfq',
  'sample_request',
  'blog_subscribe',
]);

const VALID_PROJECT_TYPES = new Set(['drawing', 'application', 'sample', 'batch', 'other']);
const VALID_PROJECT_STAGES = new Set(['concept', 'feasibility', 'sample', 'tooling', 'production']);
const HIGH_VALUE_INDUSTRY_PATTERN = /(ev|energy|storage|semiconductor|ffkm|industrial|hydraulic|pneumatic)/i;
const HIGH_VALUE_MATERIAL_PATTERN = /(ffkm|fkm|hnbr|epdm|fluoro|perfluoro)/i;
const VOLUME_SCORE = {
  lessThan10k: 0,
  '10kTo100k': 1,
  '100kTo1m': 2,
  '1mTo5m': 3,
  over5m: 1,
};

export const RFQ_V2_D1_COLUMNS = [
  'schema_version',
  'inquiry_type',
  'project_type',
  'annual_volume',
  'project_stage',
  'quote_components_json',
  'selected_products_json',
  'product_type',
  'target_material',
  'material',
  'sample_quantity',
  'country',
  'source_tracking_json',
  'field_priority_json',
  'lead_grade',
  'quote_readiness',
  'rfq_context_json',
  'attachment_name',
  'attachment_mime_type',
  'attachment_size',
];

function normalizeString(value) {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value).trim();
}

function normalizeEnum(value, validValues, fallback) {
  const normalized = normalizeString(value);
  return validValues.has(normalized) ? normalized : fallback;
}

function normalizeArray(value) {
  if (Array.isArray(value)) {
    return value.map(normalizeString).filter(Boolean);
  }

  const normalized = normalizeString(value);
  if (!normalized) {
    return [];
  }

  return normalized
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function safeJson(value) {
  return JSON.stringify(value ?? null);
}

function normalizeAttachment(value) {
  const attachment = normalizeObject(value);
  const name = normalizeString(attachment.name);
  const mimeType = normalizeString(attachment.mimeType || attachment.type);
  const size = Number.isFinite(Number(attachment.size)) ? Number(attachment.size) : 0;
  const dataBase64 = normalizeString(attachment.dataBase64);

  if (!name && !dataBase64) {
    return null;
  }

  return {
    name,
    mimeType: mimeType || 'application/octet-stream',
    size,
    dataBase64,
  };
}

function emailLooksValid(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function createContext(normalized, raw) {
  const attachmentContext = normalized.attachment
    ? {
        name: normalized.attachment.name,
        mimeType: normalized.attachment.mimeType,
        size: normalized.attachment.size,
      }
    : null;

  return {
    schemaVersion: RFQ_V2_SCHEMA_VERSION,
    pageUrl: normalized.pageUrl,
    fileLink: normalized.fileLink,
    sourceTracking: normalized.sourceTracking,
    fieldPriority: normalized.fieldPriority,
    attachment: attachmentContext,
    rawKeys: Object.keys(raw || {}).sort(),
  };
}

function scoreLead(normalized) {
  let score = 0;

  if (normalized.company) score += 1;
  if (normalized.fileLink || normalized.attachment) score += 2;
  if (normalized.message && normalized.message.length >= 80) score += 1;
  if (normalized.projectType === 'drawing') score += 2;
  if (normalized.projectType === 'application') score += 1;
  if (normalized.quoteComponents.length > 0) score += 1;
  if (normalized.selectedProducts.length > 0) score += 1;
  score += VOLUME_SCORE[normalized.annualVolume] ?? 0;

  const valueText = [
    normalized.industry,
    normalized.productType,
    normalized.targetMaterial,
    normalized.material,
    normalized.message,
  ].join(' ');

  if (HIGH_VALUE_INDUSTRY_PATTERN.test(valueText)) score += 1;
  if (HIGH_VALUE_MATERIAL_PATTERN.test(valueText)) score += 1;

  if (score >= 8) return 'S';
  if (score >= 6) return 'A';
  if (score >= 3) return 'B';
  return 'C';
}

function classifyQuoteReadiness(normalized) {
  if (normalized.inquiryType === 'blog_subscribe') {
    return 'nurture';
  }

  if (normalized.inquiryType === 'sample_request') {
    return 'sample-follow-up';
  }

  if (
    normalized.projectType === 'drawing' &&
    (normalized.fileLink || normalized.attachment) &&
    normalized.annualVolume &&
    normalized.quoteComponents.length > 0
  ) {
    return 'quote-ready';
  }

  if (normalized.projectType === 'application' || normalized.message.length >= 80) {
    return 'engineering-review';
  }

  return 'low-context';
}

function requiredFieldErrors(normalized) {
  const errors = {};

  if (!normalized.email) {
    errors.email = 'Email is required.';
  } else if (!emailLooksValid(normalized.email)) {
    errors.email = 'Email format is invalid.';
  }

  if (normalized.inquiryType !== 'blog_subscribe' && !normalized.name) {
    errors.name = 'Name is required.';
  }

  if (normalized.inquiryType === 'contact_rfq' && !normalized.message) {
    errors.message = 'Project requirements are required.';
  }

  if (normalized.inquiryType === 'batch_rfq' && normalized.selectedProducts.length === 0) {
    errors.selectedProducts = 'Select at least one product family.';
  }

  if (normalized.inquiryType === 'sample_request') {
    if (!normalized.productType) errors.productType = 'Product type is required.';
    if (!normalized.country) errors.country = 'Destination country is required.';
  }

  return errors;
}

export function normalizeRfqPayload(rawPayload, requestMeta = {}) {
  const raw = normalizeObject(rawPayload);
  const inquiryType = normalizeEnum(raw.inquiryType, VALID_INQUIRY_TYPES, 'contact_rfq');
  const selectedProducts = normalizeArray(raw.selectedProducts);
  const quoteComponents = normalizeArray(raw.quoteComponents);
  const projectTypeFallback =
    inquiryType === 'sample_request' ? 'sample' : inquiryType === 'batch_rfq' ? 'batch' : 'drawing';

  const normalized = {
    schemaVersion: RFQ_V2_SCHEMA_VERSION,
    submittedAt: normalizeString(raw.submittedAt) || new Date().toISOString(),
    requestId: normalizeString(requestMeta.requestId) || crypto.randomUUID(),
    inquiryType,
    name: normalizeString(raw.name),
    email: normalizeString(raw.email).toLowerCase(),
    company: normalizeString(raw.company),
    industry: normalizeString(raw.industry),
    message: normalizeString(raw.message),
    fileLink: normalizeString(raw.fileLink || raw.drawingLink),
    projectType: normalizeEnum(raw.projectType, VALID_PROJECT_TYPES, projectTypeFallback),
    annualVolume: normalizeString(raw.annualVolume),
    projectStage: normalizeEnum(raw.projectStage, VALID_PROJECT_STAGES, ''),
    quoteComponents,
    selectedProducts,
    productType: normalizeString(raw.productType),
    targetMaterial: normalizeString(raw.targetMaterial),
    material: normalizeString(raw.material),
    sampleQuantity: normalizeString(raw.quantity || raw.sampleQuantity),
    country: normalizeString(raw.country),
    pageUrl: normalizeString(raw.pageUrl),
    sourceTracking: normalizeObject(raw.sourceTracking),
    fieldPriority: normalizeObject(raw.fieldPriority),
    attachment: normalizeAttachment(raw.attachment),
  };

  normalized.leadGrade = scoreLead(normalized);
  normalized.quoteReadiness = classifyQuoteReadiness(normalized);
  normalized.rfqContext = createContext(normalized, raw);

  const errors = requiredFieldErrors(normalized);
  if (Object.keys(errors).length > 0) {
    return {
      ok: false,
      error: 'RFQ payload validation failed.',
      errors,
    };
  }

  return {
    ok: true,
    value: normalized,
  };
}

export function toD1ColumnValues(normalized) {
  return {
    schema_version: normalized.schemaVersion,
    inquiry_type: normalized.inquiryType,
    project_type: normalized.projectType,
    annual_volume: normalized.annualVolume,
    project_stage: normalized.projectStage,
    quote_components_json: safeJson(normalized.quoteComponents),
    selected_products_json: safeJson(normalized.selectedProducts),
    product_type: normalized.productType,
    target_material: normalized.targetMaterial,
    material: normalized.material,
    sample_quantity: normalized.sampleQuantity,
    country: normalized.country,
    source_tracking_json: safeJson(normalized.sourceTracking),
    field_priority_json: safeJson(normalized.fieldPriority),
    lead_grade: normalized.leadGrade,
    quote_readiness: normalized.quoteReadiness,
    rfq_context_json: safeJson(normalized.rfqContext),
    attachment_name: normalized.attachment?.name || '',
    attachment_mime_type: normalized.attachment?.mimeType || '',
    attachment_size: normalized.attachment?.size || 0,
  };
}

export function toD1UpdateArgs(normalized) {
  const values = toD1ColumnValues(normalized);

  return {
    columns: RFQ_V2_D1_COLUMNS,
    placeholders: RFQ_V2_D1_COLUMNS.map(() => '?').join(', '),
    values: RFQ_V2_D1_COLUMNS.map((column) => values[column]),
  };
}

function escapeHtml(value) {
  return normalizeString(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function renderRows(rows) {
  return rows
    .filter(([, value]) => {
      if (Array.isArray(value)) return value.length > 0;
      return normalizeString(value).length > 0;
    })
    .map(([label, value]) => {
      const displayValue = Array.isArray(value) ? value.join(', ') : value;
      return `<tr><th align="left" style="padding:6px 12px;border-bottom:1px solid #e5e5e5;">${escapeHtml(label)}</th><td style="padding:6px 12px;border-bottom:1px solid #e5e5e5;">${escapeHtml(displayValue)}</td></tr>`;
    })
    .join('');
}

export function renderRfqEmail(normalized) {
  const subject = `[${normalized.leadGrade}] RubberQ ${normalized.inquiryType}: ${normalized.company || normalized.email}`;
  const rows = [
    ['Lead grade', normalized.leadGrade],
    ['Quote readiness', normalized.quoteReadiness],
    ['Inquiry type', normalized.inquiryType],
    ['Name', normalized.name],
    ['Email', normalized.email],
    ['Company', normalized.company],
    ['Industry', normalized.industry],
    ['Project type', normalized.projectType],
    ['Annual volume', normalized.annualVolume],
    ['Project stage', normalized.projectStage],
    ['Quote components', normalized.quoteComponents],
    ['Selected products', normalized.selectedProducts],
    ['Product type', normalized.productType],
    ['Target material', normalized.targetMaterial || normalized.material],
    ['Sample quantity', normalized.sampleQuantity],
    ['Country', normalized.country],
    ['File link', normalized.fileLink],
    ['Attachment', normalized.attachment?.name || ''],
    ['Page URL', normalized.pageUrl],
  ];

  const html = `
    <h2>RubberQ RFQ v2</h2>
    <p><strong>Project message:</strong></p>
    <p>${escapeHtml(normalized.message || 'No message provided.')}</p>
    <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;font-family:Arial,sans-serif;font-size:14px;">
      ${renderRows(rows)}
    </table>
  `;

  const text = rows
    .filter(([, value]) => normalizeString(Array.isArray(value) ? value.join(', ') : value))
    .map(([label, value]) => `${label}: ${Array.isArray(value) ? value.join(', ') : value}`)
    .join('\n');

  return {
    subject,
    html,
    text: `RubberQ RFQ v2\n\nProject message:\n${normalized.message || 'No message provided.'}\n\n${text}`,
  };
}

if (typeof process !== 'undefined' && process.argv.includes('--self-test')) {
  const result = normalizeRfqPayload({
    name: 'Alex Buyer',
    email: 'alex@example.com',
    company: 'EV Pack Integrator',
    industry: 'EV & Energy Storage',
    inquiryType: 'contact_rfq',
    projectType: 'drawing',
    annualVolume: '100kTo1m',
    projectStage: 'feasibility',
    quoteComponents: ['compoundDev', 'moldCost', 'perPiece'],
    message: 'We need a compact FKM seal for thermal management validation and have CAD drawings ready for review.',
    fileLink: 'https://example.com/drawing',
  });

  if (!result.ok) {
    console.error(result);
    process.exit(1);
  }

  const email = renderRfqEmail(result.value);
  console.log(JSON.stringify({ normalized: result.value, d1: toD1ColumnValues(result.value), email }, null, 2));
}
