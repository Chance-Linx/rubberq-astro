'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { defaultLocale, locales, type Locale } from '../lib/i18n';

type TrustSignalsProps = {
  locale: string;
};

type Testimonial = {
  quote: string;
  person: string;
  role: string;
};

const TRUST_CONTENT: Record<Locale, { title: string; subtitle: string; logosTitle: string; testimonialsTitle: string; logos: string[]; testimonials: Testimonial[] }> = {
  en: {
    title: 'Proof of Trust',
    subtitle: 'Built for procurement teams that need stable quality, traceability, and predictable delivery.',
    logosTitle: 'Trusted by Engineering Teams In',
    testimonialsTitle: 'Client Voice',
    logos: ['Nippon Mobility Group', 'Apex Robotics', 'Vector EV Systems', 'Polar Data Cooling', 'Omni Precision Works', 'Titan Fluid Tech'],
    testimonials: [
      {
        quote: 'RubberQ delivered repeatable sealing quality over six production lots with no leakage escalation.',
        person: 'Senior Sourcing Manager',
        role: 'EV Cooling System Integrator',
      },
      {
        quote: 'Their engineering feedback reduced our mold iteration cycle and accelerated pilot approval.',
        person: 'Program Engineer',
        role: 'Industrial Robotics OEM',
      },
      {
        quote: 'The PPAP-ready documentation and process traceability made supplier onboarding straightforward.',
        person: 'Quality Lead',
        role: 'Tier-1 Automotive Supplier',
      },
    ],
  },
  zh: {
    title: '信任证明',
    subtitle: '面向重视稳定质量、全流程追溯和可预测交付的采购团队。',
    logosTitle: '合作行业客户',
    testimonialsTitle: '客户反馈',
    logos: ['日系出行集团', 'Apex 机器人', 'Vector 电驱系统', 'Polar 液冷平台', 'Omni 精密制造', 'Titan 流体科技'],
    testimonials: [
      {
        quote: 'RubberQ 在连续六批交付中保持稳定密封质量，没有出现泄漏升级问题。',
        person: '高级采购经理',
        role: '新能源汽车液冷系统集成商',
      },
      {
        quote: '他们的工程反馈帮助我们减少模具迭代次数并加快了试产批准。',
        person: '项目工程师',
        role: '工业机器人 OEM',
      },
      {
        quote: 'PPAP 级文档与过程追溯能力让供应商导入流程更加顺畅。',
        person: '质量负责人',
        role: '汽车一级供应商',
      },
    ],
  },
  de: {
    title: 'Vertrauensnachweis',
    subtitle: 'Fur Einkaufsteams mit Fokus auf stabile Qualitat, Ruckverfolgbarkeit und planbare Lieferung.',
    logosTitle: 'Vertrauen aus folgenden Branchen',
    testimonialsTitle: 'Kundenstimmen',
    logos: ['Nippon Mobility Group', 'Apex Robotics', 'Vector EV Systems', 'Polar Data Cooling', 'Omni Precision Works', 'Titan Fluid Tech'],
    testimonials: [
      {
        quote: 'RubberQ lieferte uber sechs Produktionslose hinweg konstant hohe Dichtungsqualitat.',
        person: 'Senior Sourcing Manager',
        role: 'EV-Kuhlsystem Integrator',
      },
      {
        quote: 'Das Engineering-Feedback reduzierte unsere Werkzeug-Iterationen deutlich.',
        person: 'Program Engineer',
        role: 'Robotik OEM',
      },
      {
        quote: 'PPAP-fahige Dokumentation und Prozess-Traceability vereinfachten das Onboarding.',
        person: 'Quality Lead',
        role: 'Automotive Tier-1',
      },
    ],
  },
  ja: {
    title: '信頼の実績',
    subtitle: '安定品質、トレーサビリティ、納期の確実性を重視する調達チーム向け。',
    logosTitle: '採用業界',
    testimonialsTitle: 'お客様の声',
    logos: ['Nippon Mobility Group', 'Apex Robotics', 'Vector EV Systems', 'Polar Data Cooling', 'Omni Precision Works', 'Titan Fluid Tech'],
    testimonials: [
      {
        quote: '6ロット連続で安定したシール品質を維持し、漏れ問題は発生しませんでした。',
        person: '調達マネージャー',
        role: 'EV冷却システム企業',
      },
      {
        quote: '設計フィードバックにより金型の試作回数を削減し、承認を早められました。',
        person: 'プログラムエンジニア',
        role: 'ロボティクス OEM',
      },
      {
        quote: 'PPAP対応資料と工程追跡により、サプライヤ導入がスムーズでした。',
        person: '品質責任者',
        role: '自動車 Tier-1',
      },
    ],
  },
  es: {
    title: 'Prueba de Confianza',
    subtitle: 'Para equipos de compras que priorizan calidad estable, trazabilidad y entrega predecible.',
    logosTitle: 'Confianza en sectores',
    testimonialsTitle: 'Voz del Cliente',
    logos: ['Nippon Mobility Group', 'Apex Robotics', 'Vector EV Systems', 'Polar Data Cooling', 'Omni Precision Works', 'Titan Fluid Tech'],
    testimonials: [
      {
        quote: 'RubberQ mantuvo calidad de sellado estable durante seis lotes de produccion.',
        person: 'Senior Sourcing Manager',
        role: 'Integrador de enfriamiento EV',
      },
      {
        quote: 'Su retroalimentacion tecnica redujo iteraciones de molde y acelero aprobaciones.',
        person: 'Ingeniero de Programa',
        role: 'OEM de Robotica',
      },
      {
        quote: 'La documentacion tipo PPAP y trazabilidad facilitaron el onboarding del proveedor.',
        person: 'Lider de Calidad',
        role: 'Tier-1 Automotriz',
      },
    ],
  },
};

