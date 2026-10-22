import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRestClient } from '../src/lib/rest.ts';
test('collects every native REST page, preserving publish/category/order constraints', async () => {
  const calls = []; const signal = new AbortController().signal;
  const client = createRestClient('https://wp.example/wp-json/wp/v2/', async (url, options) => {
    const query = new URL(url); calls.push({ query, options });
    return new Response(JSON.stringify([{ id: Number(query.searchParams.get('page')) }]), { headers: { 'X-WP-TotalPages': '3' } });
  });
  const data = await client.all('posts', { categories: 77, status: 'publish', orderby: 'event_end', order: 'desc', _embed: 1 }, signal);
  assert.deepEqual(data, [{ id: 1 }, { id: 2 }, { id: 3 }]);
  for (const { query, options } of calls) {
    assert.equal(query.pathname, '/wp-json/wp/v2/posts');
    assert.equal(query.searchParams.get('status'), 'publish');
    assert.equal(query.searchParams.get('categories'), '77');
    assert.equal(query.searchParams.get('orderby'), 'event_end');
    assert.equal(query.searchParams.get('per_page'), '100');
    assert.equal(options.credentials, 'omit'); assert.equal(options.signal, signal);
    assert.equal(options.headers, undefined);
  }
});
test('a later REST page failing rejects the entire list instead of silently dropping content', async () => {
  const client = createRestClient('https://wp.example/wp-json/wp/v2', async url => new URL(url).searchParams.get('page') === '1'
    ? new Response('[{"id":1}]', { headers: { 'X-WP-TotalPages': '2' } })
    : new Response('Unavailable', { status: 503 }));
  await assert.rejects(client.all('posts', { status: 'publish' }), error => error.status === 503);
});

test('reads public site settings from the native REST index without authentication', async () => {
  const signal = new AbortController().signal;
  for (const api of ['https://wp.example/wp-json/wp/v2', 'https://wp.example/wordpress/wp-json/wp/v2/']) {
    const client = createRestClient(api, async (url, options) => {
      const endpoint = new URL(url);
      assert.equal(endpoint.pathname, api.includes('/wordpress/') ? '/wordpress/wp-json/' : '/wp-json/');
      assert.equal(endpoint.searchParams.get('_fields'), 'name,description,site_icon_url');
      assert.equal(options.credentials, 'omit');
      assert.equal(options.headers, undefined);
      assert.equal(options.signal, signal);
      return new Response('{"name":"Inside Job","description":"From WordPress settings","site_icon_url":"https://wp.example/icon.png"}');
    });
    const { data } = await client.index(signal);
    assert.equal(data.name, 'Inside Job');
    assert.equal(data.description, 'From WordPress settings');
  }
});
