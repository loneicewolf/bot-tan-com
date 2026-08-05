// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://bot-tan.com',

  i18n: {
    locales: ['ja', 'en', 'sv'],
    defaultLocale: 'ja',
    routing: {
      // ja -> /  , en -> /en/  , sv -> /sv/
      prefixDefaultLocale: false,
    },
  },

  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'ja',
        locales: { ja: 'ja-JP', en: 'en-US', sv: 'sv-SE' },
      },
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});