export default function TrustSignals({ locale }: TrustSignalsProps) {
  const normalizedLocale = locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale;
  const content = TRUST_CONTENT[normalizedLocale];
  const [index, setIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const testimonialCount = content.testimonials.length;

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonialCount);
    }, 5000);

    return () => clearInterval(timer);
  }, [testimonialCount]);

  const activeTestimonial = useMemo(() => content.testimonials[index], [content.testimonials, index]);

  const prev = () => setIndex((current) => (current - 1 + testimonialCount) % testimonialCount);
  const next = () => setIndex((current) => (current + 1) % testimonialCount);

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    setTouchStartX(event.changedTouches[0]?.clientX ?? null);
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null) {
      return;
    }

    const touchEndX = event.changedTouches[0]?.clientX ?? touchStartX;
    const delta = touchEndX - touchStartX;
    const threshold = 40;

    if (delta > threshold) {
      prev();
    } else if (delta < -threshold) {
      next();
    }

    setTouchStartX(null);
  };

  return (
    <section className="py-16 md:py-24 bg-industrial-50 border-t border-industrial-200 border-b border-industrial-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <h2 className="text-4xl font-bold tracking-tighter text-industrial-900 uppercase mb-4">{content.title}</h2>
          <p className="text-industrial-600 text-lg">{content.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-industrial-500 mb-5">{content.logosTitle}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {content.logos.map((logo) => (
                <div
                  key={logo}
                  className="min-h-16 bg-white border border-industrial-200 flex items-center justify-center text-center px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-industrial-600"
                >
                  {logo}
                </div>
              ))}
            </div>
          </div>

          <div
            className="bg-white border border-industrial-200 p-6 md:p-8 touch-pan-y"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-industrial-500">{content.testimonialsTitle}</h3>
              <Quote className="w-5 h-5 text-accent-orange" />
            </div>

            <p className="text-industrial-800 text-lg leading-relaxed mb-6 min-h-[110px]">“{activeTestimonial.quote}”</p>

            <div className="border-t border-industrial-100 pt-4">
              <p className="font-bold text-industrial-900">{activeTestimonial.person}</p>
              <p className="text-sm text-industrial-500">{activeTestimonial.role}</p>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="flex gap-2">
                {content.testimonials.map((_, dotIndex) => (
                  <button
                    key={dotIndex}
                    type="button"
                    onClick={() => setIndex(dotIndex)}
                    className={`h-3 transition-all ${index === dotIndex ? 'w-8 bg-accent-orange' : 'w-5 bg-industrial-200'}`}
                    aria-label={`Testimonial ${dotIndex + 1}`}
                    aria-current={index === dotIndex}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={prev}
                  className="w-11 h-11 border border-industrial-200 flex items-center justify-center text-industrial-600 hover:text-accent-orange hover:border-accent-orange transition-colors"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={next}
                  className="w-11 h-11 border border-industrial-200 flex items-center justify-center text-industrial-600 hover:text-accent-orange hover:border-accent-orange transition-colors"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
