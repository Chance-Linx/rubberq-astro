"""Offline RubberQ planning assets. No API, scheduler, CMS or deployment calls."""
from pathlib import Path
import csv, hashlib, html, json, re
from collections import Counter

BASE = Path(__file__).resolve().parents[1]
ROOT = BASE.parents[2]
RESEARCH = ROOT / '全球增长系统/市场情报/2026-10-21-从零获客调研'
DATE = '2026-10-21'
SLOGAN = 'Japanese Formulation. Chinese Precision. Trusted Since 1995.'
PAGES = []

def write(path, content):
    p = BASE / path; p.parent.mkdir(parents=True, exist_ok=True); p.write_text(content, encoding='utf-8')

def dump(path, obj):
    write(path, json.dumps(obj, ensure_ascii=False, indent=2) + '\n')

def csvout(path, rows):
    p=BASE/path; p.parent.mkdir(parents=True,exist_ok=True)
    with p.open('w',newline='',encoding='utf-8-sig') as f:
        w=csv.DictWriter(f,fieldnames=list(rows[0]));w.writeheader();w.writerows(rows)

def add(url, name, role, keyword, h1, intro, sections, links, evidence, priority='P1', new=False, cta='Discuss Your Project', cta_url='/contact', faq=None):
    pid=f'RQ-PG-{len(PAGES)+1:03}'
    title = 'Precision Rubber Parts Manufacturer | RubberQ' if url=='/' else (h1+' | RubberQ' if len(h1)<51 else h1)
    if len(title)>60: title=keyword.title()+' | RubberQ'
    meta=intro
    if len(meta)>160:meta=meta[:157].rsplit(' ',1)[0].rstrip('.,;:')+'.'
    if len(meta)<120 and url not in ('/privacy','/terms'):
        meta=(meta+' Share your drawing and operating conditions for review.')
        if len(meta)>160:meta=meta[:157].rsplit(' ',1)[0].rstrip('.,;:')+'.'
    PAGES.append(dict(id=pid,url=url,name=name,role=role,keyword=keyword,h1=h1,intro=intro,sections=sections,links=links,evidence=evidence,priority=priority,new=new,cta=cta,cta_url=cta_url,faq=faq or [],status='结构维护；沿用现行法律正文' if url in ('/privacy','/terms') else '文案已交付；未实施',title=title,meta=meta))

add('/', '首页', '信任总入口/商业分流', 'precision rubber parts manufacturer', SLOGAN,
    'Precision rubber components, developed around your drawing, material requirements and service conditions. RubberQ brings Japanese formulation support, manufacturing in Fuzhou and in-house testing into one traceable production process.', [
    ('Precision starts with the compound','Material selection, mixing and molding work together. We review the polymer family, service medium, temperature, motion and part geometry before agreeing a development route.'),
    ('Components made for your assembly','Explore O-rings and seals, custom gaskets, bellows and molded parts. Bring a drawing, a reference sample or an application problem so we can discuss the part and its production requirements.'),
    ('From formulation to repeat supply','Compound control, molding, inspection and ERP production records connect the approved sample to later orders. Discuss the inspection plan and documentation your purchasing team requires.'),
    ('Applications with demanding operating conditions','Explore semiconductor equipment, liquid cooling and energy storage, EV thermal management and humanoid robotics. Each project starts with its actual operating conditions and validation requirements.'),
    ('A manufacturing partner since 1995','Founded as a Sino-Japanese joint venture in 1995, RubberQ operates two facilities in Fuzhou covering approximately 20,000 square metres. Learn about our production, quality systems and laboratory.')],
    ['/products','/materials','/capabilities','/compounding','/quality','/factory','/industries','/contact'], '根AGENTS公司事实；厂区图片；有效证书；ERP脱敏记录', 'P0', cta='Request a Quote')
add('/about','关于RubberQ','企业信任','RubberQ manufacturer','Precision Rubber Manufacturing Since 1995',
    'RubberQ was established in Fuzhou in 1995 as a Sino-Japanese joint venture. Our work connects Japanese formulation support with compound preparation, precision molding and in-house testing in China.',[
    ('A practical approach to material development','A rubber component has to work in its assembly, its environment and its production process. We start by understanding those requirements and translate them into a compound and manufacturing review.'),
    ('Two facilities, a connected process','Our two Fuzhou facilities cover approximately 20,000 square metres. Mixing, molding, inspection and production records support project development and repeat manufacturing.'),
    ('Accountability through production','ERP records help connect material batches, production steps and inspection results. For your project, we can discuss the traceability and documentation required for supplier evaluation.')],['/factory','/compounding','/testing','/quality','/contact'],'成立档案、厂区及体系证书')
add('/products','产品总览','产品获客枢纽','custom rubber parts','Custom Rubber Parts for Industrial Assemblies',
    'Find a component route for your drawing or application: O-rings and seals, gaskets, bellows, diaphragms, bonded parts and other precision molded components. Share material, quantity and operating requirements for an engineering review.',[
    ('O-rings and sealing components','Review cross-section, groove, squeeze and service medium alongside the material. Standard-size references and custom geometries need an agreed inspection basis.'),
    ('Gaskets and flexible parts','For gaskets, bellows and diaphragms, the clamping arrangement, movement and assembly interfaces matter as much as the outline drawing.'),
    ('Molded and bonded components','Custom shapes and rubber-to-metal parts require attention to tooling, parting lines, inserts, surface preparation and inspection access.')],['/products/seals','/products/gaskets','/products/bellows','/products/custom','/products/diaphragms','/products/rubber-to-metal-bonded-parts'],'产品实物和图纸；新类别项目可行性确认','P0',cta='Send Your Drawing')
add('/products/seals','O圈与密封件','产品商业页','custom o-rings','O-Rings and Custom Rubber Seals',
    'Discuss O-rings and sealing profiles for your assembly. Material, groove dimensions, motion, pressure and service medium guide the review, from a reference size to a custom molded seal.',[
    ('Define the sealing interface','Send the seal drawing and, where available, groove and mating-part dimensions. Identify static or dynamic operation, pressure direction, installation method and permissible flash.'),
    ('Select a material for the actual exposure','Compare FKM, FFKM, EPDM, HNBR, NBR and silicone families with the fluid, temperature cycle and mechanical requirements. A polymer family alone does not define a qualified compound.'),
    ('Agree how the part will be checked','Specify the dimension reference, tolerances, surface requirements and acceptance method. Samples help connect the drawing to the assembled seal before repeat supply.')],['/materials/ffkm','/materials/fkm','/materials/epdm','/sample-request','/contact'],'尺寸检测样本、产品图、特定材料试样记录','P0',cta='Request an O-Ring Quote',faq=[('Can you review a non-standard O-ring?','Send the dimensions or drawing, required quantity and service conditions. We will review the geometry, material and tooling requirements.'),('Can an FFKM seal replace an existing seal?','A replacement requires a review of the original specification, geometry and operating conditions, followed by agreed validation. See our FFKM replacement review page.')])
add('/products/gaskets','定制垫片','产品商业页','custom gaskets','Custom Rubber Gaskets',
    'Develop a gasket around the joint it needs to seal. Share the flange or enclosure drawing, fluid exposure, compression limits and assembly method so material and geometry can be reviewed together.',[
    ('Start with the joint','Identify the mating surfaces, fasteners, compression stops, allowable gap and installation method. These details shape the gasket section and validation plan.'),
    ('Match the compound to the environment','Review fluid contact, temperature cycles, weather exposure and compression recovery. EPDM, FKM, NBR and silicone are candidate material families, selected for the specific application.'),
    ('Move from sample to repeat order','Agree dimensions, appearance requirements, inspection points and packaging. For a recurring program, include annual demand and the documentation expected with each batch.')],['/materials/epdm','/materials/fkm','/materials/silicone','/quality','/contact'],'垫片图纸与试样、装配工况、材料报告','P0',cta='Request a Gasket Quote')
add('/products/bellows','波纹管与防护套','产品商业页','rubber bellows','Custom Rubber Bellows and Protective Boots',
    'Review flexible bellows and protective boots for industrial mechanisms. Installed length, travel, surrounding media and attachment details define the geometry and material requirements.',[
    ('Describe the full movement','Provide compressed and extended dimensions, lateral movement, cycling conditions and available installation space. Include the attachment features at both ends.'),
    ('Control exposure and interference','Identify dust, splash, oil, cleaning chemicals and heat sources. Review where folds may rub against adjacent parts or become trapped during movement.'),
    ('Check the installed part','Agree a sample review that includes fit, movement, retention and visual inspection. Any cycle-life requirement should include an agreed test method and acceptance criterion.')],['/materials','/products/custom','/industries/humanoid-robotics','/sample-request'],'行程图、装配样品及客户试验条件',cta='Discuss a Bellows Design')
add('/products/custom','定制模压件','产品商业页','custom molded rubber parts','Custom Molded Rubber Parts',
    'Turn a drawing or functional requirement into a rubber component development discussion. RubberQ reviews compound selection, geometry, tooling and inspection as a connected manufacturing task.',[
    ('Make the drawing work for rubber','Identify critical dimensions and assembly features. Review parting lines, flash limits, draft, wall sections and features that may be affected by molding and shrinkage.'),
    ('Choose the process around the part','Part geometry, compound, insert requirements and order volume guide the molding route. Tooling and sampling requirements are discussed after the technical review.'),
    ('Prepare for repeat production','Include drawing revision, forecast demand, inspection requirements and packaging. Agree how approved samples, compound identification and production records will be maintained.')],['/capabilities/rubber-molding','/compounding','/quality','/batch-rfq','/contact'],'定制件图纸与工艺评审、样件记录','P0',cta='Send a Custom Part RFQ')
add('/products/diaphragms','隔膜','产品商业页','rubber diaphragm manufacturer','Custom Rubber Diaphragms',
    'Discuss a molded diaphragm around its working movement, fluid exposure and assembly. Share the clamping geometry, stroke and pressure conditions for a material and manufacturing review.',[
    ('Define movement and loading','Supply the working stroke, pressure differential, cycling conditions and mounting arrangement. Identify contact or rubbing surfaces and the required behaviour at the travel limits.'),
    ('Review material and section geometry','Fluid exposure, temperature and repeated deformation affect compound selection. A drawing with thickness transitions and clamping details helps assess the manufacturing route.'),
    ('Set a functional sample review','Agree dimensional checks and a representative installation test. Reinforcement, permeability or endurance requirements should be identified at the start of the project.')],['/products/custom','/materials','/testing','/contact'],'隔膜制造适配、结构图、功能测试要求',new=True,cta='Discuss a Diaphragm Project')
add('/products/rubber-to-metal-bonded-parts','橡胶金属粘接件','产品商业页','rubber to metal bonding','Rubber-to-Metal Bonded Components',
    'Review bonded rubber components with attention to the elastomer, metal insert and service load. Share the assembly drawing and loading conditions to discuss a development and inspection route.',[
    ('Understand the load path','Describe compression, shear, tension and repeated movement. Mark the bonded surfaces and the functional direction of loading on the drawing.'),
    ('Review the insert and preparation','Identify the metal grade, finish, coating and insert supply arrangement. Surface preparation, bonding system and molding conditions need to be considered together.'),
    ('Agree bond verification','Define the test geometry, load direction, conditioning and acceptance criteria. A generic bond-strength number is not a substitute for a representative part test.')],['/capabilities/rubber-molding','/testing','/industries/humanoid-robotics','/contact'],'插芯材质与表面处理、粘接样件和试验条件',new=True,cta='Review a Bonded Part')
