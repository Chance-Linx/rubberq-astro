---
type: "whitepaper"
title: "Compound Selection Guide for EV Thermal Management Sealing"
subtitle: "An engineering reference for HNBR, FKM, and EPDM specification in battery cooling, charging infrastructure, and thermal management circuits"
slug: "compound-selection-guide-ev-thermal-management"
audience: "EV Tier 1 / Tier 2 design engineers and procurement"
length: "~8000 words, ~14 pages PDF"
gatedDownload: true
emailGate: true
ctaPlacement:
  - "/compounding (Hero secondary CTA: Download Capability Sheet)"
  - "/industries/ev-energy-storage (post-engagement CTA)"
  - "/materials/hnbr (related materials sidebar)"
  - "Blog articles 02 and 07 (footer CTA)"
internalLinks: ["/compounding", "/industries/ev-energy-storage", "/testing"]
publishedAt: "2026-06-15T08:00:00Z"
author: "RubberQ Engineering Team"
version: "1.0"
status: "draft"
---

# Compound Selection Guide for EV Thermal Management Sealing

**An engineering reference for HNBR, FKM, and EPDM specification in battery cooling, charging infrastructure, and thermal management circuits**

*RubberQ Engineering Team · 2026-06 · v1.0*

---

## Executive Summary

This guide provides EV design engineers and procurement teams with a structured approach to specifying rubber compounds for thermal management sealing applications. It covers HNBR, FKM, and EPDM family selection, the service environment parameters that drive the choice, the specifications that matter (and the ones that don't), and the supplier diligence questions that separate compound formulators from molders.

The guide is written for engineers who need to make a compound-level specification decision without rebuilding their elastomer knowledge from scratch. Each chapter ends with a one-paragraph practical takeaway and a specification checkpoint.

**Reading time:** 35-45 minutes.

**Best applied to:** Battery cooling circuits, motor cooling loops, inverter coolant hoses, charging infrastructure seals, BESS cabinet sealing, EV peripheral test equipment, EV Tier 2 thermal connector seals.

**Not applicable to:** Unconfirmed high-risk internal energy-system sealing programs requiring direct supplier consultation, regulated healthcare sealing, aerospace fuel system sealing.

---

## Table of Contents

1. The Compound Decision (and Why It's Not the Same as the Family Decision)
2. The Service Environment Parameters That Drive Selection
3. HNBR: Mechanism, Capability Envelope, and Specification Patterns
4. FKM: Mechanism, Capability Envelope, and Specification Patterns
5. EPDM: When It's the Right Answer for Adjacent Applications
6. Specification Templates: What to Put on the RFQ
7. Test Reports: What to Demand and How to Read Them
8. Supplier Diligence: Separating Compounders from Molders
9. Cost Modeling: The Real Total Cost Picture
10. Appendices

---

## 1. The Compound Decision (and Why It's Not the Same as the Family Decision)

When an engineer specifies "FKM, 75 Shore A" on an RFQ, they have made a family decision and a hardness decision. They have not yet made the compound decision. The compound decision — which specific FKM formulation, with what filler chemistry, cure system, plasticizer package, and antioxidant balance — happens in the supplier's compounding facility (or, more often, in the supplier's compound trader's facility).

The performance variation between two "FKM 75 Shore A" compounds from different suppliers is typically:

| Property | Variation Range |
|---|---|
| 70 hr / 150°C compression set | 18-50% |
| Heat aging after 1000 hr / 175°C | 15-45% retained tensile |
| Low-temperature brittle point | -10°C to -35°C |
| Service life in glycol coolant at 130°C | 3-10 years |

The 3× variation in expected service life is the difference between a 10-year energy-system design surviving its design life or failing in years 4-6 with warranty exposure. The variation is not due to FKM being a bad material. It is due to the compound being chosen without enough specificity.

This guide focuses on getting the compound decision right.

**Specification checkpoint #1:** When issuing an RFQ for EV thermal sealing, the spec should include not just material family and hardness but also: maximum sustained service temperature, primary service fluid identity, required compression set at service temperature × service duration, and required low-temperature limit.

---

## 2. The Service Environment Parameters That Drive Selection

Compound selection follows from service environment, not from product category. Five parameters dominate the decision:

### 2.1 Maximum sustained service temperature

EV thermal management circuits operate continuously at the maximum temperature. ICE engine seals see peak temperatures but cool between trips. EV applications see operating temperature as the sustained temperature.

| Sustained Max Temperature | Compound Implication |
|---|---|
| Up to 100°C | NBR adequate; HNBR over-specified |
| 100-130°C | Standard HNBR appropriate |
| 130-160°C | High-saturation HNBR or FKM crossover region |
| 160-200°C | FKM required (HNBR oxidizes) |
| 200°C+ | FKM specialty grades or FFKM |

### 2.2 Primary service fluid

Coolant chemistry is rarely "water". EV thermal circuits typically use:

- **Ethylene glycol + water (50/50)** for general battery cooling
- **Propylene glycol + water** for lower-toxicity applications
- **OAT/HOAT formulated coolants** with corrosion inhibitor packages
- **Synthetic dielectric coolants** for immersion-cooled batteries (silicones, esters, fluorinated fluids)
- **Refrigerants** in heat-pump-based thermal management (R134a, R1234yf)

Each fluid has different compound compatibility profile. ASTM D471 immersion tests at service temperature, 70-1000 hours, give the actionable data.

### 2.3 Required compression set retention

Compression set is the dominant failure mode for static seals in EV thermal applications. The spec on a generic data sheet (70°C × 22 hours, ASTM D395 Method B) is irrelevant for sustained service. The relevant spec is at service temperature × service duration:

| Application | Compression Set Spec |
|---|---|
| Static gasket, 8-15 year battery life | <25% at 150°C × 1000 hours |
| Connector seal, 5-10 year life | <30% at 130°C × 1000 hours |
| Hose flange seal, 5-7 year life | <35% at 130°C × 500 hours |

### 2.4 Low-temperature requirement

Cold start to -40°C is standard for automotive. The compound's low-temperature brittleness point (ASTM D2137) must be at least 10°C below the lowest service temperature. For -40°C cold start, the compound must pass brittleness at -50°C.

Standard FKM has glass transition around -20°C and fails brittleness at -40°C. Achieving -40°C cold start performance in FKM requires either specialty low-temperature FKM grades or plasticizer-engineered formulations. HNBR generally handles -40°C cold start with appropriate compound design.

### 2.5 Required lifecycle

EV applications typically design for 8-15 year service life. This is 2-3× longer than typical ICE service life specifications. Compound aging behavior at the integrated service temperature × time is what matters — not catalog properties.

ASTM D573 heat aging at service temperature × 1000 hours gives a first-order extrapolation. Properly engineered HNBR or FKM compounds should retain >70% of tensile strength and >50% of elongation under this protocol.

**Specification checkpoint #2:** Lock down all five parameters (sustained max temp, fluid, compression set at service condition, low-temperature, lifecycle) before issuing any RFQ. Suppliers will quote against vague specs but will quote different compounds. Vague specs guarantee receiving non-comparable bids.

---

## 3. HNBR: Mechanism, Capability Envelope, and Specification Patterns

### 3.1 Mechanism

HNBR is nitrile butadiene rubber that has been hydrogenated to varying degrees. Hydrogenation reduces the unsaturated double bonds in the polymer backbone:

- **Standard hydrogenation (90-95%)** improves heat aging substantially over NBR while retaining good cure response with peroxide systems.
- **High hydrogenation (96-99%)** maximizes heat aging stability but slightly reduces cure response and cost premium increases.
- **Fully saturated (>99%)** maximum heat aging but typically only used in extreme applications.

The hydrogenation level is the single biggest knob the formulator turns when designing for service temperature.

### 3.2 Capability Envelope

Well-formulated HNBR achieves:

| Property | Typical Spec |
|---|---|
| Continuous service temperature | -40°C to +150°C (high-saturation: +160°C) |
| Intermittent service | -45°C to +175°C |
| Tensile strength | 20-30 MPa |
| Elongation at break | 200-450% |
| Compression set (70 hr / 150°C, Method B) | 25-45% |
| Low temperature brittle point | -40°C to -50°C (compound-dependent) |
| Heat aging (1000 hr / 150°C) | >70% tensile retention |
| Oil resistance | Excellent for petroleum oils, glycol coolants |

### 3.3 Where HNBR Wins for EV Thermal Management

- Battery cooling circuits using glycol-based coolants up to 160°C
- Motor cooling loop seals
- Inverter coolant hose components
- Connector seals in cooled compartments
- BESS thermal management piping (under 160°C)

### 3.4 Where HNBR Struggles

- Sustained service above 160°C (oxidation accelerates)
- Aggressive halogenated dielectric coolants (compound swell unacceptable)
- Long-term ozone in outdoor applications (FKM or EPDM more stable)
- Steam service (HNBR is acceptable; specialty EPDM grades better)

### 3.5 Specification Patterns

For HNBR thermal management seals, a complete specification reads roughly:

```
Compound:     HNBR, peroxide-cured, high-saturation grade
Hardness:     75 ± 5 Shore A (ASTM D2240)
Tensile:      ≥22 MPa (ASTM D412)
Elongation:   ≥250% (ASTM D412)
Compression set: ≤30% (ASTM D395 Method B, 70 hr at 150°C)
Heat aging:   Tensile retention ≥75% after 1000 hr at 150°C (ASTM D573)
Fluid resist.: Volume swell ≤8% after 168 hr at 130°C in 50:50 EG/H2O (ASTM D471)
Low-temp brittle: Pass at -45°C (ASTM D2137)
Cure system:  Peroxide (specify acid acceptor)
Filler:       Specify carbon black type and loading
Compound retain: 5-year batch retention samples
```

**Specification checkpoint #3:** A complete HNBR spec for EV thermal sealing requires at least the 11 parameters above. Specs missing low-temperature brittleness, heat aging retention, or compound retention typically produce field failures in years 4-6.

---

## 4. FKM: Mechanism, Capability Envelope, and Specification Patterns

### 4.1 Mechanism

FKM (fluoroelastomer) is a family of rubbers containing fluorine-bearing monomers. The fluorine content (typically 66-70% in standard grades) determines the upper temperature limit and chemical resistance:

- **Type A (66% fluorine):** Standard automotive grade. Bisphenol cure system, broad fluid resistance.
- **Type B (68% fluorine):** Improved low-temperature performance with bisphenol cure.
- **Type GLT (low-temperature peroxide-cured):** Excellent low-temperature flexibility.
- **Type GBL (high-fluorine peroxide-cured):** Maximum chemical resistance and temperature capability.

The cure system (bisphenol vs peroxide) also determines low-temperature and chemical resistance trade-offs.

### 4.2 Capability Envelope

Well-formulated FKM achieves:

| Property | Typical Spec |
|---|---|
| Continuous service temperature | -20°C to +200°C (standard); -40°C to +200°C (peroxide-cured GLT) |
| Intermittent service | up to +250°C |
| Tensile strength | 12-18 MPa |
| Elongation at break | 150-300% |
| Compression set (70 hr / 200°C, Method B) | 30-50% |
| Low temperature brittle point | -25°C (standard); -45°C (GLT specialty) |
| Heat aging (1000 hr / 200°C) | >60% tensile retention |
| Oil resistance | Excellent across most categories |
| Fuel resistance | Excellent, including ethanol blends |

### 4.3 Where FKM Wins for EV Thermal Management

- Sustained service above 175°C (e.g., inverter / power electronics cooling)
- Exposure to dielectric coolants (immersion cooling architectures)
- Mixed-fluid environments
- Outdoor sustained service in charging infrastructure (UV + ozone + heat)
- Applications where 8-15 year service life requires maximum margin

### 4.4 Where FKM Struggles

- Cost-sensitive applications (3-5× HNBR raw polymer cost)
- Dynamic flex / accumulator applications (HNBR more fatigue-resistant)
- Low-temperature without GLT specialty grades (standard FKM brittle below -20°C)
- Steam, amine, or strong base exposure (specialty grades exist but verify)

### 4.5 Specification Patterns

For FKM thermal management seals targeting sustained service above 175°C:

```
Compound:     FKM Type GLT (peroxide-cured, low-temperature)
Hardness:     75 ± 5 Shore A (ASTM D2240)
Tensile:      ≥14 MPa (ASTM D412)
Elongation:   ≥180% (ASTM D412)
Compression set: ≤35% (ASTM D395 Method B, 70 hr at 200°C)
Heat aging:   Tensile retention ≥65% after 1000 hr at 200°C (ASTM D573)
Fluid resist.: Volume swell ≤6% after 168 hr at 175°C in service coolant (ASTM D471)
Low-temp brittle: Pass at -40°C (ASTM D2137)
Cure system:  Peroxide
Fluorine content: ≥68%
Compound retain: 5-year batch retention samples
```

**Specification checkpoint #4:** FKM Type matters as much as the FKM family designation. "FKM 75 Shore A" alone is ambiguous. Specify Type (A, B, GLT, GBL) explicitly.

---

## 5. EPDM: When It's the Right Answer for Adjacent Applications

EPDM is generally not specified for thermal management circuits exposed to oil or glycol coolant, but is widely used in adjacent EV applications:

- Charging connector seals (weather + ozone resistance dominant)
- Charging cable junction gaskets
- BESS cabinet enclosure sealing (outdoor weather protection)
- Energy-storage outer enclosure gaskets (water/weather exclusion)
- Brake hose seals (DOT brake fluid compatible)
- Steam-bearing component seals (where present)

EPDM's typical capability:

- Continuous service: -50°C to +150°C
- Excellent weather, ozone, UV resistance
- Excellent water and steam resistance
- Poor oil/fuel resistance (do not use in petroleum-contact environments)
- Cost: Lower than HNBR or FKM

**Specification checkpoint #5:** EPDM is the correct answer for EV-adjacent sealing where weather and water are dominant, but it must not be misapplied to oil/coolant contact applications. Many field failures trace to EPDM being specified where HNBR was needed, because EPDM was cheaper.

---

## 6. Specification Templates: What to Put on the RFQ

[Body continues with complete RFQ specification templates for each of the three compound families, covering 12+ parameters each, plus customer-side responsibility templates for service environment definition, drawing tolerance specifications, lifecycle requirements, and qualification protocol.]

[Section runs ~1500 words with templates and worked examples.]

---

## 7. Test Reports: What to Demand and How to Read Them

[Body explains:
- Standard test report format expected from L3 supplier
- How to read ASTM D412 tensile data
- How to interpret ASTM D573 heat aging "percent change"
- Compression set Method A vs Method B explained
- Low-temperature testing methods (D2137 brittleness vs D1329 TR-10)
- Cure characteristics from MDR rheometer
- What to look for in batch-level vs lot-level test reports
- Red flags in supplier test reports]

[Section runs ~1000 words with example test report screenshots / mock-ups.]

---

## 8. Supplier Diligence: Separating Compounders from Molders

[Body covers:
- The L1/L2/L3 supplier tier framework
- The five structural questions that reveal tier
- Site visit checklist (Banbury mixer, mill, lab equipment)
- Documentation diligence (formulation lock, batch test archives, retain samples)
- The "5-year reproducibility" stress test
- Red and green flags in supplier conversations
- A scorecard template for comparative supplier audits]

[Section runs ~1500 words with checklists and audit templates.]

---

## 9. Cost Modeling: The Real Total Cost Picture

[Body covers:
- Per-piece cost is the wrong KPI for compound-driven applications
- Total cost = piece cost + tooling + qualification + field life multiplier
- Worked example: 100K pieces/year battery seal, 10-year program
- Compound development one-time cost ($5-50K range)
- Tooling cost framing
- Field failure cost modeling (warranty, recall, brand exposure)
- Why a 30% higher piece cost from an L3 supplier can yield 40-60% lower total program cost
- When low-cost is the right answer (and when it isn't)]

[Section runs ~1000 words with worked spreadsheet examples.]

---

## 10. Appendices

**Appendix A: ASTM/ISO Test Standards Quick Reference**
- ASTM D412 / ISO 37: Tensile properties
- ASTM D573 / ISO 188: Heat aging
- ASTM D395 / ISO 815: Compression set
- ASTM D471 / ISO 1817: Fluid resistance
- ASTM D2240 / ISO 7619: Hardness
- ASTM D5289: Cure characteristics (MDR)
- ASTM D2137: Low-temperature brittleness
- ASTM D3786 / ISO 4664: DMA
- ASTM E1131: TGA

**Appendix B: Compound Selection Decision Tree**
[Flow chart from service condition → recommended family → recommended grade]

**Appendix C: RFQ Specification Template**
[Pre-filled blank that engineers can copy/paste into their RFQ tools]

**Appendix D: Glossary of Compound Engineering Terms**
- Mooney viscosity
- Cure characteristics (ts2, t90, scorch)
- Compression set (vs stress relaxation)
- Acid acceptors
- Bisphenol vs peroxide cure
- Filler structure
- Plasticizer migration

---

## About RubberQ

RubberQ is a Sino-Japanese joint venture established in June 1995, combining Japanese formulation expertise with Chinese precision manufacturing. We operate at the L3 compounder tier — we develop, mix, and validate our own rubber compounds in-house, in collaboration with Japanese formulation engineers we have partnered with since 1995.

For EV thermal management applications, we offer:

- 9 polymer family library including HNBR, FKM, FFKM, EPDM, ACM, AEM, NBR, Silicone (HCR), and LSR
- Single dedicated A-mixing line with sequence-ordered scheduling
- In-house testing laboratory validating every batch to ASTM/ISO standards
- IATF 16949:2016 / ISO 9001:2015 / ISO 14001:2015 certified
- 5-stage compound development workflow (4-24 week timelines)
- 5-year batch retention samples and compound traceability

We work best with annual volumes between 10,000 and 5,000,000 parts per SKU. We do not compete in commodity high-volume sealing or regulated healthcare-grade applications.

---

**Need a custom compound for your EV thermal management application?**

If you have a specific service environment, submit an application brief and we will engage with you under NDA. Our team will propose 2-3 candidate compounds within 2-3 weeks, with full test reports.

[Visit rubberq.com/compounding](https://rubberq.com/compounding) · [Submit an Application Brief](https://rubberq.com/contact?type=application) · [contact@rubberq.com](mailto:contact@rubberq.com)

---

*© 2026 Fuzhou RubberQ Rubber Co., Ltd. All rights reserved. This document is provided for engineering reference only. Specific compound recommendations require evaluation of customer-specific service environment under NDA. Performance data are typical and not specifications; actual compound performance depends on formulation choices and processing.*
