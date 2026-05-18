-- RubberQ RFQ v2 D1 migration.
-- Confirmed via Wrangler on 2026-05-18:
--   D1 database: rubberq_rfq
--   table: rfqs
-- Existing columns before this migration:
--   id, name, email, company, industry, message, fileLink, pageUrl, created_at

ALTER TABLE rfqs ADD COLUMN schema_version TEXT;
ALTER TABLE rfqs ADD COLUMN inquiry_type TEXT;
ALTER TABLE rfqs ADD COLUMN project_type TEXT;
ALTER TABLE rfqs ADD COLUMN annual_volume TEXT;
ALTER TABLE rfqs ADD COLUMN project_stage TEXT;
ALTER TABLE rfqs ADD COLUMN quote_components_json TEXT;
ALTER TABLE rfqs ADD COLUMN selected_products_json TEXT;
ALTER TABLE rfqs ADD COLUMN product_type TEXT;
ALTER TABLE rfqs ADD COLUMN target_material TEXT;
ALTER TABLE rfqs ADD COLUMN material TEXT;
ALTER TABLE rfqs ADD COLUMN sample_quantity TEXT;
ALTER TABLE rfqs ADD COLUMN country TEXT;
ALTER TABLE rfqs ADD COLUMN source_tracking_json TEXT;
ALTER TABLE rfqs ADD COLUMN field_priority_json TEXT;
ALTER TABLE rfqs ADD COLUMN lead_grade TEXT;
ALTER TABLE rfqs ADD COLUMN quote_readiness TEXT;
ALTER TABLE rfqs ADD COLUMN rfq_context_json TEXT;
ALTER TABLE rfqs ADD COLUMN attachment_name TEXT;
ALTER TABLE rfqs ADD COLUMN attachment_mime_type TEXT;
ALTER TABLE rfqs ADD COLUMN attachment_size INTEGER;

CREATE INDEX IF NOT EXISTS idx_rfqs_inquiry_type ON rfqs(inquiry_type);
CREATE INDEX IF NOT EXISTS idx_rfqs_lead_grade ON rfqs(lead_grade);
CREATE INDEX IF NOT EXISTS idx_rfqs_quote_readiness ON rfqs(quote_readiness);
CREATE INDEX IF NOT EXISTS idx_rfqs_project_stage ON rfqs(project_stage);
