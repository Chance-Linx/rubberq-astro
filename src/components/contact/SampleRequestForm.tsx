'use client';

import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Loader2, Send, CheckCircle, XCircle } from 'lucide-react';
import { buildFieldPriorityPayload, collectSourceTracking } from '../../lib/inquiryTracking';

interface SampleRequestLabels {
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

export default function SampleRequestForm({ labels }: { labels: SampleRequestLabels }) {
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

      // gaEvents.trackFormAbandon('sample_request', {
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
    setStatus('submitting');
    setErrorMsg('');

    // gaEvents.trackQuoteRequest('sample_request_page');

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
        }
      );

      const res = await fetch('https://rubberq-rfq-api.midnightblue-lin.workers.dev', {
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
      });

      const data = await res.json();

      if (data.ok) {
        setStatus('success');
        setHasSubmitted(true);
        // gaEvents.trackContactFormSubmit('success');
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
