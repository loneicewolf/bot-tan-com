// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://bot-tan.com',

  i18n: {
    locales: ['ja', 'en'],
    defaultLocale: 'ja',
    routing: {
      // ja -> /  , en -> /en/
      prefixDefaultLocale: false,
    },
  },

  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'ja',
        locales: { ja: 'ja-JP', en: 'en-US' },
      },
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});
