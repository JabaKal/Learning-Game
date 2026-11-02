/* სტუმრის ქვეყნის დადგენა IP-ით → „სახლის“ ენა (პირველი სიაში და არჩეული პირველ ვიზიტზე).
   რიგი:
   1. ?country=TR მისამართში — სატესტოდ (ნებისმიერი ქვეყნის იმიტაცია);
   2. შენახული შედეგი (7 დღე) — ყოველ ვიზიტზე თავიდან არ ვკითხულობთ;
   3. IP — ოთხი წყარო ერთდროულად, იგებს პირველი პასუხი (ერთი რომ დაიბლოკოს — მაგ. რეკლამის ბლოკერით — დანარჩენი მაინც პასუხობს):
      ჩვენი სერვერი /api/geo (CDN-ის სათაური: Cloudflare CF-IPCountry, Vercel x-vercel-ip-country — მესამე მხარის გარეშე),
      country.is, geojs.io, Cloudflare-ის trace. ⚠️ სამი ბოლო მესამე მხარეა (სტუმრის IP იქ მიდის) — კონფიდენციალურობის
      პოლიტიკაში უნდა აღინიშნოს; როცა საიტი CDN-ზე გაეშვება, /api/geo საკმარისი იქნება;
   4. დროის სარტყელი (მაგ. Asia/Tbilisi → GE) — ბრაუზერიდან არსად მიდის და ვერ დაიბლოკება;
   5. ბრაუზერის ენა (navigator.languages).
   IP-ს 2 წამი აქვს; თუ ვერაფრით დადგინდა — ინგლისური. */
import { DICTS, COUNTRY_LANG, FALLBACK_LANG } from '../i18n/languages.js';

const CACHE_KEY = 'geo', CACHE_DAYS = 7, TIMEOUT = 2000;

const valid = c => typeof c === 'string' && /^[A-Za-z]{2}$/.test(c.trim()) && !/^(XX|T1)$/i.test(c.trim()) ? c.trim().toUpperCase() : null;

// IP-ის წყაროები: url და პასუხიდან ქვეყნის ამოღება
const SOURCES = [
  ['/api/geo', r => r.json().then(j => j.country)],
  ['https://api.country.is/', r => r.json().then(j => j.country)],
  ['https://get.geojs.io/v1/ip/country.json', r => r.json().then(j => j.country)],
  ['https://1.1.1.1/cdn-cgi/trace', r => r.text().then(t => (t.match(/^loc=(\w+)$/m) || [])[1])]
];

// ყველა წყარო ერთდროულად; პირველი სწორი პასუხი იგებს, დანარჩენი წყდება
function fromIp() {
  const ctrl = new AbortController();
  return new Promise(resolve => {
    let left = SOURCES.length;
    const done = c => { if (c) { ctrl.abort(); resolve(c); } else if (--left === 0) resolve(null); };
    setTimeout(() => { ctrl.abort(); resolve(null); }, TIMEOUT);
    for (const [url, parse] of SOURCES)
      fetch(url, { signal: ctrl.signal, cache: 'no-store' }).then(r => r.ok ? parse(r) : null).then(valid, () => null).then(done, () => done(null));
  });
}

// დროის სარტყელი → ქვეყანა (მხოლოდ ის ქვეყნები, რომელთა ენაც სიაშია)
const TIMEZONES = {
  GE: ['Asia/Tbilisi'], TR: ['Europe/Istanbul', 'Asia/Istanbul'], AM: ['Asia/Yerevan'], AZ: ['Asia/Baku'], BY: ['Europe/Minsk'],
  KZ: ['Asia/Almaty', 'Asia/Qostanay', 'Asia/Aqtobe', 'Asia/Aqtau', 'Asia/Atyrau', 'Asia/Oral', 'Asia/Qyzylorda'],
  UZ: ['Asia/Tashkent', 'Asia/Samarkand'],
  RU: ['Europe/Moscow', 'Europe/Kaliningrad', 'Europe/Samara', 'Europe/Volgograd', 'Europe/Saratov', 'Europe/Ulyanovsk', 'Europe/Astrakhan', 'Europe/Kirov',
    'Asia/Yekaterinburg', 'Asia/Omsk', 'Asia/Novosibirsk', 'Asia/Barnaul', 'Asia/Tomsk', 'Asia/Novokuznetsk', 'Asia/Krasnoyarsk', 'Asia/Irkutsk',
    'Asia/Chita', 'Asia/Yakutsk', 'Asia/Khandyga', 'Asia/Vladivostok', 'Asia/Ust-Nera', 'Asia/Magadan', 'Asia/Sakhalin', 'Asia/Srednekolymsk',
    'Asia/Kamchatka', 'Asia/Anadyr']
};
function fromTimezone() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return Object.keys(TIMEZONES).find(c => TIMEZONES[c].includes(tz)) || null;
  } catch { return null; }
}

export const testCountry = () => valid(new URLSearchParams(location.search).get('country') || '');

export async function detectCountry() {
  const forced = testCountry();
  if (forced) return forced;
  try {
    const c = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
    if (c && valid(c.country) && Date.now() - c.t < CACHE_DAYS * 864e5) return c.country;
  } catch {}
  const country = await fromIp();
  if (country) try { localStorage.setItem(CACHE_KEY, JSON.stringify({ country, t: Date.now() })); } catch {}
  return country || fromTimezone();
}

// ქვეყნის ენა, თუ მისი თარგმანი გვაქვს, თორემ ინგლისური; თუ ქვეყანა საერთოდ ვერ დადგინდა — ბრაუზერის ენა (თუ გვაქვს), ბოლოს ინგლისური
export async function detectHomeLang() {
  const country = await detectCountry();
  if (country) {
    const lang = COUNTRY_LANG[country];
    return lang && DICTS[lang] ? lang : FALLBACK_LANG;
  }
  const browser = (navigator.languages || [navigator.language]).map(l => (l || '').slice(0, 2).toLowerCase()).find(l => DICTS[l]);
  return browser || FALLBACK_LANG;
}
