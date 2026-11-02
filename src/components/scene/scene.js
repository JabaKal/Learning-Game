/* ფონის სცენა: ხატავს ნახატს და არგებს ეკრანს.
   კომპიუტერი: მთელი სცენა ჩანს. ტელეფონი (ვიწრო / ვერტიკალური ეკრანი): ხმალი შუაშია, სცენა იწყება
   მთავარი ტექსტის ქვეშ და დაბალ ეკრანზე პატარავდება, რომ ხმალი, ჯარები და „დაიწყე“ ღილაკი ჩაეტიოს.
   ღილაკის ადგილს აქვეყნებს: set('startButton', { x, y }) — მას start-button კომპონენტი იყენებს. */
import { set, on } from '../../core/state.js';
import { W, H, SPLIT, FORK_Y } from './draw/config.js';
import { THEME } from './draw/palettes.js';
import { drawScene } from './draw/draw-scene.js';

const FOCUS_WIDTH = 740;                // ტელეფონზე ჩანს ნახატის ამ სიგანის ნაწილი
const SWORD_TOP = 330;                  // ხმლის წვერის სიმაღლე ნახატზე
const DESKTOP_START = [1370, 795];      // კომპიუტერზე ღილაკის წერტილი: ორკების ჯარსა და ლავას შორის
const MOBILE = matchMedia('(max-aspect-ratio: 1/1), (max-width: 760px)');

export function init(root) {
  const svg = root.querySelector('.scene__svg');
  root.style.background = THEME.sky;
  svg.innerHTML = drawScene('bg');

  const fit = () => {
    if (!MOBILE.matches) {
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      const pt = new DOMPoint(...DESKTOP_START).matrixTransform(svg.getScreenCTM());
      return set('startButton', { x: pt.x, y: Math.min(innerHeight - 46, pt.y) });
    }
    const text = document.querySelector('.hero__inner');
    const textBottom = (text ? text.getBoundingClientRect().bottom : 0) + 6;
    const need = FORK_Y + 300 - SWORD_TOP;                                   // ხმლის წვერიდან ღილაკამდე
    // დაბალ ეკრანზე სცენა პატარავდება, მაგრამ არა იმდენად, რომ ნახატის გვერდითი კიდეები გამოჩნდეს (სიგანე ≤ 1300)
    const k = Math.max(innerWidth / 1300, Math.min(innerWidth / FOCUS_WIDTH, (innerHeight - textBottom) / need));
    const w = innerWidth / k, h = innerHeight / k, top = SWORD_TOP - textBottom / k;
    svg.setAttribute('viewBox', `${SPLIT - w / 2} ${top} ${w} ${h}`);
    // ღილაკი ბილიკზე: ჯარების შეერთებასა და ეკრანის ქვედა კიდეს შორის
    const forkPx = (FORK_Y + 70 - top) * k;
    set('startButton', { x: innerWidth / 2, y: Math.min(innerHeight - 46, forkPx + (innerHeight - forkPx) * .55) });
  };

  addEventListener('resize', fit);
  document.fonts?.ready.then(fit);                    // შრიფტის ჩატვირთვის შემდეგ ტექსტის სიმაღლე იცვლება
  on('lang', () => requestAnimationFrame(fit));       // სხვა ენაზე ტექსტის სიმაღლე იცვლება
  fit();
}