add('/products/ffkm-replacement-seals','FFKM售后替代件','售后采购商业页','ffkm replacement seals','FFKM Replacement Seals for Equipment Maintenance',
    'Assess an FFKM replacement around the seal specification and equipment conditions. Share the existing part reference, dimensions, service chemistry and failure history for a technical review.',[
    ('Bring the original requirements','Include the current seal drawing or dimensions, material designation, equipment position and service history. A branded part reference is a starting point for discussion, not proof of interchangeability.'),
    ('Compare what the application needs','Review temperature cycles, process media, vacuum conditions, installation and the relevant physical-property requirements. Additional purity, outgassing or process-specific tests are discussed for the project.'),
    ('Validate before changing supply','Agree sample checks and equipment qualification with your engineering team. Material selection does not by itself establish equivalent life, plasma performance or OEM approval.')],['/materials/ffkm','/products/seals','/industries/semiconductor','/testing','/sample-request'],'原件规格及客户合法提供图纸、具体配方和工况验证','P0',True,cta='Request an FFKM Replacement Review',faq=[('Do you guarantee a drop-in replacement?','Fit and performance must be established for the application. We review the specification and agree the validation needed before a supply change.'),('Can I send a Kalrez part reference?','You can include an existing brand and part reference with your specification. Brand references identify the part being reviewed and do not imply affiliation or an approved equivalent.')])
add('/materials','材料总览','材料获客枢纽','rubber materials','Rubber Materials for Precision Components',
    'Compare elastomer families against the medium, temperature, movement and durability requirements of your part. Material selection starts with the application and ends with an agreed compound and validation plan.',[
    ('Begin with the operating conditions','List every contacting fluid, its concentration, cleaning exposure, normal and peak temperatures, pressure and motion. Include storage and installation requirements.'),
    ('Compare candidate families','Explore FFKM, FKM, EPDM, HNBR, NBR, silicone and other available families. Similar hardness does not mean similar chemical resistance or sealing behaviour.'),
    ('Define the compound and acceptance criteria','Use the polymer family to narrow the options, then specify hardness, physical properties, conditioning and test methods for the candidate compound.')],['/materials/ffkm','/materials/fkm','/materials/epdm','/materials/hnbr','/materials/nbr','/materials/silicone','/materials/lsr','/compounding'],'材料牌号、TDS与适用工况','P0',cta='Discuss Material Selection')

MATERIALS = [
 ('ffkm','FFKM','ffkm o-rings','FFKM Materials for Demanding Sealing Conditions','Where service chemistry and temperature challenge other elastomers, FFKM is a candidate family for sealing evaluation. The formulation and actual process conditions determine the testing needed.', [('Specify the process exposure','List process gases or liquids, cleaning steps, temperature cycles, vacuum conditions and the seal location. Include any cleanliness or contamination requirements.'),('Review a compound, not only a family','Discuss hardness, physical properties and the tests relevant to your equipment. Purity, outgassing and plasma behaviour require formulation-specific evidence.'),('Connect selection to the seal','Use the drawing, gland and assembly conditions to plan samples. For equipment maintenance, compare the existing specification before considering a supply change.')],'/products/ffkm-replacement-seals'),
 ('fkm','FKM','fkm o-rings','FKM Materials for Industrial Seals','Review FKM compounds for a specified fluid and temperature environment. Chemical compatibility, low-temperature behaviour and compression recovery depend on the formulation and application.', [('Describe every fluid','Include fuel, oil, additives, cleaning solutions and mixtures. Material family names alone do not establish suitability for the full exposure sequence.'),('Review temperature and movement','Provide continuous and peak temperatures, cold-start conditions, pressure and seal motion. Include the expected compression and installation requirements.'),('Specify and validate','Agree the compound specification and a representative sample test before approving repeat supply. If an existing designation is referenced, include its exact grade.')],'/products/seals'),
 ('epdm','EPDM','epdm seals','EPDM Materials for Seals and Gaskets','Discuss EPDM candidates for the weather, water or formulated-fluid exposure in your assembly. Selection should account for the complete medium, temperature cycle and mechanical requirements.', [('Provide the fluid formulation','For coolant-contact projects, identify the full mixture and additives rather than only the base fluid. Cleaning chemicals and contaminants also belong in the review.'),('Review the compressed assembly','Describe squeeze, joint movement, flange condition and temperature cycling. Discuss how the seal will be installed and retained.'),('Agree a compatibility test','Define immersion conditions, relevant property changes and assembly checks for the selected compound. Published family comparisons are only a starting point.')],'/products/gaskets'),
 ('hnbr','HNBR','hnbr seals','HNBR Materials for Mechanical Sealing Parts','Evaluate HNBR candidates against the fluid, temperature and repeated mechanical loading of your component. Compound selection and part geometry should be reviewed together.', [('Describe the mechanical duty','Provide load direction, motion, cycle conditions and contact surfaces. Include friction, wear and compression requirements where they affect the assembly.'),('Identify service exposure','Specify fluids, additives, cleaning conditions and temperature cycles. Review the complete environment with the candidate formulation.'),('Make the test representative','Agree hardness, physical-property checks and functional sample testing that reflect the actual component and installation.')],'/products/seals'),
 ('nbr','NBR','nbr o-rings','NBR Materials for Industrial Rubber Parts','Review NBR candidates for a defined industrial application. Fluid composition, temperature and the required balance of flexibility and mechanical properties guide compound selection.', [('Define the oil or fluid exposure','Identify the contacting medium and any cleaning or storage exposure. Include temperature, pressure and seal motion.'),('Specify mechanical requirements','List hardness, deformation limits, wear concerns and dimensions that control assembly function.'),('Compare before changing materials','When replacing an existing compound, share its designation and failure history. Agree a sample and validation plan for the alternative.')],'/products/seals'),
 ('silicone','Silicone','silicone rubber molding','Silicone Materials for Custom Molded Parts','Discuss silicone candidates for your component geometry and operating conditions. Flexibility, temperature exposure, contact media and assembly requirements guide the review.', [('Choose a route for the geometry','Share wall sections, thin features, inserts and dimensional priorities. The material and molding process need to suit the same part.'),('Review the full environment','Include fluids, cleaning conditions, temperature cycles, mechanical loads and any electrical requirements with their test methods.'),('Agree finish and inspection','Specify colour, appearance, flash limits and the critical dimensions. Application-specific regulatory or certification requirements need separate review.')],'/products/custom'),
 ('lsr','LSR','liquid silicone rubber molding','Liquid Silicone Rubber Materials and Part Review','Review liquid silicone rubber as a candidate route for your drawing. Part geometry, material grade, tooling and inspection requirements determine the project discussion.', [('Review the part and tool together','Provide a drawing showing thin features, sealing edges, parting-line restrictions and inserts. Include expected order volume and the critical assembly dimensions.'),('Specify the grade and exposure','Describe hardness, colour, temperature and fluid exposure. Any certification requirement must identify the actual grade and intended application.'),('Define the sampling route','Discuss tooling, sample inspection and functional checks before agreeing production. Project-specific process availability is confirmed during the manufacturing review.')],'/capabilities/lsr-molding'),
 ('acm','ACM','acm rubber','ACM Material Selection for Rubber Components','Assess ACM as a candidate material against the specific fluid, temperature and mechanical requirements of your part. Share the existing specification or application data for review.', [('Provide the material specification','Include the current designation, physical-property requirements and the test methods used for acceptance.'),('Describe the exposure cycle','Supply the fluids, temperature cycle, movement and storage requirements. Review changes in flexibility and sealing behaviour that matter to the component.'),('Connect the material to a sample','Agree a compound and inspection plan for the actual geometry rather than relying only on generic family descriptions.')],'/products/custom'),
 ('aem','AEM','aem rubber','AEM Material Selection for Molded Parts','Discuss AEM candidates for a defined component and service environment. The required properties, geometry and validation conditions guide the formulation and manufacturing review.', [('Share the operating profile','Include normal and peak temperatures, fluid exposure, motion and the expected deformation of the part.'),('Make acceptance measurable','Specify hardness, relevant physical properties and the conditioning methods used to assess a candidate compound.'),('Review manufacturing and fit','Send the drawing and critical interfaces. Discuss sample inspection and the functional checks needed before a production decision.')],'/products/custom')]
for slug,name,kw,h1,intro,sections,commercial in MATERIALS:
    add('/materials/'+slug,name+'材料','材料页',kw,h1,intro,sections,[commercial,'/compounding','/testing','/contact'],name+'具体牌号/TDS、应用试验；不移植历史通用参数', 'P0' if slug in ('ffkm','fkm','epdm') else 'P1',cta='Review a '+name+' Application')

add('/capabilities','制造能力','能力枢纽','rubber parts manufacturer','Rubber Compounding and Manufacturing Capabilities',
    'Connect material requirements, part geometry and quality expectations in one manufacturing review. RubberQ supports compound preparation, molding, in-house inspection and traceable production records.',[
    ('Compounding and material control','Discuss polymer selection, candidate formulations and batch control with the operating conditions of the part in view.'),
    ('Molding and component development','Review the drawing, tooling, material behaviour and critical features. Agree the production and sampling route before setting project commitments.'),
    ('Inspection and production records','Specify the dimensional, material and documentation requirements that need to follow the component from samples to repeat orders.')],['/compounding','/capabilities/rubber-molding','/testing','/quality','/factory','/contact'],'设备、工艺与检验记录','P0')
add('/capabilities/rubber-molding','橡胶成型工艺','工艺商业页','custom rubber molding','Custom Rubber Molding',
    'Review a molding route for your part, compound and order requirements. Tooling, dimensional priorities, parting lines and inspection need to be considered together.',[
    ('Design for a repeatable part','Mark critical dimensions and functional surfaces. Discuss draft, wall transitions, insert position, flash and the likely parting line.'),
    ('Compare process options','Compression, transfer and injection routes have different tooling and material considerations. We review project fit and available production arrangements for the actual part.'),
    ('Approve the sample basis','Agree the drawing revision, inspection plan and functional checks. Include forecast demand and requirements for later changes.')],['/products/custom','/products/rubber-to-metal-bonded-parts','/compounding','/quality','/contact'],'具体工艺与设备适配表；模具及首件报告','P0',True,cta='Review a Molding Project')
add('/capabilities/lsr-molding','LSR成型项目','工艺商业页','liquid silicone rubber molding','LSR Molding Project Review',
    'Bring a liquid silicone rubber part drawing for a material, tooling and manufacturing review. Critical features, grade requirements and order volume guide the discussion.',[
    ('Define the part priorities','Identify thin sections, sealing edges, optical or appearance requirements and permitted parting lines. Share assembly drawings where fit is critical.'),
    ('Review the material and production route','Specify hardness, colour, service exposure and any grade-specific requirements. Production arrangements and the process route are confirmed for the project.'),
    ('Plan qualification','Agree samples, dimensional checks, functional tests and the documentation needed before production. Tooling and delivery commitments follow the technical review.')],['/materials/lsr','/products/custom','/testing','/contact'],'LSR工艺/产线适配确认；不沿用未经证实的设备数量',new=True,cta='Send an LSR Part Drawing')
