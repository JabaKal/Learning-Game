/* მთავარი ეკრანის ტექსტი: სათაური, აღწერა, „რას ისწავლი“, „როგორ თამაშობ“ და შენიშვნები.
   სიები იქმნება თარგმანებიდან და ენის შეცვლისას თავიდან იხატება. */
import { on, set, get, chooseLang } from '../../core/state.js';
import { t } from '../../core/i18n.js';
import { LANGUAGES, orderLanguages } from '../../i18n/languages.js';

const ICONS = {
  swords: 'M4 4 L14 14 M20 4 L10 14 M11 17 L17 11 M7 11 L13 17 M15.5 15.5 L19 19 M8.5 15.5 L5 19',
  book: 'M3 5.5 C6 4 9 4 12 6 C15 4 18 4 21 5.5 V19 C18 17.5 15 17.5 12 19.5 C9 17.5 6 17.5 3 19 Z M12 6 V19.5',
  map: 'M4 6.5 L9 4.5 L15 6.5 L20 4.5 V17.5 L15 19.5 L9 17.5 L4 19.5 Z M9 4.5 V17.5 M15 6.5 V19.5',
  globe: 'M12 3 A9 9 0 1 0 12 21 A9 9 0 1 0 12 3 Z M3 12 H21 M12 3 C15 6 15 18 12 21 C9 18 9 6 12 3',
  test: 'M9 4 H15 V7 H9 Z M7 5.5 H5.5 V20.5 H18.5 V5.5 H17 M9 13 L11 15 L15 11',
  offline: 'M7 9 H17 V18 H7 Z M12 9 V6 M12 4.5 V4.6 M10 13 V13.1 M14 13 V13.1 M10 15.8 H14 M5 13 H7 M17 13 H19',
  online: 'M9 11 A3 3 0 1 0 9 5 A3 3 0 1 0 9 11 Z M3.5 20 C3.5 16.5 6 15 9 15 C12 15 14.5 16.5 14.5 20 M16 5.2 A3 3 0 0 1 16 10.8 M17.5 15.2 C19.5 15.8 20.5 17.5 20.5 20'
};
const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONS[name]}" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
const SEP = '<i class="hero__sep" aria-hidden="true"></i>';
const TIP = '<div class="teach-tip" role="status" aria-live="polite"></div>';
const CHEV = '<i class="teach__chev" aria-hidden="true"></i>';

// შესასწავლი ენების დროშები და გეოგრაფიის გლობუსი
const FLAGS = {
  gb: '<rect width="30" height="20" fill="#1f3f8f"/><path d="M0,0 L30,20 M30,0 L0,20" stroke="#fff" stroke-width="4"/><path d="M0,0 L30,20 M30,0 L0,20" stroke="#c8102e" stroke-width="1.5"/><path d="M15,0 V20 M0,10 H30" stroke="#fff" stroke-width="6"/><path d="M15,0 V20 M0,10 H30" stroke="#c8102e" stroke-width="3.4"/>',
  es: '<rect width="30" height="20" fill="#c60b1e"/><rect y="5" width="30" height="10" fill="#ffc400"/>',
  de: '<rect width="30" height="7" fill="#1a1a1a"/><rect y="6.7" width="30" height="6.7" fill="#dd0000"/><rect y="13.3" width="30" height="6.7" fill="#ffce00"/>',
  fr: '<rect width="10" height="20" fill="#1f3f8f"/><rect x="10" width="10" height="20" fill="#fff"/><rect x="20" width="10" height="20" fill="#e1251b"/>'
};
const LANG_FLAGS = ['gb', 'es', 'de', 'fr'];               // hero.subjects-ის რიგით: ინგლისური, ესპანური, გერმანული, ფრანგული
const flag = code => `<span class="hero__flag"><svg viewBox="0 0 30 20" aria-hidden="true">${FLAGS[code]}</svg></span>`;
const GLOBE = '<svg class="hero__globe" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#2f86d6"/><path d="M6 7 C8 5 11 6 10 8 C9 10 11 11 10 13 C9 15 6 14 5.5 11 C5 9.5 5 8 6 7 Z M14 5 C16 5 19 7 19.5 10 C18 11 16 10 15 11 C14 12 15.5 14 14.5 16 C13.5 18 12.5 16.5 12.5 14.5 C12.5 12.5 13 11 12.5 9 C12 7 12.5 5.5 14 5 Z" fill="#5cc46a"/><circle cx="12" cy="12" r="10" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1"/></svg>';

