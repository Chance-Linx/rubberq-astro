'use client';

import { useEffect, useMemo, useState } from 'react';
import type { TouchEvent } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { defaultLocale, locales, type Locale } from '../../lib/i18n';

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
    logosTitle: 'Built for Engineering Teams In',
    testimonialsTitle: 'Procurement Signals',
    logos: ['EV & Energy Storage', 'Industrial Equipment', 'Semiconductor Tools', 'Automotive Tier 2', 'Fluid Power Systems', 'Precision Machinery'],
    testimonials: [
      {
        quote: 'Batch traceability, drawing review, and material test data are prepared as part of supplier qualification conversations.',
        person: 'Qualification signal',
        role: 'Documentation and traceability',
      },
      {
        quote: 'Formulation, molding, and validation teams work from the same project inputs before sample or production approval.',
        person: 'Engineering signal',
        role: 'Compound-to-production coordination',
      },
      {
        quote: 'RFQs with drawings, annual volume, material target, and application conditions can be triaged faster and more accurately.',
        person: 'RFQ signal',
        role: 'Technical sourcing readiness',
      },
    ],
  },
  zh: {
    title: '信任证明',
    subtitle: '面向重视稳定质量、全流程追溯和可预测交付的采购团队。',
    logosTitle: '服务的工程团队类型',
    testimonialsTitle: '采购信号',
    logos: ['EV 与储能', '工业设备', '半导体设备', '汽车 Tier 2', '液压气动系统', '精密机械'],
    testimonials: [
      {
        quote: '批次追溯、图纸评审和材料测试数据会作为供应商导入沟通的一部分准备。',
        person: '资质信号',
        role: '文件与追溯',
      },
      {
        quote: '配方、成型和验证团队会基于同一组项目输入推进样品或量产评估。',
        person: '工程信号',
        role: '配方到生产协同',
      },
      {
        quote: '带图纸、年用量、目标材料和应用条件的 RFQ 能更快、更准确地完成初筛。',
        person: 'RFQ 信号',
        role: '技术采购准备度',
      },
    ],
  },
  de: {
    title: 'Vertrauensnachweis',
    subtitle: 'Fur Einkaufsteams mit Fokus auf stabile Qualitat, Ruckverfolgbarkeit und planbare Lieferung.',
    logosTitle: 'Ausgelegt fur Engineering-Teams in',
    testimonialsTitle: 'Beschaffungssignale',
    logos: ['EV & Energiespeicher', 'Industrieanlagen', 'Halbleiteranlagen', 'Automotive Tier 2', 'Fluidtechnik', 'Prazisionsmaschinen'],
    testimonials: [
      {
        quote: 'Chargenruckverfolgung, Zeichnungsprufung und Materialtestdaten werden fur Lieferantenqualifizierung vorbereitet.',
        person: 'Qualifizierungssignal',
        role: 'Dokumentation und Traceability',
      },
      {
        quote: 'Rezeptur-, Formgebungs- und Validierungsteams arbeiten vor Muster- oder Serienfreigabe mit denselben Projektdaten.',
        person: 'Engineering-Signal',
        role: 'Compound-to-production Koordination',
      },
      {
        quote: 'RFQs mit Zeichnung, Jahresmenge, Zielmaterial und Einsatzbedingungen lassen sich schneller bewerten.',
        person: 'RFQ-Signal',
        role: 'Technische Beschaffungsreife',
      },
    ],
  },
  ja: {
    title: '信頼の実績',
    subtitle: '安定品質、トレーサビリティ、納期の確実性を重視する調達チーム向け。',
    logosTitle: '対応するエンジニアリング領域',
    testimonialsTitle: '調達判断のシグナル',
    logos: ['EV・蓄電', '産業設備', '半導体装置', '自動車 Tier 2', '流体制御', '精密機械'],
    testimonials: [
      {
        quote: 'ロット追跡、図面確認、材料試験データをサプライヤ評価の会話に合わせて準備します。',
        person: '認定シグナル',
        role: '文書化とトレーサビリティ',
      },
      {
        quote: '配合、成形、検証チームが同じ案件情報をもとに試作または量産評価を進めます。',
        person: '技術シグナル',
        role: '配合から生産までの連携',
      },
      {
        quote: '図面、年間数量、目標材料、使用条件が揃った RFQ はより早く正確に初期評価できます。',
        person: 'RFQ シグナル',
        role: '技術調達の準備度',
      },
    ],
  },
  es: {
    title: 'Prueba de Confianza',
    subtitle: 'Para equipos de compras que priorizan calidad estable, trazabilidad y entrega predecible.',
    logosTitle: 'Preparado para equipos de ingenieria en',
    testimonialsTitle: 'Senales de compra',
    logos: ['EV y almacenamiento', 'Equipos industriales', 'Herramientas semiconductor', 'Automotive Tier 2', 'Sistemas fluidos', 'Maquinaria de precision'],
    testimonials: [
      {
        quote: 'La trazabilidad por lote, revision de planos y datos de ensayo se preparan para conversaciones de calificacion.',
        person: 'Senal de calificacion',
        role: 'Documentacion y trazabilidad',
      },
      {
        quote: 'Formulacion, moldeo y validacion trabajan desde los mismos datos antes de aprobar muestra o produccion.',
        person: 'Senal de ingenieria',
        role: 'Coordinacion de compuesto a produccion',
      },
      {
        quote: 'RFQs con plano, volumen anual, material objetivo y condiciones de aplicacion se trian mas rapido.',
        person: 'Senal RFQ',
        role: 'Preparacion tecnica de compra',
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

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    setTouchStartX(event.changedTouches[0]?.clientX ?? null);
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
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
                    className={`h-3 transition-[width,background-color] ${index === dotIndex ? 'w-8 bg-accent-orange' : 'w-5 bg-industrial-200'}`}
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
