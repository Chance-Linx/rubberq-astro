/** Published, reviewed article images. Generation and review records stay in private manifests. */
export interface ArticleVisual {
  id: string;
  alt: string;
  width: number;
  height: number;
  asset: { _ref: string; _type?: string };
}

export function sanityImageReference(ref?: string) {
  const match = typeof ref === 'string' ? ref.match(/^image-([a-zA-Z0-9]+)-(\d+)x(\d+)-(jpg|jpeg|png|webp|avif)$/) : null;
  if (!match) return null;
  const width = Number(match[2]);
  const height = Number(match[3]);
  if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height) || width < 1 || height < 1) return null;
  return { filename: `${match[1]}-${width}x${height}.${match[4]}`, width, height };
}

/** Use only valid Sanity image assets whose declared dimensions match the asset reference. */
export function articleImageObjects(canonical: string, images: ArticleVisual[] | null = [], projectId = 'tcjl4afv', dataset = 'production') {
  if (!Array.isArray(images)) return [];
  const ids = new Set<string>();
  const assets = new Set<string>();
  return images.flatMap((image) => {
    const ref = sanityImageReference(image?.asset?._ref);
    if (!ref || !/^[a-z0-9][a-z0-9-]*$/.test(image.id || '') ||
        typeof image.alt !== 'string' || !image.alt.trim() ||
        ref.width !== image.width || ref.height !== image.height ||
        ids.has(image.id) || assets.has(image.asset._ref)) return [];
    ids.add(image.id);
    assets.add(image.asset._ref);
    const url = `https://cdn.sanity.io/images/${projectId}/${dataset}/${ref.filename}?fm=webp&q=100`;
    return [{
      '@type': 'ImageObject',
      '@id': `${canonical}#image-${image.id}`,
      contentUrl: url,
      url,
      description: image.alt,
      width: ref.width,
      height: ref.height,
    }];
  });
}

/** Preserve the existing BlogPosting identity and metadata; add one connected image graph. */
export function withArticleImages(blog: Record<string, unknown>, images: ReturnType<typeof articleImageObjects>) {
  if (!images.length) return blog;
  const { '@context': context, ...article } = blog;
  return {
    '@context': context || 'https://schema.org',
    '@graph': [
      { ...article, image: images.map((image) => ({ '@id': image['@id'] })) },
      ...images,
    ],
  };
}

/** Asset hashes are identifiers, not editorial claims; keep all visible labels in policy checks. */
export function withoutSanityAssetUrls(text: string): string {
  return text.replace(/https:\/\/cdn\.sanity\.io\/images\/[a-z0-9]+\/[a-z0-9_-]+\/[a-f0-9]+-\d+x\d+\.(?:avif|jpe?g|png|webp)(?:\?[^"'<>\s]*)?/gi, '');
}
