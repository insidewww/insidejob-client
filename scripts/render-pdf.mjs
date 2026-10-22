import { readFile, writeFile, unlink, chmod } from 'node:fs/promises';
import { dirname, resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { marked } from 'marked';
import { browserSession } from './browser-session.mjs';

const [source, destination] = process.argv.slice(2).map(value => resolve(value));
if (!source || !destination) throw new Error('Usage: node scripts/render-pdf.mjs SOURCE.md OUTPUT.pdf');
const htmlFile = join(dirname(destination), '.insidejob-print.html');
const markdown = await readFile(source, 'utf8');
const html = `<!doctype html><html><head><meta charset="utf-8"><base href="${pathToFileURL(dirname(source) + '/').href}"><title>Inside Job — owner guide</title><style>
@page { size: A4; margin: 15mm; }
body { font: 11pt/1.5 Arial, sans-serif; color: #222; }
h1 { font-size: 23pt; } h2 { font-size: 16pt; margin-top: 1.4em; break-after: avoid; }
h3 { font-size: 13pt; break-after: avoid; }
table { width: 100%; border-collapse: collapse; font-size: 10pt; break-inside: avoid; }
th, td { border: 1px solid #ccc; padding: 6px; text-align: left; vertical-align: top; }
p, li { orphans: 3; widows: 3; } a { color: #204898; }
img { width: 100%; max-height: 210mm; object-fit: contain; break-inside: avoid; }
pre { background: #f3f3f3; padding: 10px; white-space: pre-wrap; } code { font-size: .9em; }
</style></head><body>${marked.parse(markdown)}</body></html>`;
await writeFile(htmlFile, html, { mode: 0o600 });
const browser = await browserSession();
try {
  await browser.navigate(pathToFileURL(htmlFile).href);
  await browser.waitFor('[...document.images].every(image => image.complete && image.naturalWidth > 0)');
  const result = await browser.send('Page.printToPDF', { printBackground: true, preferCSSPageSize: true, displayHeaderFooter: true, headerTemplate: '<span></span>', footerTemplate: '<div style="font:9px Arial;text-align:center;width:100%">Inside Job · <span class="pageNumber"></span> / <span class="totalPages"></span></div>' });
  await writeFile(destination, Buffer.from(result.data, 'base64'), { mode: 0o600 });
  await chmod(destination, 0o600);
  console.log(`PDF created: ${destination}`);
} finally { await browser.close(); await unlink(htmlFile); }
