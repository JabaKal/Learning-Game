/* თამაში (ჯერ არასრული): სამეფოს რუკა, ზედა ზოლი (დღე / ღამე, ოქრო, სტუმარი), ქვედა მენიუ (მხოლოდ კომპიუტერზე).
   მთავარ გვერდზე დასაბრუნებელი ღილაკი არ არის (ავტორის გადაწყვეტილება) — ბრაუზერის „უკან“ ბრუნდება (core/screens.js).
   ღამე: რუკა ბნელდება, ინთება ჩირაღდნები და ფანჯრები (kingdom-map.js — drawLights), ჩნდება მთვარე; არჩევანი ბრაუზერში ინახება.
   ჩანს მაშინ, როცა state 'screen' = 'game' (იხ. core/screens.js — „დაიწყე“-ზე თამაში გვერდიდან შემოსრიალდება).
   რუკა ერთ ეკრანზეა — სქროლის, გადათრევისა და მასშტაბის გარეშე. ორი განლაგება იგივე ადგილებით (kingdom-map.js):
   ჰორიზონტალურ ეკრანზე (კომპიუტერი) — wide, ვერტიკალურზე (ტელეფონი) — tall; ტელეფონზე ქვედა მენიუ არ არის (ავტორის გადაწყვეტილება).
   ყველა ადგილი (focus) ეტევა ზოლებს შორის, დანარჩენს ბუნება ავსებს. მიწა და ტყე — სურათი (canvas), შენობები — SVG ზემოდან.
   მუშაობს: გეოგრაფია / „სწავლა“ (მენიუ) → დროშების ტესტი (quick-quiz), პროფილი. „ენები“ და დანარჩენი — „მალე“; ჩაძირული გემები — მხოლოდ ნახატი.
   ოქრო ბრაუზერში არ ინახება (წესი: ოქრო და რესურსები — მხოლოდ სერვერზე); აქ ჩანს მხოლოდ ამ ვიზიტში მოპოვებული (state 'gold') */
import { on, set } from '../../core/state.js';
import { t } from '../../core/i18n.js';
import { getPref, setPref } from '../../core/prefs.js';
import { drawGround, drawOverlay, drawLights, LAYOUTS, NO_LABEL } from './kingdom-map.js';

const MAX_PIXELS = 8e6;            // მიწის სურათის ზედა ზღვარი (≈32 MB) — დიდ ეკრანზე სიმკვეთრე ოდნავ იკლებს, მეხსიერება არა