add('/compounding','配方与混炼能力','能力商业页','rubber compounding','Rubber Compounding and Formulation Support',
    'Compounded by Japan. Built in China. Tested in-House. Connect your service conditions to a candidate compound, controlled preparation and an agreed release-test plan.',[
    ('Translate the application into a specification','Share the service medium, temperature, motion, target properties and processing requirements. Include an existing material specification where available.'),
    ('Control the preparation route','Recipe, weighing, mixing sequence and batch identification help connect development work to repeat preparation. Discuss the controls and documentation your project needs.'),
    ('Agree batch release','Review the tests relevant to the material, such as cure behaviour, viscosity, hardness and physical properties. Test selection and limits are agreed for the compound.'),
    ('Compound supply or finished parts','Discuss whether the project needs a compound supply review, a molded component or both. For external compound supply, include the receiving process and technical specification.')],['/compounds','/materials','/testing','/factory','/contact'],'配方控制、混炼与批次报告；单A线事实，不写双线','P0',cta='Discuss a Compound Requirement')
add('/compounds','配方胶料外供','外供商业页','rubber compounder','Custom Rubber Compound Supply',
    'Discuss compound supply for your molding requirements. Share the material specification, receiving process, required form and volume so we can review technical fit and a supply arrangement.',[
    ('Specify the compound and receiving process','Provide the polymer family or existing designation, hardness, physical-property requirements, cure system where specified and the intended molding process.'),
    ('Agree handling and release requirements','Discuss packaging form, storage, shelf-life documentation, batch identification and release testing. Required quantities and shipment conditions are confirmed for the project.'),
    ('Validate in your process','Agree trial material and evaluation criteria with the receiving production team. A compound must be assessed against the actual process and finished-part requirements.'),
    ('Clarify development and supply responsibilities','Identify who owns the specification and how changes will be controlled. Commercial, formulation confidentiality and development arrangements are agreed project by project.')],['/compounding','/materials','/testing','/contact'],'供货形式、包装/储存/TDS/批次条件；不默认许可或配方知识产权','P0',True,cta='Request a Compound Supply Review')
add('/testing','检测实验室','验证信任页','rubber testing laboratory','In-House Rubber Testing and Inspection',
    'Connect material and component requirements to an agreed test plan. RubberQ uses in-house testing and inspection to support compound review, production control and customer evaluation.',[
    ('Test the properties that matter','Discuss hardness, tensile behaviour, elongation, aging, compression set and fluid exposure with the conditioning and acceptance requirements of the project.'),
    ('Keep conditions with the result','A useful test record identifies the compound, sample, method, temperature, duration and result. Compare data only when the test basis is relevant to the application.'),
    ('Review component inspection','Identify dimensions, surface features and assembly checks separately from material testing. Specialised or third-party tests can be discussed where required.')],['/quality','/standards','/materials','/contact'],'设备清单、校准与匿名报告；不宣传独立认可实验室','P0',cta='Discuss a Test Requirement')
add('/quality','质量与认证','供应商评估信任页','rubber manufacturing quality','Quality Control and Production Traceability',
    'Define quality requirements from material preparation to finished-part inspection. RubberQ combines in-house testing with ERP production records to support samples, repeat orders and supplier evaluation.',[
    ('Agree the acceptance plan','Start with the drawing revision, material specification and critical characteristics. Discuss inspection frequency, reporting and customer-specific requirements.'),
    ('Connect records through production','Material batch identification, process records and inspection results support traceability. Discuss which records and documents need to accompany your project.'),
    ('Review our management systems','RubberQ holds IATF 16949:2016, ISO 9001:2015 and ISO 14001:2015 certifications. Request the current certificates and applicable scope for your supplier evaluation.')],['/testing','/factory','/about','/contact'],'有效证书范围/有效期、控制计划和脱敏批次追溯','P0',cta='Request Supplier Information')
add('/factory','工厂','制造信任页','rubber factory','Inside RubberQ Manufacturing',
    'Explore our manufacturing base in Fuzhou, China. Two facilities covering approximately 20,000 square metres connect compound preparation, molding, inspection and production records.',[
    ('Compound preparation','Discuss how material identification, weighing, mixing and batch records support a repeatable preparation route.'),
    ('Molding and inspection','Part geometry and material requirements guide the tooling and manufacturing review. Inspection requirements are agreed around the component and its critical features.'),
    ('See the process for your project','For supplier evaluation, request relevant factory information, process documentation and a discussion of the production route for your part.')],['/compounding','/capabilities','/testing','/quality','/contact'],'本厂实拍，真实设备表；删除占位设备数量','P1',cta='Discuss a Factory Evaluation')
add('/industries','应用行业总览','行业转化枢纽','industrial rubber components','Rubber Components for Demanding Industrial Applications',
    'Explore component and material discussions for semiconductor equipment, liquid cooling and energy storage, EV thermal management and humanoid robotics. General industrial and selected Tier 2 programs remain part of our manufacturing work.',[
    ('Semiconductor equipment','Review seals against the process chemistry, temperature, vacuum and contamination requirements of the actual equipment.'),
    ('Liquid cooling and energy storage','Discuss fluid-contact sealing and enclosure requirements with the assembly conditions and validation plan.'),
    ('EV thermal management','Review material exposure, thermal cycling and component interfaces against your drawing and specification.'),
    ('Humanoid robotics','Discuss flexible protection, contact components and bonded parts around movement, load and service environment.')],['/industries/semiconductor','/industries/liquid-cooling-energy-storage','/industries/ev-energy-storage','/industries/humanoid-robotics','/industries/industrial-equipment','/industries/automotive-tier2'],'工况与实例适配；展示顺序按用户10-21决定','P0')
INDUSTRIES=[
 ('semiconductor','半导体','semiconductor seals','Rubber Seals for Semiconductor Equipment','Review an equipment seal against its actual process conditions. FFKM and FKM candidates require a defined specification, application review and qualification plan.', [('Map the seal environment','Identify the seal location, process chemistry, temperature cycle and vacuum requirements. Include cleaning and maintenance conditions and any contamination limits.'),('Separate material and equipment qualification','A material designation does not establish plasma resistance, cleanliness or seal life. Discuss the compound-specific data and tests relevant to your process.'),('Support maintenance and development','Bring the drawing or existing part specification for sample review. Equipment maintenance replacements and new developments need an agreed approval route.')],['/materials/ffkm','/materials/fkm','/products/ffkm-replacement-seals','/testing','/contact'],False),
 ('liquid-cooling-energy-storage','液冷与储能','liquid cooling seals','Rubber Components for Liquid Cooling and Energy Storage','Discuss sealing components against the fluid, joint and environmental conditions of your cooling or energy-storage equipment. Material selection and assembly validation are reviewed together.', [('Identify the fluid-contact requirement','Provide the full fluid formulation, additives, temperature and pressure cycles. Include cleaning exposure and the material interfaces in contact with the seal.'),('Review the joint and enclosure separately','Fluid-contact seals and enclosure gaskets perform different jobs. Share the groove, clamp or flange design and the compression and movement requirements.'),('Define the validation route','Discuss immersion tests, dimensional changes, compression recovery and assembled checks. Electrical or flame requirements must identify the actual method and compound being assessed.')],['/materials/epdm','/materials/hnbr','/products/seals','/products/gaskets','/testing','/contact'],True),
 ('ev-energy-storage','EV热管理（保留旧URL）','ev thermal management seals','Rubber Components for EV Thermal Management','Review a rubber component for the fluid, temperature cycle and assembly conditions of your thermal-management project. Bring the drawing and specification to define the material and manufacturing discussion.', [('Specify the exposure','Identify the service fluid and additives, temperature range, cycling profile and any cleaning exposure. Include electrical requirements only with the applicable test criteria.'),('Review component interfaces','Share the mating geometry, tolerances, compression and installation method. Part-level requirements determine the validation needed.'),('Prepare supplier documentation','Discuss traceability, inspection plans and customer-required documentation. Sample approval and production commitments follow the technical review.')],['/materials/epdm','/materials/hnbr','/materials/fkm','/quality','/contact'],False),
 ('humanoid-robotics','人形机器人','robot rubber components','Rubber Components for Humanoid Robotics','Review flexible protection, contact surfaces and bonded components around the movement and loading of your mechanism. Share the drawing and functional requirements for an engineering discussion.', [('Describe movement and contact','Identify travel, rotation, repeated loading, contact surfaces and available installation space. Include dust, fluid and cleaning exposure.'),('Match geometry and material','Bellows, pads and bonded parts need different material and design reviews. Discuss friction, deformation, retention and the assembly interfaces that control function.'),('Validate the mechanical duty','Define a representative sample test with the loading, motion and environmental conditions. Endurance or dynamic-performance targets need their own measurement basis.')],['/products/bellows','/products/rubber-to-metal-bonded-parts','/products/custom','/testing','/contact'],True),
 ('industrial-equipment','通用工业','custom industrial rubber parts','Custom Rubber Components for Industrial Equipment','Bring a seal, gasket, flexible cover or molded component requirement for review. Material, geometry, production volume and inspection requirements guide the manufacturing route.', [('Start with the component job','Describe what the part must seal, protect, support or contact. Include the drawing and interfaces as well as the surrounding environment.'),('Choose a practical development route','Discuss a reference sample, an existing material or a new drawing. Identify the functional dimensions and tests that will establish a suitable sample.'),('Plan repeat supply','Agree batch identification, inspection, packaging and forecast requirements for ongoing orders.')],['/products','/materials','/capabilities','/batch-rfq','/contact'],False),
 ('automotive-tier2','汽车Tier2','automotive rubber components','Rubber Components for Selected Tier 2 Programs','Discuss precision rubber parts for selected Tier 2 manufacturing programs. Share the drawing, material specification and customer documentation requirements for a project review.', [('Review the specification','Identify drawing revision, critical features, material requirements and the customer approval process.'),('Agree production controls','Discuss inspection, traceability, change control and the records expected for samples and repeat orders.'),('Define project responsibilities','Clarify tooling, development, testing and documentation responsibilities before agreeing a production commitment.')],['/quality','/testing','/products/custom','/contact'],False)]
for slug,name,kw,h1,intro,sections,links,new in INDUSTRIES:
    add('/industries/'+slug,name,'行业转化页',kw,h1,intro,sections,links,'具体应用要求与样件；不添加未经证实的OEM、寿命或认证承诺','P1',new,cta='Discuss Your Application')

add('/resources','工程资源','工程参考枢纽','rubber engineering resources','Rubber Engineering Resources',
    'Find material comparisons, drawing checklists and testing questions for your rubber component project. Use the guidance to prepare a specification and identify what needs application-specific validation.',[
    ('Material selection','Compare polymer families, service media and the questions needed to narrow a compound choice.'),('Drawing and design','Review O-ring dimensions, gasket joints, molding considerations and the information that helps an engineering team evaluate a part.'),('Testing and troubleshooting','Connect a failure observation to the loading, exposure and test conditions. A useful investigation preserves the evidence from the actual component.')],['/standards','/resources/o-ring-size-guide','/resources/rubber-hardness-guide','/resources/material-compatibility','/resources/seal-failure-analysis','/blog','/contact'],'标准来源；技术内容不能冒充工厂实测')
