export const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;
export const MAX_JSON_BYTES = 8 * 1024 * 1024;
const extensions = new Set(['pdf','step','stp','dxf','dwg','png','jpg','jpeg']);

export class RfqError extends Error {
  constructor(code, status = 400) { super(code); this.code = code; this.status = status; }
}

export async function readJson(request) {
  if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) throw new RfqError('invalid_content_type',415);
  if (Number(request.headers.get('Content-Length')) > MAX_JSON_BYTES) throw new RfqError('payload_too_large',413);
  const reader = request.body?.getReader();
  if (!reader) throw new RfqError('invalid_json');
  const decoder = new TextDecoder(); let size = 0; const chunks = [];
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_JSON_BYTES) { await reader.cancel(); throw new RfqError('payload_too_large',413); }
    chunks.push(decoder.decode(value,{stream:true}));
  }
  chunks.push(decoder.decode());
  try { return JSON.parse(chunks.join('')); } catch { throw new RfqError('invalid_json'); }
}

export async function sha256(bytes) {
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(b=>b.toString(16).padStart(2,'0')).join('');
}

export async function validateAttachment(attachment) {
  if (!attachment) return null;
  const { name, dataBase64, size } = attachment;
  const ext = name?.split('.').at(-1)?.toLowerCase();
  if (!name || name.length > 180 || /[\\/\u0000-\u001f]/.test(name) || !extensions.has(ext)) throw new RfqError('invalid_attachment');
  if (!Number.isSafeInteger(size) || size < 1 || size > MAX_ATTACHMENT_BYTES) throw new RfqError('invalid_attachment_size');
  if (typeof dataBase64 !== 'string' || dataBase64.length > Math.ceil(MAX_ATTACHMENT_BYTES/3)*4 || (dataBase64.length % 4 !== 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(dataBase64))) throw new RfqError('invalid_attachment_encoding');
  let binary;
  try { binary = atob(dataBase64); } catch { throw new RfqError('invalid_attachment_encoding'); }
  if (binary.length !== size || btoa(binary) !== dataBase64) throw new RfqError('invalid_attachment_size');
  const bytes = new Uint8Array(binary.length);
  for (let i=0;i<binary.length;i++) bytes[i]=binary.charCodeAt(i);
  // These are file-format checks, not a malware-scan or CAD-validation claim.
  if (ext === 'pdf' && !binary.startsWith('%PDF-')) throw new RfqError('invalid_attachment_format');
  if (ext === 'png' && !binary.startsWith('\x89PNG\r\n\x1a\n')) throw new RfqError('invalid_attachment_format');
  if (['jpg','jpeg'].includes(ext) && !binary.startsWith('\xff\xd8\xff')) throw new RfqError('invalid_attachment_format');
  return { bytes, sha256:await sha256(bytes), contentType: ext==='pdf'?'application/pdf':ext==='png'?'image/png':['jpg','jpeg'].includes(ext)?'image/jpeg':'application/octet-stream' };
}

export function base64(bytes) {
  let binary = '';
  for (let i=0;i<bytes.length;i+=32768) binary+=String.fromCharCode(...bytes.subarray(i,i+32768));
  return btoa(binary);
}
