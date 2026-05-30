'use client';

import { Send, CheckCircle, XCircle, Loader2, Upload } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import { buildFieldPriorityPayload, collectSourceTracking } from '../lib/inquiryTracking';

// ── Locale support ──────────────────────────────────────────────────────────
const locales = ['en', 'de', 'ja', 'es', 'zh'] as const;
type Locale = (typeof locales)[number];
const defaultLocale: Locale = 'en';

// ── Inline translations (all 5 locales) ─────────────────────────────────────
interface Labels {
  name: string;
  namePlaceholder: string;
  email: string;
  emailPlaceholder: string;
  company: string;
  companyPlaceholder: string;
  industry: string;
  industryOptions: {
    ev: string;
    semiconductor: string;
    automotive: string;
    machinery: string;
    other: string;
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
  uploadTitle: string;
  uploadHelp: string;
  uploadReplace: string;
  uploadUnsupported: string;
  uploadTooLarge: string;
}

const labelsByLocale: Record<Locale, Labels> = {
  en: {
    name: 'Full Name',
    namePlaceholder: 'John Doe',
    email: 'Email Address',
    emailPlaceholder: 'john@company.com',
    company: 'Company Name',
    companyPlaceholder: 'Tech Innovations Inc.',
    industry: 'Target Industry',
    industryOptions: {
      ev: 'EV & Energy Storage',
      semiconductor: 'Semiconductor Process Equipment',
      automotive: 'Automotive (IATF 16949 req.)',
      machinery: 'Precision Machinery',
      other: 'Other',
    },
    message: 'Project Requirements',
    messagePlaceholder:
      'Please describe your application, material requirements (e.g., FKM, EPDM), and estimated annual volume.',
    fileLink: 'Design Files Link (Optional)',
    fileLinkPlaceholder: 'https://drive.google.com/... or Dropbox link',
    fileLinkHelp: 'Share Google Drive, Dropbox, or WeTransfer link (STEP, STP, PDF, DXF)',
    submit: 'SUBMIT RFQ',
    submitting: 'SUBMITTING...',
    success: 'Submission successful!',
    successMessage: "We've received your RFQ and will respond within 12-24 hours.",
    error: 'Submission failed',
    errorMessage: 'Please try again later.',
    uploadTitle: 'Upload Drawing / Specs (Optional)',
    uploadHelp: 'Accepted: PDF, STEP, STP, DXF, DWG, PNG, JPG (max 5MB).',
    uploadReplace: 'Replace file',
    uploadUnsupported: 'Unsupported file type. Please upload PDF/STEP/STP/DXF/DWG/PNG/JPG.',
    uploadTooLarge: 'File is too large. Maximum size is 5MB.',
  },
  zh: {
    name: '姓名',
    namePlaceholder: '张三',
    email: '邮箱地址',
    emailPlaceholder: 'zhangsan@company.cn',
    company: '公司名称',
    companyPlaceholder: '科技创新有限公司',
    industry: '目标行业',
    industryOptions: {
      ev: 'EV & Energy Storage',
      semiconductor: '半导体工艺设备',
      automotive: '汽车（需IATF 16949认证）',
      machinery: '精密机械',
      other: '其他',
    },
    message: '项目需求',
    messagePlaceholder: '请描述您的应用、材料要求（例如：FKM、EPDM）和预计年产量。',
    fileLink: '设计文件链接（可选）',
    fileLinkPlaceholder: 'https://drive.google.com/... 或 Dropbox 链接',
    fileLinkHelp: '分享Google Drive、Dropbox或WeTransfer链接（STEP、STP、PDF、DXF）',
    submit: '提交询价',
    submitting: '提交中...',
    success: '提交成功！',
    successMessage: '我们已收到您的询价，将在12-24小时内回复。',
    error: '提交失败',
    errorMessage: '请稍后再试。',
    uploadTitle: '上传图纸/规格文件（可选）',
    uploadHelp: '支持 PDF、STEP、STP、DXF、DWG、PNG、JPG，最大 5MB。',
    uploadReplace: '重新选择文件',
    uploadUnsupported: '文件格式不支持，请上传 PDF/STEP/STP/DXF/DWG/PNG/JPG。',
    uploadTooLarge: '文件过大，最大支持 5MB。',
  },
  de: {
    name: 'Vollständiger Name',
    namePlaceholder: 'Max Mustermann',
    email: 'E-Mail-Adresse',
    emailPlaceholder: 'max@unternehmen.de',
    company: 'Firmenname',
    companyPlaceholder: 'Tech Innovations GmbH',
    industry: 'Zielbranche',
    industryOptions: {
      ev: 'EV & Energy Storage',
      semiconductor: 'Halbleiter-Prozessausrüstung',
      automotive: 'Automobil (IATF 16949 erforderlich)',
      machinery: 'Präzisionsmaschinenbau',
      other: 'Andere',
    },
    message: 'Projektanforderungen',
    messagePlaceholder:
      'Beschreiben Sie Ihre Anwendung, Materialanforderungen (z. B. FKM, EPDM) und geschätzte Jahresmenge.',
    fileLink: 'Link zu Konstruktionsdateien (optional)',
    fileLinkPlaceholder: 'https://drive.google.com/... oder Dropbox-Link',
    fileLinkHelp:
      'Teilen Sie einen Google Drive-, Dropbox- oder WeTransfer-Link (STEP, STP, PDF, DXF)',
    submit: 'RFQ ABSENDEN',
    submitting: 'WIRD GESENDET...',
    success: 'Anfrage erfolgreich!',
    successMessage: 'Wir haben Ihre RFQ erhalten und antworten innerhalb von 12-24 Stunden.',
    error: 'Anfrage fehlgeschlagen',
    errorMessage: 'Bitte versuchen Sie es später erneut.',
    uploadTitle: 'Zeichnung/Spezifikation hochladen (optional)',
    uploadHelp: 'Erlaubt: PDF, STEP, STP, DXF, DWG, PNG, JPG (max. 5MB).',
    uploadReplace: 'Datei ersetzen',
    uploadUnsupported:
      'Nicht unterstütztes Dateiformat. Bitte PDF/STEP/STP/DXF/DWG/PNG/JPG hochladen.',
    uploadTooLarge: 'Datei zu groß. Maximal 5MB.',
  },
  ja: {
    name: '氏名',
    namePlaceholder: '山田 太郎',
    email: 'メールアドレス',
    emailPlaceholder: 'taro@company.co.jp',
    company: '会社名',
    companyPlaceholder: '株式会社テックイノベーション',
    industry: '対象業界',
    industryOptions: {
      ev: 'EV & Energy Storage',
      semiconductor: '半導体プロセス装置',
      automotive: '自動車（IATF 16949 要）',
      machinery: '精密機械',
      other: 'その他',
    },
    message: 'プロジェクト要件',
    messagePlaceholder:
      '用途、材料要件（例：FKM、EPDM）、推定年間数量をご記入ください。',
    fileLink: '設計ファイルリンク（任意）',
    fileLinkPlaceholder: 'https://drive.google.com/... または Dropbox リンク',
    fileLinkHelp:
      'Google Drive、Dropbox、WeTransferのリンクを共有してください（STEP、STP、PDF、DXF）',
    submit: 'RFQを送信',
    submitting: '送信中...',
    success: '送信成功！',
    successMessage: 'お見積り依頼を受け付けました。12～24時間以内にご返信いたします。',
    error: '送信失敗',
    errorMessage: '後ほど再度お試しください。',
    uploadTitle: '図面/仕様ファイルをアップロード（任意）',
    uploadHelp: '対応形式: PDF、STEP、STP、DXF、DWG、PNG、JPG（最大5MB）。',
    uploadReplace: 'ファイルを変更',
    uploadUnsupported:
      '未対応の形式です。PDF/STEP/STP/DXF/DWG/PNG/JPG をアップロードしてください。',
    uploadTooLarge: 'ファイルサイズが大きすぎます。最大5MBです。',
  },
  es: {
    name: 'Nombre completo',
    namePlaceholder: 'Juan Pérez',
    email: 'Correo electrónico',
    emailPlaceholder: 'juan@empresa.com',
    company: 'Nombre de empresa',
    companyPlaceholder: 'Innovaciones Tech S.A.',
    industry: 'Industria objetivo',
    industryOptions: {
      ev: 'EV & Energy Storage',
      semiconductor: 'Equipo de proceso semiconductor',
      automotive: 'Automotriz (req. IATF 16949)',
      machinery: 'Maquinaria de precisión',
      other: 'Otro',
    },
    message: 'Requisitos del proyecto',
    messagePlaceholder:
      'Describa su aplicación, requisitos de material (ej. FKM, EPDM) y volumen anual estimado.',
    fileLink: 'Enlace a archivos de diseño (opcional)',
    fileLinkPlaceholder: 'https://drive.google.com/... o enlace de Dropbox',
    fileLinkHelp:
      'Comparta enlace de Google Drive, Dropbox o WeTransfer (STEP, STP, PDF, DXF)',
    submit: 'ENVIAR RFQ',
    submitting: 'ENVIANDO...',
    success: '¡Envío exitoso!',
    successMessage: 'Hemos recibido su RFQ y responderemos en 12-24 horas.',
    error: 'Envío fallido',
    errorMessage: 'Intente nuevamente más tarde.',
    uploadTitle: 'Subir plano/especificación (opcional)',
    uploadHelp: 'Aceptado: PDF, STEP, STP, DXF, DWG, PNG, JPG (max. 5MB).',
    uploadReplace: 'Reemplazar archivo',
    uploadUnsupported:
      'Tipo de archivo no compatible. Cargue PDF/STEP/STP/DXF/DWG/PNG/JPG.',
    uploadTooLarge: 'Archivo demasiado grande. Máximo 5MB.',
  },
};

// ── Constants ───────────────────────────────────────────────────────────────
const acceptedUploadTypes = [
  '.pdf', '.step', '.stp', '.dxf', '.dwg', '.png', '.jpg', '.jpeg',
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

// ── Component ───────────────────────────────────────────────────────────────
export default function ContactForm({ locale }: { locale: string }) {
  const normalizedLocale = locales.includes(locale as Locale)
    ? (locale as Locale)
    : defaultLocale;
  const labels = labelsByLocale[normalizedLocale];

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    industry: 'EV & Energy Storage',
    message: '',
    fileLink: '',
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [attachment, setAttachment] = useState<AttachmentPayload | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const touchedFieldsRef = useRef(new Set<string>());
  const abandonTrackedRef = useRef(false);

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    touchedFieldsRef.current.add(field);
  };

  useEffect(() => {
    const trackAbandon = (source: string) => {
      if (abandonTrackedRef.current) return;
      if (hasSubmitted || status === 'success' || touchedFieldsRef.current.size === 0) return;
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
      setErrorMsg(labels.uploadUnsupported);
      event.target.value = '';
      return;
    }

    if (selected.size > maxUploadBytes) {
      setStatus('error');
      setErrorMsg(labels.uploadTooLarge);
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

    try {
      const pageUrl = window.location.href;
      const payload = {
        ...formData,
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
            fileLink: formData.fileLink,
            attachmentName: attachment?.name,
          },
        ),
      };

      const res = await fetch(
        'https://rubberq-rfq-api.midnightblue-lin.workers.dev',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
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
          industry: 'EV & Energy Storage',
          message: '',
          fileLink: '',
        });
        setAttachment(null);
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
    <div className="lg:col-span-2 bg-industrial-50 p-8 md:p-12 border border-industrial-200">
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
              <option value="Semiconductor Process Equipment">{labels.industryOptions.semiconductor}</option>
              <option value="Automotive (IATF 16949 req.)">{labels.industryOptions.automotive}</option>
              <option value="Precision Machinery">{labels.industryOptions.machinery}</option>
              <option value="Other">{labels.industryOptions.other}</option>
            </select>
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
            {labels.uploadTitle}
          </label>
          <label className="w-full border border-dashed border-industrial-300 bg-white px-4 py-4 flex items-center justify-between cursor-pointer hover:border-accent-orange transition-colors">
            <span className="text-sm text-industrial-700 truncate">
              {attachment ? attachment.name : labels.uploadHelp}
            </span>
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-industrial-700">
              <Upload className="w-4 h-4" />
              {attachment ? labels.uploadReplace : 'Upload'}
            </span>
            <input
              type="file"
              className="hidden"
              accept=".pdf,.step,.stp,.dxf,.dwg,.png,.jpg,.jpeg"
              onChange={handleFileChange}
            />
          </label>
          <p className="text-xs text-industrial-500 mt-2">{labels.uploadHelp}</p>
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
          <div className="form-status-success border p-4 rounded flex items-start gap-3">
            <CheckCircle className="w-5 h-5 form-status-success-icon flex-shrink-0 mt-0.5" />
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