add('/standards','标准索引','标准参考页','rubber standards','Rubber Standards and Specification Support',
    'Use standards to make requirements measurable. Identify the applicable edition, test conditions and acceptance criteria alongside your material or part drawing.',[
    ('Material classification','Discuss the callout, suffix requirements and intended service conditions when using a material classification such as ASTM D2000.'),('Part dimensions and tolerances','Specify the reference system, drawing limits and inspection method. O-ring size references and molded-part tolerances serve different purposes.'),('Testing and reporting','Include the method and conditioning with each requested result. A standard number alone does not define every project acceptance requirement.')],['/testing','/materials','/resources','/contact'],'标准版权与版本核对；不复制受限标准全文')
RESOURCES=[
 ('o-ring-size-guide','O圈尺寸与沟槽指南','o-ring size chart','O-Ring Size and Drawing Guide','Prepare the dimensions needed for an O-ring review. Record the inside diameter, cross-section, groove and mating-part dimensions together with the service conditions.', [('Identify the size reference','Include the reference system and exact size code when available. For a custom part, provide a dimensioned drawing rather than a photograph alone.'),('Check the installed geometry','Groove dimensions, stretch, squeeze and clearance affect the seal. The component dimensions need to be reviewed with the assembled condition.'),('Send a useful request','Attach the drawing revision, material designation, quantity and operating conditions. Size identification is the starting point for review, not a performance qualification.')],'/products/seals'),
 ('rubber-hardness-guide','橡胶硬度指南','shore a hardness','Rubber Hardness: Specifying a Useful Requirement','Hardness is one part of a rubber specification. Include the scale, method, tolerance and measurement conditions with the functional requirements of the component.', [('State the scale and method','A hardness value needs its scale and test basis. Sample thickness, conditioning and measurement approach influence how results can be compared.'),('Connect hardness to function','Sealing, flexibility and assembly behaviour also depend on geometry and other material properties. Hardness alone does not describe compression recovery or chemical resistance.'),('Review samples in the assembly','Use functional checks and dimensional inspection alongside the hardness requirement. Avoid treating cross-scale conversions as acceptance measurements.')],'/compounding'),
 ('material-compatibility','材料兼容性指南','chemical compatibility chart','Rubber Material Compatibility: What to Specify','Prepare a compatibility review using the exact fluid, concentration, temperature and exposure cycle. Generic family comparisons help narrow a discussion but do not replace compound testing.', [('Describe the complete exposure','Include additives, contamination, cleaning and alternating media. A base-fluid name may omit conditions that matter to the compound.'),('Define the relevant changes','Agree whether volume, mass, hardness, strength, compression recovery or assembled leakage is being assessed.'),('Compare on a common basis','Keep compound identification, temperature, duration and conditioning with the result. Use representative samples for the final application decision.')],'/materials'),
 ('seal-failure-analysis','密封失效分析','rubber seal failure','Rubber Seal Failure: A Practical Review Checklist','Preserve the failed part and operating history before choosing a replacement. A useful review connects the damage location to assembly, exposure, motion and time in service.', [('Record before replacing','Photograph the installed location and damage, keep unused reference parts and record operating changes. Include drawing revision and batch information where available.'),('Separate possible causes','Review installation damage, geometry, friction, fluid exposure and temperature rather than assuming every failure is a material problem.'),('Test the proposed change','Define what a new sample should demonstrate and how it will be measured. Keep the validation conditions with the decision to change material or geometry.')],'/testing')]
for slug,name,kw,h1,intro,sections,commercial in RESOURCES:
    add('/resources/'+slug,name,'工程参考页',kw,h1,intro,sections,[commercial,'/standards','/contact'],'正式标准/可靠一手资料待具体引用；本稿为清单指南，不包含未经校验数值表',new=True,cta='Discuss the Specification')
add('/blog','英文博客','内容聚合','rubber component guides','Rubber Component Guides and Application Notes',
    'Explore material selection, manufacturing and testing questions for industrial rubber components. Find a relevant guide, then share your part requirements for a project-specific review.',[
    ('Browse by engineering question','Find material comparisons, drawing requirements, process explanations and troubleshooting guides.'),('Connect guidance to your component','Use the operating conditions and specification of your part to identify what needs further evaluation.'),('Continue with an engineering discussion','Share a drawing, an existing specification or the question your team needs to resolve.')],['/resources','/materials','/products','/contact'],'存量正文逐篇归属与质量核对；博客仅英文')
add('/case-studies','项目经验','证据页','rubber component project review','Discuss a Rubber Component Development Project',
    'Looking for experience relevant to your component? Share the application, drawing and requirements so we can discuss the manufacturing route and information available for your supplier evaluation.',[
    ('Begin with the engineering problem','Tell us what the component must do, its service environment and the constraints on geometry or installation.'),('Review the information available','Discuss process, material and testing information relevant to the project. Customer-specific details are shared only within agreed confidentiality arrangements.'),('Define a useful next step','A drawing review, material discussion or sample evaluation can help establish the technical path for your project.')],['/products','/testing','/quality','/contact'],'无获准案例前采用评估入口，不虚构客户、业绩或成功案例')
add('/contact','工程咨询与报价','转化入口','rubber parts quote','Tell Us About Your Rubber Component',
    'Send your drawing or describe the application. Include material requirements, service conditions and quantity so we can review the next technical and commercial steps.',[
    ('Drawing or reference part','Include the drawing revision, critical dimensions and assembly interfaces. If you do not have a drawing, describe the part function and available reference information.'),('Material and service conditions','List the medium, temperature, pressure or movement and any existing material specification. Note the tests and documentation required.'),('Quantity and project stage','Provide sample quantity, expected repeat demand and your project stage. Tooling, qualification and delivery requirements are discussed after review.')],['/sample-request','/batch-rfq','/quality'],'现有ContactForm字段映射；不改API契约','P0',cta='Submit Project Details')
add('/sample-request','样品申请','转化入口','custom rubber samples','Request Rubber Component Samples',
    'Share the part, material and evaluation requirements for your sample request. We will review what needs to be defined before samples can be prepared.',[
    ('Identify the sample','Provide the drawing, existing designation or reference part details, required quantity and material requirements.'),('Describe the evaluation','Tell us how the sample will be checked, the assembly conditions and the acceptance criteria.'),('Agree the preparation route','Sample availability, tooling, charges and timing depend on the project and are discussed after the technical review.')],['/contact','/testing','/products'],'现有SampleRequestForm字段；不承诺免费或固定交期',cta='Submit Sample Requirements')
add('/batch-rfq','多件号RFQ','转化入口','rubber parts rfq','Request a Quote for Multiple Rubber Parts',
    'Submit a group of rubber components for review. Keep each part number connected to its drawing revision, material specification and expected quantity.',[
    ('Organise the part list','Provide part number, drawing revision, material, unit of measure and quantity for each item. Identify common materials or shared assembly requirements.'),('Clarify commercial scope','Indicate sample quantities, recurring demand, tooling ownership requirements and delivery destination.'),('Define approval requirements','Include inspection, traceability, testing and documentation needs. This helps separate tooling, development and production discussions.')],['/contact','/quality','/capabilities'],'现有BatchRfqForm字段；报价/工具费无虚构',cta='Submit a Multi-Part RFQ')
add('/search','站内搜索','导航工具','site search','Search RubberQ',
    'Search materials, rubber components and engineering resources. Use a material name, part type or application question to find a starting point.',[
    ('Search by material or part','Try FFKM, EPDM, O-rings, gaskets or custom molded parts.'),('Need help with a specification?','Send the drawing and operating conditions for an engineering review.')],['/materials','/products','/resources','/contact'],'保留现有搜索实现；结果页noindex')
for url,name in [('/privacy','隐私政策'),('/terms','使用条款')]:
    add(url,name,'法律/功能页','',('Privacy Policy' if url=='/privacy' else 'Terms of Use'),
        'Read the current '+('privacy policy' if url=='/privacy' else 'terms of use')+' for this website.',[
        ('Existing policy text','Retain the current policy text and its effective date. Changes to legal terms require a separate review of the actual operating arrangements.')],['/contact'],'既有法律文本保留，不用营销稿替换条款','P2')

CLUSTERS={
 'o-rings':('O圈与密封件','/products/seals','products'),
 'gaskets':('定制垫片','/products/gaskets','products'),
 'molding':('定制橡胶模压','/products/custom','products'),
 'flexible':('隔膜与波纹管','/products/bellows','products'),
 'bonding':('橡胶金属粘接','/products/rubber-to-metal-bonded-parts','products'),
 'ffkm':('FFKM与售后替代','/materials/ffkm','materials'),
 'fkm':('FKM与氟橡胶','/materials/fkm','materials'),
 'epdm':('EPDM与流体兼容','/materials/epdm','materials'),
 'hnbr-nbr':('HNBR与NBR','/materials/hnbr','materials'),
 'silicone':('Silicone与LSR','/materials/lsr','materials'),
 'compounds':('配方与胶料外供','/compounds','manufacturing'),
 'engineering':('工程工具与失效','/resources','engineering'),
 'semiconductor':('半导体设备','/industries/semiconductor','solutions'),
 'cooling':('液冷与储能','/industries/liquid-cooling-energy-storage','solutions'),
 'ev':('EV热管理','/industries/ev-energy-storage','solutions'),
 'robotics':('人形机器人','/industries/humanoid-robotics','solutions')}

SOURCE_CLUSTER={'P1 O圈':'o-rings','P2 垫片':'gaskets','C0 定制模压/通用':'molding','P3 隔膜/波纹管':'flexible','C2 粘接/减振':'bonding','M1 FFKM':'ffkm','M2 FKM/Viton':'fkm','M4 EPDM':'epdm','M3 NBR/HNBR':'hnbr-nbr','M5 Silicone/LSR':'silicone','C1 配方/混炼':'compounds','R 工程参考':'engineering','S1 半导体/真空':'semiconductor','S3 液冷/数据中心':'cooling','S4 EV/储能':'ev','S2 机器人':'robotics','X 产地采购':'molding'}

def owner(row):
    k=row['keyword'].lower(); c=SOURCE_CLUSTER[row['cluster']]
    if row['tag']=='noise':return '', '排除：原表noise'
    if row['tag']=='retail_mro':return '', '保留研究：零售/MRO意图，不作为首批采购入口'
    if c=='engineering':
        if any(x in k for x in ('hardness','durometer','shore')):return '/resources/rubber-hardness-guide','工程指南'
        if 'compatib' in k:return '/resources/material-compatibility','工程指南'
        if any(x in k for x in ('o-ring','oring','o ring','groove','as568')):return '/resources/o-ring-size-guide','工程指南'
        return '/resources','工程枢纽；具体文章先核对正文归属'
    if c=='ffkm':
        if any(x in k for x in ('kalrez','alternative','replacement')):return '/products/ffkm-replacement-seals','原件对照/替代评估，不承诺等效'
        return '/materials/ffkm','材料页（不再为近义词单独建页）'
    if c=='silicone':return ('/capabilities/lsr-molding','工艺采购') if any(x in k for x in ('mold','mould')) else ('/materials/lsr' if 'liquid' in k or 'lsr' in k else '/materials/silicone','材料选择')
    if c=='flexible':return ('/products/diaphragms' if 'diaphragm' in k else '/products/bellows'),'产品采购'
    if c=='compounds':return ('/compounds' if any(x in k for x in ('compounder','supplier','manufacturer','suppliers','manufacturers')) else '/compounding'),'工艺与外供按任务分工'
    if c=='molding':return ('/capabilities/rubber-molding' if any(x in k for x in ('molding','moulding','compression','injection')) else '/products/custom'),'定制件或工艺采购'
    if c=='hnbr-nbr':return ('/materials/hnbr' if 'hnbr' in k else '/materials/nbr'),'材料选择'
    if c=='cooling':return CLUSTERS[c][1],'系统级词：仅行业承接，不宣称供应完整液冷系统'
    if c=='fkm':return '/materials/fkm','材料选择；Viton仅第三方材料名称引用'
    if c=='epdm':return '/materials/epdm','材料选择'
    if c=='ev':return '/industries/liquid-cooling-energy-storage' if 'storage' in k else '/industries/ev-energy-storage','按实际工况承接；非部件确认'
    if row['tier']=='工程参考/信息':return CLUSTERS[c][1],'指南归入父页/支持内容；正文归属复核后确定单篇URL'
    return CLUSTERS[c][1],'唯一规划承接页'

