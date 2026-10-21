export type SubmissionState = { current: { id: string; fingerprint: string } | null };

/** Same-origin requests let the isolated review server use its local Worker. */
export async function submitInquiry(payload: Record<string, unknown>, state: SubmissionState, send: typeof fetch = fetch, timeoutMs = 45000) {
  const business = { ...payload };
  for (const key of ['pageUrl','sourceTracking','fieldPriority']) delete business[key];
  const fingerprint = JSON.stringify(business);
  if (!state.current || state.current.fingerprint !== fingerprint) state.current = { id: crypto.randomUUID(), fingerprint };
  const id = state.current.id;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await send('/api/', { method:'POST', headers:{'Content-Type':'application/json'}, signal:controller.signal,
      body:JSON.stringify({...payload, submissionId:id}) });
    let data;
    try { data = await response.json(); } catch { return {ok:false}; }
    if (!response.ok || data?.ok !== true || data.recordSaved !== true || data.receiptId !== id ||
      (payload.attachment && data.attachmentSaved !== true)) return {ok:false};
    if (state.current?.id === id) state.current = null;
    return {ok:true};
  } finally { clearTimeout(timer); }
}
