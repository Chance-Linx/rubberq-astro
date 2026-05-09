'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle, Loader2, Send, XCircle } from 'lucide-react';
import { buildFieldPriorityPayload, collectSourceTracking } from '../lib/inquiryTracking';

// ── Locale support ──────────────────────────────────────────────────────────
const locales = ['en', 'de', 'ja', 'es', 'zh'] as const;
type Locale = (typeof locales)[number];
const defaultLocale: Locale = 'en';

// ── Types ───────────────────────────────────────────────────────────────────
type ProductOption = {
  id: string;
  label: string;
};

// ── Inline translations (all 5 locales) ─────────────────────────────────────
interface Labels {
  name: string;
  email: string;
  company: string;
  country: string;
  annualVolume: string;
  targetMaterial: string;
  drawingLink: string;
  notes: string;
  productsTitle: string;
  productHint: string;
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
    country: 'Country',
    annualVolume: 'Estimated Annual Volume (pcs)',
    targetMaterial: 'Target Material (e.g. FKM, EPDM)',
    drawingLink: 'Drawing / Spec Link (Google Drive, Dropbox, etc.)',
    notes: 'Additional Notes / Special Requirements',
    productsTitle: 'Select Products to Quote',
    productHint: 'Please select at least one product.',
    submit: 'SUBMIT BATCH RFQ',
    submitting: 'SUBMITTING...',
    success: 'Batch RFQ submitted!',
    successMessage: 'We will review your request and respond within 24 hours.',
    error: 'Submission failed',
    errorMessage: 'Please try again later.',
  },
  zh: {
    name: '姓名',
    email: '邮箱地址',
    company: '公司名称',
    country: '国家/地区',
    annualVolume: '预计年产量（件）',
    targetMaterial: '目标材料（如 FKM、EPDM）',
    drawingLink: '图纸/规格链接（Google Drive、Dropbox等）',
    notes: '附加说明 / 特殊要求',
    productsTitle: '选择要报价的产品',
    productHint: '请至少选择一个产品。',
    submit: '提交批量询价',
    submitting: '提交中...',
    success: '批量询价已提交！',
    successMessage: '我们将审核您的请求并在24小时内回复。',
    error: '提交失败',
    errorMessage: '请稍后再试。',
  },
  de: {
    name: 'Vollständiger Name',
    email: 'E-Mail-Adresse',
    company: 'Firmenname',
    country: 'Land',
    annualVolume: 'Geschätzte Jahresmenge (Stk.)',
    targetMaterial: 'Zielmaterial (z. B. FKM, EPDM)',
    drawingLink: 'Zeichnungs-/Spezifikationslink (Google Drive, Dropbox usw.)',
    notes: 'Zusätzliche Hinweise / Besondere Anforderungen',
    productsTitle: 'Produkte für Angebot auswählen',
    productHint: 'Bitte wählen Sie mindestens ein Produkt aus.',
    submit: 'SAMMEL-RFQ ABSENDEN',
    submitting: 'WIRD GESENDET...',
    success: 'Sammel-RFQ eingereicht!',
    successMessage: 'Wir prüfen Ihre Anfrage und antworten innerhalb von 24 Stunden.',
    error: 'Anfrage fehlgeschlagen',
    errorMessage: 'Bitte versuchen Sie es später erneut.',
  },
  ja: {
    name: '氏名',
    email: 'メールアドレス',
    company: '会社名',
    country: '国',
    annualVolume: '推定年間数量（個）',
    targetMaterial: '対象材料（例：FKM、EPDM）',
    drawingLink: '図面/仕様リンク（Google Drive、Dropbox等）',
    notes: '追加メモ / 特別要件',
    productsTitle: '見積もり対象製品を選択',
    productHint: '少なくとも1つの製品を選択してください。',
    submit: '一括RFQを送信',
    submitting: '送信中...',
    success: '一括RFQを送信しました！',
    successMessage: 'ご依頼内容を確認し、24時間以内にご返信いたします。',
    error: '送信失敗',
    errorMessage: '後ほど再度お試しください。',
  },
  es: {
    name: 'Nombre completo',
    email: 'Correo electrónico',
    company: 'Nombre de empresa',
    country: 'País',
    annualVolume: 'Volumen anual estimado (piezas)',
    targetMaterial: 'Material objetivo (ej. FKM, EPDM)',
    drawingLink: 'Enlace de plano/especificación (Google Drive, Dropbox, etc.)',
    notes: 'Notas adicionales / Requisitos especiales',
    productsTitle: 'Seleccionar productos para cotizar',
    productHint: 'Seleccione al menos un producto.',
    submit: 'ENVIAR RFQ POR LOTE',
    submitting: 'ENVIANDO...',
    success: '¡RFQ por lote enviado!',
    successMessage: 'Revisaremos su solicitud y responderemos en 24 horas.',
    error: 'Envío fallido',
    errorMessage: 'Intente nuevamente más tarde.',
  },
};

