'use client';

import { FormEvent, useState } from 'react';
import { Loader2, Mail, CheckCircle, XCircle } from 'lucide-react';

// ── Locale support ──────────────────────────────────────────────────────────
const locales = ['en', 'de', 'ja', 'es', 'zh'] as const;
type Locale = (typeof locales)[number];
const defaultLocale: Locale = 'en';

// ── Inline translations (all 5 locales) ─────────────────────────────────────
type SubscribeLabels = {
  title: string;
  description: string;
  emailPlaceholder: string;
  button: string;
  submitting: string;
  success: string;
  successMessage: string;
  error: string;
};

const labelsByLocale: Record<Locale, SubscribeLabels> = {
  en: {
    title: 'Subscribe to Technical Updates',
    description: 'Receive new material insights and engineering case notes directly by email.',
    emailPlaceholder: 'Work email',
    button: 'Subscribe',
    submitting: 'Submitting...',
    success: 'Subscribed',
    successMessage: 'You are on the list. We will send the next technical update to your inbox.',
    error: 'Subscription failed. Please try again or email contact@rubberq.com.',
  },
  zh: {
    title: '订阅技术更新',
    description: '通过邮件接收最新材料洞察与工程案例速递。',
    emailPlaceholder: '工作邮箱',
    button: '订阅',
    submitting: '提交中...',
    success: '订阅成功',
    successMessage: '已加入订阅列表，后续技术更新将发送至您的邮箱。',
    error: '订阅失败，请重试或发送邮件至 contact@rubberq.com。',
  },
  de: {
    title: 'Technische Updates abonnieren',
    description: 'Erhalten Sie neue Material-Insights und Engineering-Notizen per E-Mail.',
    emailPlaceholder: 'Geschäftliche E-Mail',
    button: 'Abonnieren',
    submitting: 'Wird gesendet...',
    success: 'Abonniert',
    successMessage: 'Sie wurden eingetragen. Das nächste Update kommt per E-Mail.',
    error: 'Abonnement fehlgeschlagen. Bitte erneut versuchen oder contact@rubberq.com schreiben.',
  },
  ja: {
    title: '技術アップデートを購読',
    description: '材料知見とエンジニアリング事例をメールで受け取れます。',
    emailPlaceholder: '業務用メール',
    button: '購読',
    submitting: '送信中...',
    success: '登録完了',
    successMessage: '購読リストに追加されました。次回更新をメールでお届けします。',
    error: '登録に失敗しました。再試行するか contact@rubberq.com へご連絡ください。',
  },
  es: {
    title: 'Suscribirse a actualizaciones técnicas',
    description: 'Reciba nuevos insights de materiales y casos técnicos por correo.',
    emailPlaceholder: 'Correo corporativo',
    button: 'Suscribirse',
    submitting: 'Enviando...',
    success: 'Suscripción activa',
    successMessage: 'Ya está en la lista. Recibirá la próxima actualización técnica por correo.',
    error: 'No se pudo suscribir. Intente de nuevo o escriba a contact@rubberq.com.',
  },
};

// ── Component ───────────────────────────────────────────────────────────────
export default function SubscribeForm({ locale }: { locale: string }) {
  const normalizedLocale = locales.includes(locale as Locale)
    ? (locale as Locale)
    : defaultLocale;
  const labels = labelsByLocale[normalizedLocale];
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!email) {
      return;
    }

    setStatus('submitting');
    setErrorMsg('');

    try {
      const response = await fetch(
        'https://rubberq-rfq-api.midnightblue-lin.workers.dev',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Blog Subscriber',
            email,
            company: '',
            industry: 'Newsletter Subscription',
            message: 'Please subscribe me to technical updates.',
            fileLink: '',
            inquiryType: 'blog_subscribe',
            pageUrl: window.location.href,
          }),
        },
      );

      const data = await response.json();
      if (data.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
        setErrorMsg(data.error || labels.error);
      }
    } catch {
      setStatus('error');
      setErrorMsg(labels.error);
    }
  };

  return (
    <section className="bg-industrial-50 border border-industrial-200 p-6 md:p-8">
      <div className="flex items-center gap-2 text-industrial-700 mb-3">
        <Mail className="w-5 h-5 text-accent-orange" />
        <h3 className="font-bold text-industrial-900">{labels.title}</h3>
      </div>
      <p className="text-sm text-industrial-600 mb-5">{labels.description}</p>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          value={email}
          required
          onChange={(event) => setEmail(event.target.value)}
          placeholder={labels.emailPlaceholder}
          className="flex-1 bg-white border border-industrial-200 px-4 py-3 focus:outline-none focus:border-accent-orange"
        />
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="bg-industrial-900 text-white px-6 py-3 font-bold text-sm uppercase tracking-wider hover:bg-black transition-colors disabled:opacity-60"
        >
          {status === 'submitting' ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {labels.submitting}
            </span>
          ) : (
            labels.button
          )}
        </button>
      </form>

      {status === 'success' && (
        <div className="mt-4 bg-green-50 border border-green-200 p-3 flex items-start gap-2">
          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
          <p className="text-sm text-green-700">{labels.successMessage}</p>
        </div>
      )}

      {status === 'error' && (
        <div className="mt-4 bg-red-50 border border-red-200 p-3 flex items-start gap-2">
          <XCircle className="w-4 h-4 text-red-600 mt-0.5" />
          <p className="text-sm text-red-700">{errorMsg || labels.error}</p>
        </div>
      )}
    </section>
  );
}
