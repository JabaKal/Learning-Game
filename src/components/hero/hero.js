/* მთავარი ეკრანის ტექსტი: სათაური, აღწერა, ბარათი „რას ვასწავლით“ და შენიშვნები.
   სიები (საგნები, გეოგრაფია, რეჟიმები, ენები) იქმნება თარგმანებიდან და ენის შეცვლისას თავიდან იხატება. */
import { on } from '../../core/state.js';
import { t } from '../../core/i18n.js';
import { LANGUAGES } from '../../i18n/languages.js';

const ICONS = {
  book: 'M3 5.5 C6 4 9 4 12 6 C15 4 18 4 21 5.5 V19 C18 17.5 15 17.5 12 19.5 C9 17.5 6 17.5 3 19 Z M12 6 V19.5',
  map: 'M4 6.5 L9 4.5 L15 6.5 L20 4.5 V17.5 L15 19.5 L9 17.5 L4 19.5 Z M9 4.5 V17.5 M15 6.5 V19.5',
  globe: 'M12 3 A9 9 0 1 0 12 21 A9 9 0 1 0 12 3 Z M3 12 H21 M12 3 C15 6 15 18 12 21 C9 18 9 6 12 3',
  swords: 'M4 4 L14 14 M20 4 L10 14 M11 17 L17 11 M7 11 L13 17 M15.5 15.5 L19 19 M8.5 15.5 L5 19',
  test: 'M9 4 H15 V7 H9 Z M7 5.5 H5.5 V20.5 H18.5 V5.5 H17 M9 13 L11 15 L15 11',
  offline: 'M7 9 H17 V18 H7 Z M12 9 V6 M12 4.5 V4.6 M10 13 V13.1 M14 13 V13.1 M10 15.8 H14 M5 13 H7 M17 13 H19',
  online: 'M9 11 A3 3 0 1 0 9 5 A3 3 0 1 0 9 11 Z M3.5 20 C3.5 16.5 6 15 9 15 C12 15 14.5 16.5 14.5 20 M16 5.2 A3 3 0 0 1 16 10.8 M17.5 15.2 C19.5 15.8 20.5 17.5 20.5 20'
};
const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONS[name]}" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
const SEP = '<i class="hero__sep" aria-hidden="true"></i>';

// შესასწავლი ენების დროშები და გეოგრაფიის გლობუსი (ტელეფონის კაფსულისთვის)
const FLAGS = {
  gb: '<rect width="30" height="20" fill="#1f3f8f"/><path d="M0,0 L30,20 M30,0 L0,20" stroke="#fff" stroke-width="4"/><path d="M0,0 L30,20 M30,0 L0,20" stroke="#c8102e" stroke-width="1.5"/><path d="M15,0 V20 M0,10 H30" stroke="#fff" stroke-width="6"/><path d="M15,0 V20 M0,10 H30" stroke="#c8102e" stroke-width="3.4"/>',
  es: '<rect width="30" height="20" fill="#c60b1e"/><rect y="5" width="30" height="10" fill="#ffc400"/>',
  de: '<rect width="30" height="7" fill="#1a1a1a"/><rect y="6.7" width="30" height="6.7" fill="#dd0000"/><rect y="13.3" width="30" height="6.7" fill="#ffce00"/>',
  fr: '<rect width="10" height="20" fill="#1f3f8f"/><rect x="10" width="10" height="20" fill="#fff"/><rect x="20" width="10" height="20" fill="#e1251b"/>'
};
const LANG_FLAGS = ['gb', 'es', 'de', 'fr'];               // hero.subjects-ის რიგით: ინგლისური, ესპანური, გერმანული, ფრანგული
const flag = code => `<span class="hero__flag"><svg viewBox="0 0 30 20" aria-hidden="true">${FLAGS[code]}</svg></span>`;
const GLOBE = '<svg class="hero__globe" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#2f86d6"/><path d="M6 7 C8 5 11 6 10 8 C9 10 11 11 10 13 C9 15 6 14 5.5 11 C5 9.5 5 8 6 7 Z M14 5 C16 5 19 7 19.5 10 C18 11 16 10 15 11 C14 12 15.5 14 14.5 16 C13.5 18 12.5 16.5 12.5 14.5 C12.5 12.5 13 11 12.5 9 C12 7 12.5 5.5 14 5 Z" fill="#5cc46a"/><circle cx="12" cy="12" r="10" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1"/></svg>';

