'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { locales, localeNames, localeFlags, type Locale } from '../lib/i18n';
import { useLocale, useTranslations } from '../lib/i18n' // was next-intl;
import { Globe, Check } from 'lucide-react';

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const rawPathname = usePathname();
  const currentLocale = useLocale() as Locale;
  const t = useTranslations();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function switchLocale(targetLocale: Locale) {
    setIsOpen(false);
    if (targetLocale === currentLocale) return;

    const pathname = rawPathname || '/';
    const segments = pathname.split('/');
    const hasLocalePrefix = locales.includes(segments[1] as Locale);
    const pathWithoutLocale = hasLocalePrefix ? `/${segments.slice(2).join('/')}` : pathname;
    const normalizedPath = pathWithoutLocale === '/' || pathWithoutLocale === '' ? '' : pathWithoutLocale;

    router.replace(`/${targetLocale}${normalizedPath}`);
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-11 h-11 inline-flex items-center justify-center text-industrial-500 hover:text-industrial-700 transition-colors duration-200"
        aria-label="Select language"
        title="Change language"
      >
        <Globe size={18} strokeWidth={1.5} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-sm shadow-xl border border-industrial-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="px-4 py-2 text-xs font-bold text-industrial-400 uppercase tracking-widest border-b border-industrial-50 mb-2">
            {t('language.title')}
          </div>
          {locales.map((locale) => (
            <button
              key={locale}
              onClick={() => switchLocale(locale)}
              className={`flex items-center justify-between w-full px-4 py-2.5 text-sm transition-colors duration-200 ${
                currentLocale === locale
                  ? 'bg-industrial-50 text-accent-orange font-medium'
                  : 'text-industrial-700 hover:bg-industrial-50 hover:text-industrial-900'
              }`}
            >
              <span className="flex items-center gap-3">
                <span className="text-lg">{localeFlags[locale]}</span>
                <span>{localeNames[locale]}</span>
              </span>
              {currentLocale === locale && <Check size={16} className="text-accent-orange" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
