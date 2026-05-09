type PrimitiveValue = string | number | boolean | null | undefined;

type FieldMap = Record<string, PrimitiveValue>;

export type FieldPriorityPayload = {
  required: FieldMap;
  optional: FieldMap;
  requiredFieldKeys: string[];
  optionalFieldKeys: string[];
};

export type SourceTrackingPayload = {
  pageUrl: string;
  pagePath: string;
  referrer: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmTerm: string;
  utmContent: string;
  firstTouchUrl: string;
  firstTouchReferrer: string;
  submittedAt: string;
};

const FIRST_TOUCH_URL_KEY = 'rubberq-first-touch-url';
const FIRST_TOUCH_REFERRER_KEY = 'rubberq-first-touch-referrer';

function normalizeValue(value: PrimitiveValue): PrimitiveValue {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeFieldMap(fields: FieldMap): FieldMap {
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [key, normalizeValue(value)])
  );
}

function getStoredFirstTouch(key: string): string {
  if (typeof window === 'undefined') {
    return '';
  }

  return window.sessionStorage.getItem(key) ?? '';
}

function setStoredFirstTouch(key: string, value: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  if (!window.sessionStorage.getItem(key) && value) {
    window.sessionStorage.setItem(key, value);
  }
}

export function buildFieldPriorityPayload(required: FieldMap, optional: FieldMap): FieldPriorityPayload {
  const normalizedRequired = normalizeFieldMap(required);
  const normalizedOptional = normalizeFieldMap(optional);

  return {
    required: normalizedRequired,
    optional: normalizedOptional,
    requiredFieldKeys: Object.keys(normalizedRequired),
    optionalFieldKeys: Object.keys(normalizedOptional),
  };
}

export function collectSourceTracking(pageUrl: string): SourceTrackingPayload {
  const url = new URL(pageUrl);
  const referrer = typeof document !== 'undefined' ? document.referrer : '';

  setStoredFirstTouch(FIRST_TOUCH_URL_KEY, pageUrl);
  setStoredFirstTouch(FIRST_TOUCH_REFERRER_KEY, referrer);

  const firstTouchUrl = getStoredFirstTouch(FIRST_TOUCH_URL_KEY) || pageUrl;
  const firstTouchReferrer = getStoredFirstTouch(FIRST_TOUCH_REFERRER_KEY) || referrer;

  return {
    pageUrl,
    pagePath: `${url.pathname}${url.search}`,
    referrer,
    utmSource: url.searchParams.get('utm_source') ?? '',
    utmMedium: url.searchParams.get('utm_medium') ?? '',
    utmCampaign: url.searchParams.get('utm_campaign') ?? '',
    utmTerm: url.searchParams.get('utm_term') ?? '',
    utmContent: url.searchParams.get('utm_content') ?? '',
    firstTouchUrl,
    firstTouchReferrer,
    submittedAt: new Date().toISOString(),
  };
}
