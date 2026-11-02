/* აპლიკაციის შესასვლელი წერტილი.
   ყოველი <div data-component="name"> იცვლება კომპონენტით src/components/name/ საქაღალდიდან:
   name.html (მარკაპი) + name.module.css (სტილი) + name.js (ქცევა, ექსპორტი: init(root)).
   კომპონენტს შეუძლია შიგნით სხვა კომპონენტებიც ჩასვას — ისინიც იტვირთება. */
import { initState } from './core/state.js';
import { applyTranslations } from './core/i18n.js';

const base = new URL('./components/', import.meta.url);

const loadCss = href => new Promise(resolve => {
  if (document.querySelector(`link[href="${href}"]`)) return resolve();
  const link = Object.assign(document.createElement('link'), { rel: 'stylesheet', href });
  link.onload = link.onerror = resolve;
  document.head.append(link);
});

// ჩასვამს ყველა კომპონენტს root-ის შიგნით (ჩადგმულებიც). აბრუნებს [ელემენტი, მოდული] წყვილებს init-ისთვის
async function mountAll(root) {
  const mounted = [];
  for (const slot of root.querySelectorAll('[data-component]')) {
    const name = slot.dataset.component;
    const dir = new URL(`${name}/`, base);
    const [html, module] = await Promise.all([
      fetch(new URL(`${name}.html`, dir)).then(r => r.text()),
      import(new URL(`${name}.js`, dir).href),
      loadCss(new URL(`${name}.module.css`, dir).href)
    ]);
    const tpl = document.createElement('template');
    tpl.innerHTML = html.trim();
    const el = tpl.content.firstElementChild;
    slot.replaceWith(tpl.content);
    mounted.push(...await mountAll(el), [el, module]);
  }
  return mounted;
}

async function start() {
  initState();
  const mounted = await mountAll(document.body);
  applyTranslations(document.body);
  for (const [el, module] of mounted) module.init?.(el);   // ჯერ ჩადგმული, მერე მშობელი კომპონენტი
  document.documentElement.classList.add('is-ready');
}

start();
