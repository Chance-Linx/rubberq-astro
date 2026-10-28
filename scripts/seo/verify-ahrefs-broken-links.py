"""Read an Ahrefs issue export and verify its pages against a local build."""
import argparse
import concurrent.futures
import csv
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import urllib.error
import urllib.parse
import urllib.request


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.email_off = False
        self.in_body = False
        self.markers = []
        self.links = []
        self.unprotected_emails = []

    def handle_comment(self, data):
        if data in ('email_off', '/email_off'):
            self.markers.append(data)
            self.email_off = data == 'email_off'

    def handle_starttag(self, tag, attrs):
        if tag == 'body':
            self.in_body = True
        href = dict(attrs).get('href', '')
        if tag == 'a' and href:
            self.links.append(href)
            if href.startswith('mailto:contact@rubberq.com') and not self.email_off:
                self.unprotected_emails.append(href)

    def handle_data(self, data):
        if self.in_body and 'contact@rubberq.com' in data and not self.email_off:
            self.unprotected_emails.append(data)

    def handle_endtag(self, tag):
        if tag == 'body':
            self.in_body = False


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--origin', required=True)
    parser.add_argument('--csv', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--retry-failed', action='store_true', help='Retry only failures in the output file against the same local build.')
    args = parser.parse_args()
    origin = args.origin.rstrip('/')
    if urllib.parse.urlsplit(origin).hostname not in ('127.0.0.1', 'localhost'):
        parser.error('Use a local build origin; this check is not a production recrawl.')
    rows = list(csv.DictReader(args.csv.open(encoding='utf-8-sig')))
    csv_sha256 = hashlib.sha256(args.csv.read_bytes()).hexdigest()
    root = Path(__file__).resolve().parents[2]
    source_hash = hashlib.sha256()
    for path in sorted((root / 'src').rglob('*')):
        if path.is_file():
            source_hash.update(str(path.relative_to(root)).encode())
            source_hash.update(path.read_bytes())
    source_sha256 = source_hash.hexdigest()
    previous = {}
    if args.retry_failed:
        saved = json.loads(args.output.read_text())
        if saved['origin'] != origin or saved['csv_sha256'] != csv_sha256:
            parser.error('Retry requires the same origin and CSV export.')
        if saved.get('source_sha256') != source_sha256:
            parser.error('Source changed or the snapshot is missing; run a full check against a fresh build.')
        previous = {page['url']: page for page in saved['pages']}
    aliases = json.loads((root / 'src/data/legacy-material-redirects.json').read_text())

    def fetch(path):
        try:
            response = urllib.request.urlopen(origin + path, timeout=60)
        except urllib.error.HTTPError as error:
            response = error
        with response:
            return response.status, urllib.parse.urlsplit(response.url).path, response.read().decode()

    def check(row):
        parsed = urllib.parse.urlsplit(row['URL'])
        path = parsed.path + ('?' + parsed.query if parsed.query else '')
        result = {'url': row['URL'], 'attempts': previous.get(row['URL'], {}).get('attempts', 1 if args.retry_failed else 0) + 1}
        try:
            status, final_path, html = fetch(path)
            links = Links()
            links.feed(html)
            broken = [href for href in links.links if
                      urllib.parse.urlsplit(urllib.parse.urljoin(row['URL'], href)).path in
                      ('/cdn-cgi/l/email-protection', *aliases)]
            mailto = sum(href.startswith('mailto:contact@rubberq.com') for href in links.links)
            result.update(status=status, final_path=final_path, mailto_links=mailto,
                          email_off_markers=links.markers, unprotected_emails=links.unprotected_emails,
                          broken_links=broken, html_sha256=hashlib.sha256(html.encode()).hexdigest())
            result['pass'] = (status == 200 and final_path == parsed.path and mailto > 0 and
                              links.markers == ['email_off', '/email_off'] and
                              not links.unprotected_emails and not broken)
            if 'compression-set-vmq-cure-system-long-term-static-sealing' in path:
                result['direct_silicone_link'] = '/materials/silicone' in links.links
                result['pass'] &= result['direct_silicone_link']
        except Exception as error:
            result.update({'pass': False, 'error': str(error)})
        return result

    pending = [row for row in rows if not previous.get(row['URL'], {}).get('pass')]
    with concurrent.futures.ThreadPoolExecutor(max_workers=2 if args.retry_failed else 6) as pool:
        checked = {page['url']: page for page in pool.map(check, pending)}
    pages = [checked.get(row['URL']) or previous[row['URL']] for row in rows]

    class NoRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, *args):
            return None

    opener = urllib.request.build_opener(NoRedirect)
    redirects = []
    # New exact aliases and representative existing migration rules.
    cases = [(path + slash + '?source=ahrefs', target + '?source=ahrefs')
             for path, target in aliases.items() for slash in ('', '/')]
    cases += [('/en/contact', '/contact'), ('/de/blog', '/blog'),
              ('/es/productos', '/es/products'), ('/de/produkte', '/de/products'),
              ('/home', '/'), ('/en/robots.txt', '/robots.txt'),
              ('/downloads/certificates/ISO-9001-2022.pdf', '/quality#certifications')]
    for path, expected in cases:
        try:
            opener.open(origin + path, timeout=30)
            status, location = 200, None
        except urllib.error.HTTPError as error:
            status, location = error.code, error.headers.get('Location')
        final_status, _, _ = fetch(expected.split('#')[0])
        redirects.append({'path': path, 'expected': expected, 'status': status, 'location': location,
                          'target_status': final_status,
                          'pass': status == 301 and location == expected and final_status == 200})
    try:
        opener.open(origin + '/materials/not-a-material', timeout=30)
        unknown_status = 200
    except urllib.error.HTTPError as error:
        unknown_status = error.code
    summary = {'pages': len(pages), 'pages_passed': sum(p['pass'] for p in pages),
               'pages_unavailable': sum(p.get('status') == 410 for p in pages),
               'request_errors': sum('error' in p for p in pages),
               'redirects': len(redirects), 'redirects_passed': sum(r['pass'] for r in redirects),
               'unknown_material_status': unknown_status}
    summary['pass'] = all(p['pass'] for p in pages) and all(r['pass'] for r in redirects) and unknown_status == 404
    args.output.write_text(json.dumps({'origin': origin, 'csv_sha256': csv_sha256,
                                      'source_sha256': source_sha256,
                                      'summary': summary, 'pages': pages, 'redirects': redirects},
                                     ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(summary, ensure_ascii=False))
    for page in pages:
        if not page['pass']:
            print(json.dumps(page, ensure_ascii=False))
    raise SystemExit(0 if summary['pass'] else 1)


if __name__ == '__main__':
    main()
