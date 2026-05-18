import { defineMiddleware } from 'astro:middleware';

const locales = new Set(['en', 'de', 'ja', 'es', 'zh']);

const legacyLocalizedFiles = new Map([
  ['sitemap.xml', '/sitemap.xml'],
  ['robots.txt', '/robots.txt'],
]);

const encodedLegacyBlogFallbackSlugs = [
  'My1hLXNhbml0YXJ5LXN0YW5kYXJkcy1kZXNpZ25pbmctcnViYmVyLXNlYWxzLWZvci10aGUtZGFpcnktaW5kdXN0cnkKODAw',
  'di1ldi1hcmNoaXRlY3R1cmUtbWF0ZXJpYWwtc2VsZWN0aW9uLWZvci1oaWdoLXZvbHRhZ2UtYmF0dGVyeS1wYWNrLXNlYWxz',
  'CmEtYmF0Y2gtbWl4aW5nLWhvdy1ydWJiZXJxcy1pbnRlcm5hbC1jb21wb3VuZC1kZXZlbG9wbWVudC1lbnN1cmVzLW1hdGVy',
  'aWFsLXB1cml0eQphZGhlc2lvbi10by1wbGFzdGljcy1zb2x2aW5nLWJvbmRpbmctaXNzdWVzLWluLTJrLW92ZXJtb2xkaW5n',
  'CmFzdG0tZDIwMDAtZXhwbGFpbmVkLXRoZS11bml2ZXJzYWwtbGFuZ3VhZ2UtZm9yLXNwZWNpZnlpbmctcnViYmVyLW1hdGVy',
  'aWFscwphdXRvbWF0aWMtd2VpZ2hpbmctc3lzdGVtcy1lbGltaW5hdGluZy1odW1hbi1lcnJvci1pbi1jaGVtaWNhbC1jb21w',
  'b3VuZGluZwphdXRvbW90aXZlLXN1bnJvb2Ytc2VhbHMtYW50aS1zcXVlYWstY29hdGluZ3Mtb24tdHBlLWVwZG0tZXh0cnVz',
  'aW9ucwphdXRvbm9tb3VzLWRlbGl2ZXJ5LXJvYm90cy1kdXJhYmxlLXJ1YmJlci10aXJlcy1mb3ItdXJiYW4tdGVycmFpbi1u',
  'YXZpZ2F0aW9uCmJhcmNvZGUtbWFuYWdlbWVudC1ob3ctcnViYmVycS1jb250cm9scy1tYXRlcmlhbC1tb3ZlbWVudC1vbi10',
  'aGUtc2hvcC1mbG9vcgpiYXR0ZXJ5LWVuZXJneS1zdG9yYWdlLXN5c3RlbXMtYmVzcy1maXJlLXJldGFyZGFudC1nYXNrZXRz',
  'LWZvci1ob3VzaW5nLXVuaXRzCmJpb2NvbXBhdGliaWxpdHktb2YtbHNyLW5hdmlnYXRpbmctaXNvLTEwOTkzLWNvbXBsaWFu',
  'Y2UtZm9yLXJ1YmJlci1wYXJ0cwpib25kaW5nLXN0cmVuZ3RoLXRlc3RpbmctaW50ZXJwcmV0aW5nLTkwLWRlZ3JlZS12cy0x',
  'ODAtZGVncmVlLXBlZWwtdGVzdHMKYnJha2Utc3lzdGVtcy1lcGRtLWNvbXBhdGliaWxpdHktd2l0aC1kb3QtNC1hbmQtZG90',
  'LTUtYnJha2UtZmx1aWRzCmJ1dHlsLXJ1YmJlci1paXItdGhlLXVsdGltYXRlLWJhcnJpZXItZm9yLXBoYXJtYWNldXRpY2Fs',
  'LXN0b3BwZXItYXBwbGljYXRpb25zCmNhbGlicmF0aW9uLW9mLWxhYi1lcXVpcG1lbnQtaG93LXJ1YmJlcnEtZW5zdXJlcy10',
  'ZXN0LXJlc3VsdC1hY2N1cmFjeQpjaGVtaWNhbC1yZXNpc3RhbmNlLWNoYXJ0LWEtZ3VpZGUtdG8tcG9sYXItdnMtbm9uLXBv',
  'bGFyLXNvbHZlbnRzCmNoZW1pY2FsLXN3ZWxsaW5nLWhvdy10by1wcmVkaWN0LXNlYWwtbGlmZS1pbi11bmtub3duLWZsdWlk',
  'LW1peHR1cmVzCmNobG9yb3ByZW5lLXJ1YmJlci1jci13aHktaXQtcmVtYWlucy10aGUtc3RhbmRhcmQtZm9yLW1hcmluZS1z',
  'ZWFsaW5nLWVudmlyb25tZW50cwpjbGVhbnJvb20tbWFudWZhY3R1cmluZy1jb250cm9sbGluZy1wYXJ0aWNsZS1jb250YW1p',
  'bmF0aW9uLWluLW1lZGljYWwtc2VhbHMKY29mZmVlLW1hY2hpbmUtZ2Fza2V0cy13aHktdm1xLWlzLXRoZS1jaG9pY2UtZm9y',
  'LWhpZ2gtdGVtcGVyYXR1cmUtd2F0ZXItY29udGFjdApjb2xvci1tYXRjaGluZy1jaGFsbGVuZ2VzLWluLWFjaGlldmluZy1j',
  'b25zaXN0ZW50LXJhbC1wYW50b25lLWluLXJ1YmJlcgpjb21wcmVzc2lvbi1zZXQtaW4tdm1xLW9wdGltaXppbmctY3VyZS1z',
  'eXN0ZW1zLWZvci1haS1zZXJ2ZXItY29vbGluZwpjb25kdWN0aXZlLXNpbGljb25lLXNoaWVsZGluZy1lZmZlY3RpdmVuZXNz',
  'LWVtaS1pbi01Zy1pbmZyYXN0cnVjdHVyZQpjb25kdWN0aXZpdHktbG9zcy13aHktZW1pLWdhc2tldHMtZmFpbC1hZnRlci10',
  'aGVybWFsLWN5Y2xpbmcKY29uZmxpY3QtbWluZXJhbHMtY21ydC1ydWJiZXJxcy1jb21taXRtZW50LXRvLWV0aGljYWwtc291',
  'cmNpbmcKY29uc3RydWN0aW9uLWVxdWlwbWVudC1kdXN0LXNlYWxzLWZvci1oeWRyYXVsaWMtY3lsaW5kZXJzLWluLWhhcnNo',
  'LXNpdGVzCmNvbnRpbnVvdXMtaW1wcm92ZW1lbnQta2FpemVuLWxlYW4tbWFudWZhY3R1cmluZy1pbi1hLXJ1YmJlci1mYWN0',
  'b3J5CmRyaW5raW5nLXdhdGVyLXN5c3RlbXMtbWFuYWdpbmctbnNmLWFuc2ktNjEtY29tcGxpYW5jZS1mb3ItcnViYmVyLXZh',
  'bHZlcwplbGV2YXRvci1idWZmZXJzLWVuZXJneS1hYnNvcnB0aW9uLXByb3BlcnRpZXMtb2YtaGlnaC1kZW5zaXR5LXBvbHl1',
  'cmV0aGFuZS12cy1ydWJiZXIKZXBkbS1pbi1zdGVhbS1zeXN0ZW1zLW1vbGVjdWxhci1zdGFiaWxpdHktYW5kLXNlcnZpY2Ut',
  'bGlmZS1wcmVkaWN0aW9ucwpmZGEtMjEtY2ZyLTE3Ny0yNjAwLXJlcXVpcmVtZW50cy1mb3ItcmVwZWF0ZWQtdXNlLXJ1YmJl',
  'ci1hcnRpY2xlcy1pbi1mb29kCmZsdWlkLWNvbnRhbWluYXRpb24taG93LWxlYWNoaW5nLXJ1YmJlci1jaGVtaWNhbHMtaW1w',
  'YWN0LXNlbnNvcnMKZm9ya2xpZnQtdGlyZXMtbm9uLW1hcmtpbmctcnViYmVyLWNvbXBvdW5kcy1mb3Itd2FyZWhvdXNlLWZs',
  'b29yaW5nCmZyaWN0aW9uLWJ1aWxkLXVwLXJlZHVjaW5nLWJyZWFrLW91dC10b3JxdWUtaW4tcG5ldW1hdGljLWN5bGluZGVy',
  'cwpmdXR1cmUtb2YtcnViYmVycS1pbnZlc3RpbmctaW4tYWktYW5kLWF1dG9tYXRpb24tZm9yLTIwMjYtYW5kLWJleW9uZApn',
  'YXMtbWV0ZXJzLWxvbmctdGVybS1kaWFwaHJhZ20tc3RhYmlsaXR5LWluLW5hdHVyYWwtZ2FzLWVudmlyb25tZW50cwpncmlw',
  'cGVyLXBhZHMtZm9yLWZvb2QtYXV0b21hdGlvbi1mZGEtY29tcGxpYW50LXNpbGljb25lLXNvbHV0aW9ucwpoYXJkbmVzcy1t',
  'ZWFzdXJlbWVudC1zaG9yZS1hLXZzLXNob3JlLWQtd2hlbi10by1zd2l0Y2gKaGVhdC1idWlsZC11cC1oeXN0ZXJlc2lzLXNv',
  'bHZpbmctaW50ZXJuYWwtb3ZlcmhlYXRpbmctaW4tc29saWQtdGlyZXMKaGlnaC1mbGV4LWJlbGxvd3MtZm9yLTYtYXhpcy1y',
  'b2JvdHMtbWF0ZXJpYWwtZmF0aWd1ZS1hbmQtY3ljbGUtbGlmZS10ZXN0aW5nCmhvdy1pYXRmLTE2OTQ5LXN0YW5kYXJkcy1p',
  'bmZsdWVuY2UtcnViYmVyLWNvbXBvbmVudC1xdWFsaXR5LWZvci1yb2JvdGljcwppbi1ob3VzZS1sYWItY2FwYWJpbGl0aWVz',
  'LWZyb20tcmhlb21ldGVycy10by10ZW5zaWxlLXRlc3RpbmctbWFjaGluZXMKaW5zZXJ0LXNoaWZ0aW5nLXByZXZlbnRpbmct',
  'bWV0YWwtaW5zZXJ0cy1mcm9tLW1vdmluZy1kdXJpbmctaW5qZWN0aW9uCmluc3RhbGxhdGlvbi1kYW1hZ2UtcHJldmVudGlu',
  'Zy1uaWNrcy1hbmQtY3V0cy1kdXJpbmctYXNzZW1ibHkKaXNvLTEwOTkzLXRlc3RpbmctZm9yLWN5dG90b3hpY2l0eS1hbmQt',
  'c2Vuc2l0aXphdGlvbi1pbi1ydWJiZXItcGFydHMKbGlxdWlkLWNvb2xpbmctZm9yLWFpLXNlcnZlcnMtcHJldmVudGluZy1j',
  'b29sYW50LWxlYWtzLXdpdGgtcHJlY2lzaW9uLWhuYnItZ2Fza2V0cwptYXRlcmlhbC1zZWxlY3Rpb24tZ3VpZGUtc2lsaWNv',
  'bmUtdnMtbHNyLWZvci1tZWRpY2FsLWdyYWRlLWdhc2tldHMKbWlsLXN0ZC04MTBoLWVudmlyb25tZW50YWwtZW5naW5lZXJp',
  'bmctY29uc2lkZXJhdGlvbnMtZm9yLXJ1YmJlci1kYW1wZXJzCm1pbmluZy1jb252ZXlvci1iZWx0cy1pbXByb3ZpbmctaW1w',
  'YWN0LXJlc2lzdGFuY2Utd2l0aC1zcGVjaWFsaXplZC1ydWJiZXItY29tcG91bmRzCm1vbGQtZm91bGluZy1yZWR1Y2luZy1k',
  'b3dudGltZS10aHJvdWdoLWNvbXBvdW5kLW1vZGlmaWNhdGlvbgptb2xkaW5nLXNocmlua2FnZS13aHktdGhlLXNhbWUtdG9v',
  'bC1wcm9kdWNlcy1kaWZmZXJlbnQtc2l6ZXMtd2l0aC1kaWZmZXJlbnQtbWF0ZXJpYWxzCm5zZi1hbnNpLTYxLWNlcnRpZmlj',
  'YXRpb24tcmVxdWlyZW1lbnRzLWZvci1kcmlua2luZy13YXRlci1jb21wb25lbnRzCm9kb3ItaXNzdWVzLWhvdy10by1yZWR1',
  'Y2UtdGhlLXJ1YmJlci1zbWVsbC1pbi1jb25zdW1lci1wcm9kdWN0cwpvZmZzaG9yZS13aW5kLXR1cmJpbmVzLWNvcnJvc2lv',
  'bi1yZXNpc3RhbnQtZXBkbS1zZWFscy1mb3ItdHJhbnNpdGlvbi1waWVjZXMKb3Zlcm1vbGRpbmctdGVjaG5pcXVlcy1zb2x2',
  'aW5nLWFkaGVzaW9uLWlzc3Vlcy1iZXR3ZWVuLWxzci1hbmQtdGhlcm1vcGxhc3RpY3MKcGFwZXItbWlsbHMtaGVhdC1hbmQt',
  'aHVtaWRpdHktcmVzaXN0YW5jZS1vZi1ydWJiZXItcm9sbGVycwpwYXJ0aW5nLWxpbmUtbWlzYWxpZ25tZW50LXRyb3VibGVz',
  'aG9vdGluZy10b29saW5nLXdlYXIKcGVyZmx1b3JvZWxhc3RvbWVyLWZma20tcHJpY2luZy1hbmFseXppbmctdGhlLXN1cHBs',
  'eS1jaGFpbi1vZi1oaWdoLXBlcmZvcm1hbmNlLXBvbHltZXJzCnBuZXVtYXRpYy10b29scy12aWJyYXRpb24tcmVkdWN0aW9u',
  'LXNsZWV2ZXMtZm9yLWVyZ29ub21pYy1vcGVyYXRvci1zYWZldHkKcG9zdC1jdXJpbmctcHJvY2Vzc2VzLXdoeS1pdHMtY3Jp',
  'dGljYWwtZm9yLWZkYS1ncmFkZS1zaWxpY29uZS1nYXNrZXRzCnByZS1mb3JtaW5nLWVxdWlwbWVudC1wcmVjaXNpb24tYmxh',
  'bmtpbmctZm9yLWNvbnNpc3RlbnQtbW9sZGluZy1xdWFsaXR5CnJlYWNoLWFuZC1yb2hzLTMtZW5zdXJpbmctY29tcGxpYW5j',
  'ZS1pbi1nbG9iYWwtcnViYmVyLXN1cHBseS1jaGFpbnMKc2Vjb25kYXJ5LWRlZmxhc2hpbmctY3J5b2dlbmljLXZzLW1hbnVh',
  'bC1jaG9vc2luZy10aGUtcmlnaHQtZmluaXNoCnNlbWljb25kdWN0b3ItZXRjaGluZy1lcXVpcG1lbnQtaGlnaC1wdXJpdHkt',
  'ZmZrbS1zZWFscy1mb3ItcGxhc21hLXJlc2lzdGFuY2UKc2hlbGYtbGlmZS1zdGFuZGFyZHMtYW5hbHl6aW5nLWRpbi03NzE2',
  'LWFuZC1pc28tMjIzMC1mb3ItcnViYmVyLXN0b3JhZ2UKc2lsaWNhLWZpbGxlcnMtaW4tc2lsaWNvbmUtZW5oYW5jaW5nLW1l',
  'Y2hhbmljYWwtc3RyZW5ndGgtd2l0aG91dC1zYWNyaWZpY2luZy1jbGFyaXR5CnNpbGljb25lLXZzLWxzci1jb21wYXJpbmct',
  'cHJlY2lzaW9uLWFuZC1jb3N0LWluLWhpZ2gtdm9sdW1lLW1lZGljYWwtZ2Fza2V0cwpzcGMtc3RhdGlzdGljYWwtcHJvY2Vz',
  'cy1jb250cm9sLW1hbmFnaW5nLWNway12YWx1ZXMtaW4taGlnaC12b2x1bWUtcnVucwpzdGVyaWxlLXBhY2thZ2luZy1zaWxp',
  'Y29uZS1zZXB0dW1zLWZvci1tdWx0aS1kb3NlLXBoYXJtYWNldXRpY2FsLXZpYWxzCnN1c3RhaW5hYmxlLXJ1YmJlci1tYW51',
  'ZmFjdHVyaW5nLXJ1YmJlcnFzLWNvbW1pdG1lbnQtdG8taXNvLTE0MDAxCnRlYXItc3RyZW5ndGgtb2YtbmF0dXJhbC1ydWJi',
  'ZXItd2h5LXN5bnRoZXRpYy1hbHRlcm5hdGl2ZXMtc3RpbGwtc3RydWdnbGUtaW4taGVhdnktbWluaW5nCnRlbnNpbGUtZmFp',
  'bHVyZS1hbmFseXppbmctYnJlYWstcG9pbnRzLWluLWhpZ2gtc3RyZXRjaC1hcHBsaWNhdGlvbnMKdGVuc2lsZS1zdHJlc3Mt',
  'c3RyYWluLWN1cnZlcy13aGF0LWEtbWVjaGFuaWNhbC1lbmdpbmVlci1uZWVkcy10by1rbm93LWFib3V0LXJ1YmJlcgp0aGUt',
  'cm9sZS1vZi1hY3J5bG9uaXRyaWxlLWNvbnRlbnQtaW4tbmJyLWJhbGFuY2luZy1sb3ctdGVtcC1mbGV4LXZzLW9pbC1zd2Vs',
  'bGluZwp0b2xlcmFuY2Utc3RhY2tpbmctaW4tcnViYmVyLWdhc2tldHMtd2h5LTAtMDVtbS1pcy1oYXJkZXItdGhhbi1pbi1z',
  'dGVlbAp0cmFuc21pc3Npb24tc2VhbHMtbWFuYWdpbmctaGlnaC1zaGVhci1yYXRlcy1pbi1hdXRvbWF0aWMtdHJhbnNtaXNz',
  'aW9uLWZsdWlkLWF0Zgp1c3AtY2xhc3MtdmktdGhlLWdvbGQtc3RhbmRhcmQtZm9yLW1lZGljYWwtZ3JhZGUtZWxhc3RvbWVy',
  'cwp2ZGEtNi0zLWF1ZGl0LWhvdy1ydWJiZXJxLWFsaWducy13aXRoLWdlcm1hbi1hdXRvbW90aXZlLXF1YWxpdHktc3RhbmRh',
  'cmRzCnZpYnJhdGlvbi1kYW1wZW5pbmctaW4taGlnaC1kZW5zaXR5LXJhY2tzLWN1c3RvbS1ydWJiZXItbW91bnRzLWZvci1z',
  'ZXJ2ZXJzCnZ1bGNhbml6YXRpb24ta2luZXRpY3MtaG93LWN1cmUtc3BlZWQtaW1wYWN0cy1iYXRjaC10by1iYXRjaC1jb25z',
  'aXN0ZW5jeQp3YXJwaW5nLWluLW1vbGRlZC1wYXJ0cy1tYW5hZ2luZy1pbnRlcm5hbC1zdHJlc3Nlcy1kdXJpbmctY29vbGlu',
  'Zwp3YXN0ZXdhdGVyLXRyZWF0bWVudC1jaGVtaWNhbC1yZXNpc3RhbmNlLW9mLW5ici1pbi1jb3Jyb3NpdmUtc2x1ZGdlLWVu',
  'dmlyb25tZW50cwp3ZWFyYWJsZS1lbGVjdHJvbmljcy1za2luLXNhZmUtc2lsaWNvbmUtbHNyLWZvci1zbWFydHdhdGNoLWJh',
  'bmRz',
].join('');