# This curated library describes buyer tasks; rows are not publishing quotas.
TOPIC_SEEDS=[
('o-rings','O-Ring Manufacturer Selection: Drawing and Inspection Checklist','o-ring manufacturer','比较供应商并准备图纸','采购'),
('o-rings','Custom O-Rings: Information Needed for an Engineering Review','custom o-rings','提交非标O圈需求','商业'),
('o-rings','O-Ring Size References and Custom Dimension Requests','o-ring size chart','识别尺寸与沟槽','工程参考'),
('o-rings','O-Ring Groove Review: Information to Include with a Drawing','o-ring groove design','检查装配设计','工程参考'),
('o-rings','Micro O-Rings: Handling and Inspection Questions','micro o-rings','评估微小件检测','产品'),
('gaskets','Custom Gasket RFQ: Flange, Material and Quantity Checklist','custom gaskets','形成可报价需求','商业'),
('gaskets','Molded Gaskets and Cut Gaskets: Which Route Fits the Joint?','rubber gaskets','比较工艺路线','工程参考'),
('gaskets','Gasket Compression: Define the Joint Before Choosing Hardness','gasket compression','确认压缩和法兰条件','工程参考'),
('gaskets','Enclosure Gaskets: Drawing and Environmental Requirements','enclosure gasket','准备箱体垫片工况','产品'),
('molding','Custom Molded Rubber Parts: From Drawing to Sample Approval','custom molded rubber parts','选择定制供应商','商业'),
('molding','Rubber Molding Supplier Checklist for OEM Buyers','rubber molding companies','采购比较','采购'),
('molding','Compression, Transfer and Injection Molding: Review Criteria','rubber compression molding','选择成型路线','工程参考'),
('molding','Rubber Part Tolerances: Identify Functional Dimensions','rubber molding tolerances','制定尺寸验收','工程参考'),
('molding','Rubber Tooling RFQ: Parting Lines, Inserts and Revisions','rubber tooling','准备开模评估','商业'),
('molding','Rubber Part Flash: Drawing Limits and Inspection Methods','rubber molding flash','定义外观验收','工程参考'),
('flexible','Rubber Bellows: Travel and Attachment Design Checklist','rubber bellows','准备波纹管行程图','产品'),
('flexible','Rubber Diaphragms: Stroke, Pressure and Clamping Details','rubber diaphragm manufacturer','选择隔膜供应商','采购'),
('flexible','Protective Boots: Specifying Motion and Fluid Exposure','rubber boots','保护运动机构','工程参考'),
('bonding','Rubber-to-Metal Bonding: Insert and Load Review Checklist','rubber to metal bonding','评估硫化粘接件','商业'),
('bonding','Bonded Rubber Failure: Adhesion, Cohesion and Test Direction','rubber metal bond failure','识别粘接失效','工程参考'),
('bonding','Vibration Mount Specifications: What a Static Load Omits','vibration isolation mounts','准备减振件工程要求','工程参考'),
('ffkm','FFKM O-Rings: Compound and Application Review Guide','ffkm o-rings','选择FFKM材料与制品','产品'),
('ffkm','FFKM Replacement Seals: A Qualification Checklist','ffkm replacement seals','制定售后替代验证','商业'),
('ffkm','Kalrez Alternatives: Compare the Specification, Not the Name','kalrez alternative','原件参照与替代评估','商业'),
('ffkm','FKM vs FFKM: Questions to Resolve Before Material Selection','fkm vs ffkm','比较候选材料','工程参考'),
('ffkm','Outgassing Data for Vacuum Seals: Conditions to Keep with Results','low outgassing seals','读懂出气数据条件','工程参考'),
('ffkm','Plasma Seal Evaluation: Why Compound-Specific Data Matters','plasma resistant seals','制定工况验证','工程假设'),
('fkm','FKM O-Rings: Grade, Fluid and Temperature Review','fkm o-rings','选定具体FKM牌号','产品'),
('fkm','Viton and FKM: Material Designations in a Seal RFQ','viton o-rings','厘清品牌与聚合物称谓','工程参考'),
('fkm','EPDM vs FKM: Compare the Complete Service Fluid','epdm vs fkm','比较介质适配','工程参考'),
('fkm','Compression Set Results: Compare the Test Basis','compression set','制定材料验收','工程参考'),
('epdm','EPDM Seals: Define the Fluid and Compressed Joint','epdm seals','EPDM密封选型','产品'),
('epdm','Coolant Compatibility: Fluid Formulation and Immersion Test Plan','coolant compatible epdm','确定冷却液测试','工程假设'),
('epdm','EPDM Gasket Weathering: Specify Exposure and Acceptance','epdm gaskets','户外工况选型','工程参考'),
('hnbr-nbr','NBR vs HNBR: Fluid, Temperature and Mechanical Duty','nbr vs hnbr','选择油接触材料','工程参考'),
('hnbr-nbr','HNBR Seals: A Functional Test Checklist','hnbr seals','HNBR试样验收','产品'),
('hnbr-nbr','NBR O-Rings: Drawing and Material Information for a Quote','nbr o-rings','NBR采购准备','产品'),
('silicone','LSR Molding RFQ: Grade, Geometry and Volume','liquid silicone rubber molding','LSR项目采购','商业'),
('silicone','Silicone Rubber Parts: Parting Lines and Appearance Requirements','silicone rubber molding','定义硅胶成型验收','工程参考'),
('silicone','LSR and Solid Silicone: Questions for a Process Review','lsr vs silicone','评估工艺适配','工程参考'),
('compounds','Rubber Compound Supply: A Buyer Specification Checklist','rubber compounder','准备胶料外供采购','采购'),
('compounds','Rubber Compounding: From Application Conditions to Batch Release','rubber compounding','了解配方与批次控制','商业'),
('compounds','Compound Trial Plan: Validate Material in the Receiving Process','custom rubber compounds','外供试料验证','商业'),
('compounds','Rubber Compound Storage and Handling: Questions for the Supplier','rubber compound storage','确认储运和保质条件','工程参考'),
('compounds','Reading a Rubber Compound Test Report','rubber compound testing','评估批次报告','工程参考'),
('engineering','Shore A Hardness: How to Write a Useful Specification','shore a hardness','制定硬度验收','工具'),
('engineering','Durometer Charts: What They Do and Do Not Compare','durometer chart','避免换算替代实测','工具'),
('engineering','Rubber Chemical Compatibility: Define the Exposure First','chemical compatibility chart','准备介质兼容性数据','工具'),
('engineering','Seal Failure Review: Preserve the Part and Operating History','rubber seal failure','组织失效调查','工程参考'),
('engineering','ASTM D2000 Callouts: Prepare a Material Review Request','astm d2000','理解材料代号','工程参考'),
('engineering','Rubber Sample Approval: A Buyer Checklist','rubber sample approval','形成样品验收表','工程参考'),
('engineering','Rubber Supplier Evaluation: Factory, Testing and Traceability','rubber supplier audit','评估制造商可信度','采购'),
('semiconductor','Semiconductor Seal RFQ: Process and Cleanliness Inputs','semiconductor seals','准备设备密封评估','行业'),
('semiconductor','Vacuum Chamber Seals: Geometry, Temperature and Media','vacuum chamber seals','确认真空腔密封工况','行业'),
('semiconductor','Maintenance Seal Replacement: Document the Original Specification','semiconductor replacement seals','维护替代件评估','工程假设'),
('cooling','Liquid Cooling Seal Review: Fluid Formulation and Joint Geometry','liquid cooling seals','确认冷却系统部件需求','工程假设'),
('cooling','Energy Storage Enclosure Gaskets: Define the Assembly Test','energy storage gaskets','储能柜体垫片验收','行业'),
('cooling','Coolant Seal Validation: Material Tests and Assembly Checks','coolant seal validation','选择验证方法','工程假设'),
('ev','Thermal Management Rubber Parts: Drawing and Fluid Review','ev thermal management seals','准备热管理零件需求','行业'),
('ev','Temperature Cycling: Information Needed for a Seal Review','thermal cycling seals','制定热循环验证','工程假设'),
('robotics','Robotic Protective Bellows: Movement and Retention Review','robot bellows','核对防护套行程','工程假设'),
('robotics','Robot Contact Pads: Friction, Wear and Test Conditions','robot gripper pads','定义接触面性能测试','行业'),
('robotics','Bonded Components for Moving Mechanisms: Load and Interface Inputs','robot rubber components','评估机器人粘接件','工程假设')]

