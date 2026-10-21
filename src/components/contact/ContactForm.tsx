'use client';

import { Send, CheckCircle, XCircle, Loader2, Upload } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import { submitInquiry, type SubmissionState } from '../../lib/submitInquiry';
import {
  buildFieldPriorityPayload,
  collectSourceTracking,
  trackContactFormSubmit,
  trackFormAbandon,
  trackQuoteRequest,
} from '../../lib/inquiryTracking';

interface ContactFormLabels {
  name: string;
  namePlaceholder: string;
  email: string;
  emailPlaceholder: string;
  company: string;
  companyPlaceholder: string;
  industry: string;
  upload: UploadLabels;
  industryOptions: {
    ev: string;
    cooling: string;
    robotics: string;
    industrial: string;
    semiconductor: string;
    automotiveTier2: string;
    other: string;
  };
  projectType: {
    label: string;
    options: Record<string, string>;
  };
  annualVolume: {
    label: string;
    options: Record<string, string>;
  };
  quoteComponents: {
    label: string;
    options: Record<string, string>;
  };
  projectStage: {
    label: string;
    options: Record<string, string>;
  };
  message: string;
  messagePlaceholder: string;
  fileLink: string;
  fileLinkPlaceholder: string;
  fileLinkHelp: string;
  submit: string;
  submitting: string;
  success: string;
  successMessage: string;
  error: string;
  errorMessage: string;
}

type UploadLabels = {
  uploadTitle: string;
  uploadButton: string;
  uploadHelp: string;
  uploadReplace: string;
  uploadUnsupported: string;
  uploadTooLarge: string;
};

const acceptedUploadTypes = [
  '.pdf',
  '.step',
  '.stp',
  '.dxf',
  '.dwg',
  '.png',
  '.jpg',
  '.jpeg',
];

const maxUploadBytes = 5 * 1024 * 1024;

type AttachmentPayload = {
  name: string;
  mimeType: string;
  size: number;
  dataBase64: string;
};

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const value = typeof reader.result === 'string' ? reader.result : '';
      const base64 = value.includes(',') ? value.split(',')[1] : value;
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('file_read_failed'));
    reader.readAsDataURL(file);
  });
}

