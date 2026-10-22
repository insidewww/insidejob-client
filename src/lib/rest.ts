/** Native WordPress REST pagination. No authentication data is sent by the public client. */
export function createRestClient(api: string | undefined, fetchImpl: typeof fetch = fetch) {
  function baseUrl() {
    if (!api) throw new Error('Set VITE_WP_API_URL to the new WordPress /wp-json/wp/v2 URL.');
    return api.replace(/\/$/, '');
  }
  function endpoint(resource: string, params: Record<string, string | number>) {
    return `${baseUrl()}/${resource}?${new URLSearchParams(Object.entries(params).map(([key, value]) => [key, String(value)]))}`;
  }
  async function read<T>(url: string, signal?: AbortSignal) {
    const response = await fetchImpl(url, { signal, credentials: 'omit' });
    if (!response.ok) throw new Response('WordPress content could not be loaded.', { status: response.status });
    return { data: await response.json() as T, pages: Number(response.headers.get('X-WP-TotalPages') || 1) };
  }
  function request<T>(resource: string, params: Record<string, string | number> = {}, signal?: AbortSignal) {
    return read<T>(endpoint(resource, params), signal);
  }
  function index<T>(signal?: AbortSignal) {
    return read<T>(`${baseUrl().replace(/\/wp\/v2$/, '/')}?_fields=name,description,site_icon_url`, signal);
  }
  async function all<T>(resource: string, params: Record<string, string | number>, signal?: AbortSignal): Promise<T[]> {
    const first = await request<T[]>(resource, { ...params, per_page: 100, page: 1 }, signal);
    const pages = await Promise.all(Array.from({ length: Math.max(0, first.pages - 1) }, (_, index) => request<T[]>(resource, { ...params, per_page: 100, page: index + 2 }, signal)));
    return first.data.concat(...pages.map(page => page.data));
  }
  return { request, all, index };
}
