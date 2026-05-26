# Sanity Blog Redline Governance - 2026-05-26

This note records the public-copy governance action for legacy Sanity blog
articles that no longer fit RubberQ's public positioning.

## Rule

Do not keep an article public just to avoid a 404 or 410. A legacy URL may only
redirect to another page when the replacement page answers the same technical
intent. Otherwise, archive the article and let the public site return `410 Gone`
for direct visits.

## Public Redline Categories

- Medical, implant, biocompatibility, ISO 10993, USP Class VI.
- FDA, ISO 13485, pharmaceutical, sterile packaging, regulated food-contact
  positioning.
- Old robotics-first positioning.
- Old AI server, AI automation, or data-center positioning.
- Unconfirmed EV high-voltage component examples such as battery pack, PDU, or
  BMS references.
- Private partner-name disclosure or old founding-age claims.
- Unscoped development-speed promises.

## Archived Articles

These Sanity articles should not remain public in their current form:

| Article slug | Reason | Rewrite decision |
| --- | --- | --- |
| `future-of-rubberq-investing-in-ai-and-automation-for-2026-and-beyond` | Internal future/AI/automation positioning and old robotics wording. | Archive only. |
| `fda-21-cfr-1772600-requirements-for-repeated-use-rubber-articles-in-food` | FDA food-contact regulation topic. | Archive only. |
| `post-curing-processes-why-its-critical-for-fda-grade-silicone-gaskets` | FDA/pharmaceutical gasket framing. | Rewrite as industrial silicone post-curing and volatile control. |
| `butyl-rubber-iir-the-ultimate-barrier-for-pharmaceutical-stopper-applications` | Pharmaceutical stopper application. | Archive only. |
| `sterile-packaging-silicone-septums-for-multi-dose-pharmaceutical-vials` | Sterile pharmaceutical vial topic. | Archive only. |
| `autonomous-delivery-robots-durable-rubber-tires-for-urban-terrain-navigation` | Robotics application focus. | Archive only. |
| `iso-10993-testing-for-cytotoxicity-and-sensitization-in-rubber-parts` | Medical biocompatibility testing. | Archive only. |
| `biocompatibility-of-lsr-navigating-iso-10993-compliance-for-rubber-parts` | Medical biocompatibility and ISO 10993. | Archive only. |
| `wearable-electronics-skin-safe-silicone-lsr-for-smartwatch-bands` | Skin-contact wearable framing. | Archive only. |
| `usp-class-vi-the-gold-standard-for-medical-grade-elastomers` | Medical-grade USP Class VI topic. | Archive only. |
| `material-selection-guide-silicone-vs-lsr-for-medical-grade-gaskets` | Medical-grade gasket framing. | Archive only. |
| `compression-set-in-vmq-optimizing-cure-systems-for-ai-server-cooling` | AI server cooling positioning. | Rewrite only if reframed to EV, industrial thermal management, or a verified application. |
| `silica-fillers-in-silicone-enhancing-mechanical-strength-without-sacrificing-cla` | Mentions medical tubing as an application. | Rewrite as optical/industrial silicone clarity and reinforcement. |
| `how-iatf-16949-standards-influence-rubber-component-quality-for-robotics` | Robotics positioning. | Rewrite as IATF 16949 quality for EV, industrial equipment, and Tier 2 buyers. |
| `full-traceability-in-rubber-manufacturing-barcode-erp-from-raw-material-to-shipm` | Good traceability theme but includes medical/ISO 13485 framing. | Rewrite around IATF traceability, industrial buyers, EV, and quality records. |
| `robotic-joint-bellows-material-selection-for-million-cycle-flex-life` | Robotics focus plus FDA/BMS references. | Rewrite only as industrial motion-protection bellows if the technical intent stays specific. |
| `from-automotive-to-medical-how-iatf-16949-translates-to-iso-13485-readiness` | Medical/ISO 13485 transition topic. | Archive only. |
| `cryogenic-deflashing-vs-manual-trimming-when-precision-demands-sub-zero` | Useful process topic but includes medical/ISO 13485 framing. | Rewrite as precision flash removal for EV, semiconductor, and industrial parts. |
| `gripper-pads-for-food-automation-fda-compliant-silicone-that-wont-mark` | FDA food automation framing. | Archive only. |
| `ppap-for-rubber-parts-what-oem-buyers-should-expect-from-their-supplier` | Useful PPAP topic but includes old robotic/AI data-center examples. | Rewrite with EV, industrial equipment, and high-end automotive Tier 2 examples. |

## Operational Status

- The public Astro site already filters redline articles from blog listings,
  search results, and sitemap output.
- The site returns `410 Gone` for direct visits to archived or blocked legacy
  article slugs, preserving URL truth instead of redirecting to unrelated pages.
- `scripts/govern-sanity-redline-articles.mjs` archives matching `published`
  Sanity articles in repeatable form.

