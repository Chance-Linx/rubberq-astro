import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';
import base from '../../astro.config.mjs';

export default defineConfig({
  ...base,
  root: fileURLToPath(new URL('../../', import.meta.url)),
  cacheDir: fileURLToPath(new URL('../../node_modules/.astro-article-review/', import.meta.url)),
  server: { host: '127.0.0.1', port: 4398 },
  vite: { ...base.vite, cacheDir: 'node_modules/.vite-article-review' },
  integrations: [
    ...base.integrations,
    {
      name: 'rubberq-local-article-review',
      hooks: {
        'astro:config:setup': ({ command, config, injectRoute, addMiddleware }) => {
          if (command !== 'dev') throw new Error('Article review configuration supports local dev only.');
          if (config.server.host !== '127.0.0.1') throw new Error('Article review must stay on127.0.0.1.');
          injectRoute({ pattern: '/__review', entrypoint: new URL('./index.astro', import.meta.url), prerender: false });
          injectRoute({ pattern: '/__review/articles/[slug]', entrypoint: new URL('./article.astro', import.meta.url), prerender: false });
          addMiddleware({ entrypoint: new URL('./middleware.ts', import.meta.url), order: 'pre' });
        },
      },
    },
  ],
});
