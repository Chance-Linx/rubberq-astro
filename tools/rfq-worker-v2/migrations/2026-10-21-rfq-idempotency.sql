-- Keeps legacy rows, while client submission UUIDs remain unique for retry safety.
CREATE UNIQUE INDEX IF NOT EXISTS idx_rfqs_submission_id ON rfqs (
  CASE WHEN json_valid(rfq_context_json) THEN json_extract(rfq_context_json,'$.delivery.submissionId') END
);
