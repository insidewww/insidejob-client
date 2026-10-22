import { writeFile } from 'node:fs/promises';
import dotenv from 'dotenv';
import { readSiteConfig } from '../../scripts/config.mjs';
dotenv.config({ path: ['.env.local', '.env'] });
const { api, base } = readSiteConfig(process.env);
async function all(resource, params = {}) {
  const result = [];
  for (let page = 1, total = 1; page <= total; page++) {
    const query = new URLSearchParams({ ...params, status: 'publish', per_page: '100', page: String(page) });
    const response = await fetch(`${api}/${resource}?${query}`);
    if (!response.ok) throw new Error(`Sitemap fetch failed: ${response.status}`);
    total = Number(response.headers.get('X-WP-TotalPages') || 1);
    result.push(...await response.json());
  }
  return result;
}
const [pages, posts, categoriesResponse] = await Promise.all([all('pages'), all('posts'), fetch(`${api}/categories?per_page=100`)]);
if (!categoriesResponse.ok) throw new Error('Cannot resolve categories.');
const categories = await categoriesResponse.json();
const projects = categories.find(category => category.slug === 'projects')?.id;
const calendar = categories.find(category => category.slug === 'calendar')?.id;
if (!projects || !calendar) throw new Error('Create Projects and Calendar categories first.');
const staticUrls = {
  home: 'https://www.michalknychaus.com/', bio: 'https://www.ulalucinska.com/bio',
  contact: 'https://ulalucinska.com/contact', projects: 'https://ulalucinska.com/projects',
  calendar: 'https://www.michalknychaus.com/calendar',
};
const urls = pages.map(page => staticUrls[page.slug] || `${base}/${page.slug}`);
for (const post of posts) {
  if (post.categories.includes(projects)) {
    const day = new Date(`${post.modified_gmt || post.date_gmt}Z`).getDate();
    urls.push(`${day % 2 === 0 ? 'https://ulalucinska.com' : 'https://michalnychaus.com'}/projects/${post.slug}`);
  } else if (!post.categories.includes(calendar)) urls.push(`${base}/${post.slug}`);
}
const escape = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
await writeFile(new URL('../../public/sitemap.xml', import.meta.url), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...new Set(urls)].map(url => `  <url><loc>${escape(url)}</loc></url>`).join('\n')}\n</urlset>\n`);
console.log(`Generated sitemap with ${new Set(urls).size} published URLs.`);
