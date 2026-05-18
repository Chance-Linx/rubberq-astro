-- RubberQ RFQ v2 D1 migration.
-- Assumption: the existing RFQ table is named `inquiries`.
-- If the deployed Worker uses a different table name, replace `inquiries`
-- before applying this migration.

ALTER TABLE inquiries ADD COLUMN schema_version TEXT;
ALTER TABLE inquiries ADD COLUMN inquiry_type TEXT;
ALTER TABLE inquiries ADD COLUMN project_type TEXT;
ALTER TABLE inquiries ADD COLUMN annual_volume TEXT;
ALTER TABLE inquiries ADD COLUMN project_stage TEXT;
ALTER TABLE inquiries ADD COLUMN quote_components_json TEXT;
ALTER TABLE inquiries ADD COLUMN selected_products_json TEXT;
ALTER TABLE inquiries ADD COLUMN product_type TEXT;
ALTER TABLE inquiries ADD COLUMN target_material TEXT;
ALTER TABLE inquiries ADD COLUMN material TEXT;
ALTER TABLE inquiries ADD COLUMN sample_quantity TEXT;
ALTER TABLE inquiries ADD COLUMN country TEXT;
ALTER TABLE inquiries ADD COLUMN source_tracking_json TEXT;
ALTER TABLE inquiries ADD COLUMN field_priority_json TEXT;
ALTER TABLE inquiries ADD COLUMN lead_grade TEXT;
ALTER TABLE inquiries ADD COLUMN quote_readiness TEXT;
ALTER TABLE inquiries ADD COLUMN rfq_context_json TEXT;
ALTER TABLE inquiries ADD COLUMN attachment_name TEXT;
ALTER TABLE inquiries ADD COLUMN attachment_mime_type TEXT;
ALTER TABLE inquiries ADD COLUMN attachment_size INTEGER;

CREATE INDEX IF NOT EXISTS idx_inquiries_inquiry_type ON inquiries(inquiry_type);
CREATE INDEX IF NOT EXISTS idx_inquiries_lead_grade ON inquiries(lead_grade);
CREATE INDEX IF NOT EXISTS idx_inquiries_quote_readiness ON inquiries(quote_readiness);
CREATE INDEX IF NOT EXISTS idx_inquiries_project_stage ON inquiries(project_stage);
