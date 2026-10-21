type PrimitiveValue = string | number | boolean | null | undefined;

type FieldMap = Record<string, PrimitiveValue>;
type AnalyticsValue = PrimitiveValue | string[];
type AnalyticsPayload = Record<string, AnalyticsValue>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (command: 'event' | 'config' | 'js', target: string | Date, params?: Record<string, PrimitiveValue>) => void;
  }
}

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
  sourcePage: string;
  cta: string;
  attributionMode: 'consented_session' | 'submission_context';
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

  try { return window.sessionStorage.getItem(key) ?? ''; }
  catch { return ''; }
}

function setStoredFirstTouch(key: string, value: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    if (!window.sessionStorage.getItem(key) && value) window.sessionStorage.setItem(key, value);
  } catch { /* A storage restriction must not prevent an inquiry. */ }
}

function analyticsAllowed(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const stored = window.localStorage.getItem('rubberq-cookie-preferences');
    if (stored) return JSON.parse(stored)?.analytics === true;
    return window.localStorage.getItem('rubberq-cookie-consent') === 'accepted';
  } catch { return false; }
}

function localSourcePath(raw: string | null, origin: string): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//') || /[\\\u0000-\u001f]/.test(raw)) return '';
  try { const url = new URL(raw, origin); return url.origin === origin ? url.pathname : ''; }
  catch { return ''; }
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

  const consented = analyticsAllowed();
  if (consented) {
    setStoredFirstTouch(FIRST_TOUCH_URL_KEY, pageUrl);
    setStoredFirstTouch(FIRST_TOUCH_REFERRER_KEY, referrer);
  }
  const firstTouchUrl = consented ? getStoredFirstTouch(FIRST_TOUCH_URL_KEY) : '';
  const firstTouchReferrer = consented ? getStoredFirstTouch(FIRST_TOUCH_REFERRER_KEY) : '';
  let referralPage = '';
  try { const from = new URL(referrer); if (from.origin === url.origin) referralPage = from.pathname; }
  catch { /* Direct visits have no referring page. */ }

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
    sourcePage: localSourcePath(url.searchParams.get('source'), url.origin) || referralPage,
    cta: (url.searchParams.get('cta') || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80),
    attributionMode: consented && firstTouchUrl ? 'consented_session' : 'submission_context',
    submittedAt: new Date().toISOString(),
  };
}

function normalizeAnalyticsPayload(payload: AnalyticsPayload): Record<string, PrimitiveValue> {
  return Object.fromEntries(
    Object.entries(payload)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return [key, value.join(',')];
        }

        return [key, normalizeValue(value)];
      })
      .filter(([, value]) => value !== null && value !== undefined && value !== '')
  );
}

export function trackGaEvent(eventName: string, payload: AnalyticsPayload = {}): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return;
  }

  window.gtag('event', eventName, normalizeAnalyticsPayload(payload));
}

export function trackQuoteRequest(location: string, payload: AnalyticsPayload = {}): void {
  trackGaEvent('quote_request', {
    category: 'conversion',
    location,
    ...payload,
  });
}

export function trackContactFormSubmit(result: 'success' | 'error', payload: AnalyticsPayload = {}): void {
  trackGaEvent('contact_form_submit', {
    category: 'conversion',
    result,
    ...payload,
  });
}

export function trackFormAbandon(inquiryType: string, payload: AnalyticsPayload = {}): void {
  trackGaEvent('form_abandon', {
    category: 'engagement',
    inquiryType,
    ...payload,
  });
}

export function trackDownload(fileName: string, fileType: string, payload: AnalyticsPayload = {}): void {
  trackGaEvent('file_download', {
    category: 'engagement',
    fileName,
    fileType,
    ...payload,
  });
}

export function trackOutboundLink(href: string, payload: AnalyticsPayload = {}): void {
  trackGaEvent('outbound_link_click', {
    category: 'engagement',
    href,
    ...payload,
  });
}