def main():
    for original,name in [(RESEARCH/'data/kw_us_classified_2026-10-21.csv','reused-keywords.csv'),(RESEARCH/'codex/competitors.json','reused-competitors.json'),(RESEARCH/'00-第1步-市场调研与获客方向报告.md','approved-research-report.md'),(ROOT/'rubberq-astro/docs/2026-10-21-GGS重新审查/运行基线.json','reused-baseline.json')]:
        (BASE/'evidence'/name).write_bytes(original.read_bytes())
    source_rows=list(csv.DictReader((RESEARCH/'data/kw_us_classified_2026-10-21.csv').open(encoding='utf-8-sig')))
    kws=[]
    for i,r in enumerate(source_rows,1):
        u,note=owner(r)
        kws.append(dict(id=f'RQ-KW-{i:04}',keyword=r['keyword'],cluster=SOURCE_CLUSTER[r['cluster']],source_cluster=r['cluster'],tag=r['tag'],tier=r['tier'],intent=r['intent'],us_volume=r['us_vol'] or None,kd=r['kd'] or None,cpc_usd=r['cpc'] or None,uk=r['uk'] or None,ca=r['ca'] or None,au=r['au'] or None,india=r['india'] or None,sg=r['sg'] or None,my=r['my'] or None,trend=r['trend'] or None,planned_owner=u,decision=note,date=DATE,language='en',coverage='待存量全文归属核对',source='kw_us_classified_2026-10-21.csv'))
    dump('data/keywords.json',kws);csvout(Path('data/关键词-URL地图.csv'),kws)
    page_urls={p['url'] for p in PAGES}
    assert all(not k['planned_owner'] or k['planned_owner'] in page_urls for k in kws)
    with (BASE/'data/页面职责与URL归属.csv').open('w',encoding='utf-8-sig',newline='') as f:
        fields=['id','url','name','role','keyword','priority','new','status','cta','cta_url','evidence']
        w=csv.DictWriter(f,fieldnames=fields);w.writeheader();w.writerows({k:p[k] for k in fields} for p in PAGES)
    for p in PAGES:
        p['artifact']='pages/'+p['id']+'.md'
        internal=f"# {p['id']} · {p['name']}\n\n目的：交付本页面的结构与英文文案。\n\n| 项目 | 约定 |\n|---|---|\n| 规划英文URL | `{p['url']}` |\n| 动作 | {'新页规划' if p['new'] else '保留现有URL，优化文案'} |\n| 页面职责 | {p['role']} |\n| 主关键词 | {p['keyword'] or '非SEO获客页'} |\n| 优先级 | {p['priority']} |\n| 当前状态 | {p['status']} |\n| 主CTA | {p['cta']} → `{p['cta_url']}` |\n\n结构顺序：Hero → {' → '.join(s[0] for s in p['sections'])} → CTA。\n\n## 页面SEO草稿\n\nTitle: {p['title']}\n\nDescription: {p['meta']}\n\n## 英文页面稿\n\n"
        public=f"# {p['h1']}\n\n{p['intro']}\n\n"+'\n\n'.join('## '+h+'\n\n'+b for h,b in p['sections'])
        if p['faq']:public+='\n\n## Questions about your project\n\n'+'\n\n'.join('### '+q+'\n\n'+a for q,a in p['faq'])
        public+='\n\n## '+p['cta']+'\n\n'+('Contact RubberQ at contact@rubberq.com or submit the project form with your drawing, service conditions and quantity.\n')
        if p['url'] in ('/privacy','/terms'):
            public=''
            internal=internal.replace('## 英文页面稿','## 法律页维护说明')+'本轮保留现行法律正文和有效日期，不生成替代条款。导航、联系方式和移动阅读结构在实施时核对。\n'
        p['copy']=public
        tail='\n## 实施说明（内部）\n\n- 建议内链：'+ '、'.join('`'+x+'`' for x in p['links'])+'。\n- 证据资产：'+p['evidence']+'。\n- 文案无需等待所有证据才交付；未证实的量化/认证/等效主张已从英文稿省略。\n- 法律页保留完整现行条款，本文件不构成新条款。工具页本轮为指南，不宣称已实现查表或计算功能。\n- 本页新增UI内容实施时进入5语种messages；英文博客不复制为多语种文章。canonical/hreflang用createLocaleAlternates，Schema用JsonLd。\n- 本稿的其他内链包含规划新页；在目标实际存在前不写入生产可点击链接。\n'
        write(p['artifact'],internal+public+tail)
    dump('data/pages.json',PAGES)
    topics=[]
    for i,(c,title,kw,job,kind) in enumerate(TOPIC_SEEDS,1):
        matched=[k for k in kws if k['keyword'].lower()==kw.lower() and k['tag']=='b2b']
        owned=matched[0]['planned_owner'] if matched and matched[0]['planned_owner'] else CLUSTERS[c][1]
        if 'size' in kw or 'groove' in kw:owned='/resources/o-ring-size-guide'
        if c=='engineering' and any(x in kw for x in ['hardness','durometer']):owned='/resources/rubber-hardness-guide'
        if c=='engineering' and 'compatibility' in kw:owned='/resources/material-compatibility'
        if c=='engineering' and 'failure' in kw:owned='/resources/seal-failure-analysis'
        if c=='engineering' and 'astm' in kw:owned='/standards'
        if c=='engineering' and 'sample' in kw:owned='/sample-request'
        if c=='engineering' and 'audit' in kw:owned='/quality'
        if c=='ffkm' and any(x in kw for x in ('replacement','alternative')):owned='/products/ffkm-replacement-seals'
        if c=='compounds' and ('Trial' in title or 'Storage' in title):owned='/compounds'
        if c=='silicone' and 'Silicone Rubber Parts' in title:owned='/materials/silicone'
        topics.append(dict(id=f'RQ-T-{i:03}',cluster=c,business_line=CLUSTERS[c][0],pillar=CLUSTERS[c][2],title=title,primary_keyword=kw,buyer_job=job,intent=kind,planned_parent=owned,planned_url=None,action='先核对现有父页与存量全文；可作为父页章节，不默认新建文章',priority='P0' if kind in ('采购','商业') or c=='ffkm' else 'P1',market='P1 NA-en / UK-en / DACH-de；P2 JP-ja / SEA-en',observed_volume=matched[0]['us_volume'] if matched else None,source_keyword_ids=';'.join(k['id'] for k in matched),demand_evidence='2026-10-21既有词表' if matched else '工程/买家任务假设，未新增付费验证',coverage='待全文归属核对',product_fit='待具体项目适配',executable='否',cannibalization='待核对',suggested_action='正文核对后确定章节/更新/新页',evidence_needed='工况或标准一手依据；自有性能须具体配方/型号/测试报告',cta='/contact',status='规划已交付',source='用户批准报告方向 + 本轮买家任务整理'))
    dump('data/topics.json',topics);csvout(Path('data/话题库.csv'),topics)
    competitors=json.loads((RESEARCH/'codex/competitors.json').read_text())
    comps=[]
    for i,c in enumerate(competitors,1):
        comps.append(dict(id=f'RQ-C-{i:03}',domain=c['domain'],group=c['group'],positioning=c['positioning_summary'],reference_job='IA/产品材料分工、RFQ字段、工程资源、工厂证据；只参考结构，不沿用对方性能或资质',navigation=' / '.join(c['top_nav']),rfq=json.dumps(c['rfq_path'],ensure_ascii=False),evidence=json.dumps(c['evidence'],ensure_ascii=False),notable_pages=json.dumps(c['notable_pages'],ensure_ascii=False),snapshot_date=DATE,status='既有拆解数据复用；未重新抓取'))
    dump('data/competitors.json',comps);csvout(Path('data/竞品参考清单.csv'),comps)
    edges=[]
    for p in PAGES:
        for u in p['links']:edges.append(dict(source=p['url'],target=u,type='规划内链',status='待实施'))
        if p['url']!=p['cta_url']:edges.append(dict(source=p['url'],target=p['cta_url'],type='CTA',status='待实施'))
    for t in topics:edges.append(dict(source=t['id'],target=t['planned_parent'],type='话题归属候选',status='待全文核对'))
    csvout(Path('data/组织星图关系.csv'),edges)
    dump('data/graph.json',dict(clusters=CLUSTERS,pages=[{k:p[k] for k in ['id','url','name','role','new']} for p in PAGES],topics=topics,edges=edges))
    build_docs(kws,topics,comps)
    build_board(topics)
    sources=[ROOT/'AGENTS.md',ROOT/'rubberq-astro/AGENTS.md',ROOT/'Design.md',ROOT/'rubberq-astro/src/messages/en.json',ROOT/'rubberq-astro/src/lib/materials.ts',ROOT/'rubberq-astro/src/lib/products.ts',RESEARCH/'00-第1步-市场调研与获客方向报告.md',RESEARCH/'data/kw_us_classified_2026-10-21.csv',RESEARCH/'data/kw_expansion_raw_4087.csv',RESEARCH/'codex/competitors.json',ROOT/'全球增长系统/基础信息库/public-fact-registry.json',ROOT/'rubberq-astro/docs/2026-10-21-GGS重新审查/运行基线.json']
    if (BASE/'evidence/cms-published-source.json').exists():sources.append(BASE/'evidence/cms-published-source.json')
    dump('evidence/source-manifest.json',dict(captured_on=DATE,network_calls=0,paid_calls=0,sources=[dict(path=str(p.relative_to(ROOT)),sha256=hashlib.sha256(p.read_bytes()).hexdigest(),bytes=p.stat().st_size) for p in sources]))
    print(json.dumps(dict(pages=len(PAGES),new_planned_pages=sum(p['new'] for p in PAGES),keywords=len(kws),topics=len(topics),competitors=len(comps),edges=len(edges)),ensure_ascii=False))

