/* თარგმანები.
   მარკაპში: data-i18n="hero.title" — ტექსტი; data-i18n-html="..." — ტექსტი HTML-ით (მაგ. <strong>);
   data-i18n-attr="aria-label:header.login" — ატრიბუტი. JS-ში: t('hero.title').
   თუ არჩეულ ენაზე თარგმანი ჯერ არ არის, გამოიყენება ქართული. */
import { get, on } from './state.js';
import { DEFAULT_LANG } from '../i18n/languages.js';
import ka from '../i18n/ka.js';

const DICTS = { ka };           // ახალი ენა: src/i18n/<code>.js ფაილი + აქ დამატება

const lookup = (dict, key) => key.split('.').reduce((o, k) => o?.[k], dict);

export const t = key => lookup(DICTS[get('lang')], key) ?? lookup(DICTS[DEFAULT_LANG], key) ?? key;

export function applyTranslations(root) {
  root.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  root.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
  root.querySelectorAll('[data-i18n-attr]').forEach(el => {
    for (const pair of el.dataset.i18nAttr.split(';')) {
      const [attr, key] = pair.split(':');
      el.setAttribute(attr.trim(), t(key.trim()));
    }
  });
}

// ენის შეცვლისას მთელი გვერდი თავიდან ითარგმნება
on('lang', () => applyTranslations(document.body));
