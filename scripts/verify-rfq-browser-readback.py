"""Read back only the isolated local RFQ runtime after the browser matrix."""
import base64, hashlib, json, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EVIDENCE = ROOT / 'docs/2026-10-21-全站规划落实/evidence'
def admin(endpoint, payload):
    request = urllib.request.Request('http://127.0.0.1:4399/__local/' + endpoint,
        data=json.dumps(payload).encode(), headers={'Content-Type':'application/json','X-RQ-Local-Test':'local-only'})
    return json.load(urllib.request.urlopen(request, timeout=10))

matrix=json.loads((EVIDENCE/'rfq-browser-matrix.json').read_text())
mail=admin('mail', {})
checks=[]
for item in matrix['results']:
    submission=item['receipt']['receiptId']
    rows=admin('sql', {'sql':"SELECT id,name,email,inquiry_type,fileLink,source_tracking_json,rfq_context_json FROM rfqs WHERE json_extract(rfq_context_json,'$.delivery.submissionId')=?",'params':[submission]})['results']
    assert len(rows)==1
    row=rows[0]; context=json.loads(row['rfq_context_json']); source=json.loads(row['source_tracking_json'])
    assert row['name']==item['name'] and row['email']=='matrix@example.invalid'
    assert source['sourcePage']=='/materials/ffkm' and source['cta']=='local-browser-matrix'
    messages=[m for m in mail['messages'] if m['key']=='rq-'+submission]
    assert len(messages)==1 and messages[0]['mode']=='accept'
    assert context['delivery']['notificationStatus']=='accepted'
    saved_file=None
    if item['type']=='contact':
        obj=admin('object',{'key':context['attachment']['storageKey']})
        expected=b'%PDF-1.4\nRubberQ local QA drawing only\n%%EOF'
        decoded=base64.b64decode(obj['dataBase64'])
        assert decoded==expected and hashlib.sha256(decoded).hexdigest()==context['attachment']['sha256']
        assert messages[0]['message']['attachments'][0]['content']==obj['dataBase64']
        saved_file={'size':len(decoded),'sha256':context['attachment']['sha256'],'privateKey':obj['key']}
    else:
        assert row['fileLink']=='https://example.invalid/drawing.step'
    checks.append({'locale':item['locale'],'type':item['type'],'rowId':row['id'],'submissionId':submission,'sourcePreserved':True,'capturedNotificationMatches':True,'attachment':saved_file,'pass':True})
retry=json.loads((EVIDENCE/'rfq-browser-retry.json').read_text())
rows=admin('sql',{'sql':"SELECT count(*) AS n FROM rfqs WHERE json_extract(rfq_context_json,'$.delivery.submissionId')=?",'params':[retry['recovery']['submissionId']]})['results']
assert rows[0]['n']==1
report={'scope':'Local browser submissions independently read back from real local D1/R2; Resend requests captured, not mailbox delivery.','checks':checks,'passed':len(checks),'retryCreatesOneRow':True,'productionSubmissions':0,'realEmails':0,'paidCalls':0}
(EVIDENCE/'rfq-browser-readback.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'browserReadbacks':len(checks),'retryCreatesOneRow':True,'productionSubmissions':0,'realEmails':0}))
