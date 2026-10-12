// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// The public URL is not known until the site is deployed. Set SITE_URL
// (e.g. in the Render/Vercel dashboard) to enable canonical URLs, Open Graph
// URLs and the sitemap. Nothing is invented when it is unset.
const site = process.env.SITE_URL?.trim().replace(/\/+$/, '') || undefined;

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'always',
  integrations: site ? [sitemap()] : [],
});
