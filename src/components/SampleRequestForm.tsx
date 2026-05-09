'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { Loader2, Send, CheckCircle, XCircle } from 'lucide-react';
import { buildFieldPriorityPayload, collectSourceTracking } from '../lib/inquiryTracking';

// ── Locale support ──────────────────────────────────────────────────────────
const locales = ['en', 'de', 'ja', 'es', 'zh'] as const;
type Locale = (typeof locales)[number];
const defaultLocale: Locale = 'en';

// ── Inline translations (all 5 locales) ─────────────────────────────────────
interface Labels {
  name: string;
  email: string;
  company: string;
  productType: string;
  material: string;
  quantity: string;
  country: string;
  notes: string;
  drawingLink: string;
  submit: string;
  submitting: string;
  success: string;
  successMessage: string;
  error: string;
  errorMessage: string;
}

const labelsByLocale: Record<Locale, Labels> = {
  en: {
    name: 'Full Name',
    email: 'Email Address',
    company: 'Company Name',
    productType: 'Product Type',
    material: 'Target Material (e.g. FKM, NBR)',
    quantity: 'Quantity (pcs)',
    country: 'Country',
    notes: 'Special Requirements / Notes',
    drawingLink: 'Drawing / Spec Link (Google Drive, Dropbox, etc.)',
    submit: 'REQUEST SAMPLES',
    submitting: 'SUBMITTING...',
    success: 'Request submitted!',
    successMessage: 'We will review your sample request and respond within 24 hours.',
    error: 'Submission failed',
    errorMessage: 'Please try again later.',
  },
  zh: {
    name: '姓名',
    email: '邮箱地址',
    company: '公司名称',
    productType: '产品类型',
    material: '目标材料（如 FKM、NBR）',
    quantity: '数量（件）',
    country: '国家/地区',
    notes: '特殊要求 / 备注',
    drawingLink: '图纸/规格链接（Google Drive、Dropbox等）',
    submit: '申请样品',
    submitting: '提交中...',
    success: '申请已提交！',
    successMessage: '我们将审核您的样品申请并在24小时内回复。',
    error: '提交失败',
    errorMessage: '请稍后再试。',
  },
  de: {
    name: 'Vollständiger Name',
    email: 'E-Mail-Adresse',
    company: 'Firmenname',
    productType: 'Produkttyp',
    material: 'Zielmaterial (z. B. FKM, NBR)',
    quantity: 'Menge (Stk.)',
    country: 'Land',
    notes: 'Besondere Anforderungen / Notizen',
    drawingLink: 'Zeichnungs-/Spezifikationslink (Google Drive, Dropbox usw.)',
    submit: 'MUSTER ANFORDERN',
    submitting: 'WIRD GESENDET...',
    success: 'Anfrage eingereicht!',
    successMessage: 'Wir prüfen Ihre Musteranfrage und antworten innerhalb von 24 Stunden.',
    error: 'Anfrage fehlgeschlagen',
    errorMessage: 'Bitte versuchen Sie es später erneut.',
  },
  ja: {
    name: '氏名',
    email: 'メールアドレス',
    company: '会社名',
    productType: '製品タイプ',
    material: '対象材料（例：FKM、NBR）',
    quantity: '数量（個）',
    country: '国',
    notes: '特別要件 / 備考',
    drawingLink: '図面/仕様リンク（Google Drive、Dropbox等）',
    submit: 'サンプルを依頼',
    submitting: '送信中...',
    success: '依頼を送信しました！',
    successMessage: 'サンプル依頼を確認し、24時間以内にご返信いたします。',
    error: '送信失敗',
    errorMessage: '後ほど再度お試しください。',
  },
  es: {
    name: 'Nombre completo',
    email: 'Correo electrónico',
    company: 'Nombre de empresa',
    productType: 'Tipo de producto',
    material: 'Material objetivo (ej. FKM, NBR)',
    quantity: 'Cantidad (piezas)',
    country: 'País',
    notes: 'Requisitos especiales / Notas',
    drawingLink: 'Enlace de plano/especificación (Google Drive, Dropbox, etc.)',
    submit: 'SOLICITAR MUESTRAS',
    submitting: 'ENVIANDO...',
    success: '¡Solicitud enviada!',
    successMessage: 'Revisaremos su solicitud de muestras y responderemos en 24 horas.',
    error: 'Envío fallido',
    errorMessage: 'Intente nuevamente más tarde.',
  },
};

