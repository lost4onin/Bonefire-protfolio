// @ts-check
import { defineConfig } from 'astro/config';

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  // TODO(M1): replace with the production URL Vercel gives Akrem after linking the project.
  // TODO(M12): then with the custom domain, e.g. 'https://akrem.dev'
  site: 'https://bonefire-protfolio.vercel.app',
  // Static output — Vercel serves it with zero config.
  output: 'static',
  trailingSlash: 'never',
  build: {
    format: 'file', // /about instead of /about/
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  devToolbar: {
    enabled: false, // the toolbar clashes with the custom cursor; re-enable if needed
  },
  vite: {
    build: {
      // three.js is big; keep it in its own chunk so 2D pages never load it
      rollupOptions: {
        output: {
          manualChunks: {
            three: ['three'],
          },
        },
      },
    },
  },
});
