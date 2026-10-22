import type { ImageRefSchema, PageContent, Project, SiteData, UrlSchema } from './content.types';
import { createRestClient } from './rest';
import { partialDate } from './partial-date';

type Term = { id: number; name: string; slug: string; taxonomy: string };
type WPRecord = {
  id: number; slug: string; type: 'post' | 'page'; status: string; date_gmt: string; modified_gmt: string;
  title: { rendered: string }; content: { rendered: string }; excerpt?: { rendered: string };
  categories?: number[]; acf?: Record<string, unknown>;
  _embedded?: { 'wp:term'?: Term[][]; 'wp:featuredmedia'?: WPMedia[] };
};
type WPMedia = {
  id: number; source_url: string; alt_text: string; caption: { rendered: string }; acf?: { is_bright?: boolean };
  media_details: { width: number; height: number; sizes?: Record<string, { source_url: string; width: number }> };
};
type WPIndex = { name: string; description: string; site_icon_url?: string };
const { request, all, index } = createRestClient(import.meta.env.VITE_WP_API_URL);
const documentFor = (html: string) => new DOMParser().parseFromString(html, 'text/html');
const text = (html: string) => (documentFor(html).body.textContent || '').replace(/\s+/g, ' ').trim();
export function imageFromElement(img: HTMLImageElement): ImageRefSchema {
  return {
    mediaType: 'IMAGE', src: img.src, srcSet: img.srcset || undefined, sizes: img.sizes || '(max-width: 767px) 100vw, 50vw',
    alt: img.alt, width: Number(img.getAttribute('width')) || undefined, height: Number(img.getAttribute('height')) || undefined,
    description: img.closest('figure')?.querySelector('figcaption')?.textContent || '',
  };
}
function imageFromMedia(media?: WPMedia): ImageRefSchema | null {
  if (!media?.source_url) return null;
  const sizes = Object.values(media.media_details?.sizes || {});
  return {
    mediaType: 'IMAGE', id: media.id, src: media.source_url, alt: media.alt_text,
    srcSet: sizes.map(size => `${size.source_url} ${size.width}w`).join(', ') || undefined,
    description: text(media.caption.rendered), width: media.media_details.width, height: media.media_details.height,
    isBright: Boolean(media.acf?.is_bright),
  };
}
function urlsIn(element: ParentNode | null): UrlSchema[] {
  return Array.from(element?.querySelectorAll<HTMLAnchorElement>('a[href]') || []).map((a, index) => ({ id: index, url: a.href, title: a.textContent || a.href }));
}
function normalizeProject(post: WPRecord, projectCategory: number): Project {
  const doc = documentFor(post.content.rendered);
  const textGroup = doc.querySelector('.insidejob-text');
  const mediaGroup = doc.querySelector('.insidejob-media');
  // Native posts without the optional pattern still work: media in the right column, remaining blocks in the left.
  const fallback = doc.body.cloneNode(true) as HTMLElement;
  fallback.querySelectorAll('figure.wp-block-image,figure.wp-block-gallery,figure.wp-block-embed,.insidejob-links').forEach(node => node.remove());
  const mediaHtml = mediaGroup?.innerHTML ?? Array.from(doc.querySelectorAll('figure.wp-block-image,figure.wp-block-gallery,figure.wp-block-embed')).filter(el => !el.parentElement?.closest('figure')).map(el => el.outerHTML).join('');
  const inProjects = Boolean(post.categories?.includes(projectCategory));
  return {
    id: post.id, inProjects,
    general: { title: text(post.title.rendered), description: text(post.excerpt?.rendered || ''), slug: post.slug, published: post.status === 'publish', createdAt: `${post.date_gmt}Z`, updatedAt: `${post.modified_gmt}Z`, tags: post._embedded?.['wp:term']?.flat().filter(term => term.taxonomy === 'post_tag').map(term => ({ id: term.id, title: term.name })) || [] },
    start_date: partialDate(post.acf?.start_date), end_date: partialDate(post.acf?.end_date),
    subtitle: String(post.acf?.subtitle || ''), venue: String(post.acf?.venue || ''),
    urls: urlsIn(doc.querySelector('.insidejob-links')),
    textHtml: textGroup?.innerHTML ?? fallback.innerHTML, mediaHtml,
    cover: imageFromMedia(post._embedded?.['wp:featuredmedia']?.[0]) || (doc.querySelector('img') ? imageFromElement(doc.querySelector('img')!) : null),
  };
}
async function category(slug: string, signal?: AbortSignal) {
  const { data } = await request<Term[]>('categories', { slug }, signal);
  if (!data[0]) throw new Error(`Create the WordPress category “${slug}”.`);
  return data[0].id;
}
function normalizePage(page: WPRecord): PageContent {
  return {
    id: page.id, slug: page.slug, title: text(page.title.rendered),
    description: text(page.excerpt?.rendered || ''), kind: page.type,
    image: page._embedded?.['wp:featuredmedia']?.[0]?.source_url || documentFor(page.content.rendered).querySelector('img')?.src,
    html: page.content.rendered, acf: page.acf || {},
  };
}
export async function loadPage(slug: string, signal?: AbortSignal): Promise<PageContent> {
  const { data } = await request<WPRecord[]>('pages', { slug, status: 'publish', _embed: 1 }, signal);
  if (!data[0]) throw new Response('Page not found', { status: 404 });
  const page = data[0];
  return normalizePage(page);
}
export async function loadSite(signal?: AbortSignal): Promise<SiteData> {
  const [{ data }, { data: settings }] = await Promise.all([
    request<WPRecord[]>('pages', { slug: 'home', status: 'publish', _embed: 1 }, signal),
    index<WPIndex>(signal),
  ]);
  const site = { name: text(settings.name), description: text(settings.description), iconUrl: settings.site_icon_url || undefined };
  const home = data[0];
  if (!home) throw new Error('Publish the Home page with slug “home”.');
  const doc = documentFor(home.content.rendered);
  let featuredRecord = home._embedded?.['wp:featuredmedia']?.[0];
  if (featuredRecord && !featuredRecord.acf) featuredRecord = (await request<WPMedia>(`media/${featuredRecord.id}`, {}, signal)).data;
  const featured = imageFromMedia(featuredRecord);
  const img = doc.querySelector('img');
  const media = img ? { ...imageFromElement(img), isBright: featured?.isBright ?? false } : featured || undefined;
  const extra = doc.body.cloneNode(true) as HTMLElement;
  extra.querySelector('h1')?.remove(); extra.querySelector('h2')?.remove();
  const hero = extra.querySelector('img');
  if (hero) (hero.closest('figure') || hero).remove();
  extra.querySelector('.insidejob-home-links')?.remove();
  return { site, preferences: { homepage_description: site.description || text(home.excerpt?.rendered || ''), homepage_heading: doc.querySelector('h1')?.innerHTML || '', homepage_subheading: doc.querySelector('h2')?.innerHTML || '', homepage_content: extra.innerHTML.trim(), homepage_media: media, homepage_urls: urlsIn(doc.querySelector('.insidejob-home-links')) } };
}
export async function loadProjects(signal?: AbortSignal) {
  const id = await category('projects', signal);
  const [posts, page] = await Promise.all([all<WPRecord>('posts', { categories: id, status: 'publish', _embed: 1, orderby: 'event_end', order: 'desc' }, signal), loadPage('projects', signal)]);
  return { projects: posts.map(post => normalizeProject(post, id)), page };
}
export async function loadCalendar(signal?: AbortSignal) {
  const [calendarId, projectId] = await Promise.all([category('calendar', signal), category('projects', signal)]);
  const [posts, page] = await Promise.all([all<WPRecord>('posts', { categories: calendarId, status: 'publish', _embed: 1, orderby: 'event_end', order: 'desc' }, signal), loadPage('calendar', signal)]);
  return { projects: posts.map(post => normalizeProject(post, projectId)), page };
}
export async function loadProject(slug: string, signal?: AbortSignal) {
  const id = await category('projects', signal);
  const { data } = await request<WPRecord[]>('posts', { slug, categories: id, status: 'publish', _embed: 1 }, signal);
  if (!data[0]) throw new Response('Project not found', { status: 404 });
  return normalizeProject(data[0], id);
}
export async function loadContent(slug: string, signal?: AbortSignal): Promise<PageContent> {
  const [pages, posts] = await Promise.all([request<WPRecord[]>('pages', { slug, status: 'publish', _embed: 1 }, signal), request<WPRecord[]>('posts', { slug, status: 'publish', _embed: 1 }, signal)]);
  const page = pages.data[0] || posts.data[0];
  if (!page) throw new Response('Page not found', { status: 404 });
  return normalizePage(page);
}
