// ლოკალური სერვერი დამატებითი პაკეტების გარეშე: npm run dev → http://localhost:5173
// (კომპონენტები fetch-ით იტვირთება, ამიტომ index.html-ის პირდაპირ, file://-ით გახსნა არ იმუშავებს)
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');   // Node 18-ზეც მუშაობს
const PORT = Number(process.env.PORT) || 5173;
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2'
};

// სტუმრის ქვეყანა IP-ით (src/core/geo.js): CDN-ის სათაურიდან — Cloudflare, Vercel, CloudFront.
// ლოკალურად სათაური არ არის → { country: null } და ბრაუზერი სარეზერვო სერვისს (country.is) მიმართავს
const GEO_HEADERS = ['cf-ipcountry', 'x-vercel-ip-country', 'cloudfront-viewer-country', 'x-country'];
const geo = req => {
  const c = GEO_HEADERS.map(h => req.headers[h]).find(v => /^[A-Za-z]{2}$/.test(v || '') && !/^(XX|T1)$/i.test(v));
  return { country: c ? c.toUpperCase() : null };
};

createServer(async (req, res) => {
  const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (url === '/api/geo') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }).end(JSON.stringify(geo(req)));
    return;
  }
  let file = normalize(join(ROOT, url));
  if (!file.startsWith(ROOT)) { res.writeHead(403).end(); return; }       // საქაღალდის გარეთ — აკრძალულია
  try {
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('404 — ვერ მოიძებნა');
  }
}).listen(PORT, () => console.log(`გაშვებულია: http://localhost:${PORT}`));
