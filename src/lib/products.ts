export const PRODUCT_SLUGS = ['seals', 'gaskets', 'bellows', 'custom'] as const;

export type ProductSlug = (typeof PRODUCT_SLUGS)[number];

export interface ProductProperty {
  name: string;
  value: string;
}

export interface MaterialCompatibilityItem {
  material: string;
  compatibility: string;
  note: string;
}

export interface ApplicationCase {
  title: string;
  scenario: string;
  result: string;
}

export interface CadFile {
  fileName: string;
  format: string;
  size: string;
  url: string;
}

export interface ProductBlueprint {
  slug: ProductSlug;
  modelCode: string;
  heroImage: string;
  summary: Array<{ term: string; description: string }>;
  specifications: ProductProperty[];
  materialCompatibility: MaterialCompatibilityItem[];
  applicationCases: ApplicationCase[];
  cadFiles: CadFile[];
}

const PRODUCT_BLUEPRINTS: Record<ProductSlug, ProductBlueprint> = {
  seals: {
    slug: 'seals',
    modelCode: 'RQ-SL',
    heroImage: '/images/legacy_resource/2021/01/13/5ffee6d29ce67.jpg',
    summary: [
      { term: 'Primary Function', description: 'Dynamic and static sealing for pressure-bearing assemblies.' },
      { term: 'Tolerance Capability', description: 'Up to ISO 3601-1 Class B with validated compression control.' },
      { term: 'Typical Lifecycle', description: 'Designed for long service intervals in fluid and thermal systems.' },
    ],
    specifications: [
      { name: 'Standard Range', value: 'ISO 3601 / ASTM D2000' },
      { name: 'Hardness Window', value: '50-90 Shore A' },
      { name: 'Operating Temperature', value: '-60 C to +320 C (compound-dependent)' },
      { name: 'Compression Set Target', value: '< 15% @ 200 C / 22h' },
      { name: 'Surface Finish', value: 'Ra 0.8-1.6 um (critical lines)' },
      { name: 'Inspection', value: '100% visual + AQL sampling for dimensions' },
    ],
    materialCompatibility: [
      { material: 'FKM', compatibility: 'Excellent', note: 'High heat and fuel resistance for demanding environments.' },
      { material: 'NBR', compatibility: 'Excellent', note: 'Strong oil resistance with balanced cost profile.' },
      { material: 'EPDM', compatibility: 'Good', note: 'Preferred for water, steam, and weather exposure.' },
      { material: 'HNBR', compatibility: 'Excellent', note: 'Enhanced mechanical durability at elevated temperature.' },
    ],
    applicationCases: [
      {
        title: 'Automotive Cooling Module Seal',
        scenario: 'High-cycle thermal sealing for EV coolant manifold.',
        result: 'Leakage incidents reduced after migrating to high-fluorine compound.',
      },
      {
        title: 'Robot Actuator Shaft Seal',
        scenario: 'Dynamic sealing with repeated rotational movement.',
        result: 'Extended maintenance interval through lower compression-set profile.',
      },
      {
        title: 'Industrial Pump Face Seal',
        scenario: 'Chemical handling line requiring stable elastomer behavior.',
        result: 'Improved resistance to solvent swelling and edge cracking.',
      },
    ],
    cadFiles: [
      { fileName: 'rq-seals-standard.step', format: 'STEP', size: '48 KB', url: '/downloads/cad/rq-seals-standard.step' },
      { fileName: 'rq-seals-standard.iges', format: 'IGES', size: '35 KB', url: '/downloads/cad/rq-seals-standard.iges' },
    ],
  },
  gaskets: {
    slug: 'gaskets',
    modelCode: 'RQ-GK',
    heroImage: '/images/legacy_resource/2021/01/13/5ffee5e7e0129.jpg',
    summary: [
      { term: 'Primary Function', description: 'Surface sealing and interface compensation for flanged assemblies.' },
      { term: 'Design Focus', description: 'Thickness and compression behavior for repeatable sealing performance.' },
      { term: 'Manufacturing Mode', description: 'Die-cut and molded variants with optional adhesive backing.' },
    ],
    specifications: [
      { name: 'Thickness Range', value: '0.5-25 mm' },
      { name: 'Dimensional Class', value: 'ISO 3302-1 Class M1' },
      { name: 'Media Resistance', value: 'Compound-specific (oil, coolant, steam)' },
      { name: 'Adhesive Option', value: 'Single or double-side pressure-sensitive layer' },
      { name: 'Maximum Panel Size', value: 'Up to 1200 x 800 mm (sheet process)' },
      { name: 'Validation', value: 'Compression and leakage tests per drawing' },
    ],
    materialCompatibility: [
      { material: 'NBR', compatibility: 'Excellent', note: 'Preferred for oil-contact static sealing.' },
      { material: 'EPDM', compatibility: 'Excellent', note: 'Strong steam and weather resistance.' },
      { material: 'Silicone', compatibility: 'Good', note: 'Broad thermal range and clean-room adaptability.' },
      { material: 'PTFE-bonded', compatibility: 'Excellent', note: 'Improved chemical barrier for aggressive media.' },
    ],
    applicationCases: [
      {
        title: 'Battery Pack Enclosure Gasket',
        scenario: 'Ingress protection for EV electronics enclosure interfaces.',
        result: 'Stable compression retention across long thermal cycling profiles.',
      },
      {
        title: 'Heat Exchanger Port Seal',
        scenario: 'Coolant manifold with dimensional tolerance stack-up.',
        result: 'Leak path control improved with tailored gasket geometry.',
      },
      {
        title: 'Industrial Cabinet EMI Gasket',
        scenario: 'Combined sealing and interference shielding requirement.',
        result: 'Integrated design reduced assembly complexity and rework.',
      },
    ],
    cadFiles: [
      { fileName: 'rq-gaskets-standard.step', format: 'STEP', size: '44 KB', url: '/downloads/cad/rq-gaskets-standard.step' },
      { fileName: 'rq-gaskets-standard.iges', format: 'IGES', size: '33 KB', url: '/downloads/cad/rq-gaskets-standard.iges' },
    ],
  },
  bellows: {
    slug: 'bellows',
    modelCode: 'RQ-BL',
    heroImage: '/images/legacy_resource/2021/01/13/5ffee5f922736.jpg',
    summary: [
      { term: 'Primary Function', description: 'Protective motion cover for linear and rotary mechanisms.' },
      { term: 'Fatigue Profile', description: 'Multi-convolution geometries for repeated extension cycles.' },
      { term: 'Protection Scope', description: 'Barrier against dust, splash, and process contaminants.' },
    ],
    specifications: [
      { name: 'Cycle Target', value: '1M+ cycles (application-dependent)' },
      { name: 'Convolution Count', value: '4-16 folds typical' },
      { name: 'Extension Ratio', value: 'Up to 3.5x compressed length' },
      { name: 'Wall Thickness', value: '0.8-3.0 mm' },
      { name: 'Reinforcement Option', value: 'Fabric or wire insert on demand' },
      { name: 'Ingress Class Support', value: 'IP54-IP67 dependent on assembly design' },
    ],
    materialCompatibility: [
      { material: 'Neoprene (CR)', compatibility: 'Good', note: 'Balanced outdoor durability for general applications.' },
      { material: 'FKM', compatibility: 'Excellent', note: 'Enhanced heat and chemical durability.' },
      { material: 'TPU-coated', compatibility: 'Good', note: 'Improved abrasion resistance on sliding contact.' },
      { material: 'Fabric-reinforced', compatibility: 'Excellent', note: 'Higher shape retention for extended stroke use.' },
    ],
    applicationCases: [
      {
        title: 'Robot Joint Dust Boot',
        scenario: 'Protection for articulated joints in dusty shop-floor conditions.',
        result: 'Reduced contamination ingress and lower unplanned maintenance.',
      },
      {
        title: 'Linear Guide Protective Bellows',
        scenario: 'Covering precision rails with repeated acceleration cycles.',
        result: 'Extended rail cleanliness and improved long-run repeatability.',
      },
      {
        title: 'Automotive CV Joint Boot',
        scenario: 'Flexing component under vibration and temperature fluctuation.',
        result: 'Improved durability over baseline commodity compounds.',
      },
    ],
    cadFiles: [
      { fileName: 'rq-bellows-standard.step', format: 'STEP', size: '51 KB', url: '/downloads/cad/rq-bellows-standard.step' },
      { fileName: 'rq-bellows-standard.iges', format: 'IGES', size: '37 KB', url: '/downloads/cad/rq-bellows-standard.iges' },
    ],
  },
  custom: {
    slug: 'custom',
    modelCode: 'RQ-CM',
    heroImage: '/images/legacy_resource/2021/01/13/5ffee5158656d.jpg',
    summary: [
      { term: 'Primary Function', description: 'Application-specific molded elastomer components from drawing to SOP.' },
      { term: 'Engineering Depth', description: 'Material formulation, tooling design, and process validation in one flow.' },
      { term: 'Delivery Mode', description: 'Prototype, pilot run, and mass-production release support.' },
    ],
    specifications: [
      { name: 'Development Lead Time', value: 'Prototype 3-5 days (typical)' },
      { name: 'Tooling Capability', value: 'Insert molding and multi-durometer options' },
      { name: 'Tolerance Capability', value: 'Up to +/-0.05 mm in critical geometry' },
      { name: 'Validation Package', value: 'PPAP and process capability reports on request' },
      { name: 'Surface/Color Options', value: 'Texture and color matching supported' },
      { name: 'Scale-up', value: 'Pilot to high-volume transfer path available' },
    ],
    materialCompatibility: [
      { material: 'FKM / FFKM', compatibility: 'Excellent', note: 'For severe chemical and high-temperature applications.' },
      { material: 'NBR / HNBR', compatibility: 'Excellent', note: 'For oil-sealing and mechanical load-bearing parts.' },
      { material: 'EPDM / Silicone', compatibility: 'Good', note: 'For weather, steam, and clean-contact scenarios.' },
      { material: 'Metal-bonded systems', compatibility: 'Excellent', note: 'Supports integrated hybrid component design.' },
    ],
    applicationCases: [
      {
        title: 'AI Cooling Connector Seal',
        scenario: 'Custom geometry for quick-connect liquid cooling assembly.',
        result: 'Accelerated prototype iteration and faster qualification cycle.',
      },
      {
        title: 'Precision Machinery Damper',
        scenario: 'Vibration control component with strict dimensional targets.',
        result: 'Improved vibration attenuation while holding assembly tolerances.',
      },
      {
        title: 'Valve Elastomer Insert',
        scenario: 'Insert-molded part for fluid control module.',
        result: 'Reduced part count and streamlined assembly process.',
      },
    ],
    cadFiles: [
      { fileName: 'rq-custom-reference.step', format: 'STEP', size: '54 KB', url: '/downloads/cad/rq-custom-reference.step' },
      { fileName: 'rq-custom-reference.iges', format: 'IGES', size: '39 KB', url: '/downloads/cad/rq-custom-reference.iges' },
    ],
  },
};

export function isProductSlug(slug: string): slug is ProductSlug {
  return PRODUCT_SLUGS.includes(slug as ProductSlug);
}

export function getProductBlueprint(slug: string): ProductBlueprint | null {
  if (!isProductSlug(slug)) {
    return null;
  }

  return PRODUCT_BLUEPRINTS[slug];
}
