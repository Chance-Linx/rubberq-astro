'use client';

import { useState, useEffect } from 'react';

type CookiePreferences = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
};

type CategoryLabels = {
  preferencesTitle: string;
  customize: string;
  savePreferences: string;
  necessaryLabel: string;
  analyticsLabel: string;
  alwaysOn: string;
};

const categoryLabels: Record<string, CategoryLabels> = {
  en: {
    preferencesTitle: 'Cookie Categories',
    customize: 'Cookie settings',
    savePreferences: 'Save Preferences',
    necessaryLabel: 'Necessary cookies',
    analyticsLabel: 'Analytics cookies',
    alwaysOn: 'Always active',
  },
  zh: {
    preferencesTitle: 'Cookie 分类',
    customize: 'Cookie 设置',
    savePreferences: '保存偏好',
    necessaryLabel: '必要 Cookie',
    analyticsLabel: '分析 Cookie',
    alwaysOn: '始终开启',
  },
  de: {
    preferencesTitle: 'Cookie-Kategorien',
    customize: 'Cookie-Einstellungen',
    savePreferences: 'Einstellungen speichern',
    necessaryLabel: 'Notwendige Cookies',
    analyticsLabel: 'Analyse-Cookies',
    alwaysOn: 'Immer aktiv',
  },
  ja: {
    preferencesTitle: 'Cookieカテゴリ',
    customize: 'Cookie設定',
    savePreferences: '設定を保存',
    necessaryLabel: '必須Cookie',
    analyticsLabel: '分析Cookie',
    alwaysOn: '常に有効',
  },
  es: {
    preferencesTitle: 'Categorias de cookies',
    customize: 'Configurar cookies',
    savePreferences: 'Guardar preferencias',
    necessaryLabel: 'Cookies necesarias',
    analyticsLabel: 'Cookies analiticas',
    alwaysOn: 'Siempre activas',
  },
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
};

function persistPreferences(status: 'accepted' | 'declined' | 'custom', preferences: CookiePreferences) {
  localStorage.setItem(legacyConsentKey, status);
  localStorage.setItem(consentPrefsKey, JSON.stringify(preferences));
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

  const normalizedLocale = categoryLabels[locale] ? locale : 'en';
  const labels = categoryLabels[normalizedLocale];
  const privacyHref = normalizedLocale === 'en' ? '/privacy' : `/${normalizedLocale}/privacy`;

  useEffect(() => {
    const prefs = localStorage.getItem(consentPrefsKey);
    const consent = localStorage.getItem(legacyConsentKey);

    if (prefs) {
      try {
        const parsed = JSON.parse(prefs) as CookiePreferences;
        setAnalytics(!!parsed.analytics);
      } catch {
        setAnalytics(false);
      }
      return;
    }

    if (consent === 'accepted') {
      persistPreferences('accepted', {
        necessary: true,
        analytics: true,
        marketing: false,
        updatedAt: new Date().toISOString(),
      });
      return;
    }

    if (consent === 'declined') {
      persistPreferences('declined', {
        necessary: true,
        analytics: false,
        marketing: false,
        updatedAt: new Date().toISOString(),
      });
      return;
    }

    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 6000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
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
    <div className="fixed inset-x-0 bottom-0 z-[100] p-2 sm:p-3 md:p-4">
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
