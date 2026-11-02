/* საერთო მდგომარეობა და მოვლენები.
   set(key, value) — ცვლის მნიშვნელობას და აცნობებს გამომწერებს;
   on(key, fn) — გამოწერა (fn მაშინვე იძახება მიმდინარე მნიშვნელობით, თუ ის უკვე არსებობს). */
import { LANGUAGES } from '../i18n/languages.js';
import { detectHomeLang, testCountry } from './geo.js';
import { getPref, setPref } from './prefs.js';

const values = {};
const listeners = {};

export const get = key => values[key];

export function set(key, value) {
  if (values[key] === value) return;
  values[key] = value;
  (listeners[key] || []).forEach(fn => fn(value));
}

export function on(key, fn) {
  (listeners[key] ||= []).push(fn);
  if (key in values) fn(values[key]);
  return () => { listeners[key] = listeners[key].filter(f => f !== fn); };
}

// ენა: თუ სტუმარმა თვითონ აირჩია — ის (prefs.js — ინახება ბრაუზერში და შემდეგ ვიზიტზეც დახვდება).
// სხვაგვარად — „სახლის“ ენა IP-ით (geo.js): მისი ქვეყნის ენა, თუ თარგმანი გვაქვს, თორემ ინგლისური.
// homeLang — ეს ენა სიებში პირველია. ?country=XX-ით (ტესტი) შენახული არჩევანი იგნორირდება — ახალი სტუმარივით
export async function initState() {
  const home = await detectHomeLang();
  const saved = String(getPref('lang') || '').toLowerCase();
  const chosen = !testCountry() && LANGUAGES.some(l => l.code === saved) ? saved : null;
  set('homeLang', home);
  set('lang', chosen || home);
  on('lang', code => { document.documentElement.lang = code; });
}

// სტუმრის საკუთარი არჩევანი (ენის ღილაკიდან) — ინახება და შემდეგ ვიზიტზეც ის დახვდება.
// შეცვლამდე — 'langChanging': კომპონენტები იმახსოვრებენ ელემენტების ადგილს, რომ ახალ ადგილზე ანიმაციით გადავიდნენ (hero.js)
export function chooseLang(code) {
  setPref('lang', code);
  if (code === get('lang')) return;
  set('langChanging', { code });
  set('lang', code);
}