// „რას ისწავლი“ — ერთი მინისებრი კაფსულა: 4 დროშა │ გლობუსი + „გეოგრაფია“. ტელეფონზე მხოლოდ დროშებია,
// კომპიუტერზე — ენების სახელებითაც. მიტანა / დაჭერა — ბუშტი: დროშაზე ქვეყანა და ენა, გეოგრაფიაზე — რას ვასწავლით
const capsule = withNames => {
  const names = t('hero.subjects');
  return `<div class="teach-capsule">${LANG_FLAGS.map((f, i) =>
    `<button type="button" class="teach-capsule__item" data-tip="flag" data-i="${i}" aria-label="${t('hero.flags')[i].country}">${flag(f)}${withNames ? `<span class="teach-capsule__name">${names[i]}</span>` : ''}</button>`).join('')}<i></i>` +
    `<button type="button" class="teach-capsule__item teach-capsule__item--geo" data-tip="geo">${GLOBE}<span class="teach-capsule__name">${t('hero.geographyTitle')}${withNames ? CHEV : ''}</span></button></div>${TIP}`;
};

// ---------- კომპიუტერი: „რას ისწავლი“ — დროებით სამი ვარიანტი ავტორის ასარჩევად ----------
// გადართვა მისამართით: ?teach=capsule (ნაგულისხმევი) | tiles | scroll. არჩევის შემდეგ დანარჩენი ორი წაიშლება.
const VARIANTS = ['capsule', 'tiles', 'scroll'];
const VARIANT = VARIANTS.find(v => v === new URLSearchParams(location.search).get('teach')) || VARIANTS[0];

const TEACH = {
  // 1. კაფსულა — ტელეფონის კაფსულის დესკტოპური ვერსია, სახელებით
  capsule: () => capsule(true),
  // 2. ფილები — ხატულა ზემოთ, სახელი ქვემოთ, როგორც თამაშში საგნის არჩევა; გეოგრაფიის თემები — ბუშტში
  tiles: () => `<div class="teach__row">${t('hero.subjects').map((name, i) => i < LANG_FLAGS.length
    ? `<span class="teach__tile">${flag(LANG_FLAGS[i])}<b>${name}</b></span>`
    : `<button type="button" class="teach__tile teach__tile--geo" data-tip="geo">${GLOBE}<b>${name}${CHEV}</b></button>`).join('')}</div>${TIP}`,
  // 3. პერგამენტი — ღია გრაგნილი ხის კანტით: ენები · გეოგრაფიის თემები · სწავლების ენები (ყველაფერი ჩანს)
  scroll: () => `<div class="scroll">
    <div class="scroll__col"><h3><span class="hero__icon">${icon('book')}</span>${t('hero.foreignLanguages')}</h3>
      <ul>${t('hero.subjects').slice(0, LANG_FLAGS.length).map((n, i) => `<li>${flag(LANG_FLAGS[i])}${n}</li>`).join('')}</ul></div>
    <div class="scroll__col scroll__col--geo"><h3><span class="hero__icon">${icon('map')}</span>${t('hero.geographyTitle')}</h3>
      <ul>${t('hero.geography').map(g => `<li>${g}</li>`).join('')}</ul></div>
    <div class="scroll__foot">${icon('globe')}${LANGUAGES.map(l => `<span lang="${l.code}">${l.name}</span>`).join(SEP)}</div>
  </div>`
};

// სწავლების (ინტერფეისის) ენები — თავისივე დამწერლობით; მიმდინარე ენა გამოყოფილია ოქროს „აბით“ (lang-pill),
// რომელიც ენის შეცვლისას ახალ ენაზე გადასრიალდება (იხ. slidePill)
const PILL = '<i class="lang-pill" aria-hidden="true"></i>';
// ენები ღილაკებია: დაჭერით საიტის ენა იცვლება (იგივე, რაც ზედა ენის ღილაკიდან — chooseLang, არჩევანი ინახება)
const teachLangs = () => PILL + orderLanguages(get('homeLang')).map(l => { const on = l.code === get('lang');
  return `<button type="button" lang="${l.code}" aria-pressed="${on}"${on ? ' class="is-current"' : ''}>${l.name}</button>`; }).join(SEP);
const label = (ic, key) => `<div class="teach__label">${icon(ic)}<span>${t(key)}</span></div>`;