export default function ContactForm({
  labels,
}: {
  labels: ContactFormLabels;
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    industry: 'Other',
    projectType: 'drawing',
    annualVolume: '',
    projectStage: 'feasibility',
    message: '',
    fileLink: '',
  });
  const [quoteComponents, setQuoteComponents] = useState<string[]>(['compoundDev', 'perPiece']);

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [attachment, setAttachment] = useState<AttachmentPayload | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const touchedFieldsRef = useRef(new Set<string>());
  const abandonTrackedRef = useRef(false);
  const submissionState = useRef<SubmissionState["current"]>(null);

  const uploadLabels = labels.upload;

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    touchedFieldsRef.current.add(field);
  };

  const toggleQuoteComponent = (key: string) => {
    touchedFieldsRef.current.add('quoteComponents');
    setQuoteComponents((prev) => (prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]));
  };

  useEffect(() => {
    const trackAbandon = (source: string) => {
      if (abandonTrackedRef.current) {
        return;
      }

      if (hasSubmitted || status === 'success' || touchedFieldsRef.current.size === 0) {
        return;
      }

      trackFormAbandon('contact_rfq', {
        touchedFields: touchedFieldsRef.current.size,
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

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];

    if (!selected) {
      setAttachment(null);
      return;
    }

    const lowerName = selected.name.toLowerCase();
    const isAllowedType = acceptedUploadTypes.some((ext) => lowerName.endsWith(ext));

    if (!isAllowedType) {
      setStatus('error');
      setErrorMsg(uploadLabels.uploadUnsupported);
      event.target.value = '';
      return;
    }

    if (selected.size > maxUploadBytes) {
      setStatus('error');
      setErrorMsg(uploadLabels.uploadTooLarge);
      event.target.value = '';
      return;
    }

    try {
      const dataBase64 = await fileToBase64(selected);
      touchedFieldsRef.current.add('attachment');
      setAttachment({
        name: selected.name,
        mimeType: selected.type || 'application/octet-stream',
        size: selected.size,
        dataBase64,
      });
      setStatus('idle');
      setErrorMsg('');
    } catch {
      setStatus('error');
      setErrorMsg(labels.errorMessage);
      event.target.value = '';
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');

    trackQuoteRequest('contact_page', {
      inquiryType: 'contact_rfq',
      projectType: formData.projectType,
      annualVolume: formData.annualVolume,
      projectStage: formData.projectStage,
      quoteComponents,
      industry: formData.industry,
    });

    try {
      const pageUrl = window.location.href;
      const payload = {
        ...formData,
        quoteComponents,
        inquiryType: 'contact_rfq',
        attachment,
        pageUrl,
        sourceTracking: collectSourceTracking(pageUrl),
        fieldPriority: buildFieldPriorityPayload(
          {
            name: formData.name,
            email: formData.email,
            message: formData.message,
          },
          {
            company: formData.company,
            industry: formData.industry,
            projectType: formData.projectType,
            annualVolume: formData.annualVolume,
            projectStage: formData.projectStage,
            quoteComponents: quoteComponents.join(', '),
            fileLink: formData.fileLink,
            attachmentName: attachment?.name,
          }
        ),
      };

      const data = await submitInquiry(payload, submissionState);

      if (data.ok) {
        setStatus('success');
        setHasSubmitted(true);
        trackContactFormSubmit('success', {
          inquiryType: 'contact_rfq',
          projectType: formData.projectType,
          annualVolume: formData.annualVolume,
          projectStage: formData.projectStage,
          quoteComponents,
        });
        setFormData({
          name: '',
          email: '',
          company: '',
          industry: 'Other',
          projectType: 'drawing',
          annualVolume: '',
          projectStage: 'feasibility',
          message: '',
          fileLink: '',
        });
        setQuoteComponents(['compoundDev', 'perPiece']);
        setAttachment(null);
        touchedFieldsRef.current.clear();
        abandonTrackedRef.current = false;
      } else {
        setStatus('error');
        trackContactFormSubmit('error', {
          inquiryType: 'contact_rfq',
          projectType: formData.projectType,
          annualVolume: formData.annualVolume,
          projectStage: formData.projectStage,
        });
        setErrorMsg(labels.errorMessage);
      }
    } catch {
      setStatus('error');
      trackContactFormSubmit('error', {
        inquiryType: 'contact_rfq',
        projectType: formData.projectType,
        annualVolume: formData.annualVolume,
        projectStage: formData.projectStage,
      });
      setErrorMsg(labels.errorMessage);
    }
  };

  return (
    <div className="lg:col-span-2 bg-white border border-industrial-200 p-6 md:p-10 lg:p-12">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="rq-contact-name" className="block text-sm font-bold text-industrial-700 mb-2 uppercase tracking-tight">
              {labels.name} *
            </label>
            <input
              type="text"
              required
              id="rq-contact-name"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              className="w-full bg-white border border-industrial-200 px-4 py-3 focus:outline-none focus:border-accent-orange focus:ring-2 focus:ring-accent-orange/15 transition-colors"
              placeholder={labels.namePlaceholder}
            />
          </div>
          <div>
            <label htmlFor="rq-contact-email" className="block text-sm font-bold text-industrial-700 mb-2 uppercase tracking-tight">
              {labels.email} *
            </label>
            <input
              type="email"
              required
              id="rq-contact-email"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              className="w-full bg-white border border-industrial-200 px-4 py-3 focus:outline-none focus:border-accent-orange focus:ring-2 focus:ring-accent-orange/15 transition-colors"
              placeholder={labels.emailPlaceholder}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="rq-contact-company" className="block text-sm font-bold text-industrial-700 mb-2 uppercase tracking-tight">
              {labels.company}
            </label>
            <input
              type="text"
              id="rq-contact-company"
              value={formData.company}
              onChange={(e) => updateField('company', e.target.value)}
              className="w-full bg-white border border-industrial-200 px-4 py-3 focus:outline-none focus:border-accent-orange focus:ring-2 focus:ring-accent-orange/15 transition-colors"
              placeholder={labels.companyPlaceholder}
            />
          </div>
          <div>
            <label htmlFor="rq-contact-industry" className="block text-sm font-bold text-industrial-700 mb-2 uppercase tracking-tight">
              {labels.industry}
            </label>
            <select
              id="rq-contact-industry"
              value={formData.industry}
              onChange={(e) => updateField('industry', e.target.value)}
              className="w-full bg-white border border-industrial-200 px-4 py-3 focus:outline-none focus:border-accent-orange focus:ring-2 focus:ring-accent-orange/15 transition-colors"
            >
              <option value="Other">{labels.industryOptions.other}</option>
              <option value="Semiconductor Process Equipment">{labels.industryOptions.semiconductor}</option>
              <option value="Liquid Cooling & Energy Storage">{labels.industryOptions.cooling}</option>
              <option value="EV Thermal Management">{labels.industryOptions.ev}</option>
              <option value="Humanoid Robotics">{labels.industryOptions.robotics}</option>
              <option value="Industrial Equipment">{labels.industryOptions.industrial}</option>
              <option value="Automotive Tier 2">{labels.industryOptions.automotiveTier2}</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="rq-contact-projectType" className="block text-sm font-bold text-industrial-700 mb-2 uppercase tracking-tight">
              {labels.projectType.label}
            </label>
            <select
              id="rq-contact-projectType"
              value={formData.projectType}
              onChange={(e) => updateField('projectType', e.target.value)}
              className="w-full bg-white border border-industrial-200 px-4 py-3 focus:outline-none focus:border-accent-orange focus:ring-2 focus:ring-accent-orange/15 transition-colors"
            >
              {Object.entries(labels.projectType.options)
                .filter(([key]) => key !== 'label')
                .map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
            </select>
          </div>
          <div>
            <label htmlFor="rq-contact-annualVolume" className="block text-sm font-bold text-industrial-700 mb-2 uppercase tracking-tight">
              {labels.annualVolume.label}
            </label>
            <select
              id="rq-contact-annualVolume"
              value={formData.annualVolume}
              onChange={(e) => updateField('annualVolume', e.target.value)}
              className="w-full bg-white border border-industrial-200 px-4 py-3 focus:outline-none focus:border-accent-orange focus:ring-2 focus:ring-accent-orange/15 transition-colors"
            >
              {Object.entries(labels.annualVolume.options).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="rq-contact-projectStage" className="block text-sm font-bold text-industrial-700 mb-2 uppercase tracking-tight">
              {labels.projectStage.label}
            </label>
            <select
              id="rq-contact-projectStage"
              value={formData.projectStage}
              onChange={(e) => updateField('projectStage', e.target.value)}
              className="w-full bg-white border border-industrial-200 px-4 py-3 focus:outline-none focus:border-accent-orange focus:ring-2 focus:ring-accent-orange/15 transition-colors"
            >
              {Object.entries(labels.projectStage.options)
                .filter(([key]) => key !== 'label')
                .map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-industrial-700 mb-3 uppercase tracking-tight">
            {labels.quoteComponents.label}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(labels.quoteComponents.options)
              .filter(([key]) => key !== 'label')
              .map(([key, value]) => (
                <label key={key} className="flex items-start gap-3 bg-industrial-50 border border-industrial-200 px-4 py-3 cursor-pointer hover:border-accent-orange transition-colors">
                  <input
                    type="checkbox"
                    checked={quoteComponents.includes(key)}
                    onChange={() => toggleQuoteComponent(key)}
                    className="mt-1 h-4 w-4 accent-accent-orange"
                  />
                  <span className="text-sm text-industrial-700">{value}</span>
                </label>
              ))}
          </div>
        </div>

        <div>
          <label htmlFor="rq-contact-message" className="block text-sm font-bold text-industrial-700 mb-2 uppercase tracking-tight">
              {labels.message} *
          </label>
          <textarea
            rows={4}
            required
            id="rq-contact-message"
            value={formData.message}
            onChange={(e) => updateField('message', e.target.value)}
            className="w-full bg-white border border-industrial-200 px-4 py-3 focus:outline-none focus:border-accent-orange focus:ring-2 focus:ring-accent-orange/15 transition-colors"
            placeholder={labels.messagePlaceholder}
          />
        </div>

        <div>
          <label htmlFor="rq-contact-upload" className="block text-sm font-bold text-industrial-700 mb-2 uppercase tracking-tight">
            {uploadLabels.uploadTitle}
          </label>
          <label className="w-full border border-dashed border-industrial-300 bg-industrial-50 px-4 py-4 flex items-center justify-between gap-4 cursor-pointer hover:border-accent-orange transition-colors">
            <span className="text-sm text-industrial-700 truncate">
              {attachment ? attachment.name : uploadLabels.uploadHelp}
            </span>
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-industrial-700">
              <Upload className="w-4 h-4" />
              {attachment ? uploadLabels.uploadReplace : uploadLabels.uploadButton}
            </span>
            <input
              type="file"
              id="rq-contact-upload"
              className="sr-only"
              accept=".pdf,.step,.stp,.dxf,.dwg,.png,.jpg,.jpeg"
              onChange={handleFileChange}
            />
          </label>
          <p className="text-xs text-industrial-500 mt-2">{uploadLabels.uploadHelp}</p>
        </div>

        <div>
          <label htmlFor="rq-contact-fileLink" className="block text-sm font-bold text-industrial-700 mb-2 uppercase tracking-tight">
              {labels.fileLink}
          </label>
          <input
            type="url"
            id="rq-contact-fileLink"
            value={formData.fileLink}
            onChange={(e) => updateField('fileLink', e.target.value)}
            className="w-full bg-white border border-industrial-200 px-4 py-3 focus:outline-none focus:border-accent-orange focus:ring-2 focus:ring-accent-orange/15 transition-colors"
            placeholder={labels.fileLinkPlaceholder}
          />
          <p className="text-xs text-industrial-500 mt-1">{labels.fileLinkHelp}</p>
        </div>

        {status === 'success' && (
          <div className="form-status-success border p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 form-status-success-icon flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-industrial-900">{labels.success}</p>
              <p className="text-sm text-industrial-700">{labels.successMessage}</p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-industrial-50 border border-accent-orange p-4 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-accent-orange flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-industrial-900">{labels.error}</p>
              <p className="text-sm text-industrial-700">{errorMsg || labels.errorMessage}</p>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={status === 'submitting'}
          className="rq-pressable w-full bg-industrial-900 text-white py-4 font-bold flex items-center justify-center gap-2 hover:bg-accent-orange disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  );
}
