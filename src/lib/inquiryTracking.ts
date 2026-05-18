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