// ტელეფონზე „რას ვასწავლით“ — ერთი მინისებრი კაფსულა: 4 დროშა │ გლობუსი + „გეოგრაფია“.
// დაჭერისას ქვემოთ ჩნდება ბუშტი: დროშაზე — ქვეყანა და ენა, გეოგრაფიაზე — რას ვასწავლით
const capsule = () => `<div class="teach-capsule">${LANG_FLAGS.map((f, i) =>
  `<button type="button" class="teach-capsule__item" data-tip="flag" data-i="${i}" aria-label="${t('hero.flags')[i].country}">${flag(f)}</button>`).join('')}<i></i>` +
  `<button type="button" class="teach-capsule__item teach-capsule__item--geo" data-tip="geo">${GLOBE}<span>${t('hero.geographyTitle')}</span></button></div>` +
  '<div class="teach-tip" role="status" aria-live="polite"></div>';

const LISTS = {
  subjects: () => t('hero.subjects').map(s => `<span class="hero__pill">${s}</span>`).join(''),
  geography: () => t('hero.geography').map(s => `<span>${s}</span>`).join(SEP),
  modes: () => t('hero.modes').map((m, i) =>
    `<span class="hero__mode">${icon(m.icon)}<span class="hero__mode-long">${m.text}</span><span class="hero__mode-short">${t('hero.modesShort')[i]}</span></span>`).join(''),
  languages: () => LANGUAGES.map(l => `<span lang="${l.code}">${l.name}</span>`).join(SEP),
  chips: () => t('hero.chips').map(c => `<span class="hero__chip"><b aria-hidden="true">✓</b>${c}</span>`).join(''),
  mobileTeach: capsule
};

export function init(root) {
  root.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = icon(el.dataset.icon); });
  on('lang', () => {
    root.querySelectorAll('[data-list]').forEach(el => { el.innerHTML = LISTS[el.dataset.list](); });
  });
  initCapsuleTips(root);
}

// ბუშტი კაფსულის ქვეშ; ისარი მიუთითებს დაჭერილ ელემენტზე. იგივეზე ან სხვაგან დაჭერა ხურავს
function initCapsuleTips(root) {
  const box = root.querySelector('.hero__mobile-teach');
  let current = null;
  const hide = () => { box.querySelector('.teach-tip')?.classList.remove('teach-tip--open'); current?.classList.remove('is-active'); current = null; };
  box.addEventListener('click', e => {
    const item = e.target.closest('[data-tip]');
    if (!item) return;
    e.stopPropagation();
    if (item === current) return hide();
    hide();
    const tip = box.querySelector('.teach-tip');
    if (item.dataset.tip === 'flag') {
      const f = t('hero.flags')[item.dataset.i];
      tip.innerHTML = `<b>${f.country}</b><span>${f.language}</span>`;
    } else {
      tip.innerHTML = `<b>${t('hero.geographyLabel')}:</b><span>${t('hero.geography').join(' · ')}</span>`;
    }
    // ბუშტი დაჭერილი ელემენტის ქვეშ, ეკრანის კიდეებს არ სცდება; ისარი ზუსტად ელემენტზე მიუთითებს
    const b = box.getBoundingClientRect(), r = item.getBoundingClientRect(), cx = r.left + r.width / 2;
    const half = tip.offsetWidth / 2, x = Math.min(innerWidth - 12 - half, Math.max(12 + half, cx));
    tip.style.left = `${x - b.left}px`;
    tip.style.setProperty('--arrow', `${cx - (x - half)}px`);
    tip.classList.add('teach-tip--open');
    item.classList.add('is-active');
    current = item;
  });
  document.addEventListener('click', hide);
  on('lang', hide);
}
