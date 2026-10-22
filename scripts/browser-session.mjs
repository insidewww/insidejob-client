import { spawn } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

export async function browserSession() {
  const executable = process.env.CHROME_BIN;
  if (!executable) throw new Error('Set CHROME_BIN to a Chromium/Chrome executable.');
  const profile = await mkdtemp(join(tmpdir(), 'insidejob-browser-'));
  const port = 19328;
  const browser = spawn(executable, [`--remote-debugging-port=${port}`, '--remote-debugging-address=127.0.0.1', `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check', 'about:blank'], { stdio: 'ignore' });
  let pages;
  for (let attempt = 0; attempt < 60; attempt++) {
    try { pages = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); break; } catch { await delay(150); }
  }
  if (!pages) { browser.kill(); throw new Error('Chromium did not start.'); }
  const ws = new WebSocket(pages[0].webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.addEventListener('open', resolve); ws.addEventListener('error', reject); });
  let sequence = 0; const pending = new Map(); const errors = [];
  ws.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.id) { pending.get(message.id)?.(message); pending.delete(message.id); }
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text);
  });
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++sequence;
    const timeout = setTimeout(() => { pending.delete(id); reject(new Error(`${method} timed out`)); }, 25000);
    pending.set(id, message => { clearTimeout(timeout); message.error ? reject(new Error(message.error.message)) : resolve(message.result); });
    ws.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async expression => {
    const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text + ': ' + (result.exceptionDetails.exception?.description || ''));
    return result.result?.value;
  };
  const waitFor = async (expression, timeout = 20000) => {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      try { if (await evaluate(`Boolean(${expression})`)) return; } catch { /* context may change during navigation */ }
      await delay(200);
    }
    throw new Error(`Timed out waiting for: ${expression}`);
  };
  await Promise.all([send('Runtime.enable'), send('Page.enable'), send('Network.enable')]);
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  return {
    send, evaluate, waitFor, errors,
    async navigate(url) { await send('Page.navigate', { url }); await waitFor('document.readyState === "complete"'); await delay(350); },
    async screenshot(destination) { await evaluate('document.fonts.ready.then(()=>true)'); const shot = await send('Page.captureScreenshot', { format: 'png' }); await writeFile(destination, Buffer.from(shot.data, 'base64')); },
    async close() { ws.close(); browser.kill(); await delay(300); await rm(profile, { recursive: true, force: true }); },
  };
}
