/* საერთო მდგომარეობა და მოვლენები.
   set(key, value) — ცვლის მნიშვნელობას და აცნობებს გამომწერებს;
   on(key, fn) — გამოწერა (fn მაშინვე იძახება მიმდინარე მნიშვნელობით, თუ ის უკვე არსებობს). */
import { DEFAULT_LANG, LANGUAGES } from '../i18n/languages.js';

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

// ენა ინახება ბრაუზერში (მომხმარებლის ანგარიშის შექმნის შემდეგ — ბაზაშიც, users.interface_lang)
export function initState() {
  let lang = DEFAULT_LANG;
  try {
    const saved = (localStorage.getItem('lang') || '').toLowerCase();
    if (LANGUAGES.some(l => l.code === saved)) lang = saved;
  } catch {}
  set('lang', lang);
  on('lang', code => {
    document.documentElement.lang = code;
    try { localStorage.setItem('lang', code); } catch {}
  });
}
