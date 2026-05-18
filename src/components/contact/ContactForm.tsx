'use client';

import { Send, CheckCircle, XCircle, Loader2, Upload } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import { defaultLocale, locales, type Locale } from '../../lib/i18n';
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
  industryOptions: {
    ev: string;
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
  uploadHelp: string;
  uploadReplace: string;
  uploadUnsupported: string;
  uploadTooLarge: string;
};

const uploadTextByLocale: Record<Locale, UploadLabels> = {
  en: {
    uploadTitle: 'Upload Drawing / Specs (Optional)',
    uploadHelp: 'Accepted: PDF, STEP, STP, DXF, DWG, PNG, JPG (max 5MB).',
    uploadReplace: 'Replace file',
    uploadUnsupported: 'Unsupported file type. Please upload PDF/STEP/STP/DXF/DWG/PNG/JPG.',
    uploadTooLarge: 'File is too large. Maximum size is 5MB.',
  },
  zh: {
    uploadTitle: '上传图纸/规格文件（可选）',
    uploadHelp: '支持 PDF、STEP、STP、DXF、DWG、PNG、JPG，最大 5MB。',
    uploadReplace: '重新选择文件',
    uploadUnsupported: '文件格式不支持，请上传 PDF/STEP/STP/DXF/DWG/PNG/JPG。',
    uploadTooLarge: '文件过大，最大支持 5MB。',
  },
  de: {
    uploadTitle: 'Zeichnung/Spezifikation hochladen (optional)',
    uploadHelp: 'Erlaubt: PDF, STEP, STP, DXF, DWG, PNG, JPG (max. 5MB).',
    uploadReplace: 'Datei ersetzen',
    uploadUnsupported: 'Nicht unterstutztes Dateiformat. Bitte PDF/STEP/STP/DXF/DWG/PNG/JPG hochladen.',
    uploadTooLarge: 'Datei zu gross. Maximal 5MB.',
  },
  ja: {
    uploadTitle: '図面/仕様ファイルをアップロード（任意）',
    uploadHelp: '対応形式: PDF、STEP、STP、DXF、DWG、PNG、JPG（最大5MB）。',
    uploadReplace: 'ファイルを変更',
    uploadUnsupported: '未対応の形式です。PDF/STEP/STP/DXF/DWG/PNG/JPG をアップロードしてください。',
    uploadTooLarge: 'ファイルサイズが大きすぎます。最大5MBです。',
  },
  es: {
    uploadTitle: 'Subir plano/especificacion (opcional)',
    uploadHelp: 'Aceptado: PDF, STEP, STP, DXF, DWG, PNG, JPG (max. 5MB).',
    uploadReplace: 'Reemplazar archivo',
    uploadUnsupported: 'Tipo de archivo no compatible. Cargue PDF/STEP/STP/DXF/DWG/PNG/JPG.',
    uploadTooLarge: 'Archivo demasiado grande. Maximo 5MB.',
  },
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
  locale,
}: {
  labels: ContactFormLabels;
  locale: string;
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    industry: 'EV & Energy Storage',
    projectType: 'drawing',
    annualVolume: '100kTo1m',
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

  const normalizedLocale = locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale;
  const uploadLabels = uploadTextByLocale[normalizedLocale];

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

      const res = await fetch('https://rubberq-rfq-api.midnightblue-lin.workers.dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

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
          industry: 'EV & Energy Storage',
          projectType: 'drawing',
          annualVolume: '100kTo1m',
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
        setErrorMsg(data.error || labels.errorMessage);
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
    <div className="lg:col-span-2 bg-industrial-50 p-8 md:p-12 rounded-lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-industrial-700 mb-2 uppercase tracking-tight">
              {labels.name} *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              className="w-full bg-white border border-industrial-200 px-4 py-3 focus:outline-none focus:border-industrial-900 transition-colors"
              placeholder={labels.namePlaceholder}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-industrial-700 mb-2 uppercase tracking-tight">
              {labels.email} *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              className="w-full bg-white border border-industrial-200 px-4 py-3 focus:outline-none focus:border-industrial-900 transition-colors"
              placeholder={labels.emailPlaceholder}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-industrial-700 mb-2 uppercase tracking-tight">
              {labels.company}
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => updateField('company', e.target.value)}
              className="w-full bg-white border border-industrial-200 px-4 py-3 focus:outline-none focus:border-industrial-900 transition-colors"
              placeholder={labels.companyPlaceholder}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-industrial-700 mb-2 uppercase tracking-tight">
              {labels.industry}
            </label>
            <select
              value={formData.industry}
              onChange={(e) => updateField('industry', e.target.value)}
              className="w-full bg-white border border-industrial-200 px-4 py-3 focus:outline-none focus:border-industrial-900 transition-colors"
            >
              <option value="EV & Energy Storage">{labels.industryOptions.ev}</option>
              <option value="Industrial Equipment">{labels.industryOptions.industrial}</option>
              <option value="Semiconductor Process Equipment">{labels.industryOptions.semiconductor}</option>
              <option value="Automotive Tier 2">{labels.industryOptions.automotiveTier2}</option>
              <option value="Other">{labels.industryOptions.other}</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-bold text-industrial-700 mb-2 uppercase tracking-tight">
              {labels.projectType.label}
            </label>
            <select
              value={formData.projectType}
              onChange={(e) => updateField('projectType', e.target.value)}
              className="w-full bg-white border border-industrial-200 px-4 py-3 focus:outline-none focus:border-industrial-900 transition-colors"
            >
              {Object.entries(labels.projectType.options)
                .filter(([key]) => key !== 'label')
                .map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-industrial-700 mb-2 uppercase tracking-tight">
              {labels.annualVolume.label}
            </label>
            <select
              value={formData.annualVolume}
              onChange={(e) => updateField('annualVolume', e.target.value)}
              className="w-full bg-white border border-industrial-200 px-4 py-3 focus:outline-none focus:border-industrial-900 transition-colors"
            >
              {Object.entries(labels.annualVolume.options).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-industrial-700 mb-2 uppercase tracking-tight">
              {labels.projectStage.label}
            </label>
            <select
              value={formData.projectStage}
              onChange={(e) => updateField('projectStage', e.target.value)}
              className="w-full bg-white border border-industrial-200 px-4 py-3 focus:outline-none focus:border-industrial-900 transition-colors"
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
                <label key={key} className="flex items-start gap-3 bg-white border border-industrial-200 px-4 py-3 cursor-pointer hover:border-accent-orange transition-colors">
                  <input
                    type="checkbox"
                    checked={quoteComponents.includes(key)}
                    onChange={() => toggleQuoteComponent(key)}
                    className="mt-1 h-4 w-4"
                  />
                  <span className="text-sm text-industrial-700">{value}</span>
                </label>
              ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-industrial-700 mb-2 uppercase tracking-tight">
            {labels.message} *
          </label>
          <textarea
            rows={4}
            required
            value={formData.message}
            onChange={(e) => updateField('message', e.target.value)}
            className="w-full bg-white border border-industrial-200 px-4 py-3 focus:outline-none focus:border-industrial-900 transition-colors"
            placeholder={labels.messagePlaceholder}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-industrial-700 mb-2 uppercase tracking-tight">
            {uploadLabels.uploadTitle}
          </label>
          <label className="w-full border border-dashed border-industrial-300 bg-white px-4 py-4 flex items-center justify-between cursor-pointer hover:border-accent-orange transition-colors">
            <span className="text-sm text-industrial-700 truncate">
              {attachment ? attachment.name : uploadLabels.uploadHelp}
            </span>
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-industrial-700">
              <Upload className="w-4 h-4" />
              {attachment ? uploadLabels.uploadReplace : 'Upload'}
            </span>
            <input
              type="file"
              className="hidden"
              accept=".pdf,.step,.stp,.dxf,.dwg,.png,.jpg,.jpeg"
              onChange={handleFileChange}
            />
          </label>
          <p className="text-xs text-industrial-500 mt-2">{uploadLabels.uploadHelp}</p>
        </div>

        <div>
          <label className="block text-sm font-bold text-industrial-700 mb-2 uppercase tracking-tight">
            {labels.fileLink}
          </label>
          <input
            type="url"
            value={formData.fileLink}
            onChange={(e) => updateField('fileLink', e.target.value)}
            className="w-full bg-white border border-industrial-200 px-4 py-3 focus:outline-none focus:border-industrial-900 transition-colors"
            placeholder={labels.fileLinkPlaceholder}
          />
          <p className="text-xs text-industrial-500 mt-1">{labels.fileLinkHelp}</p>
        </div>

        {status === 'success' && (
          <div className="bg-industrial-50 border border-industrial-200 p-4 rounded flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-accent-orange flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-industrial-900">{labels.success}</p>
              <p className="text-sm text-industrial-700">{labels.successMessage}</p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-industrial-50 border border-accent-orange p-4 rounded flex items-start gap-3">
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
          className="w-full bg-industrial-900 text-white py-4 font-bold flex items-center justify-center gap-2 hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