function decodeLegacyBlogFallbackSlugs() {
  return atob(encodedLegacyBlogFallbackSlugs).split('\n').filter(Boolean);
}

const legacyWordPressBlogFallbackSlugs = new Set(decodeLegacyBlogFallbackSlugs());

const defaultLocaleRoutes = new Set([
  'about',
  'batch-rfq',
  'blog',
  'capabilities',
  'case-studies',
  'compounding',
  'contact',
  'factory',
  'industries',
  'materials',
  'privacy',
  'products',
  'quality',
  'resources',
  'sample-request',
  'search',
  'standards',
  'terms',
  'testing',
]);

function withSearch(targetPath: string, search: string) {
  return `${targetPath}${search}`;
}

function hasFileExtension(pathname: string) {
  return /\/[^/]+\.[^/]+$/.test(pathname);
}

function isInternalAssetPath(pathname: string) {
  return pathname.startsWith('/_astro/')
    || pathname.startsWith('/images/')
    || pathname.startsWith('/downloads/')
    || pathname === '/favicon.svg'
    || pathname === '/llms.txt';
}

function getRedirectTarget(pathname: string): string | null {
  if (pathname === '/') {
    return '/en';
  }

  if (!isInternalAssetPath(pathname) && !hasFileExtension(pathname) && pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }

  const segments = pathname.split('/').filter(Boolean);
  const [first, second, ...rest] = segments;

  if (first === 'blog') {
    if (!second) {
      return '/en/blog';
    }
    return legacyWordPressBlogFallbackSlugs.has(second)
      ? '/en/blog'
      : `/en/blog/${segments.slice(1).join('/')}`;
  }

  if (locales.has(first)) {
    if (second === 'blog') {
      const blogSlug = rest[0];
      const isLegacyFallback = rest.length === 1 && legacyWordPressBlogFallbackSlugs.has(blogSlug);

      if (isLegacyFallback) {
        return '/en/blog';
      }

      if (first === 'en') {
        return null;
      }
      return rest.length > 0 ? `/en/blog/${rest.join('/')}` : '/en/blog';
    }

    const fileRedirect = legacyLocalizedFiles.get(second);
    if (fileRedirect) {
      return fileRedirect;
    }

    return null;
  }

  if (defaultLocaleRoutes.has(first)) {
    return `/en/${segments.join('/')}`;
  }

  return null;
}

export const onRequest = defineMiddleware((context, next) => {
  const target = getRedirectTarget(context.url.pathname);

  if (target) {
    return context.redirect(withSearch(target, context.url.search), 301);
  }

  return next();
});
