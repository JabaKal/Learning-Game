/* ენის შეცვლა: ღილაკი ხსნის სიას, ენის არჩევა ცვლის საერთო მდგომარეობას (state 'lang'),
   რის შემდეგაც მთელი გვერდი ითარგმნება (core/i18n.js). */
import { on, set } from '../../core/state.js';
import { LANGUAGES } from '../../i18n/languages.js';

const CHECK = '<svg class="lang__check" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5 L6.5 12 L13 4.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

export function init(root) {
  const btn = root.querySelector('.lang__btn');
  const menu = root.querySelector('.lang__menu');
  const list = root.querySelector('.lang__list');

  list.innerHTML = LANGUAGES.map((l, i) =>
    `<button type="button" role="menuitem" class="lang__item" data-code="${l.code}" style="--i:${i}"><small>${l.short}</small><span>${l.name}</span>${CHECK}</button>`).join('');
  const items = [...list.children];

  on('lang', code => {
    const lang = LANGUAGES.find(l => l.code === code);
    root.querySelectorAll('.lang__code').forEach(el => { el.textContent = lang.short; });
    items.forEach(b => b.classList.toggle('lang__item--on', b.dataset.code === code));
  });

  // დახურული სია ღილაკის ზომისაა — გახსნისას იქიდან „იზრდება“
  const syncSize = () => {
    const r = btn.getBoundingClientRect();
    menu.style.setProperty('--bw', `${r.width}px`);
    menu.style.setProperty('--bh', `${r.height}px`);
  };
  const toggle = open => {
    syncSize();
    menu.classList.toggle('lang__menu--open', open);
    btn.setAttribute('aria-expanded', open);
  };

  syncSize();
  addEventListener('resize', syncSize);
  // ღილაკზე მეორედ დაჭერა კეცავს სიას (ტელეფონზე სიის ზედა ზოლი არ ჩანს)
  btn.addEventListener('click', e => { e.stopPropagation(); toggle(!menu.classList.contains('lang__menu--open')); });
  menu.addEventListener('click', e => {
    e.stopPropagation();
    const item = e.target.closest('[data-code]');
    toggle(false);                                   // ენის არჩევა ან ზედა ზოლზე დაჭერა კეცავს სიას
    if (!item) return;
    // ✓ მაშინვე გადადის არჩეულ ენაზე; თავად ენა იცვლება დაკეცვის ანიმაციის შემდეგ, რომ გვერდის თარგმნამ ანიმაცია არ გააჭედოს
    items.forEach(b => b.classList.toggle('lang__item--on', b === item));
    setTimeout(() => set('lang', item.dataset.code), 280);
  });
  document.addEventListener('click', () => toggle(false));
  addEventListener('keydown', e => { if (e.key === 'Escape') toggle(false); });
}