def build_docs(kws,topics,comps):
    index='\n'.join(f"| {p['id']} | [[pages/{p['id']}|{p['name']}]] | `{p['url']}` | {p['role']} | {'新页' if p['new'] else '保留优化'} | {p['priority']} |" for p in PAGES)
    write('04-页面文案索引.md','# 全站页面结构与英文文案\n\n目的：按唯一URL交付页面职责、模块、SEO草稿、CTA和完整英文模块稿。\n\n全部为本地文案交付；没有CMS写入或生产上线。英文博客正文不在本轮批量重写范围，先完成全文归属核对；法律页沿用现行正文。\n\n| 编号 | 页面稿 | 规划英文URL | 职责 | 动作 | 优先级 |\n|---|---|---|---|---|---|\n'+index+'\n\n核心页面稿包含约束与内链，新页路径仅为规划，不作为在线链接存在性证明。\n')
    write('00-交付入口.md',f'''# RubberQ 线上获客执行交付

目的：执行已验收的市场方向，交付企业叙事、全站IA、页面结构与英文稿，以及可维护的增长和内容看板。

更新：{DATE}，Asia/Shanghai。第1步报告方向已由用户确认；付费数据预算待定，先不花费。

## 从这里开始

1. [[01-验收决策与执行口径]]：四项同意与零新增费用约束。
2. [[02-企业形象与英文文案]]：Slogan保持、企业介绍与核心价值。
3. [[03-全站IA与URL归属]]：获客层、转化层、导航和URL职责。
4. [[04-页面文案索引]]：{len(PAGES)}份页面结构与英文稿，其中{sum(p['new'] for p in PAGES)}个为新页规划。
5. [[05-关键词话题与竞品资产说明]]：{len(kws)}行关键词映射、{len(topics)}项话题、{len(comps)}家竞品参考与星图关系。
6. [[06-获客执行与询盘运营]]：执行依赖、渠道、询盘承接和复盘。
7. [[07-看板运行与维护]]：增长总控、内容工作台和交互星图。

## 当前成果口径

本轮完成策划、逐页稿和本地看板接入，不代表新页面上线、存量文章全部审查、获得排名或产生新询盘。关键词为10月21日已有付费采集数据的离线复用；搜索量缺失保持null，未开展新增采集。20–50条/月沿用报告情景目标，不作为当前实绩。

看板业务数据在本目录，唯一跨任务池仍是根 `任务清单.md`。旧图谱388卡保留；本轮话题库是按新方向形成的工作清单，不宣称已与旧卡或271篇文章完成语义合并。
''')
    write('02-企业形象与英文文案.md','''# RubberQ 企业形象与英文文案

目的：把已批准市场方向转为客户能理解的企业叙事。Slogan保持，所有下列英文为可用于页面的文案稿。

## 品牌主张（原文保持）

Japanese Formulation. Chinese Precision. Trusted Since 1995.

Compounded by Japan. Built in China. Tested in-House.

## 企业定位

Precision rubber compounding and manufacturing for industrial components.

## 约50词企业介绍

RubberQ is a precision rubber component manufacturer established in Fuzhou, China, in 1995 as a Sino-Japanese joint venture. We connect Japanese formulation support with compound preparation, molding, in-house testing and ERP production records, helping industrial buyers review materials, develop components and prepare for repeat supply.

## 完整企业介绍

RubberQ manufactures precision rubber components for industrial assemblies. Established in Fuzhou in 1995 as a Sino-Japanese joint venture, we bring Japanese formulation support together with compound preparation, molding and in-house testing in China.

Our two facilities cover approximately 20,000 square metres. Material preparation, production and inspection are connected through ERP records, supporting the transition from a drawing or sample to repeat manufacturing.

We work with customers to review service media, temperature, movement, geometry and quality requirements. O-rings, seals, gaskets, bellows, bonded components and custom molded parts each start with the conditions they need to meet. Compound supply and FFKM replacement projects follow the same application-led discussion.

RubberQ holds IATF 16949:2016, ISO 9001:2015 and ISO 14001:2015 certifications. For supplier evaluation, ask for current certificates, the applicable scope and documentation relevant to your project.

Send your drawing, material specification, operating conditions and quantity to discuss the next technical and commercial steps.

## 四项价值模块

### Material decisions connected to manufacturing

Review the compound, geometry and process together. Japanese formulation support and in-house preparation help connect the material discussion to the part that will be made.

### Inspection defined around your requirements

Agree the material properties, dimensions and functional checks that matter to the component. Keep test conditions and acceptance criteria with the result.

### Records that support repeat supply

Material batch identification, production records and inspection results support traceability from approved samples to later orders.

### A clear next step for engineering and purchasing

Bring a drawing, a reference part or an application question. We help define the information needed for a material review, sample evaluation or quotation discussion.

## RFQ微文案

- 主CTA：Request a Quote
- 工程CTA：Discuss Your Application
- 替代件CTA：Request an FFKM Replacement Review
- 胶料CTA：Request a Compound Supply Review
- 附件说明：Attach your drawing and include the revision number. If a drawing is unavailable, describe the part function and operating conditions.
- 时效说明：Our team will review your requirements and contact you about the next steps.
- 成功提示：Thank you. Your project details have been submitted. Please keep any drawing revision or additional technical information available for the follow-up discussion.

## 内部实施说明

当前messages存在旧汽车首位、量化设备数量、性能/寿命、机器人与液冷承诺等表述。本轮按现行事实和本次批准方向形成替代稿；并未将旧数值带入新文案。客户稿不包含日方名称、具体未确认高压应用、未经证实认证、价格或交期。认证上线时读取有效证书，具体能力数字与案例另有原始依据才补。
''')
    rows='\n'.join(f"| `{p['url']}` | {p['name']} | {p['role']} | {p['keyword'] or '功能页'} | {'保留现有URL' if not p['new'] else '规划新URL'} |" for p in PAGES)
    write('03-全站IA与URL归属.md','''# RubberQ 全站 IA 与 URL 归属

目的：让材料/产品/工艺搜索找到匹配入口，让工程与采购继续验证能力并提交需求。按用户批准方向组织，不重新讨论赛道取舍。

## 主导航

Products / Materials / Capabilities / Industries / Resources / About / Request a Quote。

Products：O-Rings & Seals、Custom Gaskets、Custom Molded Parts、Bellows & Boots、Diaphragms、Rubber-to-Metal Parts、FFKM Replacement Seals。

Materials：FFKM、FKM、EPDM、HNBR、NBR、Silicone、LSR；ACM/AEM保留二级索引，不扩张无任务的新页。

Capabilities：Rubber Molding、Compounding & Formulation、Compound Supply、Testing、Quality & Traceability、Factory。

Industries顺序：Semiconductor → Liquid Cooling & Energy Storage → EV Thermal Management → Humanoid Robotics；General Industrial、Automotive Tier 2保留次级入口。

Resources：Material Selection、O-Ring Size Guide、Hardness Guide、Compatibility Review、Failure Analysis、Standards、English Blog。

About：Company / Factory / Quality。工厂和质量是同一URL的多入口链接，不复制页面。

## 两层职责

- 获客：产品、材料、工艺、工程问题。采购页直接说明可讨论的产品、规格输入、评估方式和询盘下一步。
- 信任与转化：行业、质量、检测、工厂、企业与RFQ。行业页链接具体材料/产品，材料/产品页回链合适行业；均可直接进入Contact/Sample/Batch RFQ。

两层是访问任务分工，不是互不连接的目录。主页、导航和正文形成双向关系。

## URL规则

- 英文根路径，无`/en`；de/ja/es/zh前缀。英文博客唯一内容语言，现有兼容URL行为由原路由维护。
- 保留现有材料、产品、核心和行业URL。`/products/seals`作为O圈/密封件主入口，不另建近义O圈商业页。
- `/materials/ffkm`解释材料；`/products/ffkm-replacement-seals`承接设备维护替代评估；`/industries/semiconductor`承接设备工况。三页主任务不同。
- `/compounding`讲配方与混炼能力；`/compounds`承接外供；`/capabilities/rubber-molding`讲成型采购；`/products/custom`讲按图定制制品。
- `/materials/lsr`负责材料选择，`/capabilities/lsr-molding`负责工艺采购。
- 保留`/industries/ev-energy-storage`，主文案收敛EV热管理；新液冷与储能页承担该方向。对已有储能排名页面先读GSC与全文，不因新规划做301或撤销。
- 图表/计算器先交付指南与字段结构；数值表和算法须有相应标准与实测/权威数据才实施，不制造不可用工具。
- Title/description按页面任务定稿；canonical/hreflang经createLocaleAlternates，JsonLd按实际内容注入；没有可见FAQ不加FAQ内容。

## 唯一规划职责表

| URL | 页面 | 任务 | 主词 | 动作 |
|---|---|---|---|---|
'''+rows+'''

## 存量保护与实施验收

271篇文章是报告基线，不是本轮读取后的实时库存。上线前按实际CMS正文、状态与GSC查询—页面读取决定保留、补充、合并或新增。标题/slug匹配只能列候选，不能标记已覆盖。新页规划不等于已创建；全部内链目标实际存在后才写入生产。

实施顺序：核心商业页与工厂信任稿 → 材料与工艺 → 外供/替代 → 行业 → 工程资源与存量正文归属。每批自审、红线、品牌色、5语种、构建、真实路由与RFQ回归；状态分别记录本地稿、CMS、部署、线上、搜索和询盘。
''')
    write('05-关键词话题与竞品资产说明.md',f'''# 关键词、话题与竞品资产说明

目的：把第1步调研变成可供页面和内容生产使用的结构化资产，不新增付费采集。

## 数据资产

- `data/关键词-URL地图.csv`：原分类表{len(kws)}行全部保留，原tag、volume、KD、CPC及国家数值原样带入；新增稳定ID、唯一规划承接页和任务说明。
- 原始扩展4087词继续保留在调研目录，不把battery等扩展噪声加入采购队列。
- `data/话题库.csv`：{len(topics)}项买家任务，16个簇；区分既有词表观察与工程假设。exact关键词匹配才带入数值，否则null。
- `data/竞品参考清单.csv`：20站既有拆解的导航、RFQ、关键页面和证据URL，未重新采集。竞品自述只作对标，不写成RubberQ能力。
- `data/组织星图关系.csv`与`data/graph.json`：页面规划内链、CTA、话题父页，关系是计划状态。
- `data/pages.json`是全部页面稿和看板展示源；页面md由工具重建，编辑文案需先更新tools/build_package.py内对应页面。

## 数据语义

原表tag：{json.dumps(dict(Counter(k['tag'] for k in kws)),ensure_ascii=False)}。noise排除采购；retail_mro保留研究不计首批商业机会；b2b也不等于已确认产品适配。

不累加近义词搜索量生成市场规模。本轮没有宣称完成Google近义词归组；每行数值来自原采集快照。KD和CPC仅供排序参考，不作为排名或订单保证。

本轮新话题没有自行生成新slug：先确定它是父页章节、已有文更新还是独立任务，再冻结唯一URL。全部coverage保持“待全文归属核对”；没有把规划命中当已覆盖，也没有把全部话题视作可立即写作。

## 竞品参考方式

中国工厂看产品与材料入口、工厂证据和采购微文案；欧美制造商看工程型RFQ、设计资料、样品与检测说明；分销商看尺寸/材料查找任务；高端材料品牌看按工况组织技术资料。候选竞品清单不等于外链已获得、对方已接洽或可直接复制的内容。

## 优先内容组合

1. 定制模压/O圈/垫片采购页及图纸清单，直接承接商业与采购词。
2. FFKM/FKM材料与售后替代评估，连接半导体工况和样品。
3. 胶料外供、配方与批次控制，把客户成型过程纳入试料信息。
4. EPDM介质兼容、硬度、O圈尺寸、失效分析等支持资源连接到对应产品和询盘。
5. 四个行业页按批准顺序建设，承担工程确认和定向外联落点。

## 复用Yakeclimate的方法

读取了本机Yakeclimate《00-话题图谱进度总控》：沿用唯一逐行状态、父页/机会/稿件分离、已有覆盖保护、PageSpec与回执分离、发布后14/28/90天观察。未复制其机会数量、产能配额、行业事实或发布授权。
''')
    write('06-获客执行与询盘运营.md','''# RubberQ 获客执行与询盘运营

目的：围绕真实工程需求推进已批准方向，把网站入口接到可评估、可报价和可跟进的询盘。

## 执行次序与依赖

1. 本轮完成企业与逐页稿、关键词职责、话题和看板。实施时先接主页、定制件/O圈/垫片、FFKM/FKM、配方外供、替代评估和RFQ。
2. 既有271篇文章按实际全文与GSC查询归属做保留/更新/章节合并/新增判断；保留已在排名的URL。没有覆盖证据的行保持待核对。
3. 工厂资料按具体主张补齐：证书有效期与范围、设备/工艺清单、测试条件与报告、脱敏样品和可公开案例；未获资料不写性能数值。
4. 页面稿实施进入5语种messages与结构化数据，先本地检查，再真实发布和回读；本轮策划交付不提前记上线。
5. 执行渠道优先自然搜索和免费、可人工完成的资料准备；目录、行业资源、展会和目标客户研究形成候选，外发由另一次明确授权执行。

## 区域落地

- 北美：精密定制、复杂工况、维护替代与小批多品种的工程采购任务。报价前按具体货物归类和交付约定核查费用，不在当前新稿给固定关税百分比。
- DACH/英国：德语采购表达与英式moulding用语在同一页面职责下本地化；不把英国拼写另建重复页。
- 日本/东南亚：保留日语信任和项目评估入口，以具体工厂/设备需求开展后续研究；不以语言或地区猜测成交概率。
- 印度：不主攻，保留已有数据作比较，不派新内容配额。

## 询盘分流和需要的信息

Quote：图纸版本、材料/工况、数量、目的地、质量要求。

Sample：样品目标、数量、验证方法、装配要求、现有件信息。

Engineering Review：失效现象、介质/温度/运动、结构限制、现有规格。

外供补充：接收成型工艺、供货形式、储存/保质要求、试料与放行指标。替代件补充：原件规格/品牌参考、尺寸、设备位置、工况和资格验证要求。

优先复用现有Contact/Sample/Batch表单，不为新CTA默认扩改Worker/D1；新字段需要时再同步前端、追踪、Worker与D1契约。

## 业务状态

测试/推广 → 有具体需求 → 技术适配确认 → 信息齐备可报价 → 报价 → 样品验证 → 订单 → 复购。测试和推广不进入真实需求漏斗。销售/工程确认前不自动把技术询盘标合格商机；GA4 generate_lead与真实询盘分别记。

## 目标与复盘

报告20–50条/月为12个月情景目标，其中合格询盘约三分之一是原假设；本轮不制造当前增长或保证。前期先看商业页曝光/点击、目标查询页面匹配、表单完成和真实技术需求，再以实际转化调整。

沿用10月29日既有GSC复盘节点；本轮未创建自动化。每个实际上线批次从真实上线日期起14/28/90天复盘。免费数据通过既有GSC/GA4来源手动读取，付费关键词/排名/AI监测保持不启用。

## 补充资产

工厂补证请求登记在growth-board/external-requests.json，状态为未发出；不是已通知工厂。目录/外链候选未发送；客户案例需公开许可；工程图表不冒充RubberQ实测。
''')

