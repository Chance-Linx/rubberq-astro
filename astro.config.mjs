import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    imageService: 'cloudflare',
  }),
  integrations: [tailwind(), react()],
  vite: {
    ssr: {
      noExternal: ['@sanity/client'],
    },
    cacheDir: process.env.VITE_CACHE_DIR || undefined,
  },
});
