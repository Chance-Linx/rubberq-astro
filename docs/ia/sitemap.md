# RubberQ Semantic URL & Site Structure (AIO/GEO Optimized)

In the 2026 AI-driven search landscape, URL structures should reflect **Entities** rather than just folder depths. This helps AI engines (like Perplexity or ChatGPT) build a clearer knowledge graph of RubberQ.

## 1. URL Naming Principles
- **Flat over Nested**: Minimize depth to reduce crawling overhead.
- **Entity-Based**: Use specific technical names (e.g., `fkm` instead of `material-1`).
- **Action-Oriented**: Include intent markers for AI reasoning (e.g., `comparison`, `specification`).

## 2. Core Entity URL Mapping

| Entity Type | URL Pattern | Example | Purpose |
| :--- | :--- | :--- | :--- |
| **Material Hub** | `/materials/` | `rubberq.com/materials/` | Pillar page for all rubber types |
| **Material Detail** | `/materials/{slug}` | `/materials/fkm-fluoroelastomer` | Deep technical specs for AI ingestion |
| **Process Hub** | `/capabilities/` | `/capabilities/` | Overview of manufacturing power |
| **Process Detail** | `/capabilities/{slug}` | `/capabilities/vacuum-vulcanization` | Proving technical precision |
| **Standard/Quality** | `/standards/{slug}` | `/standards/iatf-16949-certification` | Building machine-verified trust |
| **Product Category** | `/products/{slug}` | `/products/automotive-oil-seals` | High-intent landing pages |
| **AI Comparison** | `/compare/{slug1}-vs-{slug2}` | `/compare/fkm-vs-epdm` | Capture "vs" queries in AI search |

## 3. SEO vs. GEO Alignment
- **SEO (Traditional)**: Focuses on keywords like "rubber parts manufacturer".
- **GEO (Generative)**: Focuses on entity attributes like "IATF 16949 compliant FKM seal supplier in Fuzhou".
- **URL Strategy**: Use descriptively rich slugs:
    - `/manufacturing/precision-rubber-injection-molding`
    - `/materials/epdm-weather-resistant-rubber-specs`

## 4. Breadcrumb Path Strategy (Schema-Linked)
Breadcrumbs will follow the **Knowledge Graph** logic:
`Home > Materials > FKM (Fluoroelastomer) > ASTM D2000 HK Compliance`
This reinforces the relationship between Material and Standard for AI crawlers.