// ── Component ───────────────────────────────────────────────────────────────
export default function SampleRequestForm({ locale }: { locale: string }) {
  const normalizedLocale = locales.includes(locale as Locale)
    ? (locale as Locale)
    : defaultLocale;
  const labels = labelsByLocale[normalizedLocale];

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const touchedFieldsRef = useRef(new Set<string>());
  const abandonTrackedRef = useRef(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    productType: 'Seals & O-Rings',
    material: 'FKM',
    quantity: '50',
    country: '',
    notes: '',
    drawingLink: '',
  });

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    touchedFieldsRef.current.add(field);
  };

  useEffect(() => {
    const trackAbandon = (source: string) => {
      if (abandonTrackedRef.current || hasSubmitted || status === 'success' || touchedFieldsRef.current.size === 0) {
        return;
      }
      abandonTrackedRef.current = true;
    };

    const handleBeforeUnload = () => trackAbandon('beforeunload');
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        trackAbandon('visibilitychange');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      trackAbandon('unmount');
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [hasSubmitted, status]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');

    try {
      const pageUrl = window.location.href;
      const fieldPriority = buildFieldPriorityPayload(
        {
          name: formData.name,
          email: formData.email,
          productType: formData.productType,
          country: formData.country,
        },
        {
          company: formData.company,
          material: formData.material,
          quantity: formData.quantity,
          notes: formData.notes,
          drawingLink: formData.drawingLink,
        },
      );

      const res = await fetch(
        'https://rubberq-rfq-api.midnightblue-lin.workers.dev',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            company: formData.company,
            industry: `Sample Request / ${formData.productType}`,
            message: `Material: ${formData.material}; Qty: ${formData.quantity}; Country: ${formData.country}; Notes: ${formData.notes}`,
            fileLink: formData.drawingLink,
            inquiryType: 'sample_request',
            pageUrl,
            sourceTracking: collectSourceTracking(pageUrl),
            fieldPriority,
          }),
        },
      );

      const data = await res.json();

      if (data.ok) {
        setStatus('success');
        setHasSubmitted(true);
        setFormData({
          name: '',
          email: '',
          company: '',
          productType: 'Seals & O-Rings',
          material: 'FKM',
          quantity: '50',
          country: '',
          notes: '',
          drawingLink: '',
        });
        touchedFieldsRef.current.clear();
        abandonTrackedRef.current = false;
      } else {
        setStatus('error');
        setErrorMsg(data.error || labels.errorMessage);
      }
    } catch {
      setStatus('error');
      setErrorMsg(labels.errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-industrial-50 border border-industrial-200 p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <input
          required
          value={formData.name}
          onChange={(e) => updateField('name', e.target.value)}
          placeholder={labels.name}
          className="w-full bg-white border border-industrial-200 px-4 py-3"
        />
        <input
          type="email"
          required
          value={formData.email}
          onChange={(e) => updateField('email', e.target.value)}
          placeholder={labels.email}
          className="w-full bg-white border border-industrial-200 px-4 py-3"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <input
          value={formData.company}
          onChange={(e) => updateField('company', e.target.value)}
          placeholder={labels.company}
          className="w-full bg-white border border-industrial-200 px-4 py-3"
        />
        <input
          required
          value={formData.country}
          onChange={(e) => updateField('country', e.target.value)}
          placeholder={labels.country}
          className="w-full bg-white border border-industrial-200 px-4 py-3"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <select
          value={formData.productType}
          onChange={(e) => updateField('productType', e.target.value)}
          className="w-full bg-white border border-industrial-200 px-4 py-3"
        >
          <option>Seals & O-Rings</option>
          <option>Gaskets & Washers</option>
          <option>Bellows & Boots</option>
          <option>Custom Molded Parts</option>
        </select>
        <input
          value={formData.material}
          onChange={(e) => updateField('material', e.target.value)}
          placeholder={labels.material}
          className="w-full bg-white border border-industrial-200 px-4 py-3"
        />
        <input
          value={formData.quantity}
          onChange={(e) => updateField('quantity', e.target.value)}
          placeholder={labels.quantity}
          className="w-full bg-white border border-industrial-200 px-4 py-3"
        />
      </div>

      <input
        type="url"
        value={formData.drawingLink}
        onChange={(e) => updateField('drawingLink', e.target.value)}
        placeholder={labels.drawingLink}
        className="w-full bg-white border border-industrial-200 px-4 py-3"
      />

      <textarea
        rows={4}
        value={formData.notes}
        onChange={(e) => updateField('notes', e.target.value)}
        placeholder={labels.notes}
        className="w-full bg-white border border-industrial-200 px-4 py-3"
      />

      {status === 'success' && (
        <div className="bg-green-50 border border-green-200 p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <p className="font-bold text-green-900">{labels.success}</p>
            <p className="text-sm text-green-700">{labels.successMessage}</p>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 p-4 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <p className="font-bold text-red-900">{labels.error}</p>
            <p className="text-sm text-red-700">{errorMsg || labels.errorMessage}</p>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full bg-industrial-900 text-white py-4 font-bold flex items-center justify-center gap-2 hover:bg-accent-orange transition-colors disabled:opacity-50"
      >
        {status === 'submitting' ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {labels.submitting}
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            {labels.submit}
          </>
        )}
      </button>
    </form>
  );
}
