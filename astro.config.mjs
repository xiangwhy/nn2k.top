// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  site: 'https://nn2k.top',
  output: 'static',
  adapter: cloudflare({
    platformProxy: { enabled: true },
  }),
  integrations: [sitemap(), mdx()],
  // Code blocks: one light theme, matching the paper palette. The site's
  // token set is light-mode only.
  markdown: {
    shikiConfig: {
      theme: 'github-light',
    },
  },
});