def build_board(topics):
    def obj(items):return dict(schema_version=1,items=items)
    dump('project-config.json',dict(schema_version=1,adapter='native_json',allowed_roots=['.'],data='data/content.json',project=dict(id='rubberq-acquisition-20261021',name='RubberQ 内容与获客工作台',domain='https://rubberq.com',active_pillar='products',pillar_policy='先按现有正文完成URL归属核对；本轮规划不自动派稿，不跳过现有文章保护。',views=[dict(label='主题星图与页面稿',url='/map'),dict(label='增长总控',url='/growth')]),cluster_order=list(CLUSTERS),policy=dict(boundaries=['用户已批准四项方向；不重复询问方向','Slogan保持原文','付费预算待定，先不花费','不以规划URL或标题匹配认定覆盖','生产实施与上线须记录真实回执','无外发、无周期采集、无自动派稿']),local_views={'/map':'map.html'},growth_board=dict(root='growth-board',project_root='../../..',evidence_roots=['.'],sources=dict(topics=dict(path='data/话题库.csv',columns=dict(business_line='business_line',coverage='coverage'),covered_states=['已覆盖'],counts=dict(executable=dict(column='executable',values=['是']),pending_fit=dict(column='product_fit',values=['待具体项目适配']),cannibalization=dict(column='cannibalization',values=['是']),merge_suggestions=dict(column='suggested_action',values=['合并'])))))))
    config=json.loads((BASE/'project-config.json').read_text())
    if (BASE/'data/目录与资源候选.csv').exists():config['growth_board']['sources']['backlinks']=[dict(path='data/目录与资源候选.csv',label='目录与资源候选')]
    changelog=ROOT.parent.parent/'全球增长系统复用/CHANGELOG-rules.json'
    if changelog.exists():config['growth_board']['sources']['changelog']=str(changelog)
    dump('project-config.json',config)
    dump('data/content.json',dict(clusters=[dict(id=k,title=v[0],pillar=v[2]) for k,v in CLUSTERS.items()],opportunities=[dict(id=t['id'],ids=[t['id']],cluster=t['cluster'],pillar=t['pillar'],title=t['title'],query=t['primary_keyword'],priority=t['priority'],action='全文归属核对后确定章节、更新或新页',suggested_url=t['planned_parent']) for t in topics],articles=[],packages=[],done={},partial={},covered={},holds={t['id']:dict(reason='本轮为话题规划；尚未完成与实际CMS正文的唯一URL归属核对',evidence='../03-全站IA与URL归属.md',release_condition='读取实际正文及相关查询，冻结买家任务、现有覆盖与URL归属后进入制作') for t in topics},receipts=[],counters=dict(completed_items=0,new_urls=0,updated_urls=0)))
    decisions=[]
    qs=[('赛道重排','同意：半导体→液冷与储能→EV热管理→人形机器人；通用工业定制件为获客主力'),('市场排序','同意：P1北美与欧洲DACH/英国；P2日本/东南亚；印度不主攻'),('获客层与转化层分离','同意'),('胶料外供与FFKM售后替代','同意，纳入网站与内容规划'),('付费数据与监测预算','待定，先不花费')]
    for i,(q,a) in enumerate(qs,1):decisions.append(dict(id=f'RQ-DEC-{i:02}',question=q,options=['同意','不同意','待定'],recommendation='执行用户已确认决定' if i<5 else '保持待定，先不花费',due_date=None,status='已决' if i<5 else '未决',result=a,decided_at=DATE if i<5 else None,source='rubberq-astro/docs/2026-10-21-线上获客执行/01-验收决策与执行口径.md'))
    dump('growth-board/decisions.json',obj(decisions))
    prefix='rubberq-astro/docs/'+BASE.name+'/'
    items=[]
    for i,(title,outputs) in enumerate([
        ('第1步方向验收记录',['01-验收决策与执行口径.md']),('第2步企业形象文案',['02-企业形象与英文文案.md']),('第3步全站IA',['03-全站IA与URL归属.md','data/页面职责与URL归属.csv']),('第4步逐页结构与英文稿',['04-页面文案索引.md','data/pages.json']),('第5步关键词、话题与竞品资产',['05-关键词话题与竞品资产说明.md','data/话题库.csv','data/关键词-URL地图.csv','data/竞品参考清单.csv']),('本地只读看板接入',['07-看板运行与维护.md','project-config.json']),('存量全文与URL归属核对',[]),('批准页面的代码/CMS实施与上线',[])] ,1):
        items.append(dict(id=f'RQ-EXEC-{i:02}',type='任务',title=title,owner='Codex',status='待验收' if i<=6 else '计划',dependencies=[] if i==1 else ['RQ-EXEC-01'],start_date=DATE if i<=6 else None,completion_date=None,outputs=[prefix+p for p in outputs],reports=[prefix+'00-交付入口.md'],next_step='查看本地交付与验收记录；不等同官网上线' if i<=6 else '按实际正文和发布范围接续',channel='content',source='根任务清单RQAC系列的只读阶段投影',note='本轮交付，未实施外部发布' if i<=6 else '尚未执行',delivered_at=DATE if i<=6 else None))
    dump('growth-board/work-items.json',obj(items))
    reqs=[]
    for i,(title,details,pages) in enumerate([
        ('现行证书与厂区影像','证书有效期和范围；两厂区实拍；不包含私人信息',['/quality','/factory','/about']),
        ('外供胶料项目资料','供货形式、配方/规格职责、包装储存、批次报告、试料流程',['/compounds']),
        ('FFKM原件与候选材料资料','原件尺寸和工况、具体候选牌号、TDS、需要验证的项目',['/products/ffkm-replacement-seals','/materials/ffkm']),
        ('LSR与粘接件制造资料','工艺适配、真实设备、样件及检验；不默认认证/产能',['/capabilities/lsr-molding','/products/rubber-to-metal-bonded-parts']),
        ('可公开项目样例','客户许可、问题/规格/测试/结果；无许可则匿名且不可反推客户',['/case-studies'])],1):reqs.append(dict(id=f'RQ-EXT-{i:02}',title=title,owner='工厂',status='未发出',unlocks=pages,details=details,source=prefix+'06-获客执行与询盘运营.md'))
    dump('growth-board/external-requests.json',obj(reqs))
    dump('growth-board/cadence.json',obj([dict(id='RQ-REV-1029',title='既有GSC复盘节点',frequency='单次',next_at='2026-10-29',last_result=None,owner='Codex',status='待执行；未创建自动化',timezone='Asia/Shanghai'),dict(id='RQ-POST-LIVE',title='发布后14/28/90天复盘',frequency='按实际上线日期',next_at=None,last_result=None,owner='Codex',status='待真实上线日期',timezone='Asia/Shanghai')]))
    baseline=json.loads((ROOT/'rubberq-astro/docs/2026-10-21-GGS重新审查/运行基线.json').read_text())
    def metric(v,unit='次',scope='gsc_global',kind='rolling_28d'):return dict(value=v,period_start=baseline['data_window']['start'],period_end=baseline['data_window']['end'],scope=scope,period_kind=kind,unit=unit)
    metrics=dict(gsc_clicks=metric(10),gsc_impressions=metric(901),gsc_ctr=metric(baseline['kpis']['gsc_ctr']*100,'%'),ga4_organic_sessions=metric(15,scope='ga4_global'),inquiry_total=dict(value=1,period_start=None,period_end=DATE,scope='manual_d1_non_test_technical',period_kind='all_time',unit='条'),inquiry_qualified=dict(value=None,period_start=None,period_end=DATE,scope='sales_qualified',period_kind='all_time',unit='条'))
    dump('growth-board/goals.json',dict(schema_version=1,baseline_date=DATE,baseline=metrics,milestones=[],core_keywords=[dict(keyword=k,category='采购') for k in ['custom molded rubber parts','custom gaskets','o-ring manufacturer','rubber compounder','ffkm o-rings']],backlink_target=None,notes=['报告12个月20–50条/月为情景模型，未制造中间月KPI。','D1 19记录中仅1条具体技术需求；不是销售已确认合格商机。','不新增付费或周期采集。'],sources=[prefix+'01-验收决策与执行口径.md']))
    dump('growth-board/kpi-snapshots/'+DATE+'.json',dict(schema_version=1,date=DATE,kind='baseline',metrics=metrics,core_keyword_rankings=[dict(keyword=k,position=None) for k in ['custom molded rubber parts','custom gaskets','o-ring manufacturer','rubber compounder','ffkm o-rings']],notes=['来自10月21日既有审查快照，非本轮新增采集。','GSC窗口2026-09-20至2026-10-17；GA4来源时区与GSC不同。']))
    write('07-看板运行与维护.md','''# RubberQ 看板运行与维护

目的：用GGS现有只读服务承载RubberQ的增长总控、内容机会、主题星图、关键词和逐页稿。

## 运行

在本目录执行：

```bash
python3 tools/serve.py --port 8797
```

打开 http://127.0.0.1:8797/map 查看本轮交付与交互星图；/growth为增长总控；/为内容工作台。端口被其他项目占用时另选空闲端口，不停止其他项目服务。服务只监听127.0.0.1，没有写接口、远程采集、自动派稿、CMS写入或定时任务。

## 数据维护

- 页面文案与话题：tools/build_package.py内的页面和买家任务数据；离线重建生成pages与data。
- 第1步决定：01-验收决策与执行口径.md为原文记录，growth-board/decisions.json为看板结构化投影。
- 执行任务：根任务清单为跨任务权威；growth-board/work-items.json仅维护本轮里程碑投影，推进时同步该字段和根任务，不改历史回执。
- 内容逐项状态：data/content.json，当前没有文章发布回执，所以done/covered/packages均为空；话题按正文归属核对保持holds，避免一键生成重复文章。
- 询盘快照：growth-board/kpi-snapshots，真实值与null分开，测试/推广排除；不能把D1总记录当商机。
- 源文件hash：evidence/source-manifest.json；不得把旧快照显示成自动实时数据。

## 离线重建

```bash
python3 tools/build_package.py
python3 tools/build_map.py
```

重建工具会重置本轮生成的数据；进入后续真实生产后不要直接覆盖已写回的状态和回执，先将该批次冻结归档或调整生成器保存现有状态。

## 原包参考

GGS skills/ggs-content-production-dashboard负责只读服务；本项目只有配置和业务数据，不复制另一套服务。Yakeclimate经验用于唯一状态源、PageSpec、覆盖保护和发布后观察。没有沿用其文章数、生产配额或CMS授权。
''')

if __name__=='__main__':main()