const LISTS = {
  // ტელეფონზე — სათაური „რას ვასწავლით“ (იგივე სტილი, რაც „რა ენაზე ვასწავლით“ ველს) და კაფსულა
  mobileTeach: () => `<div class="lang-field__label teach-capsule__label">${icon('book')}<span>${t('hero.teachLabel')}</span></div>` + capsule(false),
  // ტელეფონზე — მინისებრი ველი „რა ენაზე ვასწავლით“: ოქროს სათაური და 8 ენა
  mobileLangs: () => `<div class="lang-field"><div class="lang-field__label">${icon('globe')}<span>${t('hero.teachInLabel')}</span></div>` +
    `<div class="lang-field__list">${teachLangs()}</div></div>`,
  // კაფსულა / ფილები: „რას ვასწავლით“ (საგნები) და „რა ენაზე ვასწავლით“ (8 სწავლების ენა); პერგამენტს ორივე თავისით აქვს
  teach: () => VARIANT === 'scroll' ? TEACH.scroll() :
    label('book', 'hero.teachLabel') + `<div class="teach__main">${TEACH[VARIANT]()}</div>` +
    label('globe', 'hero.teachInLabel') + `<div class="teach__langs">${teachLangs()}</div>`,
  modesLabel: () => label('swords', 'hero.modesLabel'),   // „როგორ ითამაშებ“ — იმავე სტილის სათაური, რაც „რას ვასწავლით“
  // რეჟიმი: კომპიუტერზე — ბარათი (ოქროს ხატულა, სათაური, აღწერა), ტელეფონზე — ბეჯი (ხატულა და სათაური)
  modes: () => t('hero.modes').map((m, i) =>
    `<span class="hero__mode"><span class="hero__mode-icon">${icon(m.icon)}</span><span class="hero__mode-text">` +
    `<b class="hero__mode-title">${t('hero.modesShort')[i]}</b><small class="hero__mode-desc">${t('hero.modesDesc')[i]}</small></span></span>`).join(''),
  chips: () => t('hero.chips').map(c => `<span class="hero__chip"><b aria-hidden="true">✓</b>${c}</span>`).join('')
};

export function init(root) {
  root.querySelector('.teach').classList.add(`teach--${VARIANT}`);
  // ტელეფონზე სცენა ტექსტის ქვეშ იწყება — ვაქვეყნებთ ტექსტის ბლოკის ქვედა კიდეს (state 'heroBottom', scene უსმენს).
  // 8px-ის სიზუსტით, რომ წვრილმანმა ცვლილებამ სცენა თავიდან არ დაახატვინოს
  const inner = root.querySelector('.hero__inner');
  const publish = () => set('heroBottom', Math.ceil(inner.getBoundingClientRect().bottom / 8) * 8);
  const pills = (animate) => root.querySelectorAll('.lang-pill').forEach(p => slidePill(p, animate));
  let before = null;                                   // ადგილები ენის შეცვლამდე (FLIP)
  on('langChanging', () => { before = snapshot(inner); });
  on('lang', () => {
    root.querySelectorAll('[data-list]').forEach(el => { el.innerHTML = LISTS[el.dataset.list](); });
    pills(true);
    if (before) { flip(inner, before); before = null; }
    publish();
  });
  addEventListener('resize', () => { publish(); pills(false); });
  document.fonts?.ready.then(() => { publish(); pills(false); });   // შრიფტის ჩატვირთვის შემდეგ ტექსტის ზომა იცვლება
  root.querySelectorAll('[data-tips]').forEach(initTips);
  root.addEventListener('click', e => {
    const btn = e.target.closest('.teach__langs [lang], .lang-field__list [lang]');
    if (btn) chooseLang(btn.lang);
  });
}

// ---------- ენის შეცვლის ანიმაცია (FLIP) ----------
// სხვა ენაზე ტექსტის სიგრძე იცვლება — ბლოკები ზემოთ/ქვემოთ გადაინაცვლებს, ხაზი შეიძლება ორად გაიყოს.
// შეცვლამდე ვიმახსოვრებთ ყოველი ბლოკისა და მისი ელემენტების ადგილს, შეცვლის შემდეგ კი ძველი ადგილიდან ახალზე ვასრიალებთ (.3 წმ);
// ახალი ტექსტი რბილად ჩნდება. ელემენტები ბლოკის მიმართ ინაცვლებს (ბლოკის მოძრაობა ორჯერ რომ არ დაითვალოს)
const FLIP_ITEMS = '.hero__mode, .hero__chip, .teach-capsule__item, .teach__label';
const FLIP = { duration: 300, easing: 'cubic-bezier(.4, 0, .2, 1)' };
const visible = el => el.getClientRects().length > 0;
function snapshot(inner) {
  const map = new Map();
  [...inner.children].forEach((b, bi) => {
    if (!visible(b)) return;
    map.set(`${bi}`, b.getBoundingClientRect());
    b.querySelectorAll(FLIP_ITEMS).forEach((it, ii) => visible(it) && map.set(`${bi}:${ii}`, it.getBoundingClientRect()));
  });
  return map;
}
function flip(inner, before) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  [...inner.children].forEach((b, bi) => {
    const o = before.get(`${bi}`);
    if (!o || !visible(b)) return;
    const r = b.getBoundingClientRect(), dx = o.left - r.left, dy = o.top - r.top;
    b.animate([{ transform: `translate(${dx}px, ${dy}px)`, opacity: .45 }, { transform: 'none', opacity: 1 }], FLIP);
    b.querySelectorAll(FLIP_ITEMS).forEach((it, ii) => {
      const io = before.get(`${bi}:${ii}`);
      if (!io || !visible(it)) return;
      const ir = it.getBoundingClientRect(), ix = io.left - ir.left - dx, iy = io.top - ir.top - dy;
      if (Math.abs(ix) > .5 || Math.abs(iy) > .5) it.animate([{ transform: `translate(${ix}px, ${iy}px)` }, { transform: 'none' }], FLIP);
    });
  });
}

