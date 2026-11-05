/**
 * The clean path of a page, as visitors see it: /about, /works/lumio, /.
 * `build.format: 'file'` (astro.config.mjs) makes `Astro.url.pathname` end in `.html` at build time
 * (/about.html), while Vercel serves and redirects to /about (`cleanUrls` in vercel.json). Dev has
 * no `.html`, so anything comparing or publishing page paths must go through this.
 */
export const cleanPath = (pathname: string): string =>
  pathname
    .replace(/\.html$/, '')
    .replace(/\/index$/, '')
    .replace(/\/+$/, '') || '/';
