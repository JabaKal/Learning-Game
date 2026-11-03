/* აპლიკაციის შესასვლელი წერტილი.
   ყოველი <div data-component="name"> იცვლება კომპონენტით src/components/name/ საქაღალდიდან:
   name.html (მარკაპი) + name.module.css (სტილი) + name.js (ქცევა, ექსპორტი: init(root)).
   კომპონენტს შეუძლია შიგნით სხვა კომპონენტებიც ჩასვას — ისინიც იტვირთება. */
import { initState, on } from './core/state.js';
import { applyTranslations } from './core/i18n.js';
import { initScreens } from './core/screens.js';

const base = new URL('./components/', import.meta.url);

const loadCss = href => new Promise(resolve => {
  if (document.querySelector(`link[href="${href}"]`)) return resolve();
  const link = Object.assign(document.createElement('link'), { rel: 'stylesheet', href });
  link.onload = link.onerror = resolve;
  document.head.append(link);
});

// VS Code-ის Live Server ყოველ HTML ფაილში (კომპონენტებშიც) ჩასვამს თავის გადატვირთვის სკრიპტს და პასუხს
// ძველი სიგრძით ჭრის. ამიტომ ყოველი კომპონენტი მთავრდება </body>-ით: სკრიპტი ჯდება ბოლოს, მის წინ კი
// კომპონენტი უცვლელია — აქ ვჭრით ყველაფერს ნიშნიდან ბოლომდე (მთავარ გვერდზე სკრიპტი რჩება და მუშაობს)
const stripLiveServer = html => html.split('<!-- Code injected by live-server -->')[0];

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
    tpl.innerHTML = stripLiveServer(html).trim();
    const el = tpl.content.firstElementChild;
    slot.replaceWith(tpl.content);
    mounted.push(...await mountAll(el), [el, module]);
  }
  return mounted;
}

async function start() {
  await initState();                                   // ენა (IP-ით, პირველ ვიზიტზე ≤ 1.5 წმ) — გვერდი მანამდე დამალულია
  const mounted = await mountAll(document.body);
  applyTranslations(document.body);
  for (const [el, module] of mounted) module.init?.(el);   // ჯერ ჩადგმული, მერე მშობელი კომპონენტი
  initScreens();                                       // მთავარი გვერდი ან თამაში (მისამართით #play)
  // გვერდი ჩნდება ერთად, როცა ფონის ნახატი დაიხატა და შრიფტები ჩაიტვირთა — რომ ფონი, ტექსტი და ღილაკი ცალ-ცალკე არ „ხტოდეს“.
  // ნელ ინტერნეტზე — არაუმეტეს 4 წამისა
  const sceneReady = new Promise(resolve => on('sceneReady', ready => ready && resolve()));
  await Promise.race([Promise.all([sceneReady, document.fonts?.ready]), new Promise(r => setTimeout(r, 4000))]);
  requestAnimationFrame(() => document.documentElement.classList.add('is-ready'));
}

start();

// აპად დაყენება (PWA) და ოფლაინ რეჟიმი გამორთულია — ჯერ მხოლოდ ბრაუზერი (ავტორის გადაწყვეტილება, 2026-11-03).
// ადრე დაყენებული service worker და მისი ქეში იშლება, რომ ბრაუზერი ტყუილად რესურსს არ ხარჯავდეს
navigator.serviceWorker?.getRegistrations().then(list => list.forEach(r => r.unregister())).catch(() => {});
globalThis.caches?.keys().then(keys => keys.forEach(k => caches.delete(k))).catch(() => {});
