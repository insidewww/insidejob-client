import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readConfig, readSiteConfig } from '../scripts/config.mjs';
const env = { VITE_WP_API_URL: 'https://wp.example/wp-json/wp/v2', BASE_URL: 'https://site.example' };

test('deployment config accepts both the legacy CNAME and a site origin', () => {
  assert.deepEqual(readConfig({ ...env, BASE_URL: 'site.example' }), { api: env.VITE_WP_API_URL, base: env.BASE_URL, hostname: 'site.example' });
  assert.equal(readConfig({ ...env, VITE_WP_API_URL: env.VITE_WP_API_URL + '/' }).api, env.VITE_WP_API_URL);
});
test('missing or malformed configuration fails before publishing a broken build', () => {
  for (const VITE_WP_API_URL of ['', undefined, 'not a URL', 'https://wp.example/api']) assert.throws(() => readConfig({ ...env, VITE_WP_API_URL }));
  for (const BASE_URL of ['', undefined, 'https://site.example/subpath', 'https://site.example/?preview=1']) assert.throws(() => readConfig({ ...env, BASE_URL }));
});
test('public configuration rejects credentials and insecure remote origins', () => {
  assert.throws(() => readConfig({ ...env, VITE_WP_API_URL: 'https://user:secret@wp.example/wp-json/wp/v2' }));
  assert.throws(() => readConfig({ ...env, BASE_URL: 'http://site.example' }));
  assert.equal(readConfig({ ...env, BASE_URL: 'http://localhost:5178' }).base, 'http://localhost:5178');
});

test('Render builds use public WordPress defaults without new dashboard variables', () => {
  assert.deepEqual(readSiteConfig({}), {
    api: 'https://host951157.xce.pl/wp-json/wp/v2',
    base: 'https://michalknychaus.com',
    hostname: 'michalknychaus.com',
  });
  assert.equal(readSiteConfig({ VITE_WP_API_URL: '', BASE_URL: '' }).api, readSiteConfig({}).api);
  assert.deepEqual(readSiteConfig(env), readConfig(env));
  assert.throws(() => readSiteConfig({ VITE_WP_API_URL: 'https://wp.example/api' }));
});