// ── Component ───────────────────────────────────────────────────────────────
export default function BatchRfqForm({
  locale,
  productOptions,
}: {
  locale: string;
  productOptions: ProductOption[];
}) {
  const normalizedLocale = locales.includes(locale as Locale)
    ? (locale as Locale)
    : defaultLocale;
  const labels = labelsByLocale[normalizedLocale];

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const touchedFieldsRef = useRef(new Set<string>());
  const abandonTrackedRef = useRef(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    country: '',
    annualVolume: '',
    targetMaterial: '',
    drawingLink: '',
    notes: '',
  });

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    touchedFieldsRef.current.add(field);
  };

  const selectedProductNames = useMemo(
    () =>
      productOptions
        .filter((option) => selectedProducts.includes(option.id))
        .map((option) => option.label)
        .join(', '),
    [productOptions, selectedProducts],
  );

  const toggleProduct = (productId: string) => {
    touchedFieldsRef.current.add('selectedProducts');
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
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

    if (selectedProducts.length === 0) {
      setStatus('error');
      setErrorMsg(labels.productHint);
      return;
    }

    setStatus('submitting');
    setErrorMsg('');

    try {
      const pageUrl = window.location.href;
      const fieldPriority = buildFieldPriorityPayload(
        {
          name: formData.name,
          email: formData.email,
          country: formData.country,
          selectedProducts: selectedProducts.join(','),
        },
        {
          company: formData.company,
          annualVolume: formData.annualVolume,
          targetMaterial: formData.targetMaterial,
          drawingLink: formData.drawingLink,
          notes: formData.notes,
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
            industry: 'Batch RFQ',
            message: `Products: ${selectedProductNames}; Country: ${formData.country}; Annual Volume: ${formData.annualVolume}; Target Material: ${formData.targetMaterial}; Notes: ${formData.notes}`,
            fileLink: formData.drawingLink,
            inquiryType: 'batch_rfq',
            selectedProducts,
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
        setSelectedProducts([]);
        setFormData({
          name: '',
          email: '',
          company: '',
          country: '',
          annualVolume: '',
          targetMaterial: '',
          drawingLink: '',
          notes: '',
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
    <form onSubmit={handleSubmit} className="space-y-6 bg-industrial-50 border border-industrial-200 p-8">
      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-industrial-500 mb-3">
          {labels.productsTitle}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {productOptions.map((option) => (
            <label
              key={option.id}
              className="flex items-center gap-3 border border-industrial-200 bg-white px-4 py-3 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedProducts.includes(option.id)}
                onChange={() => toggleProduct(option.id)}
                className="w-4 h-4"
              />
              <span className="text-sm text-industrial-800">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <input
          value={formData.annualVolume}
          onChange={(e) => updateField('annualVolume', e.target.value)}
          placeholder={labels.annualVolume}
          className="w-full bg-white border border-industrial-200 px-4 py-3"
        />
        <input
          value={formData.targetMaterial}
          onChange={(e) => updateField('targetMaterial', e.target.value)}
          placeholder={labels.targetMaterial}
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
