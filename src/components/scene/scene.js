/* ფონის სცენა: ხატავს ნახატს ორ ფენად და არგებს ეკრანს.
   უძრავი ფენა — SVG, რომელიც სურათად იტვირთება და ერთხელ იხატება canvas-ზე: შედეგი ჩვეულებრივი ბიტმაპია,
   ანიმაციები მას აღარ ეხება (თავიდან მხოლოდ ეკრანის ზომის შეცვლისას იხატება).
   მოძრავი ფენა — პატარა SVG ზემოდან (დროშები, ალი, ნაპერწკლები, ვარსკვლავები, გვირგვინი), იხ. draw/fx.js.
   კომპიუტერი: მთელი სცენა ჩანს. ტელეფონი (ვიწრო / ვერტიკალური ეკრანი): ხმალი შუაშია, სცენა იწყება
   მთავარი ტექსტის ქვეშ (state 'heroBottom' — hero აქვეყნებს) და დაბალ ეკრანზე პატარავდება, რომ ხმალი, ჯარები და „დაიწყე“ ჩაეტიოს.
   ღილაკის ადგილს აქვეყნებს: set('startButton', { x, y }) — მას start-button კომპონენტი იყენებს. */
import { set, on, get } from '../../core/state.js';
import { W, H, SPLIT, FORK_Y, BOUNDS } from './draw/config.js';
import { THEME } from './draw/palettes.js';
import { drawScene } from './draw/draw-scene.js';

const FOCUS_WIDTH = 740;                // ტელეფონზე ჩანს ნახატის ამ სიგანის ნაწილი
const SWORD_TOP = 330;                  // ხმლის წვერის სიმაღლე ნახატზე
const DESKTOP_START = [1370, 795];      // კომპიუტერზე ღილაკის წერტილი: ორკების ჯარსა და ლავას შორის
const MAX_PIXELS = 10e6;                // canvas-ის ბიტმაპის ზედა ზღვარი (≈40 MB) — დიდ ეკრანზე სიმკვეთრე ოდნავ იკლებს, მეხსიერება არა
const MOBILE = matchMedia('(max-aspect-ratio: 1/1), (max-width: 760px)');

