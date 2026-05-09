import { defaultLocale, locales, type Locale } from '@/lib/i18n';

export type GlossaryTermKey =
  | 'compression_set'
  | 'shore_a'
  | 'tensile_strength'
  | 'elongation_at_break'
  | 'ppap'
  | 'fai'
  | 'flash'
  | 'tooling_lead_time';

type GlossaryTermEntry = {
  key: GlossaryTermKey;
  canonical: string;
  term: Record<Locale, string>;
  definition: Record<Locale, string>;
};

type GlossaryLabels = {
  title: string;
  subtitle: string;
  canonicalColumn: string;
  localizedColumn: string;
  definitionColumn: string;
};

const labelsByLocale: Record<Locale, GlossaryLabels> = {
  en: {
    title: 'Technical Terminology Glossary',
    subtitle: 'Unified terms used across product pages, case studies, and RFQ communication.',
    canonicalColumn: 'Canonical Term',
    localizedColumn: 'Localized Term',
    definitionColumn: 'Definition',
  },
  de: {
    title: 'Technisches Glossar',
    subtitle: 'Einheitliche Fachbegriffe fur Produktseiten, Fallstudien und RFQ-Kommunikation.',
    canonicalColumn: 'Standardbegriff',
    localizedColumn: 'Lokalisierter Begriff',
    definitionColumn: 'Definition',
  },
  ja: {
    title: '技術用語グロッサリー',
    subtitle: '製品ページ・事例ページ・RFQ対応で統一する技術用語。',
    canonicalColumn: '標準用語',
    localizedColumn: 'ローカライズ用語',
    definitionColumn: '定義',
  },
  es: {
    title: 'Glosario Tecnico',
    subtitle: 'Terminos unificados para paginas de producto, casos y comunicacion RFQ.',
    canonicalColumn: 'Termino Canonico',
    localizedColumn: 'Termino Localizado',
    definitionColumn: 'Definicion',
  },
  zh: {
    title: '技术术语表',
    subtitle: '用于产品页、案例页与询盘沟通的统一术语。',
    canonicalColumn: '标准术语',
    localizedColumn: '本地化术语',
    definitionColumn: '定义',
  },
};

