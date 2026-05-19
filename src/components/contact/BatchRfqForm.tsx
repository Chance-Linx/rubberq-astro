'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { CheckCircle, Loader2, Send, XCircle } from 'lucide-react';
import {
  buildFieldPriorityPayload,
  collectSourceTracking,
  trackContactFormSubmit,
  trackFormAbandon,
  trackQuoteRequest,
} from '../../lib/inquiryTracking';

type ProductOption = {
  id: string;
  label: string;
};

export interface BatchRfqLabels {
  name: string;
  email: string;
  company: string;
  country: string;
  annualVolume: string;
  targetMaterial: string;
  drawingLink: string;
  notes: string;
  projectType: string;
  projectStage: string;
  quoteComponents: string;
  productsTitle: string;
  productHint: string;
  submit: string;
  submitting: string;
  success: string;
  successMessage: string;
  error: string;
  errorMessage: string;
}

const projectTypeOptions = [
  ['drawing', 'Drawing-driven RFQ'],
  ['application', 'Application-driven compound review'],
  ['sample', 'Sample request only'],
];

const projectStageOptions = [
  ['feasibility', 'Feasibility study'],
  ['pilot', 'Prototype / pilot'],
  ['validation', 'Pre-production validation'],
  ['production', 'Production / supply agreement'],
];

const quoteComponentOptions = [
  ['compoundReview', 'Compound feasibility'],
  ['tooling', 'Tooling estimate'],
  ['perPiece', 'Per-piece quote'],
  ['validation', 'Testing / validation'],
  ['sample', 'Sample quote'],
];

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
  const [quoteComponents, setQuoteComponents] = useState<string[]>(['compoundReview', 'perPiece']);
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
    projectType: 'drawing',
    projectStage: 'feasibility',
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

  const toggleQuoteComponent = (componentId: string) => {
    touchedFieldsRef.current.add('quoteComponents');
    setQuoteComponents((prev) => (prev.includes(componentId) ? prev.filter((id) => id !== componentId) : [...prev, componentId]));
  };

  useEffect(() => {
    const trackAbandon = (source: string) => {
      if (abandonTrackedRef.current || hasSubmitted || status === 'success' || touchedFieldsRef.current.size === 0) {
        return;
      }

      trackFormAbandon('batch_rfq', {
        touchedFields: touchedFieldsRef.current.size,
        selectedProducts,
        projectType: formData.projectType,
        annualVolume: formData.annualVolume,
        projectStage: formData.projectStage,
        source,
      });
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

    trackQuoteRequest('batch_rfq_page', {
      inquiryType: 'batch_rfq',
      selectedProducts,
      projectType: formData.projectType,
      annualVolume: formData.annualVolume,
      projectStage: formData.projectStage,
      quoteComponents,
    });

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
          projectType: formData.projectType,
          projectStage: formData.projectStage,
          quoteComponents: quoteComponents.join(','),
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
          message: `Products: ${selectedProductNames}; Project Type: ${formData.projectType}; Stage: ${formData.projectStage}; Quote Components: ${quoteComponents.join(', ')}; Country: ${formData.country}; Annual Volume: ${formData.annualVolume}; Target Material: ${formData.targetMaterial}; Notes: ${formData.notes}`,
          fileLink: formData.drawingLink,
          inquiryType: 'batch_rfq',
          selectedProducts,
          country: formData.country,
          annualVolume: formData.annualVolume,
          targetMaterial: formData.targetMaterial,
          projectType: formData.projectType,
          projectStage: formData.projectStage,
          quoteComponents,
          pageUrl,
          sourceTracking: collectSourceTracking(pageUrl),
          fieldPriority,
        }),
      });

      const data = await res.json();

      if (data.ok) {
        setStatus('success');
        setHasSubmitted(true);
        trackContactFormSubmit('success', {
          inquiryType: 'batch_rfq',
          selectedProducts,
          projectType: formData.projectType,
          annualVolume: formData.annualVolume,
          projectStage: formData.projectStage,
          quoteComponents,
        });
        setSelectedProducts([]);
        setFormData({
          name: '',
          email: '',
          company: '',
          country: '',
          annualVolume: '',
          targetMaterial: '',
          projectType: 'drawing',
          projectStage: 'feasibility',
          drawingLink: '',
          notes: '',
        });
        setQuoteComponents(['compoundReview', 'perPiece']);
        touchedFieldsRef.current.clear();
        abandonTrackedRef.current = false;
      } else {
        setStatus('error');
        trackContactFormSubmit('error', {
          inquiryType: 'batch_rfq',
          selectedProducts,
          projectType: formData.projectType,
          annualVolume: formData.annualVolume,
          projectStage: formData.projectStage,
        });
        setErrorMsg(data.error || labels.errorMessage);
      }
    } catch {
      setStatus('error');
      trackContactFormSubmit('error', {
        inquiryType: 'batch_rfq',
        selectedProducts,
        projectType: formData.projectType,
        annualVolume: formData.annualVolume,
        projectStage: formData.projectStage,
      });
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
        <select
          value={formData.projectType}
          onChange={(e) => updateField('projectType', e.target.value)}
          className="w-full bg-white border border-industrial-200 px-4 py-3"
          aria-label={labels.projectType}
        >
          {projectTypeOptions.map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select
          value={formData.projectStage}
          onChange={(e) => updateField('projectStage', e.target.value)}
          className="w-full bg-white border border-industrial-200 px-4 py-3"
          aria-label={labels.projectStage}
        >
          {projectStageOptions.map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-industrial-500 mb-3">{labels.quoteComponents}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quoteComponentOptions.map(([value, label]) => (
            <label key={value} className="flex items-center gap-3 border border-industrial-200 bg-white px-4 py-3 cursor-pointer">
              <input
                type="checkbox"
                checked={quoteComponents.includes(value)}
                onChange={() => toggleQuoteComponent(value)}
                className="w-4 h-4"
              />
              <span className="text-sm text-industrial-800">{label}</span>
            </label>
          ))}
        </div>
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
        <div className="form-status-success border p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 form-status-success-icon mt-0.5" />
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
