'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle, Loader2, Send, XCircle } from 'lucide-react';
import { buildFieldPriorityPayload, collectSourceTracking } from '../../lib/inquiryTracking';

type ProductOption = {
  id: string;
  label: string;
};

interface BatchRfqLabels {
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

export default function BatchRfqForm({
  labels,
  productOptions,
}: {
  labels: BatchRfqLabels;
  productOptions: ProductOption[];
}) {
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
    [productOptions, selectedProducts]
  );

  const toggleProduct = (productId: string) => {
    touchedFieldsRef.current.add('selectedProducts');
    setSelectedProducts((prev) => (prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]));
  };

  useEffect(() => {
    const trackAbandon = (source: string) => {
      if (abandonTrackedRef.current || hasSubmitted || status === 'success' || touchedFieldsRef.current.size === 0) {
        return;
      }

      // gaEvents.trackFormAbandon('batch_rfq', {
      //   touchedFields: touchedFieldsRef.current.size,
      //   source,
      // });
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

    // gaEvents.trackQuoteRequest('batch_rfq_page');

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
        }
      );

      const res = await fetch('https://rubberq-rfq-api.midnightblue-lin.workers.dev', {
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
      });

      const data = await res.json();

      if (data.ok) {
        setStatus('success');
        setHasSubmitted(true);
        // gaEvents.trackContactFormSubmit('success');
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
        // gaEvents.trackContactFormSubmit('error');
        setErrorMsg(data.error || labels.errorMessage);
      }
    } catch {
      setStatus('error');
      // gaEvents.trackContactFormSubmit('error');
      setErrorMsg(labels.errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-industrial-50 border border-industrial-200 p-8">
      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-industrial-500 mb-3">{labels.productsTitle}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {productOptions.map((option) => (
            <label key={option.id} className="flex items-center gap-3 border border-industrial-200 bg-white px-4 py-3 cursor-pointer">
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
        <div className="bg-industrial-50 border border-industrial-200 p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-accent-orange mt-0.5" />
          <div>
            <p className="font-bold text-industrial-900">{labels.success}</p>
            <p className="text-sm text-industrial-700">{labels.successMessage}</p>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="bg-industrial-50 border border-accent-orange p-4 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-accent-orange mt-0.5" />
          <div>
            <p className="font-bold text-industrial-900">{labels.error}</p>
            <p className="text-sm text-industrial-700">{errorMsg || labels.errorMessage}</p>
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