export function init(root) {
  const canvas = root.querySelector('.scene__canvas'), fx = root.querySelector('.scene__fx');
  const ctx = canvas.getContext('2d');
  root.style.background = THEME.sky;
  const box = `${BOUNDS.x} ${BOUNDS.y} ${BOUNDS.w} ${BOUNDS.h}`;
  const { bg, fx: moving } = drawScene('bg');
  fx.setAttribute('viewBox', box);
  fx.innerHTML = moving;
  // უძრავი ნახატი სურათად: ჩატვირთვის შემდეგ ერთხელ იხატება canvas-ზე (და ყოველ ხელახალ მორგებაზე)
  const image = new Image();
  image.src = URL.createObjectURL(new Blob([`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box}" width="${BOUNDS.w}" height="${BOUNDS.h}">${bg}</svg>`], { type: 'image/svg+xml' }));
  let frame = null;                                   // მიმდინარე ჩარჩო: { k, ox, oy, vx, vy, sw, sh } (sw, sh — ეკრანის ზომა, რომლისთვისაც ითვლება)
  const paint = () => {
    if (!frame || !image.complete || !image.naturalWidth) return;
    if (frame.sw !== innerWidth || frame.sh !== innerHeight) return fit();   // ეკრანი შეიცვალა ჩარჩოს გამოთვლის შემდეგ — თავიდან
    const dpr = Math.min(devicePixelRatio || 1, Math.sqrt(MAX_PIXELS / (innerWidth * innerHeight)));
    canvas.width = Math.round(innerWidth * dpr); canvas.height = Math.round(innerHeight * dpr);
    canvas.style.cssText = `left:0;top:0;width:${innerWidth}px;height:${innerHeight}px`;
    ctx.setTransform(frame.k * dpr, 0, 0, frame.k * dpr, (frame.ox - frame.vx * frame.k) * dpr, (frame.oy - frame.vy * frame.k) * dpr);
    ctx.drawImage(image, BOUNDS.x, BOUNDS.y, BOUNDS.w, BOUNDS.h);
  };
  image.onload = paint;

  // ნახატის ჩარჩო (vx, vy, vw, vh) ეკრანზე „slice“ წესით: ფარავს მთელ ეკრანს, შუაშია ჰორიზონტალურად, ქვედა კიდე ეკრანის ძირზეა.
  // ორივე ფენა ერთნაირად დგას; იხატება მხოლოდ მაშინ, როცა ჩარჩო მართლა შეიცვალა (ხელახალი ხატვა ძვირია).
  // აბრუნებს ფუნქციას: ნახატის წერტილი → ეკრანის პიქსელები
  // animateNext — ენის შეცვლისას (ტელეფონზე ტექსტის სიმაღლე იცვლება და სცენა ინაცვლებს): ორივე ფენა ძველი ადგილიდან ახალზე
  // რბილად გადადის (.3 წმ, იგივე, რაც ტექსტი hero-ში) — ახალი ჩარჩო ეკრანზე ძველის სახით იწყება და ადგილზე „ჯდება“
  let placed = '', animateNext = false;
  // ეკრანზე ძველი ჩარჩო ახლის მიმართ: p_ძველი = a·p_ახალი + b. ელემენტის ლოკალურ კოორდინატებში (origin — მისი ზედა-მარცხენა
  // კუთხე L) ეს არის translate(b + (a−1)·L) scale(a); canvas-ისთვის L = 0
  const glide = (from, to) => {
    if (!from || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const a = from.k / to.k, bx = (from.ox - from.vx * from.k) - a * (to.ox - to.vx * to.k), by = (from.oy - from.vy * from.k) - a * (to.oy - to.vy * to.k);
    if (Math.abs(a - 1) < .002 && Math.abs(bx) < .5 && Math.abs(by) < .5) return;
    const fxL = [to.ox - (to.vx - BOUNDS.x) * to.k, to.oy - (to.vy - BOUNDS.y) * to.k];
    for (const [el, L] of [[canvas, [0, 0]], [fx, fxL]])
      el.animate([{ transformOrigin: '0 0', transform: `translate(${bx + (a - 1) * L[0]}px, ${by + (a - 1) * L[1]}px) scale(${a})` },
        { transformOrigin: '0 0', transform: 'none' }], { duration: 300, easing: 'cubic-bezier(.4, 0, .2, 1)' });
  };
  const place = (vx, vy, vw, vh) => {
    const k = Math.max(innerWidth / vw, innerHeight / vh);
    const ox = (innerWidth - vw * k) / 2, oy = innerHeight - vh * k;
    const key = `${vx},${vy},${vw},${vh},${innerWidth},${innerHeight}`;
    if (key !== placed) {
      const prev = frame;
      placed = key; frame = { k, ox, oy, vx, vy, sw: innerWidth, sh: innerHeight };
      if (animateNext && prev && prev.sw === innerWidth && prev.sh === innerHeight) glide(prev, frame);
      animateNext = false;
      fx.style.cssText = `left:${(ox - (vx - BOUNDS.x) * k).toFixed(1)}px;top:${(oy - (vy - BOUNDS.y) * k).toFixed(1)}px;width:${(BOUNDS.w * k).toFixed(1)}px;height:${(BOUNDS.h * k).toFixed(1)}px`;
      paint();
    }
    return (px, py) => [ox + (px - vx) * k, oy + (py - vy) * k];
  };

  const fit = () => {
    if (!MOBILE.matches) {
      const [x, y] = place(0, 0, W, H)(...DESKTOP_START);
      return set('startButton', { x, y: Math.min(innerHeight - 46, y) });
    }
    const textBottom = (get('heroBottom') || 0) + 6;
    const need = FORK_Y + 300 - SWORD_TOP;                                   // ხმლის წვერიდან ღილაკამდე
    // დაბალ ეკრანზე სცენა პატარავდება, მაგრამ არა იმდენად, რომ ნახატის გვერდითი კიდეები გამოჩნდეს (სიგანე ≤ 1300)
    const k = Math.max(innerWidth / 1300, Math.min(innerWidth / FOCUS_WIDTH, (innerHeight - textBottom) / need));
    const w = Math.round(innerWidth / k), h = Math.round(innerHeight / k), top = Math.round(SWORD_TOP - textBottom / k);   // მთელი რიცხვები — წვრილმანი ცვლილება არ ითვლება
    place(Math.round(SPLIT - w / 2), top, w, h);
    // ღილაკი ბილიკზე: ჯარების შეერთებასა და ეკრანის ქვედა კიდეს შორის
    const forkPx = (FORK_Y + 70 - top) * k, onPath = forkPx + (innerHeight - forkPx) * .55;
    // ღილაკი ტექსტის პანელს არ უნდა ფარავდეს (დაბალ ეკრანზე პანელი ქვემოთ ჩადის) და ეკრანიდან არ უნდა გავიდეს
    set('startButton', { x: innerWidth / 2, y: Math.min(innerHeight - 36, Math.max(textBottom + 34, onPath)) });
  };
  let timer = 0;
  const schedule = () => { clearTimeout(timer); timer = setTimeout(fit, animateNext ? 0 : 120); };   // ზომის ცვლილებისას — დაყოვნებით, რომ ყოველ პიქსელზე არ დაიხატოს
  on('langChanging', () => { animateNext = true; setTimeout(() => { animateNext = false; }, 400); });
  addEventListener('resize', schedule);
  if (document.readyState !== 'complete') addEventListener('load', schedule);   // ჩატვირთვის ბოლოს ეკრანის ზომა საბოლოოა
  on('heroBottom', schedule);                                            // ტექსტის სიმაღლე შეიცვალა (ენა, შრიფტი, ზომა)
  if (!MOBILE.matches || get('heroBottom') !== undefined) fit();         // ტელეფონზე ტექსტის სიმაღლეს ველოდებით, რომ სურათი ორჯერ არ დაიხატოს
  setTimeout(() => { if (!placed) fit(); }, 300);                        // დაზღვევა: თუ hero კომპონენტი გვერდზე არ არის
}
