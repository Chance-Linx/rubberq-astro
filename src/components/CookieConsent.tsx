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
  savePreferences: string;
  necessaryLabel: string;
  analyticsLabel: string;
  alwaysOn: string;
};

const categoryLabels: Record<string, CategoryLabels> = {
  en: {
    preferencesTitle: 'Cookie Categories',
    savePreferences: 'Save Preferences',
    necessaryLabel: 'Necessary cookies',
    analyticsLabel: 'Analytics cookies',
    alwaysOn: 'Always active',
  },
  zh: {
    preferencesTitle: 'Cookie 分类',
    savePreferences: '保存偏好',
    necessaryLabel: '必要 Cookie',
    analyticsLabel: '分析 Cookie',
    alwaysOn: '始终开启',
  },
  de: {
    preferencesTitle: 'Cookie-Kategorien',
    savePreferences: 'Einstellungen speichern',
    necessaryLabel: 'Notwendige Cookies',
    analyticsLabel: 'Analyse-Cookies',
    alwaysOn: 'Immer aktiv',
  },
  ja: {
    preferencesTitle: 'Cookieカテゴリ',
    savePreferences: '設定を保存',
    necessaryLabel: '必須Cookie',
    analyticsLabel: '分析Cookie',
    alwaysOn: '常に有効',
  },
  es: {
    preferencesTitle: 'Categorias de cookies',
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
  const [analytics, setAnalytics] = useState(false);

  const normalizedLocale = categoryLabels[locale] ? locale : 'en';
  const labels = categoryLabels[normalizedLocale];

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
      const timer = setTimeout(() => setIsVisible(true), 2000);
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
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 animate-in fade-in slide-in slide-in-from-bottom-10 duration-700">
      <div className="max-w-7xl mx-auto bg-industrial-900 border border-industrial-700 shadow-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-grow">
          <h3 className="text-white font-bold text-lg mb-2 uppercase tracking-tight">{messages.title}</h3>
          <p className="text-white text-sm leading-relaxed max-w-3xl">
            {messages.descriptionPrefix} <a href={`/${normalizedLocale}/privacy`} className="text-accent-orange underline hover:text-white transition-colors">{messages.privacyLink}</a> {messages.descriptionSuffix}
          </p>

          <div className="mt-5 border border-industrial-700 bg-industrial-800/60 p-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-industrial-300 mb-3">{labels.preferencesTitle}</h4>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-white">
                <span>{labels.necessaryLabel}</span>
                <span className="text-xs uppercase text-industrial-300">{labels.alwaysOn}</span>
              </div>

              <label className="flex items-center justify-between gap-6 text-sm text-white cursor-pointer">
                <span>{labels.analyticsLabel}</span>
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(event) => setAnalytics(event.target.checked)}
                  className="w-4 h-4"
                />
              </label>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
          <button
            onClick={handleSavePreferences}
            className="px-6 py-3 text-sm font-bold uppercase tracking-widest text-white border border-industrial-500 hover:bg-industrial-700 transition-all"
          >
            {labels.savePreferences}
          </button>
          <button 
            onClick={handleDecline}
            className="px-6 py-3 text-sm font-bold uppercase tracking-widest text-white border border-white hover:bg-white hover:text-industrial-900 transition-all"
          >
            {messages.decline}
          </button>
          <button 
            onClick={handleAccept}
            className="px-8 py-3 text-sm font-bold uppercase tracking-widest bg-accent-orange text-white hover:bg-white hover:text-industrial-900 transition-all shadow-lg"
          >
            {messages.acceptAll}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
