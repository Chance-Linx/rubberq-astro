export const MATERIAL_SLUGS = ['hnbr', 'fkm', 'ffkm', 'epdm', 'nbr', 'acm', 'aem', 'silicone', 'lsr'] as const;

export type MaterialSlug = (typeof MATERIAL_SLUGS)[number];

export interface MaterialData {
  slug: MaterialSlug;
  name: string;
  shortName: string;
  description: string;
  fit: string;
  summaryItems: Array<{ term: string; description: string }>;
  techData: Array<{ name: string; value: string }>;
  applications: string[];
  comparisonRows: Array<{ feature: string; values: string[] }>;
  comparisonMaterials: string[];
}

export const MATERIALS: Record<MaterialSlug, MaterialData> = {
  hnbr: {
    slug: 'hnbr',
    name: 'HNBR (Hydrogenated Nitrile Rubber)',
    shortName: 'HNBR',
    description: 'Durable oil-resistant rubber for EV thermal systems, hydraulic seals, and mechanically loaded precision parts.',
    fit: 'Best fit when NBR oil resistance is useful but higher heat, ozone, and mechanical durability are required.',
    summaryItems: [
      { term: 'Temperature Range', description: '-40 C to +150 C, compound-dependent' },
      { term: 'Media Profile', description: 'Oil, coolant, refrigerant, and selected industrial fluids' },
      { term: 'Engineering Role', description: 'A practical bridge between commodity NBR and higher-cost fluoroelastomers' },
    ],
    techData: [
      { name: 'Hardness Range', value: '50-90 Shore A' },
      { name: 'Tensile Strength', value: '> 14 MPa typical' },
      { name: 'Compression Set', value: '< 25% @ 150 C / 22h target' },
      { name: 'Standards', value: 'ASTM D2000 DH / ISO 3302-1 tolerance support' },
    ],
    applications: ['EV thermal interface seals', 'Hydraulic and pneumatic seals', 'Oil-contact precision molded parts'],
    comparisonMaterials: ['HNBR', 'NBR', 'FKM'],
    comparisonRows: [
      { feature: 'Heat capability', values: ['Strong', 'Moderate', 'Excellent'] },
      { feature: 'Oil resistance', values: ['Excellent', 'Excellent', 'Excellent'] },
      { feature: 'Cost position', values: ['Medium', 'Lower', 'Higher'] },
    ],
  },
  fkm: {
    slug: 'fkm',
    name: 'FKM (Fluoroelastomer)',
    shortName: 'FKM',
    description: 'High-temperature and chemical-resistant elastomer for demanding industrial, automotive Tier 2, and energy-system sealing.',
    fit: 'Best fit for heat, oils, fuels, coolants, and chemical exposure where general elastomers lose sealing stability.',
    summaryItems: [
      { term: 'Temperature Range', description: '-25 C to +250 C, compound-dependent' },
      { term: 'Media Profile', description: 'Fuel, oil, selected chemicals, and high-temperature service conditions' },
      { term: 'Engineering Role', description: 'The default severe-duty material before moving into FFKM-level chemistry' },
    ],
    techData: [
      { name: 'Hardness Range', value: '50-90 Shore A' },
      { name: 'Tensile Strength', value: '> 12 MPa typical' },
      { name: 'Compression Set', value: '< 15% @ 200 C / 22h target' },
      { name: 'Standards', value: 'ASTM D2000 HK / ISO 3302-1 tolerance support' },
    ],
    applications: ['Thermal-management connector seals', 'Chemical-contact O-rings', 'High-temperature molded components'],
    comparisonMaterials: ['FKM', 'HNBR', 'EPDM'],
    comparisonRows: [
      { feature: 'Heat capability', values: ['Excellent', 'Strong', 'Moderate'] },
      { feature: 'Weather resistance', values: ['Good', 'Good', 'Excellent'] },
      { feature: 'Cost position', values: ['Higher', 'Medium', 'Lower'] },
    ],
  },
  ffkm: {
    slug: 'ffkm',
    name: 'FFKM (Perfluoroelastomer)',
    shortName: 'FFKM',
    description: 'Ultra-high-performance elastomer for semiconductor process equipment and aggressive chemical sealing.',
    fit: 'Best fit when downtime, contamination risk, or chemical attack makes standard FKM insufficient.',
    summaryItems: [
      { term: 'Temperature Range', description: 'Up to +320 C, compound-dependent' },
      { term: 'Media Profile', description: 'Aggressive process chemicals, plasma-adjacent exposure, and vacuum service' },
      { term: 'Engineering Role', description: 'Premium sealing material for low-outgassing, low-contamination process windows' },
    ],
    techData: [
      { name: 'Hardness Range', value: '65-90 Shore A' },
      { name: 'Tensile Strength', value: '> 10 MPa typical' },
      { name: 'Compression Set', value: 'Application-specific validation required' },
      { name: 'Standards', value: 'Lot-level traceability and in-house physical-property checks' },
    ],
    applications: ['Semiconductor chamber seals', 'Chemical process O-rings', 'Vacuum transfer interface seals'],
    comparisonMaterials: ['FFKM', 'FKM', 'EPDM'],
    comparisonRows: [
      { feature: 'Chemical resistance', values: ['Maximum', 'High', 'Low to medium'] },
      { feature: 'Contamination control', values: ['Highest', 'Strong', 'Application-specific'] },
      { feature: 'Cost position', values: ['Premium', 'Higher', 'Lower'] },
    ],
  },
  epdm: {
    slug: 'epdm',
    name: 'EPDM (Ethylene Propylene Rubber)',
    shortName: 'EPDM',
    description: 'Weather, ozone, steam, and water-resistant rubber for outdoor, coolant, and energy-infrastructure sealing.',
    fit: 'Best fit for long outdoor exposure, water-based media, and enclosure interfaces that need stable compression over time.',
    summaryItems: [
      { term: 'Temperature Range', description: '-50 C to +150 C, compound-dependent' },
      { term: 'Media Profile', description: 'Water, steam, glycol coolant, ozone, UV, and outdoor weathering' },
      { term: 'Engineering Role', description: 'Preferred material when weather resistance matters more than oil resistance' },
    ],
    techData: [
      { name: 'Hardness Range', value: '40-90 Shore A' },
      { name: 'Tensile Strength', value: '> 10 MPa typical' },
      { name: 'Compression Set', value: '< 25% @ 125 C / 22h target' },
      { name: 'Standards', value: 'ASTM D2000 CA / ISO 3302-1 tolerance support' },
    ],
    applications: ['Charging enclosure gaskets', 'BESS cabinet interface seals', 'Outdoor industrial bellows'],
    comparisonMaterials: ['EPDM', 'NBR', 'FKM'],
    comparisonRows: [
      { feature: 'Weather resistance', values: ['Excellent', 'Fair', 'Good'] },
      { feature: 'Oil resistance', values: ['Poor', 'Excellent', 'Excellent'] },
      { feature: 'Cost position', values: ['Lower', 'Medium', 'Higher'] },
    ],
  },
  nbr: {
    slug: 'nbr',
    name: 'NBR (Nitrile Rubber)',
    shortName: 'NBR',
    description: 'Cost-effective oil-resistant rubber for general industrial seals, gaskets, and fluid-control components.',
    fit: 'Best fit when oil resistance, stable molding, and sensible cost matter more than extreme heat or weather exposure.',
    summaryItems: [
      { term: 'Temperature Range', description: '-30 C to +120 C, compound-dependent' },
      { term: 'Media Profile', description: 'Petroleum oils, greases, and general industrial fluids' },
      { term: 'Engineering Role', description: 'Workhorse sealing material for repeatable industrial programs' },
    ],
    techData: [
      { name: 'Hardness Range', value: '50-90 Shore A' },
      { name: 'Tensile Strength', value: '> 12 MPa typical' },
      { name: 'Compression Set', value: '< 20% @ 100 C / 22h target' },
      { name: 'Standards', value: 'ASTM D2000 BF / ISO 3601-1 Class B support' },
    ],
    applications: ['Hydraulic seals', 'Oil-contact gaskets', 'General machinery molded parts'],
    comparisonMaterials: ['NBR', 'HNBR', 'EPDM'],
    comparisonRows: [
      { feature: 'Oil resistance', values: ['Excellent', 'Excellent', 'Poor'] },
      { feature: 'Heat capability', values: ['Moderate', 'Strong', 'Moderate'] },
      { feature: 'Cost position', values: ['Lower', 'Medium', 'Lower'] },
    ],
  },
  acm: {
    slug: 'acm',
    name: 'ACM (Acrylic Rubber)',
    shortName: 'ACM',
    description: 'Heat- and oil-resistant elastomer commonly used for drivetrain, lubricant, and industrial oil exposure.',
    fit: 'Best fit when hot oil aging is the main risk and FKM performance would be excessive for the project economics.',
    summaryItems: [
      { term: 'Temperature Range', description: '-20 C to +175 C, compound-dependent' },
      { term: 'Media Profile', description: 'Hot oils, lubricants, and selected transmission fluids' },
      { term: 'Engineering Role', description: 'A practical hot-oil material between NBR/HNBR and FKM' },
    ],
    techData: [
      { name: 'Hardness Range', value: '50-85 Shore A' },
      { name: 'Tensile Strength', value: '> 9 MPa typical' },
      { name: 'Compression Set', value: 'Application-specific validation required' },
      { name: 'Standards', value: 'ASTM D2000 EE / drawing-specific validation support' },
    ],
    applications: ['Hot oil seals', 'Transmission-adjacent molded parts', 'Lubricant-contact gaskets'],
    comparisonMaterials: ['ACM', 'HNBR', 'FKM'],
    comparisonRows: [
      { feature: 'Hot oil resistance', values: ['Strong', 'Strong', 'Excellent'] },
      { feature: 'Cold flexibility', values: ['Moderate', 'Strong', 'Moderate'] },
      { feature: 'Cost position', values: ['Medium', 'Medium', 'Higher'] },
    ],
  },
  aem: {
    slug: 'aem',
    name: 'AEM (Ethylene Acrylic Rubber)',
    shortName: 'AEM',
    description: 'Balanced heat, oil, and weather-resistant elastomer for under-hood, hose, and precision industrial components.',
    fit: 'Best fit when a component sees heat, oil mist, and outdoor aging but does not need premium FKM chemistry.',
    summaryItems: [
      { term: 'Temperature Range', description: '-40 C to +175 C, compound-dependent' },
      { term: 'Media Profile', description: 'Oil mist, heat aging, weathering, and selected coolant exposure' },
      { term: 'Engineering Role', description: 'Balanced durability material for mixed automotive and industrial environments' },
    ],
    techData: [
      { name: 'Hardness Range', value: '50-85 Shore A' },
      { name: 'Tensile Strength', value: '> 10 MPa typical' },
      { name: 'Compression Set', value: 'Application-specific validation required' },
      { name: 'Standards', value: 'Drawing-specific compound and validation support' },
    ],
    applications: ['Heat-aged molded parts', 'Hose and connector seals', 'Industrial actuator components'],
    comparisonMaterials: ['AEM', 'EPDM', 'FKM'],
    comparisonRows: [
      { feature: 'Weather resistance', values: ['Strong', 'Excellent', 'Good'] },
      { feature: 'Oil resistance', values: ['Good', 'Poor', 'Excellent'] },
      { feature: 'Cost position', values: ['Medium', 'Lower', 'Higher'] },
    ],
  },
  silicone: {
    slug: 'silicone',
    name: 'Silicone (VMQ)',
    shortName: 'VMQ',
    description: 'Wide-temperature elastomer for clean industrial, electronics, and precision equipment applications.',
    fit: 'Best fit for thermal cycling, clean-process contact, and flexible components where oil resistance is not the core requirement.',
    summaryItems: [
      { term: 'Temperature Range', description: '-60 C to +230 C, compound-dependent' },
      { term: 'Media Profile', description: 'Air, dry heat, selected clean-process contact, and temperature cycling' },
      { term: 'Engineering Role', description: 'Stable elastic recovery across broad temperature swings' },
    ],
    techData: [
      { name: 'Hardness Range', value: '30-80 Shore A' },
      { name: 'Tensile Strength', value: '> 8 MPa typical' },
      { name: 'Tear Strength', value: '> 20 kN/m target' },
      { name: 'Standards', value: 'ASTM D2000 GE / ISO 3302-1 tolerance support' },
    ],
    applications: ['Electronics enclosure seals', 'Precision equipment gaskets', 'Thermal-cycling molded parts'],
    comparisonMaterials: ['VMQ', 'FKM', 'EPDM'],
    comparisonRows: [
      { feature: 'Cold flexibility', values: ['Excellent', 'Moderate', 'Excellent'] },
      { feature: 'Oil resistance', values: ['Fair', 'Excellent', 'Poor'] },
      { feature: 'Cost position', values: ['Medium', 'Higher', 'Lower'] },
    ],
  },
  lsr: {
    slug: 'lsr',
    name: 'LSR (Liquid Silicone Rubber)',
    shortName: 'LSR',
    description: 'Injection-moldable silicone material for stable, precise, and repeatable small elastomer components.',
    fit: 'Best fit for precision geometries, high-repeatability molding, and clean-process elastomer parts.',
    summaryItems: [
      { term: 'Temperature Range', description: '-60 C to +230 C, compound-dependent' },
      { term: 'Process Profile', description: 'Liquid injection molding for tight-feature repeatability' },
      { term: 'Engineering Role', description: 'Precision silicone route when conventional compression molding is less efficient' },
    ],
    techData: [
      { name: 'Hardness Range', value: '10-80 Shore A' },
      { name: 'Molding Mode', value: 'Liquid injection molding' },
      { name: 'Flash Control', value: 'Tooling- and geometry-dependent' },
      { name: 'Standards', value: 'Drawing-specific validation support' },
    ],
    applications: ['Precision silicone seals', 'Small clean-process gaskets', 'High-repeatability molded components'],
    comparisonMaterials: ['LSR', 'VMQ', 'EPDM'],
    comparisonRows: [
      { feature: 'Feature repeatability', values: ['Excellent', 'Good', 'Good'] },
      { feature: 'Thermal cycling', values: ['Excellent', 'Excellent', 'Moderate'] },
      { feature: 'Tooling investment', values: ['Higher', 'Medium', 'Medium'] },
    ],
  },
};

export function isMaterialSlug(slug: string): slug is MaterialSlug {
  return MATERIAL_SLUGS.includes(slug as MaterialSlug);
}

export function getMaterialData(slug: string): MaterialData | null {
  if (!isMaterialSlug(slug)) {
    return null;
  }

  return MATERIALS[slug];
}