export function init(root) {
  const view = root.querySelector('.game__view'), ground = root.querySelector('.game__ground'), map = root.querySelector('.game__map');
  const lights = root.querySelector('.game__lights'), mode = root.querySelector('.game__mode');
  const toast = root.querySelector('.game__toast'), nav = root.querySelector('.game__nav');
  let drawn = false, layout = null, k = 0, toastTimer = null, groundTimer = null;

  // მიწის ფენა: ხილული ნაწილი იხატება ეკრანის ზომის სურათად (მკვეთრად, ეკრანის სიმკვრივით)
  const paintGround = area => {
    const w = view.clientWidth, h = view.clientHeight, dpr = Math.min(devicePixelRatio || 1, Math.sqrt(MAX_PIXELS / (w * h)));
    const cw = Math.round(w * dpr), ch = Math.round(h * dpr), L = layout;
    const image = new Image();
    image.onload = () => {
      if (L !== layout) return;                        // ამასობაში განლაგება შეიცვალა
      ground.width = cw; ground.height = ch;
      ground.getContext('2d').drawImage(image, 0, 0, cw, ch);
      URL.revokeObjectURL(image.src);
    };
    image.src = URL.createObjectURL(new Blob([`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${area.x} ${area.y} ${area.w} ${area.h}" width="${cw}" height="${ch}" preserveAspectRatio="none">${drawGround('kg', area, L)}</svg>`], { type: 'image/svg+xml' }));
  };

  // განლაგება ეკრანის ფორმით; focus მთლიანად ეტევა ზედა ზოლსა და ქვედა მენიუს (ტელეფონზე — ეკრანის ქვედა კიდეს) შორის, შუაში
  const fit = () => {
    const w = view.clientWidth, h = view.clientHeight;
    if (!w || !h) return;
    const next = LAYOUTS[w / h < 1 ? 'tall' : 'wide'];
    root.classList.toggle('game--tall', next === LAYOUTS.tall);
    if (next !== layout) { layout = next; map.innerHTML = drawOverlay('km', layout); lights.innerHTML = drawLights('kl', layout); ground.width = 0; }
    const F = layout.focus, top = root.querySelector('.game__bar').offsetHeight + 4;
    const bottom = getComputedStyle(nav).display === 'none' ? 10 : h - nav.getBoundingClientRect().top + 10;
    const room = h - top - bottom;
    k = Math.min((w - 16) / F.w, room / F.h);
    const area = { x: F.x + F.w / 2 - w / 2 / k, y: F.y + F.h / 2 - (top + room / 2) / k, w: w / k, h: h / k };
    const box = `${area.x.toFixed(1)} ${area.y.toFixed(1)} ${area.w.toFixed(1)} ${area.h.toFixed(1)}`;
    map.setAttribute('viewBox', box);
    lights.setAttribute('viewBox', box);
    labels();
    clearTimeout(groundTimer);
    groundTimer = setTimeout(() => paintGround(area), ground.width ? 120 : 0);   // ზომის შეცვლისას — როცა ხელს აუშვებს
  };

  // წარწერები — ენის მიხედვით; ეკრანზე 15px (ტელეფონზე, პატარა რუკაზე — 11px-მდე, რომ ერთმანეთს არ ფარავდეს)
  const labels = () => {
    if (!drawn || !k) return;
    const px = Math.max(11, Math.min(15, 15 * k / .9)), size = px / 15 / k;
    for (const p of layout.spots) {
      if (p.decor) continue;
      const g = map.querySelector(`[data-spot="${p.id}"]`), name = t(`game.spots.${layout.labels?.[p.id] || p.id}`);   // ტელეფონზე ციხე — „პროფილი“
      g.setAttribute('aria-label', p.ready ? name : `${name} — ${t('game.soon')}`);
      const label = g.querySelector('.spot__label');
      if (NO_LABEL.has(p.id)) { label.innerHTML = ''; continue; }
      label.innerHTML = `<g transform="scale(${size.toFixed(4)})"><rect class="spot__pill" rx="14" height="28" y="-14"/><text class="spot__name" y="5">${name}</text>` +
        (p.ready ? '' : `<text class="spot__soon" y="29">🔒 ${t('game.soon')}</text>`) + '</g>';
      const width = Math.ceil(label.querySelector('.spot__name').getComputedTextLength() + 28);
      label.querySelector('rect').setAttribute('width', width);
      label.querySelector('rect').setAttribute('x', -width / 2);
    }
  };

  const draw = () => {
    if (drawn) return;
    drawn = true;
    fit();
  };

  const say = text => {
    clearTimeout(toastTimer);
    toast.textContent = text;
    toast.classList.add('is-on');
    toastTimer = setTimeout(() => toast.classList.remove('is-on'), 2200);
  };

  const useSpot = id => {
    if (id === 'geography') return set('quizOpen', true);           // დროშების ტესტი — გეოგრაფია
    if (id === 'castle') return say(t(layout.labels?.castle === 'profile' ? 'game.profileSoon' : 'game.castleText'));
    say(`${t(`game.spots.${layout.labels?.[id] || id}`)} — ${t('game.soonText')}`);
  };

  map.addEventListener('click', e => { const spot = e.target.closest('.spot'); if (spot) useSpot(spot.dataset.spot); });
  map.addEventListener('keydown', e => {
    const spot = e.target.closest('.spot');
    if (spot && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); useSpot(spot.dataset.spot); }
  });
  // დღე / ღამე
  const setNight = night => {
    root.classList.toggle('game--night', night);
    mode.setAttribute('aria-pressed', String(night));
    const label = t(night ? 'game.day' : 'game.night');
    mode.setAttribute('aria-label', label); mode.title = label;
  };
  setNight(!!getPref('night'));
  // გადასვლის ანიმაცია: ღილაკის ხატულა ტრიალდება, რუკაზე გადაივლის მზის ჩასვლის (ან ამოსვლის) შუქი, ღამით ჩირაღდნები მერე ინთება
  let swapTimer = null;
  mode.addEventListener('click', () => {
    const night = !root.classList.contains('game--night');
    clearTimeout(swapTimer);
    root.classList.remove('game--dusk', 'game--dawn');
    void root.offsetWidth;                                   // ანიმაცია თავიდან, სწრაფი ორმაგი დაჭერისასაც
    root.classList.add(night ? 'game--dusk' : 'game--dawn');
    mode.classList.remove('is-spin'); void mode.offsetWidth; mode.classList.add('is-spin');
    setNight(night); setPref('night', night);
    swapTimer = setTimeout(() => root.classList.remove('game--dusk', 'game--dawn'), 1600);
  });
  nav.addEventListener('click', e => {
    const tab = e.target.closest('.game__tab')?.dataset.tab;
    if (tab === 'learn') set('quizOpen', true);
    else if (tab === 'battle') say(`${t('game.nav.battle')} — ${t('game.soonText')}`);
    else if (tab === 'profile') say(t('game.profileSoon'));
  });

  on('screen', screen => { if (screen === 'game') draw(); });
  // რუკა წინასწარ, როცა ბრაუზერი თავისუფალია — რომ „დაიწყე“-ზე ხატვამ გადასვლა არ შეაფერხოს
  (window.requestIdleCallback || (fn => setTimeout(fn, 1500)))(draw, { timeout: 3000 });
  on('gold', gold => { root.querySelector('.game__gold-n').textContent = gold; });
  on('lang', () => { labels(); setNight(root.classList.contains('game--night')); });
  // წარწერის სიგანე — ნამდვილი შრიფტით (ახალი ენის შრიფტი შეიძლება მოგვიანებით ჩაიტვირთოს, მაგ. სომხური)
  document.fonts?.ready.then(labels);
  document.fonts?.addEventListener?.('loadingdone', labels);
  addEventListener('resize', () => { if (drawn) fit(); });
}
