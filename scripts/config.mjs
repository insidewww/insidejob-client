/** Public build configuration shared by Vite, sitemap generation and CI. */
export function readConfig(env) {
  const parse = (value, name) => {
    if (!value) throw new Error(`Set ${name} before building.`);
    let url;
    try { url = new URL(value); } catch { throw new Error(`${name} must be an absolute URL.`); }
    if (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname))) {
      throw new Error(`${name} must use HTTPS (HTTP is allowed for localhost).`);
    }
    if (url.username || url.password || url.search || url.hash) throw new Error(`${name} must not contain credentials, a query or a fragment.`);
    return url;
  };
  const api = parse(env.VITE_WP_API_URL, 'VITE_WP_API_URL');
  if (!/\/wp-json\/wp\/v2\/?$/.test(api.pathname)) throw new Error('VITE_WP_API_URL must end with /wp-json/wp/v2.');
  // The old deployment secret could contain either a CNAME host or an absolute URL.
  const value = env.BASE_URL?.trim();
  const base = parse(value && (value.includes('://') ? value : `https://${value}`), 'BASE_URL');
  if (base.pathname !== '/') throw new Error('BASE_URL must be the frontend origin without a path.');
  return { api: api.href.replace(/\/$/, ''), base: base.origin, hostname: base.hostname };
}

/** Public production defaults keep Render builds independent of legacy Labguy variables. */
export function readSiteConfig(env) {
  return readConfig({
    VITE_WP_API_URL: env.VITE_WP_API_URL?.trim() || 'https://host951157.xce.pl/wp-json/wp/v2',
    BASE_URL: env.BASE_URL?.trim() || 'https://michalknychaus.com',
  });
}
