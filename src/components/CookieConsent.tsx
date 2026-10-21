'use client';

import { useState, useEffect, useRef } from 'react';

type CookiePreferences = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
};

const legacyConsentKey = 'rubberq-cookie-consent';
const consentPrefsKey = 'rubberq-cookie-preferences';

type CookieConsentCopy = {
  title: string;
  descriptionPrefix: string;
  privacyLink: string;
  descriptionSuffix: string;
  decline: string;
  acceptAll: string;
  preferencesTitle: string;
  customize: string;
  savePreferences: string;
  necessaryLabel: string;
  analyticsLabel: string;
  alwaysOn: string;
};

function persistPreferences(status: 'accepted' | 'declined' | 'custom', preferences: CookiePreferences) {
  try {
    localStorage.setItem(consentPrefsKey, JSON.stringify(preferences));
    localStorage.setItem(legacyConsentKey, status);
  } catch { /* The current-page choice still applies if storage is unavailable. */ }
  window.dispatchEvent(new CustomEvent('rubberq-cookie-consent-updated', { detail: preferences }));
}

type CookieConsentProps = {
  locale?: string;
  messages: CookieConsentCopy;
};

const CookieConsent = ({ locale = 'en', messages }: CookieConsentProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  const normalizedLocale = ['en', 'de', 'ja', 'es', 'zh'].includes(locale) ? locale : 'en';
  const labels = messages;
  const panel = useRef<HTMLDivElement>(null);
  const privacyHref = normalizedLocale === 'en' ? '/privacy' : `/${normalizedLocale}/privacy`;

  useEffect(() => {
    let choice: boolean | null = null;
    try {
      const prefs = localStorage.getItem(consentPrefsKey);
      if (prefs) {
        const parsed = JSON.parse(prefs);
        if (typeof parsed?.analytics === 'boolean') choice = parsed.analytics;
      } else {
        const legacy = localStorage.getItem(legacyConsentKey);
        if (legacy === 'accepted' || legacy === 'declined') {
          choice = legacy === 'accepted';
          persistPreferences(legacy, { necessary: true, analytics: choice, marketing: false, updatedAt: new Date().toISOString() });
        }
      }
    } catch { /* Show the choice UI for unreadable storage. */ }
    setAnalytics(choice === true);
    if (choice === null) setIsVisible(true);
    const reopen = (event: MouseEvent) => {
      if (!(event.target instanceof Element) || !event.target.closest('[data-rq-cookie-settings]')) return;
      try {
        const stored = JSON.parse(localStorage.getItem(consentPrefsKey) || 'null');
        if (typeof stored?.analytics === 'boolean') setAnalytics(stored.analytics);
      } catch { /* Retain this page's current selection. */ }
      setShowPreferences(true);
      setIsVisible(true);
    };
    document.addEventListener('click', reopen);
    return () => document.removeEventListener('click', reopen);
  }, []);

  useEffect(() => { if (isVisible && showPreferences) panel.current?.focus(); }, [isVisible, showPreferences]);

  const handleAccept = () => {
    setAnalytics(true);
    persistPreferences('accepted', {
      necessary: true,
      analytics: true,
      marketing: false,
      updatedAt: new Date().toISOString(),
    });
    setIsVisible(false);
  };

  const handleDecline = () => {
    persistPreferences('declined', {
      necessary: true,
      analytics: false,
      marketing: false,
      updatedAt: new Date().toISOString(),
    });
    setAnalytics(false);
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    persistPreferences('custom', {
      necessary: true,
      analytics,
      marketing: false,
      updatedAt: new Date().toISOString(),
    });
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div ref={panel} role="region" aria-label={messages.title} tabIndex={-1} data-rq-cookie-panel className="fixed inset-x-0 bottom-0 z-[100] p-2 sm:p-3 md:p-4 max-h-[90vh] overflow-y-auto">
      <div className="mx-auto max-w-4xl border border-industrial-700 bg-industrial-900">
        <div className="flex flex-col gap-3 p-3 sm:p-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="mb-1 text-xs font-bold uppercase text-white sm:text-sm">{messages.title}</h3>
            <p className="max-w-3xl text-[11px] leading-5 text-industrial-200 sm:text-xs">
              {messages.descriptionPrefix} <a href={privacyHref} className="text-accent-orange underline hover:text-white transition-colors">{messages.privacyLink}</a> {messages.descriptionSuffix}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 md:flex md:shrink-0">
            <button
              type="button"
              onClick={() => setShowPreferences((value) => !value)}
              aria-expanded={showPreferences}
              className="rq-pressable min-h-9 border border-industrial-500 px-2 py-2 text-[10px] font-bold uppercase leading-tight text-white hover:bg-industrial-700 sm:text-xs"
            >
              {labels.customize}
            </button>
            <button
              type="button"
              onClick={handleDecline}
              className="rq-pressable min-h-9 border border-industrial-500 px-2 py-2 text-[10px] font-bold uppercase leading-tight text-white hover:bg-white hover:text-industrial-900 sm:text-xs"
            >
              {messages.decline}
            </button>
            <button
              type="button"
              onClick={handleAccept}
              className="rq-pressable min-h-9 bg-accent-orange px-2 py-2 text-[10px] font-bold uppercase leading-tight text-white hover:bg-white hover:text-industrial-900 sm:text-xs"
            >
              {messages.acceptAll}
            </button>
          </div>
        </div>

        {showPreferences && (
          <div className="border-t border-industrial-700 bg-industrial-800/70 p-3 sm:p-4">
            <h4 className="mb-3 text-xs font-bold uppercase text-industrial-300">{labels.preferencesTitle}</h4>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-white">
                <span>{labels.necessaryLabel}</span>
                <span className="text-xs uppercase text-industrial-300">{labels.alwaysOn}</span>
              </div>

              <label className="flex cursor-pointer items-center justify-between gap-6 text-sm text-white">
                <span>{labels.analyticsLabel}</span>
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(event) => setAnalytics(event.target.checked)}
                  className="h-4 w-4 accent-accent-orange"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={handleSavePreferences}
              className="rq-pressable mt-4 w-full border border-industrial-500 px-4 py-2 text-xs font-bold uppercase text-white hover:bg-industrial-700 sm:w-auto"
            >
              {labels.savePreferences}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CookieConsent;