const glossaryTerms: GlossaryTermEntry[] = [
  {
    key: 'compression_set',
    canonical: 'Compression Set',
    term: {
      en: 'Compression Set',
      de: 'Druckverformungsrest',
      ja: '圧縮永久ひずみ',
      es: 'Deformacion Permanente por Compresion',
      zh: '压缩永久变形',
    },
    definition: {
      en: 'Residual deformation after a compressed rubber sample recovers.',
      de: 'Verbleibende Verformung nach Entlastung eines komprimierten Elastomers.',
      ja: '圧縮後に荷重を除去した際に残る変形量。',
      es: 'Deformacion residual tras liberar una muestra de caucho comprimida.',
      zh: '橡胶受压后释放载荷仍残留的变形量。',
    },
  },
  {
    key: 'shore_a',
    canonical: 'Shore A Hardness',
    term: {
      en: 'Shore A Hardness',
      de: 'Shore-A-Harte',
      ja: 'ショアA硬さ',
      es: 'Dureza Shore A',
      zh: '邵氏A硬度',
    },
    definition: {
      en: 'Indentation hardness scale commonly used for elastomers.',
      de: 'Eindruckharte-Skala, die ublich fur Elastomere verwendet wird.',
      ja: 'エラストマーで一般的に使用される押込み硬さ指標。',
      es: 'Escala de dureza por indentacion usada comunmente en elastomeros.',
      zh: '弹性体常用的压入硬度等级。',
    },
  },
  {
    key: 'tensile_strength',
    canonical: 'Tensile Strength',
    term: {
      en: 'Tensile Strength',
      de: 'Zugfestigkeit',
      ja: '引張強さ',
      es: 'Resistencia a la Traccion',
      zh: '拉伸强度',
    },
    definition: {
      en: 'Maximum stress the material sustains before failure in tension.',
      de: 'Maximale Spannung bis zum Versagen unter Zugbelastung.',
      ja: '引張荷重下で破断するまでに耐える最大応力。',
      es: 'Esfuerzo maximo que soporta el material antes de fallar por traccion.',
      zh: '材料在拉伸破坏前可承受的最大应力。',
    },
  },
  {
    key: 'elongation_at_break',
    canonical: 'Elongation at Break',
    term: {
      en: 'Elongation at Break',
      de: 'Bruchdehnung',
      ja: '破断伸び',
      es: 'Elongacion a la Rotura',
      zh: '断裂伸长率',
    },
    definition: {
      en: 'Strain percentage measured when the test specimen breaks.',
      de: 'Prozentuale Dehnung der Probe zum Zeitpunkt des Bruchs.',
      ja: '試験片が破断した時点の伸び率。',
      es: 'Porcentaje de deformacion medido al momento de la rotura.',
      zh: '试样发生断裂时测得的伸长百分比。',
    },
  },
  {
    key: 'ppap',
    canonical: 'PPAP',
    term: {
      en: 'Production Part Approval Process (PPAP)',
      de: 'Production Part Approval Process (PPAP)',
      ja: 'PPAP（生産部品承認プロセス）',
      es: 'PPAP (Proceso de Aprobacion de Partes de Produccion)',
      zh: 'PPAP（生产件批准程序）',
    },
    definition: {
      en: 'Automotive submission package proving production readiness and capability.',
      de: 'Automotive-Freigabepaket zum Nachweis von Serienreife und Prozessfahigkeit.',
      ja: '量産準備と工程能力を証明する自動車業界向け提出パッケージ。',
      es: 'Paquete de entrega automotriz que demuestra preparacion y capacidad de produccion.',
      zh: '用于证明量产准备与过程能力的汽车行业提交文件包。',
    },
  },
  {
    key: 'fai',
    canonical: 'FAI',
    term: {
      en: 'First Article Inspection (FAI)',
      de: 'Erstbemusterungsprufung (FAI)',
      ja: '初回品検査（FAI）',
      es: 'Inspeccion de Primera Pieza (FAI)',
      zh: '首件检验（FAI）',
    },
    definition: {
      en: 'Verification of first-off samples against drawings and requirements.',
      de: 'Prufung von Erstmustern gegen Zeichnung und Spezifikation.',
      ja: '初回品が図面・要求仕様に適合するかを検証する検査。',
      es: 'Verificacion de muestras iniciales frente a planos y requisitos.',
      zh: '对首批样件进行图纸与规范符合性验证。',
    },
  },
  {
    key: 'flash',
    canonical: 'Flash',
    term: {
      en: 'Flash',
      de: 'Grat',
      ja: 'バリ',
      es: 'Rebaba',
      zh: '飞边',
    },
    definition: {
      en: 'Excess rubber at parting lines after molding, requiring trim control.',
      de: 'Uberschussmaterial an Trennfugen nach dem Formen, das beschnitten werden muss.',
      ja: '成形時のパーティングラインに生じる余剰ゴム。',
      es: 'Exceso de caucho en lineas de particion tras el moldeo, requiere recorte.',
      zh: '模压后分型线处形成的多余胶料，需控制修边。',
    },
  },
  {
    key: 'tooling_lead_time',
    canonical: 'Tooling Lead Time',
    term: {
      en: 'Tooling Lead Time',
      de: 'Werkzeugvorlaufzeit',
      ja: '金型リードタイム',
      es: 'Tiempo de Entrega de Herramental',
      zh: '模具交期',
    },
    definition: {
      en: 'Time required to design, machine, and qualify production tooling.',
      de: 'Zeit fur Konstruktion, Fertigung und Freigabe von Produktionswerkzeugen.',
      ja: '量産金型の設計・加工・承認に必要な期間。',
      es: 'Tiempo necesario para disenar, fabricar y validar el herramental de produccion.',
      zh: '完成量产模具设计、加工与验证所需时间。',
    },
  },
];

export type LocalizedGlossaryTerm = {
  key: GlossaryTermKey;
  canonical: string;
  localized: string;
  definition: string;
};

export type TechnicalGlossary = {
  labels: GlossaryLabels;
  terms: LocalizedGlossaryTerm[];
};

export function getTechnicalGlossary(locale: string): TechnicalGlossary {
  const normalizedLocale = locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale;

  return {
    labels: labelsByLocale[normalizedLocale],
    terms: glossaryTerms.map((entry) => ({
      key: entry.key,
      canonical: entry.canonical,
      localized: entry.term[normalizedLocale],
      definition: entry.definition[normalizedLocale],
    })),
  };
}