// ოქროს „აბი“ მიმდინარე ენის უკან: ენის შეცვლისას ძველი ენიდან ახალზე გადასრიალდება (.3 წმ, CSS transition),
// ტექსტის ფერიც რბილად გადადის. სია ენის შეცვლისას თავიდან იხატება, ამიტომ ძველი ადგილი ცალკე ინახება (pillState)
const pillState = new Map();
function slidePill(pill, animate) {
  const box = pill.parentElement, key = box.className || box.parentElement.className, code = get('lang');
  const cur = box.querySelector(`[lang="${code}"]`);
  if (!cur) return;
  const rect = el => ({ x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight });
  const place = p => Object.assign(pill.style, { transform: `translate(${p.x}px,${p.y}px)`, width: `${p.w}px`, height: `${p.h}px` });
  const prev = pillState.get(key), from = animate && prev !== code && box.querySelector(`[lang="${prev}"]`);
  pillState.set(key, code);
  pill.style.transition = 'none';
  if (!from) return place(rect(cur));
  // ჯერ ძველ ადგილას (ძველი ენა გამოყოფილი), შემდეგ კადრში — ახალზე: აბი სრიალებს, ფერები რბილად იცვლება
  cur.classList.remove('is-current'); from.classList.add('is-current');
  place(rect(from));
  pill.getBoundingClientRect();
  pill.style.transition = '';
  requestAnimationFrame(() => { from.classList.remove('is-current'); cur.classList.add('is-current'); place(rect(cur)); });
}

// ბუშტის შინაარსი: დროშა — ქვეყანა და ენა; გეოგრაფია — რას ვასწავლით
const tipHtml = item => {
  if (item.dataset.tip === 'flag') {
    const f = t('hero.flags')[item.dataset.i];
    return `<b>${f.country}</b><span>${f.language}</span>`;
  }
  return `<b>${t('hero.geographyLabel')}:</b><span>${t('hero.geography').join(' · ')}</span>`;
};

// ბუშტი კონტეინერის ქვეშ; ისარი მიუთითებს ელემენტზე. კომპიუტერზე მაუსის მიტანაც ხსნის, დაჭერა „ამაგრებს“;
// იგივეზე ან სხვაგან დაჭერა ხურავს
function initTips(box) {
  let current = null, pinned = false;
  const hide = () => {
    box.querySelector('.teach-tip')?.classList.remove('teach-tip--open');
    current?.classList.remove('is-active');
    current = null; pinned = false;
  };
  const show = item => {
    hide();
    const tip = box.querySelector('.teach-tip');
    tip.innerHTML = tipHtml(item);
    // ბუშტი ელემენტის ქვეშ, ეკრანის კიდეებს არ სცდება; ისარი ზუსტად ელემენტზე მიუთითებს
    const b = box.getBoundingClientRect(), r = item.getBoundingClientRect(), cx = r.left + r.width / 2;
    const half = tip.offsetWidth / 2, x = Math.min(innerWidth - 12 - half, Math.max(12 + half, cx));
    tip.style.left = `${x - b.left}px`;
    tip.style.setProperty('--arrow', `${cx - (x - half)}px`);
    tip.classList.add('teach-tip--open');
    item.classList.add('is-active');
    current = item;
  };
  box.addEventListener('click', e => {
    const item = e.target.closest('[data-tip]');
    if (!item) return;
    e.stopPropagation();
    if (item === current && pinned) return hide();
    show(item);
    pinned = true;
  });
  if (matchMedia('(hover: hover)').matches) {
    box.addEventListener('mouseover', e => {
      const item = e.target.closest('[data-tip]');
      if (item && item !== current && !pinned) show(item);
    });
    box.addEventListener('mouseout', e => {
      const item = e.target.closest('[data-tip]');
      if (item && item === current && !pinned && !item.contains(e.relatedTarget)) hide();
    });
  }
  document.addEventListener('click', hide);
  on('lang', hide);
}
