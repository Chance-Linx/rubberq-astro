/** Local-only payload regression. No Worker/D1/email requests. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { normalizeRfqPayload } from '../tools/rfq-worker-v2/rfq-v2-contract.mjs';

const root = new URL('../', import.meta.url);
const file = new URL('docs/2026-10-21-全站规划落实/evidence/five-locale-implementation-checks.json', root);
const report = JSON.parse(fs.readFileSync(file, 'utf8'));
assert.equal(report.summary.passed, 225, 'Build the current rendered implementation report before testing payloads');
const cases = [];
const inspect = (name, payload, validate) => {
  const result = normalizeRfqPayload(payload, { requestId: 'local-contract-test' });
  assert.equal(result.ok, true, name);
  validate(result.value);
  cases.push({ name, pass: true });
};
for (const row of report.page_results.filter(r => r.forms)) {
  const messages = JSON.parse(fs.readFileSync(new URL(`src/messages/${row.locale}.json`, root), 'utf8'));
  const kind = row.path.endsWith('/sample-request') ? 'sample' : row.path.endsWith('/batch-rfq') ? 'batch' : 'contact';
  const inquiryType = { sample: 'sample_request', batch: 'batch_rfq', contact: 'contact_rfq' }[kind];
  const payload = { name: 'Local Test', email: 'local-test@example.invalid', inquiryType, message: 'Local contract verification only', country: 'Test destination', productType: 'Seals & O-Rings', selectedProducts: ['seals'], pageUrl: 'https://rubberq.com'+row.path+'?source=%2Fmaterials%2Fffkm&cta=project-review', sourceTracking: { pagePath: row.path+'?source=%2Fmaterials%2Fffkm&cta=project-review' } };
  const stageSelect = kind === 'contact' ? 'rq-contact-projectStage' : messages.acquisition.forms[kind].projectStage;
  const stages = row.form_options.filter(o => o.select === stageSelect);
  assert.equal(stages.length, 4, row.path+' rendered project stages');
  for (const op of stages) inspect(row.path+': '+op.value, { ...payload, projectStage: op.value }, value => {
    assert.equal(value.projectStage, op.value, 'Stage must survive normalization');
    assert.equal(value.inquiryType, inquiryType);
    assert.equal(value.sourceTracking.pagePath, payload.sourceTracking.pagePath);
    assert.equal(value.pageUrl, payload.pageUrl);
  });
  if (kind === 'contact') {
    const industries = row.form_options.filter(o => o.select === 'rq-contact-industry');
    assert.equal(industries.length, 7);
    for (const op of industries) inspect(row.path+': industry '+op.value, { ...payload, industry: op.value }, value => assert.equal(value.industry, op.value));
  }
  inspect(row.path+': unknown volume stays unknown', { ...payload, annualVolume: '', quantity: '', material: '' }, value => {
    assert.equal(value.annualVolume, ''); assert.equal(value.sampleQuantity, ''); assert.equal(value.material, '');
  });
}
for (const stage of ['concept','feasibility','sample','tooling','production']) inspect('Historic stage '+stage,{ name:'Local Test',email:'local-test@example.invalid',inquiryType:'contact_rfq',message:'Local test',projectStage:stage }, value => assert.equal(value.projectStage,stage));
const bad = normalizeRfqPayload({name:'Local Test',email:'local-test@example.invalid',inquiryType:'sample_request',country:'Test destination',productType:''});
assert.equal(bad.ok,false);assert.ok(bad.errors.productType);cases.push({name:'Sample product choice is required',pass:true});
const result = { scope:'Local normalization and rendered form options only; not a live submission, D1 insert or email delivery test',passed:cases.length,cases };
fs.writeFileSync(new URL('docs/2026-10-21-全站规划落实/evidence/rfq-contract-checks.json',root),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({passed:result.passed, scope:result.scope}));
