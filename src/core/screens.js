/* ეკრანები: მთავარი გვერდი (home) და თამაში (game).
   „დაიწყე“ → თამაში გვერდიდან (მარჯვნიდან) შემოსრიალდება, მთავარი გვერდი ოდნავ მარცხნივ გადაიწევს და ჩაბნელდება
   (როგორც ტელეფონის აპლიკაციებში); „მთავარი“ / ბრაუზერის „უკან“ — პირიქით.
   html[data-screen] — რომელი ეკრანი ჩანს; html[data-switch] — გადასვლის დროს (ანიმაცია — game.module.css, base.css):
   ჯერ ორი კადრი „prep-*“ (ორივე ეკრანი ცალკე შრედ მზადდება), მერე „in|out“.
   ⚡ სიჩქარე: მხოლოდ ორი შრე სრიალებს (2D, ბრაუზერისთვის იაფია); მთავარი გვერდის ანიმაციები სრიალამდე ჩერდება.
   (წიგნის ფურცლის 3D ეფექტი ვცადეთ — ჭედავდა, ავტორმა უარყო.) არ დაწერო CSS წესი, რომელიც მთავარი გვერდის ყველა ელემენტს
   ეხება (.landing * და მისთ.) — ბრაუზერი ყველას სტილს თავიდან გადაითვლის; ანიმაციებს აქ ვაჩერებთ JS-ით.
   თამაშის მისამართია #play — გაზიარებული ბმული პირდაპირ თამაშს ხსნის. state 'screen' — სხვა კომპონენტებისთვის (game) */
import { get, set } from './state.js';

const SWITCH_MS = { in: 550, out: 450 };                 // = game.module.css / base.css-ის ანიმაციების ხანგრძლივობა
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const html = document.documentElement;
let timer = null, token = 0, frozen = null;

// მთავარი გვერდის ანიმაციები (ალი, დროშები, ნაპერწკლები...) ჩერდება, როცა თამაშის ქვეშაა; დაბრუნებისას გრძელდება.
// თამაშის ანიმაციები CSS-შია მიბმული html[data-screen="game"]-ზე (game.module.css) — იქ ცოტა ელემენტია
function freeze(landing) {
  if (!landing || frozen) return;
  frozen = landing.getAnimations({ subtree: true }).filter(a => a.playState === 'running');
  frozen.forEach(a => a.pause());
}
function thaw() {
  frozen?.forEach(a => a.play());
  frozen = null;
}

// კლავიატურით / ეკრანის წამკითხველით — მხოლოდ ხილული ეკრანი. ფონის ნახატი (.scene) ისედაც დაუჭერელია — მას არ ვეხებით
function setInert(landing, game, name) {
  for (const el of landing?.children || []) if (!el.classList.contains('scene')) el.toggleAttribute('inert', name === 'game');
  game?.toggleAttribute('inert', name !== 'game');
}

function show(name, animate) {
  if (get('screen') === name) return;
  clearTimeout(timer);
  const my = ++token, dir = name === 'game' ? 'in' : 'out';
  const landing = document.querySelector('.landing'), game = document.querySelector('.game');
  const finish = () => {
    if (my !== token) return;
    delete html.dataset.switch;
    setInert(landing, game, name);
    if (name === 'home') thaw();                         // მთავარი გვერდი ადგილზე დადგა — ისევ ცოცხლდება
  };
  if (name === 'game') freeze(landing);                  // სრიალის წინ — რომ მოძრავ შრეს ყოველ კადრზე თავიდან ხატვა არ დასჭირდეს
  html.dataset.screen = name;
  set('screen', name);
  if (!animate || reduced.matches) return finish();
  html.dataset.switch = `prep-${dir}`;
  const go = () => {
    if (my !== token || html.dataset.switch !== `prep-${dir}`) return;
    html.dataset.switch = dir;
    timer = setTimeout(finish, SWITCH_MS[dir]);
  };
  requestAnimationFrame(() => requestAnimationFrame(go));
  setTimeout(go, 80);              // თუ კადრი არ მოვიდა (მაგ. ფონურ ჩანართში) — გადასვლა მაინც არ უნდა გაიჭედოს
}

export function openGame() {
  if (get('screen') === 'game') return;
  history.pushState({ screen: 'game' }, '', '#play');
  show('game', true);
}

export function openHome() {
  if (get('screen') !== 'game') return;
  if (history.state?.screen === 'game') history.back();   // popstate დახურავს — „უკან“ ღილაკიც იმავეს აკეთებს
  else { history.replaceState(null, '', location.pathname + location.search); show('home', true); }
}

export function initScreens() {
  show(location.hash === '#play' ? 'game' : 'home', false);
  addEventListener('popstate', () => show(location.hash === '#play' ? 'game' : 'home', true));
}
